import { db } from "./db";
import { sendSms } from "./sms";
import { sendEmail } from "./mail";
import { storage } from "./storage";
import { customers, smsLog, locations, appointments } from "@shared/schema";
import {
  clients,
  clientEmails,
  clientPhones,
  clientMarketingPreferences,
} from "@shared/schema/clients";
import { eq, and, sql, isNotNull, min } from "drizzle-orm";

let birthdayIntervalId: ReturnType<typeof setInterval> | null = null;

/**
 * Returns true if today's month and day match the given birthday string.
 * Accepts formats: "YYYY-MM-DD", "MM-DD", "MM/DD/YYYY"
 */
function isBirthdayToday(birthday: string | null | undefined): boolean {
  if (!birthday) return false;
  const today = new Date();
  const todayMM = String(today.getMonth() + 1).padStart(2, "0");
  const todayDD = String(today.getDate()).padStart(2, "0");

  const parts = birthday.replace(/\//g, "-").split("-");
  if (parts.length === 3) {
    const isYMD = parts[0].length === 4;
    const mm = isYMD ? parts[1] : parts[0];
    const dd = isYMD ? parts[2] : parts[1];
    return mm === todayMM && dd === todayDD;
  }
  if (parts.length === 2) {
    return parts[0] === todayMM && parts[1] === todayDD;
  }
  return false;
}

/**
 * Check if a message of this type was already sent to this customer today.
 */
async function alreadySentToday(
  storeId: number,
  customerId: number,
  messageType: string
): Promise<boolean> {
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const [existing] = await db
    .select({ id: smsLog.id })
    .from(smsLog)
    .where(
      and(
        eq(smsLog.storeId, storeId),
        eq(smsLog.customerId, customerId),
        eq(smsLog.messageType, messageType),
        sql`${smsLog.sentAt} >= ${todayStart}`
      )
    )
    .limit(1);
  return !!existing;
}

// ─── Process customers table (legacy booking system) ─────────────────────────

async function processBirthdaysForStore(store: { id: number; name: string }): Promise<void> {
  const smsSettings = await storage.getSmsSettings(store.id);
  const mailSettings = await storage.getMailSettings(store.id);

  const birthdayCustomers = await db
    .select()
    .from(customers)
    .where(
      and(
        eq(customers.storeId, store.id),
        isNotNull(customers.birthday),
        eq(customers.marketingOptIn, true)
      )
    );

  let smsSent = 0;
  let emailSent = 0;

  for (const customer of birthdayCustomers) {
    if (!isBirthdayToday(customer.birthday)) continue;

    const messageType = `birthday_${new Date().getFullYear()}`;

    if (customer.phone && smsSettings?.bookingConfirmationEnabled !== undefined) {
      const alreadySent = await alreadySentToday(store.id, customer.id, messageType);
      if (!alreadySent) {
        const body = `Happy Birthday, ${customer.name?.split(" ")[0] || "there"}! 🎂 Treat yourself — book your next visit at ${store.name}: ${
          process.env.APP_URL ? `${process.env.APP_URL}/book` : "our booking page"
        }`;
        await sendSms(store.id, customer.phone, body, messageType, undefined, customer.id);
        smsSent++;
      }
    }

    if (customer.email && mailSettings) {
      const firstName = customer.name?.split(" ")[0] || "there";
      const html = `
        <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 24px;">
          <h2 style="color: #5b21b6;">Happy Birthday, ${firstName}! 🎂</h2>
          <p>Wishing you a wonderful birthday from everyone at <strong>${store.name}</strong>.</p>
          <p>Treat yourself today — book your next appointment and make it a special one.</p>
          <p style="margin-top: 24px;">
            <a href="${process.env.APP_URL || "#"}/book" style="background:#5b21b6;color:#fff;padding:12px 24px;border-radius:6px;text-decoration:none;display:inline-block;">Book Now</a>
          </p>
          <p style="color:#888;font-size:0.8rem;margin-top:24px;">You're receiving this because you opted into marketing messages at ${store.name}.</p>
        </div>`;
      await sendEmail(store.id, customer.email, `Happy Birthday from ${store.name}! 🎂`, html);
      emailSent++;
    }
  }

  if (smsSent + emailSent > 0) {
    console.log(`[Birthday] Store ${store.id}: sent ${smsSent} SMS, ${emailSent} email birthday messages`);
  }
}

// ─── Process new clients table (CRM system) ──────────────────────────────────

async function processBirthdaysForClientsTable(store: { id: number; name: string }): Promise<void> {
  const clientsWithBirthdays = await db
    .select({
      id: clients.id,
      firstName: clients.firstName,
      dateOfBirth: clients.dateOfBirth,
      primaryPhone: sql<string>`(SELECT phone_number_e164 FROM client_phones WHERE client_id = ${clients.id} AND is_primary = true LIMIT 1)`,
      primaryEmail: sql<string>`(SELECT email_address FROM client_emails WHERE client_id = ${clients.id} AND is_primary = true LIMIT 1)`,
      birthdayMessages: sql<boolean>`(SELECT birthday_messages FROM client_marketing_preferences WHERE client_id = ${clients.id} LIMIT 1)`,
    })
    .from(clients)
    .where(
      and(
        eq(clients.storeId, store.id),
        isNotNull(clients.dateOfBirth),
        eq(clients.clientStatus, "active")
      )
    );

  for (const client of clientsWithBirthdays) {
    if (!isBirthdayToday(client.dateOfBirth)) continue;
    if (client.birthdayMessages === false) continue;

    const firstName = client.firstName || "there";
    const messageType = `client_birthday_${new Date().getFullYear()}`;

    if (client.primaryPhone) {
      const body = `Happy Birthday, ${firstName}! 🎂 Treat yourself — book your next visit at ${store.name}.`;
      await sendSms(store.id, client.primaryPhone, body, messageType, undefined, undefined);
    }

    if (client.primaryEmail) {
      const html = `
        <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 24px;">
          <h2 style="color: #5b21b6;">Happy Birthday, ${firstName}! 🎂</h2>
          <p>Wishing you a wonderful birthday from everyone at <strong>${store.name}</strong>.</p>
          <p>Treat yourself — book your next appointment and make it special.</p>
          <p style="margin-top: 24px;">
            <a href="${process.env.APP_URL || "#"}" style="background:#5b21b6;color:#fff;padding:12px 24px;border-radius:6px;text-decoration:none;display:inline-block;">Book Now</a>
          </p>
        </div>`;
      await sendEmail(store.id, client.primaryEmail, `Happy Birthday from ${store.name}! 🎂`, html);
    }
  }
}

// ─── Anniversary of first visit ───────────────────────────────────────────────

/**
 * Returns true if today's month and day match the given date (any year).
 * Used to detect "anniversary of first visit" regardless of which year it was.
 */
function isAnniversaryToday(date: Date | string | null | undefined): boolean {
  if (!date) return false;
  const d = typeof date === "string" ? new Date(date) : date;
  if (isNaN(d.getTime())) return false;
  const today = new Date();
  return d.getMonth() === today.getMonth() && d.getDate() === today.getDate();
}

async function processAnniversariesForStore(store: { id: number; name: string }): Promise<void> {
  const smsSettings = await storage.getSmsSettings(store.id);

  // Find each customer's earliest appointment for this store
  const firstVisits = await db
    .select({
      customerId: appointments.customerId,
      firstVisit: min(appointments.date),
    })
    .from(appointments)
    .where(
      and(
        eq(appointments.storeId, store.id),
        eq(appointments.status, "completed"),
        isNotNull(appointments.customerId)
      )
    )
    .groupBy(appointments.customerId);

  const today = new Date();

  for (const row of firstVisits) {
    if (!row.customerId || !row.firstVisit) continue;

    // Skip if first visit was this calendar year (not yet a full year)
    const firstVisitDate = new Date(row.firstVisit);
    if (firstVisitDate.getFullYear() >= today.getFullYear()) continue;

    if (!isAnniversaryToday(firstVisitDate)) continue;

    const yearsAgo = today.getFullYear() - firstVisitDate.getFullYear();
    const messageType = `visit_anniversary_${today.getFullYear()}`;

    const [customer] = await db
      .select()
      .from(customers)
      .where(eq(customers.id, row.customerId))
      .limit(1);

    if (!customer) continue;

    const alreadySent = await alreadySentToday(store.id, customer.id, messageType);
    if (alreadySent) continue;

    if (customer.marketingOptIn === false) continue;

    const firstName = customer.name?.split(" ")[0] || "there";
    const yearLabel = yearsAgo === 1 ? "1 year" : `${yearsAgo} years`;

    if (customer.phone && smsSettings) {
      const body = `Happy ${yearLabel} anniversary, ${firstName}! 🎉 It's been ${yearLabel} since your first visit to ${store.name}. Book a treat today: ${process.env.APP_URL ? `${process.env.APP_URL}/book` : "our booking page"}`;
      await sendSms(store.id, customer.phone, body, messageType, undefined, customer.id);
    }

    if (customer.email) {
      const html = `
        <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 24px;">
          <h2 style="color: #5b21b6;">Happy ${yearLabel} Anniversary, ${firstName}! 🎉</h2>
          <p>We can't believe it's already been <strong>${yearLabel}</strong> since your first visit to <strong>${store.name}</strong>.</p>
          <p>Thank you for being a loyal client — we truly appreciate you. Treat yourself to something special today.</p>
          <p style="margin-top: 24px;">
            <a href="${process.env.APP_URL || "#"}/book" style="background:#5b21b6;color:#fff;padding:12px 24px;border-radius:6px;text-decoration:none;display:inline-block;">Book Now</a>
          </p>
          <p style="color:#888;font-size:0.8rem;margin-top:24px;">You're receiving this because you opted into marketing messages at ${store.name}.</p>
        </div>`;
      await sendEmail(store.id, customer.email, `${yearLabel} Anniversary — Thank You, ${firstName}!`, html);
    }
  }
}

async function processAllBirthdays(): Promise<void> {
  const allStores = await db.select({ id: locations.id, name: locations.name }).from(locations);
  for (const store of allStores) {
    try {
      await processBirthdaysForStore(store);
      await processBirthdaysForClientsTable(store);
      await processAnniversariesForStore(store);
    } catch (err) {
      console.error(`[Birthday] Error processing store ${store.id}:`, err);
    }
  }
}

export function startBirthdayScheduler(): void {
  if (birthdayIntervalId) return;

  console.log("[Birthday] Scheduler started (runs daily at 9am store time, checks every hour)");

  birthdayIntervalId = setInterval(async () => {
    const hour = new Date().getHours();
    if (hour === 9) {
      try {
        await processAllBirthdays();
      } catch (err) {
        console.error("[Birthday] Scheduler error:", err);
      }
    }
  }, 60 * 60 * 1000);

  // Run on startup if it's between 9am and 10am
  const now = new Date();
  if (now.getHours() === 9) {
    setTimeout(() => processAllBirthdays().catch(console.error), 30_000);
  }
}

export function stopBirthdayScheduler(): void {
  if (birthdayIntervalId) {
    clearInterval(birthdayIntervalId);
    birthdayIntervalId = null;
  }
}
