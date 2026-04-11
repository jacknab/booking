import fs from "fs";
import path from "path";
import type { SeoRegion } from "@shared/schema";

export const REGIONS_DIR = path.join(__dirname, "../client/public/regions");

function ensureDir() {
  if (!fs.existsSync(REGIONS_DIR)) fs.mkdirSync(REGIONS_DIR, { recursive: true });
}

// ── Product configurations ─────────────────────────────────────────────────

interface ProductConfig {
  name: string;
  tagline: string;
  color: string;
  colorDark: string;
  h1Suffix: string;
  metaTitleSuffix: string;
  metaDescTemplate: (city: string, state: string, phone: string) => string;
  keywordSuffix: string;
  features: string[];
  h2s: Array<{ heading: string; body: string }>;
  industries: string[];
  faqs: Array<{ q: string; a: string }>;
  cta: string;
  ctaUrl: string;
  schemaType: string;
}

function getProductConfig(product: string, city: string, state: string): ProductConfig {
  const configs: Record<string, ProductConfig> = {
    booking: {
      name: "Certxa Booking",
      tagline: "Online Appointment Booking Software",
      color: "#00D4AA",
      colorDark: "#00A882",
      h1Suffix: "Online Appointment Booking Software",
      metaTitleSuffix: "Online Appointment Booking",
      metaDescTemplate: (c, s, ph) =>
        `Looking for the best online appointment booking software in ${c}, ${s}? Certxa helps hair salons, spas, barbershops, and service businesses fill their calendars automatically — no more phone tag. ${ph ? `Call ${ph} or get started free today.` : "Get started free today."}`,
      keywordSuffix: "online booking software, appointment scheduling, booking app, salon software, spa booking",
      features: [
        "24/7 online booking — clients book themselves from any device",
        "Automated SMS & email reminders cut no-shows by up to 40%",
        "Staff scheduling, calendars & real-time availability management",
        "Built-in invoicing, POS & card payment processing",
        "Client history, notes, intake forms & loyalty programs",
        "Branded booking page with your logo, colors & services",
      ],
      h2s: [
        {
          heading: `Why ${city} Businesses Choose Certxa Booking`,
          body: `Running an appointment-based business in ${city} means juggling calls, texts, walk-ins, and last-minute cancellations all day. Certxa Booking puts your entire scheduling operation on autopilot — clients book online any time, get automatic reminders, and rebook easily. You spend less time on admin and more time doing what you do best.`,
        },
        {
          heading: "No More Phone Tag — Clients Book Themselves",
          body: `With Certxa, you get a branded booking page that works 24 hours a day, 7 days a week. Clients in ${city} and surrounding areas can browse your services, pick a time that works, and confirm their appointment in under two minutes — no phone call required. You get an instant notification, and they get an automatic confirmation.`,
        },
        {
          heading: "Automated Reminders That Actually Work",
          body: `No-shows are the number-one profit killer for appointment businesses. Certxa sends automated SMS and email reminders at the right time — 48 hours out, 24 hours out, and the morning of. Businesses using Certxa typically see a 35–40% drop in no-shows within the first 30 days.`,
        },
        {
          heading: `Serving All Appointment-Based Businesses in ${city}, ${state}`,
          body: `Certxa Booking works for any business that runs on appointments. Whether you're a hair salon, nail studio, spa, esthetician, tattoo artist, pet groomer, personal trainer, tutor, or massage therapist — if you schedule clients, Certxa was built for you.`,
        },
      ],
      industries: ["Hair Salons", "Barber Shops", "Nail Salons", "Spas & Massage", "Estheticians", "Tattoo Artists", "Pet Groomers", "Personal Trainers", "Tutors", "Medical Aesthetics"],
      faqs: [
        {
          q: `How does online booking software work for businesses in ${city}?`,
          a: `With Certxa, you set up your services, staff, and availability once. Clients in ${city} visit your booking page, choose a service and time, and confirm. You receive an instant alert and the appointment lands on your calendar automatically. No manual entry, no phone calls.`,
        },
        {
          q: "Does Certxa work on phones and tablets?",
          a: "Yes — Certxa is fully mobile-optimized. Your clients can book from any smartphone or tablet, and your staff can manage the calendar from any device, including from behind the chair.",
        },
        {
          q: "Can I keep my existing clients' information?",
          a: "Absolutely. You can import your existing client list, and Certxa will maintain full history, notes, and preferences for every client going forward.",
        },
        {
          q: "Is there a contract or setup fee?",
          a: "No contracts and no setup fees. Certxa runs on a simple monthly subscription. You can start with a free trial and cancel anytime.",
        },
      ],
      cta: "Start Your Free Trial",
      ctaUrl: "/booking",
      schemaType: "LocalBusiness",
    },

    queue: {
      name: "Certxa Queue",
      tagline: "Virtual Walk-In Queue Management",
      color: "#F59E0B",
      colorDark: "#D97706",
      h1Suffix: "Virtual Walk-In Queue Management",
      metaTitleSuffix: "Virtual Walk-In Queue System",
      metaDescTemplate: (c, s, ph) =>
        `End the wait-outside problem at your ${c}, ${s} business with Certxa Queue — the virtual check-in system that lets walk-in customers hold their spot from their phone. ${ph ? `Questions? Call ${ph}.` : "Get started free."}`,
      keywordSuffix: "virtual queue, walk-in management, digital waitlist, barbershop queue system, no-wait queue app",
      features: [
        "QR code check-in — customers join from any smartphone, no app download needed",
        "Live queue display for your shop TV, tablet, or monitor",
        "Automated SMS alerts bring customers back in right on time",
        "Walk-in loyalty punch cards that keep customers coming back",
        "Real-time wait estimates shown to customers on their phone",
        "Built-in POS & card payment processing at checkout",
      ],
      h2s: [
        {
          heading: `Stop Making Customers Wait Outside Your ${city} Business`,
          body: `Nobody likes standing in line — especially outside. With Certxa Queue, customers in ${city} scan a QR code at your door, join the virtual line from their phone, and go wait wherever they want. Your shop's live display shows everyone's place in line, and an automatic text brings them back right when it's their turn.`,
        },
        {
          heading: "How the Virtual Queue Works",
          body: `It's simple: a customer walks in, scans your QR code, and they're in line. They see their estimated wait time on their phone. When they're next up, Certxa automatically sends them a text saying "You're up — head back in now." No app download, no account creation — just a phone number and they're in.`,
        },
        {
          heading: "The Live Board Your Staff Will Love",
          body: `Your staff sees every person in the queue on a clean dashboard — name, wait time, and status. One tap moves the line forward. The shop display updates instantly so everyone in the room can see where the line stands. No whiteboards, no clipboards, no shouting names.`,
        },
        {
          heading: `Perfect for Walk-In Businesses in ${city}, ${state}`,
          body: `Certxa Queue was built specifically for businesses that run on walk-ins: barbershops, hair salons, nail studios, urgent care clinics, DMV-style service counters, food stands, and anywhere customers show up and wait. If you have a line, Certxa can manage it.`,
        },
      ],
      industries: ["Barber Shops", "Walk-In Hair Salons", "Nail Studios", "Urgent Care", "Food Counters", "Auto Service", "Government Service Centers", "Eyebrow & Threading Studios"],
      faqs: [
        {
          q: `How do customers join the queue at your ${city} location?`,
          a: `You print or display a QR code at your door or counter. Customers scan it with their phone's camera, enter their name and phone number, and they're instantly in the virtual line. No app download required — it works in any mobile browser.`,
        },
        {
          q: "What if a customer's wait is taking longer than expected?",
          a: "Certxa automatically updates estimated wait times in real time based on how quickly the queue is moving. If a customer's wait extends, their phone shows the updated estimate and they won't miss their turn.",
        },
        {
          q: "Can I still accept regular walk-ins who don't use their phone?",
          a: "Yes. Staff can add walk-in customers directly from the dashboard — so if someone doesn't have a smartphone or prefers not to use it, you add them manually in seconds.",
        },
        {
          q: "Does the system work if my internet goes down?",
          a: "The queue dashboard is cloud-based and runs on your internet connection. We recommend a backup hotspot, which most businesses keep anyway. Customer position and SMS alerts all run through our servers — not your local network.",
        },
      ],
      cta: "See Certxa Queue in Action",
      ctaUrl: "/queue",
      schemaType: "LocalBusiness",
    },

    pro: {
      name: "Certxa Pro",
      tagline: "Field Service Management Software",
      color: "#3B82F6",
      colorDark: "#2563EB",
      h1Suffix: "Field Service Management Software",
      metaTitleSuffix: "Field Service Management",
      metaDescTemplate: (c, s, ph) =>
        `Manage your entire field service operation in ${c}, ${s} from one platform. Certxa Pro handles dispatching, job tracking, crew management, invoicing, and payments — built for HVAC, plumbing, electrical, landscaping, and more. ${ph ? `Call ${ph}.` : ""}`,
      keywordSuffix: "field service management, job dispatch software, crew tracking, HVAC software, plumbing business software, service dispatch app",
      features: [
        "Live job dispatch board — drag-and-drop scheduling for your entire crew",
        "GPS crew tracking — see where every tech is in real time",
        "Mobile app for techs — job details, navigation, photos & invoice from the field",
        "Automated customer notifications for arrival windows and updates",
        "Invoicing, payment collection & digital signatures on-site",
        "Service history, equipment records & recurring job scheduling",
      ],
      h2s: [
        {
          heading: `Run Your ${city} Service Business From One Dashboard`,
          body: `If you're managing a field service operation in ${city} — HVAC, plumbing, electrical, landscaping, or any trade — you know how hard it is to keep jobs moving, crews informed, and customers updated all at the same time. Certxa Pro puts your entire operation on one screen: dispatch, GPS tracking, job status, invoicing, and customer communication.`,
        },
        {
          heading: "Dispatch Jobs Faster Than a Phone Call",
          body: `The Certxa Pro dispatch board lets you drag jobs onto tech calendars, see who's closest to a call, and send job details to the field instantly. Techs get the job on their phone — address, contact, work order, and notes — the moment you assign it. No more lost paperwork, no more call-backs to get details.`,
        },
        {
          heading: "Your Crew Gets a Mobile App That Actually Works",
          body: `Certxa's crew app gives every field tech everything they need: their daily job list, turn-by-turn navigation, space to upload photos and notes, and the ability to create and collect payment on invoices right on the spot. Customers sign on the screen and get a receipt emailed instantly.`,
        },
        {
          heading: `Built for Trade Contractors in ${city}, ${state}`,
          body: `Whether you run a 3-truck HVAC company or a 20-person plumbing operation, Certxa Pro scales to match your business. It's used by contractors across ${state} for heating and cooling, plumbing, electrical work, appliance repair, lawn care, cleaning services, and general contracting.`,
        },
      ],
      industries: ["HVAC", "Plumbing", "Electrical", "Landscaping & Lawn Care", "Appliance Repair", "Carpet Cleaning", "Pressure Washing", "Window Cleaning", "Handyman Services", "Roofing", "Pool Service"],
      faqs: [
        {
          q: `What makes Certxa Pro different from other field service software?`,
          a: `Most field service platforms are built for enterprise companies with IT departments. Certxa Pro is designed for small-to-mid-size contractors who need something that works out of the box — no weeks of setup, no training courses, no per-seat pricing that kills your margins.`,
        },
        {
          q: `Does my crew need smartphones to use Certxa Pro?`,
          a: `Yes — techs use the Certxa crew app on their Android or iPhone. Any modern smartphone works. The app is simple enough that techs are up and running in minutes, even if they're not particularly tech-savvy.`,
        },
        {
          q: `Can I track my crew's location in real time?`,
          a: `Yes. When a tech has the app open, you see their GPS location on the dispatch map. You can see who's en route, on-site, or between jobs at any moment — so you can make smart dispatch decisions fast.`,
        },
        {
          q: `Does Certxa Pro handle repeat or maintenance contract customers?`,
          a: `Yes. You can set up recurring jobs for maintenance customers — quarterly HVAC tune-ups, weekly lawn service, monthly pest control — and Certxa will auto-schedule and notify both the tech and the customer automatically.`,
        },
      ],
      cta: "Get a Free Demo",
      ctaUrl: "/pro",
      schemaType: "LocalBusiness",
    },
  };

  const cfg = configs[product] ?? configs["booking"];
  return cfg;
}

