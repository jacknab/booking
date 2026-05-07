import { Scissors, MapPin, Phone, Clock, Instagram, Facebook } from 'lucide-react';

export default function Footer() {
  return (
    <footer id="contact" className="bg-[#0a0806] border-t border-white/8">
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-9 h-9 rounded-full bg-[#c9a96e] flex items-center justify-center">
                <Scissors size={18} className="text-[#0f0d0b]" />
              </div>
              <div>
                <span className="block text-white font-bold tracking-widest uppercase text-sm leading-none">King's Row</span>
                <span className="block text-[#c9a96e] text-[10px] tracking-[0.2em] uppercase leading-none mt-0.5">Barber Co.</span>
              </div>
            </div>
            <p className="text-white/40 text-sm leading-relaxed mb-6">
              Where tradition meets trend in men's grooming. Serving Chicago's West Loop since 2018.
            </p>
            <div className="flex gap-3">
              <a
                href="#"
                className="w-9 h-9 rounded-full border border-white/15 flex items-center justify-center text-white/40 hover:border-[#c9a96e] hover:text-[#c9a96e] transition-colors"
                aria-label="Instagram"
              >
                <Instagram size={16} />
              </a>
              <a
                href="#"
                className="w-9 h-9 rounded-full border border-white/15 flex items-center justify-center text-white/40 hover:border-[#c9a96e] hover:text-[#c9a96e] transition-colors"
                aria-label="Facebook"
              >
                <Facebook size={16} />
              </a>
            </div>
          </div>

          {/* Quick links */}
          <div>
            <h3 className="text-white text-xs font-bold tracking-widest uppercase mb-5">Quick Links</h3>
            <ul className="space-y-3">
              {['Services & Pricing', 'Our Story', 'Gallery', 'Book an Appointment'].map((link) => (
                <li key={link}>
                  <a
                    href="#services"
                    className="text-white/40 hover:text-[#c9a96e] text-sm transition-colors"
                  >
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Hours */}
          <div>
            <h3 className="text-white text-xs font-bold tracking-widest uppercase mb-5">Hours</h3>
            <ul className="space-y-3 text-sm">
              {[
                { day: 'Mon – Fri', hours: '9:00 AM – 7:00 PM' },
                { day: 'Saturday', hours: '9:00 AM – 5:00 PM' },
                { day: 'Sunday', hours: 'Closed' },
              ].map((h) => (
                <li key={h.day} className="flex justify-between gap-6">
                  <span className="text-white/50">{h.day}</span>
                  <span className={h.hours === 'Closed' ? 'text-red-400/70' : 'text-white/70'}>{h.hours}</span>
                </li>
              ))}
            </ul>
            <div className="mt-4 flex items-center gap-2 text-[#c9a96e]/70 text-xs">
              <Clock size={12} />
              <span>Walk-ins welcome</span>
            </div>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-white text-xs font-bold tracking-widest uppercase mb-5">Find Us</h3>
            <ul className="space-y-4">
              <li className="flex gap-3">
                <MapPin size={16} className="text-[#c9a96e] flex-shrink-0 mt-0.5" />
                <span className="text-white/50 text-sm leading-relaxed">
                  847 W. Randolph Street<br />
                  Chicago, IL 60607
                </span>
              </li>
              <li className="flex gap-3">
                <Phone size={16} className="text-[#c9a96e] flex-shrink-0 mt-0.5" />
                <a
                  href="tel:+13125559247"
                  className="text-white/50 hover:text-[#c9a96e] text-sm transition-colors"
                >
                  (312) 555-9247
                </a>
              </li>
            </ul>
            <a
              href="#services"
              className="mt-8 inline-block w-full text-center px-5 py-3 bg-[#c9a96e] text-[#0f0d0b] text-sm font-bold tracking-widest uppercase rounded hover:bg-[#e0bc82] transition-colors"
            >
              Book Now
            </a>
          </div>
        </div>
      </div>

      <div className="border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6 py-5 flex flex-col sm:flex-row justify-between items-center gap-3">
          <p className="text-white/25 text-xs">
            &copy; {new Date().getFullYear()} King's Row Barber Co. All rights reserved.
          </p>
          <p className="text-white/25 text-xs">847 W. Randolph St, Chicago, IL 60607</p>
        </div>
      </div>
    </footer>
  );
}
