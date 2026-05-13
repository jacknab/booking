import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import DrinkMenu from '../components/DrinkMenu';
import Footer from '../components/Footer';

export default function DrinkMenuPage() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-[#faf8f5] font-sans">
      <Navbar scrolled={scrolled} />
      <DrinkMenu />
      <Footer />
    </div>
  );
}
