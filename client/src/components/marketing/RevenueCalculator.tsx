import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, ChevronRight, TrendingUp, Users, MapPin, Briefcase } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// ── Revenue data table ────────────────────────────────────────────────────────
// Values in thousands (K). E.g. [45, 80] = $45K–$80K annual revenue

type TeamKey = "solo" | "small" | "medium" | "large";
type RevenueRange = [number, number];

const REVENUE_DATA: Record<string, Record<TeamKey, RevenueRange>> = {
  "house-cleaning":    { solo: [40,  70],  small: [120, 280],  medium: [350,  750],  large: [800,  2000] },
  "handyman":          { solo: [55,  85],  small: [160, 350],  medium: [400,  900],  large: [1000, 2500] },
  "lawn-care":         { solo: [45,  80],  small: [140, 320],  medium: [380,  850],  large: [950,  2200] },
  "dog-walking":       { solo: [25,  45],  small: [80,  160],  medium: [180,  380],  large: [400,  900]  },
  "tutoring":          { solo: [30,  55],  small: [90,  200],  medium: [220,  450],  large: [500,  1100] },
  "hvac":              { solo: [70,  120], small: [220, 500],  medium: [600,  1400], large: [1500, 4000] },
  "plumbing":          { solo: [75,  130], small: [240, 550],  medium: [650,  1500], large: [1600, 4500] },
  "electrical":        { solo: [70,  115], small: [210, 480],  medium: [580,  1300], large: [1400, 3800] },
  "carpet-cleaning":   { solo: [45,  80],  small: [145, 320],  medium: [380,  860],  large: [950,  2100] },
  "pressure-washing":  { solo: [40,  75],  small: [130, 300],  medium: [350,  800],  large: [900,  2000] },
  "window-cleaning":   { solo: [35,  65],  small: [110, 260],  medium: [300,  700],  large: [750,  1800] },
  "snow-removal":      { solo: [25,  50],  small: [85,  200],  medium: [240,  560],  large: [600,  1500] },
  "pet-grooming":      { solo: [35,  60],  small: [110, 240],  medium: [280,  600],  large: [650,  1500] },
  "pest-control":      { solo: [50,  90],  small: [160, 380],  medium: [440,  1000], large: [1100, 2800] },
  "personal-training": { solo: [35,  65],  small: [110, 250],  medium: [280,  600],  large: [650,  1500] },
  "hair-salon":        { solo: [45,  80],  small: [150, 350],  medium: [400,  900],  large: [1000, 2500] },
  "barbershop":        { solo: [40,  75],  small: [140, 320],  medium: [380,  850],  large: [950,  2200] },
  "nail-salon":        { solo: [40,  70],  small: [130, 300],  medium: [350,  800],  large: [900,  2200] },
  "spa":               { solo: [50,  90],  small: [160, 380],  medium: [420,  960],  large: [1000, 2600] },
  "esthetician":       { solo: [40,  75],  small: [130, 300],  medium: [350,  800],  large: [900,  2200] },
  "tattoo":            { solo: [50,  95],  small: [170, 400],  medium: [450,  1000], large: [1100, 2800] },
};

// ── Urban ZIP prefix lookup ───────────────────────────────────────────────────
// First 3 digits of ZIP code mapped to "urban" tier (1.25x multiplier)
const URBAN_ZIP3 = new Set([
  "100","101","102","103","104","105","106","107","108","109","110","111","112","113","114",
  "900","901","902","903","904","905","906","907","908",
  "606","607","608",
  "770","771","772",
  "850","851","852","853",
  "941","942","943","944","945","946","947","948",
  "021","022","023","024","025",
  "191","192","193","194","195",
  "202","203","204","205",
  "331","332","333",
  "300","301","302","303",
  "980","981","982",
  "972","973","974",
  "800","801","802","803",
  "781","782","783",
  "750","751","752","753",
  "482","483","484",
  "550","551","552","553","554","555",
  "920","921","922","923",
  "891","892","893",
  "961","962","963","964",
]);

// Known rural ZIP3 prefixes (0.82x multiplier)
const RURAL_ZIP3 = new Set([
  "498","499","497","496",            // rural Michigan
  "578","579","576","577",            // rural South Dakota
  "598","599","597","596","595",      // rural Montana
  "827","828","829","826",            // rural Wyoming
  "693","692","691","690",            // rural Nebraska
  "508","509","507","506","505",      // rural Minnesota / Iowa
  "416","417","418","419","414","415",// rural Kentucky
  "246","247","248","249","245","244",// rural West Virginia
  "397","398","399","396","395","394",// rural Mississippi
]);

