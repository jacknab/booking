import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  ArrowRight, ArrowLeft, Smartphone, Monitor,
  Bell, CreditCard, Star, CheckCircle2,
  Users, Clock, ChevronRight, Wrench,
  Gift, LayoutGrid,
} from "lucide-react";

// ── Queue Preview Mockup ──────────────────────────────────────────────────────

function QueueDisplayMock() {
  return (
    <div className="bg-[#060E1A] rounded-2xl border border-[#F59E0B]/20 p-5 shadow-2xl space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[#F59E0B] text-xs font-bold uppercase tracking-widest">Live Queue</p>
          <p className="text-white font-semibold text-sm mt-0.5">Studio A — Thursday</p>
        </div>
        <div className="text-right">
          <p className="text-white/40 text-xs">Avg Wait</p>
          <p className="text-[#F59E0B] font-extrabold text-lg leading-none">~14 min</p>
        </div>
      </div>
      <div className="space-y-2">
        {[
          { pos: 1, name: "Jake R.",   wait: "In Chair",   active: true  },
          { pos: 2, name: "Deon W.",   wait: "~8 min",     active: false },
          { pos: 3, name: "Maria S.",  wait: "~22 min",    active: false },
          { pos: 4, name: "Troy M.",   wait: "~36 min",    active: false },
          { pos: 5, name: "Keisha P.", wait: "~50 min",    active: false },
        ].map(item => (
          <div key={item.pos}
            className={`flex items-center gap-3 rounded-xl px-4 py-3 transition-all ${item.active ? "bg-[#F59E0B]/10 border border-[#F59E0B]/25" : "bg-white/4"}`}
          >
            <span className={`w-6 text-center text-xs font-extrabold ${item.active ? "text-[#F59E0B]" : "text-white/30"}`}>#{item.pos}</span>
            <span className="text-white text-sm font-semibold flex-1">{item.name}</span>
            <span className={`text-xs font-bold ${item.active ? "text-[#F59E0B]" : "text-white/40"}`}>{item.wait}</span>
          </div>
        ))}
      </div>
      <div className="flex items-center gap-2 bg-[#F59E0B]/8 rounded-xl px-4 py-2.5 mt-1">
        <Smartphone className="w-3.5 h-3.5 text-[#F59E0B]" />
        <p className="text-white/55 text-[11px]">Customers join from their phone — no app needed</p>
      </div>
    </div>
  );
}

function CheckInMock() {
  return (
    <div className="bg-[#060E1A] rounded-2xl border border-white/10 p-5 shadow-2xl max-w-[200px] mx-auto">
      <div className="text-center mb-4">
        <div className="w-12 h-12 rounded-xl bg-[#F59E0B]/10 border border-[#F59E0B]/20 flex items-center justify-center mx-auto mb-2">
          <Users className="w-5 h-5 text-[#F59E0B]" />
        </div>
        <p className="text-white font-bold text-sm">Virtual Check-In</p>
        <p className="text-white/40 text-[11px]">Legends Barbershop</p>
      </div>
      <div className="space-y-2 mb-4">
        <input className="w-full bg-white/8 border border-white/12 rounded-lg px-3 py-2 text-white text-xs placeholder-white/30" placeholder="Your Name" readOnly />
        <input className="w-full bg-white/8 border border-white/12 rounded-lg px-3 py-2 text-white text-xs placeholder-white/30" placeholder="Phone (for alerts)" readOnly />
      </div>
      <div className="bg-[#F59E0B]/10 border border-[#F59E0B]/20 rounded-lg p-2 mb-3 text-center">
        <p className="text-[#F59E0B] text-[11px] font-semibold">Est. wait: ~22 minutes</p>
        <p className="text-white/40 text-[10px]">3 people ahead of you</p>
      </div>
      <button className="w-full bg-[#F59E0B] text-[#060E1A] font-bold text-xs py-2 rounded-lg">
        Hold My Spot →
      </button>
    </div>
  );
}

// ── Features ──────────────────────────────────────────────────────────────────

