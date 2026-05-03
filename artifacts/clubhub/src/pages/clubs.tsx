import { useState, useMemo } from "react";
import { useGetClubs } from "@workspace/api-client-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { getClubColor } from "@/lib/color-utils";
import { ClubDetailModal } from "@/components/ClubDetailModal";

export default function ClubsPage() {
  const { data, isLoading } = useGetClubs({ limit: 100 });
  const [selectedClubId, setSelectedClubId] = useState<number | null>(null);

  const enrolledClubs = useMemo(() => {
    if (!data?.success) return [];
    return data.clubs.filter(c => c.is_enrolled);
  }, [data]);

  if (isLoading) {
    return (
      <div className="max-w-5xl mx-auto px-6 animate-pulse">
        <div className="flex items-start justify-between mb-8">
          <div>
            <div className="h-9 bg-gray-200 w-40 rounded mb-2"></div>
            <div className="h-4 bg-gray-200 w-72 rounded"></div>
          </div>
          <div className="h-10 bg-gray-200 w-40 rounded-full"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-64 bg-gray-200 rounded-2xl"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-6">
      <div className="flex items-start justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold font-lexend text-on-surface">Your Clubs</h1>
          <p className="text-secondary mt-1 text-sm">Manage and access all your active organizations.</p>
        </div>
        <Link href="/directory">
          <Button className="bg-gradient-to-r from-primary to-primary-container text-white rounded-full px-5 h-10 shadow-sm shadow-primary/20 hover:opacity-90 transition-opacity flex-shrink-0">
            <span className="material-symbols-outlined text-[18px] mr-1">explore</span>
            Find More Clubs
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {enrolledClubs.map(club => (
          <div
            key={club.id}
            className="bg-white rounded-2xl shadow-sm overflow-hidden cursor-pointer hover:shadow-md transition-all border border-transparent hover:border-primary/10 flex flex-col"
            onClick={() => setSelectedClubId(club.id)}
          >
            <div className={`relative h-28 ${getClubColor(club.id)} flex items-center justify-center flex-shrink-0`}>
              {club.profile_photo ? (
                <img src={club.profile_photo} alt={club.name} className="w-full h-full object-cover" />
              ) : (
                <span className="text-white font-bold text-5xl opacity-80 select-none">
                  {club.initial}
                </span>
              )}
              {club.is_leader && (
                <span className="absolute top-3 right-3 bg-primary text-white text-[11px] px-2 py-0.5 rounded-full font-bold flex items-center gap-0.5 shadow-sm">
                  <span className="material-symbols-outlined text-[13px]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                  Lead
                </span>
              )}
            </div>

            <div className="p-5 flex flex-col flex-grow">
              <h3 className="font-semibold text-lg font-lexend text-on-surface mb-1 line-clamp-1">{club.name}</h3>
              <p className="text-secondary text-sm line-clamp-2 flex-grow mb-4">{club.description}</p>

              <div className="border-t border-outline-variant/20 pt-4 space-y-2">
                <div className="flex items-center gap-2 text-xs text-secondary">
                  <span className="material-symbols-outlined text-[16px] text-primary/60">calendar_month</span>
                  <span>{club.default_day || "TBD"}</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-secondary">
                  <span className="material-symbols-outlined text-[16px] text-primary/60">location_on</span>
                  <span>{club.default_location || "TBD"}</span>
                </div>
              </div>
            </div>
          </div>
        ))}

        <Link href="/directory">
          <div className="bg-white rounded-2xl border-2 border-dashed border-outline-variant/30 p-6 flex flex-col items-center justify-center text-center cursor-pointer hover:border-primary/40 hover:bg-primary/5 transition-all min-h-[220px] h-full">
            <div className="w-14 h-14 rounded-full border-2 border-dashed border-outline-variant/30 flex items-center justify-center mb-4 hover:border-primary/40 transition-colors">
              <span className="material-symbols-outlined text-2xl text-outline-variant">add</span>
            </div>
            <h3 className="font-semibold text-on-surface mb-1 font-lexend">Join a New Club</h3>
            <p className="text-secondary text-sm">Browse the directory to find more organizations.</p>
          </div>
        </Link>
      </div>

      {selectedClubId && (
        <ClubDetailModal
          clubId={selectedClubId}
          onClose={() => setSelectedClubId(null)}
        />
      )}
    </div>
  );
}
