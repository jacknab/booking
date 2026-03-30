import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const CLIPS = [
  {
    src: "https://videos.pexels.com/video-files/7579543/7579543-hd_1920_1080_30fps.mp4",
    fallback: "https://videos.pexels.com/video-files/7579543/7579543-hd_1280_720_30fps.mp4",
    duration: 8000,
  },
  {
    src: "https://videos.pexels.com/video-files/8090483/8090483-hd_1920_1080_30fps.mp4",
    fallback: "https://videos.pexels.com/video-files/8090483/8090483-hd_1280_720_30fps.mp4",
    duration: 8000,
  },
  {
    src: "https://videos.pexels.com/video-files/6724739/6724739-hd_1920_1080_25fps.mp4",
    fallback: "https://videos.pexels.com/video-files/6724739/6724739-hd_1280_720_25fps.mp4",
    duration: 8000,
  },
  {
    src: "https://videos.pexels.com/video-files/5327580/5327580-hd_1920_1080_25fps.mp4",
    fallback: "https://videos.pexels.com/video-files/5327580/5327580-hd_1280_720_25fps.mp4",
    duration: 8000,
  },
];

const FALLBACK_IMAGES = [
  "https://images.unsplash.com/photo-1616394584738-fc6e612e71b9?auto=format&fit=crop&w=1920&q=80",
  "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=1920&q=80",
  "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1920&q=80",
  "https://images.unsplash.com/photo-1552693673-1bf958298935?auto=format&fit=crop&w=1920&q=80",
];

export default function EstheticianHeroVideo() {
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
    <div className="absolute inset-0 w-full h-full overflow-hidden bg-[#060E1A]">
      <motion.div
        className="absolute rounded-full blur-[120px] pointer-events-none"
        animate={{
          width: currentIndex % 2 === 0 ? "60vw" : "50vw",
          height: currentIndex % 2 === 0 ? "60vw" : "50vw",
          x: currentIndex === 0 ? "-5%" : currentIndex === 1 ? "45%" : currentIndex === 2 ? "10%" : "30%",
          y: currentIndex === 0 ? "5%" : currentIndex === 1 ? "-10%" : currentIndex === 2 ? "15%" : "-5%",
          background:
            currentIndex % 2 === 0
              ? "radial-gradient(circle, #00D4AA22 0%, #0A254044 60%, transparent 100%)"
              : "radial-gradient(circle, #00D4AA18 0%, #06101A55 60%, transparent 100%)",
        }}
        transition={{ duration: 2.5, ease: "easeInOut" }}
      />

      <motion.div
        className="absolute border border-[#00D4AA]/15 rounded-full pointer-events-none"
        animate={{
          width: currentIndex % 2 === 0 ? "45vw" : "55vw",
          height: currentIndex % 2 === 0 ? "45vw" : "55vw",
          x: currentIndex === 0 ? "55%" : currentIndex === 1 ? "-15%" : currentIndex === 2 ? "45%" : "5%",
          y: currentIndex === 0 ? "25%" : currentIndex === 1 ? "15%" : currentIndex === 2 ? "-5%" : "35%",
          opacity: [0.2, 0.5, 0.2],
        }}
        transition={{ duration: 3, ease: "easeInOut" }}
      />

      <AnimatePresence mode="wait">
        <VideoClip
          key={currentIndex}
          index={currentIndex}
          src={CLIPS[currentIndex].src}
          fallbackSrc={CLIPS[currentIndex].fallback}
          imageFallback={FALLBACK_IMAGES[currentIndex % FALLBACK_IMAGES.length]}
          hasError={!!videoErrors[currentIndex]}
          onError={() => handleVideoError(currentIndex)}
        />
      </AnimatePresence>

      <div className="absolute bottom-0 left-0 right-0 h-64 bg-gradient-to-t from-[#060E1A] to-transparent pointer-events-none z-10" />

      <motion.div
        initial={{ y: 40, opacity: 0, rotate: 2 }}
        animate={{ y: 0, opacity: 1, rotate: 1.5 }}
        transition={{ duration: 0.9, delay: 0.6, type: "spring", stiffness: 250, damping: 28 }}
        className="absolute right-[8%] top-[30%] w-56 bg-white/10 backdrop-blur-xl rounded-3xl p-5 border border-white/20 shadow-2xl z-10 pointer-events-none hidden md:block"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="h-2.5 w-16 bg-white/30 rounded-full" />
          <div className="h-5 w-14 bg-[#00D4AA]/30 border border-[#00D4AA]/50 rounded-full" />
        </div>
        <div className="h-5 w-40 bg-white/20 rounded-lg mb-3" />
        <div className="flex gap-2 mb-4">
          <div className="h-2.5 w-14 bg-white/20 rounded-md" />
          <div className="h-2.5 w-18 bg-white/15 rounded-md" />
        </div>
        <div className="border-t border-white/10 pt-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 bg-white/20 rounded-full" />
            <div className="h-2.5 w-14 bg-white/20 rounded-md" />
          </div>
          <div className="h-6 w-16 bg-[#00D4AA]/40 rounded-full" />
        </div>
        <motion.div
          animate={{ opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute -top-1.5 -right-1.5 h-4 w-4 rounded-full bg-[#00D4AA] border-2 border-[#060E1A]"
        />
      </motion.div>

      <motion.div
        initial={{ x: -30, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.8, delay: 1.2, type: "spring" }}
        className="absolute left-[6%] bottom-[28%] bg-white/10 backdrop-blur-xl rounded-2xl px-4 py-3 border border-white/20 shadow-xl z-10 pointer-events-none hidden md:flex items-center gap-3"
      >
        <div className="h-9 w-9 rounded-xl bg-[#00D4AA]/20 flex items-center justify-center text-lg">
          ✨
        </div>
        <div>
          <p className="text-white font-bold text-sm leading-tight">224 bookings</p>
          <p className="text-white/50 text-xs">this week</p>
        </div>
      </motion.div>

      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2 z-20 pointer-events-none">
        {CLIPS.map((_, i) => (
          <motion.div
            key={i}
            animate={{ opacity: i === currentIndex ? 1 : 0.3, scaleX: i === currentIndex ? 1.4 : 1 }}
            transition={{ duration: 0.3 }}
            className="h-1 w-6 rounded-full bg-[#00D4AA] origin-center"
          />
        ))}
      </div>
    </div>
  );
}

function VideoClip({
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
      transition={{ duration: 1.2, ease: "easeInOut" }}
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

      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "radial-gradient(ellipse at center, transparent 30%, #060E1A 100%)",
        }}
      />

      <motion.div
        className="absolute top-1/4 left-1/3 w-2 h-2 rounded-full bg-[#00D4AA]"
        animate={{ y: [-10, 10, -10], opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute top-2/3 left-1/5 w-1.5 h-1.5 rounded-full bg-[#00D4AA]/70"
        animate={{ y: [8, -8, 8], opacity: [0.3, 0.8, 0.3] }}
        transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
      />
      <motion.div
        className="absolute top-1/2 right-1/4 w-1 h-1 rounded-full bg-white/60"
        animate={{ y: [-6, 10, -6], opacity: [0.4, 0.9, 0.4] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
      />

      <motion.div
        initial={{ scaleX: 0, opacity: 0 }}
        animate={{ scaleX: 1, opacity: 1 }}
        transition={{ delay: 0.6, duration: 1.4, ease: [0.16, 1, 0.3, 1] }}
        className="absolute bottom-[32%] left-[8%] h-px w-1/4 bg-gradient-to-r from-transparent via-[#00D4AA] to-transparent origin-left"
      />
    </motion.div>
  );
}
