import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { format, parseISO } from "date-fns";

interface AttendanceRecord {
  user_id: number;
  name: string;
  email: string;
  attended: boolean;
}

interface AttendanceModalProps {
  clubId: number;
  eventId: number;
  eventTitle: string;
  eventDate: string;
  onClose: () => void;
}

export function AttendanceModal({ clubId, eventId, eventTitle, eventDate, onClose }: AttendanceModalProps) {
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const token = localStorage.getItem("clubhub_token");
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true);
    fetch(`/api/clubs/${clubId}/events/${eventId}/attendance`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
      .then(r => r.json())
      .then(json => {
        if (!cancelled && json.success) {
          setRecords(json.attendance);
        }
      })
      .catch(() => { if (!cancelled) toast.error("Failed to load attendance"); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [clubId, eventId]);

  const toggle = (userId: number) => {
    setRecords(prev => prev.map(r => r.user_id === userId ? { ...r, attended: !r.attended } : r));
    setSaved(false);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const token = localStorage.getItem("clubhub_token");
      const res = await fetch(`/api/clubs/${clubId}/events/${eventId}/attendance`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ records: records.map(r => ({ user_id: r.user_id, attended: r.attended })) }),
      });
      const json = await res.json();
      if (json.success) {
        setSaved(true);
        toast.success("Attendance saved");
      } else {
        toast.error(json.error || "Failed to save attendance");
      }
    } catch {
      toast.error("Failed to save attendance");
    } finally {
      setSaving(false);
    }
  };

  const attendedCount = records.filter(r => r.attended).length;

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        className="p-0 overflow-hidden border-none gap-0 modal-fullscreen-mobile"
        style={{ maxWidth: 480, borderRadius: "var(--r-lg)", boxShadow: "var(--sh-lg)" }}
      >
        <DialogTitle className="sr-only">Attendance — {eventTitle}</DialogTitle>

        {/* Header */}
        <div style={{ padding: "18px 22px", borderBottom: "1px solid var(--border)" }}>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: 10.5, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: ".05em", marginBottom: 4 }}>
            Attendance · {format(parseISO(eventDate), "MMM d, yyyy")}
          </div>
          <div style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 18, color: "var(--heading)", letterSpacing: "-0.02em" }}>
            {eventTitle}
          </div>
          {!loading && (
            <div style={{ fontSize: 12.5, color: "var(--text-2)", marginTop: 4 }}>
              {attendedCount} of {records.length} marked present
            </div>
          )}
        </div>

        {/* List */}
        <div style={{ maxHeight: "52vh", overflowY: "auto", padding: "12px 0" }}>
          {loading ? (
            <div style={{ padding: "32px 22px", textAlign: "center", color: "var(--text-3)", fontSize: 13 }}>
              Loading members…
            </div>
          ) : records.length === 0 ? (
            <div style={{ padding: "32px 22px", textAlign: "center", color: "var(--text-3)", fontSize: 13 }}>
              No enrolled members found.
            </div>
          ) : (
            records.map(record => (
              <label
                key={record.user_id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 14,
                  padding: "10px 22px",
                  cursor: "pointer",
                  borderRadius: 0,
                  transition: "background 0.1s",
                }}
                onMouseEnter={e => (e.currentTarget.style.background = "var(--surface-2)")}
                onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
              >
                <input
                  type="checkbox"
                  checked={record.attended}
                  onChange={() => toggle(record.user_id)}
                  style={{ width: 17, height: 17, accentColor: "var(--accent)", cursor: "pointer", flexShrink: 0 }}
                />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13.5, fontWeight: 600, color: "var(--heading)" }}>{record.name}</div>
                  <div style={{ fontSize: 11.5, color: "var(--text-3)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{record.email}</div>
                </div>
                {record.attended && (
                  <span style={{ fontSize: 11, fontWeight: 700, color: "var(--accent)", fontFamily: "var(--font-mono)", letterSpacing: "0.04em", textTransform: "uppercase" }}>
                    Present
                  </span>
                )}
              </label>
            ))
          )}
        </div>

        {/* Footer */}
        {!loading && records.length > 0 && (
          <div style={{ padding: "14px 22px", borderTop: "1px solid var(--border)", display: "flex", gap: 10, justifyContent: "flex-end" }}>
            <button
              onClick={onClose}
              style={{ padding: "8px 18px", borderRadius: "var(--r-sm)", border: "1px solid var(--border-strong)", background: "var(--surface)", color: "var(--text)", fontFamily: "var(--font-body)", fontWeight: 600, fontSize: 13.5, cursor: "pointer" }}
            >
              Close
            </button>
            <button
              onClick={handleSave}
              disabled={saving || saved}
              style={{
                padding: "8px 20px",
                borderRadius: "var(--r-sm)",
                border: "none",
                background: saved ? "var(--cat-stem)" : "var(--accent)",
                color: "#fff",
                fontFamily: "var(--font-body)",
                fontWeight: 700,
                fontSize: 13.5,
                cursor: saving || saved ? "default" : "pointer",
                display: "flex",
                alignItems: "center",
                gap: 6,
                opacity: saving ? 0.7 : 1,
              }}
            >
              {saved ? (
                <>
                  <span className="material-symbols-outlined" style={{ fontSize: 16 }}>check</span>
                  Saved
                </>
              ) : saving ? "Saving…" : "Save attendance"}
            </button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
