import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Check, Minus, Plus } from "lucide-react";
import { motion } from "framer-motion";

const START_BASE = 20;
const START_PER_STAFF = 3;
const PRO_BASE = 30;
const PRO_PER_STAFF = 5;

const startFeatures = [
  "Online Calendar",
  "Appointment Reminders",
  "Online Booking",
  "Staff & Client Management",
  "Up to 10 products in stock",
];

const proFeatures = [
  "Business Reporting",
  "Stock Management",
  "Google Review Booster",
  "Marketing SMS",
  "Commission Tracking",
];

interface FeatureRow {
  label: string;
  category?: string;
  start: boolean;
  pro: boolean;
}

const comparisonFeatures: FeatureRow[] = [
  { category: "The Essentials", label: "", start: false, pro: false },
  { label: "Free Online Booking Platform", start: true, pro: true },
  { label: "No Contract, Cancel Anytime", start: true, pro: true },
  { label: "No Setup Costs", start: true, pro: true },
  { label: "Live Chat Support 24/7", start: true, pro: true },
  { label: "SMS Notifications Available", start: true, pro: true },

  { category: "No-Show & Cancellation Protection", label: "", start: false, pro: false },
  { label: "SMS Notifications", start: true, pro: true },
  { label: "In-App & Email Notifications", start: true, pro: true },
  { label: "Ability to Block Clients from Online Booking", start: false, pro: true },

  { category: "Client Excellence", label: "", start: false, pro: false },
  { label: "Stay Open 24/7 with Online Booking", start: true, pro: true },
  { label: "Embed Booking Page on Your Website", start: true, pro: true },

  { category: "Business Management", label: "", start: false, pro: false },
  { label: "Multi-Store Management", start: true, pro: true },
  { label: "Timezone-Aware Calendar", start: true, pro: true },
  { label: "POS Checkout with Split Tender", start: true, pro: true },
  { label: "Cash Drawer & Z Report", start: true, pro: true },
  { label: "Thermal Receipt Printing", start: true, pro: true },
  { label: "Services & Add-Ons Management", start: true, pro: true },
  { label: "Staff Availability & Scheduling", start: true, pro: true },

  { category: "Growth & Analytics", label: "", start: false, pro: false },
  { label: "Dashboard Analytics", start: true, pro: true },
  { label: "Commission Tracking & Payouts", start: false, pro: true },
  { label: "Product Inventory Management", start: true, pro: true },
  { label: "Advanced Business Reporting", start: false, pro: true },
  { label: "Google Review Booster", start: false, pro: true },
  { label: "Marketing SMS Campaigns", start: false, pro: true },
];

