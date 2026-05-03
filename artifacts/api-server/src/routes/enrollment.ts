import { Router } from "express";
import { db, enrollmentsTable, clubsTable, clubLeadersTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";
import { requireAuth, type AuthenticatedRequest } from "../middlewares/auth";

const router = Router();

router.post("/clubs/:id/enroll", requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const clubId = parseInt(req.params.id as string);
    if (isNaN(clubId)) { res.status(404).json({ success: false, error: "Not found" }); return; }

    const clubArr = await db.select().from(clubsTable).where(eq(clubsTable.id, clubId)).limit(1);
    if (!clubArr[0]) { res.status(404).json({ success: false, error: "Not found" }); return; }

    const existing = await db.select().from(enrollmentsTable).where(
      and(eq(enrollmentsTable.user_id, req.userId!), eq(enrollmentsTable.club_id, clubId))
    ).limit(1);

    if (existing[0]) {
      res.json({ success: true, enrollment_id: existing[0].id });
      return;
    }

    const [enrollment] = await db.insert(enrollmentsTable).values({
      user_id: req.userId!,
      club_id: clubId,
    }).returning();

    res.json({ success: true, enrollment_id: enrollment.id });
  } catch (err) {
    req.log.error({ err }, "POST /clubs/:id/enroll error");
    res.status(500).json({ success: false, error: "An unexpected error occurred" });
  }
});

router.post("/clubs/:id/unenroll", requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const clubId = parseInt(req.params.id as string);
    if (isNaN(clubId)) { res.status(404).json({ success: false, error: "Not found" }); return; }

    const clubArr = await db.select().from(clubsTable).where(eq(clubsTable.id, clubId)).limit(1);
    if (!clubArr[0]) { res.status(404).json({ success: false, error: "Not found" }); return; }

    const leaders = await db.select().from(clubLeadersTable).where(eq(clubLeadersTable.club_id, clubId));
    const isLdr = leaders.some((l) => l.user_id === req.userId || l.email === req.userEmail);
    if (isLdr) {
      res.status(403).json({ success: false, error: "Leaders cannot unenroll from their own club." });
      return;
    }

    await db.delete(enrollmentsTable).where(
      and(eq(enrollmentsTable.user_id, req.userId!), eq(enrollmentsTable.club_id, clubId))
    );

    res.json({ success: true });
  } catch (err) {
    req.log.error({ err }, "POST /clubs/:id/unenroll error");
    res.status(500).json({ success: false, error: "An unexpected error occurred" });
  }
});

export default router;
