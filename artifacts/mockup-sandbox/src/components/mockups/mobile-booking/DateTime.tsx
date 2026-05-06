import { useState } from "react";
import { ChevronLeft, ChevronRight, Clock, User } from "lucide-react";

const DAYS = ["Su","Mo","Tu","We","Th","Fr","Sa"];
const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];

const morningSlots = ["8:00 AM","8:30 AM","9:00 AM","9:30 AM","10:00 AM","10:30 AM"];
const afternoonSlots = ["12:00 PM","12:30 PM","1:00 PM","1:30 PM","2:00 PM","2:30 PM","3:00 PM","3:30 PM","4:00 PM"];
const eveningSlots = ["5:00 PM","5:30 PM","6:00 PM","6:30 PM","7:00 PM"];
const unavailable = new Set(["8:30 AM","10:00 AM","1:00 PM","3:00 PM","5:00 PM","6:30 PM"]);

function buildWeek(anchor: Date) {
  return Array.from({length:7},(_,i)=>{
    const d = new Date(anchor);
    d.setDate(anchor.getDate() - anchor.getDay() + i);
    return d;
  });
}

const today = new Date();
today.setHours(0,0,0,0);

export function DateTime() {
  const [selectedDate, setSelectedDate] = useState<Date>(today);
  const [weekAnchor, setWeekAnchor] = useState<Date>(today);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);

  const week = buildWeek(weekAnchor);

  const prevWeek = () => {
    const d = new Date(weekAnchor);
    d.setDate(d.getDate() - 7);
    setWeekAnchor(d);
  };

  const nextWeek = () => {
    const d = new Date(weekAnchor);
    d.setDate(d.getDate() + 7);
    setWeekAnchor(d);
  };

  const isPast = (d: Date) => d < today;

  const SlotGrid = ({ label, slots }: { label: string; slots: string[] }) => (
    <div className="mb-4">
      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2.5">{label}</p>
      <div className="grid grid-cols-3 gap-2">
        {slots.map(slot => {
          const isUnavail = unavailable.has(slot);
          const isSelected = selectedSlot === slot;
          return (
            <button
              key={slot}
              disabled={isUnavail}
              onClick={() => setSelectedSlot(slot)}
              className={`py-3 rounded-xl text-sm font-medium transition-all active:scale-95 ${
                isUnavail
                  ? "bg-gray-50 text-gray-300 cursor-not-allowed"
                  : isSelected
                  ? "bg-[#1A1F36] text-white shadow-md shadow-[#1A1F36]/25"
                  : "bg-white text-[#1A1F36] border border-gray-100 hover:border-[#1A1F36]/30"
              }`}
            >
              {slot}
            </button>
          );
        })}
      </div>
    </div>
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
            <h1 className="text-white text-lg font-bold">Pick a Date & Time</h1>
            <p className="text-white/60 text-xs">Men's Haircut · 45 min · $35</p>
          </div>
          <div className="flex gap-1">
            {[1,2,3,4].map(i=>(
              <div key={i} className={`h-1.5 rounded-full transition-all ${i<=2?"w-6 bg-[#E8B86D]":"w-3 bg-white/20"}`}/>
            ))}
          </div>
        </div>

        {/* Week navigation */}
        <div className="flex items-center justify-between mb-3">
          <button onClick={prevWeek} className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
            <ChevronLeft className="w-4 h-4 text-white" />
          </button>
          <span className="text-white font-semibold text-sm">
            {MONTHS[selectedDate.getMonth()]} {selectedDate.getFullYear()}
          </span>
          <button onClick={nextWeek} className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
            <ChevronRight className="w-4 h-4 text-white" />
          </button>
        </div>

        {/* Day strip */}
        <div className="flex gap-1.5">
          {week.map((d, i) => {
            const isToday = d.getTime() === today.getTime();
            const isSelected = d.getTime() === selectedDate.getTime();
            const past = isPast(d);
            return (
              <button
                key={i}
                disabled={past}
                onClick={() => setSelectedDate(d)}
                className={`flex-1 flex flex-col items-center py-2.5 rounded-2xl transition-all active:scale-95 ${
                  isSelected
                    ? "bg-[#E8B86D]"
                    : isToday
                    ? "bg-white/15"
                    : past
                    ? "opacity-30"
                    : "bg-white/5 hover:bg-white/10"
                }`}
              >
                <span className={`text-[10px] font-medium mb-1 ${isSelected?"text-[#1A1F36]":"text-white/60"}`}>{DAYS[d.getDay()]}</span>
                <span className={`text-base font-bold ${isSelected?"text-[#1A1F36]":"text-white"}`}>{d.getDate()}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Staff picker */}
      <div className="px-4 py-4">
        <div className="bg-white rounded-2xl p-3.5 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#F5F6FA] flex items-center justify-center">
            <User className="w-5 h-5 text-[#1A1F36]" />
          </div>
          <div className="flex-1">
            <p className="text-[#1A1F36] font-semibold text-sm">Any Available Stylist</p>
            <p className="text-gray-400 text-xs">Tap to choose a specific stylist</p>
          </div>
          <ChevronRight className="w-4 h-4 text-gray-300" />
        </div>
      </div>

      {/* Time slots */}
      <div className="flex-1 px-4 overflow-y-auto">
        <SlotGrid label="Morning" slots={morningSlots} />
        <SlotGrid label="Afternoon" slots={afternoonSlots} />
        <SlotGrid label="Evening" slots={eveningSlots} />
      </div>

      {/* Bottom CTA */}
      <div className="bg-white border-t border-gray-100 px-4 pt-3 pb-8 shadow-lg">
        {selectedSlot ? (
          <div className="flex items-center gap-3">
            <div className="flex-1 bg-[#F5F6FA] rounded-xl px-4 py-3">
              <p className="text-xs text-gray-400">Selected</p>
              <p className="text-[#1A1F36] font-bold text-sm">
                {MONTHS[selectedDate.getMonth()].slice(0,3)} {selectedDate.getDate()} at {selectedSlot}
              </p>
            </div>
            <button className="bg-[#1A1F36] text-white font-semibold text-sm px-6 py-4 rounded-2xl active:scale-95 transition-transform shadow-lg shadow-[#1A1F36]/20">
              Next
              <ChevronRight className="w-4 h-4 inline ml-1" />
            </button>
          </div>
        ) : (
          <button className="w-full bg-gray-100 text-gray-400 font-semibold text-base py-4 rounded-2xl cursor-not-allowed">
            Pick a time to continue
          </button>
        )}
      </div>
    </div>
  );
}
