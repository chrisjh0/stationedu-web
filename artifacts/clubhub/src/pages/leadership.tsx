import { useState, useMemo, useEffect } from "react";
import { useGetLeadingClubs, useDeleteClub, getGetLeadingClubsQueryKey, getGetClubsQueryKey } from "@workspace/api-client-react";
import { getClubColor } from "@/lib/color-utils";
import { ClubDetailModal } from "@/components/ClubDetailModal";
import { CreateClubModal } from "@/components/CreateClubModal";
import { EditClubModal } from "@/components/EditClubModal";
import { ManageEventsModal } from "@/components/ManageEventsModal";
import { AttendanceModal } from "@/components/AttendanceModal";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { format, parseISO } from "date-fns";

interface PastEvent {
  id: number;
  title: string;
  event_date: string;
  event_time: string;
  location: string;
}

function ApprovalBadge({ status, note }: { status: string; note?: string | null }) {
  if (status === "approved") return null;
  const isPending = status === "pending";
  return (
    <div
      title={!isPending && note ? `Rejected: ${note}` : undefined}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 4,
        fontSize: 10.5,
        fontWeight: 700,
        padding: "3px 8px",
        borderRadius: "var(--r-pill)",
        background: isPending
          ? "color-mix(in oklab, #BB8E33 18%, var(--surface))"
          : "color-mix(in oklab, var(--danger) 14%, var(--surface))",
        color: isPending ? "#BB8E33" : "var(--danger)",
        border: isPending
          ? "1px solid color-mix(in oklab, #BB8E33 36%, transparent)"
          : "1px solid color-mix(in oklab, var(--danger) 36%, transparent)",
        textTransform: "uppercase",
        letterSpacing: "0.04em",
        whiteSpace: "nowrap",
        cursor: !isPending && note ? "help" : "default",
      }}
    >
      <span className="material-symbols-outlined" style={{ fontSize: 12 }}>
        {isPending ? "schedule" : "cancel"}
      </span>
      {isPending ? "Pending approval" : "Rejected"}
    </div>
  );
}

