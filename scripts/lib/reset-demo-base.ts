/**
 * scripts/lib/reset-demo-base.ts
 *
 * Shared reset logic for all Certxa demo accounts.
 * Deletes every record associated with a given EMAIL + SLUG pair.
 *
 * Does NOT call process.exit() — the calling script handles that.
 */

import "dotenv/config";
import { db, pool } from "../../server/db";
import { users } from "../../shared/models/auth";
import {
  locations, businessHours, staff, staffServices, staffAvailability,
  staffSettings, serviceCategories, services, addons, serviceAddons,
  appointmentAddons, appointments, customers, calendarSettings,
  cashDrawerSessions, drawerActions, smsSettings, smsLog, smsOptOuts,
  mailSettings, stripeSettings, permissions, roles, apps, storeSettings,
  products, waitlist, giftCards, giftCardTransactions, intakeForms,
  intakeFormFields, intakeFormResponses, loyaltyTransactions,
  googleBusinessProfiles, googleBusinessAccounts, googleBusinessLocations,
  googleBusinessSyncLogs, googleReviews, googleReviewResponses,
  passwordResetTokens,
  clients,
  clientEmails,
  clientPhones,
  clientAddresses,
  clientNotes,
  clientTagRelationships,
  clientTags,
  clientMarketingPreferences,
  clientAuditLogs,
} from "../../shared/schema";
import {
  clientIntelligence,
  staffIntelligence,
  growthScoreSnapshots,
  deadSeatPatterns,
  intelligenceInterventions,
} from "../../shared/schema/intelligence";
import { eq, inArray } from "drizzle-orm";

