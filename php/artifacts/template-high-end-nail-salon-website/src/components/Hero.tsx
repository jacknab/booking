import { ChevronDown } from 'lucide-react';

export default function Hero() {
  return (
    <section className="relative h-screen min-h-[700px] overflow-hidden">
      {/* Background Image - nail salon showroom interior */}
      <img
        src="https://images.pexels.com/photos/3997379/pexels-photo-3997379.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1080&dpr=1"
        alt="Lumière Nail Salon showroom"
        className="absolute inset-0 w-full h-full object-cover object-center"
      />

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-hero-overlay" />

      {/* Announcement Banner */}
      <div className="absolute top-0 left-0 right-0 z-10 bg-gold-400/90 py-2 px-4 text-center">
        <p className="font-sans text-[11px] font-600 tracking-[0.3em] uppercase text-charcoal-900">
          Now Accepting Walk-Ins & Online Bookings &mdash; Open 7 Days a Week
        </p>
      </div>

      {/* Content */}
      <div className="relative z-10 h-full flex flex-col justify-center px-8 md:px-16 lg:px-24 pt-16">
        <div className="max-w-2xl">
          <p className="font-sans text-[11px] font-medium tracking-[0.5em] uppercase text-gold-400 mb-5">
            Denver's Premier Luxury Nail Studio
          </p>
          <h1 className="font-serif text-5xl md:text-7xl lg:text-8xl font-light text-white leading-[1.05] mb-6">
            Where Beauty
            <br />
            <em className="font-light">Meets Art</em>
          </h1>
          <p className="font-sans text-sm font-300 text-white/75 leading-relaxed max-w-md mb-10 tracking-wide">
            Experience unmatched precision and luxury at Lumière — Denver's most refined
            nail salon offering bespoke manicures, pedicures, and nail artistry in an
            elegant, serene environment.
          </p>
          <div className="flex flex-wrap gap-4">
            <a
              href="#contact"
              className="inline-flex items-center gap-3 bg-gold-400 hover:bg-gold-500 text-charcoal-900 font-sans text-xs font-bold tracking-[0.25em] uppercase px-8 py-4 transition-all duration-300 hover:shadow-xl hover:shadow-gold-400/40 hover:-translate-y-0.5"
            >
              Book Appointment
            </a>
            <a
              href="#services"
              className="inline-flex items-center gap-3 border border-white/50 hover:border-white text-white font-sans text-xs font-medium tracking-[0.25em] uppercase px-8 py-4 transition-all duration-300 hover:bg-white/10"
            >
              View Services
            </a>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <a
        href="#services"
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2 text-white/60 hover:text-white transition-colors"
      >
        <span className="font-sans text-[9px] tracking-[0.4em] uppercase">Explore</span>
        <ChevronDown size={18} className="animate-bounce" />
      </a>
    </section>
  );
}
