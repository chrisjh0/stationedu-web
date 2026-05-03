import { useState, useMemo } from "react";
import { useGetClubs } from "@workspace/api-client-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { getClubColor } from "@/lib/color-utils";
import { ClubDetailModal } from "@/components/ClubDetailModal";

export default function ClubsPage() {
  const { data, isLoading } = useGetClubs();
  const [selectedClubId, setSelectedClubId] = useState<number | null>(null);

  const enrolledClubs = useMemo(() => {
    if (!data?.success) return [];
    return data.clubs.filter(c => c.is_enrolled);
  }, [data]);

  if (isLoading) {
    return (
      <div className="max-w-5xl mx-auto px-6 animate-pulse">
        <div className="h-10 bg-gray-200 w-48 rounded mb-8"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-40 bg-gray-200 rounded-2xl"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-6">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-semibold">Your Clubs</h1>
      </div>

      {enrolledClubs.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl shadow-sm text-center px-4">
          <div className="w-16 h-16 bg-surface-container rounded-full flex items-center justify-center mb-4">
            <span className="material-symbols-outlined text-secondary text-3xl">groups</span>
          </div>
          <h2 className="text-xl font-semibold mb-2">You haven't joined any clubs yet</h2>
          <p className="text-secondary mb-6 max-w-md">Discover clubs that match your interests and start engaging with the campus community.</p>
          <Link href="/directory">
            <Button className="bg-primary text-white rounded-full px-6 py-2">Explore Directory</Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {enrolledClubs.map(club => (
            <div 
              key={club.id} 
              className="bg-white rounded-2xl shadow-sm p-6 cursor-pointer hover:shadow-md transition-shadow flex flex-col items-center text-center"
              onClick={() => setSelectedClubId(club.id)}
            >
              <div className={`w-20 h-20 rounded-full flex items-center justify-center text-white font-bold text-3xl mb-4 ${getClubColor(club.id)}`}>
                {club.profile_photo ? (
                  <img src={club.profile_photo} alt={club.name} className="w-full h-full object-cover rounded-full" />
                ) : (
                  club.initial
                )}
              </div>
              <h3 className="font-semibold text-lg mb-1">{club.name}</h3>
              <div className="text-sm text-secondary flex items-center gap-1 mt-auto">
                <span className="material-symbols-outlined text-sm">schedule</span>
                {club.default_day} &bull; {club.default_location}
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
