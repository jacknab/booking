import { MapPin, Phone, Clock, Instagram, Facebook } from 'lucide-react';

const hours = [
  { day: 'Monday – Friday', time: '9:30am – 7:30pm' },
  { day: 'Saturday', time: '9:00am – 7:00pm' },
  { day: 'Sunday', time: '10:00am – 6:00pm' },
];

export default function Footer() {
  return (
    <footer id="contact" className="bg-charcoal-800 text-white">
      {/* Main Footer */}
      <div className="max-w-7xl mx-auto px-6 py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="lg:col-span-1">
            <div className="mb-6">
              <span className="font-serif text-3xl font-light tracking-[0.15em]">Lumière</span>
              <br />
              <span className="font-sans text-[9px] font-medium tracking-[0.4em] uppercase text-gold-400">
                Nail Salon & Spa
              </span>
            </div>
            <p className="font-sans text-sm text-white/55 leading-relaxed mb-6">
              Denver's premier destination for luxury nail care. Where precision meets artistry.
            </p>
            <div className="flex gap-3">
              <a
                href="#"
                className="w-9 h-9 bg-white/10 hover:bg-gold-400/20 flex items-center justify-center transition-colors duration-300"
                aria-label="Instagram"
              >
                <Instagram size={15} className="text-white/70" />
              </a>
              <a
                href="#"
                className="w-9 h-9 bg-white/10 hover:bg-gold-400/20 flex items-center justify-center transition-colors duration-300"
                aria-label="Facebook"
              >
                <Facebook size={15} className="text-white/70" />
              </a>
            </div>
          </div>

          {/* Hours */}
          <div>
            <h4 className="font-sans text-[10px] font-bold tracking-[0.35em] uppercase text-gold-400 mb-6">
              Hours
            </h4>
            <ul className="flex flex-col gap-3">
              {hours.map(({ day, time }) => (
                <li key={day} className="flex items-start gap-2">
                  <Clock size={13} className="text-gold-400/70 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-sans text-xs font-semibold text-white/80">{day}</p>
                    <p className="font-sans text-xs text-white/50">{time}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-sans text-[10px] font-bold tracking-[0.35em] uppercase text-gold-400 mb-6">
              Contact
            </h4>
            <ul className="flex flex-col gap-4">
              <li className="flex items-start gap-3">
                <MapPin size={14} className="text-gold-400/70 mt-0.5 flex-shrink-0" />
                <p className="font-sans text-sm text-white/60 leading-relaxed">
                  1420 Larimer St, Suite 200<br />Denver, CO 80202
                </p>
              </li>
              <li className="flex items-center gap-3">
                <Phone size={14} className="text-gold-400/70 flex-shrink-0" />
                <a
                  href="tel:+13035550198"
                  className="font-sans text-sm text-white/60 hover:text-gold-400 transition-colors"
                >
                  (303) 555-0198
                </a>
              </li>
            </ul>
          </div>

          {/* Booking CTA */}
          <div className="flex flex-col justify-between">
            <div>
              <h4 className="font-sans text-[10px] font-bold tracking-[0.35em] uppercase text-gold-400 mb-6">
                Ready to Glow?
              </h4>
              <p className="font-sans text-sm text-white/55 leading-relaxed mb-6">
                Book online or give us a call. Walk-ins always welcome based on availability.
              </p>
            </div>
            <a
              href="#"
              className="inline-flex items-center justify-center bg-gold-400 hover:bg-gold-500 text-charcoal-900 font-sans text-xs font-bold tracking-[0.25em] uppercase px-8 py-4 transition-all duration-300 hover:shadow-lg hover:shadow-gold-400/30"
            >
              Book Online
            </a>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-5 flex flex-col md:flex-row items-center justify-between gap-3">
          <p className="font-sans text-[11px] text-white/35 tracking-wide">
            &copy; {new Date().getFullYear()} Lumière Nail Salon & Spa. All rights reserved.
          </p>
          <div className="flex gap-6">
            <a href="#" className="font-sans text-[11px] text-white/35 hover:text-white/60 transition-colors tracking-wide">
              Privacy Policy
            </a>
            <a href="#" className="font-sans text-[11px] text-white/35 hover:text-white/60 transition-colors tracking-wide">
              Terms of Service
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
