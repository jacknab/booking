import { Quote } from 'lucide-react';

export default function FounderStatement() {
  return (
    <section className="bg-[#0f0d0b] py-24 px-6 relative overflow-hidden">
      {/* Background texture */}
      <div
        className="absolute inset-0 opacity-5 bg-cover bg-center"
        style={{
          backgroundImage:
            'url(https://images.pexels.com/photos/1453005/pexels-photo-1453005.jpeg?auto=compress&cs=tinysrgb&w=1920)',
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-r from-[#0f0d0b] via-[#0f0d0b]/80 to-[#0f0d0b]" />

      <div className="relative z-10 max-w-4xl mx-auto text-center">
        <div className="w-14 h-14 rounded-full bg-[#c9a96e]/10 border border-[#c9a96e]/30 flex items-center justify-center mx-auto mb-10">
          <Quote size={24} className="text-[#c9a96e]" />
        </div>

        <blockquote className="text-xl md:text-2xl lg:text-3xl text-white/80 font-light leading-relaxed italic mb-10">
          "At King's Row Barber Co., our mission is to provide the community with both current and traditional haircuts and grooming services — blending modern and old-school techniques, all while prioritizing client satisfaction and fostering good conversation."
        </blockquote>

        <div className="flex items-center justify-center gap-5">
          <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-[#c9a96e]/50">
            <img
              src="https://images.pexels.com/photos/2379005/pexels-photo-2379005.jpeg?auto=compress&cs=tinysrgb&w=200"
              alt="Marcus Webb"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="text-left">
            <p className="text-white font-semibold">Marcus Webb</p>
            <p className="text-[#c9a96e] text-xs tracking-widest uppercase">Founder & Master Barber</p>
          </div>
        </div>
      </div>
    </section>
  );
}