// ── Business-type-specific content templates ────────────────────────────────

interface BusinessTypeTemplate {
  h1Suffix: string;
  metaTitleSuffix: string;
  metaDescTemplate: (city: string, state: string, phone: string) => string;
  keywordSuffix: string;
  h2s: Array<{ heading: string; body: string }>;
  faqs: Array<{ q: string; a: string }>;
}

function getBusinessTypeTemplate(bt: string, city: string, state: string): BusinessTypeTemplate | null {
  const templates: Record<string, BusinessTypeTemplate> = {

    "Hair Salons": {
      h1Suffix: "Hair Salon Booking Software",
      metaTitleSuffix: "Hair Salon Appointment Software",
      metaDescTemplate: (c, s, ph) =>
        `The best online booking software for hair salons in ${c}, ${s}. Let clients book cuts, color, and styling appointments 24/7 — automatic reminders included. ${ph ? `Call ${ph} to learn more.` : "Start free today."}`,
      keywordSuffix: "hair salon booking software, salon appointment app, hair salon scheduling, stylist booking system, salon management software",
      h2s: [
        { heading: `Stop Answering Booking Calls at Your ${city} Hair Salon`, body: `Between cutting, coloring, and chatting with clients, the last thing you need is a phone ringing off the hook with booking requests. Certxa Booking gives your ${city} salon a 24/7 online booking page — clients pick their stylist, choose a service, and book a time that works, all without calling. You get a notification, they get a confirmation, and you keep cutting.` },
        { heading: "Let Clients Choose Their Stylist Online", body: `Clients are loyal. They want their person. Certxa lets each client browse your stylists, see real-time availability, and book their preferred stylist directly. No more "Is Sarah available Thursday?" — they see exactly what's open and book it in under two minutes.` },
        { heading: "Cut No-Shows With Automatic Reminders", body: `An empty chair is wasted money. Certxa sends automatic SMS and email reminders 48 hours and 24 hours before every appointment — so clients show up, or they reschedule with enough notice. Hair salons using Certxa typically see a 35–40% drop in no-shows within the first month.` },
        { heading: `Built for All Hair Salons in ${city}, ${state}`, body: `Whether you run a solo studio, a booth-rental salon, or a full-service salon with a team of 10 stylists — Certxa scales to fit. Each stylist gets their own calendar, you get a bird's eye view of the whole shop, and clients always know exactly when they're coming in.` },
      ],
      faqs: [
        { q: `Can clients book specific stylists at my ${city} salon?`, a: `Yes. You set up each stylist as a staff member with their own services and availability. Clients see the stylist roster, pick who they want, and book that person directly. Perfect for salons where clients have a regular stylist.` },
        { q: "Does Certxa work for booth renters?", a: "Absolutely. Each booth renter can have their own login, their own booking page, and their own calendar — all under the same salon umbrella. You see everyone's schedule; they manage their own clients." },
        { q: "Can I sell gift cards or packages through Certxa?", a: "Yes — Certxa supports prepaid packages and gift cards that clients can buy online. They're redeemed at checkout when a service is booked, making it easy to run promotions and drive repeat business." },
        { q: "What if I need to block time off or set vacation hours?", a: "Blocking time is simple. You or any stylist can block individual hours, full days, or set recurring closures for vacations, training days, or lunch breaks. Clients never see those times as available." },
      ],
    },

    "Barber Shops": {
      h1Suffix: "Barber Shop Booking Software",
      metaTitleSuffix: "Barber Shop Appointment Scheduling",
      metaDescTemplate: (c, s, ph) =>
        `Online booking built for barber shops in ${c}, ${s}. Clients book cuts, shaves, and lineups on their phone — no waiting, no calling. ${ph ? `Questions? Call ${ph}.` : "Get started free."}`,
      keywordSuffix: "barber shop booking software, barbershop scheduling app, barber appointment system, online barber booking, barber management software",
      h2s: [
        { heading: `Keep Your ${city} Barbershop Chair Filled — Without the Phone`, body: `Running a tight shop means every minute counts. Certxa Booking gives your ${city} barbershop an online booking page where clients schedule cuts, shaves, and lineups 24/7 — no back-and-forth texting, no phone calls between clients. Your schedule fills itself.` },
        { heading: "Clients Book Their Barber Directly", body: `Walk-in shops can still offer online booking for clients who want to reserve their time. Each barber gets their own schedule — clients pick their guy, choose a service (fade, cut, beard trim, shave), and lock in their spot. No surprises, no waiting around.` },
        { heading: "Reduce No-Shows With SMS Reminders", body: `An empty chair means lost revenue. Certxa automatically texts clients the night before and the morning of their appointment — a simple "Don't forget, you're in at 2pm tomorrow" is all it takes to get them through the door. Shops see no-show rates drop 35–40% in the first 30 days.` },
        { heading: `The Online Booking System Built for ${city} Barbers`, body: `Certxa works whether you're a solo barber running a 1-chair studio or a shop owner managing five barbers and two locations. The setup takes five minutes, the booking page looks clean and professional, and your clients will wonder why you didn't set it up sooner.` },
      ],
      faqs: [
        { q: `Can each barber have their own schedule?`, a: `Yes. Every barber gets their own calendar, their own availability, and their own booking link. Clients can book the whole shop or pick a specific barber — it's up to you how you set it up.` },
        { q: "Does it work for walk-in barber shops too?", a: "Yes. You can accept online bookings alongside walk-ins. The calendar shows real-time availability so clients who prefer to book ahead can do so, while the door stays open for walk-ins during open slots." },
        { q: "Can I charge a deposit to hold an appointment?", a: "Yes — Certxa lets you require a card on file or collect a deposit at booking time. This dramatically reduces no-shows for longer, higher-value appointments like color treatments or beard grooming packages." },
        { q: "How long does it take to set up?", a: "Most barbers are set up and taking bookings in under 15 minutes. You add your services, set your hours, and share your booking link. Certxa handles the rest." },
      ],
    },

    "Nail Salons": {
      h1Suffix: "Nail Salon Booking Software",
      metaTitleSuffix: "Nail Salon Appointment Scheduling",
      metaDescTemplate: (c, s, ph) =>
        `Online booking for nail salons in ${c}, ${s}. Let clients schedule manicures, pedicures, gel, acrylics, and nail art 24 hours a day. ${ph ? `Call ${ph}.` : "Try it free."}`,
      keywordSuffix: "nail salon booking software, nail appointment app, manicure scheduling system, nail salon management, gel nail booking",
      h2s: [
        { heading: `Fill Your ${city} Nail Salon Calendar Automatically`, body: `Your nail techs are busy — they don't have time to answer texts and Instagram DMs about appointments while they're doing sets. Certxa gives your ${city} nail salon a full online booking system where clients choose their service (gel, acrylic, manicure, pedicure, nail art) and book their tech in seconds.` },
        { heading: "Let Clients Pick Their Tech and Service Online", body: `Clients are picky about their nail tech — and that's good for business. Certxa lets clients browse your team, see who's available, and book exactly who they want for the exact service they need. No confusion, no double booking, no tech showing up unprepared.` },
        { heading: "Fewer No-Shows, Tighter Schedule", body: `Nail appointments take time to prep. When a client doesn't show, it costs you a full slot. Certxa's automatic SMS reminders reduce no-shows by an average of 38% — and if a client does need to cancel, they can do it online so you can refill the spot.` },
        { heading: `Works for Every Nail Studio in ${city}`, body: `Whether you run a solo nail studio, a full-service nail salon with 10 techs, or a mobile nail service — Certxa fits the way you work. Set service times, buffer time between clients, max daily bookings per tech, and anything else you need.` },
      ],
      faqs: [
        { q: `How do clients know which services to book?`, a: `You build a service menu in Certxa — listing each service with its name, price, duration, and description. Clients see exactly what they're booking and what it costs. No surprises at checkout.` },
        { q: "Can I set different hours for different nail techs?", a: "Yes. Each tech has their own schedule within the salon hours. If Maria works Tuesday through Saturday and Jenny works Monday through Friday, clients only see their actual available times." },
        { q: "Can I collect payment online at booking?", a: "Yes — Certxa supports online payment at the time of booking or at checkout. You can require a deposit to hold the slot, or collect full payment upfront for specialty services." },
        { q: "Can I run promotions through Certxa?", a: "Yes. You can create discount codes, package deals, and seasonal promotions that clients apply at booking. Great for first-time client specials or holiday gift packages." },
      ],
    },

    "Spas & Massage": {
      h1Suffix: "Spa & Massage Booking Software",
      metaTitleSuffix: "Spa Appointment Scheduling Software",
      metaDescTemplate: (c, s, ph) =>
        `Online booking software for spas and massage therapists in ${c}, ${s}. Let clients schedule massages, facials, and wellness treatments at any time. ${ph ? `Call ${ph}.` : "Get started free."}`,
      keywordSuffix: "spa booking software, massage appointment scheduling, massage therapist booking app, day spa management software, wellness booking system",
      h2s: [
        { heading: `Give Your ${city} Spa a Seamless Booking Experience`, body: `Your clients come to your ${city} spa to relax — the booking process should be just as effortless. Certxa lets clients browse your full menu of massages, facials, body treatments, and wellness services, then book with a few taps. No hold music, no voicemails, no back-and-forth.` },
        { heading: "Sell Packages and Gift Cards Online", body: `Spas run on packages and gifting. Certxa makes it easy to offer multi-session massage packages, couples spa days, and gift cards that clients can buy online and redeem at booking. Your revenue flows in even when you're fully booked.` },
        { heading: "Keep Your Therapists Fully Booked", body: `Certxa shows real-time availability for each therapist so clients book into open slots the moment they appear. If a cancellation opens up, clients on your waitlist get notified automatically — turning cancellations into revenue instead of lost time.` },
        { heading: `Serving All Spas and Wellness Studios in ${city}, ${state}`, body: `Certxa works for day spas, medical spas, independent massage therapists, wellness studios, and everything in between. Set room availability, manage multiple therapists, block prep time between sessions, and track intake forms digitally.` },
      ],
      faqs: [
        { q: `Can clients book couples massages or multi-person appointments?`, a: `Yes. You can set up services that require multiple therapists or rooms and allow clients to book them as a single appointment. Perfect for couples massages, bridal parties, and group wellness events.` },
        { q: "Can I collect intake forms before the appointment?", a: "Yes — Certxa supports digital intake forms that clients complete when they book or before they arrive. Therapists see health notes and preferences in advance so they're fully prepared." },
        { q: "Can I require a credit card to hold appointments?", a: "Yes. You can require a card on file or a deposit at booking time. This protects your time and dramatically reduces no-shows for longer, higher-value spa treatments." },
        { q: "Does Certxa support memberships or monthly packages?", a: "Yes. You can set up monthly membership plans where clients pay a flat rate and get a set number of treatments per month. Memberships auto-renew and clients redeem sessions through their booking page." },
      ],
    },

    "Estheticians": {
      h1Suffix: "Esthetician Booking Software",
      metaTitleSuffix: "Esthetician Appointment Scheduling",
      metaDescTemplate: (c, s, ph) =>
        `Online booking for estheticians in ${c}, ${s}. Let clients schedule facials, waxing, chemical peels, and skin care treatments 24/7. ${ph ? `Call ${ph}.` : "Try Certxa free."}`,
      keywordSuffix: "esthetician booking software, facial appointment scheduling, skin care booking app, esthetician management software, waxing appointment system",
      h2s: [
        { heading: `Build a Full Client Schedule Without Lifting the Phone`, body: `As an esthetician in ${city}, your hands are your business — keep them on clients, not on your phone. Certxa gives you a professional online booking page where clients schedule facials, waxing, peels, and custom skin care treatments around the clock.` },
        { heading: "Intake Forms That Actually Get Filled Out", body: `Skin care requires knowing your client. Certxa sends a digital intake form to every new client before their first appointment — collecting skin concerns, allergies, medications, and treatment goals automatically. You walk into every session prepared.` },
        { heading: "Client Profiles That Track Everything", body: `Certxa builds a complete profile for every client — services received, products used, skin notes, and booking history. Before each appointment, you see exactly what you did last time and what's working. Your clients feel remembered, and they come back.` },
        { heading: `Serving Independent Estheticians in ${city}, ${state}`, body: `Whether you work out of a suite, a shared studio space, or your own storefront, Certxa scales to your setup. Solo estheticians love it because it handles their entire client communication — confirmation texts, reminders, follow-up messages — on autopilot.` },
      ],
      faqs: [
        { q: `Can I set preparation time between clients?`, a: `Yes. You set a buffer time between appointments so you always have time to sanitize tools, change linens, and prepare for the next client. Certxa never books back-to-back unless you want it to.` },
        { q: "Can clients see my skin care menu with descriptions?", a: "Yes. You build your service menu with names, descriptions, prices, and durations. Clients read about each treatment before booking so they arrive with the right expectations." },
        { q: "What if I need to see clients by referral only?", a: "You can set your booking page to require a code or approval before a new client can book. Or you can keep it open for all new clients — it's your choice." },
        { q: "Can I send automated aftercare instructions after an appointment?", a: "Yes — Certxa can send a follow-up message after each appointment with aftercare instructions, product recommendations, or a rebooking reminder. All automated, all on your schedule." },
      ],
    },

    "Tattoo Studios": {
      h1Suffix: "Tattoo Studio Booking Software",
      metaTitleSuffix: "Tattoo Appointment Scheduling Software",
      metaDescTemplate: (c, s, ph) =>
        `Online booking for tattoo studios and artists in ${c}, ${s}. Let clients book consultations and tattoo sessions, submit reference art, and pay deposits — all online. ${ph ? `Call ${ph}.` : "Get started free."}`,
      keywordSuffix: "tattoo studio booking software, tattoo appointment scheduling, tattoo artist booking app, body art studio management, tattoo shop software",
      h2s: [
        { heading: `Take Tattoo Deposits and Bookings Online`, body: `Running a tattoo studio in ${city} means managing consultations, deposits, multi-session clients, and reference art all at once. Certxa gives you a professional booking system where clients request appointments, submit reference images, and pay a deposit to hold their session — all before they walk through the door.` },
        { heading: "Collect Deposits That Protect Your Time", body: `No-shows on a 3-hour tattoo session are painful. Certxa lets you require a non-refundable deposit at booking time — automatically collected via credit card. Your time is protected, and clients who put money down show up.` },
        { heading: "Manage Multiple Artists on One Calendar", body: `If you run a studio with multiple artists, Certxa gives each one their own schedule and booking page. Clients can browse by artist, see their availability and portfolio link, and book their preferred artist directly — even for multiple sessions.` },
        { heading: `Built for Tattoo Studios in ${city}, ${state}`, body: `Whether you're a solo artist working out of a private studio or managing a full shop with six stations, Certxa handles your booking workflow. Set session lengths, custom intake questions (style preference, placement, size), deposit amounts, and cancellation policies — all your way.` },
      ],
      faqs: [
        { q: `Can clients upload reference images when they book?`, a: `Yes. You can add a file upload field to your booking form so clients attach reference photos, style examples, or placement ideas before they arrive. You walk in prepared for every consultation.` },
        { q: "Can I charge different deposit amounts for different sessions?", a: "Yes. You set the deposit amount per service type — a small custom piece might have a $50 deposit; a full sleeve might require $200. All collected online at booking." },
        { q: "Can I block off time for walk-in clients?", a: "Yes. You can designate certain hours as walk-in time and block them from online booking. Certxa is flexible about mixing online reservations with walk-in availability." },
        { q: "Does Certxa handle multi-session clients?", a: "Yes. You can note in the client profile that they're part of an ongoing project, set up recurring appointments, and track progress across multiple sessions." },
      ],
    },

    "Pet Groomers": {
      h1Suffix: "Pet Grooming Booking Software",
      metaTitleSuffix: "Pet Groomer Appointment Scheduling",
      metaDescTemplate: (c, s, ph) =>
        `Online booking software for pet groomers in ${c}, ${s}. Let pet owners schedule baths, haircuts, nail trims, and full grooms 24/7 with automated reminders. ${ph ? `Call ${ph}.` : "Start free today."}`,
      keywordSuffix: "pet grooming booking software, dog groomer scheduling app, pet groomer appointment system, pet salon booking, grooming studio management",
      h2s: [
        { heading: `Let Pet Owners Book Their Pup's Appointment Online`, body: `Pet owners in ${city} are busy — and so are you. Certxa gives your grooming business a 24/7 online booking page where clients schedule baths, full grooms, nail trims, teeth brushing, and breed-specific cuts without calling. You get a new booking notification and they get a confirmation — it's that simple.` },
        { heading: "Client Profiles for Every Pet", body: `Every dog is different. Certxa lets you build a detailed profile for each pet — breed, weight, coat type, temperament notes, vaccination status, and past grooming history. When you see their appointment, you know exactly what you're working with before they arrive.` },
        { heading: "SMS Reminders That Bring Pets Back on Schedule", body: `Regular grooming keeps pets healthy — but pet owners forget. Certxa sends appointment reminders before every visit and can automatically prompt clients to rebook at the right interval for their pet's coat type. It keeps your calendar full without any extra work from you.` },
        { heading: `Serving Pet Groomers Across ${city}, ${state}`, body: `Whether you run a brick-and-mortar grooming salon, a mobile grooming van, or a home-based pet spa, Certxa adapts to your workflow. Set service times by breed and coat type, manage multiple groomers, and let clients choose the services their pet needs.` },
      ],
      faqs: [
        { q: `Can I store pet vaccination and health records in Certxa?`, a: `Yes. You can add custom fields to each pet profile for vaccination dates, health conditions, and vet contact info. Keep everything in one place so you're never working with incomplete information.` },
        { q: "Can I require proof of vaccination before a client books?", a: "Yes. You can add a note to your booking form requiring clients to confirm their pet is current on vaccinations, and block new clients from booking without filling out a health confirmation form." },
        { q: "How do I handle dogs that take longer than expected?", a: "Certxa lets you add buffer time between appointments so you're never rushed. If a groom runs over, you have built-in breathing room before the next pet arrives." },
        { q: "Can I offer packages like monthly memberships for regular grooming?", a: "Yes. You can set up grooming packages — e.g., 4 baths for the price of 3 — or monthly membership plans where clients pay a flat rate for a set number of visits. All managed through Certxa." },
      ],
    },

    "Personal Trainers": {
      h1Suffix: "Personal Trainer Booking Software",
      metaTitleSuffix: "Personal Training Scheduling Software",
      metaDescTemplate: (c, s, ph) =>
        `Online booking software for personal trainers in ${c}, ${s}. Let clients schedule sessions, track their progress, and never miss a workout with automatic reminders. ${ph ? `Call ${ph}.` : "Get started free."}`,
      keywordSuffix: "personal trainer booking software, fitness scheduling app, personal training management, gym session scheduling, fitness trainer software",
      h2s: [
        { heading: `Fill Your Training Calendar Without the Admin Headache`, body: `You became a personal trainer to change lives — not to manage a spreadsheet of session times. Certxa gives ${city} trainers a professional booking page where clients schedule sessions, view package balances, and get automatic reminders. You focus on coaching; Certxa handles the calendar.` },
        { heading: "Sell Training Packages and Track Sessions", body: `Most trainers sell packages — 10 sessions, monthly unlimited, 6-week programs. Certxa tracks package balances automatically. When a client books, their session count decrements. When they're running low, Certxa prompts them to renew. No more spreadsheets.` },
        { heading: "Accountability Reminders That Keep Clients Showing Up", body: `Consistency is everything in fitness. Certxa sends SMS reminders before every session so clients actually show up. It also sends a follow-up message after each workout — perfect for collecting feedback, sharing workout notes, or reminding clients to book their next session.` },
        { heading: `Built for Independent Trainers in ${city}, ${state}`, body: `Whether you train clients at a gym, in their home, at a studio, or outdoors in ${city}, Certxa adapts to your location and schedule. Set your available hours, define your services (1-on-1, couples, small group, virtual), and let clients book what works for them.` },
      ],
      faqs: [
        { q: `Can I train clients both in-person and virtually?`, a: `Yes. You can set up in-person and virtual session types as separate services. Clients book the format they want, and for virtual sessions, Certxa can include a video link in their confirmation automatically.` },
        { q: "How do I handle cancellations close to session time?", a: "You set your own cancellation policy in Certxa — for example, cancellations within 24 hours forfeit the session from their package. The policy is shown to clients at booking so there are no disputes." },
        { q: "Can I offer free consultations for new clients?", a: "Yes. You can add a free 30-minute consultation as a bookable service for new clients. Once they've trained with you, they book paid sessions directly." },
        { q: "Can clients pay for sessions or packages online?", a: "Yes — Certxa supports online payment at booking. Clients can pay for a single session or purchase a package upfront, with card on file for future session redemptions." },
      ],
    },

    "Yoga Studios": {
      h1Suffix: "Yoga Studio Booking Software",
      metaTitleSuffix: "Yoga Class Scheduling Software",
      metaDescTemplate: (c, s, ph) =>
        `Online class booking for yoga studios in ${c}, ${s}. Let students reserve spots in classes, workshops, and private sessions — with automatic reminders and waitlists. ${ph ? `Call ${ph}.` : "Try it free."}`,
      keywordSuffix: "yoga studio booking software, yoga class scheduling, yoga studio management, studio class booking system, yoga appointment software",
      h2s: [
        { heading: `Simplify Class Bookings at Your ${city} Yoga Studio`, body: `Running a yoga studio in ${city} means managing class schedules, drop-ins, memberships, private sessions, and workshops all at once. Certxa gives you one clean booking system where students reserve their spot online, pay for classes or passes, and get reminded before each session — without any manual work.` },
        { heading: "Class Capacity, Waitlists, and Drop-Ins Handled Automatically", body: `Set a cap on each class and Certxa enforces it. When a class fills up, students are added to a waitlist automatically — and if a spot opens up, the next person is notified instantly. No more turning students away at the door or keeping waitlists on paper.` },
        { heading: "Memberships and Class Passes That Track Themselves", body: `Sell 10-class packs, monthly unlimited memberships, or intro specials directly through Certxa. Students book a class and their pass balance decrements automatically. When they're down to their last class, they get a prompt to renew. Your revenue is predictable; their experience is seamless.` },
        { heading: `For Every Yoga Studio in ${city}, ${state}`, body: `Whether you teach hot yoga, vinyasa, restorative, prenatal, or kids' classes, Certxa handles your full schedule. Set different room sizes, instructor assignments, and pricing tiers per class type. New students can browse your schedule and book without creating an account.` },
      ],
      faqs: [
        { q: `Can students book a spot in a class without creating an account?`, a: `Yes. Students can book a class as a guest with just their name, email, and phone number. If they return, Certxa recognizes them and their history is preserved. No forced sign-up required.` },
        { q: "Can I manage multiple instructors on the same schedule?", a: "Yes. Each instructor has their own login and class assignments. Students can filter the schedule by instructor if they have a preference, or browse all available classes." },
        { q: "What happens if I need to cancel or reschedule a class?", a: "You cancel the class in Certxa and all enrolled students are automatically notified via SMS and email. They're prompted to rebook in another session or their credit is returned to their pass balance." },
        { q: "Can I run workshops and special events in addition to regular classes?", a: "Yes. Certxa supports one-time events and workshops with custom pricing, descriptions, and booking windows — separate from your regular class schedule." },
      ],
    },

    "Pilates Studios": {
      h1Suffix: "Pilates Studio Booking Software",
      metaTitleSuffix: "Pilates Class Scheduling Software",
      metaDescTemplate: (c, s, ph) =>
        `Online booking for Pilates studios in ${c}, ${s}. Students reserve mat and reformer classes, private sessions, and duets online with automatic reminders. ${ph ? `Call ${ph}.` : "Get started free."}`,
      keywordSuffix: "pilates studio booking software, reformer pilates scheduling, pilates class booking app, pilates studio management, mat pilates scheduling",
      h2s: [
        { heading: `Run Your ${city} Pilates Studio Without the Booking Chaos`, body: `Pilates studios run on precision — your booking system should too. Certxa gives ${city} studios a clean online system where students reserve mat classes, reformer sessions, and private appointments in seconds. Capacity limits, waitlists, and reminders all handled automatically.` },
        { heading: "Reformer Spots That Fill Themselves", body: `Reformer classes have a fixed number of machines — every empty spot is lost revenue. Certxa caps class enrollment at your reformer count and opens a waitlist automatically when a class is full. When a spot opens, the next student in line is notified and given a window to claim it.` },
        { heading: "Class Packs and Memberships With Automatic Tracking", body: `Your studio runs on recurring revenue — intro packs, 5-class bundles, monthly unlimited. Certxa tracks every purchase and every session automatically. Students always know their balance, and when they get low, a renewal prompt sends itself.` },
        { heading: `Serving Pilates Studios Across ${city}, ${state}`, body: `From a small home studio with two reformers to a full boutique Pilates studio with group and private offerings, Certxa scales to your business. Manage multiple instructors, different room types, and varied pricing tiers — all in one clean dashboard.` },
      ],
      faqs: [
        { q: `Can I limit who can take advanced reformer classes?`, a: `Yes. You can mark classes as requiring a prerequisite or set them to "members only." New students see these classes but must meet your criteria to book — keeping your advanced classes safe and appropriate.` },
        { q: "Can private and duet sessions be booked the same way as group classes?", a: "Yes. Private and duet sessions are set up as separate service types with their own duration, pricing, and instructor assignment. Clients book them the same way as any class." },
        { q: "Can clients cancel and rebook if something comes up?", a: "Yes, within your cancellation window. You set how far in advance a client must cancel to keep their credit. Late cancellations or no-shows can be set to forfeit the session from their pack." },
        { q: "Does Certxa support new client intro packages?", a: "Yes. You can offer a discounted intro package (e.g., 3 classes for $49) that new clients can purchase and redeem without any manual tracking on your end." },
      ],
    },

    "Lash Studios": {
      h1Suffix: "Lash Studio Booking Software",
      metaTitleSuffix: "Eyelash Extension Appointment Scheduling",
      metaDescTemplate: (c, s, ph) =>
        `Online booking for lash studios and lash techs in ${c}, ${s}. Let clients schedule full sets, fills, and lash lifts 24/7 with automatic reminders that reduce no-shows. ${ph ? `Call ${ph}.` : "Start free today."}`,
      keywordSuffix: "lash studio booking software, eyelash extension scheduling app, lash tech appointment system, lash fill booking, lash studio management",
      h2s: [
        { heading: `Stop Managing Lash Appointments by Text`, body: `As a lash tech in ${city}, you're fully booked hands-on for hours at a time — you can't stop mid-set to answer a DM about availability. Certxa gives your studio a booking page where clients schedule full sets, fills, lash lifts, and removals on their own time. You finish the set; the booking takes care of itself.` },
        { heading: "Separate Services for Full Sets, Fills, and Lifts", body: `Every lash service has a different time requirement. Certxa lets you set up each service with its own duration, price, and prep requirements. Clients see exactly what they're booking, what it costs, and how long it takes — no surprises, no running over schedule.` },
        { heading: "SMS Reminders That Actually Reduce No-Shows", body: `A 2-hour lash appointment is a huge gap in your schedule when someone doesn't show. Certxa sends automatic reminders 48 hours and 24 hours before every appointment — and lets clients confirm, reschedule, or cancel online. No-shows drop, your schedule stays tight.` },
        { heading: `For Lash Techs and Lash Studios in ${city}, ${state}`, body: `Whether you work from a suite in a beauty complex, a dedicated lash studio, or your home, Certxa works for your setup. Solo lash techs appreciate the automated reminders; studios with multiple techs use it to coordinate schedules, client notes, and aftercare follow-ups.` },
      ],
      faqs: [
        { q: `Can I require a deposit to hold lash appointments?`, a: `Yes. You can require a deposit at booking time — typically $20–$50 for a full set — collected automatically via credit card. Clients who pay a deposit almost always show up.` },
        { q: "Can clients see my lash menu with descriptions and photos?", a: "Yes. You can add photos and detailed descriptions to each service in your menu — clients know exactly what classic, hybrid, volume, and mega volume sets look like before they book." },
        { q: "Can I set fill appointment availability based on the client's last visit?", a: "Yes. You can add a note to the booking form asking clients when their last fill was, and manually review fill requests if needed. This helps you filter out clients who have waited too long and need a full set instead." },
        { q: "Does Certxa track aftercare and rebooking intervals for lash clients?", a: "Yes. You can send automatic follow-up messages after each appointment — with lash aftercare tips and a reminder to book their next fill at the right interval for their style." },
      ],
    },

    "Eyebrow & Threading": {
      h1Suffix: "Eyebrow & Threading Studio Booking Software",
      metaTitleSuffix: "Eyebrow Threading Appointment Scheduling",
      metaDescTemplate: (c, s, ph) =>
        `Online booking for eyebrow threading, waxing, and brow studios in ${c}, ${s}. Clients book threading, tinting, lamination, and microblading appointments 24/7. ${ph ? `Call ${ph}.` : "Get started free."}`,
      keywordSuffix: "eyebrow threading booking software, brow studio scheduling app, threading appointment system, microblading booking, brow lamination scheduling",
      h2s: [
        { heading: `Online Booking for Your ${city} Threading Studio`, body: `Threading studios in ${city} get busy — walk-in lines, phone calls, and DMs about wait times pile up fast. Certxa gives your studio an online booking page where clients schedule threading, tinting, lamination, and microblading in advance. Reduce the rush, protect your time, and keep the chair full with clients who actually show up.` },
        { heading: "Quick Services That Still Need to Be Booked Right", body: `Threading might take 10 minutes, but back-to-back clients without a system leads to overbooking and chaos. Certxa manages your flow automatically — clients book specific time slots, you set appropriate buffers between clients, and your day runs without gaps or overlaps.` },
        { heading: "Reminders That Bring Clients Back on Schedule", body: `Brow maintenance is regular — most clients need to come back every 2–3 weeks. Certxa sends appointment reminders before each visit and can automatically prompt clients to rebook at the right interval. Your loyal clients stay on schedule without you having to chase them.` },
        { heading: `Serving Brow Studios and Threading Bars in ${city}, ${state}`, body: `Whether you run a standalone threading studio, a threading bar inside a mall, or a full brow studio offering threading, waxing, tinting, and microblading — Certxa covers your full service menu and team schedule in one system.` },
      ],
      faqs: [
        { q: `Can I take bookings for both threading and microblading through the same system?`, a: `Yes. You set up each service type separately with its own duration, price, and staff assignment. Threading is 10 minutes; microblading might be 2 hours — Certxa handles both without any manual coordination.` },
        { q: "How do I handle walk-in clients alongside booked appointments?", a: "You can set open walk-in hours and reserved booking slots in the same schedule. Certxa only shows available slots for online booking — your walk-in capacity is separate." },
        { q: "Can I send aftercare instructions automatically after microblading appointments?", a: "Yes. Set up an automated follow-up message for microblading clients with full aftercare instructions. It sends automatically after the appointment without you needing to remember." },
        { q: "Can clients see pricing before they book?", a: "Yes. Every service in your menu includes the price, duration, and description. No surprises — clients know exactly what they're paying before they confirm." },
      ],
    },

    "Medical Aesthetics": {
      h1Suffix: "Medical Aesthetics Booking Software",
      metaTitleSuffix: "Medical Spa Appointment Scheduling",
      metaDescTemplate: (c, s, ph) =>
        `Online booking software for medical aesthetics practices and med spas in ${c}, ${s}. Schedule Botox, fillers, laser treatments, and skin rejuvenation services online. ${ph ? `Call ${ph}.` : "Get started free."}`,
      keywordSuffix: "medical aesthetics booking software, med spa scheduling app, Botox appointment booking, filler scheduling system, laser treatment booking",
      h2s: [
        { heading: `Professional Online Booking for Your ${city} Med Spa`, body: `Medical aesthetics practices in ${city} attract clients who expect a premium experience — your booking process should match. Certxa gives your med spa a polished, professional online booking page where clients schedule consultations, Botox, fillers, laser sessions, and skin care treatments with complete confidence.` },
        { heading: "Consultation First — Automatically", body: `New clients booking treatments like Botox, fillers, or laser should come in for a consultation first. Certxa lets you require new clients to book a consultation before accessing treatment appointments. Returning clients book treatment slots directly — all handled automatically.` },
        { heading: "HIPAA-Friendly Intake Forms Before Every Appointment", body: `Medical aesthetics requires detailed intake information. Certxa collects custom intake forms — health history, medications, allergies, treatment goals — before every appointment. Your practitioner walks into the room prepared, and nothing is left to verbal intake alone.` },
        { heading: `Serving Medical Spas and Aesthetics Practices in ${city}, ${state}`, body: `Whether you run a standalone medical spa, an aesthetics suite inside a medical practice, or a boutique medspa with multiple providers — Certxa manages your full provider calendar, client records, and service menu in one compliant, professional system.` },
      ],
      faqs: [
        { q: `Can I require medical intake forms before a client's first visit?`, a: `Yes. You can set up multi-page intake forms that new clients complete when they book. The form is stored in their client profile and accessible to your provider before the appointment.` },
        { q: "Can I block treatments that require a prior consultation?", a: "Yes. You can configure injectable and laser treatments to only be available to clients who have completed a consultation. New clients are routed to the consultation service automatically." },
        { q: "Does Certxa support multiple providers with different treatment menus?", a: "Yes. Each provider has their own calendar, their own service list, and their own availability. Clients can book by provider or by treatment type — whichever you prefer." },
        { q: "Can I send pre-treatment instructions automatically?", a: "Yes. Certxa sends customizable pre-appointment instructions with every booking confirmation — telling clients what to avoid before Botox, how to prepare for laser, or what to expect for their first filler session." },
      ],
    },

    "Physical Therapy": {
      h1Suffix: "Physical Therapy Scheduling Software",
      metaTitleSuffix: "Physical Therapy Appointment Booking",
      metaDescTemplate: (c, s, ph) =>
        `Online appointment scheduling for physical therapy clinics in ${c}, ${s}. Patients book initial evaluations and follow-up sessions online with automated reminders that improve attendance. ${ph ? `Call ${ph}.` : "Get started today."}`,
      keywordSuffix: "physical therapy scheduling software, PT clinic booking system, physical therapy appointment app, rehab clinic scheduling, PT patient scheduling",
      h2s: [
        { heading: `Reduce Admin Work at Your ${city} Physical Therapy Clinic`, body: `Your front desk is fielding calls, following up on missed appointments, and chasing referrals — all while your therapists treat patients. Certxa gives your ${city} PT clinic online self-scheduling so patients book initial evaluations and follow-up sessions without calling. Less admin, more care.` },
        { heading: "Appointment Reminders That Improve Attendance Rates", body: `Missed PT appointments delay recovery and cost your clinic revenue. Certxa sends automatic SMS and email reminders 48 hours and 24 hours before each session. Clinics using Certxa see attendance improve significantly — because patients who forget simply don't skip.` },
        { heading: "Intake and Health History Forms Before Day One", body: `Get the paperwork done before the patient walks in. Certxa sends a digital intake form with every new patient booking — collecting medical history, diagnosis, insurance info, and goals. Your therapist reviews it before the evaluation, not during.` },
        { heading: `Serving Physical Therapy Clinics Across ${city}, ${state}`, body: `Whether you run a single-therapist practice, a multi-specialty rehab clinic, or a sports PT facility, Certxa adapts to your patient volume and scheduling complexity. Manage multiple therapists, room assignments, and treatment types in one system.` },
      ],
      faqs: [
        { q: `Can patients self-schedule follow-up appointments after their initial evaluation?`, a: `Yes. After their first visit, patients can log back in and book follow-up sessions based on their therapist's availability. No phone calls required — they book directly.` },
        { q: "Can I manage multiple therapists and appointment types?", a: "Yes. Each therapist has their own schedule and treatment types. You can set different session lengths for evaluations, follow-ups, and specialty services like dry needling or manual therapy." },
        { q: "Does Certxa send appointment summaries to patients?", a: "Yes. Patients receive a full appointment confirmation via SMS and email — including date, time, therapist name, location address, and any pre-appointment instructions you add." },
        { q: "Can I track patient progress or notes in Certxa?", a: "Yes. Each patient profile includes a notes section where therapists log session observations, progress milestones, and next-step recommendations. Everything is tied to their appointment history." },
      ],
    },

    "Chiropractic Offices": {
      h1Suffix: "Chiropractic Office Booking Software",
      metaTitleSuffix: "Chiropractor Appointment Scheduling",
      metaDescTemplate: (c, s, ph) =>
        `Online scheduling for chiropractic offices in ${c}, ${s}. New and returning patients book adjustments, consultations, and wellness visits online — with automatic reminders. ${ph ? `Call ${ph}.` : "Get started free."}`,
      keywordSuffix: "chiropractic booking software, chiropractor scheduling app, chiropractic appointment system, spinal adjustment scheduling, chiropractic office management",
      h2s: [
        { heading: `Let Patients Book Their Adjustment Online`, body: `Your chiropractic office in ${city} serves patients who need regular care — but getting them to show up consistently is half the battle. Certxa lets new patients book their initial consultation online and existing patients schedule adjustments anytime, from any device. Less phone tag, more appointments kept.` },
        { heading: "Recurring Care Plans That Book Themselves", body: `Chiropractic care requires consistency — patients who come in on schedule heal faster. Certxa makes it easy to set up recurring appointment series so a new patient's 12-visit care plan is booked in one shot. They get reminders for every visit without you lifting a finger.` },
        { heading: "Automated Reminders Cut Same-Day Cancellations", body: `Same-day cancellations are a practice-killer. Certxa sends reminders 48 and 24 hours before every visit — giving patients enough notice to reschedule if needed and giving you enough time to fill the slot. Practices using Certxa report fewer last-minute cancellations within the first month.` },
        { heading: `Serving Chiropractic Offices in ${city}, ${state}`, body: `From solo chiropractors to multi-provider wellness clinics offering chiropractic, massage, and physical therapy under one roof — Certxa manages complex scheduling, patient intake forms, and care plan tracking in one professional system.` },
      ],
      faqs: [
        { q: `Can new patients book their initial consultation online?`, a: `Yes. You can set up an initial consultation as a distinct service type with its own intake form, duration, and provider assignment. New patients book it directly — no phone call needed.` },
        { q: "Can I set up a recurring care plan for a patient?", a: "Yes. You can book multiple appointments for a patient at once, spaced at whatever interval their care plan requires. They receive individual reminders for each visit." },
        { q: "Does Certxa support multiple chiropractors in the same practice?", a: "Yes. Each provider has their own schedule, their own service list, and their own patient roster. The front desk has a bird's eye view of the whole practice." },
        { q: "Can I send wellness tips or exercises between appointments?", a: "Yes. Certxa can send a follow-up message after each appointment with home exercise recommendations, posture tips, or any custom content you want patients to receive between visits." },
      ],
    },

    "Dance Studios": {
      h1Suffix: "Dance Studio Booking Software",
      metaTitleSuffix: "Dance Studio Class Scheduling Software",
      metaDescTemplate: (c, s, ph) =>
        `Online class booking for dance studios in ${c}, ${s}. Students and parents reserve spots in classes, workshops, and recital rehearsals 24/7. ${ph ? `Call ${ph}.` : "Try Certxa free."}`,
      keywordSuffix: "dance studio booking software, dance class scheduling app, dance studio management system, ballet class booking, dance school software",
      h2s: [
        { heading: `Streamline Class Registration at Your ${city} Dance Studio`, body: `Managing registrations for ballet, hip-hop, contemporary, and competition dance classes across multiple age groups is a full-time job. Certxa gives your ${city} studio an online class schedule where students (and parents) browse available classes, register, and pay — all without calling the front desk.` },
        { heading: "Class Capacity, Age Groups, and Waitlists", body: `Each class in Certxa has its own capacity limit. When a class fills up, students go on a waitlist automatically and are notified the moment a spot opens. You define age minimums and any prerequisites so the right students end up in the right classes.` },
        { heading: "Monthly Tuition and Drop-In Options", body: `Dance studios typically run on monthly tuition for enrolled students, with drop-in options for casual visitors. Certxa handles both — auto-billing for recurring monthly enrollment and per-class payment for drop-ins — with full session tracking for every student.` },
        { heading: `For Every Dance Studio in ${city}, ${state}`, body: `Whether you teach classical ballet, urban hip-hop, ballroom, contemporary, or acrobatics — for toddlers or teens or adults — Certxa organizes your full class catalog, handles instructor scheduling, and keeps your studio front desk from getting buried in registration paperwork.` },
      ],
      faqs: [
        { q: `Can parents register their children and manage their schedules online?`, a: `Yes. Parents create a family account, add their children as separate profiles, and register each child in appropriate classes. They see the full schedule, pay online, and receive reminders before each class.` },
        { q: "Can I manage multiple studios or locations?", a: "Yes. Certxa supports multiple locations under one account. Each location has its own schedule, instructors, and rooms — and you see everything from one central dashboard." },
        { q: "Does Certxa handle recital or competition registration separately?", a: "Yes. You can set up special events like recitals, competitions, and workshops as one-time bookable events with custom pricing, separate from the regular class schedule." },
        { q: "Can I send updates and announcements to all enrolled students?", a: "Yes. Certxa lets you send messages to all students enrolled in a specific class or to your entire studio at once — great for costume announcements, schedule changes, or recital reminders." },
      ],
    },

    "Tutoring Services": {
      h1Suffix: "Tutoring Service Booking Software",
      metaTitleSuffix: "Tutoring Appointment Scheduling Software",
      metaDescTemplate: (c, s, ph) =>
        `Online booking for tutors and tutoring centers in ${c}, ${s}. Students and parents schedule sessions, track progress, and receive reminders automatically. ${ph ? `Call ${ph}.` : "Get started free."}`,
      keywordSuffix: "tutoring booking software, tutor scheduling app, tutoring center management, online tutoring appointment system, academic tutoring scheduling",
      h2s: [
        { heading: `Let Families Book Tutoring Sessions on Their Schedule`, body: `Families in ${city} are juggling school, sports, and activities — tutoring scheduling shouldn't add to the stress. Certxa gives your tutoring service or center a 24/7 booking page where parents schedule sessions for the subjects they need, with the tutors who specialize in them, at times that work for the family.` },
        { heading: "Tutors With Their Own Schedules and Subjects", body: `Each tutor in Certxa has their own profile, subject list, availability, and hourly rate. Parents browse by subject or by tutor, see real-time availability, and book directly — even for recurring weekly sessions. No coordinator required.` },
        { heading: "Recurring Sessions That Auto-Book Every Week", body: `Most families want consistency — the same tutor, the same time, every week. Certxa makes it easy to set up recurring weekly or bi-weekly sessions that automatically hold the slot on the tutor's calendar. Families get reminders before every session without any manual booking each week.` },
        { heading: `Serving Tutors and Tutoring Centers in ${city}, ${state}`, body: `Whether you're a solo tutor working with a handful of students or a tutoring center managing 20 tutors and hundreds of weekly sessions, Certxa scales to your operation. Track subject specializations, session notes, and student progress all in one place.` },
      ],
      faqs: [
        { q: `Can parents book recurring weekly sessions with the same tutor?`, a: `Yes. When a parent books a session, they can choose to make it recurring — weekly, bi-weekly, or on a custom schedule. The tutor's slot is held automatically each week.` },
        { q: "Can tutors offer both in-person and virtual sessions?", a: "Yes. You can set up in-person and virtual session types with separate booking flows. Virtual sessions include an automatic video link in the confirmation email." },
        { q: "Can I track student progress and session notes?", a: "Yes. Each student has a profile where tutors log session notes, topics covered, and progress observations. Parents can view a summary of what was covered in each session." },
        { q: "Can I offer a free assessment session for new students?", a: "Yes. Set up a free 30-minute assessment as a bookable service for new students. After the assessment, parents can enroll in regular sessions directly through Certxa." },
      ],
    },

    "Dental Offices": {
      h1Suffix: "Dental Office Booking Software",
      metaTitleSuffix: "Dental Appointment Scheduling Software",
      metaDescTemplate: (c, s, ph) =>
        `Online appointment scheduling for dental offices in ${c}, ${s}. New and existing patients book cleanings, exams, and procedures online with automatic reminders to reduce no-shows. ${ph ? `Call ${ph}.` : "Get started today."}`,
      keywordSuffix: "dental office scheduling software, dentist appointment booking, dental practice management, patient scheduling system, dental booking app",
      h2s: [
        { heading: `Let Dental Patients Book Appointments Online — 24/7`, body: `Your dental office in ${city} fields dozens of scheduling calls every week. Certxa gives patients a self-service booking page where they schedule cleanings, exams, fillings, and consultations at any time — even evenings and weekends when your phone is off. More appointments booked, fewer calls answered.` },
        { heading: "New Patient Intake Forms Before the First Visit", body: `New patients bring paperwork. Certxa sends a digital intake form with every new patient booking — collecting health history, insurance information, medication lists, and dental concerns before they arrive. Your team reviews it before the appointment, not while the patient is in the chair.` },
        { heading: "Appointment Reminders That Reduce No-Shows and Last-Minute Cancellations", body: `Missed dental appointments are disruptive and expensive. Certxa sends automatic reminders 48 and 24 hours before every appointment — giving patients time to reschedule if needed and giving your front desk time to fill the slot. Practices see no-show rates drop significantly within the first 30 days.` },
        { heading: `Serving Dental Offices Across ${city}, ${state}`, body: `From a solo general dentist to a multi-provider practice offering family, cosmetic, and orthodontic services, Certxa manages provider calendars, operatory scheduling, and patient communications in one integrated system.` },
      ],
      faqs: [
        { q: `Can patients book new patient appointments and existing patient cleanings separately?`, a: `Yes. You set up separate service types for new patients and existing patients — each with its own duration, intake form, and booking availability. New patients are automatically routed to the appropriate slot.` },
        { q: "Can I manage multiple dentists and hygienists on the same system?", a: "Yes. Each provider and hygienist has their own schedule and service list. Patients can book with a specific provider or let your system assign based on availability." },
        { q: "Can I send recall reminders for 6-month cleanings?", a: "Yes. Certxa can send automatic recall reminders 6 months after a patient's last cleaning — prompting them to rebook before their appointment lapses. Keeps your hygiene schedule full year-round." },
        { q: "Does Certxa handle appointment confirmations and post-visit follow-ups?", a: "Yes. Every patient receives a confirmation at booking, a reminder before their visit, and a follow-up message after — which you can use for feedback requests, care instructions, or a reminder to book their next cleaning." },
      ],
    },

  };

  return templates[bt] ?? null;
}

