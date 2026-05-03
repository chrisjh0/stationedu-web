import { useState } from "react";
import { useGetCalendarEvents, getGetCalendarEventsQueryKey } from "@workspace/api-client-react";
import { ClubDetailModal } from "@/components/ClubDetailModal";
import { format, addDays, startOfWeek, isSameDay } from "date-fns";

export default function CalendarPage() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedClubId, setSelectedClubId] = useState<number | null>(null);
  const [filter, setFilter] = useState<"All" | "Enrolled" | "Available">("All");

  const calendarParams = {
    year: selectedDate.getFullYear(),
    month: selectedDate.getMonth() + 1,
  };
  const { data, isLoading } = useGetCalendarEvents(calendarParams, {
    query: {
      queryKey: getGetCalendarEventsQueryKey(calendarParams),
    }
  });

  const weekStart = startOfWeek(selectedDate, { weekStartsOn: 1 });
  const weekDays = Array.from({ length: 7 }).map((_, i) => addDays(weekStart, i));

  const events = data?.success ? data.events : [];
  
  const dayEvents = events.filter(e => isSameDay(new Date(e.event_date), selectedDate));
  
  const filteredEvents = dayEvents.filter(e => {
    if (filter === "All") return true;
    if (filter === "Enrolled") return e.is_enrolled;
    if (filter === "Available") return !e.is_enrolled;
    return true;
  }).sort((a, b) => a.event_time.localeCompare(b.event_time));

  return (
    <div className="max-w-4xl mx-auto px-6">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-semibold">Calendar</h1>
        <div className="bg-surface-container rounded-full p-1 flex">
          <button className="px-4 py-1 rounded-full bg-white shadow-sm text-sm font-medium">Daily</button>
          <button className="px-4 py-1 rounded-full text-secondary text-sm font-medium">Monthly</button>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm p-4 mb-8 flex justify-between items-center">
        <button 
          className="w-8 h-8 flex items-center justify-center text-secondary hover:bg-surface-container rounded-full"
          onClick={() => setSelectedDate(addDays(selectedDate, -7))}
        >
          <span className="material-symbols-outlined">chevron_left</span>
        </button>
        
        <div className="flex gap-2 sm:gap-4 md:gap-8">
          {weekDays.map(day => {
            const isSelected = isSameDay(day, selectedDate);
            const dayStr = format(day, "yyyy-MM-dd");
            const hasEnrolled = events.some(e => e.event_date === dayStr && e.is_enrolled);
            const hasAvailable = events.some(e => e.event_date === dayStr && !e.is_enrolled);
            
            return (
              <div 
                key={day.toISOString()} 
                className={`flex flex-col items-center cursor-pointer p-2 rounded-full w-12 h-16 ${isSelected ? 'bg-primary/10 text-primary' : 'hover:bg-surface-container'}`}
                onClick={() => setSelectedDate(day)}
              >
                <span className="text-xs font-medium mb-1">{format(day, "EE").charAt(0)}</span>
                <span className={`text-lg font-semibold ${isSelected ? 'text-primary' : ''}`}>{format(day, "d")}</span>
                <div className="flex gap-0.5 mt-1">
                  {hasEnrolled && <div className="w-1.5 h-1.5 rounded-full bg-red-500"></div>}
                  {hasAvailable && !hasEnrolled && <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>}
                </div>
              </div>
            );
          })}
        </div>

        <button 
          className="w-8 h-8 flex items-center justify-center text-secondary hover:bg-surface-container rounded-full"
          onClick={() => setSelectedDate(addDays(selectedDate, 7))}
        >
          <span className="material-symbols-outlined">chevron_right</span>
        </button>
      </div>

      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold">{format(selectedDate, "EEEE")}'s Schedule</h2>
        <div className="flex gap-2">
          {["All", "Enrolled", "Available"].map(f => (
            <button 
              key={f}
              onClick={() => setFilter(f as any)}
              className={`px-3 py-1 rounded-full text-xs font-medium border ${filter === f ? 'bg-secondary text-white border-secondary' : 'border-outline-variant text-secondary hover:bg-surface-container'}`}
            >
              {f === "All" ? "All Events" : f}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="animate-pulse space-y-4">
          {[1,2,3].map(i => <div key={i} className="h-20 bg-gray-200 rounded-2xl"></div>)}
        </div>
      ) : filteredEvents.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl shadow-sm">
          <span className="material-symbols-outlined text-4xl text-secondary opacity-50 mb-2">event_busy</span>
          <p className="text-secondary font-medium">No events on this day.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredEvents.map(event => (
            <div 
              key={event.id}
              className={`bg-white rounded-2xl shadow-sm p-4 flex gap-4 cursor-pointer hover:shadow-md transition-shadow border-l-4 ${event.is_enrolled ? 'border-primary' : 'border-transparent'}`}
              onClick={() => setSelectedClubId(event.club_id)}
            >
              <div className="w-20 flex-shrink-0 flex flex-col justify-center border-r border-outline-variant/30 pr-4">
                <span className="font-semibold text-lg">{event.event_time.split(":")[0]}:{event.event_time.split(":")[1]}</span>
                <span className="text-xs text-secondary">{parseInt(event.event_time.split(":")[0]) >= 12 ? 'PM' : 'AM'}</span>
              </div>
              <div className="flex-grow">
                <h3 className="font-semibold text-lg">{event.title}</h3>
                <p className="text-sm text-secondary">{event.club_name}</p>
                <div className="flex items-center gap-1 mt-2 text-xs text-secondary">
                  <span className="material-symbols-outlined text-xs">location_on</span>
                  {event.location}
                </div>
              </div>
              {event.is_enrolled && (
                <div className="flex-shrink-0 flex items-center">
                  <span className="bg-primary/10 text-primary text-xs px-2 py-1 rounded-full font-medium">Enrolled</span>
                </div>
              )}
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
