import { useState, useEffect, useCallback, useRef } from "react";

// Mirror of the backend AdminStats shape — must stay in sync with adminService.ts
interface EngagementTrendItem { month: string; year: number; count: number }
interface EnrollmentRate { enrolled_students: number; total_users: number; percentage: number }
interface CategoryItem { category: string; count: number; percentage: number }
interface GradeItem { grade: string; count: number }
interface MostActiveClub { name: string; event_count: number; member_count: number }
interface LeadershipRatio {
  total_leaders: number;
  total_users: number;
  percentage: number;
  leadership_ratio_note: string;
}
interface AdminStats {
  total_clubs: number;
  students_participating: number;
  past_events: number;
  meeting_hours: number;
  meeting_hours_is_estimate: true;
  engagement_trend: EngagementTrendItem[];
  enrollment_rate: EnrollmentRate;
  category_distribution: CategoryItem[];
  participation_by_grade: GradeItem[];
  grade_data_available: false;
  avg_students_per_club: number;
  most_active_club: MostActiveClub;
  leadership_ratio: LeadershipRatio;
  school_name: string;
  school_year: string;
}

const CAT_COLORS: Record<string, string> = {
  Club: "#DD5E54",
  Committee: "#232E54",
  Union: "#3C8A84",
  Team: "#BB8E33",
};

const STAT_COLORS = ["var(--cat-academic)", "var(--cat-stem)", "var(--cat-arts)", "var(--cat-service)"];

function DonutChart({ pct, enrolled, total }: { pct: number; enrolled: number; total: number }) {
  const size = 156;
  const sw = 16;
  const r = (size - sw) / 2;
  const c = 2 * Math.PI * r;
  const dash = (c * pct) / 100;
  return (
    <div style={{ position: "relative", display: "grid", placeItems: "center", width: size, height: size }}>
      <svg width={size} height={size}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--surface-2)" strokeWidth={sw} />
        <circle
          cx={size / 2} cy={size / 2} r={r} fill="none"
          stroke="var(--accent)" strokeWidth={sw} strokeLinecap="butt"
          strokeDasharray={`${dash} ${c - dash}`}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </svg>
      <div style={{ position: "absolute", textAlign: "center" }}>
        <b style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 32, color: "var(--heading)", display: "block", lineHeight: 1 }}>
          {pct}%
        </b>
        <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--text-3)" }}>
          {enrolled}/{total}
        </span>
      </div>
    </div>
  );
}

interface PendingClub {
  id: number;
  name: string;
  type: string;
  category: string;
  initial: string;
  profile_photo: string;
  submitted_at: string | null;
  creator_name: string | null;
  creator_email: string | null;
}

interface AdminUser {
  id: number;
  full_name: string;
  email: string;
  is_admin: boolean;
  graduation_year: number | null;
  profile_photo: string | null;
}

