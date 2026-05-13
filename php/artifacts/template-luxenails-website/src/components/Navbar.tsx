import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X, Sparkles } from 'lucide-react';

interface NavbarProps {
  scrolled: boolean;
}

export default function Navbar({ scrolled }: NavbarProps) {
  const [menuOpen, setMenuOpen] = useState(false);

  const links = [
    { label: 'Services', href: '#services' },
    { label: 'About', href: '#about' },
    { label: 'Locations', href: '#locations' },
    { label: 'Drinks', href: '/drink-menu' },
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? 'bg-white shadow-md py-3'
          : 'bg-transparent py-5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 group">
          <Sparkles
            className={`w-6 h-6 transition-colors duration-300 ${
              scrolled ? 'text-[#b8936a]' : 'text-[#e8c99a]'
            }`}
          />
          <span
            className={`text-xl font-light tracking-[0.2em] uppercase transition-colors duration-300 ${
              scrolled ? 'text-[#1a1a1a]' : 'text-white'
            }`}
          >
            Luxe<span className="font-semibold">Nails</span>
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-8">
          {links.map((link) => {
            const isExternal = link.href.startsWith('/');
            return isExternal ? (
              <Link
                key={link.label}
                to={link.href}
                className={`text-sm tracking-widest uppercase font-light transition-colors duration-300 hover:text-[#b8936a] ${
                  scrolled ? 'text-[#3a3a3a]' : 'text-white/90'
                }`}
              >
                {link.label}
              </Link>
            ) : (
              <a
                key={link.label}
                href={link.href}
                className={`text-sm tracking-widest uppercase font-light transition-colors duration-300 hover:text-[#b8936a] ${
                  scrolled ? 'text-[#3a3a3a]' : 'text-white/90'
                }`}
              >
                {link.label}
              </a>
            );
          })}
          <a
            href="#booking"
            className="text-sm tracking-widest uppercase px-6 py-2.5 bg-[#b8936a] text-white font-light hover:bg-[#a07a54] transition-colors duration-300"
          >
            Book Now
          </a>
        </nav>

        {/* Mobile toggle */}
        <button
          className={`md:hidden transition-colors duration-300 ${
            scrolled ? 'text-[#1a1a1a]' : 'text-white'
          }`}
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile menu */}
      <div
        className={`md:hidden overflow-hidden transition-all duration-400 bg-white ${
          menuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="px-6 py-4 flex flex-col gap-4 border-t border-gray-100">
          {links.map((link) => {
            const isExternal = link.href.startsWith('/');
            return isExternal ? (
              <Link
                key={link.label}
                to={link.href}
                onClick={() => setMenuOpen(false)}
                className="text-sm tracking-widest uppercase text-[#3a3a3a] hover:text-[#b8936a] transition-colors"
              >
                {link.label}
              </Link>
            ) : (
              <a
                key={link.label}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className="text-sm tracking-widest uppercase text-[#3a3a3a] hover:text-[#b8936a] transition-colors"
              >
                {link.label}
              </a>
            );
          })}
          <a
            href="#booking"
            onClick={() => setMenuOpen(false)}
            className="text-sm tracking-widest uppercase px-6 py-2.5 bg-[#b8936a] text-white text-center font-light hover:bg-[#a07a54] transition-colors"
          >
            Book Now
          </a>
        </div>
      </div>
    </header>
  );
}
