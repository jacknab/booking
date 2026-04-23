/**
 * Phase 9.1 — manually create or refresh practice sandboxes.
 *
 * Usage:
 *   npx tsx scripts/seed-training-sandbox.ts                # all real stores
 *   npx tsx scripts/seed-training-sandbox.ts <storeId> ...  # specific stores
 *
 * For each parent store: ensure a sandbox exists, then wipe & reseed it
 * with 4 demo staff, ~20 services, 30 customers, ~40 appointments.
 */
import "dotenv/config";
import { db } from "../server/db";
import { locations } from "../shared/schema";
import { eq } from "drizzle-orm";
import { ensureSandboxForStore, resetSandboxData } from "../server/training/sandbox";

async function main() {
  const argIds = process.argv
    .slice(2)
    .map((s) => Number(s))
    .filter((n) => Number.isFinite(n) && n > 0);

  let parentIds: number[];
  if (argIds.length > 0) {
    parentIds = argIds;
  } else {
    const rows = await db
      .select({ id: locations.id })
      .from(locations)
      .where(eq(locations.isTrainingSandbox, false));
    parentIds = rows.map((r) => r.id);
  }

  if (parentIds.length === 0) {
    console.log("No real stores found. Nothing to do.");
    return;
  }

  for (const parentId of parentIds) {
    try {
      const sandboxId = await ensureSandboxForStore(parentId);
      await resetSandboxData(sandboxId);
      console.log(`✅ store ${parentId} → sandbox ${sandboxId} seeded.`);
    } catch (err) {
      console.error(`❌ store ${parentId} failed:`, err);
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
