import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const CLIPS = [
  {
    src: "https://videos.pexels.com/video-files/8141956/8141956-hd_1920_1080_25fps.mp4",
    fallback: "https://videos.pexels.com/video-files/8141956/8141956-hd_1280_720_25fps.mp4",
    duration: 8000,
  },
  {
    src: "https://videos.pexels.com/video-files/5198748/5198748-hd_1920_1080_25fps.mp4",
    fallback: "https://videos.pexels.com/video-files/5198748/5198748-hd_1280_720_25fps.mp4",
    duration: 8000,
  },
  {
    src: "https://videos.pexels.com/video-files/6896064/6896064-hd_1920_1080_25fps.mp4",
    fallback: "https://videos.pexels.com/video-files/6896064/6896064-hd_1280_720_25fps.mp4",
    duration: 8000,
  },
  {
    src: "https://videos.pexels.com/video-files/4613945/4613945-hd_1920_1080_25fps.mp4",
    fallback: "https://videos.pexels.com/video-files/4613945/4613945-hd_1280_720_25fps.mp4",
    duration: 8000,
  },
];

// High-volume barbershop / walk-in haircut imagery
const FALLBACK_IMAGES = [
  "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&w=1920&q=80",
  "https://images.unsplash.com/photo-1599351431202-1e0f0137899a?auto=format&fit=crop&w=1920&q=80",
  "https://images.unsplash.com/photo-1622286342621-4bd786c2447c?auto=format&fit=crop&w=1920&q=80",
  "https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=1920&q=80",
];

export default function WalkInHeroVideo() {
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
    <div className="absolute inset-0 w-full h-full overflow-hidden bg-[#0D1117]">
      {/* Amber ambient orb */}
      <motion.div
        className="absolute rounded-full blur-[160px] pointer-events-none"
        animate={{
          width: currentIndex % 2 === 0 ? "60vw" : "48vw",
          height: currentIndex % 2 === 0 ? "60vw" : "48vw",
          x: currentIndex === 0 ? "-8%" : currentIndex === 1 ? "42%" : currentIndex === 2 ? "4%" : "30%",
          y: currentIndex === 0 ? "10%" : currentIndex === 1 ? "-8%" : currentIndex === 2 ? "16%" : "-4%",
          background:
            currentIndex % 2 === 0
              ? "radial-gradient(circle, #FBBF2415 0%, #0D111755 60%, transparent 100%)"
              : "radial-gradient(circle, #FBBF2410 0%, #0D111766 60%, transparent 100%)",
        }}
        transition={{ duration: 2.5, ease: "easeInOut" }}
      />

      {/* Subtle amber ring */}
      <motion.div
        className="absolute border border-[#FBBF24]/10 rounded-full pointer-events-none"
        animate={{
          width: currentIndex % 2 === 0 ? "42vw" : "32vw",
          height: currentIndex % 2 === 0 ? "42vw" : "32vw",
          x: currentIndex === 0 ? "58%" : currentIndex === 1 ? "-10%" : currentIndex === 2 ? "50%" : "6%",
          y: currentIndex === 0 ? "25%" : currentIndex === 1 ? "30%" : currentIndex === 2 ? "-2%" : "38%",
          opacity: [0.15, 0.4, 0.15],
        }}
        transition={{ duration: 4, ease: "easeInOut" }}
      />

      <AnimatePresence mode="wait">
        <WalkInClip
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
      <div className="absolute bottom-0 left-0 right-0 h-72 bg-gradient-to-t from-[#0D1117] to-transparent pointer-events-none z-10" />

      {/* Floating live queue card */}
      <motion.div
        initial={{ y: 40, opacity: 0, rotate: 2 }}
        animate={{ y: 0, opacity: 1, rotate: 1.5 }}
        transition={{ duration: 0.9, delay: 0.6, type: "spring", stiffness: 250, damping: 28 }}
        className="absolute right-[8%] top-[26%] w-60 bg-white/8 backdrop-blur-xl rounded-3xl p-5 border border-white/12 shadow-2xl z-10 pointer-events-none hidden md:block"
      >
        <div className="flex items-center justify-between mb-3">
          <span className="text-white/60 text-xs font-semibold uppercase tracking-wider">Live Queue</span>
          <motion.div
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="h-2 w-2 rounded-full bg-[#FBBF24]"
          />
        </div>
        {["Marcus H.", "Jordan T.", "Alex W."].map((name, i) => (
          <div key={name} className="flex items-center justify-between py-2 border-b border-white/8 last:border-0">
            <div className="flex items-center gap-2">
              <div className={`h-6 w-6 rounded-full flex items-center justify-center text-xs font-bold ${i === 0 ? "bg-[#FBBF24]/30 text-[#FBBF24]" : "bg-white/10 text-white/50"}`}>
                {i + 1}
              </div>
              <span className={`text-sm font-medium ${i === 0 ? "text-white" : "text-white/50"}`}>{name}</span>
            </div>
            <span className={`text-xs ${i === 0 ? "text-[#FBBF24]" : "text-white/30"}`}>{i === 0 ? "Now" : `~${(i) * 15}m`}</span>
          </div>
        ))}
        <motion.div
          animate={{ opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 2.5, repeat: Infinity }}
          className="absolute -top-1.5 -right-1.5 h-4 w-4 rounded-full bg-[#FBBF24] border-2 border-[#0D1117]"
        />
      </motion.div>

      {/* Floating stat badge */}
      <motion.div
        initial={{ x: -30, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.8, delay: 1.2, type: "spring" }}
        className="absolute left-[6%] bottom-[30%] bg-white/8 backdrop-blur-xl rounded-2xl px-4 py-3 border border-white/12 shadow-xl z-10 pointer-events-none hidden md:flex items-center gap-3"
      >
        <div className="h-9 w-9 rounded-xl bg-[#FBBF24]/20 flex items-center justify-center text-lg">
          ✂️
        </div>
        <div>
          <p className="text-white font-bold text-sm leading-tight">47 cuts today</p>
          <p className="text-white/50 text-xs">avg. wait 8 min</p>
        </div>
      </motion.div>

      {/* Progress dots */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2 z-20 pointer-events-none">
        {CLIPS.map((_, i) => (
          <motion.div
            key={i}
            animate={{ opacity: i === currentIndex ? 1 : 0.3, scaleX: i === currentIndex ? 1.4 : 1 }}
            transition={{ duration: 0.3 }}
            className="h-1 w-6 rounded-full bg-[#FBBF24] origin-center"
          />
        ))}
      </div>
    </div>
  );
}

