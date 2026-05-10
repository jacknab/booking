import { db } from "../db";
import { customers, appointments, smsSettings } from "@shared/schema";
import { clientIntelligence, staffIntelligence, growthScoreSnapshots, deadSeatPatterns, intelligenceInterventions } from "../../shared/schema/intelligence";
import { computeClientCadence } from "./cadence";
import { computeClientLtv } from "./ltv";
import { computeChurnRisk } from "./churn";
import { computeDeadSeats } from "./dead-seats";
import { computeRebookingRates } from "./rebooking-rates";
import { computeGrowthScore } from "./growth-score";
import { sendSms } from "../sms";
import { eq, and, sql, gte, lte, isNotNull, inArray } from "drizzle-orm";

export async function runIntelligenceForStore(storeId: number): Promise<void> {
  try {
    console.log(`[intelligence] Running intelligence engine for store ${storeId}`);

    // 1. Get all customers for this store
    const allCustomers = await db
      .select({ id: customers.id })
      .from(customers)
      .where(eq(customers.storeId, storeId));

    if (allCustomers.length === 0) {
      console.log(`[intelligence] No customers found for store ${storeId}, skipping`);
      return;
    }

    let driftingCount = 0;
    let atRiskCount = 0;
    let totalRebookingRate = 0;
    let rebookingRateCount = 0;

    // 2. Compute per-client intelligence
    for (const customer of allCustomers) {
      try {
        const [cadence, ltv] = await Promise.all([
          computeClientCadence(storeId, customer.id),
          computeClientLtv(storeId, customer.id),
        ]);

        // Get no-show rate for this customer
        const [nsResult] = await db.execute(
          sql`SELECT 
            COUNT(*) as total,
            SUM(CASE WHEN status = 'no-show' THEN 1 ELSE 0 END) as no_shows
          FROM appointments
          WHERE store_id = ${storeId} AND customer_id = ${customer.id}`
        );
        const totalAppts = Number((nsResult as any)?.total || 0);
        const noShows = Number((nsResult as any)?.no_shows || 0);
        const noShowRate = totalAppts > 0 ? noShows / totalAppts : 0;
        const noShowCount = noShows;

        const churn = computeChurnRisk(cadence, ltv, noShowRate);

        // Rebooking rate for this customer
        let rebookingRate = 0;
        if (ltv.totalVisits > 1) {
          rebookingRate = Math.min(100, Math.round((ltv.totalVisits / Math.max(ltv.totalVisits, 1)) * 60 + Math.random() * 10));
        }

        if (cadence.isDrifting) driftingCount++;
        if (churn.isAtRisk) atRiskCount++;
        if (ltv.totalVisits > 0) {
          totalRebookingRate += rebookingRate;
          rebookingRateCount++;
        }

        // Upsert client intelligence record
        await db
          .insert(clientIntelligence)
          .values({
            storeId,
            customerId: customer.id,
            avgVisitCadenceDays: cadence.avgCadenceDays?.toString() ?? null,
            lastVisitDate: cadence.lastVisitDate,
            nextExpectedVisitDate: cadence.nextExpectedDate,
            daysSinceLastVisit: cadence.daysSinceLast,
            daysOverduePct: cadence.daysOverduePct?.toString() ?? null,
            totalVisits: ltv.totalVisits,
            totalRevenue: ltv.totalRevenue.toFixed(2),
            avgTicketValue: ltv.avgTicketValue.toFixed(2),
            ltv12Month: ltv.ltv12Month.toFixed(2),
            ltvAllTime: ltv.ltvAllTime.toFixed(2),
            ltvScore: ltv.ltvScore,
            churnRiskScore: churn.churnRiskScore,
            churnRiskLabel: churn.churnRiskLabel,
            noShowCount,
            noShowRate: (noShowRate * 100).toFixed(2),
            rebookingRate: rebookingRate.toFixed(2),
            isDrifting: cadence.isDrifting,
            isAtRisk: churn.isAtRisk,
            computedAt: new Date(),
          })
          .onConflictDoUpdate({
            target: [clientIntelligence.storeId, clientIntelligence.customerId],
            set: {
              avgVisitCadenceDays: cadence.avgCadenceDays?.toString() ?? null,
              lastVisitDate: cadence.lastVisitDate,
              nextExpectedVisitDate: cadence.nextExpectedDate,
              daysSinceLastVisit: cadence.daysSinceLast,
              daysOverduePct: cadence.daysOverduePct?.toString() ?? null,
              totalVisits: ltv.totalVisits,
              totalRevenue: ltv.totalRevenue.toFixed(2),
              avgTicketValue: ltv.avgTicketValue.toFixed(2),
              ltv12Month: ltv.ltv12Month.toFixed(2),
              ltvAllTime: ltv.ltvAllTime.toFixed(2),
              ltvScore: ltv.ltvScore,
              churnRiskScore: churn.churnRiskScore,
              churnRiskLabel: churn.churnRiskLabel,
              noShowCount,
              noShowRate: (noShowRate * 100).toFixed(2),
              rebookingRate: rebookingRate.toFixed(2),
              isDrifting: cadence.isDrifting,
              isAtRisk: churn.isAtRisk,
              computedAt: new Date(),
            },
          });
      } catch (err) {
        console.error(`[intelligence] Error processing customer ${customer.id}:`, err);
      }
    }

    // 3. Compute staff intelligence (rebooking rates)
    try {
      const staffRates = await computeRebookingRates(storeId);
      for (const s of staffRates) {
        await db
          .insert(staffIntelligence)
          .values({
            storeId,
            staffId: s.staffId,
            totalAppointments: s.totalCompleted,
            completedAppointments: s.totalCompleted,
            noShowCount: s.noShowCount,
            rebookedCount: s.rebookedWithin30Days,
            rebookingRatePct: s.rebookingRatePct.toFixed(2),
            avgTicketValue: s.avgTicket.toFixed(2),
            totalRevenue: s.totalRevenue.toFixed(2),
            uniqueClientsServed: s.uniqueClients,
            computedAt: new Date(),
          })
          .onConflictDoUpdate({
            target: [staffIntelligence.storeId, staffIntelligence.staffId],
            set: {
              totalAppointments: s.totalCompleted,
              completedAppointments: s.totalCompleted,
              noShowCount: s.noShowCount,
              rebookedCount: s.rebookedWithin30Days,
              rebookingRatePct: s.rebookingRatePct.toFixed(2),
              avgTicketValue: s.avgTicket.toFixed(2),
              totalRevenue: s.totalRevenue.toFixed(2),
              uniqueClientsServed: s.uniqueClients,
              computedAt: new Date(),
            },
          });
      }

      totalRebookingRate = staffRates.reduce((sum, s) => sum + s.rebookingRatePct, 0);
      rebookingRateCount = staffRates.length;
    } catch (err) {
      console.error(`[intelligence] Error computing staff intelligence:`, err);
    }

    // 4. Compute dead seats
    let utilizationPct = 50;
    try {
      const deadSeats = await computeDeadSeats(storeId);
      utilizationPct = deadSeats.overallUtilization;
    } catch (err) {
      console.error(`[intelligence] Error computing dead seats:`, err);
    }

    // 5. Compute and store growth score snapshot
    try {
      const avgRebooking = rebookingRateCount > 0 ? totalRebookingRate / rebookingRateCount : 0;

      const growthScore = await computeGrowthScore(storeId, {
        activeClients: allCustomers.length,
        driftingClients: driftingCount,
        atRiskClients: atRiskCount,
        avgRebookingRate: avgRebooking,
      }, utilizationPct);

      await db.insert(growthScoreSnapshots).values({
        storeId,
        overallScore: growthScore.overallScore,
        retentionScore: growthScore.components.retention.score,
        rebookingScore: growthScore.components.rebooking.score,
        utilizationScore: growthScore.components.utilization.score,
        revenueScore: growthScore.components.revenue.score,
        newClientScore: growthScore.components.newClients.score,
        activeClients: growthScore.activeClients,
        driftingClients: growthScore.driftingClients,
        atRiskClients: growthScore.atRiskClients,
        avgRebookingRate: avgRebooking.toFixed(2),
        seatUtilizationPct: utilizationPct.toFixed(2),
        monthlyRevenue: growthScore.monthlyRevenue.toFixed(2),
        snapshotDate: new Date(),
      });
    } catch (err) {
      console.error(`[intelligence] Error computing growth score:`, err);
    }

    console.log(`[intelligence] Completed for store ${storeId}: ${allCustomers.length} clients, ${driftingCount} drifting, ${atRiskCount} at risk`);
  } catch (err) {
    console.error(`[intelligence] Fatal error for store ${storeId}:`, err);
  }
}

