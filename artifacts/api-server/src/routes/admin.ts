import { Router } from "express";
import { requireAdmin } from "../middlewares/requireAdmin.js";
import { getAdminStats } from "../services/adminService.js";
import { getPendingClubs, approveClub, rejectClub } from "../services/clubService.js";
import { supabase } from "../lib/supabase.js";
import type { AuthenticatedRequest } from "../middlewares/auth.js";

const router = Router();

function parseId(raw: string | undefined): number | null {
  if (!raw) return null;
  const n = parseInt(raw, 10);
  return isNaN(n) || n <= 0 ? null : n;
}

router.get("/admin/stats", requireAdmin, async (req: AuthenticatedRequest, res) => {
  try {
    const stats = await getAdminStats(req.log);
    res.json({ success: true, data: stats });
  } catch (e) {
    req.log.error({ err: e }, "GET /admin/stats error");
    res.status(500).json({ success: false, error: "Failed to load admin statistics" });
  }
});

router.get("/admin/clubs/pending", requireAdmin, async (req: AuthenticatedRequest, res) => {
  try {
    const result = await getPendingClubs();
    if (!result.ok) {
      res.status(result.status).json({ success: false, error: result.error });
      return;
    }
    res.json({ success: true, clubs: result.data });
  } catch (e) {
    req.log.error({ err: e }, "GET /admin/clubs/pending error");
    res.status(500).json({ success: false, error: "An unexpected error occurred" });
  }
});

router.post("/admin/clubs/:id/approve", requireAdmin, async (req: AuthenticatedRequest, res) => {
  try {
    const id = parseId(req.params.id as string);
    if (!id) { res.status(400).json({ success: false, error: "Invalid club ID" }); return; }
    const result = await approveClub(id);
    if (!result.ok) { res.status(result.status).json({ success: false, error: result.error }); return; }
    res.json({ success: true });
  } catch (e) {
    req.log.error({ err: e }, "POST /admin/clubs/:id/approve error");
    res.status(500).json({ success: false, error: "An unexpected error occurred" });
  }
});

router.post("/admin/clubs/:id/reject", requireAdmin, async (req: AuthenticatedRequest, res) => {
  try {
    const id = parseId(req.params.id as string);
    if (!id) { res.status(400).json({ success: false, error: "Invalid club ID" }); return; }
    const note = typeof req.body?.note === "string" ? req.body.note : "";
    const result = await rejectClub(id, note);
    if (!result.ok) { res.status(result.status).json({ success: false, error: result.error }); return; }
    res.json({ success: true });
  } catch (e) {
    req.log.error({ err: e }, "POST /admin/clubs/:id/reject error");
    res.status(500).json({ success: false, error: "An unexpected error occurred" });
  }
});

router.get("/admin/users", requireAdmin, async (req: AuthenticatedRequest, res) => {
  try {
    const { data: users, error } = await supabase
      .from("users")
      .select("id, full_name, email, is_admin, graduation_year, profile_photo")
      .order("full_name", { ascending: true });

    if (error) throw error;
    res.json({ success: true, users: users ?? [] });
  } catch (e) {
    req.log.error({ err: e }, "GET /admin/users error");
    res.status(500).json({ success: false, error: "An unexpected error occurred" });
  }
});

router.post("/admin/users/:id/toggle-admin", requireAdmin, async (req: AuthenticatedRequest, res) => {
  try {
    const id = parseId(req.params.id as string);
    if (!id) { res.status(400).json({ success: false, error: "Invalid user ID" }); return; }

    if (id === req.userId) {
      res.status(400).json({ success: false, error: "Cannot change your own admin status" });
      return;
    }

    const { data: users } = await supabase.from("users").select("is_admin").eq("id", id).limit(1);
    if (!users?.[0]) { res.status(404).json({ success: false, error: "User not found" }); return; }

    const current = (users[0] as { is_admin: boolean }).is_admin;
    await supabase.from("users").update({ is_admin: !current }).eq("id", id);

    res.json({ success: true, is_admin: !current });
  } catch (e) {
    req.log.error({ err: e }, "POST /admin/users/:id/toggle-admin error");
    res.status(500).json({ success: false, error: "An unexpected error occurred" });
  }
});

export default router;
