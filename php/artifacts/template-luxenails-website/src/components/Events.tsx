import { Calendar, ArrowRight } from 'lucide-react';

export default function Events() {
  return (
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid md:grid-cols-2 gap-16 items-center">
          <div className="relative">
            <img
              src="https://images.pexels.com/photos/3757942/pexels-photo-3757942.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop"
              alt="Nail salon event"
              className="w-full h-[460px] object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#1a1612]/60 to-transparent" />
            <div className="absolute bottom-8 left-8 right-8">
              <p className="text-[#e8c99a] tracking-widest uppercase text-xs font-light mb-2">Happy Hour</p>
              <p className="text-white font-light text-lg">
                Monday – Wednesday, 12pm – 3pm
              </p>
              <p className="text-white/70 text-sm font-light mt-1">
                Complimentary sparkling wine with every service
              </p>
            </div>
          </div>

          <div>
            <p className="text-[#b8936a] tracking-[0.3em] uppercase text-xs font-light mb-4">
              Upcoming Event
            </p>
            <h2 className="text-4xl md:text-5xl font-extralight text-[#1a1a1a] leading-tight mb-6">
              Bridal &<br />
              <span className="font-semibold">Pamper Party</span>
            </h2>
            <div className="flex items-center gap-3 text-[#b8936a] mb-6">
              <Calendar className="w-5 h-5" />
              <span className="text-sm tracking-widest uppercase font-light">June 14th, 2026 — 2:00 PM to 6:00 PM</span>
            </div>
            <p className="text-[#5a5a5a] font-light leading-relaxed mb-4 text-lg">
              Celebrate your bride-to-be with an exclusive pamper afternoon at LuxeNails. Our private event package includes full spa manicures, luxury pedicures, bubbly, and personalized nail art for the whole bridal party.
            </p>
            <p className="text-[#5a5a5a] font-light leading-relaxed mb-8">
              All proceeds from our June charity raffle go to local women's shelters. Book your group event today — spaces are limited to ensure an intimate, premium experience.
            </p>
            <div className="flex flex-wrap gap-4">
              <a
                href="#"
                className="inline-flex items-center gap-2 px-8 py-3.5 bg-[#b8936a] text-white tracking-widest uppercase text-sm font-light hover:bg-[#a07a54] transition-all duration-300"
              >
                View Details
                <ArrowRight className="w-4 h-4" />
              </a>
              <a
                href="#"
                className="inline-flex items-center gap-2 px-8 py-3.5 border border-[#b8936a] text-[#b8936a] tracking-widest uppercase text-sm font-light hover:bg-[#b8936a] hover:text-white transition-all duration-300"
              >
                All Events
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
