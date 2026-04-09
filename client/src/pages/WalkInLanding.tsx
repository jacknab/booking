import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  ArrowRight, BarChart3, Users, DollarSign,
  Clock, Building2, UserCircle, 
  Smartphone, Star, ShieldCheck, MonitorSmartphone,
  Zap, ListOrdered, Receipt
} from "lucide-react";
import { motion } from "framer-motion";
import { useEffect } from "react";
import WalkInHeroVideo from "./components/WalkInHeroVideo";

export default function WalkInLanding() {
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
      className="min-h-screen bg-background text-foreground selection:bg-[#FBBF24]/20"
      style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
    >
      {/* Nav */}
      <nav className="fixed w-full z-50 bg-[#0D1117]/85 backdrop-blur-md border-b border-white/10 text-white">
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
                <Button className="bg-[#FBBF24] hover:bg-[#FBBF24]/90 text-[#0D1117] font-bold px-6 rounded-full">
                  Get Started
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-[#0D1117]">
        <div className="absolute inset-0 z-0">
          <WalkInHeroVideo />
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-[#0D1117]/30 via-[#0D1117]/10 to-[#0D1117]/70 z-10" />

        <div className="relative z-20 text-center max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 mt-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20 backdrop-blur-md mb-8"
          >
            <span className="flex h-2 w-2 rounded-full bg-[#FBBF24] animate-pulse" />
            <span className="text-sm font-medium text-white/90">✂️ Built for High-Volume Walk-In Haircut Shops</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-6xl md:text-7xl lg:text-8xl font-black text-white mb-6 tracking-tight leading-[1.1]"
          >
            Your Queue.<br />
            <span className="text-[#FBBF24]">Always Moving.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-lg md:text-xl text-white/80 mb-10 max-w-3xl mx-auto leading-relaxed font-light"
          >
            No appointments needed. Certxa gives walk-in shops a digital check-in
            queue, live wait times, instant POS checkout, and real-time staff
            management — so you can cut more hair and manage less chaos.
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
                className="h-14 px-8 text-lg rounded-full bg-[#FBBF24] hover:bg-[#FBBF24]/90 text-[#0D1117] font-bold shadow-[0_0_30px_rgba(251,191,36,0.30)] transition-all hover:scale-105"
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
      <div className="bg-[#111827] py-6 border-y border-white/10 relative z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <p className="text-white/80 font-medium text-lg flex items-center gap-3">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#FBBF24] opacity-75" />
                <span className="relative inline-flex rounded-full h-3 w-3 bg-[#FBBF24]" />
              </span>
              Trusted by 8,000+ walk-in haircut shops
            </p>
            <div className="flex flex-wrap justify-center gap-8 text-white/60 font-medium text-sm md:text-base">
              <div className="flex items-center gap-2"><span className="text-[#FBBF24] font-bold">✓</span> Great Clips Alternative</div>
              <div className="flex items-center gap-2"><span className="text-[#FBBF24] font-bold">✓</span> Sport Cuts Alternative</div>
              <div className="flex items-center gap-2"><span className="text-[#FBBF24] font-bold">✓</span> Supercuts Alternative</div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="bg-[#0D1117] py-20 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { value: "8,000+", label: "Walk-In Shops" },
              { value: "3.5M+", label: "Customers Served" },
              { value: "8 min", label: "Average Wait Time" },
              { value: "4.9★", label: "Average Rating" },
            ].map((stat) => (
              <div key={stat.label}>
                <p className="text-4xl md:text-5xl font-black text-[#FBBF24] mb-2">{stat.value}</p>
                <p className="text-white/60 font-medium">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* How the queue works — visual explainer */}
      <div className="py-24 bg-[#111827] text-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-1.5 rounded-full bg-[#FBBF24]/15 text-[#FBBF24] text-sm font-semibold mb-4">
              HOW IT WORKS
            </span>
            <h2 className="text-4xl md:text-5xl font-black mb-4 tracking-tight">
              Walk In. Check In. Walk Out.
            </h2>
            <p className="text-white/60 text-xl font-light">
              A frictionless flow from the door to the chair — no apps, no appointments, no paper sign-in sheets.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              {
                icon: "1",
                title: "Customer Walks In",
                desc: "They tap a tablet at the door or scan a QR code with their phone. No app download required.",
              },
              {
                icon: "2",
                title: "Joins the Digital Queue",
                desc: "They enter their name and preferred service. Live wait time is shown instantly.",
              },
              {
                icon: "3",
                title: "Gets a Text Alert",
                desc: "Certxa texts them when they're next up so they can wait anywhere — not in a plastic chair.",
              },
              {
                icon: "4",
                title: "Fast POS Checkout",
                desc: "Barber rings them up in seconds. Tip, payment, and receipt done before they leave the chair.",
              },
            ].map(({ icon, title, desc }) => (
              <div key={icon} className="flex flex-col items-center text-center gap-3">
                <div className="h-14 w-14 rounded-2xl bg-[#FBBF24]/15 border border-[#FBBF24]/20 flex items-center justify-center text-2xl font-black text-[#FBBF24]">
                  {icon}
                </div>
                <h3 className="text-lg font-bold text-white">{title}</h3>
                <p className="text-white/50 text-sm leading-relaxed font-light">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Features */}
      <div className="py-32 bg-slate-50 text-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <span className="inline-block px-4 py-1.5 rounded-full bg-[#FBBF24]/15 text-amber-700 text-sm font-semibold mb-4">
              BUILT FOR WALK-IN SHOPS
            </span>
            <h2 className="text-4xl md:text-5xl font-black mb-6 tracking-tight text-[#0D1117]">
              Everything a High-Volume Shop Needs
            </h2>
            <p className="text-slate-500 text-xl max-w-2xl mx-auto font-light">
              From the front door to final checkout — Certxa keeps your queue
              moving and your barbers cutting.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard
              icon={<ListOrdered className="w-6 h-6 text-amber-600" />}
              title="Digital Walk-In Queue"
              description="Replace your paper sign-in sheet with a smart digital queue. Customers check in on a lobby tablet or by scanning a QR code — no app download, no account needed."
            />
            <FeatureCard
              icon={<MonitorSmartphone className="w-6 h-6 text-amber-600" />}
              title="Live Wait Time Display"
              description="Show a real-time wait time board on a lobby TV or tablet. Customers see exactly how long the wait is before they decide to stay — reducing walkaways."
            />
            <FeatureCard
              icon={<Smartphone className="w-6 h-6 text-amber-600" />}
              title="SMS 'You're Next' Alerts"
              description="Text customers when they're one or two spots away so they can grab a coffee and come back. Cuts lobby congestion without losing their place in line."
            />
            <FeatureCard
              icon={<Receipt className="w-6 h-6 text-amber-600" />}
              title="Fast POS Checkout"
              description="Ring up haircuts and retail products in seconds. Built-in tip presets, split payment, discounts, and instant digital receipts — no separate POS hardware needed."
            />
            <FeatureCard
              icon={<UserCircle className="w-6 h-6 text-amber-600" />}
              title="Barber Assignment & Rotation"
              description="Assign customers to the next available barber automatically or let them choose. Round-robin rotation keeps earnings fair across your whole team."
            />
            <FeatureCard
              icon={<Clock className="w-6 h-6 text-amber-600" />}
              title="Service Time Tracking"
              description="Track how long each service takes per barber. Identify bottlenecks and optimise your flow to cut more customers per hour without rushing quality."
            />
            <FeatureCard
              icon={<Users className="w-6 h-6 text-amber-600" />}
              title="Walk-In Customer History"
              description="Even without appointments, build client profiles over time. Track visit frequency, preferred services, and past spend — know your regulars automatically."
            />
            <FeatureCard
              icon={<BarChart3 className="w-6 h-6 text-amber-600" />}
              title="Volume & Revenue Reports"
              description="See daily, weekly, and monthly cut counts, revenue per barber, and average ticket size. Spot your busiest hours and staff up accordingly."
            />
            <FeatureCard
              icon={<Zap className="w-6 h-6 text-amber-600" />}
              title="Rush Hour Management"
              description="Set maximum queue capacity per location. When the wait gets too long, auto-pause check-ins or display a 'closed for the day' message — no more 2-hour waits."
            />
            <FeatureCard
              icon={<DollarSign className="w-6 h-6 text-amber-600" />}
              title="Commission & Payout Tracking"
              description="Set per-barber commission rates and auto-calculate daily payouts. Generate clean payout reports without any end-of-week maths."
            />
            <FeatureCard
              icon={<Building2 className="w-6 h-6 text-amber-600" />}
              title="Multi-Location Management"
              description="Run a chain of walk-in shops from one account. Independent queues, staff rosters, and reporting per location — all under one login."
            />
            <FeatureCard
              icon={<ShieldCheck className="w-6 h-6 text-amber-600" />}
              title="Walk-In Shop Onboarding"
              description="Sign up as a walk-in haircut shop and get auto-configured services like men's cut, kids' cut, and fade — plus a live queue ready to use from day one."
            />
          </div>
        </div>
      </div>

      {/* Testimonials */}
      <div className="py-32 bg-[#0D1117]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-black mb-6 tracking-tight text-white">
              What Walk-In Shop Owners Are Saying
            </h2>
            <p className="text-white/50 text-xl max-w-2xl mx-auto font-light">
              Real feedback from real shop owners who ditched paper and got busy.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <TestimonialCard
              quote="We used to have a paper sheet and people would just walk if the wait looked long. Now there's a screen showing the live wait, they trust it and stay. Volume is up 30%."
              name="Darnell W."
              role="Owner, QuickCuts Express"
            />
            <TestimonialCard
              quote="The SMS alert feature is genius. Customers leave, grab food, and come back right when it's their turn. My lobby stays clear and people are happy when they sit down."
              name="Carlos M."
              role="Owner, Fast Lane Barbers"
            />
            <TestimonialCard
              quote="I have three locations and I can see the queue at all of them from my phone. If one spot is getting slammed I can redirect staff before it becomes a problem."
              name="Tanya K."
              role="Owner, Clip Co. (3 locations)"
            />
          </div>
        </div>
      </div>

      {/* Comparison Table */}
      <div className="py-32 bg-[#111827] text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-black mb-6 tracking-tight">
              Why Walk-In Shops Choose Certxa
            </h2>
            <p className="text-white/70 text-xl max-w-2xl mx-auto font-light">
              Built for volume. Not for salons that need appointment books.
            </p>
          </div>

          <div className="rounded-3xl overflow-hidden border border-white/10">
            <div className="grid grid-cols-3 bg-[#0D1117] text-sm font-bold text-white/60 uppercase tracking-wider">
              <div className="p-5 border-b border-white/10">Feature</div>
              <div className="p-5 border-b border-l border-white/10 text-[#FBBF24] text-center">Certxa</div>
              <div className="p-5 border-b border-l border-white/10 text-center">Paper / Basic POS</div>
            </div>
            {[
              ["Digital walk-in queue", true, false],
              ["Live wait time display", true, false],
              ["SMS 'you're next' alerts", true, false],
              ["Barber round-robin rotation", true, false],
              ["Rush hour queue cap", true, false],
              ["Customer visit history", true, false],
              ["Per-barber revenue reports", true, false],
              ["Multi-location dashboard", true, false],
              ["60-day free trial", true, false],
            ].map(([feature, certxa, others]) => (
              <div
                key={String(feature)}
                className="grid grid-cols-3 border-b border-white/10 hover:bg-white/5 transition-colors"
              >
                <div className="p-5 text-white/80 font-medium">{feature}</div>
                <div className="p-5 border-l border-white/10 text-center">
                  {certxa ? <span className="text-[#FBBF24] font-bold text-lg">✓</span> : <span className="text-white/20">—</span>}
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
      <div className="py-32 relative overflow-hidden bg-gradient-to-br from-[#0D1117] to-[#FBBF24]/10">
        <div className="absolute inset-0 bg-[#060A10]/70 mix-blend-overlay" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-3xl h-full bg-[#FBBF24]/8 blur-[100px] rounded-full" />

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="flex justify-center mb-6">
            <span className="text-6xl">✂️</span>
          </div>
          <h2 className="text-5xl md:text-6xl font-black text-white mb-6 tracking-tight">
            Ready to Cut the Wait?
          </h2>
          <p className="text-white/80 text-xl mb-4 max-w-2xl mx-auto font-light">
            Start your 60-day free trial today. No credit card required. Cancel any time.
          </p>
          <p className="text-white/50 text-base mb-12 max-w-xl mx-auto">
            Join thousands of walk-in shops already using Certxa to move faster and serve more customers.
          </p>
          <Link to="/auth?mode=register">
            <Button
              size="lg"
              className="h-16 px-10 text-xl rounded-full bg-[#FBBF24] hover:bg-[#FBBF24]/90 text-[#0D1117] font-bold shadow-[0_0_40px_rgba(251,191,36,0.30)] transition-all hover:scale-105"
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

      <footer className="bg-[#060A10] py-12 border-t border-white/10 relative z-30">
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
        <div className="mb-6 p-4 bg-gradient-to-br from-amber-100 to-amber-50 rounded-2xl w-fit group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300">
          {icon}
        </div>
        <h3 className="text-xl font-bold mb-3 text-[#0D1117]">{title}</h3>
        <p className="text-slate-500 leading-relaxed font-light">{description}</p>
      </CardContent>
    </Card>
  );
}

function TestimonialCard({ quote, name, role }: { quote: string; name: string; role: string }) {
  return (
    <div className="bg-white/5 border border-white/10 rounded-3xl p-8 hover:border-[#FBBF24]/30 hover:-translate-y-1 transition-all duration-300">
      <div className="flex gap-1 mb-5">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star key={i} className="w-5 h-5 fill-[#FBBF24] text-[#FBBF24]" />
        ))}
      </div>
      <p className="text-white/70 leading-relaxed mb-6 font-light italic">"{quote}"</p>
      <div>
        <p className="font-bold text-white">{name}</p>
        <p className="text-white/40 text-sm">{role}</p>
      </div>
    </div>
  );
}
