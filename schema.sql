CREATE SCHEMA "public";
CREATE TABLE "addons" (
	"id" serial PRIMARY KEY,
	"name" text NOT NULL,
	"description" text,
	"price" numeric(10, 2) NOT NULL,
	"duration" integer NOT NULL,
	"image_url" text,
	"store_id" integer
);
CREATE TABLE "appointment_addons" (
	"id" serial PRIMARY KEY,
	"appointment_id" integer NOT NULL,
	"addon_id" integer NOT NULL
);
CREATE TABLE "appointments" (
	"id" serial PRIMARY KEY,
	"date" timestamp NOT NULL,
	"duration" integer NOT NULL,
	"status" text DEFAULT 'pending',
	"notes" text,
	"cancellation_reason" text,
	"payment_method" text,
	"tip_amount" numeric(10, 2),
	"discount_amount" numeric(10, 2),
	"total_paid" numeric(10, 2),
	"completed_at" timestamp,
	"service_id" integer,
	"staff_id" integer,
	"customer_id" integer,
	"store_id" integer
);
CREATE TABLE "business_hours" (
	"id" serial PRIMARY KEY,
	"store_id" integer NOT NULL,
	"day_of_week" integer NOT NULL,
	"open_time" text DEFAULT '09:00' NOT NULL,
	"close_time" text DEFAULT '17:00' NOT NULL,
	"is_closed" boolean DEFAULT false NOT NULL
);
CREATE TABLE "calendar_settings" (
	"id" serial PRIMARY KEY,
	"store_id" integer NOT NULL,
	"start_of_week" text DEFAULT 'monday' NOT NULL,
	"time_slot_interval" integer DEFAULT 15 NOT NULL,
	"non_working_hours_display" integer DEFAULT 1 NOT NULL,
	"allow_booking_outside_hours" boolean DEFAULT true NOT NULL,
	"auto_complete_appointments" boolean DEFAULT true NOT NULL
);
CREATE TABLE "cash_drawer_sessions" (
	"id" serial PRIMARY KEY,
	"store_id" integer NOT NULL,
	"opened_at" timestamp NOT NULL,
	"closed_at" timestamp,
	"opening_balance" numeric(10, 2) DEFAULT '0.00' NOT NULL,
	"closing_balance" numeric(10, 2),
	"denomination_breakdown" text,
	"status" text DEFAULT 'open' NOT NULL,
	"opened_by" text,
	"closed_by" text,
	"notes" text
);
CREATE TABLE "customers" (
	"id" serial PRIMARY KEY,
	"name" text NOT NULL,
	"email" text,
	"phone" text,
	"notes" text,
	"store_id" integer
);
CREATE TABLE "drawer_actions" (
	"id" serial PRIMARY KEY,
	"session_id" integer NOT NULL,
	"type" text NOT NULL,
	"amount" numeric(10, 2),
	"reason" text,
	"performed_by" text,
	"performed_at" timestamp NOT NULL
);
CREATE TABLE "products" (
	"id" serial PRIMARY KEY,
	"name" text NOT NULL,
	"brand" text,
	"price" numeric(10, 2) NOT NULL,
	"stock" integer DEFAULT 0,
	"category" text,
	"store_id" integer
);
CREATE TABLE "service_addons" (
	"id" serial PRIMARY KEY,
	"service_id" integer NOT NULL,
	"addon_id" integer NOT NULL
);
CREATE TABLE "service_categories" (
	"id" serial PRIMARY KEY,
	"name" text NOT NULL,
	"image_url" text,
	"store_id" integer
);
CREATE TABLE "services" (
	"id" serial PRIMARY KEY,
	"name" text NOT NULL,
	"description" text,
	"duration" integer NOT NULL,
	"price" numeric(10, 2) NOT NULL,
	"category" text NOT NULL,
	"category_id" integer,
	"image_url" text,
	"store_id" integer
);
CREATE TABLE "sessions" (
	"sid" varchar PRIMARY KEY,
	"sess" jsonb NOT NULL,
	"expire" timestamp NOT NULL
);
CREATE TABLE "sms_log" (
	"id" serial PRIMARY KEY,
	"store_id" integer NOT NULL,
	"appointment_id" integer,
	"customer_id" integer,
	"phone" text NOT NULL,
	"message_type" text NOT NULL,
	"message_body" text NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"twilio_sid" text,
	"error_message" text,
	"sent_at" timestamp NOT NULL
);
CREATE TABLE "sms_settings" (
	"id" serial PRIMARY KEY,
	"store_id" integer NOT NULL,
	"twilio_account_sid" text,
	"twilio_auth_token" text,
	"twilio_phone_number" text,
	"booking_confirmation_enabled" boolean DEFAULT false NOT NULL,
	"reminder_enabled" boolean DEFAULT false NOT NULL,
	"reminder_hours_before" integer DEFAULT 24 NOT NULL,
	"review_request_enabled" boolean DEFAULT false NOT NULL,
	"google_review_url" text,
	"confirmation_template" text DEFAULT 'Hi {customerName}, your appointment at {storeName} is confirmed for {appointmentDate} at {appointmentTime}. See you then!',
	"reminder_template" text DEFAULT 'Hi {customerName}, this is a reminder of your appointment at {storeName} tomorrow at {appointmentTime}. Reply STOP to opt out.',
	"review_template" text DEFAULT 'Hi {customerName}, thank you for visiting {storeName}! We''d love your feedback. Leave us a review: {reviewUrl}'
);
CREATE TABLE "staff" (
	"id" serial PRIMARY KEY,
	"name" text NOT NULL,
	"email" text,
	"phone" text,
	"role" text DEFAULT 'stylist',
	"bio" text,
	"color" text DEFAULT '#3b82f6',
	"avatar_url" text,
	"commission_enabled" boolean DEFAULT false,
	"commission_rate" numeric(5, 2) DEFAULT '0',
	"store_id" integer
);
CREATE TABLE "staff_availability" (
	"id" serial PRIMARY KEY,
	"staff_id" integer NOT NULL,
	"day_of_week" integer NOT NULL,
	"start_time" text NOT NULL,
	"end_time" text NOT NULL
);
CREATE TABLE "staff_services" (
	"id" serial PRIMARY KEY,
	"staff_id" integer NOT NULL,
	"service_id" integer NOT NULL
);
CREATE TABLE "stores" (
	"id" serial PRIMARY KEY,
	"name" text NOT NULL,
	"timezone" text DEFAULT 'UTC' NOT NULL,
	"address" text,
	"phone" text,
	"email" text,
	"category" text,
	"city" text,
	"state" text,
	"postcode" text,
	"booking_slug" text CONSTRAINT "stores_booking_slug_unique" UNIQUE,
	"commission_payout_frequency" text DEFAULT 'monthly',
	"user_id" text
);
CREATE TABLE "users" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid(),
	"email" varchar NOT NULL CONSTRAINT "users_email_unique" UNIQUE,
	"password" varchar NOT NULL,
	"first_name" varchar,
	"last_name" varchar,
	"profile_image_url" varchar,
	"onboarding_completed" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
