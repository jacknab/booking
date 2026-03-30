import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Calendar, Users, DollarSign, PlayCircle, Smartphone, Star, ShieldCheck, MapPin, Repeat, CheckCircle, BarChart3, Clock, Bell, Heart } from "lucide-react";
import { motion } from "framer-motion";
import { useEffect } from "react";
import DogWalkingHeroVideo from "./components/DogWalkingHeroVideo";

export default function DogWalkingLanding() {
  useEffect(() => {
    const link = document.createElement("link");
    link.href = "https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap";
    link.rel = "stylesheet";
    document.head.appendChild(link);
    return () => { document.head.removeChild(link); };
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-[#00D4AA]/30" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      <nav className="fixed w-full z-50 bg-[#060E1A]/80 backdrop-blur-md border-b border-white/10 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-20 items-center">
            <Link to="/" className="flex items-center gap-3"><img src="/web-app.png" alt="Certxa" className="w-10 h-10 rounded-xl shadow-lg" /><span className="font-bold text-2xl tracking-tight text-white">Certxa</span></Link>
            <div className="flex items-center gap-6">
              <Link to="/pricing"><Button variant="ghost" className="font-medium text-white/90 hover:text-white hover:bg-white/10">Pricing</Button></Link>
              <Link to="/auth"><Button variant="ghost" className="font-medium text-white/90 hover:text-white hover:bg-white/10">Log in</Button></Link>
              <Link to="/auth"><Button className="bg-[#00D4AA] hover:bg-[#00D4AA]/90 text-[#0A2540] font-bold px-6 rounded-full">Get Started</Button></Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-[#060E1A]">
        <div className="absolute inset-0 z-0"><DogWalkingHeroVideo /></div>
        <div className="absolute inset-0 bg-gradient-to-b from-[#060E1A]/30 via-[#060E1A]/10 to-[#060E1A]/60 z-10" />
        <div className="relative z-20 text-center max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 mt-20">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20 backdrop-blur-md mb-8">
            <span className="flex h-2 w-2 rounded-full bg-[#00D4AA] animate-pulse" />
            <span className="text-sm font-medium text-white/90">🐕 Built for Dog Walkers & Pet Sitters</span>
          </motion.div>
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }} className="text-6xl md:text-7xl lg:text-8xl font-black text-white mb-6 tracking-tight leading-[1.1]">
            Every Pup.<br /><span className="text-[#00D4AA]">In Good Hands.</span>
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }} className="text-lg md:text-xl text-white/80 mb-10 max-w-3xl mx-auto leading-relaxed font-light">
            Certxa handles online bookings, dog profiles, recurring walk schedules, post-walk updates, and payments — so you can spend more time with the dogs and less time on your phone.
          </motion.p>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.3 }} className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <Link to="/auth"><Button size="lg" className="h-14 px-8 text-lg rounded-full bg-[#00D4AA] hover:bg-[#00D4AA]/90 text-[#0A2540] font-bold shadow-[0_0_30px_rgba(0,212,170,0.3)] transition-all hover:scale-105">Start Free Trial<ArrowRight className="ml-2 w-5 h-5" /></Button></Link>
            <Button size="lg" variant="outline" className="h-14 px-8 text-lg rounded-full border-white/30 text-white hover:bg-white/10 bg-white/5 backdrop-blur-sm transition-all"><PlayCircle className="mr-2 w-5 h-5" />Watch Demo</Button>
          </motion.div>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1, delay: 0.8 }} className="flex flex-wrap justify-center gap-3 text-sm font-medium text-white/70">
            <span className="px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm">✅ No credit card required</span>
            <span className="px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm">✅ 60-day free trial</span>
            <span className="px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm">✅ Set up in under 5 minutes</span>
          </motion.div>
        </div>
      </div>

      <div className="bg-[#0A2540] py-6 border-y border-white/10 relative z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <p className="text-white/80 font-medium text-lg flex items-center gap-3"><span className="relative flex h-3 w-3"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00D4AA] opacity-75" /><span className="relative inline-flex rounded-full h-3 w-3 bg-[#00D4AA]" /></span>Trusted by thousands of dog walkers & pet sitters</p>
            <div className="flex flex-wrap justify-center gap-8 text-white/60 font-medium text-sm md:text-base">
              <div className="flex items-center gap-2"><span className="text-[#00D4AA] font-bold">✓</span> Rover Alternative</div>
              <div className="flex items-center gap-2"><span className="text-[#00D4AA] font-bold">✓</span> Wag Alternative</div>
              <div className="flex items-center gap-2"><span className="text-[#00D4AA] font-bold">✓</span> Time To Pet Alternative</div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-[#060E1A] py-20 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[{ value: "5,000+", label: "Dog Walkers" }, { value: "300K+", label: "Walks & Sits Booked" }, { value: "97%", label: "Client Retention Rate" }, { value: "4.9★", label: "Average Rating" }].map((s) => (
              <div key={s.label}><p className="text-4xl md:text-5xl font-black text-[#00D4AA] mb-2">{s.value}</p><p className="text-white/60 font-medium">{s.label}</p></div>
            ))}
          </div>
        </div>
      </div>

      <div className="py-32 bg-slate-50 text-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <span className="inline-block px-4 py-1.5 rounded-full bg-[#00D4AA]/10 text-[#00D4AA] text-sm font-semibold mb-4">BUILT FOR DOG WALKERS</span>
            <h2 className="text-4xl md:text-5xl font-black mb-6 tracking-tight text-[#0A2540]">Everything Your Dog Walking Business Needs</h2>
            <p className="text-slate-500 text-xl max-w-2xl mx-auto font-light">From the first booking to the last walk update — Certxa keeps pet owners happy and your business growing.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { icon: <Calendar className="w-6 h-6 text-[#00D4AA]" />, title: "Online Walk & Sit Booking", desc: "Pet owners book walks, drop-in visits, or overnight stays from your booking link any time. They pick the service, duration, and time — it's confirmed on your calendar instantly." },
              { icon: <Repeat className="w-6 h-6 text-[#00D4AA]" />, title: "Recurring Walk Schedules", desc: "Set up daily or weekly walks for your regulars and they stay on your schedule automatically. Recurring clients are your bread and butter — keep them locked in." },
              { icon: <Heart className="w-6 h-6 text-[#00D4AA]" />, title: "Dog Profiles & Health Notes", desc: "Store each dog's breed, age, temperament, leash behavior, allergies, vet contact, and any medical needs. Every pet owner will trust you more knowing you track the details." },
              { icon: <Bell className="w-6 h-6 text-[#00D4AA]" />, title: "Post-Walk Report Cards", desc: "Send owners a quick update after each walk — did the dog eat, any behavior notes, any concerns. Clients love it and it builds the kind of trust that generates referrals." },
              { icon: <MapPin className="w-6 h-6 text-[#00D4AA]" />, title: "Key & Access Instructions", desc: "Store lockbox codes, key locations, gate entry instructions, and alarm codes per client property. No scrambling before walks — everything is in the app." },
              { icon: <DollarSign className="w-6 h-6 text-[#00D4AA]" />, title: "Online Payments", desc: "Charge per walk or sell walk packages online. Clients pay by card automatically. No more cash handling, Venmo requests, or forgotten payments." },
              { icon: <Smartphone className="w-6 h-6 text-[#00D4AA]" />, title: "Walk Reminders & Notifications", desc: "Automatic reminders go to clients before each booking. SMS updates when you pick up the dog. They're always in the loop without you sending a single manual text." },
              { icon: <Users className="w-6 h-6 text-[#00D4AA]" />, title: "Client & Dog Database", desc: "All your clients and their dogs in one organized place. See booking history, spending, and special notes at a glance. Build a loyal client base that refers their neighbors." },
              { icon: <BarChart3 className="w-6 h-6 text-[#00D4AA]" />, title: "Earnings Reports", desc: "Track your weekly and monthly income, top clients, and most-booked services. Understand exactly how your dog walking business is growing month over month." },
            ].map((f) => <FeatureCard key={f.title} {...f} />)}
          </div>
        </div>
      </div>

      <HowItWorks steps={[
        { step: "01", title: "Set Up Your Walker Profile", desc: "Add your services (walks, drop-ins, overnights), pricing, available hours, and service area. Our dog walker onboarding fills in common service types automatically." },
        { step: "02", title: "Share Your Booking Link", desc: "Share it on Nextdoor, Facebook groups, your neighborhood app, or text it to neighbors. New clients book online — no phone tag, no back-and-forth." },
        { step: "03", title: "Walk, Update, Get Paid", desc: "Show up to confirmed walks, send a post-walk update from your phone, and collect payment automatically. Repeat every day with zero admin overhead." },
      ]} />

      <div className="py-32 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-black mb-6 tracking-tight text-[#0A2540]">What Dog Walkers Are Saying</h2>
            <p className="text-slate-500 text-xl max-w-2xl mx-auto font-light">Real feedback from real dog walking businesses.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <TestimonialCard quote="The post-walk report cards are my secret weapon. Clients absolutely love getting an update after every walk. My referral rate has gone through the roof." name="Jenna M." role="Owner, Happy Tails Walking" />
            <TestimonialCard quote="I have 22 regular dogs now. Before Certxa, scheduling was a nightmare. Now my calendar fills itself and I spend zero time on admin. It's incredible." name="Sam P." role="Solo Dog Walker" />
            <TestimonialCard quote="No more 'can I Venmo you?' awkwardness. Clients set up auto-pay for their weekly walks and I don't have to think about it. My income is completely predictable now." name="Tara L." role="Owner, Paws & Go" />
          </div>
        </div>
      </div>

      <CompareTable title="Why Dog Walkers Choose Certxa" subtitle="Built for independent walkers and small pet care businesses." rows={[
        ["Dog health & behavior profiles", true, false],
        ["Post-walk report card updates", true, false],
        ["Key & access instruction storage", true, false],
        ["Recurring walk scheduling", true, false],
        ["Online payments & packages", true, false],
        ["Client & pet database", true, true],
        ["Online booking page", true, true],
        ["60-day free trial", true, false],
      ]} />

      <CTASection headline="Ready to Walk More Dogs?" sub="Start your 60-day free trial. No credit card required. Cancel any time." context="Join thousands of dog walkers already using Certxa to grow their business." />
      <PageFooter />
    </div>
  );
}

