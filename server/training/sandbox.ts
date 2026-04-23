/**
 * Phase 9.1 — Practice Mode sandbox stores.
 *
 * For every real store, we keep a single "practice" clone (locations row with
 * is_training_sandbox=true). Trainees enter the sandbox to drill the real UI
 * without touching live data; nightly we wipe & reseed it.
 *
 * Side-effect short-circuits (Phase 9.2) inspect locations.isTrainingSandbox
 * before sending SMS / email / Stripe / webhooks.
 */
import { db } from "../db";
import {
  locations,
  staff,
  serviceCategories,
  services,
  customers,
  appointments,
  businessHours,
  staffServices,
  staffAvailability,
} from "../../shared/schema";
import { users } from "../../shared/models/auth";
import { and, eq, inArray } from "drizzle-orm";

const STAFF_NAMES = ["Avery Pham", "Jordan Lee", "Riley Tran", "Casey Nguyen"];
const STAFF_COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ec4899"];

const FIRST_NAMES = [
  "Olivia", "Liam", "Emma", "Noah", "Ava", "Ethan", "Sophia", "Mason",
  "Isabella", "Lucas", "Mia", "Logan", "Charlotte", "Aiden", "Amelia",
  "Elijah", "Harper", "James", "Evelyn", "Benjamin", "Abigail", "Henry",
  "Emily", "Sebastian", "Ella", "Jackson", "Scarlett", "Daniel", "Grace",
  "Owen",
];
const LAST_NAMES = [
  "Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller",
  "Davis", "Rodriguez", "Martinez", "Hernandez", "Lopez", "Gonzalez",
  "Wilson", "Anderson", "Thomas", "Taylor", "Moore", "Jackson", "Martin",
  "Lee", "Perez", "Thompson", "White", "Harris", "Sanchez", "Clark",
  "Ramirez", "Lewis", "Robinson",
];

const CATEGORY_DEFS: Array<{ name: string; services: Array<{ name: string; duration: number; price: string }> }> = [
  {
    name: "Manicures",
    services: [
      { name: "Classic Manicure", duration: 30, price: "25.00" },
      { name: "Gel Manicure", duration: 45, price: "40.00" },
      { name: "French Manicure", duration: 45, price: "35.00" },
      { name: "Dip Powder Manicure", duration: 60, price: "50.00" },
      { name: "Acrylic Full Set", duration: 75, price: "65.00" },
      { name: "Acrylic Fill", duration: 60, price: "45.00" },
    ],
  },
  {
    name: "Pedicures",
    services: [
      { name: "Classic Pedicure", duration: 45, price: "35.00" },
      { name: "Spa Pedicure", duration: 60, price: "50.00" },
      { name: "Gel Pedicure", duration: 60, price: "55.00" },
      { name: "Deluxe Pedicure", duration: 75, price: "70.00" },
      { name: "Kid's Pedicure", duration: 30, price: "20.00" },
    ],
  },
  {
    name: "Hair",
    services: [
      { name: "Women's Haircut", duration: 45, price: "55.00" },
      { name: "Men's Haircut", duration: 30, price: "35.00" },
      { name: "Blow Dry & Style", duration: 45, price: "45.00" },
      { name: "Color — Single Process", duration: 90, price: "95.00" },
      { name: "Highlights — Partial", duration: 120, price: "130.00" },
    ],
  },
  {
    name: "Waxing & Brows",
    services: [
      { name: "Brow Wax", duration: 15, price: "18.00" },
      { name: "Lip Wax", duration: 15, price: "12.00" },
      { name: "Brow Tint", duration: 20, price: "25.00" },
      { name: "Lash Lift", duration: 60, price: "85.00" },
    ],
  },
];

const SANDBOX_OWNER_NAME = "Practice Owner";

/**
 * Phase 9.2 — fast in-memory cache of which storeIds are sandboxes.
 * Loaded lazily on first lookup, refreshed every 60s. Writes to the
 * locations table from this module manually invalidate via {@link
 * invalidateSandboxCache}.
 */
