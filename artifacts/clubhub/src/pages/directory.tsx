import { useState, useMemo } from "react";
import { useGetClubs, useEnrollInClub } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getClubColor } from "@/lib/color-utils";
import { ClubDetailModal } from "@/components/ClubDetailModal";
import { getGetClubsQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export default function DirectoryPage() {
  const { data, isLoading } = useGetClubs();
  const queryClient = useQueryClient();
  const enrollMutation = useEnrollInClub();
  
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("All Types");
  const [dayFilter, setDayFilter] = useState("All Days");
  const [statusFilter, setStatusFilter] = useState("All Clubs");
  const [selectedClubId, setSelectedClubId] = useState<number | null>(null);

  const filteredClubs = useMemo(() => {
    if (!data?.success) return [];
    return data.clubs.filter(club => {
      const matchSearch = club.name.toLowerCase().includes(search.toLowerCase());
      const matchType = typeFilter === "All Types" || club.type === typeFilter;
      const matchDay = dayFilter === "All Days" || club.default_day === dayFilter;
      const matchStatus = statusFilter === "All Clubs" 
        ? true 
        : statusFilter === "Enrolled" 
          ? club.is_enrolled 
          : !club.is_enrolled;
      
      return matchSearch && matchType && matchDay && matchStatus;
    });
  }, [data, search, typeFilter, dayFilter, statusFilter]);

  const handleEnroll = (e: React.MouseEvent, clubId: number) => {
    e.stopPropagation();
    enrollMutation.mutate({ id: clubId }, {
      onSuccess: () => {
        toast.success("Successfully enrolled!");
        queryClient.invalidateQueries({ queryKey: getGetClubsQueryKey() });
      },
      onError: (err) => {
        toast.error(err.message || "Failed to enroll");
      }
    });
  };

  return (
    <div className="max-w-6xl mx-auto px-6">
      <div className="mb-10 text-center">
        <h1 className="text-4xl font-semibold mb-4 text-on-surface">Explore Clubs</h1>
        <p className="text-secondary text-lg">Discover your next passion. Join the community.</p>
      </div>

      <div className="bg-white p-6 rounded-3xl shadow-sm mb-10 flex flex-col gap-6">
        <div className="relative">
          <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-secondary">search</span>
          <Input 
            className="pl-12 h-14 bg-[#F7F9FB] border-none rounded-2xl text-lg focus-visible:ring-primary/20"
            placeholder="Search clubs by name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="flex flex-wrap gap-4">
          <div className="flex flex-col gap-2">
            <span className="text-xs font-semibold text-secondary uppercase tracking-wider">Type</span>
            <div className="flex flex-wrap gap-2">
              {["All Types", "Committee", "Union", "Club", "Team", "Other"].map(t => (
                <button
                  key={t}
                  onClick={() => setTypeFilter(t)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${typeFilter === t ? 'bg-secondary text-white' : 'bg-surface-container text-secondary hover:bg-surface-container-high'}`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <span className="text-xs font-semibold text-secondary uppercase tracking-wider">Day</span>
            <div className="flex flex-wrap gap-2">
              {["All Days", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday"].map(d => (
                <button
                  key={d}
                  onClick={() => setDayFilter(d)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${dayFilter === d ? 'bg-secondary text-white' : 'bg-surface-container text-secondary hover:bg-surface-container-high'}`}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <span className="text-xs font-semibold text-secondary uppercase tracking-wider">Status</span>
            <div className="flex flex-wrap gap-2">
              {["All Clubs", "Enrolled", "Not Enrolled"].map(s => (
                <button
                  key={s}
                  onClick={() => setStatusFilter(s)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${statusFilter === s ? 'bg-secondary text-white' : 'bg-surface-container text-secondary hover:bg-surface-container-high'}`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
          {[1,2,3,4,5,6].map(i => <div key={i} className="h-64 bg-gray-200 rounded-3xl"></div>)}
        </div>
      ) : filteredClubs.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-3xl shadow-sm">
          <span className="material-symbols-outlined text-5xl text-outline-variant mb-4">search_off</span>
          <h2 className="text-xl font-semibold mb-2 text-on-surface">No clubs found</h2>
          <p className="text-secondary">Try adjusting your filters or search query.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredClubs.map(club => (
            <div 
              key={club.id}
              className="bg-white rounded-3xl shadow-sm p-6 hover:shadow-md transition-shadow cursor-pointer border border-transparent hover:border-primary/10 flex flex-col h-full"
              onClick={() => setSelectedClubId(club.id)}
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-white font-bold text-2xl ${getClubColor(club.id)}`}>
                  {club.profile_photo ? (
                    <img src={club.profile_photo} alt={club.name} className="w-full h-full object-cover rounded-2xl" />
                  ) : (
                    club.initial
                  )}
                </div>
                <div className="flex flex-col gap-1 items-end">
                  <span className="bg-surface-container text-secondary text-xs px-2 py-1 rounded-md font-medium">{club.type}</span>
                  <span className="text-xs text-secondary font-medium">{club.default_day}</span>
                </div>
              </div>
              
              <h3 className="font-semibold text-xl mb-2 text-on-surface line-clamp-1">{club.name}</h3>
              <p className="text-secondary text-sm line-clamp-2 flex-grow mb-6">{club.description}</p>
              
              <div className="mt-auto">
                {club.is_enrolled ? (
                  <div className="w-full py-2 bg-[#F2F4F6] text-secondary text-center rounded-xl text-sm font-semibold flex items-center justify-center gap-2">
                    <span className="material-symbols-outlined text-[18px]">check_circle</span>
                    Enrolled
                  </div>
                ) : (
                  <Button 
                    className="w-full py-2 bg-gradient-to-r from-primary to-primary-container text-white rounded-xl shadow-sm shadow-primary/20 hover:opacity-90 transition-opacity"
                    onClick={(e) => handleEnroll(e, club.id)}
                    disabled={enrollMutation.isPending}
                  >
                    Join Club
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedClubId && (
        <ClubDetailModal 
          clubId={selectedClubId} 
          onClose={() => setSelectedClubId(null)} 
        />
      )}
    </div>
  );
}
