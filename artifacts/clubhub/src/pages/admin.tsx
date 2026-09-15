import { useState, useEffect, useCallback } from "react";

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
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14, marginBottom: 14 }}>
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
            <div style={{ display: "grid", gridTemplateColumns: "1.6fr 1fr", gap: 14, marginBottom: 14 }}>
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
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
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
        /* Permissions placeholder */
        <div style={{
          background: "var(--surface)",
          border: "1px dashed var(--border-strong)",
          borderRadius: "var(--r-md)",
          padding: "56px 40px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          textAlign: "center",
        }}>
          <div style={{ width: 56, height: 56, borderRadius: "var(--r-md)", background: "var(--primary)", display: "grid", placeItems: "center", color: "#fff", marginBottom: 18 }}>
            <span className="material-symbols-outlined" style={{ fontSize: 28 }}>admin_panel_settings</span>
          </div>
          <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 21, color: "var(--heading)", marginBottom: 8 }}>
            User &amp; access management
          </h2>
          <p style={{ color: "var(--text-2)", maxWidth: "46ch", fontSize: 13.5, lineHeight: 1.65 }}>
            Add or remove administrators, assign office roles, and control who can view analytics. This panel is in design.
          </p>
          <span style={{ marginTop: 18, fontFamily: "var(--font-mono)", fontSize: 10.5, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--accent)", border: "1px solid color-mix(in oklab, var(--accent) 40%, transparent)", padding: "6px 12px", borderRadius: "var(--r-sm)" }}>
            Coming soon
          </span>
        </div>
      )}
    </div>
  );
}
