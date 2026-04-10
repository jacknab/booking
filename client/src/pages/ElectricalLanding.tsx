import { Calendar, Users, DollarSign, Smartphone, Wrench, CheckCircle, BarChart3, Zap, Globe, FileText } from "lucide-react";
import IndustryLandingTemplate, { type IndustryConfig } from "./components/IndustryLandingTemplate";
import DarkHeroBackground from "./components/DarkHeroBackground";

const config: IndustryConfig = {
  badge: "⚡ Built for Electricians & Electrical Contractors",
  headlineLine1: "Every Circuit.",
  headlineLine2: "Every Client.",
  subheadline: "Certxa handles online booking, permit tracking, team dispatch, itemized quoting, and invoicing — so you can run a tight electrical operation without drowning in paperwork.",
  heroVideo: <DarkHeroBackground />,
  trustText: "Trusted by thousands of electrical contractors",
  competitors: ["ServiceTitan Alternative", "Jobber Alternative", "FieldPulse Alternative"],
  stats: [
    { value: "6,500+", label: "Electrical Contractors" },
    { value: "420K+",  label: "Jobs Completed" },
    { value: "91%",    label: "Client Rebooking Rate" },
    { value: "4.9★",   label: "Average Rating" },
  ],
  featuresLabel: "BUILT FOR ELECTRICIANS",
  featuresTitle: "Everything Your Electrical Business Needs",
  featuresSubtitle: "From outlet replacements to full panel upgrades — Certxa keeps every job organized, permitted, and paid.",
  features: [
    { icon: <Calendar className="w-6 h-6 text-[#00D4AA]" />,    title: "Online Service Booking",         desc: "Homeowners and contractors book electrical services online any time. They describe the work needed, pick a time window, and land directly on your dispatch calendar." },
    { icon: <FileText className="w-6 h-6 text-[#00D4AA]" />,    title: "Permit & License Notes",         desc: "Log permit numbers, inspection dates, and license notes per job. Stay compliant and have a complete paper trail for every permitted project." },
    { icon: <Wrench className="w-6 h-6 text-[#00D4AA]" />,      title: "Detailed Job Scoping",           desc: "Document scope before you start — panel size, circuit count, fixture types, wire gauge, and equipment list. No surprises mid-job and no disputes on invoice day." },
    { icon: <DollarSign className="w-6 h-6 text-[#00D4AA]" />,  title: "Itemized Quoting & Invoicing",   desc: "Generate accurate quotes on-site based on scope and materials. Convert quotes to invoices in one tap and collect card payment before you pack up." },
    { icon: <Zap className="w-6 h-6 text-[#00D4AA]" />,         title: "Emergency Call Handling",        desc: "No power, tripped breaker, sparking outlet — emergency flags get your fastest available electrician dispatched same-day with the context they need." },
    { icon: <Smartphone className="w-6 h-6 text-[#00D4AA]" />,  title: "Tech & Client SMS",              desc: "Automatic texts to techs and clients at every stage — booking confirmation, on-my-way, job complete. Everyone stays informed with zero phone calls." },
    { icon: <CheckCircle className="w-6 h-6 text-[#00D4AA]" />, title: "Job Completion Documentation",   desc: "Electricians document work performed, materials installed, and any findings. Client sign-off captured before leaving. Full record saved to the job history." },
    { icon: <Users className="w-6 h-6 text-[#00D4AA]" />,       title: "Crew & Apprentice Management",  desc: "Schedule journeymen, apprentices, and inspectors across jobs. Assign the right skill level to each project and see every team member's workload at a glance." },
    { icon: <BarChart3 className="w-6 h-6 text-[#00D4AA]" />,   title: "Revenue & Job Reports",          desc: "Track total revenue, average ticket, revenue by service type, and busiest months. Make confident decisions on pricing and staffing with real data." },
  ],
  featureTabs: [
    {
      label: "Scheduling",
      icon: <Calendar className="w-4 h-4" />,
      heading: "Schedule techs and manage jobs from one board",
      subheading: "See every open job, assigned electrician, and time window — balance workload and prioritize urgent calls.",
      bullets: [
        "Emergency jobs flagged with visual priority alerts on the dispatch board",
        "Assign by license level — journeymen vs apprentice for permitted work",
        "Multi-day project tracking for larger installations and remodels",
      ],
      mockType: "calendar",
    },
    {
      label: "Online Booking",
      icon: <Globe className="w-4 h-4" />,
      heading: "Homeowners describe the work and book a window",
      subheading: "Routine jobs book themselves online — your office focuses only on complex estimates and permits.",
      bullets: [
        "Clients select job category (repair, installation, inspection, panel work)",
        "Describe the issue or project details before booking — no surprises on arrival",
        "Emergency request option routes urgent calls to your priority queue",
      ],
      mockType: "booking",
    },
    {
      label: "Invoicing",
      icon: <DollarSign className="w-4 h-4" />,
      heading: "Quote on-site and invoice before you leave",
      subheading: "Itemize every material and labor hour. Clients approve the quote, you do the work, they pay on-site.",
      bullets: [
        "Build quotes with itemized materials (wire, breakers, fixtures), labor hours, and permit fees",
        "Convert approved quotes to invoices in one tap — no re-entering data",
        "Collect card payment on-site or send a pay-link by text",
      ],
      mockType: "invoice",
    },
    {
      label: "Client Management",
      icon: <Users className="w-4 h-4" />,
      heading: "Every property's electrical history on your phone",
      subheading: "Panel info, prior work, permit numbers, and future project notes — all stored per property.",
      bullets: [
        "Property profile: panel brand and size, breaker count, service amperage",
        "Full job history with dates, work done, materials installed, and permit numbers",
        "Flag commercial accounts and multi-unit properties for priority scheduling",
      ],
      mockType: "clients",
    },
    {
      label: "SMS Reminders",
      icon: <Smartphone className="w-4 h-4" />,
      heading: "Clients and techs stay in sync automatically",
      subheading: "No more 'where's the electrician?' calls — automatic updates cover every step of the job.",
      bullets: [
        "Booking confirmation sent to clients immediately upon scheduling",
        "On-my-way text with tech name and ETA when dispatched",
        "Post-job summary with work completed and any permit notes or follow-up needed",
      ],
      mockType: "sms",
    },
  ],
  howItWorksSteps: [
    { step: "01", title: "List Your Services",         desc: "Add your electrical services — outlet repair, panel upgrades, EV charger install, lighting, inspections — with your service areas and response windows." },
    { step: "02", title: "Share Your Booking Link",    desc: "Add it to your Google Business Profile, website, or send it directly to property managers. Clients book routine work online and flag emergencies for priority dispatch." },
    { step: "03", title: "Dispatch, Document, Invoice", desc: "Electricians arrive prepared with full job context, complete the work, document everything, and collect payment on-site or by link. Job closed, client happy." },
  ],
  testimonials: [
    { quote: "The quote-to-invoice flow is exactly what we needed. We used to lose jobs because our estimate process was slow. Now I can quote on-site and close right there.", name: "Jason W.", role: "Owner, WireRight Electric" },
    { quote: "Having permit notes and inspection records per job inside the system has made our compliance process so much cleaner. No more spreadsheets for job tracking.", name: "Maria T.", role: "Operations Lead, BrightStar Electrical" },
    { quote: "Online booking reduced our inbound calls by 40%. The calls we do get are actual complex jobs that need real conversation — not simple scheduling.", name: "Chris N.", role: "Owner, ProVolt Contractors" },
  ],
  compareTitle: "Why Electricians Choose Certxa",
  compareSubtitle: "Built for licensed electricians and small-to-mid electrical contracting companies.",
  compareRows: [
    ["Online job booking & scheduling",     true,  false],
    ["Permit & license note tracking",      true,  false],
    ["On-site quoting & invoicing",         true,  false],
    ["Emergency call priority dispatch",    true,  false],
    ["Full property electrical history",    true,  false],
    ["Multi-tech crew scheduling",          true,  true ],
    ["SMS tech & client notifications",     true,  false],
    ["60-day free trial",                   true,  false],
  ],
  faqs: [
    { q: "Can I track permits and inspection dates inside Certxa?", a: "Yes. Each job can include a permit number, permit date, and inspection date. These are logged in the job record and the property's full service history." },
    { q: "Can I generate quotes before doing the work?", a: "Yes. You can build itemized quotes on-site with materials, labor, and permit fees. The client approves, you do the work, and the quote converts to an invoice in one tap." },
    { q: "Can I assign jobs based on license level (journeyman vs. apprentice)?", a: "Yes. When creating or assigning a job, you can note the required skill level and assign accordingly. This helps ensure licensed work goes to licensed techs." },
    { q: "Does it work for commercial electrical jobs?", a: "Yes. Commercial accounts can have multiple contacts, multiple properties, and more complex scope documentation. Larger projects can be tracked across multiple visits." },
    { q: "Can clients pay before the job or after?", a: "Both options are available. You can collect a deposit at booking for larger jobs and the balance upon completion. Or collect the full amount on-site when the work is done." },
    { q: "How does emergency dispatch work?", a: "Clients can flag a booking as an emergency. It immediately appears as priority on your board. Your available tech nearest the location is prompted to accept. You can also manually create and dispatch emergency jobs." },
  ],
  ctaHeadline: "Ready to Power Up Your Business?",
  ctaSub: "Start your 60-day free trial. No credit card required. Cancel any time.",
  ctaContext: "Join thousands of electrical contractors already using Certxa.",
  industryId: "electrical",
};

export default function ElectricalLanding() {
  return <IndustryLandingTemplate config={config} />;
}
