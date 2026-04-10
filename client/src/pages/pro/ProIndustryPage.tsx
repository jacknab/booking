import { useState } from "react";
import { Link, useParams, Navigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  ArrowRight, ArrowLeft, CheckCircle2, Star, Check,
  Wrench, ChevronDown, ChevronRight,
} from "lucide-react";
import { getProIndustry, PRO_INDUSTRIES } from "./proIndustries";

// ── Lead Form ─────────────────────────────────────────────────────────────────

function InlineLeadForm({ industryName }: { industryName: string }) {
  const [form, setForm] = useState({ name: "", email: "", business: "", teamSize: "", industry: industryName });
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name || !form.email) return;
    setStatus("loading");
    try {
      const res = await fetch("/api/pro/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      setStatus(res.ok ? "done" : "error");
    } catch {
      setStatus("error");
    }
  }

  if (status === "done") {
    return (
      <div className="text-center py-8">
        <CheckCircle2 className="w-10 h-10 text-[#00D4AA] mx-auto mb-3" />
        <p className="text-white font-bold text-lg mb-1">We'll be in touch!</p>
        <p className="text-white/55 text-sm">Expect a response within one business day to set up your free trial.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <input
          type="text" placeholder="Your Name" required
          value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
          className="bg-white/8 border border-white/15 rounded-xl px-4 py-3 text-white placeholder-white/40 text-sm focus:outline-none focus:border-[#00D4AA]/50 transition-all"
        />
        <input
          type="email" placeholder="Business Email" required
          value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
          className="bg-white/8 border border-white/15 rounded-xl px-4 py-3 text-white placeholder-white/40 text-sm focus:outline-none focus:border-[#00D4AA]/50 transition-all"
        />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <input
          type="text" placeholder="Business Name"
          value={form.business} onChange={e => setForm(f => ({ ...f, business: e.target.value }))}
          className="bg-white/8 border border-white/15 rounded-xl px-4 py-3 text-white placeholder-white/40 text-sm focus:outline-none focus:border-[#00D4AA]/50 transition-all"
        />
        <select
          value={form.teamSize} onChange={e => setForm(f => ({ ...f, teamSize: e.target.value }))}
          className="bg-white/8 border border-white/15 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-[#00D4AA]/50 transition-all appearance-none"
        >
          <option value="" className="bg-[#0D1F35]">Team Size</option>
          {["Just me", "2–5 techs", "6–15 techs", "16–30 techs", "30+ techs"].map(s => (
            <option key={s} value={s} className="bg-[#0D1F35]">{s}</option>
          ))}
        </select>
      </div>
      <Button
        type="submit"
        disabled={status === "loading"}
        className="w-full bg-[#00D4AA] hover:bg-[#00BF99] text-[#060E1A] font-bold text-sm py-3 rounded-xl h-auto"
      >
        {status === "loading" ? "Sending…" : `Start My Free Trial — ${industryName}`}
        {status !== "loading" && <ArrowRight className="ml-2 w-4 h-4" />}
      </Button>
      {status === "error" && <p className="text-red-400 text-xs text-center">Something went wrong. Please try again.</p>}
      <p className="text-white/30 text-xs text-center">Free 60 days · No credit card · Cancel anytime</p>
    </form>
  );
}

// ── FAQ Item ──────────────────────────────────────────────────────────────────

