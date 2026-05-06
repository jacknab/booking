import { useState } from "react";
import { User, Users, ChevronRight, Scissors, Star, Clock, MapPin } from "lucide-react";

export function Welcome() {
  const [step, setStep] = useState<"choose" | "phone">("choose");
  const [phone, setPhone] = useState("");

  const formatPhone = (val: string) => {
    const digits = val.replace(/\D/g, "").slice(0, 10);
    if (digits.length >= 6) return `(${digits.slice(0,3)}) ${digits.slice(3,6)}-${digits.slice(6)}`;
    if (digits.length >= 3) return `(${digits.slice(0,3)}) ${digits.slice(3)}`;
    return digits;
  };

  return (
    <div className="min-h-screen bg-[#F5F6FA] flex flex-col font-sans" style={{fontFamily:"'Inter',sans-serif"}}>
      {/* Status bar placeholder */}
      <div className="bg-[#1A1F36] h-10 flex items-center justify-between px-6">
        <span className="text-white text-xs font-semibold">9:41</span>
        <div className="flex items-center gap-1.5">
          <div className="flex gap-0.5">
            {[1,2,3,4].map(i=><div key={i} className="w-1 rounded-sm bg-white" style={{height: 4+i*2}}/>)}
          </div>
          <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M1 9l2 2c4.97-4.97 13.03-4.97 18 0l2-2C16.93 2.93 7.08 2.93 1 9zm8 8l3 3 3-3a4.237 4.237 0 00-6 0zm-4-4l2 2a7.074 7.074 0 0110 0l2-2C15.14 9.14 8.87 9.14 5 13z"/></svg>
          <div className="text-white text-xs font-semibold">100%</div>
        </div>
      </div>

      {/* Hero Header */}
      <div className="bg-[#1A1F36] pt-4 pb-10 px-5 relative overflow-hidden">
        <div className="absolute right-0 top-0 w-48 h-48 rounded-full bg-white/5 -translate-y-1/2 translate-x-1/2" />
        <div className="absolute right-10 bottom-0 w-32 h-32 rounded-full bg-white/5 translate-y-1/2" />

        <div className="flex items-center gap-3 mb-5 relative">
          <div className="w-12 h-12 rounded-2xl bg-[#E8B86D] flex items-center justify-center shadow-lg">
            <Scissors className="w-6 h-6 text-[#1A1F36]" />
          </div>
          <div>
            <h1 className="text-white text-xl font-bold leading-tight">Classic Cuts Studio</h1>
            <div className="flex items-center gap-1.5 mt-0.5">
              <div className="flex">
                {[1,2,3,4,5].map(i=><Star key={i} className="w-3 h-3 text-[#E8B86D] fill-[#E8B86D]"/>)}
              </div>
              <span className="text-white/70 text-xs">4.9 · 312 reviews</span>
            </div>
          </div>
        </div>

        <div className="flex gap-4 text-white/70 text-xs relative">
          <div className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-[#E8B86D]"/>
            <span>Open until 8:00 PM</span>
          </div>
          <div className="flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5 text-[#E8B86D]"/>
            <span>0.3 mi away</span>
          </div>
        </div>
      </div>

      {/* Card that overlaps header */}
      <div className="mx-4 -mt-5 bg-white rounded-3xl shadow-xl p-5 flex-1 flex flex-col">
        {step === "choose" ? (
          <>
            <h2 className="text-[#1A1F36] text-xl font-bold mb-1">Book an appointment</h2>
            <p className="text-gray-500 text-sm mb-6">Select how you'd like to continue</p>

            <div className="space-y-3 flex-1">
              <button
                onClick={() => {}} 
                className="w-full flex items-center gap-4 p-5 rounded-2xl border-2 border-[#1A1F36] bg-[#1A1F36] text-white active:scale-95 transition-transform"
              >
                <div className="w-11 h-11 rounded-xl bg-white/15 flex items-center justify-center flex-shrink-0">
                  <User className="w-6 h-6 text-white" />
                </div>
                <div className="text-left flex-1">
                  <div className="font-semibold text-base">New Client</div>
                  <div className="text-white/70 text-sm mt-0.5">First time here? Welcome!</div>
                </div>
                <ChevronRight className="w-5 h-5 text-white/50" />
              </button>

              <button
                onClick={() => setStep("phone")}
                className="w-full flex items-center gap-4 p-5 rounded-2xl border-2 border-gray-100 bg-white text-[#1A1F36] hover:border-[#1A1F36]/20 active:scale-95 transition-transform"
              >
                <div className="w-11 h-11 rounded-xl bg-[#F5F6FA] flex items-center justify-center flex-shrink-0">
                  <Users className="w-6 h-6 text-[#1A1F36]" />
                </div>
                <div className="text-left flex-1">
                  <div className="font-semibold text-base text-[#1A1F36]">Returning Client</div>
                  <div className="text-gray-400 text-sm mt-0.5">Sign in with your phone</div>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-300" />
              </button>
            </div>

            <div className="mt-auto pt-8 text-center">
              <p className="text-gray-400 text-xs">By booking you agree to our <span className="text-[#1A1F36] font-medium underline underline-offset-2">Terms of Service</span></p>
            </div>
          </>
        ) : (
          <>
            <button onClick={() => setStep("choose")} className="flex items-center gap-1.5 text-gray-400 text-sm mb-6 -ml-1">
              <ChevronRight className="w-4 h-4 rotate-180" />
              Back
            </button>
            <h2 className="text-[#1A1F36] text-xl font-bold mb-1">Welcome back!</h2>
            <p className="text-gray-500 text-sm mb-8">Enter your phone number to continue</p>

            <div className="mb-2">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 block">Phone Number</label>
              <input
                className="w-full text-3xl font-bold text-center text-[#1A1F36] tracking-widest bg-[#F5F6FA] rounded-2xl py-5 border-2 border-transparent focus:border-[#1A1F36] outline-none transition-colors"
                placeholder="(555) 000-0000"
                value={phone}
                onChange={e => setPhone(formatPhone(e.target.value))}
              />
            </div>
            <p className="text-center text-gray-400 text-xs mb-8">We'll look up your booking history</p>

            <button className="w-full bg-[#1A1F36] text-white font-semibold text-base py-4 rounded-2xl active:scale-95 transition-transform shadow-lg shadow-[#1A1F36]/20">
              Continue
            </button>
          </>
        )}
      </div>

      <div className="h-8" />
    </div>
  );
}
