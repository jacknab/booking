/**
 * Billing Plan Seeder
 * -------------------
 * Run:  npx tsx scripts/seed-billing-plans.ts
 *
 * Seeds the `billing_plans` table with Certxa's standard subscription tiers.
 * Safe to re-run — uses ON CONFLICT DO UPDATE so existing plans are updated,
 * not duplicated.
 *
 * After seeding, set each plan's stripe_price_id either:
 *   a) Manually via the Admin → Billing → Plans editor UI
 *   b) By running the Stripe price-sync (scripts/sync-stripe-prices.ts)
 */

import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { sql } from "drizzle-orm";
import { billingPlans } from "../shared/schema/billing";
import * as dotenv from "dotenv";

dotenv.config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const db = drizzle(pool);

// ─── Plan Definitions ─────────────────────────────────────────────────────────
//
// priceCents: monthly price in US cents (e.g. 4900 = $49.00/month)
// smsCredits: included SMS messages per billing period
// contactsMin / contactsMax: seat / contact range for this tier (null = unlimited)
// featuresJson: free-form feature list shown in the pricing UI

const PLANS = [
  {
    code: "free",
    name: "Free",
    description: "Try Certxa with no credit card required.",
    priceCents: "0",
    contactsMin: "0",
    contactsMax: "50",
    interval: "month",
    smsCredits: "0",
    currency: "usd",
    active: true,
    featuresJson: {
      features: [
        "Up to 50 contacts",
        "1 location",
        "Basic appointment booking",
        "Certxa-branded booking page",
      ],
      highlight: false,
    },
  },
  {
    code: "starter",
    name: "Starter",
    description: "Everything you need to run a growing salon.",
    priceCents: "1900",
    contactsMin: null,
    contactsMax: null,
    interval: "month",
    smsCredits: "200",
    currency: "usd",
    active: true,
    featuresJson: {
      features: [
        "Up to 500 contacts",
        "1 location",
        "Online booking & POS",
        "200 SMS credits / month",
        "Email reminders",
        "Basic analytics",
      ],
      highlight: false,
    },
  },
  {
    code: "professional",
    name: "Professional",
    description: "Advanced tools for established salons.",
    priceCents: "3900",
    contactsMin: null,
    contactsMax: null,
    interval: "month",
    smsCredits: "750",
    currency: "usd",
    active: true,
    featuresJson: {
      features: [
        "Up to 2,500 contacts",
        "Up to 3 locations",
        "Everything in Starter",
        "750 SMS credits / month",
        "Loyalty program",
        "Gift cards",
        "Staff performance reports",
        "Google Reviews integration",
        "Client intake forms",
      ],
      highlight: true,
      badge: "Most Popular",
    },
  },
  {
    code: "growth",
    name: "Growth",
    description: "For high-volume salons scaling fast.",
    priceCents: "19900",
    contactsMin: null,
    contactsMax: null,
    interval: "month",
    smsCredits: "2000",
    currency: "usd",
    active: true,
    featuresJson: {
      features: [
        "Up to 10,000 contacts",
        "Up to 10 locations",
        "Everything in Professional",
        "2,000 SMS credits / month",
        "Certxa Queue virtual check-in",
        "Advanced analytics & exports",
        "Priority support",
        "Team permissions",
      ],
      highlight: false,
    },
  },
  {
    code: "enterprise",
    name: "Enterprise",
    description: "Custom pricing for franchise & multi-location groups.",
    priceCents: "39900",
    contactsMin: null,
    contactsMax: null,
    interval: "month",
    smsCredits: "10000",
    currency: "usd",
    active: true,
    featuresJson: {
      features: [
        "Unlimited contacts",
        "Unlimited locations",
        "Everything in Growth",
        "10,000 SMS credits / month",
        "Dedicated onboarding",
        "SLA & uptime guarantee",
        "Custom integrations",
        "White-label booking page",
      ],
      highlight: false,
    },
  },
];

// ─── Annual variants (20% discount) ──────────────────────────────────────────

function buildAnnualVariant(plan: typeof PLANS[0]) {
  if (plan.code === "free") return null; // No annual free tier
  const monthlyPrice = Number(plan.priceCents);
  const annualMonthlyEquivalent = Math.round(monthlyPrice * 0.8); // 20% off
  return {
    ...plan,
    code: `${plan.code}_annual`,
    name: `${plan.name} (Annual)`,
    description: `${plan.description} Save 20% with annual billing.`,
    priceCents: String(annualMonthlyEquivalent * 12), // charged once per year
    interval: "year",
    featuresJson: {
      ...(plan.featuresJson as any),
      badge: "Save 20%",
    },
  };
}

async function seed() {
  console.log("🌱 Seeding billing plans...\n");

  const allPlans = [
    ...PLANS,
    ...PLANS.map(buildAnnualVariant).filter(Boolean),
  ] as typeof PLANS;

  let created = 0;
  let updated = 0;

  for (const plan of allPlans) {
    const result = await db
      .insert(billingPlans)
      .values({
        code: plan.code,
        name: plan.name,
        description: plan.description,
        priceCents: plan.priceCents,
        contactsMin: plan.contactsMin ?? null,
        contactsMax: plan.contactsMax ?? null,
        interval: plan.interval,
        smsCredits: plan.smsCredits,
        currency: plan.currency,
        active: plan.active,
        featuresJson: plan.featuresJson,
      })
      .onConflictDoUpdate({
        target: billingPlans.code,
        set: {
          name: sql`excluded.name`,
          description: sql`excluded.description`,
          priceCents: sql`excluded.price_cents`,
          contactsMin: sql`excluded.contacts_min`,
          contactsMax: sql`excluded.contacts_max`,
          interval: sql`excluded.interval`,
          smsCredits: sql`excluded.sms_credits`,
          featuresJson: sql`excluded.features_json`,
          updatedAt: new Date(),
        },
      })
      .returning({ id: billingPlans.id, code: billingPlans.code });

    const row = result[0];
    const wasCreated = !!(result as any)._inserted;

    console.log(`  ✓ ${plan.code.padEnd(25)} ${plan.name} — $${(Number(plan.priceCents) / 100).toFixed(2)}/${plan.interval}`);
    updated++;
  }

  console.log(`\n✅ Done. ${allPlans.length} plans seeded (upserted).`);
  console.log("\n📌 Next steps:");
  console.log("   1. Log into the Certxa admin → Billing → Plans");
  console.log("   2. For each plan, paste in the Stripe Price ID from your Stripe dashboard");
  console.log("   3. Set STRIPE_SECRET_KEY in your environment secrets");
  console.log("   4. Configure STRIPE_WEBHOOK_SECRET after setting up the webhook endpoint\n");

  await pool.end();
}

seed().catch((err) => {
  console.error("❌ Seed failed:", err);
  pool.end();
  process.exit(1);
});