function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-white/10 rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left hover:bg-white/4 transition-colors"
      >
        <span className="text-white font-medium text-sm">{q}</span>
        {open ? <ChevronDown className="w-4 h-4 text-[#00D4AA] flex-shrink-0" /> : <ChevronRight className="w-4 h-4 text-white/40 flex-shrink-0" />}
      </button>
      {open && (
        <div className="px-5 pb-4">
          <p className="text-white/60 text-sm leading-relaxed">{a}</p>
        </div>
      )}
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function ProIndustryPage() {
  const { industry: slug } = useParams<{ industry: string }>();
  const industry = slug ? getProIndustry(slug) : undefined;

  if (!industry) return <Navigate to="/pro" replace />;

  const relatedIndustries = PRO_INDUSTRIES.filter(i => i.slug !== slug && i.category === industry.category).slice(0, 4);

  return (
    <div className="min-h-screen bg-[#060E1A] text-white font-['Plus_Jakarta_Sans',sans-serif]">

      {/* ── Minimal Nav ── */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#060E1A]/90 backdrop-blur-xl border-b border-white/8 h-16 flex items-center px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto w-full flex items-center justify-between">
          <Link to="/pro" className="flex items-center gap-2 text-white/60 hover:text-white transition-colors text-sm font-medium">
            <ArrowLeft className="w-4 h-4" /> All Industries
          </Link>
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-md bg-[#00D4AA]/15 border border-[#00D4AA]/30 flex items-center justify-center">
              <Wrench className="w-3.5 h-3.5 text-[#00D4AA]" />
            </div>
            <span className="text-white font-bold text-sm">Certxa <span className="text-[#00D4AA]">Pro</span></span>
          </div>
          <Link to="/auth">
            <Button className="bg-[#00D4AA] hover:bg-[#00BF99] text-[#060E1A] font-bold text-xs px-4 py-2 rounded-xl h-auto">
              Free Trial
            </Button>
          </Link>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="pt-28 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55 }}>
          <div className="flex items-center gap-3 mb-5">
            <span className="text-4xl">{industry.emoji}</span>
            <span className="text-[#00D4AA] text-xs font-bold uppercase tracking-widest bg-[#00D4AA]/10 border border-[#00D4AA]/20 px-3 py-1 rounded-full">
              {industry.badge}
            </span>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
            <div>
              <h1 className="text-4xl sm:text-5xl font-extrabold leading-[1.1] tracking-tight text-white mb-2">
                {industry.heroLine1}
              </h1>
              <h1 className="text-4xl sm:text-5xl font-extrabold leading-[1.1] tracking-tight text-[#00D4AA] mb-6">
                {industry.heroLine2}
              </h1>
              <p className="text-white/60 text-lg leading-relaxed mb-8 max-w-lg">{industry.desc}</p>
              <div className="flex flex-col sm:flex-row gap-3">
                <Link to="/auth">
                  <Button className="bg-[#00D4AA] hover:bg-[#00BF99] text-[#060E1A] font-bold text-sm px-7 py-3 rounded-xl h-auto">
                    Start Free Trial <ArrowRight className="ml-2 w-4 h-4" />
                  </Button>
                </Link>
                <a href="#get-started">
                  <Button variant="ghost" className="border border-white/20 text-white bg-white/5 hover:bg-white/10 hover:border-white/30 font-semibold text-sm px-7 py-3 rounded-xl h-auto">
                    Get a Demo
                  </Button>
                </a>
              </div>
            </div>

            {/* Testimonial card in hero */}
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
              <div className="bg-[#0D1F35] border border-white/10 rounded-2xl p-6 space-y-4">
                <div className="flex gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-[#00D4AA] text-[#00D4AA]" />
                  ))}
                </div>
                <p className="text-white/80 text-sm leading-relaxed">"{industry.testimonial.quote}"</p>
                <div className="flex items-center gap-3 pt-1">
                  <div className="w-9 h-9 rounded-full bg-[#00D4AA]/10 border border-[#00D4AA]/20 flex items-center justify-center text-[#00D4AA] font-bold text-xs">
                    {industry.testimonial.name.split(" ").map(n => n[0]).join("")}
                  </div>
                  <div>
                    <p className="text-white font-semibold text-sm">{industry.testimonial.name}</p>
                    <p className="text-white/40 text-xs">{industry.testimonial.business} · {industry.testimonial.location}</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* ── Features ── */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-[#0D1F35]/40">
        <div className="max-w-6xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-12">
            <p className="text-[#00D4AA] text-xs font-bold uppercase tracking-widest mb-3">Built for {industry.name}</p>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
              Every Feature Your {industry.name} Business Needs
            </h2>
          </motion.div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {industry.features.map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.08 }}
                className="bg-[#0D1F35] border border-white/10 rounded-2xl p-6 hover:border-[#00D4AA]/30 transition-all duration-300"
              >
                <span className="text-2xl mb-3 block">{feature.icon}</span>
                <h3 className="text-white font-bold text-base mb-2">{feature.title}</h3>
                <p className="text-white/55 text-sm leading-relaxed">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How It Works ── */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-12">
          <p className="text-[#00D4AA] text-xs font-bold uppercase tracking-widest mb-3">How It Works</p>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white">Up and Running in Three Steps</h2>
        </motion.div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {industry.steps.map((step, i) => (
            <motion.div
              key={step.num}
              initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ delay: i * 0.12 }}
              className="relative"
            >
              {i < industry.steps.length - 1 && (
                <div className="hidden md:block absolute top-6 left-full w-full h-px bg-gradient-to-r from-[#00D4AA]/30 to-transparent z-0" />
              )}
              <div className="relative z-10 bg-[#0D1F35] border border-white/10 rounded-2xl p-6">
                <div className="w-10 h-10 rounded-xl bg-[#00D4AA]/10 border border-[#00D4AA]/25 flex items-center justify-center mb-4">
                  <span className="text-[#00D4AA] font-extrabold text-sm">{step.num}</span>
                </div>
                <h3 className="text-white font-bold text-base mb-2">{step.title}</h3>
                <p className="text-white/55 text-sm leading-relaxed">{step.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── Comparison Table ── */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-[#0D1F35]/40">
        <div className="max-w-3xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white mb-3">
              Certxa vs. Running Without Software
            </h2>
            <p className="text-white/50 text-sm">See the difference for your {industry.name} business</p>
          </motion.div>
          <div className="bg-[#0D1F35] border border-white/10 rounded-2xl overflow-hidden">
            <div className="grid grid-cols-3 bg-[#060E1A] px-6 py-3 border-b border-white/10">
              <p className="text-white/40 text-xs font-semibold uppercase tracking-wider col-span-1">Capability</p>
              <p className="text-[#00D4AA] text-xs font-bold uppercase tracking-wider text-center">Certxa</p>
              <p className="text-white/30 text-xs font-semibold uppercase tracking-wider text-center">Without Software</p>
            </div>
            {industry.compareRows.map(([label, withCertxa, withoutCertxa], i) => (
              <div key={i} className={`grid grid-cols-3 px-6 py-3.5 items-center ${i !== industry.compareRows.length - 1 ? "border-b border-white/6" : ""} hover:bg-white/2 transition-colors`}>
                <p className="text-white/70 text-sm col-span-1">{label}</p>
                <div className="flex justify-center">
                  {withCertxa ? (
                    <Check className="w-4 h-4 text-[#00D4AA]" />
                  ) : (
                    <span className="w-4 h-0.5 bg-white/20 rounded" />
                  )}
                </div>
                <div className="flex justify-center">
                  {withoutCertxa ? (
                    <Check className="w-4 h-4 text-white/40" />
                  ) : (
                    <span className="text-white/25 text-lg leading-none">✕</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-3xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-10">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white">Common Questions</h2>
        </motion.div>
        <div className="space-y-3">
          {industry.faqs.map((faq, i) => (
            <FAQItem key={i} q={faq.q} a={faq.a} />
          ))}
        </div>
      </section>

      {/* ── Lead Form CTA ── */}
      <section id="get-started" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-8">
            <span className="text-3xl mb-3 block">{industry.emoji}</span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white mb-3">
              Ready to Grow Your {industry.name} Business?
            </h2>
            <p className="text-white/50 text-sm">Start free. No credit card. Cancel anytime.</p>
          </motion.div>
          <div className="bg-[#0D1F35] border border-white/10 rounded-2xl p-7">
            <InlineLeadForm industryName={industry.name} />
          </div>
        </div>
      </section>

      {/* ── Related Industries ── */}
      {relatedIndustries.length > 0 && (
        <section className="pb-20 px-4 sm:px-6 lg:px-8 bg-[#0D1F35]/30 py-16">
          <div className="max-w-5xl mx-auto">
            <h3 className="text-white font-bold text-lg mb-6 text-center">
              Also Built for These Industries
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {relatedIndustries.map(rel => (
                <Link key={rel.slug} to={`/pro/${rel.slug}`}>
                  <div className="group bg-[#0D1F35] border border-white/8 hover:border-[#00D4AA]/30 rounded-xl p-4 text-center transition-all duration-200 hover:-translate-y-1">
                    <span className="text-2xl block mb-2">{rel.emoji}</span>
                    <p className="text-white text-xs font-semibold">{rel.name}</p>
                    <p className="text-[#00D4AA] text-[10px] mt-1 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1">
                      View <ChevronRight className="w-2.5 h-2.5" />
                    </p>
                  </div>
                </Link>
              ))}
            </div>
            <div className="text-center mt-6">
              <Link to="/pro" className="text-[#00D4AA] text-sm font-semibold hover:underline flex items-center justify-center gap-1">
                See all 25+ industries <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* ── Footer ── */}
      <footer className="border-t border-white/8 py-8 px-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <Link to="/pro" className="flex items-center gap-2 text-white/50 hover:text-white/80 text-xs font-medium transition-colors">
            <ArrowLeft className="w-3.5 h-3.5" /> Back to All Industries
          </Link>
          <p className="text-white/30 text-xs">© 2025 Certxa. All rights reserved.</p>
          <div className="flex gap-5">
            {[["Pricing", "/pricing"], ["Privacy", "/privacy-policy"], ["Terms", "/terms-of-service"]].map(([l, h]) => (
              <Link key={h} to={h} className="text-white/35 hover:text-white/60 text-xs transition-colors">{l}</Link>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}
