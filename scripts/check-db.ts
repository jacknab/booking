/**
 * db:check — verify every expected table exists and optionally repair missing ones.
 *
 * Usage:
 *   npm run db:check            # check only, exits 1 if anything is missing
 *   npm run db:check -- --fix   # check and auto-repair missing tables
 */
import "dotenv/config";
import { execSync } from "child_process";
import { pool } from "../server/db";

const FIX = process.argv.includes("--fix");

// ── Complete list of tables the app requires ──────────────────────────────────
// Drizzle-managed (shared/schema.ts + shared/models/auth.ts)
const DRIZZLE_TABLES = [
  "users",
  "sessions",
  "locations",
  "business_hours",
  "service_categories",
  "services",
  "addons",
  "service_addons",
  "appointment_addons",
  "staff",
  "staff_services",
  "staff_availability",
  "staff_settings",
  "customers",
  "appointments",
  "products",
  "cash_drawer_sessions",
  "drawer_actions",
  "calendar_settings",
  "sms_settings",
  "sms_log",
  "mail_settings",
  "stripe_settings",
  "permissions",
  "roles",
  "app",
  "store_settings",
  "google_business_profiles",
  "google_reviews",
  "google_review_responses",
  "password_reset_tokens",
  "waitlist",
  "gift_cards",
  "gift_card_transactions",
  "intake_forms",
  "intake_form_fields",
  "intake_form_responses",
  "loyalty_transactions",
  "pro_leads",
  "seo_regions",
  "reviews",
  "products",
  "pro_crews",
  "pro_crew_locations",
  "pro_customers",
  "pro_estimates",
  "pro_invoices",
  "pro_order_notes",
  "pro_service_orders",
] as const;

// Deduplicate (products appeared twice in schema scan)
const EXPECTED_TABLES = [...new Set(DRIZZLE_TABLES)];

// Sessions table DDL — connect-pg-simple schema
const SESSIONS_DDL = `
CREATE TABLE IF NOT EXISTS "sessions" (
  "sid"    varchar      NOT NULL COLLATE "default",
  "sess"   json         NOT NULL,
  "expire" timestamp(6) NOT NULL,
  CONSTRAINT "sessions_pkey" PRIMARY KEY ("sid") NOT DEFERRABLE INITIALLY IMMEDIATE
) WITH (OIDS=FALSE);
CREATE INDEX IF NOT EXISTS "IDX_session_expire" ON "sessions" ("expire");
`;

// ─────────────────────────────────────────────────────────────────────────────

const GREEN  = "\x1b[32m";
const RED    = "\x1b[31m";
const YELLOW = "\x1b[33m";
const CYAN   = "\x1b[36m";
const BOLD   = "\x1b[1m";
const RESET  = "\x1b[0m";

function ok(msg: string)   { console.log(`  ${GREEN}✔${RESET}  ${msg}`); }
function fail(msg: string) { console.log(`  ${RED}✘${RESET}  ${msg}`); }
function warn(msg: string) { console.log(`  ${YELLOW}⚠${RESET}  ${msg}`); }
function info(msg: string) { console.log(`  ${CYAN}→${RESET}  ${msg}`); }

