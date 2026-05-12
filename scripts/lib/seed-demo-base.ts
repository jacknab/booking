/**
 * scripts/lib/seed-demo-base.ts
 *
 * Shared parameterized seeder for all Certxa demo accounts.
 * Each business-type seed script imports seedDemoAccount() and passes a config.
 *
 * Does NOT call process.exit() or pool.end() — the caller is responsible.
 */

import bcrypt from "bcryptjs";
import { db } from "../../server/db";
import { users } from "../../shared/models/auth";
import {
  locations,
  businessHours,
  staff,
  staffServices,
  serviceCategories,
  services,
  customers,
  appointments,
} from "../../shared/schema";
import { businessTemplates } from "../../server/onboarding-data";
import { eq } from "drizzle-orm";

// ─── Name pools ──────────────────────────────────────────────────────────────

export const FEMALE_FIRST_NAMES = [
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
];

export const MALE_FIRST_NAMES = [
  "James","John","Robert","Michael","William","David","Richard","Joseph",
  "Thomas","Charles","Christopher","Daniel","Matthew","Anthony","Mark",
  "Donald","Steven","Paul","Andrew","Joshua","Kevin","Brian","George",
  "Kenneth","Timothy","Ronald","Edward","Jason","Jeffrey","Ryan","Jacob",
  "Gary","Nicholas","Eric","Jonathan","Stephen","Larry","Justin","Scott",
  "Brandon","Benjamin","Samuel","Raymond","Gregory","Frank","Alexander",
  "Patrick","Jack","Dennis","Jerry","Walter","Harold","Douglas","Henry",
  "Carl","Arthur","Roger","Joe","Juan","Albert","Terry","Gerald","Keith",
  "Willie","Ralph","Lawrence","Roy","Bruce","Adam","Harry","Wayne","Billy",
  "Louis","Jeremy","Aaron","Randy","Howard","Eugene","Carlos","Russell",
  "Bobby","Victor","Martin","Ernest","Todd","Jesse","Craig","Alan","Shawn",
  "Clarence","Sean","Philip","Chris","Johnny","Earl","Jimmy","Antonio",
  "Danny","Bryan","Tony","Luis","Mike","Stanley","Nathan","Dale","Manuel",
  "Marcus","Theodore","Sebastian","Ezra","Liam","Noah","Ethan","Oliver",
  "Lucas","Aiden","Mason","Elijah","Logan","Jackson","Owen","Leo","Julian",
  "Isaiah","Nolan","Jonah","Eli","Levi","Nathan","Gabriel","Miles","Orion",
];