function PermissionsTab() {
  const [pendingClubs, setPendingClubs] = useState<PendingClub[]>([]);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loadingClubs, setLoadingClubs] = useState(true);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [rejectClubId, setRejectClubId] = useState<number | null>(null);
  const [rejectNote, setRejectNote] = useState("");
  const [actionPending, setActionPending] = useState<number | null>(null);
  const rejectRef = useRef<HTMLTextAreaElement>(null);

  const token = () => localStorage.getItem("clubhub_token");

  const loadPending = useCallback(async () => {
    setLoadingClubs(true);
    try {
      const res = await fetch("/api/admin/clubs/pending", {
        headers: token() ? { Authorization: `Bearer ${token()}` } : {},
      });
      const json = await res.json();
      if (json.success) setPendingClubs(json.clubs);
    } catch { /* silent */ } finally {
      setLoadingClubs(false);
    }
  }, []);

  const loadUsers = useCallback(async () => {
    setLoadingUsers(true);
    try {
      const res = await fetch("/api/admin/users", {
        headers: token() ? { Authorization: `Bearer ${token()}` } : {},
      });
      const json = await res.json();
      if (json.success) setUsers(json.users);
    } catch { /* silent */ } finally {
      setLoadingUsers(false);
    }
  }, []);

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { loadPending(); loadUsers(); }, [loadPending, loadUsers]);

  const handleApprove = async (clubId: number) => {
    setActionPending(clubId);
    try {
      await fetch(`/api/admin/clubs/${clubId}/approve`, {
        method: "POST",
        headers: token() ? { Authorization: `Bearer ${token()}` } : {},
      });
      await loadPending();
    } catch { /* silent */ } finally {
      setActionPending(null);
    }
  };

  const handleReject = async () => {
    if (!rejectClubId) return;
    setActionPending(rejectClubId);
    try {
      await fetch(`/api/admin/clubs/${rejectClubId}/reject`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...(token() ? { Authorization: `Bearer ${token()}` } : {}) },
        body: JSON.stringify({ note: rejectNote }),
      });
      setRejectClubId(null);
      setRejectNote("");
      await loadPending();
    } catch { /* silent */ } finally {
      setActionPending(null);
    }
  };

  const handleToggleAdmin = async (userId: number) => {
    setActionPending(userId);
    try {
      const res = await fetch(`/api/admin/users/${userId}/toggle-admin`, {
        method: "POST",
        headers: token() ? { Authorization: `Bearer ${token()}` } : {},
      });
      const json = await res.json();
      if (json.success) {
        setUsers(prev => prev.map(u => u.id === userId ? { ...u, is_admin: json.is_admin } : u));
      }
    } catch { /* silent */ } finally {
      setActionPending(null);
    }
  };

  const sectionStyle: React.CSSProperties = {
    background: "var(--surface)",
    border: "1px solid var(--border)",
    borderRadius: "var(--r-md)",
    marginBottom: 20,
    overflow: "hidden",
  };

  const sectionHead: React.CSSProperties = {
    padding: "14px 18px",
    borderBottom: "1px solid var(--border)",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    background: "var(--surface-2)",
  };

  return (
    <div>
      {/* Pending Club Approvals */}
      <div style={sectionStyle}>
        <div style={sectionHead}>
          <div>
            <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 15, color: "var(--heading)" }}>
              Club Approvals
            </div>
            <div style={{ fontSize: 12, color: "var(--text-3)", marginTop: 2 }}>
              Review clubs submitted by leaders
            </div>
          </div>
          {!loadingClubs && (
            <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: "var(--r-pill)", background: pendingClubs.length > 0 ? "color-mix(in oklab, #BB8E33 18%, var(--surface-2))" : "var(--surface-2)", color: pendingClubs.length > 0 ? "#BB8E33" : "var(--text-3)", border: "1px solid var(--border)" }}>
              {pendingClubs.length} pending
            </span>
          )}
        </div>
        {loadingClubs ? (
          <div style={{ padding: 24, color: "var(--text-3)", fontSize: 13, textAlign: "center" }}>Loading…</div>
        ) : pendingClubs.length === 0 ? (
          <div style={{ padding: "32px 24px", textAlign: "center", color: "var(--text-3)", fontSize: 13 }}>
            <span className="material-symbols-outlined" style={{ fontSize: 32, display: "block", marginBottom: 8 }}>check_circle</span>
            No pending clubs — all caught up!
          </div>
        ) : (
          pendingClubs.map((club, i) => (
            <div key={club.id} style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 18px", borderBottom: i < pendingClubs.length - 1 ? "1px solid var(--border)" : "none" }}>
              <div style={{ width: 40, height: 40, borderRadius: "var(--r-sm)", background: "var(--primary)", color: "#fff", display: "grid", placeItems: "center", fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 17, flexShrink: 0, overflow: "hidden" }}>
                {club.profile_photo ? <img src={club.profile_photo} alt={club.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : club.initial}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 700, fontSize: 14, color: "var(--heading)" }}>{club.name}</div>
                <div style={{ fontSize: 12, color: "var(--text-3)", marginTop: 2 }}>
                  {club.type} · submitted by {club.creator_name ?? club.creator_email ?? "Unknown"}
                  {club.submitted_at && ` · ${new Date(club.submitted_at).toLocaleDateString()}`}
                </div>
              </div>
              <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
                <button
                  onClick={() => handleApprove(club.id)}
                  disabled={actionPending === club.id}
                  style={{ display: "flex", alignItems: "center", gap: 5, padding: "6px 12px", background: "var(--cat-stem)", border: "none", borderRadius: "var(--r-sm)", color: "#fff", fontFamily: "var(--font-body)", fontWeight: 600, fontSize: 12.5, cursor: "pointer", opacity: actionPending === club.id ? 0.6 : 1 }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: 14 }}>check</span>
                  Approve
                </button>
                <button
                  onClick={() => { setRejectClubId(club.id); setRejectNote(""); setTimeout(() => rejectRef.current?.focus(), 50); }}
                  disabled={actionPending === club.id}
                  style={{ display: "flex", alignItems: "center", gap: 5, padding: "6px 12px", background: "var(--surface)", border: "1px solid color-mix(in oklab, var(--danger) 40%, transparent)", borderRadius: "var(--r-sm)", color: "var(--danger)", fontFamily: "var(--font-body)", fontWeight: 600, fontSize: 12.5, cursor: "pointer" }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: 14 }}>close</span>
                  Reject
                </button>
              </div>
            </div>
          ))
        )}

        {/* Inline reject note input */}
        {rejectClubId && (
          <div style={{ padding: "14px 18px", borderTop: "1px solid var(--border)", background: "var(--surface-2)", display: "flex", gap: 10, alignItems: "flex-start" }}>
            <div style={{ flex: 1 }}>
              <label style={{ display: "block", fontFamily: "var(--font-mono)", fontSize: 10.5, letterSpacing: ".05em", textTransform: "uppercase", color: "var(--text-3)", marginBottom: 6 }}>
                Rejection reason for "{pendingClubs.find(c => c.id === rejectClubId)?.name}"
              </label>
              <textarea
                ref={rejectRef}
                value={rejectNote}
                onChange={e => setRejectNote(e.target.value)}
                placeholder="Explain why this club was rejected (optional)"
                rows={2}
                style={{ width: "100%", padding: "8px 12px", borderRadius: "var(--r-sm)", border: "1px solid var(--border-strong)", background: "var(--surface)", color: "var(--text)", fontFamily: "var(--font-body)", fontSize: 13.5, resize: "none", boxSizing: "border-box", outline: "none" }}
              />
            </div>
            <div style={{ display: "flex", gap: 8, paddingTop: 22 }}>
              <button onClick={() => setRejectClubId(null)} style={{ padding: "7px 14px", borderRadius: "var(--r-sm)", border: "1px solid var(--border-strong)", background: "var(--surface)", color: "var(--text)", fontFamily: "var(--font-body)", fontWeight: 600, fontSize: 13, cursor: "pointer" }}>
                Cancel
              </button>
              <button
                onClick={handleReject}
                disabled={actionPending !== null}
                style={{ padding: "7px 14px", borderRadius: "var(--r-sm)", border: "none", background: "var(--danger)", color: "#fff", fontFamily: "var(--font-body)", fontWeight: 600, fontSize: 13, cursor: "pointer", opacity: actionPending !== null ? 0.6 : 1 }}
              >
                Confirm reject
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Admin Users Management */}
      <div style={sectionStyle}>
        <div style={sectionHead}>
          <div>
            <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 15, color: "var(--heading)" }}>
              Admin Users
            </div>
            <div style={{ fontSize: 12, color: "var(--text-3)", marginTop: 2 }}>
              Grant or revoke admin privileges
            </div>
          </div>
          {!loadingUsers && (
            <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: "var(--r-pill)", background: "var(--surface-2)", color: "var(--text-3)", border: "1px solid var(--border)" }}>
              {users.filter(u => u.is_admin).length} admins
            </span>
          )}
        </div>
        {loadingUsers ? (
          <div style={{ padding: 24, color: "var(--text-3)", fontSize: 13, textAlign: "center" }}>Loading…</div>
        ) : (
          users.map((user, i) => (
            <div key={user.id} style={{ display: "flex", alignItems: "center", gap: 14, padding: "12px 18px", borderBottom: i < users.length - 1 ? "1px solid var(--border)" : "none" }}>
              <div style={{ width: 36, height: 36, borderRadius: 9, background: "var(--primary)", color: "#fff", display: "grid", placeItems: "center", fontWeight: 700, fontSize: 14, flexShrink: 0, overflow: "hidden" }}>
                {user.profile_photo ? <img src={user.profile_photo} alt={user.full_name} style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : user.full_name?.charAt(0).toUpperCase()}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 600, fontSize: 13.5, color: "var(--heading)", display: "flex", alignItems: "center", gap: 8 }}>
                  {user.full_name}
                  {user.is_admin && (
                    <span style={{ fontSize: 10.5, fontWeight: 700, padding: "2px 7px", borderRadius: "var(--r-pill)", background: "var(--primary)", color: "#fff", textTransform: "uppercase", letterSpacing: "0.04em" }}>
                      Admin
                    </span>
                  )}
                </div>
                <div style={{ fontSize: 11.5, color: "var(--text-3)" }}>{user.email}</div>
              </div>
              <button
                onClick={() => handleToggleAdmin(user.id)}
                disabled={actionPending === user.id}
                style={{
                  padding: "5px 12px",
                  borderRadius: "var(--r-sm)",
                  border: user.is_admin ? "1px solid color-mix(in oklab, var(--danger) 40%, transparent)" : "1px solid color-mix(in oklab, var(--cat-stem) 40%, transparent)",
                  background: user.is_admin ? "color-mix(in oklab, var(--danger) 8%, var(--surface))" : "color-mix(in oklab, var(--cat-stem) 10%, var(--surface))",
                  color: user.is_admin ? "var(--danger)" : "var(--cat-stem)",
                  fontFamily: "var(--font-body)",
                  fontWeight: 600,
                  fontSize: 12,
                  cursor: "pointer",
                  flexShrink: 0,
                  opacity: actionPending === user.id ? 0.6 : 1,
                }}
              >
                {user.is_admin ? "Revoke admin" : "Make admin"}
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function StatSkeleton() {
  const box = (w: number | string, h: number, mb = 0) => (
    <div style={{ width: w, height: h, background: "var(--surface-2)", borderRadius: "var(--r-sm)", marginBottom: mb }} />
  );
  return (
    <div style={{ maxWidth: 1000, margin: "0 auto" }}>
      <div style={{ marginBottom: 24 }}>
        {box(180, 32, 8)}
        {box(260, 16)}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14, marginBottom: 14 }}>
        {[0, 1, 2, 3].map((i) => (
          <div key={i} style={{ height: 100, background: "var(--surface-2)", borderRadius: "var(--r-md)" }} />
        ))}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1.6fr 1fr", gap: 14, marginBottom: 14 }}>
        <div style={{ height: 240, background: "var(--surface-2)", borderRadius: "var(--r-md)" }} />
        <div style={{ height: 240, background: "var(--surface-2)", borderRadius: "var(--r-md)" }} />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
        <div style={{ height: 200, background: "var(--surface-2)", borderRadius: "var(--r-md)" }} />
        <div style={{ height: 200, background: "var(--surface-2)", borderRadius: "var(--r-md)" }} />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14 }}>
        {[0, 1, 2].map((i) => (
          <div key={i} style={{ height: 100, background: "var(--surface-2)", borderRadius: "var(--r-md)" }} />
        ))}
      </div>
    </div>
  );
}

