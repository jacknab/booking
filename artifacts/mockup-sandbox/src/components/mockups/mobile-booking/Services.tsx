import { useState } from "react";
import { ChevronRight, ChevronLeft, Search, Scissors, Sparkles, Zap, Star, Clock, Check } from "lucide-react";

const categories = [
  { name: "Haircuts", icon: Scissors, count: 6, color: "#E8F4FD", iconColor: "#2563EB" },
  { name: "Styling", icon: Sparkles, count: 4, color: "#FEF3E2", iconColor: "#D97706" },
  { name: "Treatments", icon: Zap, count: 5, color: "#F0FDF4", iconColor: "#16A34A" },
  { name: "Shaving", icon: Scissors, count: 3, color: "#FFF1F2", iconColor: "#E11D48" },
];

const services = [
  { id: 1, name: "Men's Haircut", desc: "Cut, wash & style", duration: 45, price: 35, popular: true },
  { id: 2, name: "Fade & Taper", desc: "Precision fade with clippers", duration: 30, price: 40, popular: true },
  { id: 3, name: "Kids Haircut", desc: "For children 12 & under", duration: 30, price: 25, popular: false },
  { id: 4, name: "Senior Cut", desc: "For guests 65+", duration: 45, price: 28, popular: false },
  { id: 5, name: "Cut & Beard", desc: "Haircut plus beard trim", duration: 60, price: 55, popular: false },
  { id: 6, name: "Buzz Cut", desc: "All-over clipper cut", duration: 20, price: 22, popular: false },
];

export function Services() {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [search, setSearch] = useState("");

  const filteredServices = services.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#F5F6FA] flex flex-col font-sans" style={{fontFamily:"'Inter',sans-serif"}}>
      {/* Status bar */}
      <div className="bg-[#1A1F36] h-10 flex items-center justify-between px-6">
        <span className="text-white text-xs font-semibold">9:41</span>
        <div className="text-white text-xs font-semibold">●●●●  WiFi  100%</div>
      </div>

      {/* Header */}
      <div className="bg-[#1A1F36] pt-3 pb-5 px-5">
        <div className="flex items-center gap-3 mb-4">
          <button className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center">
            <ChevronLeft className="w-5 h-5 text-white" />
          </button>
          <div className="flex-1">
            <h1 className="text-white text-lg font-bold">Choose a Service</h1>
            <p className="text-white/60 text-xs">Classic Cuts Studio</p>
          </div>
          {/* Progress */}
          <div className="flex gap-1">
            {[1,2,3,4].map(i=>(
              <div key={i} className={`h-1.5 rounded-full transition-all ${i===1?"w-6 bg-[#E8B86D]":"w-3 bg-white/20"}`}/>
            ))}
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
          <input
            className="w-full bg-white/10 text-white placeholder-white/40 pl-10 pr-4 py-3 rounded-xl text-sm outline-none focus:bg-white/15 transition-colors"
            placeholder="Search services..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="flex-1 px-4 py-4 overflow-y-auto">
        {!activeCategory && !search ? (
          <>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Categories</p>
            <div className="grid grid-cols-2 gap-3 mb-5">
              {categories.map(cat => {
                const Icon = cat.icon;
                return (
                  <button
                    key={cat.name}
                    onClick={() => setActiveCategory(cat.name)}
                    className="bg-white rounded-2xl p-4 shadow-sm flex flex-col gap-3 active:scale-95 transition-transform text-left"
                  >
                    <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{background: cat.color}}>
                      <Icon className="w-6 h-6" style={{color: cat.iconColor}} />
                    </div>
                    <div>
                      <div className="font-semibold text-[#1A1F36] text-sm">{cat.name}</div>
                      <div className="text-gray-400 text-xs">{cat.count} services</div>
                    </div>
                  </button>
                );
              })}
            </div>

            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Popular</p>
            <div className="space-y-2.5">
              {services.filter(s=>s.popular).map(service => (
                <button
                  key={service.id}
                  onClick={() => setSelectedId(service.id === selectedId ? null : service.id)}
                  className={`w-full bg-white rounded-2xl p-4 shadow-sm flex items-center gap-3 active:scale-95 transition-all text-left border-2 ${selectedId===service.id?"border-[#1A1F36]":"border-transparent"}`}
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-[#1A1F36] text-sm">{service.name}</span>
                      <span className="bg-[#E8B86D]/20 text-[#D97706] text-xs font-semibold px-2 py-0.5 rounded-full">Popular</span>
                    </div>
                    <div className="text-gray-400 text-xs mt-0.5">{service.desc}</div>
                    <div className="flex items-center gap-3 mt-2">
                      <div className="flex items-center gap-1 text-gray-400 text-xs">
                        <Clock className="w-3 h-3" />
                        <span>{service.duration} min</span>
                      </div>
                      <span className="font-bold text-[#1A1F36] text-sm">${service.price}</span>
                    </div>
                  </div>
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${selectedId===service.id?"border-[#1A1F36] bg-[#1A1F36]":"border-gray-200"}`}>
                    {selectedId===service.id && <Check className="w-3.5 h-3.5 text-white"/>}
                  </div>
                </button>
              ))}
            </div>
          </>
        ) : (
          <>
            <button
              onClick={() => { setActiveCategory(null); setSearch(""); }}
              className="flex items-center gap-1.5 text-gray-400 text-sm mb-4 -ml-1"
            >
              <ChevronLeft className="w-4 h-4" />
              {activeCategory || "All Services"}
            </button>
            <div className="space-y-2.5">
              {filteredServices.map(service => (
                <button
                  key={service.id}
                  onClick={() => setSelectedId(service.id === selectedId ? null : service.id)}
                  className={`w-full bg-white rounded-2xl p-4 shadow-sm flex items-center gap-3 active:scale-95 transition-all text-left border-2 ${selectedId===service.id?"border-[#1A1F36]":"border-transparent"}`}
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-[#1A1F36] text-sm">{service.name}</span>
                      {service.popular && <span className="bg-[#E8B86D]/20 text-[#D97706] text-xs font-semibold px-2 py-0.5 rounded-full">Popular</span>}
                    </div>
                    <div className="text-gray-400 text-xs mt-0.5">{service.desc}</div>
                    <div className="flex items-center gap-3 mt-2">
                      <div className="flex items-center gap-1 text-gray-400 text-xs">
                        <Clock className="w-3 h-3" />
                        <span>{service.duration} min</span>
                      </div>
                      <span className="font-bold text-[#1A1F36] text-sm">${service.price}</span>
                    </div>
                  </div>
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${selectedId===service.id?"border-[#1A1F36] bg-[#1A1F36]":"border-gray-200"}`}>
                    {selectedId===service.id && <Check className="w-3.5 h-3.5 text-white"/>}
                  </div>
                </button>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Bottom CTA */}
      <div className="bg-white border-t border-gray-100 px-4 pt-3 pb-8 shadow-lg">
        {selectedId ? (
          <button className="w-full bg-[#1A1F36] text-white font-semibold text-base py-4 rounded-2xl active:scale-95 transition-transform shadow-lg shadow-[#1A1F36]/20 flex items-center justify-center gap-2">
            Continue
            <ChevronRight className="w-5 h-5" />
          </button>
        ) : (
          <button className="w-full bg-gray-100 text-gray-400 font-semibold text-base py-4 rounded-2xl cursor-not-allowed">
            Select a service to continue
          </button>
        )}
      </div>
    </div>
  );
}
