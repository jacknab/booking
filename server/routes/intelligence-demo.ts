import { Router } from "express";
import { spawn } from "child_process";
import path from "path";
import { fileURLToPath } from "url";
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
const RESET_DELAY_MS = 15 * 60 * 1000; // 15 minutes after engines finish

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "../..");
const TSX  = path.join(ROOT, "node_modules/.bin/tsx");
const RESEED_SCRIPT = path.join(ROOT, "scripts/reseed-nail-demo.ts");

// ── In-memory state per store ─────────────────────────────────────────────
// running  → engines are animating right now
// resetAt  → engines done, 15-min countdown in progress
// reseeding → 15-min timer fired, full reseed is running in background
interface DemoState {
  running: boolean;
  resetAt?: number;
  reseeding?: boolean;
}
const demoState = new Map<number, DemoState>();

// ── Full reseed in background child process ───────────────────────────────
// Clears ALL demo data (appointments, clients, staff, services, intelligence)
// then re-seeds fresh data from scripts/reseed-nail-demo.ts.
// The server stays alive while this runs (~60-90 seconds).
function spawnFullReseed(storeId: number): void {
  console.log(`[DemoReset] Spawning full reseed for store ${storeId} …`);
  demoState.set(storeId, { running: false, reseeding: true });

  const child = spawn(TSX, [RESEED_SCRIPT], {
    cwd: ROOT,
    stdio: "pipe",
    env: { ...process.env },
  });

  child.stdout?.on("data", (d) =>
    process.stdout.write(`[DemoReseed] ${d}`)
  );
  child.stderr?.on("data", (d) =>
    process.stderr.write(`[DemoReseed:err] ${d}`)
  );

  child.on("close", (code) => {
    if (code === 0) {
      console.log(`[DemoReset] Reseed complete for store ${storeId} — ready for next demo`);
    } else {
      console.error(`[DemoReset] Reseed exited with code ${code} for store ${storeId}`);
    }
    // Either way, clear state so the button becomes available again.
    // (If reseed failed the data may be partial — better to let the next
    //  tester try than to leave the button locked forever.)
    demoState.delete(storeId);
  });

  child.on("error", (err) => {
    console.error(`[DemoReset] Failed to spawn reseed for store ${storeId}:`, err.message);
    demoState.delete(storeId);
  });
}

// ── GET /status ───────────────────────────────────────────────────────────
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

  // Full reseed is happening — show cooldown with an opaque estimate so the
  // countdown ticks but the real unlock comes from the next poll cycle.
  if (state.reseeding) {
    return res.json({ status: "cooldown", msLeft: 90_000 });
  }

  if (state.resetAt) {
    const msLeft = state.resetAt - Date.now();
    if (msLeft > 0) {
      return res.json({ status: "cooldown", resetAt: state.resetAt, msLeft });
    }
    // Timer has already passed but child hasn't cleared state yet — treat as reseeding
    demoState.set(storeId, { running: false, reseeding: true });
    return res.json({ status: "cooldown", msLeft: 90_000 });
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

  const keepAlive = setInterval(() => res.write(": ping\n\n"), 20_000);

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
    // After the 15-min cooldown, do a full reseed so the next tester gets
    // completely fresh data — all appointments, clients, and intelligence
    // are wiped and rebuilt from the seed script.
    setTimeout(() => spawnFullReseed(storeId), RESET_DELAY_MS);
    console.log(`[DemoReset] Full reseed scheduled for store ${storeId} in 15 minutes`);
  } else {
    demoState.delete(storeId);
  }
});

export default router;
