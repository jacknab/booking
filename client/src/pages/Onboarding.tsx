import { useState, useEffect, useCallback } from "react";
import { useLocation } from "wouter";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Scissors, Sparkles, Flower2, Lamp, ArrowRight, ArrowLeft, Loader2, Check, Plus, Minus, Users } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";

const businessTypes = [
  {
    id: "Hair Salon",
    label: "Hair Salon",
    description: "Haircuts, color, styling and treatments",
    icon: Scissors,
  },
  {
    id: "Nail Salon",
    label: "Nail Salon",
    description: "Manicures, pedicures, acrylics and nail art",
    icon: Sparkles,
  },
  {
    id: "Spa",
    label: "Spa",
    description: "Massage, facials, body treatments and waxing",
    icon: Flower2,
  },
  {
    id: "Barbershop",
    label: "Barbershop",
    description: "Men's cuts, fades, beard trims and shaves",
    icon: Lamp,
  },
];

const timezones = [
  { value: "America/New_York", label: "Eastern (ET)" },
  { value: "America/Chicago", label: "Central (CT)" },
  { value: "America/Denver", label: "Mountain (MT)" },
  { value: "America/Los_Angeles", label: "Pacific (PT)" },
  { value: "America/Anchorage", label: "Alaska (AKT)" },
  { value: "Pacific/Honolulu", label: "Hawaii (HT)" },
  { value: "America/Phoenix", label: "Arizona (MST)" },
  { value: "America/Toronto", label: "Eastern Canada" },
  { value: "America/Vancouver", label: "Pacific Canada" },
  { value: "Europe/London", label: "London (GMT/BST)" },
  { value: "Europe/Paris", label: "Central Europe (CET)" },
  { value: "Australia/Sydney", label: "Sydney (AEST)" },
];

const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

const defaultHours = dayNames.map((_, i) => ({
  dayOfWeek: i,
  openTime: "09:00",
  closeTime: "17:00",
  isClosed: i === 0,
}));

const staffColors = ["#f472b6", "#a78bfa", "#60a5fa", "#34d399", "#fbbf24", "#f87171", "#818cf8", "#fb923c", "#2dd4bf", "#e879f9"];

function detectTimezone(): string {
  try {
    const detected = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const match = timezones.find(tz => tz.value === detected);
    if (match) return match.value;
    if (detected.includes("America/")) {
      if (detected.includes("New_York") || detected.includes("Detroit") || detected.includes("Indiana")) return "America/New_York";
      if (detected.includes("Chicago") || detected.includes("Menominee")) return "America/Chicago";
      if (detected.includes("Denver") || detected.includes("Boise")) return "America/Denver";
      if (detected.includes("Los_Angeles")) return "America/Los_Angeles";
      if (detected.includes("Anchorage")) return "America/Anchorage";
      if (detected.includes("Toronto") || detected.includes("Montreal")) return "America/Toronto";
      if (detected.includes("Vancouver")) return "America/Vancouver";
      if (detected.includes("Phoenix")) return "America/Phoenix";
    }
    if (detected.includes("Europe/")) {
      if (detected.includes("London")) return "Europe/London";
      return "Europe/Paris";
    }
    if (detected.includes("Australia/")) return "Australia/Sydney";
    if (detected.includes("Pacific/Honolulu")) return "Pacific/Honolulu";
    return "America/New_York";
  } catch {
    return "America/New_York";
  }
}