function WalkInClip({
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
          className="w-full h-full object-cover opacity-45"
          initial={{ scale: 1.08 }}
          animate={{ scale: 1 }}
          transition={{ duration: 8, ease: "linear" }}
        />
      ) : (
        <video
          ref={videoRef}
          className="w-full h-full object-cover opacity-50"
          autoPlay
          muted
          loop
          playsInline
          onError={onError}
        >
          <source src={src} type="video/mp4" />
          <source src={fallbackSrc} type="video/mp4" />
          <img src={imageFallback} alt="" className="w-full h-full object-cover opacity-45" />
        </video>
      )}

      {/* Dark radial vignette */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "radial-gradient(ellipse at center, transparent 20%, #0D1117 100%)",
        }}
      />

      {/* Floating particles */}
      <motion.div
        className="absolute top-1/4 left-1/3 w-1.5 h-1.5 rounded-full bg-[#FBBF24]/60"
        animate={{ y: [-10, 10, -10], opacity: [0.4, 0.9, 0.4] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute top-2/3 left-1/5 w-1 h-1 rounded-full bg-white/40"
        animate={{ y: [8, -8, 8], opacity: [0.2, 0.7, 0.2] }}
        transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut", delay: 0.6 }}
      />
      <motion.div
        className="absolute top-1/2 right-1/4 w-1.5 h-1.5 rounded-full bg-[#FBBF24]/50"
        animate={{ y: [-6, 10, -6], opacity: [0.3, 0.8, 0.3] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1.2 }}
      />

      {/* Amber accent line */}
      <motion.div
        initial={{ scaleX: 0, opacity: 0 }}
        animate={{ scaleX: 1, opacity: 1 }}
        transition={{ delay: 0.7, duration: 1.4, ease: [0.16, 1, 0.3, 1] }}
        className="absolute bottom-[33%] left-[8%] h-px w-1/3 bg-gradient-to-r from-transparent via-[#FBBF24]/50 to-transparent origin-left"
      />
    </motion.div>
  );
}
