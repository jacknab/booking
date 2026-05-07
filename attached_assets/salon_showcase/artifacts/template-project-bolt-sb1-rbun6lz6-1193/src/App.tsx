import { useState, useEffect, useRef } from 'react';
import {
  Scissors,
  Phone,
  MapPin,
  Clock,
  Star,
  ChevronDown,
  Menu,
  X,
  Instagram,
  Facebook,
  Twitter,
  ArrowRight,
  CheckCircle,
} from 'lucide-react';

const NAV_LINKS = ['Home', 'About', 'Services', 'Gallery', 'Reviews', 'Contact'];

const SERVICES = [
  {
    title: 'Classic Haircut',
    desc: 'A timeless cut tailored to your face shape and lifestyle. Our master barbers deliver precision with every snip.',
    price: '$45',
    icon: '✂',
  },
  {
    title: 'Signature Shave',
    desc: 'Experience the ritual of a hot-towel straight razor shave. Pure luxury from lather to finish.',
    price: '$55',
    icon: '🪒',
  },
  {
    title: 'Beard Sculpting',
    desc: 'Define your edge with expert beard trimming, shaping, and conditioning treatments.',
    price: '$40',
    icon: '🧔',
  },
  {
    title: 'Haircut & Shave',
    desc: 'The ultimate grooming combo. Look sharp from head to jaw with our signature package.',
    price: '$90',
    icon: '👑',
  },
  {
    title: 'Hair Treatment',
    desc: 'Restore vitality and shine with our premium scalp treatments and deep conditioning rituals.',
    price: '$65',
    icon: '💆',
  },
  {
    title: 'Fade & Taper',
    desc: 'Flawless fades and tapers executed with surgical precision. Clean lines, every time.',
    price: '$50',
    icon: '⚡',
  },
];

const GALLERY_IMAGES = [
  {
    url: 'https://images.pexels.com/photos/32329615/pexels-photo-32329615.jpeg?auto=compress&cs=tinysrgb&w=800',
    alt: 'Classic barbershop haircut',
  },
  {
    url: 'https://images.pexels.com/photos/4351726/pexels-photo-4351726.jpeg?auto=compress&cs=tinysrgb&w=800',
    alt: 'Precision fade',
  },
  {
    url: 'https://images.pexels.com/photos/32329619/pexels-photo-32329619.jpeg?auto=compress&cs=tinysrgb&w=800',
    alt: 'Barber at work',
  },
  {
    url: 'https://images.pexels.com/photos/4625632/pexels-photo-4625632.jpeg?auto=compress&cs=tinysrgb&w=800',
    alt: 'Hot towel shave',
  },
  {
    url: 'https://images.pexels.com/photos/9992821/pexels-photo-9992821.jpeg?auto=compress&cs=tinysrgb&w=800',
    alt: 'Beard grooming',
  },
  {
    url: 'https://images.pexels.com/photos/12706272/pexels-photo-12706272.jpeg?auto=compress&cs=tinysrgb&w=800',
    alt: 'Barbershop interior',
  },
];

const REVIEWS = [
  {
    name: 'Marcus T.',
    rating: 5,
    text: 'Hands down the best barbershop in Manhattan. Victor gave me the cleanest fade I have ever had. The atmosphere is elite — feels like a private club. Worth every dollar.',
    date: 'March 2025',
    avatar: 'MT',
  },
  {
    name: 'James R.',
    rating: 5,
    text: 'I have been to barbershops all over the city. Noble & Blade is in a different league. The hot towel shave experience alone is reason enough to visit. I will never go anywhere else.',
    date: 'February 2025',
    avatar: 'JR',
  },
  {
    name: 'Anthony V.',
    rating: 5,
    text: 'The attention to detail here is unmatched. My barber took his time to understand exactly what I wanted. Walked out looking like a million bucks. This is the real deal.',
    date: 'January 2025',
    avatar: 'AV',
  },
];

const BARBERS = [
  {
    name: 'Victor Reyes',
    title: 'Master Barber & Founder',
    years: '15 years experience',
    img: 'https://images.pexels.com/photos/7518744/pexels-photo-7518744.jpeg?auto=compress&cs=tinysrgb&w=600',
  },
  {
    name: 'Daniel Cruz',
    title: 'Senior Barber',
    years: '10 years experience',
    img: 'https://images.pexels.com/photos/4351727/pexels-photo-4351727.jpeg?auto=compress&cs=tinysrgb&w=600',
  },
  {
    name: 'Marcus Webb',
    title: 'Fade Specialist',
    years: '8 years experience',
    img: 'https://images.pexels.com/photos/9992816/pexels-photo-9992816.jpeg?auto=compress&cs=tinysrgb&w=600',
  },
];

