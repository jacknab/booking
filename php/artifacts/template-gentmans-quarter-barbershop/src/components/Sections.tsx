import { Theme } from '../lib/themes';
import { BUSINESS } from '../lib/types';
import { MapPin, Phone, Mail, Clock, Instagram, Facebook, Scissors, Star, ChevronRight, Award } from 'lucide-react';

interface Props {
  theme: Theme;
  onCheckInClick: () => void;
}

export function Navbar({ theme, onCheckInClick }: Props) {
  const c = theme.colors;
  return (
    <nav className="fixed top-0 left-0 right-0 z-40 transition-all duration-300" style={{ backgroundColor: c.navBg, borderBottom: `1px solid ${c.border}` }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">
          <div className="flex items-center gap-2">
            <Scissors size={24} style={{ color: c.accent }} />
            <span className="text-lg md:text-xl font-bold" style={{ color: c.text, fontFamily: theme.fonts.heading }}>{BUSINESS.name}</span>
          </div>
          <div className="hidden md:flex items-center gap-8">
            <a href="#services" className="text-sm font-medium transition-colors hover:opacity-80" style={{ color: c.textSecondary, fontFamily: theme.fonts.body }}>Services</a>
            <a href="#about" className="text-sm font-medium transition-colors hover:opacity-80" style={{ color: c.textSecondary, fontFamily: theme.fonts.body }}>About</a>
            <a href="#hours" className="text-sm font-medium transition-colors hover:opacity-80" style={{ color: c.textSecondary, fontFamily: theme.fonts.body }}>Hours</a>
            <a href="#contact" className="text-sm font-medium transition-colors hover:opacity-80" style={{ color: c.textSecondary, fontFamily: theme.fonts.body }}>Contact</a>
          </div>
          <button onClick={onCheckInClick} className="px-5 py-2.5 rounded-lg font-bold text-sm transition-all hover:scale-105 active:scale-95" style={{ backgroundColor: c.buttonPrimary, color: c.badgeText, fontFamily: theme.fonts.heading }}>Check In</button>
        </div>
      </div>
    </nav>
  );
}

export function Hero({ theme, onCheckInClick }: Props) {
  const c = theme.colors;
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0 bg-cover bg-center bg-no-repeat" style={{ backgroundImage: `url(${theme.heroImage})` }} />
      <div className="absolute inset-0" style={{ backgroundColor: c.heroOverlay }} />
      <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6" style={{ backgroundColor: c.accentLight, border: `1px solid ${c.accent}` }}>
          <Award size={14} style={{ color: c.accent }} />
          <span className="text-xs font-semibold tracking-wider uppercase" style={{ color: c.accent, fontFamily: theme.fonts.body }}>Est. {BUSINESS.established}</span>
        </div>
        <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold mb-6 leading-tight" style={{ color: c.text, fontFamily: theme.fonts.heading }}>{BUSINESS.name}</h1>
        <p className="text-xl md:text-2xl mb-10 max-w-2xl mx-auto" style={{ color: c.textSecondary, fontFamily: theme.fonts.body }}>{BUSINESS.tagline}</p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button onClick={onCheckInClick} className="px-8 py-4 rounded-lg font-bold text-lg transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-2" style={{ backgroundColor: c.buttonPrimary, color: c.badgeText, fontFamily: theme.fonts.heading }}>Join the Queue <ChevronRight size={20} /></button>
          <a href="#services" className="px-8 py-4 rounded-lg font-bold text-lg transition-all hover:scale-105 flex items-center justify-center gap-2" style={{ backgroundColor: c.buttonSecondary, color: c.text, border: `2px solid ${c.border}`, fontFamily: theme.fonts.heading }}>View Services</a>
        </div>
      </div>
    </section>
  );
}

