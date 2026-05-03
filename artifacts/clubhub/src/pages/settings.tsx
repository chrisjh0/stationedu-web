import { useState } from "react";
import { useGetUserSettings, useUpdateUserSettings } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useAuth } from "@/components/AuthContext";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { getGetUserSettingsQueryKey } from "@workspace/api-client-react";

interface Settings {
  id?: number;
  email: string;
  full_name: string;
  notifications_email: boolean;
  notifications_reminders: boolean;
  notifications_new_clubs: boolean;
  notifications_chat: boolean;
  notifications_digest: boolean;
  notifications_push_mobile: boolean;
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
    return <div className="max-w-5xl mx-auto px-6 py-10 text-center text-secondary">Loading settings...</div>;
  }

  return (
    <div className="max-w-5xl mx-auto px-6 flex flex-col md:flex-row gap-10">
      <div className="w-full md:w-64 flex-shrink-0">
        <h1 className="text-2xl font-bold font-lexend mb-6 text-on-surface">Settings</h1>
        <nav className="flex flex-col gap-1">
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors text-left ${activeTab === tab.id ? "bg-primary text-white" : "hover:bg-surface-container text-secondary"}`}
            >
              <span className="material-symbols-outlined text-[20px]">{tab.icon}</span>
              {tab.id}
            </button>
          ))}
        </nav>
      </div>

      <div className="flex-grow bg-white rounded-3xl shadow-sm p-8 border border-outline-variant/20">
        <SettingsForm
          key={data.settings.email}
          settings={data.settings as Settings}
          activeTab={activeTab}
        />
      </div>
    </div>
  );
}

function SettingsForm({ settings, activeTab }: { settings: Settings; activeTab: string }) {
  const { user, setUser } = useAuth();
  const updateMutation = useUpdateUserSettings();
  const queryClient = useQueryClient();

  const [fullName, setFullName] = useState(settings.full_name);
  const [notifEmail, setNotifEmail] = useState(settings.notifications_email);
  const [notifReminders, setNotifReminders] = useState(settings.notifications_reminders);
  const [notifNewClubs, setNotifNewClubs] = useState(settings.notifications_new_clubs);
  const [notifChat, setNotifChat] = useState(settings.notifications_chat);
  const [notifDigest, setNotifDigest] = useState(settings.notifications_digest);
  const [notifPush, setNotifPush] = useState(settings.notifications_push_mobile);

  const handleSave = () => {
    updateMutation.mutate({
      data: {
        full_name: fullName,
        notifications_email: notifEmail,
        notifications_reminders: notifReminders,
        notifications_new_clubs: notifNewClubs,
        notifications_chat: notifChat,
        notifications_digest: notifDigest,
        notifications_push_mobile: notifPush,
      }
    }, {
      onSuccess: () => {
        toast.success("Settings saved successfully");
        queryClient.invalidateQueries({ queryKey: getGetUserSettingsQueryKey() });
        if (user) setUser({ ...user, full_name: fullName });
      },
      onError: (err) => {
        toast.error(err.message || "Failed to save settings");
      }
    });
  };

  return (
    <>
      {activeTab === "Account" && (
        <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
          <h2 className="text-xl font-semibold mb-6">Account Profile</h2>

          <div className="flex items-center gap-6 mb-8 pb-8 border-b border-outline-variant/20">
            <Avatar className="w-20 h-20 border-2 border-primary/10">
              <AvatarFallback className="bg-primary/10 text-primary text-2xl font-bold">
                {user?.full_name?.charAt(0).toUpperCase() || "U"}
              </AvatarFallback>
            </Avatar>
            <div>
              <Button variant="outline" className="rounded-full text-sm h-9 border-outline-variant text-secondary">Change Avatar</Button>
            </div>
          </div>

          <div className="space-y-6 max-w-md">
            <div className="space-y-2">
              <label className="text-sm font-medium text-secondary">Full Name</label>
              <Input
                value={fullName}
                onChange={e => setFullName(e.target.value)}
                className="h-12 bg-surface-container-lowest rounded-xl focus-visible:ring-primary/20"
              />
            </div>
            <div className="space-y-2 opacity-60">
              <label className="text-sm font-medium text-secondary">Email Address</label>
              <Input
                value={settings.email}
                readOnly
                disabled
                className="h-12 bg-surface-container-low rounded-xl"
              />
              <p className="text-xs text-secondary mt-1">Managed by your school Google account.</p>
            </div>

            <div className="pt-6">
              <Button
                onClick={handleSave}
                disabled={updateMutation.isPending}
                className="bg-primary hover:bg-primary-container text-white rounded-xl px-8 shadow-sm"
              >
                {updateMutation.isPending ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {activeTab === "Notifications" && (
        <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
          <h2 className="text-xl font-semibold mb-2">Notification Preferences</h2>
          <p className="text-secondary text-sm mb-8">Choose how you want to be notified about club activities.</p>

          <div className="space-y-6 max-w-2xl">
            {[
              { label: "Email Notifications", desc: "Receive important updates via email", value: notifEmail, set: setNotifEmail },
              { label: "Event Reminders", desc: "Get notified 24h before an event starts", value: notifReminders, set: setNotifReminders },
              { label: "New Clubs", desc: "Weekly digest of newly formed clubs", value: notifNewClubs, set: setNotifNewClubs },
              { label: "Chat Messages", desc: "Notifications when you are mentioned in club chats", value: notifChat, set: setNotifChat },
              { label: "Weekly Digest", desc: "Summary of all your club activities", value: notifDigest, set: setNotifDigest },
              { label: "Push Notifications", desc: "Receive mobile alerts (requires app installation)", value: notifPush, set: setNotifPush },
            ].map(({ label, desc, value, set }) => (
              <div key={label} className="flex items-center justify-between py-3 border-b border-outline-variant/20">
                <div>
                  <h4 className="font-medium text-on-surface">{label}</h4>
                  <p className="text-sm text-secondary">{desc}</p>
                </div>
                <Switch checked={value} onCheckedChange={set} />
              </div>
            ))}

            <div className="pt-6">
              <Button
                onClick={handleSave}
                disabled={updateMutation.isPending}
                className="bg-primary hover:bg-primary-container text-white rounded-xl px-8 shadow-sm"
              >
                {updateMutation.isPending ? "Saving..." : "Save Preferences"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {activeTab === "Privacy" && (
        <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
          <h2 className="text-xl font-semibold mb-2">Privacy Settings</h2>
          <p className="text-secondary text-sm mb-8">Control who can see your profile and activity.</p>

          <div className="space-y-4 max-w-md mb-8">
            {[
              { label: "Show Profile to Other Students", desc: "Allow club members to see your name and photo" },
              { label: "Show Club Memberships", desc: "Display which clubs you belong to on your public profile" },
              { label: "Allow Direct Messages", desc: "Let other students message you through ClubHub" },
            ].map(({ label, desc }) => (
              <div key={label} className="flex items-center justify-between py-3 border-b border-outline-variant/20">
                <div>
                  <h4 className="font-medium text-on-surface">{label}</h4>
                  <p className="text-sm text-secondary">{desc}</p>
                </div>
                <Switch checked={true} onCheckedChange={() => {}} disabled />
              </div>
            ))}
          </div>

          <div className="flex items-center gap-3 bg-surface-container rounded-2xl p-4 text-sm text-secondary">
            <span className="material-symbols-outlined text-[20px] flex-shrink-0">info</span>
            Fine-grained privacy controls are coming in a future update.
          </div>
        </div>
      )}

      {activeTab === "Appearance" && (
        <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
          <h2 className="text-xl font-semibold mb-2">Appearance</h2>
          <p className="text-secondary text-sm mb-8">Customise how ClubHub looks for you.</p>

          <div className="grid grid-cols-2 gap-4 max-w-md mb-8">
            {[
              { label: "Light", icon: "light_mode", active: true },
              { label: "Dark", icon: "dark_mode", active: false },
              { label: "System", icon: "brightness_auto", active: false },
              { label: "High Contrast", icon: "contrast", active: false },
            ].map(({ label, icon, active }) => (
              <button
                key={label}
                disabled
                className={`flex flex-col items-center justify-center gap-2 p-4 rounded-2xl border-2 transition-all opacity-60 cursor-not-allowed ${active ? "border-primary bg-primary/5" : "border-outline-variant/30 bg-surface-container"}`}
              >
                <span className="material-symbols-outlined text-[28px] text-secondary">{icon}</span>
                <span className="text-sm font-medium text-secondary">{label}</span>
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3 bg-surface-container rounded-2xl p-4 text-sm text-secondary">
            <span className="material-symbols-outlined text-[20px] flex-shrink-0">info</span>
            Theme switching will be available in an upcoming release.
          </div>
        </div>
      )}
    </>
  );
}
