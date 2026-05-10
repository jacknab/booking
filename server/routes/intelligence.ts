import { Router } from "express";
import { db } from "../db";
import { customers, appointments, staff } from "@shared/schema";
import {
  clientIntelligence,
  staffIntelligence,
  growthScoreSnapshots,
  intelligenceInterventions,
} from "../../shared/schema/intelligence";
import { eq, and, desc, gte, sql, inArray, lte } from "drizzle-orm";
import { runIntelligenceForStore } from "../intelligence/orchestrator";
import { computeDeadSeats } from "../intelligence/dead-seats";
import { computeNoShowRisks, getNoShowStats } from "../intelligence/no-show";
import { computeRebookingRates } from "../intelligence/rebooking-rates";
import { computeGrowthScore } from "../intelligence/growth-score";
import { computeRevenueLeakage } from "../intelligence/revenue-leakage";
import { runDriftRecovery, sendManualWinback } from "../intelligence/drift-recovery";
import {
  getCancellationRecoveryCandidates,
  sendCancellationRecoverySms,
} from "../intelligence/cancellation-recovery";

const router = Router();

function requireStoreId(req: any, res: any): number | null {
  const storeId = parseInt(req.query.storeId as string);
  if (!storeId || isNaN(storeId)) {
    res.status(400).json({ error: "storeId is required" });
    return null;
  }
  return storeId;
}

// GET /api/intelligence/dashboard
// Returns the full intelligence dashboard data for a store
router.get("/dashboard", async (req, res) => {
  const storeId = requireStoreId(req, res);
  if (!storeId) return;

  try {
    // Get the latest growth score
    const [latestScore] = await db
      .select()
      .from(growthScoreSnapshots)
      .where(eq(growthScoreSnapshots.storeId, storeId))
      .orderBy(desc(growthScoreSnapshots.snapshotDate))
      .limit(1);

    // Get at-risk clients (high churn score, sorted by LTV desc)
    const atRiskClients = await db
      .select({
        id: clientIntelligence.id,
        customerId: clientIntelligence.customerId,
        customerName: customers.name,
        customerPhone: customers.phone,
        churnRiskScore: clientIntelligence.churnRiskScore,
        churnRiskLabel: clientIntelligence.churnRiskLabel,
        ltv12Month: clientIntelligence.ltv12Month,
        ltvScore: clientIntelligence.ltvScore,
        daysSinceLast: clientIntelligence.daysSinceLastVisit,
        avgCadenceDays: clientIntelligence.avgVisitCadenceDays,
        lastWinbackSentAt: clientIntelligence.lastWinbackSentAt,
        isDrifting: clientIntelligence.isDrifting,
        isAtRisk: clientIntelligence.isAtRisk,
      })
      .from(clientIntelligence)
      .leftJoin(customers, eq(clientIntelligence.customerId, customers.id))
      .where(
        and(
          eq(clientIntelligence.storeId, storeId),
          sql`churn_risk_score >= 25`
        )
      )
      .orderBy(desc(clientIntelligence.ltv12Month), desc(clientIntelligence.churnRiskScore))
      .limit(20);

    // Get score history (last 30 days)
    const last30 = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const scoreHistory = await db
      .select({
        score: growthScoreSnapshots.overallScore,
        date: growthScoreSnapshots.snapshotDate,
      })
      .from(growthScoreSnapshots)
      .where(
        and(
          eq(growthScoreSnapshots.storeId, storeId),
          gte(growthScoreSnapshots.snapshotDate, last30)
        )
      )
      .orderBy(growthScoreSnapshots.snapshotDate);

    // Recent interventions
    const recentInterventions = await db
      .select({
        id: intelligenceInterventions.id,
        type: intelligenceInterventions.interventionType,
        channel: intelligenceInterventions.channel,
        status: intelligenceInterventions.status,
        triggeredBy: intelligenceInterventions.triggeredBy,
        sentAt: intelligenceInterventions.sentAt,
        customerName: customers.name,
      })
      .from(intelligenceInterventions)
      .leftJoin(customers, eq(intelligenceInterventions.customerId, customers.id))
      .where(eq(intelligenceInterventions.storeId, storeId))
      .orderBy(desc(intelligenceInterventions.sentAt))
      .limit(10);

    // Summary stats
    const [clientStats] = await db
      .select({
        total: sql<number>`COUNT(*)`,
        drifting: sql<number>`SUM(CASE WHEN is_drifting THEN 1 ELSE 0 END)`,
        atRisk: sql<number>`SUM(CASE WHEN is_at_risk THEN 1 ELSE 0 END)`,
        avgLtv12: sql<string>`COALESCE(AVG(CAST(ltv_12_month AS DECIMAL(10,2))), 0)`,
      })
      .from(clientIntelligence)
      .where(eq(clientIntelligence.storeId, storeId));

    res.json({
      latestScore: latestScore || null,
      atRiskClients,
      scoreHistory,
      recentInterventions,
      summary: {
        totalClients: Number(clientStats?.total || 0),
        driftingClients: Number(clientStats?.drifting || 0),
        atRiskClients: Number(clientStats?.atRisk || 0),
        avgLtv12Month: parseFloat(clientStats?.avgLtv12 || "0"),
        lastComputedAt: latestScore?.snapshotDate || null,
      },
    });
  } catch (err: any) {
    console.error("[intelligence] dashboard error:", err);
    res.status(500).json({ error: "Failed to fetch intelligence dashboard" });
  }
});

