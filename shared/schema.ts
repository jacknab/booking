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
  storeId: integer("store_id").references(() => stores.id),
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

// === RELATIONS ===

export const storesRelations = relations(stores, ({ many }) => ({
  services: many(services),
  staff: many(staff),
  customers: many(customers),
  appointments: many(appointments),
  products: many(products),
  serviceCategories: many(serviceCategories),
  addons: many(addons),
}));

export const serviceCategoriesRelations = relations(serviceCategories, ({ one, many }) => ({
  store: one(stores, { fields: [serviceCategories.storeId], references: [stores.id] }),
  services: many(services),
}));

export const servicesRelations = relations(services, ({ one, many }) => ({
  store: one(stores, { fields: [services.storeId], references: [stores.id] }),
  serviceCategory: one(serviceCategories, { fields: [services.categoryId], references: [serviceCategories.id] }),
  serviceAddons: many(serviceAddons),
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
export const insertCustomerSchema = createInsertSchema(customers).omit({ id: true });
export const insertAppointmentSchema = createInsertSchema(appointments).omit({ id: true });
export const insertProductSchema = createInsertSchema(products).omit({ id: true });

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

export type Customer = typeof customers.$inferSelect;
export type InsertCustomer = z.infer<typeof insertCustomerSchema>;

export type Appointment = typeof appointments.$inferSelect;
export type InsertAppointment = z.infer<typeof insertAppointmentSchema>;

export type Product = typeof products.$inferSelect;
export type InsertProduct = z.infer<typeof insertProductSchema>;

export type AppointmentWithDetails = Appointment & {
  service: Service | null;
  staff: Staff | null;
  customer: Customer | null;
  store: Store | null;
  appointmentAddons?: (AppointmentAddon & { addon: Addon | null })[];
};
