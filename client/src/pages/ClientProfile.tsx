import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useSelectedStore } from "@/hooks/use-store";
import { useLocation, useParams } from "wouter";
import { formatInTz } from "@/lib/timezone";
import { ArrowLeft, Phone, Mail, ChevronRight, Calendar, Clock, FileText, CreditCard, ShoppingBag, X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Customer, AppointmentWithDetails } from "@shared/schema";

type ProfileSection = "overview" | "next" | "past" | "deposits" | "notes" | "purchases";

export default function ClientProfile() {
  const [, navigate] = useLocation();
  const params = useParams<{ id: string }>();
  const clientId = Number(params.id);
  const { selectedStore } = useSelectedStore();
  const timezone = selectedStore?.timezone || "UTC";

  const [activeSection, setActiveSection] = useState<ProfileSection>("overview");

  const { data: client, isLoading: clientLoading } = useQuery<Customer>({
    queryKey: ["/api/customers", clientId],
    enabled: !!clientId,
  });

  const storeId = selectedStore?.id;

  const { data: allAppointments } = useQuery<AppointmentWithDetails[]>({
    queryKey: [`/api/appointments?customerId=${clientId}&storeId=${storeId}`, clientId, storeId],
    enabled: !!clientId && !!storeId,
  });

  const now = new Date();

  const pastAppointments = useMemo(() => {
    if (!allAppointments) return [];
    return allAppointments
      .filter(a => new Date(a.date) < now)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [allAppointments, now]);

  const nextAppointments = useMemo(() => {
    if (!allAppointments) return [];
    return allAppointments
      .filter(a => new Date(a.date) >= now && a.status !== "cancelled")
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [allAppointments, now]);

  const totalSpend = useMemo(() => {
    if (!allAppointments) return 0;
    return allAppointments
      .filter(a => a.status === "completed" || a.status === "pending" || a.status === "confirmed")
      .reduce((sum, a) => {
        const svcPrice = a.service ? Number(a.service.price) : 0;
        const addonPrice = a.appointmentAddons
          ? a.appointmentAddons.reduce((s, aa) => s + (aa.addon ? Number(aa.addon.price) : 0), 0)
          : 0;
        return sum + svcPrice + addonPrice;
      }, 0);
  }, [allAppointments]);

  const noShows = useMemo(() => {
    if (!allAppointments) return 0;
    return allAppointments.filter(a => a.status === "no-show").length;
  }, [allAppointments]);

  const cancellations = useMemo(() => {
    if (!allAppointments) return 0;
    return allAppointments.filter(a => a.status === "cancelled").length;
  }, [allAppointments]);

  const sections: { id: ProfileSection; label: string; count?: number; icon: typeof Calendar }[] = [
    { id: "overview", label: "Overview", icon: FileText },
    { id: "next", label: "Next Appointments", count: nextAppointments.length, icon: Calendar },
    { id: "past", label: "Past Appointments", count: pastAppointments.length, icon: Clock },
    { id: "deposits", label: "Deposits", icon: CreditCard },
    { id: "notes", label: "Notes", count: client?.notes ? 1 : 0, icon: FileText },
    { id: "purchases", label: "Purchases", count: 0, icon: ShoppingBag },
  ];

  const initials = client?.name
    ? client.name.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2)
    : "?";

  const renderAppointmentCard = (apt: AppointmentWithDetails) => {
    const dateLabel = formatInTz(apt.date, timezone, "dd MMM, yyyy, h:mm a");
    const statusColors: Record<string, string> = {
      completed: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
      pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
      confirmed: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
      cancelled: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
      "no-show": "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200",
    };

    const svcPrice = apt.service ? Number(apt.service.price) : 0;
    const addonTotal = apt.appointmentAddons
      ? apt.appointmentAddons.reduce((s, aa) => s + (aa.addon ? Number(aa.addon.price) : 0), 0)
      : 0;
    const aptTotal = svcPrice + addonTotal;

    return (
      <Card key={apt.id} className="p-4 space-y-3" data-testid={`appointment-card-${apt.id}`}>
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <span className="text-sm font-medium text-muted-foreground" data-testid={`appointment-date-${apt.id}`}>
            {dateLabel}
          </span>
          <Badge
            variant="secondary"
            className={cn("no-default-active-elevate text-xs capitalize", statusColors[apt.status || "pending"])}
            data-testid={`appointment-status-${apt.id}`}
          >
            {apt.status || "Pending"}
          </Badge>
        </div>
        <div>
          <h4 className="font-semibold text-base">{apt.service?.name || "Service"}</h4>
          <p className="text-sm text-muted-foreground">
            {apt.service?.name || "Service"}
          </p>
          <p className="text-sm text-muted-foreground">
            {apt.staff?.name || "Staff"} | $ {aptTotal.toFixed(2)} | {apt.duration} mins
          </p>
        </div>
        {apt.appointmentAddons && apt.appointmentAddons.length > 0 && (
          <div className="pl-3 border-l-2 border-muted space-y-1">
            {apt.appointmentAddons.map(aa => (
              <p key={aa.id} className="text-xs text-muted-foreground">
                + {aa.addon?.name} (${aa.addon ? Number(aa.addon.price).toFixed(2) : "0.00"})
              </p>
            ))}
          </div>
        )}
        <div className="flex items-center justify-between pt-2 border-t">
          <span className="text-sm font-medium">Total:</span>
          <span className="font-bold" data-testid={`appointment-total-${apt.id}`}>$ {aptTotal.toFixed(2)}</span>
        </div>
      </Card>
    );
  };

  const renderContent = () => {
    switch (activeSection) {
      case "overview":
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-bold">Overview</h2>
            <div className="grid grid-cols-2 gap-x-8 gap-y-3">
              <div className="flex items-baseline gap-2">
                <span className="text-sm text-muted-foreground">Total Spend:</span>
                <span className="font-semibold" data-testid="stat-total-spend">$ {totalSpend.toFixed(2)}</span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-sm text-muted-foreground">Deposit:</span>
                <span className="font-semibold" data-testid="stat-deposit">$ 0.00</span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-sm text-muted-foreground">No-Shows:</span>
                <span className="font-semibold" data-testid="stat-no-shows">{noShows}</span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-sm text-muted-foreground">Cancellations:</span>
                <span className="font-semibold" data-testid="stat-cancellations">{cancellations}</span>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Recent Appointments</h3>
              {allAppointments && allAppointments.length > 0 ? (
                <div className="space-y-3">
                  {allAppointments
                    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                    .slice(0, 5)
                    .map(renderAppointmentCard)}
                  {allAppointments.length > 5 && (
                    <button
                      className="text-sm text-muted-foreground font-medium hover-elevate px-2 py-1 rounded"
                      onClick={() => setActiveSection("past")}
                      data-testid="button-view-more"
                    >
                      VIEW MORE
                    </button>
                  )}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No appointments yet</p>
              )}
            </div>
          </div>
        );

      case "next":
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-bold">Next Appointments</h2>
            {nextAppointments.length > 0 ? (
              <div className="space-y-3">
                {nextAppointments.map(renderAppointmentCard)}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No upcoming appointments</p>
            )}
          </div>
        );

      case "past":
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-bold">Past Appointments</h2>
            {pastAppointments.length > 0 ? (
              <div className="space-y-3">
                {pastAppointments.map(renderAppointmentCard)}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No past appointments</p>
            )}
          </div>
        );

      case "deposits":
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-bold">Deposits</h2>
            <p className="text-sm text-muted-foreground">No deposits recorded</p>
          </div>
        );

      case "notes":
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-bold">Notes</h2>
            {client?.notes ? (
              <Card className="p-4">
                <p className="text-sm" data-testid="client-notes">{client.notes}</p>
              </Card>
            ) : (
              <p className="text-sm text-muted-foreground">No notes</p>
            )}
          </div>
        );

      case "purchases":
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-bold">Purchases</h2>
            <p className="text-sm text-muted-foreground">No purchases recorded</p>
          </div>
        );

      default:
        return null;
    }
  };

  if (clientLoading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-background">
        <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!client) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-background gap-4">
        <p className="text-muted-foreground">Client not found</p>
        <Button variant="outline" onClick={() => navigate("/customers")}>Back to Customers</Button>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen flex bg-background">
      <div className="w-[320px] flex-shrink-0 border-r bg-card flex flex-col">
        <div className="p-4 border-b flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={() => navigate("/customers")} data-testid="button-back-clients">
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <span className="font-semibold text-lg">Clients</span>
        </div>

        <div className="p-6 flex flex-col items-center text-center border-b">
          <Avatar className="w-16 h-16 mb-3">
            <AvatarFallback className="text-xl font-bold bg-primary/10 text-primary" data-testid="client-avatar">
              {initials}
            </AvatarFallback>
          </Avatar>
          <h2 className="text-lg font-bold" data-testid="client-name">{client.name}</h2>
          {client.phone && (
            <div className="flex items-center gap-1.5 mt-2 text-sm text-muted-foreground">
              <Phone className="w-3.5 h-3.5" />
              <span data-testid="client-phone">{client.phone}</span>
            </div>
          )}
          {client.email && (
            <div className="flex items-center gap-1.5 mt-1 text-sm text-muted-foreground">
              <Mail className="w-3.5 h-3.5" />
              <span className="truncate max-w-[200px]" data-testid="client-email">{client.email}</span>
            </div>
          )}
          <div className="flex items-center gap-2 mt-4">
            <Button
              className="bg-primary text-primary-foreground"
              size="sm"
              onClick={() => navigate("/booking/new")}
              data-testid="button-book-now"
            >
              Book Now
            </Button>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto py-2">
          {sections.map((section) => (
            <button
              key={section.id}
              onClick={() => setActiveSection(section.id)}
              className={cn(
                "w-full flex items-center justify-between gap-2 px-5 py-3.5 text-sm font-medium transition-colors",
                activeSection === section.id
                  ? "text-primary bg-primary/5"
                  : "text-muted-foreground"
              )}
              data-testid={`section-${section.id}`}
            >
              <span>{section.label}</span>
              <div className="flex items-center gap-1.5">
                {section.count !== undefined && (
                  <Badge variant="secondary" className="no-default-active-elevate text-xs min-w-[24px] justify-center">
                    {section.count}
                  </Badge>
                )}
                <ChevronRight className="w-4 h-4 text-muted-foreground/50" />
              </div>
            </button>
          ))}
        </nav>
      </div>

      <div className="flex-1 overflow-y-auto p-8">
        {renderContent()}
      </div>
    </div>
  );
}
