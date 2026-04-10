import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const BUSINESS_TYPES = [
  { label: "Barbers",         path: "/barbers",       emoji: "✂️" },
  { label: "Hair Salons",     path: "/hair-salons",   emoji: "💇" },
  { label: "Nail Salons",     path: "/nails",         emoji: "💅" },
  { label: "Spas",            path: "/spa",           emoji: "🧖" },
  { label: "Estheticians",    path: "/estheticians",  emoji: "✨" },
  { label: "Tattoo Studios",  path: "/tattoo",        emoji: "🎨" },
  { label: "Walk-In Haircuts",path: "/haircuts",      emoji: "🪒" },
  { label: "Pet Groomers",    path: "/groomers",      emoji: "🐾" },
  { label: "Dog Walking",     path: "/dog-walking",   emoji: "🐕" },
  { label: "House Cleaning",  path: "/house-cleaning",emoji: "🏠" },
  { label: "Handyman",        path: "/handyman",      emoji: "🔧" },
  { label: "Lawn Care",       path: "/lawn-care",     emoji: "🌿" },
  { label: "Snow Removal",    path: "/snow-removal",  emoji: "❄️" },
  { label: "Ride Service",    path: "/ride-service",  emoji: "🚗" },
  { label: "Tutoring",        path: "/tutoring",      emoji: "📚" },
];

export default function BusinessTypeMenu() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={ref} className="relative">
      <Button
        variant="ghost"
        className="font-medium text-white/90 hover:text-white hover:bg-white/10 flex items-center gap-1"
        onClick={() => setOpen((v) => !v)}
      >
        Industries
        <ChevronDown
          className={`w-4 h-4 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </Button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.97 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 mt-2 w-[420px] bg-[#0D1F35]/95 backdrop-blur-md border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-50"
          >
            <div className="px-4 pt-4 pb-2">
              <p className="text-xs font-semibold text-white/40 uppercase tracking-widest">
                Browse by Industry
              </p>
            </div>
            <div className="grid grid-cols-2 gap-px bg-white/5 border-t border-white/5">
              {BUSINESS_TYPES.map((type) => (
                <Link
                  key={type.path}
                  to={type.path}
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 bg-[#0D1F35]/95 hover:bg-[#00D4AA]/10 hover:text-[#00D4AA] text-white/80 text-sm font-medium transition-colors group"
                >
                  <span className="text-lg leading-none">{type.emoji}</span>
                  <span className="group-hover:translate-x-0.5 transition-transform duration-150">
                    {type.label}
                  </span>
                </Link>
              ))}
            </div>
            <div className="px-4 py-3 border-t border-white/10">
              <Link
                to="/industries"
                onClick={() => setOpen(false)}
                className="text-xs text-white/40 hover:text-[#00D4AA] transition-colors"
              >
                View all industries →
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
