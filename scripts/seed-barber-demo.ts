/**
 * seed-barber-demo.ts
 *
 * Barbershop demo account — uses the shared seed-demo-base.
 *
 * Account:  barber-demo@certxa.com  /  demo1234
 * Store:    Prime Cuts Barbershop  (Austin, TX)
 * Clients:  ~430  |  Appointments: ~2,900
 *
 * Run: npx tsx scripts/seed-barber-demo.ts
 */

import "dotenv/config";
import { pool } from "../server/db";
import { seedDemoAccount, pick, type SvcRef } from "./lib/seed-demo-base";

async function seed() {
  console.log("\n╔══════════════════════════════════════════════════════════╗");
  console.log("║       Prime Cuts Barbershop — Intelligence Demo Seed     ║");
  console.log("╚══════════════════════════════════════════════════════════╝\n");

  const summary = await seedDemoAccount({
    email:          "barber-demo@certxa.com",
    password:       "demo1234",
    ownerFirstName: "Marcus",
    ownerLastName:  "Williams",
    storeName:      "Prime Cuts Barbershop",
    storeCategory:  "Barbershop",
    storeAddress:   "5th St & Congress Ave, Suite 102",
    storeCity:      "Austin",
    storeState:     "TX",
    storePostcode:  "78701",
    storePhone:     "(512) 555-0471",
    storeEmail:     "hello@primecutsatx.com",
    bookingSlug:    "prime-cuts-barbershop-demo",
    timezone:       "America/Chicago",
    templateKey:    "Barbershop",
    clientGender:   "male",
    mondayClosed:   false,

    staffDefs: [
      { name: "Marcus Williams",  role: "owner",   color: "#7c3aed", rate: "45" },
      { name: "DeShawn Carter",   role: "barber",  color: "#ec4899", rate: "40" },
      { name: "Javier Ortega",    role: "barber",  color: "#f59e0b", rate: "38" },
      { name: "Tyler Brooks",     role: "barber",  color: "#10b981", rate: "36" },
      { name: "Isaiah Grant",     role: "barber",  color: "#3b82f6", rate: "35" },
    ],

    busyHour: () => pick([10, 11, 12, 13, 14, 15, 16, 17]),
    deadHour: () => pick([9, 18]),

    getArchetypePools: (svcList: SvcRef[]) => {
      const getSvc = (name: string) => svcList.find(s => s.name === name) ?? svcList[0];
      const mensHaircut     = getSvc("Men's Haircut");
      const skinFade        = getSvc("Skin Fade");
      const taperFade       = getSvc("Taper Fade");
      const beardTrim       = getSvc("Beard Trim");
      const hotTowelShave   = getSvc("Hot Towel Shave");
      const beardDesign     = getSvc("Beard Design");
      const buzzCut         = getSvc("Buzz Cut");

      // Look up combo — may be named differently
      const combo = svcList.find(s => s.name.toLowerCase().includes("combo")) ?? mensHaircut;

      return {
        // Fade clients — every 2–3 weeks like clockwork
        highFreqSvcs: [skinFade, skinFade, taperFade, mensHaircut, skinFade],
        // Combo clients — cut + beard on same visit
        medFreqSvcs:  [combo, skinFade, taperFade, mensHaircut, beardDesign],
        // Monthly beard maintenance or less frequent cuts
        monthlySvcs:  [mensHaircut, beardTrim, hotTowelShave, mensHaircut, beardTrim],
        // Occasional / walk-in style clients
        occSvcs:      [buzzCut, mensHaircut, beardTrim, mensHaircut, buzzCut],
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
