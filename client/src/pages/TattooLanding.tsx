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
import TattooHeroVideo from "./components/TattooHeroVideo";

export default function TattooLanding() {
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
      className="min-h-screen bg-background text-foreground selection:bg-[#E63946]/20"
      style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
    >
      {/* Nav */}
      <nav className="fixed w-full z-50 bg-[#0B0A0E]/85 backdrop-blur-md border-b border-white/10 text-white">
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
                <Button className="bg-[#E63946] hover:bg-[#E63946]/90 text-white font-bold px-6 rounded-full">
                  Get Started
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-[#0B0A0E]">
        <div className="absolute inset-0 z-0">
          <TattooHeroVideo />
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-[#0B0A0E]/30 via-[#0B0A0E]/10 to-[#0B0A0E]/70 z-10" />

        <div className="relative z-20 text-center max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 mt-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20 backdrop-blur-md mb-8"
          >
            <span className="flex h-2 w-2 rounded-full bg-[#E63946] animate-pulse" />
            <span className="text-sm font-medium text-white/90">🎨 Built Specifically for Tattoo Artists</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-6xl md:text-7xl lg:text-8xl font-black text-white mb-6 tracking-tight leading-[1.1]"
          >
            Your Art.<br />
            <span className="text-[#E63946]">Always Booked.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-lg md:text-xl text-white/80 mb-10 max-w-3xl mx-auto leading-relaxed font-light"
          >
            Certxa handles client inquiries, deposits, consultations, and appointment
            scheduling — so you can stay in your creative zone and keep the needle moving.
            Trusted by 5,000+ tattoo artists worldwide.
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
                className="h-14 px-8 text-lg rounded-full bg-[#E63946] hover:bg-[#E63946]/90 text-white font-bold shadow-[0_0_30px_rgba(230,57,70,0.35)] transition-all hover:scale-105"
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
      <div className="bg-[#16060A] py-6 border-y border-white/10 relative z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <p className="text-white/80 font-medium text-lg flex items-center gap-3">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#E63946] opacity-75" />
                <span className="relative inline-flex rounded-full h-3 w-3 bg-[#E63946]" />
              </span>
              Trusted by 5,000+ tattoo artists worldwide
            </p>
            <div className="flex flex-wrap justify-center gap-8 text-white/60 font-medium text-sm md:text-base">
              <div className="flex items-center gap-2"><span className="text-[#E63946] font-bold">✓</span> Booksy Alternative</div>
              <div className="flex items-center gap-2"><span className="text-[#E63946] font-bold">✓</span> Vagaro Alternative</div>
              <div className="flex items-center gap-2"><span className="text-[#E63946] font-bold">✓</span> Square Alternative</div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="bg-[#0B0A0E] py-20 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { value: "5,000+", label: "Tattoo Artists" },
              { value: "1.8M+", label: "Sessions Booked" },
              { value: "94%", label: "Client Return Rate" },
              { value: "4.9★", label: "Average Rating" },
            ].map((stat) => (
              <div key={stat.label}>
                <p className="text-4xl md:text-5xl font-black text-[#E63946] mb-2">{stat.value}</p>
                <p className="text-white/60 font-medium">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Features */}
      <div className="py-32 bg-zinc-950 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <span className="inline-block px-4 py-1.5 rounded-full bg-[#E63946]/15 text-[#E63946] text-sm font-semibold mb-4">
              BUILT FOR TATTOO ARTISTS
            </span>
            <h2 className="text-4xl md:text-5xl font-black mb-6 tracking-tight text-white">
              Everything a Tattoo Studio Needs
            </h2>
            <p className="text-white/50 text-xl max-w-2xl mx-auto font-light">
              From flash bookings to custom pieces — Certxa keeps your chair full
              and your admin minimal.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard
              icon={<Calendar className="w-6 h-6 text-[#E63946]" />}
              title="Online Booking & Consultations"
              description="Clients request sessions 24/7 from your branded page. Collect style references, placement photos, and sizing notes upfront — no back-and-forth DMs needed."
            />
            <FeatureCard
              icon={<DollarSign className="w-6 h-6 text-[#E63946]" />}
              title="Deposit Collection"
              description="Require a deposit at booking to eliminate no-shows. Set custom deposit amounts per session type and automatically apply them to the final bill at checkout."
            />
            <FeatureCard
              icon={<Palette className="w-6 h-6 text-[#E63946]" />}
              title="Custom & Flash Booking Flows"
              description="Separate booking flows for custom tattoos and available flash pieces. Let clients browse your flash gallery and book directly with no consultation needed."
            />
            <FeatureCard
              icon={<Users className="w-6 h-6 text-[#E63946]" />}
              title="Client Profiles & Tattoo History"
              description="Every client gets a profile with their full tattoo history, reference photos, skin notes, and aftercare records. Always know what you've done and what's coming next."
            />
            <FeatureCard
              icon={<UserCircle className="w-6 h-6 text-[#E63946]" />}
              title="Multi-Artist Studio Scheduling"
              description="Run a collective or guest-artist studio with colour-coded calendars per artist. Set individual availability, block guest spots, and manage walk-in flash days."
            />
            <FeatureCard
              icon={<Smartphone className="w-6 h-6 text-[#E63946]" />}
              title="Automated Client Reminders"
              description="Reduce ghosting with automated SMS reminders before every session. Include aftercare instructions automatically after each appointment."
            />
            <FeatureCard
              icon={<BarChart3 className="w-6 h-6 text-[#E63946]" />}
              title="Revenue & Commission Tracking"
              description="Track earnings per artist, per session type, and per time period. Generate payout reports for guest artists with a single click."
            />
            <FeatureCard
              icon={<Gift className="w-6 h-6 text-[#E63946]" />}
              title="Gift Cards & Vouchers"
              description="Sell digital tattoo gift cards directly from your booking page. Perfect for holiday rushes and bringing in new clients through word of mouth."
            />
            <FeatureCard
              icon={<Clock className="w-6 h-6 text-[#E63946]" />}
              title="Session Length Flexibility"
              description="Book half-day and full-day sessions for large pieces. Split long projects across multiple appointments and auto-link them to one client record."
            />
            <FeatureCard
              icon={<Sparkles className="w-6 h-6 text-[#E63946]" />}
              title="Waitlist Management"
              description="Capture waitlist sign-ups when you're fully booked. Auto-notify the next person when a slot opens up — filling cancellations instantly."
            />
            <FeatureCard
              icon={<Building2 className="w-6 h-6 text-[#E63946]" />}
              title="Multi-Location Support"
              description="Manage multiple studio locations from one account. Independent artist rosters, hours, and reporting per location — all under one login."
            />
            <FeatureCard
              icon={<ShieldCheck className="w-6 h-6 text-[#E63946]" />}
              title="Tattoo Studio Onboarding"
              description="Sign up as a tattoo studio and get auto-created services like custom tattoo, touch-up, flash session, and cover-up — ready to take bookings from day one."
            />
          </div>
        </div>
      </div>

      {/* How It Works */}
      <div className="py-32 bg-[#0B0A0E] text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#E63946]/6 blur-[140px] rounded-full pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-[#E63946]/4 blur-[140px] rounded-full pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-20">
            <span className="inline-block px-4 py-1.5 rounded-full bg-[#E63946]/15 text-[#E63946] text-sm font-semibold mb-4">
              SIMPLE SETUP
            </span>
            <h2 className="text-4xl md:text-5xl font-black mb-6 tracking-tight">
              Up and Running in Minutes
            </h2>
            <p className="text-white/70 text-xl max-w-2xl mx-auto font-light">
              No tech skills needed. Get your studio bookable online today.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {[
              {
                step: "01",
                title: "Create Your Studio Profile",
                desc: "Add your studio name, artist roster, and services. Our tattoo studio onboarding auto-fills sessions like custom tattoo, flash, touch-up, and cover-up — ready to take bookings in minutes.",
              },
              {
                step: "02",
                title: "Share Your Booking Link",
                desc: "Get your branded booking page instantly. Share it on Instagram, TikTok, or your portfolio site. Clients choose their artist, style, and slot — all without sliding into your DMs.",
              },
              {
                step: "03",
                title: "Manage Your Whole Studio",
                desc: "View the daily schedule, collect deposits, check in walk-ins for flash, process payments, and track artist earnings — all from one dashboard on any device.",
              },
            ].map(({ step, title, desc }) => (
              <div key={step} className="flex flex-col items-start gap-4">
                <span className="text-6xl font-black text-[#E63946]/20">{step}</span>
                <h3 className="text-2xl font-bold text-white">{title}</h3>
                <p className="text-white/60 font-light leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Testimonials */}
      <div className="py-32 bg-zinc-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-black mb-6 tracking-tight text-white">
              What Tattoo Artists Are Saying
            </h2>
            <p className="text-white/50 text-xl max-w-2xl mx-auto font-light">
              Real feedback from real artists and studio owners.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <TestimonialCard
              quote="The deposit system alone paid for the subscription in month one. No-shows went from maybe 3 a week to basically zero. It's changed how I run my books completely."
              name="Jake M."
              role="Owner, Iron & Ink Tattoo"
            />
            <TestimonialCard
              quote="I used to spend two hours a day in Instagram DMs managing requests. Now clients book, upload their reference pics, and I just confirm. I got my life back."
              name="Sofia R."
              role="Tattoo Artist, Blackwork Studio"
            />
            <TestimonialCard
              quote="I have four guest artists rotating through and managing their schedules used to be a nightmare. Certxa keeps everyone's availability clean and clients can book whoever's in."
              name="Marcus T."
              role="Owner, The Collective Tattoo"
            />
          </div>
        </div>
      </div>

      {/* Comparison Table */}
      <div className="py-32 bg-[#0B0A0E] text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-black mb-6 tracking-tight">
              Why Tattoo Artists Choose Certxa
            </h2>
            <p className="text-white/70 text-xl max-w-2xl mx-auto font-light">
              More control. Less admin. Built for how tattoo studios actually work.
            </p>
          </div>

          <div className="rounded-3xl overflow-hidden border border-white/10">
            <div className="grid grid-cols-3 bg-zinc-900 text-sm font-bold text-white/60 uppercase tracking-wider">
              <div className="p-5 border-b border-white/10">Feature</div>
              <div className="p-5 border-b border-l border-white/10 text-[#E63946] text-center">Certxa</div>
              <div className="p-5 border-b border-l border-white/10 text-center">Others</div>
            </div>
            {[
              ["Deposit collection at booking", true, false],
              ["Custom & flash booking flows", true, false],
              ["Client tattoo history & photos", true, false],
              ["Waitlist auto-notifications", true, false],
              ["Guest artist scheduling", true, false],
              ["SMS reminders included", true, false],
              ["Per-artist commission reports", true, false],
              ["60-day free trial", true, false],
            ].map(([feature, certxa, others]) => (
              <div
                key={String(feature)}
                className="grid grid-cols-3 border-b border-white/10 hover:bg-white/5 transition-colors"
              >
                <div className="p-5 text-white/80 font-medium">{feature}</div>
                <div className="p-5 border-l border-white/10 text-center">
                  {certxa ? <span className="text-[#E63946] font-bold text-lg">✓</span> : <span className="text-white/20">—</span>}
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
      <div className="py-32 relative overflow-hidden bg-gradient-to-br from-[#0B0A0E] to-[#E63946]/10">
        <div className="absolute inset-0 bg-[#060408]/70 mix-blend-overlay" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-3xl h-full bg-[#E63946]/10 blur-[100px] rounded-full" />

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="flex justify-center mb-6">
            <span className="text-6xl">🎨</span>
          </div>
          <h2 className="text-5xl md:text-6xl font-black text-white mb-6 tracking-tight">
            Ready to Fill Your Calendar?
          </h2>
          <p className="text-white/80 text-xl mb-4 max-w-2xl mx-auto font-light">
            Start your 60-day free trial today. No credit card required. Cancel any time.
          </p>
          <p className="text-white/50 text-base mb-12 max-w-xl mx-auto">
            Join thousands of tattoo artists already using Certxa to grow their studio.
          </p>
          <Link to="/auth?mode=register">
            <Button
              size="lg"
              className="h-16 px-10 text-xl rounded-full bg-[#E63946] hover:bg-[#E63946]/90 text-white font-bold shadow-[0_0_40px_rgba(230,57,70,0.35)] transition-all hover:scale-105"
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

      <footer className="bg-[#060408] py-12 border-t border-white/10 relative z-30">
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
    <Card className="border border-white/8 shadow-none hover:border-[#E63946]/30 hover:-translate-y-1 transition-all duration-300 bg-white/3 rounded-3xl overflow-hidden group">
      <CardContent className="p-8">
        <div className="mb-6 p-4 bg-gradient-to-br from-[#E63946]/15 to-[#E63946]/5 rounded-2xl w-fit group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300">
          {icon}
        </div>
        <h3 className="text-xl font-bold mb-3 text-white">{title}</h3>
        <p className="text-white/50 leading-relaxed font-light">{description}</p>
      </CardContent>
    </Card>
  );
}

function TestimonialCard({ quote, name, role }: { quote: string; name: string; role: string }) {
  return (
    <div className="bg-white/5 border border-white/10 rounded-3xl p-8 hover:border-[#E63946]/30 hover:-translate-y-1 transition-all duration-300">
      <div className="flex gap-1 mb-5">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star key={i} className="w-5 h-5 fill-[#E63946] text-[#E63946]" />
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
