import { Router } from "express";
import { db } from "../db";
import { eq } from "drizzle-orm";
import {
  clientIntelligence,
  staffIntelligence,
  growthScoreSnapshots,
  intelligenceInterventions,
  deadSeatPatterns,
} from "../../shared/schema/intelligence";
import { runDemoEngines } from "../intelligence/demo-runner";

const router = Router();

const DEMO_EMAIL = "nail-demo@certxa.com";
const RESET_DELAY_MS = 15 * 60 * 1000; // 15 minutes

async function resetDemoIntelligence(storeId: number): Promise<void> {
  try {
    await db.delete(intelligenceInterventions).where(eq(intelligenceInterventions.storeId, storeId));
    await db.delete(clientIntelligence).where(eq(clientIntelligence.storeId, storeId));
    await db.delete(staffIntelligence).where(eq(staffIntelligence.storeId, storeId));
    await db.delete(growthScoreSnapshots).where(eq(growthScoreSnapshots.storeId, storeId));
    await db.delete(deadSeatPatterns).where(eq(deadSeatPatterns.storeId, storeId));
    console.log(`[DemoReset] Intelligence data cleared for store ${storeId} — ready for next demo`);
  } catch (err: any) {
    console.error(`[DemoReset] Failed to reset intelligence for store ${storeId}:`, err.message);
  }
}

router.get("/launch", async (req: any, res) => {
  const user = req.user;
  if (!user || user.email !== DEMO_EMAIL) {
    return res.status(403).json({ error: "This endpoint is only available for the demo account." });
  }

  const storeId = parseInt(req.query.storeId as string);
  if (!storeId || isNaN(storeId)) {
    return res.status(400).json({ error: "storeId is required" });
  }

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("X-Accel-Buffering", "no");
  res.flushHeaders();

  const send = (data: object) => {
    res.write(`data: ${JSON.stringify(data)}\n\n`);
  };

  const keepAlive = setInterval(() => res.write(": ping\n\n"), 20000);

  let enginesCompleted = false;
  try {
    await runDemoEngines(storeId, (event) => send(event));
    enginesCompleted = true;
    send({ phase: "complete", status: "done", label: "All Systems Online" });
  } catch (err: any) {
    send({ phase: "error", status: "error", label: "Engine Error", error: err.message });
  } finally {
    clearInterval(keepAlive);
    res.end();
  }

  // Schedule auto-reset 15 minutes after engines complete so the demo is
  // fresh and ready for the next person who logs in.
  if (enginesCompleted) {
    setTimeout(() => resetDemoIntelligence(storeId), RESET_DELAY_MS);
    console.log(`[DemoReset] Auto-reset scheduled for store ${storeId} in 15 minutes`);
  }
});

export default router;
