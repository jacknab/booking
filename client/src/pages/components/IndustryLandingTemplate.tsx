import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  ArrowRight, Star, ShieldCheck, ChevronDown, Check,
  Calendar, Globe, DollarSign, Users, Smartphone,
} from "lucide-react";
import { motion } from "framer-motion";
import BusinessTypeMenu from "./BusinessTypeMenu";
import RevenueCalculator from "@/components/marketing/RevenueCalculator";

// ── Types ─────────────────────────────────────────────────────────────────────

export interface FeatureItem {
  icon: React.ReactNode;
  title: string;
  desc: string;
}

export interface FeatureTab {
  label: string;
  icon: React.ReactNode;
  heading: string;
  subheading: string;
  bullets: string[];
  mockType: "calendar" | "booking" | "invoice" | "clients" | "sms";
}

export interface HowItWorksStep {
  step: string;
  title: string;
  desc: string;
}

export interface Testimonial {
  quote: string;
  name: string;
  role: string;
}

export interface FAQ {
  q: string;
  a: string;
}

export interface IndustryConfig {
  badge: string;
  headlineLine1: string;
  headlineLine2: string;
  subheadline: string;
  heroVideo: React.ReactNode;
  trustText: string;
  competitors: string[];
  stats: { value: string; label: string }[];
  featuresLabel: string;
  featuresTitle: string;
  featuresSubtitle: string;
  features: FeatureItem[];
  featureTabs: FeatureTab[];
  howItWorksSteps: HowItWorksStep[];
  testimonials: Testimonial[];
  compareTitle: string;
  compareSubtitle: string;
  compareRows: [string, boolean, boolean][];
  faqs: FAQ[];
  ctaHeadline: string;
  ctaSub: string;
  ctaContext: string;
  industryId?: string;
}

// ── Mock UI visuals per tab ───────────────────────────────────────────────────

