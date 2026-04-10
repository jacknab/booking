import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  ArrowRight, Calendar, DollarSign, Users, Smartphone,
  Star, CheckCircle2, ChevronRight, MapPin, Clock,
  Wrench, ClipboardList, CreditCard, Bell,
  Menu, X,
} from "lucide-react";
import { PRO_INDUSTRIES, PRO_CATEGORIES } from "./proIndustries";
import dispatchImg from "@assets/image_1775799165749.png";

const STATS = [
  { value: "50,000+",  label: "Service Pros"         },
  { value: "5M+",      label: "Jobs Dispatched"      },
  { value: "$2B+",     label: "Invoiced Through Certxa" },
  { value: "4.9 ★",   label: "Average Rating"        },
];

const FEATURES = [
  {
    tag: "Smart Scheduling",
    headline: "Schedule more jobs without the phone tag.",
    sub: "Customers book online 24/7. Jobs drop straight into your calendar. Your crew gets notified instantly — no calls, no confusion.",
    bullets: ["Online booking that works while you sleep", "Drag-and-drop job rescheduling", "Crew assignment with instant notifications", "Automated customer confirmations & reminders"],
    icon: <Calendar className="w-6 h-6 text-[#00D4AA]" />,
    mock: <SchedulingMock />,
    flip: false,
  },
  {
    tag: "Invoicing & Payments",
    headline: "Invoice from the job site. Get paid the same day.",
    sub: "Build an invoice on your phone before you pack up the truck. Accept card, cash, or tap-to-pay on the spot. No chasing, no waiting.",
    bullets: ["Mobile invoicing in 30 seconds", "Accept card, ACH, and tap-to-pay", "Automatic payment receipts", "Deposit collection at booking"],
    icon: <DollarSign className="w-6 h-6 text-[#00D4AA]" />,
    mock: <InvoiceMock />,
    flip: true,
  },
  {
    tag: "Customer Management",
    headline: "Every customer. Every job. All in one place.",
    sub: "See the full history of every customer — what was done, who did it, what was charged. Build relationships that turn into repeat business.",
    bullets: ["Full service history per address", "Automatic review requests after jobs", "SMS reminders cut no-shows by 60%", "Customer self-service portal"],
    icon: <Users className="w-6 h-6 text-[#00D4AA]" />,
    mock: <CustomerMock />,
    flip: false,
  },
];

const TESTIMONIALS = [
  {
    quote: "We went from 8 to 35 jobs a week in three months. Online booking is the single best thing I've ever done for my business.",
    name: "Marcus T.",
    business: "TempRight HVAC",
    industry: "HVAC",
    stars: 5,
  },
  {
    quote: "The invoicing tool is so fast. I invoice before I leave the driveway and 80% of customers pay before I get back to the shop.",
    name: "Dana R.",
    business: "Riverline Plumbing",
    industry: "Plumbing",
    stars: 5,
  },
  {
    quote: "Seasonal contracts changed my cash flow completely. I collect half the season upfront and the billing handles itself all year.",
    name: "Kevin O.",
    business: "Greenside Lawn Care",
    industry: "Lawn Care",
    stars: 5,
  },
];

// ── Inline Mockups ────────────────────────────────────────────────────────────

