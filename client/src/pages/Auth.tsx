import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import MarketingLayout from "@/components/layout/MarketingLayout";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Loader2, ArrowRight, Calendar, Users, Wrench,
  Check, CalendarDays, CreditCard, Star, Gift,
  BarChart2, ClipboardList, MessageSquare, ShieldCheck,
  Smartphone, Globe, Clock, Zap,
} from "lucide-react";
import { FaGoogle } from "react-icons/fa";
import { useToast } from "@/hooks/use-toast";

const GROUP_CONFIG = {
  booking: {
    label: "Certxa Booking",
    tagline: "Fill your calendar. Automate the rest.",
    icon: <Calendar className="w-5 h-5" />,
  },
  queue: {
    label: "Certxa Queue",
    tagline: "No appointments. No chaos.",
    icon: <Users className="w-5 h-5" />,
  },
  pro: {
    label: "Certxa Pro",
    tagline: "Run the office. Empower the crew.",
    icon: <Wrench className="w-5 h-5" />,
  },
} as const;

type GroupKey = keyof typeof GROUP_CONFIG;

const PURPLE = "#5B21B6";
const ORANGE = "#F5A623";

const TRIAL_FEATURES = [
  { icon: <CalendarDays className="w-4 h-4" />, text: "Appointments & calendar management" },
  { icon: <Globe className="w-4 h-4" />, text: "Online booking widget for your website" },
  { icon: <CreditCard className="w-4 h-4" />, text: "Point of Sale (POS) & payments" },
  { icon: <Users className="w-4 h-4" />, text: "Staff management & scheduling" },
  { icon: <MessageSquare className="w-4 h-4" />, text: "Automated SMS & email reminders" },
  { icon: <Star className="w-4 h-4" />, text: "Loyalty program & rewards" },
  { icon: <Gift className="w-4 h-4" />, text: "Gift cards" },
  { icon: <Clock className="w-4 h-4" />, text: "Waitlist & virtual queue" },
  { icon: <Smartphone className="w-4 h-4" />, text: "Google Reviews manager" },
  { icon: <BarChart2 className="w-4 h-4" />, text: "Analytics & revenue reports" },
  { icon: <ClipboardList className="w-4 h-4" />, text: "Client intake forms" },
  { icon: <Zap className="w-4 h-4" />, text: "Unlimited clients & bookings" },
];