export const LAST_NAMES = [
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

// ─── Shared helpers ───────────────────────────────────────────────────────────

export function rng(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
export function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}
export function daysAgo(n: number): Date {
  const d = new Date(); d.setDate(d.getDate() - n); return d;
}
export function daysFromNow(n: number): Date {
  const d = new Date(); d.setDate(d.getDate() + n); return d;
}
export function addDays(date: Date, n: number): Date {
  const d = new Date(date); d.setDate(d.getDate() + n); return d;
}
export function withHour(date: Date, hour: number, minute = 0): Date {
  const d = new Date(date); d.setHours(hour, minute, 0, 0); return d;
}
export function randomPhone(): string {
  const ac = pick(AREA_CODES);
  return `(${ac}) ${rng(200, 999)}-${rng(1000, 9999).toString().padStart(4, "0")}`;
}
export function randomEmail(first: string, last: string): string {
  const domains = ["gmail.com","yahoo.com","icloud.com","hotmail.com","outlook.com","me.com"];
  const n = rng(0, 99);
  return `${first.toLowerCase()}${last.toLowerCase()}${n > 50 ? n : ""}@${pick(domains)}`;
}

// ─── Config interface ─────────────────────────────────────────────────────────

export interface StaffDef {
  name: string;
  role: string;
  color: string;
  rate: string;
}

export interface SvcRef {
  id: number;
  price: number;
  duration: number;
  name: string;
}

export interface ArchetypePools {
  highFreqSvcs: SvcRef[];  // every 2–3 weeks (power / loyal)
  medFreqSvcs:  SvcRef[];  // every 3–4 weeks (regular)
  monthlySvcs:  SvcRef[];  // every 4–6 weeks (monthly)
  occSvcs:      SvcRef[];  // every 6–8 weeks (occasional)
}

export interface DemoSeedConfig {
  email:          string;
  password:       string;
  ownerFirstName: string;
  ownerLastName:  string;
  storeName:      string;
  storeCategory:  string;
  storeAddress:   string;
  storeCity:      string;
  storeState:     string;
  storePostcode:  string;
  storePhone:     string;
  storeEmail:     string;
  bookingSlug:    string;
  timezone:       string;
  templateKey:    string;  // key in businessTemplates
  staffDefs:      StaffDef[];
  clientGender:   "female" | "male" | "mixed";
  // Returns the "slow" dead-seat hour for this business type
  deadHour:       () => number;
  // Returns the busy (peak) hour for this business type
  busyHour:       () => number;
  // Given the fully seeded service list, return the 4 archetype pools
  getArchetypePools: (svcList: SvcRef[]) => ArchetypePools;
  // Optional: Monday closed? (default true)
  mondayClosed?: boolean;
}

export interface SeedSummary {
  email:       string;
  password:    string;
  storeName:   string;
  storeId:     number;
  clients:     number;
  appointments: number;
  completed:   number;
  noShows:     number;
  cancelled:   number;
  upcoming:    number;
  revenue:     number;
}

// ─── Internal appointment row type ───────────────────────────────────────────

type ApptRow = {
  date:          Date;
  duration:      number;
  status:        string;
  serviceId:     number;
  staffId:       number;
  customerId:    number;
  storeId:       number;
  totalPaid:     string | null;
  paymentMethod: string | null;
  notes:         null;
};

function makeAppt(
  date:       Date,
  svcId:      number,
  svcPrice:   number,
  svcDur:     number,
  staffId:    number,
  customerId: number,
  storeId:    number,
  status:     "completed"|"cancelled"|"no-show"|"confirmed"|"pending"
): ApptRow {
  const isPast = date < new Date();
  const effectiveStatus = isPast && status === "confirmed" ? "completed" : status;
  let totalPaid: string | null = null;
  let paymentMethod: string | null = null;
  if (effectiveStatus === "completed") {
    const tip = rng(0, 3) === 0 ? rng(3, 20) : 0;
    totalPaid     = (svcPrice + tip).toFixed(2);
    paymentMethod = pick(["card","cash","card","card","card"]);
  }
  return { date, duration: svcDur, status: effectiveStatus, serviceId: svcId,
           staffId, customerId, storeId, totalPaid, paymentMethod, notes: null };
}

// ─── Main seeder ──────────────────────────────────────────────────────────────

export async function seedDemoAccount(cfg: DemoSeedConfig): Promise<SeedSummary> {
  const mondayClosed = cfg.mondayClosed !== false;

  // ── Idempotency check ──────────────────────────────────────────────────────
  const [existingUser]  = await db.select().from(users).where(eq(users.email, cfg.email));
  const [existingStore] = await db.select().from(locations).where(eq(locations.bookingSlug, cfg.bookingSlug));
  if (existingUser || existingStore) {
    console.log(`⚠️  Demo account already exists — skipping.\n   Email: ${cfg.email}\n`);
    return { email: cfg.email, password: cfg.password, storeName: cfg.storeName,
             storeId: existingStore?.id ?? 0, clients: 0, appointments: 0,
             completed: 0, noShows: 0, cancelled: 0, upcoming: 0, revenue: 0 };
  }

  // ── 1. Owner account ───────────────────────────────────────────────────────
  const [owner] = await db.insert(users).values({
    email:               cfg.email,
    password:            await bcrypt.hash(cfg.password, 10),
    firstName:           cfg.ownerFirstName,
    lastName:            cfg.ownerLastName,
    role:                "admin",
    onboardingCompleted: true,
  }).returning();
  console.log(`  ✅ Owner: ${owner.email}`);

  // ── 2. Store ───────────────────────────────────────────────────────────────
  const [store] = await db.insert(locations).values({
    name:          cfg.storeName,
    category:      cfg.storeCategory,
    address:       cfg.storeAddress,
    city:          cfg.storeCity,
    state:         cfg.storeState,
    postcode:      cfg.storePostcode,
    phone:         cfg.storePhone,
    email:         cfg.storeEmail,
    bookingSlug:   cfg.bookingSlug,
    timezone:      cfg.timezone,
    userId:        owner.id,
    accountStatus: "Active",
  }).returning();
  console.log(`  ✅ Store: ${store.name} (id=${store.id})`);

  // ── 3. Business hours (Tue–Sun open, Mon closed by default) ───────────────
  for (let day = 0; day < 7; day++) {
    await db.insert(businessHours).values({
      storeId:   store.id,
      dayOfWeek: day,
      openTime:  "09:00",
      closeTime: "19:00",
      isClosed:  mondayClosed ? day === 1 : false,
    });
  }

  // ── 4. Staff ───────────────────────────────────────────────────────────────
  const staffIds: number[] = [];
  for (const s of cfg.staffDefs) {
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
  console.log(`  ✅ Staff: ${staffIds.length} created`);

  // ── 5. Services from template ──────────────────────────────────────────────
  const template = businessTemplates[cfg.templateKey];
  if (!template) throw new Error(`Template "${cfg.templateKey}" not found`);

  const svcList: SvcRef[] = [];
  for (const catDef of template.categories) {
    const [cat] = await db.insert(serviceCategories).values({
      name: catDef.name, storeId: store.id,
    }).returning();
    for (const svcDef of catDef.services) {
      const [svc] = await db.insert(services).values({
        name:        svcDef.name,
        description: svcDef.description,
        duration:    svcDef.duration,
        price:       svcDef.price,
        category:    catDef.name,
        categoryId:  cat.id,
        storeId:     store.id,
      }).returning();
      svcList.push({ id: svc.id, price: parseFloat(svcDef.price), duration: svcDef.duration, name: svcDef.name });
    }
  }
  console.log(`  ✅ Services: ${svcList.length} across ${template.categories.length} categories`);

  // ── Link all staff to all services ────────────────────────────────────────
  for (const sid of staffIds) {
    for (const svc of svcList) {
      await db.insert(staffServices).values({ staffId: sid, serviceId: svc.id }).catch(() => {});
    }
  }

  // ── 6. Archetype pools ─────────────────────────────────────────────────────
  const { highFreqSvcs, medFreqSvcs, monthlySvcs, occSvcs } = cfg.getArchetypePools(svcList);

  const getSvc = (name: string) => svcList.find(s => s.name === name) ?? svcList[0];

  const firstNames = cfg.clientGender === "male"   ? MALE_FIRST_NAMES
                   : cfg.clientGender === "female" ? FEMALE_FIRST_NAMES
                   : [...FEMALE_FIRST_NAMES, ...MALE_FIRST_NAMES];

  const allAppts: ApptRow[] = [];
  let custCount = 0;

  async function mkCustomer(firstName: string, lastName: string, birthday?: string): Promise<number> {
    const [c] = await db.insert(customers).values({
      name:           `${firstName} ${lastName}`,
      email:          randomEmail(firstName, lastName),
      phone:          randomPhone(),
      storeId:        store.id,
      marketingOptIn: Math.random() > 0.15,
      birthday:       birthday,
      loyaltyPoints:  rng(0, 400),
    }).returning();
    custCount++;
    return c.id;
  }

  // ── Archetype A: High-frequency loyal clients (60) ─────────────────────────
  console.log("    → Seeding high-frequency clients...");
  for (let i = 0; i < 60; i++) {
    const fn = pick(firstNames), ln = pick(LAST_NAMES);
    const cId = await mkCustomer(fn, ln,
      `${rng(1975, 2000)}-${String(rng(1,12)).padStart(2,"0")}-${String(rng(1,28)).padStart(2,"0")}`);
    const preferredStaff = staffIds[rng(0, Math.min(2, staffIds.length - 1))];
    const cadenceDays = rng(14, 21);
    const totalVisits = rng(8, 18);
    let visitDate = daysAgo(cadenceDays * totalVisits + rng(0, 14));
    for (let v = 0; v < totalVisits; v++) {
      const svc = pick(highFreqSvcs);
      const d = withHour(new Date(visitDate), cfg.busyHour(), pick([0,15,30,45]));
      if (d > new Date()) { visitDate = addDays(visitDate, cadenceDays); continue; }
      allAppts.push(makeAppt(d, svc.id, svc.price, svc.duration, preferredStaff, cId, store.id,
        Math.random() < 0.05 ? "no-show" : "completed"));
      visitDate = addDays(visitDate, cadenceDays + rng(-3, 5));
    }
    if (Math.random() > 0.25) {
      const svc = pick(highFreqSvcs);
      const futureDate = withHour(daysFromNow(rng(3, 18)), cfg.busyHour(), 0);
      allAppts.push(makeAppt(futureDate, svc.id, svc.price, svc.duration, preferredStaff, cId, store.id, "confirmed"));
    }
  }

  // ── Archetype B: Regular clients (100) ────────────────────────────────────
  console.log("    → Seeding regular clients...");
  for (let i = 0; i < 100; i++) {
    const fn = pick(firstNames), ln = pick(LAST_NAMES);
    const cId = await mkCustomer(fn, ln);
    const staffPref = staffIds[rng(0, staffIds.length - 1)];
    const cadenceDays = rng(21, 30);
    const totalVisits = rng(4, 12);
    let visitDate = daysAgo(cadenceDays * totalVisits + rng(0, 21));
    for (let v = 0; v < totalVisits; v++) {
      const svc = pick(medFreqSvcs);
      const d = withHour(new Date(visitDate), cfg.busyHour(), pick([0, 30]));
      if (d > new Date()) { visitDate = addDays(visitDate, cadenceDays); continue; }
      const noShow    = Math.random() < 0.07;
      const cancelled = !noShow && Math.random() < 0.06;
      allAppts.push(makeAppt(d, svc.id, svc.price, svc.duration, staffPref, cId, store.id,
        noShow ? "no-show" : cancelled ? "cancelled" : "completed"));
      visitDate = addDays(visitDate, cadenceDays + rng(-4, 7));
    }
    if (Math.random() > 0.4) {
      const svc = pick(medFreqSvcs);
      allAppts.push(makeAppt(withHour(daysFromNow(rng(2, 25)), cfg.busyHour(), 0),
        svc.id, svc.price, svc.duration, staffPref, cId, store.id, "confirmed"));
    }
  }

  // ── Archetype C: Monthly clients (80) ─────────────────────────────────────
  console.log("    → Seeding monthly clients...");
  for (let i = 0; i < 80; i++) {
    const fn = pick(firstNames), ln = pick(LAST_NAMES);
    const cId = await mkCustomer(fn, ln,
      `${rng(1970, 1995)}-${String(rng(1,12)).padStart(2,"0")}-${String(rng(1,28)).padStart(2,"0")}`);
    const cadenceDays = rng(28, 38);
    const totalVisits = rng(3, 8);
    let visitDate = daysAgo(cadenceDays * totalVisits + rng(0, 10));
    for (let v = 0; v < totalVisits; v++) {
      const svc = pick(monthlySvcs);
      const d = withHour(new Date(visitDate), rng(10, 16), 0);
      if (d > new Date()) { visitDate = addDays(visitDate, cadenceDays); continue; }
      allAppts.push(makeAppt(d, svc.id, svc.price, svc.duration, pick(staffIds), cId, store.id,
        Math.random() < 0.08 ? "no-show" : "completed"));
      visitDate = addDays(visitDate, cadenceDays + rng(-5, 8));
    }
  }

  // ── Archetype D: Occasional clients (70) ──────────────────────────────────
  console.log("    → Seeding occasional clients...");
  for (let i = 0; i < 70; i++) {
    const fn = pick(firstNames), ln = pick(LAST_NAMES);
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

  // ── Archetype E: DRIFTING clients (50) ★ key for drift engine ─────────────
  console.log("    → Seeding DRIFTING clients (drift engine)...");
  for (let i = 0; i < 50; i++) {
    const fn = pick(firstNames), ln = pick(LAST_NAMES);
    const cId = await mkCustomer(fn, ln);
    const staffPref = staffIds[rng(0, staffIds.length - 1)];
    const cadenceDays = pick([14, 21, 21, 28, 28, 35]);
    const regularVisits = rng(3, 8);
    const lastVisitDaysAgo = Math.round(cadenceDays * (1 + rng(25, 60) / 100 + 0.2));
    let visitDate = daysAgo(lastVisitDaysAgo + cadenceDays * (regularVisits - 1));
    for (let v = 0; v < regularVisits; v++) {
      const svc = pick(v < regularVisits - 1 ? highFreqSvcs : medFreqSvcs);
      const d = withHour(new Date(visitDate), cfg.busyHour(), 0);
      if (d > new Date()) break;
      allAppts.push(makeAppt(d, svc.id, svc.price, svc.duration, staffPref, cId, store.id,
        Math.random() < 0.05 ? "no-show" : "completed"));
      if (v < regularVisits - 1) visitDate = addDays(visitDate, cadenceDays + rng(-2, 3));
    }
    // NO future appointment — they are drifting
  }

  // ── Archetype F: New clients (45) ─────────────────────────────────────────
  console.log("    → Seeding new clients...");
  for (let i = 0; i < 45; i++) {
    const fn = pick(firstNames), ln = pick(LAST_NAMES);
    const cId = await mkCustomer(fn, ln);
    const numVisits = rng(1, 3);
    for (let v = 0; v < numVisits; v++) {
      const svc = pick([...medFreqSvcs, ...occSvcs]);
      const daysBack = rng(v * 7, 42 - v * 7);
      const d = withHour(daysAgo(daysBack), cfg.busyHour(), 0);
      if (d > new Date()) continue;
      allAppts.push(makeAppt(d, svc.id, svc.price, svc.duration, pick(staffIds), cId, store.id, "completed"));
    }
    if (Math.random() > 0.5) {
      const svc = pick(medFreqSvcs);
      allAppts.push(makeAppt(withHour(daysFromNow(rng(1, 14)), cfg.busyHour(), 0),
        svc.id, svc.price, svc.duration, pick(staffIds), cId, store.id, "confirmed"));
    }
  }

  // ── Archetype G: Lapsed / churned clients (40) ★ key for leakage ──────────
  console.log("    → Seeding LAPSED clients (leakage report)...");
  for (let i = 0; i < 40; i++) {
    const fn = pick(firstNames), ln = pick(LAST_NAMES);
    const cId = await mkCustomer(fn, ln);
    const cadenceDays = pick([14, 21, 28]);
    const totalVisits = rng(4, 10);
    const lastVisitDaysAgo = rng(120, 180);
    let visitDate = daysAgo(lastVisitDaysAgo + cadenceDays * (totalVisits - 1));
    for (let v = 0; v < totalVisits; v++) {
      const svc = pick([...highFreqSvcs, ...medFreqSvcs]);
      const d = withHour(new Date(visitDate), cfg.busyHour(), 0);
      if (d > new Date()) break;
      allAppts.push(makeAppt(d, svc.id, svc.price, svc.duration, pick(staffIds), cId, store.id, "completed"));
      visitDate = addDays(visitDate, cadenceDays + rng(-2, 4));
    }
  }

  // ── Archetype H: No-show prone (25) ★ key for no-show risk ────────────────
  console.log("    → Seeding no-show-prone clients (no-show risk scoring)...");
  for (let i = 0; i < 25; i++) {
    const fn = pick(firstNames), ln = pick(LAST_NAMES);
    const cId = await mkCustomer(fn, ln);
    const totalAppts  = rng(4, 10);
    const noShowRate  = rng(25, 45) / 100;
    let visitDate = daysAgo(rng(30, 150));
    for (let v = 0; v < totalAppts; v++) {
      const svc = pick(occSvcs);
      const d = withHour(new Date(visitDate), rng(9, 18), 0);
      if (d > new Date()) { visitDate = addDays(visitDate, rng(14, 35)); continue; }
      allAppts.push(makeAppt(d, svc.id, svc.price, svc.duration, pick(staffIds), cId, store.id,
        Math.random() < noShowRate ? "no-show" : "completed"));
      visitDate = addDays(visitDate, rng(14, 42));
    }
    if (Math.random() > 0.35) {
      const svc = pick(occSvcs);
      const tomorrow = withHour(daysFromNow(rng(1, 7)), rng(9, 18), 0);
      allAppts.push(makeAppt(tomorrow, svc.id, svc.price, svc.duration, pick(staffIds), cId, store.id, "confirmed"));
    }
  }

  // ── Dead-seat thinned slots ────────────────────────────────────────────────
  console.log("    → Adding dead-seat thinned slots...");
  for (let week = 0; week < 20; week++) {
    const svc = pick(occSvcs);
    const cId = await mkCustomer(pick(firstNames), pick(LAST_NAMES));
    if (rng(0, 2) === 0) {
      const d = daysAgo(week * 7 + rng(0, 2));
      d.setHours(cfg.deadHour(), 0, 0, 0);
      allAppts.push(makeAppt(d, svc.id, svc.price, svc.duration, pick(staffIds), cId, store.id, "completed"));
    }
  }

  // ── Upcoming appointments this week ───────────────────────────────────────
  console.log("    → Adding upcoming confirmed appointments...");
  const confirmedCount = Math.min(30, custCount - 10);
  const allCustIds = await db.select({ id: customers.id }).from(customers).where(eq(customers.storeId, store.id));
  for (let i = 0; i < confirmedCount; i++) {
    const cId = pick(allCustIds).id;
    const svc = pick([...medFreqSvcs, ...highFreqSvcs, ...occSvcs]);
    const day = daysFromNow(rng(1, 7));
    const d = withHour(day, rng(10, 17), pick([0, 15, 30, 45]));
    allAppts.push(makeAppt(d, svc.id, svc.price, svc.duration, pick(staffIds), cId, store.id, "confirmed"));
  }

  // ── Bulk insert appointments in chunks ────────────────────────────────────
  console.log(`\n    📅 Inserting ${allAppts.length} appointments in batches...`);
  const CHUNK = 200;
  let inserted = 0;
  for (let i = 0; i < allAppts.length; i += CHUNK) {
    await db.insert(appointments).values(allAppts.slice(i, i + CHUNK) as any);
    inserted += CHUNK;
    process.stdout.write(`\r       ${Math.min(inserted, allAppts.length)} / ${allAppts.length} inserted`);
  }
  console.log("\n");

  const completed  = allAppts.filter(a => a.status === "completed").length;
  const noShows    = allAppts.filter(a => a.status === "no-show").length;
  const cancelled  = allAppts.filter(a => a.status === "cancelled").length;
  const upcoming   = allAppts.filter(a => a.status === "confirmed").length;
  const revenue    = allAppts.filter(a => a.totalPaid)
                             .reduce((s, a) => s + parseFloat(a.totalPaid!), 0);

  return { email: cfg.email, password: cfg.password, storeName: cfg.storeName,
           storeId: store.id, clients: custCount, appointments: allAppts.length,
           completed, noShows, cancelled, upcoming, revenue };
}
