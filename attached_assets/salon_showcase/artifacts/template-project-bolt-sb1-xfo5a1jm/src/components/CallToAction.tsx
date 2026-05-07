import { Scissors } from 'lucide-react';

export default function CallToAction() {
  return (
    <section className="bg-[#c9a96e] py-20 px-6 relative overflow-hidden">
      {/* Subtle pattern overlay */}
      <div className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: `repeating-linear-gradient(45deg, #0f0d0b 0, #0f0d0b 1px, transparent 0, transparent 50%)`,
          backgroundSize: '20px 20px',
        }}
      />
      <div className="relative z-10 max-w-3xl mx-auto text-center">
        <div className="flex items-center justify-center gap-3 mb-6">
          <div className="h-px w-12 bg-[#0f0d0b]/30" />
          <Scissors size={20} className="text-[#0f0d0b]/60" />
          <div className="h-px w-12 bg-[#0f0d0b]/30" />
        </div>
        <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-[#0f0d0b] leading-tight mb-5">
          Ready for the Transformation?
        </h2>
        <p className="text-[#0f0d0b]/65 text-lg mb-10 max-w-lg mx-auto">
          Book your slot at King's Row Barber Co. and let's craft your standout look.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <a
            href="#contact"
            className="px-8 py-4 bg-[#0f0d0b] text-white font-bold tracking-widest uppercase text-sm rounded hover:bg-[#1e1a12] transition-all duration-300 hover:shadow-xl hover:shadow-black/30 hover:-translate-y-0.5"
          >
            Book an Appointment
          </a>
          <a
            href="#contact"
            className="px-8 py-4 border-2 border-[#0f0d0b]/40 text-[#0f0d0b] font-bold tracking-widest uppercase text-sm rounded hover:border-[#0f0d0b] hover:bg-[#0f0d0b]/10 transition-all duration-300 hover:-translate-y-0.5"
          >
            Contact Us
          </a>
        </div>
      </div>
    </section>
  );
}
