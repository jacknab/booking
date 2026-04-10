import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Calendar, DollarSign, Smartphone, Star, ShieldCheck, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import { useEffect } from "react";
import BusinessTypeMenu from "./components/BusinessTypeMenu";

const TRADE_SERVICES = [
  { emoji: "🏠", label: "House Cleaning",    desc: "Recurring bookings, team scheduling, and instant invoicing.",              path: "/house-cleaning",  live: true  },
  { emoji: "🔧", label: "Handyman",          desc: "Job site notes, multi-trade service catalog, and online payments.",        path: "/handyman",        live: true  },
  { emoji: "🌿", label: "Lawn Care",         desc: "Recurring mowing schedules, seasonal contracts, and crew dispatch.",       path: "/lawn-care",       live: true  },
  { emoji: "❄️", label: "Snow Removal",      desc: "On-demand dispatch, route planning, and contract billing.",                path: "/snow-removal",    live: true  },
  { emoji: "💦", label: "Pressure Washing",  desc: "Before/after photos, property history, and flat-rate quoting.",           path: null,               live: false },
  { emoji: "🪟", label: "Window Cleaning",   desc: "Residential and commercial scheduling with recurring job support.",        path: null,               live: false },
  { emoji: "🧹", label: "Carpet Cleaning",   desc: "Quote by room, track chemicals and equipment, collect deposits.",          path: null,               live: false },
  { emoji: "🪲", label: "Pest Control",      desc: "Subscription plans, treatment logs, and chemical usage tracking.",         path: null,               live: false },
  { emoji: "🏊", label: "Pool Service",      desc: "Weekly route management, chemical readings, and service history.",         path: null,               live: false },
  { emoji: "🔌", label: "Appliance Repair",  desc: "Parts tracking, warranty notes, and same-day emergency bookings.",         path: null,               live: false },
  { emoji: "🎨", label: "Painting",          desc: "Detailed estimates, color notes, and multi-crew project tracking.",        path: null,               live: false },
  { emoji: "📦", label: "Moving & Junk",     desc: "Multi-crew dispatch, truck scheduling, and job-site inventory.",           path: null,               live: false },
  { emoji: "🌡️", label: "HVAC",             desc: "Service agreements, equipment tracking, and emergency dispatch.",          path: null,               live: false },
  { emoji: "🚿", label: "Plumbing",          desc: "Emergency bookings, part-level invoicing, and job site photos.",           path: null,               live: false },
  { emoji: "⚡", label: "Electrical",        desc: "Permit notes, equipment lists, and team-level job assignment.",            path: null,               live: false },
];

const PERSONAL_SERVICES = [
  { emoji: "🐕", label: "Dog Walking",       desc: "GPS-tracked walks, daily reports, and recurring client plans.",            path: "/dog-walking",     live: true  },
  { emoji: "📚", label: "Tutoring",          desc: "Session scheduling, progress notes, and subscription billing.",            path: "/tutoring",        live: true  },
  { emoji: "🐾", label: "Pet Grooming",      desc: "Breed notes, photo records, and recurring appointment management.",        path: "/groomers",        live: true  },
  { emoji: "🚗", label: "Ride Service",      desc: "On-demand booking, route tracking, and per-mile billing.",                 path: "/ride-service",    live: true  },
  { emoji: "💪", label: "Personal Training", desc: "Package sessions, client progress tracking, and flexible scheduling.",     path: null,               live: false },
  { emoji: "📷", label: "Photography",       desc: "Portfolio booking, deposit collection, and package pricing.",              path: null,               live: false },
];

const BEAUTY_WELLNESS = [
  { emoji: "💇", label: "Hair Salons",       desc: "Chair-level booking, stylist schedules, and loyalty rewards.",             path: "/hair-salons",     live: true  },
  { emoji: "✂️", label: "Barbershops",       desc: "Walk-in queues, appointment booking, and retail product sales.",           path: "/barbers",         live: true  },
  { emoji: "💅", label: "Nail Salons",       desc: "Multi-technician scheduling, add-ons, and membership plans.",              path: "/nails",           live: true  },
  { emoji: "🧖", label: "Spas",              desc: "Treatment menus, couples booking, and automated reminders.",               path: "/spa",             live: true  },
  { emoji: "✨", label: "Estheticians",      desc: "Intake forms, skin treatment history, and client retention tools.",        path: "/estheticians",    live: true  },
  { emoji: "🎨", label: "Tattoo Studios",    desc: "Deposit booking, design notes, and multi-artist scheduling.",              path: "/tattoo",          live: true  },
  { emoji: "🪒", label: "Walk-In Haircuts",  desc: "Live wait-time display, digital queue, and no-app check-in.",             path: "/haircuts",        live: true  },
];

