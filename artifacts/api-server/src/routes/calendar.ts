import { Router } from "express";
import { db, eventsTable, clubsTable, enrollmentsTable } from "@workspace/db";
import { eq, and, gte, lte, asc } from "drizzle-orm";
import { requireAuth, type AuthenticatedRequest } from "../middlewares/auth";

const router = Router();

router.get("/calendar/events", requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const { year, month } = req.query as { year?: string; month?: string };

    if ((year && !month) || (!year && month)) {
      res.status(400).json({ success: false, error: "year and month must be provided together" });
      return;
    }

    let startDate: string;
    let endDate: string;

    if (year && month) {
      const y = parseInt(year);
      const m = parseInt(month);
      if (isNaN(y) || isNaN(m) || m < 1 || m > 12) {
        res.status(400).json({ success: false, error: "Invalid year or month" });
        return;
      }
      startDate = `${y}-${String(m).padStart(2, "0")}-01`;
      const lastDay = new Date(y, m, 0).getDate();
      endDate = `${y}-${String(m).padStart(2, "0")}-${lastDay}`;
    } else {
      const now = new Date();
      const y = now.getUTCFullYear();
      const m = now.getUTCMonth() + 1;
      startDate = `${y}-${String(m).padStart(2, "0")}-01`;
      const lastDay = new Date(y, m, 0).getDate();
      endDate = `${y}-${String(m).padStart(2, "0")}-${lastDay}`;
    }

    const events = await db.select({
      id: eventsTable.id,
      club_id: eventsTable.club_id,
      club_name: clubsTable.name,
      title: eventsTable.title,
      event_date: eventsTable.event_date,
      event_time: eventsTable.event_time,
      location: eventsTable.location,
      description: eventsTable.description,
    }).from(eventsTable)
      .innerJoin(clubsTable, eq(eventsTable.club_id, clubsTable.id))
      .where(and(gte(eventsTable.event_date, startDate), lte(eventsTable.event_date, endDate)))
      .orderBy(asc(eventsTable.event_date), asc(eventsTable.event_time));

    const enrollments = await db.select().from(enrollmentsTable).where(eq(enrollmentsTable.user_id, req.userId!));
    const enrolledClubIds = new Set(enrollments.map((e) => e.club_id));

    res.json({
      success: true,
      events: events.map((e) => ({
        id: e.id,
        club_id: e.club_id,
        club_name: e.club_name,
        title: e.title,
        event_date: e.event_date,
        event_time: e.event_time,
        location: e.location,
        description: e.description,
        is_enrolled: enrolledClubIds.has(e.club_id),
      })),
    });
  } catch (err) {
    req.log.error({ err }, "GET /calendar/events error");
    res.status(500).json({ success: false, error: "An unexpected error occurred" });
  }
});

export default router;
