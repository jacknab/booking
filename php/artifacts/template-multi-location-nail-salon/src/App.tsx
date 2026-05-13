import { useState, useEffect } from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import Concept from './components/Concept';
import Services from './components/Services';
import Locations from './components/Locations';
import Testimonials from './components/Testimonials';
import About from './components/About';
import GiftCards from './components/GiftCards';
import Newsletter from './components/Newsletter';
import Footer from './components/Footer';

function App() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div className="min-h-screen bg-white">
      <Header scrolled={scrolled} />
      <Hero />
      <Concept />
      <Services />
      <Locations />
      <Testimonials />
      <About />
      <GiftCards />
      <Newsletter />
      <Footer />
    </div>
  );
}

export default App;