export function Services({ theme }: { theme: Theme }) {
  const c = theme.colors;
  const serviceList = [
    { category: 'Haircut', items: [
      { name: 'Classic Haircut', desc: 'Traditional barbershop haircut with precision', price: 25, duration: 30 },
      { name: 'Fade', desc: 'Skin fade, taper fade, or any fade style', price: 30, duration: 40 },
      { name: 'Buzz Cut', desc: 'All-over clipper cut', price: 20, duration: 15 },
      { name: 'Kids Haircut', desc: 'Haircut for children 12 and under', price: 18, duration: 20 },
      { name: 'Senior Haircut', desc: 'Discounted haircut for seniors 65+', price: 18, duration: 20 },
    ]},
    { category: 'Beard', items: [
      { name: 'Beard Trim', desc: 'Shape and trim your beard', price: 15, duration: 15 },
      { name: 'Beard Line-Up', desc: 'Clean up beard edges and neckline', price: 12, duration: 10 },
    ]},
    { category: 'Shave', items: [
      { name: 'Hot Towel Shave', desc: 'Traditional straight razor shave with hot towel', price: 30, duration: 30 },
    ]},
    { category: 'Combo', items: [
      { name: 'Haircut & Beard', desc: 'Full haircut plus beard trim', price: 35, duration: 45 },
      { name: 'Haircut & Shave', desc: 'Full haircut plus hot towel shave', price: 50, duration: 60 },
    ]},
    { category: 'Specialty', items: [
      { name: 'Hair Design', desc: 'Custom designs and patterns', price: 35, duration: 45 },
    ]},
    { category: 'Treatment', items: [
      { name: 'Scalp Treatment', desc: 'Deep clean and conditioning scalp treatment', price: 20, duration: 20 },
    ]},
  ];

  return (
    <section id="services" className="py-20 px-4" style={{ backgroundColor: c.bg }}>
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <p className="text-xs font-bold tracking-widest uppercase mb-3" style={{ color: c.accent, fontFamily: theme.fonts.body }}>What We Offer</p>
          <h2 className="text-4xl md:text-5xl font-bold mb-4" style={{ color: c.text, fontFamily: theme.fonts.heading }}>Our Services</h2>
          <div className="w-16 h-1 mx-auto rounded-full" style={{ backgroundColor: c.divider }} />
        </div>
        <div className="space-y-12">
          {serviceList.map(cat => (
            <div key={cat.category}>
              <h3 className="text-xl font-bold mb-6 pb-2 border-b-2 inline-block" style={{ color: c.text, fontFamily: theme.fonts.heading, borderColor: c.accent }}>{cat.category}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {cat.items.map(item => (
                  <div key={item.name} className="group p-5 rounded-xl transition-all hover:scale-[1.02]" style={{ backgroundColor: c.card, border: `1px solid ${c.border}` }}>
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h4 className="font-bold text-base mb-1" style={{ color: c.text, fontFamily: theme.fonts.heading }}>{item.name}</h4>
                        <p className="text-sm" style={{ color: c.textSecondary, fontFamily: theme.fonts.body }}>{item.desc}</p>
                        <span className="text-xs mt-1 inline-block" style={{ color: c.textSecondary, fontFamily: theme.fonts.body }}><Clock size={12} className="inline mr-1" />{item.duration} min</span>
                      </div>
                      <div className="text-right ml-4">
                        <span className="text-2xl font-bold" style={{ color: c.priceTag, fontFamily: theme.fonts.heading }}>${item.price}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function About({ theme }: { theme: Theme }) {
  const c = theme.colors;
  const testimonials = [
    { name: 'Marcus T.', text: 'Best barbershop in town. The online check-in is a game changer - no more waiting around!', rating: 5 },
    { name: 'David R.', text: 'These guys know their craft. Clean cuts every time. The queue system is so convenient.', rating: 5 },
    { name: 'James L.', text: 'Been coming here for 3 years. Great atmosphere, skilled barbers, and the check-in app saves me so much time.', rating: 5 },
  ];

  return (
    <section id="about" className="py-20 px-4" style={{ backgroundColor: c.bgSecondary }}>
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <p className="text-xs font-bold tracking-widest uppercase mb-3" style={{ color: c.accent, fontFamily: theme.fonts.body }}>Our Story</p>
          <h2 className="text-4xl md:text-5xl font-bold mb-4" style={{ color: c.text, fontFamily: theme.fonts.heading }}>About Us</h2>
          <div className="w-16 h-1 mx-auto rounded-full" style={{ backgroundColor: c.divider }} />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-20">
          <div>
            <p className="text-lg leading-relaxed mb-6" style={{ color: c.textSecondary, fontFamily: theme.fonts.body }}>
              Founded in {BUSINESS.established}, {BUSINESS.name} has been the go-to destination for men who value precision, style, and a classic barbershop experience. Our skilled barbers combine time-honored techniques with modern trends to deliver cuts that make a statement.
            </p>
            <p className="text-lg leading-relaxed" style={{ color: c.textSecondary, fontFamily: theme.fonts.body }}>
              We believe every man deserves to look his best without the hassle of long waits. That's why we've introduced our online check-in system - join the queue from anywhere and show up when it's your turn.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-6 rounded-xl text-center" style={{ backgroundColor: c.card, border: `1px solid ${c.border}` }}>
              <p className="text-3xl font-bold mb-1" style={{ color: c.accent, fontFamily: theme.fonts.heading }}>{new Date().getFullYear() - BUSINESS.established}+</p>
              <p className="text-sm" style={{ color: c.textSecondary, fontFamily: theme.fonts.body }}>Years Experience</p>
            </div>
            <div className="p-6 rounded-xl text-center" style={{ backgroundColor: c.card, border: `1px solid ${c.border}` }}>
              <p className="text-3xl font-bold mb-1" style={{ color: c.accent, fontFamily: theme.fonts.heading }}>10K+</p>
              <p className="text-sm" style={{ color: c.textSecondary, fontFamily: theme.fonts.body }}>Happy Clients</p>
            </div>
            <div className="p-6 rounded-xl text-center" style={{ backgroundColor: c.card, border: `1px solid ${c.border}` }}>
              <p className="text-3xl font-bold mb-1" style={{ color: c.accent, fontFamily: theme.fonts.heading }}>4</p>
              <p className="text-sm" style={{ color: c.textSecondary, fontFamily: theme.fonts.body }}>Expert Barbers</p>
            </div>
            <div className="p-6 rounded-xl text-center" style={{ backgroundColor: c.card, border: `1px solid ${c.border}` }}>
              <p className="text-3xl font-bold mb-1" style={{ color: c.accent, fontFamily: theme.fonts.heading }}>4.9</p>
              <p className="text-sm" style={{ color: c.textSecondary, fontFamily: theme.fonts.body }}>Star Rating</p>
            </div>
          </div>
        </div>
        <div className="text-center mb-10">
          <h3 className="text-2xl md:text-3xl font-bold" style={{ color: c.text, fontFamily: theme.fonts.heading }}>What Our Clients Say</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map(t => (
            <div key={t.name} className="p-6 rounded-xl transition-all hover:scale-[1.02]" style={{ backgroundColor: c.card, border: `1px solid ${c.border}` }}>
              <div className="flex gap-1 mb-3">
                {Array.from({ length: t.rating }).map((_, i) => <Star key={i} size={16} fill={c.accent} style={{ color: c.accent }} />)}
              </div>
              <p className="text-sm mb-4 leading-relaxed" style={{ color: c.textSecondary, fontFamily: theme.fonts.body }}>"{t.text}"</p>
              <p className="font-bold text-sm" style={{ color: c.text, fontFamily: theme.fonts.body }}>- {t.name}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function Hours({ theme }: { theme: Theme }) {
  const c = theme.colors;
  const hours = [
    { day: 'Monday - Friday', time: BUSINESS.hours.weekdays },
    { day: 'Saturday', time: BUSINESS.hours.saturday },
    { day: 'Sunday', time: BUSINESS.hours.sunday },
  ];

  return (
    <section id="hours" className="py-20 px-4" style={{ backgroundColor: c.bg }}>
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <p className="text-xs font-bold tracking-widest uppercase mb-3" style={{ color: c.accent, fontFamily: theme.fonts.body }}>When We're Open</p>
          <h2 className="text-4xl md:text-5xl font-bold mb-4" style={{ color: c.text, fontFamily: theme.fonts.heading }}>Business Hours</h2>
          <div className="w-16 h-1 mx-auto rounded-full" style={{ backgroundColor: c.divider }} />
        </div>
        <div className="space-y-4">
          {hours.map(h => (
            <div key={h.day} className="flex justify-between items-center p-5 rounded-xl" style={{ backgroundColor: c.card, border: `1px solid ${c.border}` }}>
              <span className="font-semibold" style={{ color: c.text, fontFamily: theme.fonts.heading }}>{h.day}</span>
              <span className="font-mono" style={{ color: c.accent, fontFamily: theme.fonts.body }}>{h.time}</span>
            </div>
          ))}
        </div>
        <div className="mt-8 p-6 rounded-xl text-center" style={{ backgroundColor: c.accentLight, border: `1px solid ${c.accent}` }}>
          <p className="text-sm" style={{ color: c.textSecondary, fontFamily: theme.fonts.body }}><Clock size={14} className="inline mr-1" style={{ color: c.accent }} />Online check-in available during business hours (closes 30 min before closing)</p>
        </div>
      </div>
    </section>
  );
}

export function Contact({ theme }: { theme: Theme }) {
  const c = theme.colors;
  return (
    <section id="contact" className="py-20 px-4" style={{ backgroundColor: c.bgSecondary }}>
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <p className="text-xs font-bold tracking-widest uppercase mb-3" style={{ color: c.accent, fontFamily: theme.fonts.body }}>Get In Touch</p>
          <h2 className="text-4xl md:text-5xl font-bold mb-4" style={{ color: c.text, fontFamily: theme.fonts.heading }}>Contact Us</h2>
          <div className="w-16 h-1 mx-auto rounded-full" style={{ backgroundColor: c.divider }} />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-xl text-center" style={{ backgroundColor: c.card, border: `1px solid ${c.border}` }}>
            <MapPin size={28} className="mx-auto mb-3" style={{ color: c.accent }} />
            <h4 className="font-bold mb-2" style={{ color: c.text, fontFamily: theme.fonts.heading }}>Visit Us</h4>
            <p className="text-sm" style={{ color: c.textSecondary, fontFamily: theme.fonts.body }}>{BUSINESS.address}</p>
          </div>
          <div className="p-6 rounded-xl text-center" style={{ backgroundColor: c.card, border: `1px solid ${c.border}` }}>
            <Phone size={28} className="mx-auto mb-3" style={{ color: c.accent }} />
            <h4 className="font-bold mb-2" style={{ color: c.text, fontFamily: theme.fonts.heading }}>Call Us</h4>
            <p className="text-sm" style={{ color: c.textSecondary, fontFamily: theme.fonts.body }}>{BUSINESS.phone}</p>
          </div>
          <div className="p-6 rounded-xl text-center" style={{ backgroundColor: c.card, border: `1px solid ${c.border}` }}>
            <Mail size={28} className="mx-auto mb-3" style={{ color: c.accent }} />
            <h4 className="font-bold mb-2" style={{ color: c.text, fontFamily: theme.fonts.heading }}>Email Us</h4>
            <p className="text-sm" style={{ color: c.textSecondary, fontFamily: theme.fonts.body }}>{BUSINESS.email}</p>
          </div>
        </div>
      </div>
    </section>
  );
}

export function Footer({ theme }: { theme: Theme }) {
  const c = theme.colors;
  return (
    <footer className="py-12 px-4" style={{ backgroundColor: c.footerBg }}>
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <Scissors size={20} style={{ color: c.accent }} />
            <span className="font-bold" style={{ color: c.footerText, fontFamily: theme.fonts.heading }}>{BUSINESS.name}</span>
          </div>
          <div className="flex items-center gap-6">
            <a href="#" className="transition-colors hover:opacity-80" style={{ color: c.footerText }}><Instagram size={20} /></a>
            <a href="#" className="transition-colors hover:opacity-80" style={{ color: c.footerText }}><Facebook size={20} /></a>
          </div>
          <p className="text-sm" style={{ color: c.footerText, fontFamily: theme.fonts.body }}>&copy; {new Date().getFullYear()} {BUSINESS.name}. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
