import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import {
  ArrowRight, ChevronLeft, ChevronRight
} from "lucide-react";
import { motion } from "framer-motion";
import HeroVideo from "./components/HeroVideo";
import { useEffect, useRef } from "react";

const businessTypeCards = [
  { id: "Hair Salon",     label: "Hair Salons",    description: "Haircuts, color & styling",           videoUrl: "/videos/hair_salon.mp4",     fallbackGradient: "from-rose-400 via-pink-500 to-fuchsia-600",    route: "/hair-salons" },
  { id: "Nail Salon",     label: "Nail Salons",    description: "Manicures, pedicures & nail art",     videoUrl: "/videos/nail_salon.mp4",     fallbackGradient: "from-violet-400 via-purple-500 to-indigo-600", route: "/nails" },
  { id: "Spa",            label: "Spas",           description: "Massage, facials & body treatments",  videoUrl: "/videos/spa.mp4",            fallbackGradient: "from-emerald-400 via-teal-500 to-cyan-600",    route: "/spa" },
  { id: "Barbershop",     label: "Barbershops",    description: "Cuts, fades & beard trims",           videoUrl: "/videos/barbershop.mp4",     fallbackGradient: "from-amber-400 via-orange-500 to-red-500",     route: "/barbers" },
  { id: "Esthetician",   label: "Estheticians",   description: "Skin care, facials & waxing",         videoUrl: "/videos/esthetician.mp4",    fallbackGradient: "from-sky-400 via-blue-500 to-indigo-500",      route: "/estheticians" },
  { id: "Pet Groomer",   label: "Pet Groomers",   description: "Grooming, baths & trims",             videoUrl: "/videos/pet_groomer.mp4",    fallbackGradient: "from-lime-400 via-green-500 to-teal-600",      route: "/groomers" },
  { id: "Tattoo Studio", label: "Tattoo Studios", description: "Tattoos, piercings & body art",       videoUrl: "/videos/tattoo_studio.mp4",  fallbackGradient: "from-slate-600 via-gray-700 to-zinc-800",      route: "/tattoo" },
  { id: "Other",         label: "Other Business", description: "Any appointment-based business",      videoUrl: "/videos/other_business.mp4", fallbackGradient: "from-pink-400 via-rose-500 to-orange-500",     route: "/auth" },
];