async function checkDb() {
  console.log(`\n${BOLD}Certxa — Database Health Check${RESET}\n`);

  const client = await pool.connect();

  // ── 1. Connection test ──────────────────────────────────────────────────────
  try {
    const { rows } = await client.query("SELECT version()");
    ok(`Connected  (${rows[0].version.split(" ").slice(0, 2).join(" ")})`);
  } catch (err) {
    fail(`Cannot connect to database: ${(err as Error).message}`);
    client.release();
    await pool.end();
    process.exit(1);
  }

  // ── 2. Fetch existing tables ────────────────────────────────────────────────
  const { rows: existingRows } = await client.query<{ table_name: string }>(`
    SELECT table_name
    FROM information_schema.tables
    WHERE table_schema = 'public'
      AND table_type = 'BASE TABLE'
    ORDER BY table_name
  `);
  const existing = new Set(existingRows.map((r) => r.table_name));

  // ── 3. Compare against expected ─────────────────────────────────────────────
  console.log(`\n${BOLD}Tables (${EXPECTED_TABLES.length} expected):${RESET}\n`);

  const missing: string[] = [];
  for (const table of EXPECTED_TABLES) {
    if (existing.has(table)) {
      ok(table);
    } else {
      fail(`${RED}${table}${RESET}  ${RED}← MISSING${RESET}`);
      missing.push(table);
    }
  }

  // ── 4. Report extra tables (not in schema — might be fine) ─────────────────
  const expectedSet = new Set(EXPECTED_TABLES);
  const extra = [...existing].filter((t) => !expectedSet.has(t));
  if (extra.length > 0) {
    console.log(`\n${BOLD}Extra tables (not in Drizzle schema):${RESET}`);
    for (const t of extra) {
      warn(t);
    }
  }

  // ── 5. Summary ──────────────────────────────────────────────────────────────
  console.log();
  const total = EXPECTED_TABLES.length;
  const found = total - missing.length;

  if (missing.length === 0) {
    console.log(`${GREEN}${BOLD}All ${total} tables present. Database looks good.${RESET}\n`);
    client.release();
    await pool.end();
    process.exit(0);
  }

  console.log(
    `${RED}${BOLD}${missing.length} table(s) missing  |  ${found}/${total} present.${RESET}\n`
  );
  console.log(`  Missing: ${missing.join(", ")}\n`);

  // ── 6. Repair ───────────────────────────────────────────────────────────────
  if (!FIX) {
    info(`Run  ${BOLD}npm run db:check -- --fix${RESET}  to repair missing tables automatically.`);
    info(`Or run  ${BOLD}npm run db:push${RESET}  manually.\n`);
    client.release();
    await pool.end();
    process.exit(1);
  }

  console.log(`${YELLOW}${BOLD}--fix detected — repairing…${RESET}\n`);

  // 6a. Create sessions table directly (connect-pg-simple DDL, not via drizzle-kit)
  if (missing.includes("sessions")) {
    info("Creating sessions table…");
    try {
      await client.query(SESSIONS_DDL);
      ok("sessions table created.");
    } catch (err) {
      fail(`Failed to create sessions table: ${(err as Error).message}`);
    }
  }

  // 6b. Run drizzle-kit push for all other missing tables
  const drizzleMissing = missing.filter((t) => t !== "sessions");
  if (drizzleMissing.length > 0) {
    info(`Running drizzle-kit push to create: ${drizzleMissing.join(", ")}…`);
    try {
      execSync("./node_modules/.bin/drizzle-kit push --force", {
        stdio: "inherit",
        env: { ...process.env },
      });
      ok("drizzle-kit push complete.");
    } catch (err) {
      fail(`drizzle-kit push failed — check the output above.`);
      client.release();
      await pool.end();
      process.exit(1);
    }
  }

  // 6c. Re-verify after repair
  console.log(`\n${BOLD}Re-checking after repair…${RESET}\n`);
  const { rows: recheckRows } = await client.query<{ table_name: string }>(`
    SELECT table_name FROM information_schema.tables
    WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
  `);
  const nowExisting = new Set(recheckRows.map((r) => r.table_name));
  const stillMissing = missing.filter((t) => !nowExisting.has(t));

  if (stillMissing.length === 0) {
    console.log(`${GREEN}${BOLD}All tables now present. Repair successful.${RESET}\n`);
  } else {
    console.log(`${RED}${BOLD}Still missing after repair: ${stillMissing.join(", ")}${RESET}\n`);
    client.release();
    await pool.end();
    process.exit(1);
  }

  client.release();
  await pool.end();
  process.exit(0);
}

checkDb().catch((err) => {
  console.error("check-db failed:", err);
  process.exit(1);
});
