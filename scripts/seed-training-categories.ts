import "dotenv/config";
import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import { trainingActionCategories, type InsertTrainingActionCategory } from "../shared/schema";

const CATEGORIES: InsertTrainingActionCategory[] = [
  { slug: "open-calendar",        title: "Open the calendar",                description: "Navigate to and read the daily calendar view.", defaultHelpLevel: 3, highRisk: false },
  { slug: "navigate-date",        title: "Navigate to a different date",     description: "Use Prev/Next or the date picker.",             defaultHelpLevel: 3, highRisk: false },
  { slug: "open-appointment",     title: "Open an appointment",              description: "Click an appointment to open its detail sheet.", defaultHelpLevel: 3, highRisk: false },
  { slug: "create-booking",       title: "Create a new booking",             description: "End-to-end new appointment creation.",          defaultHelpLevel: 3, highRisk: false },
  { slug: "pick-service",         title: "Pick a service",                   description: "Choose a service category and service card.",   defaultHelpLevel: 3, highRisk: false },
  { slug: "pick-staff",           title: "Choose staff for a booking",       description: "Use Any Staff or pick a specific staff member.", defaultHelpLevel: 3, highRisk: false },
  { slug: "pick-time-slot",       title: "Pick a time slot",                 description: "Select an available time on the chosen date.",  defaultHelpLevel: 3, highRisk: false },
  { slug: "attach-client",        title: "Attach a client to a booking",     description: "Search, create, or pick guest.",                defaultHelpLevel: 3, highRisk: false },
  { slug: "lookup-client-phone",  title: "Look up a client by phone",        description: "Use the numpad to look up a client.",           defaultHelpLevel: 3, highRisk: false },
  { slug: "create-new-client",    title: "Create a new client",              description: "Use the on-screen keyboard to add a new client.", defaultHelpLevel: 3, highRisk: false },
  { slug: "reschedule",           title: "Reschedule an appointment",        description: "Move an existing appointment to a new time.",    defaultHelpLevel: 3, highRisk: false },
  { slug: "walk-in",              title: "Book a walk-in",                   description: "Create a booking for a client who just arrived.", defaultHelpLevel: 3, highRisk: false },
  { slug: "pos-checkout",         title: "Check a client out at POS",        description: "Process payment and close the appointment.",     defaultHelpLevel: 3, highRisk: false },
  { slug: "apply-tip",            title: "Apply a tip",                      description: "Add a tip during checkout.",                    defaultHelpLevel: 3, highRisk: false },
  { slug: "apply-discount",       title: "Apply a discount",                 description: "Add a discount during checkout.",               defaultHelpLevel: 3, highRisk: false },
  { slug: "cancel-appointment",   title: "Cancel an appointment",            description: "Cancel and notify the client.",                  defaultHelpLevel: 3, highRisk: true  },
  { slug: "mark-no-show",         title: "Mark a client as no-show",         description: "Flag a client who didn't show up.",              defaultHelpLevel: 3, highRisk: true  },
  { slug: "day-close",            title: "Close out the day",                description: "Run end-of-day reconciliation.",                 defaultHelpLevel: 3, highRisk: true  },
  { slug: "refund",               title: "Refund a payment",                 description: "Process a partial or full refund.",              defaultHelpLevel: 3, highRisk: true  },
  { slug: "delete-client",        title: "Delete a client record",           description: "Permanently remove a client from the database.", defaultHelpLevel: 3, highRisk: true  },
];

async function main() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is not set");
  }
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const db = drizzle(pool);

  for (const cat of CATEGORIES) {
    await db
      .insert(trainingActionCategories)
      .values(cat)
      .onConflictDoUpdate({
        target: trainingActionCategories.slug,
        set: {
          title: cat.title,
          description: cat.description,
          defaultHelpLevel: cat.defaultHelpLevel,
          highRisk: cat.highRisk,
        },
      });
  }

  console.log(`Seeded ${CATEGORIES.length} training action categories.`);
  await pool.end();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
