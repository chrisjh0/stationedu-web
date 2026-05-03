import { Router } from "express";
import { db, clubsTable, clubLeadersTable, enrollmentsTable, eventsTable, usersTable } from "@workspace/db";
import { eq, and, gte, asc, sql } from "drizzle-orm";
import { requireAuth, type AuthenticatedRequest } from "../middlewares/auth";
import { CLUB_TYPES } from "@workspace/db";

const router = Router();

function htmlEscape(str: string): string {
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#x27;");
}

async function isLeader(clubId: number, userId: number, userEmail: string): Promise<{ isLeader: boolean; leaderId?: number }> {
  const leaders = await db.select().from(clubLeadersTable).where(eq(clubLeadersTable.club_id, clubId));
  const byUserId = leaders.find((l) => l.user_id === userId);
  if (byUserId) return { isLeader: true, leaderId: byUserId.id };
  const byEmail = leaders.find((l) => l.email === userEmail);
  if (byEmail) {
    await db.update(clubLeadersTable).set({ user_id: userId }).where(eq(clubLeadersTable.id, byEmail.id));
    return { isLeader: true, leaderId: byEmail.id };
  }
  return { isLeader: false };
}

router.get("/clubs", requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const clubs = await db.select().from(clubsTable).orderBy(asc(clubsTable.name));
    const enrollments = await db.select().from(enrollmentsTable).where(eq(enrollmentsTable.user_id, req.userId!));
    const leaders = await db.select().from(clubLeadersTable);

    const enrolledClubIds = new Set(enrollments.map((e) => e.club_id));

    const result = clubs.map((club) => {
      const isEnrolled = enrolledClubIds.has(club.id);
      const clubLeaders = leaders.filter((l) => l.club_id === club.id);
      const isClubLeader = clubLeaders.some((l) => l.user_id === req.userId || l.email === req.userEmail);
      return {
        id: club.id,
        name: club.name,
        description: club.description,
        type: club.type,
        initial: club.initial,
        default_day: club.default_day,
        default_location: club.default_location,
        chat_link: club.chat_link,
        profile_photo: club.profile_photo,
        is_enrolled: isEnrolled,
        is_leader: isClubLeader,
      };
    });

    res.json({ success: true, clubs: result });
  } catch (err) {
    req.log.error({ err }, "GET /clubs error");
    res.status(500).json({ success: false, error: "An unexpected error occurred" });
  }
});

router.get("/clubs/leading", requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const today = new Date().toISOString().split("T")[0];
    const myLeaderRecords = await db.select().from(clubLeadersTable).where(
      sql`(${clubLeadersTable.user_id} = ${req.userId} OR ${clubLeadersTable.email} = ${req.userEmail})`
    );

    for (const record of myLeaderRecords) {
      if (!record.user_id) {
        await db.update(clubLeadersTable).set({ user_id: req.userId }).where(eq(clubLeadersTable.id, record.id));
      }
    }

    const clubIds = [...new Set(myLeaderRecords.map((l) => l.club_id))];
    if (clubIds.length === 0) {
      res.json({ success: true, clubs: [] });
      return;
    }

    const result = [];
    for (const clubId of clubIds) {
      const clubArr = await db.select().from(clubsTable).where(eq(clubsTable.id, clubId)).limit(1);
      if (!clubArr[0]) continue;
      const club = clubArr[0];

      const myRecord = myLeaderRecords.find((l) => l.club_id === clubId);
      const memberCount = await db.select({ count: sql<number>`count(*)` }).from(enrollmentsTable).where(eq(enrollmentsTable.club_id, clubId));
      const upcomingEventsCount = await db.select({ count: sql<number>`count(*)` }).from(eventsTable).where(
        and(eq(eventsTable.club_id, clubId), gte(eventsTable.event_date, today))
      );

      result.push({
        id: club.id,
        name: club.name,
        description: club.description,
        type: club.type,
        initial: club.initial,
        default_day: club.default_day,
        default_location: club.default_location,
        chat_link: club.chat_link,
        profile_photo: club.profile_photo,
        user_role: myRecord?.role || "Leader",
        member_count: Number(memberCount[0]?.count ?? 0),
        upcoming_events_count: Number(upcomingEventsCount[0]?.count ?? 0),
      });
    }

    res.json({ success: true, clubs: result });
  } catch (err) {
    req.log.error({ err }, "GET /clubs/leading error");
    res.status(500).json({ success: false, error: "An unexpected error occurred" });
  }
});