let sandboxIdCache: { ids: Set<number>; loadedAt: number } | null = null;
const SANDBOX_CACHE_TTL_MS = 60 * 1000;

export function invalidateSandboxCache(): void {
  sandboxIdCache = null;
}

async function loadSandboxIds(): Promise<Set<number>> {
  const rows = await db
    .select({ id: locations.id })
    .from(locations)
    .where(eq(locations.isTrainingSandbox, true));
  return new Set(rows.map((r) => r.id));
}

/**
 * Returns true if the given storeId is a training sandbox. Cached for 60s.
 * Use this to short-circuit any external side-effect (SMS, email, Stripe,
 * webhooks). On cache miss / DB error returns false (fail-open is the
 * safer default — sandbox stores have userId=null so they're rare).
 */
export async function isSandboxStore(
  storeId: number | null | undefined,
): Promise<boolean> {
  if (!storeId) return false;
  const now = Date.now();
  if (!sandboxIdCache || now - sandboxIdCache.loadedAt > SANDBOX_CACHE_TTL_MS) {
    try {
      sandboxIdCache = { ids: await loadSandboxIds(), loadedAt: now };
    } catch (err) {
      console.error("[sandbox] isSandboxStore cache reload failed:", err);
      return false;
    }
  }
  return sandboxIdCache.ids.has(storeId);
}

function pick<T>(arr: T[], i: number): T {
  return arr[i % arr.length];
}

function randomPhone(seed: number): string {
  const last4 = String(1000 + (seed * 7919) % 9000).padStart(4, "0");
  return `(555) 555-${last4}`;
}

/**
 * Returns true if the sandbox has no customers and no services.
 * Used to auto-seed an empty sandbox on first open so trainees never
 * land in a blank store.
 */
async function isSandboxEmpty(sandboxStoreId: number): Promise<boolean> {
  const [c] = await db
    .select({ id: customers.id })
    .from(customers)
    .where(eq(customers.storeId, sandboxStoreId))
    .limit(1);
  if (c) return false;
  const [s] = await db
    .select({ id: services.id })
    .from(services)
    .where(eq(services.storeId, sandboxStoreId))
    .limit(1);
  return !s;
}

/**
 * Find or create the sandbox location for a real (parent) store.
 * Idempotent. Seeds on creation, and also auto-seeds an existing sandbox
 * if it's empty (e.g. after a manual wipe) so trainees aren't dropped
 * into a blank store.
 */
export async function ensureSandboxForStore(parentStoreId: number): Promise<number> {
  const [parent] = await db.select().from(locations).where(eq(locations.id, parentStoreId));
  if (!parent) throw new Error(`parent store ${parentStoreId} not found`);
  if (parent.isTrainingSandbox) {
    // Caller passed a sandbox by mistake — just return it.
    return parent.id;
  }

  const [existing] = await db
    .select()
    .from(locations)
    .where(
      and(
        eq(locations.sandboxParentStoreId, parentStoreId),
        eq(locations.isTrainingSandbox, true),
      ),
    );
  if (existing) {
    if (await isSandboxEmpty(existing.id)) {
      await seedSandboxData(existing.id);
    }
    return existing.id;
  }

  const baseSlug = parent.bookingSlug ?? `store-${parent.id}`;
  const [created] = await db
    .insert(locations)
    .values({
      name: `${parent.name} (Practice)`,
      timezone: parent.timezone,
      address: parent.address,
      phone: parent.phone,
      email: parent.email,
      category: parent.category,
      city: parent.city,
      state: parent.state,
      postcode: parent.postcode,
      // unique constraint — keep practice slugs out of the public booking namespace
      bookingSlug: `${baseSlug}-practice-${parent.id}`,
      bookingTheme: parent.bookingTheme,
      // No owner: keeps the sandbox out of the user's normal store picker.
      userId: null,
      accountStatus: "Active",
      smsTokens: 0,
      isTrainingSandbox: true,
      sandboxParentStoreId: parent.id,
    })
    .returning();

  invalidateSandboxCache();
  await seedSandboxData(created.id);
  return created.id;
}

