import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { useAppointments, useUpdateAppointment } from "@/hooks/use-appointments";
import { useStaffList } from "@/hooks/use-staff";
import { useSelectedStore } from "@/hooks/use-store";
import { formatInTz, toStoreLocal, getTimezoneAbbr, getNowInTimezone } from "@/lib/timezone";
import { addDays, subDays, isSameDay, addMinutes, format } from "date-fns";
import { ChevronLeft, ChevronRight, CalendarPlus, Users, Globe, ArrowLeft, X, Clock, Loader2, CreditCard, Banknote, Smartphone, DollarSign, Check, Receipt, Percent, Tag } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import type { AppointmentWithDetails } from "@shared/schema";

const HOUR_HEIGHT = 80;
const START_HOUR = 8;
const END_HOUR = 20;
const TOTAL_HOURS = END_HOUR - START_HOUR;

function useCurrentTimeLine(timezone: string) {
  const [position, setPosition] = useState<number | null>(null);
  const [timeLabel, setTimeLabel] = useState("");

  const updatePosition = useCallback(() => {
    const now = getNowInTimezone(timezone);
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const totalMinutes = hours * 60 + minutes;
    const startMinutes = START_HOUR * 60;
    const endMinutes = END_HOUR * 60;

    if (totalMinutes < startMinutes || totalMinutes > endMinutes) {
      setPosition(null);
      setTimeLabel("");
      return;
    }

    const pixelsFromTop = (totalMinutes - startMinutes) * (HOUR_HEIGHT / 60);
    setPosition(pixelsFromTop);

    const h = hours > 12 ? hours - 12 : hours === 0 ? 12 : hours;
    const m = String(minutes).padStart(2, "0");
    const ampm = hours >= 12 ? "PM" : "AM";
    setTimeLabel(`${h}:${m} ${ampm}`);
  }, [timezone]);

  useEffect(() => {
    updatePosition();
    const interval = setInterval(updatePosition, 60000);
    return () => clearInterval(interval);
  }, [updatePosition]);

  return { position, timeLabel };
}

