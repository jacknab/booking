import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { format, addDays, subDays, startOfDay, endOfDay } from "date-fns";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Bell, BarChart2, Users, Menu, Plus, X } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";

interface StaffMember {
  id: number;
  name: string;
  color: string;
  storeId: number;
  avatarUrl?: string;
}

interface AppointmentEntry {
  id: number;
  date: string;
  duration: number;
  status: string;
  customer?: { name: string };
  service?: { name: string };
  staff?: { name: string; color: string };
}

interface AvailabilityEntry {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
}

const HOUR_HEIGHT = 80;
const START_HOUR = 7;
const END_HOUR = 21;

function parseTimeToMinutes(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

function getInitial(name: string) {
  return name?.charAt(0)?.toUpperCase() ?? "S";
}

function formatHour(hour: number) {
  if (hour === 12) return "12:00pm";
  if (hour < 12) return `${hour}:00am`;
  return `${hour - 12}:00pm`;
}

export default function StaffCalendar() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [activeTab, setActiveTab] = useState<"calendar" | "stats" | "clients" | "menu">("calendar");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate("/staff-auth");
    }
  }, [isAuthenticated, authLoading, navigate]);

  const staffId = user?.staffId;

  const { data: staffMember } = useQuery<StaffMember>({
    queryKey: ["/api/staff", staffId],
    queryFn: async () => {
      const res = await fetch(`/api/staff/${staffId}`, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch staff");
      return res.json();
    },
    enabled: !!staffId,
  });

  const { data: availability } = useQuery<AvailabilityEntry[]>({
    queryKey: ["/api/staff", staffId, "availability"],
    queryFn: async () => {
      const res = await fetch(`/api/staff/${staffId}/availability`, { credentials: "include" });
      if (!res.ok) return [];
      return res.json();
    },
    enabled: !!staffId,
  });

  const storeId = staffMember?.storeId;

  const { data: appointments = [] } = useQuery<AppointmentEntry[]>({
    queryKey: ["/api/appointments", storeId, staffId, format(selectedDate, "yyyy-MM-dd")],
    queryFn: async () => {
      const from = startOfDay(selectedDate).toISOString();
      const to = endOfDay(selectedDate).toISOString();
      const params = new URLSearchParams({
        storeId: String(storeId),
        staffId: String(staffId),
        from,
        to,
      });
      const res = await fetch(`/api/appointments?${params}`, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch appointments");
      return res.json();
    },
    enabled: !!storeId && !!staffId,
  });

  const todayAvailability = availability?.find(
    (a) => a.dayOfWeek === selectedDate.getDay()
  );

  const workStart = todayAvailability ? parseTimeToMinutes(todayAvailability.startTime) : 9 * 60;
  const workEnd = todayAvailability ? parseTimeToMinutes(todayAvailability.endTime) : 18 * 60;

  useEffect(() => {
    if (scrollRef.current) {
      const scrollTo = ((workStart / 60) - START_HOUR) * HOUR_HEIGHT - 20;
      scrollRef.current.scrollTop = Math.max(0, scrollTo);
    }
  }, [workStart, staffMember]);

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white">
        <div className="w-8 h-8 border-4 border-[#1a2340] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const staffName = staffMember?.name ?? user?.firstName ?? "Staff";
  const initials = getInitial(staffName);
  const staffColor = staffMember?.color ?? "#3b82f6";

  const workStartLabel = todayAvailability
    ? format(new Date(`2000-01-01T${todayAvailability.startTime}`), "h:mm a").toLowerCase()
    : "9:00 am";
  const workEndLabel = todayAvailability
    ? format(new Date(`2000-01-01T${todayAvailability.endTime}`), "h:mm a").toLowerCase()
    : "6:00 pm";

  return (
    <div className="flex flex-col h-screen bg-gray-50 max-w-md mx-auto relative overflow-hidden">
      {/* Header */}
      <div className="bg-white border-b flex items-center justify-between px-4 py-3 shrink-0 z-10">
        <button className="w-9 h-9 flex items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100">
          <CalendarIcon className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-2">
          <button
            className="p-1 text-gray-400 hover:text-gray-700"
            onClick={() => setSelectedDate(subDays(selectedDate, 1))}
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            className="font-semibold text-sm text-gray-800 hover:text-[#1a2340] transition-colors px-1"
            onClick={() => setShowDatePicker(true)}
          >
            {format(selectedDate, "EEE d MMM, yyyy")}
          </button>
          <button
            className="p-1 text-gray-400 hover:text-gray-700"
            onClick={() => setSelectedDate(addDays(selectedDate, 1))}
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
        <button className="w-9 h-9 flex items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100">
          <Bell className="w-5 h-5" />
        </button>
      </div>

      {/* Staff header */}
      <div className="bg-white border-b px-4 py-3 flex flex-col items-center shrink-0">
        <div
          className="w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold mb-1"
          style={{ backgroundColor: `${staffColor}22`, color: staffColor }}
        >
          {staffMember?.avatarUrl ? (
            <img src={staffMember.avatarUrl} alt={staffName} className="w-full h-full rounded-full object-cover" />
          ) : (
            initials
          )}
        </div>
        <p className="font-semibold text-gray-800 text-sm">{staffName}</p>
        <p className="text-xs text-gray-400 mt-0.5">
          {workStartLabel} - {workEndLabel}
        </p>
      </div>

      {/* Calendar Grid */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto bg-white">
        <div className="relative" style={{ height: `${(END_HOUR - START_HOUR) * HOUR_HEIGHT}px` }}>
          {/* Time column + grid lines */}
          {Array.from({ length: END_HOUR - START_HOUR }, (_, i) => {
            const hour = START_HOUR + i;
            const topPx = i * HOUR_HEIGHT;
            const hourMinutes = hour * 60;
            const isBeforeWork = hourMinutes < workStart;
            const isAfterWork = hourMinutes >= workEnd;
            const isNonWorking = isBeforeWork || isAfterWork;

            return (
              <div key={hour} className="absolute left-0 right-0 flex" style={{ top: topPx, height: HOUR_HEIGHT }}>
                {/* Time label */}
                <div className="w-16 shrink-0 flex items-start justify-end pr-3 pt-1">
                  <span className="text-xs text-gray-400 font-medium">{formatHour(hour)}</span>
                </div>
                {/* Slot */}
                <div className="flex-1 border-t border-gray-100 relative">
                  {isNonWorking && (
                    <div
                      className="absolute inset-0"
                      style={{
                        background: `repeating-linear-gradient(
                          -45deg,
                          transparent,
                          transparent 6px,
                          rgba(0,0,0,0.04) 6px,
                          rgba(0,0,0,0.04) 12px
                        )`,
                        backgroundColor: "rgba(0,0,0,0.01)",
                      }}
                    />
                  )}
                  {/* Half-hour line */}
                  <div className="absolute left-0 right-0 border-t border-gray-50 border-dashed" style={{ top: HOUR_HEIGHT / 2 }} />
                </div>
              </div>
            );
          })}

          {/* Appointments */}
          {appointments.map((apt) => {
            const aptDate = new Date(apt.date);
            const aptMinutes = aptDate.getHours() * 60 + aptDate.getMinutes();
            const topPx = ((aptMinutes / 60) - START_HOUR) * HOUR_HEIGHT;
            const heightPx = (apt.duration / 60) * HOUR_HEIGHT;
            const aptColor = apt.staff?.color ?? staffColor;

            return (
              <div
                key={apt.id}
                className="absolute rounded-lg px-2 py-1 shadow-sm overflow-hidden cursor-pointer"
                style={{
                  top: topPx,
                  left: 68,
                  right: 8,
                  height: Math.max(heightPx, 32),
                  backgroundColor: `${aptColor}22`,
                  borderLeft: `3px solid ${aptColor}`,
                }}
              >
                <p className="text-xs font-semibold truncate" style={{ color: aptColor }}>
                  {apt.customer?.name ?? "Client"}
                </p>
                {apt.service && (
                  <p className="text-xs text-gray-500 truncate">{apt.service.name}</p>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Bottom Tab Bar */}
      <div className="shrink-0 px-4 pb-4 pt-2 bg-transparent">
        <div className="bg-white rounded-2xl shadow-lg flex items-center justify-around px-2 py-2 relative">
          <TabButton
            icon={<CalendarIcon className="w-5 h-5" />}
            label="Calendar"
            active={activeTab === "calendar"}
            onClick={() => setActiveTab("calendar")}
          />
          <TabButton
            icon={<BarChart2 className="w-5 h-5" />}
            label="Stats"
            active={activeTab === "stats"}
            onClick={() => setActiveTab("stats")}
          />
          {/* Center + button */}
          <div className="flex flex-col items-center">
            <button
              className="w-14 h-14 rounded-full bg-[#1a2340] flex items-center justify-center shadow-lg -mt-8 mb-1"
              onClick={() => {}}
            >
              <Plus className="w-6 h-6 text-white" />
            </button>
          </div>
          <TabButton
            icon={<Users className="w-5 h-5" />}
            label="Clients"
            active={activeTab === "clients"}
            onClick={() => setActiveTab("clients")}
          />
          <TabButton
            icon={<Menu className="w-5 h-5" />}
            label="Menu"
            active={activeTab === "menu"}
            onClick={() => setActiveTab("menu")}
          />
        </div>
      </div>

      {/* Full-screen Date Picker Overlay */}
      {showDatePicker && (
        <div className="absolute inset-0 bg-white z-50 flex flex-col">
          <div className="flex items-center justify-between px-4 py-4 border-b">
            <h2 className="text-lg font-semibold text-gray-800">Select Date</h2>
            <button
              className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-500"
              onClick={() => setShowDatePicker(false)}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="flex-1 flex items-start justify-center pt-4">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={(date) => {
                if (date) {
                  setSelectedDate(date);
                  setShowDatePicker(false);
                }
              }}
              className="rounded-md border-0"
              initialFocus
            />
          </div>
        </div>
      )}

      {/* Placeholder overlay for non-calendar tabs */}
      {activeTab !== "calendar" && (
        <div className="absolute inset-0 bg-white z-30 flex flex-col items-center justify-center gap-4 px-8">
          {activeTab === "stats" && (
            <>
              <BarChart2 className="w-16 h-16 text-gray-200" />
              <p className="text-gray-400 text-center font-medium">Stats & Analytics coming soon</p>
            </>
          )}
          {activeTab === "clients" && (
            <>
              <Users className="w-16 h-16 text-gray-200" />
              <p className="text-gray-400 text-center font-medium">Client list coming soon</p>
            </>
          )}
          {activeTab === "menu" && (
            <>
              <Menu className="w-16 h-16 text-gray-200" />
              <p className="text-gray-400 text-center font-medium">Menu coming soon</p>
            </>
          )}
          <button
            className="mt-4 px-6 py-2 bg-[#1a2340] text-white rounded-full text-sm font-medium"
            onClick={() => setActiveTab("calendar")}
          >
            Back to Calendar
          </button>
        </div>
      )}
    </div>
  );
}

function TabButton({
  icon,
  label,
  active,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      className="flex flex-col items-center gap-0.5 px-3 py-1"
      onClick={onClick}
    >
      <span className={active ? "text-[#00bfae]" : "text-gray-400"}>{icon}</span>
      <span className={`text-[10px] font-medium ${active ? "text-[#00bfae]" : "text-gray-400"}`}>
        {label}
      </span>
    </button>
  );
}
