import { Calendar, Users, DollarSign, Smartphone, MapPin, Repeat, CheckCircle, BarChart3, Building2, Globe } from "lucide-react";
import IndustryLandingTemplate, { type IndustryConfig } from "./components/IndustryLandingTemplate";
import HouseCleaningHeroVideo from "./components/HouseCleaningHeroVideo";

const config: IndustryConfig = {
  badge: "🧹 Built for House Cleaning Businesses",
  headlineLine1: "Your Schedule.",
  headlineLine2: "Always Full.",
  subheadline: "Certxa lets clients book your cleaning services online, sends automatic reminders, and tracks every job and payment — so you can focus on the clean, not the paperwork.",
  heroVideo: <HouseCleaningHeroVideo />,
  trustText: "Trusted by thousands of cleaning businesses",
  competitors: ["Jobber Alternative", "HouseCall Pro Alternative", "Square Alternative"],
  stats: [
    { value: "8,000+", label: "Cleaning Businesses" },
    { value: "500K+",  label: "Jobs Booked" },
    { value: "96%",    label: "Client Retention Rate" },
    { value: "4.9★",   label: "Average Rating" },
  ],
  featuresLabel: "BUILT FOR CLEANERS",
  featuresTitle: "Everything Your Cleaning Business Needs",
  featuresSubtitle: "From your first booking to your hundredth regular client — Certxa keeps it simple.",
  features: [
    { icon: <Calendar className="w-6 h-6 text-[#00D4AA]" />,    title: "Online Booking",                 desc: "Clients book cleaning appointments from your public booking link 24/7. Specify home size, service type, and any special requests so you arrive fully prepared." },
    { icon: <Repeat className="w-6 h-6 text-[#00D4AA]" />,      title: "Recurring Job Scheduling",       desc: "Lock in weekly, bi-weekly, or monthly cleaning schedules with one booking. Recurring clients are your most valuable — Certxa keeps them on the calendar automatically." },
    { icon: <MapPin className="w-6 h-6 text-[#00D4AA]" />,      title: "Client Address & Property Notes", desc: "Store each client's address, entry instructions, pets, allergies, and special cleaning preferences. No more scrambling to remember the details before every visit." },
    { icon: <Smartphone className="w-6 h-6 text-[#00D4AA]" />,  title: "SMS & Email Reminders",          desc: "Automated reminders go out before every job so clients are home and ready. Post-job review requests build your reputation and bring in new customers." },
    { icon: <DollarSign className="w-6 h-6 text-[#00D4AA]" />,  title: "Job Invoicing & Payments",       desc: "Send digital invoices after every job. Clients pay online by card. Track paid, outstanding, and overdue balances without chasing anyone down." },
    { icon: <CheckCircle className="w-6 h-6 text-[#00D4AA]" />, title: "Job Status Tracking",            desc: "Mark jobs as confirmed, in-progress, and completed. Clients get automatic updates so they know exactly when you're on the way and when you're done." },
    { icon: <Users className="w-6 h-6 text-[#00D4AA]" />,       title: "Client Profiles & History",      desc: "Every client has a profile with all past jobs, total spend, preferred frequency, and notes. Build the kind of service that keeps people coming back year after year." },
    { icon: <BarChart3 className="w-6 h-6 text-[#00D4AA]" />,   title: "Revenue Reports",                desc: "See your weekly and monthly income at a glance. Know your busiest days, top clients, and average job value to plan your schedule for maximum earnings." },
    { icon: <Building2 className="w-6 h-6 text-[#00D4AA]" />,   title: "Multi-Staff Support",            desc: "Hiring a helper or running a small crew? Add staff to your account, assign jobs to team members, and track who completed what — all from one place." },
  ],
  featureTabs: [
    {
      label: "Scheduling",
      icon: <Calendar className="w-4 h-4" />,
      heading: "Fill your cleaning calendar automatically",
      subheading: "Set your available days, add recurring clients, and let Certxa handle the rest.",
      bullets: [
        "View all jobs, crew assignments, and recurring bookings in one calendar",
        "One-tap scheduling for weekly, bi-weekly, or monthly cleaning rotations",
        "Color-code by cleaning type, crew member, or client zone",
      ],
      mockType: "calendar",
    },
    {
      label: "Online Booking",
      icon: <Globe className="w-4 h-4" />,
      heading: "New clients find you and book instantly",
      subheading: "Share your booking link anywhere — social media, Nextdoor, Google — and clients book themselves.",
      bullets: [
        "Clients select home size, cleaning type, and any special requests when booking",
        "Instant confirmation sent by text or email with full job details",
        "Accept deposits or full payment at the time of booking",
      ],
      mockType: "booking",
    },
    {
      label: "Invoicing",
      icon: <DollarSign className="w-4 h-4" />,
      heading: "Get paid the same day, every time",
      subheading: "Send an invoice by text the moment you finish a job. No more chasing payments.",
      bullets: [
        "One-tap invoice from your phone with job details pre-filled",
        "Clients pay by card online — money in your account within 1–2 days",
        "Track outstanding balances and send payment reminders automatically",
      ],
      mockType: "invoice",
    },
    {
      label: "Client Management",
      icon: <Users className="w-4 h-4" />,
      heading: "Know every client before you walk in the door",
      subheading: "Entry codes, pets, allergies, preferences — all stored in each client's profile.",
      bullets: [
        "Property notes: address, lockbox code, pets, preferred products",
        "Full history of every past clean with dates and amounts",
        "Flag VIP regulars and see top-spending clients at a glance",
      ],
      mockType: "clients",
    },
    {
      label: "SMS Reminders",
      icon: <Smartphone className="w-4 h-4" />,
      heading: "Zero no-shows, zero wasted drives",
      subheading: "Clients get reminders, you get a heads-up if they need to reschedule — before you're in the car.",
      bullets: [
        "Automatic reminder texts 24 hrs and 2 hrs before every appointment",
        "Post-clean review requests sent automatically to build your reputation",
        "Two-way SMS so clients can confirm or reschedule without calling",
      ],
      mockType: "sms",
    },
  ],
  howItWorksSteps: [
    { step: "01", title: "Create Your Cleaning Profile", desc: "Add your services (standard clean, deep clean, move-in/out), pricing, and availability. Our onboarding takes under 5 minutes and auto-fills common cleaning service types." },
    { step: "02", title: "Share Your Booking Link",      desc: "Get your own branded booking page instantly. Share it on Nextdoor, Facebook, Google, or text it directly to neighbors — they can book and pay online any time." },
    { step: "03", title: "Show Up and Get Paid",         desc: "Your calendar fills automatically. Reminders go out on their own. After each job, Certxa sends the invoice and a review request while you're already on to the next one." },
  ],
  testimonials: [
    { quote: "I used to lose so much time texting back and forth to schedule jobs. Now clients just book online and I get a notification. It's been a game changer for my side hustle.", name: "Maria G.", role: "Owner, Sparkle Clean Co." },
    { quote: "The recurring bookings feature alone is worth it. I set up 12 weekly regulars and my calendar is basically full without me doing anything.", name: "James T.", role: "Solo Cleaner" },
    { quote: "Getting paid used to be awkward — now I just send an invoice from my phone and they pay by card. Professional and fast.", name: "Lisa R.", role: "Owner, Fresh Home Cleaning" },
  ],
  compareTitle: "Why Cleaners Choose Certxa",
  compareSubtitle: "Built for solo operators and small cleaning crews.",
  compareRows: [
    ["Recurring job scheduling",         true,  false],
    ["Client address & property notes",  true,  false],
    ["Online invoicing & card payments", true,  false],
    ["SMS reminders included",           true,  false],
    ["Job status tracking",              true,  false],
    ["Multi-staff support",              true,  true ],
    ["Online booking page",              true,  true ],
    ["60-day free trial",                true,  false],
  ],
  faqs: [
    { q: "Can clients book recurring cleaning schedules online?", a: "Yes. When clients book through your link they can select weekly, bi-weekly, or monthly frequency and Certxa automatically locks in all future appointments." },
    { q: "Do I need a card reader to accept payments?", a: "No. Clients pay through a secure online link — no hardware needed. The money goes directly to your bank account within 1–2 business days." },
    { q: "Can I manage a team of cleaners?", a: "Yes. You can add multiple cleaners to your account, assign specific jobs to each person, and view everyone's schedule from one calendar." },
    { q: "What if a client needs to reschedule?", a: "Clients can request a reschedule through their confirmation text. You'll be notified immediately and can approve a new time with one tap." },
    { q: "How do I share my booking page?", a: "Certxa gives you a custom booking link (e.g., certxa.com/book/your-business). You can share it on social media, Nextdoor, Google Business Profile, or text it directly to customers." },
    { q: "Is there a limit to how many clients I can have?", a: "No limits. Whether you have 5 or 500 clients, Certxa handles all of them at no extra cost per client." },
  ],
  ctaHeadline: "Ready to Fill Your Calendar?",
  ctaSub: "Start your 60-day free trial. No credit card required. Cancel any time.",
  ctaContext: "Join thousands of cleaning businesses already using Certxa.",
};

export default function HouseCleaningLanding() {
  return <IndustryLandingTemplate config={config} />;
}