const STATS = [
  { value: "30,000+", label: "Service Pros" },
  { value: "2M+",     label: "Appointments Booked" },
  { value: "4.9★",    label: "Average Rating" },
  { value: "8 hrs",   label: "Saved Per Week" },
];

const PLATFORM_FEATURES = [
  { icon: <Calendar className="w-5 h-5 text-[#00D4AA]" />,   label: "Online Booking",  desc: "Let clients book 24/7 — no calls needed." },
  { icon: <DollarSign className="w-5 h-5 text-[#00D4AA]" />, label: "Invoicing",       desc: "Send invoices from your phone and get paid fast." },
  { icon: <Smartphone className="w-5 h-5 text-[#00D4AA]" />, label: "SMS Reminders",   desc: "Automatic texts cut no-shows dramatically." },
  { icon: <Star className="w-5 h-5 text-[#00D4AA]" />,       label: "Review Collection", desc: "Auto-request reviews after every completed job." },
];

function IndustryCard({ emoji, label, desc, path, live }: {
  emoji: string; label: string; desc: string; path: string | null; live: boolean;
}) {
  const inner = (
    <div
      className={`group relative flex flex-col gap-3 p-6 rounded-2xl border transition-all duration-300 h-full
        ${live
          ? "bg-[#0D1F35] border-white/10 hover:border-[#00D4AA]/40 hover:bg-[#00D4AA]/5 hover:-translate-y-1 hover:shadow-[0_8px_32px_rgba(0,212,170,0.12)] cursor-pointer"
          : "bg-[#0D1F35]/50 border-white/5 opacity-50 cursor-default"
        }`}
    >
      <div className="flex items-start justify-between">
        <span className="text-3xl leading-none">{emoji}</span>
        {!live && (
          <span className="text-[10px] font-bold uppercase tracking-widest text-white/30 border border-white/15 rounded-full px-2 py-0.5">
            Soon
          </span>
        )}
        {live && (
          <ChevronRight className="w-4 h-4 text-white/20 group-hover:text-[#00D4AA] group-hover:translate-x-0.5 transition-all duration-200" />
        )}
      </div>
      <div>
        <h3 className="font-bold text-white text-base mb-1">{label}</h3>
        <p className="text-white/50 text-sm leading-relaxed font-light">{desc}</p>
      </div>
    </div>
  );

  if (live && path) {
    return <Link to={path} className="block h-full">{inner}</Link>;
  }
  return <div className="h-full">{inner}</div>;
}

function CategorySection({ title, subtitle, items }: {
  title: string; subtitle: string;
  items: typeof TRADE_SERVICES;
}) {
  return (
    <div className="mb-20">
      <div className="flex items-end justify-between mb-8">
        <div>
          <h2 className="text-2xl md:text-3xl font-black text-white tracking-tight">{title}</h2>
          <p className="text-white/40 text-sm mt-1 font-light">{subtitle}</p>
        </div>
        <span className="text-xs font-semibold text-white/30 uppercase tracking-widest hidden sm:block">
          {items.filter(i => i.live).length} live · {items.filter(i => !i.live).length} coming soon
        </span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {items.map((item) => (
          <IndustryCard key={item.label} {...item} />
        ))}
      </div>
    </div>
  );
}

