import { MapPin, Clock, Phone } from 'lucide-react';

const locations = [
  {
    id: 'south-congress',
    name: 'South Congress',
    address: '2847 South Congress Ave',
    city: 'Austin, TX 78704',
    phone: '(512) 384-9201',
    hours: [
      { day: 'Monday – Friday', time: '9:00 AM – 7:00 PM' },
      { day: 'Saturday', time: '9:00 AM – 6:00 PM' },
      { day: 'Sunday', time: '10:00 AM – 5:00 PM' },
    ],
    image: 'https://images.pexels.com/photos/3735657/pexels-photo-3735657.jpeg?auto=compress&cs=tinysrgb&w=800',
    badge: 'Original Location',
  },
  {
    id: 'domain',
    name: 'The Domain',
    address: '11601 Domain Blvd, Suite 120',
    city: 'Austin, TX 78758',
    phone: '(512) 748-3065',
    hours: [
      { day: 'Monday – Friday', time: '9:00 AM – 8:00 PM' },
      { day: 'Saturday', time: '9:00 AM – 7:00 PM' },
      { day: 'Sunday', time: '10:00 AM – 6:00 PM' },
    ],
    image: 'https://images.pexels.com/photos/3997393/pexels-photo-3997393.jpeg?auto=compress&cs=tinysrgb&w=800',
    badge: 'Now Open',
  },
];

export default function Locations() {
  return (
    <section id="locations" className="py-24 bg-[#1a1a1a]">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-16">
          <p className="text-[#c9a96e] text-xs tracking-[0.4em] uppercase font-medium mb-3">
            Find Us
          </p>
          <h2
            className="text-4xl md:text-5xl font-bold text-white mb-4"
            style={{ fontFamily: 'Georgia, serif' }}
          >
            Our Locations
          </h2>
          <p className="text-white/60 text-lg max-w-xl mx-auto leading-relaxed">
            Conveniently located across Austin, Texas — Petal Nail Spa has two beautiful locations
            to serve you.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {locations.map((loc) => (
            <div
              key={loc.id}
              className="group bg-[#242424] overflow-hidden hover:bg-[#2a2a2a] transition-colors duration-300"
            >
              {/* Image */}
              <div className="relative h-56 overflow-hidden">
                <img
                  src={loc.image}
                  alt={`Petal Nail Spa ${loc.name}`}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#1a1a1a]/80 to-transparent" />
                <span className="absolute top-4 left-4 bg-[#c9a96e] text-white text-xs font-semibold tracking-widest uppercase px-3 py-1">
                  {loc.badge}
                </span>
                <div className="absolute bottom-4 left-5">
                  <h3
                    className="text-white text-2xl font-bold"
                    style={{ fontFamily: 'Georgia, serif' }}
                  >
                    {loc.name}
                  </h3>
                </div>
              </div>

              {/* Info */}
              <div className="p-8">
                <div className="space-y-5 mb-8">
                  <div className="flex items-start gap-3">
                    <MapPin size={16} className="text-[#c9a96e] mt-0.5 shrink-0" />
                    <div>
                      <p className="text-white text-sm font-medium">{loc.address}</p>
                      <p className="text-white/60 text-sm">{loc.city}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Phone size={16} className="text-[#c9a96e] shrink-0" />
                    <a
                      href={`tel:${loc.phone.replace(/\D/g, '')}`}
                      className="text-white text-sm hover:text-[#c9a96e] transition-colors"
                    >
                      {loc.phone}
                    </a>
                  </div>
                  <div className="flex items-start gap-3">
                    <Clock size={16} className="text-[#c9a96e] mt-0.5 shrink-0" />
                    <div className="space-y-1">
                      {loc.hours.map((h) => (
                        <div key={h.day} className="flex gap-2 text-sm">
                          <span className="text-white/60 w-36 shrink-0">{h.day}</span>
                          <span className="text-white">{h.time}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <button className="w-full bg-[#c9a96e] text-white text-sm font-semibold tracking-widest uppercase py-3 hover:bg-[#b8935a] transition-colors">
                  Book at {loc.name}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
