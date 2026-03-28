import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const SCENE_DURATIONS = [3000, 3000, 2500, 2500];

export default function HeroVideo() {
  const [currentScene, setCurrentScene] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      setCurrentScene((prev) => (prev + 1) % SCENE_DURATIONS.length);
    }, SCENE_DURATIONS[currentScene]);
    return () => clearTimeout(timer);
  }, [currentScene]);

  return (
    <div className="absolute inset-0 w-full h-full overflow-hidden bg-[#060E1A]">
      {/* Persistent animated gradient orb — lives outside AnimatePresence */}
      <motion.div
        className="absolute rounded-full blur-[120px] pointer-events-none"
        animate={{
          width: currentScene === 0 ? "70vw" : currentScene === 1 ? "50vw" : currentScene === 2 ? "90vw" : "60vw",
          height: currentScene === 0 ? "70vw" : currentScene === 1 ? "50vw" : currentScene === 2 ? "90vw" : "60vw",
          x: currentScene === 0 ? "-10%" : currentScene === 1 ? "40%" : currentScene === 2 ? "-5%" : "20%",
          y: currentScene === 0 ? "10%" : currentScene === 1 ? "-10%" : currentScene === 2 ? "5%" : "-5%",
          background: currentScene === 0
            ? "radial-gradient(circle, #00D4AA33 0%, #0A254044 60%, transparent 100%)"
            : currentScene === 1
            ? "radial-gradient(circle, #F5A62322 0%, #0A254066 60%, transparent 100%)"
            : currentScene === 2
            ? "radial-gradient(circle, #00D4AA44 0%, #06262044 60%, transparent 100%)"
            : "radial-gradient(circle, #0A254088 0%, #00D4AA22 60%, transparent 100%)",
        }}
        transition={{ duration: 2, ease: "easeInOut" }}
      />

      {/* Persistent floating accent ring */}
      <motion.div
        className="absolute border border-[#00D4AA]/20 rounded-full pointer-events-none"
        animate={{
          width: currentScene % 2 === 0 ? "40vw" : "60vw",
          height: currentScene % 2 === 0 ? "40vw" : "60vw",
          x: currentScene === 0 ? "60%" : currentScene === 1 ? "-20%" : currentScene === 2 ? "50%" : "10%",
          y: currentScene === 0 ? "30%" : currentScene === 1 ? "20%" : currentScene === 2 ? "-10%" : "40%",
          opacity: [0.3, 0.6, 0.3],
        }}
        transition={{ duration: 3, ease: "easeInOut" }}
      />

      <AnimatePresence mode="wait">
        {currentScene === 0 && <Scene1 key="s1" />}
        {currentScene === 1 && <Scene2 key="s2" />}
        {currentScene === 2 && <Scene3 key="s3" />}
        {currentScene === 3 && <Scene4 key="s4" />}
      </AnimatePresence>
    </div>
  );
}

