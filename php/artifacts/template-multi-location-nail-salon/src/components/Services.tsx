import { useState } from 'react';
import { Plus } from 'lucide-react';

const services = [
  {
    id: 'blossom',
    name: 'The Blossom',
    tagline: 'Express Service',
    image: 'https://images.pexels.com/photos/3997379/pexels-photo-3997379.jpeg?auto=compress&cs=tinysrgb&w=800',
    desc: 'Our best-selling express manicure or pedicure. Nails and cuticles are expertly trimmed, shaped, lightly massaged, and finished with CND Vinylux polish. Add CND Shellac for a long-lasting finish.',
    options: [
      { label: 'Manicure', price: '$32' },
      { label: 'Pedicure', price: '$45' },
    ],
  },
  {
    id: 'lotus',
    name: 'The Lotus',
    tagline: 'Spa Experience',
    image: 'https://images.pexels.com/photos/3997391/pexels-photo-3997391.jpeg?auto=compress&cs=tinysrgb&w=800',
    desc: 'Unwind with an ultra-relaxing essential oil soak, luxurious sugar scrub, moisturizing mask with warm soothing towels, and a heavenly hydrating massage. You deserve it.',
    options: [
      { label: 'Manicure', price: '$52' },
      { label: 'Pedicure', price: '$68' },
    ],
  },
];

const extras = [
  { name: 'CND Shellac', desc: 'Long-lasting gel polish, certified and genuine.', price: '+$15' },
  { name: 'Sugar Scrub', desc: 'Handcrafted scrub for silky-smooth skin.', price: '+$10' },
  { name: 'Paraffin Treatment', desc: 'Ultra-hydrating warm wax treatment.', price: '+$12' },
  { name: 'French Tips', desc: 'Classic or colored French tip finish.', price: '+$8' },
  { name: 'Nail Art', desc: 'Custom designs by our nail artists.', price: '+$15+' },
  { name: 'CBD Massage', desc: 'Extra-relaxing 10-min CBD lotion massage.', price: '+$18' },
  { name: 'Callus Removal', desc: 'Gel treatment for rough skin.', price: '+$10' },
  { name: 'Shellac Removal', desc: 'Gentle removal of existing Shellac.', price: '+$12' },
];

export default function Services() {
  const [activeTab, setActiveTab] = useState<'manicure' | 'pedicure'>('manicure');

  return (
    <section id="services" className="py-24 bg-white">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-16">
          <p className="text-[#c9a96e] text-xs tracking-[0.4em] uppercase font-medium mb-3">
            What We Offer
          </p>
          <h2
            className="text-4xl md:text-5xl font-bold text-[#1a1a1a] mb-4"
            style={{ fontFamily: 'Georgia, serif' }}
          >
            Select Your Service
          </h2>
          <p className="text-[#6a6a6a] text-lg max-w-xl mx-auto leading-relaxed">
            Two signature services designed to give you exactly what you need — whether you're
            looking for a quick refresh or a full spa day.
          </p>
        </div>

        {/* Tab toggle */}
        <div className="flex justify-center mb-12">
          <div className="inline-flex border border-[#e0d9ce]">
            {(['manicure', 'pedicure'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-8 py-3 text-sm font-semibold tracking-widest uppercase transition-all duration-200 ${
                  activeTab === tab
                    ? 'bg-[#c9a96e] text-white'
                    : 'bg-white text-[#6a6a6a] hover:text-[#1a1a1a]'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Service cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-20">
          {services.map((svc) => {
            const price = svc.options.find((o) =>
              o.label.toLowerCase() === activeTab
            )?.price;
            return (
              <div
                key={svc.id}
                className="group border border-[#e8e2d9] hover:border-[#c9a96e] transition-all duration-300 overflow-hidden"
              >
                <div className="relative h-64 overflow-hidden">
                  <img
                    src={svc.image}
                    alt={svc.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute bottom-5 left-6">
                    <p className="text-[#c9a96e] text-xs tracking-[0.3em] uppercase font-medium">
                      {svc.tagline}
                    </p>
                    <h3
                      className="text-white text-2xl font-bold"
                      style={{ fontFamily: 'Georgia, serif' }}
                    >
                      {svc.name}
                    </h3>
                  </div>
                  <div className="absolute top-5 right-6 bg-[#c9a96e] text-white text-lg font-bold px-4 py-2">
                    {price}
                  </div>
                </div>
                <div className="p-8">
                  <p className="text-[#6a6a6a] leading-relaxed mb-6">{svc.desc}</p>
                  <button className="w-full border border-[#c9a96e] text-[#c9a96e] text-sm font-semibold tracking-widest uppercase py-3 hover:bg-[#c9a96e] hover:text-white transition-all duration-200">
                    Book {activeTab === 'manicure' ? 'Manicure' : 'Pedicure'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Extras */}
        <div className="bg-[#faf8f5] p-10 md:p-16">
          <div className="text-center mb-12">
            <p className="text-[#c9a96e] text-xs tracking-[0.4em] uppercase font-medium mb-3">
              Enhance Your Visit
            </p>
            <h2
              className="text-3xl md:text-4xl font-bold text-[#1a1a1a]"
              style={{ fontFamily: 'Georgia, serif' }}
            >
              Add Extras
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {extras.map((extra) => (
              <div
                key={extra.name}
                className="bg-white p-6 flex flex-col gap-2 border border-transparent hover:border-[#c9a96e] hover:shadow-sm transition-all duration-200 group"
              >
                <div className="flex items-start justify-between">
                  <h4 className="font-bold text-[#1a1a1a] text-sm">{extra.name}</h4>
                  <span className="text-[#c9a96e] text-sm font-semibold ml-2 shrink-0">
                    {extra.price}
                  </span>
                </div>
                <p className="text-[#8a8a8a] text-xs leading-relaxed">{extra.desc}</p>
                <div className="mt-auto pt-3">
                  <button className="flex items-center gap-1 text-xs text-[#c9a96e] font-semibold tracking-wide uppercase group-hover:gap-2 transition-all">
                    <Plus size={12} />
                    Add
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
