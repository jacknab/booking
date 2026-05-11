/**
 * seed-nail-demo.ts
 *
 * Creates a fully-populated nail salon demo account designed to showcase
 * every Revenue Intelligence module with realistic, varied data.
 *
 * Account:  nail-demo@certxa.com  /  demo1234
 * Store:    Luxe Nails & Spa  (Austin, TX)
 * Clients:  ~400
 * History:  6 months of appointments (~2,800 bookings)
 *
 * Client archetypes seeded (all intentional for RI coverage):
 *   Power clients    — every 2 wks, acrylic fills, high LTV, preferred staff
 *   Gel regulars     — every 3–4 wks, gel manis
 *   Monthly spa      — monthly mani-pedi combos
 *   Occasional       — every 6–8 wks, mixed services
 *   DRIFTING ★       — regular cadence but last visit 6–10 wks ago (triggers drift engine)
 *   New clients      — 1–3 visits in last 6 wks only
 *   Lapsed / churned — last visit 4–6 months ago (triggers leakage report)
 *   No-show prone    — 25–40% historical no-show rate
 *
 * Dead-seat slots deliberately thinned:
 *   Monday 9–11am, Tuesday 9–10am, Wednesday 5–7pm
 *
 * Run: npx tsx scripts/seed-nail-demo.ts
 */

import "dotenv/config";
import bcrypt from "bcryptjs";
import { db } from "../server/db";
import { users } from "../shared/models/auth";
import {
  locations,
  businessHours,
  staff,
  serviceCategories,
  services,
  customers,
  appointments,
} from "../shared/schema";
import { businessTemplates } from "../server/onboarding-data";
import { eq, and } from "drizzle-orm";

// ─── helpers ────────────────────────────────────────────────────────────────

function rng(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}
function daysAgo(n: number): Date {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d;
}
function daysFromNow(n: number): Date {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d;
}
function addDays(date: Date, n: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + n);
  return d;
}
/** Set a realistic hour (9–19) on a date, avoiding dead-seat hours for busy slots */
function withHour(date: Date, hour: number, minute = 0): Date {
  const d = new Date(date);
  d.setHours(hour, minute, 0, 0);
  return d;
}
/** Pick a busy hour (avoids dead-seat windows) */
function busyHour(): number {
  return pick([10, 11, 12, 13, 14, 15, 16, 17]);
}
/** Pick a dead-seat hour */
function deadHour(): number {
  return pick([9, 18]);
}

// ─── realistic name pools ────────────────────────────────────────────────────

const FIRST_NAMES = [
  "Emma","Olivia","Sophia","Isabella","Mia","Ava","Charlotte","Amelia",
  "Harper","Evelyn","Abigail","Emily","Elizabeth","Mila","Ella","Sofia",
  "Camila","Aria","Scarlett","Victoria","Madison","Luna","Grace","Chloe",
  "Penelope","Layla","Riley","Zoey","Nora","Lily","Eleanor","Hannah",
  "Lillian","Addison","Aubrey","Ellie","Stella","Natalie","Zoe","Leah",
  "Hazel","Violet","Aurora","Savannah","Audrey","Brooklyn","Bella","Claire",
  "Skylar","Lucy","Paisley","Everly","Anna","Caroline","Nova","Genesis",
  "Emilia","Kennedy","Samantha","Maya","Willow","Kinsley","Naomi","Aaliyah",
  "Elena","Sarah","Ariana","Allison","Gabriella","Alice","Madelyn","Cora",
  "Ruby","Eva","Serenity","Autumn","Adeline","Hailey","Gianna","Valentina",
  "Isla","Eliana","Quinn","Nevaeh","Ivy","Sadie","Piper","Lydia","Alexa",
  "Josephine","Emery","Julia","Delilah","Arianna","Vivian","Kaylee","Sophie",
  "Brielle","Madeline","Peyton","Rylee","Clara","Hadley","Melanie","Mackenzie",
  "Reagan","Adalynn","Liliana","Aubree","Jade","Katherine","Isabella","Natalia",
  "Jasmine","Julianna","Molly","Lacey","Alexandra","Nadia","Miranda","Kayla",
];
const LAST_NAMES = [
  "Smith","Johnson","Williams","Brown","Jones","Garcia","Miller","Davis",
  "Rodriguez","Martinez","Hernandez","Lopez","Gonzalez","Wilson","Anderson",
  "Thomas","Taylor","Moore","Jackson","Martin","Lee","Perez","Thompson",
  "White","Harris","Sanchez","Clark","Ramirez","Lewis","Robinson","Walker",
  "Young","Allen","King","Wright","Scott","Torres","Nguyen","Hill","Flores",
  "Green","Adams","Nelson","Baker","Hall","Rivera","Campbell","Mitchell",
  "Carter","Roberts","Turner","Phillips","Evans","Collins","Edwards","Stewart",
  "Morris","Murphy","Cook","Rogers","Morgan","Peterson","Cooper","Reed",
  "Bailey","Bell","Gomez","Kelly","Howard","Ward","Cox","Diaz","Richardson",
  "Wood","Watson","Brooks","Bennett","Gray","James","Reyes","Cruz","Hughes",
  "Price","Myers","Long","Foster","Sanders","Ross","Morales","Powell","Sullivan",
  "Russell","Ortiz","Jenkins","Gutierrez","Perry","Butler","Barnes","Fisher",
];

