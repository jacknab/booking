import { useRef, useEffect, useCallback } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { addMinutes, isSameDay } from "date-fns";
import { formatInTz } from "@/lib/timezone";
import { cn } from "@/lib/utils";

const TIME_COL_W = 52;
const STAFF_COL_W = 140;
const STAFF_HEADER_H = 64;

interface WeekDay {
  date: Date;
  label: string;
  isToday: boolean;
}

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
  weekDayLabels: WeekDay[];
  currentDate: Date;
  onSelectDate: (date: Date) => void;
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
  settings,
  weekDayLabels,
  currentDate,
  onSelectDate,
}: MobileCalendarViewProps) {
  const gridRef = useRef<HTMLDivElement>(null);
  const didAutoScrollRef = useRef(false);

  const totalGridH = TOTAL_HOURS * HOUR_HEIGHT;

  const scrollToNow = useCallback(() => {
    if (!gridRef.current || timeLinePosition === null) return;
    const target = Math.max(0, timeLinePosition - gridRef.current.clientHeight / 3);
    gridRef.current.scrollTo({ top: target, behavior: "smooth" });
  }, [timeLinePosition]);

  useEffect(() => {
    if (!isToday || timeLinePosition === null || didAutoScrollRef.current) return;
    didAutoScrollRef.current = true;
    const id = setTimeout(scrollToNow, 80);
    return () => clearTimeout(id);
  }, [isToday, timeLinePosition, scrollToNow]);

  useEffect(() => {
    didAutoScrollRef.current = false;
  }, [currentDate]);

  if (filteredStaff.length === 0) {
    return (
      <div className="flex items-center justify-center text-muted-foreground text-sm py-20">
        No staff members found for this store.
      </div>
    );
  }

  const totalContentW = TIME_COL_W + filteredStaff.length * STAFF_COL_W;

  return (
    <div className="flex flex-col h-full w-full overflow-hidden">

      {/* ── Week strip ── */}
      <div className="flex-shrink-0 bg-card border-b flex">
        {/* Corner spacer aligned with time column */}
        <div className="flex-shrink-0" style={{ width: TIME_COL_W }} />
        {/* Day cells */}
        <div className="flex-1 overflow-x-auto scrollbar-none">
          <div className="flex min-w-max">
            {weekDayLabels.map((wd) => {
              const isSelected = isSameDay(wd.date, currentDate);
              return (
                <button
                  key={wd.date.toISOString()}
                  className="flex flex-col items-center justify-center py-1.5 px-2 min-w-[40px] flex-1 transition-colors active:bg-muted/60"
                  onClick={() => onSelectDate(wd.date)}
                >
                  <span
                    className={cn(
                      "text-[10px] font-semibold uppercase tracking-wide leading-none mb-1",
                      wd.isToday ? "text-red-500" : "text-muted-foreground"
                    )}
                  >
                    {wd.label}
                  </span>
                  <span
                    className={cn(
                      "text-[15px] font-bold leading-none w-7 h-7 flex items-center justify-center rounded-full",
                      wd.isToday && isSelected
                        ? "bg-red-500 text-white"
                        : wd.isToday
                          ? "text-red-500"
                          : isSelected
                            ? "bg-foreground text-background"
                            : "text-foreground"
                    )}
                  >
                    {wd.date.getDate()}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Main grid: horizontal + vertical scroll ── */}
      <div
        ref={gridRef}
        className="flex-1 overflow-auto relative"
        style={{ WebkitOverflowScrolling: "touch" } as React.CSSProperties}
      >
        {/* Inner content: fixed total width so both axes scroll */}
        <div
          className="relative flex"
          style={{ minWidth: totalContentW, minHeight: STAFF_HEADER_H + totalGridH }}
        >

          {/* ── Sticky time column ── */}
          <div
            className="sticky left-0 z-30 flex-shrink-0 bg-card flex flex-col"
            style={{ width: TIME_COL_W }}
          >
            {/* Top-left corner — sticky in both axes so it masks time labels behind staff headers */}
            <div
              className="flex-shrink-0 sticky top-0 z-40 border-b border-r bg-card"
              style={{ height: STAFF_HEADER_H }}
            />

            {/* Time labels */}
            <div
              className="relative border-r bg-card"
              style={{ height: totalGridH, flex: "0 0 auto" }}
            >
              {/* Current time pill — sits inside the sticky time column */}
              {isToday && timeLinePosition !== null && (
                <div
                  className="absolute right-0 z-20 flex items-center justify-center pointer-events-none"
                  style={{
                    top: timeLinePosition,
                    transform: "translateY(-50%)",
                    right: -1,
                  }}
                >
                  <span
                    className="text-[10px] font-bold text-white px-1.5 py-0.5 rounded"
                    style={{ backgroundColor: "#2563eb" }}
                  >
                    {timeLineLabel}
                  </span>
                </div>
              )}

              {/* Hour / half-hour labels */}
              {Array.from({ length: TOTAL_HOURS * 4 + 1 }, (_, i) => {
                const totalMins = i * 15;
                const h = START_HOUR + Math.floor(totalMins / 60);
                const m = totalMins % 60;
                if (h > END_HOUR || (h === END_HOUR && m > 0)) return null;
                if (m !== 0 && m !== 30) return null;
                const topPx = (totalMins / 60) * HOUR_HEIGHT;
                const isHour = m === 0;

                if (isHour) {
                  const hMod = h % 24;
                  const displayH = hMod === 0 ? 12 : hMod > 12 ? hMod - 12 : hMod;
                  const ampm = hMod >= 12 ? "pm" : "am";
                  return (
                    <div
                      key={`t-${h}-${m}`}
                      className="absolute right-0 left-0 flex flex-col items-end pr-1.5 -translate-y-1/2"
                      style={{ top: topPx }}
                    >
                      <span className="text-[12px] font-bold text-foreground tabular-nums leading-none">
                        {displayH}:{String(m).padStart(2, "0")}
                      </span>
                      <span className="text-[9px] font-semibold text-muted-foreground leading-none">
                        {ampm}
                      </span>
                    </div>
                  );
                }
                return (
                  <div
                    key={`t-${h}-${m}`}
                    className="absolute right-0 flex items-center justify-end pr-1.5 -translate-y-1/2"
                    style={{ top: topPx }}
                  >
                    <span className="text-[10px] text-muted-foreground/50 tabular-nums">:30</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ── Staff columns ── */}
          {filteredStaff.map((member: any) => {
            const staffApts = getAppointmentsForStaff(member.id);
            const color = getStaffColor(member);

            return (
              <div
                key={member.id}
                className="flex-shrink-0 flex flex-col"
                style={{ width: STAFF_COL_W }}
              >
                {/* Sticky staff header */}
                <div
                  className="sticky top-0 z-20 flex-shrink-0 border-b border-l bg-card flex items-center gap-2 px-2"
                  style={{ height: STAFF_HEADER_H }}
                >
                  <Avatar className="w-8 h-8 flex-shrink-0">
                    {member.avatarUrl && (
                      <AvatarImage src={member.avatarUrl} alt={member.name} className="object-cover" />
                    )}
                    <AvatarFallback
                      style={{ backgroundColor: color + "22", color }}
                      className="text-[10px] font-bold"
                    >
                      {member.name.split(" ").map((n: string) => n[0]).join("").toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <p className="text-[13px] font-bold truncate leading-tight">{member.name}</p>
                    <p className="text-[10px] text-muted-foreground leading-tight">
                      {staffApts.length === 0 ? "No appts" : `${staffApts.length} appt${staffApts.length !== 1 ? "s" : ""}`}
                    </p>
                  </div>
                </div>

                {/* Appointment grid */}
                <div
                  className="relative border-l bg-slate-50"
                  style={{
                    height: totalGridH,
                    flex: "0 0 auto",
                    borderLeftColor: "#d9e2ea",
                  }}
                >
                  {/* Horizontal hour/half-hour grid lines */}
                  {Array.from({ length: TOTAL_HOURS * 4 + 1 }, (_, i) => {
                    const totalMins = i * 15;
                    const h = START_HOUR + Math.floor(totalMins / 60);
                    const m = totalMins % 60;
                    if (h > END_HOUR || (h === END_HOUR && m > 0)) return null;
                    if (m !== 0 && m !== 30) return null;
                    const topPx = (totalMins / 60) * HOUR_HEIGHT;
                    return (
                      <div
                        key={`g-${h}-${m}`}
                        className="absolute left-0 right-0 pointer-events-none"
                        style={{
                          top: topPx,
                          borderTop: m === 0 ? "1px solid #d9e2ea" : "1px dashed #e5eaef",
                        }}
                      />
                    );
                  })}

                  {/* Current time line for this column */}
                  {isToday && timeLinePosition !== null && (
                    <div
                      className="absolute left-0 right-0 z-10 pointer-events-none"
                      style={{
                        top: timeLinePosition,
                        height: 2,
                        backgroundColor: "#2563eb",
                      }}
                    />
                  )}

                  {/* Tappable time slots */}
                  {timeSlots.map((slot) => {
                    const topPx = ((slot.hour - START_HOUR) + slot.minute / 60) * HOUR_HEIGHT;
                    const slotHeight = (settings.timeSlotInterval / 60) * HOUR_HEIGHT;
                    const isSlotSelected =
                      selectedSlot?.staffId === member.id &&
                      selectedSlot?.hour === slot.hour &&
                      selectedSlot?.minute === slot.minute;

                    return (
                      <div
                        key={`s-${slot.hour}-${slot.minute}`}
                        className={cn(
                          "absolute left-0 right-0 cursor-pointer transition-colors active:bg-primary/10",
                          isSlotSelected ? "bg-blue-100/70" : ""
                        )}
                        style={{ top: topPx, height: slotHeight }}
                        onTouchEnd={(e) => {
                          e.stopPropagation();
                          handleSlotClick(member.id, slot.hour, slot.minute);
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSlotClick(member.id, slot.hour, slot.minute);
                        }}
                      />
                    );
                  })}

                  {/* Appointment blocks */}
                  {staffApts.map((apt: any) => {
                    const style = getAppointmentStyle(apt);
                    const startTime = formatInTz(apt.date, timezone, "h:mm");
                    const endTime = formatInTz(
                      addMinutes(new Date(apt.date), apt.duration),
                      timezone,
                      "h:mm"
                    );
                    const isSelected = selectedAppointment?.id === apt.id;
                    const isOnlineBooking = apt.source === "online";

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
                      (Date.now() - new Date(apt.date).getTime()) / 60000
                    );
                    const isOverdue =
                      aptMinutesPastStart >= lateGracePeriodMinutes &&
                      (apt.status === "pending" || apt.status === "confirmed");

                    const aptAddons = apt.appointmentAddons?.map((aa: any) => aa.addon).filter(Boolean) || [];
                    const addonTotal = aptAddons.reduce((sum: number, a: any) => sum + Number(a.price), 0);
                    const serviceTotal = Number(apt.service?.price || 0) + addonTotal;

                    const blockBg = isOverdue ? "#fef2f2" : bgColor;
                    const blockBorder = isOverdue ? "1.5px solid #dc2626" : `1px solid ${bandColor}40`;

                    return (
                      <div
                        key={apt.id}
                        className={cn(
                          "absolute left-[3px] right-[3px] rounded overflow-hidden cursor-pointer z-[5] flex select-none",
                          apt.status === "completed" && "opacity-70"
                        )}
                        style={{
                          ...style,
                          backgroundColor: blockBg,
                          border: blockBorder,
                          ...(isSelected ? { boxShadow: `0 0 0 2px ${isOverdue ? "#dc2626" : bandColor}` } : {}),
                        }}
                        onTouchEnd={(e) => {
                          e.stopPropagation();
                          onSelectAppointment(apt);
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectAppointment(apt);
                        }}
                        data-testid={`mobile-appt-block-${apt.id}`}
                      >
                        {/* Status band — left for walk-in/store, right for online */}
                        {!isOnlineBooking && (
                          <div className="w-[3px] flex-shrink-0 rounded-l" style={{ backgroundColor: bandColor }} />
                        )}

                        <div className="flex-1 px-1 py-0.5 overflow-hidden flex flex-col min-h-0">
                          <span className="text-[9px] font-semibold text-gray-600 leading-tight tabular-nums truncate">
                            {startTime}–{endTime}
                          </span>
                          <span className="text-[11px] font-bold text-gray-900 leading-tight truncate">
                            {apt.service?.name || "Service"}
                          </span>
                          {apt.customer?.name && (
                            <span className="text-[10px] text-gray-600 leading-tight truncate">
                              {apt.customer.name}
                            </span>
                          )}
                          {showPrices && serviceTotal > 0 && (
                            <span
                              className="text-[9px] font-bold tabular-nums mt-auto leading-tight"
                              style={{ color: bandColor }}
                            >
                              ${serviceTotal.toFixed(2)}
                            </span>
                          )}
                        </div>

                        {isOnlineBooking && (
                          <div className="w-[3px] flex-shrink-0 rounded-r" style={{ backgroundColor: bandColor }} />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Slot tap modal ── */}
      {selectedSlot && (
        <SlotModal
          slot={selectedSlot}
          staffName={filteredStaff.find((s) => s.id === selectedSlot.staffId)?.name || ""}
          onClose={() => setSelectedSlot(null)}
          onBook={() => {
            handleBookSlot(selectedSlot.staffId, selectedSlot.hour, selectedSlot.minute);
            setSelectedSlot(null);
          }}
        />
      )}
    </div>
  );
}

function SlotModal({
  slot,
  staffName,
  onClose,
  onBook,
}: {
  slot: { staffId: number; hour: number; minute: number };
  staffName: string;
  onClose: () => void;
  onBook: () => void;
}) {
  const h = slot.hour > 12 ? slot.hour - 12 : slot.hour === 0 ? 12 : slot.hour;
  const m = String(slot.minute).padStart(2, "0");
  const ampm = slot.hour >= 12 ? "PM" : "AM";
  const timeLabel = `${h}:${m} ${ampm}`;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center pb-6 px-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/30" />
      <div
        className="relative z-10 bg-card rounded-2xl shadow-2xl border w-full max-w-sm overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-4 py-3 border-b bg-muted/40">
          <div>
            <p className="text-sm font-bold">{timeLabel}</p>
            {staffName && <p className="text-xs text-muted-foreground">{staffName}</p>}
          </div>
          <button onClick={onClose} className="text-muted-foreground p-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
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
