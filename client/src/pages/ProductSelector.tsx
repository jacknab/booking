import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowRight, Calendar, Users, Wrench,
  CheckCircle2, Smartphone, MapPin, Bell,
  Star, ChevronDown,
} from "lucide-react";

// ── Mockups ───────────────────────────────────────────────────────────────────

function BookingMockup() {
  return (
    <div className="w-full max-w-sm bg-[#010B14] rounded-2xl border border-[#00D4AA]/20 shadow-2xl overflow-hidden">
      <div className="bg-[#011A26] px-5 py-4 border-b border-white/8 flex items-center justify-between">
        <div>
          <p className="text-white font-bold text-sm">Studio Calendar</p>
          <p className="text-white/40 text-xs">Thursday, April 10</p>
        </div>
        <span className="text-[10px] font-bold bg-[#00D4AA]/15 text-[#00D4AA] px-2.5 py-1 rounded-full border border-[#00D4AA]/25">
          4 Booked
        </span>
      </div>
      <div className="p-4 space-y-2.5">
        {[
          { time: "9:00 AM",  name: "Mia K.",   svc: "Blowout",        active: false },
          { time: "10:30 AM", name: "Sarah L.",  svc: "Color + Cut",   active: true  },
          { time: "12:00 PM", name: "Priya T.",  svc: "Deep Condition", active: false },
          { time: "2:00 PM",  name: "Open Slot", svc: "— Available —",  active: false },
          { time: "3:30 PM",  name: "Elena G.",  svc: "Highlights",     active: false },
        ].map((r, i) => (
          <div key={i} className={`flex items-center gap-3 rounded-xl px-3.5 py-3 ${r.active ? "bg-[#00D4AA]/10 border border-[#00D4AA]/25" : "bg-white/4"}`}>
            <div className={`w-1 rounded-full self-stretch min-h-[28px] flex-shrink-0 ${r.active ? "bg-[#00D4AA]" : r.name === "Open Slot" ? "bg-white/15" : "bg-[#00D4AA]/40"}`} />
            <span className={`text-[11px] w-16 flex-shrink-0 ${r.active ? "text-[#00D4AA]" : "text-white/35"}`}>{r.time}</span>
            <span className={`text-sm font-semibold flex-1 ${r.active ? "text-white" : r.name === "Open Slot" ? "text-white/25" : "text-white/75"}`}>{r.name}</span>
            <span className={`text-[11px] ${r.active ? "text-[#00D4AA]/80" : "text-white/30"}`}>{r.svc}</span>
          </div>
        ))}
      </div>
      <div className="mx-4 mb-4 bg-[#00D4AA]/8 border border-[#00D4AA]/15 rounded-xl px-4 py-3 flex items-center gap-2.5">
        <Bell className="w-3.5 h-3.5 text-[#00D4AA] flex-shrink-0" />
        <p className="text-white/50 text-[11px]">Reminders sent automatically 24 hrs before</p>
      </div>
    </div>
  );
}

function QueueMockup() {
  return (
    <div className="w-full max-w-sm bg-[#110800] rounded-2xl border border-[#F59E0B]/20 shadow-2xl overflow-hidden">
      <div className="bg-[#1A0E00] px-5 py-4 border-b border-white/8 flex items-center justify-between">
        <div>
          <p className="text-[#F59E0B] text-[10px] font-bold uppercase tracking-widest">Live Queue</p>
          <p className="text-white font-bold text-sm">Studio A — Walk-Ins</p>
        </div>
        <div className="text-right">
          <p className="text-white/35 text-[10px]">Avg Wait</p>
          <p className="text-[#F59E0B] font-extrabold text-lg leading-none">~14 min</p>
        </div>
      </div>
      <div className="p-4 space-y-2">
        {[
          { pos: 1, name: "Jake R.",   wait: "In Chair",  active: true  },
          { pos: 2, name: "Deon W.",   wait: "~8 min",    active: false },
          { pos: 3, name: "Maria S.",  wait: "~22 min",   active: false },
          { pos: 4, name: "Troy M.",   wait: "~36 min",   active: false },
          { pos: 5, name: "Keisha P.", wait: "~50 min",   active: false },
        ].map(r => (
          <div key={r.pos} className={`flex items-center gap-3 rounded-xl px-3.5 py-3 ${r.active ? "bg-[#F59E0B]/10 border border-[#F59E0B]/25" : "bg-white/4"}`}>
            <span className={`text-xs font-extrabold w-6 text-center ${r.active ? "text-[#F59E0B]" : "text-white/25"}`}>#{r.pos}</span>
            <span className={`text-sm font-semibold flex-1 ${r.active ? "text-white" : "text-white/70"}`}>{r.name}</span>
            <span className={`text-xs font-bold ${r.active ? "text-[#F59E0B]" : "text-white/35"}`}>{r.wait}</span>
          </div>
        ))}
      </div>
      <div className="mx-4 mb-4 bg-[#F59E0B]/8 border border-[#F59E0B]/15 rounded-xl px-4 py-3 flex items-center gap-2.5">
        <Smartphone className="w-3.5 h-3.5 text-[#F59E0B] flex-shrink-0" />
        <p className="text-white/50 text-[11px]">Customers join & track their spot from any phone</p>
      </div>
    </div>
  );
}

