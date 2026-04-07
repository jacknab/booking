import { useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Check, Shield, Zap, Clock } from "lucide-react";
import { motion } from "framer-motion";

const timelineSteps = [
  {
    icon: Clock,
    label: "Today",
    highlight: "Free, 14-day trial",
    sub: "Explore all features immediately",
    done: false,
  },
  {
    icon: Zap,
    label: "Next",
    highlight: "$39 → $1/mo for 3 months",
    sub: "That's 97% off!",
    done: false,
  },
  {
    icon: Shield,
    label: "Always",
    highlight: "No commitment, cancel anytime",
    sub: "Full control, no lock-in",
    done: false,
  },
];

const planIncludes = [
  "Online Calendar & Scheduling",
  "Appointment Reminders (SMS & Email)",
  "Online Booking Page",
  "Staff & Client Management",
  "POS Checkout with Split Tender",
  "Business Analytics Dashboard",
  "Google Review Booster",
  "Inventory & Product Management",
  "Commission Tracking",
  "Marketing SMS Campaigns",
];

const comparisonFeatures = [
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
  useEffect(() => {
    const link = document.createElement("link");
    link.href = "https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap";
    link.rel = "stylesheet";
    document.head.appendChild(link);
    return () => { document.head.removeChild(link); };
  }, []);

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
                <Button variant="ghost" className="font-bold text-base text-white/90 hover:text-white hover:bg-white/10" data-testid="link-pricing">Pricing</Button>
              </Link>
              <Link to="/auth">
                <Button variant="ghost" className="font-bold text-base text-white/90 hover:text-white hover:bg-white/10" data-testid="link-login">Log in</Button>
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

      <div className="flex-1 flex flex-col items-center justify-center pt-28 pb-20 px-4">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-4xl"
        >
          <div className="rounded-3xl overflow-hidden border border-white/10 flex flex-col md:flex-row min-h-[480px] shadow-[0_0_60px_rgba(0,212,170,0.08)]">
            <div
              className="flex-1 p-10 flex flex-col justify-between border-r border-white/10"
              style={{ background: "linear-gradient(145deg, #0e0e1a 0%, #0a0a14 100%)" }}
            >
              <div>
                <h1 className="text-4xl md:text-5xl font-black text-white leading-snug mb-1">
                  Start for free.
                </h1>
                <h1 className="text-4xl md:text-5xl font-black text-white leading-snug mb-10 flex items-center gap-3 flex-wrap">
                  Stay for
                  <img
                    src="/half_dollar_bill.png"
                    alt="$1"
                    className="inline-block"
                    style={{
                      height: "4.5rem",
                      width: "auto",
                      transform: "rotate(-5deg)",
                      filter: "drop-shadow(0 6px 18px rgba(0,0,0,0.6))",
                      verticalAlign: "middle",
                    }}
                  />
                </h1>

                <div className="space-y-0">
                  {/* Step 1 - filled bullet */}
                  <div className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 bg-[#5c6bc0]">
                        <Check className="w-4 h-4 text-white" strokeWidth={3} />
                      </div>
                      <div
                        className="w-px mt-1 mb-1"
                        style={{
                          height: "32px",
                          background: "repeating-linear-gradient(to bottom, rgba(255,255,255,0.25) 0px, rgba(255,255,255,0.25) 4px, transparent 4px, transparent 8px)",
                        }}
                      />
                    </div>
                    <div className="pb-5 pt-0.5">
                      <p className="text-white font-semibold text-base leading-snug">
                        Today – Free, 14-day trial
                      </p>
                      <p className="text-white/50 text-sm mt-0.5">Explore all features immediately</p>
                    </div>
                  </div>

                  {/* Step 2 - outlined bullet */}
                  <div className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 border-2 border-white/40">
                        <Check className="w-3.5 h-3.5 text-white/50" strokeWidth={2.5} />
                      </div>
                      <div
                        className="w-px mt-1 mb-1"
                        style={{
                          height: "32px",
                          background: "repeating-linear-gradient(to bottom, rgba(255,255,255,0.25) 0px, rgba(255,255,255,0.25) 4px, transparent 4px, transparent 8px)",
                        }}
                      />
                    </div>
                    <div className="pb-5 pt-0.5">
                      <p className="text-white font-semibold text-base leading-snug">
                        Next –{" "}
                        <span className="line-through text-white/40">$39</span>{" "}
                        $1/mo for 3 months
                      </p>
                      <p className="text-white/50 text-sm mt-0.5">That's 97% off!</p>
                    </div>
                  </div>

                  {/* Step 3 - outlined bullet, no connector */}
                  <div className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 border-2 border-white/40">
                        <Check className="w-3.5 h-3.5 text-white/50" strokeWidth={2.5} />
                      </div>
                    </div>
                    <div className="pt-0.5">
                      <p className="text-white font-semibold text-base leading-snug">
                        Always – No commitment, cancel anytime
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <p className="text-white/25 text-xs mt-10 leading-relaxed">
                Plus applicable taxes. Renews at $39/mo after promotional period unless cancelled. Cancel anytime during your 14-day free trial to avoid charges.
              </p>
            </div>

            <div className="flex-1 bg-[#0D1B2E] p-10 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <p className="text-white font-bold text-lg">Pro Plan</p>
                    <p className="text-white/50 text-sm">Everything you need to grow</p>
                  </div>
                  <div className="text-right">
                    <div className="flex items-baseline gap-1 justify-end">
                      <span className="text-white/40 text-sm line-through">$39</span>
                      <span className="text-[#00D4AA] font-black text-3xl">$1</span>
                      <span className="text-white/40 text-sm">/mo</span>
                    </div>
                    <p className="text-[#00D4AA]/70 text-xs">for first 3 months</p>
                  </div>
                </div>

                <div className="space-y-3 mb-8">
                  {planIncludes.map((feature) => (
                    <div key={feature} className="flex items-center gap-3">
                      <div className="w-5 h-5 rounded-full bg-[#00D4AA]/15 flex items-center justify-center flex-shrink-0">
                        <Check className="w-3 h-3 text-[#00D4AA]" />
                      </div>
                      <span className="text-white/80 text-sm">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <Link to="/auth" data-testid="button-start-trial">
                  <Button
                    size="lg"
                    className="w-full h-13 text-base font-bold rounded-xl bg-[#00D4AA] hover:bg-[#00D4AA]/90 text-[#0A2540] shadow-[0_0_20px_rgba(0,212,170,0.3)] transition-all hover:scale-[1.02]"
                  >
                    Start Free Trial — No Card Required
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                </Link>
                <p className="text-white/30 text-xs text-center mt-3">
                  14 days free · Then $1/mo for 3 months · Then $39/mo
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="w-full max-w-4xl mt-16"
        >
          <div className="bg-white/5 border border-white/10 rounded-3xl p-8">
            <h2 className="text-2xl font-bold text-white text-center mb-8">Everything included in Pro</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm" data-testid="table-feature-comparison">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left py-3 pr-4 font-normal text-white/40 w-3/4"></th>
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
                          <td colSpan={2} className="py-4 font-bold text-white/80">
                            {row.category}
                          </td>
                        </tr>
                      );
                    }
                    return (
                      <tr key={`feat-${idx}`} className="border-b border-white/5 last:border-b-0">
                        <td className="py-3 pr-4 text-white/50">{row.label}</td>
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
