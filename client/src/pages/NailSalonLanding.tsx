import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  ArrowRight, Calendar, BarChart3, Users, DollarSign,
  Clock, Building2, UserCircle, 
  Smartphone, Star, ShieldCheck, Gift, Palette, Sparkles
} from "lucide-react";
import { motion } from "framer-motion";
import { useEffect } from "react";
import NailSalonHeroVideo from "./components/NailSalonHeroVideo";

export default function NailSalonLanding() {
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
      className="min-h-screen bg-background text-foreground selection:bg-[#FF6B9D]/20"
      style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
    >
      {/* Nav */}
      <nav className="fixed w-full z-50 bg-[#1A0A14]/80 backdrop-blur-md border-b border-white/10 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-20 items-center">
            <Link to="/" className="flex items-center gap-3">
              <img src="/web-app.png" alt="Certxa" className="w-10 h-10 rounded-xl shadow-lg" />
              <span className="font-bold text-2xl tracking-tight text-white">Certxa</span>
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
              <Link to="/auth?mode=register">
                <Button className="bg-[#FF6B9D] hover:bg-[#FF6B9D]/90 text-white font-bold px-6 rounded-full">
                  Get Started
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-[#1A0A14]">
        <div className="absolute inset-0 z-0">
          <NailSalonHeroVideo />
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-[#1A0A14]/30 via-[#1A0A14]/10 to-[#1A0A14]/70 z-10" />

        <div className="relative z-20 text-center max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 mt-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20 backdrop-blur-md mb-8"
          >
            <span className="flex h-2 w-2 rounded-full bg-[#FF6B9D] animate-pulse" />
            <span className="text-sm font-medium text-white/90">💅 Built Specifically for Nail Salons</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-6xl md:text-7xl lg:text-8xl font-black text-white mb-6 tracking-tight leading-[1.1]"
          >
            Your Clients.<br />
            <span className="text-[#FF6B9D]">Perfectly Polished.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-lg md:text-xl text-white/80 mb-10 max-w-3xl mx-auto leading-relaxed font-light"
          >
            Certxa handles online bookings, nail tech scheduling, service upsells,
            and checkout — so you can focus on stunning nails, not admin. Trusted
            by 10,000+ nail salons.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16"
          >
            <Link to="/auth?mode=register">
              <Button
                size="lg"
                className="h-14 px-8 text-lg rounded-full bg-[#FF6B9D] hover:bg-[#FF6B9D]/90 text-white font-bold shadow-[0_0_30px_rgba(255,107,157,0.35)] transition-all hover:scale-105"
              >
                Start Free Trial
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.8 }}
            className="flex flex-wrap justify-center gap-3 text-sm font-medium text-white/70"
          >
            <span className="px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm">✅ No credit card required</span>
            <span className="px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm">✅ 60-day free trial</span>
            <span className="px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm">✅ Set up in under 5 minutes</span>
          </motion.div>
        </div>
      </div>

      {/* Social Proof Bar */}
      <div className="bg-[#0A2540] py-6 border-y border-white/10 relative z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <p className="text-white/80 font-medium text-lg flex items-center gap-3">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#FF6B9D] opacity-75" />
                <span className="relative inline-flex rounded-full h-3 w-3 bg-[#FF6B9D]" />
              </span>
              Trusted by 10,000+ nail salons worldwide
            </p>
            <div className="flex flex-wrap justify-center gap-8 text-white/60 font-medium text-sm md:text-base">
              <div className="flex items-center gap-2"><span className="text-[#FF6B9D] font-bold">✓</span> GlossGenius Alternative</div>
              <div className="flex items-center gap-2"><span className="text-[#FF6B9D] font-bold">✓</span> Vagaro Alternative</div>
              <div className="flex items-center gap-2"><span className="text-[#FF6B9D] font-bold">✓</span> Fresha Alternative</div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="bg-[#1A0A14] py-20 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { value: "10,000+", label: "Nail Salons" },
              { value: "4.2M+", label: "Appointments Booked" },
              { value: "97%", label: "Client Return Rate" },
              { value: "4.9★", label: "Average Rating" },
            ].map((stat) => (
              <div key={stat.label}>
                <p className="text-4xl md:text-5xl font-black text-[#FF6B9D] mb-2">{stat.value}</p>
                <p className="text-white/60 font-medium">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Features */}
      <div className="py-32 bg-rose-50 text-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <span className="inline-block px-4 py-1.5 rounded-full bg-[#FF6B9D]/10 text-[#d4527a] text-sm font-semibold mb-4">
              BUILT FOR NAIL SALONS
            </span>
            <h2 className="text-4xl md:text-5xl font-black mb-6 tracking-tight text-[#0A2540]">
              Everything a Nail Salon Needs
            </h2>
            <p className="text-slate-500 text-xl max-w-2xl mx-auto font-light">
              From walk-ins to regulars — Certxa handles the front desk so your
              nail techs can do what they do best.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard
              icon={<Calendar className="w-6 h-6 text-[#FF6B9D]" />}
              title="Online Booking for Nail Techs"
              description="Clients book their favourite nail tech 24/7 from your branded page. Choose service, add-ons, and time slot — no phone calls needed."
            />
            <FeatureCard
              icon={<Palette className="w-6 h-6 text-[#FF6B9D]" />}
              title="Full Service Catalog"
              description="List manicures, pedicures, gel, acrylic, dip powder, nail art, and more. Attach add-ons like nail repair or cuticle care for easy upselling."
            />
            <FeatureCard
              icon={<UserCircle className="w-6 h-6 text-[#FF6B9D]" />}
              title="Nail Tech Scheduling"
              description="Assign services to specific nail techs with colour-coded calendars. Set individual availability and break times for each team member."
            />
            <FeatureCard
              icon={<Users className="w-6 h-6 text-[#FF6B9D]" />}
              title="Client Profiles & Notes"
              description="Store nail preferences, allergies, and style notes on every client profile. Know exactly what each client wants before they sit down."
            />
            <FeatureCard
              icon={<DollarSign className="w-6 h-6 text-[#FF6B9D]" />}
              title="Fast POS Checkout"
              description="Ring up services and retail products in seconds. Tip presets, discounts, split payments, and tax all built right in at the station."
            />
            <FeatureCard
              icon={<Gift className="w-6 h-6 text-[#FF6B9D]" />}
              title="Gift Cards & Promotions"
              description="Sell digital gift cards from your booking page. Create seasonal promotions and package deals to bring clients back."
            />
            <FeatureCard
              icon={<BarChart3 className="w-6 h-6 text-[#FF6B9D]" />}
              title="Commission Tracking"
              description="Set per-tech commission rates and generate detailed payout reports by date range. No more end-of-week calculation headaches."
            />
            <FeatureCard
              icon={<Smartphone className="w-6 h-6 text-[#FF6B9D]" />}
              title="Automated SMS Reminders"
              description="Reduce no-shows with automatic text reminders before every appointment. Send follow-up review requests after each visit."
            />
            <FeatureCard
              icon={<Sparkles className="w-6 h-6 text-[#FF6B9D]" />}
              title="Walk-In Management"
              description="Handle walk-ins alongside booked appointments smoothly. Add them to the queue and assign them to the next available nail tech."
            />
            <FeatureCard
              icon={<Clock className="w-6 h-6 text-[#FF6B9D]" />}
              title="Appointment Status Tracking"
              description="Move appointments from confirmed to started, completed, or no-show. Keep your whole team aligned at a glance."
            />
            <FeatureCard
              icon={<Building2 className="w-6 h-6 text-[#FF6B9D]" />}
              title="Multi-Location Support"
              description="Manage multiple salon locations from one account with independent staff, hours, and reporting per location."
            />
            <FeatureCard
              icon={<ShieldCheck className="w-6 h-6 text-[#FF6B9D]" />}
              title="Nail Salon Onboarding"
              description="Sign up as a nail salon and get auto-created services like gel manicure, acrylic set, pedicure, and nail art — ready to book from day one."
            />
          </div>
        </div>
      </div>

      {/* How It Works */}
      <div className="py-32 bg-[#0A2540] text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#FF6B9D]/8 blur-[140px] rounded-full pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-[#00D4AA]/5 blur-[140px] rounded-full pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-20">
            <span className="inline-block px-4 py-1.5 rounded-full bg-[#FF6B9D]/10 text-[#FF6B9D] text-sm font-semibold mb-4">
              SIMPLE SETUP
            </span>
            <h2 className="text-4xl md:text-5xl font-black mb-6 tracking-tight">
              Up and Running in Minutes
            </h2>
            <p className="text-white/70 text-xl max-w-2xl mx-auto font-light">
              No tech skills needed. Get your nail salon bookable online today.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {[
              {
                step: "01",
                title: "Create Your Salon Profile",
                desc: "Add your salon name, nail tech team, and service menu. Our nail salon onboarding auto-fills gel manicure, acrylics, pedicure, and more — ready to go in minutes.",
              },
              {
                step: "02",
                title: "Share Your Booking Link",
                desc: "Get your branded booking page instantly. Share it on Instagram, TikTok, or Google Business. Clients pick their tech, service, and time — all without calling.",
              },
              {
                step: "03",
                title: "Manage Your Whole Salon",
                desc: "View the daily schedule, check in walk-ins, run POS checkout, and track nail tech commissions — all from one dashboard on any device.",
              },
            ].map(({ step, title, desc }) => (
              <div key={step} className="flex flex-col items-start gap-4">
                <span className="text-6xl font-black text-[#FF6B9D]/20">{step}</span>
                <h3 className="text-2xl font-bold text-white">{title}</h3>
                <p className="text-white/60 font-light leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Testimonials */}
      <div className="py-32 bg-rose-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-black mb-6 tracking-tight text-[#0A2540]">
              What Nail Salon Owners Are Saying
            </h2>
            <p className="text-slate-500 text-xl max-w-2xl mx-auto font-light">
              Real feedback from real salon owners.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <TestimonialCard
              quote="We switched from GlossGenius and saved $250 a month. The online booking is so smooth — our clients love it and we get way fewer no-shows."
              name="Linda T."
              role="Owner, Polished Perfection Nails"
            />
            <TestimonialCard
              quote="The add-on feature is genius. We upsell cuticle care and nail art to almost every client now. Our average ticket went up by $18."
              name="Mia C."
              role="Owner, Luxe Nail Studio"
            />
            <TestimonialCard
              quote="I have 8 nail techs and managing their schedules used to be chaos. Now everything is colour-coded and my team actually knows when they're working."
              name="Priya S."
              role="Owner, Petal Nail Bar"
            />
          </div>
        </div>
      </div>

      {/* Comparison Table */}
      <div className="py-32 bg-[#1A0A14] text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-black mb-6 tracking-tight">
              Why Nail Salons Choose Certxa
            </h2>
            <p className="text-white/70 text-xl max-w-2xl mx-auto font-light">
              More features. Less cost. Built for how nail salons actually work.
            </p>
          </div>

          <div className="rounded-3xl overflow-hidden border border-white/10">
            <div className="grid grid-cols-3 bg-[#0A2540] text-sm font-bold text-white/60 uppercase tracking-wider">
              <div className="p-5 border-b border-white/10">Feature</div>
              <div className="p-5 border-b border-l border-white/10 text-[#FF6B9D] text-center">Certxa</div>
              <div className="p-5 border-b border-l border-white/10 text-center">Others</div>
            </div>
            {[
              ["Nail tech colour-coded calendar", true, false],
              ["Service add-on upselling", true, false],
              ["Client nail preference notes", true, false],
              ["Walk-in queue management", true, false],
              ["SMS reminders included", true, false],
              ["Per-tech commission tracking", true, false],
              ["Gift card sales", true, false],
              ["60-day free trial", true, false],
            ].map(([feature, certxa, others]) => (
              <div
                key={String(feature)}
                className="grid grid-cols-3 border-b border-white/10 hover:bg-white/5 transition-colors"
              >
                <div className="p-5 text-white/80 font-medium">{feature}</div>
                <div className="p-5 border-l border-white/10 text-center">
                  {certxa ? <span className="text-[#FF6B9D] font-bold text-lg">✓</span> : <span className="text-white/20">—</span>}
                </div>
                <div className="p-5 border-l border-white/10 text-center">
                  {others ? <span className="text-white/60 font-bold">✓</span> : <span className="text-white/20">—</span>}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="py-32 relative overflow-hidden bg-gradient-to-br from-[#1A0A14] to-[#FF6B9D]/10">
        <div className="absolute inset-0 bg-[#060E1A]/70 mix-blend-overlay" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-3xl h-full bg-[#FF6B9D]/10 blur-[100px] rounded-full" />

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="flex justify-center mb-6">
            <span className="text-6xl">💅</span>
          </div>
          <h2 className="text-5xl md:text-6xl font-black text-white mb-6 tracking-tight">
            Ready to Fill Every Station?
          </h2>
          <p className="text-white/80 text-xl mb-4 max-w-2xl mx-auto font-light">
            Start your 60-day free trial today. No credit card required. Cancel any time.
          </p>
          <p className="text-white/50 text-base mb-12 max-w-xl mx-auto">
            Join thousands of nail salons already using Certxa to grow their business.
          </p>
          <Link to="/auth?mode=register">
            <Button
              size="lg"
              className="h-16 px-10 text-xl rounded-full bg-[#FF6B9D] hover:bg-[#FF6B9D]/90 text-white font-bold shadow-[0_0_40px_rgba(255,107,157,0.35)] transition-all hover:scale-105"
            >
              Start Free — No Credit Card Required
              <ArrowRight className="ml-3 w-6 h-6" />
            </Button>
          </Link>
          <p className="mt-6 text-white/40 text-sm">
            Questions?{" "}
            <a href="mailto:hello@certxa.com" className="underline hover:text-white/70 transition-colors">
              hello@certxa.com
            </a>
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
    <Card className="border-0 shadow-[0_4px_20px_rgb(0,0,0,0.05)] hover:shadow-[0_10px_40px_rgb(0,0,0,0.08)] hover:-translate-y-1 transition-all duration-300 bg-white rounded-3xl overflow-hidden group">
      <CardContent className="p-8">
        <div className="mb-6 p-4 bg-gradient-to-br from-[#FF6B9D]/15 to-[#FF6B9D]/5 rounded-2xl w-fit group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300">
          {icon}
        </div>
        <h3 className="text-xl font-bold mb-3 text-[#0A2540]">{title}</h3>
        <p className="text-slate-500 leading-relaxed font-light">{description}</p>
      </CardContent>
    </Card>
  );
}

function TestimonialCard({ quote, name, role }: { quote: string; name: string; role: string }) {
  return (
    <div className="bg-white rounded-3xl p-8 shadow-[0_4px_20px_rgb(0,0,0,0.05)] hover:shadow-[0_10px_40px_rgb(0,0,0,0.08)] hover:-translate-y-1 transition-all duration-300">
      <div className="flex gap-1 mb-5">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star key={i} className="w-5 h-5 fill-[#FF6B9D] text-[#FF6B9D]" />
        ))}
      </div>
      <p className="text-slate-600 leading-relaxed mb-6 font-light italic">"{quote}"</p>
      <div>
        <p className="font-bold text-[#0A2540]">{name}</p>
        <p className="text-slate-400 text-sm">{role}</p>
      </div>
    </div>
  );
}
