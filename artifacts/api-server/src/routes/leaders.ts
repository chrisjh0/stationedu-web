import { Router } from "express";
import { requireAuth, type AuthenticatedRequest } from "../middlewares/auth.js";
import { addLeader, removeLeader } from "../services/leaderService.js";

const router = Router();

router.post("/clubs/:id/leaders", requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const clubId = parseInt(req.params.id as string);
    if (isNaN(clubId)) {
      res.status(404).json({ success: false, error: "Not found" });
      return;
    }
    const result = await addLeader(clubId, req.body, req.userId!, req.userEmail!);
    if (!result.ok) {
      res.status(result.status).json({ success: false, error: result.error });
      return;
    }
    res.status(201).json({ success: true, leader_id: result.data.leader_id });
  } catch (err) {
    req.log.error({ err }, "POST /clubs/:id/leaders error");
    res.status(500).json({ success: false, error: "An unexpected error occurred" });
  }
});

router.delete("/clubs/:id/leaders/:userId", requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const clubId = parseInt(req.params.id as string);
    const targetUserId = parseInt(req.params.userId as string);
    if (isNaN(clubId) || isNaN(targetUserId)) {
      res.status(404).json({ success: false, error: "Not found" });
      return;
    }
    const result = await removeLeader(clubId, targetUserId, req.userId!, req.userEmail!);
    if (!result.ok) {
      res.status(result.status).json({ success: false, error: result.error });
      return;
    }
    res.json({ success: true });
  } catch (err) {
    req.log.error({ err }, "DELETE /clubs/:id/leaders/:userId error");
    res.status(500).json({ success: false, error: "An unexpected error occurred" });
  }
});

export default router;