function SchedulingMock() {
  const jobs = [
    { name: "Mike D.", type: "HVAC Tune-Up",       time: "8:00 AM",  status: "In Progress", color: "#00D4AA" },
    { name: "Sarah L.", type: "Plumbing Repair",   time: "10:30 AM", status: "Scheduled",   color: "#3B82F6" },
    { name: "James P.", type: "Electrical Check",  time: "1:00 PM",  status: "Scheduled",   color: "#3B82F6" },
    { name: "Rosa M.", type: "General Repair",     time: "3:30 PM",  status: "Completed",   color: "#6B7280" },
  ];
  return (
    <div className="bg-[#060E1A] rounded-2xl border border-white/10 p-5 space-y-3 shadow-2xl">
      <div className="flex items-center justify-between mb-1">
        <div>
          <p className="text-xs text-white/40 font-medium uppercase tracking-wider">Today's Dispatch</p>
          <p className="text-white font-semibold text-sm">Thursday, April 10</p>
        </div>
        <span className="text-xs bg-[#00D4AA]/15 text-[#00D4AA] font-bold px-2.5 py-1 rounded-full">4 Jobs</span>
      </div>
      {jobs.map((job, i) => (
        <div key={i} className="flex items-center gap-3 bg-white/5 rounded-xl px-4 py-3">
          <div className="w-8 h-8 rounded-full bg-[#00D4AA]/10 flex items-center justify-center flex-shrink-0">
            <Wrench className="w-3.5 h-3.5 text-[#00D4AA]" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white text-xs font-semibold truncate">{job.type}</p>
            <p className="text-white/40 text-[11px]">{job.name} · {job.time}</p>
          </div>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap flex-shrink-0"
            style={{ background: job.color + "22", color: job.color }}>
            {job.status}
          </span>
        </div>
      ))}
      <div className="flex items-center gap-2 pt-1">
        <MapPin className="w-3.5 h-3.5 text-[#00D4AA]" />
        <p className="text-white/40 text-[11px]">Route optimized · 42 miles total</p>
      </div>
    </div>
  );
}

function InvoiceMock() {
  return (
    <div className="bg-[#060E1A] rounded-2xl border border-white/10 p-5 shadow-2xl space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-white/40 uppercase tracking-wider font-medium">Invoice #2047</p>
          <p className="text-white font-semibold text-sm mt-0.5">Kitchen Faucet Repair</p>
        </div>
        <span className="text-xs bg-[#00D4AA]/15 text-[#00D4AA] font-bold px-2.5 py-1 rounded-full">Sent</span>
      </div>
      <div className="space-y-2">
        {[
          { label: "Service Call",          amount: "$85.00" },
          { label: "Replacement Cartridge", amount: "$42.00" },
          { label: "Labor (1.5 hrs)",        amount: "$112.50" },
        ].map((row, i) => (
          <div key={i} className="flex justify-between items-center bg-white/5 rounded-lg px-3 py-2">
            <p className="text-white/70 text-xs">{row.label}</p>
            <p className="text-white text-xs font-semibold">{row.amount}</p>
          </div>
        ))}
      </div>
      <div className="border-t border-white/10 pt-3 flex justify-between items-center">
        <p className="text-white/60 text-sm">Total Due</p>
        <p className="text-[#00D4AA] font-bold text-xl">$239.50</p>
      </div>
      <button className="w-full bg-[#00D4AA] text-[#060E1A] font-bold py-2.5 rounded-xl text-sm flex items-center justify-center gap-2">
        <CreditCard className="w-4 h-4" /> Pay Now
      </button>
    </div>
  );
}

