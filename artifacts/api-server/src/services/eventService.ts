import { supabase } from "../lib/supabase.js";
import { ok, err, type ServiceResult } from "./types.js";
import { htmlEscape, todayUtc } from "./utils.js";
import { resolveLeaderStatus } from "./leaderHelpers.js";

export interface EventShape {
  id: number;
  title: string;
  event_date: string;
  event_time: string;
  end_time: string | null;
  location: string;
  description: string;
}

export interface CreateEventInput {
  title: string;
  event_date: string;
  event_time: string;
  end_time?: string;
  location: string;
  description?: string;
}

export async function getClubEvents(clubId: number): Promise<ServiceResult<EventShape[]>> {
  const { data: clubs } = await supabase
    .from("clubs")
    .select("id")
    .eq("id", clubId)
    .limit(1);

  if (!clubs?.[0]) return err(404, "Not found");

  const today = todayUtc();
  const { data: events, error } = await supabase
    .from("events")
    .select("id, title, event_date, event_time, end_time, location, description")
    .eq("club_id", clubId)
    .gte("event_date", today)
    .order("event_date", { ascending: true })
    .order("event_time", { ascending: true });

  if (error) throw error;

  return ok(
    (events ?? []).map((e: EventShape) => ({
      id: e.id,
      title: e.title,
      event_date: e.event_date,
      event_time: e.event_time,
      end_time: e.end_time ?? null,
      location: e.location,
      description: e.description,
    }))
  );
}

export async function createEvent(
  clubId: number,
  input: CreateEventInput,
  userId: number,
  userEmail: string
): Promise<ServiceResult<{ event_id: number }>> {
  const { data: clubs } = await supabase
    .from("clubs")
    .select("id")
    .eq("id", clubId)
    .limit(1);

  if (!clubs?.[0]) return err(404, "Not found");

  const isLdr = await resolveLeaderStatus(clubId, userId, userEmail);
  if (!isLdr) return err(403, "You must be a leader of this club");

  const { title, event_date, event_time, location, description } = input;

  if (!title || !event_date || !event_time || !location) {
    return err(400, "title, event_date, event_time, and location are required");
  }

  const today = todayUtc();
  if (event_date < today) return err(400, "Event date must be today or in the future");

  const { end_time } = input;
  const { data: event, error } = await supabase
    .from("events")
    .insert({
      club_id: clubId,
      title: htmlEscape(title),
      event_date,
      event_time,
      end_time: end_time ?? null,
      location: htmlEscape(location),
      description: htmlEscape(description ?? ""),
    })
    .select("id")
    .single();

  if (error || !event) throw error;
  return ok({ event_id: (event as { id: number }).id });
}

export async function getPastClubEvents(clubId: number): Promise<ServiceResult<EventShape[]>> {
  const { data: clubs } = await supabase
    .from("clubs")
    .select("id")
    .eq("id", clubId)
    .limit(1);

  if (!clubs?.[0]) return err(404, "Not found");

  const today = todayUtc();
  const { data: events, error } = await supabase
    .from("events")
    .select("id, title, event_date, event_time, end_time, location, description")
    .eq("club_id", clubId)
    .lt("event_date", today)
    .order("event_date", { ascending: false })
    .order("event_time", { ascending: false })
    .limit(20);

  if (error) throw error;

  return ok(
    (events ?? []).map((e: EventShape) => ({
      id: e.id,
      title: e.title,
      event_date: e.event_date,
      event_time: e.event_time,
      end_time: e.end_time ?? null,
      location: e.location,
      description: e.description,
    }))
  );
}

export async function deleteEvent(
  eventId: number,
  userId: number,
  userEmail: string
): Promise<ServiceResult<void>> {
  const { data: events } = await supabase
    .from("events")
    .select("id, club_id")
    .eq("id", eventId)
    .limit(1);

  if (!events?.[0]) return err(404, "Not found");

  const isLdr = await resolveLeaderStatus((events[0] as { id: number; club_id: number }).club_id, userId, userEmail);
  if (!isLdr) return err(403, "You must be a leader of this club");

  await supabase.from("events").delete().eq("id", eventId);
  return ok(undefined);
}
