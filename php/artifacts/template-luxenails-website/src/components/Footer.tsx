import { Sparkles, Instagram, Facebook, MapPin, Phone, Mail } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-[#0f0d0a] text-white">
      <div className="max-w-7xl mx-auto px-6 py-16 grid md:grid-cols-4 gap-12">
        <div className="md:col-span-1">
          <div className="flex items-center gap-2 mb-5">
            <Sparkles className="w-5 h-5 text-[#b8936a]" />
            <span className="text-lg font-light tracking-[0.2em] uppercase">
              Luxe<span className="font-semibold">Nails</span>
            </span>
          </div>
          <p className="text-white/50 text-sm font-light leading-relaxed mb-6">
            Your premier destination for luxury nail care. Where artistry meets relaxation in an elegant, tranquil setting.
          </p>
          <div className="flex gap-3">
            <a href="#" className="w-9 h-9 border border-white/20 flex items-center justify-center hover:border-[#b8936a] hover:text-[#b8936a] transition-all duration-300">
              <Instagram className="w-4 h-4" />
            </a>
            <a href="#" className="w-9 h-9 border border-white/20 flex items-center justify-center hover:border-[#b8936a] hover:text-[#b8936a] transition-all duration-300">
              <Facebook className="w-4 h-4" />
            </a>
          </div>
        </div>

        <div>
          <h4 className="text-xs tracking-[0.3em] uppercase text-[#b8936a] font-light mb-5">Services</h4>
          <ul className="space-y-2.5">
            {['Classic Manicure', 'Gel Manicure', 'Luxury Pedicure', 'Gel Extensions', 'Builder Gel', 'Dip Powder', 'Nail Art', 'Nail Repair'].map((s) => (
              <li key={s}>
                <a href="#services" className="text-white/50 text-sm font-light hover:text-[#b8936a] transition-colors duration-300">
                  {s}
                </a>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="text-xs tracking-[0.3em] uppercase text-[#b8936a] font-light mb-5">Quick Links</h4>
          <ul className="space-y-2.5">
            <li><a href="/" className="text-white/50 text-sm font-light hover:text-[#b8936a] transition-colors duration-300">Home</a></li>
            <li><a href="#services" className="text-white/50 text-sm font-light hover:text-[#b8936a] transition-colors duration-300">Services</a></li>
            <li><a href="#locations" className="text-white/50 text-sm font-light hover:text-[#b8936a] transition-colors duration-300">Locations</a></li>
            <li><Link to="/drink-menu" className="text-white/50 text-sm font-light hover:text-[#b8936a] transition-colors duration-300">Drink Menu</Link></li>
            <li><a href="#booking" className="text-white/50 text-sm font-light hover:text-[#b8936a] transition-colors duration-300">Book Now</a></li>
            <li><a href="#" className="text-white/50 text-sm font-light hover:text-[#b8936a] transition-colors duration-300">Gift Cards</a></li>
          </ul>
        </div>

        <div>
          <h4 className="text-xs tracking-[0.3em] uppercase text-[#b8936a] font-light mb-5">Contact</h4>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <MapPin className="w-4 h-4 text-[#b8936a] mt-0.5 shrink-0" />
              <div>
                <p className="text-white/50 text-sm font-light">125 Main Street, Suite 200</p>
                <p className="text-white/50 text-sm font-light">New York, NY 10001</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Phone className="w-4 h-4 text-[#b8936a] shrink-0" />
              <a href="tel:+12125550101" className="text-white/50 text-sm font-light hover:text-[#b8936a] transition-colors">
                +1 212.555.0101
              </a>
            </div>
            <div className="flex items-center gap-3">
              <Mail className="w-4 h-4 text-[#b8936a] shrink-0" />
              <a href="mailto:hello@luxenails.com" className="text-white/50 text-sm font-light hover:text-[#b8936a] transition-colors">
                hello@luxenails.com
              </a>
            </div>
          </div>

          <div className="mt-8">
            <h4 className="text-xs tracking-[0.3em] uppercase text-[#b8936a] font-light mb-3">Hours</h4>
            <div className="space-y-1 text-white/50 text-sm font-light">
              <p>Mon – Fri: 9:30 AM – 7:00 PM</p>
              <p>Saturday: 9:30 AM – 6:00 PM</p>
              <p>Sunday: 10:30 AM – 5:00 PM</p>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-white/30 text-xs font-light tracking-wide">
            &copy; {year} LuxeNails Spa. All rights reserved.
          </p>
          <div className="flex gap-6">
            {['Privacy Policy', 'Terms of Service', 'Accessibility'].map((l) => (
              <a key={l} href="#" className="text-white/30 text-xs font-light hover:text-white/60 transition-colors">
                {l}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