function generateTimeOptions() {
  const options: { value: string; label: string }[] = [];
  for (let h = 0; h < 24; h++) {
    for (let m = 0; m < 60; m += 30) {
      const value = `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
      const hour12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
      const ampm = h >= 12 ? "PM" : "AM";
      const label = `${hour12}:${String(m).padStart(2, "0")} ${ampm}`;
      options.push({ value, label });
    }
  }
  return options;
}

const timeOptions = generateTimeOptions();

export default function Onboarding() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user, isLoading } = useAuth();
  const [step, setStep] = useState(1);
  const totalSteps = 4;

  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [businessName, setBusinessName] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [timezone, setTimezone] = useState(() => detectTimezone());
  const [hours, setHours] = useState(defaultHours);
  const [staffCount, setStaffCount] = useState(1);
  const [staffNames, setStaffNames] = useState<string[]>(["Owner"]);

  useEffect(() => {
    if (!isLoading && !user) {
      navigate("/auth");
    } else if (user?.onboardingCompleted) {
      navigate("/dashboard");
    }
  }, [user, isLoading, navigate]);

  if (isLoading || !user || user.onboardingCompleted) {
    return null;
  }

  const updateStaffCount = (newCount: number) => {
    if (newCount < 1) return;
    if (newCount > 20) return;
    const newNames = [...staffNames];
    if (newCount > staffNames.length) {
      for (let i = staffNames.length; i < newCount; i++) {
        newNames.push("");
      }
    } else {
      newNames.length = newCount;
    }
    setStaffCount(newCount);
    setStaffNames(newNames);
  };

  const updateStaffName = (index: number, name: string) => {
    const newNames = [...staffNames];
    newNames[index] = name;
    setStaffNames(newNames);
  };

  const updateHour = (dayIdx: number, field: "openTime" | "closeTime" | "isClosed", value: any) => {
    const newHours = [...hours];
    newHours[dayIdx] = { ...newHours[dayIdx], [field]: value };
    setHours(newHours);
  };

  const onboardMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest("POST", "/api/onboarding", data);
      return res.json();
    },
    onSuccess: (data) => {
      queryClient.setQueryData(["/api/auth/user"], data.user);
      queryClient.invalidateQueries({ queryKey: ["/api/stores"] });
      toast({ title: "You're all set!", description: "Your business is ready to use." });
      navigate("/calendar");
    },
    onError: (error: any) => {
      toast({ title: "Setup failed", description: error.message || "Something went wrong", variant: "destructive" });
    },
  });

  const handleComplete = () => {
    if (!selectedType || !businessName.trim()) return;
    const validStaff = staffNames.filter(n => n.trim()).map((name, i) => ({
      name: name.trim(),
      color: staffColors[i % staffColors.length],
    }));
    if (validStaff.length === 0) {
      toast({ title: "Add at least one staff member", variant: "destructive" });
      return;
    }
    onboardMutation.mutate({
      businessType: selectedType,
      businessName: businessName.trim(),
      timezone,
      address: address.trim() || undefined,
      phone: phone.trim() || undefined,
      businessHours: hours,
      staff: validStaff,
    });
  };

  const canProceed = (s: number) => {
    if (s === 1) return !!selectedType;
    if (s === 2) return businessName.trim().length > 0;
    if (s === 3) return true;
    if (s === 4) return staffNames.some(n => n.trim().length > 0);
    return false;
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-xl">
        <div className="flex items-center justify-center gap-2 mb-6">
          <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
            <Scissors className="w-6 h-6 text-primary-foreground" />
          </div>
          <span className="font-display font-bold text-2xl tracking-tight">Zolmi Clone</span>
        </div>

        <div className="flex items-center justify-center gap-2 mb-8">
          {Array.from({ length: totalSteps }).map((_, i) => (
            <div key={i} className="flex items-center gap-2">
              <div
                className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium ${step > i + 1 ? "bg-primary text-primary-foreground" : step === i + 1 ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}
                data-testid={`step-indicator-${i + 1}`}
              >
                {step > i + 1 ? <Check className="w-4 h-4" /> : i + 1}
              </div>
              {i < totalSteps - 1 && (
                <div className={`h-0.5 w-8 ${step > i + 1 ? "bg-primary" : "bg-muted"}`} />
              )}
            </div>
          ))}
        </div>

        {step === 1 && (
          <div>
            <h2 className="text-xl font-semibold text-center mb-1" data-testid="text-step1-title">What type of business do you run?</h2>
            <p className="text-sm text-muted-foreground text-center mb-6">We'll set up your services and categories automatically</p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {businessTypes.map((type) => {
                const Icon = type.icon;
                const isSelected = selectedType === type.id;
                return (
                  <Card
                    key={type.id}
                    className={`cursor-pointer transition-colors toggle-elevate ${isSelected ? "toggle-elevated border-primary" : ""}`}
                    onClick={() => setSelectedType(type.id)}
                    data-testid={`card-business-type-${type.id.toLowerCase().replace(/\s+/g, "-")}`}
                  >
                    <CardContent className="p-4 flex items-start gap-3">
                      <div className={`w-10 h-10 rounded-md flex items-center justify-center shrink-0 ${isSelected ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-sm">{type.label}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{type.description}</p>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            <div className="mt-6 flex justify-end">
              <Button onClick={() => setStep(2)} disabled={!canProceed(1)} data-testid="button-next-step">
                Next
                <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div>
            <h2 className="text-xl font-semibold text-center mb-1" data-testid="text-step2-title">Tell us about your business</h2>
            <p className="text-sm text-muted-foreground text-center mb-6">This info helps set up your store profile</p>

            <Card>
              <CardContent className="p-6 space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="businessName">Business name *</Label>
                  <Input
                    id="businessName"
                    data-testid="input-business-name"
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    placeholder="e.g. Bella's Hair Studio"
                    autoFocus
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="address">Address</Label>
                  <Input
                    id="address"
                    data-testid="input-address"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="e.g. 123 Main St, New York, NY"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    data-testid="input-phone"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="e.g. (555) 123-4567"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="timezone">Timezone</Label>
                  <Select value={timezone} onValueChange={setTimezone}>
                    <SelectTrigger data-testid="select-timezone">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {timezones.map((tz) => (
                        <SelectItem key={tz.value} value={tz.value} data-testid={`option-tz-${tz.value}`}>
                          {tz.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">Auto-detected from your browser</p>
                </div>
              </CardContent>
            </Card>

            <div className="mt-6 flex items-center justify-between gap-3">
              <Button variant="outline" onClick={() => setStep(1)} data-testid="button-back-step">
                <ArrowLeft className="mr-2 w-4 h-4" />
                Back
              </Button>
              <Button onClick={() => setStep(3)} disabled={!canProceed(2)} data-testid="button-next-step">
                Next
                <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div>
            <h2 className="text-xl font-semibold text-center mb-1" data-testid="text-step3-title">Set your business hours</h2>
            <p className="text-sm text-muted-foreground text-center mb-6">These will be your default staff hours too</p>

            <Card>
              <CardContent className="p-4 space-y-2">
                {hours.map((day, i) => (
                  <div key={i} className="flex items-center gap-3 py-2" data-testid={`row-day-${i}`}>
                    <div className="w-24 flex-shrink-0">
                      <span className="text-sm font-medium">{dayNames[i]}</span>
                    </div>
                    <Switch
                      checked={!day.isClosed}
                      onCheckedChange={(checked) => updateHour(i, "isClosed", !checked)}
                      data-testid={`switch-day-${i}`}
                    />
                    {day.isClosed ? (
                      <span className="text-sm text-muted-foreground">Closed</span>
                    ) : (
                      <div className="flex items-center gap-2 flex-wrap">
                        <Select value={day.openTime} onValueChange={(v) => updateHour(i, "openTime", v)}>
                          <SelectTrigger className="w-[120px]" data-testid={`select-open-${i}`}>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {timeOptions.map(t => (
                              <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <span className="text-sm text-muted-foreground">to</span>
                        <Select value={day.closeTime} onValueChange={(v) => updateHour(i, "closeTime", v)}>
                          <SelectTrigger className="w-[120px]" data-testid={`select-close-${i}`}>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {timeOptions.map(t => (
                              <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>

            <div className="mt-6 flex items-center justify-between gap-3">
              <Button variant="outline" onClick={() => setStep(2)} data-testid="button-back-step">
                <ArrowLeft className="mr-2 w-4 h-4" />
                Back
              </Button>
              <Button onClick={() => setStep(4)} disabled={!canProceed(3)} data-testid="button-next-step">
                Next
                <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </div>
          </div>
        )}

        {step === 4 && (
          <div>
            <h2 className="text-xl font-semibold text-center mb-1" data-testid="text-step4-title">How many staff members?</h2>
            <p className="text-sm text-muted-foreground text-center mb-6">Each team member will be assigned all services and your business hours</p>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-center gap-4 mb-6">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => updateStaffCount(staffCount - 1)}
                    disabled={staffCount <= 1}
                    data-testid="button-staff-minus"
                  >
                    <Minus className="w-4 h-4" />
                  </Button>
                  <div className="flex items-center gap-2">
                    <Users className="w-5 h-5 text-muted-foreground" />
                    <span className="text-3xl font-bold tabular-nums" data-testid="text-staff-count">{staffCount}</span>
                  </div>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => updateStaffCount(staffCount + 1)}
                    disabled={staffCount >= 20}
                    data-testid="button-staff-plus"
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>

                <div className="space-y-3">
                  {staffNames.map((name, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0"
                        style={{ backgroundColor: staffColors[i % staffColors.length] }}
                      >
                        {(name.trim() || `S${i + 1}`).charAt(0).toUpperCase()}
                      </div>
                      <Input
                        value={name}
                        onChange={(e) => updateStaffName(i, e.target.value)}
                        placeholder={i === 0 ? "e.g. Owner / Your name" : `Staff member ${i + 1}`}
                        data-testid={`input-staff-name-${i}`}
                        autoFocus={i === staffNames.length - 1 && staffNames.length > 1}
                      />
                    </div>
                  ))}
                </div>

                <div className="rounded-md bg-muted p-3 mt-4">
                  <p className="text-xs text-muted-foreground">
                    Setting up as a <span className="font-medium text-foreground">{selectedType}</span> — each staff member will be assigned all services and your business hours by default. You can customize everything later.
                  </p>
                </div>
              </CardContent>
            </Card>

            <div className="mt-6 flex items-center justify-between gap-3">
              <Button variant="outline" onClick={() => setStep(3)} data-testid="button-back-step">
                <ArrowLeft className="mr-2 w-4 h-4" />
                Back
              </Button>
              <Button
                onClick={handleComplete}
                disabled={!canProceed(4) || onboardMutation.isPending}
                data-testid="button-complete-setup"
              >
                {onboardMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {onboardMutation.isPending ? "Setting up..." : "Complete setup"}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
