import { Calendar, Users, DollarSign, Smartphone, MapPin, Repeat, CheckCircle, BarChart3, Zap, Globe } from "lucide-react";
import IndustryLandingTemplate, { type IndustryConfig } from "./components/IndustryLandingTemplate";
import DarkHeroBackground from "./components/DarkHeroBackground";

const config: IndustryConfig = {
  badge: "🧹 Built for Carpet Cleaning Businesses",
  headlineLine1: "Every Room.",
  headlineLine2: "Spotless Results.",
  subheadline: "Certxa handles online booking by room count, recurring customer schedules, chemical and equipment tracking, and invoicing — so you can focus on the clean, not the calendar.",
  heroVideo: <DarkHeroBackground />,
  trustText: "Trusted by thousands of carpet cleaning businesses",
  competitors: ["Jobber Alternative", "HouseCall Pro Alternative", "Markate Alternative"],
  stats: [
    { value: "4,500+", label: "Carpet Cleaning Pros" },
    { value: "280K+",  label: "Jobs Completed" },
    { value: "88%",    label: "Customer Return Rate" },
    { value: "4.9★",   label: "Average Rating" },
  ],
  featuresLabel: "BUILT FOR CARPET CLEANERS",
  featuresTitle: "Everything Your Carpet Cleaning Business Needs",
  featuresSubtitle: "From first-time deep cleans to annual maintenance schedules — Certxa keeps every job organized and every customer coming back.",
  features: [
    { icon: <Calendar className="w-6 h-6 text-[#00D4AA]" />,    title: "Room-by-Room Booking",           desc: "Clients book and specify exactly which rooms need cleaning — carpet, upholstery, area rugs, stairs. You arrive knowing the full scope and can price accurately." },
    { icon: <Repeat className="w-6 h-6 text-[#00D4AA]" />,      title: "Annual Maintenance Reminders",   desc: "Set up automatic reminder campaigns for 6-month or annual re-booking. Clients who forget you exist suddenly remember — and rebook without any effort on your part." },
    { icon: <MapPin className="w-6 h-6 text-[#00D4AA]" />,      title: "Client Property Notes",          desc: "Store carpet type, fiber notes, pet stains, previous treatment history, and access instructions per property. Arrive prepared for every job — no surprises mid-clean." },
    { icon: <DollarSign className="w-6 h-6 text-[#00D4AA]" />,  title: "Room-Based Pricing & Invoicing", desc: "Price by room, by square foot, or by service type. Build invoices from your phone the moment the job is done. Clients pay by card — no cash, no checks." },
    { icon: <Zap className="w-6 h-6 text-[#00D4AA]" />,         title: "Upsell Add-Ons at Booking",      desc: "Offer Scotchgard protection, pet odor treatment, stain guard, or upholstery cleaning as add-ons when clients book. Increase average ticket without the awkward upsell conversation." },
    { icon: <Smartphone className="w-6 h-6 text-[#00D4AA]" />,  title: "SMS Reminders & On-My-Way",      desc: "Automated reminders go out before every appointment. On-my-way texts go out when you leave. Post-job review requests build your reputation automatically." },
    { icon: <CheckCircle className="w-6 h-6 text-[#00D4AA]" />, title: "Job Completion Tracking",        desc: "Mark jobs complete, log chemicals used, note any areas needing follow-up, and capture client sign-off. Full documentation before you roll up the hoses." },
    { icon: <Users className="w-6 h-6 text-[#00D4AA]" />,       title: "Multi-Tech Scheduling",          desc: "Running a crew? Assign jobs to specific techs based on location and workload. See everyone's schedule from one dispatch view." },
    { icon: <BarChart3 className="w-6 h-6 text-[#00D4AA]" />,   title: "Revenue & Route Reports",        desc: "See total revenue by week or month, average ticket, top-spending clients, and busiest service areas. Know exactly which neighborhoods and services drive your growth." },
  ],
  featureTabs: [
    {
      label: "Scheduling",
      icon: <Calendar className="w-4 h-4" />,
      heading: "Route-optimized scheduling for carpet crews",
      subheading: "Group jobs by neighborhood, see crew availability, and fill every slot in your week.",
      bullets: [
        "Group jobs by location to cut drive time between properties",
        "Recurring maintenance schedules for annual re-booking clients",
        "See every tech's jobs and availability in one calendar view",
      ],
      mockType: "calendar",
    },
    {
      label: "Online Booking",
      icon: <Globe className="w-4 h-4" />,
      heading: "Clients select rooms and add-ons when they book",
      subheading: "No more back-and-forth calls to determine scope — clients specify exactly what they need.",
      bullets: [
        "Room selector: living room, bedrooms, stairs, hallways, upholstery",
        "Add-on options shown at booking: pet treatment, stain guard, Scotchgard",
        "Instant price estimate and confirmation by text when booking is complete",
      ],
      mockType: "booking",
    },
    {
      label: "Invoicing",
      icon: <DollarSign className="w-4 h-4" />,
      heading: "Invoice by room or by square foot — your call",
      subheading: "Build the invoice from your phone the moment you finish. Clients pay by card on the spot.",
      bullets: [
        "Pre-fill invoice with booked rooms and add-ons — adjust actuals on-site",
        "Add chemicals, treatments, or extra areas discovered during the clean",
        "Clients pay by card via link — money in your account within 1-2 days",
      ],
      mockType: "invoice",
    },
    {
      label: "Client Management",
      icon: <Users className="w-4 h-4" />,
      heading: "Know every carpet before you unload the van",
      subheading: "Fiber type, pet history, stain treatments, and access notes — all stored per property.",
      bullets: [
        "Property profile: carpet fiber, previous stain treatments, pet households",
        "Full service history with dates, rooms cleaned, chemicals used, and notes",
        "Annual re-booking reminders sent automatically to every past client",
      ],
      mockType: "clients",
    },
    {
      label: "SMS Reminders",
      icon: <Smartphone className="w-4 h-4" />,
      heading: "No-shows are rare when clients get reminders",
      subheading: "Automatic texts cut no-shows dramatically and build the professional reputation that gets referrals.",
      bullets: [
        "Day-before and 2-hour-before reminders sent automatically",
        "On-my-way text with estimated arrival when you leave the previous job",
        "Post-clean review request sent 2 hours after job completion",
      ],
      mockType: "sms",
    },
  ],
  howItWorksSteps: [
    { step: "01", title: "Set Up Your Services",     desc: "Add your cleaning services by room type or square footage with pricing. Include add-ons like pet treatment and Scotchgard. Setup takes under 10 minutes." },
    { step: "02", title: "Share Your Booking Link",  desc: "Put it on your website, Facebook, Nextdoor, or Google Business. Clients book specific rooms, pick a time, and pay a deposit — all without a phone call." },
    { step: "03", title: "Clean, Invoice, Repeat",   desc: "Show up to confirmed jobs fully prepared, complete the clean, invoice from your phone, and collect payment. Reminder campaigns re-book them automatically next year." },
  ],
  testimonials: [
    { quote: "The annual re-booking reminders are worth the subscription price alone. I had 60 clients I basically forgot about. The campaign brought 40 of them back within a month.", name: "Kim D.", role: "Owner, FreshStep Carpet Care" },
    { quote: "Having clients select their rooms and add-ons when they book means I show up knowing exactly what I'm doing and what it costs. No more 'can you do the stairs too?' surprises.", name: "Pete A.", role: "Solo Carpet Pro" },
    { quote: "The SMS reminders cut my no-show rate in half. I was driving 40 minutes to jobs where nobody answered the door. That's over now.", name: "Monica S.", role: "Owner, Crystal Clean Carpets" },
  ],
  compareTitle: "Why Carpet Cleaners Choose Certxa",
  compareSubtitle: "Built for independent carpet cleaners and small cleaning operations.",
  compareRows: [
    ["Room-by-room online booking",         true,  false],
    ["Annual re-booking reminders",         true,  false],
    ["Add-on upsells at booking",           true,  false],
    ["Client property & fiber notes",       true,  false],
    ["Online invoicing & card payments",    true,  false],
    ["Multi-tech scheduling",               true,  true ],
    ["Online booking page",                 true,  true ],
    ["60-day free trial",                   true,  false],
  ],
  faqs: [
    { q: "Can clients specify which rooms they need cleaned when booking?", a: "Yes. Your booking page can include a room selector where clients check off exactly which areas they need — rooms, stairs, hallways, upholstery. You see the full scope before the job starts." },
    { q: "Can I offer add-ons like Scotchgard or pet treatment at booking?", a: "Yes. You can add optional services that clients can select at the time of booking. This increases your average ticket without any in-person upsell effort." },
    { q: "How do annual re-booking reminders work?", a: "You set a re-booking interval for each client (6 months, annual). When it's time, Certxa sends an automatic reminder text with your booking link. Clients rebook in one click." },
    { q: "Can I price by square footage instead of room?", a: "Yes. You can set up pricing by room, by square footage, or a combination. You can also adjust the final price on-site based on actual conditions." },
    { q: "Can I log which chemicals were used at each job?", a: "Yes. When marking a job complete, techs can note chemicals and treatments used. This is stored in the client's property history — useful for repeat visits and allergy-sensitive households." },
    { q: "Do I need any hardware or card reader to accept payments?", a: "No. Clients pay through a secure online link you send by text. No hardware needed. Payment goes directly to your bank account within 1–2 business days." },
  ],
  ctaHeadline: "Ready to Keep Every Carpet Spotless?",
  ctaSub: "Start your 60-day free trial. No credit card required. Cancel any time.",
  ctaContext: "Join thousands of carpet cleaning businesses already using Certxa.",
  industryId: "carpet-cleaning",
};

export default function CarpetCleaningLanding() {
  return <IndustryLandingTemplate config={config} />;
}
