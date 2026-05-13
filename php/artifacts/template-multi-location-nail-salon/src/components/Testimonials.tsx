import { useState } from 'react';
import { Star, ChevronLeft, ChevronRight } from 'lucide-react';

const reviews = [
  {
    name: 'Jessica M.',
    location: 'South Congress',
    rating: 5,
    text: "I've been coming to Petal for over two years and I'll never go anywhere else. The atmosphere is so calming, the staff are incredibly professional, and my nails always look stunning. Best nail spa in Austin, hands down.",
    avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=100',
  },
  {
    name: 'Rachel T.',
    location: 'The Domain',
    rating: 5,
    text: 'Absolutely obsessed with this place. I got The Lotus pedicure with the CBD massage add-on and it was pure heaven. The products smell amazing and the nail artists are true artists. Worth every penny.',
    avatar: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=100',
  },
  {
    name: 'Priya S.',
    location: 'South Congress',
    rating: 5,
    text: "I switched to Petal after years of bad gel experiences at other salons. The CND Shellac here is the real deal — it lasts 3+ weeks without chipping. The team is knowledgeable, kind, and the vibe is just perfect.",
    avatar: 'https://images.pexels.com/photos/1130626/pexels-photo-1130626.jpeg?auto=compress&cs=tinysrgb&w=100',
  },
  {
    name: 'Amanda K.',
    location: 'The Domain',
    rating: 5,
    text: "Came in for a Blossom manicure and left completely relaxed. The spa is so clean and serene. No harsh chemical smell — just pure luxury. I booked my next appointment before I even left.",
    avatar: 'https://images.pexels.com/photos/1181519/pexels-photo-1181519.jpeg?auto=compress&cs=tinysrgb&w=100',
  },
  {
    name: 'Lauren B.',
    location: 'South Congress',
    rating: 5,
    text: "Finally a nail salon that takes natural nail care seriously. No acrylics, no harsh chemicals, just beautiful, healthy nails. The rewards program is a bonus — I've already racked up enough points for a free service!",
    avatar: 'https://images.pexels.com/photos/733872/pexels-photo-733872.jpeg?auto=compress&cs=tinysrgb&w=100',
  },
];

export default function Testimonials() {
  const [current, setCurrent] = useState(0);
  const visible = 3;

  const prev = () => setCurrent((c) => Math.max(0, c - 1));
  const next = () => setCurrent((c) => Math.min(reviews.length - visible, c + 1));

  return (
    <section className="py-24 bg-[#faf8f5]">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-16">
          <p className="text-[#c9a96e] text-xs tracking-[0.4em] uppercase font-medium mb-3">
            Client Love
          </p>
          <h2
            className="text-4xl md:text-5xl font-bold text-[#1a1a1a] mb-4"
            style={{ fontFamily: 'Georgia, serif' }}
          >
            Don't Just Take
            <br />Our Word For It
          </h2>
          <div className="flex items-center justify-center gap-1 mt-4">
            {[...Array(5)].map((_, i) => (
              <Star key={i} size={20} className="text-[#c9a96e] fill-[#c9a96e]" />
            ))}
            <span className="ml-2 text-[#6a6a6a] font-medium">5.0 Average Rating</span>
          </div>
        </div>

        {/* Desktop: show 3, mobile: show 1 */}
        <div className="hidden md:grid grid-cols-3 gap-6 mb-8">
          {reviews.slice(current, current + visible).map((review) => (
            <ReviewCard key={review.name} review={review} />
          ))}
        </div>
        <div className="md:hidden mb-8">
          <ReviewCard review={reviews[current % reviews.length]} />
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-center gap-4">
          <button
            onClick={prev}
            disabled={current === 0}
            className="w-10 h-10 border border-[#e0d9ce] flex items-center justify-center hover:border-[#c9a96e] hover:text-[#c9a96e] transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            aria-label="Previous"
          >
            <ChevronLeft size={18} />
          </button>
          <div className="flex gap-2">
            {reviews.slice(0, reviews.length - visible + 1).map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  i === current ? 'bg-[#c9a96e] w-6' : 'bg-[#e0d9ce]'
                }`}
                aria-label={`Go to review ${i + 1}`}
              />
            ))}
          </div>
          <button
            onClick={next}
            disabled={current >= reviews.length - visible}
            className="w-10 h-10 border border-[#e0d9ce] flex items-center justify-center hover:border-[#c9a96e] hover:text-[#c9a96e] transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            aria-label="Next"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>
    </section>
  );
}

function ReviewCard({ review }: { review: typeof reviews[number] }) {
  return (
    <div className="bg-white p-8 flex flex-col gap-4 border border-[#e8e2d9] hover:border-[#c9a96e] hover:shadow-md transition-all duration-300">
      <div className="flex gap-1">
        {[...Array(review.rating)].map((_, i) => (
          <Star key={i} size={14} className="text-[#c9a96e] fill-[#c9a96e]" />
        ))}
      </div>
      <p className="text-[#3a3a3a] text-sm leading-relaxed flex-1">"{review.text}"</p>
      <div className="flex items-center gap-3 pt-2 border-t border-[#f0ece6]">
        <img
          src={review.avatar}
          alt={review.name}
          className="w-10 h-10 rounded-full object-cover"
        />
        <div>
          <p className="font-semibold text-[#1a1a1a] text-sm">{review.name}</p>
          <p className="text-[#c9a96e] text-xs">{review.location}</p>
        </div>
      </div>
    </div>
  );
}
