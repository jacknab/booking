import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Check } from "lucide-react";
import { motion } from "framer-motion";

const staffOptions = [
  { label: "Just Me", count: 1 },
  { label: "2", count: 2 },
  { label: "3", count: 3 },
  { label: "4", count: 4 },
  { label: "5", count: 5 },
  { label: "6", count: 6 },
  { label: "7+", count: 7 },
];

const BASE_PRICE = 23.99;
const BASE_ORIGINAL = 30.0;
const PER_STAFF = 5;
const PER_STAFF_ORIGINAL = 7;

const comparisonFeatures = [
  { category: "The Essentials", label: "" },
  { label: "Free Online Booking Platform" },
  { label: "No Contract, Cancel Anytime" },
  { label: "No Setup Costs" },
  { label: "Live Chat Support 24/7" },
  { label: "SMS Notifications Available" },
  { category: "No-Show & Cancellation Protection", label: "" },
  { label: "SMS Notifications" },
  { label: "In-App & Email Notifications" },
  { label: "Ability to Block Clients from Online Booking" },
  { category: "Client Excellence", label: "" },
  { label: "Stay Open 24/7 with Online Booking" },
  { label: "Embed Booking Page on Your Website" },
  { category: "Business Management", label: "" },
  { label: "Multi-Store Management" },
  { label: "Timezone-Aware Calendar" },
  { label: "POS Checkout with Split Tender" },
  { label: "Cash Drawer & Z Report" },
  { label: "Thermal Receipt Printing" },
  { label: "Services & Add-Ons Management" },
  { label: "Staff Availability & Scheduling" },
  { category: "Growth & Analytics", label: "" },
  { label: "Dashboard Analytics" },
  { label: "Commission Tracking & Payouts" },
  { label: "Product Inventory Management" },
  { label: "Advanced Business Reporting" },
  { label: "Google Review Booster" },
  { label: "Marketing SMS Campaigns" },
];

