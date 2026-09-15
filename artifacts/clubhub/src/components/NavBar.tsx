// TODO: Mobile sidebar / hamburger menu not yet implemented — build this when starting mobile responsive pass
import { Link, useLocation } from "wouter";
import { useAuth } from "./AuthContext";
import { useGetClubs, getGetClubsQueryKey, useGetNotifications, getGetNotificationsQueryKey } from "@workspace/api-client-react";

function StationMark({ size = 28 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="168 161.5 473 473" aria-hidden="true" style={{ flexShrink: 0 }}>
      <path
        fillRule="evenodd"
        d="M193,461 a131,131 0 1,0 262,0 a131,131 0 1,0 -262,0 Z M354,461 a131,131 0 1,0 262,0 a131,131 0 1,0 -262,0 Z"
        fill="#ffffff"
      />
      <circle cx="405" cy="263" r="58.5" fill="#DD5E54" />
    </svg>
  );
}

export function NavBar() {
  const [location] = useLocation();
  const { user } = useAuth();

  const { data: clubsData } = useGetClubs({ limit: 200 }, {
    query: { queryKey: getGetClubsQueryKey({ limit: 200 }), staleTime: 60_000 }
  });
  const { data: notifData } = useGetNotifications({
    query: { queryKey: getGetNotificationsQueryKey(), staleTime: 30_000 }
  });

  if (!user) return null;

  const clubs = clubsData?.success ? clubsData.clubs : [];
  const enrolledCount = clubs.filter(c => c.is_enrolled).length;
  const totalCount = clubs.length;
  const unreadCount = notifData?.success ? notifData.unread_count : 0;

  const links: Array<{ href: string; label: string; icon: string; badge?: number | null; adminOnly?: boolean }> = [
    { href: "/calendar",    label: "Calendar",       icon: "calendar_month" },
    { href: "/clubs",       label: "Your Clubs",     icon: "groups",           badge: enrolledCount || null },
    { href: "/directory",   label: "Directory",      icon: "explore",          badge: totalCount || null },
    { href: "/leadership",  label: "Leadership Hub", icon: "workspace_premium" },
    { href: "/admin",       label: "Admin",          icon: "insights",         adminOnly: true },
    { href: "/settings",    label: "Settings",       icon: "settings" },
  ];

  const visibleLinks = links.filter(l => !l.adminOnly || user.is_admin);

  const initial = user.full_name?.charAt(0).toUpperCase() || "?";

  return (
    <>
      {/* Desktop sidebar */}
      <aside
        className="hidden md:flex"
        style={{
          position: "fixed",
          left: 0,
          top: 0,
          bottom: 0,
          width: 180,
          background: "var(--primary)",
          flexDirection: "column",
          padding: "20px 14px",
          zIndex: 100,
        }}
      >
        {/* Brand */}
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          fontFamily: "var(--font-display)",
          fontWeight: 700,
          fontSize: 17,
          color: "#fff",
          letterSpacing: "-0.02em",
          padding: "6px 8px 18px",
        }}>
          <StationMark size={26} />
          Station
        </div>

        {/* School context label */}
        <div style={{
          fontFamily: "var(--font-mono)",
          fontSize: 10,
          letterSpacing: "0.14em",
          textTransform: "uppercase",
          color: "rgba(255,255,255,0.55)",
          padding: "0 10px 12px",
        }}>
          Athenian School
        </div>

        {/* Nav links */}
        <nav style={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {visibleLinks.map(link => {
            const isActive = location === link.href || (link.href !== "/" && location.startsWith(link.href));
            return (
              <Link key={link.href} href={link.href}>
                <a
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    padding: "10px 14px",
                    borderRadius: "var(--r-md)",
                    color: isActive ? "#fff" : "rgba(255,255,255,0.72)",
                    fontWeight: 600,
                    fontSize: 13,
                    fontFamily: "var(--font-body)",
                    position: "relative",
                    cursor: "pointer",
                    textDecoration: "none",
                    background: isActive ? "rgba(255,255,255,0.13)" : "transparent",
                    transition: "background 0.14s, color 0.14s",
                  }}
                  onMouseEnter={e => { if (!isActive) (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.08)"; (e.currentTarget as HTMLElement).style.color = "#fff"; }}
                  onMouseLeave={e => { if (!isActive) (e.currentTarget as HTMLElement).style.background = "transparent"; (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.72)"; }}
                >
                  {isActive && (
                    <span style={{
                      position: "absolute",
                      left: -14,
                      top: 9,
                      bottom: 9,
                      width: 4,
                      borderRadius: "0 3px 3px 0",
                      background: "var(--accent)",
                    }} />
                  )}
                  <span className="material-symbols-outlined" style={{ fontSize: 19 }}>{link.icon}</span>
                  <span style={{ flex: 1 }}>{link.label}</span>
                  {link.badge != null && link.badge > 0 && (
                    <span style={{
                      fontSize: 11,
                      fontWeight: 700,
                      background: "rgba(255,255,255,0.16)",
                      borderRadius: 999,
                      padding: "2px 7px",
                      fontFamily: "var(--font-mono)",
                    }}>
                      {link.badge}
                    </span>
                  )}
                  {link.href === "/clubs" && unreadCount > 0 && (
                    <span style={{
                      width: 7, height: 7, borderRadius: "50%",
                      background: "var(--accent)",
                      position: "absolute",
                      right: 12, top: 10,
                    }} />
                  )}
                </a>
              </Link>
            );
          })}
        </nav>

        {/* Footer: user info */}
        <div style={{
          marginTop: "auto",
          display: "flex",
          alignItems: "center",
          gap: 10,
          padding: "12px 10px",
          borderTop: "1px solid rgba(255,255,255,0.12)",
        }}>
          <div style={{
            width: 34,
            height: 34,
            borderRadius: 9,
            background: "rgba(255,255,255,0.14)",
            display: "grid",
            placeItems: "center",
            fontWeight: 700,
            fontSize: 14,
            color: "#fff",
            flexShrink: 0,
          }}>
            {user.profile_photo ? (
              <img
                src={user.profile_photo}
                alt={user.full_name ?? "Avatar"}
                style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: 9 }}
              />
            ) : initial}
          </div>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: "#fff", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              {user.full_name}
            </div>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              {user.email}
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
