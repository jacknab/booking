import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useServices } from "@/hooks/use-services";
import { useServiceCategories } from "@/hooks/use-addons";
import { useSelectedStore } from "@/hooks/use-store";
import { useLocation } from "wouter";
import { ArrowLeft, User, X, Sparkles, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Service, Customer } from "@shared/schema";

export default function POSInterface() {
  const [, navigate] = useLocation();
  const { selectedStore } = useSelectedStore();

  const params = new URLSearchParams(window.location.search);
  const clientIdParam = params.get("clientId");

  const [ticketServices, setTicketServices] = useState<Service[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const { data: services, isLoading: servicesLoading } = useServices();
  const { data: categories } = useServiceCategories();

  const { data: client } = useQuery<Customer | null>({
    queryKey: ["/api/customers", clientIdParam],
    queryFn: async () => {
      if (!clientIdParam || !selectedStore?.id) return null;
      const res = await fetch(`/api/customers?storeId=${selectedStore.id}`, { credentials: "include" });
      if (!res.ok) return null;
      const custs: Customer[] = await res.json();
      return custs.find(c => c.id === Number(clientIdParam)) || null;
    },
    enabled: !!clientIdParam && !!selectedStore?.id,
  });

  const categoryNames = useMemo(() => {
    if (categories && categories.length > 0) {
      return Array.from(new Set(categories.map((c: any) => c.name))).sort() as string[];
    }
    if (!services) return [];
    const catSet = new Set<string>();
    services.forEach((s: Service) => catSet.add(s.category));
    return Array.from(catSet).sort();
  }, [services, categories]);

  const activeCategory = selectedCategory || (categoryNames.length > 0 ? categoryNames[0] : null);

  const filteredServices = useMemo(() => {
    if (!services) return [];
    if (!activeCategory) return services;
    return services.filter((s: Service) => s.category === activeCategory);
  }, [services, activeCategory]);

  const handleAddService = (service: Service) => {
    setTicketServices(prev => [...prev, service]);
  };

  const handleRemoveService = (index: number) => {
    setTicketServices(prev => prev.filter((_, i) => i !== index));
  };

  const ticketTotal = ticketServices.reduce((sum, s) => sum + Number(s.price), 0);
  const ticketDuration = ticketServices.reduce((sum, s) => sum + s.duration, 0);

  return (
    <div className="h-screen w-screen flex bg-background">
      <div className="flex flex-1 overflow-hidden">
        <div className="w-[180px] flex-shrink-0 border-r bg-card flex flex-col">
          <div className="p-4 border-b flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={() => navigate("/client-lookup")} data-testid="button-back-lookup">
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
                data-testid={`pos-category-${cat.toLowerCase().replace(/\s+/g, "-")}`}
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
              {filteredServices.map((service: Service) => (
                <Card
                  key={service.id}
                  className="p-4 cursor-pointer hover-elevate"
                  onClick={() => handleAddService(service)}
                  data-testid={`pos-service-${service.id}`}
                >
                  <div className="flex flex-col gap-2">
                    <h3 className="font-semibold text-sm leading-tight">{service.name}</h3>
                    <div className="flex items-center justify-between gap-2 mt-auto pt-1">
                      <span className="font-bold text-sm">${Number(service.price).toFixed(2)}</span>
                      <Badge variant="secondary" className="no-default-active-elevate text-[10px]">
                        {service.duration}m
                      </Badge>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="w-[320px] flex-shrink-0 border-l bg-card flex flex-col" data-testid="pos-ticket-panel">
        <div className="p-4 border-b flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
            <User className="w-4 h-4 text-muted-foreground" />
          </div>
          <div className="flex-1">
            <span className="text-sm font-semibold uppercase" data-testid="pos-client-name">
              {client ? client.name : "GUEST"}
            </span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/client-lookup")}
            data-testid="button-change-client"
          >
            <User className="w-4 h-4" />
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {ticketServices.length > 0 ? (
            <div className="space-y-3">
              {ticketServices.map((svc, index) => (
                <div key={index} className="flex items-start justify-between gap-2" data-testid={`pos-ticket-item-${index}`}>
                  <div className="flex-1">
                    <h4 className="font-semibold text-sm">{svc.name}</h4>
                    <p className="text-xs text-muted-foreground">{svc.duration} min</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm">${Number(svc.price).toFixed(2)}</span>
                    <button onClick={() => handleRemoveService(index)} className="text-muted-foreground">
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-32 text-center">
              <Sparkles className="w-8 h-8 text-muted-foreground/30 mb-2" />
              <p className="text-sm text-muted-foreground">Start adding services...</p>
            </div>
          )}
        </div>

        <div className="border-t p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <span className="font-semibold">Total</span>
              {ticketDuration > 0 && <p className="text-xs text-muted-foreground">{ticketDuration} min</p>}
            </div>
            <span className="font-bold text-lg" data-testid="pos-ticket-total">${ticketTotal.toFixed(2)}</span>
          </div>
          <Button
            className="w-full bg-pink-500 text-white"
            size="lg"
            disabled={ticketServices.length === 0}
            onClick={() => {
              navigate("/calendar");
            }}
            data-testid="button-pos-checkout"
          >
            Checkout - ${ticketTotal.toFixed(2)}
          </Button>
        </div>
      </div>
    </div>
  );
}
