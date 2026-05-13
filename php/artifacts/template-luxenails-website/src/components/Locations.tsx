import { MapPin, Phone, Mail, Clock } from 'lucide-react';

const locations = [
  {
    number: '01',
    name: 'Downtown',
    address: '125 Main Street, Suite 200',
    city: 'New York, NY 10001',
    email: 'downtown@luxenails.com',
    phone: '+1 212.555.0101',
    hours: {
      weekday: 'Mon – Fri: 9:30 AM – 7:00 PM',
      saturday: 'Sat: 9:30 AM – 6:00 PM',
      sunday: 'Sun: 10:30 AM – 5:00 PM',
    },
    image: 'https://images.pexels.com/photos/3997393/pexels-photo-3997393.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&fit=crop',
  },
  {
    number: '02',
    name: 'Midtown',
    address: '540 5th Avenue, Floor 3',
    city: 'New York, NY 10036',
    email: 'midtown@luxenails.com',
    phone: '+1 212.555.0202',
    hours: {
      weekday: 'Mon – Fri: 9:30 AM – 7:00 PM',
      saturday: 'Sat: 9:30 AM – 6:00 PM',
      sunday: 'Sun: 10:30 AM – 5:00 PM',
    },
    image: 'https://images.pexels.com/photos/3997392/pexels-photo-3997392.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&fit=crop',
  },
  {
    number: '03',
    name: 'Upper East Side',
    address: '1010 Lexington Ave',
    city: 'New York, NY 10021',
    email: 'ues@luxenails.com',
    phone: '+1 212.555.0303',
    hours: {
      weekday: 'Mon – Fri: 9:30 AM – 7:00 PM',
      saturday: 'Sat: 9:30 AM – 6:00 PM',
      sunday: 'Sun: 10:30 AM – 5:00 PM',
    },
    image: 'https://images.pexels.com/photos/3997396/pexels-photo-3997396.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&fit=crop',
  },
];

export default function Locations() {
  return (
    <section id="locations" className="py-24 bg-[#faf8f5]">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <p className="text-[#b8936a] tracking-[0.3em] uppercase text-xs font-light mb-4">
            Find Us
          </p>
          <h2 className="text-4xl md:text-5xl font-extralight text-[#1a1a1a] mb-4">
            Our <span className="font-semibold">Locations</span>
          </h2>
          <div className="w-16 h-px bg-[#b8936a] mx-auto" />
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {locations.map((loc) => (
            <div key={loc.number} className="bg-white group hover:shadow-xl transition-shadow duration-400">
              <div className="overflow-hidden">
                <img
                  src={loc.image}
                  alt={`LuxeNails ${loc.name}`}
                  className="w-full h-52 object-cover group-hover:scale-105 transition-transform duration-700"
                />
              </div>
              <div className="p-8">
                <p className="text-[#b8936a] text-xs tracking-widest font-light mb-1">
                  {loc.number} /
                </p>
                <h3 className="text-2xl font-light text-[#1a1a1a] mb-5 tracking-wide">
                  {loc.name}
                </h3>

                <div className="space-y-3 mb-6">
                  <div className="flex items-start gap-3 text-[#5a5a5a]">
                    <MapPin className="w-4 h-4 text-[#b8936a] mt-0.5 shrink-0" />
                    <div className="text-sm font-light">
                      <p>{loc.address}</p>
                      <p>{loc.city}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 text-[#5a5a5a]">
                    <Mail className="w-4 h-4 text-[#b8936a] shrink-0" />
                    <a href={`mailto:${loc.email}`} className="text-sm font-light hover:text-[#b8936a] transition-colors">
                      {loc.email}
                    </a>
                  </div>
                  <div className="flex items-center gap-3 text-[#5a5a5a]">
                    <Phone className="w-4 h-4 text-[#b8936a] shrink-0" />
                    <a href={`tel:${loc.phone}`} className="text-sm font-light hover:text-[#b8936a] transition-colors">
                      {loc.phone}
                    </a>
                  </div>
                </div>

                <div className="border-t border-gray-100 pt-5 mb-6">
                  <div className="flex items-start gap-3 text-[#5a5a5a]">
                    <Clock className="w-4 h-4 text-[#b8936a] mt-0.5 shrink-0" />
                    <div className="text-sm font-light space-y-1">
                      <p>{loc.hours.weekday}</p>
                      <p>{loc.hours.saturday}</p>
                      <p>{loc.hours.sunday}</p>
                    </div>
                  </div>
                </div>

                <a
                  href="#booking"
                  className="block text-center py-3 border border-[#b8936a] text-[#b8936a] tracking-widest uppercase text-xs font-light hover:bg-[#b8936a] hover:text-white transition-all duration-300"
                >
                  Book an Appointment
                </a>
              </div>
            </div>
          ))}
        </div>

        <p className="text-center text-[#9a9a9a] text-xs font-light mt-8 italic">
          * All nail repairs must be completed at the same location where the service was originally performed.
        </p>
      </div>
    </section>
  );
}
