import { Users, Clock, Star, Smile } from 'lucide-react';

const pillars = [
  {
    icon: Users,
    title: 'Community First',
    body: "A barbershop where grooming becomes a community event — fostering friendships and memorable conversations.",
  },
  {
    icon: Clock,
    title: 'Blend of Eras',
    body: 'Celebrating the best of both worlds: time-honored grooming techniques and contemporary haircut styles.',
  },
  {
    icon: Star,
    title: 'Client Centric',
    body: 'Every snip, trim, and shave is a direct reflection of our commitment to your satisfaction.',
  },
  {
    icon: Smile,
    title: 'Laughter & Precision',
    body: 'A balance of lighthearted moments and uncompromised professionalism in every service we provide.',
  },
];

export default function Difference() {
  return (
    <section id="difference" className="bg-[#13110d] py-24 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left: image */}
          <div className="relative">
            <div className="aspect-[4/5] rounded-lg overflow-hidden">
              <img
                src="https://images.pexels.com/photos/3998415/pexels-photo-3998415.jpeg?auto=compress&cs=tinysrgb&w=800"
                alt="Barber at work"
                className="w-full h-full object-cover"
              />
            </div>
            {/* Gold accent frame */}
            <div className="absolute -bottom-4 -right-4 w-2/3 h-2/3 border border-[#c9a96e]/25 rounded-lg pointer-events-none" />
            {/* Stat badge */}
            <div className="absolute bottom-8 left-8 bg-[#0f0d0b]/90 backdrop-blur-sm border border-[#c9a96e]/30 rounded-lg px-5 py-4">
              <p className="text-[#c9a96e] text-3xl font-bold">6+</p>
              <p className="text-white/60 text-xs tracking-widest uppercase mt-0.5">Years in Business</p>
            </div>
          </div>

          {/* Right: content */}
          <div>
            <p className="text-[#c9a96e] text-xs tracking-[0.4em] uppercase mb-4">Why Choose Us</p>
            <h2 className="text-4xl md:text-5xl font-bold text-white leading-tight mb-6">
              More Than Just a Cut
            </h2>
            <p className="text-white/50 leading-relaxed mb-12">
              We don't just shape hair — we build connections and craft memories. King's Row Barber Co. is where every visit feels like coming home.
            </p>

            <div className="grid sm:grid-cols-2 gap-6">
              {pillars.map((p) => (
                <div key={p.title} className="flex gap-4">
                  <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-[#c9a96e]/10 border border-[#c9a96e]/20 flex items-center justify-center">
                    <p.icon size={18} className="text-[#c9a96e]" />
                  </div>
                  <div>
                    <h3 className="text-white font-semibold text-sm mb-1">{p.title}</h3>
                    <p className="text-white/45 text-sm leading-relaxed">{p.body}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
