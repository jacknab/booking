import { Scissors } from 'lucide-react';

const services = [
  {
    name: "Gentleman's Haircut",
    description: "Classic and contemporary cuts perfected — a blend of tradition and today's style.",
    price: 28,
    tag: 'Most Popular',
  },
  {
    name: 'Senior Cut',
    description: 'A discounted cut exclusively for gentlemen aged 60 and older.',
    price: 24,
    tag: null,
  },
  {
    name: 'Buzz Cut',
    description: 'Single blade clipper only haircut. One clean length all over.',
    price: 22,
    tag: null,
  },
  {
    name: 'Beard Trim',
    description: 'Sculpting stories, one masterful beard trim at a time.',
    price: 16,
    tag: null,
  },
  {
    name: 'Cut & Beard Combo',
    description: 'A full haircut paired with a precise beard trim and shape-up.',
    price: 32,
    tag: null,
  },
  {
    name: 'Hot Towel Head Shave',
    description: 'Hot lather, steam towel, premium pre & after-shave products finished with moisturizer.',
    price: 32,
    tag: null,
  },
  {
    name: 'Hot Towel Face Shave',
    description: 'Hot lather, steam towels, premium shave products and moisturizer.',
    price: 26,
    tag: null,
  },
  {
    name: "Men's Facial",
    description: 'Facial cleanser, black charcoal mask, astringent, and face moisturizer.',
    price: 26,
    tag: null,
  },
  {
    name: '"The King" Deluxe',
    description: 'Pick 3: haircut or head shave + face shave or beard trim + charcoal mask or massage.',
    price: 55,
    tag: 'Premium',
  },
];

export default function Services() {
  return (
    <section id="services" className="bg-[#0f0d0b] py-24 px-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <p className="text-[#c9a96e] text-xs tracking-[0.4em] uppercase mb-4">What We Offer</p>
          <h2 className="text-4xl md:text-5xl font-bold text-white leading-tight">
            Services & Pricing
          </h2>
          <p className="mt-4 text-white/50 max-w-md mx-auto">
            Tailored for every gentleman. From buzzcuts to classic trims, we have a chair waiting for you.
          </p>
          <div className="mt-6 flex items-center justify-center gap-3">
            <div className="h-px w-16 bg-[#c9a96e]/40" />
            <Scissors size={16} className="text-[#c9a96e]" />
            <div className="h-px w-16 bg-[#c9a96e]/40" />
          </div>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {services.map((s) => (
            <div
              key={s.name}
              className="relative group bg-[#18150f] border border-white/8 rounded-lg p-6 hover:border-[#c9a96e]/40 hover:bg-[#1e1a12] transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-black/40"
            >
              {s.tag && (
                <span className="absolute top-4 right-4 text-[10px] tracking-widest uppercase bg-[#c9a96e]/15 text-[#c9a96e] border border-[#c9a96e]/30 px-2.5 py-1 rounded-full">
                  {s.tag}
                </span>
              )}
              <div className="flex items-start justify-between gap-4 mb-3">
                <h3 className="text-white font-semibold text-lg leading-snug pr-16">{s.name}</h3>
              </div>
              <p className="text-white/45 text-sm leading-relaxed mb-5">{s.description}</p>
              <div className="flex items-center justify-between">
                <span className="text-[#c9a96e] text-2xl font-bold">${s.price}</span>
                <a
                  href="#contact"
                  className="text-xs tracking-widest uppercase text-white/40 hover:text-[#c9a96e] transition-colors border-b border-transparent hover:border-[#c9a96e]/50 pb-0.5"
                >
                  Book Now
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
