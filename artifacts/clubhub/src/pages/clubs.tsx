import { useMemo } from "react";
import { useState } from "react";
import { useGetClubs, useGetNotifications, getGetNotificationsQueryKey, useGetCalendarEvents, getGetCalendarEventsQueryKey } from "@workspace/api-client-react";
import { Link } from "wouter";
import { getClubColor } from "@/lib/color-utils";
import { ClubDetailModal } from "@/components/ClubDetailModal";

export default function ClubsPage() {
  const { data, isLoading } = useGetClubs({ limit: 200 });
  const [selectedClubId, setSelectedClubId] = useState<number | null>(null);

  const today = useMemo(() => new Date(), []);
  const calParams = useMemo(() => ({ year: today.getFullYear(), month: today.getMonth() + 1 }), [today]);
  const { data: calData } = useGetCalendarEvents(calParams, {
    query: { queryKey: getGetCalendarEventsQueryKey(calParams) }
  });
  const { data: notifData } = useGetNotifications({
    query: { queryKey: getGetNotificationsQueryKey() }
  });

  const enrolledClubs = useMemo(() => {
    if (!data?.success) return [];
    return data.clubs.filter(c => c.is_enrolled);
  }, [data]);

  const eventsThisWeek = useMemo(() => {
    if (!calData?.success) return 0;
    const enrolled = data?.success ? new Set(data.clubs.filter(c => c.is_enrolled).map(c => c.id)) : new Set<number>();
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - today.getDay() + 1);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);
    return calData.events.filter(e => {
      if (!enrolled.has(e.club_id)) return false;
      const d = new Date(e.event_date);
      return d >= weekStart && d <= weekEnd;
    }).length;
  }, [calData, data, today]);

  const unreadCount = notifData?.success ? notifData.unread_count : 0;

  const statStyle: React.CSSProperties = {
    background: "var(--surface)",
    border: "1px solid var(--border)",
    borderRadius: "var(--r-md)",
    padding: "16px 18px",
    position: "relative",
    overflow: "hidden",
  };

  if (isLoading) {
    return (
      <div style={{ maxWidth: 900, margin: "0 auto" }}>
        <div style={{ height: 36, background: "var(--surface-2)", borderRadius: "var(--r-sm)", width: 200, marginBottom: 8 }} />
        <div style={{ height: 16, background: "var(--surface-2)", borderRadius: "var(--r-sm)", width: 300, marginBottom: 28 }} />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 14 }}>
          {[1, 2, 3, 4].map(i => <div key={i} style={{ height: 120, background: "var(--surface-2)", borderRadius: "var(--r-md)" }} />)}
        </div>
      </div>
    );
  }

  const STAT_COLORS = ["var(--cat-stem)", "var(--cat-arts)", "var(--cat-academic)", "var(--cat-service)"];

  return (
    <div style={{ maxWidth: 900, margin: "0 auto" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 24, gap: 16 }}>
        <div>
          <h1 style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 30, letterSpacing: "-0.025em", color: "var(--heading)", marginBottom: 4 }}>
            Your Clubs
          </h1>
          <div style={{ fontSize: 13, color: "var(--text-3)" }}>
            {enrolledClubs.length} active {enrolledClubs.length === 1 ? "membership" : "memberships"}
          </div>
        </div>
        <Link href="/directory">
          <a style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            padding: "8px 14px",
            background: "var(--accent)",
            color: "#fff",
            borderRadius: "var(--r-sm)",
            fontFamily: "var(--font-body)",
            fontWeight: 600,
            fontSize: 13,
            textDecoration: "none",
            flexShrink: 0,
          }}>
            <span className="material-symbols-outlined" style={{ fontSize: 16 }}>explore</span>
            Find clubs
          </a>
        </Link>
      </div>

      {/* Stats row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14, marginBottom: 24 }}>
        {[
          { lbl: "Memberships", num: enrolledClubs.length, sub: `${enrolledClubs.filter(c => c.is_leader).length} as leader`, c: STAT_COLORS[0] },
          { lbl: "Events This Week", num: eventsThisWeek, sub: "enrolled clubs", c: STAT_COLORS[1] },
          { lbl: "Hours Logged", num: 0, sub: "placeholder — not tracked", c: STAT_COLORS[2] },
          { lbl: "Notifications", num: unreadCount, sub: "unread", c: STAT_COLORS[3] },
        ].map(({ lbl, num, sub, c }) => (
          <div key={lbl} style={{ ...statStyle }}>
            <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 3, background: c }} />
            <div style={{ fontFamily: "var(--font-mono)", fontSize: 10.5, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--text-3)" }}>{lbl}</div>
            <div style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 30, color: "var(--heading)", lineHeight: 1.1, marginTop: 6 }}>{num}</div>
            <div style={{ fontSize: 12, color: "var(--text-2)", marginTop: 2 }}>{sub}</div>
          </div>
        ))}
      </div>

      {/* Section heading */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", margin: "4px 0 14px" }}>
        <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 17, letterSpacing: "-0.01em", color: "var(--heading)" }}>
          Active memberships
        </h2>
        <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--text-3)", letterSpacing: "0.06em" }}>
          SORTED BY MEETING DAY
        </span>
      </div>

      {enrolledClubs.length === 0 ? (
        <div style={{
          background: "var(--surface)",
          border: "1px dashed var(--border-strong)",
          borderRadius: "var(--r-md)",
          padding: "48px 24px",
          textAlign: "center",
        }}>
          <span className="material-symbols-outlined" style={{ fontSize: 40, color: "var(--text-3)", display: "block", marginBottom: 12 }}>group_off</span>
          <p style={{ fontWeight: 600, color: "var(--heading)", marginBottom: 6 }}>No clubs yet</p>
          <p style={{ fontSize: 13, color: "var(--text-3)", marginBottom: 16 }}>Browse the directory to find clubs to join.</p>
          <Link href="/directory">
            <a style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "8px 14px", background: "var(--accent)", color: "#fff", borderRadius: "var(--r-sm)", fontFamily: "var(--font-body)", fontWeight: 600, fontSize: 13, textDecoration: "none" }}>
              Browse Directory
            </a>
          </Link>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 14 }}>
          {enrolledClubs.map(club => {
            const color = getClubColor(club.id);
            return (
              <div
                key={club.id}
                onClick={() => setSelectedClubId(club.id)}
                style={{
                  display: "flex",
                  gap: 14,
                  alignItems: "flex-start",
                  background: "var(--surface)",
                  border: "1px solid var(--border)",
                  borderLeft: `4px solid ${color}`,
                  borderRadius: "var(--r-md)",
                  padding: "16px 18px",
                  cursor: "pointer",
                  transition: "box-shadow 0.14s",
                }}
                onMouseEnter={e => (e.currentTarget.style.boxShadow = "var(--sh)")}
                onMouseLeave={e => (e.currentTarget.style.boxShadow = "none")}
              >
                {/* Avatar */}
                <div style={{
                  width: 40,
                  height: 40,
                  borderRadius: "var(--r-sm)",
                  background: color,
                  color: "#fff",
                  display: "grid",
                  placeItems: "center",
                  fontFamily: "var(--font-display)",
                  fontWeight: 800,
                  fontSize: 17,
                  flexShrink: 0,
                }}>
                  {club.profile_photo ? (
                    <img src={club.profile_photo} alt={club.name} style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "var(--r-sm)" }} />
                  ) : club.initial}
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <span style={{ fontWeight: 700, fontSize: 15, color: "var(--heading)" }}>{club.name}</span>
                    {club.is_leader ? (
                      <span style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 4,
                        fontSize: 10.5,
                        fontWeight: 700,
                        padding: "3px 8px",
                        borderRadius: "var(--r-pill)",
                        background: "var(--primary)",
                        color: "#fff",
                        textTransform: "uppercase",
                        letterSpacing: "0.04em",
                        whiteSpace: "nowrap",
                      }}>
                        <span className="material-symbols-outlined" style={{ fontSize: 12 }}>star</span>
                        Leader
                      </span>
                    ) : (
                      <span style={{
                        fontSize: 10.5,
                        fontWeight: 700,
                        padding: "3px 8px",
                        borderRadius: "var(--r-pill)",
                        background: `color-mix(in oklab, ${color} 16%, var(--surface))`,
                        color: `color-mix(in oklab, ${color} 72%, var(--text))`,
                        border: `1px solid color-mix(in oklab, ${color} 26%, transparent)`,
                        textTransform: "uppercase",
                        letterSpacing: "0.04em",
                        whiteSpace: "nowrap",
                      }}>
                        {club.type}
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: 12.5, color: "var(--text-2)", margin: "4px 0 10px", overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>
                    {club.description}
                  </div>
                  <div style={{ display: "flex", gap: 16 }}>
                    {club.default_day && (
                      <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 11.5, fontFamily: "var(--font-mono)", color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.04em" }}>
                        <span className="material-symbols-outlined" style={{ fontSize: 14 }}>schedule</span>
                        {club.default_day}
                      </span>
                    )}
                    {club.default_location && (
                      <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 11.5, fontFamily: "var(--font-mono)", color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.04em" }}>
                        <span className="material-symbols-outlined" style={{ fontSize: 14 }}>place</span>
                        {club.default_location}
                      </span>
                    )}
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 11.5, fontFamily: "var(--font-mono)", color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.04em" }}>
                      <span className="material-symbols-outlined" style={{ fontSize: 14 }}>group</span>
                      {club.member_count}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {selectedClubId && (
        <ClubDetailModal clubId={selectedClubId} onClose={() => setSelectedClubId(null)} />
      )}
    </div>
  );
}
