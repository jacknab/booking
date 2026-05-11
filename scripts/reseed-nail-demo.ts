/**
 * reseed-nail-demo.ts
 *
 * Combined reset + seed in one step.
 * Wipes the existing Luxe Nails & Spa demo account and re-seeds fresh data.
 *
 * Account:  nail-demo@certxa.com  /  demo1234
 * Store:    Luxe Nails & Spa  (Austin, TX)
 *
 * Run: npm run db:reseed:nail-demo
 */

import { execSync } from "child_process";
import { fileURLToPath } from "url";
import path from "path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root      = path.resolve(__dirname, "..");
const tsx       = path.join(root, "node_modules/.bin/tsx");

function run(label: string, script: string) {
  console.log(`\n${"─".repeat(60)}`);
  console.log(`▶  ${label}`);
  console.log("─".repeat(60));
  execSync(`${tsx} ${script}`, {
    cwd: root,
    stdio: "inherit",
    env: { ...process.env },
  });
}

console.log("\n╔══════════════════════════════════════════════════════════╗");
console.log("║       Luxe Nails & Spa — Reseed (Reset + Seed)          ║");
console.log("╚══════════════════════════════════════════════════════════╝");

try {
  run("Step 1/2 — Reset demo account", path.join(__dirname, "reset-nail-demo.ts"));
} catch {
  // reset exits with 0 when there's nothing to delete — that's fine
}

run("Step 2/2 — Seed fresh demo data", path.join(__dirname, "seed-nail-demo.ts"));

console.log("\n✅  Reseed complete — Luxe Nails & Spa is ready.");
console.log("   Login: nail-demo@certxa.com  /  demo1234\n");
