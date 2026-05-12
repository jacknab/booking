/**
 * Shared utility: copies rows from `customers` → new `clients` architecture.
 * Used by the demo seeder and the API route.
 *
 * After copying contacts, this also syncs appointment stats (totalVisits,
 * totalSpentCents, lastVisitAt, clientStatus) from the appointments table so
 * the Customers page shows real data instead of all-zeros.
 */

import { db } from "../../server/db";
import {
  customers,
  clients,
  clientEmails,
  clientPhones,
  clientNotes,
  clientMarketingPreferences,
} from "../../shared/schema";
import { eq, and, sql } from "drizzle-orm";

function normalizePhone(raw: string): { e164: string; display: string } {
  const digits = raw.replace(/\D/g, "");
  const e164 =
    digits.length === 10
      ? `+1${digits}`
      : digits.length === 11 && digits.startsWith("1")
      ? `+${digits}`
      : `+${digits}`;
  return { e164, display: raw.trim() };
}

function normalizeEmail(raw: string): string {
  return raw.toLowerCase().trim();
}

/**
 * Bulk-syncs appointment stats onto all client rows for a store.
 * Joins via client_emails → customers → appointments so the match is exact.
 * Runs a single UPDATE…FROM, so it is fast even for 400+ clients.
 */
export async function syncClientStatsFromAppointments(storeId: number): Promise<void> {
  await db.execute(sql`
    UPDATE clients c
    SET
      total_visits        = COALESCE(stats.total_visits, 0),
      total_spent_cents   = COALESCE(stats.total_spent_cents, 0),
      last_visit_at       = stats.last_visit_at,
      next_appointment_at = stats.next_appointment_at,
      client_status       = CASE
        WHEN stats.last_visit_at IS NULL                            THEN 'active'
        WHEN stats.last_visit_at < NOW() - INTERVAL '90 days'      THEN 'inactive'
        ELSE 'active'
      END,
      updated_at          = NOW()
    FROM (
      SELECT
        ce.client_id                                                             AS client_id,
        COUNT(CASE WHEN a.status = 'completed' THEN 1 END)::integer              AS total_visits,
        COALESCE(
          SUM(CASE WHEN a.status = 'completed'
                   THEN ROUND(a.total_paid::numeric * 100) ELSE 0 END
          )::integer, 0
        )                                                                         AS total_spent_cents,
        MAX(CASE WHEN a.status = 'completed' THEN a.date END)                    AS last_visit_at,
        MIN(CASE WHEN a.status IN ('pending','confirmed') AND a.date > NOW()
                 THEN a.date END)                                                 AS next_appointment_at
      FROM client_emails ce
      JOIN clients cl  ON cl.id = ce.client_id AND cl.store_id = ${storeId}
      JOIN customers cust
        ON LOWER(cust.email) = ce.email_address
        AND cust.store_id = ${storeId}
      LEFT JOIN appointments a
        ON a.customer_id = cust.id AND a.store_id = ${storeId}
      GROUP BY ce.client_id
    ) stats
    WHERE c.id         = stats.client_id
      AND c.store_id   = ${storeId}
  `);
}

export async function migrateCustomersToClients(
  storeId: number
): Promise<{ migrated: number; skipped: number; total: number }> {
  const allCustomers = await db
    .select()
    .from(customers)
    .where(eq(customers.storeId, storeId));

  let migrated = 0;
  let skipped = 0;

  for (const cust of allCustomers) {
    const nameParts = (cust.name ?? "").trim().split(" ");
    const firstName = nameParts[0] ?? "";
    const lastName = nameParts.slice(1).join(" ") ?? "";

    // Skip if already migrated (deduplicate by email)
    if (cust.email) {
      const existing = await db
        .select({ id: clientEmails.clientId })
        .from(clientEmails)
        .innerJoin(clients, eq(clientEmails.clientId, clients.id))
        .where(
          and(
            eq(clientEmails.emailAddress, normalizeEmail(cust.email)),
            eq(clients.storeId, storeId)
          )
        )
        .limit(1);
      if (existing.length > 0) {
        skipped++;
        continue;
      }
    }

    const fullName = cust.name ?? firstName;
    const [client] = await db
      .insert(clients)
      .values({ storeId, firstName, lastName, fullName, source: "migration" })
      .returning();

    if (cust.email) {
      await db
        .insert(clientEmails)
        .values({
          clientId: client.id,
          emailAddress: normalizeEmail(cust.email),
          isPrimary: true,
          marketingOptIn: cust.marketingOptIn ?? true,
        })
        .onConflictDoNothing();
    }

    if (cust.phone) {
      const { e164, display } = normalizePhone(cust.phone);
      await db
        .insert(clientPhones)
        .values({
          clientId: client.id,
          phoneNumberE164: e164,
          displayPhone: display,
          isPrimary: true,
        })
        .onConflictDoNothing();
    }

    if (cust.notes) {
      await db.insert(clientNotes).values({
        clientId: client.id,
        storeId,
        noteType: "general",
        noteContent: cust.notes,
      });
    }

    await db
      .insert(clientMarketingPreferences)
      .values({
        clientId: client.id,
        smsMarketingOptIn: cust.marketingOptIn ?? true,
        emailMarketingOptIn: cust.marketingOptIn ?? true,
      })
      .onConflictDoNothing();

    migrated++;
  }

  // After all clients are inserted, bulk-sync visit stats from appointments.
  // This populates totalVisits, totalSpentCents, lastVisitAt, and clientStatus
  // so the Customers page shows real booking history instead of zeroes.
  if (migrated > 0 || skipped > 0) {
    await syncClientStatsFromAppointments(storeId);
  }

  return { migrated, skipped, total: allCustomers.length };
}
