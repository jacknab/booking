import { useState, useMemo, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useAppointments, useCreateAppointment } from "@/hooks/use-appointments";
import { useServices } from "@/hooks/use-services";
import { useStaffList } from "@/hooks/use-staff";
import { useCustomers } from "@/hooks/use-customers";
import { useSelectedStore } from "@/hooks/use-store";
import { formatInTz, toStoreLocal, getTimezoneAbbr, getNowInTimezone } from "@/lib/timezone";
import { addDays, subDays, isSameDay, addMinutes } from "date-fns";
import { ChevronLeft, ChevronRight, CalendarPlus, Users, Globe } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertAppointmentSchema } from "@shared/schema";
import { z } from "zod";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";

const HOUR_HEIGHT = 80;
const START_HOUR = 8;
const END_HOUR = 20;
const TOTAL_HOURS = END_HOUR - START_HOUR;

export default function Calendar() {
  const { selectedStore } = useSelectedStore();
  const timezone = selectedStore?.timezone || "UTC";
  const tzAbbr = getTimezoneAbbr(timezone);

  const storeNow = getNowInTimezone(timezone);
  const [currentDate, setCurrentDate] = useState(storeNow);
  const [selectedStaffId, setSelectedStaffId] = useState<number | "all">("all");
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  useEffect(() => {
    setCurrentDate(getNowInTimezone(timezone));
    setSelectedStaffId("all");
  }, [selectedStore?.id, timezone]);

  const { data: appointments, isLoading: aptsLoading } = useAppointments();
  const { data: staffList } = useStaffList();
  const { data: services } = useServices();

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

  return (
    <AppLayout>
      <div className="flex flex-col h-[calc(100vh-2rem)]">
        {/* Calendar Header Bar */}
        <div className="flex items-center justify-between gap-2 flex-wrap py-3 px-1 border-b bg-card rounded-t-lg">
          {/* Left: Staff filter */}
          <div className="flex items-center gap-2">
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

          {/* Center: Date navigation */}
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
              className={isSameDay(currentDate, storeNow) ? "bg-primary text-primary-foreground" : ""}
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

          {/* Right: New Appointment */}
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button data-testid="button-new-appointment">
                <CalendarPlus className="w-4 h-4 mr-2" />
                New Appointment
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>New Appointment</DialogTitle>
              </DialogHeader>
              <CreateAppointmentForm onSuccess={() => setIsCreateOpen(false)} timezone={timezone} />
            </DialogContent>
          </Dialog>
        </div>

        {/* Calendar Grid */}
        <div className="flex-1 overflow-hidden bg-card rounded-b-lg border border-t-0">
          <ScrollArea className="h-full">
            <div className="flex min-w-[600px]">
              {/* Time axis */}
              <div className="w-[72px] flex-shrink-0 border-r bg-card z-10">
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
                </div>
              </div>

              {/* Staff columns */}
              <div className="flex flex-1">
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
                              className="absolute left-0 right-0 border-b"
                              style={{
                                top: `${i * HOUR_HEIGHT}px`,
                                height: `${HOUR_HEIGHT}px`,
                                background: "repeating-linear-gradient(135deg, transparent, transparent 5px, hsl(var(--muted) / 0.3) 5px, hsl(var(--muted) / 0.3) 6px)",
                              }}
                            />
                          ))}

                          {staffApts.map((apt: any) => {
                            const style = getAppointmentStyle(apt);
                            const timeRange = `${formatInTz(apt.date, timezone, "h:mm")} - ${formatInTz(addMinutes(new Date(apt.date), apt.duration), timezone, "h:mm a")}`;

                            return (
                              <div
                                key={apt.id}
                                className="absolute left-1 right-1 rounded-md border-l-[3px] px-2 py-1 overflow-hidden cursor-pointer z-[5] transition-shadow hover:shadow-md"
                                style={{
                                  ...style,
                                  backgroundColor: "#dcfce7",
                                  borderLeftColor: "#22c55e",
                                  borderTop: "1px solid #bbf7d0",
                                  borderRight: "1px solid #bbf7d0",
                                  borderBottom: "1px solid #bbf7d0",
                                }}
                                data-testid={`appointment-block-${apt.id}`}
                              >
                                <div className="text-[10px] font-semibold text-gray-700">{timeRange}</div>
                                <div className="text-xs font-bold text-gray-900 truncate">
                                  {apt.service?.name || "Service"}
                                </div>
                                <div className="text-[10px] text-gray-600 truncate">
                                  #{apt.id} {apt.customer?.name ? `- ${apt.customer.name}` : ""}
                                </div>
                                {apt.service?.price && (
                                  <div className="text-[10px] font-medium text-gray-700">${apt.service.price}</div>
                                )}
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
          </ScrollArea>
        </div>
      </div>
    </AppLayout>
  );
}

function CreateAppointmentForm({ onSuccess, timezone }: { onSuccess: () => void; timezone: string }) {
  const { mutate, isPending } = useCreateAppointment();
  const { data: services } = useServices();
  const { data: staffList } = useStaffList();
  const { data: customers } = useCustomers();
  const tzAbbr = getTimezoneAbbr(timezone);

  const formSchema = insertAppointmentSchema.extend({
    serviceId: z.coerce.number(),
    staffId: z.coerce.number(),
    customerId: z.coerce.number(),
    date: z.string(),
    duration: z.coerce.number(),
  });

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  });

  const handleServiceChange = (val: string) => {
    setValue("serviceId", Number(val));
    const service = services?.find((s: any) => s.id === Number(val));
    if (service) {
      setValue("duration", service.duration);
    }
  };

  return (
    <form onSubmit={handleSubmit((data) => mutate(data as any, { onSuccess }))} className="space-y-4">
      <div className="space-y-2">
        <Label>Client</Label>
        <Select onValueChange={(val) => setValue("customerId", Number(val))}>
          <SelectTrigger data-testid="select-customer">
            <SelectValue placeholder="Select Client" />
          </SelectTrigger>
          <SelectContent>
            {customers?.map((c: any) => (
              <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.customerId && <span className="text-xs text-destructive">Client is required</span>}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Service</Label>
          <Select onValueChange={handleServiceChange}>
            <SelectTrigger data-testid="select-service">
              <SelectValue placeholder="Select Service" />
            </SelectTrigger>
            <SelectContent>
              {services?.map((s: any) => (
                <SelectItem key={s.id} value={String(s.id)}>{s.name} ({s.duration}m)</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.serviceId && <span className="text-xs text-destructive">Service is required</span>}
        </div>

        <div className="space-y-2">
          <Label>Staff</Label>
          <Select onValueChange={(val) => setValue("staffId", Number(val))}>
            <SelectTrigger data-testid="select-staff">
              <SelectValue placeholder="Select Staff" />
            </SelectTrigger>
            <SelectContent>
              {staffList?.map((s: any) => (
                <SelectItem key={s.id} value={String(s.id)}>{s.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.staffId && <span className="text-xs text-destructive">Staff is required</span>}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="date">Date & Time ({tzAbbr})</Label>
        <Input
          id="date"
          type="datetime-local"
          {...register("date")}
          data-testid="input-date"
        />
        <p className="text-xs text-muted-foreground">Times are in the store's timezone: {timezone}</p>
        {errors.date && <span className="text-xs text-destructive">Date is required</span>}
      </div>

      <input type="hidden" {...register("duration")} />

      <div className="space-y-2">
        <Label htmlFor="notes">Notes</Label>
        <Input id="notes" {...register("notes")} placeholder="Any special requests?" data-testid="input-notes" />
      </div>

      <div className="flex justify-end pt-4">
        <Button type="submit" disabled={isPending} data-testid="button-submit-appointment">
          {isPending ? "Booking..." : "Book Appointment"}
        </Button>
      </div>
    </form>
  );
}
