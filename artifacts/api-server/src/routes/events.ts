import { Router } from "express";
import { requireAuth, type AuthenticatedRequest } from "../middlewares/auth.js";
import { getClubEvents, createEvent, deleteEvent } from "../services/eventService.js";

const router = Router();

router.get("/clubs/:id/events", requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const clubId = parseInt(req.params.id as string);
    if (isNaN(clubId)) {
      res.status(404).json({ success: false, error: "Not found" });
      return;
    }
    const result = await getClubEvents(clubId);
    if (!result.ok) {
      res.status(result.status).json({ success: false, error: result.error });
      return;
    }
    res.json({ success: true, events: result.data });
  } catch (e) {
    req.log.error({ err: e }, "GET /clubs/:id/events error");
    res.status(500).json({ success: false, error: "An unexpected error occurred" });
  }
});

router.post("/clubs/:id/events", requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const clubId = parseInt(req.params.id as string);
    if (isNaN(clubId)) {
      res.status(404).json({ success: false, error: "Not found" });
      return;
    }
    const result = await createEvent(clubId, req.body, req.userId!, req.userEmail!);
    if (!result.ok) {
      res.status(result.status).json({ success: false, error: result.error });
      return;
    }
    res.status(201).json({ success: true, event_id: result.data.event_id });
  } catch (e) {
    req.log.error({ err: e }, "POST /clubs/:id/events error");
    res.status(500).json({ success: false, error: "An unexpected error occurred" });
  }
});

router.delete("/events/:id", requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const eventId = parseInt(req.params.id as string);
    if (isNaN(eventId)) {
      res.status(404).json({ success: false, error: "Not found" });
      return;
    }
    const result = await deleteEvent(eventId, req.userId!, req.userEmail!);
    if (!result.ok) {
      res.status(result.status).json({ success: false, error: result.error });
      return;
    }
    res.json({ success: true });
  } catch (e) {
    req.log.error({ err: e }, "DELETE /events/:id error");
    res.status(500).json({ success: false, error: "An unexpected error occurred" });
  }
});

export default router;
