import { useRef, useState } from "react";
import { useGetUserSettings, useUpdateUserSettings, getGetUserSettingsQueryKey } from "@workspace/api-client-react";
import { useAuth } from "@/components/AuthContext";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

const API_BASE = (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/+$/, "") ?? "";

interface Settings {
  email: string;
  full_name: string;
  profile_photo?: string;
  notifications_email: boolean;
  notifications_reminders: boolean;
  notifications_new_clubs: boolean;
  notifications_chat: boolean;
  notifications_digest: boolean;
  notifications_push_mobile: boolean;
  privacy_show_profile: boolean;
  privacy_show_memberships: boolean;
  privacy_allow_dms: boolean;
}

const TABS = [
  { id: "Account",       icon: "person" },
  { id: "Notifications", icon: "notifications" },
  { id: "Privacy",       icon: "lock" },
  { id: "Appearance",    icon: "palette" },
];

export default function SettingsPage() {
  const { data, isLoading } = useGetUserSettings();
  const [activeTab, setActiveTab] = useState("Account");

  if (isLoading || !data?.settings) {
    return (
      <div style={{ maxWidth: 900, margin: "0 auto" }}>
        <div style={{ height: 36, background: "var(--surface-2)", borderRadius: "var(--r-sm)", width: 160, marginBottom: 8 }} />
        <div style={{ height: 16, background: "var(--surface-2)", borderRadius: "var(--r-sm)", width: 260, marginBottom: 28 }} />
        <div style={{ height: 400, background: "var(--surface)", borderRadius: "var(--r-md)", border: "1px solid var(--border)" }} />
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 900, margin: "0 auto" }}>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 30, letterSpacing: "-0.025em", color: "var(--heading)", marginBottom: 4 }}>
          Settings
        </h1>
        <div style={{ fontSize: 13, color: "var(--text-3)" }}>Account &amp; preferences</div>
      </div>

      {/* Settings card */}
      <div style={{
        display: "flex",
        background: "var(--surface)",
        border: "1px solid var(--border)",
        borderRadius: "var(--r-md)",
        overflow: "hidden",
        boxShadow: "var(--sh-sm)",
      }}>
        {/* Left rail */}
        <div style={{
          width: 200,
          flexShrink: 0,
          borderRight: "1px solid var(--border)",
          padding: 14,
          background: "var(--surface-2)",
        }}>
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                width: "100%",
                padding: "10px 12px",
                borderRadius: "var(--r-sm)",
                border: "none",
                background: activeTab === tab.id ? "var(--surface)" : "transparent",
                color: activeTab === tab.id ? "var(--primary)" : "var(--text-2)",
                fontWeight: 600,
                fontSize: 13.5,
                cursor: "pointer",
                textAlign: "left",
                boxShadow: activeTab === tab.id ? "var(--sh-sm)" : "none",
                marginBottom: 2,
                fontFamily: "var(--font-body)",
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: 18 }}>{tab.icon}</span>
              {tab.id}
            </button>
          ))}
        </div>

        {/* Right content */}
        <div style={{ flex: 1, padding: "28px 32px" }}>
          <SettingsForm settings={data.settings as Settings} activeTab={activeTab} />
        </div>
      </div>
    </div>
  );
}

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      style={{
        width: 42,
        height: 24,
        borderRadius: 999,
        background: checked ? "var(--accent)" : "var(--border-strong)",
        border: "none",
        cursor: "pointer",
        position: "relative",
        flexShrink: 0,
        transition: "background 0.16s",
      }}
    >
      <span style={{
        position: "absolute",
        top: 3,
        left: checked ? 21 : 3,
        width: 18,
        height: 18,
        borderRadius: "50%",
        background: "#fff",
        boxShadow: "var(--sh-sm)",
        transition: "left 0.16s",
      }} />
    </button>
  );
}