function PastEventsSection({ clubId }: { clubId: number }) {
  const [events, setEvents] = useState<PastEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [attendanceModal, setAttendanceModal] = useState<{ eventId: number; title: string; date: string } | null>(null);

  useEffect(() => {
    let cancelled = false;
    const token = localStorage.getItem("clubhub_token");
    fetch(`/api/clubs/${clubId}/events/past`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
      .then(r => r.json())
      .then(json => { if (!cancelled && json.success) setEvents(json.events); })
      .catch(() => {})
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [clubId]);

  if (loading || events.length === 0) return null;

  return (
    <div style={{ padding: "14px 18px", borderTop: "1px solid var(--border)", background: "var(--surface-2)" }}>
      <div style={{ fontFamily: "var(--font-mono)", fontSize: 10.5, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--text-3)", marginBottom: 10 }}>
        Past events
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {events.map(event => (
          <div key={event.id} style={{ display: "flex", alignItems: "center", gap: 12, background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--r-sm)", padding: "10px 14px" }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 600, fontSize: 13, color: "var(--heading)" }}>{event.title}</div>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--text-3)", marginTop: 2 }}>
                {format(parseISO(event.event_date), "MMM d")} · {event.event_time} · {event.location}
              </div>
            </div>
            <button
              onClick={() => setAttendanceModal({ eventId: event.id, title: event.title, date: event.event_date })}
              style={{
                display: "flex", alignItems: "center", gap: 5, padding: "5px 11px",
                background: "var(--primary)", border: "none", borderRadius: "var(--r-sm)",
                color: "#fff", fontFamily: "var(--font-body)", fontWeight: 600, fontSize: 12,
                cursor: "pointer", flexShrink: 0,
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: 14 }}>how_to_reg</span>
              Attendance
            </button>
          </div>
        ))}
      </div>
      {attendanceModal && (
        <AttendanceModal
          clubId={clubId}
          eventId={attendanceModal.eventId}
          eventTitle={attendanceModal.title}
          eventDate={attendanceModal.date}
          onClose={() => setAttendanceModal(null)}
        />
      )}
    </div>
  );
}

export default function LeadershipPage() {
  useEffect(() => { document.title = "Leadership Hub — Station"; }, []);
  const { data, isLoading } = useGetLeadingClubs();
  const deleteMutation = useDeleteClub();
  const queryClient = useQueryClient();

  const [selectedClubId, setSelectedClubId] = useState<number | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editClubId, setEditClubId] = useState<number | null>(null);
  const [manageEventsClubId, setManageEventsClubId] = useState<number | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);

  const clubs = useMemo(() => (data?.success ? data.clubs : []), [data]);

  const totalMembers = clubs.reduce((acc, c) => acc + c.member_count, 0);
  const upcomingEvents = clubs.reduce((acc, c) => acc + c.upcoming_events_count, 0);
  const avgAttPct = clubs.reduce((sum, c) => {
    const v = (c as unknown as { avg_attendance_pct: number | null }).avg_attendance_pct;
    return v !== null ? sum + v : sum;
  }, 0);
  const clubsWithAtt = clubs.filter(c => (c as unknown as { avg_attendance_pct: number | null }).avg_attendance_pct !== null).length;
  const avgAttDisplay = clubsWithAtt > 0 ? `${Math.round(avgAttPct / clubsWithAtt)}%` : "—";

  const deleteTargetClub = clubs.find(c => c.id === deleteConfirmId) ?? null;

  const handleDelete = () => {
    if (!deleteConfirmId) return;
    deleteMutation.mutate({ id: deleteConfirmId }, {
      onSuccess: () => {
        toast.success("Club deleted");
        queryClient.invalidateQueries({ queryKey: getGetLeadingClubsQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetClubsQueryKey() });
        setDeleteConfirmId(null);
      },
      onError: err => {
        toast.error(err.message || "Failed to delete club");
        setDeleteConfirmId(null);
      },
    });
  };

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
    <div style={{ maxWidth: 900, margin: "0 auto" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 24, gap: 16 }}>
        <div>
          <h1 style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 30, letterSpacing: "-0.025em", color: "var(--heading)", marginBottom: 4 }}>
            Leadership Hub
          </h1>
          <div style={{ fontSize: 13, color: "var(--text-3)" }}>
            Managing {clubs.length} {clubs.length === 1 ? "club" : "clubs"}
          </div>
        </div>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          style={{
            display: "inline-flex", alignItems: "center", gap: 6,
            padding: "8px 14px", background: "var(--accent)", color: "#fff",
            border: "none", borderRadius: "var(--r-sm)", fontFamily: "var(--font-body)",
            fontWeight: 600, fontSize: 13, cursor: "pointer", flexShrink: 0,
          }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: 16 }}>add</span>
          Create club
        </button>
      </div>

      {/* Stats row */}
      <div className="stat-grid-4" style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14, marginBottom: 24 }}>
        {[
          { lbl: "Clubs Led", num: clubs.length, sub: "as leader or president", c: STAT_COLORS[0] },
          { lbl: "Total Members", num: totalMembers, sub: "across all clubs", c: STAT_COLORS[1] },
          { lbl: "Upcoming Events", num: upcomingEvents, sub: "next 30 days", c: STAT_COLORS[2] },
          { lbl: "Avg. Attendance", num: avgAttDisplay, sub: clubsWithAtt > 0 ? "based on marked events" : "no attendance data yet", c: STAT_COLORS[3] },
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
          Clubs you lead
        </h2>
        <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--text-3)", letterSpacing: "0.06em" }}>
          {clubs.length} CLUBS
        </span>
      </div>

      {isLoading ? (
        <div className="club-grid-2" style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 14 }}>
          {[1, 2].map(i => <div key={i} style={{ height: 180, background: "var(--surface-2)", borderRadius: "var(--r-md)" }} />)}
        </div>
      ) : clubs.length === 0 ? (
        <div style={{
          background: "var(--surface)",
          border: "1px dashed var(--border-strong)",
          borderRadius: "var(--r-md)",
          padding: "48px 24px",
          textAlign: "center",
        }}>
          <span className="material-symbols-outlined" style={{ fontSize: 40, color: "var(--text-3)", display: "block", marginBottom: 12 }}>group_off</span>
          <p style={{ fontWeight: 600, color: "var(--heading)", marginBottom: 6 }}>You're not a leader of any clubs yet</p>
          <p style={{ fontSize: 13, color: "var(--text-3)", marginBottom: 16 }}>Create a new club to get started.</p>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "8px 14px", background: "var(--accent)", color: "#fff", border: "none", borderRadius: "var(--r-sm)", fontFamily: "var(--font-body)", fontWeight: 600, fontSize: 13, cursor: "pointer" }}
          >
            Create club
          </button>
        </div>
      ) : (
        <div className="club-grid-2" style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 14 }}>
          {clubs.map(club => {
            const color = getClubColor(club.category);
            const approvalStatus = (club as unknown as { approval_status: string }).approval_status ?? "approved";
            const rejectionNote = (club as unknown as { rejection_note: string | null }).rejection_note ?? null;
            return (
              <div
                key={club.id}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "stretch",
                  background: "var(--surface)",
                  border: "1px solid var(--border)",
                  borderLeft: `4px solid ${color}`,
                  borderRadius: "var(--r-md)",
                  overflow: "hidden",
                }}
              >
                {/* Approval banner */}
                {approvalStatus !== "approved" && (
                  <div style={{
                    padding: "8px 18px",
                    background: approvalStatus === "pending"
                      ? "color-mix(in oklab, #BB8E33 10%, var(--surface-2))"
                      : "color-mix(in oklab, var(--danger) 8%, var(--surface-2))",
                    borderBottom: "1px solid var(--border)",
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                  }}>
                    <ApprovalBadge status={approvalStatus} note={rejectionNote} />
                    {approvalStatus === "rejected" && rejectionNote && (
                      <span style={{ fontSize: 12, color: "var(--text-2)", flex: 1, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {rejectionNote}
                      </span>
                    )}
                  </div>
                )}

                {/* Card body */}
                <div
                  style={{ display: "flex", gap: 14, alignItems: "flex-start", padding: "16px 18px", cursor: "pointer" }}
                  onClick={() => setSelectedClubId(club.id)}
                >
                  <div style={{ width: 52, height: 52, borderRadius: "var(--r-md)", background: color, color: "#fff", display: "grid", placeItems: "center", fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 22, flexShrink: 0 }}>
                    {club.profile_photo ? (
                      <img src={club.profile_photo} alt={club.name} style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "var(--r-md)" }} />
                    ) : club.initial}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
                      <span style={{ fontWeight: 700, fontSize: 15, color: "var(--heading)" }}>{club.name}</span>
                      <span style={{
                        fontSize: 10.5, fontWeight: 700, padding: "3px 8px",
                        borderRadius: "var(--r-pill)",
                        background: `color-mix(in oklab, ${color} 16%, var(--surface))`,
                        color: `color-mix(in oklab, ${color} 72%, var(--text))`,
                        border: `1px solid color-mix(in oklab, ${color} 26%, transparent)`,
                        textTransform: "uppercase", letterSpacing: "0.04em", whiteSpace: "nowrap",
                      }}>
                        {club.user_role || "President"}
                      </span>
                    </div>
                    <div style={{ fontSize: 12.5, color: "var(--text-2)", margin: "4px 0 10px", overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" as const }}>
                      {club.description}
                    </div>
                    <div style={{ display: "flex", gap: 14 }}>
                      <span style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11.5, fontFamily: "var(--font-mono)", color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.04em" }}>
                        <span className="material-symbols-outlined" style={{ fontSize: 14 }}>group</span>
                        {club.member_count} members
                      </span>
                      <span style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11.5, fontFamily: "var(--font-mono)", color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.04em" }}>
                        <span className="material-symbols-outlined" style={{ fontSize: 14 }}>event</span>
                        {club.upcoming_events_count} events
                      </span>
                      {club.default_day && (
                        <span style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11.5, fontFamily: "var(--font-mono)", color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.04em" }}>
                          <span className="material-symbols-outlined" style={{ fontSize: 14 }}>schedule</span>
                          {club.default_day}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Past events section */}
                <PastEventsSection clubId={club.id} />

                {/* Card footer */}
                <div className="club-action-row" style={{ display: "flex", gap: 8, padding: "12px 18px", borderTop: "1px solid var(--border)", background: "var(--surface-2)" }}>
                  <button
                    onClick={() => setEditClubId(club.id)}
                    style={{ display: "flex", alignItems: "center", gap: 5, padding: "6px 12px", background: "var(--surface)", border: "1px solid var(--border-strong)", borderRadius: "var(--r-sm)", fontFamily: "var(--font-body)", fontWeight: 600, fontSize: 12.5, color: "var(--text-2)", cursor: "pointer" }}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: 15 }}>edit</span>
                    Edit
                  </button>
                  <button
                    onClick={() => setManageEventsClubId(club.id)}
                    style={{ display: "flex", alignItems: "center", gap: 5, padding: "6px 12px", background: "var(--primary)", border: "none", borderRadius: "var(--r-sm)", fontFamily: "var(--font-body)", fontWeight: 600, fontSize: 12.5, color: "#fff", cursor: "pointer" }}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: 15 }}>event</span>
                    Schedule event
                  </button>
                  <button
                    onClick={() => setDeleteConfirmId(club.id)}
                    style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 34, height: 34, background: "none", border: "none", borderRadius: "var(--r-sm)", color: "var(--danger)", cursor: "pointer", marginLeft: "auto" }}
                    aria-label={`Delete ${club.name}`}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: 19 }}>delete</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modals */}
      {selectedClubId && <ClubDetailModal clubId={selectedClubId} onClose={() => setSelectedClubId(null)} />}
      {isCreateModalOpen && (
        <CreateClubModal
          onClose={() => setIsCreateModalOpen(false)}
          onCreated={clubId => { setIsCreateModalOpen(false); setManageEventsClubId(clubId); }}
        />
      )}
      {editClubId && <EditClubModal clubId={editClubId} onClose={() => setEditClubId(null)} />}
      {manageEventsClubId && <ManageEventsModal clubId={manageEventsClubId} onClose={() => setManageEventsClubId(null)} />}

      <Dialog open={!!deleteConfirmId} onOpenChange={open => !open && setDeleteConfirmId(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Club</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete{" "}
              <span className="font-semibold">{deleteTargetClub?.name ?? "this club"}</span>?
              {" "}This cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4 gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setDeleteConfirmId(null)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDelete} disabled={deleteMutation.isPending}>
              {deleteMutation.isPending ? "Deleting..." : "Delete Club"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
