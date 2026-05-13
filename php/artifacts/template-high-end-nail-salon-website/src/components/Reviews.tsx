import { useState } from 'react';
import { ChevronLeft, ChevronRight, Star } from 'lucide-react';

const reviews = [
  {
    name: 'Madison Clarke',
    initials: 'MC',
    avatar: null,
    timeAgo: '1 week ago',
    text: 'I have been coming to Lumière for over two years and I will never go anywhere else. The attention to detail is unmatched — every single technician takes their time and truly cares about the result. My gel manicures last 3+ weeks without chipping.',
  },
  {
    name: 'Sofia Reyes',
    initials: 'SR',
    avatar: null,
    timeAgo: '2 weeks ago',
    text: 'Walked in without an appointment on a Saturday and was seated within 15 minutes. The spa pedicure was the most relaxing experience — warm towels, exfoliation, the works. Absolutely stunning results and incredibly clean facility.',
  },
  {
    name: 'Priya Anand',
    initials: 'PA',
    avatar: null,
    timeAgo: '3 weeks ago',
    text: 'I asked for a custom ombré design with chrome powder and the technician absolutely nailed it (pun intended). The entire salon feels like a luxury spa — calming music, beautiful decor, and a team that truly loves what they do.',
  },
  {
    name: 'Taylor Bennett',
    initials: 'TB',
    avatar: null,
    timeAgo: '1 month ago',
    text: 'Best nail salon in Denver, full stop. I have tried at least a dozen places and nothing compares to the quality and consistency here. The dip powder manicure I got lasts almost a month without lifting. Highly recommend the deluxe pedicure!',
  },
  {
    name: 'Camille Nguyen',
    initials: 'CN',
    avatar: null,
    timeAgo: '1 month ago',
    text: 'Lumière truly lives up to its name. Every visit feels like a mini escape from the world. The staff remembered my preferences from my last visit without me even mentioning them. That level of service is rare and incredibly appreciated.',
  },
];

function StarRow() {
  return (
    <div className="flex gap-1">
      {[...Array(5)].map((_, i) => (
        <Star key={i} size={16} fill="#F5C518" stroke="none" />
      ))}
    </div>
  );
}

function ReviewCard({ review }: { review: (typeof reviews)[0] }) {
  return (
    <div className="flex flex-col gap-4 bg-charcoal-800/60 border border-gold-400/30 rounded-lg p-6 min-h-[220px]">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gold-400/20 border border-gold-400/40 flex items-center justify-center">
            <span className="font-sans text-xs font-bold text-gold-400">{review.initials}</span>
          </div>
          <div>
            <p className="font-sans text-sm font-semibold text-white leading-tight">{review.name}</p>
            <p className="font-sans text-[11px] text-white/50">{review.timeAgo}</p>
          </div>
        </div>
        {/* Google G */}
        <div className="w-7 h-7 flex items-center justify-center">
          <svg viewBox="0 0 24 24" width="22" height="22" xmlns="http://www.w3.org/2000/svg">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
        </div>
      </div>

      {/* Stars + verified */}
      <div className="flex items-center gap-2">
        <StarRow />
        <svg viewBox="0 0 24 24" width="16" height="16" fill="#1A73E8">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
        </svg>
      </div>

      {/* Review text */}
      <p className="font-sans text-sm text-white/70 leading-relaxed flex-1">
        {review.text.length > 160 ? review.text.slice(0, 160) + '...' : review.text}
      </p>
      <button className="font-sans text-xs text-white/40 hover:text-gold-400 transition-colors text-left tracking-wide">
        Read more
      </button>
    </div>
  );
}

export default function Reviews() {
  const [index, setIndex] = useState(0);
  const visible = 3;
  const max = reviews.length - visible;

  const prev = () => setIndex((i) => Math.max(0, i - 1));
  const next = () => setIndex((i) => Math.min(max, i + 1));

  return (
    <section id="reviews" className="bg-charcoal-900 py-24 px-6">
      <div className="max-w-7xl mx-auto">
        {/* Headline */}
        <h2 className="font-sans text-xl md:text-2xl font-extrabold tracking-[0.08em] uppercase text-white text-center mb-14 leading-tight">
          Lumière Nail Salon Has a 4.9-Star Rating<br />
          Based on Over 2,000 Google Reviews!
        </h2>

        <div className="flex flex-col lg:flex-row items-center lg:items-start gap-10">
          {/* Left Rating */}
          <div className="flex flex-col items-center lg:items-start gap-3 lg:w-40 flex-shrink-0">
            <p className="font-sans text-xl font-extrabold tracking-[0.15em] uppercase text-white">
              Excellent
            </p>
            <StarRow />
            <div className="mt-1">
              <svg viewBox="0 0 272 92" xmlns="http://www.w3.org/2000/svg" width="90" height="30">
                <text y="72" fontFamily="Product Sans,Arial,sans-serif" fontSize="72" fill="#4285F4">G</text>
                <text x="54" y="72" fontFamily="Product Sans,Arial,sans-serif" fontSize="72" fill="#EA4335">o</text>
                <text x="107" y="72" fontFamily="Product Sans,Arial,sans-serif" fontSize="72" fill="#FBBC05">o</text>
                <text x="160" y="72" fontFamily="Product Sans,Arial,sans-serif" fontSize="72" fill="#4285F4">g</text>
                <text x="210" y="72" fontFamily="Product Sans,Arial,sans-serif" fontSize="72" fill="#34A853">l</text>
                <text x="236" y="72" fontFamily="Product Sans,Arial,sans-serif" fontSize="72" fill="#EA4335">e</text>
              </svg>
            </div>
          </div>

          {/* Review Carousel */}
          <div className="flex-1 overflow-hidden">
            <div className="relative">
              {/* Cards */}
              <div className="hidden md:grid md:grid-cols-3 gap-4">
                {reviews.slice(index, index + visible).map((review) => (
                  <ReviewCard key={review.name} review={review} />
                ))}
              </div>

              {/* Mobile: single card */}
              <div className="md:hidden">
                <ReviewCard review={reviews[index]} />
              </div>

              {/* Arrows */}
              <div className="flex justify-center md:justify-between items-center mt-8 gap-4">
                <button
                  onClick={prev}
                  disabled={index === 0}
                  className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center text-white/60 hover:text-white hover:border-white/60 disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-200 md:absolute md:-left-14 md:top-1/2 md:-translate-y-1/2"
                >
                  <ChevronLeft size={18} />
                </button>
                <div className="flex gap-2 md:hidden">
                  {reviews.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setIndex(i)}
                      className={`w-2 h-2 rounded-full transition-colors duration-200 ${
                        i === index ? 'bg-gold-400' : 'bg-white/20'
                      }`}
                    />
                  ))}
                </div>
                <button
                  onClick={next}
                  disabled={index >= max}
                  className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center text-white/60 hover:text-white hover:border-white/60 disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-200 md:absolute md:-right-14 md:top-1/2 md:-translate-y-1/2"
                >
                  <ChevronRight size={18} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
