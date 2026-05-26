import { useState } from "react";
import { useGetClub, useEnrollInClub, useUnenrollFromClub, getGetClubQueryKey } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { getClubColor } from "@/lib/color-utils";
import { getGetClubsQueryKey, getGetCalendarEventsQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { format, parseISO } from "date-fns";

interface ClubDetailModalProps {
  clubId: number;
  onClose: () => void;
  onEnrollmentChange?: (clubId: number, enrolled: boolean) => void;
}

export function ClubDetailModal({ clubId, onClose, onEnrollmentChange }: ClubDetailModalProps) {
  const { data, isLoading } = useGetClub(clubId, {
    query: { queryKey: getGetClubQueryKey(clubId), enabled: !!clubId }
  });
  const enrollMutation = useEnrollInClub();
  const unenrollMutation = useUnenrollFromClub();
  const queryClient = useQueryClient();
  const [confirmUnenroll, setConfirmUnenroll] = useState(false);

  const club = data?.success ? data.club : null;

  const handleEnroll = () => {
    if (!club) return;
    enrollMutation.mutate({ id: club.id }, {
      onSuccess: () => {
        toast.success("Enrolled successfully");
        queryClient.invalidateQueries({ queryKey: getGetClubsQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetCalendarEventsQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetClubQueryKey(club.id) });
        onEnrollmentChange?.(club.id, true);
      },
      onError: (err) => toast.error(err.message || "Failed to enroll")
    });
  };

  const handleUnenroll = () => {
    if (!club) return;
    unenrollMutation.mutate({ id: club.id }, {
      onSuccess: () => {
        toast.success("Unenrolled successfully");
        setConfirmUnenroll(false);
        queryClient.invalidateQueries({ queryKey: getGetClubsQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetCalendarEventsQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetClubQueryKey(club.id) });
        onEnrollmentChange?.(club.id, false);
      },
      onError: (err) => { toast.error(err.message || "Failed to unenroll"); setConfirmUnenroll(false); }
    });
  };

  return (
    <Dialog open={!!clubId} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[600px] p-0 overflow-hidden gap-0 rounded-3xl border-none">
        {isLoading || !club ? (
          <div className="h-96 flex items-center justify-center bg-white text-secondary">
            Loading...
          </div>
        ) : (
          <div className="flex flex-col max-h-[85vh]">
            <div className={`p-8 pb-6 flex items-start gap-6 ${getClubColor(club.id)}/10`}>
              <div className={`w-24 h-24 rounded-3xl flex-shrink-0 flex items-center justify-center text-white font-bold text-4xl shadow-md ${getClubColor(club.id)}`}>
                {club.profile_photo ? (
                  <img src={club.profile_photo} alt={club.name} className="w-full h-full object-cover rounded-3xl" />
                ) : (
                  club.initial
                )}
              </div>
              <div className="flex-grow pt-2">
                <span className="inline-block bg-white/60 text-secondary text-xs px-2 py-1 rounded-md font-medium mb-2 backdrop-blur-sm">
                  {club.type}
                </span>
                <DialogTitle className="text-3xl font-bold text-on-surface mb-2 leading-tight">
                  {club.name}
                </DialogTitle>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-secondary font-medium">
                  <span className="flex items-center gap-1"><span className="material-symbols-outlined text-[16px]">schedule</span> {club.default_day}</span>
                  <span className="flex items-center gap-1"><span className="material-symbols-outlined text-[16px]">location_on</span> {club.default_location}</span>
                </div>
              </div>
            </div>

            <div className="p-8 overflow-y-auto bg-white flex-grow">
              <DialogDescription className="sr-only">Details about {club.name}</DialogDescription>
              <div className="mb-8">
                <h4 className="text-sm font-semibold text-secondary uppercase tracking-wider mb-3">About</h4>
                <p className="text-on-surface leading-relaxed">{club.description}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h4 className="text-sm font-semibold text-secondary uppercase tracking-wider mb-3">Leadership</h4>
                  {club.leaders && club.leaders.length > 0 ? (
                    <div className="space-y-3">
                      {club.leaders.map((leader, i) => (
                        <div key={i} className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center text-secondary text-xs font-bold">
                            {leader.name.charAt(0)}
                          </div>
                          <div>
                            <div className="text-sm font-medium text-on-surface">{leader.name}</div>
                            <div className="text-xs text-secondary">{leader.role}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-secondary italic">No leaders listed</p>
                  )}
                </div>

                <div>
                  <h4 className="text-sm font-semibold text-secondary uppercase tracking-wider mb-3">Upcoming Events</h4>
                  {club.upcoming_events && club.upcoming_events.length > 0 ? (
                    <div className="space-y-3">
                      {club.upcoming_events.map(event => (
                        <div key={event.id} className="bg-surface p-3 rounded-xl border border-outline-variant/20">
                          <div className="font-semibold text-sm mb-1">{event.title}</div>
                          <div className="text-xs text-secondary flex flex-col gap-0.5">
                            <span>{format(parseISO(event.event_date), "MMM d, yyyy")} &bull; {event.event_time}</span>
                            <span>{event.location}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-secondary italic bg-surface p-3 rounded-xl text-center">No upcoming events</p>
                  )}
                </div>
              </div>

              {club.chat_link && club.is_enrolled && (
                <div className="mt-8 pt-6 border-t border-outline-variant/20">
                  <a href={club.chat_link} target="_blank" rel="noreferrer" className="flex items-center justify-center gap-2 w-full py-3 bg-[#E3F2FD] text-[#0369A1] rounded-xl font-medium hover:bg-[#BAE6FD] transition-colors">
                    <span className="material-symbols-outlined text-[20px]">chat</span>
                    Join Group Chat
                  </a>
                </div>
              )}
            </div>

            <div className="p-6 bg-surface-container-lowest border-t border-outline-variant/20 shadow-[0_-4px_20px_rgba(0,0,0,0.02)]">
              {club.is_leader ? (
                <Button className="w-full h-12 rounded-xl bg-surface-container text-secondary font-semibold" disabled>
                  You lead this club
                </Button>
              ) : club.is_enrolled ? (
                confirmUnenroll ? (
                  <div className="flex flex-col gap-3">
                    <p className="text-sm text-center text-on-surface font-medium">
                      Are you sure? You will lose your spot.
                    </p>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        className="flex-1 h-10 rounded-xl border-outline-variant/40"
                        onClick={() => setConfirmUnenroll(false)}
                        disabled={unenrollMutation.isPending}
                      >
                        Cancel
                      </Button>
                      <Button
                        variant="destructive"
                        className="flex-1 h-10 rounded-xl"
                        onClick={handleUnenroll}
                        disabled={unenrollMutation.isPending}
                      >
                        {unenrollMutation.isPending ? "Unenrolling..." : "Confirm Unenroll"}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <Button
                    variant="outline"
                    className="w-full h-12 rounded-xl text-error border-error/30 hover:bg-error/5 hover:text-error font-semibold"
                    onClick={() => setConfirmUnenroll(true)}
                  >
                    Unenroll
                  </Button>
                )
              ) : (
                <Button
                  className="w-full h-12 rounded-xl bg-gradient-to-r from-primary to-primary-container text-white font-semibold shadow-md shadow-primary/20 hover:opacity-90"
                  onClick={handleEnroll}
                  disabled={enrollMutation.isPending}
                >
                  {enrollMutation.isPending ? "Enrolling..." : "Join Club"}
                </Button>
              )}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