function SettingsForm({ settings, activeTab }: { settings: Settings; activeTab: string }) {
  const { user, setUser } = useAuth();
  const updateMutation = useUpdateUserSettings();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [avatarUrl, setAvatarUrl] = useState(settings.profile_photo ?? "");
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [fullName, setFullName] = useState(settings.full_name);
  const [notifEmail, setNotifEmail] = useState(settings.notifications_email);
  const [notifReminders, setNotifReminders] = useState(settings.notifications_reminders);
  const [notifNewClubs, setNotifNewClubs] = useState(settings.notifications_new_clubs);
  const [privacyShowProfile, setPrivacyShowProfile] = useState(settings.privacy_show_profile ?? true);
  const [privacyShowMemberships, setPrivacyShowMemberships] = useState(settings.privacy_show_memberships ?? true);
  const [privacyAllowDms, setPrivacyAllowDms] = useState(settings.privacy_allow_dms ?? true);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarUploading(true);
    try {
      const token = localStorage.getItem("clubhub_token");
      const formData = new FormData();
      formData.append("file", file);
      const base = API_BASE || "";
      const res = await fetch(`${base}/api/storage/uploads`, {
        method: "POST",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: formData,
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({})) as { error?: string };
        throw new Error(body.error ?? "Upload failed");
      }
      const { url } = await res.json() as { url: string };
      setAvatarUrl(url);
      updateMutation.mutate({ data: { profile_photo: url } }, {
        onSuccess: () => {
          toast.success("Avatar updated");
          queryClient.invalidateQueries({ queryKey: getGetUserSettingsQueryKey() });
          if (user) setUser({ ...user, profile_photo: url });
        },
        onError: err => toast.error(err.message || "Failed to save avatar"),
      });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setAvatarUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleSave = () => {
    updateMutation.mutate({
      data: {
        full_name: fullName,
        notifications_email: notifEmail,
        notifications_reminders: notifReminders,
        notifications_new_clubs: notifNewClubs,
        privacy_show_profile: privacyShowProfile,
        privacy_show_memberships: privacyShowMemberships,
        privacy_allow_dms: privacyAllowDms,
      }
    }, {
      onSuccess: () => {
        toast.success("Settings saved");
        queryClient.invalidateQueries({ queryKey: getGetUserSettingsQueryKey() });
        if (user) setUser({ ...user, full_name: fullName });
      },
      onError: err => toast.error(err.message || "Failed to save"),
    });
  };

  const fieldLabel: React.CSSProperties = {
    fontFamily: "var(--font-mono)",
    fontSize: 11,
    letterSpacing: "0.05em",
    textTransform: "uppercase",
    color: "var(--text-3)",
    display: "block",
    marginBottom: 7,
  };

  const fieldInput: React.CSSProperties = {
    width: "100%",
    height: 42,
    padding: "0 13px",
    borderRadius: "var(--r-md)",
    border: "1px solid var(--border-strong)",
    background: "var(--surface)",
    color: "var(--text)",
    fontFamily: "var(--font-body)",
    fontSize: 14,
    outline: "none",
  };

  const saveBtn: React.CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    padding: "8px 18px",
    background: "var(--accent)",
    color: "#fff",
    border: "none",
    borderRadius: "var(--r-sm)",
    fontFamily: "var(--font-body)",
    fontWeight: 600,
    fontSize: 13.5,
    cursor: "pointer",
  };

  return (
    <>
      {activeTab === "Account" && (
        <>
          <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 19, marginBottom: 20, color: "var(--heading)" }}>
            Account profile
          </h2>

          {/* Avatar */}
          <div style={{ display: "flex", alignItems: "center", gap: 16, paddingBottom: 22, borderBottom: "1px solid var(--border)", marginBottom: 22 }}>
            <div style={{ width: 64, height: 64, borderRadius: "var(--r-md)", background: "var(--primary)", color: "#fff", display: "grid", placeItems: "center", fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 26, flexShrink: 0, overflow: "hidden" }}>
              {avatarUrl ? (
                <img src={avatarUrl} alt={user?.full_name ?? "Avatar"} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              ) : (user?.full_name?.charAt(0).toUpperCase() ?? "U")}
            </div>
            <div>
              <input ref={fileInputRef} type="file" accept=".jpg,.jpeg,.png" className="hidden" onChange={handleAvatarUpload} />
              <button
                style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "6px 12px", background: "var(--surface-2)", border: "1px solid var(--border-strong)", borderRadius: "var(--r-sm)", fontFamily: "var(--font-body)", fontWeight: 600, fontSize: 13, color: "var(--text-2)", cursor: "pointer" }}
                disabled={avatarUploading}
                onClick={() => fileInputRef.current?.click()}
              >
                {avatarUploading ? "Uploading..." : "Change avatar"}
              </button>
              <p style={{ marginTop: 6, fontSize: 12, color: "var(--text-3)" }}>JPG or PNG, max 800 KB</p>
            </div>
          </div>

          {/* Fields */}
          <div style={{ maxWidth: 420, display: "flex", flexDirection: "column", gap: 18 }}>
            <div>
              <label style={fieldLabel}>Full name</label>
              <input style={fieldInput} value={fullName} onChange={e => setFullName(e.target.value)} />
            </div>
            <div>
              <label style={fieldLabel}>Email address</label>
              <input style={{ ...fieldInput, background: "var(--surface-2)", color: "var(--text-3)" }} value={settings.email} disabled />
            </div>

            {/* Quick notifications */}
            <div style={{ marginTop: 6 }}>
              <h3 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 14, color: "var(--heading)", marginBottom: 10 }}>
                Quick notifications
              </h3>
              {[
                { lbl: "Email notifications", v: notifEmail, set: setNotifEmail },
                { lbl: "Event reminders", v: notifReminders, set: setNotifReminders },
                { lbl: "New clubs digest", v: notifNewClubs, set: setNotifNewClubs },
              ].map(({ lbl, v, set }) => (
                <div key={lbl} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid var(--border)" }}>
                  <span style={{ fontSize: 14, fontWeight: 600, color: "var(--text)" }}>{lbl}</span>
                  <Toggle checked={v} onChange={set} />
                </div>
              ))}
            </div>

            <div style={{ paddingTop: 4 }}>
              <button style={saveBtn} onClick={handleSave} disabled={updateMutation.isPending}>
                {updateMutation.isPending ? "Saving..." : "Save changes"}
              </button>
            </div>
          </div>
        </>
      )}

      {activeTab === "Notifications" && (
        <>
          <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 19, marginBottom: 6, color: "var(--heading)" }}>
            Notification preferences
          </h2>
          <p style={{ fontSize: 13, color: "var(--text-3)", marginBottom: 24 }}>Choose how you want to be notified about club activities.</p>

          <div style={{ maxWidth: 480, display: "flex", flexDirection: "column" }}>
            {[
              { lbl: "Email Notifications", desc: "Receive important updates via email", v: notifEmail, set: setNotifEmail },
              { lbl: "Event Reminders", desc: "Get notified 24h before an event starts", v: notifReminders, set: setNotifReminders },
              { lbl: "New Clubs Digest", desc: "Weekly digest of newly formed clubs", v: notifNewClubs, set: setNotifNewClubs },
            ].map(({ lbl, desc, v, set }) => (
              <div key={lbl} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 0", borderBottom: "1px solid var(--border)" }}>
                <div>
                  <div style={{ fontWeight: 600, color: "var(--text)", fontSize: 14 }}>{lbl}</div>
                  <div style={{ fontSize: 12.5, color: "var(--text-3)", marginTop: 2 }}>{desc}</div>
                </div>
                <Toggle checked={v} onChange={set} />
              </div>
            ))}
            <div style={{ paddingTop: 20 }}>
              <button style={saveBtn} onClick={handleSave} disabled={updateMutation.isPending}>
                {updateMutation.isPending ? "Saving..." : "Save preferences"}
              </button>
            </div>
          </div>
        </>
      )}

      {activeTab === "Privacy" && (
        <>
          <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 19, marginBottom: 6, color: "var(--heading)" }}>
            Privacy settings
          </h2>
          <p style={{ fontSize: 13, color: "var(--text-3)", marginBottom: 24 }}>Control who can see your profile and activity.</p>

          <div style={{ maxWidth: 480, display: "flex", flexDirection: "column" }}>
            {[
              { lbl: "Show Profile to Other Students", desc: "Allow club members to see your name and photo", v: privacyShowProfile, set: setPrivacyShowProfile },
              { lbl: "Show Club Memberships", desc: "Display which clubs you belong to on your profile", v: privacyShowMemberships, set: setPrivacyShowMemberships },
              { lbl: "Allow Direct Messages", desc: "Let other students message you through Station", v: privacyAllowDms, set: setPrivacyAllowDms },
            ].map(({ lbl, desc, v, set }) => (
              <div key={lbl} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 0", borderBottom: "1px solid var(--border)" }}>
                <div>
                  <div style={{ fontWeight: 600, color: "var(--text)", fontSize: 14 }}>{lbl}</div>
                  <div style={{ fontSize: 12.5, color: "var(--text-3)", marginTop: 2 }}>{desc}</div>
                </div>
                <Toggle checked={v} onChange={set} />
              </div>
            ))}
            <div style={{ paddingTop: 20 }}>
              <button style={saveBtn} onClick={handleSave} disabled={updateMutation.isPending}>
                {updateMutation.isPending ? "Saving..." : "Save preferences"}
              </button>
            </div>
          </div>
        </>
      )}

      {activeTab === "Appearance" && (
        <>
          <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 19, marginBottom: 6, color: "var(--heading)" }}>
            Appearance
          </h2>
          <p style={{ fontSize: 13, color: "var(--text-3)", marginBottom: 24 }}>Customise how Station looks for you.</p>

          <div style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            background: "var(--surface-2)",
            border: "1px solid var(--border)",
            borderRadius: "var(--r-md)",
            padding: "16px 20px",
            fontSize: 13,
            color: "var(--text-3)",
          }}>
            <span className="material-symbols-outlined" style={{ fontSize: 20, flexShrink: 0 }}>info</span>
            Theme switching is a placeholder — not yet implemented. Add to a future sprint.
          </div>
        </>
      )}
    </>
  );
}
