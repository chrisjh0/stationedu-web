import { Router } from "express";
import { requireAuth, type AuthenticatedRequest } from "../middlewares/auth.js";
import { getCalendarEvents } from "../services/calendarService.js";

const router = Router();

router.get("/calendar/events", requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const { year, month } = req.query as { year?: string; month?: string };
    const parsedYear = year !== undefined ? parseInt(year) : undefined;
    const parsedMonth = month !== undefined ? parseInt(month) : undefined;

    const result = await getCalendarEvents(req.userId!, parsedYear, parsedMonth);
    if (!result.ok) {
      res.status(result.status).json({ success: false, error: result.error });
      return;
    }
    res.json({ success: true, events: result.data });
  } catch (e) {
    req.log.error({ err: e }, "GET /calendar/events error");
    res.status(500).json({ success: false, error: "An unexpected error occurred" });
  }
});

export default router;