export default function Auth() {
  const navigate = useNavigate();
  const { isAuthenticated, user, login, register, isLoggingIn, isRegistering, isLoading, hasStoredSession, loginWithGoogle } = useAuth();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();

  const [mode, setMode] = useState<"login" | "register">(
    searchParams.get("mode") === "register" ? "register" : "login"
  );
  const rawGroup = searchParams.get("group") ?? "";
  const group: GroupKey | null = rawGroup in GROUP_CONFIG ? (rawGroup as GroupKey) : null;
  const cfg = group ? GROUP_CONFIG[group] : null;

  const redirectTo = searchParams.get("redirect") ?? null;

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [keepSignedIn, setKeepSignedIn] = useState(false);

  useEffect(() => {
    const link = document.createElement("link");
    link.href = "https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap";
    link.rel = "stylesheet";
    document.head.appendChild(link);
    return () => { document.head.removeChild(link); };
  }, []);

  const postAuthRedirect = (onboardingCompleted: boolean) => {
    if (redirectTo) return navigate(redirectTo, { replace: true });
    if (!onboardingCompleted) {
      if (group === "pro") return navigate("/pro-setup");
      return navigate("/onboarding");
    }
    if (group === "pro") return navigate("/pro-dashboard");
    return navigate("/calendar");
  };

  useEffect(() => {
    if (isAuthenticated) {
      if (redirectTo) { navigate(redirectTo, { replace: true }); return; }
      if (user && !user.onboardingCompleted) {
        if (group === "pro") navigate("/pro-setup");
        else navigate("/onboarding");
      } else {
        if (group === "pro") navigate("/pro-dashboard");
        else navigate("/calendar");
      }
    }
  }, [isAuthenticated, user, navigate, group, redirectTo]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      let result: any;
      if (mode === "login") {
        result = await login({ email, password, keepSignedIn });
      } else {
        result = await register({ email, password, firstName: firstName || undefined, lastName: lastName || undefined, keepSignedIn });
      }
      postAuthRedirect(!!(result && result.onboardingCompleted));
    } catch (error: any) {
      const message = error?.message || (mode === "login" ? "Login failed" : "Registration failed");
      let description = message;
      try {
        const parsed = JSON.parse(message.replace(/^\d+:\s*/, ""));
        description = parsed.message || message;
      } catch {
        if (message.includes(":")) description = message.split(":").slice(1).join(":").trim();
      }
      toast({ title: mode === "login" ? "Login failed" : "Registration failed", description, variant: "destructive" });
    }
  };

  const isPending = isLoggingIn || isRegistering;

  if (isLoading && hasStoredSession) {
    return (
      <MarketingLayout hideNavActions>
        <div className="flex-1 bg-white flex items-center justify-center py-24">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" style={{ color: PURPLE }} />
            <p className="text-gray-400 text-sm">Welcome back! Restoring your session…</p>
          </div>
        </div>
      </MarketingLayout>
    );
  }

  return (
    <MarketingLayout hideNavActions>
    <div className="flex-1 bg-white flex font-['Plus_Jakarta_Sans',sans-serif]">

      {/* ── Left panel ── */}
      <div className="hidden lg:flex flex-col flex-1 relative overflow-hidden"
        style={{ background: mode === "register" ? "#0F0A1E" : "#F7F5FF" }}>

        {mode === "register" ? (
          <TrialLeftPanel cfg={cfg} />
        ) : (
          <LoginLeftPanel cfg={cfg} />
        )}
      </div>

      {/* Divider */}
      <div className="hidden lg:block w-px" style={{ background: mode === "register" ? "rgba(255,255,255,0.07)" : "#f3f4f6" }} />

      {/* ── Right panel — form ── */}
      <div className="flex flex-col w-full lg:w-[500px] lg:flex-shrink-0 bg-white">
        <div className="flex-1 flex flex-col justify-center px-8 sm:px-12 py-10">
          {/* Header */}
          <div className="mb-8">
            {cfg && mode === "register" && (
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border mb-5"
                style={{ background: "rgba(91,33,182,0.07)", borderColor: "rgba(91,33,182,0.18)", color: PURPLE }}>
                {cfg.icon}
                Starting with {cfg.label}
              </div>
            )}
            <h1 className="text-3xl font-black tracking-tight mb-2 text-gray-900">
              {mode === "login" ? "Welcome back" : "Start your free trial"}
            </h1>
            {mode === "register" ? (
              <div className="flex items-center gap-2 mt-3">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold"
                  style={{ background: "rgba(245,166,35,0.12)", color: "#B45309" }}>
                  <ShieldCheck className="w-3.5 h-3.5" />
                  60 days free
                </span>
                <span className="text-gray-400 text-xs">No credit card required</span>
              </div>
            ) : (
              <p className="text-gray-400 text-sm mt-1">Sign in to continue to your dashboard.</p>
            )}
          </div>

          {/* Google */}
          <button
            onClick={() => loginWithGoogle({ keepSignedIn })}
            className="w-full flex items-center justify-center gap-3 font-semibold text-sm py-3.5 rounded-xl transition-all mb-5 text-gray-700 border border-gray-200 bg-white hover:bg-gray-50"
          >
            <FaGoogle className="w-4 h-4 text-gray-500" />
            {mode === "login" ? "Sign in with Google" : "Sign up with Google"}
          </button>

          {/* Divider */}
          <div className="relative mb-5">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-gray-200" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-white px-3 text-gray-400 uppercase tracking-widest">or</span>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === "register" && (
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="firstName" className="text-gray-500 text-xs font-semibold uppercase tracking-wider">First name</Label>
                  <Input
                    id="firstName"
                    data-testid="input-first-name"
                    value={firstName}
                    onChange={e => setFirstName(e.target.value)}
                    placeholder="Jane"
                    className="h-12 rounded-xl border-gray-200 bg-gray-50 text-gray-900 placeholder:text-gray-300 focus:border-purple-400 focus:ring-purple-100"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="lastName" className="text-gray-500 text-xs font-semibold uppercase tracking-wider">Last name</Label>
                  <Input
                    id="lastName"
                    data-testid="input-last-name"
                    value={lastName}
                    onChange={e => setLastName(e.target.value)}
                    placeholder="Doe"
                    className="h-12 rounded-xl border-gray-200 bg-gray-50 text-gray-900 placeholder:text-gray-300 focus:border-purple-400 focus:ring-purple-100"
                  />
                </div>
              </div>
            )}

            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-gray-500 text-xs font-semibold uppercase tracking-wider">Email</Label>
              <Input
                id="email"
                type="email"
                data-testid="input-email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@yourbusiness.com"
                required
                className="h-12 rounded-xl border-gray-200 bg-gray-50 text-gray-900 placeholder:text-gray-300 focus:border-purple-400 focus:ring-purple-100"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-gray-500 text-xs font-semibold uppercase tracking-wider">Password</Label>
                {mode === "login" && (
                  <Link to="/forgot-password" className="text-xs font-medium transition-colors" style={{ color: PURPLE }}>
                    Forgot password?
                  </Link>
                )}
              </div>
              <Input
                id="password"
                type="password"
                data-testid="input-password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="At least 6 characters"
                required
                minLength={6}
                className="h-12 rounded-xl border-gray-200 bg-gray-50 text-gray-900 placeholder:text-gray-300 focus:border-purple-400 focus:ring-purple-100"
              />
            </div>

            {/* Keep signed in */}
            <label className="flex items-start gap-3 cursor-pointer select-none pt-1">
              <input
                type="checkbox"
                checked={keepSignedIn}
                onChange={e => setKeepSignedIn(e.target.checked)}
                data-testid="checkbox-keep-signed-in"
                className="mt-0.5 h-4 w-4 rounded cursor-pointer"
                style={{ accentColor: PURPLE }}
              />
              <span className="flex-1">
                <span className="block text-sm font-semibold text-gray-700">Keep me signed in on this device</span>
                <span className="block text-xs text-gray-400 mt-0.5">Use for the front-desk computer — staff won't have to log in.</span>
              </span>
            </label>

            {/* CTA */}
            <button
              type="submit"
              disabled={isPending}
              className="w-full flex items-center justify-center gap-2 py-4 rounded-xl font-bold text-base transition-all disabled:opacity-50 mt-2 text-white"
              style={{
                background: mode === "register"
                  ? `linear-gradient(135deg, ${PURPLE} 0%, #4C1D95 100%)`
                  : `linear-gradient(135deg, ${ORANGE} 0%, #E8950F 100%)`,
                boxShadow: mode === "register"
                  ? "0 4px 20px rgba(91,33,182,0.35)"
                  : "0 4px 16px rgba(245,166,35,0.35)",
              }}
              data-testid="button-submit-auth"
            >
              {isPending && <Loader2 className="w-4 h-4 animate-spin" />}
              {mode === "login" ? "Sign in" : "Start my 60-day free trial"}
              {!isPending && <ArrowRight className="w-4 h-4" />}
            </button>

            {mode === "register" && (
              <p className="text-center text-xs text-gray-400 -mt-1">
                Full access to everything. Cancel any time.
              </p>
            )}
          </form>

          {/* Switch mode */}
          <p className="text-center text-gray-400 text-sm mt-6">
            {mode === "login" ? (
              <>
                Don't have an account?{" "}
                <button type="button" onClick={() => setMode("register")}
                  className="font-semibold transition-colors" style={{ color: PURPLE }}
                  data-testid="link-switch-to-register">
                  Start free trial
                </button>
              </>
            ) : (
              <>
                Already have an account?{" "}
                <button type="button" onClick={() => setMode("login")}
                  className="font-semibold transition-colors" style={{ color: PURPLE }}
                  data-testid="link-switch-to-login">
                  Log in
                </button>
              </>
            )}
          </p>

          {/* Footer */}
          <div className="flex items-center justify-center gap-5 mt-8 pt-6 border-t border-gray-100">
            <a href="https://certxa.com/privacy" target="_blank" rel="noopener noreferrer" className="text-gray-300 hover:text-gray-500 text-xs transition-colors">Privacy</a>
            <a href="https://certxa.com/terms" target="_blank" rel="noopener noreferrer" className="text-gray-300 hover:text-gray-500 text-xs transition-colors">Terms</a>
            <Link to="/staff-auth" className="text-gray-300 hover:text-gray-500 text-xs transition-colors">Staff login</Link>
          </div>
        </div>
      </div>
    </div>
    </MarketingLayout>
  );
}

