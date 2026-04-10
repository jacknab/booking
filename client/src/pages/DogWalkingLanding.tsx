import { Calendar, Users, DollarSign, Smartphone, MapPin, Repeat, BarChart3, Bell, Heart, Globe } from "lucide-react";
import IndustryLandingTemplate, { type IndustryConfig } from "./components/IndustryLandingTemplate";
import DogWalkingHeroVideo from "./components/DogWalkingHeroVideo";

const config: IndustryConfig = {
  badge: "🐕 Built for Dog Walkers & Pet Sitters",
  headlineLine1: "Every Pup.",
  headlineLine2: "In Good Hands.",
  subheadline: "Certxa handles online bookings, dog profiles, recurring walk schedules, post-walk updates, and payments — so you can spend more time with the dogs and less time on your phone.",
  heroVideo: <DogWalkingHeroVideo />,
  trustText: "Trusted by thousands of dog walkers & pet sitters",
  competitors: ["Rover Alternative", "Wag Alternative", "Time To Pet Alternative"],
  stats: [
    { value: "5,000+", label: "Dog Walkers" },
    { value: "300K+",  label: "Walks & Sits Booked" },
    { value: "97%",    label: "Client Retention Rate" },
    { value: "4.9★",   label: "Average Rating" },
  ],
  featuresLabel: "BUILT FOR DOG WALKERS",
  featuresTitle: "Everything Your Dog Walking Business Needs",
  featuresSubtitle: "From the first booking to the last walk update — Certxa keeps pet owners happy and your business growing.",
  features: [
    { icon: <Calendar className="w-6 h-6 text-[#00D4AA]" />, title: "Online Walk & Sit Booking",   desc: "Pet owners book walks, drop-in visits, or overnight stays from your booking link any time. They pick the service, duration, and time — it's confirmed on your calendar instantly." },
    { icon: <Repeat className="w-6 h-6 text-[#00D4AA]" />,   title: "Recurring Walk Schedules",    desc: "Set up daily or weekly walks for your regulars and they stay on your schedule automatically. Recurring clients are your bread and butter — keep them locked in." },
    { icon: <Heart className="w-6 h-6 text-[#00D4AA]" />,    title: "Dog Profiles & Health Notes", desc: "Store each dog's breed, age, temperament, leash behavior, allergies, vet contact, and any medical needs. Every pet owner will trust you more knowing you track the details." },
    { icon: <Bell className="w-6 h-6 text-[#00D4AA]" />,     title: "Post-Walk Report Cards",      desc: "Send owners a quick update after each walk — did the dog eat, any behavior notes, any concerns. Clients love it and it builds the kind of trust that generates referrals." },
    { icon: <MapPin className="w-6 h-6 text-[#00D4AA]" />,   title: "Key & Access Instructions",   desc: "Store lockbox codes, key locations, gate entry instructions, and alarm codes per client property. No scrambling before walks — everything is in the app." },
    { icon: <DollarSign className="w-6 h-6 text-[#00D4AA]"/>, title: "Online Payments",             desc: "Charge per walk or sell walk packages online. Clients pay by card automatically. No more cash handling, Venmo requests, or forgotten payments." },
    { icon: <Smartphone className="w-6 h-6 text-[#00D4AA]"/>, title: "Walk Reminders & Notifications", desc: "Automatic reminders go to clients before each booking. SMS updates when you pick up the dog. They're always in the loop without you sending a single manual text." },
    { icon: <Users className="w-6 h-6 text-[#00D4AA]" />,    title: "Client & Dog Database",       desc: "All your clients and their dogs in one organized place. See booking history, spending, and special notes at a glance. Build a loyal client base that refers their neighbors." },
    { icon: <BarChart3 className="w-6 h-6 text-[#00D4AA]" />, title: "Earnings Reports",            desc: "Track your weekly and monthly income, top clients, and most-booked services. Understand exactly how your dog walking business is growing month over month." },
  ],
  featureTabs: [
    {
      label: "Scheduling",
      icon: <Calendar className="w-4 h-4" />,
      heading: "Your walks, all organized in one place",
      subheading: "See every walk, every dog, and every time slot — manage your full week in seconds.",
      bullets: [
        "Daily and weekly recurring walks for regular clients set up once and handled automatically",
        "Color-code by service type (solo walk, group walk, drop-in, overnight)",
        "View your full route and client list for the day from your phone",
      ],
      mockType: "calendar",
    },
    {
      label: "Online Booking",
      icon: <Globe className="w-4 h-4" />,
      heading: "Pet owners book you on their schedule",
      subheading: "Share your link on Nextdoor or neighborhood groups — new clients book without back-and-forth.",
      bullets: [
        "Clients select their service, dog, and preferred time when booking",
        "Instant confirmation with all appointment details sent by text",
        "Accept deposits for overnight stays or new client intakes",
      ],
      mockType: "booking",
    },
    {
      label: "Invoicing",
      icon: <DollarSign className="w-4 h-4" />,
      heading: "Get paid for every walk without asking",
      subheading: "Set up auto-pay for weekly clients or send a tap-to-pay invoice after each session.",
      bullets: [
        "Sell walk packages — clients buy 10 walks upfront and you track usage",
        "Auto-pay for recurring clients means zero payment follow-up",
        "Instant receipt sent to pet owners after every payment",
      ],
      mockType: "invoice",
    },
    {
      label: "Client Management",
      icon: <Users className="w-4 h-4" />,
      heading: "Know every dog before you knock on the door",
      subheading: "Health notes, vet contacts, behavioral flags, and access codes — all in each dog's profile.",
      bullets: [
        "Dog profile: breed, age, leash behavior, allergies, medication, vet info",
        "Property notes: lockbox code, gate entry, alarm disarm instructions",
        "Full walk history per client with notes and payment records",
      ],
      mockType: "clients",
    },
    {
      label: "SMS Reminders",
      icon: <Smartphone className="w-4 h-4" />,
      heading: "Keep owners in the loop after every walk",
      subheading: "Post-walk report cards and automatic texts make pet owners trust you completely.",
      bullets: [
        "Automatic reminders to pet owners before each scheduled walk",
        "On-my-way text when you're heading to pick up the dog",
        "Post-walk update with notes — did they eat, any behavior, any concerns",
      ],
      mockType: "sms",
    },
  ],
  howItWorksSteps: [
    { step: "01", title: "Set Up Your Walker Profile", desc: "Add your services (walks, drop-ins, overnights), pricing, available hours, and service area. Our dog walker onboarding fills in common service types automatically." },
    { step: "02", title: "Share Your Booking Link",    desc: "Share it on Nextdoor, Facebook groups, your neighborhood app, or text it to neighbors. New clients book online — no phone tag, no back-and-forth." },
    { step: "03", title: "Walk, Update, Get Paid",     desc: "Show up to confirmed walks, send a post-walk update from your phone, and collect payment automatically. Repeat every day with zero admin overhead." },
  ],
  testimonials: [
    { quote: "The post-walk report cards are my secret weapon. Clients absolutely love getting an update after every walk. My referral rate has gone through the roof.", name: "Jenna M.", role: "Owner, Happy Tails Walking" },
    { quote: "I have 22 regular dogs now. Before Certxa, scheduling was a nightmare. Now my calendar fills itself and I spend zero time on admin. It's incredible.", name: "Sam P.", role: "Solo Dog Walker" },
    { quote: "No more 'can I Venmo you?' awkwardness. Clients set up auto-pay for their weekly walks and I don't have to think about it. My income is completely predictable now.", name: "Tara L.", role: "Owner, Paws & Go" },
  ],
  compareTitle: "Why Dog Walkers Choose Certxa",
  compareSubtitle: "Built for independent walkers and small pet care businesses.",
  compareRows: [
    ["Dog health & behavior profiles",    true,  false],
    ["Post-walk report card updates",     true,  false],
    ["Key & access instruction storage",  true,  false],
    ["Recurring walk scheduling",         true,  false],
    ["Online payments & packages",        true,  false],
    ["Client & pet database",             true,  true ],
    ["Online booking page",               true,  true ],
    ["60-day free trial",                 true,  false],
  ],
  faqs: [
    { q: "Can I store health and behavior notes for each dog?", a: "Yes. Each dog gets its own profile with breed, age, behavioral notes, allergies, medications, and vet contact info. You can update these after every visit." },
    { q: "Can pet owners book recurring walks online?", a: "Absolutely. Clients can book daily or weekly recurring walks from your booking link. The schedule stays on your calendar each week without re-booking." },
    { q: "Can I sell walk packages instead of charging per walk?", a: "Yes. You can offer packages like '10 walks for $X' and track usage per client. Great for regular clients who want to pay upfront and avoid per-walk billing." },
    { q: "How do I send post-walk updates to owners?", a: "After each walk you can log a quick note (feeding, behavior, any concerns) and send it to the pet owner by text. It only takes a few seconds and clients love it." },
    { q: "What if a client cancels last minute?", a: "Clients can cancel through their confirmation link. You'll be notified immediately. You can set cancellation policies (e.g., 24-hour notice required) in your booking settings." },
    { q: "Is Certxa only for dog walkers or does it work for pet sitting too?", a: "Certxa works for all pet care services — dog walking, drop-in visits, overnight boarding, cat sitting, and more. You can list any service type in your profile." },
  ],
  ctaHeadline: "Ready to Walk More Dogs?",
  ctaSub: "Start your 60-day free trial. No credit card required. Cancel any time.",
  ctaContext: "Join thousands of dog walkers already using Certxa to grow their business.",
  industryId: "dog-walking",
};

export default function DogWalkingLanding() {
  return <IndustryLandingTemplate config={config} />;
}
