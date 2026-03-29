import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const CLIPS = [
  {
    src: "https://videos.pexels.com/video-files/4126705/4126705-hd_1920_1080_25fps.mp4",
    fallback: "https://videos.pexels.com/video-files/4126705/4126705-hd_1280_720_25fps.mp4",
    duration: 8000,
  },
  {
    src: "https://videos.pexels.com/video-files/6492392/6492392-hd_1920_1080_30fps.mp4",
    fallback: "https://videos.pexels.com/video-files/6492392/6492392-hd_1280_720_30fps.mp4",
    duration: 8000,
  },
  {
    src: "https://videos.pexels.com/video-files/7687996/7687996-hd_1920_1080_25fps.mp4",
    fallback: "https://videos.pexels.com/video-files/7687996/7687996-hd_1280_720_25fps.mp4",
    duration: 8000,
  },
  {
    src: "https://videos.pexels.com/video-files/5200743/5200743-hd_1920_1080_30fps.mp4",
    fallback: "https://videos.pexels.com/video-files/5200743/5200743-hd_1280_720_30fps.mp4",
    duration: 8000,
  },
];

const FALLBACK_IMAGES = [
  "https://images.unsplash.com/photo-1604654894610-df63bc536371?auto=format&fit=crop&w=1920&q=80",
  "https://images.unsplash.com/photo-1604655814778-6a3ca3e80e96?auto=format&fit=crop&w=1920&q=80",
  "https://images.unsplash.com/photo-1519014816548-bf5fe059798b?auto=format&fit=crop&w=1920&q=80",
  "https://images.unsplash.com/photo-1610992235683-e39ada867bc4?auto=format&fit=crop&w=1920&q=80",
];

export default function NailSalonHeroVideo() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [videoErrors, setVideoErrors] = useState<Record<number, boolean>>({});

  useEffect(() => {
    const timer = setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % CLIPS.length);
    }, CLIPS[currentIndex].duration);
    return () => clearTimeout(timer);
  }, [currentIndex]);

  const handleVideoError = (index: number) => {
    setVideoErrors((prev) => ({ ...prev, [index]: true }));
  };

  return (
    <div className="absolute inset-0 w-full h-full overflow-hidden bg-[#1A0A14]">
      {/* Warm pink/rose ambient orb */}
      <motion.div
        className="absolute rounded-full blur-[140px] pointer-events-none"
        animate={{
          width: currentIndex % 2 === 0 ? "70vw" : "55vw",
          height: currentIndex % 2 === 0 ? "70vw" : "55vw",
          x: currentIndex === 0 ? "-8%" : currentIndex === 1 ? "42%" : currentIndex === 2 ? "5%" : "30%",
          y: currentIndex === 0 ? "8%" : currentIndex === 1 ? "-10%" : currentIndex === 2 ? "15%" : "-5%",
          background:
            currentIndex % 2 === 0
              ? "radial-gradient(circle, #FF6B9D18 0%, #1A0A1455 60%, transparent 100%)"
              : "radial-gradient(circle, #00D4AA15 0%, #1A0A1466 60%, transparent 100%)",
        }}
        transition={{ duration: 2.5, ease: "easeInOut" }}
      />

      {/* Floating soft ring */}
      <motion.div
        className="absolute border border-[#FF6B9D]/10 rounded-full pointer-events-none"
        animate={{
          width: currentIndex % 2 === 0 ? "50vw" : "38vw",
          height: currentIndex % 2 === 0 ? "50vw" : "38vw",
          x: currentIndex === 0 ? "55%" : currentIndex === 1 ? "-12%" : currentIndex === 2 ? "48%" : "8%",
          y: currentIndex === 0 ? "22%" : currentIndex === 1 ? "28%" : currentIndex === 2 ? "-4%" : "38%",
          opacity: [0.15, 0.45, 0.15],
        }}
        transition={{ duration: 4, ease: "easeInOut" }}
      />

      <AnimatePresence mode="wait">
        <NailClip
          key={currentIndex}
          index={currentIndex}
          src={CLIPS[currentIndex].src}
          fallbackSrc={CLIPS[currentIndex].fallback}
          imageFallback={FALLBACK_IMAGES[currentIndex % FALLBACK_IMAGES.length]}
          hasError={!!videoErrors[currentIndex]}
          onError={() => handleVideoError(currentIndex)}
        />
      </AnimatePresence>

      {/* Bottom fade */}
      <div className="absolute bottom-0 left-0 right-0 h-72 bg-gradient-to-t from-[#1A0A14] to-transparent pointer-events-none z-10" />

      {/* Floating booking card */}
      <motion.div
        initial={{ y: 40, opacity: 0, rotate: 2 }}
        animate={{ y: 0, opacity: 1, rotate: 1.5 }}
        transition={{ duration: 0.9, delay: 0.6, type: "spring", stiffness: 250, damping: 28 }}
        className="absolute right-[8%] top-[28%] w-56 bg-white/10 backdrop-blur-xl rounded-3xl p-5 border border-white/15 shadow-2xl z-10 pointer-events-none hidden md:block"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="h-2.5 w-20 bg-white/30 rounded-full" />
          <div className="h-5 w-14 bg-[#FF6B9D]/30 border border-[#FF6B9D]/40 rounded-full" />
        </div>
        <div className="h-5 w-40 bg-white/20 rounded-lg mb-2" />
        <div className="h-3 w-28 bg-white/15 rounded-md mb-4" />
        <div className="border-t border-white/10 pt-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 bg-[#FF6B9D]/20 rounded-full" />
            <div className="h-2.5 w-14 bg-white/20 rounded-md" />
          </div>
          <div className="h-6 w-16 bg-[#00D4AA]/40 rounded-full" />
        </div>
        <motion.div
          animate={{ opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 2.5, repeat: Infinity }}
          className="absolute -top-1.5 -right-1.5 h-4 w-4 rounded-full bg-[#FF6B9D] border-2 border-[#1A0A14]"
        />
      </motion.div>

      {/* Floating stat badge */}
      <motion.div
        initial={{ x: -30, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.8, delay: 1.2, type: "spring" }}
        className="absolute left-[6%] bottom-[30%] bg-white/10 backdrop-blur-xl rounded-2xl px-4 py-3 border border-white/15 shadow-xl z-10 pointer-events-none hidden md:flex items-center gap-3"
      >
        <div className="h-9 w-9 rounded-xl bg-[#FF6B9D]/20 flex items-center justify-center text-lg">
          💅
        </div>
        <div>
          <p className="text-white font-bold text-sm leading-tight">312 bookings</p>
          <p className="text-white/50 text-xs">this week</p>
        </div>
      </motion.div>

      {/* Progress dots */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2 z-20 pointer-events-none">
        {CLIPS.map((_, i) => (
          <motion.div
            key={i}
            animate={{ opacity: i === currentIndex ? 1 : 0.3, scaleX: i === currentIndex ? 1.4 : 1 }}
            transition={{ duration: 0.3 }}
            className="h-1 w-6 rounded-full bg-[#FF6B9D] origin-center"
          />
        ))}
      </div>
    </div>
  );
}

