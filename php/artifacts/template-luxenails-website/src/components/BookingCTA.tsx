import { useState } from 'react';

export default function BookingCTA() {
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', service: '', date: '', message: '' });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  const services = [
    'Classic Manicure',
    'Gel Manicure',
    'Luxury Spa Manicure',
    'Classic Pedicure',
    'Luxury Spa Pedicure',
    'Gel Extensions (Gel X)',
    'Builder Gel',
    'Acrylic Full Set',
    'Dip Powder',
    'Nail Art',
    'Nail Repair',
  ];

  return (
    <section id="booking" className="relative py-24 overflow-hidden">
      <div className="absolute inset-0">
        <img
          src="https://images.pexels.com/photos/3738369/pexels-photo-3738369.jpeg?auto=compress&cs=tinysrgb&w=1920&h=900&fit=crop"
          alt="Nail salon booking"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-[#1a1612]/85" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-16 items-center">
        <div>
          <p className="text-[#e8c99a] tracking-[0.3em] uppercase text-xs font-light mb-4">
            Reserve Your Spot
          </p>
          <h2 className="text-4xl md:text-5xl font-extralight text-white leading-tight mb-6">
            Book Your<br />
            <span className="font-semibold italic text-[#e8c99a]">Appointment Today</span>
          </h2>
          <p className="text-white/60 font-light text-lg leading-relaxed mb-8">
            Indulge in our curated selection of premium beverages while we perfect your nails. From soothing teas and artisan coffee to fine wines and signature cocktails.
          </p>
          <div className="space-y-4">
            {['Personalized nail consultation', 'Premium non-toxic products', 'Complimentary beverage service', 'Serene, luxury environment'].map((item) => (
              <div key={item} className="flex items-center gap-3">
                <div className="w-1.5 h-1.5 bg-[#b8936a] rounded-full shrink-0" />
                <p className="text-white/70 font-light text-sm">{item}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-10">
          {submitted ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-[#b8936a]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <div className="w-8 h-8 bg-[#b8936a] rounded-full" />
              </div>
              <h3 className="text-2xl font-light text-[#1a1a1a] mb-3">Request Received</h3>
              <p className="text-[#5a5a5a] font-light text-sm leading-relaxed">
                Thank you, {form.name}! We will confirm your appointment via email within 24 hours. We look forward to pampering you.
              </p>
            </div>
          ) : (
            <>
              <h3 className="text-2xl font-light text-[#1a1a1a] mb-6 tracking-wide">
                Request an Appointment
              </h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs tracking-widest uppercase text-[#7a7a7a] font-light block mb-1.5">
                      Full Name
                    </label>
                    <input
                      type="text"
                      required
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      className="w-full border border-gray-200 px-4 py-3 text-sm text-[#1a1a1a] font-light focus:outline-none focus:border-[#b8936a] transition-colors"
                      placeholder="Jane Smith"
                    />
                  </div>
                  <div>
                    <label className="text-xs tracking-widest uppercase text-[#7a7a7a] font-light block mb-1.5">
                      Email
                    </label>
                    <input
                      type="email"
                      required
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      className="w-full border border-gray-200 px-4 py-3 text-sm text-[#1a1a1a] font-light focus:outline-none focus:border-[#b8936a] transition-colors"
                      placeholder="jane@email.com"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-xs tracking-widest uppercase text-[#7a7a7a] font-light block mb-1.5">
                    Service
                  </label>
                  <select
                    required
                    value={form.service}
                    onChange={(e) => setForm({ ...form, service: e.target.value })}
                    className="w-full border border-gray-200 px-4 py-3 text-sm text-[#1a1a1a] font-light focus:outline-none focus:border-[#b8936a] transition-colors bg-white"
                  >
                    <option value="">Select a service...</option>
                    {services.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs tracking-widest uppercase text-[#7a7a7a] font-light block mb-1.5">
                    Preferred Date
                  </label>
                  <input
                    type="date"
                    required
                    value={form.date}
                    onChange={(e) => setForm({ ...form, date: e.target.value })}
                    className="w-full border border-gray-200 px-4 py-3 text-sm text-[#1a1a1a] font-light focus:outline-none focus:border-[#b8936a] transition-colors"
                  />
                </div>
                <div>
                  <label className="text-xs tracking-widest uppercase text-[#7a7a7a] font-light block mb-1.5">
                    Notes (optional)
                  </label>
                  <textarea
                    rows={3}
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    className="w-full border border-gray-200 px-4 py-3 text-sm text-[#1a1a1a] font-light focus:outline-none focus:border-[#b8936a] transition-colors resize-none"
                    placeholder="Any special requests or nail inspiration..."
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-4 bg-[#b8936a] text-white tracking-widest uppercase text-sm font-light hover:bg-[#a07a54] transition-all duration-300 hover:scale-[1.01]"
                >
                  Request Appointment
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
