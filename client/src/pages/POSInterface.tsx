import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useServices } from "@/hooks/use-services";
import { useServiceCategories, useAddonsForService } from "@/hooks/use-addons";
import { useSelectedStore } from "@/hooks/use-store";
import { useLocation } from "wouter";
import { ArrowLeft, User, X, Sparkles, Loader2, Check, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Service, Addon, Customer } from "@shared/schema";

export default function POSInterface() {
  const [, navigate] = useLocation();
  const { selectedStore } = useSelectedStore();

  const params = new URLSearchParams(window.location.search);
  const clientIdParam = params.get("clientId");

  type TicketItem = { service: Service; addons: Addon[] };
  const [ticketItems, setTicketItems] = useState<TicketItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [activeItemIndex, setActiveItemIndex] = useState<number | null>(null);

  const { data: services, isLoading: servicesLoading } = useServices();
  const { data: categories } = useServiceCategories();

  const activeServiceId = activeItemIndex !== null && ticketItems[activeItemIndex]
    ? ticketItems[activeItemIndex].service.id
    : null;
  const { data: availableAddons, isLoading: addonsLoading } = useAddonsForService(activeServiceId);

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
    const newIndex = ticketItems.length;
    setTicketItems(prev => [...prev, { service, addons: [] }]);
    setActiveItemIndex(newIndex);
  };

  const handleRemoveItem = (index: number) => {
    setTicketItems(prev => prev.filter((_, i) => i !== index));
    if (activeItemIndex === index) {
      setActiveItemIndex(null);
    } else if (activeItemIndex !== null && activeItemIndex > index) {
      setActiveItemIndex(activeItemIndex - 1);
    }
  };

  const handleToggleAddon = (addon: Addon) => {
    if (activeItemIndex === null) return;
    setTicketItems(prev => prev.map((item, i) => {
      if (i !== activeItemIndex) return item;
      const exists = item.addons.find(a => a.id === addon.id);
      return {
        ...item,
        addons: exists
          ? item.addons.filter(a => a.id !== addon.id)
          : [...item.addons, addon],
      };
    }));
  };

  const ticketTotal = ticketItems.reduce((sum, item) => {
    const svcPrice = Number(item.service.price);
    const addonPrice = item.addons.reduce((s, a) => s + Number(a.price), 0);
    return sum + svcPrice + addonPrice;
  }, 0);
  const ticketDuration = ticketItems.reduce((sum, item) => {
    const addonDur = item.addons.reduce((s, a) => s + a.duration, 0);
    return sum + item.service.duration + addonDur;
  }, 0);

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
          {activeItemIndex !== null && availableAddons && availableAddons.length > 0 ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <h2 className="text-lg font-semibold">
                    Add-ons for {ticketItems[activeItemIndex]?.service.name}
                  </h2>
                  <p className="text-sm text-muted-foreground">Select optional extras</p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setActiveItemIndex(null)}
                  data-testid="button-done-addons"
                >
                  Done
                </Button>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {availableAddons.map((addon: Addon) => {
                  const isSelected = ticketItems[activeItemIndex]?.addons.some(a => a.id === addon.id) || false;
                  return (
                    <Card
                      key={addon.id}
                      className={cn(
                        "p-4 cursor-pointer transition-all",
                        isSelected ? "ring-2 ring-primary shadow-md" : "hover-elevate"
                      )}
                      onClick={() => handleToggleAddon(addon)}
                      data-testid={`pos-addon-${addon.id}`}
                    >
                      <div className="flex flex-col gap-2">
                        <div className="flex items-start justify-between gap-2">
                          <h3 className="font-semibold text-sm leading-tight">{addon.name}</h3>
                          {isSelected && (
                            <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                              <Check className="w-3 h-3 text-primary-foreground" />
                            </div>
                          )}
                        </div>
                        {addon.description && (
                          <p className="text-xs text-muted-foreground line-clamp-2">{addon.description}</p>
                        )}
                        <div className="flex items-center justify-between gap-2 mt-auto pt-1">
                          <span className="font-bold text-sm">+${Number(addon.price).toFixed(2)}</span>
                          <Badge variant="secondary" className="no-default-active-elevate text-[10px]">
                            +{addon.duration}m
                          </Badge>
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            </div>
          ) : servicesLoading ? (
            <div className="flex items-center justify-center h-full">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : activeItemIndex !== null && addonsLoading ? (
            <div className="flex items-center justify-center h-full">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <>
              {activeItemIndex !== null && (!availableAddons || availableAddons.length === 0) && (
                <div className="mb-4 p-3 rounded-md bg-muted/50 text-sm text-muted-foreground flex items-center justify-between gap-2">
                  <span>No add-ons available for {ticketItems[activeItemIndex]?.service.name}</span>
                  <Button variant="ghost" size="sm" onClick={() => setActiveItemIndex(null)} data-testid="button-dismiss-no-addons">
                    Continue
                  </Button>
                </div>
              )}
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
            </>
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
          {ticketItems.length > 0 ? (
            <div className="space-y-3">
              {ticketItems.map((item, index) => (
                <div key={index} data-testid={`pos-ticket-item-${index}`}>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 cursor-pointer" onClick={() => setActiveItemIndex(index)}>
                      <h4 className={cn("font-semibold text-sm", activeItemIndex === index && "text-primary")}>{item.service.name}</h4>
                      <p className="text-xs text-muted-foreground">{item.service.duration} min</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm">${Number(item.service.price).toFixed(2)}</span>
                      <button onClick={() => handleRemoveItem(index)} className="text-muted-foreground">
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                  {item.addons.length > 0 && (
                    <div className="space-y-1 pl-3 mt-1 border-l-2 border-muted">
                      {item.addons.map((addon) => (
                        <div key={addon.id} className="flex items-center justify-between gap-2" data-testid={`pos-ticket-addon-${addon.id}`}>
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs text-muted-foreground">+</span>
                            <span className="text-xs font-medium">{addon.name}</span>
                          </div>
                          <span className="text-xs font-medium">${Number(addon.price).toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                  )}
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
            disabled={ticketItems.length === 0}
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