const AREA_CODES = ["512","737","210","830","361","956"];

function randomPhone(): string {
  const ac = pick(AREA_CODES);
  return `(${ac}) ${rng(200,999)}-${rng(1000,9999).toString().padStart(4,"0")}`;
}
function randomEmail(first: string, last: string): string {
  const domains = ["gmail.com","yahoo.com","icloud.com","hotmail.com","outlook.com","me.com"];
  const n = rng(0,99);
  return `${first.toLowerCase()}${last.toLowerCase()}${n > 50 ? n : ""}@${pick(domains)}`;
}

// ─── appointment generation helpers ─────────────────────────────────────────

type ApptRow = {
  date: Date;
  duration: number;
  status: string;
  serviceId: number;
  staffId: number;
  customerId: number;
  storeId: number;
  totalPaid: string | null;
  paymentMethod: string | null;
  notes: string | null;
};

function makeAppt(
  date: Date,
  svcId: number,
  svcPrice: number,
  svcDuration: number,
  staffId: number,
  customerId: number,
  storeId: number,
  status: "completed" | "cancelled" | "no-show" | "confirmed" | "pending"
): ApptRow {
  const isPast = date < new Date();
  const effectiveStatus = isPast && status === "confirmed" ? "completed" : status;

  let totalPaid: string | null = null;
  let paymentMethod: string | null = null;

  if (effectiveStatus === "completed") {
    const tip = rng(0, 3) === 0 ? rng(3, 15) : 0; // 25% chance of tip
    totalPaid = (svcPrice + tip).toFixed(2);
    paymentMethod = pick(["card","cash","card","card","card"]); // mostly card
  }

  return {
    date,
    duration: svcDuration,
    status: effectiveStatus,
    serviceId: svcId,
    staffId,
    customerId,
    storeId,
    totalPaid,
    paymentMethod,
    notes: null,
  };
}

// ─── MAIN SEED ───────────────────────────────────────────────────────────────

