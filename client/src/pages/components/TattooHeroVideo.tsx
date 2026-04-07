import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const IMAGES = [
  "/tattoo-hero-1.png",
  "/tattoo-hero-2.png",
  "/tattoo-hero-3.png",
  "/tattoo-hero-4.png",
];

const DURATION = 7000;

export default function TattooHeroVideo() {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % IMAGES.length);
    }, DURATION);
    return () => clearTimeout(timer);
  }, [currentIndex]);

  return (
    <div className="absolute inset-0 w-full h-full overflow-hidden bg-[#0B0A0E]">
      {/* Deep red ambient orb */}
      <motion.div
        className="absolute rounded-full blur-[160px] pointer-events-none"
        animate={{
          width: currentIndex % 2 === 0 ? "65vw" : "50vw",
          height: currentIndex % 2 === 0 ? "65vw" : "50vw",
          x: currentIndex === 0 ? "-10%" : currentIndex === 1 ? "40%" : currentIndex === 2 ? "2%" : "28%",
          y: currentIndex === 0 ? "10%" : currentIndex === 1 ? "-8%" : currentIndex === 2 ? "18%" : "-3%",
          background:
            currentIndex % 2 === 0
              ? "radial-gradient(circle, #E6394618 0%, #0B0A0E55 60%, transparent 100%)"
              : "radial-gradient(circle, #E6394610 0%, #0B0A0E66 60%, transparent 100%)",
        }}
        transition={{ duration: 2.5, ease: "easeInOut" }}
      />

      {/* Subtle crimson ring */}
      <motion.div
        className="absolute border border-[#E63946]/10 rounded-full pointer-events-none"
        animate={{
          width: currentIndex % 2 === 0 ? "45vw" : "35vw",
          height: currentIndex % 2 === 0 ? "45vw" : "35vw",
          x: currentIndex === 0 ? "58%" : currentIndex === 1 ? "-10%" : currentIndex === 2 ? "50%" : "6%",
          y: currentIndex === 0 ? "25%" : currentIndex === 1 ? "30%" : currentIndex === 2 ? "-2%" : "40%",
          opacity: [0.15, 0.4, 0.15],
        }}
        transition={{ duration: 4, ease: "easeInOut" }}
      />

      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, scale: 1.04 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 1.06 }}
          transition={{ duration: 1.4, ease: "easeInOut" }}
          className="absolute inset-0"
        >
          <motion.img
            src={IMAGES[currentIndex]}
            alt=""
            className="w-full h-full object-cover opacity-55"
            initial={{ scale: 1.06 }}
            animate={{ scale: 1 }}
            transition={{ duration: DURATION / 1000, ease: "linear" }}
          />

          {/* Dark radial vignette */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: "radial-gradient(ellipse at center, transparent 20%, #0B0A0E 100%)",
            }}
          />

          {/* Floating ink particles */}
          <motion.div
            className="absolute top-1/4 left-1/3 w-1.5 h-1.5 rounded-full bg-[#E63946]/60"
            animate={{ y: [-10, 10, -10], opacity: [0.4, 0.9, 0.4] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="absolute top-2/3 left-1/5 w-1 h-1 rounded-full bg-white/40"
            animate={{ y: [8, -8, 8], opacity: [0.2, 0.7, 0.2] }}
            transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut", delay: 0.6 }}
          />
          <motion.div
            className="absolute top-1/2 right-1/4 w-1.5 h-1.5 rounded-full bg-[#E63946]/50"
            animate={{ y: [-6, 10, -6], opacity: [0.3, 0.8, 0.3] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1.2 }}
          />

          {/* Red accent line */}
          <motion.div
            initial={{ scaleX: 0, opacity: 0 }}
            animate={{ scaleX: 1, opacity: 1 }}
            transition={{ delay: 0.7, duration: 1.4, ease: [0.16, 1, 0.3, 1] }}
            className="absolute bottom-[33%] left-[8%] h-px w-1/3 bg-gradient-to-r from-transparent via-[#E63946]/50 to-transparent origin-left"
          />
        </motion.div>
      </AnimatePresence>

      {/* Bottom fade */}
      <div className="absolute bottom-0 left-0 right-0 h-72 bg-gradient-to-t from-[#0B0A0E] to-transparent pointer-events-none z-10" />

      {/* Floating booking card */}
      <motion.div
        initial={{ y: 40, opacity: 0, rotate: 2 }}
        animate={{ y: 0, opacity: 1, rotate: 1.5 }}
        transition={{ duration: 0.9, delay: 0.6, type: "spring", stiffness: 250, damping: 28 }}
        className="absolute right-[8%] top-[28%] w-56 bg-white/8 backdrop-blur-xl rounded-3xl p-5 border border-white/12 shadow-2xl z-10 pointer-events-none hidden md:block"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="h-2.5 w-20 bg-white/30 rounded-full" />
          <div className="h-5 w-14 bg-[#E63946]/30 border border-[#E63946]/40 rounded-full" />
        </div>
        <div className="h-5 w-40 bg-white/20 rounded-lg mb-2" />
        <div className="h-3 w-28 bg-white/15 rounded-md mb-4" />
        <div className="border-t border-white/10 pt-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 bg-[#E63946]/20 rounded-full" />
            <div className="h-2.5 w-14 bg-white/20 rounded-md" />
          </div>
          <div className="h-6 w-16 bg-[#E63946]/40 rounded-full" />
        </div>
        <motion.div
          animate={{ opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 2.5, repeat: Infinity }}
          className="absolute -top-1.5 -right-1.5 h-4 w-4 rounded-full bg-[#E63946] border-2 border-[#0B0A0E]"
        />
      </motion.div>

      {/* Floating stat badge */}
      <motion.div
        initial={{ x: -30, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.8, delay: 1.2, type: "spring" }}
        className="absolute left-[6%] bottom-[30%] bg-white/8 backdrop-blur-xl rounded-2xl px-4 py-3 border border-white/12 shadow-xl z-10 pointer-events-none hidden md:flex items-center gap-3"
      >
        <div className="h-9 w-9 rounded-xl bg-[#E63946]/20 flex items-center justify-center text-lg">
          🎨
        </div>
        <div>
          <p className="text-white font-bold text-sm leading-tight">186 sessions</p>
          <p className="text-white/50 text-xs">booked this month</p>
        </div>
      </motion.div>

      {/* Progress dots */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2 z-20 pointer-events-none">
        {IMAGES.map((_, i) => (
          <motion.div
            key={i}
            animate={{ opacity: i === currentIndex ? 1 : 0.3, scaleX: i === currentIndex ? 1.4 : 1 }}
            transition={{ duration: 0.3 }}
            className="h-1 w-6 rounded-full bg-[#E63946] origin-center"
          />
        ))}
      </div>
    </div>
  );
}
