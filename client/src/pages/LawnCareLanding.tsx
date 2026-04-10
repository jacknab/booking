import { Calendar, Users, DollarSign, Smartphone, MapPin, Repeat, CheckCircle, BarChart3, Zap, Globe } from "lucide-react";
import IndustryLandingTemplate, { type IndustryConfig } from "./components/IndustryLandingTemplate";
import LawnCareHeroVideo from "./components/LawnCareHeroVideo";

const config: IndustryConfig = {
  badge: "🌿 Built for Lawn Care & Landscaping",
  headlineLine1: "Every Yard.",
  headlineLine2: "Looking Perfect.",
  subheadline: "Certxa handles online bookings, recurring mowing schedules, automatic reminders, and invoicing — so you can focus on the work, not the admin. Trusted by thousands of lawn care pros.",
  heroVideo: <LawnCareHeroVideo />,
  trustText: "Trusted by thousands of lawn care professionals",
  competitors: ["Jobber Alternative", "LawnStarter Alternative", "Yardbook Alternative"],
  stats: [
    { value: "9,000+", label: "Lawn Care Pros" },
    { value: "600K+",  label: "Jobs Completed" },
    { value: "96%",    label: "Seasonal Retention" },
    { value: "4.9★",   label: "Average Rating" },
  ],
  featuresLabel: "BUILT FOR LAWN CARE",
  featuresTitle: "Everything Your Lawn Care Business Needs",
  featuresSubtitle: "From first mow to full-season contracts — Certxa keeps your routes, crews, and payments organized.",
  features: [
    { icon: <Calendar className="w-6 h-6 text-[#00D4AA]" />,    title: "Online Service Booking",         desc: "Homeowners book lawn mowing, landscaping, and yard services from your booking link any time. They pick the service, yard size, and time — it lands straight on your calendar." },
    { icon: <Repeat className="w-6 h-6 text-[#00D4AA]" />,      title: "Recurring Mowing Schedules",     desc: "Lock in weekly or bi-weekly mowing customers and keep them on a recurring schedule automatically. Your most valuable clients are your regulars — never lose them to a missed booking." },
    { icon: <MapPin className="w-6 h-6 text-[#00D4AA]" />,      title: "Route & Location Management",    desc: "Organize jobs by neighborhood to minimize drive time between stops. Add property notes, gate codes, and yard-specific instructions so every crew member shows up prepared." },
    { icon: <Zap className="w-6 h-6 text-[#00D4AA]" />,         title: "Seasonal Service Packages",      desc: "Offer spring cleanups, aeration, overseeding, and fall leaf removal as standalone or bundled seasonal packages. Upsell with one tap when clients are already booking." },
    { icon: <DollarSign className="w-6 h-6 text-[#00D4AA]" />,  title: "Invoicing & Payments",           desc: "Send invoices from your phone the moment a job is done. Clients pay by card or set up auto-pay for recurring services. End the season chasing down unpaid mowing bills." },
    { icon: <Smartphone className="w-6 h-6 text-[#00D4AA]" />,  title: "SMS Reminders & Updates",        desc: "Automatic reminders before scheduled mows. Notify clients when you're on the way. Post-job review requests build your reputation so you keep winning new neighborhoods." },
    { icon: <CheckCircle className="w-6 h-6 text-[#00D4AA]" />, title: "Job Status Tracking",            desc: "Move lawn jobs from scheduled to en-route, in-progress, and completed. Clients know exactly when to expect you — reducing the 'is someone coming today?' texts." },
    { icon: <Users className="w-6 h-6 text-[#00D4AA]" />,       title: "Client & Property Database",     desc: "Every property has its own profile — yard size, equipment notes, special instructions, and full service history. Your crew knows every yard before they pull up." },
    { icon: <BarChart3 className="w-6 h-6 text-[#00D4AA]" />,   title: "Revenue & Route Reports",        desc: "See total revenue by week, month, or season. Know which routes are most profitable and which services drive the most revenue. Plan next season with real data." },
  ],
  featureTabs: [
    {
      label: "Scheduling",
      icon: <Calendar className="w-4 h-4" />,
      heading: "Route-ready scheduling for lawn pros",
      subheading: "Group jobs by neighborhood, manage recurring mows, and see your whole week at a glance.",
      bullets: [
        "Organize jobs by location to minimize drive time between yards",
        "Recurring mowing schedules that automatically carry forward each week",
        "See every crew member's route and assignments from one calendar",
      ],
      mockType: "calendar",
    },
    {
      label: "Online Booking",
      icon: <Globe className="w-4 h-4" />,
      heading: "New yards book themselves while you mow",
      subheading: "Your booking link works 24/7 — homeowners pick their service, yard size, and schedule without calling.",
      bullets: [
        "Clients select yard size, service type, and preferred day when booking",
        "Automatic confirmation with job details and next appointment reminder",
        "Share on Nextdoor, Facebook, or Google Business to reach new neighborhoods",
      ],
      mockType: "booking",
    },
    {
      label: "Invoicing",
      icon: <DollarSign className="w-4 h-4" />,
      heading: "Get paid for every mow — automatically",
      subheading: "Send invoices from the job site or set up auto-pay for recurring clients.",
      bullets: [
        "One-tap invoice from your phone with service and property details pre-filled",
        "Recurring clients can be set to auto-pay after every service",
        "End-of-season statements for clients on seasonal contracts",
      ],
      mockType: "invoice",
    },
    {
      label: "Client Management",
      icon: <Users className="w-4 h-4" />,
      heading: "Know every yard before you pull up",
      subheading: "Gate codes, equipment notes, yard quirks, and service history — all in one profile per property.",
      bullets: [
        "Property notes: gate code, dog in yard, irrigation heads, obstacles",
        "Full service history with dates, services rendered, and payments",
        "Track seasonal clients and send re-engagement messages before spring",
      ],
      mockType: "clients",
    },
    {
      label: "SMS Reminders",
      icon: <Smartphone className="w-4 h-4" />,
      heading: "Keep clients in the loop without the calls",
      subheading: "Automatic texts mean no more 'is someone coming today?' messages from homeowners.",
      bullets: [
        "Day-before reminder texts for every scheduled mow",
        "On-my-way notifications so clients know exactly when to expect you",
        "Post-service review requests build your reputation block by block",
      ],
      mockType: "sms",
    },
  ],
  howItWorksSteps: [
    { step: "01", title: "Set Up Your Services",     desc: "Add your lawn care services — mowing, edging, fertilizing, cleanups — with pricing by yard size or flat rate. Our onboarding auto-fills common lawn care service types." },
    { step: "02", title: "Share Your Booking Link",  desc: "Post it on Nextdoor, Facebook neighborhood groups, or your truck door. Homeowners book directly. You approve and it's locked into your route." },
    { step: "03", title: "Mow, Invoice, Repeat",     desc: "Show up to confirmed jobs, complete the work, send the invoice from your truck, and collect payment. Recurring clients stay on your schedule automatically." },
  ],
  testimonials: [
    { quote: "I went from 15 yards to 40 yards in one season using Certxa. The online booking did it. People in my neighborhood just started finding me and booking without me doing anything.", name: "Rick A.", role: "Owner, Green Edge Lawn Co." },
    { quote: "The recurring schedule feature is the best thing ever for lawn care. I set up my 30 regulars and they just stay on the calendar every week. My spring setup now takes one afternoon.", name: "Dana P.", role: "Solo Lawn Pro" },
    { quote: "Auto-pay for recurring clients changed my whole cash flow. I used to end the season still chasing three or four customers. Now I'm fully paid by the time the last leaf hits the ground.", name: "Carlos M.", role: "Owner, ProCut Landscaping" },
  ],
  compareTitle: "Why Lawn Care Pros Choose Certxa",
  compareSubtitle: "Built for solo operators and growing lawn care crews.",
  compareRows: [
    ["Recurring mowing schedules",       true,  false],
    ["Route & property notes",           true,  false],
    ["Online invoicing & auto-pay",      true,  false],
    ["SMS reminders & on-my-way texts",  true,  false],
    ["Seasonal service packages",        true,  false],
    ["Multi-crew scheduling",            true,  true ],
    ["Online booking page",              true,  true ],
    ["60-day free trial",                true,  false],
  ],
  faqs: [
    { q: "Can I set up recurring mowing schedules for regular clients?", a: "Yes. You can create weekly or bi-weekly recurring jobs for any client. Once set up, they stay on your calendar every cycle without re-booking." },
    { q: "Can I price jobs by yard size?", a: "Absolutely. You can set different pricing tiers for small, medium, and large yards — or set a flat rate per service type. Clients see the pricing when they book." },
    { q: "Can I add crew members to my account?", a: "Yes. You can add multiple crew members, assign them to specific routes or jobs, and view everyone's schedule from one unified calendar." },
    { q: "What happens if weather causes a cancellation?", a: "You can reschedule or cancel any job with one tap. Clients are automatically notified by text and the slot is freed up on your calendar." },
    { q: "Can I offer seasonal packages like fall cleanups?", a: "Yes. You can list any service as a one-time or seasonal offering. Many lawn care pros on Certxa use it to upsell cleanups and aeration to their existing mowing clients." },
    { q: "How do I handle clients who pay at the end of the month?", a: "You can send invoices at any time — immediately after a job or at the end of a billing period. Clients pay through a secure online link at their own pace." },
  ],
  ctaHeadline: "Ready to Grow Your Lawn Business?",
  ctaSub: "Start your 60-day free trial. No credit card required. Cancel any time.",
  ctaContext: "Join thousands of lawn care pros already using Certxa.",
  industryId: "lawn-care",
};

export default function LawnCareLanding() {
  return <IndustryLandingTemplate config={config} />;
}
