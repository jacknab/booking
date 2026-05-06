import { useState } from "react";
import { CheckCircle, Calendar, Clock, Scissors, MapPin, Share2, CalendarPlus, ChevronRight, Star } from "lucide-react";

export function Success() {
  const [rated, setRated] = useState(0);
  const [hovered, setHovered] = useState(0);

  return (
    <div className="min-h-screen bg-[#F5F6FA] flex flex-col font-sans" style={{fontFamily:"'Inter',sans-serif"}}>
      {/* Status bar */}
      <div className="bg-[#1A1F36] h-10 flex items-center justify-between px-6">
        <span className="text-white text-xs font-semibold">9:41</span>
        <div className="text-white text-xs font-semibold">●●●●  WiFi  100%</div>
      </div>

      {/* Success banner */}
      <div className="bg-[#1A1F36] relative overflow-hidden px-5 pt-6 pb-16">
        <div className="absolute inset-0 flex items-center justify-center opacity-5">
          <div className="w-80 h-80 rounded-full border-[40px] border-white" />
        </div>
        <div className="relative text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-[#22C55E]/15 mb-4 border-2 border-[#22C55E]/30">
            <CheckCircle className="w-10 h-10 text-[#22C55E]" strokeWidth={1.5} />
          </div>
          <h1 className="text-white text-2xl font-bold mb-1">You're booked!</h1>
          <p className="text-white/60 text-sm">Confirmation #4851</p>
        </div>
      </div>

      <div className="flex-1 px-4 -mt-8 pb-4 overflow-y-auto">

        {/* Appointment Card */}
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden mb-4">
          <div className="p-5">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-12 h-12 rounded-2xl bg-[#E8B86D] flex items-center justify-center">
                <Scissors className="w-6 h-6 text-[#1A1F36]" />
              </div>
              <div>
                <p className="text-[#1A1F36] font-bold text-base">Men's Haircut</p>
                <p className="text-gray-400 text-sm">Classic Cuts Studio</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-3 bg-[#F5F6FA] rounded-2xl p-3.5">
                <Calendar className="w-5 h-5 text-[#1A1F36]" />
                <div>
                  <p className="text-xs text-gray-400">Date</p>
                  <p className="text-[#1A1F36] font-semibold text-sm">Thursday, May 8, 2025</p>
                </div>
              </div>
              <div className="flex items-center gap-3 bg-[#F5F6FA] rounded-2xl p-3.5">
                <Clock className="w-5 h-5 text-[#1A1F36]" />
                <div>
                  <p className="text-xs text-gray-400">Time</p>
                  <p className="text-[#1A1F36] font-semibold text-sm">2:30 PM · 45 min</p>
                </div>
              </div>
              <div className="flex items-center gap-3 bg-[#F5F6FA] rounded-2xl p-3.5">
                <MapPin className="w-5 h-5 text-[#1A1F36]" />
                <div>
                  <p className="text-xs text-gray-400">Location</p>
                  <p className="text-[#1A1F36] font-semibold text-sm">123 Main St, Suite 4</p>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-dashed border-gray-100 mx-5" />

          {/* Barcode-style divider */}
          <div className="px-5 py-4">
            <div className="flex gap-px justify-between">
              {Array.from({length:40}).map((_,i)=>(
                <div key={i} className={`rounded-full bg-gray-200`} style={{width:i%3===0?3:2, height:i%5===0?28:18}} />
              ))}
            </div>
            <p className="text-center text-xs text-gray-300 mt-2 font-mono tracking-widest">48517623-0508</p>
          </div>
        </div>

        {/* Actions */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <button className="bg-white rounded-2xl shadow-sm p-4 flex flex-col items-center gap-2 active:scale-95 transition-transform">
            <CalendarPlus className="w-6 h-6 text-[#1A1F36]" />
            <span className="text-[#1A1F36] font-semibold text-xs">Add to Calendar</span>
          </button>
          <button className="bg-white rounded-2xl shadow-sm p-4 flex flex-col items-center gap-2 active:scale-95 transition-transform">
            <Share2 className="w-6 h-6 text-[#1A1F36]" />
            <span className="text-[#1A1F36] font-semibold text-xs">Share Details</span>
          </button>
        </div>

        {/* SMS notice */}
        <div className="bg-[#E8F4FD] rounded-2xl p-4 mb-4 border border-blue-100">
          <p className="text-[#1D4ED8] text-xs font-semibold mb-0.5">Confirmation Sent</p>
          <p className="text-[#1D4ED8]/70 text-xs leading-relaxed">
            A text message has been sent to (555) 123-4567 with your booking details and reminders.
          </p>
        </div>

        {/* Book another */}
        <button className="w-full bg-white rounded-2xl shadow-sm p-4 flex items-center gap-3 active:scale-95 transition-transform border border-gray-100">
          <div className="w-10 h-10 rounded-xl bg-[#1A1F36] flex items-center justify-center">
            <Scissors className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1 text-left">
            <p className="text-[#1A1F36] font-semibold text-sm">Book Another Appointment</p>
            <p className="text-gray-400 text-xs">Start a new booking</p>
          </div>
          <ChevronRight className="w-4 h-4 text-gray-300" />
        </button>
      </div>

      <div className="h-4" />
    </div>
  );
}