// GET /api/intelligence/growth-score
// Returns full growth score breakdown + history
router.get("/growth-score", async (req, res) => {
  const storeId = requireStoreId(req, res);
  if (!storeId) return;

  try {
    const [latestSnapshot] = await db
      .select()
      .from(growthScoreSnapshots)
      .where(eq(growthScoreSnapshots.storeId, storeId))
      .orderBy(desc(growthScoreSnapshots.snapshotDate))
      .limit(1);

    const history = await db
      .select()
      .from(growthScoreSnapshots)
      .where(eq(growthScoreSnapshots.storeId, storeId))
      .orderBy(desc(growthScoreSnapshots.snapshotDate))
      .limit(30);

    // Also compute live
    const [clientStats] = await db
      .select({
        total: sql<number>`COUNT(*)`,
        drifting: sql<number>`SUM(CASE WHEN is_drifting THEN 1 ELSE 0 END)`,
        atRisk: sql<number>`SUM(CASE WHEN is_at_risk THEN 1 ELSE 0 END)`,
        avgRebooking: sql<string>`COALESCE(AVG(CAST(rebooking_rate AS DECIMAL(10,2))), 0)`,
      })
      .from(clientIntelligence)
      .where(eq(clientIntelligence.storeId, storeId));

    const deadSeats = await computeDeadSeats(storeId);

    const liveScore = await computeGrowthScore(
      storeId,
      {
        activeClients: Number(clientStats?.total || 0),
        driftingClients: Number(clientStats?.drifting || 0),
        atRiskClients: Number(clientStats?.atRisk || 0),
        avgRebookingRate: parseFloat(clientStats?.avgRebooking || "0"),
      },
      deadSeats.overallUtilization
    );

    res.json({ snapshot: latestSnapshot, history: history.reverse(), live: liveScore });
  } catch (err: any) {
    console.error("[intelligence] growth-score error:", err);
    res.status(500).json({ error: "Failed to fetch growth score" });
  }
});

// GET /api/intelligence/revenue-leakage
router.get("/revenue-leakage", async (req, res) => {
  const storeId = requireStoreId(req, res);
  if (!storeId) return;

  try {
    const deadSeats = await computeDeadSeats(storeId);
    const report = await computeRevenueLeakage(storeId, deadSeats.totalLostRevenuePotential / 3);
    res.json(report);
  } catch (err: any) {
    console.error("[intelligence] revenue-leakage error:", err);
    res.status(500).json({ error: "Failed to compute revenue leakage" });
  }
});

// GET /api/intelligence/dead-seats
router.get("/dead-seats", async (req, res) => {
  const storeId = requireStoreId(req, res);
  if (!storeId) return;

  try {
    const report = await computeDeadSeats(storeId);
    res.json(report);
  } catch (err: any) {
    console.error("[intelligence] dead-seats error:", err);
    res.status(500).json({ error: "Failed to compute dead seats" });
  }
});

// GET /api/intelligence/no-show-risks
router.get("/no-show-risks", async (req, res) => {
  const storeId = requireStoreId(req, res);
  if (!storeId) return;

  try {
    // Default: tomorrow
    const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000);
    const risks = await computeNoShowRisks(storeId, tomorrow);
    const stats = await getNoShowStats(storeId);
    res.json({ risks, stats });
  } catch (err: any) {
    console.error("[intelligence] no-show-risks error:", err);
    res.status(500).json({ error: "Failed to compute no-show risks" });
  }
});

// GET /api/intelligence/rebooking-rates
router.get("/rebooking-rates", async (req, res) => {
  const storeId = requireStoreId(req, res);
  if (!storeId) return;

  try {
    const stats = await computeRebookingRates(storeId);

    // Also get from DB
    const dbStats = await db
      .select()
      .from(staffIntelligence)
      .where(eq(staffIntelligence.storeId, storeId))
      .orderBy(desc(staffIntelligence.rebookingRatePct));

    res.json({ live: stats, cached: dbStats });
  } catch (err: any) {
    console.error("[intelligence] rebooking-rates error:", err);
    res.status(500).json({ error: "Failed to compute rebooking rates" });
  }
});