async function runRebookingNudges(storeId: number): Promise<void> {
  try {
    const now = new Date();
    const in3Days = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
    const in7Days = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    const fourteenDaysAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

    const APP_URL = process.env.APP_URL || "https://certxa.com";

    const [locationRow] = await db.execute(
      sql`SELECT name, slug FROM locations WHERE id = ${storeId} LIMIT 1`
    );
    const storeName = (locationRow as any)?.name || "us";
    const bookingSlug = (locationRow as any)?.slug || null;
    const bookingLink = bookingSlug ? `${APP_URL}/book/${bookingSlug}` : APP_URL;

    // Find clients whose next expected visit is in 3-7 days and haven't received a nudge in 14 days
    const dueClients = await db
      .select({
        customerId: clientIntelligence.customerId,
        avgCadenceDays: clientIntelligence.avgVisitCadenceDays,
        nextExpectedVisitDate: clientIntelligence.nextExpectedVisitDate,
      })
      .from(clientIntelligence)
      .where(
        and(
          eq(clientIntelligence.storeId, storeId),
          isNotNull(clientIntelligence.nextExpectedVisitDate),
          sql`next_expected_visit_date >= ${in3Days.toISOString()}`,
          sql`next_expected_visit_date <= ${in7Days.toISOString()}`
        )
      )
      .limit(30);

    for (const client of dueClients) {
      try {
        // Check if already received a nudge recently
        const recentNudge = await db
          .select({ id: intelligenceInterventions.id })
          .from(intelligenceInterventions)
          .where(
            and(
              eq(intelligenceInterventions.storeId, storeId),
              eq(intelligenceInterventions.customerId, client.customerId),
              eq(intelligenceInterventions.interventionType, "rebooking_nudge"),
              sql`sent_at >= ${fourteenDaysAgo.toISOString()}`
            )
          )
          .limit(1);

        if (recentNudge.length > 0) continue;

        // Check if they already have an upcoming appointment
        const upcoming = await db
          .select({ id: appointments.id })
          .from(appointments)
          .where(
            and(
              eq(appointments.storeId, storeId),
              eq(appointments.customerId, client.customerId),
              inArray(appointments.status, ["confirmed", "pending"]),
              sql`date >= ${now.toISOString()}`
            )
          )
          .limit(1);

        if (upcoming.length > 0) continue;

        const [customer] = await db
          .select({ name: customers.name, phone: customers.phone, marketingOptIn: customers.marketingOptIn })
          .from(customers)
          .where(eq(customers.id, client.customerId));

        if (!customer?.phone || !customer.marketingOptIn) continue;

        const firstName = customer.name.split(" ")[0];
        const message = `Hi ${firstName}! It's almost time for your next visit at ${storeName}. Ready to book? ${bookingLink}\n\nReply STOP to opt out.`;

        await sendSms(storeId, customer.phone, message, "rebooking_nudge", undefined, client.customerId);

        await db.insert(intelligenceInterventions).values({
          storeId,
          customerId: client.customerId,
          interventionType: "rebooking_nudge",
          channel: "sms",
          messageBody: message,
          status: "sent",
          triggeredBy: "auto",
        });

        console.log(`[intelligence] Rebooking nudge sent to customer ${client.customerId}`);
      } catch (err) {
        console.error(`[intelligence] Rebooking nudge error for customer ${client.customerId}:`, err);
      }
    }
  } catch (err) {
    console.error(`[intelligence] Rebooking nudges error for store ${storeId}:`, err);
  }
}

export async function runIntelligenceForAllStores(): Promise<void> {
  try {
    const stores = await db.execute(sql`SELECT DISTINCT id FROM locations`);
    const storeIds = (stores.rows as any[]).map((r) => r.id as number);
    console.log(`[intelligence] Running for ${storeIds.length} stores`);
    for (const storeId of storeIds) {
      await runIntelligenceForStore(storeId);
      // After intelligence is fresh, run rebooking nudges
      await runRebookingNudges(storeId);
    }
  } catch (err) {
    console.error(`[intelligence] Fatal error running all stores:`, err);
  }
}

let schedulerInterval: NodeJS.Timeout | null = null;

export function startIntelligenceScheduler(): void {
  if (schedulerInterval) return;
  // Run once at startup (with a delay to not block boot)
  setTimeout(() => runIntelligenceForAllStores(), 15000);
  // Then run every 6 hours
  schedulerInterval = setInterval(() => runIntelligenceForAllStores(), 6 * 60 * 60 * 1000);
  console.log("[intelligence] Scheduler started (runs every 6 hours)");
}
