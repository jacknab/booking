import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const CLIPS = [
  { src: "https://videos.pexels.com/video-files/6466491/6466491-hd_1920_1080_30fps.mp4", fallback: "https://videos.pexels.com/video-files/6466491/6466491-hd_1280_720_30fps.mp4", duration: 8000 },
  { src: "https://videos.pexels.com/video-files/5698513/5698513-hd_1920_1080_25fps.mp4", fallback: "https://videos.pexels.com/video-files/5698513/5698513-hd_1280_720_25fps.mp4", duration: 8000 },
  { src: "https://videos.pexels.com/video-files/7202365/7202365-hd_1920_1080_30fps.mp4", fallback: "https://videos.pexels.com/video-files/7202365/7202365-hd_1280_720_30fps.mp4", duration: 8000 },
  { src: "https://videos.pexels.com/video-files/4167559/4167559-hd_1920_1080_25fps.mp4", fallback: "https://videos.pexels.com/video-files/4167559/4167559-hd_1280_720_25fps.mp4", duration: 8000 },
];
const FALLBACK_IMAGES = [
  "https://images.unsplash.com/photo-1491002052546-bf38f186af56?auto=format&fit=crop&w=1920&q=80",
  "https://images.unsplash.com/photo-1520880867659-28ee2bcc7b80?auto=format&fit=crop&w=1920&q=80",
  "https://images.unsplash.com/photo-1547666961-c534748ad66b?auto=format&fit=crop&w=1920&q=80",
  "https://images.unsplash.com/photo-1578662996442-48f60103fc96?auto=format&fit=crop&w=1920&q=80",
];

export default function SnowRemovalHeroVideo() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [videoErrors, setVideoErrors] = useState<Record<number, boolean>>({});
  useEffect(() => {
    const timer = setTimeout(() => setCurrentIndex((p) => (p + 1) % CLIPS.length), CLIPS[currentIndex].duration);
    return () => clearTimeout(timer);
  }, [currentIndex]);
  return (
    <div className="absolute inset-0 w-full h-full overflow-hidden bg-[#060E1A]">
      <motion.div className="absolute rounded-full blur-[120px] pointer-events-none" animate={{ width: currentIndex % 2 === 0 ? "60vw" : "50vw", height: currentIndex % 2 === 0 ? "60vw" : "50vw", x: currentIndex === 0 ? "-5%" : currentIndex === 1 ? "45%" : currentIndex === 2 ? "10%" : "30%", y: currentIndex === 0 ? "5%" : currentIndex === 1 ? "-10%" : currentIndex === 2 ? "15%" : "-5%", background: currentIndex % 2 === 0 ? "radial-gradient(circle, #00D4AA22 0%, #0A254044 60%, transparent 100%)" : "radial-gradient(circle, #00D4AA18 0%, #06101A55 60%, transparent 100%)" }} transition={{ duration: 2.5, ease: "easeInOut" }} />
      <AnimatePresence mode="wait">
        <VideoClip key={currentIndex} src={CLIPS[currentIndex].src} fallbackSrc={CLIPS[currentIndex].fallback} imageFallback={FALLBACK_IMAGES[currentIndex % FALLBACK_IMAGES.length]} hasError={!!videoErrors[currentIndex]} onError={() => setVideoErrors((p) => ({ ...p, [currentIndex]: true }))} />
      </AnimatePresence>
      <div className="absolute bottom-0 left-0 right-0 h-64 bg-gradient-to-t from-[#060E1A] to-transparent pointer-events-none z-10" />
      <motion.div initial={{ y: 40, opacity: 0, rotate: 2 }} animate={{ y: 0, opacity: 1, rotate: 1.5 }} transition={{ duration: 0.9, delay: 0.6, type: "spring", stiffness: 250, damping: 28 }} className="absolute right-[8%] top-[30%] w-56 bg-white/10 backdrop-blur-xl rounded-3xl p-5 border border-white/20 shadow-2xl z-10 pointer-events-none hidden md:block">
        <div className="flex items-center justify-between mb-4"><div className="h-2.5 w-16 bg-white/30 rounded-full" /><div className="h-5 w-14 bg-[#00D4AA]/30 border border-[#00D4AA]/50 rounded-full" /></div>
        <div className="h-5 w-40 bg-white/20 rounded-lg mb-3" />
        <div className="flex gap-2 mb-4"><div className="h-2.5 w-14 bg-white/20 rounded-md" /><div className="h-2.5 w-18 bg-white/15 rounded-md" /></div>
        <div className="border-t border-white/10 pt-3 flex items-center justify-between"><div className="flex items-center gap-2"><div className="h-7 w-7 bg-white/20 rounded-full" /><div className="h-2.5 w-14 bg-white/20 rounded-md" /></div><div className="h-6 w-16 bg-[#00D4AA]/40 rounded-full" /></div>
        <motion.div animate={{ opacity: [0.4, 1, 0.4] }} transition={{ duration: 2, repeat: Infinity }} className="absolute -top-1.5 -right-1.5 h-4 w-4 rounded-full bg-[#00D4AA] border-2 border-[#060E1A]" />
      </motion.div>
      <motion.div initial={{ x: -30, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ duration: 0.8, delay: 1.2, type: "spring" }} className="absolute left-[6%] bottom-[28%] bg-white/10 backdrop-blur-xl rounded-2xl px-4 py-3 border border-white/20 shadow-xl z-10 pointer-events-none hidden md:flex items-center gap-3">
        <div className="h-9 w-9 rounded-xl bg-[#00D4AA]/20 flex items-center justify-center text-lg">❄️</div>
        <div><p className="text-white font-bold text-sm leading-tight">47 stops today</p><p className="text-white/50 text-xs">14 regular clients</p></div>
      </motion.div>
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2 z-20 pointer-events-none">{CLIPS.map((_, i) => (<motion.div key={i} animate={{ opacity: i === currentIndex ? 1 : 0.3, scaleX: i === currentIndex ? 1.4 : 1 }} transition={{ duration: 0.3 }} className="h-1 w-6 rounded-full bg-[#00D4AA] origin-center" />))}</div>
    </div>
  );
}

