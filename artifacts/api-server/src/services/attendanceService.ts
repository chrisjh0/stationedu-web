import { supabase } from "../lib/supabase.js";
import { ok, err, type ServiceResult } from "./types.js";
import { resolveLeaderStatus } from "./leaderHelpers.js";

export interface AttendanceRecord {
  user_id: number;
  name: string;
  email: string;
  attended: boolean;
  marked_at: string | null;
}

export interface AttendanceSummary {
  event_id: number;
  event_title: string;
  event_date: string;
  attended_count: number;
  total_enrolled: number;
}

export interface UserHours {
  total_hours: number;
  attended_events: number;
  is_estimate: boolean;
}

export async function getEventAttendance(
  eventId: number,
  requestUserId: number,
  requestUserEmail: string
): Promise<ServiceResult<AttendanceRecord[]>> {
  const { data: events } = await supabase
    .from("events")
    .select("id, club_id")
    .eq("id", eventId)
    .limit(1);

  if (!events?.[0]) return err(404, "Event not found");
  const clubId = (events[0] as { id: number; club_id: number }).club_id;

  const isLdr = await resolveLeaderStatus(clubId, requestUserId, requestUserEmail);
  if (!isLdr) return err(403, "You must be a leader of this club");

  const { data: enrollments } = await supabase
    .from("enrollments")
    .select("user_id")
    .eq("club_id", clubId);

  const enrolledUserIds = (enrollments ?? []).map((e: { user_id: number }) => e.user_id);
  if (enrolledUserIds.length === 0) return ok([]);

  const { data: users } = await supabase
    .from("users")
    .select("id, full_name, email")
    .in("id", enrolledUserIds);

  const { data: attendanceRows } = await supabase
    .from("attendance")
    .select("user_id, attended, marked_at")
    .eq("event_id", eventId);

  const attendanceMap = new Map<number, { attended: boolean; marked_at: string | null }>();
  for (const row of attendanceRows ?? []) {
    const r = row as { user_id: number; attended: boolean; marked_at: string | null };
    attendanceMap.set(r.user_id, { attended: r.attended, marked_at: r.marked_at });
  }

  const result: AttendanceRecord[] = (users ?? []).map(
    (u: { id: number; full_name: string; email: string }) => {
      const att = attendanceMap.get(u.id);
      return {
        user_id: u.id,
        name: u.full_name,
        email: u.email,
        attended: att?.attended ?? false,
        marked_at: att?.marked_at ?? null,
      };
    }
  );

  result.sort((a, b) => a.name.localeCompare(b.name));
  return ok(result);
}

export async function markAttendance(
  eventId: number,
  requestUserId: number,
  requestUserEmail: string,
  records: Array<{ user_id: number; attended: boolean }>
): Promise<ServiceResult<void>> {
  const { data: events } = await supabase
    .from("events")
    .select("id, club_id")
    .eq("id", eventId)
    .limit(1);

  if (!events?.[0]) return err(404, "Event not found");
  const clubId = (events[0] as { id: number; club_id: number }).club_id;

  const isLdr = await resolveLeaderStatus(clubId, requestUserId, requestUserEmail);
  if (!isLdr) return err(403, "You must be a leader of this club");

  if (!Array.isArray(records) || records.length === 0) {
    return err(400, "records array is required");
  }

  const upsertRows = records.map((r) => ({
    event_id: eventId,
    user_id: r.user_id,
    club_id: clubId,
    attended: r.attended,
    marked_at: new Date().toISOString(),
    marked_by_user_id: requestUserId,
  }));

  const { error } = await supabase
    .from("attendance")
    .upsert(upsertRows, { onConflict: "event_id,user_id" });

  if (error) throw error;
  return ok(undefined);
}

export async function getUserHoursLogged(userId: number): Promise<ServiceResult<UserHours>> {
  const { data: attendanceRows } = await supabase
    .from("attendance")
    .select("event_id")
    .eq("user_id", userId)
    .eq("attended", true);

  const attendedEventIds = (attendanceRows ?? []).map((r: { event_id: number }) => r.event_id);
  const attendedCount = attendedEventIds.length;

  if (attendedCount === 0) {
    return ok({ total_hours: 0, attended_events: 0, is_estimate: true });
  }

  const { data: eventRows } = await supabase
    .from("events")
    .select("id, event_time, end_time")
    .in("id", attendedEventIds);

  let totalMinutes = 0;
  let hasEstimate = false;

  for (const event of eventRows ?? []) {
    const e = event as { id: number; event_time: string; end_time: string | null };
    if (e.event_time && e.end_time) {
      const [sh, sm] = e.event_time.split(":").map(Number);
      const [eh, em] = e.end_time.split(":").map(Number);
      const dur = eh * 60 + em - (sh * 60 + sm);
      if (dur > 0) {
        totalMinutes += dur;
        continue;
      }
    }
    totalMinutes += 90;
    hasEstimate = true;
  }

  const totalHours = Math.round((totalMinutes / 60) * 10) / 10;
  return ok({ total_hours: totalHours, attended_events: attendedCount, is_estimate: hasEstimate });
}