/* ─── Trial left panel (register mode) ─── */
function TrialLeftPanel({ cfg }: { cfg: { label: string; tagline: string; icon: React.ReactNode } | null }) {
  return (
    <div className="relative z-10 flex flex-col h-full p-14 overflow-y-auto">
      {/* Decorative glows */}
      <div className="absolute top-0 left-0 w-[600px] h-[600px] rounded-full pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(91,33,182,0.25) 0%, transparent 65%)", transform: "translate(-30%, -30%)" }} />
      <div className="absolute bottom-0 right-0 w-[400px] h-[400px] rounded-full pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(245,166,35,0.15) 0%, transparent 65%)", transform: "translate(30%, 30%)" }} />

      {/* Logo */}
      <div className="mb-10 relative">
        <CertxaWordmark light />
      </div>

      {/* Trial hero */}
      <div className="relative mb-8">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold mb-6"
          style={{ background: "rgba(245,166,35,0.15)", color: "#FCD34D", border: "1px solid rgba(245,166,35,0.25)" }}>
          <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: "#F5A623" }} />
          Limited offer — 60 days free
        </div>
        <h2 className="text-5xl font-black leading-[1.08] tracking-tight mb-5 text-white">
          Everything<br />
          <span style={{ color: "#F5A623" }}>Certxa</span> offers.<br />
          Free for 60 days.
        </h2>
        <p className="text-white/50 text-base leading-relaxed max-w-sm">
          No credit card required. No feature limits. No tricks. Just the full platform from day one.
        </p>
      </div>

      {/* Feature list */}
      <div className="relative mb-8">
        <p className="text-white/35 text-xs font-bold uppercase tracking-widest mb-4">What's included in your trial</p>
        <div className="grid grid-cols-2 gap-x-4 gap-y-3">
          {TRIAL_FEATURES.map(({ icon, text }) => (
            <div key={text} className="flex items-start gap-2.5">
              <div className="flex-shrink-0 w-6 h-6 rounded-md flex items-center justify-center mt-0.5"
                style={{ background: "rgba(91,33,182,0.35)", color: "#a78bfa" }}>
                {icon}
              </div>
              <span className="text-white/70 text-[13px] leading-snug">{text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Trust bar */}
      <div className="relative flex items-center gap-8 py-5 border-t" style={{ borderColor: "rgba(255,255,255,0.08)" }}>
        {[
          { num: "50K+", label: "businesses" },
          { num: "2M+", label: "bookings/mo" },
          { num: "4.9★", label: "avg rating" },
        ].map(({ num, label }) => (
          <div key={label}>
            <p className="text-xl font-black text-white">{num}</p>
            <p className="text-white/35 text-xs uppercase tracking-wider mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Testimonial */}
      <div className="relative rounded-2xl p-5 mt-4" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}>
        <div className="flex gap-0.5 mb-3">
          {[...Array(5)].map((_, i) => (
            <svg key={i} className="w-3.5 h-3.5" style={{ fill: "#F5A623" }} viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          ))}
        </div>
        <p className="text-white/60 text-sm leading-relaxed mb-4 italic">
          "Setting up took one afternoon. By the next morning we already had 6 new bookings come in overnight. I wish I'd switched sooner."
        </p>
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-bold text-white"
            style={{ background: "linear-gradient(135deg, #5B21B6, #4C1D95)" }}>JR</div>
          <div>
            <p className="text-white/80 font-semibold text-sm leading-none">Jasmine R.</p>
            <p className="text-white/35 text-xs mt-0.5">Owner, Luxe Hair Studio</p>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Login left panel ─── */
function LoginLeftPanel({ cfg }: { cfg: { label: string; tagline: string; icon: React.ReactNode } | null }) {
  return (
    <>
      {/* Subtle decorative blobs */}
      <div className="absolute top-[-100px] left-[-100px] w-[500px] h-[500px] rounded-full pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(91,33,182,0.10) 0%, transparent 70%)" }} />
      <div className="absolute bottom-[-80px] right-[-80px] w-[380px] h-[380px] rounded-full pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(245,166,35,0.12) 0%, transparent 70%)" }} />

      <div className="relative z-10 flex flex-col h-full p-14">
        <div className="mb-auto">
          <CertxaWordmark />
        </div>

        <div className="mb-10">
          {cfg && (
            <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-full border mb-6 text-sm font-bold"
              style={{ background: "rgba(91,33,182,0.07)", borderColor: "rgba(91,33,182,0.18)", color: PURPLE }}>
              {cfg.icon}
              {cfg.label}
            </div>
          )}
          <h2 className="text-5xl font-black leading-[1.1] tracking-tight mb-5 text-gray-900">
            The platform<br />
            <span style={{ color: ORANGE }}>built for</span><br />
            service pros.
          </h2>
          <p className="text-gray-500 text-lg leading-relaxed max-w-sm">
            Bookings, front desk, POS, loyalty rewards, check-in, waitlist — all in one place.
          </p>
        </div>

        <div className="flex items-center gap-10 mb-10">
          {[
            { num: "50K+", label: "businesses" },
            { num: "2M+", label: "bookings/mo" },
            { num: "4.9★", label: "avg rating" },
          ].map(({ num, label }) => (
            <div key={label}>
              <p className="text-2xl font-black" style={{ color: PURPLE }}>{num}</p>
              <p className="text-gray-400 text-xs uppercase tracking-wider mt-0.5">{label}</p>
            </div>
          ))}
        </div>

        <div className="rounded-2xl p-6 bg-white shadow-sm border border-gray-100">
          <div className="flex gap-0.5 mb-3">
            {[...Array(5)].map((_, i) => (
              <svg key={i} className="w-3.5 h-3.5" style={{ fill: ORANGE }} viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            ))}
          </div>
          <p className="text-gray-600 text-sm leading-relaxed mb-4 italic">
            "Setting up took one afternoon. By the next morning we already had 6 new bookings come in overnight."
          </p>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-bold text-white"
              style={{ background: `linear-gradient(135deg, ${PURPLE}, #4C1D95)` }}>JR</div>
            <div>
              <p className="text-gray-800 font-semibold text-sm leading-none">Jasmine R.</p>
              <p className="text-gray-400 text-xs mt-0.5">Owner, Luxe Hair Studio</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

function CertxaWordmark({ dark, light }: { dark?: boolean; light?: boolean }) {
  const color = light ? "#FFFFFF" : (dark ? "#1a0a3b" : "#1a0a3b");
  return (
    <span
      className="font-black text-[22px]"
      style={{ letterSpacing: "-0.04em", fontFamily: "'Plus Jakarta Sans', sans-serif", color }}
    >
      Certxa<span style={{ color: "#F5A623" }}>.</span>
    </span>
  );
}
