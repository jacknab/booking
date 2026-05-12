/**
 * reset-spa-demo.ts — removes the Serenity Spa & Wellness demo account.
 * Run: npx tsx scripts/reset-spa-demo.ts
 */
import "dotenv/config";
import { pool } from "../server/db";
import { resetDemoAccount } from "./lib/reset-demo-base";

console.log("\n╔══════════════════════════════════════════════════════════╗");
console.log("║     Serenity Spa & Wellness — Demo Reset                 ║");
console.log("╚══════════════════════════════════════════════════════════╝\n");

resetDemoAccount("spa-demo@certxa.com", "serenity-spa-wellness-demo")
  .then(async () => {
    await pool.end();
    console.log("\n✅  Reset complete — demo account fully removed.");
    console.log("   Run seed-spa-demo.ts to re-seed fresh demo data.\n");
    process.exit(0);
  })
  .catch(err => {
    console.error("\n❌ Reset failed:", err.message ?? err);
    process.exit(1);
  });
