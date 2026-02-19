import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Switch } from "@/components/ui/switch";
import { useServices } from "@/hooks/use-services";
import { useServiceCategories, useAddonsForService } from "@/hooks/use-addons";
import { useStaffList } from "@/hooks/use-staff";
import { useSelectedStore } from "@/hooks/use-store";
import { useLocation } from "wouter";
import { ArrowLeft, User, X, Sparkles, Loader2, Check, Heart, Printer, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Service, Addon, Customer, Staff } from "@shared/schema";
import { ReceiptContent, useReceiptPrinter, type ReceiptData } from "@/components/Receipt";

type TicketItem = { service: Service; addons: Addon[]; staffId: number | null };

function TipScreen({
  amountDue,
  staffMember,
  onAddTip,
  onCancel,
}: {
  amountDue: number;
  staffMember: Staff | null;
  onAddTip: (tipAmount: number) => void;
  onCancel: () => void;
}) {
  const [selectedPreset, setSelectedPreset] = useState<number | null>(null);
  const [customAmount, setCustomAmount] = useState("");
  const [isPercentMode, setIsPercentMode] = useState(false);

  const presets = [
    { label: "10%", pct: 0.1 },
    { label: "15%", pct: 0.15 },
    { label: "20%", pct: 0.2 },
  ];

  const handlePresetClick = (index: number) => {
    setSelectedPreset(index);
    setCustomAmount("");
  };

  const getTipAmount = (): number => {
    if (customAmount && customAmount !== "0") {
      const val = parseFloat(customAmount);
      if (isNaN(val)) return 0;
      return isPercentMode ? (amountDue * val) / 100 : val;
    }
    if (selectedPreset !== null) {
      return amountDue * presets[selectedPreset].pct;
    }
    return 0;
  };

  const tipAmount = getTipAmount();

  const staffInitials = staffMember
    ? staffMember.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "";

  return (
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center">
      <Card className="w-full max-w-md mx-4 p-0 overflow-hidden">
        <div className="flex items-center gap-3 p-4 border-b">
          <Button variant="ghost" size="icon" onClick={onCancel} data-testid="button-tip-back">
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <h2 className="font-bold text-lg">Add tip</h2>
        </div>

        <div className="p-6 space-y-6">
          <div className="text-center">
            <p className="text-4xl font-bold" data-testid="text-tip-amount-due">
              $ {amountDue.toFixed(2)}
            </p>
            <p className="text-sm text-muted-foreground mt-1">Amount Due</p>
          </div>

          <div className="grid grid-cols-3 gap-3">
            {presets.map((preset, i) => (
              <Card
                key={i}
                className={cn(
                  "p-4 text-center cursor-pointer transition-all",
                  selectedPreset === i && !customAmount
                    ? "ring-2 ring-primary"
                    : "hover-elevate"
                )}
                onClick={() => handlePresetClick(i)}
                data-testid={`button-tip-preset-${preset.label}`}
              >
                <p className="font-semibold text-sm">{preset.label}</p>
                <p className="text-sm text-muted-foreground mt-1">
                  $ {(amountDue * preset.pct).toFixed(2)}
                </p>
              </Card>
            ))}
          </div>

          <div className="space-y-2">
            <p className="text-sm font-medium text-center">Custom amount</p>
            <div className="flex items-center justify-center gap-3">
              <span className={cn("text-sm font-medium", isPercentMode && "text-muted-foreground")}>%</span>
              <Switch
                checked={!isPercentMode}
                onCheckedChange={(checked) => setIsPercentMode(!checked)}
                data-testid="switch-tip-mode"
              />
              <span className={cn("text-sm font-medium", !isPercentMode && "text-muted-foreground")}>$</span>
              <div className="relative w-[140px]">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                  {isPercentMode ? "%" : "$"}
                </span>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={customAmount}
                  onChange={(e) => {
                    setCustomAmount(e.target.value);
                    setSelectedPreset(null);
                  }}
                  className="pl-7"
                  placeholder="0.00"
                  data-testid="input-tip-custom"
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-semibold">Received By</Label>
            <div className="flex items-center gap-3 p-3 rounded-md border bg-muted/30">
              <Avatar className="w-9 h-9">
                {staffMember?.avatarUrl && (
                  <AvatarImage src={staffMember.avatarUrl} alt={staffMember.name} />
                )}
                <AvatarFallback className="text-xs">{staffInitials || "?"}</AvatarFallback>
              </Avatar>
              <span className="font-medium text-sm" data-testid="text-tip-staff-name">
                {staffMember?.name || "No staff assigned"}
              </span>
            </div>
          </div>
        </div>

        <div className="flex gap-3 p-4 border-t">
          <Button
            variant="outline"
            className="flex-1"
            onClick={onCancel}
            data-testid="button-tip-cancel"
          >
            Cancel
          </Button>
          <Button
            className="flex-1"
            onClick={() => onAddTip(tipAmount)}
            data-testid="button-tip-confirm"
          >
            Add tip
          </Button>
        </div>
      </Card>
    </div>
  );
}

