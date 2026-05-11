import { Router } from "express";
import { db } from "../db";
import { sql } from "drizzle-orm";
import { runDemoEngines } from "../intelligence/demo-runner";

const router = Router();

const DEMO_EMAIL = "nail-demo@certxa.com";

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

  try {
    await runDemoEngines(storeId, (event) => send(event));
    send({ phase: "complete", status: "done", label: "All Systems Online" });
  } catch (err: any) {
    send({ phase: "error", status: "error", label: "Engine Error", error: err.message });
  } finally {
    clearInterval(keepAlive);
    res.end();
  }
});

export default router;
