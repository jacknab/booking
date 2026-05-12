/**
 * reset-hair-demo.ts — removes the Elevate Hair Studio demo account.
 * Run: npx tsx scripts/reset-hair-demo.ts
 */
import "dotenv/config";
import { pool } from "../server/db";
import { resetDemoAccount } from "./lib/reset-demo-base";

console.log("\n╔══════════════════════════════════════════════════════════╗");
console.log("║       Elevate Hair Studio — Demo Reset                   ║");
console.log("╚══════════════════════════════════════════════════════════╝\n");

resetDemoAccount("hair-demo@certxa.com", "elevate-hair-studio-demo")
  .then(async () => {
    await pool.end();
    console.log("\n✅  Reset complete — demo account fully removed.");
    console.log("   Run seed-hair-demo.ts to re-seed fresh demo data.\n");
    process.exit(0);
  })
  .catch(err => {
    console.error("\n❌ Reset failed:", err.message ?? err);
    process.exit(1);
  });