/**
 * Wipe all child rows for a sandbox store and reseed fresh demo data.
 * Safe to call repeatedly — only touches rows whose storeId is the sandbox.
 */
export async function resetSandboxData(sandboxStoreId: number): Promise<void> {
  const [s] = await db.select().from(locations).where(eq(locations.id, sandboxStoreId));
  if (!s || !s.isTrainingSandbox) {
    throw new Error(`store ${sandboxStoreId} is not a training sandbox`);
  }

  // Delete in dependency order. staff_services + staff_availability + appointments
  // reference staff/services; appointments references customers.
  const staffRows = await db.select({ id: staff.id }).from(staff).where(eq(staff.storeId, sandboxStoreId));
  const staffIds = staffRows.map((r) => r.id);
  const serviceRows = await db.select({ id: services.id }).from(services).where(eq(services.storeId, sandboxStoreId));
  const serviceIds = serviceRows.map((r) => r.id);

  await db.delete(appointments).where(eq(appointments.storeId, sandboxStoreId));
  if (staffIds.length) {
    await db.delete(staffServices).where(inArray(staffServices.staffId, staffIds));
    await db.delete(staffAvailability).where(inArray(staffAvailability.staffId, staffIds));
  }
  await db.delete(staff).where(eq(staff.storeId, sandboxStoreId));
  await db.delete(services).where(eq(services.storeId, sandboxStoreId));
  await db.delete(serviceCategories).where(eq(serviceCategories.storeId, sandboxStoreId));
  await db.delete(customers).where(eq(customers.storeId, sandboxStoreId));
  await db.delete(businessHours).where(eq(businessHours.storeId, sandboxStoreId));

  await seedSandboxData(sandboxStoreId);
}

/**
 * Seed a fresh sandbox: 4 staff, ~20 services across 4 categories,
 * 30 customers, ~40 appointments spread across the past week and next week.
 * Assumes the store rows have already been cleared (or are empty).
 */