function FeatureCard({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) { return <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-100 hover:shadow-md hover:-translate-y-1 transition-all duration-300"><div className="w-12 h-12 rounded-xl bg-[#00D4AA]/10 flex items-center justify-center mb-5">{icon}</div><h3 className="text-lg font-bold text-[#0A2540] mb-3">{title}</h3><p className="text-slate-500 font-light leading-relaxed">{desc}</p></div>; }
function HowItWorks({ steps }: { steps: { step: string; title: string; desc: string }[] }) { return <div className="py-32 bg-[#0A2540] text-white relative overflow-hidden"><div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#00D4AA]/10 blur-[120px] rounded-full mix-blend-screen pointer-events-none" /><div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10"><div className="text-center mb-20"><span className="inline-block px-4 py-1.5 rounded-full bg-[#00D4AA]/10 text-[#00D4AA] text-sm font-semibold mb-4">SIMPLE SETUP</span><h2 className="text-4xl md:text-5xl font-black mb-6 tracking-tight">Up and Running in Minutes</h2><p className="text-white/70 text-xl max-w-2xl mx-auto font-light">No tech skills needed.</p></div><div className="grid grid-cols-1 md:grid-cols-3 gap-10">{steps.map(({ step, title, desc }) => <div key={step} className="flex flex-col items-start gap-4"><span className="text-6xl font-black text-[#00D4AA]/20">{step}</span><h3 className="text-2xl font-bold text-white">{title}</h3><p className="text-white/60 font-light leading-relaxed">{desc}</p></div>)}</div></div></div>; }
function TestimonialCard({ quote, name, role }: { quote: string; name: string; role: string }) { return <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-100"><div className="flex gap-1 mb-4">{[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 fill-[#00D4AA] text-[#00D4AA]" />)}</div><p className="text-slate-700 font-light leading-relaxed mb-6 italic">"{quote}"</p><div><p className="font-bold text-[#0A2540]">{name}</p><p className="text-slate-500 text-sm">{role}</p></div></div>; }
function CompareTable({ title, subtitle, rows }: { title: string; subtitle: string; rows: [string, boolean, boolean][] }) { return <div className="py-32 bg-[#060E1A] text-white"><div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8"><div className="text-center mb-20"><h2 className="text-4xl md:text-5xl font-black mb-6 tracking-tight">{title}</h2><p className="text-white/70 text-xl max-w-2xl mx-auto font-light">{subtitle}</p></div><div className="rounded-3xl overflow-hidden border border-white/10"><div className="grid grid-cols-3 bg-[#0A2540] text-sm font-bold text-white/60 uppercase tracking-wider"><div className="p-5 border-b border-white/10">Feature</div><div className="p-5 border-b border-l border-white/10 text-[#00D4AA] text-center">Certxa</div><div className="p-5 border-b border-l border-white/10 text-center">Others</div></div>{rows.map(([feature, certxa, others]) => <div key={feature} className="grid grid-cols-3 border-b border-white/10 hover:bg-white/5 transition-colors"><div className="p-5 text-white/80 font-medium">{feature}</div><div className="p-5 border-l border-white/10 text-center">{certxa ? <span className="text-[#00D4AA] font-bold text-lg">✓</span> : <span className="text-white/20">—</span>}</div><div className="p-5 border-l border-white/10 text-center">{others ? <span className="text-white/60 font-bold">✓</span> : <span className="text-white/20">—</span>}</div></div>)}</div></div></div>; }
function CTASection({ headline, sub, context }: { headline: string; sub: string; context: string }) { return <div className="py-32 relative overflow-hidden bg-gradient-to-br from-[#0A2540] to-[#00D4AA]/20"><div className="absolute inset-0 bg-[#060E1A]/80 mix-blend-overlay" /><div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-3xl h-full bg-[#00D4AA]/10 blur-[100px] rounded-full" /><div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10"><div className="flex justify-center mb-6"><ShieldCheck className="w-14 h-14 text-[#00D4AA]" /></div><h2 className="text-5xl md:text-6xl font-black text-white mb-6 tracking-tight">{headline}</h2><p className="text-white/80 text-xl mb-4 max-w-2xl mx-auto font-light">{sub}</p><p className="text-white/50 text-base mb-12 max-w-xl mx-auto">{context}</p><Link to="/auth"><Button size="lg" className="h-16 px-10 text-xl rounded-full bg-[#00D4AA] hover:bg-[#00D4AA]/90 text-[#0A2540] font-bold shadow-[0_0_40px_rgba(0,212,170,0.4)] transition-all hover:scale-105">Start Free — No Credit Card Required<ArrowRight className="ml-3 w-6 h-6" /></Button></Link><p className="mt-6 text-white/40 text-sm">Questions? <a href="mailto:hello@certxa.com" className="underline hover:text-white/70 transition-colors">hello@certxa.com</a></p></div></div>; }
function PageFooter() { return <footer className="bg-[#060E1A] py-12 border-t border-white/10 relative z-30"><div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"><div className="flex flex-col md:flex-row justify-between items-center gap-6"><div className="flex items-center gap-3"><img src="/web-app.png" alt="Certxa" className="w-10 h-10 rounded-xl grayscale opacity-70" /><span className="font-bold text-2xl text-white/80 tracking-tight">Certxa</span></div><p className="text-white/40 text-sm">© 2025 Certxa. All rights reserved.</p></div><div className="mt-8 pt-8 border-t border-white/10 flex flex-wrap items-center justify-center md:justify-end gap-8"><Link to="/" className="text-sm text-white/50 hover:text-white transition-colors">Home</Link><Link to="/pricing" className="text-sm text-white/50 hover:text-white transition-colors">Pricing</Link><Link to="/privacy-policy" className="text-sm text-white/50 hover:text-white transition-colors">Privacy Policy</Link><Link to="/staff-auth" className="text-sm text-white/50 hover:text-white transition-colors">Staff Login</Link></div></div></footer>; }
