import { Router } from "express";
import { requireAuth, type AuthenticatedRequest } from "../middlewares/auth.js";
import { db, enrollmentsTable, eventsTable, clubsTable } from "@workspace/db";
import { eq, and, gte, lte, inArray, asc } from "drizzle-orm";
import { todayUtc } from "../services/utils.js";

const router = Router();

router.get("/notifications", requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const today = todayUtc();
    const sevenDaysFromNow = new Date();
    sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);
    const sevenDaysStr = sevenDaysFromNow.toISOString().split("T")[0];

    const enrollments = await db
      .select({ club_id: enrollmentsTable.club_id })
      .from(enrollmentsTable)
      .where(eq(enrollmentsTable.user_id, req.userId!));

    if (enrollments.length === 0) {
      res.json({ success: true, unread_count: 0, notifications: [] });
      return;
    }

    const enrolledClubIds = enrollments.map(e => e.club_id);

    const events = await db
      .select({
        id: eventsTable.id,
        title: eventsTable.title,
        event_date: eventsTable.event_date,
        event_time: eventsTable.event_time,
        location: eventsTable.location,
        club_id: eventsTable.club_id,
        club_name: clubsTable.name,
      })
      .from(eventsTable)
      .innerJoin(clubsTable, eq(eventsTable.club_id, clubsTable.id))
      .where(
        and(
          inArray(eventsTable.club_id, enrolledClubIds),
          gte(eventsTable.event_date, today),
          lte(eventsTable.event_date, sevenDaysStr)
        )
      )
      .orderBy(asc(eventsTable.event_date), asc(eventsTable.event_time))
      .limit(10);

    const notifications = events.map(e => ({
      id: e.id,
      type: "upcoming_event",
      title: e.title,
      club_name: e.club_name,
      event_date: e.event_date,
      event_time: e.event_time,
      location: e.location,
      club_id: e.club_id,
    }));

    res.json({ success: true, unread_count: notifications.length, notifications });
  } catch (e) {
    req.log.error({ err: e }, "GET /notifications error");
    res.status(500).json({ success: false, error: "An unexpected error occurred" });
  }
});

export default router;
