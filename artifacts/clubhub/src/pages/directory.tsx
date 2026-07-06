import { useState, useMemo, useEffect, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { getClubColor } from "@/lib/color-utils";
import { ClubDetailModal } from "@/components/ClubDetailModal";
import { toast } from "sonner";

const PAGE_SIZE = 12;
const API_BASE = (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/+$/, "") ?? "";

interface ClubItem {
  id: number;
  name: string;
  description: string;
  type: string;
  initial: string;
  default_day: string;
  default_location: string;
  chat_link: string;
  profile_photo: string;
  is_enrolled: boolean;
  is_leader: boolean;
  member_count: number;
}

const TYPE_ICONS: Record<string, string> = {
  Club: "groups",
  Committee: "gavel",
  Team: "sports",
  Union: "diversity_3",
  Other: "category",
};

const CATEGORY_FILTERS = ["All", "Club", "Committee", "Team", "Union", "Other"];

async function fetchClubsPage(offset: number): Promise<{ clubs: ClubItem[]; hasMore: boolean }> {
  const token = localStorage.getItem("clubhub_token");
  let res: Response;
  try {
    res = await fetch(`${API_BASE}/api/clubs?limit=${PAGE_SIZE}&offset=${offset}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
  } catch {
    throw new Error("Network error — please check your connection and try again.");
  }
  if (!res.ok) {
    const body = await res.json().catch(() => ({})) as { error?: string };
    throw new Error(body.error || `Failed to load clubs (${res.status} ${res.statusText})`);
  }
  const data = await res.json() as { clubs?: ClubItem[]; hasMore?: boolean };
  return { clubs: data.clubs ?? [], hasMore: data.hasMore ?? false };
}

export default function DirectoryPage() {
  const [allClubs, setAllClubs] = useState<ClubItem[]>([]);
  const [hasMore, setHasMore] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [selectedClubId, setSelectedClubId] = useState<number | null>(null);

  const loadFirstPage = useCallback(async () => {
    setIsLoading(true);
    try {
      const { clubs, hasMore: more } = await fetchClubsPage(0);
      setAllClubs(clubs);
      setHasMore(more);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to load clubs";
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadFirstPage();
  }, [loadFirstPage]);

  const loadMore = async () => {
    setIsLoadingMore(true);
    try {
      const { clubs, hasMore: more } = await fetchClubsPage(allClubs.length);
      setAllClubs(prev => [...prev, ...clubs]);
      setHasMore(more);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to load more clubs";
      toast.error(message);
    } finally {
      setIsLoadingMore(false);
    }
  };

  const filteredClubs = useMemo(() => {
    return allClubs.filter(club => {
      const matchSearch = club.name.toLowerCase().includes(search.toLowerCase());
      const matchCat = categoryFilter === "All" || club.type === categoryFilter;
      return matchSearch && matchCat;
    });
  }, [allClubs, search, categoryFilter]);

  return (
    <div className="max-w-7xl mx-auto px-6">
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold font-lexend mb-3 text-on-surface">Explore Clubs</h1>
        <p className="text-secondary text-lg">Discover your next passion. Join the community.</p>
      </div>

      <div className="bg-white rounded-3xl shadow-sm p-4 mb-8 flex flex-col sm:flex-row gap-4 items-start sm:items-center">
        <div className="relative flex-grow min-w-0">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-secondary text-[20px]">search</span>
          <Input
            className="pl-10 h-11 bg-[#F7F9FB] border-none rounded-2xl focus-visible:ring-primary/20"
            placeholder="Search clubs by name..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            aria-label="Search clubs"
          />
        </div>
        <div className="flex flex-wrap gap-2 flex-shrink-0" role="group" aria-label="Filter by category">
          {CATEGORY_FILTERS.map(cat => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              aria-pressed={categoryFilter === cat}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors whitespace-nowrap ${categoryFilter === cat ? "bg-primary text-white" : "bg-surface-container text-secondary hover:bg-surface-container-high"}`}
            >
              {cat === "All" ? "All Categories" : cat}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 animate-pulse">
          {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
            <div key={i} className="h-52 bg-gray-200 rounded-3xl" />
          ))}
        </div>
      ) : filteredClubs.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-3xl shadow-sm">
          <span className="material-symbols-outlined text-5xl text-outline-variant mb-4 block">search_off</span>
          <h2 className="text-xl font-semibold mb-2 text-on-surface">No clubs found</h2>
          <p className="text-secondary">Try adjusting your search or category filter.</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {filteredClubs.map(club => (
              <div
                key={club.id}
                className="bg-white rounded-3xl shadow-sm p-5 hover:shadow-md transition-shadow cursor-pointer border border-transparent hover:border-primary/10 flex flex-col"
                onClick={() => setSelectedClubId(club.id)}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white ${getClubColor(club.id)} flex-shrink-0`}>
                    {club.profile_photo ? (
                      <img
                        src={club.profile_photo}
                        alt={club.name}
                        className="w-full h-full object-cover rounded-2xl"
                      />
                    ) : (
                      <span className="material-symbols-outlined text-[22px]">
                        {TYPE_ICONS[club.type] ?? "category"}
                      </span>
                    )}
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className="bg-surface-container text-secondary text-xs px-2 py-0.5 rounded-md font-medium">
                      {club.type}
                    </span>
                    {club.is_enrolled && (
                      <span className="bg-green-100 text-green-700 text-[10px] px-2 py-0.5 rounded-full font-medium">
                        Enrolled
                      </span>
                    )}
                  </div>
                </div>

                <h3 className="font-semibold text-base mb-1.5 text-on-surface line-clamp-1">{club.name}</h3>
                <p className="text-secondary text-sm line-clamp-3 flex-grow mb-4">{club.description}</p>

                <div className="mt-auto flex items-center justify-between">
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-1 text-xs text-secondary">
                      <span className="material-symbols-outlined text-[15px]">schedule</span>
                      <span>{club.default_day}</span>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-secondary">
                      <span className="material-symbols-outlined text-[15px]">group</span>
                      <span>{club.member_count} {club.member_count === 1 ? "member" : "members"}</span>
                    </div>
                  </div>
                  <button
                    className="text-primary text-sm font-medium flex items-center gap-0.5 hover:gap-1.5 transition-all"
                    onClick={e => { e.stopPropagation(); setSelectedClubId(club.id); }}
                    aria-label={`View details for ${club.name}`}
                  >
                    View Details
                    <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                  </button>
                </div>
              </div>
            ))}
          </div>

          {hasMore && (
            <div className="flex justify-center mt-10">
              <Button
                variant="outline"
                className="rounded-full px-8 h-12 text-sm font-medium border-outline-variant/40 hover:bg-surface-container"
                onClick={loadMore}
                disabled={isLoadingMore}
              >
                {isLoadingMore ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-secondary/30 border-t-secondary rounded-full animate-spin" />
                    Loading…
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[18px]">expand_more</span>
                    Load More Clubs
                  </span>
                )}
              </Button>
            </div>
          )}
        </>
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
