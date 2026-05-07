import { ChevronDown } from 'lucide-react';

export default function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage:
            'url(https://images.pexels.com/photos/1813272/pexels-photo-1813272.jpeg?auto=compress&cs=tinysrgb&w=1920)',
        }}
      />
      {/* Overlays */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#0f0d0b]/80 via-[#0f0d0b]/60 to-[#0f0d0b]" />

      {/* Decorative gold line */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-32 bg-gradient-to-b from-transparent to-[#c9a96e]/60" />

      <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
        <p className="text-[#c9a96e] text-xs tracking-[0.4em] uppercase mb-6 animate-fade-in">
          Est. 2018 &mdash; Chicago, Illinois
        </p>
        <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold leading-none tracking-tight mb-6">
          <span className="block text-white">Where Tradition</span>
          <span className="block text-[#c9a96e]">Meets Trend</span>
        </h1>
        <p className="text-white/60 text-lg md:text-xl max-w-xl mx-auto mb-12 leading-relaxed">
          Step into a world where timeless grooming techniques meet contemporary style, right in the heart of Chicago's West Loop.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <a
            href="#services"
            className="px-8 py-4 bg-[#c9a96e] text-[#0f0d0b] font-bold tracking-widest uppercase text-sm rounded hover:bg-[#e0bc82] transition-all duration-300 hover:shadow-lg hover:shadow-[#c9a96e]/30 hover:-translate-y-0.5"
          >
            Book an Appointment
          </a>
          <a
            href="#services"
            className="px-8 py-4 border border-white/30 text-white font-bold tracking-widest uppercase text-sm rounded hover:border-[#c9a96e] hover:text-[#c9a96e] transition-all duration-300 hover:-translate-y-0.5"
          >
            View Services
          </a>
        </div>
      </div>

      {/* Scroll indicator */}
      <a
        href="#services"
        className="absolute bottom-10 left-1/2 -translate-x-1/2 text-white/40 hover:text-[#c9a96e] transition-colors animate-bounce"
        aria-label="Scroll down"
      >
        <ChevronDown size={28} />
      </a>
    </section>
  );
}
