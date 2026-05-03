import { useState, useMemo } from "react";
import { useGetLeadingClubs, useDeleteClub } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { getClubColor } from "@/lib/color-utils";
import { ClubDetailModal } from "@/components/ClubDetailModal";
import { CreateClubModal } from "@/components/CreateClubModal";
import { EditClubModal } from "@/components/EditClubModal";
import { ManageEventsModal } from "@/components/ManageEventsModal";
import { useQueryClient } from "@tanstack/react-query";
import { getGetLeadingClubsQueryKey, getGetClubsQueryKey } from "@workspace/api-client-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";

export default function LeadershipPage() {
  const { data, isLoading } = useGetLeadingClubs();
  const deleteMutation = useDeleteClub();
  const queryClient = useQueryClient();

  const [selectedClubId, setSelectedClubId] = useState<number | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editClubId, setEditClubId] = useState<number | null>(null);
  const [manageEventsClubId, setManageEventsClubId] = useState<number | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);

  const clubs = useMemo(() => (data?.success ? data.clubs : []), [data]);

  const deleteTargetClub = useMemo(
    () => clubs.find(c => c.id === deleteConfirmId) ?? null,
    [clubs, deleteConfirmId]
  );

  const handleDelete = () => {
    if (!deleteConfirmId) return;
    deleteMutation.mutate({ id: deleteConfirmId }, {
      onSuccess: () => {
        toast.success("Club deleted successfully");
        queryClient.invalidateQueries({ queryKey: getGetLeadingClubsQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetClubsQueryKey() });
        setDeleteConfirmId(null);
      },
      onError: (err) => {
        toast.error(err.message || "Failed to delete club");
        setDeleteConfirmId(null);
      }
    });
  };

  return (
    <div className="max-w-5xl mx-auto px-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-4">
        <div>
          <h1 className="text-3xl font-bold font-lexend text-on-surface">Leadership Hub</h1>
          <p className="text-secondary mt-1">Manage your clubs and events</p>
        </div>
        <Button
          className="bg-gradient-to-r from-primary to-primary-container text-white rounded-full px-6 py-6 shadow-lg shadow-primary/20 hover:opacity-90"
          onClick={() => setIsCreateModalOpen(true)}
        >
          <span className="material-symbols-outlined mr-2">add</span>
          Create New Club
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div className="md:col-span-2 bg-gradient-to-br from-primary to-tertiary-container rounded-3xl p-8 text-white flex flex-col justify-center relative overflow-hidden">
          <div className="relative z-10">
            <h2 className="text-2xl font-bold mb-2">Welcome to your Hub</h2>
            <p className="text-white/80 max-w-md">As a club leader, you are the heartbeat of our campus. Use this space to organize meetings, update details, and grow your community.</p>
          </div>
          <span className="material-symbols-outlined absolute -bottom-10 -right-4 text-[180px] text-white/10 z-0">stars</span>
        </div>
        <div className="bg-white rounded-3xl p-8 shadow-sm flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 rounded-2xl bg-secondary/10 text-secondary flex items-center justify-center mb-4">
            <span className="material-symbols-outlined text-3xl">event_upcoming</span>
          </div>
          <h3 className="text-4xl font-bold text-on-surface mb-1">
            {clubs.reduce((acc, club) => acc + club.upcoming_events_count, 0)}
          </h3>
          <p className="text-secondary font-medium">Upcoming Events</p>
        </div>
      </div>

      <h2 className="text-xl font-semibold mb-6">Clubs You Lead</h2>

      {isLoading ? (
        <div className="grid grid-cols-1 gap-6 animate-pulse">
          {[1, 2].map(i => <div key={i} className="h-48 bg-gray-200 rounded-3xl"></div>)}
        </div>
      ) : clubs.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-3xl shadow-sm border border-dashed border-outline-variant/30">
          <span className="material-symbols-outlined text-5xl text-secondary opacity-40 mb-4">group_off</span>
          <h3 className="text-xl font-semibold mb-2">You aren't a leader of any clubs yet</h3>
          <p className="text-secondary mb-6">Start a new community by creating a club.</p>
          <Button
            className="bg-primary text-white rounded-full px-6"
            onClick={() => setIsCreateModalOpen(true)}
          >
            Create New Club
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {clubs.map(club => (
            <div key={club.id} className="bg-white rounded-3xl shadow-sm border border-outline-variant/20 overflow-hidden flex flex-col">
              <div
                className="p-6 cursor-pointer hover:bg-[#F9FAFB] transition-colors flex-grow"
                onClick={() => setSelectedClubId(club.id)}
              >
                <div className="flex items-start gap-4">
                  <div className={`w-16 h-16 rounded-2xl flex-shrink-0 flex items-center justify-center text-white font-bold text-2xl ${getClubColor(club.id)}`}>
                    {club.profile_photo ? (
                      <img src={club.profile_photo} alt={club.name} className="w-full h-full object-cover rounded-2xl" />
                    ) : (
                      club.initial
                    )}
                  </div>
                  <div className="flex-grow">
                    <div className="flex justify-between items-start">
                      <h3 className="font-semibold text-xl text-on-surface line-clamp-1">{club.name}</h3>
                      <span className="bg-tertiary-container/10 text-tertiary-container text-xs px-2 py-1 rounded-md font-medium whitespace-nowrap">
                        {club.user_role}
                      </span>
                    </div>
                    <p className="text-secondary text-sm mt-1 line-clamp-2">{club.description}</p>
                  </div>
                </div>

                <div className="flex gap-6 mt-6 pt-6 border-t border-outline-variant/20">
                  <div className="flex flex-col">
                    <span className="text-xs text-secondary font-medium uppercase tracking-wider">Members</span>
                    <span className="font-semibold text-lg">{club.member_count}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs text-secondary font-medium uppercase tracking-wider">Events</span>
                    <span className="font-semibold text-lg">{club.upcoming_events_count}</span>
                  </div>
                </div>
              </div>

              <div className="bg-[#F7F9FB] p-4 flex gap-2 justify-end border-t border-outline-variant/20">
                <Button
                  variant="outline"
                  className="bg-white hover:bg-surface-container rounded-xl text-secondary"
                  onClick={() => setEditClubId(club.id)}
                >
                  <span className="material-symbols-outlined text-[18px] mr-2">edit</span>
                  Edit Details
                </Button>
                <Button
                  className="bg-primary hover:bg-primary-container text-white rounded-xl shadow-sm"
                  onClick={() => setManageEventsClubId(club.id)}
                >
                  <span className="material-symbols-outlined text-[18px] mr-2">event</span>
                  Schedule Event
                </Button>
                <Button
                  variant="ghost"
                  className="text-error hover:bg-error/10 hover:text-error rounded-xl w-10 p-0"
                  onClick={() => setDeleteConfirmId(club.id)}
                  aria-label={`Delete ${club.name}`}
                >
                  <span className="material-symbols-outlined text-[20px]">delete</span>
                </Button>
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

      {isCreateModalOpen && (
        <CreateClubModal
          onClose={() => setIsCreateModalOpen(false)}
          onCreated={(clubId) => {
            setIsCreateModalOpen(false);
            setManageEventsClubId(clubId);
          }}
        />
      )}

      {editClubId && (
        <EditClubModal clubId={editClubId} onClose={() => setEditClubId(null)} />
      )}

      {manageEventsClubId && (
        <ManageEventsModal clubId={manageEventsClubId} onClose={() => setManageEventsClubId(null)} />
      )}

      <Dialog open={!!deleteConfirmId} onOpenChange={(open) => !open && setDeleteConfirmId(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Club</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete{" "}
              <span className="font-semibold text-on-surface">{deleteTargetClub?.name ?? "this club"}</span>?
              {" "}This cannot be undone. All members will be unenrolled and all events will be deleted.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4 gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setDeleteConfirmId(null)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDelete} disabled={deleteMutation.isPending}>
              {deleteMutation.isPending ? "Deleting..." : "Delete Club"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
