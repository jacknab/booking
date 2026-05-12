/**
 * reset-barber-demo.ts — removes the Prime Cuts Barbershop demo account.
 * Run: npx tsx scripts/reset-barber-demo.ts
 */
import "dotenv/config";
import { pool } from "../server/db";
import { resetDemoAccount } from "./lib/reset-demo-base";

console.log("\n╔══════════════════════════════════════════════════════════╗");
console.log("║       Prime Cuts Barbershop — Demo Reset                 ║");
console.log("╚══════════════════════════════════════════════════════════╝\n");

resetDemoAccount("barber-demo@certxa.com", "prime-cuts-barbershop-demo")
  .then(async () => {
    await pool.end();
    console.log("\n✅  Reset complete — demo account fully removed.");
    console.log("   Run seed-barber-demo.ts to re-seed fresh demo data.\n");
    process.exit(0);
  })
  .catch(err => {
    console.error("\n❌ Reset failed:", err.message ?? err);
    process.exit(1);
  });
