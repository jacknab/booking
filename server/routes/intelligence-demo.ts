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

// ── In-memory state per store ─────────────────────────────────────────────
// Tracks whether engines are running and when the auto-reset will fire.
// Simple Map is fine — this is a single-process dev/demo server.
interface DemoState {
  running: boolean;
  resetAt?: number; // unix ms — when the 15-min cleanup timer fires
}
const demoState = new Map<number, DemoState>();

// ── Helpers ───────────────────────────────────────────────────────────────
async function resetDemoIntelligence(storeId: number): Promise<void> {
  try {
    await db.delete(intelligenceInterventions).where(eq(intelligenceInterventions.storeId, storeId));
    await db.delete(clientIntelligence).where(eq(clientIntelligence.storeId, storeId));
    await db.delete(staffIntelligence).where(eq(staffIntelligence.storeId, storeId));
    await db.delete(growthScoreSnapshots).where(eq(growthScoreSnapshots.storeId, storeId));
    await db.delete(deadSeatPatterns).where(eq(deadSeatPatterns.storeId, storeId));
    demoState.delete(storeId);
    console.log(`[DemoReset] Intelligence data cleared for store ${storeId} — ready for next demo`);
  } catch (err: any) {
    console.error(`[DemoReset] Failed to reset intelligence for store ${storeId}:`, err.message);
  }
}

// ── GET /status ───────────────────────────────────────────────────────────
// Returns the current demo state so the frontend button can show the right
// label: "ready" | "running" | "cooldown".
router.get("/status", (req: any, res) => {
  const user = req.user;
  if (!user || user.email !== DEMO_EMAIL) {
    return res.status(403).json({ error: "Demo account only." });
  }

  const storeId = parseInt(req.query.storeId as string);
  if (!storeId || isNaN(storeId)) {
    return res.status(400).json({ error: "storeId is required" });
  }

  const state = demoState.get(storeId);

  if (!state) {
    return res.json({ status: "ready" });
  }

  if (state.running) {
    return res.json({ status: "running" });
  }

  if (state.resetAt) {
    const msLeft = state.resetAt - Date.now();
    if (msLeft > 0) {
      return res.json({ status: "cooldown", resetAt: state.resetAt, msLeft });
    }
    // Timer already fired but state hasn't been cleared yet — treat as ready
    demoState.delete(storeId);
    return res.json({ status: "ready" });
  }

  return res.json({ status: "ready" });
});

// ── GET /launch (SSE) ─────────────────────────────────────────────────────
router.get("/launch", async (req: any, res) => {
  const user = req.user;
  if (!user || user.email !== DEMO_EMAIL) {
    return res.status(403).json({ error: "This endpoint is only available for the demo account." });
  }

  const storeId = parseInt(req.query.storeId as string);
  if (!storeId || isNaN(storeId)) {
    return res.status(400).json({ error: "storeId is required" });
  }

  // Prevent double-launch
  const current = demoState.get(storeId);
  if (current?.running) {
    return res.status(409).json({ error: "Engines are already running for this store." });
  }

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("X-Accel-Buffering", "no");
  res.flushHeaders();

  demoState.set(storeId, { running: true });

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

  if (enginesCompleted) {
    const resetAt = Date.now() + RESET_DELAY_MS;
    demoState.set(storeId, { running: false, resetAt });
    setTimeout(() => resetDemoIntelligence(storeId), RESET_DELAY_MS);
    console.log(`[DemoReset] Auto-reset scheduled for store ${storeId} in 15 minutes`);
  } else {
    demoState.delete(storeId);
  }
});

export default router;
