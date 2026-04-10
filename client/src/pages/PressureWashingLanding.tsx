import { Calendar, Users, DollarSign, Smartphone, MapPin, CheckCircle, BarChart3, Zap, Globe, Camera } from "lucide-react";
import IndustryLandingTemplate, { type IndustryConfig } from "./components/IndustryLandingTemplate";
import DarkHeroBackground from "./components/DarkHeroBackground";

const config: IndustryConfig = {
  badge: "💦 Built for Pressure Washing Businesses",
  headlineLine1: "Every Surface.",
  headlineLine2: "Sparkling Clean.",
  subheadline: "Certxa handles online booking, before/after photo logs, seasonal upsells, and instant invoicing — so you can spend more time spraying and less time chasing down payments.",
  heroVideo: <DarkHeroBackground />,
  trustText: "Trusted by thousands of pressure washing businesses",
  competitors: ["Jobber Alternative", "HouseCall Pro Alternative", "ServiceBridge Alternative"],
  stats: [
    { value: "5,000+", label: "Pressure Washing Pros" },
    { value: "320K+",  label: "Jobs Completed" },
    { value: "85%",    label: "Spring Season Rebook Rate" },
    { value: "4.9★",   label: "Average Rating" },
  ],
  featuresLabel: "BUILT FOR PRESSURE WASHING",
  featuresTitle: "Everything Your Pressure Washing Business Needs",
  featuresSubtitle: "From driveways to roofs — Certxa keeps every job booked, documented, and paid without the office overhead.",
  features: [
    { icon: <Calendar className="w-6 h-6 text-[#00D4AA]" />,    title: "Online Job Booking",            desc: "Homeowners and property managers book pressure washing services from your public link any time. They select the surface type, describe the area, and pick a time — all without calling." },
    { icon: <Camera className="w-6 h-6 text-[#00D4AA]" />,      title: "Before & After Photos",         desc: "Capture job-site photos before and after the clean from your phone. Photos are saved to the client record — perfect for referral marketing, disputes, and re-booking proof." },
    { icon: <Zap className="w-6 h-6 text-[#00D4AA]" />,         title: "Seasonal Upsell Packages",      desc: "Bundle your spring and fall services — driveway, siding, deck, roof soft wash — as seasonal packages clients can book all at once with a single-click upsell." },
    { icon: <DollarSign className="w-6 h-6 text-[#00D4AA]" />,  title: "Flat-Rate & Custom Invoicing",  desc: "Set flat rates by surface type or build custom quotes for large commercial properties. Invoice from your phone immediately after finishing. Clients pay by card — no checks." },
    { icon: <MapPin className="w-6 h-6 text-[#00D4AA]" />,      title: "Property & Surface Notes",      desc: "Store each property's surface types, special instructions (delicate wood, soft-wash-only zones, gate codes), and prior job notes. Arrive prepared every time." },
    { icon: <Smartphone className="w-6 h-6 text-[#00D4AA]" />,  title: "SMS Reminders & Notifications", desc: "Automatic reminders before each job, on-my-way texts, and post-job review requests — all handled automatically while you focus on the pressure washer." },
    { icon: <CheckCircle className="w-6 h-6 text-[#00D4AA]" />, title: "Job Completion Documentation",  desc: "Mark jobs complete, log chemical treatments used, note any surfaces that need follow-up, and capture client sign-off. Full record saved automatically." },
    { icon: <Users className="w-6 h-6 text-[#00D4AA]" />,       title: "Multi-Crew Dispatch",           desc: "Add your crew members, assign jobs by neighborhood or surface specialty, and see everyone's workload from one calendar. Coordinate storm season demand without chaos." },
    { icon: <BarChart3 className="w-6 h-6 text-[#00D4AA]" />,   title: "Revenue & Seasonal Reports",    desc: "Track revenue by week, month, or service type. Know your busiest season, highest-ticket jobs, and top revenue neighborhoods — plan next season with confidence." },
  ],
  featureTabs: [
    {
      label: "Scheduling",
      icon: <Calendar className="w-4 h-4" />,
      heading: "Route-ready scheduling for pressure wash crews",
      subheading: "Group jobs by neighborhood, manage crew workloads, and fill your week efficiently.",
      bullets: [
        "Cluster jobs by neighborhood to eliminate dead-time between stops",
        "See every crew member's jobs and availability in one calendar view",
        "Seasonal demand weeks fill automatically as clients rebook",
      ],
      mockType: "calendar",
    },
    {
      label: "Online Booking",
      icon: <Globe className="w-4 h-4" />,
      heading: "Homeowners book a wash without the phone tag",
      subheading: "Share your link and let clients pick their surface, scope, and time — you get a confirmed job.",
      bullets: [
        "Surface selector: driveway, siding, deck, fence, roof, patio, commercial",
        "Add-on options: soft wash, chemical treatment, gutter flush",
        "Instant price estimate and confirmation by text upon booking",
      ],
      mockType: "booking",
    },
    {
      label: "Invoicing",
      icon: <DollarSign className="w-4 h-4" />,
      heading: "Invoice from the job site before you leave",
      subheading: "Flat rate or custom quote — build it on your phone and collect payment on the spot.",
      bullets: [
        "Flat-rate pricing for standard surfaces, custom quote builder for large jobs",
        "Clients pay by card via text link — no cash, no checks, no waiting",
        "Package invoices for multi-surface seasonal bookings",
      ],
      mockType: "invoice",
    },
    {
      label: "Client Management",
      icon: <Users className="w-4 h-4" />,
      heading: "Know every surface before you load the truck",
      subheading: "Surface types, gate codes, chemical restrictions, and before/after photo history — per property.",
      bullets: [
        "Property notes: surface materials, delicate zones, chemical restrictions",
        "Before and after photos from every visit saved to the client's history",
        "Annual re-booking reminders sent automatically each spring",
      ],
      mockType: "clients",
    },
    {
      label: "SMS Reminders",
      icon: <Smartphone className="w-4 h-4" />,
      heading: "Clients know you're coming — no phone calls",
      subheading: "Automatic texts cover every step from booking to review request.",
      bullets: [
        "Day-before reminder and 2-hour-before arrival window texts",
        "On-my-way notification when you're heading to the property",
        "Post-job before/after photo summary with review request link",
      ],
      mockType: "sms",
    },
  ],
  howItWorksSteps: [
    { step: "01", title: "List Your Services",        desc: "Add driveways, siding, decks, roofs, and any specialty surfaces with flat-rate or custom pricing. Our onboarding fills in common pressure washing service types automatically." },
    { step: "02", title: "Share Your Booking Link",   desc: "Put it on your truck door, Google Business, Facebook, or Nextdoor. Homeowners pick their surface, add extras, and book a time without calling. You get a confirmed job." },
    { step: "03", title: "Wash, Photo, Invoice",      desc: "Show up to confirmed jobs, take before photos, complete the wash, take after photos, invoice from your phone, collect payment, and request a review. Done." },
  ],
  testimonials: [
    { quote: "The before/after photos are a selling machine. I send them to the client right after the job and they always share them. My spring bookings are booked 3 weeks out because of referrals.", name: "Jake T.", role: "Owner, BlastMaster Pressure Washing" },
    { quote: "The seasonal upsell packages are genius. I offered a spring bundle — driveway + siding + deck — at a discount and 30% of my spring clients booked all three. My average ticket doubled.", name: "Carla M.", role: "Solo Pressure Washer" },
    { quote: "I used to spend my entire Sunday organizing the next week's schedule. Now it just happens. Jobs are booked, routes are set, and I wake up Monday knowing exactly where I'm going.", name: "Deron K.", role: "Owner, ProBlast Exterior Cleaning" },
  ],
  compareTitle: "Why Pressure Washers Choose Certxa",
  compareSubtitle: "Built for independent operators and small pressure washing crews.",
  compareRows: [
    ["Online service booking by surface",   true,  false],
    ["Before & after photo documentation", true,  false],
    ["Seasonal package upsells at booking", true,  false],
    ["Property & surface notes",            true,  false],
    ["Online invoicing & card payments",    true,  false],
    ["Multi-crew scheduling",               true,  true ],
    ["Annual re-booking campaigns",         true,  false],
    ["60-day free trial",                   true,  false],
  ],
  faqs: [
    { q: "Can clients specify which surfaces they want washed when booking?", a: "Yes. Your booking page includes a surface selector where clients check off exactly what they need — driveway, siding, deck, fence, roof. You see the scope before the job starts." },
    { q: "Can I store before and after photos per client?", a: "Yes. You can capture photos from your phone and save them to each client's property history. These are great for disputes, referral marketing, and annual re-booking reminders." },
    { q: "How do seasonal package upsells work?", a: "You can create package bundles (e.g., Driveway + Siding + Deck) that clients can book all at once at a bundled rate. These appear as options when clients visit your booking page." },
    { q: "Can I price differently for residential vs. commercial jobs?", a: "Yes. You can set separate pricing for commercial properties or use the custom quote builder for larger or more complex jobs." },
    { q: "Do I need a card reader to accept payments on-site?", a: "No. You send a payment link by text and clients pay securely online in a browser. No hardware needed. Money is in your account within 1–2 business days." },
    { q: "Can I manage a crew through Certxa?", a: "Yes. You can add crew members to your account, assign them to specific jobs by neighborhood or surface type, and see everyone's schedule from one calendar view." },
  ],
  ctaHeadline: "Ready to Make Every Surface Shine?",
  ctaSub: "Start your 60-day free trial. No credit card required. Cancel any time.",
  ctaContext: "Join thousands of pressure washing businesses already using Certxa.",
  industryId: "pressure-washing",
};

export default function PressureWashingLanding() {
  return <IndustryLandingTemplate config={config} />;
}
