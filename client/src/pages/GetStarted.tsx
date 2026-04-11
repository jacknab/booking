import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, ArrowLeft, Calendar, Users, Wrench, CheckCircle2 } from "lucide-react";

const GROUPS = [
  {
    key: "booking",
    accent: "#00D4AA",
    icon: <Calendar className="w-6 h-6" />,
    label: "Certxa Booking",
    tag: "Appointment-Based",
    headline: "Fill your calendar.",
    sub: "For businesses that run on bookings and appointments.",
    video: "/videos/salon_booking.mp4",
    points: ["Online booking 24/7", "Automated reminders", "Staff scheduling", "Payments & POS"],
    who: ["Hair Salons", "Spas", "Nail Salons", "Pet Groomers", "Estheticians", "Tattoo Artists"],
  },
  {
    key: "queue",
    accent: "#F59E0B",
    icon: <Users className="w-6 h-6" />,
    label: "Certxa Queue",
    tag: "Walk-In Management",
    headline: "No appointments. No chaos.",
    sub: "For walk-in businesses that need virtual queuing and live wait times.",
    video: "/videos/barbershop_queue.mp4",
    points: ["QR code check-in", "Live queue display", "SMS 'you're next'", "Loyalty punch cards"],
    who: ["Barbershops", "Haircut Studios", "Walk-In Salons"],
  },
  {
    key: "pro",
    accent: "#3B82F6",
    icon: <Wrench className="w-6 h-6" />,
    label: "Certxa Pro",
    tag: "Field Service",
    headline: "Run the office. Empower the crew.",
    sub: "Office dispatch dashboard + mobile app for businesses that send crews into the field.",
    video: "/videos/handyman_pro.mp4",
    points: ["Office dispatch dashboard", "Crew mobile app", "GPS job routing", "Mobile invoicing"],
    who: ["HVAC", "Plumbing", "Electrical", "Lawn Care", "Roofing", "Pest Control"],
  },
];

