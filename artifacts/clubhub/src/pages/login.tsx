import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "../components/AuthContext";

const SUPPORT_EMAIL = import.meta.env.VITE_SUPPORT_EMAIL || "support@stationforedu.com";
const API_BASE = (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/+$/, "") ?? "";

const ERROR_MESSAGES: Record<string, string> = {
  domain: "Your email domain is not allowed. Please use your school Google account.",
  oauth_not_configured: "Google sign-in is not configured. Contact your administrator.",
  oauth_failed: "Sign-in failed. Please try again.",
};

function StationMark({ size = 36 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="168 161.5 473 473" aria-hidden="true" style={{ flexShrink: 0 }}>
      <path
        fillRule="evenodd"
        d="M193,461 a131,131 0 1,0 262,0 a131,131 0 1,0 -262,0 Z M354,461 a131,131 0 1,0 262,0 a131,131 0 1,0 -262,0 Z"
        fill="#ffffff"
      />
      <circle cx="405" cy="263" r="58.5" fill="#DD5E54" />
    </svg>
  );
}

export default function Login() {
  const [, setLocation] = useLocation();
  const { user, login } = useAuth();
  const [stats, setStats] = useState<{ clubs: number; students: number }>({ clubs: 0, students: 0 });

  const params = new URLSearchParams(window.location.search);
  const token = params.get("token");
  const errorKey = params.get("error");
  const errorMessage = errorKey ? (ERROR_MESSAGES[errorKey] ?? ERROR_MESSAGES.oauth_failed) : null;

  useEffect(() => {
    if (token) login(token);
  }, [token, login]);

  useEffect(() => {
    if (user) setLocation("/calendar");
  }, [user, setLocation]);

  // Fetch public stats for the left panel
  useEffect(() => {
    const base = API_BASE || "";
    fetch(`${base}/api/clubs?limit=1000`)
      .then(r => r.json())
      .then((d: { clubs?: unknown[] }) => {
        if (d.clubs) setStats(prev => ({ ...prev, clubs: d.clubs!.length }));
      })
      .catch(() => {/* fall back to 0 */});
  }, []);

  return (
    <div style={{ display: "flex", width: "100%", minHeight: "100vh" }}>
      {/* Left panel — navy */}
      <div style={{
        width: "40%",
        flexShrink: 0,
        background: "var(--primary)",
        color: "#fff",
        padding: "48px",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        position: "relative",
        overflow: "hidden",
      }}>
        {/* Decorative background icon */}
        <span className="material-symbols-outlined" style={{
          position: "absolute",
          right: -40,
          bottom: -50,
          fontSize: 280,
          color: "rgba(255,255,255,0.07)",
          userSelect: "none",
          pointerEvents: "none",
        }}>workspace_premium</span>

        {/* Logo */}
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: 11,
          fontFamily: "var(--font-display)",
          fontWeight: 700,
          fontSize: 22,
          letterSpacing: "-0.02em",
        }}>
          <StationMark size={36} />
          Station
        </div>

        {/* Tagline */}
        <div style={{ position: "relative", zIndex: 1 }}>
          <h1 style={{
            fontFamily: "var(--font-display)",
            fontWeight: 800,
            fontSize: 38,
            lineHeight: 1.05,
            letterSpacing: "-0.03em",
            color: "#fff",
            margin: 0,
          }}>
            One calendar for all of student life.
          </h1>
          <p style={{
            color: "rgba(255,255,255,0.78)",
            marginTop: 16,
            fontSize: 15,
            maxWidth: "34ch",
            lineHeight: 1.65,
          }}>
            Every club, meeting, and game in one place. RSVP in a tap, join the chat, never miss a thing.
          </p>
        </div>

        {/* Stats row */}
        <div style={{
          fontFamily: "var(--font-mono)",
          fontSize: 11.5,
          letterSpacing: "0.08em",
          color: "rgba(255,255,255,0.5)",
          position: "relative",
          zIndex: 1,
        }}>
          {stats.clubs > 0 ? stats.clubs : "—"} CLUBS · {stats.students > 0 ? stats.students.toLocaleString() : "—"} STUDENTS · EST. 2024
        </div>
      </div>

      {/* Right panel — white */}
      <div style={{
        flex: 1,
        display: "grid",
        placeItems: "center",
        background: "var(--surface)",
        padding: "40px",
      }}>
        <div style={{ width: 360, maxWidth: "100%" }}>
          <span style={{
            fontFamily: "var(--font-mono)",
            fontSize: 11,
            fontWeight: 500,
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            color: "var(--accent)",
          }}>
            Sign in
          </span>

          <h2 style={{
            fontFamily: "var(--font-display)",
            fontWeight: 800,
            fontSize: 26,
            margin: "10px 0 6px",
            color: "var(--heading)",
            letterSpacing: "-0.02em",
          }}>
            Welcome back
          </h2>

          <p style={{
            color: "var(--text-2)",
            marginBottom: 26,
            fontSize: 14,
            lineHeight: 1.6,
          }}>
            Use your school Google account to continue.
          </p>

          {errorMessage && (
            <div style={{
              marginBottom: 20,
              display: "flex",
              alignItems: "flex-start",
              gap: 10,
              background: "#FEF2F2",
              border: "1px solid #FECACA",
              borderRadius: "var(--r-md)",
              padding: "12px 14px",
            }}>
              <span className="material-symbols-outlined" style={{ color: "#EF4444", fontSize: 18, flexShrink: 0, marginTop: 1 }}>error</span>
              <p style={{ fontSize: 13, color: "#B91C1C", lineHeight: 1.5 }}>{errorMessage}</p>
            </div>
          )}

          <button
            onClick={() => { window.location.href = `${API_BASE}/api/auth/google/login`; }}
            style={{
              width: "100%",
              height: 48,
              background: "var(--accent)",
              color: "#fff",
              border: "none",
              borderRadius: "var(--r-md)",
              fontFamily: "var(--font-body)",
              fontWeight: 600,
              fontSize: 15,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              boxShadow: "var(--sh-sm)",
              transition: "background 0.16s",
            }}
            onMouseEnter={e => (e.currentTarget.style.background = "var(--accent-hover)")}
            onMouseLeave={e => (e.currentTarget.style.background = "var(--accent)")}
          >
            <span className="material-symbols-outlined" style={{ fontSize: 20 }}>login</span>
            Sign in with Google
          </button>

          <p style={{
            marginTop: 22,
            fontSize: 13,
            color: "var(--text-3)",
            lineHeight: 1.65,
          }}>
            Restricted to <strong style={{ color: "var(--text)" }}>@athenian.org</strong> accounts.
            <br />
            Trouble? Contact{" "}
            <a href={`mailto:${SUPPORT_EMAIL}`} style={{ color: "var(--accent)", textDecoration: "none" }}>
              {SUPPORT_EMAIL}
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
