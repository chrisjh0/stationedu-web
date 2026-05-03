import { useState } from "react";
import { useGetCalendarEvents, getGetCalendarEventsQueryKey } from "@workspace/api-client-react";
import { ClubDetailModal } from "@/components/ClubDetailModal";
import {
  format, addDays, startOfWeek, isSameDay,
  startOfMonth, endOfMonth, eachDayOfInterval,
  isSameMonth, addMonths, endOfWeek,
} from "date-fns";

type ViewMode = "daily" | "monthly";
type Filter = "All" | "Enrolled" | "Available";

export default function CalendarPage() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedClubId, setSelectedClubId] = useState<number | null>(null);
  const [filter, setFilter] = useState<Filter>("All");
  const [viewMode, setViewMode] = useState<ViewMode>("daily");

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

  const monthStart = startOfMonth(selectedDate);
  const monthEnd = endOfMonth(selectedDate);
  const gridStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const gridEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
  const calDays = eachDayOfInterval({ start: gridStart, end: gridEnd });

  const events = data?.success ? data.events : [];

  const dayEvents = events.filter(e => isSameDay(new Date(e.event_date), selectedDate));
  const filteredEvents = dayEvents.filter(e => {
    if (filter === "All") return true;
    if (filter === "Enrolled") return e.is_enrolled;
    if (filter === "Available") return !e.is_enrolled;
    return true;
  }).sort((a, b) => a.event_time.localeCompare(b.event_time));

  const today = new Date();

  return (
    <div className="max-w-4xl mx-auto px-6">
      <div className="flex items-start justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold font-lexend text-on-surface">
            {format(selectedDate, "MMMM yyyy")}
          </h1>
          <p className="text-secondary text-sm mt-1">
            Today is {format(today, "EEEE, MMMM d")}
          </p>
        </div>
        <div className="bg-surface-container rounded-full p-1 flex mt-1 flex-shrink-0">
          <button
            onClick={() => setViewMode("daily")}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${viewMode === "daily" ? "bg-primary text-white shadow-sm" : "text-secondary hover:text-foreground"}`}
          >
            Daily
          </button>
          <button
            onClick={() => setViewMode("monthly")}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${viewMode === "monthly" ? "bg-primary text-white shadow-sm" : "text-secondary hover:text-foreground"}`}
          >
            Monthly
          </button>
        </div>
      </div>

      {viewMode === "daily" && (
        <>
          <div className="bg-white rounded-2xl shadow-sm p-4 mb-8 flex justify-between items-center">
            <button
              className="w-8 h-8 flex items-center justify-center text-secondary hover:bg-surface-container rounded-full transition-colors"
              onClick={() => setSelectedDate(addDays(selectedDate, -7))}
            >
              <span className="material-symbols-outlined">chevron_left</span>
            </button>

            <div className="flex gap-1 sm:gap-2 md:gap-4">
              {weekDays.map(day => {
                const isSelected = isSameDay(day, selectedDate);
                const dayStr = format(day, "yyyy-MM-dd");
                const hasEnrolled = events.some(e => e.event_date === dayStr && e.is_enrolled);
                const hasAvailable = events.some(e => e.event_date === dayStr && !e.is_enrolled);
                const isToday = isSameDay(day, today);

                return (
                  <div
                    key={day.toISOString()}
                    className={`flex flex-col items-center cursor-pointer p-2 rounded-2xl w-11 transition-colors ${isSelected ? "bg-primary text-white" : isToday ? "ring-1 ring-primary hover:bg-surface-container" : "hover:bg-surface-container"}`}
                    onClick={() => setSelectedDate(day)}
                  >
                    <span className={`text-xs font-medium mb-1 ${isSelected ? "text-white/80" : "text-secondary"}`}>
                      {format(day, "EEE").charAt(0)}
                    </span>
                    <span className="text-lg font-semibold">{format(day, "d")}</span>
                    <div className="flex gap-0.5 mt-1 h-2">
                      {hasEnrolled && <div className={`w-1.5 h-1.5 rounded-full ${isSelected ? "bg-white/70" : "bg-red-500"}`}></div>}
                      {hasAvailable && <div className={`w-1.5 h-1.5 rounded-full ${isSelected ? "bg-white/70" : "bg-green-500"}`}></div>}
                    </div>
                  </div>
                );
              })}
            </div>

            <button
              className="w-8 h-8 flex items-center justify-center text-secondary hover:bg-surface-container rounded-full transition-colors"
              onClick={() => setSelectedDate(addDays(selectedDate, 7))}
            >
              <span className="material-symbols-outlined">chevron_right</span>
            </button>
          </div>

          <div className="mb-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <h2 className="text-xl font-semibold text-on-surface">
                {format(selectedDate, "EEEE, MMMM d")}
              </h2>
              <div>
                <p className="text-[11px] font-semibold text-secondary uppercase tracking-wider mb-2">Quick Filters</p>
                <div className="flex gap-2">
                  {(["All", "Enrolled", "Available"] as Filter[]).map(f => (
                    <button
                      key={f}
                      onClick={() => setFilter(f)}
                      className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${filter === f ? "bg-primary text-white border-primary" : "border-outline-variant/40 text-secondary hover:bg-surface-container"}`}
                    >
                      {f === "All" ? "All Events" : f}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {isLoading ? (
            <div className="animate-pulse space-y-4">
              {[1, 2, 3].map(i => <div key={i} className="h-24 bg-gray-200 rounded-2xl"></div>)}
            </div>
          ) : filteredEvents.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-2xl shadow-sm">
              <span className="material-symbols-outlined text-4xl text-secondary opacity-40 mb-2 block">event_busy</span>
              <p className="text-secondary font-medium">No events on this day.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredEvents.map(event => {
                const hour = parseInt(event.event_time.split(":")[0]);
                const minute = event.event_time.split(":")[1];
                const isPM = hour >= 12;
                const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;

                return (
                  <div
                    key={event.id}
                    className="bg-white rounded-2xl shadow-sm flex overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => setSelectedClubId(event.club_id)}
                  >
                    <div className={`w-1.5 flex-shrink-0 ${event.is_enrolled ? "bg-red-500" : "bg-green-500"}`} />

                    <div className="flex flex-1 items-center gap-4 p-4">
                      <div className="w-16 flex-shrink-0 flex flex-col justify-center border-r border-outline-variant/30 pr-4">
                        <span className="font-semibold text-lg leading-tight">{displayHour}:{minute}</span>
                        <span className="text-xs text-secondary">{isPM ? "PM" : "AM"}</span>
                      </div>

                      <div className="flex-grow min-w-0">
                        <h3 className="font-semibold text-base leading-tight">{event.title}</h3>
                        <p className="text-sm text-secondary">{event.club_name}</p>
                        <div className="flex items-center gap-1 mt-1.5 text-xs text-secondary">
                          <span className="material-symbols-outlined text-[13px]">location_on</span>
                          {event.location}
                        </div>
                      </div>

                      <div className="flex-shrink-0 flex items-center gap-2">
                        {event.is_enrolled ? (
                          <span className="bg-red-100 text-red-600 text-xs px-2.5 py-1 rounded-full font-medium whitespace-nowrap">
                            Enrolled
                          </span>
                        ) : (
                          <>
                            <span className="bg-green-100 text-green-600 text-xs px-2.5 py-1 rounded-full font-medium whitespace-nowrap">
                              Available
                            </span>
                            <button
                              className="bg-gradient-to-r from-primary to-primary-container text-white text-xs px-3 py-1.5 rounded-lg font-medium hover:opacity-90 transition-opacity whitespace-nowrap"
                              onClick={e => { e.stopPropagation(); setSelectedClubId(event.club_id); }}
                            >
                              Join
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {viewMode === "monthly" && (
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <button
              className="w-8 h-8 flex items-center justify-center text-secondary hover:bg-surface-container rounded-full transition-colors"
              onClick={() => setSelectedDate(addMonths(selectedDate, -1))}
            >
              <span className="material-symbols-outlined">chevron_left</span>
            </button>
            <span className="font-semibold text-on-surface">{format(selectedDate, "MMMM yyyy")}</span>
            <button
              className="w-8 h-8 flex items-center justify-center text-secondary hover:bg-surface-container rounded-full transition-colors"
              onClick={() => setSelectedDate(addMonths(selectedDate, 1))}
            >
              <span className="material-symbols-outlined">chevron_right</span>
            </button>
          </div>

          <div className="grid grid-cols-7 mb-1">
            {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map(d => (
              <div key={d} className="text-center text-xs font-semibold text-secondary py-2">{d}</div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-0.5">
            {calDays.map(day => {
              const dayStr = format(day, "yyyy-MM-dd");
              const isSelected = isSameDay(day, selectedDate);
              const isCurrentMonth = isSameMonth(day, selectedDate);
              const hasEnrolled = events.some(e => e.event_date === dayStr && e.is_enrolled);
              const hasAvailable = events.some(e => e.event_date === dayStr && !e.is_enrolled);
              const isToday = isSameDay(day, today);

              return (
                <div
                  key={day.toISOString()}
                  onClick={() => { setSelectedDate(day); setViewMode("daily"); }}
                  className={`
                    flex flex-col items-center justify-center cursor-pointer rounded-xl transition-colors min-h-[52px] px-1
                    ${isSelected ? "bg-primary text-white" : isToday ? "ring-1 ring-primary hover:bg-surface-container" : "hover:bg-surface-container"}
                    ${!isCurrentMonth ? "opacity-25" : ""}
                  `}
                >
                  <span className="text-sm font-medium">{format(day, "d")}</span>
                  <div className="flex gap-0.5 mt-0.5 h-2">
                    {hasEnrolled && <div className={`w-1.5 h-1.5 rounded-full ${isSelected ? "bg-white/70" : "bg-red-500"}`} />}
                    {hasAvailable && <div className={`w-1.5 h-1.5 rounded-full ${isSelected ? "bg-white/70" : "bg-green-500"}`} />}
                  </div>
                </div>
              );
            })}
          </div>

          <p className="text-center text-xs text-secondary mt-5 opacity-70">
            Click any day to view its schedule
          </p>
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