function CustomerMock() {
  return (
    <div className="bg-[#060E1A] rounded-2xl border border-white/10 p-5 shadow-2xl space-y-4">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-[#00D4AA]/10 flex items-center justify-center text-[#00D4AA] font-bold text-sm">JR</div>
        <div>
          <p className="text-white font-semibold text-sm">James Robertson</p>
          <p className="text-white/40 text-xs">8 jobs · Customer since 2022</p>
        </div>
        <span className="ml-auto text-xs bg-[#00D4AA]/15 text-[#00D4AA] font-bold px-2.5 py-1 rounded-full">Active</span>
      </div>
      <div className="space-y-2">
        {[
          { date: "Mar 28", type: "HVAC Tune-Up",       amount: "$149", rating: 5 },
          { date: "Nov 14", type: "Filter Replacement", amount: "$65",  rating: 5 },
          { date: "Jul 3",  type: "A/C Repair",         amount: "$320", rating: 4 },
        ].map((job, i) => (
          <div key={i} className="flex items-center gap-3 bg-white/5 rounded-lg px-3 py-2.5">
            <div className="text-center min-w-[36px]">
              <p className="text-white/40 text-[10px] leading-none">{job.date}</p>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white text-xs font-medium truncate">{job.type}</p>
              <div className="flex text-[#00D4AA] mt-0.5">
                {Array.from({ length: job.rating }).map((_, i) => <Star key={i} className="w-2.5 h-2.5 fill-[#00D4AA]" />)}
              </div>
            </div>
            <p className="text-white/70 text-xs font-semibold">{job.amount}</p>
          </div>
        ))}
      </div>
      <div className="flex items-center gap-2 bg-[#00D4AA]/8 rounded-xl px-3 py-2">
        <Bell className="w-3.5 h-3.5 text-[#00D4AA]" />
        <p className="text-white/60 text-[11px]">Annual tune-up reminder sent · Apr 3</p>
      </div>
    </div>
  );
}

// ── Lead Form ─────────────────────────────────────────────────────────────────

function LeadForm() {
  const [form, setForm] = useState({ name: "", email: "", business: "", industry: "", teamSize: "" });
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name || !form.email) return;
    setStatus("loading");
    try {
      const res = await fetch("/api/pro/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        setStatus("done");
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  }

  if (status === "done") {
    return (
      <div className="text-center py-8">
        <CheckCircle2 className="w-12 h-12 text-[#00D4AA] mx-auto mb-3" />
        <p className="text-white font-bold text-xl mb-2">You're on the list!</p>
        <p className="text-white/60 text-sm">We'll be in touch within one business day to set up your free trial.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <input
          type="text" placeholder="Your Name" required
          value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
          className="bg-white/8 border border-white/15 rounded-xl px-4 py-3 text-white placeholder-white/40 text-sm focus:outline-none focus:border-[#00D4AA]/60 focus:bg-white/10 transition-all"
        />
        <input
          type="email" placeholder="Business Email" required
          value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
          className="bg-white/8 border border-white/15 rounded-xl px-4 py-3 text-white placeholder-white/40 text-sm focus:outline-none focus:border-[#00D4AA]/60 focus:bg-white/10 transition-all"
        />
      </div>
      <input
        type="text" placeholder="Business Name"
        value={form.business} onChange={e => setForm(f => ({ ...f, business: e.target.value }))}
        className="w-full bg-white/8 border border-white/15 rounded-xl px-4 py-3 text-white placeholder-white/40 text-sm focus:outline-none focus:border-[#00D4AA]/60 focus:bg-white/10 transition-all"
      />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <select
          value={form.industry} onChange={e => setForm(f => ({ ...f, industry: e.target.value }))}
          className="bg-white/8 border border-white/15 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-[#00D4AA]/60 focus:bg-white/10 transition-all appearance-none"
        >
          <option value="" className="bg-[#0D1F35]">Select Your Industry</option>
          {PRO_INDUSTRIES.map(i => (
            <option key={i.slug} value={i.name} className="bg-[#0D1F35]">{i.emoji} {i.name}</option>
          ))}
        </select>
        <select
          value={form.teamSize} onChange={e => setForm(f => ({ ...f, teamSize: e.target.value }))}
          className="bg-white/8 border border-white/15 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-[#00D4AA]/60 focus:bg-white/10 transition-all appearance-none"
        >
          <option value="" className="bg-[#0D1F35]">Team Size</option>
          {["Just me", "2–5 techs", "6–15 techs", "16–30 techs", "30+ techs"].map(s => (
            <option key={s} value={s} className="bg-[#0D1F35]">{s}</option>
          ))}
        </select>
      </div>
      <Button
        type="submit"
        disabled={status === "loading"}
        className="w-full bg-[#00D4AA] hover:bg-[#00BF99] text-[#060E1A] font-bold text-sm py-3 rounded-xl transition-all"
      >
        {status === "loading" ? "Sending…" : "Start My Free 60-Day Trial"}
        {status !== "loading" && <ArrowRight className="ml-2 w-4 h-4" />}
      </Button>
      {status === "error" && <p className="text-red-400 text-xs text-center">Something went wrong. Please try again.</p>}
      <p className="text-white/30 text-xs text-center">No credit card required · Cancel anytime</p>
    </form>
  );
}

// ── Industry Card ─────────────────────────────────────────────────────────────

function IndustryCard({ slug, name, emoji, tagline }: { slug: string; name: string; emoji: string; tagline: string }) {
  return (
    <Link to={`/pro/${slug}`}>
      <motion.div
        whileHover={{ y: -4, scale: 1.02 }}
        transition={{ duration: 0.2 }}
        className="group relative flex flex-col gap-2.5 p-5 rounded-2xl border border-white/8 bg-[#0D1F35] hover:border-[#00D4AA]/40 hover:bg-[#00D4AA]/5 hover:shadow-[0_8px_32px_rgba(0,212,170,0.10)] transition-all duration-300 cursor-pointer h-full"
      >
        <span className="text-2xl leading-none">{emoji}</span>
        <div>
          <p className="text-white font-semibold text-sm leading-tight">{name}</p>
          <p className="text-white/45 text-[11px] mt-0.5 leading-snug line-clamp-2">{tagline}</p>
        </div>
        <div className="mt-auto pt-1 flex items-center gap-1 text-[#00D4AA] text-[11px] font-semibold opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          View Software <ChevronRight className="w-3 h-3" />
        </div>
      </motion.div>
    </Link>
  );
}

// ── Top Nav ───────────────────────────────────────────────────────────────────

function ProNav() {
  const [mobileOpen, setMobileOpen] = useState(false);
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[#060E1A]/90 backdrop-blur-xl border-b border-white/8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#00D4AA]/15 border border-[#00D4AA]/30 flex items-center justify-center">
            <Wrench className="w-4 h-4 text-[#00D4AA]" />
          </div>
          <span className="text-white font-bold text-base tracking-tight">Certxa <span className="text-[#00D4AA]">Pro</span></span>
        </Link>
        <div className="hidden md:flex items-center gap-6">
          <Link to="/pro" className="text-white/70 hover:text-white text-sm font-medium transition-colors">Industries</Link>
          <Link to="/pricing" className="text-white/70 hover:text-white text-sm font-medium transition-colors">Pricing</Link>
          <Link to="/auth" className="text-white/70 hover:text-white text-sm font-medium transition-colors">Sign In</Link>
          <Link to="/auth">
            <Button className="bg-[#00D4AA] hover:bg-[#00BF99] text-[#060E1A] font-bold text-sm px-5 py-2 rounded-xl">
              Start Free Trial
            </Button>
          </Link>
        </div>
        <button onClick={() => setMobileOpen(o => !o)} className="md:hidden text-white/70 hover:text-white">
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>
      {mobileOpen && (
        <div className="md:hidden bg-[#060E1A] border-t border-white/8 px-4 py-4 space-y-3">
          {[["Industries", "/pro"], ["Pricing", "/pricing"], ["Sign In", "/auth"]].map(([label, href]) => (
            <Link key={href} to={href} onClick={() => setMobileOpen(false)} className="block text-white/70 hover:text-white text-sm font-medium py-1">{label}</Link>
          ))}
          <Link to="/auth" onClick={() => setMobileOpen(false)}>
            <Button className="w-full bg-[#00D4AA] text-[#060E1A] font-bold text-sm mt-2 rounded-xl">Start Free Trial</Button>
          </Link>
        </div>
      )}
    </nav>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function ProHub() {
  const [activeCategory, setActiveCategory] = useState<string>("all");

  const filteredIndustries = activeCategory === "all"
    ? PRO_INDUSTRIES
    : PRO_INDUSTRIES.filter(i => i.category === activeCategory);

  return (
    <div className="min-h-screen bg-[#060E1A] text-white font-['Plus_Jakarta_Sans',sans-serif]">
      <ProNav />

      {/* ── Hero ── */}
      <section className="pt-24 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#00D4AA]/10 border border-[#00D4AA]/25 text-[#00D4AA] text-xs font-semibold uppercase tracking-wider mb-5">
              <Wrench className="w-3.5 h-3.5" /> Field Service Software
            </span>
            <h1 className="text-4xl sm:text-5xl xl:text-6xl font-extrabold leading-[1.08] tracking-tight text-white mb-5">
              Software for Every<br />
              <span className="text-[#00D4AA]">Home Service Business</span>
            </h1>
            <p className="text-white/60 text-lg leading-relaxed mb-8 max-w-lg">
              Certxa gives you the tools to schedule more jobs, dispatch faster, invoice on the spot, and get paid the same day — all from one platform built for the trades.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 mb-8">
              <Link to="/auth">
                <Button className="bg-[#00D4AA] hover:bg-[#00BF99] text-[#060E1A] font-bold text-sm px-7 py-3 rounded-xl h-auto">
                  Start Free 60-Day Trial <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </Link>
              <Link to="#industries">
                <Button variant="ghost" className="border border-white/20 text-white bg-white/5 hover:bg-white/10 hover:border-white/30 font-semibold text-sm px-7 py-3 rounded-xl h-auto">
                  Browse Industries
                </Button>
              </Link>
            </div>
            <div className="flex flex-wrap gap-4">
              {["✅ Free 60-day trial", "✅ No credit card", "✅ Set up in 10 min"].map(t => (
                <span key={t} className="text-white/50 text-xs font-medium">{t}</span>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="relative"
          >
            {/* Glow behind the card */}
            <div className="absolute -inset-4 bg-[#00D4AA]/10 rounded-3xl blur-2xl pointer-events-none" />

            {/* Screenshot frame */}
            <div className="relative rounded-2xl overflow-hidden border border-white/15 shadow-[0_32px_80px_rgba(0,0,0,0.6)] ring-1 ring-white/8">
              {/* Fake browser chrome */}
              <div className="bg-[#0D1F35] border-b border-white/10 px-4 py-2.5 flex items-center gap-2 flex-shrink-0">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-500/70" />
                  <div className="w-3 h-3 rounded-full bg-amber-400/70" />
                  <div className="w-3 h-3 rounded-full bg-green-500/70" />
                </div>
                <div className="flex-1 mx-3 bg-white/8 rounded-md px-3 py-1 text-white/30 text-[11px] font-medium truncate">
                  app.certxa.com/pro-dashboard/schedule
                </div>
              </div>

              <img
                src={dispatchImg}
                alt="Certxa Pro dispatch schedule — crew columns with real-time job cards"
                className="w-full block"
                loading="eager"
              />
            </div>

            {/* Floating badge */}
            <div className="absolute -bottom-4 -right-4 bg-[#00D4AA] text-[#060E1A] text-xs font-bold px-4 py-2.5 rounded-2xl shadow-lg shadow-[#00D4AA]/30 flex items-center gap-2">
              <Clock className="w-3.5 h-3.5" />
              Live Dispatch Board
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Stats Bar ── */}
      <section className="border-y border-white/8 bg-[#0D1F35]/50 py-10 px-4">
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6">
          {STATS.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ delay: i * 0.08 }}
              className="text-center"
            >
              <p className="text-3xl font-extrabold text-[#00D4AA] mb-1">{stat.value}</p>
              <p className="text-white/50 text-sm font-medium">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── Industry Grid ── */}
      <section id="industries" className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-12">
          <p className="text-[#00D4AA] text-sm font-semibold uppercase tracking-widest mb-3">25+ Industries</p>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-4">
            Built for Every Home Service Industry
          </h2>
          <p className="text-white/55 text-lg max-w-2xl mx-auto">
            Whether you run one truck or a fleet of 50, Certxa has a purpose-built workflow for your industry.
          </p>
        </motion.div>

        {/* Category Filter */}
        <div className="flex flex-wrap justify-center gap-2 mb-10">
          {[{ label: "All Industries", value: "all" }, ...PRO_CATEGORIES.map(c => ({ label: c.label, value: c.value }))].map(cat => (
            <button
              key={cat.value}
              onClick={() => setActiveCategory(cat.value)}
              className={`px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200 ${
                activeCategory === cat.value
                  ? "bg-[#00D4AA] text-[#060E1A]"
                  : "bg-white/8 text-white/60 hover:bg-white/12 hover:text-white border border-white/10"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        <motion.div
          layout
          className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3"
        >
          {filteredIndustries.map((industry, i) => (
            <motion.div
              key={industry.slug}
              layout
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.03 }}
            >
              <IndustryCard {...industry} />
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* ── Features ── */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-24">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-4">
          <p className="text-[#00D4AA] text-sm font-semibold uppercase tracking-widest mb-3">One Platform</p>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white">Everything You Need to Run the Job</h2>
        </motion.div>

        {FEATURES.map((feature, i) => (
          <motion.div
            key={feature.tag}
            initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} transition={{ delay: 0.1 }}
            className={`grid grid-cols-1 lg:grid-cols-2 gap-12 items-center ${feature.flip ? "lg:[&>*:first-child]:order-last" : ""}`}
          >
            <div>
              <span className="inline-flex items-center gap-2 text-[#00D4AA] text-xs font-bold uppercase tracking-widest mb-4">
                {feature.icon} {feature.tag}
              </span>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-white mb-4 leading-tight">{feature.headline}</h3>
              <p className="text-white/55 text-base leading-relaxed mb-6">{feature.sub}</p>
              <ul className="space-y-3">
                {feature.bullets.map(bullet => (
                  <li key={bullet} className="flex items-start gap-3">
                    <CheckCircle2 className="w-4 h-4 text-[#00D4AA] flex-shrink-0 mt-0.5" />
                    <span className="text-white/70 text-sm">{bullet}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div>{feature.mock}</div>
          </motion.div>
        ))}
      </section>

      {/* ── Testimonials ── */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-[#0D1F35]/40">
        <div className="max-w-6xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-12">
            <p className="text-[#00D4AA] text-sm font-semibold uppercase tracking-widest mb-3">Real Results</p>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white">From Service Pros Like You</h2>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                className="bg-[#0D1F35] border border-white/10 rounded-2xl p-6 flex flex-col gap-4"
              >
                <div className="flex gap-0.5">
                  {Array.from({ length: t.stars }).map((_, s) => (
                    <Star key={s} className="w-4 h-4 fill-[#00D4AA] text-[#00D4AA]" />
                  ))}
                </div>
                <p className="text-white/80 text-sm leading-relaxed flex-1">"{t.quote}"</p>
                <div>
                  <p className="text-white font-semibold text-sm">{t.name}</p>
                  <p className="text-white/40 text-xs">{t.business} · {t.industry}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA + Lead Form ── */}
      <section className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-10">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-4">
              Start Your Free Trial Today
            </h2>
            <p className="text-white/55 text-base">
              Get 60 days free. No credit card required. Set up in under 10 minutes.
            </p>
          </motion.div>
          <div className="bg-[#0D1F35] border border-white/10 rounded-2xl p-8">
            <LeadForm />
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-white/8 py-10 px-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-[#00D4AA]/15 border border-[#00D4AA]/30 flex items-center justify-center">
              <Wrench className="w-3 h-3 text-[#00D4AA]" />
            </div>
            <span className="text-white/60 text-sm font-medium">Certxa Pro · Field Service Software</span>
          </div>
          <div className="flex gap-6">
            {[["Industries", "/pro"], ["Pricing", "/pricing"], ["Privacy", "/privacy-policy"], ["Terms", "/terms-of-service"]].map(([label, href]) => (
              <Link key={href} to={href} className="text-white/40 hover:text-white/70 text-xs font-medium transition-colors">{label}</Link>
            ))}
          </div>
          <p className="text-white/30 text-xs">© 2025 Certxa. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
