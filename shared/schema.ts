import { pgTable, text, serial, integer, boolean, timestamp, decimal } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

export * from "./models/auth";
import { users } from "./models/auth";

// === TABLE DEFINITIONS ===

export const stores = pgTable("stores", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  timezone: text("timezone").notNull().default("UTC"),
  address: text("address"),
  phone: text("phone"),
  email: text("email"),
  category: text("category"),
  city: text("city"),
  postcode: text("postcode"),
  commissionPayoutFrequency: text("commission_payout_frequency").default("monthly"),
});

export const businessHours = pgTable("business_hours", {
  id: serial("id").primaryKey(),
  storeId: integer("store_id").references(() => stores.id).notNull(),
  dayOfWeek: integer("day_of_week").notNull(),
  openTime: text("open_time").notNull().default("09:00"),
  closeTime: text("close_time").notNull().default("17:00"),
  isClosed: boolean("is_closed").notNull().default(false),
});

export const serviceCategories = pgTable("service_categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  storeId: integer("store_id").references(() => stores.id),
});

export const services = pgTable("services", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  duration: integer("duration").notNull(),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  category: text("category").notNull(),
  categoryId: integer("category_id").references(() => serviceCategories.id),
  imageUrl: text("image_url"),
  storeId: integer("store_id").references(() => stores.id),
});

export const addons = pgTable("addons", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  duration: integer("duration").notNull(),
  imageUrl: text("image_url"),
  storeId: integer("store_id").references(() => stores.id),
});

export const serviceAddons = pgTable("service_addons", {
  id: serial("id").primaryKey(),
  serviceId: integer("service_id").references(() => services.id).notNull(),
  addonId: integer("addon_id").references(() => addons.id).notNull(),
});

export const appointmentAddons = pgTable("appointment_addons", {
  id: serial("id").primaryKey(),
  appointmentId: integer("appointment_id").references(() => appointments.id).notNull(),
  addonId: integer("addon_id").references(() => addons.id).notNull(),
});

export const staff = pgTable("staff", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email"),
  phone: text("phone"),
  role: text("role").default("stylist"),
  bio: text("bio"),
  color: text("color").default("#3b82f6"),
  avatarUrl: text("avatar_url"),
  commissionEnabled: boolean("commission_enabled").default(false),
  commissionRate: decimal("commission_rate", { precision: 5, scale: 2 }).default("0"),
  storeId: integer("store_id").references(() => stores.id),
});

export const staffServices = pgTable("staff_services", {
  id: serial("id").primaryKey(),
  staffId: integer("staff_id").references(() => staff.id).notNull(),
  serviceId: integer("service_id").references(() => services.id).notNull(),
});

export const staffAvailability = pgTable("staff_availability", {
  id: serial("id").primaryKey(),
  staffId: integer("staff_id").references(() => staff.id).notNull(),
  dayOfWeek: integer("day_of_week").notNull(),
  startTime: text("start_time").notNull(),
  endTime: text("end_time").notNull(),
});

export const customers = pgTable("customers", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email"),
  phone: text("phone"),
  notes: text("notes"),
  storeId: integer("store_id").references(() => stores.id),
});

export const appointments = pgTable("appointments", {
  id: serial("id").primaryKey(),
  date: timestamp("date").notNull(),
  duration: integer("duration").notNull(),
  status: text("status").default("pending"),
  notes: text("notes"),
  cancellationReason: text("cancellation_reason"),
  paymentMethod: text("payment_method"),
  tipAmount: decimal("tip_amount", { precision: 10, scale: 2 }),
  discountAmount: decimal("discount_amount", { precision: 10, scale: 2 }),
  totalPaid: decimal("total_paid", { precision: 10, scale: 2 }),
  serviceId: integer("service_id").references(() => services.id),
  staffId: integer("staff_id").references(() => staff.id),
  customerId: integer("customer_id").references(() => customers.id),
  storeId: integer("store_id").references(() => stores.id),
});

export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  brand: text("brand"),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  stock: integer("stock").default(0),
  category: text("category"),
  storeId: integer("store_id").references(() => stores.id),
});

export const cashDrawerSessions = pgTable("cash_drawer_sessions", {
  id: serial("id").primaryKey(),
  storeId: integer("store_id").references(() => stores.id).notNull(),
  openedAt: timestamp("opened_at").notNull(),
  closedAt: timestamp("closed_at"),
  openingBalance: decimal("opening_balance", { precision: 10, scale: 2 }).notNull().default("0.00"),
  closingBalance: decimal("closing_balance", { precision: 10, scale: 2 }),
  denominationBreakdown: text("denomination_breakdown"),
  status: text("status").notNull().default("open"),
  openedBy: text("opened_by"),
  closedBy: text("closed_by"),
  notes: text("notes"),
});

