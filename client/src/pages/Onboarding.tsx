import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Scissors, Sparkles, Flower2, Lamp, ArrowRight, ArrowLeft, Loader2, Check } from "lucide-react";
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

export default function Onboarding() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user, isLoading } = useAuth();
  const [step, setStep] = useState<1 | 2>(1);
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [businessName, setBusinessName] = useState("");
  const [timezone, setTimezone] = useState("America/New_York");

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

  const onboardMutation = useMutation({
    mutationFn: async (data: { businessType: string; businessName: string; timezone: string }) => {
      const res = await apiRequest("POST", "/api/onboarding", data);
      return res.json();
    },
    onSuccess: (data) => {
      queryClient.setQueryData(["/api/auth/user"], data.user);
      queryClient.invalidateQueries({ queryKey: ["/api/stores"] });
      toast({ title: "You're all set!", description: "Your business has been created with services ready to go." });
      navigate("/dashboard");
    },
    onError: (error: any) => {
      toast({ title: "Setup failed", description: error.message || "Something went wrong", variant: "destructive" });
    },
  });

  const handleComplete = () => {
    if (!selectedType || !businessName.trim()) return;
    onboardMutation.mutate({
      businessType: selectedType,
      businessName: businessName.trim(),
      timezone,
    });
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
          <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium ${step >= 1 ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`} data-testid="step-indicator-1">
            {step > 1 ? <Check className="w-4 h-4" /> : "1"}
          </div>
          <div className={`h-0.5 w-12 ${step > 1 ? "bg-primary" : "bg-muted"}`} />
          <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium ${step >= 2 ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`} data-testid="step-indicator-2">
            2
          </div>
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
                        <p className="font-medium text-sm" data-testid={`text-type-label-${type.id.toLowerCase().replace(/\s+/g, "-")}`}>{type.label}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{type.description}</p>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            <div className="mt-6 flex justify-end">
              <Button
                onClick={() => setStep(2)}
                disabled={!selectedType}
                data-testid="button-next-step"
              >
                Next
                <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div>
            <h2 className="text-xl font-semibold text-center mb-1" data-testid="text-step2-title">Name your business</h2>
            <p className="text-sm text-muted-foreground text-center mb-6">You can always change this later in settings</p>

            <Card>
              <CardContent className="p-6 space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="businessName">Business name</Label>
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
                </div>

                <div className="rounded-md bg-muted p-3">
                  <p className="text-xs text-muted-foreground">
                    Setting up as a <span className="font-medium text-foreground">{selectedType}</span> — we'll create all the standard categories, services, and add-ons for you.
                  </p>
                </div>
              </CardContent>
            </Card>

            <div className="mt-6 flex items-center justify-between gap-3">
              <Button
                variant="outline"
                onClick={() => setStep(1)}
                data-testid="button-back-step"
              >
                <ArrowLeft className="mr-2 w-4 h-4" />
                Back
              </Button>
              <Button
                onClick={handleComplete}
                disabled={!businessName.trim() || onboardMutation.isPending}
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
