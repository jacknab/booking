import { useState, useEffect } from 'react';
import {
  Scissors,
  MapPin,
  Phone,
  Clock,
  Star,
  ChevronDown,
  Instagram,
  Facebook,
  Menu,
  X,
  ArrowRight,
  Award,
  Calendar,
  CheckCircle,
  Settings,
} from 'lucide-react';
import { supabase, BusinessHours } from './lib/supabase';
import { getBusinessStatus, getDayName, formatTime } from './lib/businessHours';
import AdminPanel from './components/AdminPanel';

const NAV_LINKS = [
  { label: 'Home', href: '#home' },
  { label: 'Services', href: '#services' },
  { label: 'About', href: '#about' },
  { label: 'Gallery', href: '#gallery' },
  { label: 'Location', href: '#location' },
  { label: 'Reviews', href: '#reviews' },
];

const SERVICES = [
  {
    name: "Crown Cut",
    price: "$37",
    desc: "Our signature haircut. Clippers on sides, scissor-cut top, finished with hot lather neck shave.",
    duration: "20 min",
  },
  {
    name: "Combo Cut + Beard",
    price: "$55",
    desc: "Full grooming experience — precise cut plus a clean beard shape and trim. Hot lather neck shave included.",
    duration: "40 min",
  },
  {
    name: "The Gentleman",
    price: "$63",
    desc: "Classic haircut paired with a traditional straight-razor face shave. Sharp. Clean. Legendary.",
    duration: "60 min",
  },
  {
    name: "Zero Fade",
    price: "$39",
    desc: "Crisp zero fade, one step before bald. Scissors or clippers on top, hot lather neck shave finish.",
    duration: "20 min",
  },
];

const BARBERS = [
  {
    name: "Marco 'The Crown' Reyes",
    title: "Owner & Master Barber",
    years: "18+ years",
    img: "https://images.pexels.com/photos/3065209/pexels-photo-3065209.jpeg?auto=compress&cs=tinysrgb&w=600",
  },
  {
    name: "Diego Vasquez",
    title: "Senior Barber",
    years: "9 years",
    img: "https://images.pexels.com/photos/1813346/pexels-photo-1813346.jpeg?auto=compress&cs=tinysrgb&w=600",
  },
  {
    name: "Tyrell Jackson",
    title: "Barber",
    years: "6 years",
    img: "https://images.pexels.com/photos/2269872/pexels-photo-2269872.jpeg?auto=compress&cs=tinysrgb&w=600",
  },
  {
    name: "Luis Moreno",
    title: "Barber",
    years: "4 years",
    img: "https://images.pexels.com/photos/1682462/pexels-photo-1682462.jpeg?auto=compress&cs=tinysrgb&w=600",
  },
];

const REVIEWS = [
  {
    name: "James T.",
    rating: 5,
    text: "Best fade I've ever gotten in Austin. Marco knows exactly what he's doing — walked out looking like a new man. Won't go anywhere else.",
    platform: "Google",
  },
  {
    name: "Carlos M.",
    rating: 5,
    text: "Showed up as a walk-in, was in the chair in under 10 minutes. Diego gave me the cleanest taper I've had in years. Highly recommend.",
    platform: "Yelp",
  },
  {
    name: "Brian K.",
    rating: 5,
    text: "Got the Gentleman package — haircut plus straight-razor shave. Absolutely worth it. The hot towel experience alone is something else. Real deal barbershop.",
    platform: "Google",
  },
  {
    name: "Andre W.",
    rating: 5,
    text: "Blade & Crown is the only place I trust with my hair. Consistent, sharp, and the atmosphere is great. All the guys there are pros.",
    platform: "Yelp",
  },
];

const GALLERY_IMAGES = [
  "https://images.pexels.com/photos/1570807/pexels-photo-1570807.jpeg?auto=compress&cs=tinysrgb&w=800",
  "https://images.pexels.com/photos/3992875/pexels-photo-3992875.jpeg?auto=compress&cs=tinysrgb&w=800",
  "https://images.pexels.com/photos/668196/pexels-photo-668196.jpeg?auto=compress&cs=tinysrgb&w=800",
  "https://images.pexels.com/photos/1805600/pexels-photo-1805600.jpeg?auto=compress&cs=tinysrgb&w=800",
  "https://images.pexels.com/photos/3808064/pexels-photo-3808064.jpeg?auto=compress&cs=tinysrgb&w=800",
  "https://images.pexels.com/photos/1805614/pexels-photo-1805614.jpeg?auto=compress&cs=tinysrgb&w=800",
];

