import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Intro from './components/Intro';
import Services from './components/Services';
import Gallery from './components/Gallery';
import Reviews from './components/Reviews';
import Footer from './components/Footer';

function App() {
  return (
    <div className="font-sans bg-cream-100">
      <Navbar />
      <Hero />
      <Intro />
      <Services />
      <Gallery />
      <Reviews />
      <Footer />
    </div>
  );
}

export default App;
