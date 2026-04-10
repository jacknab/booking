import { Calendar, Users, DollarSign, Smartphone, MapPin, Repeat, CheckCircle, BarChart3, Zap, Globe } from "lucide-react";
import IndustryLandingTemplate, { type IndustryConfig } from "./components/IndustryLandingTemplate";
import SnowRemovalHeroVideo from "./components/SnowRemovalHeroVideo";

const config: IndustryConfig = {
  badge: "❄️ Built for Snow Removal Businesses",
  headlineLine1: "Every Storm.",
  headlineLine2: "Every Dollar.",
  subheadline: "Certxa handles dispatch, route management, recurring seasonal contracts, and on-the-spot invoicing — so you maximize every snow event without missing a single driveway.",
  heroVideo: <SnowRemovalHeroVideo />,
  trustText: "Trusted by thousands of snow removal businesses",
  competitors: ["Jobber Alternative", "GroundKeeper Alternative", "ServiceBridge Alternative"],
  stats: [
    { value: "6,000+", label: "Snow Removal Pros" },
    { value: "400K+",  label: "Jobs Dispatched" },
    { value: "95%",    label: "Seasonal Contract Rate" },
    { value: "4.9★",   label: "Average Rating" },
  ],
  featuresLabel: "BUILT FOR SNOW REMOVAL",
  featuresTitle: "Everything Your Snow Business Needs",
  featuresSubtitle: "From seasonal contracts to storm-day dispatch — Certxa keeps your routes running and your clients billed.",
  features: [
    { icon: <Calendar className="w-6 h-6 text-[#00D4AA]" />,    title: "On-Demand Dispatch",           desc: "Trigger jobs across your full client list the moment a storm hits. One tap activates the whole route — your crew gets notified and knows exactly where to go." },
    { icon: <Repeat className="w-6 h-6 text-[#00D4AA]" />,      title: "Seasonal Contracts",            desc: "Set up flat-rate seasonal contracts with automatic billing. Clients pay for the whole season upfront or monthly — you handle the storms, not the invoicing." },
    { icon: <MapPin className="w-6 h-6 text-[#00D4AA]" />,      title: "Route & Property Management",  desc: "Store each property's address, lot size, scope of work, and any special access instructions per client. Crews know every job before they arrive." },
    { icon: <DollarSign className="w-6 h-6 text-[#00D4AA]" />,  title: "Per-Event or Contract Billing", desc: "Charge per storm event, per inch, or via a flat seasonal rate. Mix billing types across your client list — each one invoiced automatically with the right terms." },
    { icon: <Zap className="w-6 h-6 text-[#00D4AA]" />,         title: "Storm-Day Job Creation",        desc: "Create and assign emergency jobs in seconds during a storm. No back-and-forth — crews see their assigned stops, estimated timing, and scope in the app." },
    { icon: <Smartphone className="w-6 h-6 text-[#00D4AA]" />,  title: "SMS Client Updates",            desc: "Automatically notify clients when your crew is on the way and when the job is complete. Reduce the 'is someone coming?' calls all season long." },
    { icon: <CheckCircle className="w-6 h-6 text-[#00D4AA]" />, title: "Job Completion Logs",           desc: "Crews mark jobs complete from their phones. You get a timestamped log of every property serviced — critical for liability and contract disputes." },
    { icon: <Users className="w-6 h-6 text-[#00D4AA]" />,       title: "Crew Management",               desc: "Assign drivers and laborers to specific routes or events. See your full crew's status during a storm from a single dispatch dashboard." },
    { icon: <BarChart3 className="w-6 h-6 text-[#00D4AA]" />,   title: "Season Revenue Reports",        desc: "See total revenue per storm event, per client, or for the whole season. Know your most profitable routes and which contracts to prioritize next year." },
  ],
  featureTabs: [
    {
      label: "Scheduling",
      icon: <Calendar className="w-4 h-4" />,
      heading: "Dispatch your whole route in seconds",
      subheading: "When a storm hits, one tap creates and assigns jobs across your full client list.",
      bullets: [
        "Storm-day dispatch: trigger jobs for all seasonal clients with a single action",
        "Assign specific crews or drivers to defined route zones automatically",
        "Track job status in real time — see which stops are done and which are next",
      ],
      mockType: "calendar",
    },
    {
      label: "Online Booking",
      icon: <Globe className="w-4 h-4" />,
      heading: "New clients sign up for seasonal service online",
      subheading: "Share your link in early fall — homeowners fill out a form, pick their service level, and you add them to your route.",
      bullets: [
        "New clients select property type, service scope, and preferred billing model",
        "Instant seasonal contract confirmation upon signup",
        "Returning clients can renew online in one click each fall",
      ],
      mockType: "booking",
    },
    {
      label: "Invoicing",
      icon: <DollarSign className="w-4 h-4" />,
      heading: "Get paid per storm or per season — your choice",
      subheading: "Set up seasonal contracts with auto-billing or send per-event invoices on storm days.",
      bullets: [
        "Auto-bill seasonal contract clients monthly with zero manual effort",
        "Per-event invoices generated and sent automatically after each storm",
        "Outstanding balance tracking across your full client list",
      ],
      mockType: "invoice",
    },
    {
      label: "Client Management",
      icon: <Users className="w-4 h-4" />,
      heading: "Know every property before your crew arrives",
      subheading: "Lot size, scope, access instructions, and service history — all stored per property.",
      bullets: [
        "Property notes: driveway length, sidewalks included, gate codes, obstacles",
        "Full service log with storm dates, completion times, and crew assigned",
        "Flag high-priority clients for first-dispatch routing",
      ],
      mockType: "clients",
    },
    {
      label: "SMS Reminders",
      icon: <Smartphone className="w-4 h-4" />,
      heading: "Clients know you're coming before they look outside",
      subheading: "Automatic storm alerts, en-route notifications, and completion confirmations — zero manual texts.",
      bullets: [
        "Storm-day alert texts sent to all seasonal clients when dispatch begins",
        "On-my-way SMS when your crew is heading to a specific property",
        "Completion confirmation so clients know their driveway is clear",
      ],
      mockType: "sms",
    },
  ],
  howItWorksSteps: [
    { step: "01", title: "Build Your Client List",  desc: "Add all your seasonal properties with address, scope, and billing terms before the season starts. Our onboarding fills in common snow removal service types automatically." },
    { step: "02", title: "Sign Contracts Online",   desc: "Share your signup link in early fall. Clients pick their service tier, sign the seasonal agreement, and pay their first installment — no paper forms." },
    { step: "03", title: "Dispatch and Invoice",    desc: "When snow hits, dispatch your crew to the full route in one tap. After each storm, invoices go out automatically and completion logs are saved." },
  ],
  testimonials: [
    { quote: "The storm-day dispatch alone paid for Certxa in the first week. I used to spend 45 minutes sending texts to my crew every time it snowed. Now it's one tap.", name: "Brad C.", role: "Owner, Arctic Clear Snow" },
    { quote: "Seasonal contracts with auto-billing completely changed my cash flow. I know exactly what I'm making all winter before a single flake falls.", name: "Kim S.", role: "Solo Snow Pro" },
    { quote: "The completion logs saved me during a dispute with a commercial client. I had timestamped records of every visit. Case closed.", name: "Derek P.", role: "Owner, ProPlow Services" },
  ],
  compareTitle: "Why Snow Pros Choose Certxa",
  compareSubtitle: "Built for seasonal operators who need to move fast when it snows.",
  compareRows: [
    ["Storm-day dispatch for full route",   true,  false],
    ["Seasonal contract billing",           true,  false],
    ["Per-property scope & access notes",   true,  false],
    ["Automatic storm-day SMS updates",     true,  false],
    ["Timestamped completion logs",         true,  false],
    ["Multi-crew route management",         true,  true ],
    ["Online booking & contract signup",    true,  false],
    ["60-day free trial",                   true,  false],
  ],
  faqs: [
    { q: "Can I set up seasonal contracts with automatic billing?", a: "Yes. You can create seasonal flat-rate contracts that automatically bill clients monthly or upfront. Clients sign online and payments run automatically throughout the season." },
    { q: "How does storm-day dispatch work?", a: "When a storm hits, you trigger a dispatch action that creates jobs for all your active seasonal clients at once. Your crew receives their assigned stops and can mark each one complete from their phone." },
    { q: "Can I mix per-storm and seasonal contract clients?", a: "Yes. You can have some clients on seasonal flat-rate contracts and others on per-event billing — Certxa handles both billing models simultaneously across your client list." },
    { q: "What happens if a client needs to add service mid-season?", a: "You can update any client's scope or service level at any time. New charges can be prorated or added as a one-time invoice separate from their contract." },
    { q: "Can I store liability documentation per client?", a: "Yes. Each property profile can include notes, scope details, and linked documents. Timestamped completion logs are automatically saved after every service." },
    { q: "Does Certxa work for commercial snow removal clients?", a: "Yes. Certxa handles both residential and commercial properties. You can prioritize commercial clients in your dispatch order and manage larger properties with detailed scope notes." },
  ],
  ctaHeadline: "Ready to Dominate This Season?",
  ctaSub: "Start your 60-day free trial before the first snow. No credit card required.",
  ctaContext: "Join thousands of snow removal businesses already using Certxa.",
  industryId: "snow-removal",
};

export default function SnowRemovalLanding() {
  return <IndustryLandingTemplate config={config} />;
}
