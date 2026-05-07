import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Services from './components/Services';
import Difference from './components/Difference';
import FounderStatement from './components/FounderStatement';
import Gallery from './components/Gallery';
import CallToAction from './components/CallToAction';
import Footer from './components/Footer';

function App() {
  return (
    <div className="min-h-screen bg-[#0f0d0b] text-white">
      <Navbar />
      <Hero />
      <Services />
      <Difference />
      <FounderStatement />
      <Gallery />
      <CallToAction />
      <Footer />
    </div>
  );
}

export default App;