const FEATURES = [
  {
    icon: <Smartphone className="w-5 h-5 text-[#F59E0B]" />,
    title: "Virtual Check-In",
    desc: "Customers scan a QR code at your door (or use a link you share) to join the queue from their own phone — no app download, no front-desk line.",
  },
  {
    icon: <Monitor className="w-5 h-5 text-[#F59E0B]" />,
    title: "Live Wait-Time Display",
    desc: "A TV or tablet in your shop shows the current queue in real time. Everyone can see where they stand — and staff can manage it from the same screen.",
  },
  {
    icon: <Bell className="w-5 h-5 text-[#F59E0B]" />,
    title: "SMS 'You're Up Next' Alerts",
    desc: "Customers can run errands nearby while they wait. Certxa automatically texts them when they're 1–2 spots away so they walk in right on time.",
  },
  {
    icon: <CreditCard className="w-5 h-5 text-[#F59E0B]" />,
    title: "POS & Payments",
    desc: "Ring up services and retail products from any device. Accept card, cash, or tap-to-pay. Full daily sales reporting included.",
  },
  {
    icon: <Gift className="w-5 h-5 text-[#F59E0B]" />,
    title: "Digital Loyalty Punch Cards",
    desc: "Customers earn a punch for every visit. Certxa tracks it automatically — no paper cards, no scanning. Redeemable rewards keep them coming back.",
  },
  {
    icon: <LayoutGrid className="w-5 h-5 text-[#F59E0B]" />,
    title: "Staff & Shift Scheduling",
    desc: "Set stylist availability, manage shifts, and see which staff member is handling which queue spot — all from your dashboard.",
  },
];

const STEPS = [
  { num: "01", title: "Post your QR code",    desc: "Put up the check-in QR code at your entrance, front window, or share the link on your social pages." },
  { num: "02", title: "Customers join live",  desc: "They enter their name and phone number. The queue display updates instantly. Staff see every check-in as it happens." },
  { num: "03", title: "Alert. Arrive. Done.", desc: "Certxa texts each customer when they're almost up. They walk in, take their seat, and you serve them. No chaos, no walk-ins waiting outside." },
];

const TESTIMONIALS = [
  {
    quote: "Before Certxa Queue, our Saturday wait was a disaster — people crowding the front, constantly asking how long. Now the shop feels calm and professional.",
    name: "Darius A.",
    business: "Legends Barbershop",
    stars: 5,
  },
  {
    quote: "The loyalty card feature alone brought back regulars I hadn't seen in months. It's automatic — I don't have to think about it.",
    name: "Tamika F.",
    business: "Studio Flow Cuts",
    stars: 5,
  },
  {
    quote: "Setting up took one afternoon. Now my front desk handles 40% more customers per day because check-in just happens on its own.",
    name: "Carlos M.",
    business: "The Clipper Co.",
    stars: 5,
  },
];

// ── Lead Form ─────────────────────────────────────────────────────────────────

