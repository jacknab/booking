import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Calendar, Users, DollarSign,  Smartphone, Star, ShieldCheck, Repeat, CheckCircle, BarChart3, Clock, BookOpen, Video } from "lucide-react";
import { motion } from "framer-motion";
import { useEffect } from "react";
import TutoringHeroVideo from "./components/TutoringHeroVideo";

export default function TutoringLanding() {
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
              <Link to="/auth?mode=register"><Button className="bg-[#00D4AA] hover:bg-[#00D4AA]/90 text-[#0A2540] font-bold px-6 rounded-full">Get Started</Button></Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-[#060E1A]">
        <div className="absolute inset-0 z-0"><TutoringHeroVideo /></div>
        <div className="absolute inset-0 bg-gradient-to-b from-[#060E1A]/30 via-[#060E1A]/10 to-[#060E1A]/60 z-10" />
        <div className="relative z-20 text-center max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 mt-20">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20 backdrop-blur-md mb-8">
            <span className="flex h-2 w-2 rounded-full bg-[#00D4AA] animate-pulse" />
            <span className="text-sm font-medium text-white/90">📚 Built for Tutors & Educators</span>
          </motion.div>
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }} className="text-6xl md:text-7xl lg:text-8xl font-black text-white mb-6 tracking-tight leading-[1.1]">
            Your Students.<br /><span className="text-[#00D4AA]">Always Learning.</span>
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }} className="text-lg md:text-xl text-white/80 mb-10 max-w-3xl mx-auto leading-relaxed font-light">
            Certxa lets students and parents book sessions online, manages your weekly schedule, sends automatic reminders, and handles payment — so you can focus on teaching, not logistics.
          </motion.p>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.3 }} className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <Link to="/auth?mode=register"><Button size="lg" className="h-14 px-8 text-lg rounded-full bg-[#00D4AA] hover:bg-[#00D4AA]/90 text-[#0A2540] font-bold shadow-[0_0_30px_rgba(0,212,170,0.3)] transition-all hover:scale-105">Start Free Trial<ArrowRight className="ml-2 w-5 h-5" /></Button></Link>
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
            <p className="text-white/80 font-medium text-lg flex items-center gap-3"><span className="relative flex h-3 w-3"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00D4AA] opacity-75" /><span className="relative inline-flex rounded-full h-3 w-3 bg-[#00D4AA]" /></span>Trusted by thousands of tutors and educators</p>
            <div className="flex flex-wrap justify-center gap-8 text-white/60 font-medium text-sm md:text-base">
              <div className="flex items-center gap-2"><span className="text-[#00D4AA] font-bold">✓</span> Calendly Alternative</div>
              <div className="flex items-center gap-2"><span className="text-[#00D4AA] font-bold">✓</span> Acuity Alternative</div>
              <div className="flex items-center gap-2"><span className="text-[#00D4AA] font-bold">✓</span> TutorBird Alternative</div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-[#060E1A] py-20 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[{ value: "7,000+", label: "Tutors & Educators" }, { value: "350K+", label: "Sessions Booked" }, { value: "93%", label: "Student Retention" }, { value: "4.9★", label: "Average Rating" }].map((s) => (
              <div key={s.label}><p className="text-4xl md:text-5xl font-black text-[#00D4AA] mb-2">{s.value}</p><p className="text-white/60 font-medium">{s.label}</p></div>
            ))}
          </div>
        </div>
      </div>

      <div className="py-32 bg-slate-50 text-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <span className="inline-block px-4 py-1.5 rounded-full bg-[#00D4AA]/10 text-[#00D4AA] text-sm font-semibold mb-4">BUILT FOR TUTORS</span>
            <h2 className="text-4xl md:text-5xl font-black mb-6 tracking-tight text-[#0A2540]">Everything Your Tutoring Business Needs</h2>
            <p className="text-slate-500 text-xl max-w-2xl mx-auto font-light">Spend more time teaching and less time coordinating schedules and chasing payments.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { icon: <Calendar className="w-6 h-6 text-[#00D4AA]" />, title: "Online Session Booking", desc: "Students and parents book sessions from your public booking link. They pick the subject, session length, and available time slot — everything lands on your calendar automatically." },
              { icon: <Repeat className="w-6 h-6 text-[#00D4AA]" />, title: "Weekly Recurring Sessions", desc: "Lock in weekly or bi-weekly students with recurring bookings. Your regulars stay on the calendar for the whole semester without re-booking every week." },
              { icon: <BookOpen className="w-6 h-6 text-[#00D4AA]" />, title: "Student Profiles & Progress Notes", desc: "Track each student's subject, grade level, strengths, weaknesses, and session notes in their profile. Walk into every lesson knowing exactly where they left off." },
              { icon: <Smartphone className="w-6 h-6 text-[#00D4AA]" />, title: "Session Reminders", desc: "Automated reminders to students and parents before every session. Dramatically reduce no-shows and last-minute cancellations without a single manual text." },
              { icon: <DollarSign className="w-6 h-6 text-[#00D4AA]" />, title: "Session Invoicing & Payments", desc: "Charge per session, per hour, or sell session packages. Clients pay by card online. No more awkward conversations about payment or waiting to be paid." },
              { icon: <Video className="w-6 h-6 text-[#00D4AA]" />, title: "In-Person & Online Sessions", desc: "Offer both in-home tutoring and virtual sessions. Students pick their preferred format when booking. Your calendar handles both without any extra setup." },
              { icon: <CheckCircle className="w-6 h-6 text-[#00D4AA]" />, title: "Session Completion Tracking", desc: "Mark sessions completed, note any homework assigned, and track attendance across your full student roster. Spot who's falling behind in consistency." },
              { icon: <BarChart3 className="w-6 h-6 text-[#00D4AA]" />, title: "Income Reports", desc: "See your total sessions, revenue per week or month, and most-booked subjects. Understand which parts of your tutoring business are growing fastest." },
              { icon: <Clock className="w-6 h-6 text-[#00D4AA]" />, title: "Availability Management", desc: "Set your weekly available hours and blocked times. Students can only book when you're actually free — no more back-and-forth to find a slot that works." },
            ].map((f) => <FeatureCard key={f.title} {...f} />)}
          </div>
        </div>
      </div>

      <HowItWorks steps={[
        { step: "01", title: "Set Up Your Tutor Profile", desc: "Add your subjects, session lengths, hourly rate or package pricing, and available hours. Our tutoring onboarding fills in common subjects and session types automatically." },
        { step: "02", title: "Share Your Booking Link", desc: "Share it with school parents, post on community boards, add to your teacher profile, or put it in your email signature. Students book sessions without back-and-forth." },
        { step: "03", title: "Teach, Track, and Get Paid", desc: "Show up to confirmed sessions, log notes and progress afterward, and collect payment automatically. Your tutoring business runs like clockwork." },
      ]} />

      <div className="py-32 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-black mb-6 tracking-tight text-[#0A2540]">What Tutors Are Saying</h2>
            <p className="text-slate-500 text-xl max-w-2xl mx-auto font-light">Real feedback from real educators and tutors.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <TestimonialCard quote="Parents used to text me at all hours to schedule sessions. Now they just book online and I get a notification. My personal time actually feels personal again." name="Sarah K." role="Math & Science Tutor" />
            <TestimonialCard quote="The student progress notes are something I didn't know I needed. Walking into every session knowing exactly where the student is at has made me a better tutor." name="Michael P." role="SAT Prep Specialist" />
            <TestimonialCard quote="Online payments changed everything. I used to forget to collect half the time. Now it's automatic and I make 30% more per month just from not letting sessions slip by unpaid." name="Nia J." role="Reading & Writing Coach" />
          </div>
        </div>
      </div>

      <CompareTable title="Why Tutors Choose Certxa" subtitle="Purpose-built for independent tutors and small teaching practices." rows={[
        ["Weekly recurring session booking", true, false],
        ["Student progress notes & history", true, false],
        ["In-person & online session types", true, false],
        ["Automatic parent/student reminders", true, false],
        ["Online invoicing & card payments", true, false],
        ["Session package pricing", true, true],
        ["Online booking page", true, true],
        ["60-day free trial", true, false],
      ]} />

      <CTASection headline="Ready to Fill Your Teaching Schedule?" sub="Start your 60-day free trial. No credit card required. Cancel any time." context="Join thousands of tutors already using Certxa to grow their practice." />
      <PageFooter />
    </div>
  );
}

