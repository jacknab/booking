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

// ── All demo account emails ───────────────────────────────────────────────────
export const DEMO_EMAILS = new Set([
  "nail-demo@certxa.com",
  "hair-demo@certxa.com",
  "spa-demo@certxa.com",
  "barber-demo@certxa.com",
]);

// Map each demo email to its reseed script
const RESEED_SCRIPTS: Record<string, string> = {
  "nail-demo@certxa.com":   "scripts/reseed-nail-demo.ts",
  "hair-demo@certxa.com":   "scripts/reseed-hair-demo.ts",
  "spa-demo@certxa.com":    "scripts/reseed-spa-demo.ts",
  "barber-demo@certxa.com": "scripts/reseed-barber-demo.ts",
};

const RESET_DELAY_MS = 15 * 60 * 1000; // 15 minutes after engines finish

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "../..");
const TSX  = path.join(ROOT, "node_modules/.bin/tsx");

// ── In-memory state per store ─────────────────────────────────────────────────
// running   → engines are animating right now
// resetAt   → engines done, 15-min countdown in progress
// reseeding → 15-min timer fired, full reseed running in background
// email     → the demo user who launched (determines which reseed script to run)
interface DemoState {
  running:   boolean;
  resetAt?:  number;
  reseeding?: boolean;
  email:     string;
}
const demoState = new Map<number, DemoState>();

// ── Full reseed in background child process ───────────────────────────────────
function spawnFullReseed(storeId: number, email: string): void {
  const script = RESEED_SCRIPTS[email];
  if (!script) {
    console.error(`[DemoReset] No reseed script mapped for email: ${email}`);
    demoState.delete(storeId);
    return;
  }

  console.log(`[DemoReset] Spawning full reseed for store ${storeId} (${email}) …`);
  demoState.set(storeId, { running: false, reseeding: true, email });

  const child = spawn(TSX, [path.join(ROOT, script)], {
    cwd: ROOT,
    stdio: "pipe",
    env: { ...process.env },
  });

  child.stdout?.on("data", (d) => process.stdout.write(`[DemoReseed] ${d}`));
  child.stderr?.on("data", (d) => process.stderr.write(`[DemoReseed:err] ${d}`));

  child.on("close", (code) => {
    if (code === 0) {
      console.log(`[DemoReset] Reseed complete for store ${storeId} — ready for next demo`);
    } else {
      console.error(`[DemoReset] Reseed exited with code ${code} for store ${storeId}`);
    }
    demoState.delete(storeId);
  });

  child.on("error", (err) => {
    console.error(`[DemoReset] Failed to spawn reseed for store ${storeId}:`, err.message);
    demoState.delete(storeId);
  });
}

// ── GET /status ───────────────────────────────────────────────────────────────
router.get("/status", (req: any, res) => {
  const user = req.user;
  if (!user || !DEMO_EMAILS.has(user.email)) {
    return res.status(403).json({ error: "Demo account only." });
  }

  const storeId = parseInt(req.query.storeId as string);
  if (!storeId || isNaN(storeId)) {
    return res.status(400).json({ error: "storeId is required" });
  }

  const state = demoState.get(storeId);

  if (!state) return res.json({ status: "ready" });

  if (state.running) return res.json({ status: "running" });

  if (state.reseeding) {
    return res.json({ status: "cooldown", msLeft: 90_000 });
  }

  if (state.resetAt) {
    const msLeft = state.resetAt - Date.now();
    if (msLeft > 0) return res.json({ status: "cooldown", resetAt: state.resetAt, msLeft });
    // Timer already fired but child hasn't started — kick off reseed now
    spawnFullReseed(storeId, state.email);
    return res.json({ status: "cooldown", msLeft: 90_000 });
  }

  return res.json({ status: "ready" });
});

// ── GET /launch (SSE) ─────────────────────────────────────────────────────────
router.get("/launch", async (req: any, res) => {
  const user = req.user;
  if (!user || !DEMO_EMAILS.has(user.email)) {
    return res.status(403).json({ error: "This endpoint is only available for demo accounts." });
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

  demoState.set(storeId, { running: true, email: user.email });

  const send = (data: object) => res.write(`data: ${JSON.stringify(data)}\n\n`);
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
    demoState.set(storeId, { running: false, resetAt, email: user.email });
    setTimeout(() => spawnFullReseed(storeId, user.email), RESET_DELAY_MS);
    console.log(`[DemoReset] Full reseed scheduled for store ${storeId} (${user.email}) in 15 min`);
  } else {
    demoState.delete(storeId);
  }
});

export default router;
