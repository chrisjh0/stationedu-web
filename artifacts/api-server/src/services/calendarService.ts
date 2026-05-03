import { db, eventsTable, clubsTable, enrollmentsTable } from "@workspace/db";
import { eq, and, gte, lte, asc } from "drizzle-orm";
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

  const events = await db
    .select({
      id: eventsTable.id,
      club_id: eventsTable.club_id,
      club_name: clubsTable.name,
      title: eventsTable.title,
      event_date: eventsTable.event_date,
      event_time: eventsTable.event_time,
      location: eventsTable.location,
      description: eventsTable.description,
    })
    .from(eventsTable)
    .innerJoin(clubsTable, eq(eventsTable.club_id, clubsTable.id))
    .where(and(gte(eventsTable.event_date, startDate), lte(eventsTable.event_date, endDate)))
    .orderBy(asc(eventsTable.event_date), asc(eventsTable.event_time));

  const enrollments = await db
    .select()
    .from(enrollmentsTable)
    .where(eq(enrollmentsTable.user_id, userId));

  const enrolledClubIds = new Set(enrollments.map((e) => e.club_id));

  return ok(
    events.map((e) => ({
      id: e.id,
      club_id: e.club_id,
      club_name: e.club_name,
      title: e.title,
      event_date: e.event_date,
      event_time: e.event_time,
      location: e.location,
      description: e.description,
      is_enrolled: enrolledClubIds.has(e.club_id),
    }))
  );
}
