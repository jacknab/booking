import { useRef, useEffect, useCallback, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { addMinutes, isSameDay } from "date-fns";
import { formatInTz } from "@/lib/timezone";
import { cn } from "@/lib/utils";
import { Plus, Check, CalendarPlus, Search, Clock } from "lucide-react";

const TIME_COL_W = 44;
const STAFF_HEADER_H = 68;
const COLS_PER_PAGE = 2;

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
  onNewBooking: () => void;
  onLookup: () => void;
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
  onNewBooking,
  onLookup,
}: MobileCalendarViewProps) {
  const [showFabMenu, setShowFabMenu] = useState(false);
  const gridRef = useRef<HTMLDivElement>(null);
  const didAutoScrollRef = useRef(false);
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);
  const weekStripTouchRef = useRef<{ x: number; y: number } | null>(null);

  const [staffPage, setStaffPage] = useState(0);
  const [swipeDir, setSwipeDir] = useState<1 | -1>(1);
  const [showJumpToNow, setShowJumpToNow] = useState(false);

  const totalPages = Math.max(1, Math.ceil(filteredStaff.length / COLS_PER_PAGE));
  const safeStaffPage = Math.min(staffPage, totalPages - 1);
  const visibleStaff = filteredStaff.slice(safeStaffPage * COLS_PER_PAGE, (safeStaffPage + 1) * COLS_PER_PAGE);

  const totalGridH = TOTAL_HOURS * HOUR_HEIGHT;

  useEffect(() => {
    setStaffPage(0);
  }, [filteredStaff.length]);

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

  useEffect(() => {
    const el = gridRef.current;
    if (!el || !isToday || timeLinePosition === null) {
      setShowJumpToNow(false);
      return;
    }
    const check = () => {
      const { scrollTop, clientHeight } = el;
      const visible = timeLinePosition >= scrollTop && timeLinePosition <= scrollTop + clientHeight;
      setShowJumpToNow(!visible);
    };
    check();
    el.addEventListener("scroll", check, { passive: true });
    return () => el.removeEventListener("scroll", check);
  }, [isToday, timeLinePosition]);

  const handleTouchStart = (e: React.TouchEvent) => {
    const t = e.touches[0];
    touchStartRef.current = { x: t.clientX, y: t.clientY };
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStartRef.current) return;
    const t = e.changedTouches[0];
    const dx = t.clientX - touchStartRef.current.x;
    const dy = t.clientY - touchStartRef.current.y;
    touchStartRef.current = null;
    if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy) * 1.4) {
      if (dx < 0 && safeStaffPage < totalPages - 1) {
        setSwipeDir(1);
        setStaffPage((p) => p + 1);
      } else if (dx > 0 && safeStaffPage > 0) {
        setSwipeDir(-1);
        setStaffPage((p) => Math.max(0, p - 1));
      }
    }
  };

  if (filteredStaff.length === 0) {
    return (
      <div className="flex items-center justify-center text-muted-foreground text-sm py-20">
        No staff members found.
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full w-full overflow-hidden bg-background">

      {/* ── Week strip (swipe left/right to jump a week) ── */}
      <div
        className="flex-shrink-0 border-b flex"
        style={{ backgroundColor: "#f1f5f9" }}
        onTouchStart={(e) => {
          const t = e.touches[0];
          weekStripTouchRef.current = { x: t.clientX, y: t.clientY };
        }}
        onTouchEnd={(e) => {
          if (!weekStripTouchRef.current) return;
          const t = e.changedTouches[0];
          const dx = t.clientX - weekStripTouchRef.current.x;
          const dy = t.clientY - weekStripTouchRef.current.y;
          weekStripTouchRef.current = null;
          if (Math.abs(dx) < 40 || Math.abs(dx) < Math.abs(dy) * 1.5) return;
          onSelectDate(addDays(currentDate, dx < 0 ? 7 : -7));
        }}
      >
        <div className="flex-shrink-0" style={{ width: TIME_COL_W }} />
        <div className="flex flex-1">
          {weekDayLabels.map((wd) => {
            const isSelected = isSameDay(wd.date, currentDate);
            return (
              <button
                key={wd.date.toISOString()}
                className="flex-1 flex flex-col items-center justify-center py-1.5 active:opacity-60 transition-opacity"
                onClick={() => onSelectDate(wd.date)}
              >
                <span className={cn(
                  "text-[10px] font-semibold uppercase tracking-wide leading-none mb-1",
                  wd.isToday ? "text-pink-400" : "text-slate-400"
                )}>
                  {wd.label}
                </span>
                <span className={cn(
                  "text-[15px] font-bold leading-none w-7 h-7 flex items-center justify-center rounded-full",
                  wd.isToday && isSelected
                    ? "bg-pink-300 text-pink-800"
                    : wd.isToday
                      ? "text-pink-400"
                      : isSelected
                        ? "bg-pink-100 text-pink-700"
                        : "text-slate-500"
                )}>
                  {wd.date.getDate()}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Staff headers row ── */}
      <div className="flex-shrink-0 bg-card border-b flex overflow-hidden" style={{ height: STAFF_HEADER_H }}>
        {/* Corner: page dots */}
        <div
          className="flex-shrink-0 flex items-center justify-center"
          style={{ width: TIME_COL_W }}
        >
          {totalPages > 1 && (
            <div className="flex flex-col gap-1">
              {Array.from({ length: totalPages }).map((_, i) => (
                <button
                  key={i}
                  onClick={() => { setSwipeDir(i > safeStaffPage ? 1 : -1); setStaffPage(i); }}
                  className={cn(
                    "w-1.5 h-1.5 rounded-full transition-all",
                    i === safeStaffPage ? "bg-primary scale-125" : "bg-muted-foreground/25"
                  )}
                />
              ))}
            </div>
          )}
        </div>

        {/* Staff header cells — animated on page change */}
        <AnimatePresence mode="wait" custom={swipeDir}>
          <motion.div
            key={`hdr-${safeStaffPage}`}
            custom={swipeDir}
            initial={(dir: number) => ({ x: dir * 40, opacity: 0 })}
            animate={{ x: 0, opacity: 1 }}
            exit={(dir: number) => ({ x: -dir * 40, opacity: 0 })}
            transition={{ duration: 0.18, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="flex flex-1"
          >
            {visibleStaff.map((member: any) => {
              const color = getStaffColor(member);
              const aptCount = getAppointmentsForStaff(member.id).length;
              return (
                <div
                  key={member.id}
                  className="flex-1 flex items-center gap-2 px-3"
                  style={{ minWidth: 0, borderLeft: `3px solid ${color}` }}
                >
                  <Avatar className="w-9 h-9 flex-shrink-0 ring-2 ring-offset-1" style={{ ["--tw-ring-color" as any]: color + "60" }}>
                    {member.avatarUrl && <AvatarFallback className="object-cover" />}
                    <AvatarFallback
                      style={{ backgroundColor: color + "22", color }}
                      className="text-[11px] font-extrabold"
                    >
                      {member.name.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <p className="text-[13px] font-bold truncate leading-tight text-foreground">{member.name}</p>
                    <div className="mt-1">
                      {aptCount === 0 ? (
                        <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[9px] font-semibold bg-muted text-muted-foreground">
                          No appts
                        </span>
                      ) : (
                        <span
                          className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[9px] font-bold text-white leading-none"
                          style={{ backgroundColor: color }}
                        >
                          {aptCount} appt{aptCount !== 1 ? "s" : ""}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
            {/* empty placeholder if odd staff on last page */}
            {visibleStaff.length < COLS_PER_PAGE && (
              <div className="flex-1 border-l" />
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* ── Scrollable grid ── */}
      <div
        ref={gridRef}
        className="flex-1 overflow-y-auto"
        style={{ WebkitOverflowScrolling: "touch" } as React.CSSProperties}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <div className="flex" style={{ height: totalGridH }}>

          {/* Time column */}
          <div
            className="flex-shrink-0 bg-card relative border-r border-border/40"
            style={{ width: TIME_COL_W }}
          >
            {/* Timeline pill */}
            {isToday && timeLinePosition !== null && (
              <div
                className="absolute z-20 pointer-events-none"
                style={{ top: timeLinePosition, transform: "translateY(-50%)", right: -2, left: 0 }}
              >
                <span
                  className="text-[11px] font-extrabold text-white px-1.5 py-1 rounded-md leading-none block text-center shadow-lg"
                  style={{ backgroundColor: "#2563eb", boxShadow: "0 2px 8px rgba(37,99,235,0.55)" }}
                >
                  {timeLineLabel}
                </span>
              </div>
            )}

            {/* Hour labels */}
            {Array.from({ length: TOTAL_HOURS * 4 + 1 }, (_, i) => {
              const totalMins = i * 15;
              const h = START_HOUR + Math.floor(totalMins / 60);
              const m = totalMins % 60;
              if (h > END_HOUR || (h === END_HOUR && m > 0)) return null;
              if (m !== 0 && m !== 30) return null;
              const topPx = (totalMins / 60) * HOUR_HEIGHT;
              const isHour = m === 0;
              if (!isHour) {
                return (
                  <div key={`t-${h}-${m}`} className="absolute right-0 flex items-center justify-end pr-1 -translate-y-1/2" style={{ top: topPx }}>
                    <span className="text-[9px] font-medium text-muted-foreground/60 tabular-nums">:30</span>
                  </div>
                );
              }
              const hMod = h % 24;
              const displayH = hMod === 0 ? 12 : hMod > 12 ? hMod - 12 : hMod;
              const ampm = hMod >= 12 ? "pm" : "am";
              return (
                <div key={`t-${h}-${m}`} className="absolute right-0 left-0 flex flex-col items-end pr-1.5 -translate-y-1/2" style={{ top: topPx }}>
                  <span className="text-[13px] font-extrabold text-foreground tabular-nums leading-none">{displayH}</span>
                  <span className="text-[9px] font-bold text-muted-foreground leading-none mt-0.5">{ampm}</span>
                </div>
              );
            })}
          </div>

          {/* Staff columns — animated on page change */}
          <div className="flex-1 relative overflow-hidden">
            <AnimatePresence mode="wait" custom={swipeDir}>
              <motion.div
                key={`cols-${safeStaffPage}`}
                custom={swipeDir}
                initial={(dir: number) => ({ x: dir * 50, opacity: 0 })}
                animate={{ x: 0, opacity: 1 }}
                exit={(dir: number) => ({ x: -dir * 50, opacity: 0 })}
                transition={{ duration: 0.18, ease: [0.25, 0.46, 0.45, 0.94] }}
                className="absolute inset-0 flex"
              >
                {visibleStaff.map((member: any) => {
                  const staffApts = getAppointmentsForStaff(member.id);
                  const color = getStaffColor(member);
                  return (
                    <StaffColumn
                      key={member.id}
                      member={member}
                      staffApts={staffApts}
                      staffColor={color}
                      totalGridH={totalGridH}
                      START_HOUR={START_HOUR}
                      END_HOUR={END_HOUR}
                      TOTAL_HOURS={TOTAL_HOURS}
                      HOUR_HEIGHT={HOUR_HEIGHT}
                      timeSlots={timeSlots}
                      settings={settings}
                      isToday={isToday}
                      timeLinePosition={timeLinePosition}
                      selectedSlot={selectedSlot}
                      selectedAppointment={selectedAppointment}
                      lateGracePeriodMinutes={lateGracePeriodMinutes}
                      showPrices={showPrices}
                      timezone={timezone}
                      getAppointmentStyle={getAppointmentStyle}
                      onSelectAppointment={onSelectAppointment}
                      handleSlotClick={handleSlotClick}
                    />
                  );
                })}
                {visibleStaff.length < COLS_PER_PAGE && (
                  <div className="flex-1 bg-slate-50/40" />
                )}
              </motion.div>
            </AnimatePresence>
          </div>

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

      {/* ── Now pill — centered above nav, same style as desktop ── */}
      {showJumpToNow && (
        <button
          onClick={scrollToNow}
          className="fixed z-50 left-1/2 -translate-x-1/2 flex items-center gap-1.5 px-4 py-2.5 rounded-full bg-blue-600 text-white text-sm font-bold shadow-xl active:bg-blue-700 active:scale-95 transition-all"
          style={{ bottom: "calc(env(safe-area-inset-bottom, 0px) + 68px)" }}
          data-testid="button-jump-to-now"
        >
          <Clock className="w-4 h-4" />
          Now
        </button>
      )}

      {/* ── FAB ── */}
      <button
        className="fixed z-40 right-4 flex items-center justify-center rounded-full shadow-2xl active:scale-95 transition-transform duration-100"
        style={{
          bottom: "calc(72px + env(safe-area-inset-bottom, 0px))",
          width: 56,
          height: 56,
          backgroundColor: "#0f172a",
        }}
        onClick={() => setShowFabMenu(true)}
        data-testid="mobile-fab-new-appointment"
        aria-label="New appointment"
      >
        <Plus className="w-6 h-6 text-white" />
      </button>

      {/* ── FAB bottom-sheet menu ── */}
      {showFabMenu && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center px-6"
          onClick={() => setShowFabMenu(false)}
        >
          <div className="absolute inset-0 bg-black/40" />
          <div
            className="relative z-10 w-full max-w-sm"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-card rounded-2xl shadow-2xl border overflow-hidden">
              <div className="px-4 py-3 border-b bg-muted/40">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Appointment</p>
              </div>
              <div className="p-3 flex flex-col gap-2">
                <button
                  className="w-full min-h-[56px] px-4 py-3 rounded-xl bg-primary text-primary-foreground text-sm font-bold active:opacity-80 transition-opacity flex items-center justify-center gap-2"
                  onClick={() => { setShowFabMenu(false); onNewBooking(); }}
                  data-testid="button-create-new-appointment"
                >
                  <CalendarPlus className="w-4 h-4 shrink-0" />
                  <span>BOOK</span>
                </button>
                <button
                  className="w-full min-h-[56px] px-4 py-3 rounded-xl bg-primary text-primary-foreground text-sm font-bold active:opacity-80 transition-opacity flex items-center justify-center gap-2"
                  onClick={() => { setShowFabMenu(false); onLookup(); }}
                  data-testid="button-lookup-appointment"
                >
                  <Search className="w-4 h-4 shrink-0" />
                  <span>LOOK UP</span>
                </button>
                <button
                  className="w-full min-h-[56px] px-4 py-3 rounded-xl border border-border text-sm font-semibold text-foreground active:bg-muted transition-colors flex items-center justify-center"
                  onClick={() => setShowFabMenu(false)}
                  data-testid="button-cancel-new-appointment-menu"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── StaffColumn sub-component ─── */
function StaffColumn({
  member,
  staffApts,
  staffColor,
  totalGridH,
  START_HOUR,
  END_HOUR,
  TOTAL_HOURS,
  HOUR_HEIGHT,
  timeSlots,
  settings,
  isToday,
  timeLinePosition,
  selectedSlot,
  selectedAppointment,
  lateGracePeriodMinutes,
  showPrices,
  timezone,
  getAppointmentStyle,
  onSelectAppointment,
  handleSlotClick,
}: {
  member: any;
  staffApts: any[];
  staffColor: string;
  totalGridH: number;
  START_HOUR: number;
  END_HOUR: number;
  TOTAL_HOURS: number;
  HOUR_HEIGHT: number;
  timeSlots: { hour: number; minute: number; label: string; isHour: boolean }[];
  settings: { timeSlotInterval: number };
  isToday: boolean;
  timeLinePosition: number | null;
  selectedSlot: { staffId: number; hour: number; minute: number } | null;
  selectedAppointment: any | null;
  lateGracePeriodMinutes: number;
  showPrices: boolean;
  timezone: string;
  getAppointmentStyle: (apt: any) => { top: string; height: string };
  onSelectAppointment: (apt: any) => void;
  handleSlotClick: (staffId: number, hour: number, minute: number) => void;
}) {
  return (
    <div
      className="flex-1 relative"
      style={{ height: totalGridH, backgroundColor: staffColor + "09", borderLeft: `3px solid ${staffColor}` }}
    >
      {/* Grid lines */}
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
              borderTop: m === 0 ? "1px solid rgba(0,0,0,0.18)" : "1px dashed rgba(0,0,0,0.10)",
            }}
          />
        );
      })}

      {/* Current time line */}
      {isToday && timeLinePosition !== null && (
        <div
          className="absolute left-0 right-0 z-10 pointer-events-none"
          style={{ top: timeLinePosition, height: 2, backgroundColor: "#2563eb" }}
        />
      )}

      {/* Tappable slots */}
      {timeSlots.map((slot) => {
        const topPx = ((slot.hour - START_HOUR) + slot.minute / 60) * HOUR_HEIGHT;
        const slotH = (settings.timeSlotInterval / 60) * HOUR_HEIGHT;
        const isSlotSel = selectedSlot?.staffId === member.id && selectedSlot?.hour === slot.hour && selectedSlot?.minute === slot.minute;
        return (
          <div
            key={`s-${slot.hour}-${slot.minute}`}
            className={cn(
              "absolute left-0 right-0 cursor-pointer transition-colors active:bg-primary/10",
              isSlotSel ? "bg-blue-100/60" : ""
            )}
            style={{ top: topPx, height: slotH }}
            onTouchStart={(e) => {
              const t = e.touches[0];
              e.currentTarget.dataset.tx = String(t.clientX);
              e.currentTarget.dataset.ty = String(t.clientY);
            }}
            onTouchEnd={(e) => {
              const t = e.changedTouches[0];
              const dx = Math.abs(t.clientX - Number(e.currentTarget.dataset.tx ?? t.clientX));
              const dy = Math.abs(t.clientY - Number(e.currentTarget.dataset.ty ?? t.clientY));
              if (dx > 8 || dy > 8) return;
              e.stopPropagation();
              handleSlotClick(member.id, slot.hour, slot.minute);
            }}
            onClick={(e) => { e.stopPropagation(); handleSlotClick(member.id, slot.hour, slot.minute); }}
          />
        );
      })}

      {/* Appointment blocks */}
      {staffApts.map((apt: any) => {
        const style = getAppointmentStyle(apt);
        const startTime = formatInTz(apt.date, timezone, "h:mm");
        const endTime = formatInTz(addMinutes(new Date(apt.date), apt.duration), timezone, "h:mm");
        const isSelected = selectedAppointment?.id === apt.id;
        const isOnlineBooking = apt.source === "online";

        const aptMinsElapsed = Math.floor((Date.now() - new Date(apt.date).getTime()) / 60000);
        const isOverdue = aptMinsElapsed >= lateGracePeriodMinutes && (apt.status === "pending" || apt.status === "confirmed");

        const bandColor =
          isOverdue ? "#dc2626"
          : apt.status === "completed" ? "#9ca3af"
          : apt.status === "started" ? "#16a34a"
          : apt.status === "late" ? "#ea580c"
          : apt.status === "no_show" ? "#e11d48"
          : staffColor;

        const aptAddons = apt.appointmentAddons?.map((aa: any) => aa.addon).filter(Boolean) || [];
        const serviceTotal = Number(apt.service?.price || 0) + aptAddons.reduce((s: number, a: any) => s + Number(a.price), 0);
        const isPaid = apt.status === "completed" && apt.paymentMethod;
        const isConfirmed = apt.status === "confirmed" || isOnlineBooking;

        const cardBg = isOverdue ? "#fef2f2" : apt.status === "completed" ? "#f9fafb" : staffColor + "18";

        return (
          <div
            key={apt.id}
            className={cn(
              "absolute left-[2px] right-[2px] rounded-lg overflow-hidden cursor-pointer z-[5] flex select-none",
              isSelected ? "ring-2 ring-offset-0" : "",
              apt.status === "completed" && "opacity-70"
            )}
            style={{
              ...style,
              backgroundColor: cardBg,
              borderLeft: `3px solid ${bandColor}`,
              border: `1px solid ${bandColor}35`,
              borderLeftWidth: 3,
              borderLeftColor: bandColor,
              ...(isSelected ? { boxShadow: `0 0 0 2px ${bandColor}` } : {}),
            }}
            onTouchEnd={(e) => { e.stopPropagation(); onSelectAppointment(apt); }}
            onClick={(e) => { e.stopPropagation(); onSelectAppointment(apt); }}
            data-testid={`mobile-appt-block-${apt.id}`}
          >
            <div className="flex-1 px-1.5 py-1 min-w-0 overflow-hidden">
              <p className="text-[9px] text-gray-500 leading-none tabular-nums">{startTime}–{endTime}</p>
              <p className="text-[11px] font-semibold leading-tight mt-0.5 truncate" style={{ color: "#1e293b" }}>
                {[apt.customer?.name, apt.service?.name].filter(Boolean).join(" · ")}
              </p>
            </div>
            {/* Right badges */}
            <div className="flex-shrink-0 flex flex-col items-center justify-center gap-1 pr-1 py-1">
              {showPrices && serviceTotal > 0 && (
                <span
                  className="w-4 h-4 rounded-full flex items-center justify-center text-white font-extrabold leading-none"
                  style={{ fontSize: 8, backgroundColor: isPaid ? "#16a34a" : "#4ade80" }}
                >
                  $
                </span>
              )}
              {isConfirmed && (
                <span className="w-4 h-4 rounded-full bg-emerald-500 flex items-center justify-center">
                  <Check className="w-2.5 h-2.5 text-white" strokeWidth={3} />
                </span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ─── Slot tap modal ─── */
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
  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center px-4"
      style={{ paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 68px)" }}
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/30" />
      <div
        className="relative z-10 bg-card rounded-2xl shadow-2xl border w-full max-w-sm overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-4 py-3 border-b bg-muted/40">
          <div>
            <p className="text-sm font-bold">{h}:{m} {ampm}</p>
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
