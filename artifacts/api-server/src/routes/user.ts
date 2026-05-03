import { Router } from "express";
import { requireAuth, type AuthenticatedRequest } from "../middlewares/auth.js";
import { getMe, getSettings, updateSettings } from "../services/userService.js";

const router = Router();

router.get("/user/me", requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const result = await getMe(req.userId!);
    if (!result.ok) {
      res.status(result.status).json({ success: false, error: result.error });
      return;
    }
    res.json({ success: true, user: result.data });
  } catch (e) {
    req.log.error({ err: e }, "GET /user/me error");
    res.status(500).json({ success: false, error: "An unexpected error occurred" });
  }
});

router.get("/user/settings", requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const result = await getSettings(req.userId!);
    if (!result.ok) {
      res.status(result.status).json({ success: false, error: result.error });
      return;
    }
    res.json({ success: true, settings: result.data });
  } catch (e) {
    req.log.error({ err: e }, "GET /user/settings error");
    res.status(500).json({ success: false, error: "An unexpected error occurred" });
  }
});

router.put("/user/settings", requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const result = await updateSettings(req.userId!, req.body);
    if (!result.ok) {
      res.status(result.status).json({ success: false, error: result.error });
      return;
    }
    res.json({ success: true, settings: result.data });
  } catch (e) {
    req.log.error({ err: e }, "PUT /user/settings error");
    res.status(500).json({ success: false, error: "An unexpected error occurred" });
  }
});

export default router;
