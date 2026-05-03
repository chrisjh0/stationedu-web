import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "./AuthContext";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { useGetLeadingClubs } from "@workspace/api-client-react";

const NAV_LINKS = [
  { href: "/calendar",    label: "Calendar",       icon: "calendar_month" },
  { href: "/clubs",       label: "Your Clubs",      icon: "groups" },
  { href: "/leadership",  label: "Leadership Hub",  icon: "star" },
  { href: "/directory",   label: "Directory",       icon: "explore" },
  { href: "/settings",    label: "Settings",        icon: "settings" },
];

export function NavBar() {
  const [location] = useLocation();
  const { user } = useAuth();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const { data: leadingData } = useGetLeadingClubs();

  if (!user) return null;

  const isLeader = !!(leadingData?.success && leadingData.clubs && leadingData.clubs.length > 0);

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
          <button className="hidden md:flex text-secondary hover:text-foreground w-10 h-10 rounded-full items-center justify-center hover:bg-secondary/10 transition-colors">
            <span className="material-symbols-outlined">notifications</span>
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
    </>
  );
}