function ProMockup() {
  return (
    <div className="w-full max-w-sm bg-[#000D1F] rounded-2xl border border-[#3B82F6]/20 shadow-2xl overflow-hidden">
      <div className="bg-[#000F26] px-5 py-4 border-b border-white/8 flex items-center justify-between">
        <div>
          <p className="text-white font-bold text-sm">Dispatch Board</p>
          <p className="text-white/40 text-xs">Today · 3 active crews</p>
        </div>
        <span className="text-[10px] font-bold bg-[#3B82F6]/15 text-[#3B82F6] px-2.5 py-1 rounded-full border border-[#3B82F6]/25">
          Live
        </span>
      </div>
      <div className="p-4 space-y-2.5">
        {[
          { crew: "Mike D.",  job: "HVAC Service",    time: "9:00 AM",  status: "En Route",    sc: "#3B82F6" },
          { crew: "Sara L.",  job: "Plumbing Repair", time: "11:00 AM", status: "In Progress",  sc: "#10B981" },
          { crew: "James P.", job: "Electrical",      time: "1:30 PM",  status: "Scheduled",   sc: "#6B7280" },
        ].map((r, i) => (
          <div key={i} className="bg-white/4 rounded-xl px-3.5 py-3 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg flex-shrink-0 flex items-center justify-center" style={{ background: r.sc + "18" }}>
              <Wrench className="w-3.5 h-3.5" style={{ color: r.sc }} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white text-sm font-semibold truncate">{r.job}</p>
              <p className="text-white/35 text-[11px]">{r.crew} · {r.time}</p>
            </div>
            <span className="text-[10px] font-bold px-2 py-1 rounded-lg flex-shrink-0" style={{ background: r.sc + "18", color: r.sc }}>{r.status}</span>
          </div>
        ))}
      </div>
      <div className="mx-4 mb-4 bg-[#3B82F6]/8 border border-[#3B82F6]/15 rounded-xl px-4 py-3 flex items-center gap-2.5">
        <MapPin className="w-3.5 h-3.5 text-[#3B82F6] flex-shrink-0" />
        <p className="text-white/50 text-[11px]">Route-optimized · GPS live tracking on every job</p>
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function ProductSelector() {
  return (
    <div className="min-h-screen bg-[#050C18] text-white font-['Plus_Jakarta_Sans',sans-serif]">

      {/* ── Nav ── */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#050C18]/85 backdrop-blur-xl border-b border-white/8 h-16 flex items-center px-5 sm:px-8 lg:px-12">
        <div className="max-w-7xl mx-auto w-full flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <img src="/web-app.png" alt="Certxa" className="w-7 h-7 rounded-md shadow" onError={e => { (e.target as HTMLImageElement).style.display = "none"; }} />
            <span className="font-extrabold text-lg tracking-tight">Certxa</span>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/auth" className="text-white/55 hover:text-white text-sm font-medium transition-colors hidden sm:block">Log In</Link>
            <Link to="/auth?mode=register" className="bg-white text-[#050C18] font-bold text-sm px-5 py-2 rounded-xl hover:bg-white/90 transition-colors">
              Get Started Free
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="pt-36 pb-16 px-5 text-center relative overflow-hidden">
        {/* Subtle radial light */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[500px] bg-white/3 rounded-full blur-[120px]" />
        </div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="relative">
          <p className="text-white/40 text-sm font-semibold uppercase tracking-[0.2em] mb-5">
            The Business Platform Built for Service Pros
          </p>
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black leading-[1.05] tracking-tight mb-6 max-w-3xl mx-auto">
            One Platform.<br />
            <span className="text-white/30">Three Ways to Run</span><br />
            <span className="text-white">Your Business.</span>
          </h1>
          <p className="text-white/50 text-lg sm:text-xl max-w-xl mx-auto leading-relaxed mb-10">
            Pick the product that matches how your business actually works. Switch anytime.
          </p>
          <a href="#products" className="inline-flex flex-col items-center gap-2 text-white/30 hover:text-white/60 transition-colors group">
            <span className="text-xs font-semibold uppercase tracking-widest">Choose Your Product</span>
            <ChevronDown className="w-5 h-5 animate-bounce" />
          </a>
        </motion.div>
      </section>

      {/* ── Products ── */}
      <div id="products" className="space-y-0">

        {/* ── 1: Booking (Teal) ── */}
        <section className="relative overflow-hidden">
          {/* Full-bleed teal background */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#001F1A] via-[#00120F] to-[#050C18]" />
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[#00D4AA]/10 rounded-full blur-[120px] pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-[#00D4AA]/5 rounded-full blur-[80px] pointer-events-none" />

          <div className="relative max-w-7xl mx-auto px-5 sm:px-8 lg:px-12 py-24 lg:py-32">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

              {/* Copy */}
              <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.55 }}>
                <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-full bg-[#00D4AA]/12 border border-[#00D4AA]/25 mb-6">
                  <Calendar className="w-4 h-4 text-[#00D4AA]" />
                  <span className="text-[#00D4AA] text-sm font-bold">Certxa Booking</span>
                  <span className="text-[#00D4AA]/50 text-xs">· Appointment-Based</span>
                </div>

                <h2 className="text-4xl sm:text-5xl font-black leading-[1.1] tracking-tight mb-5">
                  Your calendar,<br />
                  <span className="text-[#00D4AA]">fully booked.</span>
                </h2>

                <p className="text-white/55 text-lg leading-relaxed mb-8 max-w-lg">
                  Built for businesses that run on appointments. Let clients book online 24/7, automate your reminders, and manage your entire team's schedule from one dashboard.
                </p>

                <ul className="space-y-3 mb-10">
                  {[
                    "24/7 online booking — clients book themselves",
                    "Automated SMS & email reminders cut no-shows by 40%",
                    "Staff scheduling, calendars & availability",
                    "Invoicing, POS & card payments built in",
                    "Client history, notes & loyalty tracking",
                  ].map(f => (
                    <li key={f} className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-[#00D4AA] flex-shrink-0 mt-0.5" />
                      <span className="text-white/70 text-sm leading-relaxed">{f}</span>
                    </li>
                  ))}
                </ul>

                <div className="flex flex-wrap gap-2 mb-8">
                  {["Hair Salons", "Spas", "Nail Salons", "Estheticians", "Pet Groomers", "Tattoo Artists", "Tutors"].map(t => (
                    <span key={t} className="text-xs px-3 py-1.5 rounded-full bg-[#00D4AA]/10 text-[#00D4AA]/80 border border-[#00D4AA]/15 font-medium">{t}</span>
                  ))}
                </div>

                <Link to="/booking">
                  <button className="inline-flex items-center gap-2.5 bg-[#00D4AA] text-[#050C18] font-bold text-base px-8 py-4 rounded-2xl hover:bg-[#00BF99] transition-colors shadow-lg shadow-[#00D4AA]/20">
                    Explore Certxa Booking <ArrowRight className="w-5 h-5" />
                  </button>
                </Link>
              </motion.div>

              {/* Mockup */}
              <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.1 }} className="flex justify-center lg:justify-end">
                <BookingMockup />
              </motion.div>
            </div>
          </div>
        </section>

        {/* ── 2: Queue (Amber) ── */}
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-bl from-[#1A0E00] via-[#100800] to-[#050C18]" />
          <div className="absolute top-0 left-0 w-[600px] h-[600px] bg-[#F59E0B]/8 rounded-full blur-[120px] pointer-events-none" />
          <div className="absolute bottom-0 right-0 w-[300px] h-[300px] bg-[#F59E0B]/5 rounded-full blur-[80px] pointer-events-none" />

          <div className="relative max-w-7xl mx-auto px-5 sm:px-8 lg:px-12 py-24 lg:py-32">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

              {/* Mockup first on this row */}
              <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.1 }} className="flex justify-center lg:justify-start order-2 lg:order-1">
                <QueueMockup />
              </motion.div>

              {/* Copy */}
              <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.55 }} className="order-1 lg:order-2">
                <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-full bg-[#F59E0B]/12 border border-[#F59E0B]/25 mb-6">
                  <Users className="w-4 h-4 text-[#F59E0B]" />
                  <span className="text-[#F59E0B] text-sm font-bold">Certxa Queue</span>
                  <span className="text-[#F59E0B]/50 text-xs">· Walk-In Management</span>
                </div>

                <h2 className="text-4xl sm:text-5xl font-black leading-[1.1] tracking-tight mb-5">
                  No appointments.<br />
                  <span className="text-[#F59E0B]">No problem.</span>
                </h2>

                <p className="text-white/55 text-lg leading-relaxed mb-8 max-w-lg">
                  Built for walk-in businesses. Customers hold their spot from their phone, a live display shows the queue in your shop, and automated texts bring them back in right on time.
                </p>

                <ul className="space-y-3 mb-10">
                  {[
                    "QR code check-in — customers join from any phone, no app needed",
                    "Live queue display on your shop TV or tablet",
                    "Auto-SMS 'you're next' alerts keep customers nearby",
                    "Digital loyalty punch cards that actually work",
                    "POS & payments built into the same system",
                  ].map(f => (
                    <li key={f} className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-[#F59E0B] flex-shrink-0 mt-0.5" />
                      <span className="text-white/70 text-sm leading-relaxed">{f}</span>
                    </li>
                  ))}
                </ul>

                <div className="flex flex-wrap gap-2 mb-8">
                  {["Barbershops", "Haircut Studios", "Walk-In Salons"].map(t => (
                    <span key={t} className="text-xs px-3 py-1.5 rounded-full bg-[#F59E0B]/10 text-[#F59E0B]/80 border border-[#F59E0B]/15 font-medium">{t}</span>
                  ))}
                </div>

                <Link to="/queue">
                  <button className="inline-flex items-center gap-2.5 bg-[#F59E0B] text-[#050C18] font-bold text-base px-8 py-4 rounded-2xl hover:bg-[#E08D00] transition-colors shadow-lg shadow-[#F59E0B]/20">
                    Explore Certxa Queue <ArrowRight className="w-5 h-5" />
                  </button>
                </Link>
              </motion.div>
            </div>
          </div>
        </section>

        {/* ── 3: Pro (Blue) ── */}
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-[#00091F] via-[#000B1A] to-[#050C18]" />
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[#3B82F6]/8 rounded-full blur-[120px] pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-[#3B82F6]/5 rounded-full blur-[80px] pointer-events-none" />

          <div className="relative max-w-7xl mx-auto px-5 sm:px-8 lg:px-12 py-24 lg:py-32">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

              {/* Copy */}
              <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.55 }}>
                <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-full bg-[#3B82F6]/12 border border-[#3B82F6]/25 mb-6">
                  <Wrench className="w-4 h-4 text-[#3B82F6]" />
                  <span className="text-[#3B82F6] text-sm font-bold">Certxa Pro</span>
                  <span className="text-[#3B82F6]/50 text-xs">· Field Service</span>
                </div>

                <h2 className="text-4xl sm:text-5xl font-black leading-[1.1] tracking-tight mb-5">
                  Dispatch crews.<br />
                  <span className="text-[#3B82F6]">Invoice on the spot.</span>
                </h2>

                <p className="text-white/55 text-lg leading-relaxed mb-8 max-w-lg">
                  Built for businesses that send people into the field. Schedule jobs, dispatch crews with GPS routing, track time, and invoice from the job site — all synced to QuickBooks.
                </p>

                <ul className="space-y-3 mb-10">
                  {[
                    "Smart job dispatching with GPS-optimized routing",
                    "Live crew tracking & field check-ins from mobile",
                    "Mobile invoicing — create & collect payment on-site",
                    "Time tracking, timesheets & crew scheduling",
                    "QuickBooks sync keeps your books clean automatically",
                  ].map(f => (
                    <li key={f} className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-[#3B82F6] flex-shrink-0 mt-0.5" />
                      <span className="text-white/70 text-sm leading-relaxed">{f}</span>
                    </li>
                  ))}
                </ul>

                <div className="flex flex-wrap gap-2 mb-8">
                  {["HVAC", "Plumbing", "Electrical", "Lawn Care", "Roofing", "Pest Control", "Pool Service", "+18 more"].map(t => (
                    <span key={t} className="text-xs px-3 py-1.5 rounded-full bg-[#3B82F6]/10 text-[#3B82F6]/80 border border-[#3B82F6]/15 font-medium">{t}</span>
                  ))}
                </div>

                <Link to="/pro">
                  <button className="inline-flex items-center gap-2.5 bg-[#3B82F6] text-white font-bold text-base px-8 py-4 rounded-2xl hover:bg-[#2563EB] transition-colors shadow-lg shadow-[#3B82F6]/25">
                    Explore Certxa Pro <ArrowRight className="w-5 h-5" />
                  </button>
                </Link>
              </motion.div>

              {/* Mockup */}
              <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.1 }} className="flex justify-center lg:justify-end">
                <ProMockup />
              </motion.div>
            </div>
          </div>
        </section>
      </div>

      {/* ── Trust Bar ── */}
      <section className="border-t border-white/8 bg-[#030810] py-16 px-5">
        <div className="max-w-5xl mx-auto">
          <p className="text-center text-white/30 text-xs font-bold uppercase tracking-[0.2em] mb-10">Trusted by service businesses across the US</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center mb-14">
            {[
              { value: "10,000+", label: "Active Businesses" },
              { value: "2.4M",    label: "Bookings Managed" },
              { value: "4.9 ★",   label: "Average Rating" },
              { value: "60 Days", label: "Free Trial, No Card" },
            ].map(s => (
              <div key={s.label}>
                <p className="text-3xl font-black text-white mb-1">{s.value}</p>
                <p className="text-white/40 text-sm font-medium">{s.label}</p>
              </div>
            ))}
          </div>

          {/* Testimonials */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[
              { q: "Certxa filled our calendar in the first week. Clients love being able to book at midnight. Our no-shows are basically gone.", name: "Jasmine R.", biz: "Luxe Hair Studio", product: "Booking", accent: "#00D4AA" },
              { q: "Our barbershop used to have people standing outside waiting. Now they wait down the street and walk in when we text them. Game changer.", name: "Marcus T.", biz: "Legacy Cuts",      product: "Queue",   accent: "#F59E0B" },
              { q: "We went from paper job sheets to dispatching 6 crews with GPS tracking and mobile invoicing. Revenue is up 35% in one quarter.", name: "Dave K.",    biz: "K&Sons HVAC",    product: "Pro",     accent: "#3B82F6" },
            ].map(t => (
              <div key={t.name} className="bg-white/4 border border-white/8 rounded-2xl p-6">
                <div className="flex gap-0.5 mb-4">
                  {[...Array(5)].map((_, i) => <Star key={i} className="w-3.5 h-3.5 fill-white/60 text-white/60" />)}
                </div>
                <p className="text-white/70 text-sm leading-relaxed mb-5">"{t.q}"</p>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white font-semibold text-sm">{t.name}</p>
                    <p className="text-white/35 text-xs">{t.biz}</p>
                  </div>
                  <span className="text-[11px] font-bold px-2.5 py-1 rounded-full" style={{ background: t.accent + "18", color: t.accent, border: `1px solid ${t.accent}30` }}>
                    {t.product}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Final CTA ── */}
      <section className="py-24 px-5 text-center border-t border-white/8">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <h2 className="text-4xl sm:text-5xl font-black tracking-tight mb-4">
            Not sure which one fits?
          </h2>
          <p className="text-white/50 text-lg mb-10 max-w-md mx-auto">
            Start a free 60-day trial on any product. No credit card. Switch plans anytime.
          </p>
          <Link to="/auth?mode=register">
            <button className="inline-flex items-center gap-3 bg-white text-[#050C18] font-bold text-lg px-10 py-5 rounded-2xl hover:bg-white/90 transition-colors shadow-2xl">
              Start Free — Pick Your Product <ArrowRight className="w-5 h-5" />
            </button>
          </Link>
          <p className="text-white/25 text-xs mt-5">Free 60 days · No credit card · Cancel anytime</p>
        </motion.div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-white/8 py-8 px-5">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="font-bold text-white/50 text-sm">Certxa</span>
          <p className="text-white/25 text-xs">© 2025 Certxa. All rights reserved.</p>
          <div className="flex gap-5">
            {[["Pricing", "/pricing"], ["Privacy", "/privacy-policy"], ["Terms", "/terms-of-service"]].map(([l, h]) => (
              <Link key={h} to={h} className="text-white/30 hover:text-white/60 text-xs transition-colors">{l}</Link>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}
