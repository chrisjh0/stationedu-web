import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "./AuthContext";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { useGetLeadingClubs, useGetNotifications, getGetNotificationsQueryKey } from "@workspace/api-client-react";
import { format, parseISO } from "date-fns";

const NAV_LINKS = [
  { href: "/calendar",    label: "Calendar",       icon: "calendar_month" },
  { href: "/clubs",       label: "Your Clubs",      icon: "groups" },
  { href: "/leadership",  label: "Leadership Hub",  icon: "star" },
  { href: "/directory",   label: "Directory",       icon: "explore" },
  { href: "/settings",    label: "Settings",        icon: "settings" },
];

function formatEventTime(t: string): string {
  const [h, m] = t.split(":");
  const hour = parseInt(h, 10);
  const ampm = hour >= 12 ? "PM" : "AM";
  const display = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
  return `${display}:${m} ${ampm}`;
}

export function NavBar() {
  const [location] = useLocation();
  const { user } = useAuth();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [notifDrawerOpen, setNotifDrawerOpen] = useState(false);
  const { data: leadingData } = useGetLeadingClubs();
  const { data: notifData } = useGetNotifications({
    query: { queryKey: getGetNotificationsQueryKey(), refetchInterval: 60_000, staleTime: 30_000 }
  });

  if (!user) return null;

  const isLeader = !!(leadingData?.success && leadingData.clubs && leadingData.clubs.length > 0);
  const notifications = notifData?.success ? notifData.notifications : [];
  const unreadCount = notifData?.success ? notifData.unread_count : 0;

  const desktopLinks = NAV_LINKS.filter(l =>
    l.href !== "/settings" && (l.href !== "/leadership" || isLeader)
  );
  const mobileLinks = NAV_LINKS.filter(l =>
    l.href !== "/leadership" || isLeader
  );

  const closeDrawer = () => setDrawerOpen(false);

  const activeCls = "bg-primary text-white";
  const inactiveCls = "text-secondary hover:bg-secondary/10 hover:text-foreground";
  const activeClsMobile = "bg-primary text-white";
  const inactiveClsMobile = "text-secondary hover:bg-surface-container hover:text-foreground";

  return (
    <>
      <header className="fixed top-6 left-1/2 -translate-x-1/2 w-[90%] max-w-5xl h-16 bg-white/70 backdrop-blur-[20px] rounded-full shadow-sm z-50 flex items-center justify-between px-6">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white font-bold text-xl">
            C
          </div>
          <span className="font-semibold text-lg hidden md:block">ClubHub</span>
        </div>

        <nav className="hidden md:flex items-center gap-1">
          {desktopLinks.map(link => (
            <Link
              key={link.href}
              href={link.href}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${location === link.href ? activeCls : inactiveCls}`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <button
            className="hidden md:flex relative text-secondary hover:text-foreground w-10 h-10 rounded-full items-center justify-center hover:bg-secondary/10 transition-colors"
            onClick={() => setNotifDrawerOpen(true)}
            aria-label="Notifications"
          >
            <span className="material-symbols-outlined">notifications</span>
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white" />
            )}
          </button>

          <button
            className="md:hidden w-10 h-10 rounded-full flex items-center justify-center text-secondary hover:bg-secondary/10 transition-colors"
            onClick={() => setDrawerOpen(true)}
            aria-label="Open menu"
          >
            <span className="material-symbols-outlined">menu</span>
          </button>

          <Link
            href="/settings"
            className="flex items-center gap-2 cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-full"
          >
            <Avatar className="w-9 h-9 border border-outline-variant/30">
              <AvatarFallback className="bg-primary/10 text-primary font-medium text-sm">
                {user.full_name?.charAt(0).toUpperCase() || "U"}
              </AvatarFallback>
            </Avatar>
          </Link>
        </div>
      </header>

      {drawerOpen && (
        <div className="fixed inset-0 z-[200] md:hidden">
          <div
            className="absolute inset-0 bg-black/40 animate-in fade-in duration-200"
            onClick={closeDrawer}
          />

          <div className="absolute right-0 top-0 h-full w-72 bg-white shadow-2xl flex flex-col animate-in slide-in-from-right duration-200">
            <div className="flex items-center justify-between px-6 py-5 border-b border-outline-variant/20">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center text-white font-bold text-base">
                  C
                </div>
                <span className="font-semibold text-lg">ClubHub</span>
              </div>
              <button
                onClick={closeDrawer}
                className="w-9 h-9 rounded-full flex items-center justify-center text-secondary hover:bg-secondary/10 transition-colors"
                aria-label="Close menu"
              >
                <span className="material-symbols-outlined text-[22px]">close</span>
              </button>
            </div>

            <nav className="flex flex-col gap-1 px-3 py-4 flex-grow">
              {mobileLinks.map(link => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={closeDrawer}
                  className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-medium transition-colors ${location === link.href ? activeClsMobile : inactiveClsMobile}`}
                >
                  <span className="material-symbols-outlined text-[20px]">{link.icon}</span>
                  {link.label}
                </Link>
              ))}
            </nav>

            <div className="px-6 py-5 border-t border-outline-variant/20 flex items-center gap-3">
              <Avatar className="w-9 h-9 border border-outline-variant/30">
                <AvatarFallback className="bg-primary/10 text-primary font-medium text-sm">
                  {user.full_name?.charAt(0).toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <p className="text-sm font-medium text-on-surface truncate">{user.full_name}</p>
                <p className="text-xs text-secondary truncate">{user.email}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {notifDrawerOpen && (
        <div className="fixed inset-0 z-[200]">
          <div
            className="absolute inset-0 bg-black/40 animate-in fade-in duration-200"
            onClick={() => setNotifDrawerOpen(false)}
          />
          <div className="absolute right-0 top-0 h-full w-80 bg-white shadow-2xl flex flex-col animate-in slide-in-from-right duration-200">
            <div className="flex items-center justify-between px-6 py-5 border-b border-outline-variant/20">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[20px]">notifications</span>
                <h2 className="font-semibold text-lg">Notifications</h2>
              </div>
              <button
                onClick={() => setNotifDrawerOpen(false)}
                className="w-9 h-9 rounded-full flex items-center justify-center text-secondary hover:bg-secondary/10 transition-colors"
                aria-label="Close notifications"
              >
                <span className="material-symbols-outlined text-[22px]">close</span>
              </button>
            </div>

            <div className="flex-grow overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center px-6 py-12">
                  <span className="material-symbols-outlined text-5xl text-outline-variant mb-4">notifications_none</span>
                  <p className="font-medium text-on-surface mb-1">All caught up!</p>
                  <p className="text-secondary text-sm">No upcoming events in the next 7 days.</p>
                </div>
              ) : (
                <div className="divide-y divide-outline-variant/20">
                  {notifications.map(n => (
                    <div key={n.id} className="px-6 py-4 hover:bg-surface-container transition-colors">
                      <div className="flex items-start gap-3">
                        <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <span className="material-symbols-outlined text-primary text-[18px]">event</span>
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-sm text-on-surface line-clamp-1">{n.title}</p>
                          <p className="text-xs text-secondary font-medium mt-0.5">{n.club_name}</p>
                          <p className="text-xs text-secondary mt-1.5 flex items-center gap-1">
                            <span className="material-symbols-outlined text-[12px]">calendar_month</span>
                            {format(parseISO(n.event_date), "EEE, MMM d")} · {formatEventTime(n.event_time)}
                          </p>
                          <p className="text-xs text-secondary mt-0.5 flex items-center gap-1">
                            <span className="material-symbols-outlined text-[12px]">location_on</span>
                            {n.location}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="px-6 py-4 border-t border-outline-variant/20 bg-surface-container/50">
              <p className="text-xs text-secondary text-center">Upcoming events in the next 7 days</p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