export default function POSInterface() {
  const [, navigate] = useLocation();
  const { selectedStore } = useSelectedStore();

  const params = new URLSearchParams(window.location.search);
  const clientIdParam = params.get("clientId");
  const staffIdParam = params.get("staffId");

  const [ticketItems, setTicketItems] = useState<TicketItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [activeItemIndex, setActiveItemIndex] = useState<number | null>(null);
  const [showTipScreen, setShowTipScreen] = useState(false);
  const [tipAmount, setTipAmount] = useState(0);
  const [checkoutComplete, setCheckoutComplete] = useState(false);
  const [receiptData, setReceiptData] = useState<ReceiptData | null>(null);
  const { printReceipt } = useReceiptPrinter();

  const { data: services, isLoading: servicesLoading } = useServices();
  const { data: categories } = useServiceCategories();
  const { data: staffList } = useStaffList();

  const activeServiceId = activeItemIndex !== null && ticketItems[activeItemIndex]
    ? ticketItems[activeItemIndex].service.id
    : null;
  const { data: availableAddons, isLoading: addonsLoading } = useAddonsForService(activeServiceId);

  const { data: client } = useQuery<Customer | null>({
    queryKey: ["/api/customers", clientIdParam],
    queryFn: async () => {
      if (!clientIdParam || !selectedStore?.id) return null;
      try {
        const res = await fetch(`/api/customers?storeId=${selectedStore.id}`, { credentials: "include" });
        if (!res.ok) return null;
        const custs: Customer[] = await res.json();
        const found = custs.find(c => String(c.id) === String(clientIdParam)) || null;
        return found;
      } catch (err) {
        console.error("Error fetching client for POS:", err);
        return null;
      }
    },
    enabled: !!clientIdParam && !!selectedStore?.id,
  });

  const defaultStaffId = staffIdParam ? Number(staffIdParam) : (staffList && staffList.length > 0 ? staffList[0].id : null);

  const primaryStaffId = ticketItems.length > 0
    ? ticketItems[0].staffId || defaultStaffId
    : defaultStaffId;

  const primaryStaff = staffList?.find((s: Staff) => s.id === primaryStaffId) || null;

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
    setTicketItems(prev => [...prev, { service, addons: [], staffId: defaultStaffId }]);
    setActiveItemIndex(newIndex);
  };

  const handleDismissAddons = () => {
    setActiveItemIndex(null);
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
  const grandTotal = ticketTotal + tipAmount;

  const handleAddTip = (amount: number) => {
    setTipAmount(amount);
    setShowTipScreen(false);
  };

  const handleCheckout = () => {
    const now = new Date();
    const data: ReceiptData = {
      store: selectedStore,
      client: client || null,
      staff: primaryStaff,
      items: ticketItems,
      subtotal: ticketTotal,
      tipAmount,
      grandTotal,
      paymentMethod: "Card",
      transactionId: Math.random().toString(36).substring(2, 10).toUpperCase(),
      dateStr: now.toLocaleDateString(),
      timeStr: now.toLocaleTimeString(),
    };
    setReceiptData(data);
    setCheckoutComplete(true);
    printReceipt(data);
  };

  const handleNewTransaction = () => {
    setTicketItems([]);
    setTipAmount(0);
    setCheckoutComplete(false);
    setReceiptData(null);
    setActiveItemIndex(null);
    setSelectedCategory(null);
  };

  if (checkoutComplete && receiptData) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-start bg-background overflow-y-auto">
        <div className="w-full max-w-md mx-auto py-8 px-4 space-y-6">
          <div className="text-center space-y-2">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-2xl font-bold" data-testid="text-checkout-success">Payment Complete</h1>
            <p className="text-muted-foreground">Transaction #{receiptData.transactionId}</p>
          </div>

          <Card className="p-0 overflow-hidden">
            <div className="flex items-center justify-center bg-muted/30 py-4">
              <ReceiptContent data={receiptData} />
            </div>
          </Card>

          <div className="flex flex-col gap-3">
            <Button
              onClick={() => printReceipt(receiptData)}
              className="w-full"
              data-testid="button-print-receipt"
            >
              <Printer className="w-4 h-4 mr-2" />
              Print Receipt
            </Button>
            <div className="grid grid-cols-2 gap-3">
              <Button
                variant="outline"
                onClick={handleNewTransaction}
                data-testid="button-new-transaction"
              >
                New Sale
              </Button>
              <Button
                variant="outline"
                onClick={() => navigate("/dashboard")}
                data-testid="button-back-dashboard"
              >
                Dashboard
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen flex bg-background">
      {showTipScreen && (
        <TipScreen
          amountDue={ticketTotal}
          staffMember={primaryStaff}
          onAddTip={handleAddTip}
          onCancel={() => setShowTipScreen(false)}
        />
      )}

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
                  onClick={handleDismissAddons}
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
          ) : (
            <>
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
        <div 
          className="p-4 border-b flex items-center gap-3 cursor-pointer hover:bg-muted/50 transition-colors" 
          onClick={() => navigate("/client-lookup")}
          data-testid="pos-client-selector"
        >
          <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center overflow-hidden">
            <User className="w-4 h-4 text-muted-foreground" />
          </div>
          <div className="flex-1">
            <span className="text-sm font-semibold uppercase" data-testid="pos-client-name">
              {client ? client.name : "GUEST"}
            </span>
          </div>
          <User className="w-4 h-4 text-muted-foreground" />
        </div>

        {primaryStaff && (
          <div className="px-4 py-2 border-b flex items-center gap-2">
            <Avatar className="w-6 h-6">
              {primaryStaff.avatarUrl && <AvatarImage src={primaryStaff.avatarUrl} alt={primaryStaff.name} />}
              <AvatarFallback className="text-[10px]">
                {primaryStaff.name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)}
              </AvatarFallback>
            </Avatar>
            <span className="text-xs text-muted-foreground">with</span>
            <span className="text-xs font-medium" data-testid="pos-staff-name">{primaryStaff.name}</span>
          </div>
        )}

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
          {tipAmount > 0 && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Tip</span>
              <span className="font-medium" data-testid="pos-tip-amount">${tipAmount.toFixed(2)}</span>
            </div>
          )}
          <div className="flex items-center justify-between">
            <div>
              <span className="font-semibold">Total</span>
              {ticketDuration > 0 && <p className="text-xs text-muted-foreground">{ticketDuration} min</p>}
            </div>
            <span className="font-bold text-lg" data-testid="pos-ticket-total">${grandTotal.toFixed(2)}</span>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              className="flex-shrink-0"
              disabled={ticketItems.length === 0}
              onClick={() => setShowTipScreen(true)}
              data-testid="button-pos-tip"
            >
              <Heart className="w-4 h-4 mr-1" />
              Tip
            </Button>
            <Button
              className="flex-1"
              size="lg"
              disabled={ticketItems.length === 0}
              onClick={handleCheckout}
              data-testid="button-pos-checkout"
            >
              Checkout - ${grandTotal.toFixed(2)}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
