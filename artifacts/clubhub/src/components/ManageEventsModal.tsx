import { useState } from "react";
import { useGetClubEvents, useCreateClubEvent, useDeleteEvent } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { useQueryClient } from "@tanstack/react-query";
import { getGetClubEventsQueryKey, getGetCalendarEventsQueryKey, getGetLeadingClubsQueryKey } from "@workspace/api-client-react";
import { toast } from "sonner";
import { format, parseISO } from "date-fns";

export function ManageEventsModal({ clubId, onClose }: { clubId: number, onClose: () => void }) {
  const { data, isLoading } = useGetClubEvents(clubId);
  const createMutation = useCreateClubEvent();
  const deleteMutation = useDeleteEvent();
  const queryClient = useQueryClient();

  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");

  const events = data?.success ? data.events : [];

  const handleAdd = () => {
    if (!title || !date || !time || !location) {
      toast.error("Please fill all required fields");
      return;
    }

    createMutation.mutate({
      id: clubId,
      data: {
        title,
        event_date: date,
        event_time: time,
        location,
        description: description || undefined
      }
    }, {
      onSuccess: () => {
        toast.success("Event added successfully");
        queryClient.invalidateQueries({ queryKey: getGetClubEventsQueryKey(clubId) });
        queryClient.invalidateQueries({ queryKey: getGetCalendarEventsQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetLeadingClubsQueryKey() });
        setTitle("");
        setDate("");
        setTime("");
        setLocation("");
        setDescription("");
      },
      onError: (err) => {
        toast.error(err.message || "Failed to add event");
      }
    });
  };

  const handleDelete = (eventId: number) => {
    deleteMutation.mutate({ id: eventId }, {
      onSuccess: () => {
        toast.success("Event deleted");
        queryClient.invalidateQueries({ queryKey: getGetClubEventsQueryKey(clubId) });
        queryClient.invalidateQueries({ queryKey: getGetCalendarEventsQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetLeadingClubsQueryKey() });
      },
      onError: (err) => toast.error(err.message || "Failed to delete event")
    });
  };

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-hidden p-0 rounded-3xl flex flex-col">
        <div className="p-6 border-b border-outline-variant/20 flex-shrink-0">
          <DialogTitle className="text-2xl font-bold">Manage Events</DialogTitle>
        </div>

        <div className="flex flex-col md:flex-row flex-grow overflow-hidden">
          <div className="w-full md:w-1/2 p-6 bg-surface-container-lowest overflow-y-auto border-r border-outline-variant/20">
            <h3 className="font-semibold text-lg mb-4 text-on-surface">Schedule New Event</h3>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-medium text-secondary uppercase">Event Title</label>
                <Input value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. General Meeting" className="bg-surface border-outline-variant/30 rounded-xl" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-medium text-secondary uppercase">Date</label>
                  <Input type="date" value={date} onChange={e => setDate(e.target.value)} className="bg-surface border-outline-variant/30 rounded-xl" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-medium text-secondary uppercase">Time</label>
                  <Input type="time" value={time} onChange={e => setTime(e.target.value)} className="bg-surface border-outline-variant/30 rounded-xl" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-medium text-secondary uppercase">Location</label>
                <Input value={location} onChange={e => setLocation(e.target.value)} placeholder="e.g. Room 101" className="bg-surface border-outline-variant/30 rounded-xl" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-medium text-secondary uppercase">Description (Optional)</label>
                <Input value={description} onChange={e => setDescription(e.target.value)} placeholder="What's on the agenda?" className="bg-surface border-outline-variant/30 rounded-xl" />
              </div>
              <Button 
                className="w-full bg-primary text-white rounded-xl mt-2" 
                onClick={handleAdd}
                disabled={createMutation.isPending}
              >
                {createMutation.isPending ? "Adding..." : "Add Event to Calendar"}
              </Button>
            </div>
          </div>

          <div className="w-full md:w-1/2 p-6 bg-surface overflow-y-auto">
            <h3 className="font-semibold text-lg mb-4 text-on-surface">Upcoming Events</h3>
            {isLoading ? (
              <div className="text-secondary text-sm">Loading events...</div>
            ) : events.length === 0 ? (
              <div className="text-center py-10 bg-white rounded-2xl border border-dashed border-outline-variant/30">
                <span className="material-symbols-outlined text-3xl text-secondary opacity-50 mb-2">event_busy</span>
                <p className="text-secondary text-sm">No upcoming events scheduled.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {events.map(event => (
                  <div key={event.id} className="bg-white p-4 rounded-2xl shadow-sm border border-outline-variant/10 flex justify-between items-start gap-2">
                    <div>
                      <h4 className="font-semibold text-on-surface">{event.title}</h4>
                      <p className="text-xs text-secondary mt-1 flex flex-col gap-0.5">
                        <span className="flex items-center gap-1"><span className="material-symbols-outlined text-[14px]">calendar_today</span> {format(parseISO(event.event_date), "MMM d, yyyy")}</span>
                        <span className="flex items-center gap-1"><span className="material-symbols-outlined text-[14px]">schedule</span> {event.event_time}</span>
                        <span className="flex items-center gap-1"><span className="material-symbols-outlined text-[14px]">location_on</span> {event.location}</span>
                      </p>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="text-error hover:bg-error/10 hover:text-error h-8 w-8"
                      onClick={() => handleDelete(event.id)}
                      disabled={deleteMutation.isPending}
                    >
                      <span className="material-symbols-outlined text-[18px]">delete</span>
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
