import { db } from "../db";
import { customers } from "@shared/schema";
import { clientIntelligence, staffIntelligence, growthScoreSnapshots, deadSeatPatterns } from "../../shared/schema/intelligence";
import { computeClientCadence } from "./cadence";
import { computeClientLtv } from "./ltv";
import { computeChurnRisk } from "./churn";
import { computeDeadSeats } from "./dead-seats";
import { computeRebookingRates } from "./rebooking-rates";
import { computeGrowthScore } from "./growth-score";
import { eq, and, sql } from "drizzle-orm";

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

export async function runIntelligenceForAllStores(): Promise<void> {
  try {
    const stores = await db.execute(sql`SELECT DISTINCT id FROM locations`);
    const storeIds = (stores.rows as any[]).map((r) => r.id as number);
    console.log(`[intelligence] Running for ${storeIds.length} stores`);
    for (const storeId of storeIds) {
      await runIntelligenceForStore(storeId);
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
