import { Calendar, Users, DollarSign, Smartphone, MapPin, Wrench, CheckCircle, BarChart3, Building2, Globe, Check } from "lucide-react";
import IndustryLandingTemplate, { type IndustryConfig } from "./components/IndustryLandingTemplate";
import HandymanHeroVideo from "./components/HandymanHeroVideo";

const config: IndustryConfig = {
  badge: "🔧 Built for Handymen & Tradespeople",
  headlineLine1: "Your Jobs.",
  headlineLine2: "All Lined Up.",
  subheadline: "Certxa lets homeowners book your services online, auto-confirms jobs, and handles invoicing — so you can spend more time fixing things and less time on the phone.",
  heroVideo: <HandymanHeroVideo />,
  trustText: "Trusted by thousands of handymen & contractors",
  competitors: ["Jobber Alternative", "Thumbtack Alternative", "Angi Alternative"],
  stats: [
    { value: "12,000+", label: "Handymen & Contractors" },
    { value: "800K+",   label: "Jobs Booked" },
    { value: "94%",     label: "Repeat Client Rate" },
    { value: "4.9★",    label: "Average Rating" },
  ],
  featuresLabel: "BUILT FOR HANDYMEN",
  featuresTitle: "Everything Your Trade Business Needs",
  featuresSubtitle: "Stop juggling texts and calls. Let Certxa handle the booking and billing so you can stay on the job.",
  features: [
    { icon: <Calendar className="w-6 h-6 text-[#00D4AA]" />,    title: "Online Job Booking",        desc: "Homeowners book your services online any time. They select the job type, describe the issue, and pick a time that works — you get a notification and it's on your calendar." },
    { icon: <MapPin className="w-6 h-6 text-[#00D4AA]" />,      title: "Job Site Notes & History",  desc: "Store property addresses, access instructions, photos from past visits, and notes on ongoing projects per client. Never show up without context again." },
    { icon: <Wrench className="w-6 h-6 text-[#00D4AA]" />,      title: "Service Catalog",           desc: "List all your services — plumbing, electrical, drywall, painting, assembly — with flat rates or custom quotes. Clients know exactly what you offer and what it costs." },
    { icon: <DollarSign className="w-6 h-6 text-[#00D4AA]" />,  title: "Invoicing & Payments",      desc: "Generate invoices from your phone after every job. Clients pay by card online. No more awkward cash conversations or waiting weeks to get paid." },
    { icon: <Smartphone className="w-6 h-6 text-[#00D4AA]" />,  title: "SMS Reminders",             desc: "Automatic appointment reminders go to clients so they're home when you arrive. Reduce wasted trips and no-shows with zero effort on your part." },
    { icon: <CheckCircle className="w-6 h-6 text-[#00D4AA]" />, title: "Job Status Tracking",       desc: "Move jobs from scheduled to on-the-way, in-progress, and completed. Clients get real-time updates so they're never left wondering when you'll show up." },
    { icon: <Users className="w-6 h-6 text-[#00D4AA]" />,       title: "Client Database",           desc: "Every homeowner has a profile with job history, total spend, and property notes. Returning clients feel known and taken care of — which means more referrals." },
    { icon: <BarChart3 className="w-6 h-6 text-[#00D4AA]" />,   title: "Earnings Tracking",         desc: "See your weekly revenue, busiest service types, and top-paying clients at a glance. Know exactly how your side gig or full business is growing month over month." },
    { icon: <Building2 className="w-6 h-6 text-[#00D4AA]" />,   title: "Multi-Staff Support",       desc: "Running a crew? Add your guys to the account, assign jobs to each person, and get a bird's eye view of everyone's schedule from one dashboard." },
  ],
  featureTabs: [
    {
      label: "Scheduling",
      icon: <Calendar className="w-4 h-4" />,
      heading: "Handyman scheduling that runs itself",
      subheading: "See every job, every crew member, and every time slot in one view — drag, drop, and go.",
      bullets: [
        "Drag-and-drop calendar with color-coded job types and crew assignments",
        "Instant job confirmation sent to homeowners as soon as you approve",
        "Block off personal time and set custom working hours per day",
      ],
      mockType: "calendar",
    },
    {
      label: "Online Booking",
      icon: <Globe className="w-4 h-4" />,
      heading: "Homeowners book you 24/7 — no calls",
      subheading: "Share your link on Facebook, Nextdoor, or Google Business and new clients book themselves.",
      bullets: [
        "Custom booking page with your services, pricing, and availability",
        "Clients describe the job, upload photos, and pick their time slot",
        "Automatic confirmation and calendar sync with zero manual work",
      ],
      mockType: "booking",
    },
    {
      label: "Invoicing",
      icon: <DollarSign className="w-4 h-4" />,
      heading: "Invoice from your phone, get paid the same day",
      subheading: "Tap to send an invoice the moment the job is done. Clients pay by card instantly.",
      bullets: [
        "Add labor, materials, and tip in seconds — invoice sent by text or email",
        "Clients pay by card online — no cash, no Venmo, no waiting",
        "Full payment history and outstanding balance tracker per client",
      ],
      mockType: "invoice",
    },
    {
      label: "Client Management",
      icon: <Users className="w-4 h-4" />,
      heading: "Every client's history in your pocket",
      subheading: "Property notes, past jobs, photos, and spending — all tied to one client profile.",
      bullets: [
        "Property address, entry instructions, and job-site photos per client",
        "Full job history with dates, services, and amounts paid",
        "See top-spending clients and follow up with repeat booking prompts",
      ],
      mockType: "clients",
    },
    {
      label: "SMS Reminders",
      icon: <Smartphone className="w-4 h-4" />,
      heading: "No more no-shows or wasted trips",
      subheading: "Automated texts keep your clients in the loop from booking to job completion.",
      bullets: [
        "Reminder texts 24 hours and 1 hour before every appointment",
        "On-my-way notifications sent when you're heading to the job",
        "Automatic review requests after every completed job",
      ],
      mockType: "sms",
    },
  ],
  howItWorksSteps: [
    { step: "01", title: "List Your Services",      desc: "Add what you do — plumbing fixes, furniture assembly, painting, etc. — with your rates and availability. Our handyman onboarding fills in common trade services automatically." },
    { step: "02", title: "Share Your Booking Link", desc: "Post it on Facebook, Nextdoor, Google Business, or your truck door. Homeowners book directly without calling. You approve and it's locked in." },
    { step: "03", title: "Work and Get Paid",       desc: "Show up to confirmed jobs, complete the work, send the invoice from your phone, and collect payment — all without any back-and-forth paperwork." },
  ],
  testimonials: [
    { quote: "I used to miss calls and lose jobs to guys who answered faster. Now clients just book online and I get every one of them. Best decision I made for my business.", name: "Dave K.", role: "Solo Handyman" },
    { quote: "The online invoicing is huge. I used to get paid weeks late. Now clients pay the same day with a card. My cash flow is completely different.", name: "Tony P.", role: "Owner, Fix-It Pro" },
    { quote: "I added my two guys as staff and now I can see all three of our schedules in one place. No more double-booking or confusion about who's going where.", name: "Marcus W.", role: "Owner, Home Repair Co." },
  ],
  compareTitle: "Why Handymen Choose Certxa",
  compareSubtitle: "Simple booking and billing built for tradespeople, not enterprise contractors.",
  compareRows: [
    ["Online job booking page",          true,  false],
    ["Client property notes & history",  true,  false],
    ["Online invoicing & card payments", true,  false],
    ["SMS reminders included",           true,  false],
    ["Job status tracking",              true,  false],
    ["Multi-staff scheduling",           true,  true ],
    ["Earnings reporting",               true,  true ],
    ["60-day free trial",                true,  false],
  ],
  faqs: [
    { q: "Do my clients need to download an app to book me?", a: "No. Clients book through a simple web link you share. There's nothing to install — it works on any phone or computer in a regular browser." },
    { q: "Can I accept payments without a credit card reader?", a: "Yes. Certxa sends digital invoices by text or email and clients pay online with a card. No card reader or hardware needed." },
    { q: "What if I work across multiple trades (plumbing and electrical)?", a: "You can list as many services as you want under your profile. Each service can have its own pricing, duration, and description, so clients know exactly what they're booking." },
    { q: "Can I add an employee or helper to my account?", a: "Yes. You can add staff members, assign them to specific jobs, and see all their schedules alongside yours on the same calendar." },
    { q: "How long does it take to set up?", a: "Most handymen are fully set up in under 10 minutes. Our onboarding pre-fills common trade services so you're not starting from scratch." },
    { q: "Is there a contract or can I cancel any time?", a: "No contracts. You can cancel Certxa at any time. Your 60-day free trial starts automatically with no credit card required." },
  ],
  ctaHeadline: "Ready to Line Up More Jobs?",
  ctaSub: "Start your 60-day free trial. No credit card required. Cancel any time.",
  ctaContext: "Join thousands of handymen and contractors already using Certxa.",
};

export default function HandymanLanding() {
  return <IndustryLandingTemplate config={config} />;
}
