import { Router } from "express";
import { requireAdmin } from "../middlewares/requireAdmin.js";
import { getAdminStats } from "../services/adminService.js";
import type { AuthenticatedRequest } from "../middlewares/auth.js";

const router = Router();

router.get("/admin/stats", requireAdmin, async (req: AuthenticatedRequest, res) => {
  try {
    const stats = await getAdminStats(req.log);
    res.json({ success: true, data: stats });
  } catch (e) {
    req.log.error({ err: e }, "GET /admin/stats error");
    res.status(500).json({ success: false, error: "Failed to load admin statistics" });
  }
});

export default router;
