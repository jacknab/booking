import { useState, useEffect, useCallback, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Scissors, Sparkles, Flower2, Lamp, ArrowRight, ArrowLeft, Loader2, Check, Plus, Minus, Users, ChevronLeft, ChevronRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";

const businessTypes = [
  {
    id: "Hair Salon",
    label: "Hair Salon",
    description: "Haircuts, color & styling",
    videoUrl: "/videos/hair_salon.mp4",
    fallbackGradient: "from-rose-400 via-pink-500 to-fuchsia-600",
  },
  {
    id: "Nail Salon",
    label: "Nail Salon",
    description: "Manicures, pedicures & nail art",
    videoUrl: "/videos/nail_salon.mp4",
    fallbackGradient: "from-violet-400 via-purple-500 to-indigo-600",
  },
  {
    id: "Spa",
    label: "Spa",
    description: "Massage, facials & body treatments",
    videoUrl: "/videos/spa.mp4",
    fallbackGradient: "from-emerald-400 via-teal-500 to-cyan-600",
  },
  {
    id: "Barbershop",
    label: "Barbershop",
    description: "Cuts, fades & beard trims",
    videoUrl: "/videos/barbershop.mp4",
    fallbackGradient: "from-amber-400 via-orange-500 to-red-500",
  },
  {
    id: "Esthetician",
    label: "Esthetician",
    description: "Skin care, facials & waxing",
    videoUrl: "/videos/esthetician.mp4",
    fallbackGradient: "from-sky-400 via-blue-500 to-indigo-500",
  },
  {
    id: "Pet Groomer",
    label: "Pet Groomer",
    description: "Grooming, baths & trims",
    videoUrl: "/videos/pet_groomer.mp4",
    fallbackGradient: "from-lime-400 via-green-500 to-teal-600",
  },
  {
    id: "Tattoo Studio",
    label: "Tattoo Studio",
    description: "Tattoos, piercings & body art",
    videoUrl: "/videos/tattoo_studio.mp4",
    fallbackGradient: "from-slate-600 via-gray-700 to-zinc-800",
  },
  {
    id: "Other",
    label: "Other",
    description: "Any appointment-based business",
    videoUrl: "/videos/other_business.mp4",
    fallbackGradient: "from-pink-400 via-rose-500 to-orange-500",
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

const usStates = [
  { value: "AL", label: "Alabama" },
  { value: "AK", label: "Alaska" },
  { value: "AZ", label: "Arizona" },
  { value: "AR", label: "Arkansas" },
  { value: "CA", label: "California" },
  { value: "CO", label: "Colorado" },
  { value: "CT", label: "Connecticut" },
  { value: "DE", label: "Delaware" },
  { value: "FL", label: "Florida" },
  { value: "GA", label: "Georgia" },
  { value: "HI", label: "Hawaii" },
  { value: "ID", label: "Idaho" },
  { value: "IL", label: "Illinois" },
  { value: "IN", label: "Indiana" },
  { value: "IA", label: "Iowa" },
  { value: "KS", label: "Kansas" },
  { value: "KY", label: "Kentucky" },
  { value: "LA", label: "Louisiana" },
  { value: "ME", label: "Maine" },
  { value: "MD", label: "Maryland" },
  { value: "MA", label: "Massachusetts" },
  { value: "MI", label: "Michigan" },
  { value: "MN", label: "Minnesota" },
  { value: "MS", label: "Mississippi" },
  { value: "MO", label: "Missouri" },
  { value: "MT", label: "Montana" },
  { value: "NE", label: "Nebraska" },
  { value: "NV", label: "Nevada" },
  { value: "NH", label: "New Hampshire" },
  { value: "NJ", label: "New Jersey" },
  { value: "NM", label: "New Mexico" },
  { value: "NY", label: "New York" },
  { value: "NC", label: "North Carolina" },
  { value: "ND", label: "North Dakota" },
  { value: "OH", label: "Ohio" },
  { value: "OK", label: "Oklahoma" },
  { value: "OR", label: "Oregon" },
  { value: "PA", label: "Pennsylvania" },
  { value: "RI", label: "Rhode Island" },
  { value: "SC", label: "South Carolina" },
  { value: "SD", label: "South Dakota" },
  { value: "TN", label: "Tennessee" },
  { value: "TX", label: "Texas" },
  { value: "UT", label: "Utah" },
  { value: "VT", label: "Vermont" },
  { value: "VA", label: "Virginia" },
  { value: "WA", label: "Washington" },
  { value: "WV", label: "West Virginia" },
  { value: "WI", label: "Wisconsin" },
  { value: "WY", label: "Wyoming" },
];

export default function Onboarding() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user, isLoading } = useAuth();

  // ── All hooks must be declared before any conditional return ──
  const totalSteps = 4;
  const [step, setStep] = useState(1);
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [businessName, setBusinessName] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [addressError, setAddressError] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [postcode, setPostcode] = useState("");
  const [phone, setPhone] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [postcodeError, setPostcodeError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [timezone, setTimezone] = useState(() => detectTimezone());
  const [hours, setHours] = useState(defaultHours);
  const [staffCount, setStaffCount] = useState(1);
  const [staffNames, setStaffNames] = useState<string[]>(["Owner"]);

  // Initialize email from user account
  useEffect(() => {
    if (user?.email && !email) {
      setEmail(user.email);
    }
  }, [user?.email]);

  // Validation functions
  const validateEmail = (value: string): boolean => {
    if (!value.trim()) return true; // Optional field
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(value);
  };

  const validatePhone = (value: string): boolean => {
    if (!value.trim()) return true; // Optional field
    return /^\d{10}$/.test(value);
  };

  const validatePostcode = (value: string): boolean => {
    if (!value.trim()) return true; // Optional field
    return /^\d{5}$/.test(value);
  };

  const validateAddress = (value: string): boolean => {
    if (!value.trim()) return true; // Optional field
    if (/[;'"`]/.test(value)) return false;
    if (/--|\/\*/.test(value)) return false;
    return /^[a-zA-Z0-9\s.,#\-\/]*$/.test(value);
  };

  const handleEmailChange = (value: string) => {
    setEmail(value);
    if (value.trim() && !validateEmail(value)) {
      setEmailError("Please enter a valid email address");
    } else {
      setEmailError("");
    }
  };

  const handlePhoneChange = (value: string) => {
    const digitsOnly = value.replace(/\D/g, "");
    setPhone(digitsOnly);
    if (digitsOnly.trim() && !validatePhone(digitsOnly)) {
      setPhoneError("Please enter a valid phone number");
    } else {
      setPhoneError("");
    }
  };

  const handlePostcodeChange = (value: string) => {
    const digitsOnly = value.replace(/\D/g, "");
    setPostcode(digitsOnly);
    if (digitsOnly.trim() && !validatePostcode(digitsOnly)) {
      setPostcodeError("Zip code must be 5 digits");
    } else {
      setPostcodeError("");
    }
  };

  const handleAddressChange = (value: string) => {
    setAddress(value);
    if (value.trim() && !validateAddress(value)) {
      setAddressError("Address contains invalid characters");
    } else {
      setAddressError("");
    }
  };

  // Redirect side-effects in useEffect (never call navigate during render)
  useEffect(() => {
    if (!isLoading && !user) {
      navigate("/auth");
    } else if (!isLoading && user?.onboardingCompleted) {
      navigate("/calendar");
    }
  }, [user, isLoading, navigate]);

  // useMutation must be declared before any conditional return
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

  // ── Guard: nothing to render until we know the user state ──
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user || user.onboardingCompleted) {
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
      email: email.trim() || undefined,
      timezone,
      address: address.trim() || undefined,
      city: city.trim() || undefined,
      state: state.trim() || undefined,
      postcode: postcode.trim() || undefined,
      phone: phone.trim() || undefined,
      businessHours: hours,
      staff: validStaff,
    });
  };

  const canProceed = (s: number) => {
    if (s === 1) return !!selectedType;
    if (s === 2) {
      const hasName = businessName.trim().length > 0;
      const validEmail = !email.trim() || validateEmail(email);
      const validPhone = !phone.trim() || validatePhone(phone);
      const validPostcode = !postcode.trim() || validatePostcode(postcode);
      const validAddress = !address.trim() || validateAddress(address);
      return (
        hasName &&
        validEmail &&
        validPhone &&
        validPostcode &&
        validAddress &&
        !emailError &&
        !phoneError &&
        !postcodeError &&
        !addressError
      );
    }
    if (s === 3) return true;
    if (s === 4) return staffNames.some(n => n.trim().length > 0);
    return false;
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#050C18] text-white p-4" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      <div className={`w-full transition-all duration-300 ${step === 1 ? "max-w-2xl" : "max-w-xl"}`}>
        <div className="flex items-center justify-center gap-2.5 mb-8">
          <img src="/web-app.png" alt="Certxa" className="w-10 h-10 rounded-lg shadow" onError={e => { (e.target as HTMLImageElement).style.display = "none"; }} />
          <span className="font-extrabold text-2xl tracking-tight text-white">Certxa</span>
        </div>

        <div className="flex items-center justify-center gap-2 mb-10">
          {Array.from({ length: totalSteps }).map((_, i) => (
            <div key={i} className="flex items-center gap-2">
              <div
                className={`flex items-center justify-center w-8 h-8 rounded-full text-xs font-bold transition-all ${step > i + 1 ? "bg-[#00D4AA] text-[#050C18]" : step === i + 1 ? "bg-[#00D4AA] text-[#050C18]" : "bg-white/10 text-white/40"}`}
                data-testid={`step-indicator-${i + 1}`}
              >
                {step > i + 1 ? <Check className="w-3.5 h-3.5" /> : i + 1}
              </div>
              {i < totalSteps - 1 && (
                <div className={`h-0.5 w-10 rounded-full transition-all ${step > i + 1 ? "bg-[#00D4AA]" : "bg-white/10"}`} />
              )}
            </div>
          ))}
        </div>

        {step === 1 && (
          <Step1BusinessType
            selectedType={selectedType}
            setSelectedType={setSelectedType}
            onNext={() => setStep(2)}
            canProceed={canProceed(1)}
          />
        )}

        {step === 2 && (
          <div>
            <h2 className="text-2xl font-extrabold text-center mb-1 text-white" data-testid="text-step2-title">Tell us about your business</h2>
            <p className="text-sm text-white/45 text-center mb-6">This info helps set up your store profile</p>

            <div className="bg-[#0D1F35] border border-white/10 rounded-2xl p-6 space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="businessName" className="text-white/60 text-xs font-semibold uppercase tracking-wider">Business name *</Label>
                  <Input
                    id="businessName"
                    data-testid="input-business-name"
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    placeholder="e.g. Bella's Hair Studio"
                    autoFocus
                    className="bg-white/6 border-white/15 text-gray-900 placeholder:text-gray-400 focus:border-[#00D4AA]/50 h-11 rounded-xl"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="email" className="text-white/60 text-xs font-semibold uppercase tracking-wider">Business Email</Label>
                  <Input
                    id="email"
                    type="email"
                    data-testid="input-email"
                    value={email}
                    onChange={(e) => handleEmailChange(e.target.value)}
                    placeholder="e.g. info@bellashair.com"
                    className={`bg-white/6 border-white/15 text-gray-900 placeholder:text-gray-400 focus:border-[#00D4AA]/50 h-11 rounded-xl ${emailError ? "border-red-500/50" : ""}`}
                  />
                  {emailError && <p className="text-xs text-red-400 mt-1">{emailError}</p>}
                  <p className="text-xs text-white/30">Used for booking confirmations and customer contact</p>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="address" className="text-white/60 text-xs font-semibold uppercase tracking-wider">Address</Label>
                  <Input
                    id="address"
                    data-testid="input-address"
                    value={address}
                    onChange={(e) => handleAddressChange(e.target.value)}
                    placeholder="e.g. 123 Main St"
                    className={`bg-white/6 border-white/15 text-gray-900 placeholder:text-gray-400 focus:border-[#00D4AA]/50 h-11 rounded-xl ${addressError ? "border-red-500/50" : ""}`}
                  />
                  {addressError && <p className="text-xs text-red-400 mt-1">{addressError}</p>}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="city" className="text-white/60 text-xs font-semibold uppercase tracking-wider">City</Label>
                    <Input
                      id="city"
                      data-testid="input-city"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="New York"
                      className="bg-white/6 border-white/15 text-gray-900 placeholder:text-gray-400 focus:border-[#00D4AA]/50 h-11 rounded-xl"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="state" className="text-white/60 text-xs font-semibold uppercase tracking-wider">State</Label>
                    <Select value={state} onValueChange={setState}>
                      <SelectTrigger data-testid="select-state" className="bg-white/6 border-white/15 text-white h-11 rounded-xl">
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent className="bg-[#0D1F35] border-white/15 text-white">
                        {usStates.map((usState) => (
                          <SelectItem key={usState.value} value={usState.value} className="text-white focus:bg-white/10 focus:text-white">
                            {usState.value}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="postcode" className="text-white/60 text-xs font-semibold uppercase tracking-wider">Zip</Label>
                    <Input
                      id="postcode"
                      data-testid="input-postcode"
                      value={postcode}
                      onChange={(e) => handlePostcodeChange(e.target.value)}
                      placeholder="10001"
                      inputMode="numeric"
                      maxLength={5}
                      className={`bg-white/6 border-white/15 text-gray-900 placeholder:text-gray-400 focus:border-[#00D4AA]/50 h-11 rounded-xl ${postcodeError ? "border-red-500/50" : ""}`}
                    />
                    {postcodeError && <p className="text-xs text-red-400 mt-1">{postcodeError}</p>}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="phone" className="text-white/60 text-xs font-semibold uppercase tracking-wider">Phone</Label>
                  <Input
                    id="phone"
                    type="tel"
                    data-testid="input-phone"
                    value={phone}
                    onChange={(e) => handlePhoneChange(e.target.value)}
                    placeholder="(555) 123-4567"
                    inputMode="numeric"
                    maxLength={10}
                    className={`bg-white/6 border-white/15 text-gray-900 placeholder:text-gray-400 focus:border-[#00D4AA]/50 h-11 rounded-xl ${phoneError ? "border-red-500/50" : ""}`}
                  />
                  {phoneError && <p className="text-xs text-red-400 mt-1">{phoneError}</p>}
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="timezone" className="text-white/60 text-xs font-semibold uppercase tracking-wider">Timezone</Label>
                  <Select value={timezone} onValueChange={setTimezone}>
                    <SelectTrigger data-testid="select-timezone" className="bg-white/6 border-white/15 text-white h-11 rounded-xl">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-[#0D1F35] border-white/15 text-white">
                      {timezones.map((tz) => (
                        <SelectItem key={tz.value} value={tz.value} data-testid={`option-tz-${tz.value}`} className="text-white focus:bg-white/10 focus:text-white">
                          {tz.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-white/30">Auto-detected from your browser</p>
                </div>
            </div>

            <div className="mt-6 flex items-center justify-between gap-3">
              <button onClick={() => setStep(1)} data-testid="button-back-step"
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-white/15 text-white/70 hover:bg-white/8 text-sm font-semibold transition-all">
                <ArrowLeft className="w-4 h-4" /> Back
              </button>
              <button onClick={() => setStep(3)} disabled={!canProceed(2)} data-testid="button-next-step"
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#00D4AA] text-[#050C18] font-bold text-sm transition-all disabled:opacity-40">
                Next <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div>
            <h2 className="text-2xl font-extrabold text-center mb-1 text-white" data-testid="text-step3-title">Set your business hours</h2>
            <p className="text-sm text-white/45 text-center mb-6">These will be your default staff hours too</p>

            <div className="bg-[#0D1F35] border border-white/10 rounded-2xl p-4 space-y-1">
              {hours.map((day, i) => (
                <div key={i} className="flex items-center gap-3 py-2.5 border-b border-white/6 last:border-0" data-testid={`row-day-${i}`}>
                  <div className="w-24 flex-shrink-0">
                    <span className="text-sm font-semibold text-white/80">{dayNames[i]}</span>
                  </div>
                  <Switch
                    checked={!day.isClosed}
                    onCheckedChange={(checked) => updateHour(i, "isClosed", !checked)}
                    data-testid={`switch-day-${i}`}
                  />
                  {day.isClosed ? (
                    <span className="text-sm text-white/30">Closed</span>
                  ) : (
                    <div className="flex items-center gap-2 flex-wrap">
                      <Select value={day.openTime} onValueChange={(v) => updateHour(i, "openTime", v)}>
                        <SelectTrigger className="w-[110px] bg-white/6 border-white/15 text-white h-9 rounded-lg text-xs" data-testid={`select-open-${i}`}>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-[#0D1F35] border-white/15 text-white">
                          {timeOptions.map(t => (
                            <SelectItem key={t.value} value={t.value} className="text-white focus:bg-white/10 focus:text-white text-xs">{t.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <span className="text-xs text-white/30">to</span>
                      <Select value={day.closeTime} onValueChange={(v) => updateHour(i, "closeTime", v)}>
                        <SelectTrigger className="w-[110px] bg-white/6 border-white/15 text-white h-9 rounded-lg text-xs" data-testid={`select-close-${i}`}>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-[#0D1F35] border-white/15 text-white">
                          {timeOptions.map(t => (
                            <SelectItem key={t.value} value={t.value} className="text-white focus:bg-white/10 focus:text-white text-xs">{t.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="mt-6 flex items-center justify-between gap-3">
              <button onClick={() => setStep(2)} data-testid="button-back-step"
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-white/15 text-white/70 hover:bg-white/8 text-sm font-semibold transition-all">
                <ArrowLeft className="w-4 h-4" /> Back
              </button>
              <button onClick={() => setStep(4)} disabled={!canProceed(3)} data-testid="button-next-step"
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#00D4AA] text-[#050C18] font-bold text-sm transition-all disabled:opacity-40">
                Next <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {step === 4 && (
          <div>
            <h2 className="text-2xl font-extrabold text-center mb-1 text-white" data-testid="text-step4-title">Add your team</h2>
            <p className="text-sm text-white/45 text-center mb-6">Each member will get your services and hours by default</p>

            <div className="bg-[#0D1F35] border border-white/10 rounded-2xl p-6">
              <div className="flex items-center justify-center gap-5 mb-6">
                <button
                  onClick={() => updateStaffCount(staffCount - 1)}
                  disabled={staffCount <= 1}
                  data-testid="button-staff-minus"
                  className="w-10 h-10 rounded-xl border border-white/15 flex items-center justify-center text-white/70 hover:bg-white/8 disabled:opacity-30 transition-all"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-white/40" />
                  <span className="text-4xl font-black text-white tabular-nums" data-testid="text-staff-count">{staffCount}</span>
                </div>
                <button
                  onClick={() => updateStaffCount(staffCount + 1)}
                  disabled={staffCount >= 20}
                  data-testid="button-staff-plus"
                  className="w-10 h-10 rounded-xl border border-white/15 flex items-center justify-center text-white/70 hover:bg-white/8 disabled:opacity-30 transition-all"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-3">
                {staffNames.map((name, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div
                      className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0 shadow"
                      style={{ backgroundColor: staffColors[i % staffColors.length] }}
                    >
                      {(name.trim() || `S${i + 1}`).charAt(0).toUpperCase()}
                    </div>
                    <Input
                      value={name}
                      onChange={(e) => updateStaffName(i, e.target.value)}
                      placeholder={i === 0 ? "Your name / Owner" : `Staff member ${i + 1}`}
                      data-testid={`input-staff-name-${i}`}
                      autoFocus={i === staffNames.length - 1 && staffNames.length > 1}
                      className="bg-white/6 border-white/15 text-gray-900 placeholder:text-gray-400 focus:border-[#00D4AA]/50 h-11 rounded-xl"
                    />
                  </div>
                ))}
              </div>

              <div className="bg-white/4 border border-white/8 rounded-xl px-4 py-3 mt-4">
                <p className="text-xs text-white/40">
                  Setting up as a <span className="font-semibold text-white/70">{selectedType}</span> — you can customize services, hours, and staff further in your dashboard.
                </p>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-between gap-3">
              <button onClick={() => setStep(3)} data-testid="button-back-step"
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-white/15 text-white/70 hover:bg-white/8 text-sm font-semibold transition-all">
                <ArrowLeft className="w-4 h-4" /> Back
              </button>
              <button
                onClick={handleComplete}
                disabled={!canProceed(4) || onboardMutation.isPending}
                data-testid="button-complete-setup"
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#00D4AA] text-[#050C18] font-bold text-sm transition-all disabled:opacity-40"
              >
                {onboardMutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                {onboardMutation.isPending ? "Setting up…" : "Complete Setup"}
                {!onboardMutation.isPending && <ArrowRight className="w-4 h-4" />}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function BusinessTypeCard({
  type,
  isSelected,
  onSelect,
}: {
  type: { id: string; label: string; description: string; videoUrl: string; fallbackGradient: string };
  isSelected: boolean;
  onSelect: () => void;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);

  const playVideo = () => {
    if (videoRef.current) {
      videoRef.current.play().catch(() => {});
    }
  };

  const pauseVideo = () => {
    if (!isSelected && videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
  };

  useEffect(() => {
    if (isSelected) {
      playVideo();
    } else {
      if (videoRef.current) {
        videoRef.current.pause();
        videoRef.current.currentTime = 0;
      }
    }
  }, [isSelected]);

  return (
    <div
      className="flex flex-col flex-shrink-0 w-44 cursor-pointer snap-start"
      onClick={onSelect}
      onMouseEnter={playVideo}
      onMouseLeave={pauseVideo}
      data-testid={`card-business-type-${type.id.toLowerCase().replace(/\s+/g, "-")}`}
    >
      <div
        className={`relative h-64 w-full rounded-2xl overflow-hidden transition-all duration-200 bg-gradient-to-br ${type.fallbackGradient} ${
          isSelected
            ? "ring-2 ring-[#00D4AA] ring-offset-2 ring-offset-[#050C18] shadow-xl shadow-[#00D4AA]/20 scale-[1.03]"
            : "hover:scale-[1.01] hover:shadow-lg opacity-80 hover:opacity-100"
        }`}
      >
        <video
          ref={videoRef}
          src={type.videoUrl}
          loop
          muted
          playsInline
          preload="metadata"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/10" />
        {isSelected && (
          <div className="absolute top-3 right-3 z-10 w-6 h-6 rounded-full bg-[#00D4AA] flex items-center justify-center shadow">
            <Check className="w-3.5 h-3.5 text-[#050C18]" />
          </div>
        )}
      </div>
      <div className="mt-2.5 px-0.5">
        <p className={`font-bold text-sm leading-tight ${isSelected ? "text-[#00D4AA]" : "text-white"}`}>{type.label}</p>
        <p className="text-xs text-white/40 mt-0.5 leading-snug">{type.description}</p>
      </div>
    </div>
  );
}

function Step1BusinessType({
  selectedType,
  setSelectedType,
  onNext,
  canProceed,
}: {
  selectedType: string | null;
  setSelectedType: (id: string) => void;
  onNext: () => void;
  canProceed: boolean;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const updateScrollState = () => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 8);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 8);
  };

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    updateScrollState();
    el.addEventListener("scroll", updateScrollState, { passive: true });
    return () => el.removeEventListener("scroll", updateScrollState);
  }, []);

  const scroll = (dir: "left" | "right") => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollBy({ left: dir === "left" ? -200 : 200, behavior: "smooth" });
  };

  return (
    <div>
      <h2 className="text-2xl font-extrabold mb-1 text-white" data-testid="text-step1-title">What type of business do you run?</h2>
      <p className="text-sm text-white/45 mb-6">Pick the one that matches how you operate — you can switch later.</p>

      <div className="relative">
        {canScrollLeft && (
          <button
            onClick={() => scroll("left")}
            className="absolute left-0 top-1/2 -translate-y-8 -translate-x-2 z-10 w-9 h-9 rounded-full bg-[#0D1F35] border border-white/15 shadow-md flex items-center justify-center hover:bg-white/10 transition-colors"
            aria-label="Scroll left"
          >
            <ChevronLeft className="w-5 h-5 text-white" />
          </button>
        )}

        <div
          ref={scrollRef}
          className="flex gap-3 overflow-x-auto pb-3 -mx-1 px-1 snap-x snap-mandatory scrollbar-none"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {businessTypes.map((type) => (
            <BusinessTypeCard
              key={type.id}
              type={type}
              isSelected={selectedType === type.id}
              onSelect={() => setSelectedType(type.id)}
            />
          ))}
        </div>

        {canScrollRight && (
          <button
            onClick={() => scroll("right")}
            className="absolute right-0 top-1/2 -translate-y-8 translate-x-2 z-10 w-9 h-9 rounded-full bg-[#0D1F35] border border-white/15 shadow-md flex items-center justify-center hover:bg-white/10 transition-colors"
            aria-label="Scroll right"
          >
            <ChevronRight className="w-5 h-5 text-white" />
          </button>
        )}
      </div>

      <div className="mt-6 flex justify-end">
        <button onClick={onNext} disabled={!canProceed} data-testid="button-next-step"
          className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#00D4AA] text-[#050C18] font-bold text-sm transition-all disabled:opacity-40">
          Next <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
