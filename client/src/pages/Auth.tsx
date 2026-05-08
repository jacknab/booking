import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import MarketingNav from "@/components/layout/MarketingNav";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Loader2, ArrowRight, Calendar, Users, Wrench,
  CalendarDays, CreditCard, Star, Gift,
  BarChart2, ClipboardList, MessageSquare, ShieldCheck,
  Smartphone, Globe, Clock, Zap, Check,
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

const PLUM      = "#3B0764";
const PLUM_MID  = "#5B21B6";
const GOLD      = "#F59E0B";
const CHARCOAL  = "#1C1917";

const TRIAL_FEATURES = [
  { icon: CalendarDays, text: "Appointments & calendar" },
  { icon: Globe,        text: "Online booking widget" },
  { icon: CreditCard,   text: "Point of Sale & payments" },
  { icon: Users,        text: "Staff management" },
  { icon: MessageSquare,text: "SMS & email reminders" },
  { icon: Star,         text: "Loyalty program & rewards" },
  { icon: Gift,         text: "Gift cards" },
  { icon: Clock,        text: "Waitlist & virtual queue" },
  { icon: Smartphone,   text: "Google Reviews manager" },
  { icon: BarChart2,    text: "Analytics & reports" },
  { icon: ClipboardList,text: "Client intake forms" },
  { icon: Zap,          text: "Unlimited clients" },
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

  const [email, setEmail]         = useState("");
  const [password, setPassword]   = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName]   = useState("");
  const [keepSignedIn, setKeepSignedIn] = useState(false);

  // Load Cormorant Garamond to match PHP nav exactly
  useEffect(() => {
    const link = document.createElement("link");
    link.href = "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@600;700&family=Inter:wght@300;400;500;600;700;800;900&display=swap";
    link.rel = "stylesheet";
    document.head.appendChild(link);
    return () => { if (document.head.contains(link)) document.head.removeChild(link); };
  }, []);

  const postAuthRedirect = (onboardingCompleted: boolean) => {
    if (redirectTo) return navigate(redirectTo, { replace: true });
    if (!onboardingCompleted) {
      if (group === "pro") return navigate("/pro-setup");
      return navigate("/onboarding");
    }
    if (group === "pro") return navigate("/pro-dashboard");
    return navigate("/manage");
  };

  useEffect(() => {
    if (isAuthenticated) {
      if (redirectTo) { navigate(redirectTo, { replace: true }); return; }
      if (user && !user.onboardingCompleted) {
        if (group === "pro") navigate("/pro-setup");
        else navigate("/onboarding");
      } else {
        if (group === "pro") navigate("/pro-dashboard");
        else navigate("/manage");
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
      <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
        <MarketingNav hideActions />
        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", background: "#fff" }}>
          <div style={{ textAlign: "center" }}>
            <Loader2 style={{ width: 32, height: 32, color: PLUM_MID, margin: "0 auto 16px", animation: "spin 1s linear infinite" }} />
            <p style={{ color: "#9ca3af", fontSize: ".875rem" }}>Welcome back! Restoring your session…</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", fontFamily: "'Inter', sans-serif" }}>
      {/* Nav — matches PHP overview.php nav exactly */}
      <MarketingNav hideActions />

      <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>

        {/* ── Left panel ── */}
        {mode === "register" ? (
          <TrialLeftPanel cfg={cfg} />
        ) : (
          <LoginLeftPanel cfg={cfg} />
        )}

        {/* ── Right panel — form ── */}
        <div style={{
          width: "100%", maxWidth: 520, flexShrink: 0,
          display: "flex", flexDirection: "column",
          background: mode === "register" ? "#fff" : "#fff",
          overflowY: "auto",
          boxShadow: "-1px 0 0 #f3f4f6",
        }}>
          <div style={{
            flex: 1, display: "flex", flexDirection: "column",
            justifyContent: "center", padding: "48px 52px",
          }}>

            {/* Group badge */}
            {cfg && mode === "register" && (
              <div style={{
                display: "inline-flex", alignItems: "center", gap: 6,
                padding: "6px 14px", borderRadius: 50,
                background: "rgba(91,33,182,0.07)", border: "1px solid rgba(91,33,182,0.18)",
                color: PLUM_MID, fontSize: ".75rem", fontWeight: 700,
                marginBottom: 20, width: "fit-content",
              }}>
                {cfg.icon}
                Starting with {cfg.label}
              </div>
            )}

            {/* Heading */}
            <h1 style={{
              fontFamily: mode === "register" ? "'Cormorant Garamond', serif" : "'Inter', sans-serif",
              fontSize: mode === "register" ? "3.1rem" : "2rem",
              fontWeight: mode === "register" ? 700 : 800,
              letterSpacing: mode === "register" ? "-0.02em" : "-0.03em",
              color: CHARCOAL, lineHeight: 1.1,
              margin: "0 0 10px",
            }}>
              {mode === "login" ? "Welcome back" : "Start your free trial"}
            </h1>

            {/* Subtext */}
            {mode === "register" ? (
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 28 }}>
                <span style={{
                  display: "inline-flex", alignItems: "center", gap: 5,
                  padding: "4px 12px", borderRadius: 50,
                  background: "rgba(245,158,11,0.1)", color: "#92400e",
                  fontSize: ".73rem", fontWeight: 700,
                }}>
                  <ShieldCheck style={{ width: 12, height: 12 }} />
                  60 days free
                </span>
                <span style={{ color: "#9ca3af", fontSize: ".8rem" }}>No credit card required</span>
              </div>
            ) : (
              <p style={{ color: "#6b7280", fontSize: ".9rem", marginBottom: 28 }}>
                Sign in to continue to your dashboard.
              </p>
            )}

            {/* Google */}
            <button
              onClick={() => loginWithGoogle({ keepSignedIn })}
              style={{
                width: "100%", display: "flex", alignItems: "center", justifyContent: "center",
                gap: 10, padding: "13px 20px", borderRadius: 10,
                border: "1.5px solid #e5e7eb", background: "#fff",
                fontSize: ".875rem", fontWeight: 600, color: "#374151",
                cursor: "pointer", transition: "border-color .15s, background .15s",
                marginBottom: 20,
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "#f9fafb"; (e.currentTarget as HTMLElement).style.borderColor = "#d1d5db"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "#fff"; (e.currentTarget as HTMLElement).style.borderColor = "#e5e7eb"; }}
            >
              <FaGoogle style={{ color: "#ea4335", width: 16, height: 16 }} />
              {mode === "login" ? "Sign in with Google" : "Sign up with Google"}
            </button>

            {/* Divider */}
            <div style={{ position: "relative", marginBottom: 20 }}>
              <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center" }}>
                <span style={{ width: "100%", borderTop: "1px solid #f3f4f6" }} />
              </div>
              <div style={{ position: "relative", display: "flex", justifyContent: "center" }}>
                <span style={{ background: "#fff", padding: "0 12px", fontSize: ".72rem", color: "#9ca3af", letterSpacing: ".1em", textTransform: "uppercase" }}>or</span>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {mode === "register" && (
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  <div>
                    <Label htmlFor="firstName" style={{ display: "block", fontSize: ".7rem", fontWeight: 700, color: "#6b7280", textTransform: "uppercase", letterSpacing: ".08em", marginBottom: 6 }}>First name</Label>
                    <Input
                      id="firstName"
                      data-testid="input-first-name"
                      value={firstName}
                      onChange={e => setFirstName(e.target.value)}
                      placeholder="Jane"
                      style={{ height: 46, borderRadius: 9, borderColor: "#e5e7eb", background: "#fafafa", fontSize: ".875rem" }}
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastName" style={{ display: "block", fontSize: ".7rem", fontWeight: 700, color: "#6b7280", textTransform: "uppercase", letterSpacing: ".08em", marginBottom: 6 }}>Last name</Label>
                    <Input
                      id="lastName"
                      data-testid="input-last-name"
                      value={lastName}
                      onChange={e => setLastName(e.target.value)}
                      placeholder="Doe"
                      style={{ height: 46, borderRadius: 9, borderColor: "#e5e7eb", background: "#fafafa", fontSize: ".875rem" }}
                    />
                  </div>
                </div>
              )}

              <div>
                <Label htmlFor="email" style={{ display: "block", fontSize: ".7rem", fontWeight: 700, color: "#6b7280", textTransform: "uppercase", letterSpacing: ".08em", marginBottom: 6 }}>Email</Label>
                <Input
                  id="email"
                  type="email"
                  data-testid="input-email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="you@yourbusiness.com"
                  required
                  style={{ height: 46, borderRadius: 9, borderColor: "#e5e7eb", background: "#fafafa", fontSize: ".875rem" }}
                />
              </div>

              <div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
                  <Label htmlFor="password" style={{ fontSize: ".7rem", fontWeight: 700, color: "#6b7280", textTransform: "uppercase", letterSpacing: ".08em" }}>Password</Label>
                  {mode === "login" && (
                    <Link to="/forgot-password" style={{ fontSize: ".8rem", fontWeight: 600, color: PLUM_MID, textDecoration: "none" }}>
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
                  style={{ height: 46, borderRadius: 9, borderColor: "#e5e7eb", background: "#fafafa", fontSize: ".875rem" }}
                />
              </div>

              {/* Keep signed in */}
              <label style={{ display: "flex", alignItems: "flex-start", gap: 10, cursor: "pointer" }}>
                <input
                  type="checkbox"
                  checked={keepSignedIn}
                  onChange={e => setKeepSignedIn(e.target.checked)}
                  data-testid="checkbox-keep-signed-in"
                  style={{ marginTop: 2, width: 15, height: 15, accentColor: PLUM_MID, cursor: "pointer" }}
                />
                <span>
                  <span style={{ display: "block", fontSize: ".8rem", fontWeight: 600, color: "#374151" }}>Keep me signed in on this device</span>
                  <span style={{ display: "block", fontSize: ".72rem", color: "#9ca3af", marginTop: 2 }}>Use for the front-desk computer — staff won't have to log in.</span>
                </span>
              </label>

              {/* CTA */}
              <button
                type="submit"
                disabled={isPending}
                data-testid="button-submit-auth"
                style={{
                  width: "100%", display: "flex", alignItems: "center", justifyContent: "center",
                  gap: 8, padding: "15px 20px", borderRadius: 10, border: "none",
                  fontFamily: "'Inter', sans-serif",
                  fontSize: ".9rem", fontWeight: 700, color: "#fff",
                  cursor: isPending ? "not-allowed" : "pointer",
                  opacity: isPending ? 0.65 : 1,
                  background: mode === "register"
                    ? `linear-gradient(135deg, ${PLUM} 0%, ${PLUM_MID} 100%)`
                    : `linear-gradient(135deg, ${GOLD} 0%, #E8950F 100%)`,
                  boxShadow: mode === "register"
                    ? "0 4px 20px rgba(59,7,100,0.35)"
                    : "0 4px 16px rgba(245,158,11,0.35)",
                  transition: "transform .15s, box-shadow .15s, opacity .15s",
                  marginTop: 4,
                }}
                onMouseEnter={e => { if (!isPending) { (e.currentTarget as HTMLElement).style.transform = "translateY(-1px)"; (e.currentTarget as HTMLElement).style.boxShadow = mode === "register" ? "0 8px 28px rgba(59,7,100,0.45)" : "0 8px 24px rgba(245,158,11,0.45)"; } }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = "none"; (e.currentTarget as HTMLElement).style.boxShadow = mode === "register" ? "0 4px 20px rgba(59,7,100,0.35)" : "0 4px 16px rgba(245,158,11,0.35)"; }}
              >
                {isPending && <Loader2 style={{ width: 16, height: 16, animation: "spin 1s linear infinite" }} />}
                {mode === "login" ? "Sign in" : "Start my 60-day free trial"}
                {!isPending && <ArrowRight style={{ width: 16, height: 16 }} />}
              </button>

              {mode === "register" && (
                <p style={{ textAlign: "center", fontSize: ".72rem", color: "#9ca3af", margin: "-4px 0 0" }}>
                  Full access to everything. Cancel any time.
                </p>
              )}
            </form>

            {/* Switch mode */}
            <p style={{ textAlign: "center", color: "#9ca3af", fontSize: ".85rem", marginTop: 24 }}>
              {mode === "login" ? (
                <>
                  Don't have an account?{" "}
                  <button type="button" onClick={() => setMode("register")}
                    data-testid="link-switch-to-register"
                    style={{ color: PLUM_MID, fontWeight: 700, background: "none", border: "none", cursor: "pointer", fontSize: ".85rem" }}>
                    Start free trial
                  </button>
                </>
              ) : (
                <>
                  Already have an account?{" "}
                  <button type="button" onClick={() => setMode("login")}
                    data-testid="link-switch-to-login"
                    style={{ color: PLUM_MID, fontWeight: 700, background: "none", border: "none", cursor: "pointer", fontSize: ".85rem" }}>
                    Log in
                  </button>
                </>
              )}
            </p>

            {/* Footer links */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 20, marginTop: 32, paddingTop: 24, borderTop: "1px solid #f3f4f6" }}>
              <a href="https://certxa.com/privacy" target="_blank" rel="noopener noreferrer" style={{ color: "#d1d5db", fontSize: ".75rem", textDecoration: "none" }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = "#6b7280"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = "#d1d5db"; }}>
                Privacy
              </a>
              <a href="https://certxa.com/terms" target="_blank" rel="noopener noreferrer" style={{ color: "#d1d5db", fontSize: ".75rem", textDecoration: "none" }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = "#6b7280"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = "#d1d5db"; }}>
                Terms
              </a>
              <Link to="/staff-auth" style={{ color: "#d1d5db", fontSize: ".75rem", textDecoration: "none" }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = "#6b7280"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = "#d1d5db"; }}>
                Staff login
              </Link>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes orbFloat1 { 0%,100% { transform: translate(0,0) scale(1); } 50% { transform: translate(30px,-20px) scale(1.08); } }
        @keyframes orbFloat2 { 0%,100% { transform: translate(0,0) scale(1); } 50% { transform: translate(-20px,30px) scale(1.05); } }
        @keyframes fadeUp { from { opacity:0; transform:translateY(24px); } to { opacity:1; transform:none; } }
        @media (max-width: 900px) {
          .auth-left-panel { display: none !important; }
          .auth-right-panel { max-width: 100% !important; }
        }
      `}</style>
    </div>
  );
}

/* ─── Trial left panel (register mode) ─── */
function TrialLeftPanel({ cfg }: { cfg: { label: string; tagline: string; icon: React.ReactNode } | null }) {
  const PLUM      = "#3B0764";
  const PLUM_MID  = "#5B21B6";
  const GOLD      = "#F59E0B";

  return (
    <div
      className="auth-left-panel"
      style={{
        flex: 1, position: "relative", overflow: "hidden",
        background: "linear-gradient(145deg, #1a0040 0%, #2d0060 40%, #1a0a2e 100%)",
        display: "flex", flexDirection: "column",
      }}
    >
      {/* Animated orbs */}
      <div style={{
        position: "absolute", top: "-15%", left: "-10%",
        width: 600, height: 600, borderRadius: "50%",
        background: "radial-gradient(circle, rgba(91,33,182,0.35) 0%, transparent 65%)",
        animation: "orbFloat1 12s ease-in-out infinite",
        pointerEvents: "none",
      }} />
      <div style={{
        position: "absolute", bottom: "-20%", right: "-10%",
        width: 500, height: 500, borderRadius: "50%",
        background: `radial-gradient(circle, rgba(245,158,11,0.18) 0%, transparent 65%)`,
        animation: "orbFloat2 14s ease-in-out infinite",
        pointerEvents: "none",
      }} />
      <div style={{
        position: "absolute", top: "40%", right: "5%",
        width: 300, height: 300, borderRadius: "50%",
        background: `radial-gradient(circle, rgba(139,92,246,0.20) 0%, transparent 65%)`,
        animation: "orbFloat1 10s ease-in-out infinite reverse",
        pointerEvents: "none",
      }} />

      {/* Content */}
      <div style={{
        position: "relative", zIndex: 10,
        display: "flex", flexDirection: "column",
        height: "100%", padding: "52px 56px",
        animation: "fadeUp .5s ease both",
      }}>

        {/* Logo — identical to PHP nav-logo */}
        <a href="/overview.php" style={{
          fontFamily: "'Cormorant Garamond', serif",
          fontSize: "1.55rem", fontWeight: 700,
          letterSpacing: "-0.02em",
          color: "#fff", textDecoration: "none",
          marginBottom: 48, display: "block",
        }}>
          Certxa<span style={{ color: GOLD }}>.</span>
        </a>

        {/* Offer badge */}
        <div style={{
          display: "inline-flex", alignItems: "center", gap: 8,
          padding: "7px 16px", borderRadius: 50,
          background: "rgba(245,158,11,0.12)",
          border: "1px solid rgba(245,158,11,0.28)",
          marginBottom: 24, width: "fit-content",
        }}>
          <span style={{ width: 7, height: 7, borderRadius: "50%", background: GOLD, animation: "spin 2s linear infinite" }} />
          <span style={{ fontSize: ".75rem", fontWeight: 700, color: "#FCD34D", letterSpacing: ".06em", textTransform: "uppercase" }}>
            Limited offer — 60 days free
          </span>
        </div>

        {/* Headline — uses Cormorant Garamond like PHP overview hero */}
        <h2 style={{
          fontFamily: "'Cormorant Garamond', serif",
          fontSize: "clamp(2.8rem, 4vw, 3.8rem)",
          fontWeight: 700, letterSpacing: "-0.03em",
          lineHeight: 1.05, color: "#fff",
          margin: "0 0 20px",
        }}>
          Everything<br />
          <em style={{ color: GOLD, fontStyle: "italic" }}>Certxa</em> offers.<br />
          Free for 60 days.
        </h2>

        <p style={{ color: "rgba(255,255,255,0.5)", fontSize: ".95rem", lineHeight: 1.65, maxWidth: 380, margin: "0 0 36px" }}>
          No credit card required. No feature limits. No tricks.
          Just the full platform from day one.
        </p>

        {/* Feature grid */}
        <div style={{ marginBottom: 32 }}>
          <p style={{ fontSize: ".65rem", fontWeight: 700, color: "rgba(255,255,255,0.28)", textTransform: "uppercase", letterSpacing: ".14em", marginBottom: 14 }}>
            What's included in your trial
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px 24px" }}>
            {TRIAL_FEATURES.map(({ icon: Icon, text }) => (
              <div key={text} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{
                  width: 22, height: 22, borderRadius: 6, flexShrink: 0,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  background: "rgba(139,92,246,0.3)",
                }}>
                  <Check style={{ width: 12, height: 12, color: "#c4b5fd" }} />
                </div>
                <span style={{ fontSize: ".8rem", color: "rgba(255,255,255,0.65)", lineHeight: 1.35 }}>{text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Stats */}
        <div style={{
          display: "flex", gap: 32,
          paddingTop: 24, paddingBottom: 24,
          borderTop: "1px solid rgba(255,255,255,0.08)",
          borderBottom: "1px solid rgba(255,255,255,0.08)",
          marginBottom: 24,
        }}>
          {[
            { num: "50K+", label: "Businesses" },
            { num: "2M+",  label: "Bookings/mo" },
            { num: "4.9★", label: "Avg rating" },
          ].map(({ num, label }) => (
            <div key={label}>
              <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.6rem", fontWeight: 700, color: "#fff", margin: 0, lineHeight: 1 }}>{num}</p>
              <p style={{ fontSize: ".7rem", color: "rgba(255,255,255,0.35)", textTransform: "uppercase", letterSpacing: ".08em", margin: "4px 0 0" }}>{label}</p>
            </div>
          ))}
        </div>

        {/* Testimonial */}
        <div style={{
          background: "rgba(255,255,255,0.05)", borderRadius: 16,
          border: "1px solid rgba(255,255,255,0.08)",
          padding: "20px 22px",
        }}>
          <div style={{ display: "flex", gap: 2, marginBottom: 10 }}>
            {[...Array(5)].map((_, i) => (
              <svg key={i} width="14" height="14" viewBox="0 0 20 20" fill={GOLD}>
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
              </svg>
            ))}
          </div>
          <p style={{ fontSize: ".85rem", color: "rgba(255,255,255,0.6)", lineHeight: 1.6, fontStyle: "italic", margin: "0 0 14px" }}>
            "Setting up took one afternoon. By the next morning we already had 6 new bookings come in overnight."
          </p>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{
              width: 34, height: 34, borderRadius: "50%", flexShrink: 0,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: ".7rem", fontWeight: 700, color: "#fff",
              background: `linear-gradient(135deg, ${PLUM_MID}, ${PLUM})`,
            }}>JR</div>
            <div>
              <p style={{ fontSize: ".82rem", fontWeight: 700, color: "rgba(255,255,255,0.85)", margin: 0, lineHeight: 1 }}>Jasmine R.</p>
              <p style={{ fontSize: ".72rem", color: "rgba(255,255,255,0.35)", margin: "3px 0 0" }}>Owner, Luxe Hair Studio</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Login left panel ─── */
function LoginLeftPanel({ cfg }: { cfg: { label: string; tagline: string; icon: React.ReactNode } | null }) {
  const PLUM_MID  = "#5B21B6";
  const GOLD      = "#F59E0B";
  const PLUM      = "#3B0764";

  return (
    <div
      className="auth-left-panel"
      style={{
        flex: 1, position: "relative", overflow: "hidden",
        background: "linear-gradient(145deg, #FEFAF5 0%, #EDE9FE 55%, #F5F3FF 100%)",
        display: "flex", flexDirection: "column",
      }}
    >
      {/* Decorative blobs */}
      <div style={{
        position: "absolute", top: "-15%", left: "-10%",
        width: 560, height: 560, borderRadius: "50%",
        background: "radial-gradient(circle, rgba(91,33,182,0.10) 0%, transparent 70%)",
        pointerEvents: "none",
      }} />
      <div style={{
        position: "absolute", bottom: "-15%", right: "-5%",
        width: 420, height: 420, borderRadius: "50%",
        background: `radial-gradient(circle, rgba(245,158,11,0.12) 0%, transparent 70%)`,
        pointerEvents: "none",
      }} />

      <div style={{
        position: "relative", zIndex: 10,
        display: "flex", flexDirection: "column",
        height: "100%", padding: "52px 56px",
        animation: "fadeUp .5s ease both",
      }}>

        {/* Logo — identical to PHP nav-logo */}
        <a href="/overview.php" style={{
          fontFamily: "'Cormorant Garamond', serif",
          fontSize: "1.55rem", fontWeight: 700,
          letterSpacing: "-0.02em",
          color: PLUM, textDecoration: "none",
          marginBottom: 60, display: "block",
        }}>
          Certxa<span style={{ color: GOLD }}>.</span>
        </a>

        <div style={{ flex: 1 }}>
          {cfg && (
            <div style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              padding: "7px 16px", borderRadius: 50,
              background: "rgba(91,33,182,0.07)", border: "1px solid rgba(91,33,182,0.18)",
              color: PLUM_MID, fontSize: ".8rem", fontWeight: 700,
              marginBottom: 24,
            }}>
              {cfg.icon}
              {cfg.label}
            </div>
          )}

          <h2 style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: "clamp(2.8rem, 4vw, 3.8rem)",
            fontWeight: 700, letterSpacing: "-0.03em",
            lineHeight: 1.06, color: "#1C1917",
            margin: "0 0 18px",
          }}>
            The platform<br />
            <em style={{ color: GOLD, fontStyle: "italic" }}>built for</em><br />
            service pros.
          </h2>

          <p style={{ color: "#6b7280", fontSize: "1rem", lineHeight: 1.65, maxWidth: 360, margin: "0 0 36px" }}>
            Bookings, front desk, POS, loyalty rewards, check-in, waitlist — all in one place.
          </p>

          {/* Stats */}
          <div style={{ display: "flex", gap: 36, marginBottom: 36 }}>
            {[
              { num: "50K+", label: "Businesses" },
              { num: "2M+",  label: "Bookings/mo" },
              { num: "4.9★", label: "Avg rating" },
            ].map(({ num, label }) => (
              <div key={label}>
                <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.7rem", fontWeight: 700, color: PLUM_MID, margin: 0, lineHeight: 1 }}>{num}</p>
                <p style={{ fontSize: ".7rem", color: "#9ca3af", textTransform: "uppercase", letterSpacing: ".08em", margin: "4px 0 0" }}>{label}</p>
              </div>
            ))}
          </div>

          {/* Testimonial */}
          <div style={{
            background: "#fff", borderRadius: 16,
            boxShadow: "0 4px 24px rgba(59,7,100,0.08), 0 0 0 1px rgba(229,231,235,.7)",
            padding: "22px 24px", maxWidth: 400,
          }}>
            <div style={{ display: "flex", gap: 2, marginBottom: 10 }}>
              {[...Array(5)].map((_, i) => (
                <svg key={i} width="14" height="14" viewBox="0 0 20 20" fill={GOLD}>
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                </svg>
              ))}
            </div>
            <p style={{ fontSize: ".875rem", color: "#4b5563", lineHeight: 1.65, fontStyle: "italic", margin: "0 0 14px" }}>
              "Setting up took one afternoon. By the next morning we already had 6 new bookings come in overnight."
            </p>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{
                width: 34, height: 34, borderRadius: "50%", flexShrink: 0,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: ".7rem", fontWeight: 700, color: "#fff",
                background: `linear-gradient(135deg, ${PLUM_MID}, ${PLUM})`,
              }}>JR</div>
              <div>
                <p style={{ fontSize: ".82rem", fontWeight: 700, color: "#1f2937", margin: 0, lineHeight: 1 }}>Jasmine R.</p>
                <p style={{ fontSize: ".72rem", color: "#9ca3af", margin: "3px 0 0" }}>Owner, Luxe Hair Studio</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
