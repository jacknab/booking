/**
 * seed-spa-demo.ts
 *
 * Spa / Wellness demo account — uses the shared seed-demo-base.
 *
 * Account:  spa-demo@certxa.com  /  demo1234
 * Store:    Serenity Spa & Wellness  (Austin, TX)
 * Clients:  ~430  |  Appointments: ~2,900
 *
 * Run: npx tsx scripts/seed-spa-demo.ts
 */

import "dotenv/config";
import { pool } from "../server/db";
import { seedDemoAccount, pick, type SvcRef } from "./lib/seed-demo-base";

async function seed() {
  console.log("\n╔══════════════════════════════════════════════════════════╗");
  console.log("║     Serenity Spa & Wellness — Intelligence Demo Seed     ║");
  console.log("╚══════════════════════════════════════════════════════════╝\n");

  const summary = await seedDemoAccount({
    email:          "spa-demo@certxa.com",
    password:       "demo1234",
    ownerFirstName: "Natalie",
    ownerLastName:  "Reeves",
    storeName:      "Serenity Spa & Wellness",
    storeCategory:  "Spa",
    storeAddress:   "3401 Esperanza Crossing, Suite 150",
    storeCity:      "Austin",
    storeState:     "TX",
    storePostcode:  "78758",
    storePhone:     "(512) 555-0388",
    storeEmail:     "hello@serenityspa.com",
    bookingSlug:    "serenity-spa-wellness-demo",
    timezone:       "America/Chicago",
    templateKey:    "Spa",
    clientGender:   "mixed",
    mondayClosed:   true,

    staffDefs: [
      { name: "Natalie Reeves",  role: "owner",     color: "#7c3aed", rate: "55" },
      { name: "Amara Singh",     role: "therapist",  color: "#ec4899", rate: "48" },
      { name: "Marcus Delgado",  role: "therapist",  color: "#f59e0b", rate: "45" },
      { name: "Fiona Walsh",     role: "esthetician",color: "#10b981", rate: "44" },
      { name: "Zoe Chambers",    role: "esthetician",color: "#3b82f6", rate: "40" },
    ],

    busyHour: () => pick([10, 11, 12, 13, 14, 15, 16]),
    deadHour: () => pick([9, 17, 18]),

    getArchetypePools: (svcList: SvcRef[]) => {
      const getSvc = (name: string) => svcList.find(s => s.name === name) ?? svcList[0];
      const swedish60     = getSvc("Swedish Massage - 60 min");
      const swedish90     = getSvc("Swedish Massage - 90 min");
      const deepTissue60  = getSvc("Deep Tissue Massage - 60 min");
      const deepTissue90  = getSvc("Deep Tissue Massage - 90 min");
      const hotStone      = getSvc("Hot Stone Massage");
      const classicFacial = getSvc("Classic Facial");
      const antiAgingFacial = getSvc("Anti-Aging Facial");
      const couples       = getSvc("Couples Massage");
      const sports        = getSvc("Sports Massage");
      const reflexology   = getSvc("Reflexology");
      return {
        // Dedicated massage clients — bi-weekly deep tissue / sports
        highFreqSvcs: [deepTissue60, deepTissue60, swedish60, sports, deepTissue90],
        // Regular wellness clients — monthly-ish massages and facials
        medFreqSvcs:  [swedish90, hotStone, classicFacial, swedish60, antiAgingFacial],
        // Monthly treat-yourself clients — longer sessions
        monthlySvcs:  [antiAgingFacial, swedish90, couples, hotStone, classicFacial],
        // Occasional / gifted sessions
        occSvcs:      [classicFacial, reflexology, swedish60, swedish60, swedish90],
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