router.get("/clubs/:id", requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const id = parseInt(req.params.id as string);
    if (isNaN(id)) { res.status(404).json({ success: false, error: "Not found" }); return; }

    const clubArr = await db.select().from(clubsTable).where(eq(clubsTable.id, id)).limit(1);
    if (!clubArr[0]) { res.status(404).json({ success: false, error: "Not found" }); return; }
    const club = clubArr[0];

    const today = new Date().toISOString().split("T")[0];
    const [leaders, enrollment, upcomingEvents] = await Promise.all([
      db.select().from(clubLeadersTable).where(eq(clubLeadersTable.club_id, id)),
      db.select().from(enrollmentsTable).where(and(eq(enrollmentsTable.club_id, id), eq(enrollmentsTable.user_id, req.userId!))).limit(1),
      db.select().from(eventsTable).where(and(eq(eventsTable.club_id, id), gte(eventsTable.event_date, today))).orderBy(asc(eventsTable.event_date), asc(eventsTable.event_time)),
    ]);

    const isEnrolled = enrollment.length > 0;
    const isClubLeader = leaders.some((l) => l.user_id === req.userId || l.email === req.userEmail);

    for (const leader of leaders) {
      if (!leader.user_id && leader.email === req.userEmail) {
        await db.update(clubLeadersTable).set({ user_id: req.userId }).where(eq(clubLeadersTable.id, leader.id));
      }
    }

    res.json({
      success: true,
      club: {
        id: club.id,
        name: club.name,
        description: club.description,
        type: club.type,
        initial: club.initial,
        default_day: club.default_day,
        default_location: club.default_location,
        chat_link: club.chat_link,
        profile_photo: club.profile_photo,
        is_enrolled: isEnrolled,
        is_leader: isClubLeader,
        leaders: leaders.map((l) => ({ name: l.name, role: l.role, email: l.email })),
        upcoming_events: upcomingEvents.map((e) => ({
          id: e.id, title: e.title, event_date: e.event_date, event_time: e.event_time, location: e.location, description: e.description,
        })),
      },
    });
  } catch (err) {
    req.log.error({ err }, "GET /clubs/:id error");
    res.status(500).json({ success: false, error: "An unexpected error occurred" });
  }
});

router.post("/clubs", requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const { name, description, type, default_day, default_location, chat_link, profile_photo, leaders } = req.body;

    if (!name || !name.trim()) { res.status(400).json({ success: false, error: "Club name is required" }); return; }
    if (!CLUB_TYPES.includes(type)) { res.status(400).json({ success: false, error: "Invalid club type" }); return; }
    if (!Array.isArray(leaders) || leaders.length === 0) { res.status(400).json({ success: false, error: "At least one leader is required" }); return; }

    const users = await db.select().from(usersTable).where(eq(usersTable.id, req.userId!)).limit(1);
    const currentUser = users[0];
    const userInLeaders = leaders.some((l: { email: string }) => l.email === currentUser?.email);
    if (!userInLeaders) { res.status(400).json({ success: false, error: "You must include yourself in the leaders list" }); return; }

    const existing = await db.select().from(clubsTable).where(eq(clubsTable.name, name.trim())).limit(1);
    if (existing.length > 0) { res.status(409).json({ success: false, error: "A club with that name already exists" }); return; }

    const initial = htmlEscape(name.trim().charAt(0).toUpperCase());
    const [club] = await db.insert(clubsTable).values({
      name: htmlEscape(name.trim()),
      description: htmlEscape(description || ""),
      type,
      initial,
      default_day: htmlEscape(default_day || ""),
      default_location: htmlEscape(default_location || ""),
      chat_link: htmlEscape(chat_link || ""),
      profile_photo: profile_photo || "",
      creator_user_id: req.userId,
    }).returning();

    for (const leader of leaders) {
      const isCurrentUser = leader.email === currentUser?.email;
      await db.insert(clubLeadersTable).values({
        club_id: club.id,
        user_id: isCurrentUser ? req.userId : null,
        name: htmlEscape(leader.name),
        role: htmlEscape(leader.role),
        email: leader.email,
      });
    }

    await db.insert(enrollmentsTable).values({ user_id: req.userId!, club_id: club.id }).onConflictDoNothing();

    res.status(201).json({ success: true, club_id: club.id });
  } catch (err) {
    req.log.error({ err }, "POST /clubs error");
    res.status(500).json({ success: false, error: "An unexpected error occurred" });
  }
});

