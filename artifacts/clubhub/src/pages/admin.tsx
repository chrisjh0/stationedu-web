import { useState, useMemo, useEffect } from "react";
import { useGetClubs, getGetClubsQueryKey } from "@workspace/api-client-react";

interface AdminStats {
  totalClubs: number;
  studentsParticipating: number;
  pastEvents: number;
  engagementTrend: { month: string; count: number }[];
  enrollmentRate: number;
  enrolledStudents: number;
  totalStudents: number;
  categoryDistribution: { name: string; color: string; pct: number }[];
  avgStudentsPerClub: number;
  mostActiveClub: { name: string; events: number; members: number } | null;
}

const CAT_COLORS: Record<string, string> = {
  Club: "#DD5E54",
  Committee: "#232E54",
  Union: "#3C8A84",
  Team: "#BB8E33",
  Other: "#79839A",
};

function DonutChart({ pct, size = 156 }: { pct: number; size?: number }) {
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
        <b style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 32, color: "var(--heading)", display: "block", lineHeight: 1 }}>{pct}%</b>
        <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--text-3)" }}>enrolled</span>
      </div>
    </div>
  );
}

export default function AdminPage() {
  useEffect(() => { document.title = "Admin — Station"; }, []);
  const [activeTab, setActiveTab] = useState<"analytics" | "permissions">("analytics");
  const { data: clubsData } = useGetClubs({ limit: 1000 }, {
    query: { queryKey: getGetClubsQueryKey({ limit: 1000 }) }
  });

  const stats = useMemo<AdminStats>(() => {
    const clubs = clubsData?.success ? clubsData.clubs : [];
    const totalClubs = clubs.length;

    // Category distribution from club categories
    const typeCount: Record<string, number> = {};
    for (const c of clubs) { typeCount[c.category] = (typeCount[c.category] ?? 0) + 1; }
    const categoryDistribution = Object.entries(typeCount).map(([name, count]) => ({
      name,
      color: CAT_COLORS[name] ?? "#79839A",
      pct: totalClubs > 0 ? Math.round((count / totalClubs) * 100) : 0,
    })).sort((a, b) => b.pct - a.pct);

    const totalEnrollments = clubs.reduce((acc, c) => acc + c.member_count, 0);
    const avgStudentsPerClub = totalClubs > 0 ? Math.round(totalEnrollments / totalClubs) : 0;

    const mostActiveClub = clubs.reduce<{ name: string; events: number; members: number } | null>((best, c) => {
      if (!best || c.member_count > best.members) return { name: c.name, events: 0, members: c.member_count };
      return best;
    }, null);

    return {
      totalClubs,
      studentsParticipating: 0,
      pastEvents: 0,
      engagementTrend: [],
      enrollmentRate: 0,
      enrolledStudents: 0,
      totalStudents: 0,
      categoryDistribution,
      avgStudentsPerClub,
      mostActiveClub,
    };
  }, [clubsData]);

  // Placeholder engagement trend for last 6 months
  const months = (() => {
    const now = new Date();
    return Array.from({ length: 6 }, (_, i) => {
      const d = new Date(now.getFullYear(), now.getMonth() - 5 + i, 1);
      return { month: d.toLocaleString("default", { month: "short" }), count: 0 };
    });
  })();

  const statStyle: React.CSSProperties = {
    background: "var(--surface)",
    border: "1px solid var(--border)",
    borderRadius: "var(--r-md)",
    padding: "16px 18px",
    position: "relative",
    overflow: "hidden",
  };

  const STAT_COLORS = ["var(--cat-academic)", "var(--cat-stem)", "var(--cat-arts)", "var(--cat-service)"];

  return (
    <div style={{ maxWidth: 1000, margin: "0 auto" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 24, gap: 16 }}>
        <div>
          <h1 style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 30, letterSpacing: "-0.025em", color: "var(--heading)", marginBottom: 4 }}>
            Admin
          </h1>
          <div style={{ fontSize: 13, color: "var(--text-3)" }}>Athenian School · institutional analytics</div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
          {/* Tab toggle */}
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

          {/* Export placeholder */}
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
        <>
          {/* KPI row */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14, marginBottom: 14 }}>
            {[
              { lbl: "Total Clubs", num: stats.totalClubs, sub: "registered", c: STAT_COLORS[0] },
              { lbl: "Students Participating", num: stats.studentsParticipating || "—", sub: "with at least 1 club — placeholder", c: STAT_COLORS[1] },
              { lbl: "Past Events", num: stats.pastEvents || "—", sub: "this school year — placeholder", c: STAT_COLORS[2] },
              { lbl: "Meeting Hours", num: "0", sub: "cumulative — placeholder", c: STAT_COLORS[3] },
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
                <span style={{ fontFamily: "var(--font-mono)", fontSize: 10.5, letterSpacing: "0.06em", color: "var(--text-3)", textTransform: "uppercase" }}>EVENTS / MONTH · PLACEHOLDER</span>
              </div>
              <div style={{ display: "flex", alignItems: "flex-end", gap: 12, height: 168 }}>
                {months.map(({ month, count }, i) => {
                  const maxCount = Math.max(...months.map(m => m.count), 1);
                  const heightPct = count > 0 ? (count / maxCount) * 100 : 8;
                  return (
                    <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "flex-end", gap: 7, height: "100%" }}>
                      <span style={{ fontFamily: "var(--font-mono)", fontSize: 12, fontWeight: 600, color: "var(--heading)" }}>{count || ""}</span>
                      <div style={{ width: "100%", borderRadius: 3, background: "var(--primary)", height: `${heightPct}%`, opacity: count === 0 ? 0.15 : 1 }} />
                      <span style={{ fontFamily: "var(--font-mono)", fontSize: 10.5, letterSpacing: "0.05em", textTransform: "uppercase", color: "var(--text-3)" }}>{month}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Donut */}
            <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--r-md)", padding: "18px 20px", display: "flex", flexDirection: "column" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
                <h3 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 15, letterSpacing: "-0.01em", color: "var(--heading)" }}>Enrollment Rate</h3>
                <span style={{ fontFamily: "var(--font-mono)", fontSize: 10.5, letterSpacing: "0.06em", color: "var(--text-3)", textTransform: "uppercase" }}>PLACEHOLDER</span>
              </div>
              <div style={{ flex: 1, display: "grid", placeItems: "center" }}>
                <DonutChart pct={0} />
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
              {stats.categoryDistribution.length === 0 ? (
                <div style={{ textAlign: "center", color: "var(--text-3)", fontSize: 13, padding: "24px 0" }}>No data</div>
              ) : stats.categoryDistribution.map(({ name, color, pct }) => (
                <div key={name} style={{ display: "grid", gridTemplateColumns: "96px 1fr 40px", alignItems: "center", gap: 14, padding: "9px 0", borderBottom: "1px solid var(--border)" }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: "var(--text)" }}>{name}</span>
                  <div style={{ height: 8, background: "var(--surface-2)", borderRadius: 4, overflow: "hidden" }}>
                    <div style={{ height: "100%", borderRadius: 4, background: color, width: `${pct}%` }} />
                  </div>
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: 12.5, fontWeight: 600, color: "var(--heading)", textAlign: "right" }}>{pct}%</span>
                </div>
              ))}
            </div>

            <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--r-md)", padding: "18px 20px" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
                <h3 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 15, color: "var(--heading)" }}>Participation by Grade</h3>
                <span style={{ fontFamily: "var(--font-mono)", fontSize: 10.5, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.06em" }}>STUDENTS</span>
              </div>
              {[["9th", 0], ["10th", 0], ["11th", 0], ["12th", 0]].map(([grade, n]) => (
                <div key={grade} style={{ display: "grid", gridTemplateColumns: "96px 1fr 40px", alignItems: "center", gap: 14, padding: "9px 0", borderBottom: "1px solid var(--border)" }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: "var(--text)" }}>{grade}</span>
                  <div style={{ height: 8, background: "var(--surface-2)", borderRadius: 4, overflow: "hidden" }}>
                    <div style={{ height: "100%", borderRadius: 4, background: `linear-gradient(90deg, var(--primary), color-mix(in oklab, var(--primary) 55%, var(--accent)))`, width: `${Number(n) > 0 ? n : 0}%` }} />
                  </div>
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: 12.5, fontWeight: 600, color: "var(--heading)", textAlign: "right" }}>{n}</span>
                </div>
              ))}
              <p style={{ fontSize: 11, color: "var(--text-3)", marginTop: 10 }}>Placeholder — grade field not yet on user profiles.</p>
            </div>
          </div>

          {/* Bottom stat cards */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14 }}>
            {[
              { k: "Avg. Students / Club", big: stats.avgStudentsPerClub, sub: "members per organization", c: "var(--cat-stem)" },
              { k: "Most Active Club", big: stats.mostActiveClub?.name ?? "—", sub: stats.mostActiveClub ? `${stats.mostActiveClub.members} members` : "no data", c: "var(--cat-arts)", small: true },
              { k: "Leadership Ratio", big: "—", sub: "placeholder — not yet tracked", c: "var(--accent)" },
            ].map(({ k, big, sub, c, small }) => (
              <div key={k} style={{ ...statStyle }}>
                <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 3, background: c }} />
                <span style={{ fontFamily: "var(--font-mono)", fontSize: 10.5, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--text-3)" }}>{k}</span>
                <div style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: small ? 19 : 26, color: "var(--heading)", lineHeight: 1.1, marginTop: 6 }}>{big}</div>
                <div style={{ fontSize: 12, color: "var(--text-2)", marginTop: 3 }}>{sub}</div>
              </div>
            ))}
          </div>
        </>
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
