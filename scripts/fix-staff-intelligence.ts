import "dotenv/config";
import { db } from "../server/db";
import { sql } from "drizzle-orm";

async function fix() {
  const check = await db.execute(
    sql`SELECT column_name FROM information_schema.columns 
        WHERE table_name='staff_intelligence' AND column_name='trend'`
  );
  console.log("trend rows found:", check.rows.length);

  if (check.rows.length === 0) {
    await db.execute(
      sql`ALTER TABLE staff_intelligence ADD COLUMN trend text NOT NULL DEFAULT 'stable'`
    );
    console.log("✅ trend column added to staff_intelligence");
  } else {
    console.log("ℹ️  trend column already exists");
  }

  // Also verify other expected columns
  const cols = await db.execute(
    sql`SELECT column_name FROM information_schema.columns 
        WHERE table_name='staff_intelligence' ORDER BY column_name`
  );
  console.log("All columns:", cols.rows.map((r: any) => r.column_name).join(", "));
  process.exit(0);
}

fix().catch(err => { console.error(err); process.exit(1); });
