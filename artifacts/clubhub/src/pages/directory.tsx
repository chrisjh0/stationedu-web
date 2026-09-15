import { useState, useMemo, useEffect, useCallback } from "react";
import { getClubColor } from "@/lib/color-utils";
import { ClubDetailModal } from "@/components/ClubDetailModal";
import { useEnrollInClub, useUnenrollFromClub, getGetClubsQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

const PAGE_SIZE = 50;
const API_BASE = (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/+$/, "") ?? "";

interface ClubItem {
  id: number;
  name: string;
  description: string;
  type: string;
  category: string;
  initial: string;
  default_day: string;
  default_location: string;
  chat_link: string;
  profile_photo: string;
  is_enrolled: boolean;
  is_leader: boolean;
  member_count: number;
}

const CATEGORY_FILTERS = ["All", "Club", "Committee", "Union", "Team"] as const;
const CATEGORY_COLORS: Record<string, string> = {
  Club: '#DD5E54',
  Committee: '#232E54',
  Union: '#3C8A84',
  Team: '#BB8E33',
};
const DAY_OPTIONS = ["Any day", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Daily"] as const;

async function fetchAllClubs(defaultDay?: string): Promise<ClubItem[]> {
  const token = localStorage.getItem("clubhub_token");
  const headers: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {};
  const result: ClubItem[] = [];
  let offset = 0;
  while (true) {
    let res: Response;
    const dayParam = defaultDay ? `&default_day=${encodeURIComponent(defaultDay)}` : "";
    try {
      res = await fetch(`${API_BASE}/api/clubs?limit=${PAGE_SIZE}&offset=${offset}${dayParam}`, { headers });
    } catch {
      throw new Error("Network error — check your connection and try again.");
    }
    if (!res.ok) {
      const body = await res.json().catch(() => ({})) as { error?: string };
      throw new Error(body.error || `Failed to load clubs (${res.status})`);
    }
    const data = await res.json() as { clubs?: ClubItem[]; hasMore?: boolean };
    result.push(...(data.clubs ?? []));
    if (!data.hasMore) break;
    offset += PAGE_SIZE;
    if (result.length > 2000) break; // safety cap
  }
  return result;
}

export default function DirectoryPage() {
  useEffect(() => { document.title = "Directory — Station"; }, []);
  const [allClubs, setAllClubs] = useState<ClubItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [dayFilter, setDayFilter] = useState("Any day");
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");
  const [selectedClubId, setSelectedClubId] = useState<number | null>(null);

  const queryClient = useQueryClient();
  const enrollMutation = useEnrollInClub();
  const unenrollMutation = useUnenrollFromClub();

  const loadClubs = useCallback(async (day?: string) => {
    setIsLoading(true);
    try {
      const clubs = await fetchAllClubs(day && day !== "Any day" ? day : undefined);
      setAllClubs(clubs);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to load clubs");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadClubs(dayFilter);
  }, [loadClubs, dayFilter]);

  const filteredClubs = useMemo(() => {
    return allClubs.filter(c => {
      const matchSearch = c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.description.toLowerCase().includes(search.toLowerCase());
      const matchCategory = categoryFilter === "All" || c.category === categoryFilter;
      return matchSearch && matchCategory;
    });
  }, [allClubs, search, categoryFilter]);

  const categoryCount = useMemo(() => new Set(allClubs.map(c => c.category)).size, [allClubs]);

  const handleEnroll = (e: React.MouseEvent, club: ClubItem) => {
    e.stopPropagation();
    if (club.is_enrolled) {
      unenrollMutation.mutate({ id: club.id }, {
        onSuccess: () => {
          setAllClubs(prev => prev.map(c => c.id === club.id ? { ...c, is_enrolled: false } : c));
          queryClient.invalidateQueries({ queryKey: getGetClubsQueryKey() });
        },
        onError: err => toast.error(err.message || "Failed to unenroll"),
      });
    } else {
      enrollMutation.mutate({ id: club.id }, {
        onSuccess: () => {
          toast.success("Joined successfully");
          setAllClubs(prev => prev.map(c => c.id === club.id ? { ...c, is_enrolled: true } : c));
          queryClient.invalidateQueries({ queryKey: getGetClubsQueryKey() });
        },
        onError: err => toast.error(err.message || "Failed to join"),
      });
    }
  };

  const cardStyle: React.CSSProperties = {
    background: "var(--surface)",
    border: "1px solid var(--border)",
    borderRadius: "var(--r-md)",
    overflow: "hidden",
  };

  return (
    <div style={{ maxWidth: 1000, margin: "0 auto" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 24, gap: 16 }}>
        <div>
          <h1 style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 30, letterSpacing: "-0.025em", color: "var(--heading)", marginBottom: 4 }}>
            Directory
          </h1>
          <div style={{ fontSize: 13, color: "var(--text-3)" }}>
            {allClubs.length} clubs · {categoryCount} categories
          </div>
        </div>

        {/* Search + view toggle */}
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ position: "relative", width: 240 }}>
            <span className="material-symbols-outlined" style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "var(--text-3)", fontSize: 19 }}>search</span>
            <input
              placeholder="Search clubs…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{
                width: "100%",
                height: 40,
                padding: "0 12px 0 38px",
                borderRadius: "var(--r-md)",
                border: "1px solid var(--border-strong)",
                background: "var(--surface)",
                color: "var(--text)",
                fontFamily: "var(--font-body)",
                fontSize: 13.5,
                outline: "none",
              }}
            />
          </div>

          {/* View toggle */}
          <div style={{ display: "flex", gap: 2, background: "var(--surface-2)", borderRadius: "var(--r-sm)", padding: 3, border: "1px solid var(--border)" }}>
            <button onClick={() => setViewMode("list")} style={{ width: 30, height: 28, display: "flex", alignItems: "center", justifyContent: "center", borderRadius: 5, border: "none", cursor: "pointer", background: viewMode === "list" ? "var(--surface)" : "transparent", color: viewMode === "list" ? "var(--primary)" : "var(--text-3)", boxShadow: viewMode === "list" ? "var(--sh-sm)" : "none" }} aria-label="List view">
              <span className="material-symbols-outlined" style={{ fontSize: 17 }}>view_list</span>
            </button>
            <button onClick={() => setViewMode("grid")} style={{ width: 30, height: 28, display: "flex", alignItems: "center", justifyContent: "center", borderRadius: 5, border: "none", cursor: "pointer", background: viewMode === "grid" ? "var(--surface)" : "transparent", color: viewMode === "grid" ? "var(--primary)" : "var(--text-3)", boxShadow: viewMode === "grid" ? "var(--sh-sm)" : "none" }} aria-label="Grid view">
              <span className="material-symbols-outlined" style={{ fontSize: 17 }}>grid_view</span>
            </button>
          </div>
        </div>
      </div>

      {/* Filter pills + day dropdown + count */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
        {CATEGORY_FILTERS.map(cat => {
          const color = cat === "All" ? undefined : CATEGORY_COLORS[cat];
          const isActive = categoryFilter === cat;
          return (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                padding: "6px 13px",
                borderRadius: "var(--r-pill)",
                border: isActive ? "none" : "1px solid var(--border-strong)",
                cursor: "pointer",
                fontFamily: "var(--font-body)",
                fontWeight: 600,
                fontSize: 13,
                background: isActive ? "var(--primary)" : "var(--surface-2)",
                color: isActive ? "#fff" : "var(--text-2)",
                transition: "background 0.14s, color 0.14s",
              }}
            >
              {color && (
                <span style={{
                  display: "inline-block",
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  background: isActive ? "rgba(255,255,255,0.7)" : color,
                  flexShrink: 0,
                }} />
              )}
              {cat}
            </button>
          );
        })}

        <select
          value={dayFilter}
          onChange={e => setDayFilter(e.target.value)}
          style={{
            height: 34,
            padding: "0 28px 0 10px",
            borderRadius: "var(--r-pill)",
            border: dayFilter !== "Any day" ? "none" : "1px solid var(--border-strong)",
            background: dayFilter !== "Any day" ? "var(--primary)" : "var(--surface-2)",
            color: dayFilter !== "Any day" ? "#fff" : "var(--text-2)",
            fontFamily: "var(--font-body)",
            fontWeight: 600,
            fontSize: 13,
            cursor: "pointer",
            appearance: "none",
            WebkitAppearance: "none",
          }}
        >
          {DAY_OPTIONS.map(d => (
            <option key={d} value={d} style={{ background: "var(--surface)", color: "var(--text)" }}>{d}</option>
          ))}
        </select>

        <span style={{ marginLeft: "auto", fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--text-3)", letterSpacing: "0.06em" }}>
          SHOWING {filteredClubs.length} OF {allClubs.length}
        </span>
      </div>

      {isLoading ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 1, ...cardStyle }}>
          {[1,2,3,4,5].map(i => (
            <div key={i} style={{ height: 72, background: "var(--surface-2)", borderBottom: "1px solid var(--border)" }} />
          ))}
        </div>
      ) : filteredClubs.length === 0 ? (
        <div style={{ ...cardStyle, padding: "48px 24px", textAlign: "center" }}>
          <span className="material-symbols-outlined" style={{ fontSize: 40, color: "var(--text-3)", display: "block", marginBottom: 12 }}>search_off</span>
          <p style={{ fontWeight: 600, color: "var(--heading)", marginBottom: 6 }}>No clubs found</p>
          <p style={{ fontSize: 13, color: "var(--text-3)" }}>Try adjusting your search or filter.</p>
        </div>
      ) : viewMode === "list" ? (
        /* ── LIST VIEW ── */
        <div style={cardStyle}>
          {/* Table header */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "2.6fr 1fr 1.1fr 0.7fr auto",
            alignItems: "center",
            gap: 16,
            padding: "9px 18px",
            background: "var(--surface-2)",
            borderBottom: "1px solid var(--border)",
          }}>
            {["Club", "Category", "Meets", "Members", ""].map((h, i) => (
              <span key={i} style={{ fontFamily: "var(--font-mono)", fontSize: 10.5, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--text-3)" }}>{h}</span>
            ))}
          </div>

          {filteredClubs.map((club, idx) => {
            const color = getClubColor(club.category);
            return (
              <div
                key={club.id}
                onClick={() => setSelectedClubId(club.id)}
                style={{
                  display: "grid",
                  gridTemplateColumns: "2.6fr 1fr 1.1fr 0.7fr auto",
                  alignItems: "center",
                  gap: 16,
                  padding: "12px 18px",
                  borderBottom: idx < filteredClubs.length - 1 ? "1px solid var(--border)" : "none",
                  cursor: "pointer",
                  transition: "background 0.1s",
                }}
                onMouseEnter={e => (e.currentTarget.style.background = "var(--surface-2)")}
                onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
              >
                {/* Club name + desc */}
                <div style={{ display: "flex", alignItems: "center", gap: 13, minWidth: 0 }}>
                  <div style={{
                    width: 40, height: 40, borderRadius: "var(--r-sm)",
                    background: color, color: "#fff", display: "grid",
                    placeItems: "center", fontFamily: "var(--font-display)",
                    fontWeight: 800, fontSize: 17, flexShrink: 0,
                  }}>
                    {club.profile_photo ? (
                      <img src={club.profile_photo} alt={club.name} style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "var(--r-sm)" }} />
                    ) : club.initial}
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontWeight: 700, fontSize: 14, color: "var(--heading)" }}>{club.name}</div>
                    <div style={{ fontSize: 12, color: "var(--text-3)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: "38ch" }}>{club.description}</div>
                  </div>
                </div>

                {/* Category */}
                <div>
                  <span style={{
                    display: "inline-flex", alignItems: "center", gap: 5,
                    fontSize: 10.5, fontWeight: 700, padding: "4px 9px",
                    borderRadius: "var(--r-pill)",
                    background: color, color: "#fff",
                    textTransform: "uppercase", letterSpacing: "0.04em",
                  }}>
                    {club.category}
                  </span>
                </div>

                {/* Meets */}
                <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12.5, color: "var(--text-2)", fontFamily: "var(--font-mono)" }}>
                  <span className="material-symbols-outlined" style={{ fontSize: 15, color: "var(--text-3)" }}>schedule</span>
                  {club.default_day || "—"}
                </div>

                {/* Members */}
                <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12.5, color: "var(--text-2)", fontFamily: "var(--font-mono)" }}>
                  <span className="material-symbols-outlined" style={{ fontSize: 15, color: "var(--text-3)" }}>group</span>
                  {club.member_count}
                </div>

                {/* Action */}
                <div onClick={e => e.stopPropagation()}>
                  {club.is_enrolled ? (
                    <button
                      onClick={e => handleEnroll(e, club)}
                      style={{
                        display: "inline-flex", alignItems: "center", gap: 5,
                        height: 32, padding: "0 13px", borderRadius: "var(--r-sm)",
                        border: "none",
                        background: `color-mix(in oklab, var(--success) 14%, var(--surface))`,
                        color: "var(--success)", fontWeight: 600, fontSize: 12.5, cursor: "pointer",
                        fontFamily: "var(--font-body)",
                      }}
                    >
                      <span className="material-symbols-outlined" style={{ fontSize: 14 }}>check</span>
                      Enrolled
                    </button>
                  ) : (
                    <button
                      onClick={e => handleEnroll(e, club)}
                      disabled={enrollMutation.isPending}
                      style={{
                        display: "inline-flex", alignItems: "center", gap: 5,
                        height: 32, padding: "0 13px", borderRadius: "var(--r-sm)",
                        border: "none",
                        background: "var(--accent)", color: "#fff",
                        fontWeight: 600, fontSize: 12.5, cursor: "pointer",
                        fontFamily: "var(--font-body)",
                      }}
                    >
                      Join
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* ── GRID VIEW ── */
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 14 }}>
          {filteredClubs.map(club => {
            const color = getClubColor(club.category);
            return (
              <div
                key={club.id}
                onClick={() => setSelectedClubId(club.id)}
                style={{
                  display: "flex", gap: 14, alignItems: "flex-start",
                  background: "var(--surface)", border: "1px solid var(--border)",
                  borderLeft: `4px solid ${color}`, borderRadius: "var(--r-md)",
                  padding: "16px 18px", cursor: "pointer", transition: "box-shadow 0.14s",
                }}
                onMouseEnter={e => (e.currentTarget.style.boxShadow = "var(--sh)")}
                onMouseLeave={e => (e.currentTarget.style.boxShadow = "none")}
              >
                <div style={{ width: 40, height: 40, borderRadius: "var(--r-sm)", background: color, color: "#fff", display: "grid", placeItems: "center", fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 17, flexShrink: 0 }}>
                  {club.initial}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
                    <span style={{ fontWeight: 700, fontSize: 14, color: "var(--heading)" }}>{club.name}</span>
                    <span style={{ fontSize: 10.5, fontWeight: 700, padding: "3px 8px", borderRadius: "var(--r-pill)", background: color, color: "#fff", textTransform: "uppercase", letterSpacing: "0.04em", whiteSpace: "nowrap", flexShrink: 0 }}>
                      {club.category}
                    </span>
                  </div>
                  <div style={{ fontSize: 12.5, color: "var(--text-2)", margin: "4px 0 10px", overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" as const }}>
                    {club.description}
                  </div>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div style={{ display: "flex", gap: 12 }}>
                      <span style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11.5, fontFamily: "var(--font-mono)", color: "var(--text-3)" }}>
                        <span className="material-symbols-outlined" style={{ fontSize: 14 }}>schedule</span>
                        {club.default_day || "—"}
                      </span>
                      <span style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11.5, fontFamily: "var(--font-mono)", color: "var(--text-3)" }}>
                        <span className="material-symbols-outlined" style={{ fontSize: 14 }}>group</span>
                        {club.member_count}
                      </span>
                    </div>
                    <div onClick={e => e.stopPropagation()}>
                      {club.is_enrolled ? (
                        <button onClick={e => handleEnroll(e, club)} style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 12, fontWeight: 600, color: "var(--success)", background: "none", border: "none", cursor: "pointer", fontFamily: "var(--font-body)" }}>
                          <span className="material-symbols-outlined" style={{ fontSize: 14 }}>check</span> Enrolled
                        </button>
                      ) : (
                        <button onClick={e => handleEnroll(e, club)} style={{ padding: "5px 12px", background: "var(--accent)", color: "#fff", border: "none", borderRadius: "var(--r-sm)", fontSize: 12.5, fontWeight: 600, cursor: "pointer", fontFamily: "var(--font-body)" }}>
                          Join
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {selectedClubId && (
        <ClubDetailModal
          clubId={selectedClubId}
          onClose={() => setSelectedClubId(null)}
          onEnrollmentChange={(id, enrolled) => {
            setAllClubs(prev => prev.map(c => c.id === id ? { ...c, is_enrolled: enrolled } : c));
          }}
        />
      )}
    </div>
  );
}
