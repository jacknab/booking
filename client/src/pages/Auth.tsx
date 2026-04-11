import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, ArrowRight, ArrowLeft, Calendar, Users, Wrench } from "lucide-react";
import { FaGoogle } from "react-icons/fa";
import { useToast } from "@/hooks/use-toast";

const GROUP_CONFIG = {
  booking: {
    accent: "#00D4AA",
    label: "Certxa Booking",
    tagline: "Fill your calendar. Automate the rest.",
    video: "/videos/salon_booking.mp4",
    icon: <Calendar className="w-5 h-5" />,
  },
  queue: {
    accent: "#F59E0B",
    label: "Certxa Queue",
    tagline: "No appointments. No chaos.",
    video: "/videos/barbershop_queue.mp4",
    icon: <Users className="w-5 h-5" />,
  },
  pro: {
    accent: "#3B82F6",
    label: "Certxa Pro",
    tagline: "Run the office. Empower the crew.",
    video: "/videos/handyman_pro.mp4",
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
  const accent = cfg?.accent ?? "#00D4AA";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");

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
        result = await login({ email, password });
      } else {
        result = await register({ email, password, firstName: firstName || undefined, lastName: lastName || undefined });
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
      <div className="min-h-screen bg-[#050C18] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" style={{ color: accent }} />
          <p className="text-white/60 text-sm">Welcome back! Restoring your session…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050C18] text-white flex font-['Plus_Jakarta_Sans',sans-serif]">

      {/* ── Left panel — branded video ── */}
      <div className="hidden lg:flex flex-col flex-1 relative overflow-hidden">
        {/* Video background */}
        {cfg ? (
          <video
            key={cfg.video}
            src={cfg.video}
            autoPlay muted loop playsInline
            className="absolute inset-0 w-full h-full object-cover"
          />
        ) : (
          <video
            src="/videos/salon_booking.mp4"
            autoPlay muted loop playsInline
            className="absolute inset-0 w-full h-full object-cover"
          />
        )}
        {/* Dark overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#050C18]/85 via-[#050C18]/60 to-[#050C18]/40" />

        {/* Content over video */}
        <div className="relative z-10 flex flex-col h-full p-12">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 mb-auto">
            <img src="/web-app.png" alt="Certxa" className="w-9 h-9 rounded-lg shadow" onError={e => { (e.target as HTMLImageElement).style.display = "none"; }} />
            <span className="font-extrabold text-xl tracking-tight">Certxa</span>
          </Link>

          {/* Group badge + pitch */}
          <div className="mb-12">
            {cfg && (
              <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-full border mb-6"
                style={{ background: cfg.accent + "18", borderColor: cfg.accent + "35", color: cfg.accent }}>
                {cfg.icon}
                <span className="font-bold text-sm">{cfg.label}</span>
              </div>
            )}
            <h2 className="text-4xl font-black leading-tight mb-3">
              {cfg ? cfg.tagline : "The platform built for service pros."}
            </h2>
            <p className="text-white/55 text-lg leading-relaxed">
              {cfg
                ? `Join thousands of businesses already using ${cfg.label} to run smarter.`
                : "Join 10,000+ service businesses using Certxa to run smarter every day."}
            </p>
          </div>

          {/* Testimonial */}
          <div className="bg-white/8 backdrop-blur-sm border border-white/12 rounded-2xl p-6">
            <div className="flex gap-0.5 mb-3">
              {[...Array(5)].map((_, i) => (
                <svg key={i} className="w-4 h-4 fill-current" style={{ color: accent }} viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
            </div>
            <p className="text-white/75 text-sm leading-relaxed mb-4">
              "Setting up took one afternoon. By the next morning we already had 6 new bookings come in overnight. The automation alone is worth every penny."
            </p>
            <div>
              <p className="text-white font-semibold text-sm">Jasmine R.</p>
              <p className="text-white/40 text-xs">Owner, Luxe Hair Studio</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Right panel — form ── */}
      <div className="flex flex-col w-full lg:w-[480px] lg:flex-shrink-0 relative">
        {/* Mobile logo */}
        <div className="lg:hidden flex items-center justify-between px-6 pt-6 pb-2">
          <Link to="/" className="flex items-center gap-2">
            <img src="/web-app.png" alt="Certxa" className="w-7 h-7 rounded-md" onError={e => { (e.target as HTMLImageElement).style.display = "none"; }} />
            <span className="font-extrabold text-base">Certxa</span>
          </Link>
          {mode === "register" && (
            <Link to="/get-started" className="flex items-center gap-1.5 text-white/40 hover:text-white/70 text-xs transition-colors">
              <ArrowLeft className="w-3.5 h-3.5" /> Choose product
            </Link>
          )}
        </div>

        <div className="flex-1 flex flex-col justify-center px-8 sm:px-12 py-12">
          {/* Back link on desktop */}
          {mode === "register" && (
            <Link to="/get-started" className="hidden lg:flex items-center gap-1.5 text-white/35 hover:text-white/60 text-xs transition-colors mb-10 w-fit">
              <ArrowLeft className="w-3.5 h-3.5" /> Change product
            </Link>
          )}

          {/* Header */}
          <div className="mb-8">
            {cfg && mode === "register" && (
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border mb-5"
                style={{ background: cfg.accent + "14", borderColor: cfg.accent + "30", color: cfg.accent }}>
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
            onClick={loginWithGoogle}
            className="w-full flex items-center justify-center gap-3 bg-white/8 hover:bg-white/12 border border-white/15 text-white font-semibold text-sm py-3.5 rounded-xl transition-all mb-5"
          >
            <FaGoogle className="w-4 h-4" />
            {mode === "login" ? "Sign in with Google" : "Sign up with Google"}
          </button>

          {/* Divider */}
          <div className="relative mb-5">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-white/10" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-[#050C18] px-3 text-white/30 uppercase tracking-widest">or</span>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === "register" && (
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="firstName" className="text-white/60 text-xs font-semibold uppercase tracking-wider">First name</Label>
                  <Input
                    id="firstName"
                    data-testid="input-first-name"
                    value={firstName}
                    onChange={e => setFirstName(e.target.value)}
                    placeholder="Jane"
                    className="bg-white/6 border-white/15 text-white placeholder:text-white/25 focus:border-white/40 h-12 rounded-xl"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="lastName" className="text-white/60 text-xs font-semibold uppercase tracking-wider">Last name</Label>
                  <Input
                    id="lastName"
                    data-testid="input-last-name"
                    value={lastName}
                    onChange={e => setLastName(e.target.value)}
                    placeholder="Doe"
                    className="bg-white/6 border-white/15 text-white placeholder:text-white/25 focus:border-white/40 h-12 rounded-xl"
                  />
                </div>
              </div>
            )}

            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-white/60 text-xs font-semibold uppercase tracking-wider">Email</Label>
              <Input
                id="email"
                type="email"
                data-testid="input-email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@yourbusiness.com"
                required
                className="bg-white/6 border-white/15 text-white placeholder:text-white/25 focus:border-white/40 h-12 rounded-xl"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-white/60 text-xs font-semibold uppercase tracking-wider">Password</Label>
                {mode === "login" && (
                  <Link to="/forgot-password" className="text-xs transition-colors" style={{ color: accent }}>
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
                className="bg-white/6 border-white/15 text-white placeholder:text-white/25 focus:border-white/40 h-12 rounded-xl"
                style={{ colorScheme: "dark" }}
              />
            </div>

            <button
              type="submit"
              disabled={isPending}
              className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold text-base transition-all hover:opacity-90 disabled:opacity-50 mt-2"
              style={{ background: accent, color: "#050C18" }}
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

          {/* Footer links */}
          <div className="flex items-center justify-center gap-5 mt-8 pt-8 border-t border-white/8">
            <Link to="/privacy-policy" className="text-white/25 hover:text-white/50 text-xs transition-colors">Privacy</Link>
            <Link to="/terms-of-service" className="text-white/25 hover:text-white/50 text-xs transition-colors">Terms</Link>
            <Link to="/staff-auth" className="text-white/25 hover:text-white/50 text-xs transition-colors">Staff login</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