export default function Calendar() {
  const { isLoading: authLoading } = useAuth();
  const [, navigate] = useLocation();
  const { selectedStore } = useSelectedStore();
  const timezone = selectedStore?.timezone || "UTC";
  const tzAbbr = getTimezoneAbbr(timezone);

  const storeNow = getNowInTimezone(timezone);
  const [currentDate, setCurrentDate] = useState(storeNow);
  const [selectedStaffId, setSelectedStaffId] = useState<number | "all">("all");
  const [selectedAppointment, setSelectedAppointment] = useState<AppointmentWithDetails | null>(null);
  const [showCancelFlow, setShowCancelFlow] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const { position: timeLinePosition, timeLabel: timeLineLabel } = useCurrentTimeLine(timezone);
  const updateAppointment = useUpdateAppointment();

  useEffect(() => {
    setCurrentDate(getNowInTimezone(timezone));
    setSelectedStaffId("all");
    setSelectedAppointment(null);
    setShowCheckout(false);
  }, [selectedStore?.id, timezone]);

  useEffect(() => {
    if (timeLinePosition !== null && scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      const scrollTarget = Math.max(0, timeLinePosition - container.clientHeight / 3);
      container.scrollTop = scrollTarget;
    }
  }, [selectedStore?.id]);

  const { data: appointments } = useAppointments();
  const { data: staffList } = useStaffList();

  const filteredStaff = useMemo(() => {
    if (!staffList) return [];
    if (selectedStaffId === "all") return staffList;
    return staffList.filter((s: any) => s.id === selectedStaffId);
  }, [staffList, selectedStaffId]);

  const timeSlots = useMemo(() => {
    return Array.from({ length: TOTAL_HOURS + 1 }).map((_, i) => {
      const hour = START_HOUR + i;
      return {
        hour,
        label: hour === 0 ? "12 AM" : hour === 12 ? "12 PM" : hour > 12 ? `${hour - 12}:00 PM` : `${hour}:00 AM`,
      };
    });
  }, []);

  const getAppointmentsForStaff = (staffId: number) => {
    if (!appointments) return [];
    return appointments.filter((apt: any) => {
      const localDate = toStoreLocal(apt.date, timezone);
      return apt.staffId === staffId && isSameDay(localDate, currentDate);
    });
  };

  const getAppointmentStyle = (apt: any) => {
    const localDate = toStoreLocal(apt.date, timezone);
    const hours = localDate.getHours();
    const minutes = localDate.getMinutes();
    const topOffset = (hours - START_HOUR + minutes / 60) * HOUR_HEIGHT;
    const height = (apt.duration / 60) * HOUR_HEIGHT;
    return {
      top: `${topOffset}px`,
      height: `${Math.max(height, 30)}px`,
    };
  };

  const getStaffColor = (staffMember: any) => {
    return staffMember?.color || "#22c55e";
  };

  const weekDayLabels = useMemo(() => {
    const dayOfWeek = currentDate.getDay();
    const start = subDays(currentDate, dayOfWeek);
    return Array.from({ length: 7 }).map((_, i) => {
      const d = addDays(start, i);
      return { date: d, label: formatInTz(d, timezone, "EEE"), isToday: isSameDay(d, storeNow) };
    });
  }, [currentDate, timezone, storeNow]);

  const goToday = () => setCurrentDate(getNowInTimezone(timezone));
  const goPrev = () => setCurrentDate(subDays(currentDate, 1));
  const goNext = () => setCurrentDate(addDays(currentDate, 1));

  const isToday = isSameDay(currentDate, storeNow);

  const handleCancelAppointment = (apt: AppointmentWithDetails) => {
    setShowCancelFlow(true);
  };

  const handleConfirmCancel = (apt: AppointmentWithDetails, reason: string) => {
    updateAppointment.mutate(
      { id: apt.id, status: "cancelled", cancellationReason: reason } as any,
      {
        onSuccess: () => {
          setSelectedAppointment(null);
          setShowCancelFlow(false);
        },
      }
    );
  };

  const handleStartService = (apt: AppointmentWithDetails) => {
    updateAppointment.mutate(
      { id: apt.id, status: "started" } as any,
      {
        onSuccess: (updated: any) => {
          setSelectedAppointment({ ...apt, status: "started" });
        },
      }
    );
  };

  const handleCheckout = (apt: AppointmentWithDetails) => {
    setShowCheckout(true);
  };

  const handleFinalizePayment = (apt: AppointmentWithDetails, paymentData: { paymentMethod: string; tip: number; discount: number; totalPaid: number }) => {
    updateAppointment.mutate(
      {
        id: apt.id,
        status: "completed",
        paymentMethod: paymentData.paymentMethod,
        tipAmount: String(paymentData.tip),
        discountAmount: String(paymentData.discount),
        totalPaid: String(paymentData.totalPaid),
      } as any,
      {
        onSuccess: () => {
          setSelectedAppointment(null);
          setShowCheckout(false);
        },
      }
    );
  };

  if (authLoading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="h-screen w-screen flex flex-col bg-background">
      <div className="flex items-center justify-between gap-2 flex-wrap py-2 px-3 border-b bg-card" data-testid="calendar-header">
        <div className="flex items-center gap-2">
          <Link href="/dashboard">
            <Button variant="ghost" size="icon" data-testid="button-back-dashboard">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <Select
            value={selectedStaffId === "all" ? "all" : String(selectedStaffId)}
            onValueChange={(val) => setSelectedStaffId(val === "all" ? "all" : Number(val))}
          >
            <SelectTrigger className="w-[160px]" data-testid="select-staff-filter">
              <Users className="w-4 h-4 mr-2 text-muted-foreground" />
              <SelectValue placeholder="All Staff" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Staff</SelectItem>
              {staffList?.map((s: any) => (
                <SelectItem key={s.id} value={String(s.id)}>{s.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Badge variant="secondary" className="no-default-active-elevate gap-1" data-testid="badge-timezone">
            <Globe className="w-3 h-3" />
            {tzAbbr}
          </Badge>
        </div>

        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" onClick={goPrev} data-testid="button-prev-day">
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <span className="text-base font-semibold px-3 min-w-[200px] text-center" data-testid="text-current-date">
            {formatInTz(currentDate, timezone, "EEE d MMM, yyyy")}
          </span>
          <Button
            variant="secondary"
            size="sm"
            onClick={goToday}
            className={isToday ? "bg-primary text-primary-foreground" : ""}
            data-testid="button-today"
          >
            Today
          </Button>
          <div className="hidden lg:flex items-center gap-0.5 ml-2">
            {weekDayLabels.map((wd) => (
              <Button
                key={wd.label + wd.date.toISOString()}
                variant="ghost"
                size="sm"
                className={`px-2 text-xs ${isSameDay(wd.date, currentDate) ? "bg-muted font-bold" : ""}`}
                onClick={() => setCurrentDate(wd.date)}
              >
                {wd.label}
              </Button>
            ))}
          </div>
          <Button variant="ghost" size="icon" onClick={goNext} data-testid="button-next-day">
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>

        <Button onClick={() => navigate("/booking/new")} data-testid="button-new-appointment">
          <CalendarPlus className="w-4 h-4 mr-2" />
          New Appointment
        </Button>
      </div>

      <div className="flex-1 flex overflow-hidden">
        <div className="flex-1 overflow-hidden">
          <div ref={scrollContainerRef} className="h-full overflow-auto">
            <div className="flex min-w-[600px]">
              <div className="w-[72px] flex-shrink-0 border-r bg-card z-10 sticky left-0">
                <div className="h-[60px] border-b" />
                <div className="relative" style={{ height: `${TOTAL_HOURS * HOUR_HEIGHT}px` }}>
                  {timeSlots.map((slot, i) => (
                    <div
                      key={slot.hour}
                      className="absolute left-0 right-0 flex items-start justify-end pr-3 -translate-y-1/2"
                      style={{ top: `${i * HOUR_HEIGHT}px` }}
                    >
                      <span className="text-xs font-medium text-muted-foreground">{slot.label}</span>
                    </div>
                  ))}

                  {isToday && timeLinePosition !== null && (
                    <div
                      className="absolute left-0 right-0 flex items-center justify-end pr-2 -translate-y-1/2 z-20"
                      style={{ top: `${timeLinePosition}px` }}
                      data-testid="current-time-label"
                    >
                      <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950 px-1 rounded">
                        {timeLineLabel}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex flex-1 relative">
                {isToday && timeLinePosition !== null && (
                  <div
                    className="absolute left-0 right-0 z-20 pointer-events-none"
                    style={{ top: `${timeLinePosition + 60}px` }}
                    data-testid="current-time-line"
                  >
                    <div className="w-full" style={{ height: "2px", backgroundColor: "#2563eb" }} />
                  </div>
                )}

                {filteredStaff.length === 0 ? (
                  <div className="flex-1 flex items-center justify-center text-muted-foreground text-sm py-20">
                    No staff members found for this store.
                  </div>
                ) : (
                  filteredStaff.map((member: any) => {
                    const staffApts = getAppointmentsForStaff(member.id);
                    const color = getStaffColor(member);

                    return (
                      <div
                        key={member.id}
                        className="flex-1 min-w-[180px] border-r last:border-r-0"
                      >
                        <div className="h-[60px] border-b flex flex-col items-center justify-center gap-1 px-2">
                          <Avatar className="w-7 h-7">
                            <AvatarFallback
                              style={{ backgroundColor: color + "22", color }}
                              className="text-xs font-bold"
                            >
                              {member.name.split(" ").map((n: string) => n[0]).join("").toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-xs font-medium truncate max-w-full" data-testid={`text-staff-name-${member.id}`}>
                            {member.name}
                          </span>
                        </div>

                        <div
                          className="relative"
                          style={{ height: `${TOTAL_HOURS * HOUR_HEIGHT}px` }}
                        >
                          {timeSlots.map((slot, i) => (
                            <div
                              key={slot.hour}
                              className="absolute left-0 right-0 border-b border-border/40"
                              style={{
                                top: `${i * HOUR_HEIGHT}px`,
                                height: `${HOUR_HEIGHT}px`,
                              }}
                            />
                          ))}

                          {staffApts.map((apt: any) => {
                            const style = getAppointmentStyle(apt);
                            const timeRange = `${formatInTz(apt.date, timezone, "h:mm")} - ${formatInTz(addMinutes(new Date(apt.date), apt.duration), timezone, "h:mm a")}`;
                            const isSelected = selectedAppointment?.id === apt.id;
                            const statusColor = apt.status === "cancelled" ? "#fecaca" : apt.status === "confirmed" ? "#dcfce7" : "#dbeafe";
                            const borderColor = apt.status === "cancelled" ? "#ef4444" : apt.status === "confirmed" ? "#22c55e" : "#3b82f6";

                            const aptAddons = apt.appointmentAddons?.map((aa: any) => aa.addon).filter(Boolean) || [];
                            const addonTotal = aptAddons.reduce((sum: number, a: any) => sum + Number(a.price), 0);
                            const serviceTotal = Number(apt.service?.price || 0) + addonTotal;

                            return (
                              <div
                                key={apt.id}
                                className="absolute left-1 right-1 rounded-md border-l-[3px] px-2 py-1 overflow-hidden cursor-pointer z-[5] transition-shadow hover:shadow-md"
                                style={{
                                  ...style,
                                  backgroundColor: statusColor,
                                  borderLeftColor: borderColor,
                                  borderTop: `1px solid ${borderColor}33`,
                                  borderRight: `1px solid ${borderColor}33`,
                                  borderBottom: `1px solid ${borderColor}33`,
                                  ...(isSelected ? { boxShadow: `0 0 0 2px ${borderColor}` } : {}),
                                }}
                                onClick={() => { setSelectedAppointment(apt); setShowCheckout(false); setShowCancelFlow(false); }}
                                data-testid={`appointment-block-${apt.id}`}
                              >
                                <div className="text-[10px] font-semibold text-gray-700 dark:text-gray-300">{timeRange}</div>
                                <div className="text-xs font-bold text-gray-900 dark:text-gray-100 truncate">
                                  {apt.service?.name || "Service"}
                                </div>
                                {aptAddons.length > 0 && aptAddons.map((addon: any) => (
                                  <div key={addon.id} className="text-[10px] text-gray-600 dark:text-gray-400 truncate" data-testid={`calendar-addon-${addon.id}`}>
                                    + {addon.name}
                                  </div>
                                ))}
                                <div className="text-[10px] text-gray-600 dark:text-gray-400 truncate">
                                  #{apt.id} {apt.customer?.name ? `\u00B7 ${apt.customer.name}` : ""}
                                </div>
                                <div className="text-[10px] font-medium text-gray-700 dark:text-gray-300">${serviceTotal.toFixed(2)}</div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        </div>

        {selectedAppointment && !showCancelFlow && !showCheckout && (
          <AppointmentDetailsPanel
            appointment={selectedAppointment}
            timezone={timezone}
            onClose={() => setSelectedAppointment(null)}
            onCancel={() => handleCancelAppointment(selectedAppointment)}
            onStart={() => handleStartService(selectedAppointment)}
            onCheckout={() => handleCheckout(selectedAppointment)}
            onEdit={() => navigate("/booking/new")}
            isUpdating={updateAppointment.isPending}
          />
        )}

        {selectedAppointment && showCancelFlow && (
          <CancelAppointmentPanel
            appointment={selectedAppointment}
            timezone={timezone}
            onClose={() => setShowCancelFlow(false)}
            onConfirmCancel={(reason) => handleConfirmCancel(selectedAppointment, reason)}
            isUpdating={updateAppointment.isPending}
          />
        )}

        {selectedAppointment && showCheckout && (
          <CheckoutPOSPanel
            appointment={selectedAppointment}
            timezone={timezone}
            onClose={() => { setShowCheckout(false); }}
            onFinalize={(paymentData) => handleFinalizePayment(selectedAppointment, paymentData)}
            isUpdating={updateAppointment.isPending}
          />
        )}
      </div>
    </div>
  );
}

function AppointmentDetailsPanel({
  appointment,
  timezone,
  onClose,
  onCancel,
  onStart,
  onCheckout,
  onEdit,
  isUpdating,
}: {
  appointment: AppointmentWithDetails;
  timezone: string;
  onClose: () => void;
  onCancel: () => void;
  onStart: () => void;
  onCheckout: () => void;
  onEdit: () => void;
  isUpdating: boolean;
}) {
  const localDate = toStoreLocal(appointment.date, timezone);
  const endTime = addMinutes(new Date(appointment.date), appointment.duration);
  const dateStr = formatInTz(appointment.date, timezone, "EEEE, d MMM yyyy");
  const timeStr = `${formatInTz(appointment.date, timezone, "h:mm a")} - ${formatInTz(endTime, timezone, "h:mm a")}`;

  const statusMap: Record<string, { label: string; variant: "destructive" | "secondary"; color: string }> = {
    pending: { label: "Booked", variant: "secondary", color: "#3b82f6" },
    confirmed: { label: "Booked", variant: "secondary", color: "#3b82f6" },
    started: { label: "Started", variant: "secondary", color: "#22c55e" },
    cancelled: { label: "Cancelled", variant: "destructive", color: "#ef4444" },
    completed: { label: "Completed", variant: "secondary", color: "#22c55e" },
    "no-show": { label: "No-Show", variant: "destructive", color: "#ef4444" },
  };
  const statusInfo = statusMap[appointment.status || "pending"] || statusMap.pending;
  const statusLabel = statusInfo.label;
  const statusVariant = statusInfo.variant;
  const progressColor = statusInfo.color;

  const aptAddons = appointment.appointmentAddons?.map(aa => aa.addon).filter(Boolean) || [];
  const addonTotal = aptAddons.reduce((sum, a) => sum + Number(a!.price), 0);
  const grandTotal = Number(appointment.service?.price || 0) + addonTotal;

  return (
    <div className="w-[340px] flex-shrink-0 border-l bg-card flex flex-col" data-testid="appointment-details-panel">
      <div className="p-4 border-b flex items-center justify-between gap-2">
        <div className="flex items-center gap-3">
          <Avatar className="w-8 h-8">
            <AvatarFallback className="text-xs font-bold bg-muted">
              {appointment.customer?.name?.[0]?.toUpperCase() || "W"}
            </AvatarFallback>
          </Avatar>
          <span className="font-medium text-sm" data-testid="text-detail-customer">
            {appointment.customer?.name || "Walk-In"}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={statusVariant} className="no-default-active-elevate text-[10px]" data-testid="badge-detail-status">
            {statusLabel}
          </Badge>
          <Badge variant="outline" className="no-default-active-elevate text-[10px]" data-testid="badge-detail-id">
            #{appointment.id}
          </Badge>
          <button onClick={onClose} className="text-muted-foreground ml-1" data-testid="button-close-details">
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <div>
          <p className="text-sm font-medium" data-testid="text-detail-date">{dateStr}</p>
          <div className="flex items-center gap-1.5 mt-1 text-muted-foreground">
            <Clock className="w-3.5 h-3.5" />
            <span className="text-xs" data-testid="text-detail-time">{timeStr}</span>
          </div>
        </div>

        <div className="w-full h-1 rounded-full bg-muted overflow-hidden">
          <div className="h-full rounded-full" style={{ width: "100%", backgroundColor: progressColor }} />
        </div>

        <div className="space-y-3">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h4 className="font-semibold text-sm" data-testid="text-detail-service">{appointment.service?.name || "Service"}</h4>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs text-muted-foreground">{appointment.service?.duration || appointment.duration} min</span>
                {appointment.staff && (
                  <>
                    <span className="text-xs text-muted-foreground">&middot;</span>
                    <Badge variant="outline" className="no-default-active-elevate text-[10px] px-1.5" data-testid="badge-detail-staff">
                      {appointment.staff.name}
                    </Badge>
                  </>
                )}
              </div>
            </div>
            <span className="font-semibold text-sm" data-testid="text-detail-price">
              ${appointment.service?.price ? Number(appointment.service.price).toFixed(2) : "0.00"}
            </span>
          </div>

          {aptAddons.length > 0 && (
            <div className="space-y-1.5 pl-3 border-l-2 border-muted" data-testid="detail-addons-list">
              {aptAddons.map((addon: any) => (
                <div key={addon.id} className="flex items-center justify-between gap-2" data-testid={`detail-addon-${addon.id}`}>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs text-muted-foreground">+</span>
                    <span className="text-xs font-medium">{addon.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">{addon.duration} min</span>
                    <span className="text-xs font-medium">${Number(addon.price).toFixed(2)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {appointment.notes && (
          <div className="pt-2 border-t">
            <p className="text-xs text-muted-foreground">{appointment.notes}</p>
          </div>
        )}
      </div>

      <div className="border-t p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <span className="font-semibold">Total</span>
            <p className="text-xs text-muted-foreground">{appointment.duration} min</p>
          </div>
          <div className="text-right">
            <span className="font-bold text-lg" data-testid="text-detail-total">
              ${grandTotal.toFixed(2)}
            </span>
          </div>
        </div>

        {appointment.status !== "cancelled" && appointment.status !== "completed" && appointment.status !== "no-show" && (
          <>
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={onEdit}
                data-testid="button-edit-appointment"
              >
                Edit
              </Button>
              <Button
                variant="outline"
                className="flex-1 text-destructive border-destructive/30"
                onClick={onCancel}
                disabled={isUpdating}
                data-testid="button-cancel-appointment"
              >
                {isUpdating ? "Updating..." : "Cancel Appointment"}
              </Button>
            </div>

            {appointment.status === "started" ? (
              <Button
                className="w-full bg-green-600 text-white h-12"
                onClick={onCheckout}
                disabled={isUpdating}
                data-testid="button-checkout"
              >
                <span className="flex flex-col items-center leading-tight">
                  <span className="font-semibold">Checkout</span>
                  <span className="text-[10px] opacity-80">Finish Appointment</span>
                </span>
              </Button>
            ) : (
              <Button
                className="w-full bg-blue-600 text-white h-12"
                onClick={onStart}
                disabled={isUpdating}
                data-testid="button-start-service"
              >
                <span className="flex flex-col items-center leading-tight">
                  <span className="font-semibold">Start</span>
                  <span className="text-[10px] opacity-80">Begin Service</span>
                </span>
              </Button>
            )}
          </>
        )}
      </div>
    </div>
  );
}

const CANCEL_REASONS = [
  "Client Canceled/Rescheduled",
  "Duplicated Booking",
  "No Show",
  "Other",
];

function CancelAppointmentPanel({
  appointment,
  timezone,
  onClose,
  onConfirmCancel,
  isUpdating,
}: {
  appointment: AppointmentWithDetails;
  timezone: string;
  onClose: () => void;
  onConfirmCancel: (reason: string) => void;
  isUpdating: boolean;
}) {
  const [selectedReason, setSelectedReason] = useState<string | null>(null);

  const endTime = addMinutes(new Date(appointment.date), appointment.duration);
  const dateStr = formatInTz(appointment.date, timezone, "MM/dd/yyyy, h:mm a");
  const grandTotal = Number(appointment.service?.price || 0) +
    (appointment.appointmentAddons?.reduce((sum, aa) => sum + Number(aa.addon?.price || 0), 0) || 0);

  return (
    <div className="w-[340px] flex-shrink-0 border-l bg-card flex flex-col" data-testid="cancel-appointment-panel">
      <div className="p-4 border-b flex items-center justify-between gap-2">
        <h2 className="font-semibold text-lg">Cancel Appointment</h2>
        <button onClick={onClose} className="text-muted-foreground" data-testid="button-close-cancel">
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        <div>
          <p className="text-sm text-muted-foreground mb-3">Following services will be cancelled:</p>
          <div className="border rounded-md p-3 space-y-1">
            <div className="flex items-center justify-between gap-2">
              <div>
                <span className="font-semibold text-sm">{appointment.service?.name || "Service"}</span>
                {appointment.staff && (
                  <span className="text-sm text-muted-foreground"> ( {appointment.staff.name} )</span>
                )}
              </div>
              <span className="font-semibold text-sm" data-testid="cancel-service-price">
                ${Number(appointment.service?.price || 0).toFixed(2)}
              </span>
            </div>
            <p className="text-xs text-muted-foreground" data-testid="cancel-service-date">{dateStr}</p>
          </div>
        </div>

        <div className="space-y-3">
          <h3 className="font-semibold text-sm">Cancellation Reason</h3>
          <div className="grid grid-cols-2 gap-2">
            {CANCEL_REASONS.map((reason) => (
              <Button
                key={reason}
                variant="outline"
                className={cn(
                  "h-auto py-3 text-sm justify-center",
                  selectedReason === reason && "border-primary bg-primary/5 text-primary"
                )}
                onClick={() => setSelectedReason(reason)}
                data-testid={`cancel-reason-${reason.toLowerCase().replace(/[^a-z0-9]/g, "-")}`}
              >
                {reason}
              </Button>
            ))}
          </div>
        </div>
      </div>

      <div className="border-t p-4">
        <Button
          className="w-full bg-pink-400 text-white h-12"
          onClick={() => selectedReason && onConfirmCancel(selectedReason)}
          disabled={!selectedReason || isUpdating}
          data-testid="button-confirm-cancel"
        >
          {isUpdating ? "Cancelling..." : "Cancel Appointment"}
        </Button>
      </div>
    </div>
  );
}

const TAX_RATE = 0.07;

const PAYMENT_METHODS = [
  { id: "cash", label: "Cash", icon: Banknote },
  { id: "card", label: "Card", icon: CreditCard },
  { id: "mobile", label: "Mobile", icon: Smartphone },
] as const;

const TIP_PRESETS = [
  { label: "No Tip", value: 0 },
  { label: "15%", percent: 0.15 },
  { label: "18%", percent: 0.18 },
  { label: "20%", percent: 0.20 },
  { label: "25%", percent: 0.25 },
];

function CheckoutPOSPanel({
  appointment,
  timezone,
  onClose,
  onFinalize,
  isUpdating,
}: {
  appointment: AppointmentWithDetails;
  timezone: string;
  onClose: () => void;
  onFinalize: (data: { paymentMethod: string; tip: number; discount: number; totalPaid: number }) => void;
  isUpdating: boolean;
}) {
  const [paymentMethod, setPaymentMethod] = useState<string>("card");
  const [tipMode, setTipMode] = useState<"preset" | "custom">("preset");
  const [selectedTipIndex, setSelectedTipIndex] = useState(0);
  const [customTip, setCustomTip] = useState("");
  const [discountValue, setDiscountValue] = useState("");
  const [discountType, setDiscountType] = useState<"dollar" | "percent">("dollar");
  const [showReceipt, setShowReceipt] = useState(false);

  const aptAddons = appointment.appointmentAddons?.map(aa => aa.addon).filter(Boolean) || [];
  const servicePrice = Number(appointment.service?.price || 0);
  const addonTotal = aptAddons.reduce((sum, a) => sum + Number(a!.price), 0);
  const subtotal = servicePrice + addonTotal;

  const discountNum = Number(discountValue) || 0;
  const discount = discountType === "percent" ? subtotal * (discountNum / 100) : discountNum;
  const discountedSubtotal = Math.max(0, subtotal - discount);

  const tax = discountedSubtotal * TAX_RATE;
  const preTotal = discountedSubtotal + tax;

  const tip = tipMode === "custom"
    ? (Number(customTip) || 0)
    : (TIP_PRESETS[selectedTipIndex]?.percent
        ? preTotal * TIP_PRESETS[selectedTipIndex].percent!
        : TIP_PRESETS[selectedTipIndex]?.value || 0);

  const grandTotal = preTotal + tip;

  const endTime = addMinutes(new Date(appointment.date), appointment.duration);
  const dateStr = formatInTz(appointment.date, timezone, "EEE, MMM d");
  const timeStr = `${formatInTz(appointment.date, timezone, "h:mm a")} - ${formatInTz(endTime, timezone, "h:mm a")}`;

  const handleFinalize = () => {
    onFinalize({
      paymentMethod,
      tip: Math.round(tip * 100) / 100,
      discount: Math.round(discount * 100) / 100,
      totalPaid: Math.round(grandTotal * 100) / 100,
    });
  };

  if (showReceipt) {
    return (
      <div className="w-[400px] flex-shrink-0 border-l bg-card flex flex-col" data-testid="checkout-receipt-panel">
        <div className="p-4 border-b flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Receipt className="w-5 h-5 text-muted-foreground" />
            <h2 className="font-semibold text-lg">Payment Summary</h2>
          </div>
          <button onClick={onClose} className="text-muted-foreground" data-testid="button-close-receipt">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          <div className="flex items-center gap-3">
            <Avatar className="w-9 h-9">
              <AvatarFallback className="text-xs font-bold bg-muted">
                {appointment.customer?.name?.[0]?.toUpperCase() || "W"}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium text-sm">{appointment.customer?.name || "Walk-In"}</p>
              <p className="text-xs text-muted-foreground">{dateStr} &middot; {timeStr}</p>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>{appointment.service?.name}</span>
              <span className="font-medium">${servicePrice.toFixed(2)}</span>
            </div>
            {aptAddons.map((addon: any) => (
              <div key={addon.id} className="flex items-center justify-between text-sm pl-3">
                <span className="text-muted-foreground">+ {addon.name}</span>
                <span>${Number(addon.price).toFixed(2)}</span>
              </div>
            ))}
          </div>

          <div className="border-t pt-3 space-y-1.5 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Subtotal</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between text-green-600">
                <span>Discount</span>
                <span>-${discount.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-muted-foreground">Tax ({(TAX_RATE * 100).toFixed(0)}%)</span>
              <span>${tax.toFixed(2)}</span>
            </div>
            {tip > 0 && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Tip</span>
                <span>${tip.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between font-bold text-base pt-2 border-t">
              <span>Total Paid</span>
              <span>${grandTotal.toFixed(2)}</span>
            </div>
          </div>

          <div className="flex items-center gap-2 text-sm bg-muted/50 rounded-md p-3">
            {PAYMENT_METHODS.find(m => m.id === paymentMethod)?.icon && (() => {
              const Icon = PAYMENT_METHODS.find(m => m.id === paymentMethod)!.icon;
              return <Icon className="w-4 h-4 text-muted-foreground" />;
            })()}
            <span className="capitalize">{paymentMethod}</span>
          </div>
        </div>

        <div className="border-t p-4">
          <Button
            className="w-full bg-green-600 text-white h-12"
            onClick={handleFinalize}
            disabled={isUpdating}
            data-testid="button-confirm-payment"
          >
            <Check className="w-4 h-4 mr-2" />
            {isUpdating ? "Processing..." : "Complete & Close"}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-[400px] flex-shrink-0 border-l bg-card flex flex-col" data-testid="checkout-pos-panel">
      <div className="p-4 border-b flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <DollarSign className="w-5 h-5 text-muted-foreground" />
          <h2 className="font-semibold text-lg">Checkout</h2>
          <Badge variant="outline" className="no-default-active-elevate text-[10px]">#{appointment.id}</Badge>
        </div>
        <button onClick={onClose} className="text-muted-foreground" data-testid="button-close-checkout">
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-5">
        <div className="flex items-center gap-3">
          <Avatar className="w-8 h-8">
            <AvatarFallback className="text-xs font-bold bg-muted">
              {appointment.customer?.name?.[0]?.toUpperCase() || "W"}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium text-sm" data-testid="pos-customer-name">{appointment.customer?.name || "Walk-In"}</p>
            <p className="text-xs text-muted-foreground">{dateStr} &middot; {timeStr}</p>
          </div>
          {appointment.staff && (
            <Badge variant="outline" className="no-default-active-elevate text-[10px] ml-auto">{appointment.staff.name}</Badge>
          )}
        </div>

        <div className="space-y-1">
          <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">Line Items</h3>
          <div className="border rounded-md divide-y">
            <div className="flex items-center justify-between p-3">
              <div>
                <p className="text-sm font-medium" data-testid="pos-service-name">{appointment.service?.name}</p>
                <p className="text-xs text-muted-foreground">{appointment.service?.duration} min</p>
              </div>
              <span className="text-sm font-semibold" data-testid="pos-service-price">${servicePrice.toFixed(2)}</span>
            </div>
            {aptAddons.map((addon: any) => (
              <div key={addon.id} className="flex items-center justify-between p-3" data-testid={`pos-addon-${addon.id}`}>
                <div>
                  <p className="text-sm font-medium">+ {addon.name}</p>
                  <p className="text-xs text-muted-foreground">{addon.duration} min</p>
                </div>
                <span className="text-sm font-semibold">${Number(addon.price).toFixed(2)}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-1">
          <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">Discount</h3>
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
              <Input
                type="number"
                min="0"
                placeholder="0"
                value={discountValue}
                onChange={(e) => setDiscountValue(e.target.value)}
                className="pl-9"
                data-testid="input-discount"
              />
            </div>
            <div className="flex rounded-md border overflow-visible">
              <button
                className={cn(
                  "px-3 py-2 text-sm transition-colors",
                  discountType === "dollar" ? "bg-primary text-primary-foreground" : "text-muted-foreground"
                )}
                onClick={() => setDiscountType("dollar")}
                data-testid="button-discount-dollar"
              >
                $
              </button>
              <button
                className={cn(
                  "px-3 py-2 text-sm transition-colors",
                  discountType === "percent" ? "bg-primary text-primary-foreground" : "text-muted-foreground"
                )}
                onClick={() => setDiscountType("percent")}
                data-testid="button-discount-percent"
              >
                %
              </button>
            </div>
          </div>
        </div>

        <div className="space-y-1">
          <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">Payment Method</h3>
          <div className="grid grid-cols-3 gap-2">
            {PAYMENT_METHODS.map((method) => {
              const Icon = method.icon;
              return (
                <Button
                  key={method.id}
                  variant="outline"
                  className={cn(
                    "h-auto py-3 flex flex-col items-center gap-1.5",
                    paymentMethod === method.id && "border-primary bg-primary/5"
                  )}
                  onClick={() => setPaymentMethod(method.id)}
                  data-testid={`button-payment-${method.id}`}
                >
                  <Icon className={cn("w-5 h-5", paymentMethod === method.id ? "text-primary" : "text-muted-foreground")} />
                  <span className={cn("text-xs", paymentMethod === method.id && "text-primary font-medium")}>{method.label}</span>
                </Button>
              );
            })}
          </div>
        </div>

        <div className="space-y-1">
          <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">Tip</h3>
          <div className="grid grid-cols-5 gap-1.5">
            {TIP_PRESETS.map((preset, i) => (
              <Button
                key={preset.label}
                variant="outline"
                size="sm"
                className={cn(
                  "text-xs",
                  tipMode === "preset" && selectedTipIndex === i && "border-primary bg-primary/5 text-primary"
                )}
                onClick={() => { setTipMode("preset"); setSelectedTipIndex(i); }}
                data-testid={`button-tip-${preset.label.replace(/[^a-z0-9]/gi, "").toLowerCase()}`}
              >
                {preset.label}
              </Button>
            ))}
          </div>
          <div className="flex items-center gap-2 mt-2">
            <span className="text-xs text-muted-foreground whitespace-nowrap">Custom:</span>
            <div className="relative flex-1">
              <DollarSign className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
              <Input
                type="number"
                min="0"
                step="0.01"
                placeholder="0.00"
                value={customTip}
                onChange={(e) => { setCustomTip(e.target.value); setTipMode("custom"); }}
                onFocus={() => setTipMode("custom")}
                className={cn("pl-8", tipMode === "custom" && "border-primary")}
                data-testid="input-custom-tip"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="border-t p-4 space-y-3 bg-card">
        <div className="space-y-1 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Subtotal</span>
            <span data-testid="pos-subtotal">${subtotal.toFixed(2)}</span>
          </div>
          {discount > 0 && (
            <div className="flex justify-between text-green-600">
              <span>Discount</span>
              <span data-testid="pos-discount">-${discount.toFixed(2)}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span className="text-muted-foreground">Tax ({(TAX_RATE * 100).toFixed(0)}%)</span>
            <span data-testid="pos-tax">${tax.toFixed(2)}</span>
          </div>
          {tip > 0 && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Tip</span>
              <span data-testid="pos-tip">${tip.toFixed(2)}</span>
            </div>
          )}
          <div className="flex justify-between font-bold text-lg pt-2 border-t">
            <span>Total</span>
            <span data-testid="pos-total">${grandTotal.toFixed(2)}</span>
          </div>
        </div>

        <Button
          className="w-full bg-green-600 text-white h-12"
          onClick={() => setShowReceipt(true)}
          data-testid="button-finalize-pay"
        >
          <Receipt className="w-4 h-4 mr-2" />
          Finalize & Pay
        </Button>
        <Button
          variant="ghost"
          className="w-full text-muted-foreground"
          onClick={onClose}
          data-testid="button-abort-checkout"
        >
          Back to Appointment
        </Button>
      </div>
    </div>
  );
}
