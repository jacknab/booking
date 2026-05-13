import { Gift } from 'lucide-react';

export default function GiftCards() {
  return (
    <section id="gift-cards" className="py-24 bg-[#1a1a1a] relative overflow-hidden">
      {/* Background decorative */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-0 right-0 w-96 h-96 rounded-full border-[40px] border-[#c9a96e] translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 left-0 w-64 h-64 rounded-full border-[30px] border-[#c9a96e] -translate-x-1/2 translate-y-1/2" />
      </div>

      <div className="max-w-6xl mx-auto px-4 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
          <div>
            <div className="w-14 h-14 bg-[#c9a96e]/10 rounded-full flex items-center justify-center mb-6">
              <Gift size={28} className="text-[#c9a96e]" />
            </div>
            <p className="text-[#c9a96e] text-xs tracking-[0.4em] uppercase font-medium mb-4">
              Perfect for Any Occasion
            </p>
            <h2
              className="text-4xl md:text-5xl font-bold text-white mb-6 leading-snug"
              style={{ fontFamily: 'Georgia, serif' }}
            >
              Give the Gift
              <br />of Self-Care
            </h2>
            <p className="text-white/60 text-lg leading-relaxed mb-8">
              The perfect gift for birthdays, holidays, anniversaries, or just because. Petal gift
              cards can be purchased online or in-store, and redeemed at either of our Austin
              locations.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <button className="bg-[#c9a96e] text-white text-sm font-semibold tracking-widest uppercase px-8 py-4 hover:bg-[#b8935a] transition-colors">
                Buy a Gift Card
              </button>
              <button className="border border-white/30 text-white text-sm font-semibold tracking-widest uppercase px-8 py-4 hover:border-[#c9a96e] hover:text-[#c9a96e] transition-colors">
                Redeem Online
              </button>
            </div>
          </div>

          <div className="relative">
            <div className="bg-gradient-to-br from-[#c9a96e] to-[#a07840] p-1 shadow-2xl">
              <img
                src="https://images.pexels.com/photos/3997392/pexels-photo-3997392.jpeg?auto=compress&cs=tinysrgb&w=800"
                alt="Petal Nail Spa gift card"
                className="w-full aspect-video object-cover"
              />
            </div>
            {/* Floating card preview */}
            <div className="absolute -bottom-6 -left-6 bg-white p-5 shadow-xl max-w-[200px] hidden md:block">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-5 bg-gradient-to-r from-[#c9a96e] to-[#a07840] rounded-sm" />
                <span className="text-xs font-bold text-[#1a1a1a]">Petal Nail Spa</span>
              </div>
              <p className="text-[10px] text-[#6a6a6a] leading-relaxed">
                Valid at both Austin locations. No expiry.
              </p>
            </div>
          </div>
        </div>

        {/* Rewards program teaser */}
        <div className="mt-20 border border-white/10 p-8 md:p-12 flex flex-col md:flex-row items-start md:items-center gap-8">
          <div className="shrink-0">
            <div className="w-16 h-16 bg-[#c9a96e]/10 border border-[#c9a96e]/30 rounded-full flex items-center justify-center">
              <span className="text-[#c9a96e] text-2xl font-bold" style={{ fontFamily: 'Georgia, serif' }}>P</span>
            </div>
          </div>
          <div className="flex-1">
            <h3
              className="text-xl font-bold text-white mb-2"
              style={{ fontFamily: 'Georgia, serif' }}
            >
              Petal Rewards Program
            </h3>
            <p className="text-white/60 leading-relaxed">
              Every client is automatically enrolled in Petal Rewards — 100% free. Earn 1 point per
              dollar spent and redeem points for services at either location.
            </p>
          </div>
          <button className="shrink-0 border border-[#c9a96e] text-[#c9a96e] text-sm font-semibold tracking-widest uppercase px-6 py-3 hover:bg-[#c9a96e] hover:text-white transition-colors">
            Learn More
          </button>
        </div>
      </div>
    </section>
  );
}
