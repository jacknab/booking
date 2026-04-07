import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, ArrowRight } from "lucide-react";
import { FaGoogle } from "react-icons/fa";
import { useToast } from "@/hooks/use-toast";

export default function Auth() {
  const navigate = useNavigate();
  const {
    isAuthenticated,
    user,
    login,
    register,
    isLoggingIn,
    isRegistering,
    isLoading,
    hasStoredSession,
    loginWithGoogle,
  } = useAuth();

  const { toast } = useToast();
  const [mode, setMode] = useState<"login" | "register">("login");
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

  useEffect(() => {
    if (isAuthenticated) {
      if (user && !user.onboardingCompleted) {
        navigate("/onboarding");
      } else {
        navigate("/calendar");
      }
    }
  }, [isAuthenticated, user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      let result: any;
      if (mode === "login") {
        result = await login({ email, password });
      } else {
        result = await register({ email, password, firstName: firstName || undefined, lastName: lastName || undefined });
      }
      if (result && !result.onboardingCompleted) {
        navigate("/onboarding");
      } else {
        navigate("/calendar");
      }
    } catch (error: any) {
      const message = error?.message || (mode === "login" ? "Login failed" : "Registration failed");
      let description = message;
      try {
        const parsed = JSON.parse(message.replace(/^\d+:\s*/, ""));
        description = parsed.message || message;
      } catch {
        if (message.includes(":")) {
          description = message.split(":").slice(1).join(":").trim();
        }
      }
      toast({ title: mode === "login" ? "Login failed" : "Registration failed", description, variant: "destructive" });
    }
  };

  const isPending = isLoggingIn || isRegistering;

  if (isLoading && hasStoredSession) {
    return (
      <div className="min-h-screen bg-[#060E1A] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-[#00D4AA]" />
          <p className="text-white/60">Welcome back! Restoring your session...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#060E1A] text-white flex flex-col" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      <nav className="fixed w-full z-50 bg-[#060E1A]/80 backdrop-blur-md border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-20 items-center">
            <Link to="/" className="flex items-center gap-3">
              <img src="/web-app.png" alt="Certxa" className="w-10 h-10 rounded-xl shadow-lg" />
              <span className="font-bold text-2xl tracking-tight text-white">Certxa</span>
            </Link>
            <div className="flex items-center gap-6">
              <Link to="/pricing">
                <Button variant="ghost" className="font-bold text-base text-white/90 hover:text-white hover:bg-white/10">Pricing</Button>
              </Link>
              <Link to="/auth">
                <Button variant="ghost" className="font-bold text-base text-white/90 hover:text-white hover:bg-white/10">Log in</Button>
              </Link>
              <Link to="/auth">
                <Button className="bg-[#00D4AA] hover:bg-[#00D4AA]/90 text-[#0A2540] font-bold px-6 rounded-full">
                  Get Started
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="flex-1 flex items-center justify-center pt-20 px-4 py-16">
        <div className="w-full max-w-sm">
          <div className="flex flex-col items-center mb-8">
            <div className="w-16 h-16 rounded-2xl overflow-hidden shadow-[0_0_30px_rgba(0,212,170,0.3)] mb-4">
              <img src="/web-app.png" alt="Certxa" className="w-full h-full object-cover" />
            </div>
            <h1 className="font-bold text-3xl tracking-tight text-white">Certxa</h1>
          </div>

          <div className="bg-white/5 border border-white/10 backdrop-blur-md rounded-2xl p-6">
            <div className="mb-6">
              <h2 className="text-xl font-bold text-white mb-1">
                {mode === "login" ? "Welcome back" : "Create your account"}
              </h2>
              <p className="text-white/50 text-sm">
                {mode === "login"
                  ? "Enter your details to sign in to your account"
                  : "Start your free trial — no credit card required"}
              </p>
            </div>

            <Button
              variant="outline"
              className="w-full flex items-center justify-center gap-2 bg-white/5 border-white/20 text-white hover:bg-white/10 hover:text-white mb-4"
              onClick={loginWithGoogle}
            >
              <FaGoogle className="w-4 h-4" />
              {mode === "login" ? "Sign in with Google" : "Sign up with Google"}
            </Button>

            <div className="relative mb-4">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-white/10" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-transparent px-2 text-white/30">Or continue with</span>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {mode === "register" && (
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="firstName" className="text-white/70 text-sm">First name</Label>
                    <Input
                      id="firstName"
                      data-testid="input-first-name"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      placeholder="Jane"
                      className="bg-white/5 border-white/15 text-white placeholder:text-white/30 focus:border-[#00D4AA]/60 focus:ring-[#00D4AA]/20"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="lastName" className="text-white/70 text-sm">Last name</Label>
                    <Input
                      id="lastName"
                      data-testid="input-last-name"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      placeholder="Doe"
                      className="bg-white/5 border-white/15 text-white placeholder:text-white/30 focus:border-[#00D4AA]/60 focus:ring-[#00D4AA]/20"
                    />
                  </div>
                </div>
              )}

              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-white/70 text-sm">Email</Label>
                <Input
                  id="email"
                  type="email"
                  data-testid="input-email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="m@example.com"
                  required
                  className="bg-white/5 border-white/15 text-white placeholder:text-white/30 focus:border-[#00D4AA]/60 focus:ring-[#00D4AA]/20"
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-white/70 text-sm">Password</Label>
                  {mode === "login" && (
                    <Link
                      to="/forgot-password"
                      className="text-xs text-[#00D4AA]/80 hover:text-[#00D4AA] transition-colors"
                    >
                      Forgot password?
                    </Link>
                  )}
                </div>
                <Input
                  id="password"
                  type="password"
                  data-testid="input-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  required
                  minLength={6}
                  className="bg-white/5 border-white/15 text-white placeholder:text-white/30 focus:border-[#00D4AA]/60 focus:ring-[#00D4AA]/20"
                />
              </div>

              <Button
                type="submit"
                className="w-full bg-[#00D4AA] hover:bg-[#00D4AA]/90 text-[#0A2540] font-bold rounded-full h-11"
                disabled={isPending}
                data-testid="button-submit-auth"
              >
                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {mode === "login" ? "Log in" : "Create account"}
                {!isPending && <ArrowRight className="ml-2 w-4 h-4" />}
              </Button>
            </form>

            <div className="text-center text-sm mt-4 text-white/50">
              {mode === "login" ? (
                <>
                  Don't have an account?{" "}
                  <button
                    type="button"
                    onClick={() => setMode("register")}
                    className="text-[#00D4AA] hover:text-[#00D4AA]/80 font-medium transition-colors"
                    data-testid="link-switch-to-register"
                  >
                    Sign up
                  </button>
                </>
              ) : (
                <>
                  Already have an account?{" "}
                  <button
                    type="button"
                    onClick={() => setMode("login")}
                    className="text-[#00D4AA] hover:text-[#00D4AA]/80 font-medium transition-colors"
                    data-testid="link-switch-to-login"
                  >
                    Log in
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      <footer className="bg-[#060E1A] py-12 border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-3">
              <img src="/web-app.png" alt="Certxa" className="w-10 h-10 rounded-xl grayscale opacity-70" />
              <span className="font-bold text-2xl text-white/80 tracking-tight">Certxa</span>
            </div>
            <p className="text-white/40 text-sm">© 2025 Certxa. All rights reserved.</p>
          </div>
          <div className="mt-8 pt-8 border-t border-white/10 flex flex-wrap items-center justify-center md:justify-end gap-8">
            <Link to="/privacy-policy" className="text-sm text-white/50 hover:text-white transition-colors">Privacy Policy</Link>
            <Link to="/terms-of-service" className="text-sm text-white/50 hover:text-white transition-colors">Terms of Service</Link>
            <Link to="/staff-auth" className="text-sm text-white/50 hover:text-white transition-colors">Staff Login</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
