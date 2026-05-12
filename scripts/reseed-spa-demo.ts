/**
 * reseed-spa-demo.ts — wipe + reseed Serenity Spa & Wellness in one step.
 * Run: npx tsx scripts/reseed-spa-demo.ts
 */
import { execSync } from "child_process";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const tsx  = path.join(root, "node_modules/.bin/tsx");

function run(label: string, script: string) {
  console.log(`\n${"─".repeat(60)}\n▶  ${label}\n${"─".repeat(60)}`);
  execSync(`${tsx} ${script}`, { cwd: root, stdio: "inherit", env: { ...process.env } });
}

console.log("\n╔══════════════════════════════════════════════════════════╗");
console.log("║  Serenity Spa & Wellness — Reseed (Reset + Seed)         ║");
console.log("╚══════════════════════════════════════════════════════════╝");

try { run("Step 1/2 — Reset", path.join(__dirname, "reset-spa-demo.ts")); } catch { /* nothing to delete */ }
run("Step 2/2 — Seed fresh data", path.join(__dirname, "seed-spa-demo.ts"));

console.log("\n✅  Reseed complete — Serenity Spa & Wellness is ready.");
console.log("   Login: spa-demo@certxa.com  /  demo1234\n");
