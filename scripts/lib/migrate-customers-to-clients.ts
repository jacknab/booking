/**
 * Shared utility: copies rows from `customers` → new `clients` architecture.
 * Used by the demo seeder and the API route.
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
import { eq, and } from "drizzle-orm";

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

  return { migrated, skipped, total: allCustomers.length };
}
