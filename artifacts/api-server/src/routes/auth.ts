import { Router } from "express";
import { generateToken } from "../middlewares/auth";
import { supabase } from "../lib/supabase.js";

const router = Router();

const ALLOWED_EMAIL_DOMAIN = process.env.ALLOWED_EMAIL_DOMAIN || "";
const rawFrontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
const FRONTEND_URL = rawFrontendUrl.startsWith("http") ? rawFrontendUrl : `https://${rawFrontendUrl}`;

function parseGraduationYear(email: string): number | null {
  const prefix = email.split("@")[0];
  const match = prefix.match(/^(\d{2})/);
  if (match) {
    return 2000 + parseInt(match[1], 10);
  }
  return null;
}

function htmlEscape(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;");
}

router.get("/auth/google/login", (req, res) => {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const callbackUrl = process.env.GOOGLE_CALLBACK_URL || `${req.protocol}://${req.get("host")}/api/auth/google/callback`;

  if (!clientId) {
    res.redirect(`${FRONTEND_URL}/login?error=oauth_not_configured`);
    return;
  }

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: callbackUrl,
    response_type: "code",
    scope: "openid email profile",
    access_type: "offline",
  });

  res.redirect(`https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`);
});

router.get("/auth/google/callback", async (req, res) => {
  const { code, error } = req.query as { code?: string; error?: string };

  if (error || !code) {
    res.redirect(`${FRONTEND_URL}/login?error=oauth_failed`);
    return;
  }

  try {
    const clientId = process.env.GOOGLE_CLIENT_ID!;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET!;
    const callbackUrl = process.env.GOOGLE_CALLBACK_URL || `${req.protocol}://${req.get("host")}/api/auth/google/callback`;

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10_000);

    let tokenData: { access_token?: string; error?: string };
    try {
      const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          code,
          client_id: clientId,
          client_secret: clientSecret,
          redirect_uri: callbackUrl,
          grant_type: "authorization_code",
        }),
        signal: controller.signal,
      });
      tokenData = await tokenRes.json() as { access_token?: string; error?: string };
    } finally {
      clearTimeout(timeout);
    }

    if (!tokenData.access_token) {
      res.redirect(`${FRONTEND_URL}/login?error=oauth_failed`);
      return;
    }

    const profileController = new AbortController();
    const profileTimeout = setTimeout(() => profileController.abort(), 10_000);

    let profile: { email?: string; name?: string };
    try {
      const profileRes = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
        headers: { Authorization: `Bearer ${tokenData.access_token}` },
        signal: profileController.signal,
      });
      profile = await profileRes.json() as { email?: string; name?: string };
    } finally {
      clearTimeout(profileTimeout);
    }

    if (!profile.email) {
      res.redirect(`${FRONTEND_URL}/login?error=oauth_failed`);
      return;
    }

    if (ALLOWED_EMAIL_DOMAIN && !profile.email.endsWith(`@${ALLOWED_EMAIL_DOMAIN}`)) {
      res.redirect(`${FRONTEND_URL}/login?error=domain`);
      return;
    }

    const email = htmlEscape(profile.email);
    const fullName = htmlEscape(profile.name || profile.email.split("@")[0]);
    const graduationYear = parseGraduationYear(email);

    const { data: users, error: selectError } = await supabase
      .from("users")
      .select("id, email, full_name")
      .eq("email", email)
      .limit(1);

    if (selectError) throw selectError;

    let user = users?.[0] as { id: number; email: string; full_name: string } | undefined;

    if (!user) {
      const { data: inserted, error: insertError } = await supabase
        .from("users")
        .insert({ email, full_name: fullName, graduation_year: graduationYear })
        .select("id, email, full_name")
        .single();

      if (insertError || !inserted) {
        req.log.error({ err: insertError }, "Failed to create user");
        res.redirect(`${FRONTEND_URL}/login?error=oauth_failed`);
        return;
      }
      user = inserted as { id: number; email: string; full_name: string };
    }

    const token = generateToken(user.id, user.email);
    res.redirect(`${FRONTEND_URL}/login?token=${token}`);
  } catch (err) {
    req.log.error({ err }, "OAuth callback error");
    res.redirect(`${FRONTEND_URL}/login?error=oauth_failed`);
  }
});

router.get("/auth/dev-login", async (req, res) => {
  if (process.env.NODE_ENV === "production") {
    res.status(404).json({ success: false, error: "Not found" });
    return;
  }

  try {
    const email = "dev@clubhub.edu";

    const { data: users, error: selectError } = await supabase
      .from("users")
      .select("id, email, full_name")
      .eq("email", email)
      .limit(1);

    if (selectError) throw selectError;

    let user = users?.[0] as { id: number; email: string; full_name: string } | undefined;

    if (!user) {
      const { data: inserted, error: insertError } = await supabase
        .from("users")
        .insert({ email, full_name: "Dev User", graduation_year: 2027 })
        .select("id, email, full_name")
        .single();

      if (insertError || !inserted) throw insertError;
      user = inserted as { id: number; email: string; full_name: string };
    }

    const token = generateToken(user.id, user.email);
    res.json({ success: true, token, user: { id: user.id, email: user.email, full_name: user.full_name } });
  } catch (err) {
    req.log.error({ err }, "Dev login error");
    res.status(500).json({ success: false, error: "An unexpected error occurred" });
  }
});

export default router;