function NailClip({
  index,
  src,
  fallbackSrc,
  imageFallback,
  hasError,
  onError,
}: {
  index: number;
  src: string;
  fallbackSrc: string;
  imageFallback: string;
  hasError: boolean;
  onError: () => void;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current && !hasError) {
      videoRef.current.play().catch(() => {});
    }
  }, [hasError]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 1.04 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 1.06 }}
      transition={{ duration: 1.4, ease: "easeInOut" }}
      className="absolute inset-0"
    >
      {hasError ? (
        <motion.img
          src={imageFallback}
          alt=""
          className="w-full h-full object-cover opacity-50"
          initial={{ scale: 1.08 }}
          animate={{ scale: 1 }}
          transition={{ duration: 8, ease: "linear" }}
        />
      ) : (
        <video
          ref={videoRef}
          className="w-full h-full object-cover opacity-55"
          autoPlay
          muted
          loop
          playsInline
          onError={onError}
        >
          <source src={src} type="video/mp4" />
          <source src={fallbackSrc} type="video/mp4" />
          <img src={imageFallback} alt="" className="w-full h-full object-cover opacity-50" />
        </video>
      )}

      {/* Radial vignette */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "radial-gradient(ellipse at center, transparent 25%, #1A0A14 100%)",
        }}
      />

      {/* Floating sparkle particles */}
      <motion.div
        className="absolute top-1/4 left-1/3 w-1.5 h-1.5 rounded-full bg-[#FF6B9D]/70"
        animate={{ y: [-10, 10, -10], opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute top-2/3 left-1/5 w-1 h-1 rounded-full bg-white/50"
        animate={{ y: [8, -8, 8], opacity: [0.3, 0.8, 0.3] }}
        transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut", delay: 0.6 }}
      />
      <motion.div
        className="absolute top-1/2 right-1/4 w-1.5 h-1.5 rounded-full bg-[#00D4AA]/60"
        animate={{ y: [-6, 10, -6], opacity: [0.4, 0.9, 0.4] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1.2 }}
      />

      {/* Pink accent line */}
      <motion.div
        initial={{ scaleX: 0, opacity: 0 }}
        animate={{ scaleX: 1, opacity: 1 }}
        transition={{ delay: 0.7, duration: 1.4, ease: [0.16, 1, 0.3, 1] }}
        className="absolute bottom-[33%] left-[8%] h-px w-1/3 bg-gradient-to-r from-transparent via-[#FF6B9D]/60 to-transparent origin-left"
      />
    </motion.div>
  );
}