export async function resetDemoAccount(EMAIL: string, SLUG: string): Promise<void> {
  const [store] = await db
    .select({ id: locations.id, name: locations.name })
    .from(locations)
    .where(eq(locations.bookingSlug, SLUG));

  const [user] = await db
    .select({ id: users.id, email: users.email })
    .from(users)
    .where(eq(users.email, EMAIL));

  if (!store && !user) {
    console.log("ℹ️  Demo account does not exist — nothing to reset.\n");
    return;
  }

  const storeId = store?.id;

  if (storeId) {
    console.log(`  Found store: "${store.name}" (id=${storeId})`);

    const apptIds = (await db.select({ id: appointments.id }).from(appointments).where(eq(appointments.storeId, storeId))).map(r => r.id);
    const customerIds = (await db.select({ id: customers.id }).from(customers).where(eq(customers.storeId, storeId))).map(r => r.id);
    const serviceIds = (await db.select({ id: services.id }).from(services).where(eq(services.storeId, storeId))).map(r => r.id);
    const staffIds = (await db.select({ id: staff.id }).from(staff).where(eq(staff.storeId, storeId))).map(r => r.id);
    const formIds = (await db.select({ id: intakeForms.id }).from(intakeForms).where(eq(intakeForms.storeId, storeId))).map(r => r.id);
    const giftCardIds = (await db.select({ id: giftCards.id }).from(giftCards).where(eq(giftCards.storeId, storeId))).map(r => r.id);
    const cashSessionIds = (await db.select({ id: cashDrawerSessions.id }).from(cashDrawerSessions).where(eq(cashDrawerSessions.storeId, storeId))).map(r => r.id);
    const reviewIds = (await db.select({ id: googleReviews.id }).from(googleReviews).where(eq(googleReviews.storeId, storeId))).map(r => r.id);

    if (apptIds.length) await db.delete(appointmentAddons).where(inArray(appointmentAddons.appointmentId, apptIds));
    await db.delete(appointments).where(eq(appointments.storeId, storeId));
    console.log("    ✓ appointments");

    if (customerIds.length) {
      await db.delete(loyaltyTransactions).where(inArray(loyaltyTransactions.customerId, customerIds));
      await db.delete(intakeFormResponses).where(inArray(intakeFormResponses.customerId, customerIds));
    }
    await db.delete(customers).where(eq(customers.storeId, storeId));
    console.log("    ✓ customers");

    // ── Clients table (new architecture) ──────────────────────────────────────
    const clientIds = (await db.select({ id: clients.id }).from(clients).where(eq(clients.storeId, storeId))).map(r => r.id);
    if (clientIds.length) {
      await db.delete(clientTagRelationships).where(inArray(clientTagRelationships.clientId, clientIds));
      await db.delete(clientEmails).where(inArray(clientEmails.clientId, clientIds));
      await db.delete(clientPhones).where(inArray(clientPhones.clientId, clientIds));
      await db.delete(clientAddresses).where(inArray(clientAddresses.clientId, clientIds));
      await db.delete(clientNotes).where(inArray(clientNotes.clientId, clientIds));
      await db.delete(clientMarketingPreferences).where(inArray(clientMarketingPreferences.clientId, clientIds));
      await db.delete(clientAuditLogs).where(inArray(clientAuditLogs.clientId, clientIds));
    }
    await db.delete(clientTags).where(eq(clientTags.storeId, storeId));
    await db.delete(clients).where(eq(clients.storeId, storeId));
    console.log("    ✓ clients (new architecture)");

    if (staffIds.length) {
      await db.delete(staffServices).where(inArray(staffServices.staffId, staffIds));
      await db.delete(staffAvailability).where(inArray(staffAvailability.staffId, staffIds));
      await db.delete(staffSettings).where(inArray(staffSettings.staffId, staffIds));
    }
    await db.delete(staff).where(eq(staff.storeId, storeId));
    console.log("    ✓ staff");

    if (serviceIds.length) await db.delete(serviceAddons).where(inArray(serviceAddons.serviceId, serviceIds));
    await db.delete(services).where(eq(services.storeId, storeId));
    await db.delete(addons).where(eq(addons.storeId, storeId));
    await db.delete(serviceCategories).where(eq(serviceCategories.storeId, storeId));
    console.log("    ✓ services");

    if (formIds.length) await db.delete(intakeFormFields).where(inArray(intakeFormFields.formId, formIds));
    await db.delete(intakeForms).where(eq(intakeForms.storeId, storeId));

    if (giftCardIds.length) await db.delete(giftCardTransactions).where(inArray(giftCardTransactions.giftCardId, giftCardIds));
    await db.delete(giftCards).where(eq(giftCards.storeId, storeId));

    if (cashSessionIds.length) await db.delete(drawerActions).where(inArray(drawerActions.sessionId, cashSessionIds));
    await db.delete(cashDrawerSessions).where(eq(cashDrawerSessions.storeId, storeId));

    if (reviewIds.length) await db.delete(googleReviewResponses).where(inArray(googleReviewResponses.reviewId, reviewIds));
    await db.delete(googleReviews).where(eq(googleReviews.storeId, storeId));
    await db.delete(googleBusinessSyncLogs).where(eq(googleBusinessSyncLogs.storeId, storeId));
    await db.delete(googleBusinessLocations).where(eq(googleBusinessLocations.storeId, storeId));
    await db.delete(googleBusinessAccounts).where(eq(googleBusinessAccounts.storeId, storeId));
    await db.delete(googleBusinessProfiles).where(eq(googleBusinessProfiles.storeId, storeId));

    await db.delete(businessHours).where(eq(businessHours.storeId, storeId));
    await db.delete(calendarSettings).where(eq(calendarSettings.storeId, storeId));
    await db.delete(smsSettings).where(eq(smsSettings.storeId, storeId));
    await db.delete(smsLog).where(eq(smsLog.storeId, storeId));
    await db.delete(smsOptOuts).where(eq(smsOptOuts.storeId, storeId));
    await db.delete(mailSettings).where(eq(mailSettings.storeId, storeId));
    await db.delete(stripeSettings).where(eq(stripeSettings.storeId, storeId));
    await db.delete(permissions).where(eq(permissions.storeId, storeId));
    await db.delete(roles).where(eq(roles.storeId, storeId));
    await db.delete(apps).where(eq(apps.storeId, storeId));
    await db.delete(storeSettings).where(eq(storeSettings.storeId, storeId));
    await db.delete(products).where(eq(products.storeId, storeId));
    await db.delete(waitlist).where(eq(waitlist.storeId, storeId));
    console.log("    ✓ store settings & config");

    // ── Intelligence tables (not store-FK-cascaded, must delete explicitly) ──
    await db.delete(intelligenceInterventions).where(eq(intelligenceInterventions.storeId, storeId));
    await db.delete(clientIntelligence).where(eq(clientIntelligence.storeId, storeId));
    await db.delete(staffIntelligence).where(eq(staffIntelligence.storeId, storeId));
    await db.delete(growthScoreSnapshots).where(eq(growthScoreSnapshots.storeId, storeId));
    await db.delete(deadSeatPatterns).where(eq(deadSeatPatterns.storeId, storeId));
    console.log("    ✓ intelligence data");

    await db.delete(locations).where(eq(locations.id, storeId));
    console.log("    ✓ store record");
  }

  if (user) {
    await db.delete(passwordResetTokens).where(eq(passwordResetTokens.userId, user.id));
    await db.delete(users).where(eq(users.id, user.id));
    console.log(`    ✓ user: ${user.email}`);
  }
}
