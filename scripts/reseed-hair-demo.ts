/**
 * reseed-hair-demo.ts — wipe + reseed Elevate Hair Studio in one step.
 * Run: npx tsx scripts/reseed-hair-demo.ts
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
console.log("║    Elevate Hair Studio — Reseed (Reset + Seed)           ║");
console.log("╚══════════════════════════════════════════════════════════╝");

try { run("Step 1/2 — Reset", path.join(__dirname, "reset-hair-demo.ts")); } catch { /* nothing to delete */ }
run("Step 2/2 — Seed fresh data", path.join(__dirname, "seed-hair-demo.ts"));

console.log("\n✅  Reseed complete — Elevate Hair Studio is ready.");
console.log("   Login: hair-demo@certxa.com  /  demo1234\n");
