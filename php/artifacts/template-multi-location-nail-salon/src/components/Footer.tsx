import { Facebook, Instagram, MapPin, Phone, Mail, Clock } from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[#111111] text-white">
      {/* Instagram strip */}
      <div className="border-b border-white/10 py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <p className="text-[#c9a96e] text-xs tracking-[0.4em] uppercase font-medium mb-2">
              Follow Along
            </p>
            <a
              href="#"
              className="text-white text-xl font-bold hover:text-[#c9a96e] transition-colors"
              style={{ fontFamily: 'Georgia, serif' }}
            >
              @PetalNailSpa
            </a>
          </div>
          <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
            {[
              'https://images.pexels.com/photos/3997379/pexels-photo-3997379.jpeg?auto=compress&cs=tinysrgb&w=300',
              'https://images.pexels.com/photos/3997391/pexels-photo-3997391.jpeg?auto=compress&cs=tinysrgb&w=300',
              'https://images.pexels.com/photos/704815/pexels-photo-704815.jpeg?auto=compress&cs=tinysrgb&w=300',
              'https://images.pexels.com/photos/3997394/pexels-photo-3997394.jpeg?auto=compress&cs=tinysrgb&w=300',
              'https://images.pexels.com/photos/3997380/pexels-photo-3997380.jpeg?auto=compress&cs=tinysrgb&w=300',
              'https://images.pexels.com/photos/3997395/pexels-photo-3997395.jpeg?auto=compress&cs=tinysrgb&w=300',
            ].map((src, i) => (
              <a
                key={i}
                href="#"
                className="aspect-square overflow-hidden group block"
                aria-label={`Instagram post ${i + 1}`}
              >
                <img
                  src={src}
                  alt={`Nail art ${i + 1}`}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 brightness-75 group-hover:brightness-100"
                />
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* Main footer */}
      <div className="py-16 px-4">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="md:col-span-1">
            <div className="mb-5">
              <span className="block text-[10px] tracking-[0.3em] uppercase text-[#c9a96e] font-medium">
                Petal
              </span>
              <span
                className="text-2xl font-bold text-white"
                style={{ fontFamily: 'Georgia, serif' }}
              >
                Nail Spa
              </span>
            </div>
            <p className="text-white/50 text-sm leading-relaxed mb-6">
              Austin's premier natural nail salon. Award-winning. Eco-conscious. Your nails deserve
              the best.
            </p>
            <div className="flex gap-4">
              <a
                href="#"
                aria-label="Facebook"
                className="w-9 h-9 border border-white/20 flex items-center justify-center hover:border-[#c9a96e] hover:text-[#c9a96e] transition-colors"
              >
                <Facebook size={14} />
              </a>
              <a
                href="#"
                aria-label="Instagram"
                className="w-9 h-9 border border-white/20 flex items-center justify-center hover:border-[#c9a96e] hover:text-[#c9a96e] transition-colors"
              >
                <Instagram size={14} />
              </a>
            </div>
          </div>

          {/* South Congress */}
          <div>
            <h4 className="text-white text-sm font-semibold tracking-widest uppercase mb-5">
              South Congress
            </h4>
            <ul className="space-y-3 text-white/50 text-sm">
              <li className="flex items-start gap-2">
                <MapPin size={13} className="text-[#c9a96e] mt-0.5 shrink-0" />
                <span>2847 South Congress Ave<br />Austin, TX 78704</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone size={13} className="text-[#c9a96e] shrink-0" />
                <a href="tel:+15123849201" className="hover:text-white transition-colors">
                  (512) 384-9201
                </a>
              </li>
              <li className="flex items-start gap-2">
                <Clock size={13} className="text-[#c9a96e] mt-0.5 shrink-0" />
                <span>Mon–Fri: 9AM–7PM<br />Sat: 9AM–6PM<br />Sun: 10AM–5PM</span>
              </li>
            </ul>
          </div>

          {/* The Domain */}
          <div>
            <h4 className="text-white text-sm font-semibold tracking-widest uppercase mb-5">
              The Domain
            </h4>
            <ul className="space-y-3 text-white/50 text-sm">
              <li className="flex items-start gap-2">
                <MapPin size={13} className="text-[#c9a96e] mt-0.5 shrink-0" />
                <span>11601 Domain Blvd, Suite 120<br />Austin, TX 78758</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone size={13} className="text-[#c9a96e] shrink-0" />
                <a href="tel:+15127483065" className="hover:text-white transition-colors">
                  (512) 748-3065
                </a>
              </li>
              <li className="flex items-start gap-2">
                <Clock size={13} className="text-[#c9a96e] mt-0.5 shrink-0" />
                <span>Mon–Fri: 9AM–8PM<br />Sat: 9AM–7PM<br />Sun: 10AM–6PM</span>
              </li>
            </ul>
          </div>

          {/* Contact & Quick links */}
          <div>
            <h4 className="text-white text-sm font-semibold tracking-widest uppercase mb-5">
              Contact
            </h4>
            <ul className="space-y-3 text-white/50 text-sm mb-8">
              <li className="flex items-center gap-2">
                <Mail size={13} className="text-[#c9a96e] shrink-0" />
                <a href="mailto:hello@petalsnailspa.com" className="hover:text-white transition-colors break-all">
                  hello@petalsnailspa.com
                </a>
              </li>
            </ul>
            <h4 className="text-white text-sm font-semibold tracking-widest uppercase mb-4">
              Quick Links
            </h4>
            <ul className="space-y-2 text-white/50 text-sm">
              {['Services', 'Locations', 'About', 'Gift Cards'].map((item) => (
                <li key={item}>
                  <a
                    href={`#${item.toLowerCase().replace(' ', '-')}`}
                    className="hover:text-[#c9a96e] transition-colors"
                  >
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/10 py-6 px-4">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-white/30 text-xs">
          <p>© {currentYear} Petal Nail Spa. All rights reserved.</p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-white/60 transition-colors">
              Privacy Policy
            </a>
            <a href="#" className="hover:text-white/60 transition-colors">
              Terms of Service
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
