import { useState } from "react";
import { useGetClub, useGetClubEvents, useCreateClubEvent, useDeleteEvent, getGetClubQueryKey } from "@workspace/api-client-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { useQueryClient } from "@tanstack/react-query";
import { getGetClubEventsQueryKey, getGetCalendarEventsQueryKey, getGetLeadingClubsQueryKey } from "@workspace/api-client-react";
import { toast } from "sonner";
import { format, parseISO } from "date-fns";
import { getClubColor } from "@/lib/color-utils";

export function ManageEventsModal({ clubId, onClose }: { clubId: number; onClose: () => void }) {
  const { data: clubData } = useGetClub(clubId, { query: { queryKey: getGetClubQueryKey(clubId) } });
  const { data, isLoading } = useGetClubEvents(clubId);
  const createMutation = useCreateClubEvent();
  const deleteMutation = useDeleteEvent();
  const queryClient = useQueryClient();

  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [location, setLocation] = useState("");

  const club = clubData?.success ? clubData.club : null;
  const color = club ? getClubColor(club.category) : "var(--primary)";
  const events = data?.success ? data.events : [];

  const invalidateEvents = () => {
    queryClient.invalidateQueries({ queryKey: getGetClubEventsQueryKey(clubId) });
    queryClient.invalidateQueries({ queryKey: getGetCalendarEventsQueryKey() });
    queryClient.invalidateQueries({ queryKey: getGetLeadingClubsQueryKey() });
  };

  const handleAdd = () => {
    if (!title || !date || !time || !location) {
      toast.error("Please fill all required fields");
      return;
    }
    createMutation.mutate(
      { id: clubId, data: { title, event_date: date, event_time: time, location, ...(endTime ? { end_time: endTime } : {}) } as Parameters<typeof createMutation.mutate>[0]["data"] },
      {
        onSuccess: () => {
          toast.success("Event added");
          invalidateEvents();
          setTitle(""); setDate(""); setTime(""); setEndTime(""); setLocation("");
        },
        onError: (err) => toast.error(err.message || "Failed to add event"),
      }
    );
  };

  const handleDelete = (eventId: number) => {
    deleteMutation.mutate({ id: eventId }, {
      onSuccess: () => { toast.success("Event deleted"); invalidateEvents(); },
      onError: (err) => toast.error(err.message || "Failed to delete event"),
    });
  };

  const inputStyle: React.CSSProperties = {
    width: "100%", height: 38, padding: "0 12px",
    borderRadius: "var(--r-sm)", border: "1px solid var(--border-strong)",
    background: "var(--surface)", color: "var(--text)",
    fontFamily: "var(--font-body)", fontSize: 13.5, outline: "none",
    boxSizing: "border-box",
  };

  const labelStyle: React.CSSProperties = {
    display: "block", fontFamily: "var(--font-mono)", fontSize: 10.5,
    letterSpacing: ".05em", textTransform: "uppercase",
    color: "var(--text-3)", marginBottom: 6,
  };

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        className="p-0 overflow-hidden border-none gap-0 modal-fullscreen-mobile"
        style={{ maxWidth: 600, maxHeight: "88vh", display: "flex", flexDirection: "column", borderRadius: "var(--r-lg)", boxShadow: "var(--sh-lg)" }}
      >
        <DialogTitle className="sr-only">Schedule an event</DialogTitle>

        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "18px 22px", borderBottom: "1px solid var(--border)", flexShrink: 0 }}>
          <div style={{ width: 44, height: 44, borderRadius: "var(--r-md)", background: color, color: "#fff", display: "grid", placeItems: "center", fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 18, flexShrink: 0 }}>
            {club?.profile_photo ? (
              <img src={club.profile_photo} alt={club.name} style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "var(--r-md)" }} />
            ) : (club?.initial ?? "?")}
          </div>
          <div>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: 10.5, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: ".05em" }}>
              {club?.name ?? "Club"}
            </div>
            <div style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 18, color: "var(--heading)", letterSpacing: "-0.02em" }}>
              Schedule an event
            </div>
          </div>
        </div>

        {/* Form */}
        <div style={{ padding: "20px 22px", borderBottom: "1px solid var(--border)", flexShrink: 0, background: "var(--surface-2)" }}>
          <div style={{ marginBottom: 12 }}>
            <label style={labelStyle}>Event Title</label>
            <input style={inputStyle} value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. General Meeting" />
          </div>
          <div className="event-form-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 10, marginBottom: 14 }}>
            <div>
              <label style={labelStyle}>Date</label>
              <input type="date" style={inputStyle} value={date} onChange={e => setDate(e.target.value)} />
            </div>
            <div>
              <label style={labelStyle}>Start time</label>
              <input type="time" style={inputStyle} value={time} onChange={e => setTime(e.target.value)} />
            </div>
            <div>
              <label style={labelStyle}>End time</label>
              <input type="time" style={inputStyle} value={endTime} onChange={e => setEndTime(e.target.value)} />
            </div>
            <div>
              <label style={labelStyle}>Location</label>
              <input style={inputStyle} value={location} onChange={e => setLocation(e.target.value)} placeholder="Room 101" />
            </div>
          </div>
          <button
            onClick={handleAdd}
            disabled={createMutation.isPending}
            style={{ width: "100%", height: 42, borderRadius: "var(--r-sm)", background: "var(--accent)", border: "none", color: "#fff", fontWeight: 700, fontSize: 13.5, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6, fontFamily: "var(--font-body)" }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: 16 }}>add</span>
            {createMutation.isPending ? "Adding…" : "Add event"}
          </button>
        </div>

        {/* Upcoming events */}
        <div style={{ flex: 1, overflowY: "auto", padding: "18px 22px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
            <span style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 15, color: "var(--heading)" }}>
              Upcoming events
            </span>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: "var(--r-pill)", background: "var(--surface-2)", color: "var(--text-3)", border: "1px solid var(--border)" }}>
              {events.length}
            </span>
          </div>

          {isLoading ? (
            <div style={{ color: "var(--text-3)", fontSize: 13 }}>Loading events…</div>
          ) : events.length === 0 ? (
            <div style={{ textAlign: "center", padding: "32px 20px", border: "1px dashed var(--border-strong)", borderRadius: "var(--r-md)", color: "var(--text-3)", fontSize: 13 }}>
              <span className="material-symbols-outlined" style={{ fontSize: 32, display: "block", marginBottom: 8 }}>event_busy</span>
              No upcoming events scheduled.
            </div>
          ) : (
            <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--r-md)", overflow: "hidden" }}>
              {events.map((event, i) => (
                <div key={event.id} style={{ display: "flex", alignItems: "center", gap: 14, padding: "12px 16px", borderBottom: i < events.length - 1 ? "1px solid var(--border)" : "none" }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: 13.5, color: "var(--heading)" }}>{event.title}</div>
                    <div style={{ fontFamily: "var(--font-mono)", fontSize: 11.5, color: "var(--text-3)", marginTop: 2 }}>
                      {format(parseISO(event.event_date), "MMM d")} · {event.event_time} · {event.location}
                    </div>
                  </div>
                  <button
                    onClick={() => handleDelete(event.id)}
                    disabled={deleteMutation.isPending}
                    aria-label="Delete event"
                    style={{ width: 32, height: 32, borderRadius: "var(--r-sm)", border: "none", background: "none", color: "var(--danger)", cursor: "pointer", display: "grid", placeItems: "center", flexShrink: 0 }}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: 18 }}>delete</span>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
