import { useState } from "react";
import { useGetClub, useEnrollInClub, useUnenrollFromClub, getGetClubQueryKey } from "@workspace/api-client-react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { getClubColor } from "@/lib/color-utils";
import { getGetClubsQueryKey, getGetCalendarEventsQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { format, parseISO } from "date-fns";

interface ClubDetailModalProps {
  clubId: number;
  onClose: () => void;
  onEnrollmentChange?: (clubId: number, enrolled: boolean) => void;
}

export function ClubDetailModal({ clubId, onClose, onEnrollmentChange }: ClubDetailModalProps) {
  const { data, isLoading } = useGetClub(clubId, {
    query: { queryKey: getGetClubQueryKey(clubId), enabled: !!clubId }
  });
  const enrollMutation = useEnrollInClub();
  const unenrollMutation = useUnenrollFromClub();
  const queryClient = useQueryClient();
  const [confirmUnenroll, setConfirmUnenroll] = useState(false);

  const club = data?.success ? data.club : null;
  const color = club ? getClubColor(club.category) : "var(--primary)";

  const invalidate = (id: number) => {
    queryClient.invalidateQueries({ queryKey: getGetClubsQueryKey() });
    queryClient.invalidateQueries({ queryKey: getGetCalendarEventsQueryKey() });
    queryClient.invalidateQueries({ queryKey: getGetClubQueryKey(id) });
  };

  const handleEnroll = () => {
    if (!club) return;
    enrollMutation.mutate({ id: club.id }, {
      onSuccess: () => {
        toast.success("Joined club");
        invalidate(club.id);
        onEnrollmentChange?.(club.id, true);
      },
      onError: (err) => toast.error(err.message || "Failed to join"),
    });
  };

  const handleUnenroll = () => {
    if (!club) return;
    unenrollMutation.mutate({ id: club.id }, {
      onSuccess: () => {
        toast.success("Left club");
        setConfirmUnenroll(false);
        invalidate(club.id);
        onEnrollmentChange?.(club.id, false);
      },
      onError: (err) => {
        toast.error(err.message || "Failed to leave");
        setConfirmUnenroll(false);
      },
    });
  };

  return (
    <Dialog open={!!clubId} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        className="p-0 overflow-hidden border-none gap-0"
        style={{ maxWidth: 560, borderRadius: "var(--r-lg)", boxShadow: "var(--sh-lg)" }}
      >
        <DialogTitle className="sr-only">{club?.name ?? "Club details"}</DialogTitle>
        <DialogDescription className="sr-only">Details about this club</DialogDescription>

        {isLoading || !club ? (
          <div style={{ height: 320, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-3)", fontSize: 13 }}>
            Loading…
          </div>
        ) : (
          <>
            {/* Header */}
            <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "20px 22px", borderBottom: "1px solid var(--border)" }}>
              <div style={{
                width: 52, height: 52, borderRadius: "var(--r-md)", background: color, color: "#fff",
                display: "grid", placeItems: "center", fontFamily: "var(--font-display)", fontWeight: 800,
                fontSize: 22, flexShrink: 0,
              }}>
                {club.profile_photo ? (
                  <img src={club.profile_photo} alt={club.name} style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "var(--r-md)" }} />
                ) : club.initial}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                  display: "inline-block", fontSize: 10.5, fontWeight: 700, padding: "3px 8px",
                  borderRadius: "var(--r-pill)",
                  background: `color-mix(in oklab, ${color} 16%, var(--surface))`,
                  color: `color-mix(in oklab, ${color} 72%, var(--text))`,
                  border: `1px solid color-mix(in oklab, ${color} 26%, transparent)`,
                  textTransform: "uppercase" as const, letterSpacing: "0.04em",
                  fontFamily: "var(--font-mono)", marginBottom: 5,
                }}>
                  {club.category}
                </div>
                <div style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 20, color: "var(--heading)", letterSpacing: "-0.02em", lineHeight: 1.1 }}>
                  {club.name}
                </div>
              </div>
            </div>

            {/* Body */}
            <div style={{ padding: "22px", maxHeight: "52vh", overflowY: "auto" }}>
              {club.description && (
                <p style={{ fontSize: 14, color: "var(--text-2)", lineHeight: 1.65, marginBottom: 16 }}>
                  {club.description}
                </p>
              )}

              {club.default_day && (
                <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 0", borderBottom: "1px solid var(--border)" }}>
                  <span className="material-symbols-outlined" style={{ color: "var(--text-3)", fontSize: 19 }}>schedule</span>
                  <div>
                    <div style={{ fontFamily: "var(--font-mono)", fontSize: 10.5, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: ".05em" }}>Meets</div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: "var(--text)" }}>{club.default_day}</div>
                  </div>
                </div>
              )}

              {club.default_location && (
                <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 0", borderBottom: "1px solid var(--border)" }}>
                  <span className="material-symbols-outlined" style={{ color: "var(--text-3)", fontSize: 19 }}>location_on</span>
                  <div>
                    <div style={{ fontFamily: "var(--font-mono)", fontSize: 10.5, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: ".05em" }}>Location</div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: "var(--text)" }}>{club.default_location}</div>
                  </div>
                </div>
              )}

              {club.leaders && club.leaders.length > 0 && (
                <div style={{ display: "flex", alignItems: "flex-start", gap: 12, padding: "12px 0", borderBottom: "1px solid var(--border)" }}>
                  <span className="material-symbols-outlined" style={{ color: "var(--text-3)", fontSize: 19 }}>person</span>
                  <div>
                    <div style={{ fontFamily: "var(--font-mono)", fontSize: 10.5, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: ".05em" }}>Led by</div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: "var(--text)" }}>
                      {club.leaders.map(l => l.name).join(" · ")}
                    </div>
                  </div>
                </div>
              )}

              {club.upcoming_events && club.upcoming_events.length > 0 && (
                <div style={{ marginTop: 16 }}>
                  <div style={{ fontFamily: "var(--font-mono)", fontSize: 10.5, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: ".05em", marginBottom: 10 }}>
                    Upcoming events
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {club.upcoming_events.map(event => (
                      <div key={event.id} style={{ background: "var(--surface-2)", borderRadius: "var(--r-sm)", padding: "10px 12px", borderLeft: `3px solid ${color}` }}>
                        <div style={{ fontWeight: 600, fontSize: 13.5, color: "var(--heading)" }}>{event.title}</div>
                        <div style={{ fontSize: 12, color: "var(--text-3)", fontFamily: "var(--font-mono)", marginTop: 3 }}>
                          {format(parseISO(event.event_date), "MMM d")} · {event.event_time} · {event.location}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div style={{ padding: "16px 22px", borderTop: "1px solid var(--border)", display: "flex", gap: 10 }}>
              {club.is_leader ? (
                <div style={{ flex: 1, height: 42, borderRadius: "var(--r-sm)", background: "var(--surface-2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 600, color: "var(--text-3)" }}>
                  You lead this club
                </div>
              ) : club.is_enrolled ? (
                confirmUnenroll ? (
                  <>
                    <button
                      onClick={() => setConfirmUnenroll(false)}
                      style={{ flex: 1, height: 42, borderRadius: "var(--r-sm)", border: "1px solid var(--border-strong)", background: "var(--surface)", color: "var(--text)", fontWeight: 600, fontSize: 13.5, cursor: "pointer", fontFamily: "var(--font-body)" }}
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleUnenroll}
                      disabled={unenrollMutation.isPending}
                      style={{ flex: 1, height: 42, borderRadius: "var(--r-sm)", background: "var(--danger)", border: "none", color: "#fff", fontWeight: 600, fontSize: 13.5, cursor: "pointer", fontFamily: "var(--font-body)" }}
                    >
                      {unenrollMutation.isPending ? "Leaving…" : "Confirm leave"}
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => setConfirmUnenroll(true)}
                      style={{ flex: 1, height: 42, borderRadius: "var(--r-sm)", border: "1px solid color-mix(in oklab, var(--danger) 40%, transparent)", background: "color-mix(in oklab, var(--danger) 8%, var(--surface))", color: "var(--danger)", fontWeight: 600, fontSize: 13.5, cursor: "pointer", fontFamily: "var(--font-body)" }}
                    >
                      Leave club
                    </button>
                    {club.chat_link && (
                      <a
                        href={club.chat_link}
                        target="_blank"
                        rel="noreferrer"
                        style={{ display: "flex", alignItems: "center", gap: 6, height: 42, padding: "0 16px", borderRadius: "var(--r-sm)", border: "1px solid var(--border-strong)", background: "var(--surface)", color: "var(--text-2)", fontWeight: 600, fontSize: 13.5, textDecoration: "none", flexShrink: 0 }}
                      >
                        <span className="material-symbols-outlined" style={{ fontSize: 16 }}>chat</span>
                        Chat
                      </a>
                    )}
                  </>
                )
              ) : (
                <>
                  <button
                    onClick={handleEnroll}
                    disabled={enrollMutation.isPending}
                    style={{ flex: 1, height: 42, borderRadius: "var(--r-sm)", background: "var(--accent)", border: "none", color: "#fff", fontWeight: 700, fontSize: 13.5, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6, fontFamily: "var(--font-body)" }}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: 16 }}>add</span>
                    {enrollMutation.isPending ? "Joining…" : "Join club"}
                  </button>
                  {club.chat_link && (
                    <a
                      href={club.chat_link}
                      target="_blank"
                      rel="noreferrer"
                      style={{ display: "flex", alignItems: "center", gap: 6, height: 42, padding: "0 16px", borderRadius: "var(--r-sm)", border: "1px solid var(--border-strong)", background: "var(--surface)", color: "var(--text-2)", fontWeight: 600, fontSize: 13.5, textDecoration: "none", flexShrink: 0 }}
                    >
                      <span className="material-symbols-outlined" style={{ fontSize: 16 }}>chat</span>
                      Chat
                    </a>
                  )}
                </>
              )}
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
