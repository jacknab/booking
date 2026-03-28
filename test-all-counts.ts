import "dotenv/config";
import { db } from "./server/db";
import { locations } from "@shared/schema";
import { count, eq } from "drizzle-orm";
import { users, appointments } from "@shared/schema";

async function testAll() {
  try {
    console.log("Testing all count queries...");
    
    const [storesResult] = await db.select({ value: count() }).from(locations);
    console.log("Stores:", storesResult?.value || 0);
    
    const [usersResult] = await db.select({ value: count() }).from(users);
    console.log("Users:", usersResult?.value || 0);
    
    const [appointmentsResult] = await db.select({ value: count() }).from(appointments);
    console.log("Appointments:", appointmentsResult?.value || 0);
    
    const [trialResult] = await db.select({ value: count() })
      .from(users)
      .where(eq(users.subscriptionStatus, 'trial'));
    console.log("Trial users:", trialResult?.value || 0);
    
    console.log("All counts successful!");
    
  } catch (error) {
    console.error("Error:", error);
  }
  process.exit(0);
}

testAll();