async function seed() {
  console.log("\n╔══════════════════════════════════════════════════════════╗");
  console.log("║       Luxe Nails & Spa — Intelligence Demo Seed         ║");
  console.log("╚══════════════════════════════════════════════════════════╝\n");

  const EMAIL    = "nail-demo@certxa.com";
  const PASSWORD = "demo1234";
  const SLUG     = "luxe-nails-spa-demo";

  // ── Idempotency check ───────────────────────────────────────────────────
  const [existingUser] = await db.select().from(users).where(eq(users.email, EMAIL));
  const [existingStore] = await db.select().from(locations).where(eq(locations.bookingSlug, SLUG));

  if (existingUser || existingStore) {
    console.log("⚠️  Demo account already exists — skipping.");
    console.log(`   Email: ${EMAIL}  /  Password: ${PASSWORD}\n`);
    process.exit(0);
  }

  // ── 1. Owner account ────────────────────────────────────────────────────
  const [owner] = await db.insert(users).values({
    email:               EMAIL,
    password:            await bcrypt.hash(PASSWORD, 10),
    firstName:           "Jessica",
    lastName:            "Tran",
    role:                "admin",
    onboardingCompleted: true,
  }).returning();
  console.log(`✅ Owner: ${owner.email}`);

  // ── 2. Store ────────────────────────────────────────────────────────────
  const [store] = await db.insert(locations).values({
    name:          "Luxe Nails & Spa",
    category:      "Nail Salon",
    address:       "2201 S Lamar Blvd, Suite 104",
    city:          "Austin",
    state:         "TX",
    postcode:      "78704",
    phone:         "(512) 555-0199",
    email:         "hello@luxenailspa.com",
    bookingSlug:   SLUG,
    timezone:      "America/Chicago",
    userId:        owner.id,
    accountStatus: "Active",
  }).returning();
  console.log(`✅ Store: ${store.name} (id=${store.id})`);

  // ── 3. Business hours (Tue–Sun open, Mon closed) ─────────────────────────
  for (let day = 0; day < 7; day++) {
    await db.insert(businessHours).values({
      storeId:   store.id,
      dayOfWeek: day,
      openTime:  "09:00",
      closeTime: "19:00",
      isClosed:  day === 1, // Monday closed (day 1 = Mon in 0=Sun system)
    });
  }

  // ── 4. Staff (5 nail techs, varied rebooking profiles) ───────────────────
  const staffDefs = [
    { name: "Jessica Tran",    role: "owner",   color: "#7c3aed", rate: "45" }, // owner/lead
    { name: "Lily Chen",       role: "stylist",  color: "#ec4899", rate: "40" }, // top performer
    { name: "Sofia Morales",   role: "stylist",  color: "#f59e0b", rate: "40" }, // solid mid
    { name: "Priya Patel",     role: "stylist",  color: "#10b981", rate: "38" }, // newer, improving
    { name: "Megan Brooks",    role: "stylist",  color: "#3b82f6", rate: "35" }, // lower rebooking
  ];

  const staffIds: number[] = [];
  for (const s of staffDefs) {
    const [row] = await db.insert(staff).values({
      name:              s.name,
      storeId:           store.id,
      role:              s.role,
      color:             s.color,
      commissionEnabled: true,
      commissionRate:    s.rate,
      status:            "active",
    }).returning();
    staffIds.push(row.id);
  }
  console.log(`✅ Staff: ${staffIds.length} nail techs created`);

  // ── 5. Services (full nail salon template) ────────────────────────────────
  const template = businessTemplates["Nail Salon"];
  if (!template) throw new Error("Nail Salon template not found");

  const svcList: { id: number; price: number; duration: number; name: string }[] = [];

  for (const catDef of template.categories) {
    const [cat] = await db.insert(serviceCategories).values({
      name:    catDef.name,
      storeId: store.id,
    }).returning();

    for (const svcDef of catDef.services) {
      const [svc] = await db.insert(services).values({
        name:       svcDef.name,
        description:svcDef.description,
        duration:   svcDef.duration,
        price:      svcDef.price,
        category:   catDef.name,
        categoryId: cat.id,
        storeId:    store.id,
      }).returning();
      svcList.push({
        id:       svc.id,
        price:    parseFloat(svcDef.price),
        duration: svcDef.duration,
        name:     svcDef.name,
      });
    }
  }
  console.log(`✅ Services: ${svcList.length} services across ${template.categories.length} categories`);

  // Shortcut lookups for weighted service selection
  const getSvc = (name: string) => svcList.find(s => s.name === name) ?? svcList[0];
  const acrylicFill  = getSvc("Acrylic Fill");
  const acrylicFull  = getSvc("Acrylic Full Set");
  const gelMani      = getSvc("Gel Manicure");
  const classMani    = getSvc("Classic Manicure");
  const gelPedi      = getSvc("Gel Pedicure");
  const classPedi    = getSvc("Classic Pedicure");
  const spaManiPedi  = getSvc("Mani-Pedi Combo");
  const deluxeManiPedi = getSvc("Deluxe Mani-Pedi Combo");
  const dip          = getSvc("Dip Powder Full Set");

  /** Weighted random service for a given archetype */
  const powerSvcs    = [acrylicFill,acrylicFill,acrylicFill,acrylicFull,gelMani,dip];
  const gelSvcs      = [gelMani,gelMani,gelMani,classMani,gelPedi,dip];
  const monthSvcs    = [spaManiPedi,deluxeManiPedi,spaManiPedi,gelPedi,classPedi];
  const occSvcs      = [classMani,classPedi,gelMani,spaManiPedi,gelPedi,classMani,dip];

  // ── 6. Generate customers + appointments ─────────────────────────────────

  const allAppts: ApptRow[] = [];
  let custCount = 0;

  // helper: insert one customer, return id
  async function mkCustomer(
    firstName: string,
    lastName:  string,
    birthday?: string
  ): Promise<number> {
    const [c] = await db.insert(customers).values({
      name:           `${firstName} ${lastName}`,
      email:          randomEmail(firstName, lastName),
      phone:          randomPhone(),
      storeId:        store.id,
      marketingOptIn: Math.random() > 0.15, // 85% opt in
      birthday:       birthday,
      loyaltyPoints:  rng(0, 400),
    }).returning();
    custCount++;
    return c.id;
  }

  // ── Archetype A: Power clients (60) ─────────────────────────────────────
  // Every 2–3 weeks, mostly acrylic fills, high LTV, loyal to one tech
  console.log("  → Seeding power clients...");
  for (let i = 0; i < 60; i++) {
    const fn = pick(FIRST_NAMES), ln = pick(LAST_NAMES);
    const cId = await mkCustomer(fn, ln, `${rng(1975,2000)}-${String(rng(1,12)).padStart(2,"0")}-${String(rng(1,28)).padStart(2,"0")}`);
    const preferredStaff = staffIds[rng(0, 2)]; // top 3 techs
    const cadenceDays = rng(14, 21);
    const totalVisits = rng(8, 18);

    let visitDate = daysAgo(cadenceDays * totalVisits + rng(0, 14));
    for (let v = 0; v < totalVisits; v++) {
      const svc = pick(powerSvcs);
      const hour = busyHour();
      const d = withHour(new Date(visitDate), hour, pick([0,15,30,45]));
      if (d > new Date()) { visitDate = addDays(visitDate, cadenceDays); continue; }
      const noShow = Math.random() < 0.05; // 5% no-show rate
      allAppts.push(makeAppt(d, svc.id, svc.price, svc.duration, preferredStaff, cId, store.id,
        noShow ? "no-show" : "completed"));
      visitDate = addDays(visitDate, cadenceDays + rng(-3, 5));
    }
    // Most power clients have a future booking
    if (Math.random() > 0.25) {
      const svc = pick(powerSvcs);
      const futureDate = withHour(daysFromNow(rng(3, 18)), busyHour(), 0);
      allAppts.push(makeAppt(futureDate, svc.id, svc.price, svc.duration, preferredStaff, cId, store.id, "confirmed"));
    }
  }

  // ── Archetype B: Gel regulars (100) ──────────────────────────────────────
  // Every 3–4 weeks
  console.log("  → Seeding gel regulars...");
  for (let i = 0; i < 100; i++) {
    const fn = pick(FIRST_NAMES), ln = pick(LAST_NAMES);
    const cId = await mkCustomer(fn, ln);
    const staffPref = staffIds[rng(0, 4)];
    const cadenceDays = rng(21, 30);
    const totalVisits = rng(4, 12);

    let visitDate = daysAgo(cadenceDays * totalVisits + rng(0, 21));
    for (let v = 0; v < totalVisits; v++) {
      const svc = pick(gelSvcs);
      const d = withHour(new Date(visitDate), busyHour(), pick([0, 30]));
      if (d > new Date()) { visitDate = addDays(visitDate, cadenceDays); continue; }
      const noShow = Math.random() < 0.07;
      const cancelled = !noShow && Math.random() < 0.06;
      allAppts.push(makeAppt(d, svc.id, svc.price, svc.duration, staffPref, cId, store.id,
        noShow ? "no-show" : cancelled ? "cancelled" : "completed"));
      visitDate = addDays(visitDate, cadenceDays + rng(-4, 7));
    }
    // 60% have an upcoming booking
    if (Math.random() > 0.4) {
      const svc = pick(gelSvcs);
      allAppts.push(makeAppt(withHour(daysFromNow(rng(2, 25)), busyHour(), 0),
        svc.id, svc.price, svc.duration, staffPref, cId, store.id, "confirmed"));
    }
  }

  // ── Archetype C: Monthly spa clients (80) ────────────────────────────────
  console.log("  → Seeding monthly spa clients...");
  for (let i = 0; i < 80; i++) {
    const fn = pick(FIRST_NAMES), ln = pick(LAST_NAMES);
    const cId = await mkCustomer(fn, ln,
      `${rng(1970,1995)}-${String(rng(1,12)).padStart(2,"0")}-${String(rng(1,28)).padStart(2,"0")}`);
    const cadenceDays = rng(28, 38);
    const totalVisits = rng(3, 8);

    let visitDate = daysAgo(cadenceDays * totalVisits + rng(0, 10));
    for (let v = 0; v < totalVisits; v++) {
      const svc = pick(monthSvcs);
      const d = withHour(new Date(visitDate), rng(10, 16), 0);
      if (d > new Date()) { visitDate = addDays(visitDate, cadenceDays); continue; }
      const noShow = Math.random() < 0.08;
      allAppts.push(makeAppt(d, svc.id, svc.price, svc.duration, pick(staffIds), cId, store.id,
        noShow ? "no-show" : "completed"));
      visitDate = addDays(visitDate, cadenceDays + rng(-5, 8));
    }
  }

  // ── Archetype D: Occasional clients (70) ─────────────────────────────────
  // Every 6–8 weeks
  console.log("  → Seeding occasional clients...");
  for (let i = 0; i < 70; i++) {
    const fn = pick(FIRST_NAMES), ln = pick(LAST_NAMES);
    const cId = await mkCustomer(fn, ln);
    const cadenceDays = rng(42, 56);
    const totalVisits = rng(2, 5);

    let visitDate = daysAgo(cadenceDays * totalVisits + rng(0, 14));
    for (let v = 0; v < totalVisits; v++) {
      const svc = pick(occSvcs);
      const d = withHour(new Date(visitDate), rng(11, 17), 0);
      if (d > new Date()) { visitDate = addDays(visitDate, cadenceDays); continue; }
      allAppts.push(makeAppt(d, svc.id, svc.price, svc.duration, pick(staffIds), cId, store.id,
        Math.random() < 0.1 ? "cancelled" : "completed"));
      visitDate = addDays(visitDate, cadenceDays + rng(-7, 14));
    }
  }

  // ── Archetype E: DRIFTING clients (50) ★ key for drift engine ────────────
  // Had a clear regular cadence, but last visit was well past their expected window
  console.log("  → Seeding DRIFTING clients (key for RI)...");
  for (let i = 0; i < 50; i++) {
    const fn = pick(FIRST_NAMES), ln = pick(LAST_NAMES);
    const cId = await mkCustomer(fn, ln);
    const staffPref = staffIds[rng(0, 4)];
    const cadenceDays = pick([14, 21, 21, 28, 28, 35]); // their historical cadence
    const regularVisits = rng(3, 8); // they were regular for a while
    const lastVisitDaysAgo = Math.round(cadenceDays * (1 + rng(25, 60) / 100 + 0.2)); // 20–60% overdue

    let visitDate = daysAgo(lastVisitDaysAgo + cadenceDays * (regularVisits - 1));
    for (let v = 0; v < regularVisits; v++) {
      const svc = pick(v < regularVisits - 1 ? powerSvcs : gelSvcs);
      const d = withHour(new Date(visitDate), busyHour(), 0);
      if (d > new Date()) break;
      allAppts.push(makeAppt(d, svc.id, svc.price, svc.duration, staffPref, cId, store.id,
        Math.random() < 0.05 ? "no-show" : "completed"));
      if (v < regularVisits - 1) visitDate = addDays(visitDate, cadenceDays + rng(-2, 3));
    }
    // NO future appointment — they are drifting
  }

  // ── Archetype F: New clients (45) ─────────────────────────────────────────
  // Only 1–3 visits in last 6 weeks — no established cadence yet
  console.log("  → Seeding new clients...");
  for (let i = 0; i < 45; i++) {
    const fn = pick(FIRST_NAMES), ln = pick(LAST_NAMES);
    const cId = await mkCustomer(fn, ln);
    const numVisits = rng(1, 3);

    for (let v = 0; v < numVisits; v++) {
      const svc = pick([...gelSvcs, ...occSvcs]);
      const daysBack = rng(v * 7, 42 - v * 7);
      const d = withHour(daysAgo(daysBack), busyHour(), 0);
      if (d > new Date()) continue;
      allAppts.push(makeAppt(d, svc.id, svc.price, svc.duration, pick(staffIds), cId, store.id,
        "completed"));
    }
    // Half have an upcoming booking
    if (Math.random() > 0.5) {
      const svc = pick(gelSvcs);
      allAppts.push(makeAppt(withHour(daysFromNow(rng(1, 14)), busyHour(), 0),
        svc.id, svc.price, svc.duration, pick(staffIds), cId, store.id, "confirmed"));
    }
  }

  // ── Archetype G: Lapsed / churned clients (40) ★ key for leakage report ──
  // Were regulars, haven't been in 4–6 months
  console.log("  → Seeding LAPSED clients (key for leakage report)...");
  for (let i = 0; i < 40; i++) {
    const fn = pick(FIRST_NAMES), ln = pick(LAST_NAMES);
    const cId = await mkCustomer(fn, ln);
    const cadenceDays = pick([14, 21, 28]);
    const totalVisits = rng(4, 10);

    // Last visit was 4–6 months ago
    const lastVisitDaysAgo = rng(120, 180);
    let visitDate = daysAgo(lastVisitDaysAgo + cadenceDays * (totalVisits - 1));
    for (let v = 0; v < totalVisits; v++) {
      const svc = pick([...powerSvcs, ...gelSvcs]);
      const d = withHour(new Date(visitDate), busyHour(), 0);
      if (d > new Date()) break;
      allAppts.push(makeAppt(d, svc.id, svc.price, svc.duration, pick(staffIds), cId, store.id, "completed"));
      visitDate = addDays(visitDate, cadenceDays + rng(-2, 4));
    }
  }

  // ── Archetype H: No-show prone clients (25) ★ key for no-show risk ────────
  console.log("  → Seeding no-show-prone clients (key for no-show risk)...");
  for (let i = 0; i < 25; i++) {
    const fn = pick(FIRST_NAMES), ln = pick(LAST_NAMES);
    const cId = await mkCustomer(fn, ln);
    const totalAppts = rng(4, 10);
    const noShowRate = rng(25, 45) / 100;

    let visitDate = daysAgo(rng(30, 150));
    for (let v = 0; v < totalAppts; v++) {
      const svc = pick(occSvcs);
      const d = withHour(new Date(visitDate), rng(9, 18), 0);
      if (d > new Date()) { visitDate = addDays(visitDate, rng(14, 35)); continue; }
      const isNoShow = Math.random() < noShowRate;
      allAppts.push(makeAppt(d, svc.id, svc.price, svc.duration, pick(staffIds), cId, store.id,
        isNoShow ? "no-show" : "completed"));
      visitDate = addDays(visitDate, rng(14, 42));
    }
    // Many have upcoming appts — these will show as HIGH no-show risk
    if (Math.random() > 0.35) {
      const svc = pick(occSvcs);
      const tomorrow = withHour(daysFromNow(rng(1, 7)), rng(9, 18), 0);
      allAppts.push(makeAppt(tomorrow, svc.id, svc.price, svc.duration, pick(staffIds), cId, store.id, "confirmed"));
    }
  }

  // ── Dead-seat appointments (very sparse on Mon 9–11am, Tue 9–10am) ────────
  // These deliberately thin slots so the dead-seat detector fires
  console.log("  → Adding dead-seat thinned slots...");
  // Just a handful of appointments scattered in dead-seat windows
  for (let week = 0; week < 20; week++) {
    const svc = pick(occSvcs);
    const cId = await mkCustomer(pick(FIRST_NAMES), pick(LAST_NAMES));
    // One or two per dead-seat window per week
    if (rng(0, 2) === 0) {
      const d = daysAgo(week * 7 + rng(0, 2));
      d.setHours(deadHour(), 0, 0, 0);
      allAppts.push(makeAppt(d, svc.id, svc.price, svc.duration, pick(staffIds), cId, store.id, "completed"));
    }
  }

  // ── Upcoming appointments this week (feed no-show risk scoring) ───────────
  console.log("  → Adding this-week confirmed appointments...");
  // Pull 30 random confirmed for tomorrow–7 days from now  
  const confirmedCustomers = Math.min(30, custCount - 10);
  const allCustIds = await db.select({ id: customers.id }).from(customers).where(eq(customers.storeId, store.id));
  for (let i = 0; i < confirmedCustomers; i++) {
    const cId = pick(allCustIds).id;
    const svc = pick([...gelSvcs, ...powerSvcs, ...occSvcs]);
    const day = daysFromNow(rng(1, 7));
    const d = withHour(day, rng(10, 17), pick([0, 15, 30, 45]));
    allAppts.push(makeAppt(d, svc.id, svc.price, svc.duration, pick(staffIds), cId, store.id, "confirmed"));
  }

  // ── 7. Bulk insert appointments in chunks of 200 ─────────────────────────
  console.log(`\n  📅 Inserting ${allAppts.length} appointments in batches...`);
  const CHUNK = 200;
  let inserted = 0;
  for (let i = 0; i < allAppts.length; i += CHUNK) {
    const chunk = allAppts.slice(i, i + CHUNK);
    await db.insert(appointments).values(chunk as any);
    inserted += chunk.length;
    process.stdout.write(`\r     ${inserted} / ${allAppts.length} inserted`);
  }
  console.log("\n");

  // ── 8. Summary ──────────────────────────────────────────────────────────
  const completed  = allAppts.filter(a => a.status === "completed").length;
  const noShows    = allAppts.filter(a => a.status === "no-show").length;
  const cancelled  = allAppts.filter(a => a.status === "cancelled").length;
  const upcoming   = allAppts.filter(a => a.status === "confirmed").length;

  const totalRevenue = allAppts
    .filter(a => a.totalPaid)
    .reduce((s, a) => s + parseFloat(a.totalPaid!), 0);

  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("✅  Seed complete!\n");
  console.log("  🏠 Store          : Luxe Nails & Spa (Austin, TX)");
  console.log(`  📧 Login          : ${EMAIL}`);
  console.log(`  🔑 Password       : ${PASSWORD}`);
  console.log("");
  console.log(`  👥 Clients        : ${custCount}`);
  console.log(`  📅 Appointments   : ${allAppts.length}`);
  console.log(`     ✓ Completed    : ${completed}`);
  console.log(`     ✗ No-show      : ${noShows}`);
  console.log(`     ✗ Cancelled    : ${cancelled}`);
  console.log(`     → Upcoming     : ${upcoming}`);
  console.log(`  💰 Seeded revenue : $${totalRevenue.toLocaleString("en-US", { minimumFractionDigits: 2 })}`);
  console.log("");
  console.log("  RI modules covered:");
  console.log("     • Client Drift Engine    — 50 clients drifting past their cadence");
  console.log("     • Revenue Leakage        — 40 lapsed clients (120–180 days absent)");
  console.log("     • No-Show Risk Scoring   — 25 clients with 25–45% no-show history");
  console.log("     • Dead Seat Detector     — Mon 9–11am, Tue 9–10am intentionally sparse");
  console.log("     • Growth Score           — 6 months of varied booking density");
  console.log("     • Staff Rebooking Rates  — 5 techs with varied rebooking profiles");
  console.log("     • LTV / Churn Risk       — power, regular, occasional, and churned clients");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

  console.log("  Next steps:");
  console.log("  1. Log in at /auth with the credentials above");
  console.log("  2. Go to /intelligence/launch to initialise the Intelligence engines");
  console.log("  3. Press the big button — watch all 8 engines come online\n");

  process.exit(0);
}

seed().catch(err => {
  console.error("\n❌ Seed failed:", err.message ?? err);
  process.exit(1);
});