function useInView(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setInView(true);
      },
      { threshold }
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [threshold]);

  return { ref, inView };
}

export default function App() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    service: '',
    message: '',
  });
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const scrollTo = (id: string) => {
    document.getElementById(id.toLowerCase())?.scrollIntoView({ behavior: 'smooth' });
    setMenuOpen(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  const aboutRef = useInView();
  const servicesRef = useInView();
  const galleryRef = useInView();
  const teamRef = useInView();
  const reviewsRef = useInView();
  const contactRef = useInView();

  return (
    <div className="font-sans bg-neutral-950 text-white overflow-x-hidden">
      {/* NAV */}
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrolled ? 'bg-neutral-950/97 shadow-2xl backdrop-blur-md py-4' : 'bg-transparent py-6'
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          <button onClick={() => scrollTo('home')} className="flex items-center gap-3 group">
            <div className="w-10 h-10 border-2 border-amber-500 flex items-center justify-center rotate-45 group-hover:rotate-0 transition-transform duration-300">
              <Scissors className="w-4 h-4 text-amber-500 -rotate-45 group-hover:rotate-0 transition-transform duration-300" />
            </div>
            <div>
              <div className="text-white font-bold text-lg tracking-[0.2em] uppercase leading-none">
                Noble & Blade
              </div>
              <div className="text-amber-500 text-[10px] tracking-[0.4em] uppercase">New York</div>
            </div>
          </button>

          <ul className="hidden lg:flex items-center gap-8">
            {NAV_LINKS.map((link) => (
              <li key={link}>
                <button
                  onClick={() => scrollTo(link)}
                  className="text-neutral-400 hover:text-amber-500 text-sm tracking-[0.15em] uppercase transition-colors duration-200 relative group"
                >
                  {link}
                  <span className="absolute -bottom-1 left-0 w-0 h-px bg-amber-500 group-hover:w-full transition-all duration-300" />
                </button>
              </li>
            ))}
          </ul>

          <div className="hidden lg:flex items-center gap-4">
            <a
              href="tel:+12125550178"
              className="flex items-center gap-2 text-sm text-neutral-400 hover:text-white transition-colors"
            >
              <Phone className="w-4 h-4 text-amber-500" />
              (212) 555-0178
            </a>
            <button
              onClick={() => scrollTo('contact')}
              className="bg-amber-500 hover:bg-amber-400 text-neutral-950 text-sm font-bold tracking-[0.15em] uppercase px-6 py-3 transition-all duration-200 hover:shadow-lg hover:shadow-amber-500/25"
            >
              Book Now
            </button>
          </div>

          <button onClick={() => setMenuOpen(!menuOpen)} className="lg:hidden text-white p-2">
            {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        <div
          className={`lg:hidden transition-all duration-300 overflow-hidden ${
            menuOpen ? 'max-h-screen opacity-100' : 'max-h-0 opacity-0'
          }`}
        >
          <div className="bg-neutral-950 border-t border-neutral-800 px-6 py-6 flex flex-col gap-4">
            {NAV_LINKS.map((link) => (
              <button
                key={link}
                onClick={() => scrollTo(link)}
                className="text-neutral-300 hover:text-amber-500 text-sm tracking-[0.2em] uppercase text-left py-2 border-b border-neutral-800 transition-colors"
              >
                {link}
              </button>
            ))}
            <button
              onClick={() => scrollTo('contact')}
              className="mt-2 bg-amber-500 text-neutral-950 text-sm font-bold tracking-[0.15em] uppercase px-6 py-4"
            >
              Book Now
            </button>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section id="home" className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="https://images.pexels.com/photos/32329616/pexels-photo-32329616.jpeg?auto=compress&cs=tinysrgb&w=1600"
            alt="Noble & Blade Barbershop"
            className="w-full h-full object-cover object-center opacity-30"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-neutral-950/60 via-neutral-950/40 to-neutral-950" />
        </div>

        <div className="relative z-10 text-center px-6 max-w-5xl mx-auto">
          <div className="inline-flex items-center gap-3 mb-8">
            <div className="h-px w-12 bg-amber-500" />
            <span className="text-amber-500 text-xs tracking-[0.5em] uppercase">
              Est. 2015 — Manhattan, New York
            </span>
            <div className="h-px w-12 bg-amber-500" />
          </div>

          <h1 className="text-6xl md:text-8xl lg:text-9xl font-black tracking-tight leading-none mb-6">
            <span className="block text-white">The Art of</span>
            <span className="block text-amber-500">The Cut.</span>
          </h1>

          <p className="text-neutral-300 text-lg md:text-xl max-w-2xl mx-auto mb-12 leading-relaxed tracking-wide">
            Manhattan's most distinguished barbershop. Where master craftsmen meet classic tradition — and
            every client leaves transformed.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => scrollTo('contact')}
              className="group bg-amber-500 hover:bg-amber-400 text-neutral-950 font-black text-sm tracking-[0.2em] uppercase px-10 py-5 transition-all duration-200 hover:shadow-2xl hover:shadow-amber-500/30 flex items-center gap-3"
            >
              Book Your Appointment
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
            <button
              onClick={() => scrollTo('services')}
              className="border border-neutral-600 hover:border-amber-500 text-neutral-300 hover:text-amber-500 font-semibold text-sm tracking-[0.2em] uppercase px-10 py-5 transition-all duration-200"
            >
              Our Services
            </button>
          </div>

          <div className="mt-16 grid grid-cols-3 gap-8 max-w-lg mx-auto">
            {[
              ['500+', 'Happy Clients/Month'],
              ['15+', 'Years Experience'],
              ['3', 'Master Barbers'],
            ].map(([num, label]) => (
              <div key={label} className="text-center">
                <div className="text-amber-500 text-3xl font-black">{num}</div>
                <div className="text-neutral-500 text-xs tracking-widest uppercase mt-1">{label}</div>
              </div>
            ))}
          </div>
        </div>

        <button
          onClick={() => scrollTo('about')}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 text-neutral-500 hover:text-amber-500 transition-colors animate-bounce"
        >
          <ChevronDown className="w-8 h-8" />
        </button>
      </section>

      {/* ABOUT */}
      <section id="about" className="py-32 bg-neutral-950">
        <div
          ref={aboutRef.ref}
          className={`max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-16 items-center transition-all duration-1000 ${
            aboutRef.inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
          }`}
        >
          <div className="relative">
            <div className="relative z-10 grid grid-cols-2 gap-4">
              <img
                src="https://images.pexels.com/photos/4625630/pexels-photo-4625630.jpeg?auto=compress&cs=tinysrgb&w=700"
                alt="Barber working"
                className="w-full h-72 object-cover"
              />
              <img
                src="https://images.pexels.com/photos/19664860/pexels-photo-19664860.jpeg?auto=compress&cs=tinysrgb&w=700"
                alt="Precision fade"
                className="w-full h-72 object-cover mt-12"
              />
            </div>
            <div className="absolute -bottom-6 -left-6 w-48 h-48 border border-amber-500/30 z-0" />
            <div className="absolute top-6 right-0 bg-amber-500 text-neutral-950 font-black text-lg p-6 z-20 w-36 text-center leading-tight">
              10
              <br />
              Years
              <br />
              of
              <br />
              Craft
            </div>
          </div>

          <div>
            <div className="flex items-center gap-4 mb-6">
              <div className="h-px w-12 bg-amber-500" />
              <span className="text-amber-500 text-xs tracking-[0.4em] uppercase">Our Story</span>
            </div>
            <h2 className="text-5xl font-black leading-tight mb-6">
              More Than a<br />
              <span className="text-amber-500">Haircut.</span>
            </h2>
            <p className="text-neutral-400 text-lg leading-relaxed mb-6">
              Noble & Blade was founded in 2015 by Victor Reyes on the belief that every man deserves
              exceptional grooming — not just a quick trim. Nestled in the heart of Midtown Manhattan, we have
              built a sanctuary for the modern gentleman.
            </p>
            <p className="text-neutral-400 leading-relaxed mb-10">
              Our master barbers bring decades of combined experience to every appointment. We blend old-world
              barbershop tradition with contemporary precision, using only the finest tools and premium grooming
              products. When you sit in our chair, you are not just getting a haircut — you are experiencing a
              craft refined over thousands of hours.
            </p>

            <div className="grid grid-cols-2 gap-6">
              {[
                'Premium products only',
                'Walk-ins welcome',
                'Private consultations',
                'Expert beard artistry',
                'Hot towel shave ritual',
                'Complimentary drinks',
              ].map((item) => (
                <div key={item} className="flex items-center gap-3">
                  <CheckCircle className="w-4 h-4 text-amber-500 flex-shrink-0" />
                  <span className="text-neutral-300 text-sm">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* MARQUEE BANNER */}
      <div className="bg-amber-500 py-5 overflow-hidden">
        <div className="flex whitespace-nowrap">
          {Array(6)
            .fill(null)
            .map((_, i) => (
              <span
                key={i}
                className="text-neutral-950 font-black text-sm tracking-[0.3em] uppercase mx-6 flex-shrink-0"
              >
                NOBLE & BLADE &nbsp;&bull;&nbsp; MIDTOWN MANHATTAN &nbsp;&bull;&nbsp; MASTER BARBERS
                &nbsp;&bull;&nbsp; EST. 2015 &nbsp;&bull;&nbsp;
              </span>
            ))}
        </div>
      </div>

      {/* SERVICES */}
      <section id="services" className="py-32 bg-neutral-900">
        <div className="max-w-7xl mx-auto px-6">
          <div
            ref={servicesRef.ref}
            className={`text-center mb-16 transition-all duration-1000 ${
              servicesRef.inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
            }`}
          >
            <div className="flex items-center justify-center gap-4 mb-6">
              <div className="h-px w-12 bg-amber-500" />
              <span className="text-amber-500 text-xs tracking-[0.4em] uppercase">What We Offer</span>
              <div className="h-px w-12 bg-amber-500" />
            </div>
            <h2 className="text-5xl md:text-6xl font-black mb-4">Our Services</h2>
            <p className="text-neutral-400 max-w-xl mx-auto">
              Every service is performed with precision and care by our master barbers. No shortcuts, no
              compromises.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {SERVICES.map((service, i) => (
              <div
                key={service.title}
                className={`group bg-neutral-950 border border-neutral-800 hover:border-amber-500/60 p-8 transition-all duration-500 hover:-translate-y-1 hover:shadow-2xl hover:shadow-amber-500/10 ${
                  servicesRef.inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
                }`}
                style={{ transitionDelay: `${i * 80}ms` }}
              >
                <div className="text-4xl mb-4">{service.icon}</div>
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-xl font-bold text-white group-hover:text-amber-500 transition-colors">
                    {service.title}
                  </h3>
                  <span className="text-amber-500 font-black text-lg ml-4 flex-shrink-0">{service.price}</span>
                </div>
                <p className="text-neutral-400 text-sm leading-relaxed mb-6">{service.desc}</p>
                <button
                  onClick={() => scrollTo('contact')}
                  className="text-amber-500 text-xs tracking-[0.2em] uppercase font-bold flex items-center gap-2 hover:gap-3 transition-all"
                >
                  Book This Service <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* GALLERY */}
      <section id="gallery" className="py-32 bg-neutral-950">
        <div className="max-w-7xl mx-auto px-6">
          <div
            ref={galleryRef.ref}
            className={`text-center mb-16 transition-all duration-1000 ${
              galleryRef.inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
            }`}
          >
            <div className="flex items-center justify-center gap-4 mb-6">
              <div className="h-px w-12 bg-amber-500" />
              <span className="text-amber-500 text-xs tracking-[0.4em] uppercase">Our Work</span>
              <div className="h-px w-12 bg-amber-500" />
            </div>
            <h2 className="text-5xl md:text-6xl font-black">The Craft</h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {GALLERY_IMAGES.map((img, i) => (
              <div
                key={i}
                className={`group relative overflow-hidden aspect-square transition-all duration-700 ${
                  galleryRef.inView ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
                }`}
                style={{ transitionDelay: `${i * 100}ms` }}
              >
                <img
                  src={img.url}
                  alt={img.alt}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-amber-500/0 group-hover:bg-amber-500/20 transition-all duration-300" />
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                  <div className="w-12 h-12 border-2 border-white flex items-center justify-center">
                    <Scissors className="w-5 h-5 text-white" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TEAM */}
      <section id="team" className="py-32 bg-neutral-900">
        <div className="max-w-7xl mx-auto px-6">
          <div
            ref={teamRef.ref}
            className={`text-center mb-16 transition-all duration-1000 ${
              teamRef.inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
            }`}
          >
            <div className="flex items-center justify-center gap-4 mb-6">
              <div className="h-px w-12 bg-amber-500" />
              <span className="text-amber-500 text-xs tracking-[0.4em] uppercase">The Team</span>
              <div className="h-px w-12 bg-amber-500" />
            </div>
            <h2 className="text-5xl md:text-6xl font-black">Master Barbers</h2>
            <p className="text-neutral-400 max-w-xl mx-auto mt-4">
              Our barbers are artists. Each one trained to the highest standard and passionate about their craft.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {BARBERS.map((barber, i) => (
              <div
                key={barber.name}
                className={`group text-center transition-all duration-700 ${
                  teamRef.inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
                }`}
                style={{ transitionDelay: `${i * 150}ms` }}
              >
                <div className="relative mb-6 overflow-hidden">
                  <img
                    src={barber.img}
                    alt={barber.name}
                    className="w-full h-80 object-cover object-top transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-neutral-950/80 via-transparent to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-6 text-left">
                    <div className="h-px w-8 bg-amber-500 mb-3" />
                    <div className="text-xs text-amber-500 tracking-widest uppercase">{barber.years}</div>
                  </div>
                </div>
                <h3 className="text-xl font-bold text-white mb-1">{barber.name}</h3>
                <p className="text-neutral-400 text-sm tracking-wide">{barber.title}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* REVIEWS */}
      <section id="reviews" className="py-32 bg-neutral-950 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none select-none overflow-hidden">
          <div className="text-[20rem] font-black text-white opacity-[0.03] leading-none -mt-20 -ml-10">"</div>
        </div>
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div
            ref={reviewsRef.ref}
            className={`text-center mb-16 transition-all duration-1000 ${
              reviewsRef.inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
            }`}
          >
            <div className="flex items-center justify-center gap-4 mb-6">
              <div className="h-px w-12 bg-amber-500" />
              <span className="text-amber-500 text-xs tracking-[0.4em] uppercase">Client Reviews</span>
              <div className="h-px w-12 bg-amber-500" />
            </div>
            <h2 className="text-5xl md:text-6xl font-black mb-4">What They Say</h2>
            <div className="flex items-center justify-center gap-1 mt-4">
              {Array(5)
                .fill(null)
                .map((_, i) => (
                  <Star key={i} className="w-6 h-6 fill-amber-500 text-amber-500" />
                ))}
              <span className="text-neutral-400 text-sm ml-3">5.0 Average — 200+ Reviews</span>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {REVIEWS.map((review, i) => (
              <div
                key={review.name}
                className={`bg-neutral-900 border border-neutral-800 p-8 transition-all duration-700 hover:border-amber-500/40 ${
                  reviewsRef.inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
                }`}
                style={{ transitionDelay: `${i * 150}ms` }}
              >
                <div className="flex gap-1 mb-6">
                  {Array(review.rating)
                    .fill(null)
                    .map((_, j) => (
                      <Star key={j} className="w-4 h-4 fill-amber-500 text-amber-500" />
                    ))}
                </div>
                <p className="text-neutral-300 leading-relaxed mb-8 text-sm">"{review.text}"</p>
                <div className="flex items-center gap-4 pt-6 border-t border-neutral-800">
                  <div className="w-10 h-10 bg-amber-500 flex items-center justify-center font-black text-neutral-950 text-sm flex-shrink-0">
                    {review.avatar}
                  </div>
                  <div>
                    <div className="font-bold text-white text-sm">{review.name}</div>
                    <div className="text-neutral-500 text-xs">{review.date}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA BANNER */}
      <div className="bg-neutral-900 border-y border-neutral-800 py-20">
        <div className="max-w-4xl mx-auto text-center px-6">
          <h2 className="text-4xl md:text-5xl font-black mb-6">
            Ready for a <span className="text-amber-500">Fresh Cut?</span>
          </h2>
          <p className="text-neutral-400 mb-10 text-lg">
            Walk in or book an appointment. We are open six days a week, ready to give you the look you deserve.
          </p>
          <button
            onClick={() => scrollTo('contact')}
            className="group bg-amber-500 hover:bg-amber-400 text-neutral-950 font-black text-sm tracking-[0.2em] uppercase px-12 py-5 transition-all duration-200 hover:shadow-2xl hover:shadow-amber-500/30 inline-flex items-center gap-3"
          >
            Book Your Appointment
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>

      {/* CONTACT */}
      <section id="contact" className="py-32 bg-neutral-950">
        <div className="max-w-7xl mx-auto px-6">
          <div
            ref={contactRef.ref}
            className={`transition-all duration-1000 ${
              contactRef.inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
            }`}
          >
            <div className="text-center mb-16">
              <div className="flex items-center justify-center gap-4 mb-6">
                <div className="h-px w-12 bg-amber-500" />
                <span className="text-amber-500 text-xs tracking-[0.4em] uppercase">Book an Appointment</span>
                <div className="h-px w-12 bg-amber-500" />
              </div>
              <h2 className="text-5xl md:text-6xl font-black">Get in Touch</h2>
            </div>

            <div className="grid lg:grid-cols-2 gap-16">
              <div>
                <h3 className="text-2xl font-bold mb-8">Visit Us</h3>
                <div className="space-y-8">
                  <div className="flex items-start gap-5">
                    <div className="w-12 h-12 border border-amber-500 flex items-center justify-center flex-shrink-0">
                      <MapPin className="w-5 h-5 text-amber-500" />
                    </div>
                    <div>
                      <div className="font-bold text-white mb-1">Address</div>
                      <div className="text-neutral-400">247 West 47th Street, Suite 3A</div>
                      <div className="text-neutral-400">Midtown Manhattan, New York, NY 10036</div>
                    </div>
                  </div>

                  <div className="flex items-start gap-5">
                    <div className="w-12 h-12 border border-amber-500 flex items-center justify-center flex-shrink-0">
                      <Phone className="w-5 h-5 text-amber-500" />
                    </div>
                    <div>
                      <div className="font-bold text-white mb-1">Phone</div>
                      <a
                        href="tel:+12125550178"
                        className="text-neutral-400 hover:text-amber-500 transition-colors"
                      >
                        (212) 555-0178
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start gap-5">
                    <div className="w-12 h-12 border border-amber-500 flex items-center justify-center flex-shrink-0">
                      <Clock className="w-5 h-5 text-amber-500" />
                    </div>
                    <div>
                      <div className="font-bold text-white mb-3">Hours</div>
                      <div className="space-y-2 text-sm">
                        {[
                          ['Monday – Friday', '9:00 AM – 8:00 PM'],
                          ['Saturday', '8:00 AM – 7:00 PM'],
                          ['Sunday', '10:00 AM – 4:00 PM'],
                        ].map(([day, hours]) => (
                          <div key={day} className="flex justify-between gap-8">
                            <span className="text-neutral-400">{day}</span>
                            <span className="text-white font-medium">{hours}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-12 pt-8 border-t border-neutral-800">
                  <div className="font-bold text-white mb-4">Follow Us</div>
                  <div className="flex gap-4">
                    {[
                      { icon: Instagram, label: 'Instagram' },
                      { icon: Facebook, label: 'Facebook' },
                      { icon: Twitter, label: 'Twitter' },
                    ].map(({ icon: Icon, label }) => (
                      <a
                        key={label}
                        href="#"
                        className="w-10 h-10 border border-neutral-700 hover:border-amber-500 flex items-center justify-center text-neutral-400 hover:text-amber-500 transition-all duration-200"
                        aria-label={label}
                      >
                        <Icon className="w-4 h-4" />
                      </a>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                {submitted ? (
                  <div className="h-full flex flex-col items-center justify-center text-center py-16 border border-amber-500/30 bg-amber-500/5">
                    <CheckCircle className="w-16 h-16 text-amber-500 mb-6" />
                    <h3 className="text-2xl font-bold mb-3">Appointment Requested!</h3>
                    <p className="text-neutral-400 max-w-sm">
                      Thank you for reaching out. We will call you within 24 hours to confirm your appointment
                      time.
                    </p>
                    <button
                      onClick={() => setSubmitted(false)}
                      className="mt-8 text-amber-500 text-sm tracking-widest uppercase font-bold hover:underline"
                    >
                      Submit Another
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="grid grid-cols-2 gap-5">
                      <div>
                        <label className="text-xs text-neutral-400 tracking-[0.2em] uppercase block mb-2">
                          Full Name
                        </label>
                        <input
                          type="text"
                          required
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          className="w-full bg-neutral-900 border border-neutral-700 focus:border-amber-500 text-white px-4 py-3 outline-none transition-colors text-sm"
                          placeholder="John Smith"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-neutral-400 tracking-[0.2em] uppercase block mb-2">
                          Phone
                        </label>
                        <input
                          type="tel"
                          required
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          className="w-full bg-neutral-900 border border-neutral-700 focus:border-amber-500 text-white px-4 py-3 outline-none transition-colors text-sm"
                          placeholder="(212) 555-0000"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-xs text-neutral-400 tracking-[0.2em] uppercase block mb-2">
                        Email Address
                      </label>
                      <input
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full bg-neutral-900 border border-neutral-700 focus:border-amber-500 text-white px-4 py-3 outline-none transition-colors text-sm"
                        placeholder="john@example.com"
                      />
                    </div>

                    <div>
                      <label className="text-xs text-neutral-400 tracking-[0.2em] uppercase block mb-2">
                        Service
                      </label>
                      <select
                        value={formData.service}
                        onChange={(e) => setFormData({ ...formData, service: e.target.value })}
                        className="w-full bg-neutral-900 border border-neutral-700 focus:border-amber-500 text-white px-4 py-3 outline-none transition-colors text-sm appearance-none"
                      >
                        <option value="">Select a service...</option>
                        {SERVICES.map((s) => (
                          <option key={s.title} value={s.title}>
                            {s.title} — {s.price}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="text-xs text-neutral-400 tracking-[0.2em] uppercase block mb-2">
                        Message (Optional)
                      </label>
                      <textarea
                        rows={4}
                        value={formData.message}
                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                        className="w-full bg-neutral-900 border border-neutral-700 focus:border-amber-500 text-white px-4 py-3 outline-none transition-colors text-sm resize-none"
                        placeholder="Let us know your preferred day, time, or any special requests..."
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full bg-amber-500 hover:bg-amber-400 text-neutral-950 font-black text-sm tracking-[0.2em] uppercase py-5 transition-all duration-200 hover:shadow-xl hover:shadow-amber-500/20 flex items-center justify-center gap-3 group"
                    >
                      Request Appointment
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-neutral-900 border-t border-neutral-800 py-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            <div className="md:col-span-2">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 border-2 border-amber-500 flex items-center justify-center rotate-45">
                  <Scissors className="w-4 h-4 text-amber-500 -rotate-45" />
                </div>
                <div>
                  <div className="text-white font-bold text-lg tracking-[0.2em] uppercase leading-none">
                    Noble & Blade
                  </div>
                  <div className="text-amber-500 text-[10px] tracking-[0.4em] uppercase">New York</div>
                </div>
              </div>
              <p className="text-neutral-500 text-sm leading-relaxed max-w-xs">
                Manhattan's premier barbershop. Master barbers, premium products, and an unmatched experience
                since 2015.
              </p>
            </div>

            <div>
              <div className="text-white font-bold text-xs tracking-[0.3em] uppercase mb-5">Navigation</div>
              <ul className="space-y-3">
                {NAV_LINKS.map((link) => (
                  <li key={link}>
                    <button
                      onClick={() => scrollTo(link)}
                      className="text-neutral-500 hover:text-amber-500 text-sm transition-colors"
                    >
                      {link}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <div className="text-white font-bold text-xs tracking-[0.3em] uppercase mb-5">Contact</div>
              <div className="space-y-3 text-sm text-neutral-500">
                <div>247 West 47th Street, Suite 3A</div>
                <div>New York, NY 10036</div>
                <a href="tel:+12125550178" className="block hover:text-amber-500 transition-colors">
                  (212) 555-0178
                </a>
                <a href="mailto:info@nobleandblade.com" className="block hover:text-amber-500 transition-colors">
                  info@nobleandblade.com
                </a>
              </div>
            </div>
          </div>

          <div className="pt-8 border-t border-neutral-800 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-neutral-600 text-xs tracking-wide">
              © 2025 Noble & Blade Barbershop. All rights reserved.
            </p>
            <p className="text-neutral-600 text-xs">Midtown Manhattan — New York, NY</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
