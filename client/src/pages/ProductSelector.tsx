import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  ArrowRight, Calendar, Users, Wrench,
  CheckCircle2, Smartphone, Star, Clock,
  MapPin, CreditCard, Bell, Zap,
} from "lucide-react";
import { useEffect } from "react";

// ── Mini Mockups ──────────────────────────────────────────────────────────────

function BookingMockup() {
  const slots = [
    { time: "9:00 AM",  name: "Mia K.",    service: "Blowout",    color: "#00D4AA" },
    { time: "10:30 AM", name: "Sarah L.",   service: "Color + Cut", color: "#00D4AA" },
    { time: "12:00 PM", name: "Priya T.",   service: "Deep Condition", color: "#00D4AA" },
    { time: "2:00 PM",  name: "Open Slot",  service: "— available —",  color: "#ffffff22" },
    { time: "3:30 PM",  name: "Elena G.",   service: "Highlights",  color: "#00D4AA" },
  ];
  return (
    <div className="bg-[#060E1A] rounded-xl border border-white/10 p-4 text-xs">
      <div className="flex items-center justify-between mb-3">
        <span className="text-white font-semibold text-[11px]">Today's Appointments</span>
        <span className="bg-[#00D4AA]/15 text-[#00D4AA] text-[10px] font-bold px-2 py-0.5 rounded-full">4 booked</span>
      </div>
      <div className="space-y-1.5">
        {slots.map((slot, i) => (
          <div key={i} className="flex items-center gap-2.5 rounded-lg px-2.5 py-2" style={{ background: slot.color === "#ffffff22" ? "#ffffff08" : "#00D4AA0F" }}>
            <div className="w-1.5 h-full self-stretch rounded-full flex-shrink-0" style={{ background: slot.color, minHeight: 12 }} />
            <span className="text-white/40 w-14 flex-shrink-0">{slot.time}</span>
            <span className="text-white font-medium flex-1 truncate">{slot.name}</span>
            <span className="text-white/50 truncate">{slot.service}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function QueueMockup() {
  const queue = [
    { pos: 1, name: "Jake R.",   wait: "In Chair →",  status: "active"   },
    { pos: 2, name: "Deon W.",   wait: "~8 min",       status: "waiting"  },
    { pos: 3, name: "Maria S.",  wait: "~22 min",      status: "waiting"  },
    { pos: 4, name: "Troy M.",   wait: "~36 min",      status: "waiting"  },
  ];
  return (
    <div className="bg-[#060E1A] rounded-xl border border-white/10 p-4 text-xs">
      <div className="flex items-center justify-between mb-3">
        <span className="text-white font-semibold text-[11px]">Live Queue — Studio A</span>
        <span className="bg-[#F59E0B]/15 text-[#F59E0B] text-[10px] font-bold px-2 py-0.5 rounded-full">3 waiting</span>
      </div>
      <div className="space-y-1.5">
        {queue.map((item) => (
          <div key={item.pos} className={`flex items-center gap-2.5 rounded-lg px-2.5 py-2 ${item.status === "active" ? "bg-[#F59E0B]/10 border border-[#F59E0B]/20" : "bg-white/4"}`}>
            <span className={`text-[11px] font-bold w-5 flex-shrink-0 ${item.status === "active" ? "text-[#F59E0B]" : "text-white/30"}`}>#{item.pos}</span>
            <span className="text-white font-medium flex-1">{item.name}</span>
            <span className={`text-[10px] font-semibold ${item.status === "active" ? "text-[#F59E0B]" : "text-white/40"}`}>{item.wait}</span>
          </div>
        ))}
      </div>
      <div className="mt-3 flex items-center gap-1.5 bg-[#F59E0B]/8 rounded-lg px-2.5 py-2">
        <Smartphone className="w-3 h-3 text-[#F59E0B]" />
        <span className="text-white/50 text-[10px]">Customers check in from their phone →</span>
      </div>
    </div>
  );
}

function ProMockup() {
  const jobs = [
    { name: "Mike D.",   type: "HVAC Service",    time: "9:00 AM",  status: "En Route",    col: "#3B82F6" },
    { name: "Sara L.",   type: "Plumbing Repair", time: "11:00 AM", status: "Scheduled",   col: "#6B7280" },
    { name: "James P.",  type: "Electrical",      time: "1:30 PM",  status: "Scheduled",   col: "#6B7280" },
  ];
  return (
    <div className="bg-[#060E1A] rounded-xl border border-white/10 p-4 text-xs">
      <div className="flex items-center justify-between mb-3">
        <span className="text-white font-semibold text-[11px]">Dispatch Board — Today</span>
        <span className="bg-[#3B82F6]/15 text-[#3B82F6] text-[10px] font-bold px-2 py-0.5 rounded-full">3 Jobs</span>
      </div>
      <div className="space-y-1.5">
        {jobs.map((job, i) => (
          <div key={i} className="flex items-center gap-2.5 rounded-lg px-2.5 py-2 bg-white/4">
            <div className="w-6 h-6 rounded-full bg-[#3B82F6]/10 flex items-center justify-center flex-shrink-0">
              <Wrench className="w-3 h-3 text-[#3B82F6]" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white font-medium truncate">{job.type}</p>
              <p className="text-white/35">{job.name} · {job.time}</p>
            </div>
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full flex-shrink-0" style={{ background: job.col + "22", color: job.col }}>{job.status}</span>
          </div>
        ))}
      </div>
      <div className="mt-3 flex items-center gap-1.5 bg-[#3B82F6]/8 rounded-lg px-2.5 py-2">
        <MapPin className="w-3 h-3 text-[#3B82F6]" />
        <span className="text-white/50 text-[10px]">Route optimized · GPS live tracking →</span>
      </div>
    </div>
  );
}

// ── Product Card ──────────────────────────────────────────────────────────────

interface ProductCardProps {
  badge: string;
  emoji: string;
  name: string;
  headline: string;
  desc: string;
  features: string[];
  tags: string[];
  cta: string;
  href: string;
  accent: string;
  mockup: React.ReactNode;
  delay?: number;
}

function ProductCard({ badge, emoji, name, headline, desc, features, tags, cta, href, accent, mockup, delay = 0 }: ProductCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 32 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, delay }}
      className="group relative flex flex-col bg-[#0D1F35] border border-white/10 rounded-3xl overflow-hidden hover:border-opacity-40 transition-all duration-300 hover:shadow-2xl"
      style={{ "--accent": accent } as React.CSSProperties}
    >
      {/* Top accent glow */}
      <div className="absolute top-0 left-0 right-0 h-1 opacity-80" style={{ background: accent }} />

      {/* Glow orb */}
      <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-64 h-64 rounded-full opacity-0 group-hover:opacity-10 transition-opacity duration-500 pointer-events-none" style={{ background: accent, filter: "blur(60px)" }} />

      <div className="flex flex-col flex-1 p-7 gap-5">
        {/* Badge + emoji */}
        <div className="flex items-center gap-3">
          <span className="text-3xl">{emoji}</span>
          <span className="text-[10px] font-bold uppercase tracking-[0.15em] px-2.5 py-1 rounded-full border" style={{ color: accent, borderColor: accent + "40", background: accent + "12" }}>
            {badge}
          </span>
        </div>

        {/* Name + headline + desc */}
        <div>
          <p className="text-white/50 text-xs font-semibold uppercase tracking-wider mb-1">{name}</p>
          <h2 className="text-xl font-extrabold text-white leading-tight mb-3">{headline}</h2>
          <p className="text-white/55 text-sm leading-relaxed">{desc}</p>
        </div>

        {/* Mockup */}
        <div>{mockup}</div>

        {/* Features */}
        <ul className="space-y-2 flex-1">
          {features.map(f => (
            <li key={f} className="flex items-center gap-2.5">
              <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0" style={{ color: accent }} />
              <span className="text-white/70 text-sm">{f}</span>
            </li>
          ))}
        </ul>

        {/* Tags */}
        <div className="flex flex-wrap gap-1.5">
          {tags.map(t => (
            <span key={t} className="text-[11px] px-2.5 py-1 rounded-full bg-white/6 text-white/45 border border-white/8">{t}</span>
          ))}
        </div>

        {/* CTA */}
        <Link to={href} className="mt-auto">
          <button
            className="w-full py-3.5 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 transition-all duration-200 hover:opacity-90 hover:scale-[1.02]"
            style={{ background: accent, color: "#060E1A" }}
          >
            {cta} <ArrowRight className="w-4 h-4" />
          </button>
        </Link>
      </div>
    </motion.div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function ProductSelector() {
  useEffect(() => {
    const link = document.createElement("link");
    link.href = "https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap";
    link.rel = "stylesheet";
    document.head.appendChild(link);
    return () => { document.head.removeChild(link); };
  }, []);

  return (
    <div className="min-h-screen bg-[#060E1A] text-white" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>

      {/* Background mesh */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-[#00D4AA]/4 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-[#3B82F6]/4 rounded-full blur-[120px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 w-[400px] h-[400px] bg-[#F59E0B]/3 rounded-full blur-[100px]" />
      </div>

      {/* Nav */}
      <nav className="relative z-10 flex items-center justify-between px-6 sm:px-10 lg:px-16 h-16 border-b border-white/6">
        <div className="flex items-center gap-2.5">
          <img src="/web-app.png" alt="Certxa" className="w-8 h-8 rounded-lg shadow" onError={e => { (e.target as HTMLImageElement).style.display = "none"; }} />
          <span className="font-extrabold text-xl tracking-tight text-white">Certxa</span>
        </div>
        <div className="flex items-center gap-4">
          <Link to="/auth" className="text-white/60 hover:text-white text-sm font-medium transition-colors hidden sm:block">Log In</Link>
          <Link to="/auth?mode=register">
            <Button className="bg-[#00D4AA] hover:bg-[#00BF99] text-[#060E1A] font-bold text-sm px-5 py-2 rounded-xl h-auto">
              Get Started
            </Button>
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <div className="relative z-10 text-center pt-14 pb-10 px-4">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/8 border border-white/12 text-white/70 text-xs font-semibold uppercase tracking-wider mb-5">
            <span className="w-2 h-2 rounded-full bg-[#00D4AA] animate-pulse" />
            One Platform — Three Products
          </span>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white leading-[1.08] tracking-tight mb-4">
            Choose Your <span className="text-[#00D4AA]">Platform</span>
          </h1>
          <p className="text-white/55 text-lg max-w-xl mx-auto leading-relaxed">
            Certxa is built around how your business actually works. Select the model that fits your operation.
          </p>
        </motion.div>
      </div>

      {/* 3 Product Cards */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 pb-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

          {/* ── Group 1: Booking ── */}
          <ProductCard
            delay={0.1}
            badge="Appointment-Based"
            emoji="📅"
            name="Certxa Booking"
            headline="Fill your calendar. Automate the rest."
            desc="Online booking, staff scheduling, SMS reminders, and payments — built for businesses that run on appointments."
            features={[
              "24/7 online booking page",
              "Staff calendars & scheduling",
              "Automated SMS & email reminders",
              "Invoicing, POS & payments",
            ]}
            tags={["Hair Salons", "Spas", "Nail Salons", "Estheticians", "Pet Groomers", "Tattoo", "Tutors"]}
            cta="Explore Booking"
            href="/booking"
            accent="#00D4AA"
            mockup={<BookingMockup />}
          />

          {/* ── Group 2: Queue ── */}
          <ProductCard
            delay={0.2}
            badge="Walk-In Management"
            emoji="👥"
            name="Certxa Queue"
            headline="No appointments. No problem."
            desc="Virtual check-in, live wait time display, and loyalty rewards for high-volume walk-in businesses that don't use bookings."
            features={[
              "Virtual check-in from phone or QR",
              "Live queue display for your shop",
              "SMS 'you're next' notifications",
              "Loyalty punch cards & POS",
            ]}
            tags={["Barbershops", "Haircut Studios", "Walk-In Salons"]}
            cta="Explore Queue"
            href="/queue"
            accent="#F59E0B"
            mockup={<QueueMockup />}
          />

          {/* ── Group 3: Pro ── */}
          <ProductCard
            delay={0.3}
            badge="Field Service"
            emoji="🔧"
            name="Certxa Pro"
            headline="Dispatch more. Invoice faster."
            desc="Job scheduling, crew dispatching, GPS routing, mobile invoicing, and QuickBooks integration for businesses that send techs to the field."
            features={[
              "Smart job dispatching & routing",
              "GPS crew tracking & check-ins",
              "Mobile invoicing from the job site",
              "Scheduling, time tracking & QuickBooks",
            ]}
            tags={["HVAC", "Plumbing", "Electrical", "Lawn Care", "Roofing", "+ 20 more"]}
            cta="Explore Pro Hub"
            href="/pro"
            accent="#3B82F6"
            mockup={<ProMockup />}
          />
        </div>

        {/* Bottom badge */}
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7 }}
          className="text-center mt-12 flex flex-wrap justify-center gap-6 text-white/30 text-xs font-medium"
        >
          {[
            "✅ Free 60-day trial on all plans",
            "✅ No credit card required",
            "✅ Switch plans at any time",
            "✅ Dedicated onboarding support",
          ].map(t => <span key={t}>{t}</span>)}
        </motion.div>
      </div>
    </div>
  );
}