function FeatureCard({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) { return <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-100 hover:shadow-md hover:-translate-y-1 transition-all duration-300"><div className="w-12 h-12 rounded-xl bg-[#00D4AA]/10 flex items-center justify-center mb-5">{icon}</div><h3 className="text-lg font-bold text-[#0A2540] mb-3">{title}</h3><p className="text-slate-500 font-light leading-relaxed">{desc}</p></div>; }
function HowItWorks({ steps }: { steps: { step: string; title: string; desc: string }[] }) { return <div className="py-32 bg-[#0A2540] text-white relative overflow-hidden"><div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#00D4AA]/10 blur-[120px] rounded-full mix-blend-screen pointer-events-none" /><div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10"><div className="text-center mb-20"><span className="inline-block px-4 py-1.5 rounded-full bg-[#00D4AA]/10 text-[#00D4AA] text-sm font-semibold mb-4">SIMPLE SETUP</span><h2 className="text-4xl md:text-5xl font-black mb-6 tracking-tight">Up and Running in Minutes</h2><p className="text-white/70 text-xl max-w-2xl mx-auto font-light">No tech skills needed.</p></div><div className="grid grid-cols-1 md:grid-cols-3 gap-10">{steps.map(({ step, title, desc }) => <div key={step} className="flex flex-col items-start gap-4"><span className="text-6xl font-black text-[#00D4AA]/20">{step}</span><h3 className="text-2xl font-bold text-white">{title}</h3><p className="text-white/60 font-light leading-relaxed">{desc}</p></div>)}</div></div></div>; }
function TestimonialCard({ quote, name, role }: { quote: string; name: string; role: string }) { return <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-100"><div className="flex gap-1 mb-4">{[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 fill-[#00D4AA] text-[#00D4AA]" />)}</div><p className="text-slate-700 font-light leading-relaxed mb-6 italic">"{quote}"</p><div><p className="font-bold text-[#0A2540]">{name}</p><p className="text-slate-500 text-sm">{role}</p></div></div>; }
function CompareTable({ title, subtitle, rows }: { title: string; subtitle: string; rows: [string, boolean, boolean][] }) { return <div className="py-32 bg-[#060E1A] text-white"><div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8"><div className="text-center mb-20"><h2 className="text-4xl md:text-5xl font-black mb-6 tracking-tight">{title}</h2><p className="text-white/70 text-xl max-w-2xl mx-auto font-light">{subtitle}</p></div><div className="rounded-3xl overflow-hidden border border-white/10"><div className="grid grid-cols-3 bg-[#0A2540] text-sm font-bold text-white/60 uppercase tracking-wider"><div className="p-5 border-b border-white/10">Feature</div><div className="p-5 border-b border-l border-white/10 text-[#00D4AA] text-center">Certxa</div><div className="p-5 border-b border-l border-white/10 text-center">Others</div></div>{rows.map(([feature, certxa, others]) => <div key={feature} className="grid grid-cols-3 border-b border-white/10 hover:bg-white/5 transition-colors"><div className="p-5 text-white/80 font-medium">{feature}</div><div className="p-5 border-l border-white/10 text-center">{certxa ? <span className="text-[#00D4AA] font-bold text-lg">✓</span> : <span className="text-white/20">—</span>}</div><div className="p-5 border-l border-white/10 text-center">{others ? <span className="text-white/60 font-bold">✓</span> : <span className="text-white/20">—</span>}</div></div>)}</div></div></div>; }
function CTASection({ headline, sub, context }: { headline: string; sub: string; context: string }) { return <div className="py-32 relative overflow-hidden bg-gradient-to-br from-[#0A2540] to-[#00D4AA]/20"><div className="absolute inset-0 bg-[#060E1A]/80 mix-blend-overlay" /><div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-3xl h-full bg-[#00D4AA]/10 blur-[100px] rounded-full" /><div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10"><div className="flex justify-center mb-6"><ShieldCheck className="w-14 h-14 text-[#00D4AA]" /></div><h2 className="text-5xl md:text-6xl font-black text-white mb-6 tracking-tight">{headline}</h2><p className="text-white/80 text-xl mb-4 max-w-2xl mx-auto font-light">{sub}</p><p className="text-white/50 text-base mb-12 max-w-xl mx-auto">{context}</p><Link to="/auth?mode=register"><Button size="lg" className="h-16 px-10 text-xl rounded-full bg-[#00D4AA] hover:bg-[#00D4AA]/90 text-[#0A2540] font-bold shadow-[0_0_40px_rgba(0,212,170,0.4)] transition-all hover:scale-105">Start Free — No Credit Card Required<ArrowRight className="ml-3 w-6 h-6" /></Button></Link><p className="mt-6 text-white/40 text-sm">Questions? <a href="mailto:hello@certxa.com" className="underline hover:text-white/70 transition-colors">hello@certxa.com</a></p></div></div>; }
function PageFooter() { return <footer className="bg-[#060E1A] py-12 border-t border-white/10 relative z-30"><div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"><div className="flex flex-col md:flex-row justify-between items-center gap-6"><div className="flex items-center gap-3"><img src="/web-app.png" alt="Certxa" className="w-10 h-10 rounded-xl grayscale opacity-70" /><span className="font-bold text-2xl text-white/80 tracking-tight">Certxa</span></div><p className="text-white/40 text-sm">© 2025 Certxa. All rights reserved.</p></div><div className="mt-8 pt-8 border-t border-white/10 flex flex-wrap items-center justify-center md:justify-end gap-8"><Link to="/" className="text-sm text-white/50 hover:text-white transition-colors">Home</Link><Link to="/pricing" className="text-sm text-white/50 hover:text-white transition-colors">Pricing</Link><Link to="/privacy-policy" className="text-sm text-white/50 hover:text-white transition-colors">Privacy Policy</Link><Link to="/staff-auth" className="text-sm text-white/50 hover:text-white transition-colors">Staff Login</Link></div></div></footer>; }
