#!/usr/bin/env node
/**
 * scripts/db-push.mjs
 *
 * Safe, idempotent database schema push.
 * Works with plain `node` — no tsx or TypeScript required.
 *
 * What it does (in order):
 *   1. Applies schema.sql  (CREATE TABLE IF NOT EXISTS, ADD COLUMN IF NOT EXISTS, etc.)
 *   2. Ensures schema_migrations tracking table exists
 *   3. Runs any pending migration files from migrations/ that haven't been applied yet
 *      — Migrations containing CONCURRENTLY are run outside a transaction (required by Postgres)
 *      — All other migrations run inside a BEGIN/COMMIT transaction
 *
 * Usage:
 *   DATABASE_URL=postgresql://... node scripts/db-push.mjs
 *   npm run db:push
 */

import { readFileSync, readdirSync, existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import pg from "pg";

const { Pool } = pg;
const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");

// ── Validate env ───────────────────────────────────────────────────────────
if (!process.env.DATABASE_URL) {
  console.error("[db:push] ERROR: DATABASE_URL is not set.");
  console.error("  Set it in your .env file or pass it as an environment variable.");
  process.exit(1);
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  connectionTimeoutMillis: 10_000,
});

// ── Step 1: Apply schema.sql ───────────────────────────────────────────────
async function applySchema(client) {
  const schemaPath = join(ROOT, "schema.sql");
  if (!existsSync(schemaPath)) {
    console.warn("[db:push] Warning: schema.sql not found — skipping base schema step.");
    return;
  }
  const sql = readFileSync(schemaPath, "utf-8");
  console.log("[db:push] Step 1: Applying schema.sql…");
  try {
    await client.query(sql);
    console.log("[db:push]   ✓ schema.sql applied.");
  } catch (err) {
    console.error("[db:push]   ✗ schema.sql failed:", err.message);
    throw err;
  }
}

// ── Step 2 & 3: Run pending migrations ────────────────────────────────────
async function ensureTrackingTable(client) {
  await client.query(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      id         SERIAL PRIMARY KEY,
      filename   TEXT NOT NULL UNIQUE,
      applied_at TIMESTAMP NOT NULL DEFAULT NOW()
    )
  `);
}

async function getApplied(client) {
  const r = await client.query("SELECT filename FROM schema_migrations");
  return new Set(r.rows.map((row) => row.filename));
}

function getMigrationFiles() {
  const dir = join(ROOT, "migrations");
  if (!existsSync(dir)) return [];
  return readdirSync(dir)
    .filter((f) => f.endsWith(".sql") && !f.startsWith(".") && f !== "meta")
    .sort();
}

async function runMigrations(pool) {
  const client = await pool.connect();
  try {
    await ensureTrackingTable(client);
    const applied = await getApplied(client);
    const allFiles = getMigrationFiles();
    const pending = allFiles.filter((f) => !applied.has(f));

    if (pending.length === 0) {
      console.log("[db:push] Step 2: All migrations already applied — nothing to do.");
      return;
    }

    console.log(`[db:push] Step 2: Applying ${pending.length} pending migration(s)…`);

    for (const filename of pending) {
      const filePath = join(ROOT, "migrations", filename);
      const sql = readFileSync(filePath, "utf-8").trim();

      if (!sql) {
        console.log(`[db:push]   SKIP  ${filename} (empty file)`);
        // Still mark as applied so it doesn't show up as pending again
        await client.query(
          "INSERT INTO schema_migrations (filename) VALUES ($1) ON CONFLICT (filename) DO NOTHING",
          [filename]
        );
        continue;
      }

      // Migrations that contain CONCURRENTLY cannot run inside a transaction.
      // Postgres throws: "CREATE INDEX CONCURRENTLY cannot run inside a transaction block"
      const needsNoTx = sql.includes("CONCURRENTLY");

      try {
        if (needsNoTx) {
          // Run each CONCURRENTLY statement individually, outside any transaction.
          // Split on semicolons (simple split — works for these migration files).
          const statements = sql
            .split(";")
            .map((s) => s.trim())
            .filter((s) => s.length > 0);
          for (const stmt of statements) {
            await client.query(stmt);
          }
        } else {
          await client.query("BEGIN");
          await client.query(sql);
          await client.query("COMMIT");
        }

        await client.query(
          "INSERT INTO schema_migrations (filename) VALUES ($1) ON CONFLICT (filename) DO NOTHING",
          [filename]
        );
        console.log(`[db:push]   ✓ ${filename}`);
      } catch (err) {
        if (!needsNoTx) {
          await client.query("ROLLBACK").catch(() => {});
        }
        console.error(`[db:push]   ✗ ${filename}: ${err.message}`);
        throw new Error(`Migration failed [${filename}]: ${err.message}`);
      }
    }

    console.log(`[db:push]   ✓ ${pending.length} migration(s) applied.`);
  } finally {
    client.release();
  }
}

// ── Main ───────────────────────────────────────────────────────────────────
(async () => {
  let client;
  try {
    client = await pool.connect();
    await applySchema(client);
    client.release();
    client = null;

    await runMigrations(pool);

    console.log("\n[db:push] ✓ Database is up to date.\n");
  } catch (err) {
    console.error("\n[db:push] FAILED:", err.message, "\n");
    process.exit(1);
  } finally {
    if (client) client.release();
    await pool.end();
  }
})();