router.put("/clubs/:id", requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const id = parseInt(req.params.id as string);
    if (isNaN(id)) { res.status(404).json({ success: false, error: "Not found" }); return; }

    const { isLeader: leader } = await isLeader(id, req.userId!, req.userEmail!);
    if (!leader) { res.status(403).json({ success: false, error: "You must be a leader of this club" }); return; }

    const clubArr = await db.select().from(clubsTable).where(eq(clubsTable.id, id)).limit(1);
    if (!clubArr[0]) { res.status(404).json({ success: false, error: "Not found" }); return; }

    const { name, description, type, default_day, default_location, chat_link, profile_photo, leaders } = req.body;

    if (name && name.trim()) {
      const existing = await db.select().from(clubsTable).where(eq(clubsTable.name, name.trim())).limit(1);
      if (existing.length > 0 && existing[0].id !== id) {
        res.status(409).json({ success: false, error: "A club with that name already exists" });
        return;
      }
    }

    if (type && !CLUB_TYPES.includes(type)) { res.status(400).json({ success: false, error: "Invalid club type" }); return; }

    const oldLeaders = await db.select().from(clubLeadersTable).where(eq(clubLeadersTable.club_id, id));
    const emailToUserId = new Map<string, number | null>();
    for (const l of oldLeaders) { emailToUserId.set(l.email, l.user_id); }

    const initial = name ? htmlEscape(name.trim().charAt(0).toUpperCase()) : undefined;
    await db.update(clubsTable).set({
      ...(name ? { name: htmlEscape(name.trim()), initial } : {}),
      ...(description !== undefined ? { description: htmlEscape(description) } : {}),
      ...(type ? { type } : {}),
      ...(default_day ? { default_day: htmlEscape(default_day) } : {}),
      ...(default_location ? { default_location: htmlEscape(default_location) } : {}),
      ...(chat_link !== undefined ? { chat_link: htmlEscape(chat_link) } : {}),
      ...(profile_photo !== undefined ? { profile_photo } : {}),
      updated_at: new Date(),
    }).where(eq(clubsTable.id, id));

    if (Array.isArray(leaders)) {
      await db.delete(clubLeadersTable).where(eq(clubLeadersTable.club_id, id));
      for (const l of leaders) {
        await db.insert(clubLeadersTable).values({
          club_id: id,
          user_id: emailToUserId.get(l.email) ?? null,
          name: htmlEscape(l.name),
          role: htmlEscape(l.role),
          email: l.email,
        });
      }
    }

    res.json({ success: true });
  } catch (err) {
    req.log.error({ err }, "PUT /clubs/:id error");
    res.status(500).json({ success: false, error: "An unexpected error occurred" });
  }
});

router.delete("/clubs/:id", requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const id = parseInt(req.params.id as string);
    if (isNaN(id)) { res.status(404).json({ success: false, error: "Not found" }); return; }

    const { isLeader: leader } = await isLeader(id, req.userId!, req.userEmail!);
    if (!leader) { res.status(403).json({ success: false, error: "You must be a leader of this club" }); return; }

    const clubArr = await db.select().from(clubsTable).where(eq(clubsTable.id, id)).limit(1);
    if (!clubArr[0]) { res.status(404).json({ success: false, error: "Not found" }); return; }

    await db.delete(clubsTable).where(eq(clubsTable.id, id));

    res.json({ success: true });
  } catch (err) {
    req.log.error({ err }, "DELETE /clubs/:id error");
    res.status(500).json({ success: false, error: "An unexpected error occurred" });
  }
});

export default router;