ALTER TABLE "addons" ADD CONSTRAINT "addons_store_id_stores_id_fk" FOREIGN KEY ("store_id") REFERENCES "stores"("id");
ALTER TABLE "appointment_addons" ADD CONSTRAINT "appointment_addons_addon_id_addons_id_fk" FOREIGN KEY ("addon_id") REFERENCES "addons"("id");
ALTER TABLE "appointment_addons" ADD CONSTRAINT "appointment_addons_appointment_id_appointments_id_fk" FOREIGN KEY ("appointment_id") REFERENCES "appointments"("id");
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_customer_id_customers_id_fk" FOREIGN KEY ("customer_id") REFERENCES "customers"("id");
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_service_id_services_id_fk" FOREIGN KEY ("service_id") REFERENCES "services"("id");
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_staff_id_staff_id_fk" FOREIGN KEY ("staff_id") REFERENCES "staff"("id");
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_store_id_stores_id_fk" FOREIGN KEY ("store_id") REFERENCES "stores"("id");
ALTER TABLE "business_hours" ADD CONSTRAINT "business_hours_store_id_stores_id_fk" FOREIGN KEY ("store_id") REFERENCES "stores"("id");
ALTER TABLE "calendar_settings" ADD CONSTRAINT "calendar_settings_store_id_stores_id_fk" FOREIGN KEY ("store_id") REFERENCES "stores"("id");
ALTER TABLE "cash_drawer_sessions" ADD CONSTRAINT "cash_drawer_sessions_store_id_stores_id_fk" FOREIGN KEY ("store_id") REFERENCES "stores"("id");
ALTER TABLE "customers" ADD CONSTRAINT "customers_store_id_stores_id_fk" FOREIGN KEY ("store_id") REFERENCES "stores"("id");
ALTER TABLE "drawer_actions" ADD CONSTRAINT "drawer_actions_session_id_cash_drawer_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "cash_drawer_sessions"("id");
ALTER TABLE "products" ADD CONSTRAINT "products_store_id_stores_id_fk" FOREIGN KEY ("store_id") REFERENCES "stores"("id");
ALTER TABLE "service_addons" ADD CONSTRAINT "service_addons_addon_id_addons_id_fk" FOREIGN KEY ("addon_id") REFERENCES "addons"("id");
ALTER TABLE "service_addons" ADD CONSTRAINT "service_addons_service_id_services_id_fk" FOREIGN KEY ("service_id") REFERENCES "services"("id");
ALTER TABLE "service_categories" ADD CONSTRAINT "service_categories_store_id_stores_id_fk" FOREIGN KEY ("store_id") REFERENCES "stores"("id");
ALTER TABLE "services" ADD CONSTRAINT "services_category_id_service_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "service_categories"("id");
ALTER TABLE "services" ADD CONSTRAINT "services_store_id_stores_id_fk" FOREIGN KEY ("store_id") REFERENCES "stores"("id");
ALTER TABLE "sms_log" ADD CONSTRAINT "sms_log_appointment_id_appointments_id_fk" FOREIGN KEY ("appointment_id") REFERENCES "appointments"("id");
ALTER TABLE "sms_log" ADD CONSTRAINT "sms_log_customer_id_customers_id_fk" FOREIGN KEY ("customer_id") REFERENCES "customers"("id");
ALTER TABLE "sms_log" ADD CONSTRAINT "sms_log_store_id_stores_id_fk" FOREIGN KEY ("store_id") REFERENCES "stores"("id");
ALTER TABLE "sms_settings" ADD CONSTRAINT "sms_settings_store_id_stores_id_fk" FOREIGN KEY ("store_id") REFERENCES "stores"("id");
ALTER TABLE "staff" ADD CONSTRAINT "staff_store_id_stores_id_fk" FOREIGN KEY ("store_id") REFERENCES "stores"("id");
ALTER TABLE "staff_availability" ADD CONSTRAINT "staff_availability_staff_id_staff_id_fk" FOREIGN KEY ("staff_id") REFERENCES "staff"("id");
ALTER TABLE "staff_services" ADD CONSTRAINT "staff_services_service_id_services_id_fk" FOREIGN KEY ("service_id") REFERENCES "services"("id");
ALTER TABLE "staff_services" ADD CONSTRAINT "staff_services_staff_id_staff_id_fk" FOREIGN KEY ("staff_id") REFERENCES "staff"("id");
ALTER TABLE "stores" ADD CONSTRAINT "stores_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id");
CREATE UNIQUE INDEX "addons_pkey" ON "addons" ("id");
CREATE UNIQUE INDEX "appointment_addons_pkey" ON "appointment_addons" ("id");
CREATE UNIQUE INDEX "appointments_pkey" ON "appointments" ("id");
CREATE UNIQUE INDEX "business_hours_pkey" ON "business_hours" ("id");
CREATE UNIQUE INDEX "calendar_settings_pkey" ON "calendar_settings" ("id");
CREATE UNIQUE INDEX "cash_drawer_sessions_pkey" ON "cash_drawer_sessions" ("id");
CREATE UNIQUE INDEX "customers_pkey" ON "customers" ("id");
CREATE UNIQUE INDEX "drawer_actions_pkey" ON "drawer_actions" ("id");
CREATE UNIQUE INDEX "products_pkey" ON "products" ("id");
CREATE UNIQUE INDEX "service_addons_pkey" ON "service_addons" ("id");
CREATE UNIQUE INDEX "service_categories_pkey" ON "service_categories" ("id");
CREATE UNIQUE INDEX "services_pkey" ON "services" ("id");
CREATE INDEX "IDX_session_expire" ON "sessions" ("expire");
CREATE UNIQUE INDEX "sessions_pkey" ON "sessions" ("sid");
CREATE UNIQUE INDEX "sms_log_pkey" ON "sms_log" ("id");
CREATE UNIQUE INDEX "sms_settings_pkey" ON "sms_settings" ("id");
CREATE UNIQUE INDEX "staff_pkey" ON "staff" ("id");
CREATE UNIQUE INDEX "staff_availability_pkey" ON "staff_availability" ("id");
CREATE UNIQUE INDEX "staff_services_pkey" ON "staff_services" ("id");
CREATE UNIQUE INDEX "stores_booking_slug_unique" ON "stores" ("booking_slug");
CREATE UNIQUE INDEX "stores_pkey" ON "stores" ("id");
CREATE UNIQUE INDEX "users_email_unique" ON "users" ("email");
CREATE UNIQUE INDEX "users_pkey" ON "users" ("id");