function QueueLeadForm() {
  const [form, setForm] = useState({ name: "", email: "", business: "", size: "" });
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name || !form.email) return;
    setStatus("loading");
    try {
      const res = await fetch("/api/pro/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, industry: "Walk-In / Queue", source: "queue-landing" }),
      });
      setStatus(res.ok ? "done" : "error");
    } catch {
      setStatus("error");
    }
  }

  if (status === "done") {
    return (
      <div className="text-center py-8">
        <CheckCircle2 className="w-12 h-12 text-[#F59E0B] mx-auto mb-3" />
        <p className="text-white font-bold text-xl mb-2">You're on the list!</p>
        <p className="text-white/55 text-sm">We'll reach out within one business day to get your queue set up.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <input
          type="text" placeholder="Your Name" required
          value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
          className="bg-white/8 border border-white/15 rounded-xl px-4 py-3 text-white placeholder-white/40 text-sm focus:outline-none focus:border-[#F59E0B]/50 transition-all"
        />
        <input
          type="email" placeholder="Business Email" required
          value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
          className="bg-white/8 border border-white/15 rounded-xl px-4 py-3 text-white placeholder-white/40 text-sm focus:outline-none focus:border-[#F59E0B]/50 transition-all"
        />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <input
          type="text" placeholder="Business Name"
          value={form.business} onChange={e => setForm(f => ({ ...f, business: e.target.value }))}
          className="bg-white/8 border border-white/15 rounded-xl px-4 py-3 text-white placeholder-white/40 text-sm focus:outline-none focus:border-[#F59E0B]/50 transition-all"
        />
        <select
          value={form.size} onChange={e => setForm(f => ({ ...f, size: e.target.value }))}
          className="bg-white/8 border border-white/15 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-[#F59E0B]/50 transition-all appearance-none"
        >
          <option value="" className="bg-[#0D1F35]">Chair / Station Count</option>
          {["1 chair", "2–3 chairs", "4–6 chairs", "7–10 chairs", "10+ chairs"].map(s => (
            <option key={s} value={s} className="bg-[#0D1F35]">{s}</option>
          ))}
        </select>
      </div>
      <Button
        type="submit"
        disabled={status === "loading"}
        className="w-full font-bold text-sm py-3 rounded-xl h-auto"
        style={{ background: "#F59E0B", color: "#060E1A" }}
      >
        {status === "loading" ? "Sending…" : "Start My Free Trial"}
        {status !== "loading" && <ArrowRight className="ml-2 w-4 h-4" />}
      </Button>
      {status === "error" && <p className="text-red-400 text-xs text-center">Something went wrong. Please try again.</p>}
      <p className="text-white/30 text-xs text-center">Free 60 days · No credit card · Setup in under an hour</p>
    </form>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function QueueLanding() {
  return (
    <div className="min-h-screen bg-[#060E1A] text-white font-['Plus_Jakarta_Sans',sans-serif]">

      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#060E1A]/90 backdrop-blur-xl border-b border-white/8 h-16 flex items-center px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto w-full flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 text-white/60 hover:text-white transition-colors text-sm font-medium">
            <ArrowLeft className="w-4 h-4" /> All Products
          </Link>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-md bg-[#F59E0B]/15 border border-[#F59E0B]/30 flex items-center justify-center">
              <Users className="w-3.5 h-3.5 text-[#F59E0B]" />
            </div>
            <span className="text-white font-bold text-sm">Certxa <span className="text-[#F59E0B]">Queue</span></span>
          </div>
          <Link to="/auth">
            <Button className="font-bold text-xs px-4 py-2 rounded-xl h-auto" style={{ background: "#F59E0B", color: "#060E1A" }}>
              Free Trial
            </Button>
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-28 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55 }}>
            <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#F59E0B]/10 border border-[#F59E0B]/25 text-[#F59E0B] text-xs font-bold uppercase tracking-wider mb-5">
              <Users className="w-3.5 h-3.5" /> Walk-In Queue Management
            </span>
            <h1 className="text-4xl sm:text-5xl xl:text-6xl font-extrabold leading-[1.08] tracking-tight text-white mb-5">
              No Appointments.<br />
              <span className="text-[#F59E0B]">No Problem.</span>
            </h1>
            <p className="text-white/60 text-lg leading-relaxed mb-8 max-w-lg">
              Let customers hold their spot from their phone, show live wait times in your shop, and send automatic "you're next" texts — without a single phone call.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 mb-8">
              <a href="#get-started">
                <Button className="font-bold text-sm px-7 py-3 rounded-xl h-auto" style={{ background: "#F59E0B", color: "#060E1A" }}>
                  Start Free 60-Day Trial <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </a>
              <Link to="/">
                <Button variant="ghost" className="border border-white/20 text-white bg-white/5 hover:bg-white/10 font-semibold text-sm px-7 py-3 rounded-xl h-auto">
                  See All Products
                </Button>
              </Link>
            </div>
            <div className="flex flex-wrap gap-2">
              {["✅ Barbershops", "✅ Haircut Studios", "✅ Walk-In Salons"].map(t => (
                <span key={t} className="text-white/50 text-xs font-medium">{t}</span>
              ))}
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.65, delay: 0.1 }}>
            <QueueDisplayMock />
          </motion.div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-y border-white/8 bg-[#0D1F35]/50 py-10 px-4">
        <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {[
            { value: "40%",    label: "More customers daily"      },
            { value: "68%",    label: "Reduction in walk-aways"   },
            { value: "2.3×",   label: "Loyalty visit frequency"   },
            { value: "4.9 ★",  label: "Average customer rating"   },
          ].map((stat, i) => (
            <motion.div key={stat.label} initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.07 }}>
              <p className="text-3xl font-extrabold text-[#F59E0B] mb-1">{stat.value}</p>
              <p className="text-white/50 text-sm font-medium">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-12">
          <p className="text-[#F59E0B] text-sm font-bold uppercase tracking-widest mb-3">Everything Included</p>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
            One Platform for Your Entire Walk-In Operation
          </h2>
        </motion.div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {FEATURES.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ delay: i * 0.07 }}
              className="bg-[#0D1F35] border border-white/10 rounded-2xl p-6 hover:border-[#F59E0B]/25 transition-all duration-300"
            >
              <div className="w-10 h-10 rounded-xl bg-[#F59E0B]/10 border border-[#F59E0B]/20 flex items-center justify-center mb-4">
                {feature.icon}
              </div>
              <h3 className="text-white font-bold text-base mb-2">{feature.title}</h3>
              <p className="text-white/55 text-sm leading-relaxed">{feature.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-[#0D1F35]/40">
        <div className="max-w-5xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-12">
            <p className="text-[#F59E0B] text-sm font-bold uppercase tracking-widest mb-3">How It Works</p>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white">Live in Under an Hour</h2>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
            {STEPS.map((step, i) => (
              <motion.div
                key={step.num}
                initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.12 }}
                className="bg-[#0D1F35] border border-white/10 rounded-2xl p-6"
              >
                <div className="w-10 h-10 rounded-xl bg-[#F59E0B]/10 border border-[#F59E0B]/25 flex items-center justify-center mb-4">
                  <span className="text-[#F59E0B] font-extrabold text-sm">{step.num}</span>
                </div>
                <h3 className="text-white font-bold text-base mb-2">{step.title}</h3>
                <p className="text-white/55 text-sm leading-relaxed">{step.desc}</p>
              </motion.div>
            ))}
          </div>

          {/* Check-in mockup */}
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mt-10">
            <CheckInMock />
          </motion.div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-12">
            <p className="text-[#F59E0B] text-sm font-bold uppercase tracking-widest mb-3">Real Shops. Real Results.</p>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white">Built for Busy Walk-In Businesses</h2>
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
                    <Star key={s} className="w-4 h-4 fill-[#F59E0B] text-[#F59E0B]" />
                  ))}
                </div>
                <p className="text-white/80 text-sm leading-relaxed flex-1">"{t.quote}"</p>
                <div>
                  <p className="text-white font-semibold text-sm">{t.name}</p>
                  <p className="text-white/40 text-xs">{t.business}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Lead Form */}
      <section id="get-started" className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-8">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-3">
              Ready to Calm Your Busy Shop?
            </h2>
            <p className="text-white/50 text-sm">Free 60 days. Set up in under an hour. No credit card needed.</p>
          </motion.div>
          <div className="bg-[#0D1F35] border border-white/10 rounded-2xl p-8">
            <QueueLeadForm />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/8 py-8 px-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <Link to="/" className="flex items-center gap-2 text-white/50 hover:text-white/80 text-xs font-medium transition-colors">
            <ArrowLeft className="w-3.5 h-3.5" /> Back to All Products
          </Link>
          <p className="text-white/30 text-xs">© 2025 Certxa Queue. All rights reserved.</p>
          <div className="flex gap-5">
            {[["Pricing", "/pricing"], ["Privacy", "/privacy-policy"], ["Terms", "/terms-of-service"]].map(([l, h]) => (
              <Link key={h} to={h} className="text-white/35 hover:text-white/60 text-xs transition-colors">{l}</Link>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}
