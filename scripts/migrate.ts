/**
 * scripts/migrate.ts
 *
 * Runs pending SQL migrations from the migrations/ directory in order.
 * Tracks applied migrations in a schema_migrations table so each file
 * only ever runs once — safe to call on every deploy or server startup.
 *
 * First-run behaviour on an existing database:
 *   If schema_migrations is empty AND core tables already exist, all current
 *   migration files are recorded as applied WITHOUT being re-run (baseline seed).
 *   Only migrations added after this baseline will actually execute.
 *
 * Usage:
 *   npm run migrate              # apply all pending migrations
 *   npm run migrate -- --dry-run # list pending without running
 */

import pg from "pg";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const MIGRATIONS_DIR = path.resolve(__dirname, "..", "migrations");
const DRY_RUN = process.argv.includes("--dry-run");

if (!process.env.DATABASE_URL) {
  console.error("[migrate] ERROR: DATABASE_URL is not set.");
  process.exit(1);
}

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });

async function ensureTrackingTable(client: pg.PoolClient): Promise<void> {
  await client.query(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      id         SERIAL PRIMARY KEY,
      filename   TEXT NOT NULL UNIQUE,
      applied_at TIMESTAMP NOT NULL DEFAULT NOW()
    )
  `);
}

async function getAppliedCount(client: pg.PoolClient): Promise<number> {
  const r = await client.query<{ count: string }>("SELECT COUNT(*) AS count FROM schema_migrations");
  return parseInt(r.rows[0].count, 10);
}

async function getApplied(client: pg.PoolClient): Promise<Set<string>> {
  const r = await client.query<{ filename: string }>("SELECT filename FROM schema_migrations");
  return new Set(r.rows.map((row) => row.filename));
}

async function dbHasCoreSchema(client: pg.PoolClient): Promise<boolean> {
  const r = await client.query<{ exists: boolean }>(`
    SELECT EXISTS (
      SELECT 1 FROM information_schema.tables
      WHERE table_schema = 'public' AND table_name = 'locations'
    ) AS exists
  `);
  return r.rows[0].exists;
}

function getMigrationFiles(): string[] {
  if (!fs.existsSync(MIGRATIONS_DIR)) return [];
  return fs
    .readdirSync(MIGRATIONS_DIR)
    .filter((f) => f.endsWith(".sql") && !f.startsWith("."))
    .sort();
}

async function seedBaseline(client: pg.PoolClient, files: string[]): Promise<void> {
  console.log(`[migrate] Seeding baseline — marking ${files.length} existing migration(s) as already applied.`);
  for (const filename of files) {
    await client.query(
      "INSERT INTO schema_migrations (filename) VALUES ($1) ON CONFLICT (filename) DO NOTHING",
      [filename]
    );
  }
}

async function runMigration(client: pg.PoolClient, filename: string): Promise<void> {
  const sql = fs.readFileSync(path.join(MIGRATIONS_DIR, filename), "utf-8").trim();
  if (!sql) {
    console.log(`[migrate]   SKIP  ${filename} (empty)`);
    return;
  }
  await client.query("BEGIN");
  try {
    await client.query(sql);
    await client.query(
      "INSERT INTO schema_migrations (filename) VALUES ($1) ON CONFLICT (filename) DO NOTHING",
      [filename]
    );
    await client.query("COMMIT");
    console.log(`[migrate]   ✓ Applied  ${filename}`);
  } catch (err: any) {
    await client.query("ROLLBACK");
    throw new Error(`Migration failed [${filename}]: ${err.message}`);
  }
}

async function main(): Promise<void> {
  const client = await pool.connect();
  try {
    await ensureTrackingTable(client);

    const allFiles = getMigrationFiles();
    const appliedCount = await getAppliedCount(client);

    // First-run on an existing database: seed the baseline so old migrations
    // aren't re-run against a schema that already has all their changes.
    if (appliedCount === 0 && await dbHasCoreSchema(client)) {
      if (DRY_RUN) {
        console.log(`[migrate] Dry run — would seed ${allFiles.length} file(s) as baseline.`);
        return;
      }
      await seedBaseline(client, allFiles);
      console.log("[migrate] ✓ Baseline seeded. Future migrations will run normally.");
      return;
    }

    const applied = await getApplied(client);
    const pending = allFiles.filter((f) => !applied.has(f));

    if (pending.length === 0) {
      console.log("[migrate] ✓ Database is up to date — no pending migrations.");
      return;
    }

    console.log(`[migrate] Found ${pending.length} pending migration(s):`);
    pending.forEach((f) => console.log(`  - ${f}`));

    if (DRY_RUN) {
      console.log("[migrate] Dry run — no changes made.");
      return;
    }

    for (const filename of pending) {
      await runMigration(client, filename);
    }

    console.log(`[migrate] ✓ All ${pending.length} migration(s) applied successfully.`);
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch((err) => {
  console.error("[migrate] FATAL:", err.message);
  process.exit(1);
});