export default function Landing() {
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    // Inject Plus Jakarta Sans font
    const link = document.createElement('link');
    link.href = 'https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap';
    link.rel = 'stylesheet';
    document.head.appendChild(link);
    return () => { document.head.removeChild(link); }
  }, []);

  if (isAuthenticated) {
    window.location.href = "/calendar";
    return null;
  }

  return (
    <div className="min-h-screen bg-background text-foreground font-body selection:bg-[#00D4AA]/30">
      <nav className="fixed w-full z-50 bg-[#060E1A]/80 backdrop-blur-md border-b border-white/10 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-20 items-center">
            <div className="flex items-center gap-3">
              <img src="/web-app.png" alt="Certxa" className="w-10 h-10 rounded-xl shadow-lg" />
              <span className="font-bold text-2xl tracking-tight text-white" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Certxa</span>
            </div>
            <div className="flex items-center gap-6">
              <Link to="/pricing">
                <Button variant="ghost" className="font-bold text-base text-white/90 hover:text-white hover:bg-white/10" data-testid="link-pricing">Pricing</Button>
              </Link>
              <Link to="/auth">
                <Button variant="ghost" className="font-bold text-base text-white/90 hover:text-white hover:bg-white/10" data-testid="link-login">Log in</Button>
              </Link>
              <Link to="/auth?mode=register">
                <Button className="bg-[#00D4AA] hover:bg-[#00D4AA]/90 text-[#0A2540] font-bold px-6 rounded-full" data-testid="link-get-started">
                  Get Started
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative h-screen flex items-center justify-center overflow-hidden bg-[#060E1A]">
        <div className="absolute inset-0 z-0">
          <HeroVideo />
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-[#060E1A]/20 via-[#060E1A]/10 to-[#060E1A]/50 z-10" />
        
        <div className="relative z-20 text-center max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 mt-16 pointer-events-none">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20 backdrop-blur-md mb-8 pointer-events-auto"
          >
            <span className="flex h-2 w-2 rounded-full bg-[#00D4AA] animate-pulse"></span>
            <span className="text-sm font-medium text-white/90">The #1 Booking Platform for Beauty & Wellness</span>
          </motion.div>
          
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-6xl md:text-7xl lg:text-8xl font-black text-white mb-6 tracking-tight leading-[1.1]"
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
          >
            Your Calendar.<br />Fully Booked.
          </motion.h1>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-lg md:text-xl text-white/80 mb-10 max-w-3xl mx-auto leading-relaxed font-light"
          >
            Join 10,000+ businesses using Certxa to automate bookings, manage staff, and grow revenue. Built for salons, barbers, pet groomers, and more.
          </motion.p>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16 pointer-events-auto"
          >
            <Link to="/auth?mode=register">
              <Button size="lg" className="h-14 px-8 text-lg rounded-full bg-[#00D4AA] hover:bg-[#00D4AA]/90 text-[#0A2540] font-bold shadow-[0_0_30px_rgba(0,212,170,0.3)] transition-all hover:scale-105" data-testid="link-free-trial">
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
            <span className="px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm">💅 Nail Salons</span>
            <span className="px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm">✂️ Barbers</span>
            <span className="px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm">🐾 Pet Groomers</span>
            <span className="px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm">🧿 Acupuncturists</span>
            <span className="px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm">🎨 Tattoo Artists</span>
            <span className="px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm">💇 Hair Salons</span>
          </motion.div>
        </div>
      </div>

      {/* Business Types Section — Video Cards */}
      <div className="py-32 bg-[#060E1A] text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#00D4AA]/8 blur-[140px] rounded-full pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-[#7c3aed]/8 blur-[140px] rounded-full pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black mb-6 tracking-tight" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
              Built for Every Beauty & Wellness Business
            </h2>
            <p className="text-white/60 text-xl max-w-2xl mx-auto font-light">
              Select your business type to see how Certxa is tailored for you.
            </p>
          </div>

          <BusinessTypeCarousel />
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-32 relative overflow-hidden bg-gradient-to-br from-[#0A2540] to-[#00D4AA]/20">
        <div className="absolute inset-0 bg-[#060E1A]/80 mix-blend-overlay" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-3xl h-full bg-[#00D4AA]/10 blur-[100px] rounded-full" />
        
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <h2 className="text-5xl md:text-6xl font-black text-white mb-6 tracking-tight" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            Ready to Fill Your Calendar?
          </h2>
          <p className="text-white/80 text-xl mb-12 max-w-2xl mx-auto font-light">
            Join thousands of beauty professionals who trust Certxa to manage their business, from scheduling to checkout.
          </p>
          <Link to="/auth?mode=register">
            <Button size="lg" className="h-16 px-10 text-xl rounded-full bg-[#00D4AA] hover:bg-[#00D4AA]/90 text-[#0A2540] font-bold shadow-[0_0_40px_rgba(0,212,170,0.4)] transition-all hover:scale-105" data-testid="link-cta-bottom">
              Start Free — No Credit Card Required
              <ArrowRight className="ml-3 w-6 h-6" />
            </Button>
          </Link>
        </div>
      </div>

      <footer className="bg-[#060E1A] py-12 border-t border-white/10 relative z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-3">
              <img src="/web-app.png" alt="Certxa" className="w-10 h-10 rounded-xl grayscale opacity-70" />
              <span className="font-bold text-2xl text-white/80 tracking-tight" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Certxa</span>
            </div>
            <p className="text-white text-sm font-medium">
              © 2025 Certxa. All rights reserved.
            </p>
          </div>
          <div className="mt-8 pt-8 border-t border-white/10 flex flex-wrap items-center justify-center md:justify-end gap-8">
            <Link to="/privacy-policy" className="text-sm text-white font-medium hover:text-[#00D4AA] transition-colors">
              Privacy Policy
            </Link>
            <Link to="/terms-of-service" className="text-sm text-white font-medium hover:text-[#00D4AA] transition-colors">
              Terms of Service
            </Link>
            <Link to="/staff-auth" className="text-sm text-white font-medium hover:text-[#00D4AA] transition-colors">
              Staff Login
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

function BusinessTypeCarousel() {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (dir: "left" | "right") => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollBy({ left: dir === "right" ? 580 : -580, behavior: "smooth" });
  };

  return (
    <div className="relative">
      <button
        onClick={() => scroll("left")}
        className="absolute -left-5 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full border-2 border-white/80 bg-[#060E1A]/80 backdrop-blur-sm flex items-center justify-center text-white hover:border-white hover:bg-[#060E1A] transition-all shadow-xl"
        aria-label="Scroll left"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>

      <div
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto pb-4 scrollbar-none"
        style={{ scrollbarWidth: "none" }}
      >
        {businessTypeCards.map((type) => (
          <LandingBusinessCard key={type.id} type={type} />
        ))}
      </div>

      <button
        onClick={() => scroll("right")}
        className="absolute -right-5 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full border-2 border-white/80 bg-[#060E1A]/80 backdrop-blur-sm flex items-center justify-center text-white hover:border-white hover:bg-[#060E1A] transition-all shadow-xl"
        aria-label="Scroll right"
      >
        <ChevronRight className="w-5 h-5" />
      </button>
    </div>
  );
}

function LandingBusinessCard({ type }: {
  type: { id: string; label: string; description: string; videoUrl: string; fallbackGradient: string; route: string };
}) {
  const navigate = useNavigate();

  return (
    <div
      className="flex flex-col flex-shrink-0 cursor-pointer group"
      style={{ width: "260px" }}
      onClick={() => navigate(type.route)}
    >
      <div
        className={`relative w-full rounded-xl overflow-hidden bg-gradient-to-br ${type.fallbackGradient} shadow-md group-hover:shadow-[0_12px_36px_rgba(0,0,0,0.5)] transition-all duration-300`}
        style={{ aspectRatio: "3/4" }}
      >
        <video
          src={type.videoUrl}
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover opacity-60"
        />
        {/* Permanent dim overlay — matches hero gradient style */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#060E1A]/20 via-[#060E1A]/10 to-[#060E1A]/50 pointer-events-none" />
        {/* Hover overlay with label */}
        <div className="absolute opacity-0 group-hover:opacity-100 transition-all duration-200 inset-0 flex items-center justify-center bg-black/20 backdrop-blur-sm">
          <span className="bg-white text-[#0A2540] text-xs font-semibold px-4 py-2 rounded-full shadow-lg whitespace-nowrap">
            {type.label}
          </span>
        </div>
      </div>
      <div className="mt-3">
        <p className="font-semibold text-white text-sm leading-tight group-hover:text-[#00D4AA] transition-colors">{type.label}</p>
      </div>
    </div>
  );
}
