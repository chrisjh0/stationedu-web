import { supabase } from "../lib/supabase.js";
import { ok, err, type ServiceResult } from "./types.js";

export interface CalendarEvent {
  id: number;
  club_id: number;
  club_name: string;
  title: string;
  event_date: string;
  event_time: string;
  location: string;
  description: string;
  is_enrolled: boolean;
}

export async function getCalendarEvents(
  userId: number,
  year?: number,
  month?: number
): Promise<ServiceResult<CalendarEvent[]>> {
  if ((year === undefined) !== (month === undefined)) {
    return err(400, "year and month must be provided together");
  }

  let startDate: string;
  let endDate: string;

  if (year !== undefined && month !== undefined) {
    if (isNaN(year) || isNaN(month) || month < 1 || month > 12) {
      return err(400, "Invalid year or month");
    }
    startDate = `${year}-${String(month).padStart(2, "0")}-01`;
    const lastDay = new Date(year, month, 0).getDate();
    endDate = `${year}-${String(month).padStart(2, "0")}-${String(lastDay).padStart(2, "0")}`;
  } else {
    const now = new Date();
    const y = now.getUTCFullYear();
    const m = now.getUTCMonth() + 1;
    startDate = `${y}-${String(m).padStart(2, "0")}-01`;
    const lastDay = new Date(y, m, 0).getDate();
    endDate = `${y}-${String(m).padStart(2, "0")}-${String(lastDay).padStart(2, "0")}`;
  }

  const { data: events, error: eventsError } = await supabase
    .from("events")
    .select("id, club_id, title, event_date, event_time, location, description, clubs!inner(name)")
    .gte("event_date", startDate)
    .lte("event_date", endDate)
    .order("event_date", { ascending: true })
    .order("event_time", { ascending: true });

  if (eventsError) throw eventsError;

  const { data: enrollments, error: enrollError } = await supabase
    .from("enrollments")
    .select("club_id")
    .eq("user_id", userId);

  if (enrollError) throw enrollError;

  const enrolledClubIds = new Set((enrollments ?? []).map((e: { club_id: number }) => e.club_id));

  return ok(
    (events ?? []).map((e: Record<string, unknown>) => ({
      id: e.id as number,
      club_id: e.club_id as number,
      club_name: (e.clubs as { name: string }).name,
      title: e.title as string,
      event_date: e.event_date as string,
      event_time: e.event_time as string,
      location: e.location as string,
      description: e.description as string,
      is_enrolled: enrolledClubIds.has(e.club_id as number),
    }))
  );
}
