import { Router } from "express";
import { requireAuth, type AuthenticatedRequest } from "../middlewares/auth.js";
import { supabase } from "../lib/supabase.js";
import { todayUtc } from "../services/utils.js";

const router = Router();

router.get("/notifications", requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const today = todayUtc();
    const sevenDaysFromNow = new Date();
    sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);
    const sevenDaysStr = sevenDaysFromNow.toISOString().split("T")[0];

    const { data: enrollments } = await supabase
      .from("enrollments")
      .select("club_id")
      .eq("user_id", req.userId!);

    if (!enrollments || enrollments.length === 0) {
      res.json({ success: true, unread_count: 0, notifications: [] });
      return;
    }

    const enrolledClubIds = enrollments.map((e: { club_id: number }) => e.club_id);

    const { data: events, error } = await supabase
      .from("events")
      .select("id, title, event_date, event_time, location, club_id, clubs!inner(name)")
      .in("club_id", enrolledClubIds)
      .gte("event_date", today)
      .lte("event_date", sevenDaysStr)
      .order("event_date", { ascending: true })
      .order("event_time", { ascending: true })
      .limit(10);

    if (error) throw error;

    const notifications = (events ?? []).map((e: Record<string, unknown>) => ({
      id: e.id,
      type: "upcoming_event",
      title: e.title,
      club_name: (e.clubs as { name: string }).name,
      event_date: e.event_date,
      event_time: e.event_time,
      location: e.location,
      club_id: e.club_id,
    }));

    res.json({ success: true, unread_count: notifications.length, notifications });
  } catch (e) {
    req.log.error({ err: e }, "GET /notifications error");
    res.status(500).json({ success: false, error: "An unexpected error occurred" });
  }
});

export default router;
