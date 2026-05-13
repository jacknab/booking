import { useState, useEffect } from 'react';
import { Scissors, Menu, X } from 'lucide-react';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const links = [
    { label: 'Services', href: '#services' },
    { label: 'Our Story', href: '#difference' },
    { label: 'Gallery', href: '#gallery' },
    { label: 'Contact', href: '#contact' },
  ];

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled ? 'bg-[#0f0d0b]/95 backdrop-blur-md shadow-lg shadow-black/40 py-3' : 'bg-transparent py-6'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        <a href="#" className="flex items-center gap-3 group">
          <div className="w-9 h-9 rounded-full bg-[#c9a96e] flex items-center justify-center group-hover:bg-[#e0bc82] transition-colors">
            <Scissors size={18} className="text-[#0f0d0b]" />
          </div>
          <div>
            <span className="block text-white font-bold tracking-widest uppercase text-sm leading-none">King's Row</span>
            <span className="block text-[#c9a96e] text-[10px] tracking-[0.2em] uppercase leading-none mt-0.5">Barber Co.</span>
          </div>
        </a>

        <div className="hidden md:flex items-center gap-8">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="text-white/70 hover:text-[#c9a96e] text-sm tracking-widest uppercase transition-colors duration-300"
            >
              {l.label}
            </a>
          ))}
          <a
            href="#services"
            className="ml-4 px-5 py-2.5 bg-[#c9a96e] text-[#0f0d0b] text-sm font-bold tracking-widest uppercase rounded hover:bg-[#e0bc82] transition-colors duration-300"
          >
            Book Now
          </a>
        </div>

        <button
          className="md:hidden text-white/80 hover:text-[#c9a96e] transition-colors"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          {menuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {menuOpen && (
        <div className="md:hidden bg-[#0f0d0b]/98 border-t border-white/10 px-6 py-6 flex flex-col gap-5">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="text-white/70 hover:text-[#c9a96e] text-sm tracking-widest uppercase transition-colors"
              onClick={() => setMenuOpen(false)}
            >
              {l.label}
            </a>
          ))}
          <a
            href="#services"
            className="mt-2 px-5 py-3 bg-[#c9a96e] text-[#0f0d0b] text-sm font-bold tracking-widest uppercase rounded text-center hover:bg-[#e0bc82] transition-colors"
            onClick={() => setMenuOpen(false)}
          >
            Book Now
          </a>
        </div>
      )}
    </nav>
  );
}
