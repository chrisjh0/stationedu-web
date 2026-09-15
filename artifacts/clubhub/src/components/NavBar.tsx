import { useState, useEffect, useRef } from "react";
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

interface NavLinkDef {
  href: string;
  label: string;
  icon: string;
  badge?: number | null;
  adminOnly?: boolean;
}

const PAGE_NAMES: Record<string, string> = {
  "/calendar":   "Calendar",
  "/clubs":      "Your Clubs",
  "/directory":  "Directory",
  "/leadership": "Leadership Hub",
  "/admin":      "Admin",
  "/settings":   "Settings",
};

const TOPBAR_SHADOW = "0 1px 4px rgba(18,23,38,0.18), 0 4px 16px rgba(18,23,38,0.14)";
const DRAWER_SHADOW = "4px 0 24px rgba(18,23,38,0.28)";

const TAP_STYLE = { WebkitTapHighlightColor: "transparent" as const };

export function NavBar() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [location] = useLocation();
  const { user } = useAuth();
  const drawerRef = useRef<HTMLDivElement>(null);

  const { data: clubsData } = useGetClubs({ limit: 200 }, {
    query: { queryKey: getGetClubsQueryKey({ limit: 200 }), staleTime: 60_000 }
  });
  const { data: notifData } = useGetNotifications({
    query: { queryKey: getGetNotificationsQueryKey(), staleTime: 30_000 }
  });

  // Close drawer when route changes
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { setDrawerOpen(false); }, [location]);

  // Body scroll lock while drawer is open
  useEffect(() => {
    document.body.style.overflow = drawerOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [drawerOpen]);

  // Escape key + focus trap
  useEffect(() => {
    if (!drawerOpen || !drawerRef.current) return;
    const el = drawerRef.current;
    const focusables = Array.from(
      el.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'
      )
    );
    focusables[0]?.focus();

    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setDrawerOpen(false);
        return;
      }
      if (e.key === "Tab") {
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        if (!first || !last) return;
        if (e.shiftKey) {
          if (document.activeElement === first) { e.preventDefault(); last.focus(); }
        } else {
          if (document.activeElement === last) { e.preventDefault(); first.focus(); }
        }
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [drawerOpen]);

  if (!user) return null;

  const clubs = clubsData?.success ? clubsData.clubs : [];
  const enrolledCount = clubs.filter(c => c.is_enrolled).length;
  const totalCount = clubs.length;
  const unreadCount = notifData?.success ? notifData.unread_count : 0;
  const initial = user.full_name?.charAt(0).toUpperCase() || "?";

  const links: NavLinkDef[] = [
    { href: "/calendar",   label: "Calendar",       icon: "calendar_month" },
    { href: "/clubs",      label: "Your Clubs",     icon: "groups",           badge: enrolledCount || null },
    { href: "/directory",  label: "Directory",      icon: "explore",          badge: totalCount || null },
    { href: "/leadership", label: "Leadership Hub", icon: "workspace_premium" },
    { href: "/admin",      label: "Admin",          icon: "insights",         adminOnly: true },
    { href: "/settings",   label: "Settings",       icon: "settings" },
  ];

  const visibleLinks = links.filter(l => !l.adminOnly || user.is_admin);

  const pageName = Object.entries(PAGE_NAMES).find(
    ([href]) => href !== "/" && location.startsWith(href)
  )?.[1] ?? "Station";

  // Reusable link renderer (not a React component to avoid re-mount issues)
  const renderLink = (link: NavLinkDef, onClick?: () => void) => {
    const isActive = location === link.href || (link.href !== "/" && location.startsWith(link.href));
    return (
      <Link key={link.href} href={link.href}>
        <a
          onClick={onClick}
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
            minHeight: 44,
            ...TAP_STYLE,
          }}
          onMouseEnter={e => { if (!isActive) { (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.08)"; (e.currentTarget as HTMLElement).style.color = "#fff"; } }}
          onMouseLeave={e => { if (!isActive) { (e.currentTarget as HTMLElement).style.background = "transparent"; (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.72)"; } }}
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
  };

  const userFooter = (
    <div style={{
      marginTop: "auto",
      display: "flex",
      alignItems: "center",
      gap: 10,
      padding: "12px 10px",
      borderTop: "1px solid rgba(255,255,255,0.12)",
    }}>
      <div style={{
        width: 34, height: 34, borderRadius: 9,
        background: "rgba(255,255,255,0.14)",
        display: "grid", placeItems: "center",
        fontWeight: 700, fontSize: 14, color: "#fff",
        flexShrink: 0, overflow: "hidden",
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
  );

  return (
    <>
      {/* ── DESKTOP SIDEBAR — unchanged, hidden on mobile ── */}
      <aside
        className="hidden md:flex"
        style={{
          position: "fixed",
          left: 0, top: 0, bottom: 0,
          width: 180,
          background: "var(--primary)",
          flexDirection: "column",
          padding: "20px 14px",
          zIndex: 100,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10, fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 17, color: "#fff", letterSpacing: "-0.02em", padding: "6px 8px 18px" }}>
          <StationMark size={26} />
          Station
        </div>
        <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, letterSpacing: "0.14em", textTransform: "uppercase", color: "rgba(255,255,255,0.55)", padding: "0 10px 12px" }}>
          Athenian School
        </div>
        <nav style={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {visibleLinks.map(link => renderLink(link))}
        </nav>
        {userFooter}
      </aside>

      {/* ── MOBILE TOP BAR — hidden on desktop ── */}
      <header
        className="flex md:hidden"
        style={{
          position: "fixed",
          top: 0, left: 0, right: 0,
          height: 56,
          background: "#232E54",
          alignItems: "center",
          padding: "0 4px 0 14px",
          zIndex: 100,
          boxShadow: TOPBAR_SHADOW,
        }}
      >
        {/* Left: Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
          <StationMark size={24} />
          <span style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 16, color: "#fff", letterSpacing: "-0.02em" }}>
            Station
          </span>
        </div>

        {/* Center: page name */}
        <div style={{ flex: 1, textAlign: "center", fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 15, color: "#fff", letterSpacing: "-0.01em" }}>
          {pageName}
        </div>

        {/* Right: Hamburger button */}
        <button
          aria-label="Open navigation menu"
          aria-expanded={drawerOpen}
          aria-controls="mobile-nav-drawer"
          onClick={() => setDrawerOpen(true)}
          style={{
            width: 44, height: 44,
            display: "flex", alignItems: "center", justifyContent: "center",
            background: "none", border: "none",
            color: "#fff", cursor: "pointer",
            borderRadius: "var(--r-sm)",
            flexShrink: 0,
            ...TAP_STYLE,
          }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: 24 }}>menu</span>
        </button>
      </header>

      {/* ── OVERLAY behind drawer ── */}
      <div
        className="md:hidden"
        onClick={() => setDrawerOpen(false)}
        aria-hidden="true"
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0,0,0,0.5)",
          zIndex: 200,
          opacity: drawerOpen ? 1 : 0,
          pointerEvents: drawerOpen ? "auto" : "none",
          transition: "opacity 300ms ease",
        }}
      />

      {/* ── SLIDE-IN DRAWER ── */}
      <div
        id="mobile-nav-drawer"
        ref={drawerRef}
        className="flex md:hidden"
        role="dialog"
        aria-label="Navigation menu"
        aria-modal="true"
        style={{
          position: "fixed",
          top: 0, left: 0, bottom: 0,
          width: 280,
          background: "#232E54",
          flexDirection: "column",
          padding: "0 14px 20px",
          zIndex: 201,
          transform: drawerOpen ? "translateX(0)" : "translateX(-100%)",
          transition: "transform 300ms ease",
          willChange: "transform",
          boxShadow: DRAWER_SHADOW,
        }}
      >
        {/* Drawer top: logo + close button */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: 16, paddingBottom: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "6px 8px" }}>
            <StationMark size={26} />
            <span style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 17, color: "#fff", letterSpacing: "-0.02em" }}>
              Station
            </span>
          </div>
          <button
            aria-label="Close navigation menu"
            onClick={() => setDrawerOpen(false)}
            style={{
              width: 44, height: 44,
              display: "flex", alignItems: "center", justifyContent: "center",
              background: "none", border: "none",
              color: "rgba(255,255,255,0.72)", cursor: "pointer",
              borderRadius: "var(--r-sm)",
              ...TAP_STYLE,
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: 22 }}>close</span>
          </button>
        </div>

        {/* School context label */}
        <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, letterSpacing: "0.14em", textTransform: "uppercase", color: "rgba(255,255,255,0.55)", padding: "6px 10px 16px" }}>
          Athenian School
        </div>

        {/* Nav links */}
        <nav style={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {visibleLinks.map(link => renderLink(link, () => setDrawerOpen(false)))}
        </nav>

        {/* User footer */}
        {userFooter}
      </div>
    </>
  );
}
