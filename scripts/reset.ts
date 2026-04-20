/**
 * db:reset — wipe ALL data from every table, then re-push the Drizzle schema.
 *
 * Usage:
 *   npm run db:reset              # prompts for confirmation
 *   npm run db:reset -- --force   # skips the prompt (CI / scripts)
 *
 * After resetting you can reload demo data with:
 *   npm run db:seed
 */
import "dotenv/config";
import { pool } from "../server/db";
import * as readline from "readline";

const FORCE = process.argv.includes("--force");

async function confirm(): Promise<void> {
  if (FORCE) return;
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  return new Promise((resolve, reject) => {
    rl.question(
      "\n⚠️  This will permanently delete ALL data in the database.\nType 'yes' to continue, anything else to abort: ",
      (answer) => {
        rl.close();
        if (answer.trim().toLowerCase() === "yes") {
          resolve();
        } else {
          console.log("Aborted.");
          process.exit(0);
        }
      }
    );
  });
}

async function reset() {
  await confirm();

  console.log("\n🗑️  Resetting database...\n");

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // Truncate all tables in one statement. RESTART IDENTITY resets auto-increment
    // sequences. CASCADE handles every FK dependency automatically.
    await client.query(`
      TRUNCATE TABLE
        gift_card_transactions,
        intake_form_responses,
        loyalty_transactions,
        appointment_addons,
        drawer_actions,
        cash_drawer_sessions,
        google_review_responses,
        google_reviews,
        google_business_profiles,
        service_addons,
        staff_services,
        staff_availability,
        staff_settings,
        appointments,
        customers,
        staff,
        services,
        service_categories,
        addons,
        business_hours,
        calendar_settings,
        sms_log,
        sms_settings,
        mail_settings,
        stripe_settings,
        store_settings,
        permissions,
        roles,
        app,
        waitlist,
        gift_cards,
        intake_forms,
        intake_form_fields,
        pro_leads,
        seo_regions,
        password_reset_tokens,
        locations,
        sessions,
        users
      RESTART IDENTITY CASCADE
    `);

    await client.query("COMMIT");
    console.log("✅ All tables cleared.\n");
    console.log("  Run  npm run db:seed  to load demo data.");
    console.log("  Run  npm run db:push  to re-apply the Drizzle schema.\n");
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
    await pool.end();
  }

  process.exit(0);
}

reset().catch((err) => {
  console.error("Reset failed:", err);
  process.exit(1);
});
