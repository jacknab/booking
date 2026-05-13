const services = [
  {
    number: '01',
    title: 'Manicure & Pedicure',
    description: 'Classic and luxury manicures and pedicures tailored to your needs. From express treatments to full spa experiences.',
    image: 'https://images.pexels.com/photos/3997394/pexels-photo-3997394.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&fit=crop',
    tags: ['Classic', 'Gel', 'Luxury Spa'],
  },
  {
    number: '02',
    title: 'Gel Extensions',
    description: 'Flawless Gel X and Builder Gel extensions crafted by expert nail artists for beautiful, durable length.',
    image: 'https://images.pexels.com/photos/3997395/pexels-photo-3997395.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&fit=crop',
    tags: ['Gel X', 'Builder Gel', 'Acrylic'],
  },
  {
    number: '03',
    title: 'Nail Art',
    description: 'Custom nail art from minimalist designs to intricate hand-painted masterpieces. Your nails, your canvas.',
    image: 'https://images.pexels.com/photos/3997388/pexels-photo-3997388.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&fit=crop',
    tags: ['Custom', 'Seasonal', 'Bridal'],
  },
  {
    number: '04',
    title: 'Dip Powder',
    description: 'Long-lasting, chip-resistant dip powder in hundreds of shades. Stronger nails without the UV lamp.',
    image: 'https://images.pexels.com/photos/3738368/pexels-photo-3738368.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&fit=crop',
    tags: ['SNS', 'OPI', 'Signature'],
  },
];

export default function Services() {
  return (
    <section id="services" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <p className="text-[#b8936a] tracking-[0.3em] uppercase text-xs font-light mb-4">
            What We Offer
          </p>
          <h2 className="text-4xl md:text-5xl font-extralight text-[#1a1a1a] mb-4">
            Our <span className="font-semibold">Services</span>
          </h2>
          <div className="w-16 h-px bg-[#b8936a] mx-auto" />
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {services.map((service) => (
            <div key={service.number} className="group cursor-pointer">
              <div className="overflow-hidden mb-5">
                <img
                  src={service.image}
                  alt={service.title}
                  className="w-full h-60 object-cover group-hover:scale-105 transition-transform duration-700"
                />
              </div>
              <p className="text-[#b8936a] text-xs tracking-widest font-light mb-2">
                {service.number} /
              </p>
              <h3 className="text-xl font-light text-[#1a1a1a] mb-3 group-hover:text-[#b8936a] transition-colors duration-300">
                {service.title}
              </h3>
              <p className="text-[#7a7a7a] text-sm font-light leading-relaxed mb-4">
                {service.description}
              </p>
              <div className="flex flex-wrap gap-2">
                {service.tags.map((tag) => (
                  <span key={tag} className="text-xs tracking-widest uppercase text-[#b8936a] border border-[#e8c99a] px-2 py-1">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-16">
          <p className="text-[#5a5a5a] tracking-widest uppercase text-xs font-light mb-6">
            Manicure | Pedicure | Gel X | Builder Gel | Dip Powder | Nail Art | Paraffin | Repair
          </p>
          <a
            href="#booking"
            className="inline-block px-10 py-4 bg-[#b8936a] text-white tracking-widest uppercase text-sm font-light hover:bg-[#a07a54] transition-all duration-300"
          >
            Book a Service
          </a>
        </div>
      </div>
    </section>
  );
}
