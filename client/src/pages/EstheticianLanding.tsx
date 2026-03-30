import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  ArrowRight, Calendar, BarChart3, Users, DollarSign,
  Clock, Building2, UserCircle, PlayCircle,
  Smartphone, Star, Zap, ShieldCheck, Repeat, Sparkles
} from "lucide-react";
import { motion } from "framer-motion";
import { useEffect } from "react";
import EstheticianHeroVideo from "./components/EstheticianHeroVideo";

export default function EstheticianLanding() {
  useEffect(() => {
    const link = document.createElement("link");
    link.href =
      "https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap";
    link.rel = "stylesheet";
    document.head.appendChild(link);
    return () => {
      document.head.removeChild(link);
    };
  }, []);

  return (
    <div
      className="min-h-screen bg-background text-foreground selection:bg-[#00D4AA]/30"
      style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
    >
      {/* Nav */}
      <nav className="fixed w-full z-50 bg-[#060E1A]/80 backdrop-blur-md border-b border-white/10 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-20 items-center">
            <Link to="/" className="flex items-center gap-3">
              <img
                src="/web-app.png"
                alt="Certxa"
                className="w-10 h-10 rounded-xl shadow-lg"
              />
              <span className="font-bold text-2xl tracking-tight text-white">
                Certxa
              </span>
            </Link>
            <div className="flex items-center gap-6">
              <Link to="/pricing">
                <Button variant="ghost" className="font-medium text-white/90 hover:text-white hover:bg-white/10">
                  Pricing
                </Button>
              </Link>
              <Link to="/auth">
                <Button variant="ghost" className="font-medium text-white/90 hover:text-white hover:bg-white/10">
                  Log in
                </Button>
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

      {/* Hero Section */}
      <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-[#060E1A]">
        <div className="absolute inset-0 z-0">
          <EstheticianHeroVideo />
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-[#060E1A]/30 via-[#060E1A]/10 to-[#060E1A]/60 z-10" />

        <div className="relative z-20 text-center max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 mt-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20 backdrop-blur-md mb-8"
          >
            <span className="flex h-2 w-2 rounded-full bg-[#00D4AA] animate-pulse" />
            <span className="text-sm font-medium text-white/90">
              ✨ Built Specifically for Estheticians
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-6xl md:text-7xl lg:text-8xl font-black text-white mb-6 tracking-tight leading-[1.1]"
          >
            Your Glow-Up.
            <br />
            <span className="text-[#00D4AA]">On Schedule.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-lg md:text-xl text-white/80 mb-10 max-w-3xl mx-auto leading-relaxed font-light"
          >
            Certxa handles online bookings, client skin notes, treatment scheduling, and checkout — so you can focus on the results, not the paperwork. Trusted by thousands of estheticians.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16"
          >
            <Link to="/auth">
              <Button
                size="lg"
                className="h-14 px-8 text-lg rounded-full bg-[#00D4AA] hover:bg-[#00D4AA]/90 text-[#0A2540] font-bold shadow-[0_0_30px_rgba(0,212,170,0.3)] transition-all hover:scale-105"
              >
                Start Free Trial
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
            <Button
              size="lg"
              variant="outline"
              className="h-14 px-8 text-lg rounded-full border-white/30 text-white hover:bg-white/10 bg-white/5 backdrop-blur-sm transition-all"
            >
              <PlayCircle className="mr-2 w-5 h-5" />
              Watch Demo
            </Button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.8 }}
            className="flex flex-wrap justify-center gap-3 text-sm font-medium text-white/70"
          >
            <span className="px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm">
              ✅ No credit card required
            </span>
            <span className="px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm">
              ✅ 60-day free trial
            </span>
            <span className="px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm">
              ✅ Set up in under 5 minutes
            </span>
          </motion.div>
        </div>
      </div>

      {/* Social Proof Bar */}
      <div className="bg-[#0A2540] py-6 border-y border-white/10 relative z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <p className="text-white/80 font-medium text-lg flex items-center gap-3">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00D4AA] opacity-75" />
                <span className="relative inline-flex rounded-full h-3 w-3 bg-[#00D4AA]" />
              </span>
              Trusted by thousands of estheticians worldwide
            </p>
            <div className="flex flex-wrap justify-center gap-8 text-white/60 font-medium text-sm md:text-base">
              <div className="flex items-center gap-2">
                <span className="text-[#00D4AA] font-bold">✓</span> Vagaro Alternative
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[#00D4AA] font-bold">✓</span> GlossGenius Alternative
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[#00D4AA] font-bold">✓</span> Boulevard Alternative
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="bg-[#060E1A] py-20 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { value: "8,000+", label: "Estheticians" },
              { value: "1.8M+", label: "Treatments Booked" },
              { value: "98%", label: "Client Retention Rate" },
              { value: "4.9★", label: "Average Rating" },
            ].map((stat) => (
              <div key={stat.label}>
                <p className="text-4xl md:text-5xl font-black text-[#00D4AA] mb-2">
                  {stat.value}
                </p>
                <p className="text-white/60 font-medium">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-32 bg-slate-50 text-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <span className="inline-block px-4 py-1.5 rounded-full bg-[#00D4AA]/10 text-[#00D4AA] text-sm font-semibold mb-4">
              BUILT FOR ESTHETICIANS
            </span>
            <h2 className="text-4xl md:text-5xl font-black mb-6 tracking-tight text-[#0A2540]">
              Everything Your Skin Studio Needs
            </h2>
            <p className="text-slate-500 text-xl max-w-2xl mx-auto font-light">
              From the consultation to checkout — Certxa keeps your treatment room fully booked and running smoothly.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard
              icon={<Calendar className="w-6 h-6 text-[#00D4AA]" />}
              title="Online Booking"
              description="Clients book facials, peels, waxing, and other treatments 24/7 from your branded booking page. Service-specific durations are automatically managed so you're never double-booked."
            />
            <FeatureCard
              icon={<Sparkles className="w-6 h-6 text-[#00D4AA]" />}
              title="Client Skin Profiles"
              description="Store skin type, concerns, product sensitivities, past treatments, and before/after notes per client. Walk into every appointment knowing exactly what your client needs."
            />
            <FeatureCard
              icon={<Repeat className="w-6 h-6 text-[#00D4AA]" />}
              title="Recurring Treatment Series"
              description="Clients book a series of treatments — like 6 chemical peels — in one go. Lock in their schedule, improve compliance, and increase your average revenue per client."
            />
            <FeatureCard
              icon={<Zap className="w-6 h-6 text-[#00D4AA]" />}
              title="Treatment Room Scheduling"
              description="Manage multiple treatment rooms with individual calendars per room and per esthetician. No overlapping bookings, no chaos at the front."
            />
            <FeatureCard
              icon={<UserCircle className="w-6 h-6 text-[#00D4AA]" />}
              title="Staff & Commission Management"
              description="Set commission rates per esthetician and service. Generate payout reports by date range with a single click — no spreadsheets required."
            />
            <FeatureCard
              icon={<DollarSign className="w-6 h-6 text-[#00D4AA]" />}
              title="Fast POS Checkout"
              description="Ring up treatments, retail skincare products, and gift cards in one transaction. Accept cash, card, and split payments with tip prompts built right in."
            />
            <FeatureCard
              icon={<Smartphone className="w-6 h-6 text-[#00D4AA]" />}
              title="SMS & Email Reminders"
              description="Automated pre-appointment reminders reduce no-shows significantly. Send post-treatment care instructions and review requests automatically after each visit."
            />
            <FeatureCard
              icon={<Users className="w-6 h-6 text-[#00D4AA]" />}
              title="Client Retention Tools"
              description="Track visit frequency and flag clients who haven't returned in a while. Send a win-back message with one click to keep your client list active and loyal."
            />
            <FeatureCard
              icon={<BarChart3 className="w-6 h-6 text-[#00D4AA]" />}
              title="Revenue & Service Reports"
              description="See your top-performing services, busiest days, and revenue trends at a glance. Make smarter business decisions with real data from your own bookings."
            />
            <FeatureCard
              icon={<Clock className="w-6 h-6 text-[#00D4AA]" />}
              title="Appointment Status Tracking"
              description="Track clients from confirmed to arrived, in-treatment, and completed. Your front desk and treatment rooms stay in sync without phone calls or sticky notes."
            />
            <FeatureCard
              icon={<Building2 className="w-6 h-6 text-[#00D4AA]" />}
              title="Multi-Location Support"
              description="Operate multiple skin studios? Manage all locations from one account with independent staff, hours, and reporting per location."
            />
            <FeatureCard
              icon={<Zap className="w-6 h-6 text-[#00D4AA]" />}
              title="Online Gift Cards"
              description="Sell digital gift cards directly from your booking page. A top revenue driver during holidays and a great way to attract new clients through gifting."
            />
          </div>
        </div>
      </div>

      {/* How It Works */}
      <div className="py-32 bg-[#0A2540] text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#00D4AA]/10 blur-[120px] rounded-full mix-blend-screen pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-[#F5A623]/10 blur-[120px] rounded-full mix-blend-screen pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-20">
            <span className="inline-block px-4 py-1.5 rounded-full bg-[#00D4AA]/10 text-[#00D4AA] text-sm font-semibold mb-4">
              SIMPLE SETUP
            </span>
            <h2 className="text-4xl md:text-5xl font-black mb-6 tracking-tight">
              Up and Running in Minutes
            </h2>
            <p className="text-white/70 text-xl max-w-2xl mx-auto font-light">
              No tech skills needed. Start taking bookings today.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {[
              {
                step: "01",
                title: "Build Your Studio Profile",
                desc: "Add your studio name, hours, esthetician roster, and treatment menu. Our onboarding auto-fills common services like facials, chemical peels, waxing, and microdermabrasion.",
              },
              {
                step: "02",
                title: "Share Your Booking Link",
                desc: "Get a branded booking page instantly. Share it in your Instagram bio, website, or Google Business profile so clients can book 24/7 without calling.",
              },
              {
                step: "03",
                title: "Manage Everything in One Place",
                desc: "View your daily treatment schedule, manage client profiles, process checkout with product retail, and track staff commissions — all from one dashboard.",
              },
            ].map(({ step, title, desc }) => (
              <div key={step} className="flex flex-col items-start gap-4">
                <span className="text-6xl font-black text-[#00D4AA]/20">{step}</span>
                <h3 className="text-2xl font-bold text-white">{title}</h3>
                <p className="text-white/60 font-light leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Testimonials */}
      <div className="py-32 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-black mb-6 tracking-tight text-[#0A2540]">
              What Estheticians Are Saying
            </h2>
            <p className="text-slate-500 text-xl max-w-2xl mx-auto font-light">
              Real feedback from real skin care professionals.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <TestimonialCard
              quote="The client skin profiles are a total game-changer. I walk into every appointment knowing their history, sensitivities, and exactly what worked last time."
              name="Camille V."
              role="Owner, Radiance Skin Studio"
            />
            <TestimonialCard
              quote="My clients love booking series packages online. It's helped me increase retention and I'm now booked 3 weeks out for the first time ever."
              name="Priya S."
              role="Esthetician, Glow Theory"
            />
            <TestimonialCard
              quote="I switched from a very expensive platform and Certxa does everything it did — plus more — for a fraction of the price. The 60-day trial sealed the deal."
              name="Kayla B."
              role="Owner, Clear & Luminous Studio"
            />
          </div>
        </div>
      </div>

      {/* Compare Section */}
      <div className="py-32 bg-[#060E1A] text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-black mb-6 tracking-tight">
              Why Estheticians Choose Certxa
            </h2>
            <p className="text-white/70 text-xl max-w-2xl mx-auto font-light">
              Purpose-built for the skin care industry — not a generic booking tool.
            </p>
          </div>

          <div className="rounded-3xl overflow-hidden border border-white/10">
            <div className="grid grid-cols-3 bg-[#0A2540] text-sm font-bold text-white/60 uppercase tracking-wider">
              <div className="p-5 border-b border-white/10">Feature</div>
              <div className="p-5 border-b border-l border-white/10 text-[#00D4AA] text-center">Certxa</div>
              <div className="p-5 border-b border-l border-white/10 text-center">Others</div>
            </div>
            {[
              ["Client skin profile & notes", true, false],
              ["Treatment series bookings", true, false],
              ["Per-esthetician commission tracking", true, false],
              ["Skincare retail POS", true, false],
              ["SMS reminders included", true, false],
              ["Multi-location support", true, true],
              ["Online booking page", true, true],
              ["60-day free trial", true, false],
            ].map(([feature, certxa, others]) => (
              <div
                key={String(feature)}
                className="grid grid-cols-3 border-b border-white/10 hover:bg-white/5 transition-colors"
              >
                <div className="p-5 text-white/80 font-medium">{feature}</div>
                <div className="p-5 border-l border-white/10 text-center">
                  {certxa ? <span className="text-[#00D4AA] font-bold text-lg">✓</span> : <span className="text-white/20">—</span>}
                </div>
                <div className="p-5 border-l border-white/10 text-center">
                  {others ? <span className="text-white/60 font-bold">✓</span> : <span className="text-white/20">—</span>}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-32 relative overflow-hidden bg-gradient-to-br from-[#0A2540] to-[#00D4AA]/20">
        <div className="absolute inset-0 bg-[#060E1A]/80 mix-blend-overlay" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-3xl h-full bg-[#00D4AA]/10 blur-[100px] rounded-full" />

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="flex justify-center mb-6">
            <ShieldCheck className="w-14 h-14 text-[#00D4AA]" />
          </div>
          <h2 className="text-5xl md:text-6xl font-black text-white mb-6 tracking-tight">
            Ready to Fill Every Treatment Room?
          </h2>
          <p className="text-white/80 text-xl mb-4 max-w-2xl mx-auto font-light">
            Start your 60-day free trial today. No credit card required. Cancel any time.
          </p>
          <p className="text-white/50 text-base mb-12 max-w-xl mx-auto">
            Join thousands of estheticians already using Certxa to grow their clientele.
          </p>
          <Link to="/auth">
            <Button
              size="lg"
              className="h-16 px-10 text-xl rounded-full bg-[#00D4AA] hover:bg-[#00D4AA]/90 text-[#0A2540] font-bold shadow-[0_0_40px_rgba(0,212,170,0.4)] transition-all hover:scale-105"
            >
              Start Free — No Credit Card Required
              <ArrowRight className="ml-3 w-6 h-6" />
            </Button>
          </Link>
          <p className="mt-6 text-white/40 text-sm">
            Questions? <a href="mailto:hello@certxa.com" className="underline hover:text-white/70 transition-colors">hello@certxa.com</a>
          </p>
        </div>
      </div>

      <footer className="bg-[#060E1A] py-12 border-t border-white/10 relative z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-3">
              <img src="/web-app.png" alt="Certxa" className="w-10 h-10 rounded-xl grayscale opacity-70" />
              <span className="font-bold text-2xl text-white/80 tracking-tight">Certxa</span>
            </div>
            <p className="text-white/40 text-sm">© 2025 Certxa. All rights reserved.</p>
          </div>
          <div className="mt-8 pt-8 border-t border-white/10 flex flex-wrap items-center justify-center md:justify-end gap-8">
            <Link to="/" className="text-sm text-white/50 hover:text-white transition-colors">Home</Link>
            <Link to="/pricing" className="text-sm text-white/50 hover:text-white transition-colors">Pricing</Link>
            <Link to="/privacy-policy" className="text-sm text-white/50 hover:text-white transition-colors">Privacy Policy</Link>
            <Link to="/staff-auth" className="text-sm text-white/50 hover:text-white transition-colors">Staff Login</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-100 hover:shadow-md hover:-translate-y-1 transition-all duration-300">
      <div className="w-12 h-12 rounded-xl bg-[#00D4AA]/10 flex items-center justify-center mb-5">
        {icon}
      </div>
      <h3 className="text-lg font-bold text-[#0A2540] mb-3">{title}</h3>
      <p className="text-slate-500 font-light leading-relaxed">{description}</p>
    </div>
  );
}

function TestimonialCard({ quote, name, role }: { quote: string; name: string; role: string }) {
  return (
    <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-100">
      <div className="flex gap-1 mb-4">
        {[...Array(5)].map((_, i) => (
          <Star key={i} className="w-4 h-4 fill-[#00D4AA] text-[#00D4AA]" />
        ))}
      </div>
      <p className="text-slate-700 font-light leading-relaxed mb-6 italic">"{quote}"</p>
      <div>
        <p className="font-bold text-[#0A2540]">{name}</p>
        <p className="text-slate-500 text-sm">{role}</p>
      </div>
    </div>
  );
}
