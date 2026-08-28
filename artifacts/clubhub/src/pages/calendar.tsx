import { useState, useCallback } from "react";
import { useGetCalendarEvents, getGetCalendarEventsQueryKey, useEnrollInClub, getGetClubsQueryKey } from "@workspace/api-client-react";
import { ClubDetailModal } from "@/components/ClubDetailModal";
import { getClubColor } from "@/lib/color-utils";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  format, addDays, startOfWeek, isSameDay,
  startOfMonth, endOfMonth, eachDayOfInterval,
  isSameMonth, addMonths, endOfWeek,
} from "date-fns";

type ViewMode = "daily" | "monthly";

export default function CalendarPage() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedClubId, setSelectedClubId] = useState<number | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>("daily");
  const queryClient = useQueryClient();
  const enrollMutation = useEnrollInClub();

  const calendarParams = {
    year: selectedDate.getFullYear(),
    month: selectedDate.getMonth() + 1,
  };

  const { data, isLoading } = useGetCalendarEvents(calendarParams, {
    query: { queryKey: getGetCalendarEventsQueryKey(calendarParams) }
  });

  const weekStart = startOfWeek(selectedDate, { weekStartsOn: 1 });
  const weekDays = Array.from({ length: 7 }).map((_, i) => addDays(weekStart, i));

  const monthStart = startOfMonth(selectedDate);
  const monthEnd = endOfMonth(selectedDate);
  const gridStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const gridEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
  const calDays = eachDayOfInterval({ start: gridStart, end: gridEnd });

  const events = data?.success ? data.events : [];
  const today = new Date();

  const dayEvents = events
    .filter(e => isSameDay(new Date(e.event_date), selectedDate))
    .sort((a, b) => a.event_time.localeCompare(b.event_time));

  const enrolledCount = dayEvents.filter(e => e.is_enrolled).length;
  const availableCount = dayEvents.filter(e => !e.is_enrolled).length;

  const handleWeekKeyDown = useCallback((e: React.KeyboardEvent, day: Date) => {
    if (e.key === "ArrowLeft") { e.preventDefault(); setSelectedDate(prev => addDays(prev, -1)); }
    if (e.key === "ArrowRight") { e.preventDefault(); setSelectedDate(prev => addDays(prev, 1)); }
    if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setSelectedDate(day); }
  }, []);

  const handleQuickJoin = (e: React.MouseEvent, clubId: number) => {
    e.stopPropagation();
    enrollMutation.mutate({ id: clubId }, {
      onSuccess: () => {
        toast.success("Joined successfully");
        queryClient.invalidateQueries({ queryKey: getGetCalendarEventsQueryKey(calendarParams) });
        queryClient.invalidateQueries({ queryKey: getGetClubsQueryKey() });
      },
      onError: (err) => toast.error(err.message || "Failed to join"),
    });
  };

  const cardStyle: React.CSSProperties = {
    background: "var(--surface)",
    border: "1px solid var(--border)",
    borderRadius: "var(--r-md)",
    boxShadow: "var(--sh-sm)",
  };

  return (
    <div style={{ maxWidth: 900, margin: "0 auto" }}>
      {/* Page header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 28, gap: 16 }}>
        <div>
          <h1 style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 30, letterSpacing: "-0.025em", color: "var(--heading)", marginBottom: 4 }}>
            Calendar
          </h1>
          <div style={{ fontSize: 13, color: "var(--text-3)" }}>
            {format(today, "EEEE, MMMM d, yyyy")}
          </div>
        </div>

        {/* Controls */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
          <div style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 4,
            background: "var(--surface-2)",
            padding: 4,
            borderRadius: 8,
            border: "1px solid var(--border)",
          }}>
            <button
              onClick={() => setViewMode("daily")}
              style={{
                padding: "6px 14px",
                borderRadius: 6,
                border: "none",
                cursor: "pointer",
                fontFamily: "var(--font-body)",
                fontWeight: 600,
                fontSize: 13,
                background: viewMode === "daily" ? "var(--primary)" : "transparent",
                color: viewMode === "daily" ? "#fff" : "var(--text-2)",
                transition: "background 0.14s, color 0.14s",
              }}
            >Day</button>
            <button
              onClick={() => setViewMode("monthly")}
              style={{
                padding: "6px 14px",
                borderRadius: 6,
                border: "none",
                cursor: "pointer",
                fontFamily: "var(--font-body)",
                fontWeight: 600,
                fontSize: 13,
                background: viewMode === "monthly" ? "var(--primary)" : "transparent",
                color: viewMode === "monthly" ? "#fff" : "var(--text-2)",
                transition: "background 0.14s, color 0.14s",
              }}
            >Month</button>
          </div>
          <button
            onClick={() => { setSelectedDate(new Date()); setViewMode("daily"); }}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 5,
              padding: "6px 12px",
              borderRadius: 6,
              border: "1px solid var(--border-strong)",
              background: "var(--surface)",
              color: "var(--text-2)",
              fontFamily: "var(--font-body)",
              fontWeight: 600,
              fontSize: 13,
              cursor: "pointer",
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: 16 }}>today</span>
            Today
          </button>
        </div>
      </div>

      {/* ── DAY VIEW ── */}
      {viewMode === "daily" && (
        <>
          {/* Week strip */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(7, 1fr)",
            gap: 8,
            marginBottom: 20,
          }}>
            {weekDays.map(day => {
              const isSelected = isSameDay(day, selectedDate);
              const isToday = isSameDay(day, today);
              const dayStr = format(day, "yyyy-MM-dd");
              const dayEventColors = [...new Set(
                events.filter(e => e.event_date === dayStr).map(e => getClubColor(e.club_id))
              )];

              return (
                <div
                  key={day.toISOString()}
                  role="button"
                  tabIndex={0}
                  aria-label={format(day, "EEEE, MMMM d")}
                  aria-pressed={isSelected}
                  onClick={() => setSelectedDate(day)}
                  onKeyDown={e => handleWeekKeyDown(e, day)}
                  style={{
                    background: isSelected ? "var(--primary)" : "var(--surface)",
                    border: `1px solid ${isSelected ? "var(--primary)" : "var(--border)"}`,
                    borderRadius: "var(--r-md)",
                    padding: 10,
                    cursor: "pointer",
                    outline: "none",
                    boxShadow: isSelected ? "var(--sh-sm)" : "none",
                  }}
                >
                  <div style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: 11,
                    color: isSelected ? "rgba(255,255,255,0.7)" : "var(--text-3)",
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                    marginBottom: 3,
                  }}>
                    {format(day, "EEE")}
                  </div>
                  <div style={{
                    fontFamily: "var(--font-display)",
                    fontWeight: 800,
                    fontSize: 20,
                    color: isSelected ? "#fff" : isToday ? "var(--accent)" : "var(--heading)",
                    lineHeight: 1,
                    marginBottom: 7,
                  }}>
                    {format(day, "d")}
                  </div>
                  <div style={{ display: "flex", gap: 3 }}>
                    {dayEventColors.slice(0, 3).map((color, i) => (
                      <span key={i} style={{
                        display: "block",
                        flex: 1,
                        height: 4,
                        borderRadius: 2,
                        background: isSelected ? "rgba(255,255,255,0.6)" : color,
                      }} />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Day section heading */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", margin: "4px 0 14px" }}>
            <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 17, letterSpacing: "-0.01em", color: "var(--heading)" }}>
              {format(selectedDate, "EEEE")} · {dayEvents.length} {dayEvents.length === 1 ? "event" : "events"}
            </h2>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--text-3)", letterSpacing: "0.06em" }}>
              {enrolledCount} ENROLLED · {availableCount} AVAILABLE
            </span>
          </div>

          {isLoading ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {[1, 2, 3].map(i => (
                <div key={i} style={{ height: 72, background: "var(--surface-2)", borderRadius: "var(--r-md)", animation: "pulse 1.5s infinite" }} />
              ))}
            </div>
          ) : dayEvents.length === 0 ? (
            <div style={{ ...cardStyle, padding: "48px 24px", textAlign: "center" }}>
              <span className="material-symbols-outlined" style={{ fontSize: 40, color: "var(--text-3)", display: "block", marginBottom: 12 }}>event_busy</span>
              <p style={{ fontWeight: 600, color: "var(--heading)", marginBottom: 6 }}>No events on this day</p>
              <p style={{ fontSize: 13, color: "var(--text-3)" }}>Browse the Directory to find clubs meeting soon.</p>
            </div>
          ) : (
            <div style={{ ...cardStyle, overflow: "hidden" }}>
              {dayEvents.map((event, idx) => {
                const hour = parseInt(event.event_time.split(":")[0]);
                const minute = event.event_time.split(":")[1];
                const isPM = hour >= 12;
                const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
                const color = getClubColor(event.club_id);

                return (
                  <div
                    key={event.id}
                    onClick={() => setSelectedClubId(event.club_id)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 16,
                      padding: "14px 18px",
                      borderBottom: idx < dayEvents.length - 1 ? "1px solid var(--border)" : "none",
                      borderLeft: `4px solid ${color}`,
                      cursor: "pointer",
                      transition: "background 0.1s",
                    }}
                    onMouseEnter={e => (e.currentTarget.style.background = "var(--surface-2)")}
                    onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                  >
                    {/* Time */}
                    <div style={{
                      fontFamily: "var(--font-mono)",
                      fontWeight: 600,
                      fontSize: 13,
                      color: "var(--text)",
                      width: 74,
                      flexShrink: 0,
                    }}>
                      {displayHour}:{minute}
                      <small style={{ display: "block", color: "var(--text-3)", fontSize: 10 }}>{isPM ? "PM" : "AM"}</small>
                    </div>

                    {/* Event info */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 700, fontSize: 14.5, color: "var(--heading)", marginBottom: 3 }}>
                        {event.title}
                      </div>
                      <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
                        <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 12.5, color: "var(--text-2)", fontFamily: "var(--font-mono)" }}>
                          <span className="material-symbols-outlined" style={{ fontSize: 14, color: "var(--text-3)" }}>group</span>
                          {event.club_name}
                        </span>
                        <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 12.5, color: "var(--text-2)", fontFamily: "var(--font-mono)" }}>
                          <span className="material-symbols-outlined" style={{ fontSize: 14, color: "var(--text-3)" }}>place</span>
                          {event.location}
                        </span>
                      </div>
                    </div>

                    {/* Status */}
                    <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
                      {event.is_enrolled ? (
                        <span style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 5,
                          fontSize: 10.5,
                          fontWeight: 700,
                          padding: "4px 9px",
                          borderRadius: "var(--r-pill)",
                          background: "color-mix(in oklab, var(--success) 16%, var(--surface))",
                          color: "var(--success)",
                          textTransform: "uppercase",
                          letterSpacing: "0.04em",
                        }}>
                          Enrolled
                        </span>
                      ) : (
                        <>
                          <span style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 5,
                            fontSize: 10.5,
                            fontWeight: 700,
                            padding: "4px 9px",
                            borderRadius: "var(--r-pill)",
                            background: "color-mix(in oklab, var(--border-strong) 30%, var(--surface))",
                            color: "var(--text-3)",
                            textTransform: "uppercase",
                            letterSpacing: "0.04em",
                          }}>
                            Available
                          </span>
                          <button
                            onClick={e => handleQuickJoin(e, event.club_id)}
                            disabled={enrollMutation.isPending}
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              gap: 5,
                              height: 32,
                              padding: "0 13px",
                              borderRadius: "var(--r-sm)",
                              border: "none",
                              background: "var(--accent)",
                              color: "#fff",
                              fontWeight: 600,
                              fontSize: 12.5,
                              cursor: "pointer",
                              fontFamily: "var(--font-body)",
                            }}
                          >
                            Join
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* ── MONTH VIEW ── */}
      {viewMode === "monthly" && (
        <>
          {/* Month nav */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 6, marginBottom: 16 }}>
            <button
              onClick={() => setSelectedDate(addMonths(selectedDate, -1))}
              style={{ width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid var(--border-strong)", borderRadius: "var(--r-sm)", background: "var(--surface)", cursor: "pointer", color: "var(--text-2)" }}
              aria-label="Previous month"
            >
              <span className="material-symbols-outlined" style={{ fontSize: 18 }}>chevron_left</span>
            </button>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--text-2)", letterSpacing: "0.04em" }}>
              {format(selectedDate, "MMMM yyyy")}
            </span>
            <button
              onClick={() => setSelectedDate(addMonths(selectedDate, 1))}
              style={{ width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid var(--border-strong)", borderRadius: "var(--r-sm)", background: "var(--surface)", cursor: "pointer", color: "var(--text-2)" }}
              aria-label="Next month"
            >
              <span className="material-symbols-outlined" style={{ fontSize: 18 }}>chevron_right</span>
            </button>
          </div>

          {/* Grid */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 6 }}>
            {/* Day headers */}
            {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map(d => (
              <div key={d} style={{
                textAlign: "left",
                fontFamily: "var(--font-mono)",
                fontSize: 10.5,
                fontWeight: 600,
                color: "var(--text-3)",
                textTransform: "uppercase",
                letterSpacing: "0.06em",
                padding: "4px 6px",
              }}>{d}</div>
            ))}

            {calDays.map(day => {
              const dayStr = format(day, "yyyy-MM-dd");
              const isCurrentMonth = isSameMonth(day, selectedDate);
              const isToday = isSameDay(day, today);
              const isSelected = isSameDay(day, selectedDate);
              const dayEvts = events.filter(e => e.event_date === dayStr);

              return (
                <div
                  key={day.toISOString()}
                  role="button"
                  tabIndex={0}
                  onClick={() => { setSelectedDate(day); setViewMode("daily"); }}
                  onKeyDown={e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setSelectedDate(day); setViewMode("daily"); } }}
                  style={{
                    minHeight: 96,
                    background: isCurrentMonth ? "var(--surface)" : "var(--surface-2)",
                    border: `1px solid ${isToday ? "var(--accent)" : "var(--border)"}`,
                    boxShadow: isToday ? `inset 0 0 0 1px var(--accent)` : "none",
                    borderRadius: "var(--r-sm)",
                    padding: 7,
                    display: "flex",
                    flexDirection: "column",
                    gap: 4,
                    cursor: "pointer",
                    opacity: isCurrentMonth ? 1 : 0.5,
                    outline: "none",
                  }}
                >
                  <span style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: 12,
                    fontWeight: 600,
                    color: isSelected ? "var(--accent)" : "var(--text-2)",
                  }}>
                    {format(day, "d")}
                  </span>
                  {dayEvts.slice(0, 3).map(evt => (
                    <span key={evt.id} style={{
                      fontSize: 10.5,
                      fontWeight: 700,
                      color: "#fff",
                      background: getClubColor(evt.club_id),
                      borderRadius: 4,
                      padding: "2px 6px",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}>
                      {evt.club_name || evt.title}
                    </span>
                  ))}
                </div>
              );
            })}
          </div>
        </>
      )}

      {selectedClubId && (
        <ClubDetailModal
          clubId={selectedClubId}
          onClose={() => setSelectedClubId(null)}
          onEnrollmentChange={() => queryClient.invalidateQueries({ queryKey: getGetCalendarEventsQueryKey(calendarParams) })}
        />
      )}
    </div>
  );
}
