import { useState, useMemo, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Calendar } from "@/components/ui/calendar";
import { useServices } from "@/hooks/use-services";
import { useStaffList } from "@/hooks/use-staff";
import { useCustomers } from "@/hooks/use-customers";
import { useCreateAppointment } from "@/hooks/use-appointments";
import { useAddonsForService, useSetAppointmentAddons, useServiceCategories } from "@/hooks/use-addons";
import { useAvailableSlots, type TimeSlot } from "@/hooks/use-availability";
import { useSelectedStore } from "@/hooks/use-store";
import { getTimezoneAbbr, formatInTz, storeLocalToUtc, getNowInTimezone } from "@/lib/timezone";
import { useAuth } from "@/hooks/use-auth";
import { useLocation, Link } from "wouter";
import { ArrowLeft, Clock, User, Users, X, Scissors, Sparkles, Loader2, Check, CalendarDays, Timer } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Service, Staff, Customer, Addon } from "@shared/schema";

type BookingStep = "services" | "addons" | "details";

export default function NewBooking() {
  const [, navigate] = useLocation();
  const { isLoading: authLoading } = useAuth();
  const { selectedStore } = useSelectedStore();
  const timezone = selectedStore?.timezone || "UTC";
  const tzAbbr = getTimezoneAbbr(timezone);

  const params = new URLSearchParams(window.location.search);
  const calStaffId = params.get("staffId") ? Number(params.get("staffId")) : null;
  const calDate = params.get("date");
  const calTime = params.get("time");
  const calAvailableMinutes = params.get("availableMinutes") ? Number(params.get("availableMinutes")) : null;
  const paramClientId = params.get("clientId") ? Number(params.get("clientId")) : null;
  const editAppointmentId = params.get("editId") ? Number(params.get("editId")) : null;
  const isCalendarBooking = !!(calStaffId && calDate && calTime);

  const { data: services, isLoading: servicesLoading } = useServices();
  const { data: categories } = useServiceCategories();
  const { data: staffList } = useStaffList();
  const { data: customers } = useCustomers();
  const createAppointment = useCreateAppointment();
  const setAppointmentAddons = useSetAppointmentAddons();

  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedAddons, setSelectedAddons] = useState<Addon[]>([]);
  const [selectedStaff, setSelectedStaff] = useState<Staff | null>(null);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [notes, setNotes] = useState("");
  const [step, setStep] = useState<BookingStep>("services");
  const [editInitialized, setEditInitialized] = useState(false);
  const [clientInitialized, setClientInitialized] = useState(false);

  const availableMinutes = isCalendarBooking && calAvailableMinutes && calAvailableMinutes > 0 ? calAvailableMinutes : null;

  const [selectedDate, setSelectedDate] = useState<Date | undefined>(() => {
    if (calDate) {
      const [y, m, d] = calDate.split("-").map(Number);
      return new Date(y, m - 1, d);
    }
    return getNowInTimezone(timezone);
  });
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [staffMode, setStaffMode] = useState<"any" | "specific">(isCalendarBooking ? "specific" : "any");
  const [specificStaffId, setSpecificStaffId] = useState<number | null>(calStaffId);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [calendarSlotInitialized, setCalendarSlotInitialized] = useState(false);

  useEffect(() => {
    if (isCalendarBooking && staffList && !calendarSlotInitialized) {
      const staffMember = staffList.find((s: Staff) => s.id === calStaffId);
      if (staffMember) {
        setSelectedStaff(staffMember);
        const [hours, mins] = calTime!.split(":").map(Number);
        const localDate = new Date(selectedDate!);
        localDate.setHours(hours, mins, 0, 0);
        const utcTime = storeLocalToUtc(`${calDate}T${calTime}:00`, timezone);
        setSelectedSlot({
          time: utcTime.toISOString(),
          staffId: calStaffId!,
          staffName: staffMember.name,
        });
        setCalendarSlotInitialized(true);
      }
    }
  }, [isCalendarBooking, staffList, calStaffId, calTime, timezone, selectedDate, calendarSlotInitialized]);

  useEffect(() => {
    if (paramClientId && customers && !clientInitialized) {
      const client = customers.find((c: Customer) => c.id === paramClientId);
      if (client) {
        setSelectedCustomer(client);
        setClientInitialized(true);
      }
    }
  }, [paramClientId, customers, clientInitialized]);

  useEffect(() => {
    if (editAppointmentId && services && staffList && !editInitialized) {
      fetch(`/api/appointments?storeId=${selectedStore?.id}`, { credentials: "include" })
        .then(res => res.json())
        .then((allAppointments: any[]) => {
          const apt = allAppointments.find((a: any) => a.id === editAppointmentId);
          if (!apt) return;

          const svc = services.find((s: Service) => s.id === apt.serviceId);
          if (svc) {
            setSelectedService(svc);
            setSelectedCategory(svc.category);
          }

          const staff = staffList.find((s: Staff) => s.id === apt.staffId);
          if (staff) {
            setSelectedStaff(staff);
            setStaffMode("specific");
            setSpecificStaffId(staff.id);
          }

          if (apt.customer && customers) {
            const client = customers.find((c: Customer) => c.id === apt.customerId);
            if (client) setSelectedCustomer(client);
          }

          if (apt.notes) setNotes(apt.notes);

          if (apt.appointmentAddons && apt.appointmentAddons.length > 0) {
            const addonItems = apt.appointmentAddons
              .map((aa: any) => aa.addon)
              .filter(Boolean);
            setSelectedAddons(addonItems);
          }

          const aptDate = new Date(apt.date);
          setSelectedDate(aptDate);

          setSelectedSlot({
            time: apt.date,
            staffId: apt.staffId,
            staffName: staff?.name || "",
          });

          setEditInitialized(true);
        })
        .catch(() => {});
    }
  }, [editAppointmentId, services, staffList, customers, selectedStore, editInitialized]);

  const { data: availableAddons, isLoading: addonsLoading } = useAddonsForService(selectedService?.id || null);

  const addonTotal = selectedAddons.reduce((sum, a) => sum + Number(a.price), 0);
  const addonDuration = selectedAddons.reduce((sum, a) => sum + a.duration, 0);
  const servicePrice = selectedService ? Number(selectedService.price) : 0;
  const totalPrice = servicePrice + addonTotal;
  const totalDuration = (selectedService?.duration || 0) + addonDuration;

  const dateString = selectedDate
    ? `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, "0")}-${String(selectedDate.getDate()).padStart(2, "0")}`
    : null;

  const { data: slots, isLoading: slotsLoading } = useAvailableSlots(
    selectedService?.id || null,
    selectedStore?.id || null,
    dateString,
    totalDuration,
    staffMode === "specific" ? specificStaffId : null
  );

  const categoryNames = useMemo(() => {
    if (categories && categories.length > 0) {
      return Array.from(new Set(categories.map((c: any) => c.name))).sort() as string[];
    }
    if (!services) return [];
    const catSet = new Set<string>();
    services.forEach((s: Service) => catSet.add(s.category));
    return Array.from(catSet).sort();
  }, [services, categories]);

  const filteredServices = useMemo(() => {
    if (!services) return [];
    const activeCat = selectedCategory || (categoryNames.length > 0 ? categoryNames[0] : null);
    if (!activeCat) return services;
    return services.filter((s: Service) => s.category === activeCat);
  }, [services, selectedCategory, categoryNames]);

  const activeCategory = selectedCategory || (categoryNames.length > 0 ? categoryNames[0] : null);

  const handleSelectService = (service: Service) => {
    if (selectedService?.id !== service.id) {
      setSelectedAddons([]);
      if (!isCalendarBooking) {
        setSelectedSlot(null);
        setSelectedStaff(null);
      }
    }
    setSelectedService(service);
  };

  const handleRemoveService = () => {
    setSelectedService(null);
    setSelectedAddons([]);
    setSelectedSlot(null);
    setSelectedStaff(null);
    setStep("services");
  };

  const handleToggleAddon = (addon: Addon) => {
    setSelectedAddons(prev => {
      const exists = prev.find(a => a.id === addon.id);
      if (exists) return prev.filter(a => a.id !== addon.id);
      return [...prev, addon];
    });
  };

  const handleRemoveAddon = (addonId: number) => {
    setSelectedAddons(prev => prev.filter(a => a.id !== addonId));
  };

  const handleContinueToAddons = () => {
    if (availableAddons && availableAddons.length > 0) {
      setStep("addons");
    } else if (isCalendarBooking) {
      handleRequestBooking();
    } else {
      setStep("details");
    }
  };

  const handleContinueToDetails = () => {
    if (isCalendarBooking) {
      handleRequestBooking();
    } else {
      setStep("details");
    }
  };

  const handleDateChange = (date: Date | undefined) => {
    setSelectedDate(date);
    setSelectedSlot(null);
  };

  const handleStaffModeChange = (mode: "any" | "specific") => {
    setStaffMode(mode);
    setSelectedSlot(null);
    if (mode === "any") {
      setSpecificStaffId(null);
    }
  };

  const handleSpecificStaffSelect = (staffId: number) => {
    setSpecificStaffId(staffId);
    setSelectedSlot(null);
  };

  const handleRequestBooking = () => {
    if (!selectedService || !selectedSlot) return;

    const staffId = selectedSlot.staffId;

    createAppointment.mutate(
      {
        date: selectedSlot.time,
        serviceId: selectedService.id,
        staffId,
        customerId: selectedCustomer?.id || undefined,
        duration: totalDuration,
        notes: notes || undefined,
        status: "pending",
      } as any,
      {
        onSuccess: (data: any) => {
          if (selectedAddons.length > 0 && data?.id) {
            setAppointmentAddons.mutate(
              { appointmentId: data.id, addonIds: selectedAddons.map(a => a.id) },
              {
                onSuccess: () => setShowConfirmation(true),
                onError: () => setShowConfirmation(true),
              }
            );
          } else {
            setShowConfirmation(true);
          }
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
    <div className="h-screen w-screen flex bg-background">
      {step === "services" && (
        <>
          <div className="flex flex-1 overflow-hidden">
            <div className="w-[180px] flex-shrink-0 border-r bg-card flex flex-col">
              <div className="p-4 border-b flex items-center gap-2">
                <Button variant="ghost" size="icon" onClick={() => navigate("/calendar")} data-testid="button-back-calendar">
                  <ArrowLeft className="w-4 h-4" />
                </Button>
                <span className="font-semibold text-lg">Services</span>
              </div>
              <nav className="flex-1 overflow-y-auto py-2">
                {categoryNames.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={cn(
                      "w-full text-left px-5 py-3 text-sm font-medium transition-colors",
                      activeCategory === cat
                        ? "text-primary border-l-[3px] border-primary bg-primary/5"
                        : "text-muted-foreground border-l-[3px] border-transparent"
                    )}
                    data-testid={`button-category-${cat.toLowerCase().replace(/\s+/g, "-")}`}
                  >
                    {cat}
                  </button>
                ))}
              </nav>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              {servicesLoading ? (
                <div className="flex items-center justify-center h-full">
                  <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {filteredServices.map((service: Service) => {
                      const isSelected = selectedService?.id === service.id;
                      return (
                        <Card
                          key={service.id}
                          className={cn(
                            "p-4 cursor-pointer transition-all",
                            isSelected ? "ring-2 ring-primary shadow-md" : "hover-elevate"
                          )}
                          onClick={() => handleSelectService(service)}
                          data-testid={`card-service-${service.id}`}
                        >
                          <div className="flex flex-col gap-2">
                            <div className="w-full aspect-[4/3] rounded-md bg-muted/50 flex items-center justify-center mb-1">
                              <Scissors className="w-8 h-8 text-muted-foreground/40" />
                            </div>
                            <h3 className="font-semibold text-sm leading-tight" data-testid={`text-service-name-${service.id}`}>{service.name}</h3>
                            {service.description && (
                              <p className="text-xs text-muted-foreground line-clamp-2">{service.description}</p>
                            )}
                            <div className="flex items-center justify-between gap-2 mt-auto pt-1">
                              <span className="font-bold text-sm">${Number(service.price).toFixed(2)}</span>
                              <Badge variant="secondary" className="no-default-active-elevate text-[10px]">
                                {service.duration}m
                              </Badge>
                            </div>
                          </div>
                        </Card>
                      );
                    })}
                  </div>

                  {selectedService && (
                    <InlineAddonsSection
                      serviceId={selectedService.id}
                      serviceName={selectedService.name}
                      selectedAddons={selectedAddons}
                      onToggleAddon={handleToggleAddon}
                    />
                  )}
                </div>
              )}
            </div>
          </div>

          <BookingSummaryPanel
            selectedService={selectedService}
            selectedAddons={selectedAddons}
            selectedStaff={selectedStaff}
            selectedCustomer={selectedCustomer}
            customers={customers}
            totalPrice={totalPrice}
            totalDuration={totalDuration}
            onSetCustomer={setSelectedCustomer}
            onRemoveService={handleRemoveService}
            onRemoveAddon={handleRemoveAddon}
            availableMinutes={availableMinutes}
            isCalendarBooking={isCalendarBooking}
            footerContent={
              <Button
                className="w-full bg-pink-500 text-white h-12"
                onClick={handleContinueToAddons}
                disabled={!selectedService}
                data-testid="button-request-booking"
              >
                <span className="flex flex-col items-center leading-tight">
                  <span className="font-semibold">Request Booking</span>
                  <span className="text-[10px] opacity-80">{totalDuration} min</span>
                </span>
              </Button>
            }
          />
        </>
      )}

      {step === "addons" && (
        <>
          <div className="flex-1 overflow-y-auto">
            <div className="p-4 border-b flex items-center gap-3 bg-card">
              <Button variant="ghost" size="icon" onClick={() => setStep("services")} data-testid="button-back-services">
                <ArrowLeft className="w-4 h-4" />
              </Button>
              <div>
                <h2 className="font-semibold text-lg" data-testid="text-extras-heading">Extras</h2>
                <p className="text-xs text-muted-foreground" data-testid="text-extras-subheading">for {selectedService?.name}</p>
              </div>
            </div>
            <div className="p-6">
              {addonsLoading ? (
                <div className="flex items-center justify-center h-32">
                  <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {availableAddons?.map((addon: Addon) => {
                    const isSelected = selectedAddons.some(a => a.id === addon.id);
                    return (
                      <Card
                        key={addon.id}
                        className={cn(
                          "p-4 cursor-pointer transition-all relative",
                          isSelected ? "ring-2 ring-primary shadow-md" : "hover-elevate"
                        )}
                        onClick={() => handleToggleAddon(addon)}
                        data-testid={`card-addon-${addon.id}`}
                      >
                        {isSelected && (
                          <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-primary flex items-center justify-center" data-testid={`addon-selected-${addon.id}`}>
                            <Check className="w-3 h-3 text-primary-foreground" />
                          </div>
                        )}
                        <div className="flex flex-col gap-2">
                          <div className="w-full aspect-[4/3] rounded-md bg-muted/50 flex items-center justify-center mb-1">
                            <Sparkles className="w-8 h-8 text-muted-foreground/40" />
                          </div>
                          <h3 className="font-semibold text-sm leading-tight" data-testid={`text-addon-name-${addon.id}`}>{addon.name}</h3>
                          {addon.description && (
                            <p className="text-xs text-muted-foreground line-clamp-2">{addon.description}</p>
                          )}
                          <div className="flex items-center justify-between gap-2 mt-auto pt-1">
                            <span className="font-bold text-sm">${Number(addon.price).toFixed(2)}</span>
                            <Badge variant="secondary" className="no-default-active-elevate text-[10px]">
                              {addon.duration}m
                            </Badge>
                          </div>
                        </div>
                      </Card>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          <BookingSummaryPanel
            selectedService={selectedService}
            selectedAddons={selectedAddons}
            selectedStaff={selectedStaff}
            selectedCustomer={selectedCustomer}
            customers={customers}
            totalPrice={totalPrice}
            totalDuration={totalDuration}
            onSetCustomer={setSelectedCustomer}
            onRemoveService={handleRemoveService}
            onRemoveAddon={handleRemoveAddon}
            availableMinutes={availableMinutes}
            isCalendarBooking={isCalendarBooking}
            footerContent={
              <Button
                className="w-full bg-pink-500 text-white h-12"
                onClick={handleContinueToDetails}
                data-testid="button-request-booking-addons"
              >
                <span className="flex flex-col items-center leading-tight">
                  <span className="font-semibold">Request Booking</span>
                  <span className="text-[10px] opacity-80">{totalDuration} min</span>
                </span>
              </Button>
            }
          />
        </>
      )}

      {step === "details" && (
        <>
          <div className="flex-1 overflow-hidden flex">
            <div className="w-[300px] flex-shrink-0 border-r bg-card flex flex-col">
              <div className="p-4 border-b flex items-center gap-2">
                <Button variant="ghost" size="icon" onClick={() => {
                  if (availableAddons && availableAddons.length > 0) setStep("addons");
                  else setStep("services");
                }} data-testid="button-back-from-details">
                  <ArrowLeft className="w-4 h-4" />
                </Button>
                <span className="font-semibold text-lg">Select Date</span>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={handleDateChange}
                  disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                  className="rounded-md border mx-auto"
                  data-testid="calendar-date-picker"
                />

                <div className="space-y-3">
                  <Label className="text-sm font-medium">Staff Preference</Label>
                  <div className="flex gap-2">
                    <Button
                      variant={staffMode === "any" ? "default" : "outline"}
                      className="flex-1 gap-1.5"
                      onClick={() => handleStaffModeChange("any")}
                      data-testid="button-staff-any"
                    >
                      <Users className="w-4 h-4" />
                      Any Staff
                    </Button>
                    <Button
                      variant={staffMode === "specific" ? "default" : "outline"}
                      className="flex-1 gap-1.5"
                      onClick={() => handleStaffModeChange("specific")}
                      data-testid="button-staff-specific"
                    >
                      <User className="w-4 h-4" />
                      Specific
                    </Button>
                  </div>

                  {staffMode === "specific" && (
                    <div className="space-y-2">
                      {staffList?.map((member: Staff) => (
                        <button
                          key={member.id}
                          onClick={() => handleSpecificStaffSelect(member.id)}
                          className={cn(
                            "w-full flex items-center gap-3 p-2.5 rounded-md text-left transition-colors",
                            specificStaffId === member.id
                              ? "bg-primary/10 ring-1 ring-primary"
                              : "hover-elevate"
                          )}
                          data-testid={`button-select-staff-${member.id}`}
                        >
                          <Avatar className="w-8 h-8">
                            <AvatarFallback
                              style={{ backgroundColor: (member.color || "#3b82f6") + "22", color: member.color || "#3b82f6" }}
                              className="text-xs font-bold"
                            >
                              {member.name.split(" ").map(n => n[0]).join("").toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{member.name}</p>
                            <p className="text-xs text-muted-foreground">{member.role}</p>
                          </div>
                          {specificStaffId === member.id && (
                            <Check className="w-4 h-4 text-primary flex-shrink-0" />
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {!selectedCustomer && (
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Client</Label>
                    <Select onValueChange={(val) => {
                      const cust = customers?.find((c: Customer) => c.id === Number(val));
                      if (cust) setSelectedCustomer(cust);
                    }}>
                      <SelectTrigger data-testid="select-details-customer">
                        <SelectValue placeholder="Select Client" />
                      </SelectTrigger>
                      <SelectContent>
                        {customers?.map((c: Customer) => (
                          <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <div className="space-y-2">
                  <Label className="text-sm font-medium">Notes</Label>
                  <Input
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Any special requests?"
                    data-testid="input-booking-notes"
                  />
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto">
              <div className="p-4 border-b bg-card flex items-center justify-between gap-2 flex-wrap">
                <div className="flex items-center gap-2">
                  <CalendarDays className="w-4 h-4 text-muted-foreground" />
                  <span className="font-semibold">
                    {selectedDate
                      ? selectedDate.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })
                      : "Select a date"}
                  </span>
                </div>
                <Badge variant="secondary" className="no-default-active-elevate text-xs">
                  {tzAbbr} &middot; {timezone}
                </Badge>
              </div>

              <div className="p-6">
                {!selectedDate ? (
                  <div className="flex flex-col items-center justify-center h-48 text-center">
                    <CalendarDays className="w-10 h-10 text-muted-foreground/30 mb-3" />
                    <p className="text-sm text-muted-foreground">Pick a date to see available time slots</p>
                  </div>
                ) : staffMode === "specific" && !specificStaffId ? (
                  <div className="flex flex-col items-center justify-center h-48 text-center">
                    <User className="w-10 h-10 text-muted-foreground/30 mb-3" />
                    <p className="text-sm text-muted-foreground">Select a staff member to see their availability</p>
                  </div>
                ) : slotsLoading ? (
                  <div className="flex items-center justify-center h-48">
                    <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                  </div>
                ) : !slots || slots.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-48 text-center">
                    <Clock className="w-10 h-10 text-muted-foreground/30 mb-3" />
                    <p className="text-sm text-muted-foreground">No available time slots for this date</p>
                    <p className="text-xs text-muted-foreground mt-1">Try a different date or staff preference</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                      {slots.length} available slot{slots.length !== 1 ? "s" : ""} &middot; {totalDuration} min per booking
                    </p>
                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2">
                      {slots.map((slot) => {
                        const timeLabel = formatInTz(slot.time, timezone, "h:mm a");
                        const isSelected = selectedSlot?.time === slot.time;

                        return (
                          <button
                            key={slot.time}
                            onClick={() => {
                              setSelectedSlot(slot);
                              setSelectedStaff(staffList?.find((s: Staff) => s.id === slot.staffId) || null);
                            }}
                            className={cn(
                              "flex flex-col items-center gap-0.5 px-3 py-2.5 rounded-md border text-sm transition-colors",
                              isSelected
                                ? "bg-primary text-primary-foreground border-primary"
                                : "hover-elevate"
                            )}
                            data-testid={`button-slot-${slot.time}`}
                          >
                            <span className="font-semibold">{timeLabel}</span>
                            {staffMode === "specific" && (
                              <span className={cn(
                                "text-[10px] truncate max-w-full",
                                isSelected ? "text-primary-foreground/80" : "text-muted-foreground"
                              )}>
                                {slot.staffName}
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <BookingSummaryPanel
            selectedService={selectedService}
            selectedAddons={selectedAddons}
            selectedStaff={selectedStaff}
            selectedCustomer={selectedCustomer}
            customers={customers}
            totalPrice={totalPrice}
            totalDuration={totalDuration}
            onSetCustomer={setSelectedCustomer}
            onRemoveService={handleRemoveService}
            onRemoveAddon={handleRemoveAddon}
            availableMinutes={availableMinutes}
            isCalendarBooking={isCalendarBooking}
            footerContent={
              <div className="space-y-2">
                {selectedSlot && (
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                    <Clock className="w-3.5 h-3.5" />
                    <span>
                      {formatInTz(selectedSlot.time, timezone, "h:mm a")} &middot; {selectedSlot.staffName}
                    </span>
                  </div>
                )}
                <Button
                  className="w-full h-12 bg-primary text-primary-foreground"
                  onClick={handleRequestBooking}
                  disabled={!selectedService || !selectedSlot || createAppointment.isPending}
                  data-testid="button-complete-booking"
                >
                  {createAppointment.isPending ? "Booking..." : "Complete Booking"}
                </Button>
              </div>
            }
          />
        </>
      )}

      <Dialog open={showConfirmation} onOpenChange={(open) => { if (!open) navigate("/calendar"); }}>
        <DialogContent className="sm:max-w-md" data-testid="booking-confirmation-dialog">
          <h2 className="text-xl font-bold">Appointment Confirmation</h2>
          <div className="space-y-4 mt-2">
            <div>
              <p className="text-xs text-muted-foreground uppercase font-medium tracking-wide">Service</p>
              <p className="font-semibold text-base mt-1" data-testid="confirm-service-name">{selectedService?.name}</p>
            </div>
            {selectedSlot && (
              <div className="bg-muted/50 rounded-md p-3 space-y-1.5">
                <div className="flex items-center gap-2 text-sm">
                  <CalendarDays className="w-4 h-4 text-muted-foreground" />
                  <span data-testid="confirm-date">{formatInTz(selectedSlot.time, timezone, "EEEE, MMM d, yyyy")}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  <span data-testid="confirm-time">{formatInTz(selectedSlot.time, timezone, "h:mm a")}</span>
                </div>
              </div>
            )}
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs text-muted-foreground uppercase font-medium tracking-wide">Customer</p>
                <p className="font-medium text-sm mt-1" data-testid="confirm-customer">{selectedCustomer?.name || "Walk-In"}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-muted-foreground uppercase font-medium tracking-wide">Staff</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="font-medium text-sm" data-testid="confirm-staff">{selectedSlot?.staffName}</span>
                </div>
              </div>
            </div>
          </div>
          <div className="flex justify-center mt-4">
            <Button
              className="px-8"
              onClick={() => navigate("/calendar")}
              data-testid="button-confirmation-ok"
            >
              OK
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function InlineAddonsSection({
  serviceId,
  serviceName,
  selectedAddons,
  onToggleAddon,
}: {
  serviceId: number;
  serviceName: string;
  selectedAddons: Addon[];
  onToggleAddon: (addon: Addon) => void;
}) {
  const { data: availableAddons, isLoading } = useAddonsForService(serviceId);

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 py-4">
        <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
        <span className="text-sm text-muted-foreground">Loading extras...</span>
      </div>
    );
  }

  if (!availableAddons || availableAddons.length === 0) return null;

  return (
    <div data-testid="inline-addons-section">
      <div className="flex items-center gap-2 mb-3">
        <Sparkles className="w-4 h-4 text-muted-foreground" />
        <h3 className="font-semibold text-sm">Extras for {serviceName}</h3>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {availableAddons.map((addon: Addon) => {
          const isSelected = selectedAddons.some(a => a.id === addon.id);
          return (
            <Card
              key={addon.id}
              className={cn(
                "p-3 cursor-pointer transition-all relative",
                isSelected ? "ring-2 ring-primary shadow-md" : "hover-elevate"
              )}
              onClick={() => onToggleAddon(addon)}
              data-testid={`inline-addon-${addon.id}`}
            >
              {isSelected && (
                <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                  <Check className="w-3 h-3 text-primary-foreground" />
                </div>
              )}
              <div className="flex flex-col gap-1.5">
                <h4 className="font-semibold text-xs leading-tight">{addon.name}</h4>
                {addon.description && (
                  <p className="text-[10px] text-muted-foreground line-clamp-2">{addon.description}</p>
                )}
                <div className="flex items-center justify-between gap-2 mt-auto pt-1">
                  <span className="font-bold text-xs">${Number(addon.price).toFixed(2)}</span>
                  <Badge variant="secondary" className="no-default-active-elevate text-[10px]">
                    {addon.duration}m
                  </Badge>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

function BookingSummaryPanel({
  selectedService,
  selectedAddons,
  selectedStaff,
  selectedCustomer,
  customers,
  totalPrice,
  totalDuration,
  onSetCustomer,
  onRemoveService,
  onRemoveAddon,
  footerContent,
  availableMinutes,
  isCalendarBooking,
}: {
  selectedService: Service | null;
  selectedAddons: Addon[];
  selectedStaff: Staff | null;
  selectedCustomer: Customer | null;
  customers: Customer[] | undefined;
  totalPrice: number;
  totalDuration: number;
  onSetCustomer: (c: Customer | null) => void;
  onRemoveService: () => void;
  onRemoveAddon: (id: number) => void;
  footerContent: React.ReactNode;
  availableMinutes?: number | null;
  isCalendarBooking?: boolean;
}) {
  const remainingMinutes = availableMinutes != null ? availableMinutes - totalDuration : null;
  const isOverTime = remainingMinutes != null && remainingMinutes < 0;
  return (
    <div className="w-[320px] flex-shrink-0 border-l bg-card flex flex-col" data-testid="booking-summary-panel">
      <div className="p-4 border-b flex items-center gap-3">
        <Avatar className="w-8 h-8">
          <AvatarFallback className="text-xs font-bold bg-muted">
            {selectedCustomer ? selectedCustomer.name.slice(0, 1).toUpperCase() : "W"}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1">
          {selectedCustomer ? (
            <div className="flex items-center gap-2">
              <Link
                href={`/client/${selectedCustomer.id}`}
                className="text-sm font-medium text-primary underline-offset-4 hover:underline cursor-pointer"
                data-testid="link-client-profile"
              >
                {selectedCustomer.name}
              </Link>
              <button onClick={() => onSetCustomer(null)} className="text-muted-foreground">
                <X className="w-3 h-3" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium" data-testid="text-walk-in">Walk-In</span>
              <Select onValueChange={(val) => {
                const cust = customers?.find((c: Customer) => c.id === Number(val));
                if (cust) onSetCustomer(cust);
              }}>
                <SelectTrigger className="h-7 w-7 p-0 border-0 [&>svg]:hidden" data-testid="select-booking-customer">
                  <User className="w-3.5 h-3.5 text-muted-foreground" />
                </SelectTrigger>
                <SelectContent>
                  {customers?.map((c: Customer) => (
                    <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {selectedService ? (
          <div className="space-y-3">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1">
                <h4 className="font-semibold text-sm" data-testid="text-summary-service">{selectedService.name}</h4>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {selectedService.duration} min
                  {selectedStaff && (
                    <> &middot; <Badge variant="outline" className="no-default-active-elevate text-[10px] px-1.5 py-0 ml-0.5">{selectedStaff.name}</Badge></>
                  )}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-sm" data-testid="text-summary-service-price">${Number(selectedService.price).toFixed(2)}</span>
                <button onClick={onRemoveService} className="text-muted-foreground">
                  <X className="w-3 h-3" />
                </button>
              </div>
            </div>

            {selectedAddons.length > 0 && (
              <div className="space-y-1.5 pl-3 border-l-2 border-muted">
                {selectedAddons.map((addon) => (
                  <div key={addon.id} className="flex items-center justify-between gap-2" data-testid={`summary-addon-${addon.id}`}>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs text-muted-foreground">+</span>
                      <span className="text-xs font-medium">{addon.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">{addon.duration} min</span>
                      <span className="text-xs font-medium">${Number(addon.price).toFixed(2)}</span>
                      <button onClick={() => onRemoveAddon(addon.id)} className="text-muted-foreground">
                        <X className="w-2.5 h-2.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-32 text-center">
            <Sparkles className="w-8 h-8 text-muted-foreground/30 mb-2" />
            <p className="text-sm text-muted-foreground">Select a service to begin</p>
          </div>
        )}
      </div>

      <div className="border-t p-4 space-y-3">
        {isCalendarBooking && availableMinutes != null && (
          <div
            className={cn(
              "rounded-md p-3 flex items-start gap-2.5",
              isOverTime
                ? "bg-destructive/10 border border-destructive/20"
                : "bg-sky-50 dark:bg-sky-950 border border-sky-200 dark:border-sky-800"
            )}
            data-testid="available-time-banner"
          >
            <Timer className={cn("w-4 h-4 mt-0.5 flex-shrink-0", isOverTime ? "text-destructive" : "text-sky-600 dark:text-sky-400")} />
            <div>
              <p className={cn("text-sm font-semibold", isOverTime ? "text-destructive" : "text-foreground")}>
                Available Time
              </p>
              <p className={cn("text-xs", isOverTime ? "text-destructive/80" : "text-muted-foreground")}>
                {isOverTime
                  ? `Exceeds available time by ${Math.abs(remainingMinutes!)} min.`
                  : `You have ${availableMinutes} minutes available for this slot. Used: ${totalDuration} min.`
                }
              </p>
            </div>
          </div>
        )}
        <div className="flex items-center justify-between">
          <div>
            <span className="font-semibold">Total</span>
            {totalDuration > 0 && <p className="text-xs text-muted-foreground">{totalDuration} min</p>}
          </div>
          <span className="font-bold text-lg" data-testid="text-summary-total">${totalPrice.toFixed(2)}</span>
        </div>
        {footerContent}
      </div>
    </div>
  );
}
