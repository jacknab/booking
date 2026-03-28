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

  // Scene components
  return (
    <div className="absolute inset-0 w-full h-full overflow-hidden bg-[#060E1A]">
      {/* Persistent Gradient */}
      <motion.div
        className="absolute inset-0 opacity-30 mix-blend-overlay"
        animate={{
          background: currentScene === 0 ? "radial-gradient(circle at 20% 20%, #F5A623 0%, transparent 50%)" :
                      currentScene === 1 ? "radial-gradient(circle at 80% 80%, #0A2540 0%, transparent 50%)" :
                      currentScene === 2 ? "radial-gradient(circle at 50% 50%, #00D4AA 0%, transparent 60%)" :
                      "radial-gradient(circle at 50% 80%, #0A2540 0%, transparent 70%)"
        }}
        transition={{ duration: 1.5, ease: "easeInOut" }}
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
  const text = "YOUR BUSINESS. FULLY BOOKED.";
  return (
    <motion.div
      initial={{ clipPath: "circle(0% at 0% 50%)" }}
      animate={{ clipPath: "circle(150% at 0% 50%)" }}
      exit={{ scale: 1.1, opacity: 0 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      className="absolute inset-0 flex items-center justify-center bg-[#060E1A]"
    >
      <div className="absolute inset-0 opacity-30">
         <img src="/images/salon-bg.png" alt="Salon" className="w-full h-full object-cover" />
         <div className="absolute inset-0 bg-[#060E1A]/80 mix-blend-multiply" />
      </div>
      
      <div className="relative z-10 text-center flex flex-col items-center px-4">
        <h2 className="text-5xl md:text-7xl lg:text-8xl font-black text-white tracking-tighter max-w-5xl leading-tight" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
          {text.split("").map((char, i) => (
            <motion.span
              key={i}
              initial={{ opacity: 0, scale: 1.05, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ delay: i * 0.05, duration: 0.4, type: "spring", stiffness: 400, damping: 28 }}
              className={char === " " ? "inline-block w-4 md:w-8" : "inline-block"}
            >
              {char}
            </motion.span>
          ))}
        </h2>
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ delay: 1, duration: 0.8, type: "spring", stiffness: 400, damping: 28 }}
          className="h-1.5 md:h-2 bg-[#00D4AA] mt-8 w-48 md:w-80 origin-left rounded-full"
        />
      </div>
    </motion.div>
  );
}

