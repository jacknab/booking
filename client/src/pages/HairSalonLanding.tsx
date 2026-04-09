import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  ArrowRight, Calendar, BarChart3, Scissors, Users, DollarSign,
  Banknote, Clock, Receipt, Building2, UserCircle, 
  Smartphone, Star, Zap, ShieldCheck, Palette, Repeat
} from "lucide-react";
import { motion } from "framer-motion";
import { useEffect } from "react";
import HairSalonHeroVideo from "./components/HairSalonHeroVideo";
import BusinessTypeMenu from "./components/BusinessTypeMenu";

export default function HairSalonLanding() {
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
        <div className="absolute inset-0 z-0">
          <HairSalonHeroVideo />
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
              💇‍♀️ Built Specifically for Hair Salons
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-6xl md:text-7xl lg:text-8xl font-black text-white mb-6 tracking-tight leading-[1.1]"
          >
            Your Salon.
            <br />
            <span className="text-[#00D4AA]">Always Booked.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-lg md:text-xl text-white/80 mb-10 max-w-3xl mx-auto leading-relaxed font-light"
          >
            Certxa handles online bookings, stylist calendars, color service scheduling, and checkout — so you can focus on the hair, not the hustle. Trusted by 10,000+ salons.
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
              Trusted by 10,000+ hair salons worldwide
            </p>
            <div className="flex flex-wrap justify-center gap-8 text-white/60 font-medium text-sm md:text-base">
              <div className="flex items-center gap-2">
                <span className="text-[#00D4AA] font-bold">✓</span> Vagaro Alternative
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[#00D4AA] font-bold">✓</span> Booksy Alternative
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[#00D4AA] font-bold">✓</span> StyleSeat Alternative
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
              { value: "10,000+", label: "Hair Salons" },
              { value: "3.1M+", label: "Appointments Booked" },
              { value: "97%", label: "Client Retention Rate" },
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
              BUILT FOR HAIR SALONS
            </span>
            <h2 className="text-4xl md:text-5xl font-black mb-6 tracking-tight text-[#0A2540]">
              Everything Your Salon Needs
            </h2>
            <p className="text-slate-500 text-xl max-w-2xl mx-auto font-light">
              From the reception desk to the styling chair — Certxa streamlines every part of running your salon.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard
              icon={<Calendar className="w-6 h-6 text-[#00D4AA]" />}
              title="Online Booking for Stylists"
              description="Clients book their preferred stylist 24/7 from your branded booking page. Block out time for color processing automatically so no slot gets double-booked."
            />
            <FeatureCard
              icon={<Palette className="w-6 h-6 text-[#00D4AA]" />}
              title="Color Service Scheduling"
              description="Add buffer time for color processing, highlights, and treatments. Certxa automatically manages processing gaps so stylists stay productive while clients wait."
            />
            <FeatureCard
              icon={<UserCircle className="w-6 h-6 text-[#00D4AA]" />}
              title="Stylist Calendars"
              description="Each stylist gets their own calendar view. See who's free, who's fully booked, and move appointments between stylists with a simple drag and drop."
            />
            <FeatureCard
              icon={<Repeat className="w-6 h-6 text-[#00D4AA]" />}
              title="Recurring Appointments"
              description="Let clients lock in their regular trim every 4 or 6 weeks with one click. Recurring bookings keep your chairs full and clients loyal."
            />
            <FeatureCard
              icon={<Users className="w-6 h-6 text-[#00D4AA]" />}
              title="Client History & Notes"
              description="Store color formulas, cut preferences, allergies, and past service history per client. Never ask twice what shade they used last time."
            />
            <FeatureCard
              icon={<DollarSign className="w-6 h-6 text-[#00D4AA]" />}
              title="Fast POS Checkout"
              description="Ring up services and retail products in one transaction. Accept cash, card, and split payments with tip presets and automatic receipt generation."
            />
            <FeatureCard
              icon={<BarChart3 className="w-6 h-6 text-[#00D4AA]" />}
              title="Per-Stylist Commission Tracking"
              description="Set individual commission rates per stylist and service type. Generate accurate payout reports by date range without touching a spreadsheet."
            />
            <FeatureCard
              icon={<Smartphone className="w-6 h-6 text-[#00D4AA]" />}
              title="SMS & Email Reminders"
              description="Automated reminders reduce no-shows by up to 60%. Follow up after each visit with a review request to build your Google rating."
            />
            <FeatureCard
              icon={<Zap className="w-6 h-6 text-[#00D4AA]" />}
              title="Walk-In & Queue Management"
              description="Accept walk-ins alongside bookings without chaos. Clients join a digital queue from their phone and get notified when their stylist is ready."
            />
            <FeatureCard
              icon={<Receipt className="w-6 h-6 text-[#00D4AA]" />}
              title="Thermal Receipt Printing"
              description="Print 80mm receipts directly from checkout with itemized services, products, tip, and payment method. Works with standard thermal printers."
            />
            <FeatureCard
              icon={<Building2 className="w-6 h-6 text-[#00D4AA]" />}
              title="Multi-Location Support"
              description="Manage multiple salon locations from one account. Independent hours, staff, and reporting per location — all visible from a single dashboard."
            />
            <FeatureCard
              icon={<Clock className="w-6 h-6 text-[#00D4AA]" />}
              title="Appointment Status Tracking"
              description="Track each appointment from pending to confirmed, arrived, in-service, and completed. Keep front desk and stylists perfectly in sync."
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
            <h2 className="text-4xl md:text-5xl font-black mb-6 tracking-tight">
              Up and Running in Minutes
            </h2>
            <p className="text-white/70 text-xl max-w-2xl mx-auto font-light">
              No tech skills needed. If you can use a phone, you can set up Certxa.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {[
              {
                step: "01",
                title: "Build Your Salon Profile",
                desc: "Add your salon name, hours, stylist roster, and service menu. Our hair salon onboarding auto-fills common services like cuts, color, highlights, blowouts, and treatments.",
              },
              {
                step: "02",
                title: "Share Your Booking Link",
                desc: "Get your branded booking page instantly. Share the link in your Instagram bio, Google Business profile, or anywhere clients find you — they can book 24/7.",
              },
              {
                step: "03",
                title: "Manage Everything in One Place",
                desc: "View your daily stylist calendars, manage walk-ins, process checkout, and track commissions — all from one clean dashboard on any device.",
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

      {/* Testimonials Section */}
      <div className="py-32 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-black mb-6 tracking-tight text-[#0A2540]">
              What Salon Owners Are Saying
            </h2>
            <p className="text-slate-500 text-xl max-w-2xl mx-auto font-light">
              Real feedback from real salon owners and stylists.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <TestimonialCard
              quote="Certxa's color service scheduling is the only tool that actually understands processing time. My stylists can take another client while color develops — game changer."
              name="Brittany M."
              role="Owner, Luxe Hair Studio"
            />
            <TestimonialCard
              quote="No-shows dropped by 55% once we turned on SMS reminders. It pays for itself every single month without me lifting a finger."
              name="Jade T."
              role="Stylist, Glow & Go Salon"
            />
            <TestimonialCard
              quote="I run 4 locations and finally have one place to see everything. Payroll used to take me a whole Sunday. Now it takes 10 minutes."
              name="Sandra R."
              role="Owner, Strand Collective"
            />
          </div>
        </div>
      </div>

      {/* Compare Section */}
      <div className="py-32 bg-[#060E1A] text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-black mb-6 tracking-tight">
              Why Salons Choose Certxa
            </h2>
            <p className="text-white/70 text-xl max-w-2xl mx-auto font-light">
              Certxa is built for how hair salons actually operate — not adapted from generic booking software.
            </p>
          </div>

          <div className="rounded-3xl overflow-hidden border border-white/10">
            <div className="grid grid-cols-3 bg-[#0A2540] text-sm font-bold text-white/60 uppercase tracking-wider">
              <div className="p-5 border-b border-white/10">Feature</div>
              <div className="p-5 border-b border-l border-white/10 text-[#00D4AA] text-center">Certxa</div>
              <div className="p-5 border-b border-l border-white/10 text-center">Others</div>
            </div>
            {[
              ["Color service buffer time", true, false],
              ["Per-stylist commission tracking", true, false],
              ["Client color formula notes", true, false],
              ["Walk-in queue management", true, false],
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
          <h2 className="text-5xl md:text-6xl font-black text-white mb-6 tracking-tight">
            Ready to Fill Every Chair?
          </h2>
          <p className="text-white/80 text-xl mb-4 max-w-2xl mx-auto font-light">
            Start your 60-day free trial today. No credit card required. Cancel any time.
          </p>
          <p className="text-white/50 text-base mb-12 max-w-xl mx-auto">
            Join thousands of hair salons already using Certxa to grow their business.
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
