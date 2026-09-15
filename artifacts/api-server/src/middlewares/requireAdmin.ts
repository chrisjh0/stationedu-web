import { Response, NextFunction } from "express";
import { requireAuth, type AuthenticatedRequest } from "./auth.js";
import { supabase } from "../lib/supabase.js";

export async function requireAdmin(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  await requireAuth(req, res, async () => {
    try {
      const { data: users, error } = await supabase
        .from("users")
        .select("is_admin")
        .eq("id", req.userId!)
        .limit(1);

      if (error) {
        req.log.error({ err: error }, "requireAdmin: Supabase query failed");
        res.status(500).json({ success: false, error: "Internal server error" });
        return;
      }

      if (!users || users.length === 0) {
        res.status(403).json({ success: false, error: "Forbidden: admin access required" });
        return;
      }

      const user = users[0] as { is_admin: boolean | null };
      if (user.is_admin !== true) {
        res.status(403).json({ success: false, error: "Forbidden: admin access required" });
        return;
      }

      next();
    } catch (e) {
      req.log.error({ err: e }, "requireAdmin: unexpected error");
      res.status(500).json({ success: false, error: "Internal server error" });
    }
  });
}
