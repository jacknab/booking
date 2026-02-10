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
import { useAddonsForService, useSetAppointmentAddons, useServiceCategories } from "@/hooks/use-addons";
import { useSelectedStore } from "@/hooks/use-store";
import { getTimezoneAbbr } from "@/lib/timezone";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { ArrowLeft, Clock, User, X, Scissors, Sparkles, Loader2, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Service, Staff, Customer, Addon } from "@shared/schema";

type BookingStep = "services" | "addons" | "details";

export default function NewBooking() {
  const [, navigate] = useLocation();
  const { isLoading: authLoading } = useAuth();
  const { selectedStore } = useSelectedStore();
  const timezone = selectedStore?.timezone || "UTC";
  const tzAbbr = getTimezoneAbbr(timezone);

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
  const [dateTime, setDateTime] = useState("");
  const [notes, setNotes] = useState("");
  const [step, setStep] = useState<BookingStep>("services");

  const { data: availableAddons, isLoading: addonsLoading } = useAddonsForService(selectedService?.id || null);

  const categoryNames = useMemo(() => {
    if (categories && categories.length > 0) {
      return [...new Set(categories.map((c: any) => c.name))].sort() as string[];
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

  const addonTotal = selectedAddons.reduce((sum, a) => sum + Number(a.price), 0);
  const addonDuration = selectedAddons.reduce((sum, a) => sum + a.duration, 0);
  const servicePrice = selectedService ? Number(selectedService.price) : 0;
  const totalPrice = servicePrice + addonTotal;
  const totalDuration = (selectedService?.duration || 0) + addonDuration;

  const handleSelectService = (service: Service) => {
    if (selectedService?.id !== service.id) {
      setSelectedAddons([]);
    }
    setSelectedService(service);
  };

  const handleRemoveService = () => {
    setSelectedService(null);
    setSelectedAddons([]);
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
    } else {
      setStep("details");
    }
  };

  const handleContinueToDetails = () => {
    setStep("details");
  };

  const handleRequestBooking = () => {
    if (!selectedService || !selectedStaff || !selectedCustomer || !dateTime) return;

    createAppointment.mutate(
      {
        date: dateTime,
        serviceId: selectedService.id,
        staffId: selectedStaff.id,
        customerId: selectedCustomer.id,
        duration: totalDuration,
        notes: notes || undefined,
        status: "pending",
      } as any,
      {
        onSuccess: (data: any) => {
          if (selectedAddons.length > 0 && data?.id) {
            setAppointmentAddons.mutate(
              { appointmentId: data.id, addonIds: selectedAddons.map(a => a.id) },
              { onSuccess: () => navigate("/calendar"), onError: () => navigate("/calendar") }
            );
          } else {
            navigate("/calendar");
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
            footerContent={
              selectedService ? (
                <Button
                  className="w-full bg-pink-500 text-white h-12"
                  onClick={handleContinueToAddons}
                  data-testid="button-continue-addons"
                >
                  <span className="flex flex-col items-center leading-tight">
                    <span className="font-semibold">Continue</span>
                    <span className="text-[10px] opacity-80">
                      {availableAddons && availableAddons.length > 0 ? "Select extras" : "Select staff & time"}
                    </span>
                  </span>
                </Button>
              ) : (
                <Button className="w-full bg-pink-500 text-white h-12 opacity-50 cursor-not-allowed" disabled data-testid="button-request-booking-disabled">
                  <span className="flex flex-col items-center leading-tight">
                    <span className="font-semibold">Request Booking</span>
                    <span className="text-[10px] opacity-80">0 min</span>
                  </span>
                </Button>
              )
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
            footerContent={
              <Button
                className="w-full bg-pink-500 text-white h-12"
                onClick={handleContinueToDetails}
                data-testid="button-continue-details"
              >
                <span className="flex flex-col items-center leading-tight">
                  <span className="font-semibold">Continue</span>
                  <span className="text-[10px] opacity-80">Select staff & time</span>
                </span>
              </Button>
            }
          />
        </>
      )}

      {step === "details" && (
        <>
          <div className="flex-1 overflow-y-auto">
            <div className="p-4 border-b flex items-center gap-2 bg-card">
              <Button variant="ghost" size="icon" onClick={() => {
                if (availableAddons && availableAddons.length > 0) setStep("addons");
                else setStep("services");
              }} data-testid="button-back-from-details">
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
                        selectedStaff?.id === member.id ? "ring-2 ring-primary" : "hover-elevate"
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
            footerContent={
              <div className="space-y-2">
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    className="flex-1 h-12"
                    onClick={handleRequestBooking}
                    disabled={!selectedService || !selectedStaff || !selectedCustomer || !dateTime || createAppointment.isPending}
                    data-testid="button-save-changes"
                  >
                    <span className="flex flex-col items-center leading-tight">
                      <span className="font-semibold text-sm">
                        {createAppointment.isPending ? "Saving..." : "Save Changes"}
                      </span>
                      <span className="text-[10px] text-muted-foreground">Update Ticket</span>
                    </span>
                  </Button>
                  <Button
                    className="flex-1 bg-pink-500 text-white h-12"
                    onClick={handleRequestBooking}
                    disabled={!selectedService || !selectedStaff || !selectedCustomer || !dateTime || createAppointment.isPending}
                    data-testid="button-checkout"
                  >
                    <span className="flex flex-col items-center leading-tight">
                      <span className="font-semibold">Checkout</span>
                      <span className="text-[10px] opacity-80">${totalPrice.toFixed(2)}</span>
                    </span>
                  </Button>
                </div>
              </div>
            }
          />
        </>
      )}
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
}) {
  return (
    <div className="w-[320px] flex-shrink-0 border-l bg-card flex flex-col" data-testid="booking-summary-panel">
      <div className="p-4 border-b flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
          <User className="w-4 h-4 text-muted-foreground" />
        </div>
        <div className="flex-1">
          {selectedCustomer ? (
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium" data-testid="text-selected-customer">{selectedCustomer.name}</span>
              <button onClick={() => onSetCustomer(null)} className="text-muted-foreground">
                <X className="w-3 h-3" />
              </button>
            </div>
          ) : (
            <Select onValueChange={(val) => {
              const cust = customers?.find((c: Customer) => c.id === Number(val));
              if (cust) onSetCustomer(cust);
            }}>
              <SelectTrigger className="h-8 text-xs" data-testid="select-booking-customer">
                <SelectValue placeholder="Walk-In" />
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