function Scene1() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.05 }}
      transition={{ duration: 1 }}
      className="absolute inset-0 bg-[#060E1A]"
    >
      <img
        src="/images/salon-bg.png"
        alt=""
        className="w-full h-full object-cover opacity-25 mix-blend-luminosity"
      />
      {/* Geometric floating shapes */}
      <motion.div
        className="absolute top-1/4 left-1/3 w-2 h-2 rounded-full bg-[#00D4AA]"
        animate={{ y: [-10, 10, -10], opacity: [0.6, 1, 0.6] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute top-2/3 left-1/4 w-1 h-1 rounded-full bg-[#F5A623]"
        animate={{ y: [10, -10, 10], opacity: [0.4, 0.9, 0.4] }}
        transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
      />
      <motion.div
        className="absolute top-1/2 right-1/3 w-1.5 h-1.5 rounded-full bg-[#00D4AA]"
        animate={{ y: [-8, 12, -8], opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
      />
      <motion.div
        className="absolute bottom-1/4 right-1/4 w-32 h-32 border border-[#00D4AA]/20 rounded-full"
        animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0.5, 0.2] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute top-1/3 left-1/5 w-48 h-48 border border-[#F5A623]/10 rounded-full"
        animate={{ scale: [1.1, 0.9, 1.1], opacity: [0.1, 0.3, 0.1] }}
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 1 }}
      />
      {/* Teal accent line */}
      <motion.div
        initial={{ scaleX: 0, opacity: 0 }}
        animate={{ scaleX: 1, opacity: 1 }}
        transition={{ delay: 0.5, duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
        className="absolute bottom-[30%] left-[10%] h-px w-1/3 bg-gradient-to-r from-transparent via-[#00D4AA] to-transparent origin-left"
      />
    </motion.div>
  );
}

function Scene2() {
  const [flashIndex, setFlashIndex] = useState(0);
  const flashes = [
    { img: "/images/nails.png", color: "#F5A623" },
    { img: "/images/barber.png", color: "#00D4AA" },
    { img: "/images/pet-grooming.png", color: "#F5A623" },
    { img: "/images/tattoo.png", color: "#00D4AA" },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setFlashIndex(prev => (prev + 1) % flashes.length);
    }, 650);
    return () => clearInterval(interval);
  }, [flashes.length]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.05 }}
      transition={{ duration: 0.8 }}
      className="absolute inset-0 bg-[#0A2540]"
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={flashIndex}
          initial={{ opacity: 0, scale: 1.04 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="absolute inset-0"
        >
          <img
            src={flashes[flashIndex].img}
            className="w-full h-full object-cover opacity-30 mix-blend-luminosity"
            alt=""
          />
        </motion.div>
      </AnimatePresence>

      {/* Floating booking card mockup — purely visual */}
      <motion.div
        initial={{ y: 40, opacity: 0, rotate: -3 }}
        animate={{ y: 0, opacity: 1, rotate: -2 }}
        transition={{ duration: 0.7, type: "spring", stiffness: 300, damping: 25 }}
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-64 bg-white/10 backdrop-blur-xl rounded-3xl p-5 border border-white/20 shadow-2xl"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="h-3 w-20 bg-white/30 rounded-full" />
          <div className="h-5 w-16 bg-[#00D4AA]/30 border border-[#00D4AA]/50 rounded-full" />
        </div>
        <div className="h-6 w-44 bg-white/20 rounded-lg mb-3" />
        <div className="flex gap-2 mb-4">
          <div className="h-3 w-16 bg-white/20 rounded-md" />
          <div className="h-3 w-20 bg-white/15 rounded-md" />
        </div>
        <div className="border-t border-white/10 pt-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 bg-white/20 rounded-full" />
            <div className="h-3 w-16 bg-white/20 rounded-md" />
          </div>
          <div className="h-7 w-20 bg-[#00D4AA]/40 rounded-full" />
        </div>
      </motion.div>

      {/* Color flash accent */}
      <motion.div
        key={`accent-${flashIndex}`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.15 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        className="absolute inset-0 pointer-events-none"
        style={{ background: `radial-gradient(circle at 50% 50%, ${flashes[flashIndex].color} 0%, transparent 60%)` }}
      />
    </motion.div>
  );
}

function Scene3() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.05 }}
      transition={{ duration: 0.8 }}
      className="absolute inset-0 flex items-center justify-center bg-[#060E1A]"
    >
      {/* Large glowing rings — no text */}
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 0.15 }}
        transition={{ duration: 1.5, ease: "easeOut" }}
        className="absolute w-[60vw] h-[60vw] border border-[#00D4AA] rounded-full"
      />
      <motion.div
        initial={{ scale: 0.3, opacity: 0 }}
        animate={{ scale: 1, opacity: 0.08 }}
        transition={{ duration: 1.8, ease: "easeOut", delay: 0.2 }}
        className="absolute w-[80vw] h-[80vw] border border-[#F5A623] rounded-full"
      />
      <motion.div
        initial={{ scale: 0.7, opacity: 0 }}
        animate={{ scale: 1, opacity: 0.2 }}
        transition={{ duration: 1.2, ease: "easeOut", delay: 0.1 }}
        className="absolute w-[40vw] h-[40vw] border border-[#00D4AA]/60 rounded-full"
      />
      {/* Pulsing center orb */}
      <motion.div
        animate={{ scale: [1, 1.15, 1], opacity: [0.3, 0.6, 0.3] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        className="w-[20vw] h-[20vw] rounded-full bg-[#00D4AA] blur-[80px]"
      />
      {/* Accent dots */}
      {[0, 60, 120, 180, 240, 300].map((deg, i) => (
        <motion.div
          key={i}
          className="absolute w-1.5 h-1.5 rounded-full bg-[#00D4AA]"
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 1, 0] }}
          transition={{ duration: 2, delay: i * 0.15, repeat: Infinity, ease: "easeInOut" }}
          style={{
            left: `calc(50% + ${Math.cos((deg * Math.PI) / 180) * 25}vw)`,
            top: `calc(50% + ${Math.sin((deg * Math.PI) / 180) * 25}vw)`,
          }}
        />
      ))}
      {/* Gold accent line */}
      <motion.div
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ delay: 0.8, duration: 1, ease: "easeOut" }}
        className="absolute bottom-[25%] left-[20%] h-px w-2/5 bg-gradient-to-r from-transparent via-[#F5A623] to-transparent origin-left"
      />
    </motion.div>
  );
}

function Scene4() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.05 }}
      transition={{ duration: 1 }}
      className="absolute inset-0 overflow-hidden bg-[#0A2540]"
    >
      {/* Animated gradient mesh — no text */}
      <motion.div
        animate={{ backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"] }}
        transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
        className="absolute inset-0 opacity-50"
        style={{
          background: "linear-gradient(-45deg, #0A2540, #00D4AA, #F5A623, #060E1A)",
          backgroundSize: "400% 400%",
        }}
      />
      {/* Soft vignette */}
      <div className="absolute inset-0 bg-[#0A2540]/60" />
      {/* Floating geometric shapes */}
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        className="absolute top-1/4 right-1/4 w-32 h-32 border border-[#00D4AA]/30 rounded-xl"
      />
      <motion.div
        animate={{ rotate: -360 }}
        transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
        className="absolute bottom-1/3 left-1/4 w-20 h-20 border border-[#F5A623]/20 rounded-full"
      />
      {/* Certxa logo lockup — small, bottom-center */}
      <motion.div
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.8, duration: 0.8, type: "spring" }}
        className="absolute bottom-12 left-1/2 -translate-x-1/2 flex items-center gap-3 bg-black/20 backdrop-blur-md px-6 py-3 rounded-full border border-white/10"
      >
        <img src="/web-app.png" alt="Certxa" className="w-8 h-8 rounded-lg" />
        <span className="font-bold text-2xl text-white tracking-tight" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Certxa</span>
      </motion.div>
    </motion.div>
  );
}
