import { useEffect, useRef, useState } from 'react';
import { ChevronDown } from 'lucide-react';

const VIDEO_CLIPS = [
  'https://videos.pexels.com/video-files/4612407/4612407-uhd_2560_1440_25fps.mp4',
  'https://videos.pexels.com/video-files/5870822/5870822-uhd_2560_1440_25fps.mp4',
  'https://videos.pexels.com/video-files/3194500/3194500-uhd_2560_1440_25fps.mp4',
];

export default function Hero() {
  const [currentVideo, setCurrentVideo] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentVideo((prev) => (prev + 1) % VIDEO_CLIPS.length);
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.load();
      videoRef.current.play().catch(() => {});
    }
  }, [currentVideo]);

  return (
    <section className="relative h-screen min-h-[600px] flex items-center justify-center overflow-hidden">
      {/* Video background */}
      <div className="absolute inset-0 z-0">
        <video
          ref={videoRef}
          key={currentVideo}
          autoPlay
          muted
          playsInline
          loop={false}
          className="w-full h-full object-cover transition-opacity duration-1000"
          onEnded={() => setCurrentVideo((prev) => (prev + 1) % VIDEO_CLIPS.length)}
        >
          <source src={VIDEO_CLIPS[currentVideo]} type="video/mp4" />
        </video>
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/30 to-black/60" />
      </div>

      {/* Video dots indicator */}
      <div className="absolute bottom-20 left-1/2 -translate-x-1/2 z-10 flex gap-2">
        {VIDEO_CLIPS.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrentVideo(i)}
            className={`w-2 h-2 rounded-full transition-all duration-300 ${
              i === currentVideo ? 'bg-[#c9a96e] w-6' : 'bg-white/50'
            }`}
            aria-label={`Video ${i + 1}`}
          />
        ))}
      </div>

      {/* Content */}
      <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
        <p className="text-[#c9a96e] text-xs tracking-[0.4em] uppercase font-medium mb-4 animate-fade-in">
          Austin's Premier
        </p>
        <h1
          className="text-white text-5xl md:text-7xl lg:text-8xl font-bold leading-tight mb-6"
          style={{ fontFamily: 'Georgia, serif' }}
        >
          Nail Spa
          <br />
          <span className="text-[#c9a96e]">Experience</span>
        </h1>
        <p className="text-white/85 text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
          Petal Nail Spa is an award-winning, 5-star rated nail salon in Austin leading the way in
          natural nail care — where luxury meets wellness.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button className="bg-[#c9a96e] text-white font-semibold tracking-widest uppercase px-10 py-4 hover:bg-[#b8935a] transition-all duration-200 text-sm">
            Book an Appointment
          </button>
          <a
            href="#services"
            className="border border-white text-white font-semibold tracking-widest uppercase px-10 py-4 hover:bg-white hover:text-[#1a1a1a] transition-all duration-200 text-sm inline-block"
          >
            Our Services
          </a>
        </div>
      </div>

      {/* Scroll indicator */}
      <a
        href="#concept"
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 text-white/70 hover:text-white animate-bounce transition-colors"
        aria-label="Scroll down"
      >
        <ChevronDown size={28} />
      </a>
    </section>
  );
}
