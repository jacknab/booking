import { useState } from 'react';
import { Star, ChevronLeft, ChevronRight } from 'lucide-react';

const testimonials = [
  {
    name: 'Samantha R.',
    rating: 5,
    text: 'Absolutely the best nail salon experience I have ever had. The attention to detail was outstanding — my gel extensions lasted over four weeks without a single chip. The staff made me feel so welcomed.',
  },
  {
    name: 'Jessica T.',
    rating: 5,
    text: 'I came in for a birthday treat and left feeling like royalty. The spa pedicure was heavenly and my nail art turned out even better than the inspiration photo I brought. Will definitely be back!',
  },
  {
    name: 'Maria L.',
    rating: 5,
    text: 'LuxeNails is the only salon I trust with my nails. The technicians are highly skilled, the space is beautiful and immaculate, and the products they use are top quality. Five stars every time.',
  },
  {
    name: 'Angela P.',
    rating: 5,
    text: 'I booked a last-minute appointment before my wedding and the team exceeded every expectation. My bridal nails were perfect and exactly what I envisioned. Thank you so much!',
  },
  {
    name: 'Rachel K.',
    rating: 5,
    text: 'The dip powder manicure I got here has lasted longer than any I have had elsewhere. Clean, relaxing atmosphere and the staff are genuinely passionate about their craft. Highly recommended.',
  },
  {
    name: 'Diane C.',
    rating: 5,
    text: 'I have been coming here for over two years and the quality never wavers. Every technician is talented, the salon smells wonderful, and they always have the latest nail trends available.',
  },
];

export default function Testimonials() {
  const [page, setPage] = useState(0);
  const perPage = 3;
  const totalPages = Math.ceil(testimonials.length / perPage);
  const visible = testimonials.slice(page * perPage, page * perPage + perPage);

  return (
    <section className="py-24 bg-[#faf8f5]">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <p className="text-[#b8936a] tracking-[0.3em] uppercase text-xs font-light mb-4">
            Client Love
          </p>
          <h2 className="text-4xl md:text-5xl font-extralight text-[#1a1a1a] mb-4">
            What Our Clients <span className="font-semibold">Say</span>
          </h2>
          <div className="w-16 h-px bg-[#b8936a] mx-auto" />
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-10">
          {visible.map((t, i) => (
            <div key={i} className="bg-white p-8 border border-gray-100 hover:border-[#e8c99a] transition-colors duration-300">
              <div className="flex gap-1 mb-4">
                {Array.from({ length: t.rating }).map((_, j) => (
                  <Star key={j} className="w-4 h-4 fill-[#b8936a] text-[#b8936a]" />
                ))}
              </div>
              <p className="text-[#5a5a5a] font-light leading-relaxed mb-6 text-sm">
                "{t.text}"
              </p>
              <p className="text-[#1a1a1a] font-medium text-sm tracking-wide">
                — {t.name}
              </p>
            </div>
          ))}
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-4">
            <button
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page === 0}
              className="w-10 h-10 border border-[#b8936a] flex items-center justify-center text-[#b8936a] hover:bg-[#b8936a] hover:text-white transition-all duration-300 disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            {Array.from({ length: totalPages }).map((_, i) => (
              <button
                key={i}
                onClick={() => setPage(i)}
                className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                  i === page ? 'bg-[#b8936a]' : 'bg-[#d4b896]'
                }`}
              />
            ))}
            <button
              onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              disabled={page === totalPages - 1}
              className="w-10 h-10 border border-[#b8936a] flex items-center justify-center text-[#b8936a] hover:bg-[#b8936a] hover:text-white transition-all duration-300 disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
