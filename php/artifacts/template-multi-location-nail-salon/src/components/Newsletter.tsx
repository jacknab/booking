import { useState } from 'react';
import { Send, Check } from 'lucide-react';

export default function Newsletter() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setSubmitted(true);
      setEmail('');
    }
  };

  return (
    <section className="py-20 bg-[#fdf6ec]">
      <div className="max-w-2xl mx-auto px-4 text-center">
        <p className="text-[#c9a96e] text-xs tracking-[0.4em] uppercase font-medium mb-4">
          Stay Connected
        </p>
        <h2
          className="text-3xl md:text-4xl font-bold text-[#1a1a1a] mb-4"
          style={{ fontFamily: 'Georgia, serif' }}
        >
          Subscribe & Save
        </h2>
        <p className="text-[#6a6a6a] mb-8 leading-relaxed">
          Subscribe to our newsletter and receive an exclusive discount delivered straight to your
          inbox. Plus, be the first to know about seasonal specials and new services.
        </p>

        {submitted ? (
          <div className="flex items-center justify-center gap-3 bg-white border border-[#c9a96e] py-4 px-8">
            <Check size={18} className="text-[#c9a96e]" />
            <span className="text-[#3a3a3a] font-medium">
              Thank you! Check your inbox for your discount.
            </span>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-0 max-w-md mx-auto">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email address"
              required
              className="flex-1 border border-[#d4c8b8] bg-white px-5 py-4 text-sm text-[#1a1a1a] placeholder-[#a0a0a0] focus:outline-none focus:border-[#c9a96e] transition-colors"
            />
            <button
              type="submit"
              className="bg-[#c9a96e] text-white px-6 py-4 hover:bg-[#b8935a] transition-colors flex items-center justify-center gap-2 text-sm font-semibold tracking-wide uppercase"
            >
              <Send size={14} />
              Subscribe
            </button>
          </form>
        )}

        <p className="text-[#a0a0a0] text-xs mt-4">
          No spam, ever. Unsubscribe at any time.
        </p>
      </div>
    </section>
  );
}