// ── Main generator ─────────────────────────────────────────────────────────

export function generateRegionPage(region: SeoRegion, siteUrl = "https://certxa.com", allRegions: SeoRegion[] = []): string {
  const product = region.product === "all" ? "booking" : region.product;
  const cfg = getProductConfig(product, region.city, region.state);

  // Business-type-specific content overrides (when this page targets a specific business type)
  const btTpl = region.businessType
    ? getBusinessTypeTemplate(region.businessType, region.city, region.state)
    : null;

  const displayedIndustries: string[] = region.businessTypes
    ? (typeof region.businessTypes === "string" && region.businessTypes.startsWith("[")
        ? JSON.parse(region.businessTypes).filter(Boolean)
        : [region.businessTypes])
    : region.businessType
      ? [region.businessType]
      : cfg.industries;

  const nearbyCities: string[] = region.nearbyCities
    ? region.nearbyCities.split(",").map(c => c.trim()).filter(Boolean)
    : [];

  const phone = region.phone ?? "";
  const pageUrl = `${siteUrl}/regions/${region.slug}.html`;
  const countryCode = (region as any).country === "CA" ? "CA" : "US";

  // Content — prefer manual overrides, then business-type template, then product config
  const metaTitle = region.metaTitle
    ?? (btTpl
      ? `${region.city}, ${region.stateCode} ${btTpl.metaTitleSuffix} | Certxa`
      : `${cfg.name} in ${region.city}, ${region.stateCode} | ${cfg.metaTitleSuffix} | Certxa`);

  const metaDesc = region.metaDesc
    ?? (btTpl
      ? btTpl.metaDescTemplate(region.city, region.state, phone)
      : cfg.metaDescTemplate(region.city, region.state, phone));

  const h1 = region.h1Override
    ?? (btTpl
      ? `Certxa Booking for ${region.businessType} in ${region.city}, ${region.stateCode} — ${btTpl.h1Suffix}`
      : `${cfg.name} in ${region.city}, ${region.stateCode} — ${cfg.h1Suffix}`);

  const keywords = btTpl
    ? `${region.city} ${btTpl.keywordSuffix}, ${region.city} ${region.stateCode} ${region.businessType?.toLowerCase() ?? ""} software`
    : `${region.city} ${cfg.keywordSuffix}, ${region.city} ${region.stateCode} business software, Certxa ${region.city}`;

  const h2Blocks = btTpl ? btTpl.h2s : cfg.h2s;
  const faqItems = btTpl ? btTpl.faqs : cfg.faqs;

  // JSON-LD structured data
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": cfg.schemaType,
    "name": `Certxa — ${region.city}, ${region.stateCode}`,
    "description": metaDesc,
    "url": pageUrl,
    "telephone": phone || undefined,
    "address": {
      "@type": "PostalAddress",
      "addressLocality": region.city,
      "addressRegion": region.stateCode,
      "postalCode": region.zip ?? undefined,
      "addressCountry": countryCode,
    },
    "areaServed": {
      "@type": "City",
      "name": region.city,
    },
    "hasOfferCatalog": {
      "@type": "OfferCatalog",
      "name": btTpl ? `${region.businessType} Booking Software` : cfg.tagline,
      "itemListElement": cfg.features.map((f, i) => ({
        "@type": "Offer",
        "position": i + 1,
        "name": f,
      })),
    },
  };

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqItems.map(faq => ({
      "@type": "Question",
      "name": faq.q,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.a,
      },
    })),
  };

  const color = cfg.color;
  const colorDark = cfg.colorDark;

  // Build sitemap — group all pages (generated + current) by product
  const productOrder: Array<"booking" | "queue" | "pro"> = ["booking", "queue", "pro"];
  const productLabels: Record<string, string> = {
    booking: "Certxa Booking",
    queue: "Certxa Queue",
    pro: "Certxa Pro",
  };
  // Include all regions that have been generated, plus the current region itself
  const allForSitemap = [
    ...allRegions.filter(r => r.pageGenerated && r.slug !== region.slug),
    region,
  ];
  const grouped: Record<string, SeoRegion[]> = {};
  for (const r of allForSitemap) {
    const key = r.product === "all" ? "booking" : r.product;
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(r);
  }
  const sitemapGroupsHtml = productOrder
    .filter(key => grouped[key]?.length)
    .map(key => {
      const links = grouped[key]
        .sort((a, b) => a.city.localeCompare(b.city))
        .map(r => {
          const isCurrent = r.slug === region.slug;
          const label = `${r.city}, ${r.stateCode}`;
          if (isCurrent) {
            return `<span class="sitemap-link current">${label} (this page)</span>`;
          }
          return `<a href="/regions/${r.slug}.html" class="sitemap-link">${label}</a>`;
        })
        .join("\n        ");
      return `
    <div>
      <p class="sitemap-group-label">${productLabels[key]}</p>
      <div class="sitemap-links">
        ${links}
      </div>
    </div>`;
    })
    .join("");

  const sitemapHtml = sitemapGroupsHtml ? `
  <!-- Sitemap -->
  <div class="sitemap">
    <div class="sitemap-inner">
      <p class="sitemap-title">All Regional Pages</p>
      <div class="sitemap-groups">
        ${sitemapGroupsHtml}
        <div>
          <p class="sitemap-group-label">Main Site</p>
          <div class="sitemap-links">
            <a href="/" class="sitemap-link">Certxa Home</a>
            <a href="/get-started" class="sitemap-link">Pricing</a>
            <a href="/booking" class="sitemap-link">Certxa Booking</a>
            <a href="/queue" class="sitemap-link">Certxa Queue</a>
            <a href="/pro" class="sitemap-link">Certxa Pro</a>
          </div>
        </div>
      </div>
    </div>
  </div>` : `
  <!-- Sitemap -->
  <div class="sitemap">
    <div class="sitemap-inner">
      <p class="sitemap-title">Main Site</p>
      <div class="sitemap-groups">
        <div>
          <p class="sitemap-group-label">Certxa</p>
          <div class="sitemap-links">
            <a href="/" class="sitemap-link">Certxa Home</a>
            <a href="/get-started" class="sitemap-link">Pricing</a>
            <a href="/booking" class="sitemap-link">Certxa Booking</a>
            <a href="/queue" class="sitemap-link">Certxa Queue</a>
            <a href="/pro" class="sitemap-link">Certxa Pro</a>
          </div>
        </div>
      </div>
    </div>
  </div>`;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${metaTitle}</title>
  <meta name="description" content="${metaDesc}" />
  <meta name="keywords" content="${keywords}" />
  <link rel="canonical" href="${pageUrl}" />

  <!-- Open Graph -->
  <meta property="og:type" content="website" />
  <meta property="og:url" content="${pageUrl}" />
  <meta property="og:title" content="${metaTitle}" />
  <meta property="og:description" content="${metaDesc}" />
  <meta property="og:image" content="${siteUrl}/web-app.png" />
  <meta property="og:site_name" content="Certxa" />

  <!-- Twitter Card -->
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${metaTitle}" />
  <meta name="twitter:description" content="${metaDesc}" />
  <meta name="twitter:image" content="${siteUrl}/web-app.png" />

  <!-- Structured Data -->
  <script type="application/ld+json">${JSON.stringify(jsonLd, null, 2)}</script>
  <script type="application/ld+json">${JSON.stringify(faqJsonLd, null, 2)}</script>

  <!-- Fonts -->
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap" rel="stylesheet" />

  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    html { scroll-behavior: smooth; }
    body {
      font-family: 'Plus Jakarta Sans', sans-serif;
      background: #050C18;
      color: #ffffff;
      line-height: 1.6;
    }
    a { color: inherit; text-decoration: none; }
    img { max-width: 100%; display: block; }

    /* Nav */
    .nav {
      position: fixed; top: 0; left: 0; right: 0; z-index: 100;
      background: rgba(5,12,24,0.9); backdrop-filter: blur(16px);
      border-bottom: 1px solid rgba(255,255,255,0.06);
      height: 64px; display: flex; align-items: center;
      padding: 0 24px;
    }
    .nav-inner {
      max-width: 1200px; width: 100%; margin: 0 auto;
      display: flex; align-items: center; justify-content: space-between;
    }
    .nav-logo { font-size: 1.2rem; font-weight: 900; letter-spacing: -0.02em; display: flex; align-items: center; gap: 8px; }
    .nav-actions { display: flex; align-items: center; gap: 16px; }
    .nav-login { font-size: 0.875rem; color: rgba(255,255,255,0.5); font-weight: 500; }
    .nav-login:hover { color: #fff; }
    .btn-nav {
      background: #ffffff; color: #050C18;
      font-size: 0.875rem; font-weight: 700;
      padding: 8px 20px; border-radius: 12px;
      transition: background 0.2s;
    }
    .btn-nav:hover { background: rgba(255,255,255,0.88); }

    /* Hero */
    .hero {
      padding: 120px 24px 80px;
      text-align: center;
      background: radial-gradient(ellipse 900px 500px at 50% 0%, rgba(255,255,255,0.03) 0%, transparent 70%);
    }
    .hero-label {
      font-size: 0.75rem; font-weight: 700; letter-spacing: 0.18em;
      text-transform: uppercase; color: rgba(255,255,255,0.35);
      margin-bottom: 20px;
    }
    .hero h1 {
      font-size: clamp(2.2rem, 6vw, 3.8rem);
      font-weight: 900; line-height: 1.08; letter-spacing: -0.02em;
      max-width: 860px; margin: 0 auto 20px;
    }
    .hero h1 .accent { color: ${color}; }
    .hero-sub {
      font-size: 1.15rem; color: rgba(255,255,255,0.5);
      max-width: 580px; margin: 0 auto 36px;
    }
    .hero-phone {
      display: inline-flex; align-items: center; gap: 8px;
      background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.1);
      padding: 12px 24px; border-radius: 14px;
      font-size: 1.25rem; font-weight: 800;
      margin-bottom: 24px; letter-spacing: 0.01em;
    }
    .hero-phone a { color: ${color}; }
    .hero-phone a:hover { text-decoration: underline; }
    .hero-ctas { display: flex; gap: 12px; justify-content: center; flex-wrap: wrap; }
    .btn-primary {
      display: inline-flex; align-items: center; gap: 8px;
      background: ${color}; color: #050C18;
      font-weight: 700; font-size: 1rem;
      padding: 14px 32px; border-radius: 16px;
      transition: background 0.2s, transform 0.15s;
    }
    .btn-primary:hover { background: ${colorDark}; transform: translateY(-1px); }
    .btn-secondary {
      display: inline-flex; align-items: center; gap: 8px;
      background: rgba(255,255,255,0.07); color: #fff;
      font-weight: 600; font-size: 1rem;
      padding: 14px 32px; border-radius: 16px;
      border: 1px solid rgba(255,255,255,0.12);
      transition: background 0.2s;
    }
    .btn-secondary:hover { background: rgba(255,255,255,0.12); }

    /* Trust badges */
    .trust {
      display: flex; justify-content: center; gap: 32px; flex-wrap: wrap;
      padding: 32px 24px; border-top: 1px solid rgba(255,255,255,0.05);
      border-bottom: 1px solid rgba(255,255,255,0.05);
    }
    .trust-item { font-size: 0.85rem; color: rgba(255,255,255,0.4); text-align: center; }
    .trust-item strong { display: block; font-size: 1.3rem; font-weight: 800; color: ${color}; margin-bottom: 2px; }

    /* Content sections */
    .section { max-width: 1200px; margin: 0 auto; padding: 72px 24px; }
    .section-label {
      font-size: 0.75rem; font-weight: 700; letter-spacing: 0.15em;
      text-transform: uppercase; color: ${color};
      margin-bottom: 12px;
    }
    .section h2 {
      font-size: clamp(1.6rem, 4vw, 2.4rem);
      font-weight: 800; letter-spacing: -0.02em;
      margin-bottom: 18px;
    }
    .section p { color: rgba(255,255,255,0.6); font-size: 1.05rem; max-width: 700px; line-height: 1.75; margin-bottom: 16px; }

    /* Features grid */
    .features-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 16px;
      margin-top: 40px;
    }
    .feature-card {
      background: rgba(255,255,255,0.04);
      border: 1px solid rgba(255,255,255,0.07);
      border-radius: 16px;
      padding: 22px 24px;
    }
    .feature-card::before {
      content: '✓';
      display: inline-block;
      width: 28px; height: 28px;
      background: ${color}22;
      color: ${color};
      border-radius: 8px;
      text-align: center; line-height: 28px;
      font-weight: 900; font-size: 0.85rem;
      margin-bottom: 12px;
    }
    .feature-card p { font-size: 0.95rem; color: rgba(255,255,255,0.7); margin: 0; }

    /* Industries */
    .tags { display: flex; flex-wrap: wrap; gap: 10px; margin-top: 24px; }
    .tag {
      font-size: 0.85rem; font-weight: 600;
      padding: 8px 16px; border-radius: 50px;
      background: ${color}18;
      color: ${color}cc;
      border: 1px solid ${color}28;
    }

    /* H2 content blocks */
    .content-blocks { display: flex; flex-direction: column; gap: 64px; padding: 0 0 72px; }
    .content-block { max-width: 1200px; margin: 0 auto; padding: 0 24px; }
    .content-block h2 {
      font-size: clamp(1.5rem, 3.5vw, 2.2rem);
      font-weight: 800; letter-spacing: -0.02em;
      margin-bottom: 16px; line-height: 1.2;
    }
    .content-block p { color: rgba(255,255,255,0.6); font-size: 1.05rem; line-height: 1.75; max-width: 760px; }

    /* Nearby cities */
    .nearby { background: rgba(255,255,255,0.025); border-top: 1px solid rgba(255,255,255,0.05); border-bottom: 1px solid rgba(255,255,255,0.05); }
    .nearby-inner { max-width: 1200px; margin: 0 auto; padding: 48px 24px; }
    .nearby h3 { font-size: 1.1rem; font-weight: 700; margin-bottom: 16px; }
    .nearby-links { display: flex; flex-wrap: wrap; gap: 10px; }
    .nearby-link {
      font-size: 0.85rem; color: rgba(255,255,255,0.5);
      padding: 6px 14px; border-radius: 8px;
      background: rgba(255,255,255,0.04);
      border: 1px solid rgba(255,255,255,0.06);
      transition: color 0.2s, background 0.2s;
    }
    .nearby-link:hover { color: #fff; background: rgba(255,255,255,0.08); }

    /* FAQ */
    .faq-section { background: rgba(5,12,24,1); }
    .faq-inner { max-width: 900px; margin: 0 auto; padding: 80px 24px; }
    .faq-inner h2 { font-size: clamp(1.6rem, 4vw, 2.2rem); font-weight: 800; letter-spacing: -0.02em; margin-bottom: 40px; text-align: center; }
    .faq-item { border-top: 1px solid rgba(255,255,255,0.07); padding: 28px 0; }
    .faq-item:last-child { border-bottom: 1px solid rgba(255,255,255,0.07); }
    .faq-q { font-size: 1.05rem; font-weight: 700; margin-bottom: 12px; }
    .faq-a { color: rgba(255,255,255,0.55); font-size: 0.97rem; line-height: 1.75; }

    /* CTA banner */
    .cta-banner {
      background: linear-gradient(135deg, ${color}18 0%, rgba(5,12,24,1) 60%);
      border-top: 1px solid ${color}30;
      text-align: center;
      padding: 80px 24px;
    }
    .cta-banner h2 { font-size: clamp(1.8rem, 4vw, 2.6rem); font-weight: 900; letter-spacing: -0.02em; margin-bottom: 16px; }
    .cta-banner p { color: rgba(255,255,255,0.5); font-size: 1.1rem; max-width: 560px; margin: 0 auto 36px; }

    /* Sitemap */
    .sitemap {
      background: rgba(255,255,255,0.02);
      border-top: 1px solid rgba(255,255,255,0.06);
      padding: 56px 24px 48px;
    }
    .sitemap-inner {
      max-width: 1200px; margin: 0 auto;
    }
    .sitemap-title {
      font-size: 0.7rem; font-weight: 700; letter-spacing: 0.18em;
      text-transform: uppercase; color: rgba(255,255,255,0.2);
      margin-bottom: 28px;
    }
    .sitemap-groups {
      display: flex;
      flex-direction: column;
      gap: 36px;
    }
    .sitemap-group-label {
      font-size: 0.75rem; font-weight: 700; letter-spacing: 0.12em;
      text-transform: uppercase; color: rgba(255,255,255,0.3);
      margin-bottom: 12px; padding-bottom: 8px;
      border-bottom: 1px solid rgba(255,255,255,0.06);
    }
    .sitemap-links {
      columns: 4 180px;
      column-gap: 20px;
    }
    .sitemap-link {
      display: block;
      break-inside: avoid;
      font-size: 0.82rem; color: rgba(255,255,255,0.35);
      transition: color 0.15s;
      padding: 2px 0;
    }
    .sitemap-link:hover { color: rgba(255,255,255,0.65); }
    .sitemap-link.current { color: rgba(255,255,255,0.5); font-weight: 600; pointer-events: none; }

    /* Footer */
    footer {
      text-align: center; padding: 28px 24px;
      font-size: 0.82rem; color: rgba(255,255,255,0.2);
      border-top: 1px solid rgba(255,255,255,0.05);
    }
    footer a { color: rgba(255,255,255,0.3); }
    footer a:hover { color: rgba(255,255,255,0.55); }

    @media (max-width: 768px) {
      .sitemap-links { columns: 2 140px; }
    }
    @media (max-width: 640px) {
      .nav-login { display: none; }
      .features-grid { grid-template-columns: 1fr; }
      .trust { gap: 20px; }
      .sitemap-links { columns: 2 120px; }
    }
  </style>
</head>
<body>

  <!-- Navigation -->
  <nav class="nav">
    <div class="nav-inner">
      <a href="/" class="nav-logo">
        <img src="/web-app.png" alt="Certxa" width="28" height="28" style="border-radius:6px;" onerror="this.style.display='none'" />
        Certxa
      </a>
      <div class="nav-actions">
        <a href="/auth" class="nav-login">Log In</a>
        <a href="${cfg.ctaUrl}" class="btn-nav">Get Started Free</a>
      </div>
    </div>
  </nav>

  <!-- Hero -->
  <section class="hero">
    <p class="hero-label">${cfg.name} · ${region.city}, ${region.stateCode}</p>
    <h1>
      ${h1.replace(cfg.name, `<span class="accent">${cfg.name}</span>`)}
    </h1>
    <p class="hero-sub">${cfg.tagline} — helping businesses in ${region.city}, ${region.state} grow faster and run smoother.</p>
    ${phone ? `
    <div class="hero-phone">
      <span>📞</span>
      <span>Call us: <a href="tel:${phone.replace(/\D/g, "")}">${phone}</a></span>
    </div>` : ""}
    <div class="hero-ctas">
      <a href="${cfg.ctaUrl}" class="btn-primary">${cfg.cta} →</a>
      <a href="/get-started" class="btn-secondary">See Pricing</a>
    </div>
  </section>

  <!-- Trust bar -->
  <div class="trust">
    <div class="trust-item"><strong>40%</strong>Fewer No-Shows</div>
    <div class="trust-item"><strong>24/7</strong>Always Available</div>
    <div class="trust-item"><strong>5 min</strong>Setup Time</div>
    <div class="trust-item"><strong>No</strong>Contracts</div>
    <div class="trust-item"><strong>Free</strong>Trial Included</div>
  </div>

  <!-- Features -->
  <div class="section">
    <p class="section-label">${cfg.name} Features</p>
    <h2>Everything you need to run your ${region.city} business</h2>
    <p>Certxa gives ${region.city} businesses a complete platform — built specifically for how service businesses actually work.</p>
    <div class="features-grid">
      ${cfg.features.map(f => `
      <div class="feature-card">
        <p>${f}</p>
      </div>`).join("")}
    </div>
  </div>

  <!-- Content H2 blocks -->
  <div class="content-blocks">
    ${h2Blocks.map(block => `
    <div class="content-block">
      <h2>${block.heading}</h2>
      <p>${block.body}</p>
    </div>`).join("")}
  </div>

  <!-- Industries served -->
  <div class="section" style="padding-top:0;">
    <p class="section-label">Who We Serve</p>
    <h2>${region.businessType ? `${region.businessType} businesses in ${region.city}, ${region.stateCode}` : `Industries served in ${region.city}, ${region.stateCode}`}</h2>
    <p>${region.businessType ? `Certxa Booking is built specifically for ${region.businessType.toLowerCase()} — from solo operators to growing multi-location businesses in ${region.city} and the surrounding area.` : "Certxa works for a wide range of service businesses. If your business serves customers by appointment, walk-in, or field visit — we have a product built exactly for you."}</p>
    <div class="tags">
      ${displayedIndustries.map(t => `<span class="tag">${t}</span>`).join("")}
    </div>
  </div>

  <!-- Nearby cities (SEO long-tail) -->
  ${nearbyCities.length > 0 ? `
  <div class="nearby">
    <div class="nearby-inner">
      <h3>Also serving ${region.businessType ? region.businessType.toLowerCase() : "businesses"} near ${region.city}</h3>
      <div class="nearby-links">
        ${nearbyCities.map(c => `<span class="nearby-link">${c}, ${region.stateCode}</span>`).join("")}
      </div>
    </div>
  </div>` : ""}

  <!-- FAQ -->
  <div class="faq-section">
    <div class="faq-inner">
      <h2>Frequently Asked Questions</h2>
      ${faqItems.map(faq => `
      <div class="faq-item">
        <p class="faq-q">${faq.q}</p>
        <p class="faq-a">${faq.a}</p>
      </div>`).join("")}
    </div>
  </div>

  <!-- CTA banner -->
  <div class="cta-banner">
    <h2>Ready to grow your ${region.city} business?</h2>
    <p>Join service businesses across ${region.state} who use Certxa to save time, reduce no-shows, and keep customers coming back.</p>
    ${phone ? `<p style="font-size:1.2rem;font-weight:800;color:${color};margin-bottom:16px;">📞 <a href="tel:${phone.replace(/\D/g, "")}" style="color:${color};">${phone}</a></p>` : ""}
    <a href="${cfg.ctaUrl}" class="btn-primary" style="font-size:1.1rem;padding:16px 40px;">${cfg.cta} →</a>
  </div>

  ${sitemapHtml}

  <!-- Footer -->
  <footer>
    <p>
      &copy; ${new Date().getFullYear()} Certxa &mdash; ${region.city}, ${region.state} &mdash;
      <a href="/privacy-policy">Privacy Policy</a> &middot;
      <a href="/terms-of-service">Terms of Service</a> &middot;
      <a href="/">Back to Certxa.com</a>
    </p>
  </footer>

</body>
</html>`;
}

// ── Write page to disk ─────────────────────────────────────────────────────

export function writeRegionPage(region: SeoRegion, siteUrl?: string, allRegions: SeoRegion[] = []): string {
  ensureDir();
  const html = generateRegionPage(region, siteUrl, allRegions);
  const filePath = path.join(REGIONS_DIR, `${region.slug}.html`);
  fs.writeFileSync(filePath, html, "utf-8");
  return filePath;
}

export function deleteRegionPage(slug: string): void {
  const filePath = path.join(REGIONS_DIR, `${slug}.html`);
  if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
}

export function regionPageExists(slug: string): boolean {
  return fs.existsSync(path.join(REGIONS_DIR, `${slug}.html`));
}
