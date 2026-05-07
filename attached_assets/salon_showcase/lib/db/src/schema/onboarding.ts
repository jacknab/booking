import { pgTable, serial, text, boolean, jsonb, timestamp, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

// ── Business hours shape stored as JSONB ─────────────────────────────────────
// { sun: { open: "09:00", close: "17:00", closed: true }, mon: { ... }, ... }

// ── onboarding_submissions ────────────────────────────────────────────────────
export const onboardingSubmissionsTable = pgTable("onboarding_submissions", {
  id:                   serial("id").primaryKey(),
  template_id:          text("template_id").notNull(),
  business_name:        text("business_name").notNull(),
  phone:                text("phone").notNull(),
  address_line1:        text("address_line1").notNull(),
  address_line2:        text("address_line2"),
  city:                 text("city").notNull(),
  county_state:         text("county_state"),
  postcode:             text("postcode").notNull(),
  country:              text("country").notNull().default("GB"),
  contact_email:        text("contact_email").notNull(),
  hours:                jsonb("hours").notNull(),
  booking_enabled:      boolean("booking_enabled").notNull().default(false),
  domain_type:          text("domain_type").notNull(),           // 'subdomain' | 'custom'
  subdomain:            text("subdomain"),                        // slug only, e.g. 'sophiessalon'
  custom_domain:        text("custom_domain"),                    // e.g. 'mysalon.co.uk'
  domain_payment_status: text("domain_payment_status").default("pending"), // 'pending' | 'paid'
  hero_image:           text("hero_image"),                        // filename from media library, e.g. 'luxury-nails-spa.jpg'
  plan:                 text("plan").notNull().default("free"),   // 'free' | 'subscriber'
  powered_by_certxa:    boolean("powered_by_certxa").notNull().default(true),
  status:               text("status").notNull().default("pending"),
  created_at:           timestamp("created_at").notNull().defaultNow(),
  updated_at:           timestamp("updated_at").notNull().defaultNow(),
});

export const insertOnboardingSchema = createInsertSchema(onboardingSubmissionsTable).omit({ id: true, created_at: true, updated_at: true });
export type InsertOnboarding = z.infer<typeof insertOnboardingSchema>;
export type Onboarding = typeof onboardingSubmissionsTable.$inferSelect;

// ── subdomains ────────────────────────────────────────────────────────────────
export const subdomainsTable = pgTable("subdomains", {
  id:             serial("id").primaryKey(),
  slug:           text("slug").notNull().unique(),
  submission_id:  integer("submission_id").references(() => onboardingSubmissionsTable.id),
  reserved_at:    timestamp("reserved_at").notNull().defaultNow(),
});

export const insertSubdomainSchema = createInsertSchema(subdomainsTable).omit({ id: true, reserved_at: true });
export type InsertSubdomain = z.infer<typeof insertSubdomainSchema>;
export type Subdomain = typeof subdomainsTable.$inferSelect;
