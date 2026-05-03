import { Router } from "express";
import { requireAuth, type AuthenticatedRequest } from "../middlewares/auth.js";
import {
  listClubs,
  listLeadingClubs,
  getClub,
  createClub,
  updateClub,
  deleteClub,
} from "../services/clubService.js";

const router = Router();

/** Parse a route param as a positive integer; return null if invalid. */
function parseId(raw: string | undefined): number | null {
  if (!raw) return null;
  const n = parseInt(raw, 10);
  return isNaN(n) || n <= 0 ? null : n;
}

router.get("/clubs", requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const rawLimit = parseInt((req.query.limit as string) || "12", 10);
    const rawOffset = parseInt((req.query.offset as string) || "0", 10);
    const limit = isNaN(rawLimit) || rawLimit <= 0 ? 12 : Math.min(rawLimit, 100);
    const offset = isNaN(rawOffset) || rawOffset < 0 ? 0 : rawOffset;

    const result = await listClubs(req.userId!, req.userEmail!, limit, offset);
    if (!result.ok) {
      res.status(result.status).json({ success: false, error: result.error });
      return;
    }
    const hasMore = result.data.length === limit;
    res.json({ success: true, clubs: result.data, hasMore });
  } catch (e) {
    req.log.error({ err: e }, "GET /clubs error");
    res.status(500).json({ success: false, error: "An unexpected error occurred" });
  }
});

router.get("/clubs/leading", requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const result = await listLeadingClubs(req.userId!, req.userEmail!);
    if (!result.ok) {
      res.status(result.status).json({ success: false, error: result.error });
      return;
    }
    res.json({ success: true, clubs: result.data });
  } catch (e) {
    req.log.error({ err: e }, "GET /clubs/leading error");
    res.status(500).json({ success: false, error: "An unexpected error occurred" });
  }
});

router.get("/clubs/:id", requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const id = parseId(req.params.id as string);
    if (id === null) {
      res.status(400).json({ success: false, error: "Club ID must be a positive integer" });
      return;
    }
    const result = await getClub(id, req.userId!, req.userEmail!);
    if (!result.ok) {
      res.status(result.status).json({ success: false, error: result.error });
      return;
    }
    res.json({ success: true, club: result.data });
  } catch (e) {
    req.log.error({ err: e }, "GET /clubs/:id error");
    res.status(500).json({ success: false, error: "An unexpected error occurred" });
  }
});

router.post("/clubs", requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const result = await createClub(req.body, req.userId!, req.userEmail!);
    if (!result.ok) {
      res.status(result.status).json({ success: false, error: result.error });
      return;
    }
    res.status(201).json({ success: true, club_id: result.data.club_id });
  } catch (e) {
    req.log.error({ err: e }, "POST /clubs error");
    res.status(500).json({ success: false, error: "An unexpected error occurred" });
  }
});

router.put("/clubs/:id", requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const id = parseId(req.params.id as string);
    if (id === null) {
      res.status(400).json({ success: false, error: "Club ID must be a positive integer" });
      return;
    }
    const result = await updateClub(id, req.body, req.userId!, req.userEmail!);
    if (!result.ok) {
      res.status(result.status).json({ success: false, error: result.error });
      return;
    }
    res.json({ success: true });
  } catch (e) {
    req.log.error({ err: e }, "PUT /clubs/:id error");
    res.status(500).json({ success: false, error: "An unexpected error occurred" });
  }
});

router.delete("/clubs/:id", requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const id = parseId(req.params.id as string);
    if (id === null) {
      res.status(400).json({ success: false, error: "Club ID must be a positive integer" });
      return;
    }
    const result = await deleteClub(id, req.userId!, req.userEmail!);
    if (!result.ok) {
      res.status(result.status).json({ success: false, error: result.error });
      return;
    }
    res.json({ success: true });
  } catch (e) {
    req.log.error({ err: e }, "DELETE /clubs/:id error");
    res.status(500).json({ success: false, error: "An unexpected error occurred" });
  }
});

export default router;