export const calendarSettings = pgTable("calendar_settings", {
  id: serial("id").primaryKey(),
  storeId: integer("store_id").references(() => stores.id).notNull(),
  startOfWeek: text("start_of_week").notNull().default("monday"),
  timeSlotInterval: integer("time_slot_interval").notNull().default(15),
  nonWorkingHoursDisplay: integer("non_working_hours_display").notNull().default(1),
  allowBookingOutsideHours: boolean("allow_booking_outside_hours").notNull().default(true),
  autoCompleteAppointments: boolean("auto_complete_appointments").notNull().default(true),
});

export const drawerActions = pgTable("drawer_actions", {
  id: serial("id").primaryKey(),
  sessionId: integer("session_id").references(() => cashDrawerSessions.id).notNull(),
  type: text("type").notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }),
  reason: text("reason"),
  performedBy: text("performed_by"),
  performedAt: timestamp("performed_at").notNull(),
});

// === RELATIONS ===

export const storesRelations = relations(stores, ({ many }) => ({
  services: many(services),
  staff: many(staff),
  customers: many(customers),
  appointments: many(appointments),
  products: many(products),
  serviceCategories: many(serviceCategories),
  addons: many(addons),
  cashDrawerSessions: many(cashDrawerSessions),
  calendarSettings: many(calendarSettings),
  businessHours: many(businessHours),
}));

export const businessHoursRelations = relations(businessHours, ({ one }) => ({
  store: one(stores, { fields: [businessHours.storeId], references: [stores.id] }),
}));

export const calendarSettingsRelations = relations(calendarSettings, ({ one }) => ({
  store: one(stores, { fields: [calendarSettings.storeId], references: [stores.id] }),
}));

export const cashDrawerSessionsRelations = relations(cashDrawerSessions, ({ one, many }) => ({
  store: one(stores, { fields: [cashDrawerSessions.storeId], references: [stores.id] }),
  actions: many(drawerActions),
}));

export const drawerActionsRelations = relations(drawerActions, ({ one }) => ({
  session: one(cashDrawerSessions, { fields: [drawerActions.sessionId], references: [cashDrawerSessions.id] }),
}));

export const serviceCategoriesRelations = relations(serviceCategories, ({ one, many }) => ({
  store: one(stores, { fields: [serviceCategories.storeId], references: [stores.id] }),
  services: many(services),
}));

export const servicesRelations = relations(services, ({ one, many }) => ({
  store: one(stores, { fields: [services.storeId], references: [stores.id] }),
  serviceCategory: one(serviceCategories, { fields: [services.categoryId], references: [serviceCategories.id] }),
  serviceAddons: many(serviceAddons),
  staffServices: many(staffServices),
}));

export const addonsRelations = relations(addons, ({ one, many }) => ({
  store: one(stores, { fields: [addons.storeId], references: [stores.id] }),
  serviceAddons: many(serviceAddons),
  appointmentAddons: many(appointmentAddons),
}));

export const serviceAddonsRelations = relations(serviceAddons, ({ one }) => ({
  service: one(services, { fields: [serviceAddons.serviceId], references: [services.id] }),
  addon: one(addons, { fields: [serviceAddons.addonId], references: [addons.id] }),
}));

export const appointmentAddonsRelations = relations(appointmentAddons, ({ one }) => ({
  appointment: one(appointments, { fields: [appointmentAddons.appointmentId], references: [appointments.id] }),
  addon: one(addons, { fields: [appointmentAddons.addonId], references: [addons.id] }),
}));

export const staffRelations = relations(staff, ({ one, many }) => ({
  store: one(stores, { fields: [staff.storeId], references: [stores.id] }),
  staffServices: many(staffServices),
  availability: many(staffAvailability),
}));

export const staffAvailabilityRelations = relations(staffAvailability, ({ one }) => ({
  staff: one(staff, { fields: [staffAvailability.staffId], references: [staff.id] }),
}));

export const staffServicesRelations = relations(staffServices, ({ one }) => ({
  staff: one(staff, { fields: [staffServices.staffId], references: [staff.id] }),
  service: one(services, { fields: [staffServices.serviceId], references: [services.id] }),
}));

