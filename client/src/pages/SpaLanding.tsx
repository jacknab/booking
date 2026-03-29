import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  ArrowRight, Calendar, BarChart3, Users, DollarSign,
  Clock, Building2, UserCircle, PlayCircle,
  Smartphone, Star, ShieldCheck, Gift, Heart, Sparkles
} from "lucide-react";
import { motion } from "framer-motion";
import { useEffect } from "react";
import SpaHeroVideo from "./components/SpaHeroVideo";

export default function SpaLanding() {
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
      <nav className="fixed w-full z-50 bg-[#0D1F1A]/80 backdrop-blur-md border-b border-white/10 text-white">
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
              <Link to="/auth">
                <Button className="bg-[#00D4AA] hover:bg-[#00D4AA]/90 text-[#0D1F1A] font-bold px-6 rounded-full">
                  Get Started
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-[#0D1F1A]">
        <div className="absolute inset-0 z-0">
          <SpaHeroVideo />
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-[#0D1F1A]/30 via-[#0D1F1A]/10 to-[#0D1F1A]/70 z-10" />

        <div className="relative z-20 text-center max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 mt-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20 backdrop-blur-md mb-8"
          >
            <span className="flex h-2 w-2 rounded-full bg-[#00D4AA] animate-pulse" />
            <span className="text-sm font-medium text-white/90">🧖 Built Specifically for Day Spas & Wellness Centers</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-6xl md:text-7xl lg:text-8xl font-black text-white mb-6 tracking-tight leading-[1.1]"
          >
            Your Guests.<br />
            <span className="text-[#00D4AA]">Deeply Relaxed.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-lg md:text-xl text-white/80 mb-10 max-w-3xl mx-auto leading-relaxed font-light"
          >
            Certxa handles bookings, memberships, gift cards, and checkout so you
            can focus on delivering the ultimate spa experience. Trusted by
            10,000+ wellness businesses.
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
                className="h-14 px-8 text-lg rounded-full bg-[#00D4AA] hover:bg-[#00D4AA]/90 text-[#0D1F1A] font-bold shadow-[0_0_30px_rgba(0,212,170,0.3)] transition-all hover:scale-105"
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
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00D4AA] opacity-75" />
                <span className="relative inline-flex rounded-full h-3 w-3 bg-[#00D4AA]" />
              </span>
              Trusted by 10,000+ spas & wellness centers worldwide
            </p>
            <div className="flex flex-wrap justify-center gap-8 text-white/60 font-medium text-sm md:text-base">
              <div className="flex items-center gap-2"><span className="text-[#00D4AA] font-bold">✓</span> Mindbody Alternative</div>
              <div className="flex items-center gap-2"><span className="text-[#00D4AA] font-bold">✓</span> Vagaro Alternative</div>
              <div className="flex items-center gap-2"><span className="text-[#00D4AA] font-bold">✓</span> Booker Alternative</div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="bg-[#0D1F1A] py-20 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { value: "10,000+", label: "Spas & Wellness Centers" },
              { value: "3.1M+", label: "Treatments Booked" },
              { value: "98%", label: "Client Retention Rate" },
              { value: "4.9★", label: "Average Rating" },
            ].map((stat) => (
              <div key={stat.label}>
                <p className="text-4xl md:text-5xl font-black text-[#00D4AA] mb-2">{stat.value}</p>
                <p className="text-white/60 font-medium">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Features */}
      <div className="py-32 bg-stone-50 text-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <span className="inline-block px-4 py-1.5 rounded-full bg-[#00D4AA]/10 text-[#00876a] text-sm font-semibold mb-4">
              BUILT FOR SPAS
            </span>
            <h2 className="text-4xl md:text-5xl font-black mb-6 tracking-tight text-[#0A2540]">
              Everything a Spa Needs
            </h2>
            <p className="text-slate-500 text-xl max-w-2xl mx-auto font-light">
              From the reception desk to the treatment room — Certxa streamlines
              every part of running your spa.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard
              icon={<Calendar className="w-6 h-6 text-[#00D4AA]" />}
              title="Online Booking & Scheduling"
              description="Let clients book massages, facials, body wraps, and packages 24/7 from your branded booking page. Send automatic confirmation and reminder texts."
            />
            <FeatureCard
              icon={<Heart className="w-6 h-6 text-[#00D4AA]" />}
              title="Membership Management"
              description="Offer monthly membership plans with included treatments and discounts. Track member status, billing cycles, and usage all in one place."
            />
            <FeatureCard
              icon={<Gift className="w-6 h-6 text-[#00D4AA]" />}
              title="Gift Cards & Vouchers"
              description="Sell digital and physical gift cards directly from your booking page. Clients redeem them at checkout — no manual tracking needed."
            />
            <FeatureCard
              icon={<UserCircle className="w-6 h-6 text-[#00D4AA]" />}
              title="Therapist Scheduling"
              description="Manage therapist availability, break times, and treatment room assignments. Color-coded calendars make daily scheduling effortless."
            />
            <FeatureCard
              icon={<DollarSign className="w-6 h-6 text-[#00D4AA]" />}
              title="POS & Package Checkout"
              description="Sell treatments, bundles, retail products, and gift cards in one transaction. Tip presets, discounts, and split payments all built in."
            />
            <FeatureCard
              icon={<BarChart3 className="w-6 h-6 text-[#00D4AA]" />}
              title="Commission & Gratuity Reports"
              description="Set per-therapist commission rates and track gratuities. Generate detailed payout reports by date range with one click."
            />
            <FeatureCard
              icon={<Users className="w-6 h-6 text-[#00D4AA]" />}
              title="Client Profiles & History"
              description="Every guest gets a profile with treatment history, intake notes, allergies, and preferences so every visit feels personal."
            />
            <FeatureCard
              icon={<Smartphone className="w-6 h-6 text-[#00D4AA]" />}
              title="Automated SMS & Email"
              description="Reduce no-shows with pre-appointment reminders and post-visit review requests — all sent automatically."
            />
            <FeatureCard
              icon={<Sparkles className="w-6 h-6 text-[#00D4AA]" />}
              title="Service Menu & Add-Ons"
              description="Build a beautiful service catalog with treatment categories, durations, and upsell add-ons like aromatherapy or hot stone upgrades."
            />
            <FeatureCard
              icon={<Clock className="w-6 h-6 text-[#00D4AA]" />}
              title="Treatment Room Management"
              description="Assign treatments to specific rooms and prevent double-booking. Add setup/turnover buffers between appointments automatically."
            />
            <FeatureCard
              icon={<Building2 className="w-6 h-6 text-[#00D4AA]" />}
              title="Multi-Location Support"
              description="Manage multiple spa locations from one account with independent staff, hours, and reporting per location."
            />
            <FeatureCard
              icon={<ShieldCheck className="w-6 h-6 text-[#00D4AA]" />}
              title="Business-Type Onboarding"
              description="Choose 'Spa' on signup and get auto-created services, categories, and add-ons — massages, facials, body treatments, and more."
            />
          </div>
        </div>
      </div>

      {/* How It Works */}
      <div className="py-32 bg-[#0A2540] text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#00D4AA]/8 blur-[140px] rounded-full pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-[#00D4AA]/5 blur-[140px] rounded-full pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-20">
            <span className="inline-block px-4 py-1.5 rounded-full bg-[#00D4AA]/10 text-[#00D4AA] text-sm font-semibold mb-4">
              SIMPLE SETUP
            </span>
            <h2 className="text-4xl md:text-5xl font-black mb-6 tracking-tight">
              Up and Running in Minutes
            </h2>
            <p className="text-white/70 text-xl max-w-2xl mx-auto font-light">
              No tech experience needed. Set up your spa in the time it takes to brew a cup of tea.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {[
              {
                step: "01",
                title: "Create Your Spa Profile",
                desc: "Add your spa name, hours, therapist list, and treatment menu. Our spa onboarding auto-fills common services like Swedish massage, deep tissue, and facial treatments.",
              },
              {
                step: "02",
                title: "Share Your Booking Link",
                desc: "Get your own branded booking page instantly. Share it on Instagram, your website, or Google Business — clients can book and pay 24/7.",
              },
              {
                step: "03",
                title: "Manage Your Entire Spa",
                desc: "View your daily schedule, manage memberships, process payments, and track therapist commissions — all from one beautiful dashboard.",
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
      <div className="py-32 bg-stone-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-black mb-6 tracking-tight text-[#0A2540]">
              What Spa Owners Are Saying
            </h2>
            <p className="text-slate-500 text-xl max-w-2xl mx-auto font-light">
              Real feedback from real spa owners.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <TestimonialCard
              quote="Certxa replaced Mindbody and saved us $400 a month. Our therapists love how easy the calendar is to use, and clients love booking online."
              name="Sophia R."
              role="Owner, Serenity Day Spa"
            />
            <TestimonialCard
              quote="The membership feature is a game changer. We now have 80 active monthly members and the recurring revenue has completely transformed our business."
              name="Amanda K."
              role="Director, The Lotus Wellness Spa"
            />
            <TestimonialCard
              quote="Gift card sales went up 40% after we switched. Clients can buy them directly from our booking page — no more paper vouchers or manual tracking."
              name="Jessica M."
              role="Owner, Tranquil Touch Spa"
            />
          </div>
        </div>
      </div>

      {/* Comparison Table */}
      <div className="py-32 bg-[#0D1F1A] text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-black mb-6 tracking-tight">
              Why Spas Choose Certxa
            </h2>
            <p className="text-white/70 text-xl max-w-2xl mx-auto font-light">
              All the power of Mindbody at a fraction of the price.
            </p>
          </div>

          <div className="rounded-3xl overflow-hidden border border-white/10">
            <div className="grid grid-cols-3 bg-[#0A2540] text-sm font-bold text-white/60 uppercase tracking-wider">
              <div className="p-5 border-b border-white/10">Feature</div>
              <div className="p-5 border-b border-l border-white/10 text-[#00D4AA] text-center">Certxa</div>
              <div className="p-5 border-b border-l border-white/10 text-center">Others</div>
            </div>
            {[
              ["Membership management", true, false],
              ["Gift card sales", true, false],
              ["Treatment room blocking", true, false],
              ["Intake notes on client profiles", true, false],
              ["SMS reminders included", true, false],
              ["Per-therapist commission tracking", true, false],
              ["Multi-location support", true, true],
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

      {/* CTA */}
      <div className="py-32 relative overflow-hidden bg-gradient-to-br from-[#0A2540] to-[#00D4AA]/20">
        <div className="absolute inset-0 bg-[#060E1A]/80 mix-blend-overlay" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-3xl h-full bg-[#00D4AA]/10 blur-[100px] rounded-full" />

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="flex justify-center mb-6">
            <ShieldCheck className="w-14 h-14 text-[#00D4AA]" />
          </div>
          <h2 className="text-5xl md:text-6xl font-black text-white mb-6 tracking-tight">
            Ready to Elevate Your Spa?
          </h2>
          <p className="text-white/80 text-xl mb-4 max-w-2xl mx-auto font-light">
            Start your 60-day free trial today. No credit card required. Cancel any time.
          </p>
          <p className="text-white/50 text-base mb-12 max-w-xl mx-auto">
            Join thousands of spa owners already using Certxa to grow their business.
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
        <div className="mb-6 p-4 bg-gradient-to-br from-[#00D4AA]/20 to-[#00D4AA]/5 rounded-2xl w-fit group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300">
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
          <Star key={i} className="w-5 h-5 fill-[#F5A623] text-[#F5A623]" />
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