function CalendarMock() {
  const days = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];
  const cells = Array.from({ length: 28 }, (_, i) => i + 1);
  const highlighted = [3, 7, 10, 14, 17, 21, 24];
  return (
    <div className="bg-[#060E1A] rounded-2xl border border-white/10 p-5 space-y-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-white font-bold text-sm">April 2025</span>
        <span className="text-[#00D4AA] text-xs font-semibold">5 jobs today</span>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center">
        {days.map(d => <div key={d} className="text-white/30 text-[10px] font-bold">{d}</div>)}
        {cells.map(n => (
          <div key={n} className={`text-xs rounded-lg py-1.5 font-medium transition-colors
            ${highlighted.includes(n)
              ? "bg-[#00D4AA] text-[#0A2540] font-bold"
              : n === 10
              ? "bg-[#00D4AA]/20 text-[#00D4AA] ring-1 ring-[#00D4AA]/50"
              : "text-white/50"}`}>
            {n}
          </div>
        ))}
      </div>
      <div className="space-y-2 pt-1">
        {[
          { time: "9:00 AM", name: "Sarah J.", color: "bg-[#00D4AA]/20 text-[#00D4AA]" },
          { time: "11:30 AM", name: "Marcus T.", color: "bg-indigo-500/20 text-indigo-300" },
          { time: "2:00 PM", name: "Lisa R.", color: "bg-amber-500/20 text-amber-300" },
        ].map(a => (
          <div key={a.time} className="flex items-center gap-3 rounded-xl bg-white/5 px-3 py-2">
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${a.color}`}>{a.time}</span>
            <span className="text-white/70 text-xs">{a.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function BookingMock() {
  return (
    <div className="bg-[#060E1A] rounded-2xl border border-white/10 p-5 space-y-4">
      <div className="text-white font-bold text-sm mb-1">Book a Service</div>
      <div className="space-y-3">
        <div>
          <label className="text-white/40 text-xs mb-1 block">Service</label>
          <div className="bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white/80 text-sm flex items-center justify-between">
            <span>Select service…</span>
            <ChevronDown className="w-3.5 h-3.5 text-white/30" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {["9:00 AM", "10:00 AM", "11:30 AM", "2:00 PM"].map((t, i) => (
            <div key={t} className={`rounded-xl px-3 py-2 text-center text-xs font-semibold border transition-colors cursor-pointer
              ${i === 1 ? "bg-[#00D4AA] text-[#0A2540] border-[#00D4AA]" : "bg-white/5 border-white/10 text-white/60"}`}>
              {t}
            </div>
          ))}
        </div>
        <div className="bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white/40 text-sm">
          Your name
        </div>
        <button className="w-full bg-[#00D4AA] text-[#0A2540] font-bold rounded-xl py-2.5 text-sm hover:bg-[#00D4AA]/90 transition-colors">
          Confirm Booking →
        </button>
      </div>
      <p className="text-white/30 text-[10px] text-center">No account needed · Instant confirmation</p>
    </div>
  );
}

function InvoiceMock() {
  return (
    <div className="bg-[#060E1A] rounded-2xl border border-white/10 p-5 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-white font-bold text-sm">Invoice #1042</div>
          <div className="text-white/40 text-xs">Due: April 15, 2025</div>
        </div>
        <span className="bg-[#00D4AA]/20 text-[#00D4AA] text-xs font-bold px-3 py-1 rounded-full">Sent</span>
      </div>
      <div className="space-y-2 border-t border-white/10 pt-3">
        {[
          { label: "Service — 2 hrs", amount: "$120.00" },
          { label: "Materials", amount: "$35.00" },
          { label: "Tip", amount: "$20.00" },
        ].map(l => (
          <div key={l.label} className="flex items-center justify-between text-xs">
            <span className="text-white/60">{l.label}</span>
            <span className="text-white/80 font-medium">{l.amount}</span>
          </div>
        ))}
        <div className="flex items-center justify-between text-sm font-bold border-t border-white/10 pt-2 mt-2">
          <span className="text-white">Total</span>
          <span className="text-[#00D4AA]">$175.00</span>
        </div>
      </div>
      <button className="w-full bg-[#00D4AA] text-[#0A2540] font-bold rounded-xl py-2.5 text-sm">
        Pay Now →
      </button>
    </div>
  );
}

function ClientsMock() {
  const clients = [
    { initials: "SJ", name: "Sarah Johnson", tag: "Regular", visits: "14 visits", spend: "$1,240" },
    { initials: "MT", name: "Marcus Torres", tag: "New", visits: "1 visit", spend: "$85" },
    { initials: "LR", name: "Lisa Rodriguez", tag: "Regular", visits: "8 visits", spend: "$670" },
  ];
  return (
    <div className="bg-[#060E1A] rounded-2xl border border-white/10 p-5 space-y-3">
      <div className="flex items-center justify-between mb-1">
        <span className="text-white font-bold text-sm">Clients</span>
        <span className="text-[#00D4AA] text-xs font-semibold">142 total</span>
      </div>
      {clients.map(c => (
        <div key={c.name} className="flex items-center gap-3 bg-white/5 rounded-xl px-3 py-2.5">
          <div className="w-9 h-9 rounded-full bg-[#00D4AA]/20 flex items-center justify-center text-[#00D4AA] font-bold text-xs shrink-0">
            {c.initials}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-white text-xs font-semibold truncate">{c.name}</div>
            <div className="text-white/40 text-[10px]">{c.visits}</div>
          </div>
          <div className="text-right shrink-0">
            <div className="text-[#00D4AA] text-xs font-bold">{c.spend}</div>
            <div className={`text-[10px] ${c.tag === "Regular" ? "text-emerald-400" : "text-sky-400"}`}>{c.tag}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

function SmsMock() {
  return (
    <div className="bg-[#060E1A] rounded-2xl border border-white/10 p-5 space-y-3">
      <div className="text-white font-bold text-sm mb-2">SMS Reminders</div>
      {[
        { from: "Certxa", msg: "Hi Sarah! Reminder: your appointment is tomorrow at 10:00 AM with Certxa. Reply STOP to opt out.", time: "Yesterday 3:12 PM", mine: false },
        { from: "Sarah", msg: "Thanks! See you then 👍", time: "Yesterday 3:45 PM", mine: true },
        { from: "Certxa", msg: "✅ Your appointment is confirmed for tomorrow. We'll see you at 10:00 AM!", time: "Today 8:00 AM", mine: false },
      ].map((m, i) => (
        <div key={i} className={`flex ${m.mine ? "justify-end" : "justify-start"}`}>
          <div className={`max-w-[85%] rounded-2xl px-3 py-2 text-xs leading-relaxed
            ${m.mine
              ? "bg-[#00D4AA] text-[#0A2540] rounded-br-sm"
              : "bg-white/10 text-white/80 rounded-bl-sm"}`}>
            {m.msg}
            <div className={`text-[9px] mt-1 ${m.mine ? "text-[#0A2540]/60" : "text-white/30"}`}>{m.time}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

function TabMock({ type }: { type: FeatureTab["mockType"] }) {
  switch (type) {
    case "calendar": return <CalendarMock />;
    case "booking":  return <BookingMock />;
    case "invoice":  return <InvoiceMock />;
    case "clients":  return <ClientsMock />;
    case "sms":      return <SmsMock />;
  }
}

// ── Sub-components ────────────────────────────────────────────────────────────

function FeatureCard({ icon, title, desc }: FeatureItem) {
  return (
    <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-100 hover:shadow-md hover:-translate-y-1 transition-all duration-300">
      <div className="w-12 h-12 rounded-xl bg-[#00D4AA]/10 flex items-center justify-center mb-5">{icon}</div>
      <h3 className="text-lg font-bold text-[#0A2540] mb-3">{title}</h3>
      <p className="text-slate-500 font-light leading-relaxed">{desc}</p>
    </div>
  );
}

function FeatureTabPanel({ tabs }: { tabs: FeatureTab[] }) {
  const [active, setActive] = useState(0);
  const tab = tabs[active];
  return (
    <div className="py-28 bg-[#060E1A] border-t border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <span className="inline-block px-4 py-1.5 rounded-full bg-[#00D4AA]/10 text-[#00D4AA] text-sm font-semibold mb-4 uppercase tracking-wider">
            POWERFUL TOOLS
          </span>
          <h2 className="text-4xl md:text-5xl font-black text-white tracking-tight">
            Everything in one place
          </h2>
          <p className="text-white/50 text-lg mt-4 max-w-2xl mx-auto font-light">
            No juggling apps. No spreadsheets. Everything your business needs runs in Certxa.
          </p>
        </div>

        {/* Tab buttons */}
        <div className="flex flex-wrap justify-center gap-2 mb-12">
          {tabs.map((t, i) => (
            <button
              key={t.label}
              onClick={() => setActive(i)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold transition-all duration-200
                ${active === i
                  ? "bg-[#00D4AA] text-[#0A2540] shadow-[0_0_20px_rgba(0,212,170,0.3)]"
                  : "bg-white/8 text-white/60 hover:bg-white/12 hover:text-white border border-white/10"}`}
            >
              {t.icon}
              {t.label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <motion.div
          key={active}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center"
        >
          {/* Left — text */}
          <div>
            <h3 className="text-3xl font-black text-white mb-3 tracking-tight">{tab.heading}</h3>
            <p className="text-white/60 font-light leading-relaxed mb-8">{tab.subheading}</p>
            <ul className="space-y-4">
              {tab.bullets.map((b, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#00D4AA]/15">
                    <Check className="w-3 h-3 text-[#00D4AA]" />
                  </span>
                  <span className="text-white/80 text-sm leading-relaxed">{b}</span>
                </li>
              ))}
            </ul>
            <Link to="/auth?mode=register" className="inline-block mt-10">
              <Button className="bg-[#00D4AA] hover:bg-[#00D4AA]/90 text-[#0A2540] font-bold rounded-full px-7 h-12">
                Try {tab.label} Free <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </Link>
          </div>

          {/* Right — mock UI */}
          <div className="lg:pl-6">
            <TabMock type={tab.mockType} />
          </div>
        </motion.div>
      </div>
    </div>
  );
}

function HowItWorks({ steps }: { steps: HowItWorksStep[] }) {
  return (
    <div className="py-32 bg-[#0A2540] text-white relative overflow-hidden">
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#00D4AA]/10 blur-[120px] rounded-full mix-blend-screen pointer-events-none" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-20">
          <span className="inline-block px-4 py-1.5 rounded-full bg-[#00D4AA]/10 text-[#00D4AA] text-sm font-semibold mb-4">SIMPLE SETUP</span>
          <h2 className="text-4xl md:text-5xl font-black mb-6 tracking-tight">Up and Running in Minutes</h2>
          <p className="text-white/70 text-xl max-w-2xl mx-auto font-light">No tech skills needed. If you can use a phone, you can set up Certxa.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {steps.map(({ step, title, desc }) => (
            <div key={step} className="flex flex-col items-start gap-4">
              <span className="text-6xl font-black text-[#00D4AA]/20">{step}</span>
              <h3 className="text-2xl font-bold text-white">{title}</h3>
              <p className="text-white/60 font-light leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function TestimonialsSection({ items }: { items: Testimonial[] }) {
  return (
    <div className="py-32 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-20">
          <h2 className="text-4xl md:text-5xl font-black mb-6 tracking-tight text-[#0A2540]">What Pros Are Saying</h2>
          <p className="text-slate-500 text-xl max-w-2xl mx-auto font-light">Real feedback from real service professionals.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {items.map((t) => (
            <div key={t.name} className="bg-white rounded-2xl p-8 shadow-sm border border-slate-100">
              <div className="flex gap-1 mb-4">{[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 fill-[#00D4AA] text-[#00D4AA]" />)}</div>
              <p className="text-slate-700 font-light leading-relaxed mb-6 italic">"{t.quote}"</p>
              <div>
                <p className="font-bold text-[#0A2540]">{t.name}</p>
                <p className="text-slate-500 text-sm">{t.role}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function CompareTable({ title, subtitle, rows }: { title: string; subtitle: string; rows: [string, boolean, boolean][] }) {
  return (
    <div className="py-32 bg-[#060E1A] text-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-20">
          <h2 className="text-4xl md:text-5xl font-black mb-6 tracking-tight">{title}</h2>
          <p className="text-white/70 text-xl max-w-2xl mx-auto font-light">{subtitle}</p>
        </div>
        <div className="rounded-3xl overflow-hidden border border-white/10">
          <div className="grid grid-cols-3 bg-[#0A2540] text-sm font-bold text-white/60 uppercase tracking-wider">
            <div className="p-5 border-b border-white/10">Feature</div>
            <div className="p-5 border-b border-l border-white/10 text-[#00D4AA] text-center">Certxa</div>
            <div className="p-5 border-b border-l border-white/10 text-center">Others</div>
          </div>
          {rows.map(([feature, certxa, others]) => (
            <div key={feature} className="grid grid-cols-3 border-b border-white/10 last:border-0 hover:bg-white/5 transition-colors">
              <div className="p-5 text-white/80 font-medium">{feature}</div>
              <div className="p-5 border-l border-white/10 text-center">{certxa ? <span className="text-[#00D4AA] font-bold text-lg">✓</span> : <span className="text-white/20">—</span>}</div>
              <div className="p-5 border-l border-white/10 text-center">{others ? <span className="text-white/60 font-bold">✓</span> : <span className="text-white/20">—</span>}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function FaqSection({ faqs }: { faqs: FAQ[] }) {
  const [open, setOpen] = useState<number | null>(null);
  return (
    <div className="py-28 bg-slate-50">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <span className="inline-block px-4 py-1.5 rounded-full bg-[#00D4AA]/10 text-[#00D4AA] text-sm font-semibold mb-4 uppercase tracking-wider">FAQ</span>
          <h2 className="text-4xl font-black text-[#0A2540] tracking-tight">Common Questions</h2>
        </div>
        <div className="space-y-3">
          {faqs.map((f, i) => (
            <div key={i} className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm">
              <button
                className="w-full flex items-center justify-between px-7 py-5 text-left"
                onClick={() => setOpen(open === i ? null : i)}
              >
                <span className="font-bold text-[#0A2540] text-base pr-4">{f.q}</span>
                <ChevronDown className={`w-5 h-5 text-[#00D4AA] shrink-0 transition-transform duration-200 ${open === i ? "rotate-180" : ""}`} />
              </button>
              {open === i && (
                <div className="px-7 pb-6 text-slate-500 font-light leading-relaxed text-sm border-t border-slate-50 pt-4">
                  {f.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function CTASection({ headline, sub, context }: { headline: string; sub: string; context: string }) {
  return (
    <div className="py-32 relative overflow-hidden bg-gradient-to-br from-[#0A2540] to-[#00D4AA]/20">
      <div className="absolute inset-0 bg-[#060E1A]/80 mix-blend-overlay" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-3xl h-full bg-[#00D4AA]/10 blur-[100px] rounded-full pointer-events-none" />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
        <div className="flex justify-center mb-6"><ShieldCheck className="w-14 h-14 text-[#00D4AA]" /></div>
        <h2 className="text-5xl md:text-6xl font-black text-white mb-6 tracking-tight">{headline}</h2>
        <p className="text-white/80 text-xl mb-4 max-w-2xl mx-auto font-light">{sub}</p>
        <p className="text-white/50 text-base mb-12 max-w-xl mx-auto">{context}</p>
        <Link to="/auth?mode=register">
          <Button size="lg" className="h-16 px-10 text-xl rounded-full bg-[#00D4AA] hover:bg-[#00D4AA]/90 text-[#0A2540] font-bold shadow-[0_0_40px_rgba(0,212,170,0.4)] transition-all hover:scale-105">
            Start Free — No Credit Card Required <ArrowRight className="ml-3 w-6 h-6" />
          </Button>
        </Link>
        <p className="mt-6 text-white/40 text-sm">
          Questions? <a href="mailto:hello@certxa.com" className="underline hover:text-white/70 transition-colors">hello@certxa.com</a>
        </p>
      </div>
    </div>
  );
}

function PageFooter() {
  return (
    <footer className="bg-[#060E1A] py-12 border-t border-white/10">
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
          <Link to="/industries" className="text-sm text-white/50 hover:text-white transition-colors">All Industries</Link>
          <Link to="/pricing" className="text-sm text-white/50 hover:text-white transition-colors">Pricing</Link>
          <Link to="/privacy-policy" className="text-sm text-white/50 hover:text-white transition-colors">Privacy Policy</Link>
          <Link to="/staff-auth" className="text-sm text-white/50 hover:text-white transition-colors">Staff Login</Link>
        </div>
      </div>
    </footer>
  );
}

// ── Main Template ─────────────────────────────────────────────────────────────

export default function IndustryLandingTemplate({ config }: { config: IndustryConfig }) {
  useEffect(() => {
    const link = document.createElement("link");
    link.href = "https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap";
    link.rel = "stylesheet";
    document.head.appendChild(link);
    return () => { document.head.removeChild(link); };
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-[#00D4AA]/30" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>

      {/* Nav */}
      <nav className="fixed w-full z-50 bg-[#060E1A]/80 backdrop-blur-md border-b border-white/10 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-20 items-center">
            <Link to="/" className="flex items-center gap-3">
              <img src="/web-app.png" alt="Certxa" className="w-10 h-10 rounded-xl shadow-lg" />
              <span className="font-bold text-2xl tracking-tight text-white">Certxa</span>
            </Link>
            <div className="flex items-center gap-6">
              <BusinessTypeMenu />
              <Link to="/pricing"><Button variant="ghost" className="font-medium text-white/90 hover:text-white hover:bg-white/10">Pricing</Button></Link>
              <Link to="/auth"><Button variant="ghost" className="font-medium text-white/90 hover:text-white hover:bg-white/10">Log in</Button></Link>
              <Link to="/auth?mode=register"><Button className="bg-[#00D4AA] hover:bg-[#00D4AA]/90 text-[#0A2540] font-bold px-6 rounded-full">Get Started</Button></Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-[#060E1A]">
        <div className="absolute inset-0 z-0">{config.heroVideo}</div>
        <div className="absolute inset-0 bg-gradient-to-b from-[#060E1A]/30 via-[#060E1A]/10 to-[#060E1A]/60 z-10" />
        <div className="relative z-20 text-center max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 mt-20">
          {/* Breadcrumb */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
            className="flex justify-center mb-6">
            <Link to="/industries" className="text-white/40 hover:text-[#00D4AA] text-xs font-medium transition-colors flex items-center gap-1.5">
              ← All Industries
            </Link>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20 backdrop-blur-md mb-8">
            <span className="flex h-2 w-2 rounded-full bg-[#00D4AA] animate-pulse" />
            <span className="text-sm font-medium text-white/90">{config.badge}</span>
          </motion.div>
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }}
            className="text-6xl md:text-7xl lg:text-8xl font-black text-white mb-6 tracking-tight leading-[1.1]">
            {config.headlineLine1}<br /><span className="text-[#00D4AA]">{config.headlineLine2}</span>
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }}
            className="text-lg md:text-xl text-white/80 mb-10 max-w-3xl mx-auto leading-relaxed font-light">
            {config.subheadline}
          </motion.p>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <Link to="/auth?mode=register">
              <Button size="lg" className="h-14 px-8 text-lg rounded-full bg-[#00D4AA] hover:bg-[#00D4AA]/90 text-[#0A2540] font-bold shadow-[0_0_30px_rgba(0,212,170,0.3)] transition-all hover:scale-105">
                Start Free Trial <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
          </motion.div>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1, delay: 0.8 }}
            className="flex flex-wrap justify-center gap-3 text-sm font-medium text-white/70">
            <span className="px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm">✅ No credit card required</span>
            <span className="px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm">✅ 60-day free trial</span>
            <span className="px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm">✅ Set up in under 5 minutes</span>
          </motion.div>
        </div>
      </div>

      {/* Trust / Competitor Bar */}
      <div className="bg-[#0A2540] py-6 border-y border-white/10 relative z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <p className="text-white/80 font-medium text-lg flex items-center gap-3">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00D4AA] opacity-75" />
                <span className="relative inline-flex rounded-full h-3 w-3 bg-[#00D4AA]" />
              </span>
              {config.trustText}
            </p>
            <div className="flex flex-wrap justify-center gap-8 text-white/60 font-medium text-sm md:text-base">
              {config.competitors.map(c => (
                <div key={c} className="flex items-center gap-2">
                  <span className="text-[#00D4AA] font-bold">✓</span> {c}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="bg-[#060E1A] py-20 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {config.stats.map(s => (
              <div key={s.label}>
                <p className="text-4xl md:text-5xl font-black text-[#00D4AA] mb-2">{s.value}</p>
                <p className="text-white/60 font-medium">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Feature Cards Grid */}
      <div className="py-32 bg-slate-50 text-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <span className="inline-block px-4 py-1.5 rounded-full bg-[#00D4AA]/10 text-[#00D4AA] text-sm font-semibold mb-4">
              {config.featuresLabel}
            </span>
            <h2 className="text-4xl md:text-5xl font-black mb-6 tracking-tight text-[#0A2540]">{config.featuresTitle}</h2>
            <p className="text-slate-500 text-xl max-w-2xl mx-auto font-light">{config.featuresSubtitle}</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {config.features.map(f => <FeatureCard key={f.title} {...f} />)}
          </div>
        </div>
      </div>

      {/* Feature Tab Panel */}
      <FeatureTabPanel tabs={config.featureTabs} />

      {/* How It Works */}
      <HowItWorks steps={config.howItWorksSteps} />

      {/* Testimonials */}
      <TestimonialsSection items={config.testimonials} />

      {/* Compare Table */}
      <CompareTable title={config.compareTitle} subtitle={config.compareSubtitle} rows={config.compareRows} />

      {/* Revenue Calculator */}
      <RevenueCalculator defaultIndustry={config.industryId} />

      {/* FAQ */}
      <FaqSection faqs={config.faqs} />

      {/* CTA */}
      <CTASection headline={config.ctaHeadline} sub={config.ctaSub} context={config.ctaContext} />

      <PageFooter />
    </div>
  );
}
