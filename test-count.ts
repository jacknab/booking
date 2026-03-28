import "dotenv/config";
import { db } from "./server/db";
import { locations } from "@shared/schema";
import { count } from "drizzle-orm";
import { users, appointments } from "@shared/schema";

async function testCount() {
  try {
    console.log("Testing count query...");
    
    const result = await db.select({ value: count() }).from(locations);
    console.log("Raw result:", result);
    console.log("Count result:", result[0]);
    
    const usersResult = await db.select({ value: count() }).from(users);
    console.log("Users count result:", usersResult[0]);
    
  } catch (error) {
    console.error("Error:", error);
  }
  process.exit(0);
}

testCount();