export async function seedSandboxData(sandboxStoreId: number): Promise<void> {
  // Business hours: Mon–Sat 9–18, closed Sunday.
  for (let day = 0; day < 7; day++) {
    await db.insert(businessHours).values({
      storeId: sandboxStoreId,
      dayOfWeek: day,
      openTime: "09:00",
      closeTime: "18:00",
      isClosed: day === 0,
    });
  }

  // Staff
  const staffIds: number[] = [];
  for (let i = 0; i < STAFF_NAMES.length; i++) {
    const [s] = await db
      .insert(staff)
      .values({
        name: STAFF_NAMES[i],
        storeId: sandboxStoreId,
        role: i === 0 ? "manager" : "stylist",
        color: STAFF_COLORS[i],
        commissionEnabled: true,
        commissionRate: "40",
      })
      .returning();
    staffIds.push(s.id);

    // Each staff works Mon–Sat
    for (let day = 1; day < 7; day++) {
      await db.insert(staffAvailability).values({
        staffId: s.id,
        dayOfWeek: day,
        startTime: "09:00",
        endTime: "18:00",
      });
    }
  }

  // Categories + services
  const serviceIds: number[] = [];
  const serviceDurations = new Map<number, number>();
  for (const catDef of CATEGORY_DEFS) {
    const [cat] = await db
      .insert(serviceCategories)
      .values({ name: catDef.name, storeId: sandboxStoreId })
      .returning();
    for (const svcDef of catDef.services) {
      const [svc] = await db
        .insert(services)
        .values({
          name: svcDef.name,
          duration: svcDef.duration,
          price: svcDef.price,
          category: catDef.name,
          categoryId: cat.id,
          storeId: sandboxStoreId,
        })
        .returning();
      serviceIds.push(svc.id);
      serviceDurations.set(svc.id, svcDef.duration);
    }
  }

  // Every staff can do every service (keeps practice flexible).
  for (const staffId of staffIds) {
    for (const serviceId of serviceIds) {
      await db.insert(staffServices).values({ staffId, serviceId });
    }
  }

  // Customers
  const customerIds: number[] = [];
  for (let i = 0; i < 30; i++) {
    const first = pick(FIRST_NAMES, i);
    const last = pick(LAST_NAMES, i + 7);
    const [c] = await db
      .insert(customers)
      .values({
        name: `${first} ${last}`,
        email: `${first.toLowerCase()}.${last.toLowerCase()}${i}@practice.test`,
        phone: randomPhone(i + 1),
        storeId: sandboxStoreId,
        marketingOptIn: false,
      })
      .returning();
    customerIds.push(c.id);
  }

  // Appointments — 40 distributed from 7 days ago to 7 days ahead.
  // Skips Sundays (closed). Statuses vary: past=completed, today=mix, future=pending.
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let placed = 0;
  let dayOffset = -7;
  let slotInDay = 0;
  while (placed < 40 && dayOffset <= 7) {
    const date = new Date(today);
    date.setDate(date.getDate() + dayOffset);
    if (date.getDay() === 0) {
      dayOffset++;
      slotInDay = 0;
      continue;
    }

    // 3 appointments per business day, starting at 10:00, 13:00, 15:30
    const slotTimes: Array<[number, number]> = [
      [10, 0],
      [13, 0],
      [15, 30],
    ];
    if (slotInDay >= slotTimes.length) {
      dayOffset++;
      slotInDay = 0;
      continue;
    }

    const [hh, mm] = slotTimes[slotInDay];
    date.setHours(hh, mm, 0, 0);

    const serviceId = pick(serviceIds, placed);
    const staffId = pick(staffIds, placed + slotInDay);
    const customerId = pick(customerIds, placed * 3);
    const duration = serviceDurations.get(serviceId) ?? 45;

    let status: string;
    if (dayOffset < 0) status = "completed";
    else if (dayOffset === 0 && hh < new Date().getHours()) status = "completed";
    else status = "pending";

    await db.insert(appointments).values({
      date,
      duration,
      status,
      serviceId,
      staffId,
      customerId,
      storeId: sandboxStoreId,
    });
    placed++;
    slotInDay++;
  }
}

/**
 * Reset every sandbox in the system. Called by the nightly scheduler.
 */
export async function resetAllSandboxes(): Promise<{ resetCount: number }> {
  const sandboxes = await db
    .select({ id: locations.id })
    .from(locations)
    .where(eq(locations.isTrainingSandbox, true));
  for (const s of sandboxes) {
    try {
      await resetSandboxData(s.id);
    } catch (err) {
      console.error(`[sandbox] reset failed for store ${s.id}:`, err);
    }
  }
  return { resetCount: sandboxes.length };
}

/**
 * Resolve the sandbox storeId for a given user (looks up via their staff
 * record → store → sandbox). Returns null if the user isn't linked to a
 * staff member or their store has no sandbox yet.
 */
export async function sandboxStoreIdForUser(userId: string): Promise<number | null> {
  const [u] = await db.select().from(users).where(eq(users.id, userId));
  if (!u?.staffId) return null;
  const [s] = await db.select().from(staff).where(eq(staff.id, u.staffId));
  if (!s?.storeId) return null;
  const [sandbox] = await db
    .select({ id: locations.id })
    .from(locations)
    .where(
      and(
        eq(locations.sandboxParentStoreId, s.storeId),
        eq(locations.isTrainingSandbox, true),
      ),
    );
  return sandbox?.id ?? null;
}

/**
 * Convenience: find the parent store for a user via staff, then ensure a
 * sandbox exists for it. Returns null if the user isn't linked to a store.
 */
export async function ensureSandboxForUser(userId: string): Promise<number | null> {
  const [u] = await db.select().from(users).where(eq(users.id, userId));
  if (!u?.staffId) return null;
  const [s] = await db.select().from(staff).where(eq(staff.id, u.staffId));
  if (!s?.storeId) return null;
  return ensureSandboxForStore(s.storeId);
}
