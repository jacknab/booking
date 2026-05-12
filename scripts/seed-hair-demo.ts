/**
 * seed-hair-demo.ts
 *
 * Hair Salon demo account — uses the shared seed-demo-base.
 *
 * Account:  hair-demo@certxa.com  /  demo1234
 * Store:    Elevate Hair Studio  (Austin, TX)
 * Clients:  ~430  |  Appointments: ~2,900
 *
 * Run: npx tsx scripts/seed-hair-demo.ts
 */

import "dotenv/config";
import { pool } from "../server/db";
import { seedDemoAccount, pick, rng, type SvcRef } from "./lib/seed-demo-base";

async function seed() {
  console.log("\n╔══════════════════════════════════════════════════════════╗");
  console.log("║       Elevate Hair Studio — Intelligence Demo Seed       ║");
  console.log("╚══════════════════════════════════════════════════════════╝\n");

  const summary = await seedDemoAccount({
    email:          "hair-demo@certxa.com",
    password:       "demo1234",
    ownerFirstName: "Lauren",
    ownerLastName:  "Simmons",
    storeName:      "Elevate Hair Studio",
    storeCategory:  "Hair Salon",
    storeAddress:   "1801 S Congress Ave, Suite 210",
    storeCity:      "Austin",
    storeState:     "TX",
    storePostcode:  "78704",
    storePhone:     "(512) 555-0241",
    storeEmail:     "hello@elevatehair.com",
    bookingSlug:    "elevate-hair-studio-demo",
    timezone:       "America/Chicago",
    templateKey:    "Hair Salon",
    clientGender:   "mixed",
    mondayClosed:   true,

    staffDefs: [
      { name: "Lauren Simmons",  role: "owner",   color: "#7c3aed", rate: "50" },
      { name: "Jade Martinez",   role: "stylist",  color: "#ec4899", rate: "45" },
      { name: "Chloe Nguyen",    role: "stylist",  color: "#f59e0b", rate: "42" },
      { name: "Rachel Ford",     role: "stylist",  color: "#10b981", rate: "40" },
      { name: "Tyler Banks",     role: "stylist",  color: "#3b82f6", rate: "38" },
    ],

    busyHour: () => pick([10, 11, 12, 13, 14, 15, 16]),
    deadHour: () => pick([9, 17, 18]),

    getArchetypePools: (svcList: SvcRef[]) => {
      const getSvc = (name: string) => svcList.find(s => s.name === name) ?? svcList[0];
      const rootTouchUp     = getSvc("Root Touch-Up");
      const fullColor       = getSvc("Full Color");
      const partialHighlights = getSvc("Highlights - Partial");
      const fullHighlights  = getSvc("Highlights - Full");
      const balayage        = getSvc("Balayage");
      const womensHaircut   = getSvc("Women's Haircut");
      const longHaircut     = getSvc("Long Hair Cut");
      const blowDry         = getSvc("Blow Dry & Style");
      const mensHaircut     = getSvc("Men's Haircut");
      const dryCut          = getSvc("Dry Cut");
      return {
        // Color clients come every 4–6 weeks (root touch-up, partial highlights)
        highFreqSvcs: [rootTouchUp, rootTouchUp, rootTouchUp, partialHighlights, fullColor],
        // Full-color + highlights clients — slightly less frequent
        medFreqSvcs:  [fullColor, fullHighlights, balayage, womensHaircut, partialHighlights],
        // Cut-only or blow-dry monthly regulars
        monthlySvcs:  [womensHaircut, blowDry, longHaircut, womensHaircut, blowDry],
        // Occasional or men's clients
        occSvcs:      [womensHaircut, mensHaircut, dryCut, blowDry, womensHaircut],
      };
    },
  });

  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("✅  Seed complete!\n");
  console.log(`  🏠 Store          : ${summary.storeName} (Austin, TX)`);
  console.log(`  📧 Login          : ${summary.email}`);
  console.log(`  🔑 Password       : ${summary.password}`);
  console.log(`  👥 Clients        : ${summary.clients}`);
  console.log(`  📅 Appointments   : ${summary.appointments}`);
  console.log(`  💰 Seeded revenue : $${summary.revenue.toLocaleString("en-US", { minimumFractionDigits: 2 })}`);
  console.log("\n  Next: Go to /intelligence/launch and press Launch Engines\n");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

  await pool.end();
  process.exit(0);
}

seed().catch(err => {
  console.error("\n❌ Seed failed:", err.message ?? err);
  process.exit(1);
});
