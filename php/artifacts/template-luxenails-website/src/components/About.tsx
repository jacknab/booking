export default function About() {
  return (
    <section id="about" className="py-24 bg-[#faf8f5]">
      <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-16 items-center">
        <div className="relative">
          <img
            src="https://images.pexels.com/photos/3997387/pexels-photo-3997387.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop"
            alt="Nail artist at work"
            className="w-full h-[480px] object-cover"
          />
          <div className="absolute -bottom-8 -right-8 w-48 h-48 hidden md:block">
            <img
              src="https://images.pexels.com/photos/1604847/pexels-photo-1604847.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&fit=crop"
              alt="Nail detail"
              className="w-full h-full object-cover border-4 border-white shadow-xl"
            />
          </div>
          <div className="absolute -top-6 -left-6 bg-[#b8936a] text-white p-6 hidden md:block">
            <p className="text-4xl font-light">10+</p>
            <p className="text-xs tracking-widest uppercase mt-1">Years of Excellence</p>
          </div>
        </div>

        <div className="md:pl-8">
          <p className="text-[#b8936a] tracking-[0.3em] uppercase text-xs font-light mb-4">
            About Us
          </p>
          <h2 className="text-4xl md:text-5xl font-extralight text-[#1a1a1a] leading-tight mb-6">
            Indulge in Luxury at<br />
            <span className="font-semibold">LuxeNails Spa</span>
          </h2>
          <p className="text-[#5a5a5a] font-light leading-relaxed mb-6 text-lg">
            Step into LuxeNails Spa, your go-to destination for luxury nail care and self-care. Our expert team is dedicated to enhancing your natural beauty with personalized treatments in a serene, upscale environment.
          </p>
          <p className="text-[#5a5a5a] font-light leading-relaxed mb-10">
            From rejuvenating spa pedicures to flawless nail art and expert extensions, every visit is designed to leave you feeling refreshed, radiant, and truly pampered. We use only premium, non-toxic products that protect and strengthen your natural nails while delivering stunning, long-lasting results.
          </p>
          <div className="flex flex-wrap gap-4">
            <a
              href="#booking"
              className="px-8 py-3.5 bg-[#b8936a] text-white tracking-widest uppercase text-sm font-light hover:bg-[#a07a54] transition-all duration-300"
            >
              Book Now
            </a>
            <a
              href="#services"
              className="px-8 py-3.5 border border-[#b8936a] text-[#b8936a] tracking-widest uppercase text-sm font-light hover:bg-[#b8936a] hover:text-white transition-all duration-300"
            >
              Our Services
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
