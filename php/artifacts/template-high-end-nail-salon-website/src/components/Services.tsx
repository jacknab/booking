const categories = [
  {
    id: 'manicures',
    label: 'Manicures',
    labelColor: '#E8634A',
    image:
      'https://images.pexels.com/photos/3997989/pexels-photo-3997989.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&dpr=1',
    featured: false,
    services: [
      { name: 'Classic Manicure', price: '$25' },
      { name: 'Gel Manicure', price: '$38' },
      { name: 'Shellac Manicure', price: '$40' },
      { name: 'French Manicure', price: '$32' },
      { name: 'Spa Manicure', price: '$48' },
      { name: 'Dip Powder', price: '$50' },
      { name: 'Nail Repair (per nail)', price: '$5' },
    ],
  },
  {
    id: 'pedicures',
    label: 'Pedicures',
    labelColor: '#D4AF6A',
    image:
      'https://images.pexels.com/photos/3997992/pexels-photo-3997992.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&dpr=1',
    featured: true,
    services: [
      { name: 'Classic Pedicure', price: '$38' },
      { name: 'Gel Pedicure', price: '$52' },
      { name: 'Spa Pedicure', price: '$58' },
      { name: 'Deluxe Pedicure', price: '$68' },
      { name: 'Paraffin Treatment', price: '$18' },
      { name: 'Callus Treatment', price: '$14' },
      { name: 'French Pedicure', price: '$48' },
    ],
  },
  {
    id: 'enhancements',
    label: 'Nail Enhancements',
    labelColor: '#2A9D8F',
    image:
      'https://images.pexels.com/photos/1580053/pexels-photo-1580053.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&dpr=1',
    featured: false,
    services: [
      { name: 'Acrylic Full Set', price: '$58+' },
      { name: 'Acrylic Fill', price: '$38+' },
      { name: 'Gel Extensions', price: '$68+' },
      { name: 'Nail Art (per nail)', price: '$5+' },
      { name: 'Chrome Powder', price: '$18+' },
      { name: 'Ombré / Marble', price: '$22+' },
      { name: 'Nail Gems', price: '$3+' },
    ],
  },
];

export default function Services() {
  return (
    <section id="services" className="bg-white py-24 px-6">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-16">
          <p className="font-sans text-[10px] font-semibold tracking-[0.5em] uppercase text-gold-500 mb-3">
            What We Offer
          </p>
          <h2 className="font-serif text-4xl md:text-5xl font-light text-charcoal-800">
            Our Services & Pricing
          </h2>
          <div className="mt-4 w-16 h-px bg-gold-400 mx-auto" />
        </div>

        {/* Service Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-0 md:gap-6 lg:gap-8 items-start">
          {categories.map((cat) => (
            <div
              key={cat.id}
              className={`relative flex flex-col transition-all duration-300 ${
                cat.featured
                  ? 'md:-translate-y-4 bg-white rounded-lg shadow-2xl border border-cream-200 z-10'
                  : 'bg-transparent'
              }`}
            >
              {/* Photo Card */}
              <div className="relative overflow-hidden">
                <img
                  src={cat.image}
                  alt={cat.label}
                  className="w-full h-64 object-cover object-center"
                  style={{ borderRadius: cat.featured ? '0.5rem 0.5rem 0 0' : '0' }}
                />
                {/* Label overlay */}
                <div
                  className="absolute top-5 left-0 px-5 py-2"
                  style={{ backgroundColor: 'rgba(0,0,0,0)' }}
                >
                  <span
                    className="font-sans text-lg font-800 tracking-[0.12em] uppercase drop-shadow-lg"
                    style={{ color: cat.labelColor, fontWeight: 800, textShadow: '0 2px 8px rgba(0,0,0,0.5)' }}
                  >
                    {cat.label}
                  </span>
                </div>
              </div>

              {/* Price List */}
              <div className={`px-4 py-5 ${cat.featured ? 'px-6' : ''}`}>
                {cat.services.map((svc, i) => (
                  <div
                    key={svc.name}
                    className={`flex items-center justify-between py-3 ${
                      i < cat.services.length - 1 ? 'border-b border-cream-200' : ''
                    }`}
                  >
                    <span className="font-sans text-sm text-charcoal-700">{svc.name}</span>
                    <span
                      className="font-sans text-xl font-800 ml-4 flex-shrink-0"
                      style={{ fontWeight: 800, color: cat.labelColor }}
                    >
                      {svc.price}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center mt-14">
          <a
            href="#contact"
            className="inline-flex items-center gap-3 bg-charcoal-800 hover:bg-charcoal-700 text-white font-sans text-xs font-bold tracking-[0.25em] uppercase px-10 py-4 transition-all duration-300 hover:shadow-xl hover:-translate-y-0.5"
          >
            Book Your Service
          </a>
        </div>
      </div>
    </section>
  );
}