// GET /api/intelligence/at-risk-clients
router.get("/at-risk-clients", async (req, res) => {
  const storeId = requireStoreId(req, res);
  if (!storeId) return;

  try {
    const atRiskClients = await db
      .select({
        customerId: clientIntelligence.customerId,
        customerName: customers.name,
        customerPhone: customers.phone,
        customerEmail: customers.email,
        churnRiskScore: clientIntelligence.churnRiskScore,
        churnRiskLabel: clientIntelligence.churnRiskLabel,
        ltv12Month: clientIntelligence.ltv12Month,
        ltvAllTime: clientIntelligence.ltvAllTime,
        ltvScore: clientIntelligence.ltvScore,
        daysSinceLast: clientIntelligence.daysSinceLastVisit,
        avgCadenceDays: clientIntelligence.avgVisitCadenceDays,
        daysOverduePct: clientIntelligence.daysOverduePct,
        totalVisits: clientIntelligence.totalVisits,
        noShowRate: clientIntelligence.noShowRate,
        lastWinbackSentAt: clientIntelligence.lastWinbackSentAt,
        isDrifting: clientIntelligence.isDrifting,
        isAtRisk: clientIntelligence.isAtRisk,
        marketingOptIn: customers.marketingOptIn,
      })
      .from(clientIntelligence)
      .leftJoin(customers, eq(clientIntelligence.customerId, customers.id))
      .where(
        and(
          eq(clientIntelligence.storeId, storeId),
          sql`churn_risk_score >= 25`
        )
      )
      .orderBy(desc(clientIntelligence.ltv12Month), desc(clientIntelligence.churnRiskScore))
      .limit(50);

    res.json(atRiskClients);
  } catch (err: any) {
    console.error("[intelligence] at-risk-clients error:", err);
    res.status(500).json({ error: "Failed to fetch at-risk clients" });
  }
});

// GET /api/intelligence/cancellation-recovery/:appointmentId
router.get("/cancellation-recovery/:appointmentId", async (req, res) => {
  const storeId = requireStoreId(req, res);
  if (!storeId) return;

  const appointmentId = parseInt(req.params.appointmentId);
  if (!appointmentId) return res.status(400).json({ error: "Invalid appointment ID" });

  try {
    const candidates = await getCancellationRecoveryCandidates(storeId, appointmentId);
    res.json(candidates);
  } catch (err: any) {
    console.error("[intelligence] cancellation-recovery error:", err);
    res.status(500).json({ error: "Failed to find recovery candidates" });
  }
});

// POST /api/intelligence/winback
router.post("/winback", async (req, res) => {
  const { storeId, customerId, manual } = req.body;
  if (!storeId || !customerId) {
    return res.status(400).json({ error: "storeId and customerId required" });
  }

  try {
    const result = await sendManualWinback(storeId, customerId);
    res.json(result);
  } catch (err: any) {
    console.error("[intelligence] winback error:", err);
    res.status(500).json({ error: "Failed to send winback message" });
  }
});

// POST /api/intelligence/winback-campaign
// Runs the automated drift recovery for a store
router.post("/winback-campaign", async (req, res) => {
  const { storeId, dryRun } = req.body;
  if (!storeId) return res.status(400).json({ error: "storeId required" });

  try {
    const result = await runDriftRecovery(storeId, dryRun === true);
    res.json(result);
  } catch (err: any) {
    console.error("[intelligence] winback-campaign error:", err);
    res.status(500).json({ error: "Failed to run winback campaign" });
  }
});

// POST /api/intelligence/fill-slot
router.post("/fill-slot", async (req, res) => {
  const { storeId, customerId, message, cancelledAppointmentId } = req.body;
  if (!storeId || !customerId || !message) {
    return res.status(400).json({ error: "storeId, customerId, and message required" });
  }

  try {
    const result = await sendCancellationRecoverySms(storeId, customerId, message, cancelledAppointmentId);
    res.json(result);
  } catch (err: any) {
    console.error("[intelligence] fill-slot error:", err);
    res.status(500).json({ error: "Failed to send fill-slot SMS" });
  }
});

// POST /api/intelligence/refresh
// Triggers a manual re-computation of intelligence for a store
router.post("/refresh", async (req, res) => {
  const { storeId } = req.body;
  if (!storeId) return res.status(400).json({ error: "storeId required" });

  try {
    res.json({ message: "Intelligence refresh started", storeId });
    // Run in background
    setImmediate(() => runIntelligenceForStore(storeId));
  } catch (err: any) {
    console.error("[intelligence] refresh error:", err);
    res.status(500).json({ error: "Failed to start refresh" });
  }
});

export default router;