export default function Pricing() {
  const [staffCount, setStaffCount] = useState(1);

  useEffect(() => {
    const link = document.createElement("link");
    link.href = "https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap";
    link.rel = "stylesheet";
    document.head.appendChild(link);
    return () => { document.head.removeChild(link); };
  }, []);

  const startTotal = START_BASE + Math.max(0, staffCount - 1) * START_PER_STAFF;
  const proTotal = PRO_BASE + Math.max(0, staffCount - 1) * PRO_PER_STAFF;
  const additionalStaff = Math.max(0, staffCount - 1);

  return (
    <div className="min-h-screen bg-[#060E1A] text-white flex flex-col" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      <nav className="fixed w-full z-50 bg-[#060E1A]/80 backdrop-blur-md border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-20 items-center">
            <Link to="/" className="flex items-center gap-3" data-testid="link-home">
              <img src="/web-app.png" alt="Certxa" className="w-10 h-10 rounded-xl shadow-lg" />
              <span className="font-bold text-2xl tracking-tight text-white">Certxa</span>
            </Link>
            <div className="flex items-center gap-6">
              <Link to="/pricing">
                <Button variant="ghost" className="font-medium text-white/90 hover:text-white hover:bg-white/10" data-testid="link-pricing">Pricing</Button>
              </Link>
              <Link to="/auth">
                <Button variant="ghost" className="font-medium text-white/90 hover:text-white hover:bg-white/10" data-testid="link-login">Log in</Button>
              </Link>
              <Link to="/auth">
                <Button className="bg-[#00D4AA] hover:bg-[#00D4AA]/90 text-[#0A2540] font-bold px-6 rounded-full" data-testid="link-get-started">
                  Get Started
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="flex-1 pt-32 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20 backdrop-blur-md mb-6">
              <span className="flex h-2 w-2 rounded-full bg-[#00D4AA] animate-pulse"></span>
              <span className="text-sm font-medium text-white/90">Simple, transparent pricing</span>
            </div>
            <h1 className="text-5xl md:text-6xl font-black text-white mb-4 tracking-tight">
              Plans that grow<br />with your business
            </h1>
            <p className="text-lg text-white/60 max-w-2xl mx-auto font-light">
              Start with one user included. Add more staff as your business grows. No hidden fees, no contracts.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="flex flex-col items-center mb-12"
          >
            <p className="text-sm font-medium text-white/50 mb-3">Choose bookable staff</p>
            <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-full px-2 py-1">
              <button
                onClick={() => setStaffCount(Math.max(1, staffCount - 1))}
                disabled={staffCount <= 1}
                className="w-9 h-9 rounded-full flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                data-testid="button-staff-minus"
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="w-10 text-center text-2xl font-bold text-white" data-testid="text-staff-count">
                {staffCount}
              </span>
              <button
                onClick={() => setStaffCount(staffCount + 1)}
                className="w-9 h-9 rounded-full flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10 transition-all"
                data-testid="button-staff-plus"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto mb-24">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <div className="relative bg-white/5 border border-white/10 rounded-3xl p-6 pt-8 overflow-visible h-full flex flex-col" data-testid="card-plan-start">
                <div className="absolute -top-3 left-6">
                  <span className="inline-block bg-white/20 text-white text-xs font-bold uppercase px-3 py-1 rounded-full backdrop-blur-sm">
                    Start
                  </span>
                </div>
                <div className="text-center mb-6">
                  <div className="flex items-baseline justify-center gap-1 mb-1">
                    <span className="text-lg text-white/40">$</span>
                    <span className="text-5xl font-black text-white" data-testid="text-start-price">{startTotal}</span>
                  </div>
                  <p className="text-white/40 text-sm">per month</p>
                </div>

                <div className="space-y-3 mb-6 text-sm">
                  <div className="flex items-center justify-between text-white/60">
                    <span>1st staff</span>
                    <span className="text-white font-medium">1 x ${START_BASE}</span>
                  </div>
                  <div className="flex items-center justify-between text-white/60">
                    <span>Additional staff</span>
                    <span className="text-white font-medium">{additionalStaff} x ${START_PER_STAFF}</span>
                  </div>
                  <div className="border-t border-white/10 pt-3">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white">Total ${startTotal} / month</span>
                    </div>
                    <p className="text-xs text-white/40 mt-1">Billed monthly</p>
                  </div>
                </div>

                <div className="border-t border-white/10 pt-4 mb-6 flex-1">
                  <div className="flex items-center justify-between text-sm mb-4">
                    <span className="text-white/50">SMS Pricing From</span>
                    <span className="font-medium text-white">$0.02</span>
                  </div>
                  <div className="space-y-2.5">
                    {startFeatures.map((feature) => (
                      <div key={feature} className="flex items-center gap-2 text-sm text-white/70">
                        <Check className="w-4 h-4 text-[#00D4AA] flex-shrink-0" />
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <Link to="/auth">
                  <Button className="w-full bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-full" data-testid="button-start-plan">
                    Get Started
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <div className="relative bg-[#00D4AA]/10 border border-[#00D4AA]/30 rounded-3xl p-6 pt-8 overflow-visible h-full flex flex-col" data-testid="card-plan-pro">
                <div className="absolute -top-3 left-6">
                  <span className="inline-block bg-[#00D4AA] text-[#0A2540] text-xs font-bold uppercase px-3 py-1 rounded-full">
                    Pro
                  </span>
                </div>
                <div className="absolute -top-3 right-6">
                  <span className="inline-block bg-[#00D4AA]/20 text-[#00D4AA] text-xs font-bold px-3 py-1 rounded-full border border-[#00D4AA]/30">
                    Free Trial
                  </span>
                </div>
                <div className="text-center mb-6">
                  <div className="flex items-baseline justify-center gap-1 mb-1">
                    <span className="text-lg text-white/40">$</span>
                    <span className="text-5xl font-black text-white" data-testid="text-pro-price">{proTotal}</span>
                  </div>
                  <p className="text-white/40 text-sm">per month</p>
                </div>

                <div className="space-y-3 mb-6 text-sm">
                  <div className="flex items-center justify-between text-white/60">
                    <span>1st staff</span>
                    <span className="text-white font-medium">1 x ${PRO_BASE}</span>
                  </div>
                  <div className="flex items-center justify-between text-white/60">
                    <span>Additional staff</span>
                    <span className="text-white font-medium">{additionalStaff} x ${PRO_PER_STAFF}</span>
                  </div>
                  <div className="border-t border-white/10 pt-3">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white">Total ${proTotal} / month</span>
                    </div>
                    <p className="text-xs text-white/40 mt-1">Billed monthly</p>
                  </div>
                </div>

                <div className="border-t border-white/10 pt-4 mb-6 flex-1">
                  <div className="flex items-center justify-between text-sm mb-4">
                    <span className="text-white/50">SMS Pricing From</span>
                    <span className="font-medium text-white">$0.02</span>
                  </div>
                  <div className="space-y-2.5">
                    {proFeatures.map((feature) => (
                      <div key={feature} className="flex items-center gap-2 text-sm text-white/70">
                        <Check className="w-4 h-4 text-[#00D4AA] flex-shrink-0" />
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <Link to="/auth">
                  <Button className="w-full bg-[#00D4AA] hover:bg-[#00D4AA]/90 text-[#0A2540] font-bold rounded-full shadow-[0_0_20px_rgba(0,212,170,0.25)]" data-testid="button-pro-plan">
                    Start Free Trial
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </div>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <div className="max-w-4xl mx-auto bg-white/5 border border-white/10 rounded-3xl p-8">
              <h2 className="text-2xl font-bold text-white text-center mb-8">Compare all features</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm" data-testid="table-feature-comparison">
                  <thead>
                    <tr className="border-b border-white/10">
                      <th className="text-left py-3 pr-4 font-normal text-white/40 w-1/2"></th>
                      <th className="py-3 px-4 w-1/4">
                        <span className="inline-block bg-white/15 text-white text-xs font-bold uppercase px-3 py-1 rounded-full">
                          Start
                        </span>
                      </th>
                      <th className="py-3 px-4 w-1/4">
                        <span className="inline-block bg-[#00D4AA] text-[#0A2540] text-xs font-bold uppercase px-3 py-1 rounded-full">
                          Pro
                        </span>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {comparisonFeatures.map((row, idx) => {
                      if (row.category) {
                        return (
                          <tr key={`cat-${idx}`} className="border-b border-white/10">
                            <td colSpan={3} className="py-4 font-bold text-white/80">
                              {row.category}
                            </td>
                          </tr>
                        );
                      }
                      return (
                        <tr key={`feat-${idx}`} className="border-b border-white/5 last:border-b-0">
                          <td className="py-3 pr-4 text-white/50">{row.label}</td>
                          <td className="py-3 px-4 text-center">
                            {row.start ? (
                              <Check className="w-5 h-5 text-[#00D4AA] mx-auto" />
                            ) : (
                              <span className="text-white/20">—</span>
                            )}
                          </td>
                          <td className="py-3 px-4 text-center">
                            {row.pro ? (
                              <Check className="w-5 h-5 text-[#00D4AA] mx-auto" />
                            ) : (
                              <span className="text-white/20">—</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#00D4AA]/5 to-transparent pointer-events-none" />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <h2 className="text-4xl md:text-5xl font-black text-white mb-4 tracking-tight">
            Ready to get started?
          </h2>
          <p className="text-white/60 text-lg mb-10 max-w-xl mx-auto font-light">
            Try the Pro plan free — no credit card required.
          </p>
          <Link to="/auth">
            <Button
              size="lg"
              className="h-14 px-8 text-lg rounded-full bg-[#00D4AA] hover:bg-[#00D4AA]/90 text-[#0A2540] font-bold shadow-[0_0_30px_rgba(0,212,170,0.3)] transition-all hover:scale-105"
              data-testid="link-cta-bottom"
            >
              Start Free Trial
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </Link>
        </div>
      </div>

      <footer className="bg-[#060E1A] py-12 border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-3">
              <img src="/web-app.png" alt="Certxa" className="w-10 h-10 rounded-xl grayscale opacity-70" />
              <span className="font-bold text-2xl text-white/80 tracking-tight">Certxa</span>
            </div>
            <p className="text-white/40 text-sm">© 2025 Certxa. All rights reserved.</p>
          </div>
          <div className="mt-8 pt-8 border-t border-white/10 flex flex-wrap items-center justify-center md:justify-end gap-8">
            <Link to="/privacy-policy" className="text-sm text-white/50 hover:text-white transition-colors">Privacy Policy</Link>
            <Link to="/terms-of-service" className="text-sm text-white/50 hover:text-white transition-colors">Terms of Service</Link>
            <Link to="/staff-auth" className="text-sm text-white/50 hover:text-white transition-colors">Staff Login</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
