import { db } from "../server/db";
import { users } from "@shared/models/auth";
import bcrypt from "bcryptjs";
import { sql } from "drizzle-orm";

const ADMIN_EMAIL = "admin@certxa.com";
const ADMIN_PASSWORD = "Admin@123456";

async function createAdminUser() {
  try {
    // Check if admin already exists by raw query since our select might have issues
    const existing: any = await db.execute(
      sql`SELECT id FROM users WHERE email = ${ADMIN_EMAIL}`
    );
    
    if (existing && existing.rows && existing.rows.length > 0) {
      console.log(`✓ Admin user already exists: ${ADMIN_EMAIL}`);
      console.log(`\n📧 Email: ${ADMIN_EMAIL}`);
      console.log(`🔐 Password: ${ADMIN_PASSWORD}`);
      return;
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 10);

    // Create the admin user directly
    const result: any = await db.execute(
      sql`INSERT INTO users (email, password, first_name, last_name, onboarding_completed) 
           VALUES (${ADMIN_EMAIL}, ${hashedPassword}, 'Admin', 'User', false)
           RETURNING id, email`
    );

    if (result && result.rows && result.rows.length > 0) {
      console.log(`✓ Admin user created successfully!`);
      console.log(`\n📧 Email: ${ADMIN_EMAIL}`);
      console.log(`🔐 Password: ${ADMIN_PASSWORD}`);
      console.log(`\n✓ Login at: http://localhost:5005/auth`);
    } else {
      console.log(`✗ Failed to create admin user`);
    }
  } catch (error) {
    console.error("Error creating admin user:", error);
    process.exit(1);
  }
}

createAdminUser().then(() => {
  console.log("\n✓ Done!");
  process.exit(0);
});
