import { Calendar, Users, DollarSign, Smartphone, MapPin, Repeat, CheckCircle, BarChart3, Globe, Building2 } from "lucide-react";
import IndustryLandingTemplate, { type IndustryConfig } from "./components/IndustryLandingTemplate";
import DarkHeroBackground from "./components/DarkHeroBackground";

const config: IndustryConfig = {
  badge: "🪟 Built for Window Cleaning Businesses",
  headlineLine1: "Every Pane.",
  headlineLine2: "Crystal Clear.",
  subheadline: "Certxa handles online booking by window count, recurring residential routes, commercial account management, and on-site invoicing — so you can grow your route without adding admin.",
  heroVideo: <DarkHeroBackground />,
  trustText: "Trusted by thousands of window cleaning businesses",
  competitors: ["Jobber Alternative", "ServiceM8 Alternative", "HouseCall Pro Alternative"],
  stats: [
    { value: "4,000+", label: "Window Cleaning Pros" },
    { value: "250K+",  label: "Jobs Completed" },
    { value: "90%",    label: "Seasonal Rebook Rate" },
    { value: "4.9★",   label: "Average Rating" },
  ],
  featuresLabel: "BUILT FOR WINDOW CLEANERS",
  featuresTitle: "Everything Your Window Cleaning Business Needs",
  featuresSubtitle: "From one-time spring cleans to recurring commercial route accounts — Certxa keeps every pane and every payment organized.",
  features: [
    { icon: <Calendar className="w-6 h-6 text-[#00D4AA]" />,    title: "Online Booking by Property",     desc: "Clients book and specify window count, stories, interior/exterior split, and any hard-to-reach areas. You price accurately and arrive prepared — no quotes wasted on-site." },
    { icon: <Repeat className="w-6 h-6 text-[#00D4AA]" />,      title: "Recurring Route Scheduling",     desc: "Set up monthly, quarterly, or bi-annual service schedules for recurring residential clients. Route clients fill your calendar before the season even starts." },
    { icon: <Building2 className="w-6 h-6 text-[#00D4AA]" />,   title: "Commercial Account Management",  desc: "Manage commercial accounts with multiple contacts, multi-story buildings, and ongoing service contracts. Separate commercial routes from residential jobs in one dashboard." },
    { icon: <MapPin className="w-6 h-6 text-[#00D4AA]" />,      title: "Property Access & Notes",        desc: "Store entry codes, floor notes, window types (tinted, specialty, high-rise), and cleaning preferences per property. Crews know every building before they load the van." },
    { icon: <DollarSign className="w-6 h-6 text-[#00D4AA]" />,  title: "Route-Based Invoicing",          desc: "Invoice by window count, by story, or by flat service rate. Generate invoices from your phone immediately after finishing. Commercial clients can receive monthly statements." },
    { icon: <Smartphone className="w-6 h-6 text-[#00D4AA]" />,  title: "SMS Reminders & Follow-Ups",    desc: "Automatic reminders before each service, on-my-way notifications, and seasonal re-booking follow-ups go out without you lifting a finger." },
    { icon: <CheckCircle className="w-6 h-6 text-[#00D4AA]" />, title: "Job Documentation & Sign-Off",   desc: "Crews mark windows complete, log any areas needing follow-up (cracked panes, screens), and capture client sign-off. Full job record saved automatically." },
    { icon: <Users className="w-6 h-6 text-[#00D4AA]" />,       title: "Crew & Route Assignment",        desc: "Assign residential and commercial routes to specific crew members. See every person's workload across your entire operation from one calendar." },
    { icon: <BarChart3 className="w-6 h-6 text-[#00D4AA]" />,   title: "Revenue & Route Reports",        desc: "Track revenue by route, by client type, or by week. Know your most profitable neighborhoods and commercial accounts to make smart expansion decisions." },
  ],
  featureTabs: [
    {
      label: "Scheduling",
      icon: <Calendar className="w-4 h-4" />,
      heading: "Residential and commercial routes in one view",
      subheading: "See every stop, every crew member, and every time window — residential one-time and commercial recurring all in the same calendar.",
      bullets: [
        "Recurring route scheduling for bi-monthly or quarterly residential clients",
        "Separate commercial and residential job views to keep routes clean",
        "Crew assignment by route zone — residential vs. high-rise vs. storefront",
      ],
      mockType: "calendar",
    },
    {
      label: "Online Booking",
      icon: <Globe className="w-4 h-4" />,
      heading: "New clients book with exact scope — no guessing",
      subheading: "Clients specify windows, stories, interior/exterior, and any special areas so you price accurately from day one.",
      bullets: [
        "Property details: number of windows, stories, interior/exterior, screen cleaning",
        "Clients choose one-time or recurring frequency at booking",
        "Instant quote estimate and confirmation sent by text upon booking",
      ],
      mockType: "booking",
    },
    {
      label: "Invoicing",
      icon: <DollarSign className="w-4 h-4" />,
      heading: "Invoice by window count or flat rate — your choice",
      subheading: "Build invoices from your phone the moment a job is done. Residential clients pay by card; commercial clients get monthly statements.",
      bullets: [
        "Per-window or flat-rate invoicing with add-ons (screen cleaning, tracks)",
        "Monthly statement billing for recurring commercial accounts",
        "Deposit collection at booking for new commercial contracts",
      ],
      mockType: "invoice",
    },
    {
      label: "Client Management",
      icon: <Users className="w-4 h-4" />,
      heading: "Know every building before you load the van",
      subheading: "Window types, access codes, contact details, and service history — all organized per property.",
      bullets: [
        "Property notes: window type, entry instructions, floors, special coatings",
        "Commercial accounts: multiple contacts, multiple floors, service contract details",
        "Seasonal re-booking reminder campaigns sent automatically each spring",
      ],
      mockType: "clients",
    },
    {
      label: "SMS Reminders",
      icon: <Smartphone className="w-4 h-4" />,
      heading: "Clients are home and ready when you arrive",
      subheading: "Automatic texts before every residential appointment and on-my-way notifications on service day.",
      bullets: [
        "Day-before reminder and morning-of texts for residential clients",
        "On-my-way text when your crew is heading to the property",
        "Spring re-booking campaigns sent to all past clients automatically",
      ],
      mockType: "sms",
    },
  ],
  howItWorksSteps: [
    { step: "01", title: "Set Up Your Services",     desc: "Add your window cleaning services — interior, exterior, screens, commercial — with pricing by window count or flat rate. Setup takes under 10 minutes." },
    { step: "02", title: "Share Your Booking Link",  desc: "Post it on your truck, Google Business, Nextdoor, or send to existing customers for easy re-booking. Clients pick their scope and schedule without calling." },
    { step: "03", title: "Clean, Invoice, Rebook",   desc: "Show up to confirmed jobs with everything you need, complete the service, invoice from your phone, collect payment, and trigger the next seasonal re-booking reminder." },
  ],
  testimonials: [
    { quote: "I built a commercial route of 14 accounts using Certxa's booking link alone. Property managers book their own service, their invoices go out automatically, and I barely touch a phone.", name: "Paul H.", role: "Owner, ClearView Window Co." },
    { quote: "The spring re-booking reminder campaign brought back 80% of my previous year's residential clients in the first 2 weeks of March. I was fully booked before I even started marketing.", name: "Amy S.", role: "Solo Window Cleaner" },
    { quote: "Having window count and story details in the booking form means I never waste time re-quoting on-site. My pricing is accurate and clients have no surprises on invoice day.", name: "Nathan P.", role: "Owner, Streak-Free Pro" },
  ],
  compareTitle: "Why Window Cleaners Choose Certxa",
  compareSubtitle: "Built for residential route operators and commercial window cleaning businesses.",
  compareRows: [
    ["Online booking with scope details",     true,  false],
    ["Recurring residential route scheduling", true,  false],
    ["Commercial account management",         true,  false],
    ["Monthly statement billing",             true,  false],
    ["Seasonal re-booking campaigns",         true,  false],
    ["Multi-crew route assignment",           true,  true ],
    ["Online booking page",                   true,  true ],
    ["60-day free trial",                     true,  false],
  ],
  faqs: [
    { q: "Can clients specify the number of windows and floors when booking?", a: "Yes. Your booking form can include fields for window count, number of stories, and whether they want interior, exterior, or both. This lets you price accurately before showing up." },
    { q: "How do recurring residential route schedules work?", a: "You can set any client as a recurring customer with monthly, bi-monthly, or quarterly frequency. They stay on your calendar automatically each cycle without re-booking." },
    { q: "Can I manage commercial accounts separately from residential?", a: "Yes. Commercial accounts can have multiple property contacts, building-specific notes, and monthly statement billing — all managed separately from your residential one-time clients." },
    { q: "How does the spring re-booking campaign work?", a: "You set up a campaign that automatically sends a re-booking reminder text to all past clients at a specific time of year. Clients get a link to book directly — no phone calls needed." },
    { q: "Can I invoice commercial clients on a monthly cycle instead of per visit?", a: "Yes. Commercial accounts can be set to monthly statement billing, which consolidates all services from the month into one invoice sent on the 1st." },
    { q: "Do clients need an app to pay their invoice?", a: "No. Clients receive a secure payment link by text and pay online in a browser. No app or account required. Payment reaches your bank within 1–2 business days." },
  ],
  ctaHeadline: "Ready to Grow Your Window Route?",
  ctaSub: "Start your 60-day free trial. No credit card required. Cancel any time.",
  ctaContext: "Join thousands of window cleaning businesses already using Certxa.",
  industryId: "window-cleaning",
};

export default function WindowCleaningLanding() {
  return <IndustryLandingTemplate config={config} />;
}