export default function IndustriesHub() {
  useEffect(() => {
    const link = document.createElement("link");
    link.href = "https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap";
    link.rel = "stylesheet";
    document.head.appendChild(link);
    return () => { document.head.removeChild(link); };
  }, []);

  return (
    <div className="min-h-screen bg-[#060E1A] text-foreground selection:bg-[#00D4AA]/30" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>

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
              <Link to="/pricing">
                <Button variant="ghost" className="font-medium text-white/90 hover:text-white hover:bg-white/10">Pricing</Button>
              </Link>
              <Link to="/auth">
                <Button variant="ghost" className="font-medium text-white/90 hover:text-white hover:bg-white/10">Log in</Button>
              </Link>
              <Link to="/auth?mode=register">
                <Button className="bg-[#00D4AA] hover:bg-[#00D4AA]/90 text-[#0A2540] font-bold px-6 rounded-full">Get Started</Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <div className="relative min-h-[90vh] flex items-center justify-center overflow-hidden pt-20">
        {/* Ambient glows */}
        <div className="absolute top-[-10%] left-[-5%] w-[600px] h-[600px] bg-[#00D4AA]/8 blur-[140px] rounded-full pointer-events-none" />
        <div className="absolute bottom-[-10%] right-[-5%] w-[500px] h-[500px] bg-indigo-600/8 blur-[140px] rounded-full pointer-events-none" />
        {/* Dot-grid texture */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: "radial-gradient(circle, #ffffff 1px, transparent 1px)",
            backgroundSize: "32px 32px",
          }}
        />

        <div className="relative z-10 text-center max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/8 border border-white/15 backdrop-blur-md mb-8"
          >
            <span className="flex h-2 w-2 rounded-full bg-[#00D4AA] animate-pulse" />
            <span className="text-sm font-medium text-white/80">One platform. Every service industry.</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55, delay: 0.1 }}
            className="text-6xl md:text-7xl lg:text-8xl font-black text-white mb-6 tracking-tight leading-[1.05]"
          >
            Built for the<br /><span className="text-[#00D4AA]">Way You Work.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }}
            className="text-lg md:text-xl text-white/70 mb-10 max-w-3xl mx-auto leading-relaxed font-light"
          >
            Certxa is the all-in-one booking, scheduling, and payment platform trusted by service pros across every trade and industry — from solo operators to growing crews.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-14"
          >
            <Link to="/auth?mode=register">
              <Button size="lg" className="h-14 px-10 text-lg rounded-full bg-[#00D4AA] hover:bg-[#00D4AA]/90 text-[#0A2540] font-bold shadow-[0_0_40px_rgba(0,212,170,0.3)] transition-all hover:scale-105">
                Start Free Trial <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
            <Link to="/pricing">
              <Button size="lg" variant="ghost" className="h-14 px-8 text-lg rounded-full text-white/80 hover:text-white hover:bg-white/10 border border-white/10">
                View Pricing
              </Button>
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1, delay: 0.6 }}
            className="flex flex-wrap justify-center gap-3 text-sm font-medium text-white/60"
          >
            <span className="px-4 py-2 rounded-full bg-white/5 border border-white/10">✅ No credit card required</span>
            <span className="px-4 py-2 rounded-full bg-white/5 border border-white/10">✅ 60-day free trial</span>
            <span className="px-4 py-2 rounded-full bg-white/5 border border-white/10">✅ Set up in under 5 minutes</span>
          </motion.div>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="bg-[#0A2540] py-10 border-y border-white/10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {STATS.map((s) => (
              <div key={s.label}>
                <p className="text-4xl md:text-5xl font-black text-[#00D4AA] mb-1">{s.value}</p>
                <p className="text-white/50 font-medium text-sm">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Industry Grid */}
      <div className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">

          <div className="text-center mb-16">
            <span className="inline-block px-4 py-1.5 rounded-full bg-[#00D4AA]/10 text-[#00D4AA] text-sm font-semibold mb-4 uppercase tracking-wider">
              50+ Industries Supported
            </span>
            <h2 className="text-4xl md:text-5xl font-black text-white tracking-tight mb-4">
              Find Your Industry
            </h2>
            <p className="text-white/50 text-lg max-w-2xl mx-auto font-light">
              Every industry gets tools tailored to how it actually works — not a one-size-fits-all generic app.
            </p>
          </div>

          <CategorySection
            title="Home & Trade Services"
            subtitle="Field service, gig work, and home improvement pros"
            items={TRADE_SERVICES}
          />
          <CategorySection
            title="Personal & Pet Services"
            subtitle="Independent service providers and specialty care"
            items={PERSONAL_SERVICES}
          />
          <CategorySection
            title="Beauty & Wellness"
            subtitle="Salons, studios, and personal care professionals"
            items={BEAUTY_WELLNESS}
          />
        </div>
      </div>

      {/* Platform Feature Strip */}
      <div className="bg-[#0A2540] py-20 border-y border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <span className="inline-block px-4 py-1.5 rounded-full bg-[#00D4AA]/10 text-[#00D4AA] text-sm font-semibold mb-4 uppercase tracking-wider">
              The Platform
            </span>
            <h2 className="text-3xl md:text-4xl font-black text-white tracking-tight">
              Every industry. The same powerful tools.
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {PLATFORM_FEATURES.map((f) => (
              <div key={f.label} className="bg-[#060E1A]/60 border border-white/10 rounded-2xl p-6 hover:border-[#00D4AA]/30 transition-colors">
                <div className="w-10 h-10 rounded-xl bg-[#00D4AA]/10 flex items-center justify-center mb-4">
                  {f.icon}
                </div>
                <h3 className="font-bold text-white mb-1">{f.label}</h3>
                <p className="text-white/50 text-sm font-light leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Testimonial strip */}
      <div className="py-20 bg-[#060E1A]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { quote: "I went from losing jobs because I didn't answer the phone fast enough, to having a full calendar every week. Certxa changed how I run my whole operation.", name: "Marcus W.", role: "Handyman · Atlanta, GA" },
              { quote: "My cleaning crew is fully booked two weeks out. The recurring scheduling and automated reminders mean I barely touch the calendar anymore.", name: "Sara M.", role: "House Cleaning · Austin, TX" },
              { quote: "I added online booking to my barbershop page on a Tuesday. By Thursday I had 11 new clients. It literally sells for you while you're working.", name: "Jordan T.", role: "Barbershop Owner · Chicago, IL" },
            ].map((t) => (
              <div key={t.name} className="bg-[#0D1F35] rounded-2xl p-8 border border-white/8">
                <div className="flex gap-1 mb-5">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-[#00D4AA] text-[#00D4AA]" />
                  ))}
                </div>
                <p className="text-white/70 font-light leading-relaxed mb-6 italic">"{t.quote}"</p>
                <div>
                  <p className="font-bold text-white">{t.name}</p>
                  <p className="text-white/40 text-sm">{t.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Final CTA */}
      <div className="py-32 relative overflow-hidden bg-gradient-to-br from-[#0A2540] to-[#00D4AA]/15">
        <div className="absolute inset-0 bg-[#060E1A]/70 mix-blend-overlay" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-3xl h-80 bg-[#00D4AA]/10 blur-[100px] rounded-full pointer-events-none" />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="flex justify-center mb-6">
            <ShieldCheck className="w-14 h-14 text-[#00D4AA]" />
          </div>
          <h2 className="text-5xl md:text-6xl font-black text-white mb-6 tracking-tight">
            Your Industry. Your Rules.
          </h2>
          <p className="text-white/70 text-xl mb-4 max-w-2xl mx-auto font-light">
            Start your 60-day free trial and see why thousands of service pros switched to Certxa.
          </p>
          <p className="text-white/40 text-base mb-12 max-w-xl mx-auto">
            No credit card required. No tech skills needed. Cancel any time.
          </p>
          <Link to="/auth?mode=register">
            <Button size="lg" className="h-16 px-10 text-xl rounded-full bg-[#00D4AA] hover:bg-[#00D4AA]/90 text-[#0A2540] font-bold shadow-[0_0_40px_rgba(0,212,170,0.4)] transition-all hover:scale-105">
              Start Free Today <ArrowRight className="ml-3 w-6 h-6" />
            </Button>
          </Link>
          <p className="mt-6 text-white/30 text-sm">
            Questions? <a href="mailto:hello@certxa.com" className="underline hover:text-white/60 transition-colors">hello@certxa.com</a>
          </p>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-[#060E1A] py-12 border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-3">
              <img src="/web-app.png" alt="Certxa" className="w-10 h-10 rounded-xl grayscale opacity-70" />
              <span className="font-bold text-2xl text-white/70 tracking-tight">Certxa</span>
            </div>
            <p className="text-white/30 text-sm">© 2025 Certxa. All rights reserved.</p>
          </div>
          <div className="mt-8 pt-8 border-t border-white/10 flex flex-wrap items-center justify-center md:justify-end gap-8">
            <Link to="/" className="text-sm text-white/40 hover:text-white transition-colors">Home</Link>
            <Link to="/industries" className="text-sm text-white/40 hover:text-white transition-colors">Industries</Link>
            <Link to="/pricing" className="text-sm text-white/40 hover:text-white transition-colors">Pricing</Link>
            <Link to="/privacy-policy" className="text-sm text-white/40 hover:text-white transition-colors">Privacy</Link>
            <Link to="/terms-of-service" className="text-sm text-white/40 hover:text-white transition-colors">Terms</Link>
            <Link to="/staff-auth" className="text-sm text-white/40 hover:text-white transition-colors">Staff Login</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
