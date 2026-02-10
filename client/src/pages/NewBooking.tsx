import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useServices } from "@/hooks/use-services";
import { useStaffList } from "@/hooks/use-staff";
import { useCustomers } from "@/hooks/use-customers";
import { useCreateAppointment } from "@/hooks/use-appointments";
import { useSelectedStore } from "@/hooks/use-store";
import { getTimezoneAbbr } from "@/lib/timezone";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { ArrowLeft, Clock, User, X, Scissors, Sparkles, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Service, Staff, Customer } from "@shared/schema";

type BookingStep = "services" | "details";

export default function NewBooking() {
  const [, navigate] = useLocation();
  const { isLoading: authLoading } = useAuth();
  const { selectedStore } = useSelectedStore();
  const timezone = selectedStore?.timezone || "UTC";
  const tzAbbr = getTimezoneAbbr(timezone);

  const { data: services, isLoading: servicesLoading } = useServices();
  const { data: staffList } = useStaffList();
  const { data: customers } = useCustomers();
  const createAppointment = useCreateAppointment();

  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedStaff, setSelectedStaff] = useState<Staff | null>(null);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [dateTime, setDateTime] = useState("");
  const [notes, setNotes] = useState("");
  const [step, setStep] = useState<BookingStep>("services");

  const categories = useMemo(() => {
    if (!services) return [];
    const catSet = new Set<string>();
    services.forEach((s: Service) => catSet.add(s.category));
    return Array.from(catSet).sort();
  }, [services]);

  const filteredServices = useMemo(() => {
    if (!services) return [];
    if (!selectedCategory && categories.length > 0) {
      return services.filter((s: Service) => s.category === categories[0]);
    }
    return services.filter((s: Service) => s.category === selectedCategory);
  }, [services, selectedCategory, categories]);

  const activeCategory = selectedCategory || (categories.length > 0 ? categories[0] : null);

  const totalPrice = selectedService ? Number(selectedService.price) : 0;
  const totalDuration = selectedService ? selectedService.duration : 0;

  const handleSelectService = (service: Service) => {
    setSelectedService(service);
  };

  const handleRemoveService = () => {
    setSelectedService(null);
  };

  const handleRequestBooking = () => {
    if (!selectedService || !selectedStaff || !selectedCustomer || !dateTime) return;

    createAppointment.mutate(
      {
        date: dateTime,
        serviceId: selectedService.id,
        staffId: selectedStaff.id,
        customerId: selectedCustomer.id,
        duration: selectedService.duration,
        notes: notes || undefined,
        status: "pending",
      } as any,
      {
        onSuccess: () => {
          navigate("/calendar");
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
      {step === "services" ? (
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
                {categories.map((cat) => (
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
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {filteredServices.map((service: Service) => {
                    const isSelected = selectedService?.id === service.id;
                    return (
                      <Card
                        key={service.id}
                        className={cn(
                          "p-4 cursor-pointer transition-all",
                          isSelected
                            ? "ring-2 ring-primary shadow-md"
                            : "hover-elevate"
                        )}
                        onClick={() => handleSelectService(service)}
                        data-testid={`card-service-${service.id}`}
                      >
                        <div className="flex flex-col gap-2">
                          <div className="w-full aspect-[4/3] rounded-md bg-muted/50 flex items-center justify-center mb-1">
                            <Scissors className="w-8 h-8 text-muted-foreground/40" />
                          </div>
                          <h3 className="font-semibold text-sm leading-tight">{service.name}</h3>
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
              )}
            </div>
          </div>

          <div className="w-[320px] flex-shrink-0 border-l bg-card flex flex-col" data-testid="booking-summary-panel">
            <div className="p-4 border-b flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                <User className="w-4 h-4 text-muted-foreground" />
              </div>
              <div className="flex-1">
                {selectedCustomer ? (
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{selectedCustomer.name}</span>
                    <button onClick={() => setSelectedCustomer(null)} className="text-muted-foreground">
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ) : (
                  <Select onValueChange={(val) => {
                    const cust = customers?.find((c: Customer) => c.id === Number(val));
                    if (cust) setSelectedCustomer(cust);
                  }}>
                    <SelectTrigger className="h-8 text-xs" data-testid="select-booking-customer">
                      <SelectValue placeholder="Select Client" />
                    </SelectTrigger>
                    <SelectContent>
                      {customers?.map((c: Customer) => (
                        <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              {selectedService ? (
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <h4 className="font-semibold text-sm">{selectedService.name}</h4>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {selectedService.duration} min
                        {selectedStaff ? ` \u00B7 ${selectedStaff.name}` : " \u00B7 Any Staff"}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm">${Number(selectedService.price).toFixed(2)}</span>
                      <button onClick={handleRemoveService} className="text-muted-foreground">
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-32 text-center">
                  <Sparkles className="w-8 h-8 text-muted-foreground/30 mb-2" />
                  <p className="text-sm text-muted-foreground">Select a service to begin</p>
                </div>
              )}
            </div>

            <div className="border-t p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-semibold">Total</span>
                <span className="font-bold text-lg">${totalPrice.toFixed(2)}</span>
              </div>

              {selectedService && !selectedStaff ? (
                <Button
                  className="w-full bg-pink-500 text-white hover:bg-pink-600 h-12"
                  onClick={() => setStep("details")}
                  disabled={!selectedService}
                  data-testid="button-continue-details"
                >
                  <span className="flex flex-col items-center leading-tight">
                    <span className="font-semibold">Continue</span>
                    <span className="text-[10px] opacity-80">Select staff & time</span>
                  </span>
                </Button>
              ) : selectedService && selectedStaff ? (
                <Button
                  className="w-full bg-pink-500 text-white hover:bg-pink-600 h-12"
                  onClick={() => setStep("details")}
                  data-testid="button-continue-details"
                >
                  <span className="flex flex-col items-center leading-tight">
                    <span className="font-semibold">Continue</span>
                    <span className="text-[10px] opacity-80">Confirm booking</span>
                  </span>
                </Button>
              ) : (
                <Button
                  className="w-full bg-pink-500 text-white h-12 opacity-50 cursor-not-allowed"
                  disabled
                  data-testid="button-request-booking-disabled"
                >
                  <span className="flex flex-col items-center leading-tight">
                    <span className="font-semibold">Request Booking</span>
                    <span className="text-[10px] opacity-80">0 min</span>
                  </span>
                </Button>
              )}
            </div>
          </div>
        </>
      ) : (
        <>
          <div className="flex-1 overflow-y-auto">
            <div className="p-4 border-b flex items-center gap-2 bg-card">
              <Button variant="ghost" size="icon" onClick={() => setStep("services")} data-testid="button-back-services">
                <ArrowLeft className="w-4 h-4" />
              </Button>
              <span className="font-semibold text-lg">Booking Details</span>
            </div>
            <div className="max-w-lg mx-auto p-6 space-y-6">
              <div className="space-y-2">
                <Label className="text-sm font-medium">Staff Member</Label>
                <div className="grid grid-cols-2 gap-3">
                  {staffList?.map((member: Staff) => (
                    <Card
                      key={member.id}
                      className={cn(
                        "p-3 cursor-pointer transition-all flex items-center gap-3",
                        selectedStaff?.id === member.id
                          ? "ring-2 ring-primary"
                          : "hover-elevate"
                      )}
                      onClick={() => setSelectedStaff(member)}
                      data-testid={`card-staff-${member.id}`}
                    >
                      <Avatar className="w-10 h-10">
                        <AvatarFallback
                          style={{ backgroundColor: (member.color || "#3b82f6") + "22", color: member.color || "#3b82f6" }}
                          className="text-sm font-bold"
                        >
                          {member.name.split(" ").map(n => n[0]).join("").toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium">{member.name}</p>
                        <p className="text-xs text-muted-foreground">{member.role}</p>
                      </div>
                    </Card>
                  ))}
                </div>
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
                <Label className="text-sm font-medium">Date & Time ({tzAbbr})</Label>
                <Input
                  type="datetime-local"
                  value={dateTime}
                  onChange={(e) => setDateTime(e.target.value)}
                  data-testid="input-booking-datetime"
                />
                <p className="text-xs text-muted-foreground">Store timezone: {timezone}</p>
              </div>

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

          <div className="w-[320px] flex-shrink-0 border-l bg-card flex flex-col" data-testid="booking-summary-panel">
            <div className="p-4 border-b flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                <User className="w-4 h-4 text-muted-foreground" />
              </div>
              <span className="text-sm font-medium">
                {selectedCustomer?.name || "No client selected"}
              </span>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              {selectedService && (
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <h4 className="font-semibold text-sm">{selectedService.name}</h4>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {selectedService.duration} min
                      {selectedStaff ? ` \u00B7 ${selectedStaff.name}` : " \u00B7 Any Staff"}
                    </p>
                  </div>
                  <span className="font-semibold text-sm">${Number(selectedService.price).toFixed(2)}</span>
                </div>
              )}
            </div>

            <div className="border-t p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-semibold">Total</span>
                <span className="font-bold text-lg">${totalPrice.toFixed(2)}</span>
              </div>

              <Button
                className="w-full bg-pink-500 text-white hover:bg-pink-600 h-12"
                onClick={handleRequestBooking}
                disabled={!selectedService || !selectedStaff || !selectedCustomer || !dateTime || createAppointment.isPending}
                data-testid="button-request-booking"
              >
                <span className="flex flex-col items-center leading-tight">
                  <span className="font-semibold">
                    {createAppointment.isPending ? "Booking..." : "Request Booking"}
                  </span>
                  <span className="text-[10px] opacity-80">{totalDuration} min</span>
                </span>
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