function getRegionTier(zip: string): { label: string; multiplier: number } {
  const z3 = zip.slice(0, 3);
  if (URBAN_ZIP3.has(z3)) return { label: "Major Metro",    multiplier: 1.25 };
  if (RURAL_ZIP3.has(z3)) return { label: "Rural Area",     multiplier: 0.82 };
  return                         { label: "Suburban / Mid-size", multiplier: 1.0 };
}

// ── Formatting helpers ─────────────────────────────────────────────────────────
function fmtK(k: number): string {
  if (k >= 1000) return `$${(k / 1000).toFixed(1).replace(".0", "")}M`;
  return `$${k}K`;
}

// ── Industry list ──────────────────────────────────────────────────────────────
const INDUSTRIES = [
  { id: "house-cleaning",    emoji: "🏠", label: "House Cleaning"    },
  { id: "handyman",          emoji: "🔧", label: "Handyman"          },
  { id: "lawn-care",         emoji: "🌿", label: "Lawn Care"         },
  { id: "hvac",              emoji: "🌡️", label: "HVAC"              },
  { id: "plumbing",          emoji: "🚿", label: "Plumbing"          },
  { id: "electrical",        emoji: "⚡", label: "Electrical"        },
  { id: "carpet-cleaning",   emoji: "🧹", label: "Carpet Cleaning"   },
  { id: "pressure-washing",  emoji: "💦", label: "Pressure Washing"  },
  { id: "window-cleaning",   emoji: "🪟", label: "Window Cleaning"   },
  { id: "snow-removal",      emoji: "❄️", label: "Snow Removal"      },
  { id: "pest-control",      emoji: "🪲", label: "Pest Control"      },
  { id: "dog-walking",       emoji: "🐕", label: "Dog Walking"       },
  { id: "pet-grooming",      emoji: "🐾", label: "Pet Grooming"      },
  { id: "tutoring",          emoji: "📚", label: "Tutoring"          },
  { id: "personal-training", emoji: "💪", label: "Personal Training" },
  { id: "hair-salon",        emoji: "💇", label: "Hair Salon"        },
];

const TEAM_SIZES: { key: TeamKey; label: string; sub: string; icon: string }[] = [
  { key: "solo",   label: "Just me",       sub: "Solo operator",   icon: "👤" },
  { key: "small",  label: "2–5 people",    sub: "Small crew",      icon: "👥" },
  { key: "medium", label: "6–10 people",   sub: "Mid-size team",   icon: "🏢" },
  { key: "large",  label: "11+ people",    sub: "Large operation", icon: "🏗️" },
];

const STEP_LABELS = ["Industry", "Team Size", "Location", "Your Estimate"];

// ── Step components ───────────────────────────────────────────────────────────

