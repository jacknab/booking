import { Calendar, Users, DollarSign, Smartphone, Wrench, CheckCircle, BarChart3, Zap, Globe, FileText } from "lucide-react";
import IndustryLandingTemplate, { type IndustryConfig } from "./components/IndustryLandingTemplate";
import DarkHeroBackground from "./components/DarkHeroBackground";

const config: IndustryConfig = {
  badge: "🌡️ Built for HVAC Contractors",
  headlineLine1: "Your Service Calls.",
  headlineLine2: "Always Covered.",
  subheadline: "Certxa handles online booking, service agreements, emergency dispatch, equipment history, and invoicing — so your HVAC business runs year-round without the admin headaches.",
  heroVideo: <DarkHeroBackground />,
  trustText: "Trusted by thousands of HVAC contractors",
  competitors: ["ServiceTitan Alternative", "Jobber Alternative", "FieldEdge Alternative"],
  stats: [
    { value: "5,000+", label: "HVAC Contractors" },
    { value: "350K+",  label: "Service Calls Booked" },
    { value: "92%",    label: "Agreement Renewal Rate" },
    { value: "4.9★",   label: "Average Rating" },
  ],
  featuresLabel: "BUILT FOR HVAC",
  featuresTitle: "Everything Your HVAC Business Needs",
  featuresSubtitle: "From spring AC tune-ups to winter emergency calls — Certxa keeps every job scheduled, invoiced, and documented.",
  features: [
    { icon: <Calendar className="w-6 h-6 text-[#00D4AA]" />,    title: "Online Service Booking",        desc: "Homeowners and property managers book HVAC service online any time. They describe the issue, select urgency level, and pick a time — it's on your dispatch board instantly." },
    { icon: <FileText className="w-6 h-6 text-[#00D4AA]" />,    title: "Service Agreements",            desc: "Create and sell annual maintenance agreements (spring + fall tune-up plans) directly through Certxa. Automatic renewal reminders keep your recurring revenue locked in." },
    { icon: <Wrench className="w-6 h-6 text-[#00D4AA]" />,      title: "Equipment History & Notes",     desc: "Store each unit's make, model, age, filter size, and full service history per property. Techs arrive knowing the system and what's been done before." },
    { icon: <Zap className="w-6 h-6 text-[#00D4AA]" />,         title: "Emergency Dispatch",            desc: "Priority booking for no-heat or no-AC emergencies. Emergency jobs flag immediately on your board and can be assigned to the nearest available tech." },
    { icon: <DollarSign className="w-6 h-6 text-[#00D4AA]" />,  title: "Parts + Labor Invoicing",       desc: "Build invoices with itemized parts, labor hours, and warranty notes. Clients pay by card online. No more paper invoices or waiting 30 days to get paid." },
    { icon: <Smartphone className="w-6 h-6 text-[#00D4AA]" />,  title: "Tech Notifications & SMS",      desc: "Techs receive job details on their phones. Clients get on-my-way texts and post-service summaries automatically — no phone calls needed in either direction." },
    { icon: <CheckCircle className="w-6 h-6 text-[#00D4AA]" />, title: "Job Completion & Sign-Off",     desc: "Techs mark work complete, add notes on findings, and capture client sign-off from their phone. Everything is logged before they leave the driveway." },
    { icon: <Users className="w-6 h-6 text-[#00D4AA]" />,       title: "Tech & Fleet Management",       desc: "Assign jobs to specific techs based on skills and availability. See your whole crew's schedules across residential and commercial accounts from one view." },
    { icon: <BarChart3 className="w-6 h-6 text-[#00D4AA]" />,   title: "Revenue & Service Reports",     desc: "Track revenue by month, tech, or service type. Know your busiest periods, most profitable jobs, and which techs are closing the most add-on work." },
  ],
  featureTabs: [
    {
      label: "Scheduling",
      icon: <Calendar className="w-4 h-4" />,
      heading: "Dispatch techs and manage calls in one board",
      subheading: "See every open call, assigned tech, and time window at a glance — drag and optimize your day.",
      bullets: [
        "Priority flags for emergency calls visible across the whole dispatch board",
        "Assign jobs to techs based on skill level and current location",
        "View seasonal workload across residential and commercial accounts",
      ],
      mockType: "calendar",
    },
    {
      label: "Online Booking",
      icon: <Globe className="w-4 h-4" />,
      heading: "Homeowners book service without calling dispatch",
      subheading: "Your booking link handles routine service calls 24/7 — your office handles only what needs human attention.",
      bullets: [
        "Clients describe the issue, select unit type, and pick an appointment window",
        "Emergency flag option for no-heat or no-AC situations requiring same-day service",
        "Instant confirmation with tech name and appointment window by text",
      ],
      mockType: "booking",
    },
    {
      label: "Invoicing",
      icon: <DollarSign className="w-4 h-4" />,
      heading: "Parts, labor, and warranty — one clean invoice",
      subheading: "Techs build invoices on-site from their phone. Clients pay before you leave the driveway.",
      bullets: [
        "Itemized line items for parts (with part numbers), labor hours, and dispatch fees",
        "Service agreement discount applied automatically to eligible agreement holders",
        "Card payment collected on-site or sent as a pay-link by text",
      ],
      mockType: "invoice",
    },
    {
      label: "Client Management",
      icon: <Users className="w-4 h-4" />,
      heading: "Every unit's history at your tech's fingertips",
      subheading: "Make, model, filter size, service history, warranties — all tied to the client and property.",
      bullets: [
        "Equipment profile: unit make/model, age, filter size, serial number",
        "Full service history with dates, work performed, and parts installed",
        "Service agreement status and next maintenance due date per account",
      ],
      mockType: "clients",
    },
    {
      label: "SMS Reminders",
      icon: <Smartphone className="w-4 h-4" />,
      heading: "Clients stay informed without calling your office",
      subheading: "Automatic texts from booking to completion keep clients in the loop and protect your reputation.",
      bullets: [
        "Appointment confirmation and tech name sent immediately upon booking",
        "On-my-way text with estimated arrival when the tech is dispatched",
        "Maintenance agreement renewal reminders sent 30 days before expiration",
      ],
      mockType: "sms",
    },
  ],
  howItWorksSteps: [
    { step: "01", title: "Set Up Your Services",     desc: "Add your HVAC services — tune-ups, repairs, installs, emergency calls — with pricing and availability. Our onboarding pre-fills common HVAC service types and seasonal packages." },
    { step: "02", title: "Share Your Booking Link",  desc: "Put it on your website, Google Business Profile, or send it to existing customers for self-service rebooking. Emergency requests can flag for same-day priority." },
    { step: "03", title: "Dispatch, Service, Invoice", desc: "Techs receive job details on their phones, arrive prepared, complete the job, and collect payment on-site. The whole visit is logged before they leave." },
  ],
  testimonials: [
    { quote: "Our office used to field 60+ booking calls a week. Half of them now come through Certxa automatically. Our dispatcher actually has time to handle real issues now.", name: "Tony R.", role: "Owner, ComfortZone HVAC" },
    { quote: "Service agreements sold through Certxa have completely smoothed out our revenue. We used to have feast-or-famine seasons. Now we start each month knowing our base.", name: "Angela M.", role: "Owner, Peak Climate Services" },
    { quote: "Having the equipment history on the tech's phone before they even knock on the door is a game changer. Customers notice and it builds serious trust.", name: "Phil D.", role: "Operations Manager, CoolFlow HVAC" },
  ],
  compareTitle: "Why HVAC Contractors Choose Certxa",
  compareSubtitle: "Built for residential and light commercial HVAC operations.",
  compareRows: [
    ["Online service request booking",      true,  false],
    ["Equipment history per property",      true,  false],
    ["Service agreement management",        true,  false],
    ["Emergency call priority dispatch",    true,  false],
    ["Parts + labor invoicing",             true,  false],
    ["Multi-tech scheduling",               true,  true ],
    ["SMS tech & client notifications",     true,  false],
    ["60-day free trial",                   true,  false],
  ],
  faqs: [
    { q: "Can I sell service agreements through Certxa?", a: "Yes. You can create annual maintenance agreement plans, sell them directly to clients, and Certxa will track renewal dates and send automatic reminder texts before they expire." },
    { q: "How do techs receive job information in the field?", a: "Techs get job notifications on their phone including client address, equipment details, service history, and any special notes. They can update the job status and build the invoice from their phone." },
    { q: "Can I handle emergency calls separately from scheduled appointments?", a: "Yes. Clients can flag their booking as an emergency (no heat, no AC) which elevates it to priority status on your dispatch board. You can also manually create emergency jobs at any time." },
    { q: "Does it work for commercial HVAC accounts too?", a: "Yes. You can manage both residential and commercial accounts in Certxa. Commercial properties can have multiple units tracked under one account with separate service histories per unit." },
    { q: "Can clients pay on-site during the service call?", a: "Yes. Techs can collect card payment on-site using the mobile app, or send a pay-by-link text to the client immediately after the job is complete." },
    { q: "Is there a limit on the number of techs I can add?", a: "No limits. Whether you have 1 tech or 50, Certxa scales with your operation. Each tech gets their own login and can see only their assigned jobs." },
  ],
  ctaHeadline: "Ready to Keep Every System Running?",
  ctaSub: "Start your 60-day free trial. No credit card required. Cancel any time.",
  ctaContext: "Join thousands of HVAC contractors already using Certxa.",
  industryId: "hvac",
};

export default function HVACLanding() {
  return <IndustryLandingTemplate config={config} />;
}
