import { useRef, useState, useCallback, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { addMinutes } from "date-fns";
import { formatInTz } from "@/lib/timezone";
import { cn } from "@/lib/utils";
import { ChevronDown, ChevronUp, X } from "lucide-react";

const SWIPE_HINT_KEY = "certxa_cal_swipe_hint_seen";

const MOBILE_TIME_COL_WIDTH = 72;

interface MobileCalendarViewProps {
  filteredStaff: any[];
  timeSlots: { hour: number; minute: number; label: string; isHour: boolean }[];
  START_HOUR: number;
  END_HOUR: number;
  TOTAL_HOURS: number;
  HOUR_HEIGHT: number;
  getAppointmentsForStaff: (staffId: number) => any[];
  getAppointmentStyle: (apt: any) => { top: string; height: string };
  getStaffColor: (member: any) => string;
  timezone: string;
  selectedAppointment: any | null;
  onSelectAppointment: (apt: any) => void;
  handleSlotClick: (staffId: number, hour: number, minute: number) => void;
  selectedSlot: { staffId: number; hour: number; minute: number } | null;
  setSelectedSlot: (slot: null) => void;
  handleBookSlot: (staffId: number, hour: number, minute: number) => void;
  isToday: boolean;
  timeLinePosition: number | null;
  timeLineLabel: string;
  showPrices: boolean;
  lateGracePeriodMinutes: number;
  storeNow: Date;
  settings: { timeSlotInterval: number };
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
}

export function MobileCalendarView({
  filteredStaff,
  timeSlots,
  START_HOUR,
  END_HOUR,
  TOTAL_HOURS,
  HOUR_HEIGHT,
  getAppointmentsForStaff,
  getAppointmentStyle,
  getStaffColor,
  timezone,
  selectedAppointment,
  onSelectAppointment,
  handleSlotClick,
  selectedSlot,
  setSelectedSlot,
  handleBookSlot,
  isToday,
  timeLinePosition,
  timeLineLabel,
  showPrices,
  lateGracePeriodMinutes,
  storeNow,
  onSwipeLeft,
  onSwipeRight,
}: MobileCalendarViewProps) {
  const [collapsedStaff, setCollapsedStaff] = useState<Set<number>>(new Set());
  const [showSwipeHint, setShowSwipeHint] = useState(false);
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);

  useEffect(() => {
    if (!localStorage.getItem(SWIPE_HINT_KEY)) {
      setShowSwipeHint(true);
      const timer = setTimeout(() => {
        setShowSwipeHint(false);
        localStorage.setItem(SWIPE_HINT_KEY, "1");
      }, 2200);
      return () => clearTimeout(timer);
    }
  }, []);

  const toggleCollapse = useCallback((staffId: number) => {
    setCollapsedStaff(prev => {
      const next = new Set(prev);
      if (next.has(staffId)) next.delete(staffId);
      else next.add(staffId);
      return next;
    });
  }, []);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null || touchStartY.current === null) return;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    const dy = e.changedTouches[0].clientY - touchStartY.current;
    if (Math.abs(dx) > 55 && Math.abs(dx) > Math.abs(dy) * 1.5) {
      if (dx < 0) onSwipeLeft?.();
      else onSwipeRight?.();
    }
    touchStartX.current = null;
    touchStartY.current = null;
  };

  if (filteredStaff.length === 0) {
    return (
      <div className="flex items-center justify-center text-muted-foreground text-sm py-20">
        No staff members found for this store.
      </div>
    );
  }

  return (
    <div
      className="flex flex-col w-full relative"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* One-time swipe hint overlay */}
      {showSwipeHint && (
        <div
          className="fixed bottom-20 inset-x-0 flex justify-center z-[60] pointer-events-none"
          style={{
            animation: "swipeHintFade 2.2s ease forwards",
          }}
        >
          <div className="flex items-center gap-3 bg-gray-900/85 text-white px-5 py-2.5 rounded-full shadow-xl backdrop-blur-sm">
            <span className="text-lg select-none" aria-hidden>←</span>
            <span className="text-sm font-medium tracking-wide">Swipe to change day</span>
            <span className="text-lg select-none" aria-hidden>→</span>
          </div>
        </div>
      )}

      <style>{`
        @keyframes swipeHintFade {
          0%   { opacity: 0; transform: translateY(8px); }
          15%  { opacity: 1; transform: translateY(0); }
          75%  { opacity: 1; transform: translateY(0); }
          100% { opacity: 0; transform: translateY(-6px); }
        }
      `}</style>

      {filteredStaff.map((member: any, idx: number) => {
        const staffApts = getAppointmentsForStaff(member.id);
        const color = getStaffColor(member);
        const isCollapsed = collapsedStaff.has(member.id);
        const aptCount = staffApts.length;

        return (
          <div
            key={member.id}
            className={cn(
              "flex flex-col border-b last:border-b-0",
              idx > 0 && "border-t-4 border-t-border/60"
            )}
          >
            {/* Sticky staff header */}
            <div
              className="sticky top-0 z-20 flex items-center gap-2.5 px-3 py-2.5 bg-card border-b cursor-pointer select-none"
              onClick={() => toggleCollapse(member.id)}
            >
              <Avatar className="w-9 h-9 flex-shrink-0">
                {member.avatarUrl && (
                  <AvatarImage src={member.avatarUrl} alt={member.name} className="object-cover" />
                )}
                <AvatarFallback
                  style={{ backgroundColor: color + "22", color }}
                  className="text-xs font-bold"
                >
                  {member.name.split(" ").map((n: string) => n[0]).join("").toUpperCase()}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold truncate">{member.name}</p>
                <p className="text-xs text-muted-foreground">
                  {aptCount === 0
                    ? "No appointments"
                    : `${aptCount} appointment${aptCount !== 1 ? "s" : ""}`}
                </p>
              </div>

              <div className="flex items-center gap-1.5 flex-shrink-0">
                {aptCount > 0 && (
                  <div
                    className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold text-white"
                    style={{ backgroundColor: color }}
                  >
                    {aptCount}
                  </div>
                )}
                {isCollapsed ? (
                  <ChevronDown className="w-4 h-4 text-muted-foreground" />
                ) : (
                  <ChevronUp className="w-4 h-4 text-muted-foreground" />
                )}
              </div>
            </div>

            {/* Time grid */}
            {!isCollapsed && (
              <div className="relative flex" style={{ backgroundColor: "#d9e2ea" }}>
                {/* Current time line — spans full width: pill over time col, line over appt col */}
                {isToday && timeLinePosition !== null && (
                  <div
                    className="absolute left-0 right-0 z-20 pointer-events-none flex items-center -translate-y-1/2"
                    style={{ top: `${timeLinePosition}px` }}
                  >
                    <div
                      className="flex-shrink-0 flex items-center justify-center text-[10px] font-bold text-white rounded"
                      style={{ width: MOBILE_TIME_COL_WIDTH, backgroundColor: "#2563eb", padding: "2px 4px" }}
                    >
                      {timeLineLabel}
                    </div>
                    <div className="flex-1 h-[2px]" style={{ backgroundColor: "#2563eb" }} />
                  </div>
                )}
                {/* Time label column */}
                <div
                  className="flex-shrink-0 bg-card z-10 sticky left-0"
                  style={{ width: MOBILE_TIME_COL_WIDTH }}
                >
                  <div
                    className="relative"
                    style={{ height: `${TOTAL_HOURS * HOUR_HEIGHT}px` }}
                  >
                    {Array.from({ length: TOTAL_HOURS * 4 + 1 }, (_, i) => {
                      const totalMins = i * 15;
                      const h = START_HOUR + Math.floor(totalMins / 60);
                      const m = totalMins % 60;
                      if (h > END_HOUR || (h === END_HOUR && m > 0)) return null;
                      const isHour = m === 0;
                      const isHalf = m === 30;
                      if (!isHour && !isHalf) return null;
                      const topPx = (totalMins / 60) * HOUR_HEIGHT;

                      if (isHour) {
                        const hMod = h % 24;
                        const displayH = hMod === 0 ? 12 : hMod > 12 ? hMod - 12 : hMod;
                        const ampm = hMod >= 12 ? "PM" : "AM";
                        return (
                          <div
                            key={`label-${h}-${m}`}
                            className="absolute left-0 right-0 flex items-center justify-end gap-1 pr-1.5 -translate-y-1/2"
                            style={{ top: `${topPx}px` }}
                          >
                            <div className="flex flex-col items-end leading-none">
                              <span className="text-[13px] font-bold text-foreground tabular-nums leading-none">
                                {displayH}:00
                              </span>
                              <span className="text-[10px] font-semibold text-foreground/60 leading-none mt-[1px]">
                                {ampm}
                              </span>
                            </div>
                            <span className="block h-[10px] w-[2px] rounded-full bg-border/70" />
                          </div>
                        );
                      }

                      return (
                        <div
                          key={`label-${h}-${m}`}
                          className="absolute right-0 flex items-center justify-end gap-1 pr-1.5 -translate-y-1/2"
                          style={{ top: `${topPx}px`, left: 0 }}
                        >
                          <span className="text-[11px] font-medium text-foreground/40 tabular-nums">
                            :30
                          </span>
                          <span className="block h-[6px] w-[1.5px] rounded-full bg-border/40" />
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Appointment column */}
                <div
                  className="flex-1 relative bg-slate-50 border-l"
                  style={{
                    height: `${TOTAL_HOURS * HOUR_HEIGHT}px`,
                    borderLeftColor: "#d9e2ea",
                  }}
                >

                  {/* Time slot clickable rows */}
                  {timeSlots.map((slot) => {
                    const topPx = ((slot.hour - START_HOUR) + slot.minute / 60) * HOUR_HEIGHT;
                    const slotHeight = HOUR_HEIGHT / (60 / 15);
                    const isSlotSelected =
                      selectedSlot?.staffId === member.id &&
                      selectedSlot?.hour === slot.hour &&
                      selectedSlot?.minute === slot.minute;

                    return (
                      <div
                        key={`${slot.hour}-${slot.minute}`}
                        className={cn(
                          "absolute left-0 right-0 border-b border-border/30 cursor-pointer transition-colors active:bg-primary/10",
                          isSlotSelected ? "bg-blue-100 dark:bg-blue-950/60" : "hover:bg-primary/5"
                        )}
                        style={{ top: `${topPx}px`, height: `${slotHeight}px` }}
                        onClick={() => handleSlotClick(member.id, slot.hour, slot.minute)}
                      />
                    );
                  })}

                  {/* Appointments */}
                  {staffApts.map((apt: any) => {
                    const style = getAppointmentStyle(apt);
                    const startTime = formatInTz(apt.date, timezone, "h:mm");
                    const endTime = formatInTz(
                      addMinutes(new Date(apt.date), apt.duration),
                      timezone,
                      "h:mm a"
                    );
                    const isSelected = selectedAppointment?.id === apt.id;

                    const bandColor =
                      apt.status === "completed" ? "#9ca3af"
                      : apt.status === "started" ? "#22c55e"
                      : apt.status === "late" ? "#fb923c"
                      : apt.status === "no_show" ? "#fb7185"
                      : "#3b82f6";

                    const bgColor =
                      apt.status === "completed" ? "#f3f4f6"
                      : apt.status === "started" ? "#f0fdf4"
                      : apt.status === "late" ? "#fff7ed"
                      : apt.status === "no_show" ? "#fff1f2"
                      : "#eff6ff";

                    const aptMinutesPastStart = Math.floor(
                      (Date.now() - new Date(apt.date).getTime()) / 60000,
                    );
                    const isAptOverdue =
                      aptMinutesPastStart >= lateGracePeriodMinutes &&
                      (apt.status === "pending" || apt.status === "confirmed");

                    const isLocked = apt.status === "completed";
                    const isOnlineBooking = apt.source === "online";

                    const aptAddons = apt.appointmentAddons?.map((aa: any) => aa.addon).filter(Boolean) || [];
                    const addonTotal = aptAddons.reduce((sum: number, a: any) => sum + Number(a.price), 0);
                    const serviceTotal = Number(apt.service?.price || 0) + addonTotal;

                    return (
                      <div
                        key={apt.id}
                        className={cn(
                          "absolute left-1 right-1 rounded-md overflow-hidden cursor-pointer z-[5] transition-shadow active:shadow-md flex",
                          isLocked && "opacity-70"
                        )}
                        style={{
                          ...style,
                          backgroundColor: isAptOverdue ? "#fef2f2" : bgColor,
                          border: isAptOverdue
                            ? "1.5px solid #dc2626"
                            : `1px solid ${bandColor}40`,
                          ...(isSelected
                            ? { boxShadow: `0 0 0 2px ${isAptOverdue ? "#dc2626" : bandColor}` }
                            : {}),
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectAppointment(apt);
                        }}
                        data-testid={`mobile-appt-block-${apt.id}`}
                      >
                        {!isOnlineBooking && (
                          <div className="w-[4px] flex-shrink-0" style={{ backgroundColor: bandColor }} />
                        )}

                        <div className="flex-1 px-1.5 py-1 overflow-hidden flex flex-col min-h-0">
                          <div className="flex items-center justify-between gap-1">
                            <span className="text-[10px] font-semibold text-gray-700 leading-tight">
                              {startTime} – {endTime}
                            </span>
                            <span className="text-[10px] font-medium text-gray-500 flex-shrink-0">
                              {apt.duration}m
                            </span>
                          </div>

                          <div className="text-xs font-bold text-gray-900 truncate leading-tight mt-0.5">
                            {apt.service?.name || "Service"}
                          </div>

                          {aptAddons.map((addon: any) => (
                            <div
                              key={addon.id}
                              className="text-[10px] text-gray-500 truncate leading-tight"
                            >
                              + {addon.name}
                            </div>
                          ))}

                          {apt.customer?.name && (
                            <div className="text-[10px] text-gray-600 truncate leading-tight">
                              {apt.customer.name}
                            </div>
                          )}

                          {showPrices && serviceTotal > 0 && (
                            <div className="mt-auto pt-0.5 flex items-center justify-end">
                              <span
                                className="text-[10px] font-bold tabular-nums"
                                style={{ color: bandColor }}
                              >
                                ${serviceTotal.toFixed(2)}
                              </span>
                            </div>
                          )}
                        </div>

                        {isOnlineBooking && (
                          <div className="w-[4px] flex-shrink-0" style={{ backgroundColor: bandColor }} />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        );
      })}

      {selectedSlot && (
        <MobileSlotModal
          slot={selectedSlot}
          onClose={() => setSelectedSlot(null)}
          onBook={() => {
            handleBookSlot(selectedSlot.staffId, selectedSlot.hour, selectedSlot.minute);
            setSelectedSlot(null);
          }}
          staffName={filteredStaff.find(s => s.id === selectedSlot.staffId)?.name || ""}
        />
      )}
    </div>
  );
}

function MobileSlotModal({
  slot,
  onClose,
  onBook,
  staffName,
}: {
  slot: { staffId: number; hour: number; minute: number };
  onClose: () => void;
  onBook: () => void;
  staffName: string;
}) {
  const h = slot.hour > 12 ? slot.hour - 12 : slot.hour === 0 ? 12 : slot.hour;
  const m = String(slot.minute).padStart(2, "0");
  const ampm = slot.hour >= 12 ? "PM" : "AM";
  const timeLabel = `${h}:${m} ${ampm}`;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center pb-6 px-4"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/30" />
      <div
        className="relative z-10 bg-card rounded-2xl shadow-2xl border w-full max-w-sm overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-4 py-3 border-b bg-muted/40">
          <div>
            <p className="text-sm font-bold">{timeLabel}</p>
            {staffName && (
              <p className="text-xs text-muted-foreground">{staffName}</p>
            )}
          </div>
          <button onClick={onClose} className="text-muted-foreground p-1">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="p-3 flex flex-col gap-2">
          <button
            className="w-full py-3.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold active:opacity-80 transition-opacity"
            onClick={onBook}
          >
            Create New Appointment
          </button>
          <button
            className="w-full py-3 rounded-xl border border-border text-sm font-medium text-foreground active:bg-muted transition-colors"
            onClick={onClose}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
