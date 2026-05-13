import { Award, Heart, Leaf } from 'lucide-react';

export default function About() {
  return (
    <section id="about" className="py-24 bg-white">
      <div className="max-w-6xl mx-auto px-4">
        {/* Redefining section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center mb-24">
          <div>
            <p className="text-[#c9a96e] text-xs tracking-[0.4em] uppercase font-medium mb-4">
              Our Philosophy
            </p>
            <h2
              className="text-4xl md:text-5xl font-bold text-[#1a1a1a] mb-6 leading-snug"
              style={{ fontFamily: 'Georgia, serif' }}
            >
              Redefining the
              <br />Nail Salon Experience
            </h2>
            <p className="text-[#6a6a6a] text-lg leading-relaxed mb-6">
              <em>Say goodbye to toxic chemicals, harsh fumes, and pretentious attitudes.</em> Petal
              Nail Spa is the answer to natural nails applied by skilled nail artists in a welcoming,
              spa environment.
            </p>
            <p className="text-[#6a6a6a] leading-relaxed mb-8">
              We believe that getting your nails done should be an experience that leaves you feeling
              refreshed, confident, and cared for — not overwhelmed by strong chemicals or rushed
              through a process.
            </p>
            <div className="grid grid-cols-3 gap-6">
              {[
                { icon: <Leaf size={20} className="text-[#c9a96e]" />, label: 'Natural Products' },
                { icon: <Award size={20} className="text-[#c9a96e]" />, label: '5-Star Rated' },
                { icon: <Heart size={20} className="text-[#c9a96e]" />, label: 'Client-First' },
              ].map((item) => (
                <div key={item.label} className="text-center">
                  <div className="w-12 h-12 mx-auto bg-[#fdf6ec] rounded-full flex items-center justify-center mb-3">
                    {item.icon}
                  </div>
                  <p className="text-xs font-semibold text-[#3a3a3a] tracking-wide">{item.label}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="relative">
            <img
              src="https://images.pexels.com/photos/3997394/pexels-photo-3997394.jpeg?auto=compress&cs=tinysrgb&w=800"
              alt="Nail artist at work"
              className="w-full aspect-[4/5] object-cover"
            />
            <div className="absolute -bottom-6 -left-6 bg-[#c9a96e] text-white p-8 max-w-[200px] hidden md:block">
              <p className="text-4xl font-bold" style={{ fontFamily: 'Georgia, serif' }}>10+</p>
              <p className="text-sm tracking-wide uppercase mt-1">Years of Excellence</p>
            </div>
          </div>
        </div>

        {/* Team section */}
        <div className="bg-[#faf8f5] p-10 md:p-16">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <div className="grid grid-cols-2 gap-3">
                <img
                  src="https://images.pexels.com/photos/3997380/pexels-photo-3997380.jpeg?auto=compress&cs=tinysrgb&w=400"
                  alt="Team member"
                  className="w-full aspect-square object-cover"
                />
                <img
                  src="https://images.pexels.com/photos/3997395/pexels-photo-3997395.jpeg?auto=compress&cs=tinysrgb&w=400"
                  alt="Nail art"
                  className="w-full aspect-square object-cover mt-8"
                />
              </div>
            </div>
            <div>
              <p className="text-[#c9a96e] text-xs tracking-[0.4em] uppercase font-medium mb-4">
                Our Story
              </p>
              <h2
                className="text-3xl md:text-4xl font-bold text-[#1a1a1a] mb-6 leading-snug"
                style={{ fontFamily: 'Georgia, serif' }}
              >
                Nailing Your Look
                <br />Since 2014
              </h2>
              <p className="text-[#6a6a6a] leading-relaxed mb-4">
                We're a tightly-knit team of nail artists and customer care professionals who work
                together to create beautiful nails that make our clients feel amazing — every single
                time.
              </p>
              <p className="text-[#6a6a6a] leading-relaxed mb-8">
                Founded with a passion for eco-conscious beauty and exceptional service, Petal has
                grown into Austin's most trusted nail spa — with two locations and a community of
                loyal clients who keep coming back.
              </p>
              <div className="flex flex-wrap gap-4">
                <div className="text-center">
                  <p className="text-3xl font-bold text-[#c9a96e]" style={{ fontFamily: 'Georgia, serif' }}>
                    2
                  </p>
                  <p className="text-xs uppercase tracking-widest text-[#6a6a6a] mt-1">Locations</p>
                </div>
                <div className="w-px bg-[#e8e2d9] mx-2" />
                <div className="text-center">
                  <p className="text-3xl font-bold text-[#c9a96e]" style={{ fontFamily: 'Georgia, serif' }}>
                    20+
                  </p>
                  <p className="text-xs uppercase tracking-widest text-[#6a6a6a] mt-1">Artists</p>
                </div>
                <div className="w-px bg-[#e8e2d9] mx-2" />
                <div className="text-center">
                  <p className="text-3xl font-bold text-[#c9a96e]" style={{ fontFamily: 'Georgia, serif' }}>
                    10K+
                  </p>
                  <p className="text-xs uppercase tracking-widest text-[#6a6a6a] mt-1">Clients</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
