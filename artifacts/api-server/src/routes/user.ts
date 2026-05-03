import { Router } from "express";
import { db, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { requireAuth, type AuthenticatedRequest } from "../middlewares/auth";

const router = Router();

router.get("/user/me", requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const users = await db.select().from(usersTable).where(eq(usersTable.id, req.userId!)).limit(1);
    if (!users[0]) {
      res.status(401).json({ success: false, error: "User not found" });
      return;
    }
    const user = users[0];
    res.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        full_name: user.full_name,
        graduation_year: user.graduation_year,
      },
    });
  } catch (err) {
    req.log.error({ err }, "GET /user/me error");
    res.status(500).json({ success: false, error: "An unexpected error occurred" });
  }
});

router.get("/user/settings", requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const users = await db.select().from(usersTable).where(eq(usersTable.id, req.userId!)).limit(1);
    if (!users[0]) {
      res.status(401).json({ success: false, error: "User not found" });
      return;
    }
    const user = users[0];
    res.json({
      success: true,
      settings: {
        full_name: user.full_name,
        email: user.email,
        notifications_email: user.notifications_email,
        notifications_reminders: user.notifications_reminders,
        notifications_new_clubs: user.notifications_new_clubs,
        notifications_chat: user.notifications_chat,
        notifications_digest: user.notifications_digest,
        notifications_push_mobile: user.notifications_push_mobile,
      },
    });
  } catch (err) {
    req.log.error({ err }, "GET /user/settings error");
    res.status(500).json({ success: false, error: "An unexpected error occurred" });
  }
});

router.put("/user/settings", requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const {
      full_name,
      notifications_email,
      notifications_reminders,
      notifications_new_clubs,
      notifications_chat,
      notifications_digest,
      notifications_push_mobile,
    } = req.body;

    const updates: Partial<typeof usersTable.$inferInsert> = { updated_at: new Date() };
    if (full_name !== undefined) updates.full_name = String(full_name).replace(/[<>"'&]/g, "");
    if (notifications_email !== undefined) updates.notifications_email = Boolean(notifications_email);
    if (notifications_reminders !== undefined) updates.notifications_reminders = Boolean(notifications_reminders);
    if (notifications_new_clubs !== undefined) updates.notifications_new_clubs = Boolean(notifications_new_clubs);
    if (notifications_chat !== undefined) updates.notifications_chat = Boolean(notifications_chat);
    if (notifications_digest !== undefined) updates.notifications_digest = Boolean(notifications_digest);
    if (notifications_push_mobile !== undefined) updates.notifications_push_mobile = Boolean(notifications_push_mobile);

    await db.update(usersTable).set(updates).where(eq(usersTable.id, req.userId!));

    const users = await db.select().from(usersTable).where(eq(usersTable.id, req.userId!)).limit(1);
    const user = users[0];

    res.json({
      success: true,
      settings: {
        full_name: user.full_name,
        email: user.email,
        notifications_email: user.notifications_email,
        notifications_reminders: user.notifications_reminders,
        notifications_new_clubs: user.notifications_new_clubs,
        notifications_chat: user.notifications_chat,
        notifications_digest: user.notifications_digest,
        notifications_push_mobile: user.notifications_push_mobile,
      },
    });
  } catch (err) {
    req.log.error({ err }, "PUT /user/settings error");
    res.status(500).json({ success: false, error: "An unexpected error occurred" });
  }
});

export default router;
