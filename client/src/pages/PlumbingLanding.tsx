import { Calendar, Users, DollarSign, Smartphone, Wrench, CheckCircle, BarChart3, Zap, Globe, Camera } from "lucide-react";
import IndustryLandingTemplate, { type IndustryConfig } from "./components/IndustryLandingTemplate";
import DarkHeroBackground from "./components/DarkHeroBackground";

const config: IndustryConfig = {
  badge: "🚿 Built for Plumbers & Plumbing Contractors",
  headlineLine1: "Every Call.",
  headlineLine2: "Fast Response.",
  subheadline: "Certxa handles emergency dispatch, online booking, job-site photos, itemized invoicing, and client history — so you can keep the water flowing and the bills paid.",
  heroVideo: <DarkHeroBackground />,
  trustText: "Trusted by thousands of plumbing contractors",
  competitors: ["ServiceTitan Alternative", "Housecall Pro Alternative", "Jobber Alternative"],
  stats: [
    { value: "7,000+", label: "Plumbing Contractors" },
    { value: "500K+",  label: "Service Calls Handled" },
    { value: "89%",    label: "Same-Day Job Rate" },
    { value: "4.9★",   label: "Average Rating" },
  ],
  featuresLabel: "BUILT FOR PLUMBERS",
  featuresTitle: "Everything Your Plumbing Business Needs",
  featuresSubtitle: "From leaky faucets to full pipe replacements — Certxa keeps every job booked, documented, and paid.",
  features: [
    { icon: <Zap className="w-6 h-6 text-[#00D4AA]" />,         title: "Emergency Dispatch",             desc: "Burst pipe, no hot water, sewage backup — clients flag emergencies when they book. You see them instantly and dispatch the nearest available plumber within minutes." },
    { icon: <Calendar className="w-6 h-6 text-[#00D4AA]" />,    title: "Online Service Booking",         desc: "Homeowners and property managers book routine plumbing service online any time. They describe the issue, select the job type, and pick a time window that works." },
    { icon: <Camera className="w-6 h-6 text-[#00D4AA]" />,      title: "Job-Site Photos",                desc: "Plumbers capture before and after photos from their phone at every job. Photos are saved to the client record — essential for liability, insurance, and warranty claims." },
    { icon: <Wrench className="w-6 h-6 text-[#00D4AA]" />,      title: "Parts & Material Tracking",      desc: "Log parts used at each job with part numbers and costs. Build accurate invoices that account for every fitting, pipe section, and fixture installed." },
    { icon: <DollarSign className="w-6 h-6 text-[#00D4AA]" />,  title: "Itemized Invoicing & Payments",  desc: "Itemize labor, materials, diagnostic fees, and permits. Clients pay by card on-site or via a pay link. No more net-30 waits or paper invoices left at the door." },
    { icon: <Smartphone className="w-6 h-6 text-[#00D4AA]" />,  title: "SMS Client Communication",       desc: "On-my-way texts, arrival windows, and job completion notifications go out automatically. Clients stay informed without tying up your office line." },
    { icon: <CheckCircle className="w-6 h-6 text-[#00D4AA]" />, title: "Job Sign-Off & Notes",           desc: "Plumbers complete a job checklist, add notes on findings, and capture client sign-off from their phone before leaving. Full documentation in seconds." },
    { icon: <Users className="w-6 h-6 text-[#00D4AA]" />,       title: "Multi-Plumber Dispatch",         desc: "Assign jobs to specific plumbers based on location, skill, and workload. See every tech's full schedule and adjust on the fly when emergencies come in." },
    { icon: <BarChart3 className="w-6 h-6 text-[#00D4AA]" />,   title: "Job & Revenue Reports",          desc: "Track total calls, revenue by job type, average ticket size, and busiest service areas. Make data-driven decisions on hiring, pricing, and marketing." },
  ],
  featureTabs: [
    {
      label: "Scheduling",
      icon: <Calendar className="w-4 h-4" />,
      heading: "Emergency and scheduled calls in one board",
      subheading: "See every open job, assigned plumber, and time window — prioritize emergencies without losing track of the rest.",
      bullets: [
        "Emergency jobs flagged with priority status visible across the whole dispatch board",
        "Assign jobs to plumbers by proximity or specialty (residential/commercial)",
        "Drag and adjust the day's schedule as new calls come in",
      ],
      mockType: "calendar",
    },
    {
      label: "Online Booking",
      icon: <Globe className="w-4 h-4" />,
      heading: "Clients describe the issue and book a window online",
      subheading: "Routine calls book themselves. Your office only handles what truly needs human intervention.",
      bullets: [
        "Clients select job type, describe the issue, and attach photos if needed",
        "Emergency option routes urgent calls straight to your priority queue",
        "Instant confirmation with plumber name and arrival window by text",
      ],
      mockType: "booking",
    },
    {
      label: "Invoicing",
      icon: <DollarSign className="w-4 h-4" />,
      heading: "Parts, labor, and fees — one invoice on the spot",
      subheading: "Plumbers build itemized invoices from their phone before they leave the job site.",
      bullets: [
        "Add parts with quantities and costs, labor hours, and travel/diagnostic fees",
        "Send invoice by text and collect card payment on the spot",
        "Issue warranty documentation tied to the invoice for any installed parts",
      ],
      mockType: "invoice",
    },
    {
      label: "Client Management",
      icon: <Users className="w-4 h-4" />,
      heading: "Full property history before you turn a wrench",
      subheading: "Prior repairs, pipe materials, water heater age, shutoff locations — all stored per property.",
      bullets: [
        "Property notes: pipe material, water heater model, main shutoff location",
        "Full service history with dates, work done, parts installed, and photos",
        "Flag high-value or repeat clients for priority booking and follow-up",
      ],
      mockType: "clients",
    },
    {
      label: "SMS Reminders",
      icon: <Smartphone className="w-4 h-4" />,
      heading: "Clients always know when help is coming",
      subheading: "Automatic texts from booking to job completion — no more 'where's the plumber?' calls.",
      bullets: [
        "Appointment confirmation sent immediately upon booking",
        "On-my-way text with plumber name and ETA when dispatched",
        "Post-job summary with what was done and any recommended follow-up work",
      ],
      mockType: "sms",
    },
  ],
  howItWorksSteps: [
    { step: "01", title: "Set Up Your Service List",   desc: "Add your plumbing services — leak repair, drain cleaning, water heater install, full repiping — with pricing and response time windows. Setup takes under 10 minutes." },
    { step: "02", title: "Share Your Booking Link",    desc: "Put it on your website, Google Business, or send it to property managers. Routine calls book online. Emergency requests flag for immediate attention." },
    { step: "03", title: "Dispatch, Document, Invoice", desc: "Plumbers arrive prepared, complete the job, capture photos, build the invoice, and collect payment on-site. The whole job is documented and closed in minutes." },
  ],
  testimonials: [
    { quote: "Before Certxa, I was losing emergency jobs to guys who had easier online booking. Now I have a form that captures exactly what the problem is and I can dispatch in 3 minutes.", name: "Rob M.", role: "Owner, FlowPro Plumbing" },
    { quote: "The photo documentation has saved me twice in warranty disputes. I have timestamped photos of every job. Customers can't argue with that.", name: "Linda K.", role: "Owner, ClearLine Plumbing" },
    { quote: "My best plumber hated doing paperwork. Now he invoices from his phone and clients pay before he's even back in the truck. Changed his whole attitude.", name: "Steve P.", role: "Operations Manager, Pipe Kings" },
  ],
  compareTitle: "Why Plumbers Choose Certxa",
  compareSubtitle: "Built for independent plumbers and small-to-mid plumbing companies.",
  compareRows: [
    ["Emergency call priority dispatch",    true,  false],
    ["Job-site photo documentation",        true,  false],
    ["Parts & material tracking",           true,  false],
    ["Itemized invoicing on-site",          true,  false],
    ["Full property service history",       true,  false],
    ["Multi-plumber dispatch",              true,  true ],
    ["Online booking page",                 true,  true ],
    ["60-day free trial",                   true,  false],
  ],
  faqs: [
    { q: "How does emergency booking work?", a: "Clients can flag their booking as an emergency (burst pipe, gas smell, sewage backup). It immediately appears as a priority job on your dispatch board. You can also add emergency jobs manually for phone-in calls." },
    { q: "Can plumbers take photos and attach them to jobs?", a: "Yes. Technicians can capture before and after photos directly from the Certxa mobile interface. Photos are saved to the job record and the client's property history." },
    { q: "Can I track parts and materials used at each job?", a: "Yes. Plumbers can add parts with quantities and unit costs to each job. This automatically builds an itemized invoice and updates your parts cost records." },
    { q: "Can property managers book service for multiple properties?", a: "Yes. Property managers can have a single account with multiple properties listed. Each property has its own address, notes, and service history." },
    { q: "Do clients need an app to pay their invoice?", a: "No. Clients receive a payment link by text. They pay online by card in a browser — no app download required. Payment is processed securely and you're notified immediately." },
    { q: "Can I handle both residential and commercial plumbing jobs?", a: "Yes. Certxa works for both. Commercial accounts can have multiple contacts per property and higher-complexity job notes, while residential jobs stay simple and fast." },
  ],
  ctaHeadline: "Ready to Answer Every Call?",
  ctaSub: "Start your 60-day free trial. No credit card required. Cancel any time.",
  ctaContext: "Join thousands of plumbing contractors already using Certxa.",
  industryId: "plumbing",
};

export default function PlumbingLanding() {
  return <IndustryLandingTemplate config={config} />;
}
