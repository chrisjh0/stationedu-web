import { db, eventsTable, clubsTable } from "@workspace/db";
import { eq, and, gte, asc } from "drizzle-orm";
import { ok, err, type ServiceResult } from "./types.js";
import { htmlEscape, todayUtc } from "./utils.js";
import { resolveLeaderStatus } from "./leaderHelpers.js";

export interface EventShape {
  id: number;
  title: string;
  event_date: string;
  event_time: string;
  location: string;
  description: string;
}

export interface CreateEventInput {
  title: string;
  event_date: string;
  event_time: string;
  location: string;
  description?: string;
}

export async function getClubEvents(clubId: number): Promise<ServiceResult<EventShape[]>> {
  const clubArr = await db
    .select()
    .from(clubsTable)
    .where(eq(clubsTable.id, clubId))
    .limit(1);

  if (!clubArr[0]) {
    return err(404, "Not found");
  }

  const today = todayUtc();
  const events = await db
    .select()
    .from(eventsTable)
    .where(and(eq(eventsTable.club_id, clubId), gte(eventsTable.event_date, today)))
    .orderBy(asc(eventsTable.event_date), asc(eventsTable.event_time));

  return ok(
    events.map((e) => ({
      id: e.id,
      title: e.title,
      event_date: e.event_date,
      event_time: e.event_time,
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
  const clubArr = await db
    .select()
    .from(clubsTable)
    .where(eq(clubsTable.id, clubId))
    .limit(1);

  if (!clubArr[0]) {
    return err(404, "Not found");
  }

  const isLdr = await resolveLeaderStatus(clubId, userId, userEmail);
  if (!isLdr) {
    return err(403, "You must be a leader of this club");
  }

  const { title, event_date, event_time, location, description } = input;

  if (!title || !event_date || !event_time || !location) {
    return err(400, "title, event_date, event_time, and location are required");
  }

  const today = todayUtc();
  if (event_date < today) {
    return err(400, "Event date must be today or in the future");
  }

  const [event] = await db
    .insert(eventsTable)
    .values({
      club_id: clubId,
      title: htmlEscape(title),
      event_date,
      event_time,
      location: htmlEscape(location),
      description: htmlEscape(description ?? ""),
    })
    .returning();

  return ok({ event_id: event.id });
}

export async function deleteEvent(
  eventId: number,
  userId: number,
  userEmail: string
): Promise<ServiceResult<void>> {
  const eventArr = await db
    .select()
    .from(eventsTable)
    .where(eq(eventsTable.id, eventId))
    .limit(1);

  if (!eventArr[0]) {
    return err(404, "Not found");
  }

  const isLdr = await resolveLeaderStatus(eventArr[0].club_id, userId, userEmail);
  if (!isLdr) {
    return err(403, "You must be a leader of this club");
  }

  await db.delete(eventsTable).where(eq(eventsTable.id, eventId));

  return ok(undefined);
}