export const appointmentsRelations = relations(appointments, ({ one, many }) => ({
  service: one(services, {
    fields: [appointments.serviceId],
    references: [services.id],
  }),
  staff: one(staff, {
    fields: [appointments.staffId],
    references: [staff.id],
  }),
  customer: one(customers, {
    fields: [appointments.customerId],
    references: [customers.id],
  }),
  store: one(stores, {
    fields: [appointments.storeId],
    references: [stores.id],
  }),
  appointmentAddons: many(appointmentAddons),
}));

// === SCHEMAS ===

export const insertStoreSchema = createInsertSchema(stores).omit({ id: true });
export const insertServiceCategorySchema = createInsertSchema(serviceCategories).omit({ id: true });
export const insertServiceSchema = createInsertSchema(services).omit({ id: true });
export const insertAddonSchema = createInsertSchema(addons).omit({ id: true });
export const insertServiceAddonSchema = createInsertSchema(serviceAddons).omit({ id: true });
export const insertAppointmentAddonSchema = createInsertSchema(appointmentAddons).omit({ id: true });
export const insertStaffSchema = createInsertSchema(staff).omit({ id: true });
export const insertStaffServiceSchema = createInsertSchema(staffServices).omit({ id: true });
export const insertStaffAvailabilitySchema = createInsertSchema(staffAvailability).omit({ id: true });
export const insertCustomerSchema = createInsertSchema(customers).omit({ id: true });
export const insertAppointmentSchema = createInsertSchema(appointments).omit({ id: true });
export const insertProductSchema = createInsertSchema(products).omit({ id: true });
export const insertBusinessHoursSchema = createInsertSchema(businessHours).omit({ id: true });
export const insertCalendarSettingsSchema = createInsertSchema(calendarSettings).omit({ id: true });
export const insertCashDrawerSessionSchema = createInsertSchema(cashDrawerSessions).omit({ id: true });
export const insertDrawerActionSchema = createInsertSchema(drawerActions).omit({ id: true });

// === EXPLICIT API TYPES ===

export type Store = typeof stores.$inferSelect;
export type InsertStore = z.infer<typeof insertStoreSchema>;

export type ServiceCategory = typeof serviceCategories.$inferSelect;
export type InsertServiceCategory = z.infer<typeof insertServiceCategorySchema>;

export type Service = typeof services.$inferSelect;
export type InsertService = z.infer<typeof insertServiceSchema>;

export type Addon = typeof addons.$inferSelect;
export type InsertAddon = z.infer<typeof insertAddonSchema>;

export type ServiceAddon = typeof serviceAddons.$inferSelect;
export type InsertServiceAddon = z.infer<typeof insertServiceAddonSchema>;

export type AppointmentAddon = typeof appointmentAddons.$inferSelect;
export type InsertAppointmentAddon = z.infer<typeof insertAppointmentAddonSchema>;

export type Staff = typeof staff.$inferSelect;
export type InsertStaff = z.infer<typeof insertStaffSchema>;

export type StaffService = typeof staffServices.$inferSelect;
export type InsertStaffService = z.infer<typeof insertStaffServiceSchema>;

export type StaffAvailability = typeof staffAvailability.$inferSelect;
export type InsertStaffAvailability = z.infer<typeof insertStaffAvailabilitySchema>;

export type Customer = typeof customers.$inferSelect;
export type InsertCustomer = z.infer<typeof insertCustomerSchema>;

export type Appointment = typeof appointments.$inferSelect;
export type InsertAppointment = z.infer<typeof insertAppointmentSchema>;

export type Product = typeof products.$inferSelect;
export type InsertProduct = z.infer<typeof insertProductSchema>;

export type BusinessHours = typeof businessHours.$inferSelect;
export type InsertBusinessHours = z.infer<typeof insertBusinessHoursSchema>;

export type CalendarSettings = typeof calendarSettings.$inferSelect;
export type InsertCalendarSettings = z.infer<typeof insertCalendarSettingsSchema>;

export type CashDrawerSession = typeof cashDrawerSessions.$inferSelect;
export type InsertCashDrawerSession = z.infer<typeof insertCashDrawerSessionSchema>;

export type DrawerAction = typeof drawerActions.$inferSelect;
export type InsertDrawerAction = z.infer<typeof insertDrawerActionSchema>;

export type CashDrawerSessionWithActions = CashDrawerSession & {
  actions: DrawerAction[];
};

export type AppointmentWithDetails = Appointment & {
  service: Service | null;
  staff: Staff | null;
  customer: Customer | null;
  store: Store | null;
  appointmentAddons?: (AppointmentAddon & { addon: Addon | null })[];
};
