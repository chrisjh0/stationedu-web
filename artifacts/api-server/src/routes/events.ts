import { Router } from "express";
import { db, eventsTable, clubsTable, clubLeadersTable } from "@workspace/db";
import { eq, and, gte, asc, sql } from "drizzle-orm";
import { requireAuth, type AuthenticatedRequest } from "../middlewares/auth";

const router = Router();

function htmlEscape(str: string): string {
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#x27;");
}

async function checkLeader(clubId: number, userId: number, userEmail: string): Promise<boolean> {
  const leaders = await db.select().from(clubLeadersTable).where(eq(clubLeadersTable.club_id, clubId));
  const found = leaders.some((l) => l.user_id === userId || l.email === userEmail);
  if (found) {
    const byEmail = leaders.find((l) => l.email === userEmail && !l.user_id);
    if (byEmail) await db.update(clubLeadersTable).set({ user_id: userId }).where(eq(clubLeadersTable.id, byEmail.id));
  }
  return found;
}

router.get("/clubs/:id/events", requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const clubId = parseInt(req.params.id as string);
    if (isNaN(clubId)) { res.status(404).json({ success: false, error: "Not found" }); return; }

    const clubArr = await db.select().from(clubsTable).where(eq(clubsTable.id, clubId)).limit(1);
    if (!clubArr[0]) { res.status(404).json({ success: false, error: "Not found" }); return; }

    const today = new Date().toISOString().split("T")[0];
    const events = await db.select().from(eventsTable).where(
      and(eq(eventsTable.club_id, clubId), gte(eventsTable.event_date, today))
    ).orderBy(asc(eventsTable.event_date), asc(eventsTable.event_time));

    res.json({
      success: true,
      events: events.map((e) => ({
        id: e.id, title: e.title, event_date: e.event_date, event_time: e.event_time, location: e.location, description: e.description,
      })),
    });
  } catch (err) {
    req.log.error({ err }, "GET /clubs/:id/events error");
    res.status(500).json({ success: false, error: "An unexpected error occurred" });
  }
});

router.post("/clubs/:id/events", requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const clubId = parseInt(req.params.id as string);
    if (isNaN(clubId)) { res.status(404).json({ success: false, error: "Not found" }); return; }

    const clubArr = await db.select().from(clubsTable).where(eq(clubsTable.id, clubId)).limit(1);
    if (!clubArr[0]) { res.status(404).json({ success: false, error: "Not found" }); return; }

    const isLdr = await checkLeader(clubId, req.userId!, req.userEmail!);
    if (!isLdr) { res.status(403).json({ success: false, error: "You must be a leader of this club" }); return; }

    const { title, event_date, event_time, location, description } = req.body;
    if (!title || !event_date || !event_time || !location) {
      res.status(400).json({ success: false, error: "title, event_date, event_time, and location are required" });
      return;
    }

    const today = new Date().toISOString().split("T")[0];
    if (event_date < today) {
      res.status(400).json({ success: false, error: "Event date must be today or in the future" });
      return;
    }

    const [event] = await db.insert(eventsTable).values({
      club_id: clubId,
      title: htmlEscape(title),
      event_date,
      event_time,
      location: htmlEscape(location),
      description: htmlEscape(description || ""),
    }).returning();

    res.status(201).json({ success: true, event_id: event.id });
  } catch (err) {
    req.log.error({ err }, "POST /clubs/:id/events error");
    res.status(500).json({ success: false, error: "An unexpected error occurred" });
  }
});

router.delete("/events/:id", requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const eventId = parseInt(req.params.id as string);
    if (isNaN(eventId)) { res.status(404).json({ success: false, error: "Not found" }); return; }

    const eventArr = await db.select().from(eventsTable).where(eq(eventsTable.id, eventId)).limit(1);
    if (!eventArr[0]) { res.status(404).json({ success: false, error: "Not found" }); return; }

    const isLdr = await checkLeader(eventArr[0].club_id, req.userId!, req.userEmail!);
    if (!isLdr) { res.status(403).json({ success: false, error: "You must be a leader of this club" }); return; }

    await db.delete(eventsTable).where(eq(eventsTable.id, eventId));
    res.json({ success: true });
  } catch (err) {
    req.log.error({ err }, "DELETE /events/:id error");
    res.status(500).json({ success: false, error: "An unexpected error occurred" });
  }
});

export default router;