function StepIndustry({ selected, onSelect }: { selected: string | null; onSelect: (id: string) => void }) {
  return (
    <div>
      <h3 className="text-2xl font-black text-white mb-2">What industry are you in?</h3>
      <p className="text-white/50 font-light mb-8 text-sm">Pick the one that best describes your business.</p>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {INDUSTRIES.map(ind => (
          <button
            key={ind.id}
            onClick={() => onSelect(ind.id)}
            className={`flex flex-col items-center gap-2 p-4 rounded-2xl border text-center transition-all duration-150
              ${selected === ind.id
                ? "bg-[#00D4AA]/20 border-[#00D4AA] text-white shadow-[0_0_15px_rgba(0,212,170,0.2)]"
                : "bg-white/5 border-white/10 text-white/60 hover:bg-white/8 hover:text-white hover:border-white/20"}`}
          >
            <span className="text-2xl leading-none">{ind.emoji}</span>
            <span className="text-xs font-semibold leading-snug">{ind.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

function StepTeamSize({ selected, onSelect }: { selected: TeamKey | null; onSelect: (k: TeamKey) => void }) {
  return (
    <div>
      <h3 className="text-2xl font-black text-white mb-2">How big is your team?</h3>
      <p className="text-white/50 font-light mb-8 text-sm">Include yourself and any staff or contractors you work with regularly.</p>
      <div className="grid grid-cols-2 gap-4">
        {TEAM_SIZES.map(t => (
          <button
            key={t.key}
            onClick={() => onSelect(t.key)}
            className={`flex flex-col items-start gap-3 p-6 rounded-2xl border text-left transition-all duration-150
              ${selected === t.key
                ? "bg-[#00D4AA]/20 border-[#00D4AA] text-white shadow-[0_0_15px_rgba(0,212,170,0.2)]"
                : "bg-white/5 border-white/10 text-white/70 hover:bg-white/8 hover:text-white hover:border-white/20"}`}
          >
            <span className="text-3xl">{t.icon}</span>
            <div>
              <div className="font-bold text-base">{t.label}</div>
              <div className="text-xs text-white/40">{t.sub}</div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

function StepLocation({ zip, setZip, onContinue }: { zip: string; setZip: (z: string) => void; onContinue: () => void }) {
  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && zip.length >= 5) onContinue();
  };
  return (
    <div>
      <h3 className="text-2xl font-black text-white mb-2">Where are you based?</h3>
      <p className="text-white/50 font-light mb-8 text-sm">We use your ZIP code to estimate local market rates for your area.</p>
      <div className="max-w-xs mx-auto space-y-4">
        <div className="relative">
          <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />
          <input
            type="text"
            inputMode="numeric"
            maxLength={5}
            placeholder="Enter ZIP code"
            value={zip}
            onChange={e => setZip(e.target.value.replace(/\D/g, "").slice(0, 5))}
            onKeyDown={handleKey}
            className="w-full bg-white/8 border border-white/15 rounded-2xl py-4 pl-12 pr-5 text-white placeholder-white/25 text-center text-xl font-bold tracking-widest focus:outline-none focus:border-[#00D4AA] focus:bg-white/10 transition-colors"
          />
        </div>
        {zip.length === 5 && (
          <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} className="text-center">
            <div className="inline-flex items-center gap-2 text-sm text-[#00D4AA] font-medium">
              <span className="w-2 h-2 rounded-full bg-[#00D4AA] animate-pulse" />
              {getRegionTier(zip).label} detected
            </div>
          </motion.div>
        )}
        <Button
          onClick={onContinue}
          disabled={zip.length < 5}
          className="w-full h-13 bg-[#00D4AA] hover:bg-[#00D4AA]/90 text-[#0A2540] font-bold rounded-2xl disabled:opacity-30 disabled:cursor-not-allowed text-base"
        >
          Calculate My Revenue <ArrowRight className="ml-2 w-4 h-4" />
        </Button>
        <p className="text-center text-white/25 text-xs">Your ZIP is used for estimation only and is not stored.</p>
      </div>
    </div>
  );
}

function StepResults({
  industry,
  teamSize,
  zip,
  onReset,
}: {
  industry: string;
  teamSize: TeamKey;
  zip: string;
  onReset: () => void;
}) {
  const data = REVENUE_DATA[industry] ?? REVENUE_DATA["handyman"];
  const base = data[teamSize];
  const region = getRegionTier(zip);
  const low  = Math.round(base[0] * region.multiplier);
  const high = Math.round(base[1] * region.multiplier);
  const boostLow  = Math.round(low  * 1.35);
  const boostHigh = Math.round(high * 1.35);
  const industryLabel = INDUSTRIES.find(i => i.id === industry)?.label ?? industry;
  const teamLabel = TEAM_SIZES.find(t => t.key === teamSize)?.label ?? teamSize;

  return (
    <div className="text-center">
      <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#00D4AA]/15 text-[#00D4AA] text-sm font-semibold mb-6">
        <TrendingUp className="w-4 h-4" />
        {industryLabel} · {teamLabel} · {region.label}
      </div>
      <h3 className="text-3xl font-black text-white mb-2">Your Revenue Estimate</h3>
      <p className="text-white/50 text-sm font-light mb-8">Based on real data from Certxa pros in your market.</p>

      {/* Revenue ranges */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
          <p className="text-white/40 text-xs font-semibold uppercase tracking-wider mb-2">Without Certxa</p>
          <p className="text-3xl font-black text-white/60">{fmtK(low)}</p>
          <p className="text-white/30 text-xs mt-1">to {fmtK(high)} /year</p>
        </div>
        <div className="bg-[#00D4AA]/10 border border-[#00D4AA]/40 rounded-2xl p-6 relative overflow-hidden">
          <div className="absolute top-2 right-2 bg-[#00D4AA] text-[#0A2540] text-[10px] font-black px-2 py-0.5 rounded-full">+35%</div>
          <p className="text-[#00D4AA] text-xs font-semibold uppercase tracking-wider mb-2">With Certxa</p>
          <p className="text-3xl font-black text-white">{fmtK(boostLow)}</p>
          <p className="text-white/50 text-xs mt-1">to {fmtK(boostHigh)} /year</p>
        </div>
      </div>

      {/* Stats row */}
      <div className="flex flex-wrap justify-center gap-4 mb-8 text-sm text-white/60">
        <span className="flex items-center gap-1.5"><span className="text-[#00D4AA]">↑</span> 35% avg revenue increase</span>
        <span className="flex items-center gap-1.5"><span className="text-[#00D4AA]">↓</span> 8 hrs of admin saved/week</span>
        <span className="flex items-center gap-1.5"><span className="text-[#00D4AA]">★</span> 30,000+ pros trust Certxa</span>
      </div>

      <Link to="/auth?mode=register">
        <Button size="lg" className="h-14 px-8 text-base rounded-full bg-[#00D4AA] hover:bg-[#00D4AA]/90 text-[#0A2540] font-bold shadow-[0_0_25px_rgba(0,212,170,0.3)] transition-all hover:scale-105 mb-4">
          Start Free — See These Results <ArrowRight className="ml-2 w-5 h-5" />
        </Button>
      </Link>
      <div>
        <button onClick={onReset} className="text-xs text-white/30 hover:text-white/60 transition-colors underline underline-offset-2">
          Start over
        </button>
      </div>
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────────

interface RevenueCalculatorProps {
  defaultIndustry?: string;
}

export default function RevenueCalculator({ defaultIndustry }: RevenueCalculatorProps) {
  const [step, setStep]     = useState(0);
  const [industry, setIndustry] = useState<string | null>(defaultIndustry ?? null);
  const [teamSize, setTeamSize] = useState<TeamKey | null>(null);
  const [zip, setZip]       = useState("");

  function reset() {
    setStep(0);
    setIndustry(defaultIndustry ?? null);
    setTeamSize(null);
    setZip("");
  }

  function selectIndustry(id: string) {
    setIndustry(id);
    setStep(1);
  }

  function selectTeamSize(k: TeamKey) {
    setTeamSize(k);
    setStep(2);
  }

  function submitZip() {
    if (zip.length >= 5) setStep(3);
  }

  const canAdvanceStep0 = industry !== null;

  return (
    <div className="bg-[#060E1A] py-28 border-t border-b border-white/10">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-14">
          <span className="inline-block px-4 py-1.5 rounded-full bg-[#00D4AA]/10 text-[#00D4AA] text-sm font-semibold mb-4 uppercase tracking-wider">
            REVENUE CALCULATOR
          </span>
          <h2 className="text-4xl md:text-5xl font-black text-white tracking-tight mb-4">
            How much can your business earn?
          </h2>
          <p className="text-white/50 text-lg max-w-2xl mx-auto font-light">
            Answer 3 quick questions and we'll estimate your annual revenue based on real data from pros in your market.
          </p>
        </div>

        {/* Step indicator */}
        <div className="flex items-center justify-center gap-2 mb-12">
          {STEP_LABELS.map((label, i) => (
            <div key={label} className="flex items-center gap-2">
              <div className={`flex items-center gap-2 transition-all duration-200 ${i <= step ? "opacity-100" : "opacity-30"}`}>
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-200
                  ${i < step ? "bg-[#00D4AA] text-[#0A2540]" : i === step ? "bg-[#00D4AA]/20 border border-[#00D4AA] text-[#00D4AA]" : "bg-white/10 text-white/40"}`}>
                  {i < step ? "✓" : i + 1}
                </div>
                <span className={`text-xs font-medium hidden sm:block ${i === step ? "text-white" : "text-white/40"}`}>{label}</span>
              </div>
              {i < STEP_LABELS.length - 1 && (
                <ChevronRight className={`w-3 h-3 mx-1 transition-colors ${i < step ? "text-[#00D4AA]" : "text-white/20"}`} />
              )}
            </div>
          ))}
        </div>

        {/* Card */}
        <div className="bg-[#0A2540] border border-white/10 rounded-3xl p-8 md:p-12 min-h-[400px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              {step === 0 && (
                <StepIndustry selected={industry} onSelect={selectIndustry} />
              )}
              {step === 1 && (
                <StepTeamSize selected={teamSize} onSelect={selectTeamSize} />
              )}
              {step === 2 && (
                <StepLocation zip={zip} setZip={setZip} onContinue={submitZip} />
              )}
              {step === 3 && industry && teamSize && (
                <StepResults industry={industry} teamSize={teamSize} zip={zip} onReset={reset} />
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Navigation row (steps 0–2) */}
        {step > 0 && step < 3 && (
          <div className="flex justify-between items-center mt-6">
            <button
              onClick={() => setStep(s => s - 1)}
              className="text-sm text-white/40 hover:text-white/70 transition-colors flex items-center gap-1"
            >
              ← Back
            </button>
            {step === 0 && canAdvanceStep0 && (
              <Button onClick={() => setStep(1)} className="bg-[#00D4AA] hover:bg-[#00D4AA]/90 text-[#0A2540] font-bold rounded-full px-6 h-10">
                Next <ArrowRight className="ml-1.5 w-4 h-4" />
              </Button>
            )}
          </div>
        )}

        {/* Trust line */}
        <p className="text-center text-white/25 text-xs mt-8">
          Based on aggregated revenue data from 30,000+ service professionals. Estimates are ranges and may vary by market, experience, and business model.
        </p>
      </div>
    </div>
  );
}
