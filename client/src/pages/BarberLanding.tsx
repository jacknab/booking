import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  ArrowRight, Calendar, BarChart3, Scissors, Users, DollarSign,
  Banknote, Clock, Receipt, Building2, UserCircle, 
  Smartphone, Star, Zap, ShieldCheck
} from "lucide-react";
import { motion } from "framer-motion";
import { useEffect } from "react";
import BarberHeroVideo from "./components/BarberHeroVideo";
import BusinessTypeMenu from "./components/BusinessTypeMenu";

export default function BarberLanding() {
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
              <BusinessTypeMenu />
              <Link to="/pricing">
                <Button
                  variant="ghost"
                  className="font-medium text-white/90 hover:text-white hover:bg-white/10"
                >
                  Pricing
                </Button>
              </Link>
              <Link to="/auth">
                <Button
                  variant="ghost"
                  className="font-medium text-white/90 hover:text-white hover:bg-white/10"
                >
                  Log in
                </Button>
              </Link>
              <Link to="/auth?mode=register">
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
        {/* Animated video background */}
        <div className="absolute inset-0 z-0">
          <BarberHeroVideo />
        </div>
        {/* Gradient overlay to blend into page */}
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
              ✂️ Built Specifically for Barbershops
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-6xl md:text-7xl lg:text-8xl font-black text-white mb-6 tracking-tight leading-[1.1]"
          >
            Your Chair.
            <br />
            <span className="text-[#00D4AA]">Always Full.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-lg md:text-xl text-white/80 mb-10 max-w-3xl mx-auto leading-relaxed font-light"
          >
            Certxa handles online bookings, walk-ins, barber rotations, and
            POS checkout — so you can focus on the cut, not the admin.
            Trusted by 10,000+ barbershops.
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
                className="h-14 px-8 text-lg rounded-full bg-[#00D4AA] hover:bg-[#00D4AA]/90 text-[#0A2540] font-bold shadow-[0_0_30px_rgba(0,212,170,0.3)] transition-all hover:scale-105"
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
              Trusted by 10,000+ barbershops worldwide
            </p>
            <div className="flex flex-wrap justify-center gap-8 text-white/60 font-medium text-sm md:text-base">
              <div className="flex items-center gap-2">
                <span className="text-[#00D4AA] font-bold">✓</span> Appointfix
                Alternative
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[#00D4AA] font-bold">✓</span> Booksy
                Alternative
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[#00D4AA] font-bold">✓</span> Square
                Appointments Alternative
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
              { value: "10,000+", label: "Barbershops" },
              { value: "2.4M+", label: "Appointments Booked" },
              { value: "98%", label: "Client Retention Rate" },
              { value: "4.9★", label: "Average Rating" },
            ].map((stat) => (
              <div key={stat.label}>
                <p
                  className="text-4xl md:text-5xl font-black text-[#00D4AA] mb-2"
                >
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
              BUILT FOR BARBERS
            </span>
            <h2
              className="text-4xl md:text-5xl font-black mb-6 tracking-tight text-[#0A2540]"
            >
              Everything a Barbershop Needs
            </h2>
            <p className="text-slate-500 text-xl max-w-2xl mx-auto font-light">
              From the front desk to the chair — Certxa streamlines every part
              of running your barbershop.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard
              icon={<Zap className="w-6 h-6 text-[#00D4AA]" />}
              title="Walk-In & Queue Management"
              description="Let walk-in clients add themselves to a live queue from their phone. Your team sees the queue in real time and calls the next client when ready."
            />
            <FeatureCard
              icon={<Calendar className="w-6 h-6 text-[#00D4AA]" />}
              title="Online Booking for Barbers"
              description="Clients book their preferred barber 24/7 from your public booking page. Reduce no-shows with automatic SMS and email reminders."
            />
            <FeatureCard
              icon={<UserCircle className="w-6 h-6 text-[#00D4AA]" />}
              title="Barber Rotation"
              description="Automatically rotate walk-in assignments evenly across your barbers. Keep it fair and ensure every barber gets their share of the floor traffic."
            />
            <FeatureCard
              icon={<DollarSign className="w-6 h-6 text-[#00D4AA]" />}
              title="Fast POS Checkout"
              description="Ring up cuts in seconds. Support for cash, card, and split payments. Tip presets, discounts, and tax all built right in at the chair."
            />
            <FeatureCard
              icon={<BarChart3 className="w-6 h-6 text-[#00D4AA]" />}
              title="Per-Barber Commission Tracking"
              description="Set individual commission rates per barber and service. Generate detailed payout reports by date range — no spreadsheets needed."
            />
            <FeatureCard
              icon={<Scissors className="w-6 h-6 text-[#00D4AA]" />}
              title="Service Menu & Add-Ons"
              description="Build your service catalog with cuts, fades, beard trims, and add-ons like hot towel or line-up. Clients see exactly what's available when booking."
            />
            <FeatureCard
              icon={<Users className="w-6 h-6 text-[#00D4AA]" />}
              title="Client Profiles & History"
              description="Every client gets a profile with their full appointment history, preferred barber, and notes. Perfect for remembering that No. 2 fade they always want."
            />
            <FeatureCard
              icon={<Receipt className="w-6 h-6 text-[#00D4AA]" />}
              title="Thermal Receipt Printing"
              description="Print 80mm receipts directly from checkout with itemized totals, tip amounts, and payment method. No extra software needed."
            />
            <FeatureCard
              icon={<Banknote className="w-6 h-6 text-[#00D4AA]" />}
              title="Cash Drawer & Z Reports"
              description="Open and close cash drawer sessions, track cash in/out, and run end-of-day Z report reconciliation in a few taps."
            />
            <FeatureCard
              icon={<Smartphone className="w-6 h-6 text-[#00D4AA]" />}
              title="SMS Reminders"
              description="Automatically text clients before their appointment to cut no-shows. Also send review request texts after completed appointments."
            />
            <FeatureCard
              icon={<Building2 className="w-6 h-6 text-[#00D4AA]" />}
              title="Multi-Location Support"
              description="Running more than one shop? Manage all locations from one account with independent hours, staff, and reporting per location."
            />
            <FeatureCard
              icon={<Clock className="w-6 h-6 text-[#00D4AA]" />}
              title="Appointment Status Tracking"
              description="Move appointments from pending to confirmed, started, completed, or no-show. Keep your whole team on the same page at a glance."
            />
          </div>
        </div>
      </div>

      {/* How It Works Section */}
      <div className="py-32 bg-[#0A2540] text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#00D4AA]/10 blur-[120px] rounded-full mix-blend-screen pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-[#F5A623]/10 blur-[120px] rounded-full mix-blend-screen pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-20">
            <span className="inline-block px-4 py-1.5 rounded-full bg-[#00D4AA]/10 text-[#00D4AA] text-sm font-semibold mb-4">
              SIMPLE SETUP
            </span>
            <h2
              className="text-4xl md:text-5xl font-black mb-6 tracking-tight"
            >
              Up and Running in Minutes
            </h2>
            <p className="text-white/70 text-xl max-w-2xl mx-auto font-light">
              No tech skills needed. If you can use a phone, you can set up
              Certxa.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {[
              {
                step: "01",
                title: "Create Your Shop Profile",
                desc: "Add your barbershop name, hours, barber list, and service menu. Our barbershop onboarding auto-fills common services like fades, cuts, and beard trims.",
              },
              {
                step: "02",
                title: "Share Your Booking Link",
                desc: "Get your own branded booking page instantly. Share the link in your Instagram bio, WhatsApp, or Google Business profile — clients can book 24/7.",
              },
              {
                step: "03",
                title: "Manage Everything in One Place",
                desc: "View your daily calendar, check in walk-ins, process payments, and track barber commissions — all from one simple dashboard.",
              },
            ].map(({ step, title, desc }) => (
              <div key={step} className="flex flex-col items-start gap-4">
                <span
                  className="text-6xl font-black text-[#00D4AA]/20"
                >
                  {step}
                </span>
                <h3 className="text-2xl font-bold text-white">{title}</h3>
                <p className="text-white/60 font-light leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Testimonials Section */}
      <div className="py-32 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2
              className="text-4xl md:text-5xl font-black mb-6 tracking-tight text-[#0A2540]"
            >
              What Barbers Are Saying
            </h2>
            <p className="text-slate-500 text-xl max-w-2xl mx-auto font-light">
              Real feedback from real shop owners.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <TestimonialCard
              quote="Since switching to Certxa, our no-shows dropped by 60%. The SMS reminders alone paid for the whole subscription."
              name="Marcus T."
              role="Owner, Fade Factory"
            />
            <TestimonialCard
              quote="The walk-in queue is a game changer. Clients wait outside comfortably and we call them in when we're ready. Zero chaos at the front desk."
              name="Darnell R."
              role="Barber, Classic Cuts"
            />
            <TestimonialCard
              quote="I manage 3 locations and can see everything from one account. Commission reports used to take me hours — now it's one click."
              name="Kevin L."
              role="Owner, King's Barbershop"
            />
          </div>
        </div>
      </div>

      {/* Compare Section */}
      <div className="py-32 bg-[#060E1A] text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2
              className="text-4xl md:text-5xl font-black mb-6 tracking-tight"
            >
              Why Barbers Choose Certxa
            </h2>
            <p className="text-white/70 text-xl max-w-2xl mx-auto font-light">
              Certxa is purpose-built for the way barbershops actually work.
            </p>
          </div>

          <div className="rounded-3xl overflow-hidden border border-white/10">
            <div className="grid grid-cols-3 bg-[#0A2540] text-sm font-bold text-white/60 uppercase tracking-wider">
              <div className="p-5 border-b border-white/10">Feature</div>
              <div className="p-5 border-b border-l border-white/10 text-[#00D4AA] text-center">Certxa</div>
              <div className="p-5 border-b border-l border-white/10 text-center">Others</div>
            </div>
            {[
              ["Barber rotation & queue", true, false],
              ["Walk-in management", true, false],
              ["Per-barber commission tracking", true, false],
              ["Thermal receipt printing", true, false],
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
                  {certxa ? (
                    <span className="text-[#00D4AA] font-bold text-lg">✓</span>
                  ) : (
                    <span className="text-white/20">—</span>
                  )}
                </div>
                <div className="p-5 border-l border-white/10 text-center">
                  {others ? (
                    <span className="text-white/60 font-bold">✓</span>
                  ) : (
                    <span className="text-white/20">—</span>
                  )}
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
          <h2
            className="text-5xl md:text-6xl font-black text-white mb-6 tracking-tight"
          >
            Ready to Fill Every Chair?
          </h2>
          <p className="text-white/80 text-xl mb-4 max-w-2xl mx-auto font-light">
            Start your 60-day free trial today. No credit card required.
            Cancel any time.
          </p>
          <p className="text-white/50 text-base mb-12 max-w-xl mx-auto">
            Join thousands of barbershops already using Certxa to grow their
            business.
          </p>
          <Link to="/auth?mode=register">
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
              <img
                src="/web-app.png"
                alt="Certxa"
                className="w-10 h-10 rounded-xl grayscale opacity-70"
              />
              <span
                className="font-bold text-2xl text-white/80 tracking-tight"
              >
                Certxa
              </span>
            </div>
            <p className="text-white/40 text-sm">
              © 2025 Certxa. All rights reserved.
            </p>
          </div>
          <div className="mt-8 pt-8 border-t border-white/10 flex flex-wrap items-center justify-center md:justify-end gap-8">
            <Link to="/" className="text-sm text-white/50 hover:text-white transition-colors">
              Home
            </Link>
            <Link
              to="/pricing"
              className="text-sm text-white/50 hover:text-white transition-colors"
            >
              Pricing
            </Link>
            <Link
              to="/privacy-policy"
              className="text-sm text-white/50 hover:text-white transition-colors"
            >
              Privacy Policy
            </Link>
            <Link
              to="/staff-auth"
              className="text-sm text-white/50 hover:text-white transition-colors"
            >
              Staff Login
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <Card className="border-0 shadow-[0_4px_20px_rgb(0,0,0,0.05)] hover:shadow-[0_10px_40px_rgb(0,0,0,0.08)] hover:-translate-y-1 transition-all duration-300 bg-white rounded-3xl overflow-hidden group">
      <CardContent className="p-8">
        <div className="mb-6 p-4 bg-gradient-to-br from-[#00D4AA]/20 to-[#00D4AA]/5 rounded-2xl w-fit group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300 text-[#00D4AA]">
          {icon}
        </div>
        <h3 className="text-xl font-bold mb-3 text-[#0A2540]">{title}</h3>
        <p className="text-slate-500 leading-relaxed font-light">{description}</p>
      </CardContent>
    </Card>
  );
}

function TestimonialCard({
  quote,
  name,
  role,
}: {
  quote: string;
  name: string;
  role: string;
}) {
  return (
    <div className="bg-white rounded-3xl p-8 shadow-[0_4px_20px_rgb(0,0,0,0.05)] hover:shadow-[0_10px_40px_rgb(0,0,0,0.08)] hover:-translate-y-1 transition-all duration-300">
      <div className="flex gap-1 mb-5">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star key={i} className="w-5 h-5 fill-[#F5A623] text-[#F5A623]" />
        ))}
      </div>
      <p className="text-slate-600 leading-relaxed mb-6 font-light italic">
        "{quote}"
      </p>
      <div>
        <p className="font-bold text-[#0A2540]">{name}</p>
        <p className="text-slate-400 text-sm">{role}</p>
      </div>
    </div>
  );
}
