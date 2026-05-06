import { useState } from "react";
import { ChevronLeft, ChevronRight, Scissors, Calendar, Clock, DollarSign, User, Mail, Phone, ChevronDown } from "lucide-react";

export function Confirm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [showNotes, setShowNotes] = useState(false);

  const formatPhone = (val: string) => {
    const d = val.replace(/\D/g, "").slice(0, 10);
    if (d.length >= 6) return `(${d.slice(0,3)}) ${d.slice(3,6)}-${d.slice(6)}`;
    if (d.length >= 3) return `(${d.slice(0,3)}) ${d.slice(3)}`;
    return d;
  };

  const isReady = name.trim() && phone.replace(/\D/g, "").length === 10;

  return (
    <div className="min-h-screen bg-[#F5F6FA] flex flex-col font-sans" style={{fontFamily:"'Inter',sans-serif"}}>
      {/* Status bar */}
      <div className="bg-[#1A1F36] h-10 flex items-center justify-between px-6">
        <span className="text-white text-xs font-semibold">9:41</span>
        <div className="text-white text-xs font-semibold">●●●●  WiFi  100%</div>
      </div>

      {/* Header */}
      <div className="bg-[#1A1F36] pt-3 pb-5 px-5">
        <div className="flex items-center gap-3">
          <button className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center">
            <ChevronLeft className="w-5 h-5 text-white" />
          </button>
          <div className="flex-1">
            <h1 className="text-white text-lg font-bold">Confirm Booking</h1>
            <p className="text-white/60 text-xs">Review and finalize your appointment</p>
          </div>
          <div className="flex gap-1">
            {[1,2,3,4].map(i=>(
              <div key={i} className={`h-1.5 rounded-full transition-all ${i<=3?"w-6 bg-[#E8B86D]":"w-3 bg-white/20"}`}/>
            ))}
          </div>
        </div>
      </div>

      <div className="flex-1 px-4 py-4 overflow-y-auto space-y-3">

        {/* Booking Summary */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="bg-gradient-to-r from-[#1A1F36] to-[#2D3561] px-4 py-3 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#E8B86D] flex items-center justify-center">
              <Scissors className="w-4 h-4 text-[#1A1F36]" />
            </div>
            <div>
              <p className="text-white font-bold text-sm">Men's Haircut</p>
              <p className="text-white/60 text-xs">Classic Cuts Studio</p>
            </div>
          </div>
          <div className="p-4 space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-[#F5F6FA] flex items-center justify-center">
                <Calendar className="w-4 h-4 text-[#1A1F36]" />
              </div>
              <div>
                <p className="text-xs text-gray-400">Date</p>
                <p className="text-[#1A1F36] font-semibold text-sm">Thursday, May 8, 2025</p>
              </div>
            </div>
            <div className="h-px bg-gray-50" />
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-[#F5F6FA] flex items-center justify-center">
                <Clock className="w-4 h-4 text-[#1A1F36]" />
              </div>
              <div>
                <p className="text-xs text-gray-400">Time & Duration</p>
                <p className="text-[#1A1F36] font-semibold text-sm">2:30 PM · 45 min</p>
              </div>
            </div>
            <div className="h-px bg-gray-50" />
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-[#F5F6FA] flex items-center justify-center">
                <DollarSign className="w-4 h-4 text-[#1A1F36]" />
              </div>
              <div>
                <p className="text-xs text-gray-400">Total</p>
                <p className="text-[#1A1F36] font-bold text-sm">$35.00</p>
              </div>
            </div>
          </div>
        </div>

        {/* Your Details */}
        <div className="bg-white rounded-2xl shadow-sm p-4">
          <h3 className="text-[#1A1F36] font-bold text-sm mb-4">Your Details</h3>
          <div className="space-y-3">
            <div className="relative">
              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                className="w-full bg-[#F5F6FA] rounded-xl pl-10 pr-4 py-3.5 text-[#1A1F36] text-sm font-medium placeholder-gray-400 outline-none focus:ring-2 focus:ring-[#1A1F36]/20 transition-all"
                placeholder="Full name *"
                value={name}
                onChange={e => setName(e.target.value)}
              />
            </div>
            <div className="relative">
              <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                className="w-full bg-[#F5F6FA] rounded-xl pl-10 pr-4 py-3.5 text-[#1A1F36] text-sm font-medium placeholder-gray-400 outline-none focus:ring-2 focus:ring-[#1A1F36]/20 transition-all"
                placeholder="Phone number *"
                value={phone}
                onChange={e => setPhone(formatPhone(e.target.value))}
                type="tel"
              />
            </div>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                className="w-full bg-[#F5F6FA] rounded-xl pl-10 pr-4 py-3.5 text-[#1A1F36] text-sm font-medium placeholder-gray-400 outline-none focus:ring-2 focus:ring-[#1A1F36]/20 transition-all"
                placeholder="Email (optional)"
                value={email}
                onChange={e => setEmail(e.target.value)}
                type="email"
              />
            </div>

            <button
              onClick={() => setShowNotes(!showNotes)}
              className="flex items-center gap-2 text-gray-400 text-sm py-1"
            >
              <ChevronDown className={`w-4 h-4 transition-transform ${showNotes?"rotate-180":""}`} />
              Add a note for your stylist
            </button>
            {showNotes && (
              <textarea
                className="w-full bg-[#F5F6FA] rounded-xl px-4 py-3 text-[#1A1F36] text-sm placeholder-gray-400 outline-none focus:ring-2 focus:ring-[#1A1F36]/20 transition-all resize-none"
                rows={3}
                placeholder="Any special requests or notes..."
                value={notes}
                onChange={e => setNotes(e.target.value)}
              />
            )}
          </div>
        </div>

        {/* Cancellation Policy */}
        <div className="bg-[#FEF3E2] rounded-2xl p-4 border border-[#E8B86D]/30">
          <p className="text-[#92400E] text-xs font-semibold mb-1">Cancellation Policy</p>
          <p className="text-[#92400E]/80 text-xs leading-relaxed">
            Free cancellation up to 24 hours before your appointment. Late cancellations may be subject to a fee.
          </p>
        </div>
      </div>

      {/* Bottom CTA */}
      <div className="bg-white border-t border-gray-100 px-4 pt-3 pb-8 shadow-lg">
        <button
          className={`w-full font-semibold text-base py-4 rounded-2xl active:scale-95 transition-all flex items-center justify-center gap-2 ${
            isReady
              ? "bg-[#1A1F36] text-white shadow-lg shadow-[#1A1F36]/20"
              : "bg-gray-100 text-gray-400 cursor-not-allowed"
          }`}
        >
          Confirm Appointment
          {isReady && <ChevronRight className="w-5 h-5" />}
        </button>
        <p className="text-center text-gray-400 text-xs mt-2">You'll receive a confirmation SMS</p>
      </div>
    </div>
  );
}
