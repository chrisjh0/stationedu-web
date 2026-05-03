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

router.get("/clubs", requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const result = await listClubs(req.userId!, req.userEmail!);
    if (!result.ok) {
      res.status(result.status).json({ success: false, error: result.error });
      return;
    }
    res.json({ success: true, clubs: result.data });
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
    const id = parseInt(req.params.id as string);
    if (isNaN(id)) {
      res.status(404).json({ success: false, error: "Not found" });
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
    const id = parseInt(req.params.id as string);
    if (isNaN(id)) {
      res.status(404).json({ success: false, error: "Not found" });
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
    const id = parseInt(req.params.id as string);
    if (isNaN(id)) {
      res.status(404).json({ success: false, error: "Not found" });
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
