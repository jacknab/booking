import { Leaf, Star, Sparkles } from 'lucide-react';

export default function Concept() {
  return (
    <section id="concept" className="py-24 bg-[#faf8f5]">
      <div className="max-w-6xl mx-auto px-4">
        {/* Top accent */}
        <div className="flex items-center justify-center gap-3 mb-6">
          <div className="h-px w-12 bg-[#c9a96e]" />
          <Star size={14} className="text-[#c9a96e] fill-[#c9a96e]" />
          <div className="h-px w-12 bg-[#c9a96e]" />
        </div>

        <h2
          className="text-center text-4xl md:text-5xl font-bold text-[#1a1a1a] mb-4"
          style={{ fontFamily: 'Georgia, serif' }}
        >
          The Destination for
          <br />
          <span className="text-[#c9a96e]">Natural Nail Care</span>
        </h2>
        <p className="text-center text-[#6a6a6a] text-lg max-w-2xl mx-auto mb-20 leading-relaxed">
          Our concept is simple: choose from one of our two signature services, add your favorite
          extras, and book your appointment. We'll take care of the rest.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              icon: <Star size={28} className="text-[#c9a96e]" />,
              step: '01',
              title: 'Select Your Service',
              desc: 'Choose from our signature services: the Blossom (express mani or pedi) or the Lotus (for a full spa-level experience).',
            },
            {
              icon: <Sparkles size={28} className="text-[#c9a96e]" />,
              step: '02',
              title: 'Add Extras',
              desc: 'From CBD massages and paraffin treatments to nail art and French tips — personalize your visit.',
            },
            {
              icon: <Leaf size={28} className="text-[#c9a96e]" />,
              step: '03',
              title: 'Book an Appointment',
              desc: 'Book your time and arrive ready to be pampered by one of our skilled nail artists.',
            },
          ].map((item) => (
            <div
              key={item.step}
              className="bg-white p-10 text-center group hover:shadow-xl transition-shadow duration-300"
            >
              <div className="flex justify-center mb-5">
                <div className="w-14 h-14 rounded-full bg-[#fdf6ec] flex items-center justify-center group-hover:bg-[#c9a96e]/10 transition-colors">
                  {item.icon}
                </div>
              </div>
              <p className="text-[#c9a96e] text-xs tracking-[0.3em] uppercase font-semibold mb-2">
                Step {item.step}
              </p>
              <h3 className="text-xl font-bold text-[#1a1a1a] mb-3" style={{ fontFamily: 'Georgia, serif' }}>
                {item.title}
              </h3>
              <p className="text-[#6a6a6a] text-sm leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>

        {/* Shellac bottle imagery */}
        <div className="mt-20 bg-white rounded-none overflow-hidden shadow-sm flex flex-col md:flex-row">
          <div className="md:w-1/2 relative overflow-hidden h-64 md:h-auto">
            <img
              src="https://images.pexels.com/photos/704815/pexels-photo-704815.jpeg?auto=compress&cs=tinysrgb&w=800"
              alt="Nail polish collection"
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
            />
          </div>
          <div className="md:w-1/2 flex items-center p-10 md:p-16 bg-[#fdf6ec]">
            <div>
              <p className="text-[#c9a96e] text-xs tracking-[0.35em] uppercase font-medium mb-4">
                CND Shellac Certified
              </p>
              <h3
                className="text-3xl font-bold text-[#1a1a1a] mb-5 leading-snug"
                style={{ fontFamily: 'Georgia, serif' }}
              >
                Only the Best Products
                <br />on Your Nails
              </h3>
              <p className="text-[#6a6a6a] leading-relaxed mb-8">
                At Petal, we use only genuine CND Shellac — no imitations, no cheap gels. Our staff
                is CND Shellac Certified and carries the full color range with the latest technology
                direct from CND.
              </p>
              <button className="bg-[#c9a96e] text-white text-sm font-semibold tracking-widest uppercase px-8 py-3 hover:bg-[#b8935a] transition-colors">
                View Services
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