export default function GetStarted() {
  return (
    <div className="min-h-screen bg-[#050C18] text-white font-['Plus_Jakarta_Sans',sans-serif]">
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500;600&display=swap');`}</style>

      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#050C18]/90 backdrop-blur-xl border-b border-white/8 h-16 flex items-center px-5 sm:px-8">
        <div className="max-w-7xl mx-auto w-full flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 text-white/50 hover:text-white transition-colors text-sm font-medium">
            <ArrowLeft className="w-4 h-4" />
            Back
          </Link>
          <Link to="/" className="flex items-center gap-2">
            <img src="/web-app.png" alt="Certxa" className="w-7 h-7 rounded-md" onError={e => { (e.target as HTMLImageElement).style.display = "none"; }} />
            <span className="font-extrabold text-base tracking-tight">Certxa</span>
          </Link>
          <Link to="/auth" className="text-white/50 hover:text-white text-sm font-medium transition-colors">
            Already have an account? <span className="text-white underline underline-offset-2">Log in</span>
          </Link>
        </div>
      </nav>

      {/* Hero text */}
      <div className="pt-28 pb-10 text-center px-4">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }}>
          <p className="text-white/35 text-xs font-bold uppercase tracking-[0.2em] mb-3">Step 1 of 3</p>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight mb-3">
            Which product fits your business?
          </h1>
          <p className="text-white/45 text-base max-w-md mx-auto">
            Pick the one that matches how you operate. You can switch later.
          </p>
        </motion.div>
      </div>

      {/* Cards */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {GROUPS.map((g, i) => (
            <motion.div
              key={g.key}
              initial={{ opacity: 0, y: 28 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="group relative flex flex-col rounded-3xl overflow-hidden border border-white/10 hover:border-opacity-40 transition-all duration-300 hover:shadow-2xl bg-[#0A1628]"
              style={{ boxShadow: `0 0 0 0 ${g.accent}00` }}
            >
              {/* Top accent line */}
              <div className="h-1 w-full flex-shrink-0" style={{ background: g.accent }} />

              {/* Video */}
              <div className="relative w-full overflow-hidden" style={{ aspectRatio: "16/9" }}>
                <video
                  src={g.video}
                  autoPlay muted loop playsInline
                  className="w-full h-full object-cover"
                />
                {/* Dark overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#0A1628] via-[#0A1628]/30 to-transparent" />

                {/* Booking card only: full glass + center strip */}
                {g.key === "booking" && (
                  <>
                    {/* Full frosted glass over entire video — very light */}
                    <div
                      className="absolute inset-0"
                      style={{
                        backdropFilter: "blur(2px)",
                        WebkitBackdropFilter: "blur(2px)",
                        background: "rgba(255,255,255,0.02)",
                      }}
                    />
                    {/* Center frosted strip — thin and subtle */}
                    <div
                      className="absolute inset-x-0 flex items-center justify-center"
                      style={{
                        top: "50%",
                        transform: "translateY(-50%)",
                        padding: "10px 28px",
                        backdropFilter: "blur(10px)",
                        WebkitBackdropFilter: "blur(10px)",
                        background: "rgba(5, 10, 22, 0.28)",
                        borderTop: "1px solid rgba(255,255,255,0.08)",
                        borderBottom: "1px solid rgba(255,255,255,0.08)",
                      }}
                    >
                      <span
                        style={{
                          fontFamily: "'Cormorant Garamond', serif",
                          fontSize: "22px",
                          fontWeight: "500",
                          color: "rgba(255,255,255,0.88)",
                          letterSpacing: "0.06em",
                        }}
                      >
                        Certxa Booking
                      </span>
                    </div>
                  </>
                )}

                {/* Badge */}
                <div className="absolute top-4 left-4">
                  <span
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold backdrop-blur-md shadow-lg"
                    style={{
                      background: "rgba(255,255,255,0.12)",
                      color: "#ffffff",
                      border: `1px solid rgba(255,255,255,0.25)`,
                      boxShadow: "0 4px 16px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.2)",
                      textShadow: "0 1px 2px rgba(0,0,0,0.4)",
                    }}
                  >
                    {g.icon}
                    {g.tag}
                  </span>
                </div>
              </div>

              {/* Content */}
              <div className="flex flex-col flex-1 p-6 gap-4">
                <div>
                  <p className="text-white/40 text-xs font-bold uppercase tracking-wider mb-1">{g.label}</p>
                  <h2 className="text-xl font-black text-white leading-tight mb-2">{g.headline}</h2>
                  <p className="text-white/50 text-sm leading-relaxed">{g.sub}</p>
                </div>

                {/* Feature bullets */}
                <ul className="space-y-2">
                  {g.points.map(p => (
                    <li key={p} className="flex items-center gap-2.5">
                      <CheckCircle2 className="w-4 h-4 flex-shrink-0" style={{ color: g.accent }} />
                      <span className="text-white/65 text-sm">{p}</span>
                    </li>
                  ))}
                </ul>

                {/* Who it's for */}
                <div className="flex flex-wrap gap-1.5">
                  {g.who.map(w => (
                    <span key={w} className="text-[11px] px-2.5 py-1 rounded-full font-medium"
                      style={{ background: g.accent + "12", color: g.accent, border: `1px solid ${g.accent}25` }}>
                      {w}
                    </span>
                  ))}
                </div>

                {/* CTA */}
                <Link
                  to={`/auth?mode=register&group=${g.key}`}
                  className="mt-auto w-full flex items-center justify-center gap-2 py-4 rounded-2xl font-bold text-base transition-all duration-200 hover:opacity-90 hover:scale-[1.02]"
                  style={{ background: g.accent, color: "#050C18" }}
                >
                  Start with {g.label.split(" ")[1]} <ArrowRight className="w-5 h-5" />
                </Link>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Bottom note */}
        <motion.p
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}
          className="text-center text-white/25 text-xs mt-10"
        >
          Free 60-day trial · No credit card required · Switch plans anytime
        </motion.p>
      </div>
    </div>
  );
}