function StarRating({ count }: { count: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: count }).map((_, i) => (
        <Star key={i} size={14} className="fill-amber-400 text-amber-400" />
      ))}
    </div>
  );
}

export default function App() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [announcementVisible, setAnnouncementVisible] = useState(true);
  const [businessHours, setBusinessHours] = useState<BusinessHours[]>([]);
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [isOpen, setIsOpen] = useState(false);
  const [hoursLoading, setHoursLoading] = useState(true);
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [hasAdminKey, setHasAdminKey] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const adminKey = localStorage.getItem('admin_mode');
    setHasAdminKey(adminKey === 'true');
  }, []);

  useEffect(() => {
    fetchBusinessHours();
    const interval = setInterval(fetchBusinessHours, 60000);
    return () => clearInterval(interval);
  }, []);

  const fetchBusinessHours = async () => {
    setHoursLoading(true);
    try {
      const { data, error } = await supabase
        .from('business_hours')
        .select('*')
        .order('day_of_week', { ascending: true });

      if (error) throw error;

      setBusinessHours(data || []);
      if (data) {
        const status = getBusinessStatus(data);
        setStatusMessage(status.message);
        setIsOpen(status.isOpen);
      }
    } catch (error) {
      console.error('Error fetching business hours:', error);
    }
    setHoursLoading(false);
  };

  const handleEnableAdmin = () => {
    const password = prompt('Enter admin password:');
    if (password === 'admin123') {
      localStorage.setItem('admin_mode', 'true');
      setHasAdminKey(true);
      alert('Admin mode enabled!');
    } else {
      alert('Incorrect password');
    }
  };

  return (
    <div className="font-sans text-stone-800 bg-white">

      {/* Announcement Bar */}
      {announcementVisible && (
        <div className="bg-amber-500 text-stone-900 text-sm font-medium py-2 px-4 flex items-center justify-center gap-3 relative">
          <span>First Visit? Get $10 Off → <a href="#" onClick={e => e.preventDefault()} className="underline font-semibold">Learn More</a></span>
          <button
            onClick={() => setAnnouncementVisible(false)}
            className="absolute right-4 top-1/2 -translate-y-1/2 opacity-70 hover:opacity-100 transition"
            aria-label="Dismiss"
          >
            <X size={15} />
          </button>
        </div>
      )}

      {/* Status Bar */}
      <div className="bg-stone-900 text-stone-300 text-xs py-2 px-6 flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-4 flex-wrap">
          <span className="flex items-center gap-1.5">
            <span className={`w-2 h-2 rounded-full ${isOpen ? 'bg-emerald-400 animate-pulse' : 'bg-red-400'} inline-block`} />
            <span className={isOpen ? 'text-emerald-400' : 'text-red-400'} >
              {hoursLoading ? 'Loading...' : statusMessage}
            </span>
          </span>
          <a href="#" onClick={e => e.preventDefault()} className="flex items-center gap-1 hover:text-white transition hidden sm:flex">
            <MapPin size={12} /> 512 S Congress Ave, Austin, TX 78704
          </a>
        </div>
        <div className="hidden sm:flex items-center gap-4">
          <a href="#" onClick={e => e.preventDefault()} className="hover:text-white transition">Directions</a>
          {hasAdminKey && (
            <button
              onClick={() => setShowAdminPanel(true)}
              className="hover:text-amber-400 transition flex items-center gap-1"
            >
              <Settings size={12} /> Admin
            </button>
          )}
          <a href="#" onClick={e => e.preventDefault()} className="flex items-center gap-1 hover:text-white transition">
            <Phone size={12} /> Call Now
          </a>
        </div>
      </div>

      {/* Admin Panel Modal */}
      {showAdminPanel && <AdminPanel onClose={() => setShowAdminPanel(false)} />}

      {/* Navbar */}
      <header className={`sticky top-0 z-50 transition-all duration-300 ${scrolled ? 'bg-white shadow-md' : 'bg-white'}`}>
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <a href="#home" className="flex items-center gap-2 group">
            <div className="w-10 h-10 bg-stone-900 rounded-full flex items-center justify-center group-hover:bg-amber-500 transition-colors">
              <Scissors size={18} className="text-white" />
            </div>
            <div className="leading-tight">
              <div className="font-black text-lg tracking-widest uppercase text-stone-900 font-serif">Blade & Crown</div>
              <div className="text-[10px] tracking-[0.25em] uppercase text-stone-500">Barbershop</div>
            </div>
          </a>

          <nav className="hidden lg:flex items-center gap-7 text-sm font-medium text-stone-600">
            {NAV_LINKS.map(link => (
              <a
                key={link.label}
                href={link.href}
                className="hover:text-stone-900 transition-colors relative after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-amber-500 hover:after:w-full after:transition-all"
              >
                {link.label}
              </a>
            ))}
          </nav>

          <div className="hidden lg:flex items-center gap-3">
            <a href="#" onClick={e => e.preventDefault()} className="text-sm font-medium text-stone-600 hover:text-stone-900 transition flex items-center gap-1">
              <Phone size={14} /> (512) 847-2930
            </a>
            {hasAdminKey && (
              <button
                onClick={() => setShowAdminPanel(true)}
                className="text-stone-600 hover:text-amber-600 transition"
                title="Edit business hours"
              >
                <Settings size={16} />
              </button>
            )}
            <button
              onClick={e => e.preventDefault()}
              className="bg-stone-900 text-white text-sm font-semibold px-5 py-2.5 rounded-full hover:bg-amber-500 hover:text-stone-900 transition-all duration-200"
            >
              Book Now
            </button>
          </div>

          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="lg:hidden p-2 text-stone-700"
            aria-label="Menu"
          >
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {menuOpen && (
          <div className="lg:hidden bg-white border-t border-stone-100 px-6 py-4 flex flex-col gap-4">
            {NAV_LINKS.map(link => (
              <a
                key={link.label}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className="text-sm font-medium text-stone-700 py-1 hover:text-stone-900"
              >
                {link.label}
              </a>
            ))}
            {hasAdminKey && (
              <button
                onClick={() => {
                  setShowAdminPanel(true);
                  setMenuOpen(false);
                }}
                className="text-sm font-medium text-amber-600 py-1 hover:text-amber-700 flex items-center gap-2"
              >
                <Settings size={14} /> Edit Business Hours
              </button>
            )}
            <button
              onClick={e => e.preventDefault()}
              className="mt-2 bg-stone-900 text-white text-sm font-semibold px-5 py-3 rounded-full hover:bg-amber-500 hover:text-stone-900 transition-all text-center"
            >
              Book Now
            </button>
          </div>
        )}
      </header>

      {/* Hero */}
      <section id="home" className="relative min-h-[92vh] flex items-center overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="https://images.pexels.com/photos/1813272/pexels-photo-1813272.jpeg?auto=compress&cs=tinysrgb&w=1600"
            alt="Blade & Crown Barbershop interior"
            className="w-full h-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-stone-950/85 via-stone-950/60 to-transparent" />
        </div>

        <div className="relative max-w-7xl mx-auto px-6 py-24">
          <div className="max-w-xl">
            <div className="inline-flex items-center gap-2 bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-semibold tracking-widest uppercase px-4 py-2 rounded-full mb-6">
              <span className={`w-1.5 h-1.5 rounded-full ${isOpen ? 'bg-emerald-400 animate-pulse' : 'bg-red-400'}`} />
              {hoursLoading ? 'Loading...' : statusMessage}
            </div>
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-black text-white leading-[1.05] mb-5 font-serif">
              Austin's Best<br />Barbershop
            </h1>
            <p className="text-stone-300 text-lg mb-4 leading-relaxed">
              1000+ 5-star reviews. Expert fades, classic cuts, and hot towel shaves on South Congress since 2011.
            </p>
            <div className="flex flex-wrap gap-3 mb-8 text-sm">
              {['Walk-ins Welcome', 'Free Parking', '$10 Off First Visit'].map(tag => (
                <span key={tag} className="flex items-center gap-1.5 text-stone-300">
                  <CheckCircle size={14} className="text-amber-400" /> {tag}
                </span>
              ))}
            </div>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={e => e.preventDefault()}
                className="bg-amber-500 text-stone-900 font-bold px-7 py-3.5 rounded-full hover:bg-amber-400 transition-all duration-200 flex items-center gap-2 text-sm"
              >
                Book Your Haircut <ArrowRight size={16} />
              </button>
              <a
                href="#"
                onClick={e => e.preventDefault()}
                className="border border-white/30 text-white font-semibold px-7 py-3.5 rounded-full hover:bg-white/10 transition-all duration-200 text-sm flex items-center gap-2"
              >
                <Phone size={15} /> Call Now (512) 847-2930
              </a>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white/50 animate-bounce">
          <ChevronDown size={22} />
        </div>
      </section>

      {/* Stats Bar */}
      <section className="bg-stone-900 text-white py-10">
        <div className="max-w-5xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {[
            { value: '1000+', label: '5-Star Reviews' },
            { value: '15+', label: 'Years Experience' },
            { value: '4', label: 'Expert Barbers' },
            { value: '2011', label: 'Est. Austin' },
          ].map(stat => (
            <div key={stat.label} className="flex flex-col items-center gap-1">
              <div className="text-3xl font-black text-amber-400">{stat.value}</div>
              <div className="text-stone-400 text-sm tracking-wide">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Why Choose Us */}
      <section id="about" className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-14">
            <p className="text-amber-500 text-sm font-semibold tracking-widest uppercase mb-2">Why Choose Us</p>
            <h2 className="text-4xl font-black text-stone-900 font-serif">Why Choose Blade & Crown</h2>
            <p className="text-stone-500 mt-3 max-w-xl mx-auto">More than a haircut. An experience built on skill, attention, and respect for the craft.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: <Award size={28} className="text-amber-500" />,
                title: "Austin's Top Barbers",
                desc: "15+ years cutting hair in Austin. We know the styles locals want, from clean fades to classic cuts.",
              },
              {
                icon: <Star size={28} className="text-amber-500" />,
                title: "1000+ 5-Star Reviews",
                desc: "Austin's highest-rated barbershop. Real results, real reviews from real clients.",
              },
              {
                icon: <Calendar size={28} className="text-amber-500" />,
                title: "In & Out, Looking Sharp",
                desc: "Book your exact time online. No waiting, no hassle. Just a fresh cut that fits your busy schedule.",
              },
            ].map(item => (
              <div key={item.title} className="bg-stone-50 rounded-2xl p-8 border border-stone-100 hover:border-amber-200 hover:shadow-lg transition-all duration-300 group">
                <div className="mb-4 group-hover:scale-110 transition-transform duration-300">{item.icon}</div>
                <h3 className="text-xl font-bold text-stone-900 mb-2">{item.title}</h3>
                <p className="text-stone-500 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Services */}
      <section id="services" className="py-20 bg-stone-50">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-14">
            <p className="text-amber-500 text-sm font-semibold tracking-widest uppercase mb-2">Menu</p>
            <h2 className="text-4xl font-black text-stone-900 font-serif">Popular Services</h2>
            <p className="text-stone-500 mt-3">Our most requested cuts and grooming services.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
            {SERVICES.map(svc => (
              <div
                key={svc.name}
                className="bg-white rounded-2xl p-7 border border-stone-100 hover:border-amber-300 hover:shadow-xl transition-all duration-300 flex flex-col"
              >
                <div className="flex items-start justify-between mb-4">
                  <h3 className="text-lg font-bold text-stone-900">{svc.name}</h3>
                  <span className="text-amber-500 font-black text-xl">{svc.price}</span>
                </div>
                <p className="text-stone-500 text-sm leading-relaxed flex-1 mb-4">{svc.desc}</p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-stone-400 flex items-center gap-1">
                    <Clock size={12} /> {svc.duration}
                  </span>
                  <button
                    onClick={e => e.preventDefault()}
                    className="bg-stone-900 text-white text-xs font-semibold px-4 py-2 rounded-full hover:bg-amber-500 hover:text-stone-900 transition-all duration-200"
                  >
                    Book Now
                  </button>
                </div>
              </div>
            ))}
          </div>
          <div className="text-center">
            <a
              href="#"
              onClick={e => e.preventDefault()}
              className="inline-flex items-center gap-2 border-2 border-stone-900 text-stone-900 font-semibold px-7 py-3 rounded-full hover:bg-stone-900 hover:text-white transition-all duration-200 text-sm"
            >
              View All Prices & Services <ArrowRight size={15} />
            </a>
          </div>
        </div>
      </section>

      {/* Gallery */}
      <section id="gallery" className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-12">
            <p className="text-amber-500 text-sm font-semibold tracking-widest uppercase mb-2">Our Work</p>
            <h2 className="text-4xl font-black text-stone-900 font-serif">See the Craft</h2>
            <p className="text-stone-500 mt-3">The transformations we deliver every single day.</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {GALLERY_IMAGES.map((src, i) => (
              <div key={i} className="overflow-hidden rounded-xl aspect-square group cursor-pointer">
                <img
                  src={src}
                  alt={`Haircut example ${i + 1}`}
                  className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
                />
              </div>
            ))}
          </div>
          <div className="text-center mt-8">
            <a
              href="#"
              onClick={e => e.preventDefault()}
              className="inline-flex items-center gap-2 text-stone-700 font-semibold hover:text-amber-500 transition text-sm"
            >
              See More Haircuts <ArrowRight size={15} />
            </a>
          </div>
        </div>
      </section>

      {/* Barbers */}
      <section className="py-20 bg-stone-900 text-white">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-14">
            <p className="text-amber-400 text-sm font-semibold tracking-widest uppercase mb-2">The Team</p>
            <h2 className="text-4xl font-black font-serif">Meet Your Austin Barbers</h2>
            <p className="text-stone-400 mt-3">Expert barbers who know Austin style. Find your perfect match.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {BARBERS.map(barber => (
              <div key={barber.name} className="group">
                <div className="relative overflow-hidden rounded-2xl mb-4 aspect-[3/4]">
                  <img
                    src={barber.img}
                    alt={barber.name}
                    className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-stone-950/70 to-transparent" />
                  <div className="absolute bottom-4 left-4">
                    <span className="bg-amber-500 text-stone-900 text-xs font-bold px-3 py-1 rounded-full">{barber.years}</span>
                  </div>
                </div>
                <h3 className="font-bold text-lg">{barber.name}</h3>
                <p className="text-stone-400 text-sm mb-3">{barber.title}</p>
                <button
                  onClick={e => e.preventDefault()}
                  className="w-full border border-white/20 text-white text-xs font-semibold py-2.5 rounded-full hover:bg-amber-500 hover:text-stone-900 hover:border-amber-500 transition-all duration-200"
                >
                  Book with {barber.name.split(' ')[0]}
                </button>
              </div>
            ))}
          </div>
          <div className="text-center mt-10">
            <a
              href="#"
              onClick={e => e.preventDefault()}
              className="inline-flex items-center gap-2 text-stone-400 hover:text-amber-400 text-sm font-medium transition"
            >
              Meet the Full Team <ArrowRight size={15} />
            </a>
          </div>
        </div>
      </section>

      {/* Hot Towel Shave Feature */}
      <section className="relative overflow-hidden">
        <div className="grid lg:grid-cols-2 min-h-[520px]">
          <div className="relative">
            <img
              src="https://images.pexels.com/photos/3998429/pexels-photo-3998429.jpeg?auto=compress&cs=tinysrgb&w=1000"
              alt="Hot towel shave service"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-stone-950/20" />
          </div>
          <div className="bg-stone-950 flex items-center px-10 lg:px-16 py-16">
            <div>
              <span className="bg-amber-500/20 border border-amber-500/30 text-amber-400 text-xs font-semibold tracking-widest uppercase px-4 py-1.5 rounded-full mb-6 inline-block">Premium Experience</span>
              <h2 className="text-4xl font-black text-white font-serif mb-5 leading-tight">
                Hot Towel Shaves &<br />Classic Grooming
              </h2>
              <p className="text-stone-400 leading-relaxed mb-8">
                Experience the traditional barbershop ritual. Hot towels, straight razor precision, and the kind of care that makes you feel like a new man. Austin's best grooming starts here.
              </p>
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={e => e.preventDefault()}
                  className="bg-amber-500 text-stone-900 font-bold px-7 py-3.5 rounded-full hover:bg-amber-400 transition-all duration-200 text-sm"
                >
                  Book a Shave
                </button>
                <button
                  onClick={e => e.preventDefault()}
                  className="border border-white/20 text-white font-semibold px-7 py-3.5 rounded-full hover:bg-white/10 transition text-sm"
                >
                  Explore Full Menu
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Reviews */}
      <section id="reviews" className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-14">
            <p className="text-amber-500 text-sm font-semibold tracking-widest uppercase mb-2">Testimonials</p>
            <h2 className="text-4xl font-black text-stone-900 font-serif">What Austin Says About Us</h2>
            <p className="text-stone-500 mt-3">Don't take our word for it. Hear from the guys who sit in our chairs.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {REVIEWS.map(review => (
              <div key={review.name} className="bg-stone-50 rounded-2xl p-6 border border-stone-100 hover:border-amber-200 hover:shadow-lg transition-all duration-300">
                <StarRating count={review.rating} />
                <p className="text-stone-600 text-sm leading-relaxed mt-3 mb-4">"{review.text}"</p>
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-stone-800 text-sm">{review.name}</span>
                  <span className="text-xs text-stone-400 bg-stone-200 px-2 py-0.5 rounded-full">{review.platform}</span>
                </div>
              </div>
            ))}
          </div>
          <div className="text-center mt-8">
            <a
              href="#"
              onClick={e => e.preventDefault()}
              className="inline-flex items-center gap-2 border-2 border-stone-900 text-stone-900 font-semibold px-7 py-3 rounded-full hover:bg-stone-900 hover:text-white transition-all duration-200 text-sm"
            >
              See 1000+ Client Reviews <ArrowRight size={15} />
            </a>
          </div>
        </div>
      </section>

      {/* Location */}
      <section id="location" className="py-20 bg-stone-50">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-14">
            <p className="text-amber-500 text-sm font-semibold tracking-widest uppercase mb-2">Find Us</p>
            <h2 className="text-4xl font-black text-stone-900 font-serif">Find Us on South Congress</h2>
            <p className="text-stone-500 mt-3 max-w-xl mx-auto">
              Located in the heart of Austin's vibrant South Congress corridor, just minutes from Zilker Park and Barton Springs. Easy parking and always a warm welcome.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-10 items-start">
            {/* Map placeholder */}
            <div className="relative rounded-2xl overflow-hidden shadow-xl bg-stone-200 h-80 lg:h-full min-h-[320px]">
              <img
                src="https://images.pexels.com/photos/1586298/pexels-photo-1586298.jpeg?auto=compress&cs=tinysrgb&w=1000"
                alt="South Congress Ave Austin"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-stone-950/40 flex flex-col items-center justify-center">
                <div className="bg-white rounded-2xl p-5 text-center shadow-2xl">
                  <MapPin size={24} className="text-amber-500 mx-auto mb-2" />
                  <div className="font-bold text-stone-900 text-sm">Blade & Crown Barbershop</div>
                  <div className="text-stone-500 text-xs mt-1">512 S Congress Ave, Austin, TX 78704</div>
                  <a
                    href="#"
                    onClick={e => e.preventDefault()}
                    className="mt-3 inline-block bg-stone-900 text-white text-xs font-semibold px-4 py-2 rounded-full hover:bg-amber-500 hover:text-stone-900 transition"
                  >
                    Open in Google Maps
                  </a>
                </div>
              </div>
            </div>

            {/* Info */}
            <div className="space-y-6">
              <div className="bg-white rounded-2xl p-7 border border-stone-100 shadow-sm">
                <h3 className="font-bold text-stone-900 mb-4 flex items-center gap-2">
                  <Clock size={18} className="text-amber-500" /> Hours
                </h3>
                <div className="space-y-2 text-sm">
                  {hoursLoading ? (
                    <p className="text-stone-400">Loading hours...</p>
                  ) : businessHours.length > 0 ? (
                    businessHours.map(hour => (
                      <div key={hour.day_of_week} className="flex justify-between py-1.5 border-b border-stone-50 last:border-0">
                        <span className="text-stone-600">{getDayName(hour.day_of_week)}</span>
                        <span className={`font-semibold ${hour.is_closed ? 'text-red-400' : 'text-stone-900'}`}>
                          {hour.is_closed ? 'Closed' : `${formatTime(hour.opens_at)} – ${formatTime(hour.closes_at)}`}
                        </span>
                      </div>
                    ))
                  ) : (
                    <p className="text-stone-400">No hours set</p>
                  )}
                </div>
              </div>

              <div className="bg-white rounded-2xl p-7 border border-stone-100 shadow-sm">
                <h3 className="font-bold text-stone-900 mb-4 flex items-center gap-2">
                  <MapPin size={18} className="text-amber-500" /> Contact & Location
                </h3>
                <div className="space-y-3 text-sm">
                  <a href="#" onClick={e => e.preventDefault()} className="flex items-start gap-3 text-stone-600 hover:text-stone-900 transition group">
                    <MapPin size={15} className="mt-0.5 text-amber-500 shrink-0" />
                    <span>512 S Congress Ave, Austin, TX 78704<br /><span className="text-stone-400 text-xs">Near Zilker Park</span></span>
                  </a>
                  <a href="#" onClick={e => e.preventDefault()} className="flex items-center gap-3 text-stone-600 hover:text-stone-900 transition">
                    <Phone size={15} className="text-amber-500 shrink-0" /> (512) 847-2930
                  </a>
                </div>
              </div>

              <a
                href="#"
                onClick={e => e.preventDefault()}
                className="flex items-center justify-center gap-2 w-full bg-stone-900 text-white font-semibold py-3.5 rounded-full hover:bg-amber-500 hover:text-stone-900 transition-all duration-200 text-sm"
              >
                Directions & Parking Info <ArrowRight size={15} />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="bg-amber-500 py-16">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-4xl font-black text-stone-900 font-serif mb-3">Ready for Your Best Cut Yet?</h2>
          <p className="text-stone-800 mb-8 text-lg">First-time clients get $10 off any service. Book online or walk in. We'll take care of you.</p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <button
              onClick={e => e.preventDefault()}
              className="bg-stone-900 text-white font-bold px-8 py-4 rounded-full hover:bg-stone-700 transition-all duration-200 text-sm flex items-center gap-2"
            >
              Book Your Appointment <ArrowRight size={16} />
            </button>
            <a
              href="#"
              onClick={e => e.preventDefault()}
              className="border-2 border-stone-900 text-stone-900 font-bold px-8 py-4 rounded-full hover:bg-stone-900 hover:text-white transition-all duration-200 text-sm flex items-center gap-2"
            >
              <Phone size={15} /> Call (512) 847-2930
            </a>
          </div>
        </div>
      </section>

      {/* Bottom SEO / Stats */}
      <section className="bg-stone-900 py-16 text-white">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center mb-12">
            {[
              { value: '1000+', label: '5-Star Reviews' },
              { value: '#1', label: 'Rated on Yelp' },
              { value: '15+', label: 'Years in Austin' },
              { value: '4.9★', label: 'Google Rating' },
            ].map(stat => (
              <div key={stat.label} className="flex flex-col gap-1 items-center">
                <div className="text-3xl font-black text-amber-400">{stat.value}</div>
                <div className="text-stone-400 text-sm">{stat.label}</div>
              </div>
            ))}
          </div>
          <div className="border-t border-stone-800 pt-10 text-stone-400 text-sm leading-relaxed max-w-3xl">
            <p>
              <strong className="text-white">Blade & Crown Barbershop</strong> is widely recognized as the <strong className="text-white">best barbershop in Austin</strong>, located at <strong className="text-white">512 S Congress Ave, Austin, TX 78704</strong>, near Zilker Park in the SoCo neighborhood. With over <strong className="text-white">1000+ 5-star reviews</strong> across Yelp, Google, and Facebook, we've earned our reputation as Austin's top-rated barbershop since <strong className="text-white">2011</strong>.
            </p>
          </div>
          <div className="mt-8 flex flex-wrap gap-2 text-xs text-stone-600">
            {['Fade Haircut Austin', 'Beard Trim Austin', 'Hot Towel Shave Austin', 'Walk-in Barbershop Austin', 'Kids Haircut Austin', 'Best Fade Austin', 'SoCo Barbershop', 'South Congress Barber'].map(tag => (
              <a key={tag} href="#" onClick={e => e.preventDefault()} className="hover:text-stone-400 transition">{tag}</a>
            ))}
          </div>
          <div className="mt-6 pt-6 border-t border-stone-800 text-xs text-stone-500">
            <p>Admin Mode: <button onClick={handleEnableAdmin} className="text-amber-400 hover:text-amber-300 underline">Click to enable</button></p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-stone-950 text-stone-400 py-12">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-10 mb-10">
            {/* Brand */}
            <div className="md:col-span-1">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-9 h-9 bg-amber-500 rounded-full flex items-center justify-center">
                  <Scissors size={16} className="text-stone-900" />
                </div>
                <div>
                  <div className="font-black text-white text-sm tracking-widest uppercase font-serif">Blade & Crown</div>
                  <div className="text-[10px] tracking-widest text-stone-500">Barbershop</div>
                </div>
              </div>
              <p className="text-xs leading-relaxed mb-5 text-stone-500">Austin's premier barbershop since 2011. Expert cuts, classic shaves, and a welcoming atmosphere on South Congress Ave.</p>
              <div className="flex gap-3">
                <a href="#" onClick={e => e.preventDefault()} className="w-8 h-8 bg-stone-800 rounded-full flex items-center justify-center hover:bg-amber-500 hover:text-stone-900 transition-all duration-200 text-stone-400">
                  <Instagram size={14} />
                </a>
                <a href="#" onClick={e => e.preventDefault()} className="w-8 h-8 bg-stone-800 rounded-full flex items-center justify-center hover:bg-amber-500 hover:text-stone-900 transition-all duration-200 text-stone-400">
                  <Facebook size={14} />
                </a>
                <a href="#" onClick={e => e.preventDefault()} className="w-8 h-8 bg-stone-800 rounded-full flex items-center justify-center hover:bg-amber-500 hover:text-stone-900 transition-all duration-200 text-stone-400">
                  <Star size={14} />
                </a>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="text-white font-semibold text-sm mb-4 tracking-wide">Quick Links</h4>
              <ul className="space-y-2 text-sm">
                {NAV_LINKS.map(link => (
                  <li key={link.label}>
                    <a href={link.href} className="hover:text-white transition">{link.label}</a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h4 className="text-white font-semibold text-sm mb-4 tracking-wide">Contact</h4>
              <ul className="space-y-3 text-sm">
                <li className="flex items-start gap-2">
                  <MapPin size={13} className="text-amber-500 mt-0.5 shrink-0" />
                  <a href="#" onClick={e => e.preventDefault()} className="hover:text-white transition leading-snug">512 S Congress Ave,<br />Austin, TX 78704</a>
                </li>
                <li className="flex items-center gap-2">
                  <Phone size={13} className="text-amber-500 shrink-0" />
                  <a href="#" onClick={e => e.preventDefault()} className="hover:text-white transition">(512) 847-2930</a>
                </li>
              </ul>
            </div>

            {/* Hours in Footer */}
            <div>
              <h4 className="text-white font-semibold text-sm mb-4 tracking-wide">Hours</h4>
              <ul className="space-y-1.5 text-sm">
                {hoursLoading ? (
                  <li className="text-stone-500">Loading...</li>
                ) : businessHours.length > 0 ? (
                  businessHours.map(hour => (
                    <li key={hour.day_of_week} className="flex justify-between gap-4">
                      <span>{getDayName(hour.day_of_week)}</span>
                      <span className={hour.is_closed ? 'text-red-400' : 'text-stone-300'}>
                        {hour.is_closed ? 'Closed' : `${formatTime(hour.opens_at)} – ${formatTime(hour.closes_at)}`}
                      </span>
                    </li>
                  ))
                ) : (
                  <li className="text-stone-500">No hours set</li>
                )}
              </ul>
            </div>
          </div>

          <div className="border-t border-stone-800 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-stone-600">
            <span>© 2026 Blade & Crown Barbershop. All rights reserved.</span>
            <div className="flex gap-4">
              <a href="#" onClick={e => e.preventDefault()} className="hover:text-stone-400 transition">New Client Info</a>
              <a href="#" onClick={e => e.preventDefault()} className="hover:text-stone-400 transition">Common Questions</a>
              <a href="#" onClick={e => e.preventDefault()} className="hover:text-stone-400 transition">Contact</a>
              <a href="#" onClick={e => e.preventDefault()} className="hover:text-stone-400 transition">Careers</a>
            </div>
          </div>
        </div>
      </footer>

      {/* Mobile sticky CTA */}
      <div className="fixed bottom-0 left-0 right-0 lg:hidden bg-stone-900 border-t border-stone-800 flex z-40">
        <a href="#" onClick={e => e.preventDefault()} className="flex-1 flex items-center justify-center gap-2 text-white text-sm font-semibold py-4 border-r border-stone-700 hover:bg-stone-800 transition">
          <Phone size={15} /> Call Now
        </a>
        <button onClick={e => e.preventDefault()} className="flex-1 flex items-center justify-center gap-2 bg-amber-500 text-stone-900 text-sm font-bold py-4 hover:bg-amber-400 transition">
          <Calendar size={15} /> Book Now
        </button>
      </div>
    </div>
  );
}
