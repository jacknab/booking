export default function Hero() {
  return (
    <section className="relative h-screen min-h-[700px] flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0">
        <img
          src="https://images.pexels.com/photos/3997386/pexels-photo-3997386.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1080&fit=crop"
          alt="Luxury nail salon"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/70" />
      </div>

      <div className="relative z-10 text-center px-6 max-w-4xl mx-auto">
        <p className="text-[#e8c99a] tracking-[0.4em] uppercase text-sm font-light mb-6 animate-fade-in">
          The Art of Beautiful Nails
        </p>
        <h1 className="text-white text-5xl md:text-7xl font-extralight leading-tight mb-6 tracking-wide">
          Where Beauty
          <br />
          <span className="font-semibold italic text-[#e8c99a]">Meets Luxury</span>
        </h1>
        <p className="text-white/80 text-lg md:text-xl font-light max-w-2xl mx-auto mb-10 leading-relaxed">
          Your premier nail salon destination — crafting flawless nails with premium products in a serene, upscale environment.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <a
            href="#booking"
            className="px-10 py-4 bg-[#b8936a] text-white tracking-widest uppercase text-sm font-light hover:bg-[#a07a54] transition-all duration-300 hover:scale-105"
          >
            Book an Appointment
          </a>
          <a
            href="#services"
            className="px-10 py-4 border border-white/60 text-white tracking-widest uppercase text-sm font-light hover:border-[#e8c99a] hover:text-[#e8c99a] transition-all duration-300"
          >
            Explore Services
          </a>
        </div>
      </div>

      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-white/50">
        <span className="text-xs tracking-widest uppercase">Scroll</span>
        <div className="w-px h-12 bg-white/30 animate-pulse" />
      </div>
    </section>
  );
}
