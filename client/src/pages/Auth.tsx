import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, ArrowRight, Calendar, Users, Wrench } from "lucide-react";
import { FaGoogle } from "react-icons/fa";
import { useToast } from "@/hooks/use-toast";

const GROUP_CONFIG = {
  booking: {
    accent: "#F5A623",
    label: "Certxa Booking",
    tagline: "Fill your calendar. Automate the rest.",
    icon: <Calendar className="w-5 h-5" />,
  },
  queue: {
    accent: "#F5A623",
    label: "Certxa Queue",
    tagline: "No appointments. No chaos.",
    icon: <Users className="w-5 h-5" />,
  },
  pro: {
    accent: "#F5A623",
    label: "Certxa Pro",
    tagline: "Run the office. Empower the crew.",
    icon: <Wrench className="w-5 h-5" />,
  },
} as const;

type GroupKey = keyof typeof GROUP_CONFIG;

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
  const accent = "#F5A623";

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
    if (!onboardingCompleted) {
      if (group === "pro") return navigate("/pro-setup");
      return navigate("/onboarding");
    }
    if (group === "pro") return navigate("/pro-dashboard");
    return navigate("/calendar");
  };

  useEffect(() => {
    if (isAuthenticated) {
      if (user && !user.onboardingCompleted) {
        if (group === "pro") navigate("/pro-setup");
        else navigate("/onboarding");
      } else {
        if (group === "pro") navigate("/pro-dashboard");
        else navigate("/calendar");
      }
    }
  }, [isAuthenticated, user, navigate, group]);

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
      <div className="min-h-screen flex items-center justify-center" style={{ background: "linear-gradient(135deg, #0D0523 0%, #1A0A3B 50%, #0D0523 100%)" }}>
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" style={{ color: accent }} />
          <p className="text-white/60 text-sm">Welcome back! Restoring your session…</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen text-white flex font-['Plus_Jakarta_Sans',sans-serif]"
      style={{ background: "linear-gradient(135deg, #0D0523 0%, #1A0A3B 60%, #0D0523 100%)" }}
    >
      {/* ── Left panel — brand ── */}
      <div className="hidden lg:flex flex-col flex-1 relative overflow-hidden">
        {/* Decorative purple orbs */}
        <div className="absolute top-[-80px] left-[-80px] w-[420px] h-[420px] rounded-full pointer-events-none"
          style={{ background: "radial-gradient(circle, rgba(109,40,217,0.35) 0%, transparent 70%)" }} />
        <div className="absolute bottom-[-60px] right-[-60px] w-[320px] h-[320px] rounded-full pointer-events-none"
          style={{ background: "radial-gradient(circle, rgba(245,166,35,0.18) 0%, transparent 70%)" }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full pointer-events-none"
          style={{ background: "radial-gradient(circle, rgba(109,40,217,0.12) 0%, transparent 70%)" }} />

        {/* Subtle grid */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.04]"
          style={{ backgroundImage: "linear-gradient(rgba(255,255,255,.3) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.3) 1px, transparent 1px)", backgroundSize: "40px 40px" }} />

        <div className="relative z-10 flex flex-col h-full p-14">
          {/* Logo */}
          <div className="mb-auto">
            <CertxaWordmark />
          </div>

          {/* Main pitch */}
          <div className="mb-10">
            {cfg && (
              <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-full border mb-6"
                style={{ background: "rgba(245,166,35,0.12)", borderColor: "rgba(245,166,35,0.3)", color: accent }}>
                {cfg.icon}
                <span className="font-bold text-sm">{cfg.label}</span>
              </div>
            )}
            <h2 className="text-5xl font-black leading-[1.1] tracking-tight mb-5">
              The platform<br />
              <span style={{ color: accent }}>built for</span><br />
              service pros.
            </h2>
            <p className="text-white/55 text-lg leading-relaxed max-w-sm">
              Bookings, front desk, POS, loyalty rewards, check-in, waitlist — all in one.
            </p>
          </div>

          {/* Stats row */}
          <div className="flex items-center gap-8 mb-10">
            {[
              { num: "50K+", label: "businesses" },
              { num: "2M+", label: "bookings/mo" },
              { num: "4.9★", label: "avg rating" },
            ].map(({ num, label }) => (
              <div key={label}>
                <p className="text-2xl font-black" style={{ color: accent }}>{num}</p>
                <p className="text-white/40 text-xs uppercase tracking-wider mt-0.5">{label}</p>
              </div>
            ))}
          </div>

          {/* Testimonial */}
          <div className="rounded-2xl p-6"
            style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", backdropFilter: "blur(10px)" }}>
            <div className="flex gap-0.5 mb-3">
              {[...Array(5)].map((_, i) => (
                <svg key={i} className="w-3.5 h-3.5" style={{ fill: accent }} viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
            </div>
            <p className="text-white/75 text-sm leading-relaxed mb-4 italic">
              "Setting up took one afternoon. By the next morning we already had 6 new bookings come in overnight."
            </p>
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-bold text-white"
                style={{ background: "linear-gradient(135deg, #6D28D9, #4C1D95)" }}>JR</div>
              <div>
                <p className="text-white font-semibold text-sm leading-none">Jasmine R.</p>
                <p className="text-white/40 text-xs mt-0.5">Owner, Luxe Hair Studio</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right panel separator */}
      <div className="hidden lg:block w-px" style={{ background: "linear-gradient(to bottom, transparent, rgba(255,255,255,0.08) 20%, rgba(255,255,255,0.08) 80%, transparent)" }} />

      {/* ── Right panel — form ── */}
      <div className="flex flex-col w-full lg:w-[500px] lg:flex-shrink-0 relative">
        {/* Mobile logo */}
        <div className="lg:hidden flex items-center justify-center px-6 pt-8 pb-2">
          <CertxaWordmark />
        </div>

        <div className="flex-1 flex flex-col justify-center px-8 sm:px-12 py-10">
          {/* Header */}
          <div className="mb-8">
            {cfg && mode === "register" && (
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border mb-5"
                style={{ background: "rgba(245,166,35,0.12)", borderColor: "rgba(245,166,35,0.25)", color: accent }}>
                {cfg.icon}
                Starting with {cfg.label}
              </div>
            )}
            <h1 className="text-3xl font-black tracking-tight mb-2">
              {mode === "login" ? "Welcome back" : "Create your account"}
            </h1>
            <p className="text-white/45 text-sm">
              {mode === "login"
                ? "Sign in to continue to your dashboard."
                : "Free 60-day trial — no credit card required."}
            </p>
          </div>

          {/* Google */}
          <button
            onClick={() => loginWithGoogle({ keepSignedIn })}
            className="w-full flex items-center justify-center gap-3 font-semibold text-sm py-3.5 rounded-xl transition-all mb-5"
            style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.13)", color: "white" }}
            onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,0.11)")}
            onMouseLeave={e => (e.currentTarget.style.background = "rgba(255,255,255,0.07)")}
          >
            <FaGoogle className="w-4 h-4" />
            {mode === "login" ? "Sign in with Google" : "Sign up with Google"}
          </button>

          {/* Divider */}
          <div className="relative mb-5">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" style={{ borderColor: "rgba(255,255,255,0.1)" }} />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="px-3 text-white/30 uppercase tracking-widest"
                style={{ background: "transparent" }}>or</span>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === "register" && (
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="firstName" className="text-white/50 text-xs font-semibold uppercase tracking-wider">First name</Label>
                  <Input
                    id="firstName"
                    data-testid="input-first-name"
                    value={firstName}
                    onChange={e => setFirstName(e.target.value)}
                    placeholder="Jane"
                    className="h-12 rounded-xl text-white placeholder:text-white/25"
                    style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)" }}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="lastName" className="text-white/50 text-xs font-semibold uppercase tracking-wider">Last name</Label>
                  <Input
                    id="lastName"
                    data-testid="input-last-name"
                    value={lastName}
                    onChange={e => setLastName(e.target.value)}
                    placeholder="Doe"
                    className="h-12 rounded-xl text-white placeholder:text-white/25"
                    style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)" }}
                  />
                </div>
              </div>
            )}

            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-white/50 text-xs font-semibold uppercase tracking-wider">Email</Label>
              <Input
                id="email"
                type="email"
                data-testid="input-email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@yourbusiness.com"
                required
                className="h-12 rounded-xl text-white placeholder:text-white/25"
                style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)" }}
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-white/50 text-xs font-semibold uppercase tracking-wider">Password</Label>
                {mode === "login" && (
                  <Link to="/forgot-password" className="text-xs font-medium transition-colors" style={{ color: accent }}>
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
                className="h-12 rounded-xl text-white placeholder:text-white/25"
                style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)" }}
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
                style={{ accentColor: accent }}
              />
              <span className="flex-1">
                <span className="block text-sm font-semibold text-white/80">
                  Keep me signed in on this device
                </span>
                <span className="block text-xs text-white/40 mt-0.5">
                  Use for the front-desk computer — staff won't have to log in.
                </span>
              </span>
            </label>

            {/* CTA */}
            <button
              type="submit"
              disabled={isPending}
              className="w-full flex items-center justify-center gap-2 py-4 rounded-xl font-bold text-base transition-all disabled:opacity-50 mt-2"
              style={{ background: `linear-gradient(135deg, ${accent} 0%, #E8950F 100%)`, color: "#0D0523", boxShadow: `0 0 24px rgba(245,166,35,0.35), 0 4px 12px rgba(0,0,0,0.3)` }}
              data-testid="button-submit-auth"
            >
              {isPending && <Loader2 className="w-4 h-4 animate-spin" />}
              {mode === "login" ? "Sign in" : "Create account"}
              {!isPending && <ArrowRight className="w-4 h-4" />}
            </button>
          </form>

          {/* Switch mode */}
          <p className="text-center text-white/40 text-sm mt-6">
            {mode === "login" ? (
              <>
                Don't have an account?{" "}
                <button type="button" onClick={() => setMode("register")}
                  className="font-semibold transition-colors" style={{ color: accent }}
                  data-testid="link-switch-to-register">
                  Sign up free
                </button>
              </>
            ) : (
              <>
                Already have an account?{" "}
                <button type="button" onClick={() => setMode("login")}
                  className="font-semibold transition-colors" style={{ color: accent }}
                  data-testid="link-switch-to-login">
                  Log in
                </button>
              </>
            )}
          </p>

          {/* Footer */}
          <div className="flex items-center justify-center gap-5 mt-8 pt-6" style={{ borderTop: "1px solid rgba(255,255,255,0.07)" }}>
            <a href="https://certxa.com/privacy" target="_blank" rel="noopener noreferrer" className="text-white/25 hover:text-white/50 text-xs transition-colors">Privacy</a>
            <a href="https://certxa.com/terms" target="_blank" rel="noopener noreferrer" className="text-white/25 hover:text-white/50 text-xs transition-colors">Terms</a>
            <Link to="/staff-auth" className="text-white/25 hover:text-white/50 text-xs transition-colors">Staff login</Link>
          </div>
        </div>
      </div>
    </div>
  );
}

function CertxaWordmark() {
  return (
    <span
      className="font-black text-[22px] text-white"
      style={{ letterSpacing: "-0.04em", fontFamily: "'Plus Jakarta Sans', sans-serif" }}
    >
      Certxa<span style={{ color: "#F5A623" }}>.</span>
    </span>
  );
}
