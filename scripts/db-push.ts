import { readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import pg from "pg";

const { Pool } = pg;

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

if (!process.env.DATABASE_URL) {
  console.error("[db:push] ERROR: DATABASE_URL is not set.");
  process.exit(1);
}

const schemaPath = join(__dirname, "..", "schema.sql");

let sql: string;
try {
  sql = readFileSync(schemaPath, "utf-8");
} catch {
  console.error(`[db:push] ERROR: Could not read schema.sql at ${schemaPath}`);
  process.exit(1);
}

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

console.log("[db:push] Applying schema.sql to database…");

try {
  const client = await pool.connect();
  try {
    await client.query(sql);
    console.log("[db:push] ✓ Schema applied successfully.");
  } finally {
    client.release();
  }
} catch (err: any) {
  console.error("[db:push] ERROR applying schema:", err.message);
  process.exit(1);
} finally {
  await pool.end();
}