export default function AdminPage() {
  useEffect(() => { document.title = "Admin — Station"; }, []);
  const [activeTab, setActiveTab] = useState<"analytics" | "permissions">("analytics");
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    setLoading(true);
    setFetchError(null);
    try {
      const token = localStorage.getItem("clubhub_token");
      const res = await fetch("/api/admin/stats", {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!res.ok) throw new Error("non-ok response");
      const json = await res.json() as { success: boolean; data: AdminStats };
      if (!json.success) throw new Error("success false");
      setStats(json.data);
    } catch {
      setFetchError("Unable to load analytics. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { fetchStats(); }, [fetchStats]);

  const statStyle: React.CSSProperties = {
    background: "var(--surface)",
    border: "1px solid var(--border)",
    borderRadius: "var(--r-md)",
    padding: "16px 18px",
    position: "relative",
    overflow: "hidden",
  };

  if (loading && activeTab === "analytics") {
    return <StatSkeleton />;
  }

  return (
    <div style={{ maxWidth: 1000, margin: "0 auto" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 24, gap: 16 }}>
        <div>
          <h1 style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 30, letterSpacing: "-0.025em", color: "var(--heading)", marginBottom: 4 }}>
            Admin
          </h1>
          <div style={{ fontSize: 13, color: "var(--text-3)" }}>
            {stats ? `${stats.school_name} · ${stats.school_year} · institutional analytics` : "Athenian School · institutional analytics"}
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
          <div style={{ display: "inline-flex", gap: 4, background: "var(--surface-2)", padding: 4, borderRadius: 8, border: "1px solid var(--border)" }}>
            <button
              onClick={() => setActiveTab("analytics")}
              style={{ padding: "6px 14px", borderRadius: 6, border: "none", cursor: "pointer", fontFamily: "var(--font-body)", fontWeight: 600, fontSize: 13, background: activeTab === "analytics" ? "var(--primary)" : "transparent", color: activeTab === "analytics" ? "#fff" : "var(--text-2)", transition: "all 0.14s" }}
            >Analytics</button>
            <button
              onClick={() => setActiveTab("permissions")}
              style={{ padding: "6px 14px", borderRadius: 6, border: "none", cursor: "pointer", fontFamily: "var(--font-body)", fontWeight: 600, fontSize: 13, background: activeTab === "permissions" ? "var(--primary)" : "transparent", color: activeTab === "permissions" ? "#fff" : "var(--text-2)", transition: "all 0.14s" }}
            >Permissions</button>
          </div>

          <button
            style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "6px 12px", border: "1px solid var(--border-strong)", background: "var(--surface)", borderRadius: 6, fontFamily: "var(--font-body)", fontWeight: 600, fontSize: 13, color: "var(--text-2)", cursor: "not-allowed", opacity: 0.6 }}
            disabled
            title="Export — not yet implemented"
          >
            <span className="material-symbols-outlined" style={{ fontSize: 16 }}>download</span>
            Export
          </button>
        </div>
      </div>

      {activeTab === "analytics" ? (
        fetchError ? (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "64px 40px", gap: 16, background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--r-md)" }}>
            <span className="material-symbols-outlined" style={{ fontSize: 40, color: "var(--text-3)" }}>error_outline</span>
            <p style={{ fontSize: 14, color: "var(--text-2)", textAlign: "center" }}>{fetchError}</p>
            <button
              onClick={fetchStats}
              style={{ padding: "8px 20px", borderRadius: 6, border: "1px solid var(--border-strong)", background: "var(--primary)", color: "#fff", fontFamily: "var(--font-body)", fontWeight: 600, fontSize: 13, cursor: "pointer" }}
            >Retry</button>
          </div>
        ) : stats ? (
          <>
            {/* KPI row */}
            <div className="stat-grid-4" style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14, marginBottom: 14 }}>
              {[
                { lbl: "Total Clubs", num: stats.total_clubs, sub: "registered", c: STAT_COLORS[0] },
                { lbl: "Students Participating", num: stats.students_participating, sub: "with at least 1 club", c: STAT_COLORS[1] },
                { lbl: "Past Events", num: stats.past_events, sub: "this school year", c: STAT_COLORS[2] },
                {
                  lbl: "Meeting Hours",
                  num: `~${stats.meeting_hours}`,
                  sub: "estimated at 1.5 hrs/meeting",
                  c: STAT_COLORS[3],
                },
              ].map(({ lbl, num, sub, c }) => (
                <div key={lbl} style={{ ...statStyle }}>
                  <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 3, background: c }} />
                  <div style={{ fontFamily: "var(--font-mono)", fontSize: 10.5, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--text-3)" }}>{lbl}</div>
                  <div style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 30, color: "var(--heading)", lineHeight: 1.1, marginTop: 6 }}>{num}</div>
                  <div style={{ fontSize: 12, color: "var(--text-2)", marginTop: 2 }}>{sub}</div>
                </div>
              ))}
            </div>

            {/* Engagement Trend + Enrollment Rate */}
            <div className="analytics-row-split" style={{ display: "grid", gridTemplateColumns: "1.6fr 1fr", gap: 14, marginBottom: 14 }}>
              {/* Bar chart */}
              <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--r-md)", padding: "18px 20px" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
                  <h3 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 15, letterSpacing: "-0.01em", color: "var(--heading)" }}>Engagement Trend</h3>
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: 10.5, letterSpacing: "0.06em", color: "var(--text-3)", textTransform: "uppercase" }}>EVENTS / MONTH</span>
                </div>
                {stats.engagement_trend.every((m) => m.count === 0) ? (
                  <div style={{ height: 168, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "flex-end", gap: 12 }}>
                    <div style={{ display: "flex", alignItems: "flex-end", gap: 12, height: "100%", width: "100%" }}>
                      {stats.engagement_trend.map((m, i) => (
                        <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "flex-end", gap: 7, height: "100%" }}>
                          <div style={{ width: "100%", borderRadius: 3, background: "var(--primary)", height: "8%", opacity: 0.15 }} />
                          <span style={{ fontFamily: "var(--font-mono)", fontSize: 10.5, letterSpacing: "0.05em", textTransform: "uppercase", color: "var(--text-3)" }}>{m.month}</span>
                        </div>
                      ))}
                    </div>
                    <span style={{ fontSize: 12, color: "var(--text-3)" }}>No events yet</span>
                  </div>
                ) : (
                  <div style={{ display: "flex", alignItems: "flex-end", gap: 12, height: 168 }}>
                    {(() => {
                      const maxCount = Math.max(...stats.engagement_trend.map((m) => m.count), 1);
                      const currentIndex = stats.engagement_trend.length - 1;
                      return stats.engagement_trend.map((m, i) => {
                        const heightPct = m.count > 0 ? (m.count / maxCount) * 100 : 8;
                        const isCurrent = i === currentIndex;
                        return (
                          <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "flex-end", gap: 7, height: "100%" }}>
                            <span style={{ fontFamily: "var(--font-mono)", fontSize: 12, fontWeight: 600, color: "var(--heading)" }}>{m.count || ""}</span>
                            <div style={{ width: "100%", borderRadius: 3, background: isCurrent ? "var(--accent)" : "var(--primary)", height: `${heightPct}%`, opacity: m.count === 0 ? 0.15 : 1 }} />
                            <span style={{ fontFamily: "var(--font-mono)", fontSize: 10.5, letterSpacing: "0.05em", textTransform: "uppercase", color: isCurrent ? "var(--accent)" : "var(--text-3)" }}>{m.month}</span>
                          </div>
                        );
                      });
                    })()}
                  </div>
                )}
              </div>

              {/* Donut */}
              <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--r-md)", padding: "18px 20px", display: "flex", flexDirection: "column" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
                  <h3 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 15, letterSpacing: "-0.01em", color: "var(--heading)" }}>Enrollment Rate</h3>
                </div>
                <div style={{ flex: 1, display: "grid", placeItems: "center" }}>
                  <DonutChart
                    pct={stats.enrollment_rate.percentage}
                    enrolled={stats.enrollment_rate.enrolled_students}
                    total={stats.enrollment_rate.total_users}
                  />
                </div>
              </div>
            </div>

            {/* Category Distribution + Participation by Grade */}
            <div className="analytics-row-split" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
              <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--r-md)", padding: "18px 20px" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
                  <h3 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 15, color: "var(--heading)" }}>Category Distribution</h3>
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: 10.5, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.06em" }}>% OF CLUBS</span>
                </div>
                {stats.category_distribution.every((c) => c.count === 0) ? (
                  <div style={{ textAlign: "center", color: "var(--text-3)", fontSize: 13, padding: "24px 0" }}>No clubs yet</div>
                ) : (
                  stats.category_distribution.map(({ category, count, percentage }) => (
                    <div key={category} style={{ display: "grid", gridTemplateColumns: "96px 1fr 56px", alignItems: "center", gap: 14, padding: "9px 0", borderBottom: "1px solid var(--border)" }}>
                      <span style={{ fontSize: 13, fontWeight: 600, color: "var(--text)" }}>{category}</span>
                      <div style={{ height: 8, background: "var(--surface-2)", borderRadius: 4, overflow: "hidden" }}>
                        <div style={{ height: "100%", borderRadius: 4, background: CAT_COLORS[category] ?? "var(--text-3)", width: `${percentage}%` }} />
                      </div>
                      <span style={{ fontFamily: "var(--font-mono)", fontSize: 12.5, fontWeight: 600, color: "var(--heading)", textAlign: "right" }}>
                        {percentage}% <span style={{ fontWeight: 400, color: "var(--text-3)", fontSize: 11 }}>({count})</span>
                      </span>
                    </div>
                  ))
                )}
              </div>

              <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--r-md)", padding: "18px 20px" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
                  <h3 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 15, color: "var(--heading)" }}>Participation by Grade</h3>
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: 10.5, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.06em" }}>STUDENTS</span>
                </div>
                {stats.participation_by_grade.map(({ grade, count }) => (
                  <div key={grade} style={{ display: "grid", gridTemplateColumns: "96px 1fr 40px", alignItems: "center", gap: 14, padding: "9px 0", borderBottom: "1px solid var(--border)" }}>
                    <span style={{ fontSize: 13, fontWeight: 600, color: "var(--text)" }}>{grade}</span>
                    <div style={{ height: 8, background: "var(--surface-2)", borderRadius: 4, overflow: "hidden" }}>
                      <div style={{ height: "100%", borderRadius: 4, background: `linear-gradient(90deg, var(--primary), color-mix(in oklab, var(--primary) 55%, var(--accent)))`, width: `${count}%` }} />
                    </div>
                    <span style={{ fontFamily: "var(--font-mono)", fontSize: 12.5, fontWeight: 600, color: "var(--heading)", textAlign: "right" }}>{count}</span>
                  </div>
                ))}
                {!stats.grade_data_available && (
                  <p style={{ fontSize: 11, color: "var(--text-3)", marginTop: 10 }}>
                    Grade data will be available once grade levels are added to user profiles.
                  </p>
                )}
              </div>
            </div>

            {/* Bottom stat cards */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14 }}>
              <div style={{ ...statStyle }}>
                <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 3, background: "var(--cat-stem)" }} />
                <span style={{ fontFamily: "var(--font-mono)", fontSize: 10.5, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--text-3)" }}>Avg. Students / Club</span>
                <div style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 26, color: "var(--heading)", lineHeight: 1.1, marginTop: 6 }}>{stats.avg_students_per_club}</div>
                <div style={{ fontSize: 12, color: "var(--text-2)", marginTop: 3 }}>members per organization</div>
              </div>

              <div style={{ ...statStyle }}>
                <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 3, background: "var(--cat-arts)" }} />
                <span style={{ fontFamily: "var(--font-mono)", fontSize: 10.5, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--text-3)" }}>Most Active Club</span>
                <div style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 18, color: "var(--heading)", lineHeight: 1.2, marginTop: 6 }}>
                  {stats.most_active_club.name}
                </div>
                <div style={{ fontSize: 12, color: "var(--text-2)", marginTop: 3 }}>
                  {stats.most_active_club.event_count > 0
                    ? `${stats.most_active_club.event_count} events · ${stats.most_active_club.member_count} members`
                    : "no events yet"}
                </div>
              </div>

              <div style={{ ...statStyle }}>
                <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 3, background: "var(--accent)" }} />
                <span style={{ fontFamily: "var(--font-mono)", fontSize: 10.5, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--text-3)" }}>Leadership Ratio</span>
                <div style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 26, color: "var(--heading)", lineHeight: 1.1, marginTop: 6 }}>
                  {stats.leadership_ratio.percentage}%
                </div>
                <div style={{ fontSize: 12, color: "var(--text-2)", marginTop: 3 }}>{stats.leadership_ratio.leadership_ratio_note}</div>
              </div>
            </div>
          </>
        ) : null
      ) : (
        <PermissionsTab />
      )}
    </div>
  );
}
