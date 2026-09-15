import { Router } from "express";
import { requireAuth, type AuthenticatedRequest } from "../middlewares/auth.js";
import { getEventAttendance, markAttendance, getUserHoursLogged } from "../services/attendanceService.js";

const router = Router();

router.get("/clubs/:clubId/events/:eventId/attendance", requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const eventId = parseInt(req.params.eventId as string, 10);
    if (isNaN(eventId) || eventId <= 0) {
      res.status(400).json({ success: false, error: "Invalid event ID" });
      return;
    }
    const result = await getEventAttendance(eventId, req.userId!, req.userEmail!);
    if (!result.ok) {
      res.status(result.status).json({ success: false, error: result.error });
      return;
    }
    res.json({ success: true, attendance: result.data });
  } catch (e) {
    req.log.error({ err: e }, "GET attendance error");
    res.status(500).json({ success: false, error: "An unexpected error occurred" });
  }
});

router.post("/clubs/:clubId/events/:eventId/attendance", requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const eventId = parseInt(req.params.eventId as string, 10);
    if (isNaN(eventId) || eventId <= 0) {
      res.status(400).json({ success: false, error: "Invalid event ID" });
      return;
    }
    const records = req.body?.records;
    const result = await markAttendance(eventId, req.userId!, req.userEmail!, records ?? []);
    if (!result.ok) {
      res.status(result.status).json({ success: false, error: result.error });
      return;
    }
    res.json({ success: true });
  } catch (e) {
    req.log.error({ err: e }, "POST attendance error");
    res.status(500).json({ success: false, error: "An unexpected error occurred" });
  }
});

router.get("/user/hours", requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const result = await getUserHoursLogged(req.userId!);
    if (!result.ok) {
      res.status(result.status).json({ success: false, error: result.error });
      return;
    }
    res.json({ success: true, ...result.data });
  } catch (e) {
    req.log.error({ err: e }, "GET /user/hours error");
    res.status(500).json({ success: false, error: "An unexpected error occurred" });
  }
});

export default router;
