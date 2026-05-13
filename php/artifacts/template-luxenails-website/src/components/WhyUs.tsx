import { Leaf, Star, Shield, Clock, Award, Heart } from 'lucide-react';

const reasons = [
  {
    icon: Award,
    title: 'Expert Nail Artists',
    description: 'Our team of certified nail technicians brings years of experience and ongoing training in the latest techniques.',
  },
  {
    icon: Leaf,
    title: 'Non-Toxic Products',
    description: 'We use only premium, non-toxic, health-conscious products that protect and strengthen your natural nails.',
  },
  {
    icon: Shield,
    title: 'Hygienic Standards',
    description: 'Rigorous sanitation protocols and single-use tools ensure a safe, hygienic experience every single visit.',
  },
  {
    icon: Star,
    title: 'Flawless Finish',
    description: 'Every detail is meticulously crafted — from shaping to topcoat — for results that exceed expectations.',
  },
  {
    icon: Heart,
    title: 'Personalized Care',
    description: 'We tailor every service to your unique style, nail type, and preferences for a truly bespoke experience.',
  },
  {
    icon: Clock,
    title: 'Long-Lasting Results',
    description: 'Our premium techniques and products are designed for beauty and durability that lasts for weeks.',
  },
];

export default function WhyUs() {
  return (
    <section className="py-24 bg-[#1a1612] relative overflow-hidden">
      <div className="absolute inset-0 opacity-10">
        <img
          src="https://images.pexels.com/photos/3997391/pexels-photo-3997391.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1080&fit=crop"
          alt=""
          className="w-full h-full object-cover"
        />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <p className="text-[#e8c99a] tracking-[0.3em] uppercase text-xs font-light mb-4">
            Why Choose Us
          </p>
          <h2 className="text-4xl md:text-5xl font-extralight text-white mb-6">
            Because You Deserve{' '}
            <span className="font-semibold italic text-[#e8c99a]">More</span>
          </h2>
          <p className="text-white/60 font-light max-w-2xl mx-auto text-lg leading-relaxed">
            At LuxeNails, self-care is an elevated experience. We redefine beauty and wellness with luxury nail care that blends artistry, precision, and relaxation.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {reasons.map((reason) => (
            <div
              key={reason.title}
              className="border border-white/10 p-8 hover:border-[#b8936a]/50 transition-all duration-400 group"
            >
              <reason.icon className="w-8 h-8 text-[#b8936a] mb-5 group-hover:scale-110 transition-transform duration-300" />
              <h3 className="text-white text-lg font-light mb-3 tracking-wide">
                {reason.title}
              </h3>
              <p className="text-white/50 text-sm font-light leading-relaxed">
                {reason.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
