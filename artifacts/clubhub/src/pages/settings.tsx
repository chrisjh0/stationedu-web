import { useState, useEffect } from "react";
import { useGetUserSettings, useUpdateUserSettings } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useAuth } from "@/components/AuthContext";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { getGetUserSettingsQueryKey } from "@workspace/api-client-react";

export default function SettingsPage() {
  const { user, setUser } = useAuth();
  const { data, isLoading } = useGetUserSettings();
  const updateMutation = useUpdateUserSettings();
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState("Account");
  
  // Form states
  const [fullName, setFullName] = useState("");
  const [notifEmail, setNotifEmail] = useState(true);
  const [notifReminders, setNotifReminders] = useState(true);
  const [notifNewClubs, setNotifNewClubs] = useState(false);
  const [notifChat, setNotifChat] = useState(true);
  const [notifDigest, setNotifDigest] = useState(true);
  const [notifPush, setNotifPush] = useState(false);

  useEffect(() => {
    if (data?.success && data.settings) {
      setFullName(data.settings.full_name);
      setNotifEmail(data.settings.notifications_email);
      setNotifReminders(data.settings.notifications_reminders);
      setNotifNewClubs(data.settings.notifications_new_clubs);
      setNotifChat(data.settings.notifications_chat);
      setNotifDigest(data.settings.notifications_digest);
      setNotifPush(data.settings.notifications_push_mobile);
    }
  }, [data]);

  const handleSave = () => {
    updateMutation.mutate({
      data: {
        full_name: fullName,
        notifications_email: notifEmail,
        notifications_reminders: notifReminders,
        notifications_new_clubs: notifNewClubs,
        notifications_chat: notifChat,
        notifications_digest: notifDigest,
        notifications_push_mobile: notifPush
      }
    }, {
      onSuccess: () => {
        toast.success("Settings saved successfully");
        queryClient.invalidateQueries({ queryKey: getGetUserSettingsQueryKey() });
        if (user) {
          setUser({ ...user, full_name: fullName });
        }
      },
      onError: (err) => {
        toast.error(err.message || "Failed to save settings");
      }
    });
  };

  const tabs = [
    { id: "Account", icon: "person" },
    { id: "Notifications", icon: "notifications" },
    { id: "Privacy", icon: "lock", disabled: true },
    { id: "Appearance", icon: "palette", disabled: true }
  ];

  if (isLoading) {
    return <div className="max-w-5xl mx-auto px-6 py-10 text-center text-secondary">Loading settings...</div>;
  }

  return (
    <div className="max-w-5xl mx-auto px-6 flex flex-col md:flex-row gap-10">
      <div className="w-full md:w-64 flex-shrink-0">
        <h1 className="text-2xl font-semibold mb-6">Settings</h1>
        <nav className="flex flex-col gap-1">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => !tab.disabled && setActiveTab(tab.id)}
              disabled={tab.disabled}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors text-left
                ${activeTab === tab.id ? 'bg-primary/10 text-primary' : tab.disabled ? 'opacity-40 cursor-not-allowed text-secondary' : 'hover:bg-surface-container text-secondary'}`}
            >
              <span className="material-symbols-outlined text-[20px]">{tab.icon}</span>
              {tab.id}
              {tab.disabled && <span className="ml-auto text-[10px] uppercase tracking-wider bg-surface-container px-2 py-0.5 rounded">Soon</span>}
            </button>
          ))}
        </nav>
      </div>

      <div className="flex-grow bg-white rounded-3xl shadow-sm p-8 border border-outline-variant/20">
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
                  value={data?.settings?.email || ""} 
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
              <div className="flex items-center justify-between py-3 border-b border-outline-variant/20">
                <div>
                  <h4 className="font-medium text-on-surface">Email Notifications</h4>
                  <p className="text-sm text-secondary">Receive important updates via email</p>
                </div>
                <Switch checked={notifEmail} onCheckedChange={setNotifEmail} />
              </div>
              <div className="flex items-center justify-between py-3 border-b border-outline-variant/20">
                <div>
                  <h4 className="font-medium text-on-surface">Event Reminders</h4>
                  <p className="text-sm text-secondary">Get notified 24h before an event starts</p>
                </div>
                <Switch checked={notifReminders} onCheckedChange={setNotifReminders} />
              </div>
              <div className="flex items-center justify-between py-3 border-b border-outline-variant/20">
                <div>
                  <h4 className="font-medium text-on-surface">New Clubs</h4>
                  <p className="text-sm text-secondary">Weekly digest of newly formed clubs</p>
                </div>
                <Switch checked={notifNewClubs} onCheckedChange={setNotifNewClubs} />
              </div>
              <div className="flex items-center justify-between py-3 border-b border-outline-variant/20">
                <div>
                  <h4 className="font-medium text-on-surface">Chat Messages</h4>
                  <p className="text-sm text-secondary">Notifications when you are mentioned in club chats</p>
                </div>
                <Switch checked={notifChat} onCheckedChange={setNotifChat} />
              </div>
              <div className="flex items-center justify-between py-3 border-b border-outline-variant/20">
                <div>
                  <h4 className="font-medium text-on-surface">Weekly Digest</h4>
                  <p className="text-sm text-secondary">Summary of all your club activities</p>
                </div>
                <Switch checked={notifDigest} onCheckedChange={setNotifDigest} />
              </div>
              <div className="flex items-center justify-between py-3 border-b border-outline-variant/20">
                <div>
                  <h4 className="font-medium text-on-surface">Push Notifications</h4>
                  <p className="text-sm text-secondary">Receive mobile alerts (requires app installation)</p>
                </div>
                <Switch checked={notifPush} onCheckedChange={setNotifPush} />
              </div>

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
      </div>
    </div>
  );
}