function Scene2() {
  const [flashIndex, setFlashIndex] = useState(0);
  const flashes = [
    { title: "NAIL SALONS", img: "/images/nails.png" },
    { title: "BARBERS", img: "/images/barber.png" },
    { title: "PET GROOMERS", img: "/images/pet-grooming.png" },
    { title: "TATTOO ARTISTS", img: "/images/tattoo.png" },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setFlashIndex(prev => (prev + 1) % flashes.length);
    }, 600); // 4 flashes in 2.4s + 0.6s buffer
    return () => clearInterval(interval);
  }, [flashes.length]);

  return (
    <motion.div
      initial={{ clipPath: "inset(0 100% 0 0)" }}
      animate={{ clipPath: "inset(0 0% 0 0)" }}
      exit={{ scale: 1.1, opacity: 0 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="absolute inset-0 flex items-center justify-center bg-[#0A2540]"
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={flashIndex}
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="absolute inset-0"
        >
          <img src={flashes[flashIndex].img} className="w-full h-full object-cover opacity-40 mix-blend-luminosity" alt={flashes[flashIndex].title} />
          <div className="absolute inset-0 bg-[#0A2540]/50" />
        </motion.div>
      </AnimatePresence>

      <div className="relative z-10 flex flex-col md:flex-row items-center justify-center gap-12 w-full max-w-6xl px-8">
        {/* Mobile Booking Card Mockup */}
        <motion.div
          initial={{ y: 50, opacity: 0, rotate: -5 }}
          animate={{ y: 0, opacity: 1, rotate: 0 }}
          transition={{ duration: 0.6, type: "spring", stiffness: 400, damping: 28 }}
          className="w-72 md:w-80 bg-white rounded-3xl p-6 shadow-2xl flex flex-col gap-5 border border-white/20"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="h-4 w-24 bg-slate-200 rounded-full" />
            <div className="h-6 w-16 bg-[#00D4AA]/20 text-[#00D4AA] text-xs font-bold flex items-center justify-center rounded-full">CONFIRMED</div>
          </div>
          <div className="h-8 w-56 bg-slate-800 rounded-lg" />
          <div className="flex gap-2">
            <div className="h-4 w-20 bg-slate-300 rounded-md" />
            <div className="h-4 w-24 bg-slate-200 rounded-md" />
          </div>
          <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between">
             <div className="flex items-center gap-3">
               <div className="h-10 w-10 bg-slate-200 rounded-full" />
               <div className="h-4 w-20 bg-slate-300 rounded-md" />
             </div>
             <div className="h-8 w-24 bg-[#0A2540] rounded-full" />
          </div>
        </motion.div>

        <motion.h2
          key={`title-${flashIndex}`}
          initial={{ x: 20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          className="text-5xl md:text-7xl lg:text-8xl font-black text-white tracking-tight absolute md:relative right-4 bottom-12 md:right-0 md:bottom-0 text-right md:text-left drop-shadow-2xl"
          style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
        >
          {flashes[flashIndex].title}
        </motion.h2>
      </div>
    </motion.div>
  );
}

function Scene3() {
  return (
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ opacity: 0, filter: "blur(10px)" }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className="absolute inset-0 flex flex-col items-center justify-center bg-[#060E1A] gap-12"
    >
      <div className="absolute inset-0 opacity-20">
         {/* Floating geometric shapes via CSS background */}
         <div className="absolute top-1/4 left-1/4 w-64 h-64 border border-[#F5A623] rounded-full mix-blend-overlay animate-[spin_10s_linear_infinite]" />
         <div className="absolute bottom-1/4 right-1/4 w-96 h-96 border border-[#00D4AA] rounded-full mix-blend-overlay animate-[spin_15s_linear_infinite_reverse]" />
      </div>

      <div className="text-center relative z-10">
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.6, type: "spring", stiffness: 300, damping: 15 }}
          className="text-7xl md:text-9xl font-black text-[#F5A623] drop-shadow-[0_0_30px_rgba(245,166,35,0.4)]"
          style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
        >
          10,000+
        </motion.div>
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-2xl md:text-4xl text-white font-medium mt-4 tracking-widest"
          style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
        >
          BUSINESSES
        </motion.div>
      </div>

      <div className="text-center relative z-10">
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.6, type: "spring", stiffness: 300, damping: 15 }}
          className="text-7xl md:text-9xl font-black text-[#00D4AA] drop-shadow-[0_0_30px_rgba(0,212,170,0.4)]"
          style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
        >
          2M+
        </motion.div>
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-2xl md:text-4xl text-white font-medium mt-4 tracking-widest"
          style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
        >
          BOOKINGS
        </motion.div>
      </div>
      
      <motion.div 
         initial={{ width: 0 }}
         animate={{ width: "300px" }}
         transition={{ delay: 0.8, duration: 0.6, ease: "easeInOut" }}
         className="h-1.5 bg-[#00D4AA] mt-8 rounded-full shadow-[0_0_15px_rgba(0,212,170,0.8)]"
      />
    </motion.div>
  );
}

function Scene4() {
  const text = "NEVER MISS A BOOKING";
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ scale: 1.2, opacity: 0 }}
      transition={{ duration: 0.8 }}
      className="absolute inset-0 flex flex-col items-center justify-center bg-[#0A2540] overflow-hidden"
    >
      <motion.div
        animate={{
          backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
        }}
        transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
        className="absolute inset-0 opacity-60"
        style={{
          background: "linear-gradient(-45deg, #0A2540, #00D4AA, #F5A623, #060E1A)",
          backgroundSize: "400% 400%"
        }}
      />
      
      <h2 className="relative z-10 text-5xl md:text-7xl lg:text-8xl font-black text-white text-center max-w-5xl px-4" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
        {text.split("").map((char, i) => (
          <motion.span
            key={i}
            initial={{ opacity: 0, filter: "blur(10px)" }}
            animate={{ opacity: 1, filter: "blur(0px)", textShadow: "0px 0px 20px rgba(0,212,170,0.9)" }}
            transition={{ delay: i * 0.05, duration: 0.4 }}
            className={char === " " ? "inline-block w-4 md:w-8" : "inline-block"}
          >
            {char}
          </motion.span>
        ))}
      </h2>

      <motion.div
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 1.2, duration: 0.6, type: "spring" }}
        className="absolute bottom-16 md:bottom-24 flex items-center gap-4 z-10 bg-black/20 backdrop-blur-md px-8 py-4 rounded-full border border-white/10"
      >
        <img src="/web-app.png" alt="Certxa" className="w-12 h-12 rounded-xl shadow-[0_0_15px_rgba(245,166,35,0.6)]" />
        <span className="font-bold text-4xl text-white tracking-tight" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Certxa</span>
      </motion.div>
    </motion.div>
  );
}