export default function Pricing() {
  const [locationType, setLocationType] = useState<"one" | "multiple">("one");
  const [staffIndex, setStaffIndex] = useState(0);

  useEffect(() => {
    const link = document.createElement("link");
    link.href = "https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap";
    link.rel = "stylesheet";
    document.head.appendChild(link);
    return () => { document.head.removeChild(link); };
  }, []);

  const staff = staffOptions[staffIndex];
  const extraStaff = Math.max(0, staff.count - 1);
  const locationBonus = locationType === "multiple" ? 15 : 0;
  const displayPrice = (BASE_PRICE + extraStaff * PER_STAFF + locationBonus).toFixed(2);
  const displayOriginal = (BASE_ORIGINAL + extraStaff * PER_STAFF_ORIGINAL + locationBonus).toFixed(2);

  return (
    <div className="min-h-screen bg-[#060E1A] text-white flex flex-col" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      <nav className="fixed w-full z-50 bg-[#060E1A]/80 backdrop-blur-md border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-20 items-center">
            <Link to="/" className="flex items-center gap-3">
              <img src="/web-app.png" alt="Certxa" className="w-10 h-10 rounded-xl shadow-lg" />
              <span className="font-bold text-2xl tracking-tight text-white">Certxa</span>
            </Link>
            <div className="flex items-center gap-6">
              <Link to="/pricing">
                <Button variant="ghost" className="font-bold text-base text-white/90 hover:text-white hover:bg-white/10">Pricing</Button>
              </Link>
              <Link to="/auth">
                <Button variant="ghost" className="font-bold text-base text-white/90 hover:text-white hover:bg-white/10">Log in</Button>
              </Link>
              <Link to="/auth">
                <Button className="bg-[#00D4AA] hover:bg-[#00D4AA]/90 text-[#0A2540] font-bold px-6 rounded-full">
                  Get Started
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="flex-1 flex flex-col items-center pt-36 pb-20 px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-2xl text-center"
        >
          <h1 className="text-4xl md:text-5xl font-black text-white mb-12">
            Pricing that Fits Your Business
          </h1>

          <div className="inline-flex items-center bg-white/10 rounded-full p-1 mb-10 border border-white/10">
            <button
              onClick={() => setLocationType("one")}
              className={`px-6 py-2 rounded-full text-sm font-semibold transition-all ${
                locationType === "one"
                  ? "bg-white text-[#060E1A] shadow"
                  : "text-white/60 hover:text-white"
              }`}
            >
              One Location
            </button>
            <button
              onClick={() => setLocationType("multiple")}
              className={`px-6 py-2 rounded-full text-sm font-semibold transition-all ${
                locationType === "multiple"
                  ? "bg-white text-[#060E1A] shadow"
                  : "text-white/60 hover:text-white"
              }`}
            >
              Multiple Locations
            </button>
          </div>

          <div className="bg-[#0D1B2E] border border-white/10 rounded-2xl p-8 shadow-[0_0_40px_rgba(0,212,170,0.06)]">
            <p className="text-white/60 font-medium mb-4">Here's what you'll pay:</p>

            <div className="mb-1">
              <span className="text-[#f87171] line-through text-lg font-medium">
                ${displayOriginal}
              </span>
            </div>
            <div className="flex items-baseline justify-center gap-1 mb-1">
              <span className="text-white text-2xl font-bold">$</span>
              <span className="text-white text-6xl font-black">{displayPrice.split(".")[0]}</span>
              <span className="text-white text-2xl font-bold">.{displayPrice.split(".")[1]}</span>
              <span className="text-white/50 text-base ml-1">/ month</span>
            </div>

            <p className="text-[#00D4AA] text-sm mb-1">
              {staff.count === 1 ? "1 bookable calendar" : `${staff.count} bookable calendars`}
            </p>
            <p className="text-white/40 text-xs mb-6">Exclusive offer!</p>

            <div className="flex flex-wrap justify-center gap-2 mb-6">
              {staffOptions.map((opt, i) => (
                <button
                  key={opt.label}
                  onClick={() => setStaffIndex(i)}
                  className={`px-4 py-1.5 rounded-full text-sm font-semibold border transition-all ${
                    staffIndex === i
                      ? "bg-[#1a2a40] border-[#00D4AA] text-white"
                      : "border-white/15 text-white/50 hover:border-white/30 hover:text-white/80"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>

            <p className="text-white/40 text-xs mb-1">*Cancel anytime with no cancellation fees</p>
            <p className="text-white/30 text-xs mb-6">Exclusions apply</p>

            <Link to="/auth">
              <Button
                size="lg"
                className="w-full bg-[#00D4AA] hover:bg-[#00D4AA]/90 text-[#0A2540] font-bold rounded-xl h-12 text-base shadow-[0_0_20px_rgba(0,212,170,0.25)] transition-all hover:scale-[1.02]"
              >
                Start Free Trial
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>

            <Link to="/auth" className="block mt-3 text-[#00D4AA] text-sm font-medium hover:underline">
              Contact Sales ›
            </Link>
          </div>

          <p className="text-white/50 text-lg font-semibold mt-12 leading-relaxed">
            Simplicity Meets Functionality. Our Features Make<br className="hidden sm:block" /> Your Life Easier.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="w-full max-w-2xl mt-16"
        >
          <div className="bg-white/5 border border-white/10 rounded-2xl p-8">
            <h2 className="text-2xl font-bold text-white text-center mb-8">Everything Included</h2>
            <div className="space-y-0">
              {comparisonFeatures.map((row, idx) => {
                if (row.category) {
                  return (
                    <div key={`cat-${idx}`} className="pt-6 pb-2">
                      <p className="text-white/60 text-xs font-bold uppercase tracking-widest">{row.category}</p>
                    </div>
                  );
                }
                return (
                  <div key={`feat-${idx}`} className="flex items-center gap-3 py-2.5 border-b border-white/5 last:border-b-0">
                    <div className="w-5 h-5 rounded-full bg-[#00D4AA]/15 flex items-center justify-center flex-shrink-0">
                      <Check className="w-3 h-3 text-[#00D4AA]" />
                    </div>
                    <span className="text-white/70 text-sm">{row.label}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </motion.div>
      </div>

      <footer className="bg-[#060E1A] py-12 border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-3">
              <img src="/web-app.png" alt="Certxa" className="w-10 h-10 rounded-xl grayscale opacity-70" />
              <span className="font-bold text-2xl text-white/80 tracking-tight">Certxa</span>
            </div>
            <p className="text-white text-sm font-medium">© 2025 Certxa. All rights reserved.</p>
          </div>
          <div className="mt-8 pt-8 border-t border-white/10 flex flex-wrap items-center justify-center md:justify-end gap-8">
            <Link to="/privacy-policy" className="text-sm text-white font-medium hover:text-[#00D4AA] transition-colors">Privacy Policy</Link>
            <Link to="/terms-of-service" className="text-sm text-white font-medium hover:text-[#00D4AA] transition-colors">Terms of Service</Link>
            <Link to="/staff-auth" className="text-sm text-white font-medium hover:text-[#00D4AA] transition-colors">Staff Login</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