function VideoClip({ src, fallbackSrc, imageFallback, hasError, onError }: { src: string; fallbackSrc: string; imageFallback: string; hasError: boolean; onError: () => void }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  useEffect(() => { if (videoRef.current && !hasError) videoRef.current.play().catch(() => {}); }, [hasError]);
  return (
    <motion.div initial={{ opacity: 0, scale: 1.04 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.06 }} transition={{ duration: 1.2, ease: "easeInOut" }} className="absolute inset-0">
      {hasError ? <motion.img src={imageFallback} alt="" className="w-full h-full object-cover opacity-50" initial={{ scale: 1.08 }} animate={{ scale: 1 }} transition={{ duration: 8, ease: "linear" }} /> : (
        <video ref={videoRef} className="w-full h-full object-cover opacity-55" autoPlay muted loop playsInline onError={onError}>
          <source src={src} type="video/mp4" /><source src={fallbackSrc} type="video/mp4" />
          <img src={imageFallback} alt="" className="w-full h-full object-cover opacity-50" />
        </video>
      )}
      <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse at center, transparent 30%, #060E1A 100%)" }} />
      <motion.div className="absolute top-1/4 left-1/3 w-2 h-2 rounded-full bg-[#00D4AA]" animate={{ y: [-10, 10, -10], opacity: [0.5, 1, 0.5] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }} />
      <motion.div initial={{ scaleX: 0, opacity: 0 }} animate={{ scaleX: 1, opacity: 1 }} transition={{ delay: 0.6, duration: 1.4, ease: [0.16, 1, 0.3, 1] }} className="absolute bottom-[32%] left-[8%] h-px w-1/4 bg-gradient-to-r from-transparent via-[#00D4AA] to-transparent origin-left" />
    </motion.div>
  );
}
