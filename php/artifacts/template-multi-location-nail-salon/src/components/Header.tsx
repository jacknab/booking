import { useState } from 'react';
import { Phone, Mail, Facebook, Instagram, Menu, X } from 'lucide-react';

interface HeaderProps {
  scrolled: boolean;
}

export default function Header({ scrolled }: HeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false);

  const navLinks = [
    { label: 'Services', href: '#services' },
    { label: 'Locations', href: '#locations' },
    { label: 'About', href: '#about' },
    { label: 'Gift Cards', href: '#gift-cards' },
  ];

  return (
    <>
      {/* Top bar */}
      <div className="bg-[#2a2a2a] text-white text-sm py-2 px-4 hidden md:block">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-6">
            <a href="tel:+15123849201" className="flex items-center gap-2 hover:text-[#c9a96e] transition-colors">
              <Phone size={13} />
              <span>(512) 384-9201</span>
            </a>
            <a href="mailto:hello@petalsnailspa.com" className="flex items-center gap-2 hover:text-[#c9a96e] transition-colors">
              <Mail size={13} />
              <span>hello@petalsnailspa.com</span>
            </a>
          </div>
          <div className="flex items-center gap-4">
            <a href="#" aria-label="Facebook" className="hover:text-[#c9a96e] transition-colors">
              <Facebook size={15} />
            </a>
            <a href="#" aria-label="Instagram" className="hover:text-[#c9a96e] transition-colors">
              <Instagram size={15} />
            </a>
          </div>
        </div>
      </div>

      {/* Main nav */}
      <header
        className={`sticky top-0 z-50 transition-all duration-300 ${
          scrolled ? 'bg-white shadow-md' : 'bg-white/95 backdrop-blur-sm'
        }`}
      >
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          {/* Logo */}
          <a href="#" className="flex flex-col leading-none">
            <span className="text-[10px] tracking-[0.3em] uppercase text-[#c9a96e] font-medium">Petal</span>
            <span className="text-2xl font-bold text-[#1a1a1a] tracking-tight" style={{ fontFamily: 'Georgia, serif' }}>
              Nail Spa
            </span>
          </a>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="text-sm font-medium text-[#3a3a3a] hover:text-[#c9a96e] transition-colors tracking-wide uppercase"
              >
                {link.label}
              </a>
            ))}
          </nav>

          {/* Book button */}
          <div className="hidden md:block">
            <button className="bg-[#c9a96e] text-white text-sm font-semibold tracking-widest uppercase px-6 py-3 hover:bg-[#b8935a] transition-colors">
              Book Now
            </button>
          </div>

          {/* Mobile toggle */}
          <button
            className="md:hidden text-[#3a3a3a]"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
          >
            {menuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden bg-white border-t border-gray-100 px-4 pb-6">
            <nav className="flex flex-col gap-4 pt-4">
              {navLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  className="text-sm font-medium text-[#3a3a3a] hover:text-[#c9a96e] transition-colors tracking-wide uppercase"
                  onClick={() => setMenuOpen(false)}
                >
                  {link.label}
                </a>
              ))}
              <button className="mt-2 bg-[#c9a96e] text-white text-sm font-semibold tracking-widest uppercase px-6 py-3 hover:bg-[#b8935a] transition-colors w-full">
                Book Now
              </button>
            </nav>
            <div className="flex items-center gap-4 mt-4 pt-4 border-t border-gray-100">
              <a href="tel:+15123849201" className="flex items-center gap-2 text-sm text-[#3a3a3a]">
                <Phone size={13} />
                <span>(512) 384-9201</span>
              </a>
            </div>
          </div>
        )}
      </header>
    </>
  );
}
