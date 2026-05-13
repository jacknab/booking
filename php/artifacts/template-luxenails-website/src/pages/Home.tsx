import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import Marquee from '../components/Marquee';
import About from '../components/About';
import Services from '../components/Services';
import WhyUs from '../components/WhyUs';
import Locations from '../components/Locations';
import Events from '../components/Events';
import Testimonials from '../components/Testimonials';
import BookingCTA from '../components/BookingCTA';
import Footer from '../components/Footer';

export default function Home() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-[#faf8f5] font-sans">
      <Navbar scrolled={scrolled} />
      <Hero />
      <Marquee />
      <About />
      <Services />
      <WhyUs />
      <Locations />
      <Events />
      <Testimonials />
      <BookingCTA />
      <Footer />
    </div>
  );
}
