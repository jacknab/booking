import "dotenv/config";
import bcrypt from "bcryptjs";
import { db } from "../server/db";
import { users } from "../shared/models/auth";
import {
  locations,
  businessHours,
  staff,
  serviceCategories,
  services,
  addons,
  serviceAddons,
  customers,
  appointments,
} from "../shared/schema";
import { businessTemplates } from "../server/onboarding-data";
import { eq } from "drizzle-orm";

async function seed() {
  console.log("🌱 Seeding database...");

  // --- Clean up any previous seed data ---
  const existing = await db
    .select()
    .from(users)
    .where(eq(users.email, "demo@certxa.com"));
  if (existing.length > 0) {
    console.log("ℹ️  Demo data already exists — skipping.");
    process.exit(0);
  }

  // --- Demo user ---
  const hashedPw = await bcrypt.hash("demo1234", 10);
  const [owner] = await db
    .insert(users)
    .values({
      email: "demo@certxa.com",
      password: hashedPw,
      firstName: "Demo",
      lastName: "Owner",
      role: "admin",
      onboardingCompleted: true,
    })
    .returning();
  console.log(`✅ Created user: ${owner.email}`);

  // --- Store definitions ---
  const storeDefs = [
    {
      name: "Luxe Nail Studio",
      category: "Nail Salon",
      address: "123 Main St",
      city: "Austin",
      state: "TX",
      postcode: "78701",
      phone: "(512) 555-0101",
      email: "info@luxenail.com",
      bookingSlug: "luxe-nail-studio",
      timezone: "America/Chicago",
      staffNames: ["Emma Wilson", "Lily Chen", "Sofia Martinez"],
      template: "Nail Salon",
    },
    {
      name: "Uptown Hair Bar",
      category: "Hair Salon",
      address: "456 Oak Ave",
      city: "Austin",
      state: "TX",
      postcode: "78702",
      phone: "(512) 555-0202",
      email: "hello@uptownhair.com",
      bookingSlug: "uptown-hair-bar",
      timezone: "America/Chicago",
      staffNames: ["Jake Thompson", "Mia Rodriguez"],
      template: "Hair Salon",
    },
  ];

  for (const def of storeDefs) {
    // --- Create store ---
    const [store] = await db
      .insert(locations)
      .values({
        name: def.name,
        category: def.category,
        address: def.address,
        city: def.city,
        state: def.state,
        postcode: def.postcode,
        phone: def.phone,
        email: def.email,
        bookingSlug: def.bookingSlug,
        timezone: def.timezone,
        userId: owner.id,
        accountStatus: "Active",
      })
      .returning();
    console.log(`✅ Created store: ${store.name} (id=${store.id})`);

    // --- Business hours (Mon–Sat open, Sun closed) ---
    for (let day = 0; day < 7; day++) {
      await db.insert(businessHours).values({
        storeId: store.id,
        dayOfWeek: day,
        openTime: "09:00",
        closeTime: "18:00",
        isClosed: day === 0, // Sunday closed
      });
    }

    // --- Staff ---
    const staffColors = ["#3b82f6", "#10b981", "#f59e0b", "#ec4899", "#8b5cf6"];
    const createdStaff: number[] = [];
    for (let i = 0; i < def.staffNames.length; i++) {
      const [s] = await db
        .insert(staff)
        .values({
          name: def.staffNames[i],
          storeId: store.id,
          role: i === 0 ? "owner" : "stylist",
          color: staffColors[i % staffColors.length],
          commissionEnabled: true,
          commissionRate: "40",
        })
        .returning();
      createdStaff.push(s.id);
    }
    console.log(`  👤 Created ${createdStaff.length} staff members`);

    // --- Services from template (first 3 categories only to keep it concise) ---
    const template = businessTemplates[def.template];
    if (!template) continue;

    let serviceCount = 0;
    const categoriesToSeed = template.categories.slice(0, 3);
    for (const catDef of categoriesToSeed) {
      const [cat] = await db
        .insert(serviceCategories)
        .values({ name: catDef.name, storeId: store.id })
        .returning();

      for (const svcDef of catDef.services) {
        const [svc] = await db
          .insert(services)
          .values({
            name: svcDef.name,
            description: svcDef.description,
            duration: svcDef.duration,
            price: svcDef.price,
            category: catDef.name,
            categoryId: cat.id,
            storeId: store.id,
          })
          .returning();
        serviceCount++;

        // Seed up to 2 addons per service
        if (svcDef.addons) {
          for (const addonDef of svcDef.addons.slice(0, 2)) {
            const [addon] = await db
              .insert(addons)
              .values({
                name: addonDef.name,
                description: addonDef.description,
                price: addonDef.price,
                duration: addonDef.duration,
                storeId: store.id,
              })
              .returning();
            await db.insert(serviceAddons).values({
              serviceId: svc.id,
              addonId: addon.id,
            });
          }
        }
      }
    }
    console.log(`  💅 Created ${serviceCount} services across ${categoriesToSeed.length} categories`);

    // --- Sample customers ---
    const customerData = [
      { name: "Sarah Johnson", email: "sarah@example.com", phone: "(512) 555-1001" },
      { name: "Maria Garcia",  email: "maria@example.com", phone: "(512) 555-1002" },
      { name: "David Kim",     email: "david@example.com", phone: "(512) 555-1003" },
    ];
    const createdCustomers: number[] = [];
    for (const c of customerData) {
      const [cust] = await db
        .insert(customers)
        .values({ ...c, storeId: store.id, marketingOptIn: true })
        .returning();
      createdCustomers.push(cust.id);
    }

    // --- A few sample appointments (upcoming) ---
    const [firstService] = await db
      .select()
      .from(services)
      .where(eq(services.storeId, store.id))
      .limit(1);

    if (firstService && createdStaff.length && createdCustomers.length) {
      const today = new Date();
      for (let i = 0; i < 3; i++) {
        const apptDate = new Date(today);
        apptDate.setDate(today.getDate() + i + 1);
        apptDate.setHours(10 + i * 2, 0, 0, 0);
        await db.insert(appointments).values({
          date: apptDate,
          duration: firstService.duration,
          status: "confirmed",
          serviceId: firstService.id,
          staffId: createdStaff[i % createdStaff.length],
          customerId: createdCustomers[i % createdCustomers.length],
          storeId: store.id,
        });
      }
      console.log(`  📅 Created 3 upcoming appointments`);
    }
  }

  console.log("\n✅ Seed complete!");
  console.log("   Login: demo@certxa.com / demo1234");
  process.exit(0);
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
