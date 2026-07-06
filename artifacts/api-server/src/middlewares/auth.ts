import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { supabase } from "../lib/supabase.js";

export interface AuthenticatedRequest extends Request {
  userId?: number;
  userEmail?: string;
}

const JWT_SECRET = process.env.JWT_SECRET || "clubhub-dev-secret-change-in-production";
console.log("[auth] middleware loaded, JWT_SECRET prefix:", JWT_SECRET.slice(0, 8));

export function generateToken(userId: number, email: string): string {
  return jwt.sign({ userId, email }, JWT_SECRET, { expiresIn: "7d" });
}

export async function requireAuth(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401).json({ success: false, error: "Unauthorized" });
    return;
  }

  const token = authHeader.slice(7);
  try {
    const payload = jwt.verify(token, JWT_SECRET) as { userId: number; email: string };
    const { data: users, error } = await supabase
      .from("users")
      .select("id")
      .eq("id", payload.userId)
      .limit(1);

    if (error || !users || users.length === 0) {
      res.status(401).json({ success: false, error: "User not found" });
      return;
    }
    req.userId = payload.userId;
    req.userEmail = payload.email;
    next();
  } catch {
    console.log("[auth] token verification failed | JWT_SECRET prefix:", JWT_SECRET.slice(0, 8), "| token prefix:", token.slice(0, 8));
    res.status(401).json({ success: false, error: "Unauthorized" });
  }
}
