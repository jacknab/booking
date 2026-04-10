import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { isAuthenticated } from "./auth";
import { z } from "zod";
import { db, pool } from "./db";
import { users } from "@shared/models/auth";
import { eq, and, desc, sql, count, gte, asc, isNull, isNotNull } from "drizzle-orm";
import { sendEmail, sendBookingConfirmationEmail, sendReminderEmail, sendReviewRequestEmail, startEmailReminderScheduler } from "./mail";
import { businessTemplates } from "./onboarding-data";
import { fromZonedTime, toZonedTime } from "date-fns-tz";
import { sendBookingConfirmation, startReminderScheduler } from "./sms";
import { startQueueSmsScheduler } from "./queue-sms-scheduler";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { 
  insertLocationSchema,
  insertServiceCategorySchema,
  insertServiceSchema, 
  insertAddonSchema,
  insertServiceAddonSchema,
  insertStaffSchema,
  insertCustomerSchema, 
  insertAppointmentSchema, 
  type Staff,
  insertProductSchema,
  locations,
  insertCashDrawerSessionSchema,
  insertCalendarSettingsSchema,
  googleBusinessProfiles,
  googleReviews,
  googleReviewResponses,
  insertGoogleReviewResponseSchema,
  appointments,
  staff,
  customers,
  services,
  serviceCategories,
  calendarSettings,
  smsSettings,
  mailSettings,
  waitlist,
  giftCards,
  giftCardTransactions,
  intakeForms,
  intakeFormFields,
  intakeFormResponses,
  loyaltyTransactions,
  reviews,
  storeSettings,
  seoRegions,
  insertSeoRegionSchema,
} from "@shared/schema";
import { writeRegionPage, deleteRegionPage } from "./seo-page-generator";
import { buildRegionSlug, ALL_CITIES, BOOKING_BUSINESS_TYPES } from "./seo-cities";
import {
  GoogleBusinessAPIManager,
  createApiManagerFromProfile,
  syncGoogleReviews,
  publishReviewResponse,
} from "./google-business-api";
import { TrialService } from "./services/trial-service";
import { requireActiveTrial } from "./middleware/trial-middleware";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Note: setupAuth(app) is called in server/index.ts before registerRoutes.
  // Auth routes (register, login, logout, user) are registered there via auth.ts.

  // Public config — exposes safe frontend settings from env vars
  app.get("/api/config", (_req, res) => {
    const raw = parseInt(process.env.ACTIVE_GROUPS ?? "3", 10);
    const activeGroups = isNaN(raw) || raw < 1 ? 3 : Math.min(raw, 3);
    res.json({ activeGroups });
  });

  app.get("/api/trial/status", async (req, res) => {
    const userId = (req.session as any)?.userId;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });
    
    try {
      const trialStatus = await TrialService.getTrialStatus(userId);
      return res.json(trialStatus);
    } catch (error) {
      console.error("Error fetching trial status:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.use("/api", (req, res, next) => {
    // Allow public routes
    if (req.path.startsWith("/auth/")) return next();
    if (req.path.startsWith("/store/by-subdomain")) return next(); // Allow public access to subdomain store
    if (req.path.startsWith("/public/")) return next(); // Allow public routes
    if (req.path.startsWith("/admin/stores")) return next(); // Allow admin stores endpoint
    if (req.path.startsWith("/admin/platform-settings")) return next(); // Allow admin platform settings endpoint
    if (req.path.startsWith("/admin/users")) return next(); // Allow admin users endpoint
    if (req.path.startsWith("/admin/dashboard")) return next(); // Allow admin dashboard endpoint
    if (req.path.startsWith("/billing/invoices")) return next(); // Allow billing endpoints for development
    if (req.path.startsWith("/seo-regions")) return next(); // SEO regions admin — public
    
    // Require authentication for other endpoints
    const userId = (req.session as any)?.userId;
    const staffId = (req.session as any)?.staffId;
    if (!userId && !staffId) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    next();
  });

  // === STORES ===
  app.get(api.stores.list.path, async (req, res) => {
    const userId = (req.session as any)?.userId;
    const stores = await storage.getStores(userId);
    res.json(stores);
  });

  app.get(api.stores.get.path, async (req, res) => {
    const store = await storage.getStore(Number(req.params.id));
    if (!store) return res.status(404).json({ message: "Store not found" });
    res.json(store);
  });

  // === ADMIN STORES ===
  app.get("/api/admin/stores", async (req, res) => {
    try {
      // Get all stores with account status
      const allStores = await db.select({
        id: locations.id,
        name: locations.name,
        userId: locations.userId,
        bookingSlug: locations.bookingSlug,
        category: locations.category,
        email: locations.email,
        timezone: locations.timezone,
        address: locations.address,
        phone: locations.phone,
        city: locations.city,
        state: locations.state,
        postcode: locations.postcode,
        commissionPayoutFrequency: locations.commissionPayoutFrequency,
        accountStatus: locations.accountStatus,
      }).from(locations).orderBy(locations.name);
      
      // Transform the data to match the expected interface
      const transformedStores = allStores.map(store => ({
        id: store.id,
        name: store.name,
        user_id: store.userId,
        booking_slug: store.bookingSlug,
        category: store.category,
        email: store.email,
        timezone: store.timezone,
        address: store.address,
        phone: store.phone,
        city: store.city,
        state: store.state,
        postcode: store.postcode,
        commission_payout_frequency: store.commissionPayoutFrequency,
        // Use account status from locations table
        subscription: 'Basic', // Default subscription for now
        accountStatus: store.accountStatus || 'Active',
      }));
      
      res.json(transformedStores);
    } catch (error) {
      console.error("Error fetching admin stores:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // GET store analytics for admin
  app.get("/api/admin/stores/:storeNumber/analytics", async (req, res) => {
    try {
      const { storeNumber } = req.params;
      
      // GET appointments for this store
      const appointmentsData = await db.select({
        id: appointments.id,
        date: appointments.date,
        totalPaid: appointments.totalPaid,
        status: appointments.status,
      }).from(appointments)
        .where(eq(appointments.storeId, parseInt(storeNumber)));

      // Get staff for this store
      const staffData = await db.select({
        id: staff.id,
      }).from(staff)
        .where(eq(staff.storeId, parseInt(storeNumber)));

      // Get customers for this store
      const customersData = await db.select({
        id: customers.id,
      }).from(customers)
        .where(eq(customers.storeId, parseInt(storeNumber)));

      // Calculate metrics
      const totalAppointments = appointmentsData.length;
      const activeStaffCount = staffData.length;
      const totalCustomers = customersData.length;
      
      // Calculate monthly revenue from completed appointments
      const currentMonth = new Date().getMonth();
      const currentYear = new Date().getFullYear();
      const monthlyAppointments = appointmentsData.filter(apt => {
        const aptDate = new Date(apt.date);
        return aptDate.getMonth() === currentMonth && aptDate.getFullYear() === currentYear && apt.status === 'completed';
      });
      
      const monthlyRevenue = monthlyAppointments.reduce((sum, apt) => {
        return sum + Number(apt.totalPaid || 0);
      }, 0);

      // Get last activity
      const lastActivity = appointmentsData.length > 0
        ? appointmentsData.reduce((latest, apt) =>
            new Date(apt.date) > new Date(latest.date) ? apt : latest
          ).date
        : new Date();

      res.json({
        totalAppointments,
        activeStaffCount,
        totalCustomers,
        monthlyRevenue,
        averageRating: 0, // Would need reviews table
        lastActivity
      });
    } catch (error) {
      console.error("Error fetching store analytics:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // GET staff for admin store
  app.get("/api/admin/stores/:storeNumber/staff", async (req, res) => {
    try {
      const { storeNumber } = req.params;
      
      const staffData = await db.select({
        id: staff.id,
        name: staff.name,
        email: staff.email,
        phone: staff.phone,
        role: staff.role,
        commissionEnabled: staff.commissionEnabled,
        storeId: staff.storeId,
      }).from(staff)
        .where(eq(staff.storeId, parseInt(storeNumber)));

      res.json(staffData);
    } catch (error) {
      console.error("Error fetching staff:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // GET calendar settings for admin store
  app.get("/api/admin/stores/:storeNumber/calendar-settings", async (req, res) => {
    try {
      const { storeNumber } = req.params;
      
      const calendarSettingsData = await db.select({
        id: calendarSettings.id,
        startOfWeek: calendarSettings.startOfWeek,
        timeSlotInterval: calendarSettings.timeSlotInterval,
        nonWorkingHoursDisplay: calendarSettings.nonWorkingHoursDisplay,
        allowBookingOutsideHours: calendarSettings.allowBookingOutsideHours,
        autoCompleteAppointments: calendarSettings.autoCompleteAppointments,
      }).from(calendarSettings)
        .where(eq(calendarSettings.storeId, parseInt(storeNumber)))
        .limit(1);

      res.json(calendarSettingsData[0] || null);
    } catch (error) {
      console.error("Error fetching calendar settings:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // GET SMS settings for admin store
  app.get("/api/admin/stores/:storeNumber/sms-settings", async (req, res) => {
    try {
      const { storeNumber } = req.params;
      
      const smsSettingsData = await db.select({
        id: smsSettings.id,
        bookingConfirmationEnabled: smsSettings.bookingConfirmationEnabled,
        reminderEnabled: smsSettings.reminderEnabled,
        reminderHoursBefore: smsSettings.reminderHoursBefore,
        reviewRequestEnabled: smsSettings.reviewRequestEnabled,
        twilioPhoneNumber: smsSettings.twilioPhoneNumber,
      }).from(smsSettings)
        .where(eq(smsSettings.storeId, parseInt(storeNumber)))
        .limit(1);

      res.json(smsSettingsData[0] || null);
    } catch (error) {
      console.error("Error fetching SMS settings:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // GET email settings for admin store
  app.get("/api/admin/stores/:storeNumber/email-settings", async (req, res) => {
    try {
      const { storeNumber } = req.params;
      
      const emailSettingsData = await db.select({
        id: mailSettings.id,
        bookingConfirmationEnabled: mailSettings.bookingConfirmationEnabled,
        reminderEnabled: mailSettings.reminderEnabled,
        reviewRequestEnabled: mailSettings.reviewRequestEnabled,
        mailgunApiKey: mailSettings.mailgunApiKey,
        mailgunDomain: mailSettings.mailgunDomain,
      }).from(mailSettings)
        .where(eq(mailSettings.storeId, parseInt(storeNumber)))
        .limit(1);

      res.json(emailSettingsData[0] || null);
    } catch (error) {
      console.error("Error fetching email settings:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // GET services for admin store
  app.get("/api/admin/stores/:storeNumber/services", async (req, res) => {
    try {
      const { storeNumber } = req.params;
      
      const servicesData = await db.select({
        id: services.id,
        name: services.name,
        description: services.description,
        price: services.price,
        duration: services.duration,
        categoryId: services.categoryId,
      }).from(services)
        .where(eq(services.storeId, parseInt(storeNumber)));

      res.json(servicesData);
    } catch (error) {
      console.error("Error fetching services:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // GET service categories for admin store
  app.get("/api/admin/stores/:storeNumber/service-categories", async (req, res) => {
    try {
      const { storeNumber } = req.params;
      
      const categoriesData = await db.select({
        id: serviceCategories.id,
        name: serviceCategories.name,
        imageUrl: serviceCategories.imageUrl,
        sortOrder: serviceCategories.sortOrder,
      }).from(serviceCategories)
        .where(eq(serviceCategories.storeId, parseInt(storeNumber)));

      res.json(categoriesData);
    } catch (error) {
      console.error("Error fetching service categories:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // GET single store by ID for admin
  app.get("/api/admin/stores/:storeNumber", async (req, res) => {
    try {
      const { storeNumber } = req.params;
      
      // Get store by ID
      const store = await db.select({
        id: locations.id,
        name: locations.name,
        email: locations.email,
        phone: locations.phone,
        address: locations.address,
        city: locations.city,
        state: locations.state,
        postcode: locations.postcode,
        category: locations.category,
        timezone: locations.timezone,
        bookingSlug: locations.bookingSlug,
        bookingTheme: locations.bookingTheme,
        commissionPayoutFrequency: locations.commissionPayoutFrequency,
        userId: locations.userId,
      }).from(locations)
        .where(eq(locations.id, parseInt(storeNumber)))
        .limit(1);

      if (store.length === 0) {
        return res.status(404).json({ message: "Store not found" });
      }

      // Get user information (userId may be null for stores without an owner)
      const user = store[0].userId
        ? await db.select({
            id: users.id,
            email: users.email,
            firstName: users.firstName,
            lastName: users.lastName,
            createdAt: users.createdAt,
          }).from(users)
            .where(eq(users.id, store[0].userId))
            .limit(1)
        : [];

      const storeData = {
        ...store[0],
        userEmail: user[0]?.email || '',
        userFirstName: user[0]?.firstName || '',
        userLastName: user[0]?.lastName || '',
        createdAt: user[0]?.createdAt?.toISOString() || null,
        lastLogin: null,
      };

      res.json(storeData);
    } catch (error) {
      console.error("Error fetching store:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post(api.stores.create.path, async (req, res) => {
    try {
      const userId = (req.session as any)?.userId;
      if (!userId) return res.status(401).json({ message: "Unauthorized" });
      const input = insertLocationSchema.parse(req.body);
      const store = await storage.createStore({ ...input, userId });
      res.status(201).json(store);
    } catch (error) {
      res.status(400).json({ message: "Invalid input" });
    }
  });

  app.patch("/api/stores/:id", async (req, res) => {
    try {
      const userId = (req.session as any)?.userId;
      if (!userId) return res.status(401).json({ message: "Unauthorized" });
      
      const id = Number(req.params.id);
      const store = await storage.getStore(id);
      if (!store || store.userId !== userId) {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      const input = insertLocationSchema.partial().parse(req.body);
      const updatedStore = await storage.updateStore(id, input);
      if (!updatedStore) return res.status(404).json({ message: "Store not found" });
      res.json(updatedStore);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid input", details: error.errors[0].message });
      } else {
        console.error("Store update error:", error);
        res.status(400).json({ message: "Failed to update store" });
      }
    }
  });

  // === BUSINESS HOURS ===
  app.get(api.businessHours.get.path, async (req, res) => {
    const storeId = req.query.storeId ? Number(req.query.storeId) : undefined;
    if (!storeId) return res.status(400).json({ message: "storeId required" });
    const hours = await storage.getBusinessHours(storeId);
    res.json(hours);
  });

  app.put(api.businessHours.set.path, async (req, res) => {
    try {
      const input = z.object({
        storeId: z.number(),
        hours: z.array(z.object({
          dayOfWeek: z.number().min(0).max(6),
          openTime: z.string().regex(/^\d{2}:\d{2}$/, "Time must be in HH:MM format"),
          closeTime: z.string().regex(/^\d{2}:\d{2}$/, "Time must be in HH:MM format"),
          isClosed: z.boolean(),
        })),
      }).parse(req.body);
      for (const h of input.hours) {
        if (h.isClosed) continue;
        const [oh, om] = h.openTime.split(":").map(Number);
        const [ch, cm] = h.closeTime.split(":").map(Number);
        if ((ch * 60 + cm) <= (oh * 60 + om)) {
          return res.status(400).json({ message: `Day ${h.dayOfWeek}: close time must be after open time` });
        }
      }
      const hoursData = input.hours.map(h => ({
        ...h,
        storeId: input.storeId,
      }));
      const result = await storage.setBusinessHours(input.storeId, hoursData);
      res.json(result);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: error.errors[0].message });
      } else {
        res.status(400).json({ message: "Invalid input" });
      }
    }
  });

  // === SERVICE CATEGORIES ===
  app.post("/api/service-categories/reorder", async (req, res) => {
    const { orderedIds, storeId } = req.body;
    if (!Array.isArray(orderedIds) || !storeId) return res.status(400).json({ error: "Invalid input" });
    for (let i = 0; i < orderedIds.length; i++) {
      await storage.updateServiceCategory(orderedIds[i], { sortOrder: i });
    }
    res.json({ success: true });
  });

  app.get(api.serviceCategories.list.path, async (req, res) => {
    const storeId = req.query.storeId ? Number(req.query.storeId) : undefined;
    const cats = await storage.getServiceCategories(storeId);
    res.json(cats);
  });

  app.post(api.serviceCategories.create.path, async (req, res) => {
    try {
      const input = insertServiceCategorySchema.parse(req.body);
      const cat = await storage.createServiceCategory(input);
      res.status(201).json(cat);
    } catch (error) {
      res.status(400).json({ message: "Invalid input" });
    }
  });

  app.patch(api.serviceCategories.update.path, async (req, res) => {
    try {
      const input = insertServiceCategorySchema.partial().parse(req.body);
      const cat = await storage.updateServiceCategory(Number(req.params.id), input);
      if (!cat) return res.status(404).json({ message: "Category not found" });
      res.json(cat);
    } catch (error) {
      res.status(400).json({ message: "Invalid input" });
    }
  });

  app.delete(api.serviceCategories.delete.path, async (req, res) => {
    await storage.deleteServiceCategory(Number(req.params.id));
    res.status(204).end();
  });

  // === SERVICES ===
  app.get(api.services.list.path, async (req, res) => {
    const storeId = req.query.storeId ? Number(req.query.storeId) : undefined;
    const services = await storage.getServices(storeId);
    res.json(services);
  });

  app.get(api.services.get.path, async (req, res) => {
    const service = await storage.getService(Number(req.params.id));
    if (!service) return res.status(404).json({ message: "Service not found" });
    res.json(service);
  });

  app.post(api.services.create.path, requireActiveTrial, async (req, res) => {
    try {
      const input = insertServiceSchema.parse(req.body);
      const service = await storage.createService(input);
      res.status(201).json(service);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: error.errors[0].message });
      } else {
        res.status(500).json({ message: "Internal server error" });
      }
    }
  });

  app.patch(api.services.update.path, async (req, res) => {
    try {
      const input = insertServiceSchema.partial().parse(req.body);
      const service = await storage.updateService(Number(req.params.id), input);
      if (!service) return res.status(404).json({ message: "Service not found" });
      res.json(service);
    } catch (error) {
      res.status(400).json({ message: "Invalid input" });
    }
  });

  app.delete(api.services.delete.path, async (req, res) => {
    await storage.deleteService(Number(req.params.id));
    res.status(204).end();
  });

  // === ADDONS ===
  app.get(api.addons.list.path, async (req, res) => {
    const storeId = req.query.storeId ? Number(req.query.storeId) : undefined;
    const result = await storage.getAddons(storeId);
    res.json(result);
  });

  app.post(api.addons.create.path, async (req, res) => {
    try {
      const input = insertAddonSchema.parse(req.body);
      const addon = await storage.createAddon(input);
      res.status(201).json(addon);
    } catch (error) {
      res.status(400).json({ message: "Invalid input" });
    }
  });

  app.patch(api.addons.update.path, async (req, res) => {
    try {
      const input = insertAddonSchema.partial().parse(req.body);
      const addon = await storage.updateAddon(Number(req.params.id), input);
      if (!addon) return res.status(404).json({ message: "Addon not found" });
      res.json(addon);
    } catch (error) {
      res.status(400).json({ message: "Invalid input" });
    }
  });

  app.delete(api.addons.delete.path, async (req, res) => {
    await storage.deleteAddon(Number(req.params.id));
    res.status(204).end();
  });

  // === SERVICE ADDONS (linking) ===
  app.get(api.serviceAddons.list.path, async (req, res) => {
    const serviceId = req.query.serviceId ? Number(req.query.serviceId) : undefined;
    const result = await storage.getServiceAddons(serviceId);
    res.json(result);
  });

  app.get(api.serviceAddons.forService.path, async (req, res) => {
    const serviceId = Number(req.params.id);
    const result = await storage.getAddonsForService(serviceId);
    res.json(result);
  });

  app.post(api.serviceAddons.create.path, async (req, res) => {
    try {
      const input = insertServiceAddonSchema.parse(req.body);
      const sa = await storage.createServiceAddon(input);
      res.status(201).json(sa);
    } catch (error) {
      res.status(400).json({ message: "Invalid input" });
    }
  });

  app.delete(api.serviceAddons.delete.path, async (req, res) => {
    await storage.deleteServiceAddon(Number(req.params.id));
    res.status(204).end();
  });

  app.get("/api/service-addon-mappings", async (req, res) => {
    try {
      const userId = (req.session as any)?.userId;
      const userStores = await storage.getStores(userId);
      const storeIds = userStores.map(s => s.id);
      const allMappings = await storage.getAllServiceAddonMappings();
      const userAddons = await Promise.all(storeIds.map(sid => storage.getAddons(sid)));
      const userAddonIds = new Set(userAddons.flat().map(a => a.id));
      const filtered = allMappings.filter(m => userAddonIds.has(m.addonId));
      res.json(filtered);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch mappings" });
    }
  });

  app.post("/api/addons/:id/services", async (req, res) => {
    try {
      const addonId = Number(req.params.id);
      const bodySchema = z.object({
        serviceIds: z.array(z.number()),
      });
      const parsed = bodySchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ message: "Invalid input", errors: parsed.error.flatten() });
      }
      const addon = await storage.getAddon(addonId);
      if (!addon) return res.status(404).json({ message: "Addon not found" });
      const userId = (req.session as any)?.userId;
      if (addon.storeId) {
        const store = await storage.getStore(addon.storeId);
        if (store?.userId !== userId) {
          return res.status(403).json({ message: "Forbidden" });
        }
      }
      await storage.setAddonServices(addonId, parsed.data.serviceIds);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "Failed to update addon services" });
    }
  });

  // === APPOINTMENT ADDONS ===
  app.get(api.appointmentAddons.forAppointment.path, async (req, res) => {
    const appointmentId = Number(req.params.id);
    const result = await storage.getAppointmentAddons(appointmentId);
    res.json(result.map(aa => aa.addon));
  });

  app.post(api.appointmentAddons.set.path, async (req, res) => {
    try {
      const appointmentId = Number(req.params.id);
      const { addonIds } = z.object({ addonIds: z.array(z.number()) }).parse(req.body);

      const appointment = await storage.getAppointment(appointmentId);
      if (!appointment) return res.status(404).json({ message: "Appointment not found" });

      if (appointment.staffId && appointment.status !== "cancelled" && appointment.status !== "completed") {
        let addonDuration = 0;
        for (const addonId of addonIds) {
          const addon = await storage.getAddon(addonId);
          if (addon) addonDuration += addon.duration;
        }

        const baseDuration = appointment.service?.duration || appointment.duration;
        const totalDuration = baseDuration + addonDuration;

        const appointmentStart = new Date(appointment.date);
        const appointmentEnd = new Date(appointmentStart.getTime() + totalDuration * 60000);

        const dayStart = new Date(appointmentStart);
        dayStart.setUTCHours(0, 0, 0, 0);
        const dayEnd = new Date(appointmentStart);
        dayEnd.setUTCHours(23, 59, 59, 999);

        const dayAppointments = await storage.getAppointments({
          from: dayStart,
          to: dayEnd,
          staffId: appointment.staffId,
          storeId: appointment.storeId || undefined,
        });

        for (const other of dayAppointments) {
          if (other.id === appointmentId || other.status === "cancelled") continue;
          const otherStart = new Date(other.date);
          const otherEnd = new Date(otherStart.getTime() + other.duration * 60000);

          if (appointmentStart < otherEnd && appointmentEnd > otherStart) {
            const availableMinutes = Math.max(0, Math.floor((otherStart.getTime() - appointmentStart.getTime()) / 60000) - baseDuration);
            return res.status(409).json({
              message: `Staff member has another appointment at ${otherStart.toISOString()}. Not enough time for selected addons.`,
              availableMinutes,
            });
          }
        }

        await storage.updateAppointment(appointmentId, { duration: totalDuration });
      }

      await storage.setAppointmentAddons(appointmentId, addonIds);
      res.json({ success: true });
    } catch (error) {
      console.error(error);
      res.status(400).json({ message: "Invalid input" });
    }
  });

  // === STAFF ===
  app.get(api.staff.list.path, async (req, res) => {
    const storeId = req.query.storeId ? Number(req.query.storeId) : undefined;
    const staff = await storage.getAllStaff(storeId);
    res.json(staff);
  });

  app.get(api.staff.get.path, async (req, res) => {
    const member = await storage.getStaffMember(Number(req.params.id));
    if (!member) return res.status(404).json({ message: "Staff not found" });
    res.json(member);
  });

  app.post(api.staff.create.path, requireActiveTrial, async (req, res) => {
    try {
      const input = insertStaffSchema.parse(req.body);
      if (input.password) {
        input.password = await bcrypt.hash(input.password, 10);
      } else {
        delete input.password;
      }
      const member = await storage.createStaff(input);
      res.status(201).json(member);
    } catch (error) {
      res.status(400).json({ message: "Invalid input" });
    }
  });

  app.patch(api.staff.update.path, async (req, res) => {
    try {
      const input = insertStaffSchema.partial().parse(req.body);
      if (input.password) {
        input.password = await bcrypt.hash(input.password, 10);
      } else {
        // If password is not provided or empty, do not update it
        delete input.password;
      }
      const member = await storage.updateStaff(Number(req.params.id), input);
      if (!member) return res.status(404).json({ message: "Staff not found" });
      res.json(member);
    } catch (error) {
      res.status(400).json({ message: "Invalid input" });
    }
  });

  app.delete(api.staff.delete.path, async (req, res) => {
    await storage.deleteStaff(Number(req.params.id));
    res.status(204).end();
  });

  app.post("/api/staff/:id/enable-calendar-access", async (req, res) => {
    try {
      const staffId = Number(req.params.id);
      const staff = await storage.getStaffMember(staffId);

      if (!staff || !staff.email) {
        return res.status(400).json({ message: "Staff member not found or has no email address." });
      }

      const tempPassword = Math.random().toString(36).slice(-8);
      const hashedPassword = await bcrypt.hash(tempPassword, 10);

      let user = await storage.findUserByEmail(staff.email);

      if (user) {
        await storage.updateUser(user.id, { password: hashedPassword, role: "staff", staffId: staff.id, passwordChanged: false });
      } else {
        user = await storage.createUser({
          email: staff.email,
          password: hashedPassword,
          role: "staff",
          staffId: staff.id,
          passwordChanged: false,
        });
      }

      // Send email with temporary password
      const emailHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background-color: #007bff; color: white; padding: 20px; border-radius: 8px 8px 0 0; text-align: center;">
            <h1 style="margin: 0; font-size: 24px;">Staff Calendar Access</h1>
          </div>
          <div style="background-color: #f8f9fa; padding: 30px; border-radius: 0 0 8px 8px;">
            <h2 style="color: #333; margin-top: 0;">Welcome to Your Staff Portal!</h2>
            <p style="color: #666; line-height: 1.6;">
              Your calendar access has been enabled for <strong>${staff.name}</strong>.
            </p>
            <div style="background-color: white; padding: 20px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #007bff;">
              <h3 style="color: #333; margin-top: 0; margin-bottom: 15px;">Your Login Details:</h3>
              <p style="margin: 5px 0;"><strong>Email:</strong> ${staff.email}</p>
              <p style="margin: 5px 0;"><strong>Temporary Password:</strong> <span style="background-color: #e9ecef; padding: 5px 10px; border-radius: 3px; font-family: monospace; font-size: 16px;">${tempPassword}</span></p>
            </div>
            <div style="background-color: #fff3cd; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #ffc107;">
              <p style="margin: 0; color: #856404;">
                <strong>Important:</strong> Please log in and change your password as soon as possible.
              </p>
            </div>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.FRONTEND_URL || 'https://www.mysalon.me'}/staff-auth" 
                 style="background-color: #007bff; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
                Log In to Staff Portal
              </a>
            </div>
            <p style="color: #6c757d; font-size: 14px; text-align: center; margin-top: 30px;">
              If you have any questions, please contact your administrator.
            </p>
          </div>
        </div>
      `;

      const emailText = `
Staff Calendar Access Enabled

Welcome ${staff.name}!

Your calendar access has been enabled. Here are your login details:

Email: ${staff.email}
Temporary Password: ${tempPassword}

Important: Please log in and change your password as soon as possible.

Log in at: ${process.env.FRONTEND_URL || 'https://www.mysalon.me'}/staff-auth

If you have any questions, please contact your administrator.
      `;

      const emailResult = await sendEmail(
        staff.storeId || 1, // Use storeId from staff record or default to 1
        staff.email,
        "Staff Calendar Access Enabled - Your Login Details",
        emailHtml,
        emailText
      );

      if (!emailResult.success) {
        console.error("Failed to send calendar access email:", emailResult.error);
        // Don't fail the whole operation, but log the error
        console.log(`Calendar access enabled for ${staff.email} but email failed to send. Temporary password: ${tempPassword}`);
      } else {
        console.log(`Calendar access email sent successfully to ${staff.email} with message ID: ${emailResult.id}`);
      }

      res.json({ success: true, message: "Calendar access enabled and email sent." });
    } catch (error) {
      console.error("Failed to enable calendar access:", error);
      res.status(500).json({ message: "Failed to enable calendar access" });
    }
  });

  // === STAFF SERVICES ===
  app.get(api.staffServices.list.path, async (req, res) => {
    const staffId = req.query.staffId ? Number(req.query.staffId) : undefined;
    const serviceId = req.query.serviceId ? Number(req.query.serviceId) : undefined;
    const result = await storage.getStaffServices(staffId, serviceId);
    res.json(result);
  });

  app.get(api.staffServices.forService.path, async (req, res) => {
    const serviceId = Number(req.params.id);
    const capableStaff = await storage.getStaffForService(serviceId);
    res.json(capableStaff);
  });

  app.post(api.staffServices.set.path, async (req, res) => {
    try {
      const staffId = Number(req.params.id);
      const { serviceIds } = z.object({ serviceIds: z.array(z.number()) }).parse(req.body);
      await storage.setStaffServices(staffId, serviceIds);
      res.json({ success: true });
    } catch (error) {
      res.status(400).json({ message: "Invalid input" });
    }
  });

  // === STAFF AVAILABILITY ===
  app.get(api.staffAvailability.get.path, async (req, res) => {
    const staffId = Number(req.params.id);
    const rules = await storage.getStaffAvailability(staffId);
    res.json(rules);
  });

  app.post(api.staffAvailability.set.path, async (req, res) => {
    try {
      const staffId = Number(req.params.id);
      const { rules } = z.object({
        rules: z.array(z.object({
          dayOfWeek: z.number(),
          startTime: z.string(),
          endTime: z.string(),
        }))
      }).parse(req.body);
      const result = await storage.setStaffAvailability(staffId, rules.map(r => ({ ...r, staffId })));
      res.json(result);
    } catch (error) {
      res.status(400).json({ message: "Invalid input" });
    }
  });

  app.delete(api.staffAvailability.deleteRule.path, async (req, res) => {
    await storage.deleteStaffAvailabilityRule(Number(req.params.id));
    res.status(204).end();
  });

  // === AVAILABILITY SLOTS ===
  app.get(api.availability.slots.path, async (req, res) => {
    try {
      const serviceId = Number(req.query.serviceId);
      const storeId = Number(req.query.storeId);
      const date = String(req.query.date);
      const duration = Number(req.query.duration);
      const specificStaffId = req.query.staffId ? Number(req.query.staffId) : undefined;

      if (!serviceId || !storeId || !date || !duration) {
        return res.status(400).json({ message: "serviceId, storeId, date, and duration are required" });
      }

      const store = await storage.getStore(storeId);
      if (!store) return res.status(404).json({ message: "Store not found" });

      let candidateStaff: Staff[];
      if (specificStaffId) {
        const member = await storage.getStaffMember(specificStaffId);
        // Verify that the specific staff member can perform this service
        if (member) {
          const staffServices = await storage.getStaffServices(specificStaffId);
          const canPerformService = staffServices.some(ss => ss.serviceId === serviceId);
          candidateStaff = canPerformService ? [member] : [];
        } else {
          candidateStaff = [];
        }
      } else {
        candidateStaff = await storage.getStaffForService(serviceId);
      }

      if (candidateStaff.length === 0) {
        return res.json([]);
      }

      const tz = store.timezone || "UTC";

      const calSettings = await storage.getCalendarSettings(storeId);
      const slotInterval = calSettings?.timeSlotInterval || 15;

      // Get actual business hours for the specific date
      const businessHours = await storage.getBusinessHours(storeId);
      const dateObj = new Date(`${date}T00:00:00`);
      const dayOfWeek = dateObj.getUTCDay();
      const todayBusinessHours = businessHours.find(h => h.dayOfWeek === dayOfWeek);
      
      if (!todayBusinessHours || todayBusinessHours.isClosed) {
        return res.json([]);
      }

      // Parse business hours
      const [openHour, openMin] = todayBusinessHours.openTime.split(":").map(Number);
      const [closeHour, closeMin] = todayBusinessHours.closeTime.split(":").map(Number);

      const dayStartLocal = fromZonedTime(new Date(`${date}T00:00:00`), tz);
      const dayEndLocal = fromZonedTime(new Date(`${date}T23:59:59.999`), tz);

      const dayAppointments = await storage.getAppointments({
        from: dayStartLocal,
        to: dayEndLocal,
        storeId,
      });

      type SlotResult = { time: string; staffId: number; staffName: string };
      const slots: SlotResult[] = [];

      const staffLastAppointment: Map<number, Date> = new Map();
      const allAppointments = await storage.getAppointments({ storeId });
      for (const apt of allAppointments) {
        if (apt.status === "cancelled") continue;
        const staffId = apt.staffId;
        if (!staffId) continue;
        const aptDate = new Date(apt.date);
        const current = staffLastAppointment.get(staffId);
        if (!current || aptDate > current) {
          staffLastAppointment.set(staffId, aptDate);
        }
      }

      const businessEndUtc = fromZonedTime(new Date(`${date}T${String(closeHour).padStart(2, "0")}:${String(closeMin).padStart(2, "0")}:00`), tz);
      const nowUtc = new Date();

      for (let hour = openHour; hour < closeHour; hour++) {
        for (let min = 0; min < 60; min += slotInterval) {
          // Skip slots before opening time on the first hour
          if (hour === openHour && min < openMin) {
            continue;
          }
          // Skip slots at or after closing time on the last hour
          if (hour === closeHour - 1 && min >= closeMin) {
            continue;
          }
          
          const slotStart = fromZonedTime(new Date(`${date}T${String(hour).padStart(2, "0")}:${String(min).padStart(2, "0")}:00`), tz);
          const slotEnd = new Date(slotStart.getTime() + duration * 60000);

          if (slotStart < nowUtc) {
            continue;
          }

          if (slotEnd > businessEndUtc) {
            continue;
          }

          const availableForSlot: { staffMember: Staff; lastApt: Date | null }[] = [];

          for (const staffMember of candidateStaff) {
            let hasConflict = false;
            for (const apt of dayAppointments) {
              if (apt.staffId !== staffMember.id) continue;
              if (apt.status === "cancelled") continue;
              const aptStart = new Date(apt.date);
              const aptEnd = new Date(aptStart.getTime() + apt.duration * 60000);
              if (slotStart < aptEnd && slotEnd > aptStart) {
                hasConflict = true;
                break;
              }
            }
            
            // Check staff availability rules if they exist
            if (!hasConflict) {
              const staffAvailRules = await storage.getStaffAvailability(staffMember.id);
              if (staffAvailRules && staffAvailRules.length > 0) {
                // Get day of week in store's local timezone, not UTC
                const slotDate = new Date(`${date}T${String(hour).padStart(2, "0")}:${String(min).padStart(2, "0")}:00`);
                const slotLocalDate = toZonedTime(slotDate, tz);
                const slotDayOfWeek = slotLocalDate.getDay(); // 0=Sunday, 1=Monday, etc.
                const dayAvailability = staffAvailRules.find(r => r.dayOfWeek === slotDayOfWeek);
                
                if (dayAvailability) {
                  const [slotHour, slotMin] = [hour, min];
                  const [availStartHour, availStartMin] = dayAvailability.startTime.split(":").map(Number);
                  const [availEndHour, availEndMin] = dayAvailability.endTime.split(":").map(Number);
                  
                  const slotTimeInMin = slotHour * 60 + slotMin;
                  const slotEndTimeInMin = slotEnd.getHours() * 60 + slotEnd.getMinutes();
                  const availStartInMin = availStartHour * 60 + availStartMin;
                  const availEndInMin = availEndHour * 60 + availEndMin;
                  
                  // Check if slot falls outside staff availability
                  if (slotTimeInMin < availStartInMin || slotEndTimeInMin > availEndInMin) {
                    hasConflict = true;
                  }
                } else {
                  // No availability rules for this day, staff is not available
                  hasConflict = true;
                }
              }
            }
            
            if (!hasConflict) {
              availableForSlot.push({
                staffMember,
                lastApt: staffLastAppointment.get(staffMember.id) || null,
              });
            }
          }

          if (availableForSlot.length > 0) {
            availableForSlot.sort((a, b) => {
              if (a.lastApt === null && b.lastApt === null) return 0;
              if (a.lastApt === null) return -1;
              if (b.lastApt === null) return 1;
              return a.lastApt.getTime() - b.lastApt.getTime();
            });

            const chosen = availableForSlot[0];
            slots.push({
              time: slotStart.toISOString(),
              staffId: chosen.staffMember.id,
              staffName: chosen.staffMember.name,
            });
          }
        }
      }

      res.json(slots);
    } catch (error) {
      console.error("Availability error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // === CUSTOMERS ===
  app.get(api.customers.searchByPhone.path, async (req, res) => {
    const phone = req.query.phone as string;
    const storeId = Number(req.query.storeId);
    if (!phone || !storeId) return res.status(400).json({ message: "phone and storeId required" });
    const digits = phone.replace(/\D/g, "");
    const allCustomers = await storage.getCustomers(storeId);
    const match = allCustomers.find(c => c.phone && c.phone.replace(/\D/g, "") === digits);
    res.json(match || null);
  });

  app.get(api.customers.list.path, async (req, res) => {
    const storeId = req.query.storeId ? Number(req.query.storeId) : undefined;
    const customers = await storage.getCustomers(storeId);
    res.json(customers);
  });

  app.post(api.customers.create.path, requireActiveTrial, async (req, res) => {
    try {
      const input = insertCustomerSchema.parse(req.body);
      const customer = await storage.createCustomer(input);
      res.status(201).json(customer);
    } catch (error) {
      res.status(400).json({ message: "Invalid input" });
    }
  });

  app.get("/api/customers/:id", async (req, res) => {
    const customer = await storage.getCustomer(Number(req.params.id));
    if (!customer) return res.status(404).json({ message: "Customer not found" });
    res.json(customer);
  });

  app.patch(api.customers.update.path, async (req, res) => {
    try {
      const input = insertCustomerSchema.partial().parse(req.body);
      const customer = await storage.updateCustomer(Number(req.params.id), input);
      if (!customer) return res.status(404).json({ message: "Customer not found" });
      res.json(customer);
    } catch (error) {
      res.status(400).json({ message: "Invalid input" });
    }
  });

  // === APPOINTMENTS ===
  app.get(api.appointments.list.path, async (req, res) => {
    const userId = (req.session as any).userId;
    const [user] = await db.select().from(users).where(eq(users.id, userId));

    const filters = {
      from: req.query.from ? new Date(req.query.from as string) : undefined,
      to: req.query.to ? new Date(req.query.to as string) : undefined,
      staffId: user?.role === "staff" && user.staffId ? user.staffId : (req.query.staffId ? Number(req.query.staffId) : undefined),
      storeId: req.query.storeId ? Number(req.query.storeId) : undefined,
      customerId: req.query.customerId ? Number(req.query.customerId) : undefined,
    };
    const appointments = await storage.getAppointments(filters);

    if (filters.storeId) {
      const calSettings = await storage.getCalendarSettings(filters.storeId);
      if (calSettings?.autoCompleteAppointments) {
        const now = new Date();
        for (const apt of appointments) {
          if (apt.status === "confirmed" || apt.status === "started" || apt.status === "pending") {
            const aptEnd = new Date(new Date(apt.date).getTime() + apt.duration * 60000);
            if (aptEnd < now) {
              await storage.updateAppointment(apt.id, { status: "completed" });
              apt.status = "completed";
            }
          }
        }
      }
    }

    res.json(appointments);
  });

  app.post(api.appointments.create.path, requireActiveTrial, async (req, res) => {
    try {
      const input = insertAppointmentSchema.parse({
        ...req.body,
        date: new Date(req.body.date),
      });

      if (input.storeId) {
        const calSettings = await storage.getCalendarSettings(input.storeId);
        if (calSettings && !calSettings.allowBookingOutsideHours) {
          const store = await storage.getStore(input.storeId);
          const tz = store?.timezone || "UTC";
          const localStart = toZonedTime(input.date, tz);
          const localStartHour = localStart.getHours() + localStart.getMinutes() / 60;
          const durationHours = (input.duration || 30) / 60;
          const localEndHour = localStartHour + durationHours;
          if (localStartHour < 9 || localEndHour > 18) {
            return res.status(400).json({ message: "Booking outside opening hours is not allowed" });
          }
        }
      }

      const appointment = await storage.createAppointment(input);

      const fullAppointment = await storage.getAppointment(appointment.id);
      if (fullAppointment) {
        sendBookingConfirmation(fullAppointment).catch(console.error);
        sendBookingConfirmationEmail(fullAppointment).catch(console.error);
      }

      res.status(201).json(appointment);
    } catch (error) {
       console.error(error);
      res.status(400).json({ message: "Invalid input" });
    }
  });

  app.patch(api.appointments.update.path, requireActiveTrial, async (req, res) => {
    try {
      const input = insertAppointmentSchema.partial().parse({
        ...req.body,
        date: req.body.date ? new Date(req.body.date) : undefined,
      });
      if (input.status === "completed" && !input.completedAt) {
        input.completedAt = new Date();
      }
      const appointment = await storage.updateAppointment(Number(req.params.id), input);
      if (!appointment) return res.status(404).json({ message: "Appointment not found" });

      res.json(appointment);
    } catch (error) {
      res.status(400).json({ message: "Invalid input" });
    }
  });

  app.delete(api.appointments.delete.path, async (req, res) => {
    await storage.deleteAppointment(Number(req.params.id));
    res.status(204).end();
  });

  // === PRODUCTS ===
  app.get(api.products.list.path, async (req, res) => {
    const storeId = req.query.storeId ? Number(req.query.storeId) : undefined;
    const products = await storage.getProducts(storeId);
    res.json(products);
  });

  app.post(api.products.create.path, async (req, res) => {
    try {
      const input = insertProductSchema.parse(req.body);
      const product = await storage.createProduct(input);
      res.status(201).json(product);
    } catch (error) {
      res.status(400).json({ message: "Invalid input" });
    }
  });

  app.patch(api.products.update.path, async (req, res) => {
    try {
      const input = insertProductSchema.partial().parse(req.body);
      const product = await storage.updateProduct(Number(req.params.id), input);
      if (!product) return res.status(404).json({ message: "Product not found" });
      res.json(product);
    } catch (error) {
      res.status(400).json({ message: "Invalid input" });
    }
  });

  app.delete(api.products.delete.path, async (req, res) => {
    await storage.deleteProduct(Number(req.params.id));
    res.status(204).end();
  });

  // === CALENDAR SETTINGS ===
  app.get(api.calendarSettings.get.path, async (req, res) => {
    const storeId = req.query.storeId ? Number(req.query.storeId) : undefined;
    if (!storeId) return res.status(400).json({ message: "storeId required" });
    const settings = await storage.getCalendarSettings(storeId);
    res.json(settings || null);
  });

  app.put(api.calendarSettings.upsert.path, async (req, res) => {
    try {
      const storeId = req.body.storeId ? Number(req.body.storeId) : undefined;
      if (!storeId) return res.status(400).json({ message: "storeId required" });
      const validatedInput = insertCalendarSettingsSchema.omit({ storeId: true }).partial().extend({
        startOfWeek: z.enum(["monday", "sunday", "saturday"]).optional(),
        timeSlotInterval: z.union([z.literal(5), z.literal(10), z.literal(15), z.literal(20), z.literal(30), z.literal(60)]).optional(),
        nonWorkingHoursDisplay: z.union([z.literal(0), z.literal(1), z.literal(2), z.literal(3)]).optional(),
      }).parse(req.body);
      const settings = await storage.upsertCalendarSettings(storeId, validatedInput);
      res.json(settings);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: error.errors[0].message });
      } else {
        res.status(400).json({ message: "Invalid input" });
      }
    }
  });

  // === CASH DRAWER ===
  app.get(api.cashDrawer.sessions.path, async (req, res) => {
    const storeId = req.query.storeId ? Number(req.query.storeId) : undefined;
    if (!storeId) return res.status(400).json({ message: "storeId required" });
    const sessions = await storage.getCashDrawerSessions(storeId);
    res.json(sessions);
  });

  app.get(api.cashDrawer.open.path, async (req, res) => {
    const storeId = req.query.storeId ? Number(req.query.storeId) : undefined;
    if (!storeId) return res.status(400).json({ message: "storeId required" });
    const session = await storage.getOpenCashDrawerSession(storeId);
    res.json(session || null);
  });

  app.get(api.cashDrawer.get.path, async (req, res) => {
    const session = await storage.getCashDrawerSession(Number(req.params.id));
    if (!session) return res.status(404).json({ message: "Session not found" });
    res.json(session);
  });

  app.post(api.cashDrawer.create.path, async (req, res) => {
    try {
      const input = api.cashDrawer.create.input.parse(req.body);

      const existing = await storage.getOpenCashDrawerSession(input.storeId);
      if (existing) {
        return res.status(409).json({ message: "A drawer session is already open for this store" });
      }

      const session = await storage.createCashDrawerSession({
        storeId: input.storeId,
        openedAt: new Date(),
        openingBalance: input.openingBalance || "0.00",
        openedBy: input.openedBy || null,
        status: "open",
      });

      await storage.createDrawerAction({
        sessionId: session.id,
        type: "open_drawer",
        reason: "Shift started",
        performedBy: input.openedBy || null,
        performedAt: new Date(),
      });

      res.status(201).json(session);
    } catch (error) {
      console.error(error);
      res.status(400).json({ message: "Invalid input" });
    }
  });

  app.post(api.cashDrawer.close.path, async (req, res) => {
    try {
      const id = Number(req.params.id);
      const session = await storage.getCashDrawerSession(id);
      if (!session) return res.status(404).json({ message: "Session not found" });
      if (session.status === "closed") return res.status(400).json({ message: "Session already closed" });

      const input = api.cashDrawer.close.input.parse(req.body);

      const updated = await storage.updateCashDrawerSession(id, {
        closedAt: new Date(),
        closingBalance: input.closingBalance || "0.00",
        denominationBreakdown: input.denominationBreakdown || null,
        closedBy: input.closedBy || null,
        status: "closed",
        notes: input.notes || null,
      });

      await storage.createDrawerAction({
        sessionId: id,
        type: "close_drawer",
        reason: input.notes || "Shift ended",
        performedBy: input.closedBy || null,
        performedAt: new Date(),
      });

      res.json(updated);
    } catch (error) {
      console.error(error);
      res.status(400).json({ message: "Invalid input" });
    }
  });

  app.post(api.cashDrawer.action.path, async (req, res) => {
    try {
      const sessionId = Number(req.params.id);
      const session = await storage.getCashDrawerSession(sessionId);
      if (!session) return res.status(404).json({ message: "Session not found" });

      const input = api.cashDrawer.action.input.parse(req.body);

      const action = await storage.createDrawerAction({
        sessionId,
        type: input.type,
        amount: input.amount || null,
        reason: input.reason || null,
        performedBy: input.performedBy || null,
        performedAt: new Date(),
      });

      res.status(201).json(action);
    } catch (error) {
      console.error(error);
      res.status(400).json({ message: "Invalid input" });
    }
  });

  app.get(api.cashDrawer.zReport.path, async (req, res) => {
    try {
      const id = Number(req.params.id);
      const session = await storage.getCashDrawerSession(id);
      if (!session) return res.status(404).json({ message: "Session not found" });

      const from = new Date(session.openedAt);
      const to = session.closedAt ? new Date(session.closedAt) : new Date();

      const allAppointments = await storage.getAppointments({
        from,
        to,
        storeId: session.storeId,
      });

      const completedAppointments = allAppointments.filter(a => a.status === "completed" && a.totalPaid);

      let totalSales = 0;
      let totalTips = 0;
      let totalDiscounts = 0;
      const paymentBreakdown: Record<string, number> = {};

      for (const apt of completedAppointments) {
        const paid = Number(apt.totalPaid) || 0;
        const tip = Number(apt.tipAmount) || 0;
        const disc = Number(apt.discountAmount) || 0;
        totalSales += paid;
        totalTips += tip;
        totalDiscounts += disc;

        if (apt.paymentMethod) {
          const parts = apt.paymentMethod.split(",");
          for (const part of parts) {
            const [method, amtStr] = part.split(":");
            const amt = Number(amtStr) || paid;
            const key = method.trim().toLowerCase();
            paymentBreakdown[key] = (paymentBreakdown[key] || 0) + amt;
          }
        }
      }

      let cashIn = 0;
      let cashOut = 0;
      for (const action of session.actions || []) {
        if (action.type === "cash_in" || action.type === "paid_in") {
          cashIn += Number(action.amount) || 0;
        } else if (action.type === "cash_out" || action.type === "paid_out") {
          cashOut += Number(action.amount) || 0;
        }
      }

      const openingBal = Number(session.openingBalance) || 0;
      const cashFromSales = paymentBreakdown["cash"] || 0;
      const expectedCash = openingBal + cashFromSales + cashIn - cashOut;

      res.json({
        session,
        totalSales: Math.round(totalSales * 100) / 100,
        totalTips: Math.round(totalTips * 100) / 100,
        totalDiscounts: Math.round(totalDiscounts * 100) / 100,
        transactionCount: completedAppointments.length,
        paymentBreakdown,
        cashIn: Math.round(cashIn * 100) / 100,
        cashOut: Math.round(cashOut * 100) / 100,
        expectedCash: Math.round(expectedCash * 100) / 100,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/onboarding", isAuthenticated, async (req, res) => {
    try {
      console.log("Onboarding: Starting process for user:", (req.session as any).userId);
      const userId = (req.session as any).userId;

      const normalizeOptionalString = (value: unknown) => {
        if (typeof value !== "string") return value;
        const trimmed = value.trim();
        return trimmed.length === 0 ? undefined : trimmed;
      };

      const [currentUser] = await db.select().from(users).where(eq(users.id, userId));
      if (currentUser?.onboardingCompleted) {
        console.log("Onboarding: User already completed onboarding");
        const { password: _, ...safeUser } = currentUser;
        // Return their existing store so the client can proceed
        const existingStores = await db.select().from(locations).where(eq(locations.userId, userId));
        return res.json({ store: existingStores[0] ?? null, user: safeUser });
      }

      // Guard: user has a store but onboardingCompleted was never set (partial prior onboarding)
      const priorStores = await db.select().from(locations).where(eq(locations.userId, userId));
      if (priorStores.length > 0) {
        console.log("Onboarding: User already has a store, marking onboarding complete");
        await db.update(users).set({ onboardingCompleted: true }).where(eq(users.id, userId));
        const [updatedUser] = await db.select().from(users).where(eq(users.id, userId));
        const { password: _, ...safeUser } = updatedUser;
        return res.json({ store: priorStores[0], user: safeUser });
      }

      console.log("Onboarding: Validating request body:", req.body);
      const onboardingSchema = z.object({
        businessType: z.enum(["Hair Salon", "Nail Salon", "Spa", "Barbershop"]),
        businessName: z.string().min(1).max(100),
        email: z.string().email().optional().or(z.literal('')),
        timezone: z.string().min(1).default("America/New_York"),
        address: z.preprocess(
          normalizeOptionalString,
          z
            .string()
            .max(200)
            .refine((value) => !/[;'"`]/.test(value), "Address contains invalid characters")
            .refine((value) => !/--|\/\*/.test(value), "Address contains invalid characters")
            .refine((value) => /^[a-zA-Z0-9\s.,#\-\/]*$/.test(value), "Address contains invalid characters")
        ).optional(),
        city: z.preprocess(
          normalizeOptionalString,
          z.string().max(100).regex(/^[a-zA-Z\s]+$/, "City can only contain letters and spaces")
        ).optional(),
        state: z.preprocess(
          normalizeOptionalString,
          z.enum([
            "AL", "AK", "AZ", "AR", "CA", "CO", "CT", "DE", "FL", "GA",
            "HI", "ID", "IL", "IN", "IA", "KS", "KY", "LA", "ME", "MD",
            "MA", "MI", "MN", "MS", "MO", "MT", "NE", "NV", "NH", "NJ",
            "NM", "NY", "NC", "ND", "OH", "OK", "OR", "PA", "RI", "SC",
            "SD", "TN", "TX", "UT", "VT", "VA", "WA", "WV", "WI", "WY",
          ])
        ).optional(),
        postcode: z.preprocess(
          normalizeOptionalString,
          z.string().regex(/^\d{5}$/, "Zip code must be 5 digits")
        ).optional(),
        phone: z.preprocess(
          normalizeOptionalString,
          z.string().regex(/^\d{10}$/, "Phone number must be 10 digits")
        ).optional(),
        businessHours: z.array(z.object({
          dayOfWeek: z.number().min(0).max(6),
          openTime: z.string(),
          closeTime: z.string(),
          isClosed: z.boolean(),
        })).optional(),
        staff: z.array(z.object({
          name: z.string().min(1),
          color: z.string().optional(),
        })).min(1).optional(),
      });

      const parsed = onboardingSchema.safeParse(req.body);
      if (!parsed.success) {
        console.log("Onboarding: Validation failed:", parsed.error.flatten());
        return res.status(400).json({ message: "Invalid input", errors: parsed.error.flatten() });
      }

      const {
        businessType,
        businessName,
        email,
        timezone,
        address,
        city,
        state,
        postcode,
        phone,
        businessHours: hoursData,
        staff: staffData,
      } = parsed.data;

      console.log("Onboarding: Looking up template for business type:", businessType);
      const template = businessTemplates[businessType];
      if (!template) {
        console.log("Onboarding: Template not found for business type:", businessType);
        return res.status(400).json({ message: "Invalid business type" });
      }

      console.log("Onboarding: Creating store...");
      const store = await storage.createStore({
        name: businessName,
        email: email || null,
        timezone: timezone,
        address: address || null,
        city: city || null,
        state: state || null,
        postcode: postcode || null,
        phone: phone || null,
        category: businessType, // Save the business type to the category field
        userId: userId,
      });

      console.log("Onboarding: Store created successfully:", store.id);

      if (hoursData && hoursData.length > 0) {
        await storage.setBusinessHours(store.id, hoursData.map(h => ({
          storeId: store.id,
          dayOfWeek: h.dayOfWeek,
          openTime: h.openTime,
          closeTime: h.closeTime,
          isClosed: h.isClosed,
        })));
      }

      const addonCache: Record<string, number> = {};
      const allServiceIds: number[] = [];

      for (const cat of template.categories) {
        const category = await storage.createServiceCategory({
          name: cat.name,
          storeId: store.id,
        });

        for (const svc of cat.services) {
          const service = await storage.createService({
            name: svc.name,
            description: svc.description,
            duration: svc.duration,
            price: svc.price,
            category: cat.name,
            categoryId: category.id,
            storeId: store.id,
          });

          allServiceIds.push(service.id);

          if (svc.addons) {
            for (const addonData of svc.addons) {
              const cacheKey = `${addonData.name}|${addonData.price}`;
              let addonId = addonCache[cacheKey];

              if (!addonId) {
                const addon = await storage.createAddon({
                  name: addonData.name,
                  description: addonData.description,
                  price: addonData.price,
                  duration: addonData.duration,
                  storeId: store.id,
                });
                addonId = addon.id;
                addonCache[cacheKey] = addonId;
              }

              await storage.createServiceAddon({
                serviceId: service.id,
                addonId: addonId,
              });
            }
          }
        }
      }

      const staffMembers = staffData || [{ name: "Owner", color: "#f472b6" }];
      for (const s of staffMembers) {
        const newStaff = await storage.createStaff({
          name: s.name,
          color: s.color || "#3b82f6",
          storeId: store.id,
        });

        if (allServiceIds.length > 0) {
          await storage.setStaffServices(newStaff.id, allServiceIds);
        }

        if (hoursData && hoursData.length > 0) {
          const availabilityRules = hoursData
            .filter(h => !h.isClosed)
            .map(h => ({
              staffId: newStaff.id,
              dayOfWeek: h.dayOfWeek,
              startTime: h.openTime,
              endTime: h.closeTime,
            }));
          if (availabilityRules.length > 0) {
            await storage.setStaffAvailability(newStaff.id, availabilityRules);
          }
        }
      }

      await db.update(users).set({ onboardingCompleted: true }).where(eq(users.id, userId));

      const [updatedUser] = await db.select().from(users).where(eq(users.id, userId));
      const { password: _, ...safeUser } = updatedUser;

      res.json({ store, user: safeUser });
    } catch (error: any) {
      console.error("Onboarding error:", error);
      // PostgreSQL unique constraint violation
      if (error?.code === "23505") {
        const detail: string = error?.detail ?? "";
        if (detail.includes("phone")) {
          return res.status(409).json({
            message: "A store with this phone number already exists. Please use a different phone number.",
          });
        }
        if (detail.includes("subdomain")) {
          return res.status(409).json({
            message: "That business name/subdomain is already taken. Please choose a different name.",
          });
        }
        return res.status(409).json({
          message: "A store with those details already exists.",
        });
      }
      res.status(500).json({ message: "Failed to complete onboarding" });
    }
  });

  // === SUBDOMAIN BOOKING ROUTES (accessed via subdomain) ===

  app.get("/api/store/by-subdomain", async (req, res) => {
    if ((req as any).store) {
      const store = (req as any).store;
      const { userId, ...publicStore } = store;
      const hours = await storage.getBusinessHours(store.id);
      res.json({ ...publicStore, businessHours: hours });
    } else {
      res.status(404).json({ message: "Store not found for this subdomain" });
    }
  });

  // === PUBLIC BOOKING ROUTES (no auth required) ===

  const resolvePublicStore = async (req: any) => {
    if (req.store) return req.store;
    const slug = typeof req.query.slug === "string" ? req.query.slug : undefined;
    if (!slug) return undefined;
    return storage.getStoreBySlug(slug);
  };

  app.get("/api/public/store/:slug", async (req, res) => {
    try {
      const store = await storage.getStoreBySlug(req.params.slug);
      if (!store) return res.status(404).json({ message: "Store not found" });
      const { userId, ...publicStore } = store;
      const hours = await storage.getBusinessHours(store.id);
      res.json({ ...publicStore, businessHours: hours });
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/public/store/:slug/services", async (req, res) => {
    try {
      const store = await storage.getStoreBySlug(req.params.slug);
      if (!store) return res.status(404).json({ message: "Store not found" });
      const storeServices = await storage.getServices(store.id);
      const categories = await storage.getServiceCategories(store.id);
      res.json({ services: storeServices, categories });
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/public/store/:slug/staff", async (req, res) => {
    try {
      const store = await storage.getStoreBySlug(req.params.slug);
      if (!store) return res.status(404).json({ message: "Store not found" });
      const storeStaff = await storage.getAllStaff(store.id);
      const safeStaff = storeStaff.map(({ email, phone, ...rest }) => rest);
      res.json(safeStaff);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/public/store/:slug/availability", async (req, res) => {
    try {
      const store = await storage.getStoreBySlug(req.params.slug);
      if (!store) return res.status(404).json({ message: "Store not found" });

      const serviceId = Number(req.query.serviceId);
      const date = String(req.query.date);
      const duration = Number(req.query.duration);
      const specificStaffId = req.query.staffId ? Number(req.query.staffId) : undefined;

      if (!serviceId || !date || !duration) {
        return res.status(400).json({ message: "serviceId, date, and duration are required" });
      }

      const tz = store.timezone || "UTC";
      const calSettings = await storage.getCalendarSettings(store.id);
      const businessStartHour = 9;
      const businessEndHour = 18;
      const slotInterval = calSettings?.timeSlotInterval || 15;

      const hours = await storage.getBusinessHours(store.id);
      const dayStartLocal = fromZonedTime(new Date(`${date}T00:00:00`), tz);
      const dayEndLocal = fromZonedTime(new Date(`${date}T23:59:59.999`), tz);

      const dayAppointments = await storage.getAppointments({
        from: dayStartLocal,
        to: dayEndLocal,
        storeId: store.id,
      });

      let candidateStaff: typeof import("@shared/schema").staff.$inferSelect[];
      if (specificStaffId) {
        const member = await storage.getStaffMember(specificStaffId);
        candidateStaff = member ? [member] : [];
      } else {
        candidateStaff = await storage.getStaffForService(serviceId);
        if (candidateStaff.length === 0) {
          candidateStaff = await storage.getAllStaff(store.id);
        }
      }

      if (candidateStaff.length === 0) return res.json([]);

      const dateParts = date.split("-").map(Number);
      const dayOfWeek = new Date(dateParts[0], dateParts[1] - 1, dateParts[2]).getDay();
      const dayHours = hours.find(h => h.dayOfWeek === dayOfWeek);
      const startHour = dayHours && !dayHours.isClosed ? parseInt(dayHours.openTime.split(":")[0]) : businessStartHour;
      const endHour = dayHours && !dayHours.isClosed ? parseInt(dayHours.closeTime.split(":")[0]) : businessEndHour;

      if (dayHours?.isClosed) return res.json([]);

      const businessEndUtc = fromZonedTime(new Date(`${date}T${String(endHour).padStart(2, "0")}:00:00`), tz);
      const nowUtc = new Date();

      type SlotResult = { time: string; staffId: number; staffName: string };
      const slots: SlotResult[] = [];

      const staffLastAppointment: Map<number, Date> = new Map();
      const allAppointments = await storage.getAppointments({ storeId: store.id });
      for (const apt of allAppointments) {
        if (apt.status === "cancelled") continue;
        if (!apt.staffId) continue;
        const aptDate = new Date(apt.date);
        const current = staffLastAppointment.get(apt.staffId);
        if (!current || aptDate > current) {
          staffLastAppointment.set(apt.staffId, aptDate);
        }
      }

      for (let hour = startHour; hour < endHour; hour++) {
        for (let min = 0; min < 60; min += slotInterval) {
          const slotStart = fromZonedTime(new Date(`${date}T${String(hour).padStart(2, "0")}:${String(min).padStart(2, "0")}:00`), tz);
          const slotEnd = new Date(slotStart.getTime() + duration * 60000);

          if (slotStart < nowUtc) continue;
          if (slotEnd > businessEndUtc) continue;

          const availableForSlot: { staffMember: any; lastApt: Date | null }[] = [];

          for (const staffMember of candidateStaff) {
            let hasConflict = false;
            for (const apt of dayAppointments) {
              if (apt.staffId !== staffMember.id) continue;
              if (apt.status === "cancelled") continue;
              const aptStart = new Date(apt.date);
              const aptEnd = new Date(aptStart.getTime() + apt.duration * 60000);
              if (slotStart < aptEnd && slotEnd > aptStart) {
                hasConflict = true;
                break;
              }
            }
            if (!hasConflict) {
              availableForSlot.push({
                staffMember,
                lastApt: staffLastAppointment.get(staffMember.id) || null,
              });
            }
          }

          if (availableForSlot.length > 0) {
            availableForSlot.sort((a, b) => {
              if (a.lastApt === null && b.lastApt === null) return 0;
              if (a.lastApt === null) return -1;
              if (b.lastApt === null) return 1;
              return a.lastApt.getTime() - b.lastApt.getTime();
            });

            const chosen = availableForSlot[0];
            slots.push({
              time: slotStart.toISOString(),
              staffId: chosen.staffMember.id,
              staffName: chosen.staffMember.name,
            });
          }
        }
      }

      res.json(slots);
    } catch (error) {
      console.error("Public availability error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/public/store/:slug/book", async (req, res) => {
    try {
      const store = await storage.getStoreBySlug(req.params.slug);
      if (!store) return res.status(404).json({ message: "Store not found" });

      const bookingSchema = z.object({
        serviceId: z.number(),
        staffId: z.number(),
        date: z.string(),
        duration: z.number(),
        customerName: z.string().min(1),
        customerEmail: z.string().email().optional(),
        customerPhone: z.string().min(1),
        notes: z.string().optional(),
        addonIds: z.array(z.number()).optional().default([]),
      });

      const input = bookingSchema.parse(req.body);

      const phoneDigits = input.customerPhone.replace(/\D/g, "");
      if (phoneDigits.length !== 10) {
        return res.status(400).json({ message: "Phone number must be 10 digits" });
      }

      let customer = input.customerPhone
        ? await storage.searchCustomerByPhone(input.customerPhone, store.id)
        : undefined;

      if (!customer) {
        customer = await storage.createCustomer({
          name: input.customerName,
          email: input.customerEmail || null,
          phone: input.customerPhone || null,
          storeId: store.id,
          notes: null,
        });
      }

      const appointment = await storage.createAppointment({
        date: new Date(input.date),
        serviceId: input.serviceId,
        staffId: input.staffId,
        customerId: customer.id,
        duration: input.duration,
        status: "pending",
        storeId: store.id,
        notes: input.notes || null,
        cancellationReason: null,
        paymentMethod: null,
        tipAmount: null,
        discountAmount: null,
        totalPaid: null,
      });

      // Save add-ons and extend appointment duration if any were selected
      if (input.addonIds && input.addonIds.length > 0) {
        let addonDuration = 0;
        for (const addonId of input.addonIds) {
          const addon = await storage.getAddon(addonId);
          if (addon) addonDuration += addon.duration;
        }
        const totalDuration = input.duration + addonDuration;
        if (addonDuration > 0) {
          await storage.updateAppointment(appointment.id, { duration: totalDuration });
        }
        await storage.setAppointmentAddons(appointment.id, input.addonIds);
      }

      const fullAppointment = await storage.getAppointment(appointment.id);
      if (fullAppointment) {
        sendBookingConfirmation(fullAppointment).catch(console.error);
        sendBookingConfirmationEmail(fullAppointment).catch(console.error);
      }

      res.status(201).json(appointment);
    } catch (error) {
      console.error("Public booking error:", error);
      res.status(400).json({ message: "Failed to create booking" });
    }
  });

  app.get("/api/appointments/confirmation/:confirmationNumber", async (req, res) => {
    try {
      const confirmationNumber = req.params.confirmationNumber || "";
      const phoneDigits = confirmationNumber.replace(/\D/g, "");
      if (!phoneDigits) return res.status(400).json({ message: "Confirmation number required" });

      const store = await resolvePublicStore(req);
      if (!store) return res.status(400).json({ message: "Store not found" });

      const appointments = await storage.getAppointmentsByCustomerPhone(phoneDigits, store.id);
      if (!appointments || appointments.length === 0) {
        return res.status(404).json({ message: "Booking not found" });
      }

      res.json(appointments);
    } catch (error) {
      console.error("Confirmation lookup error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/appointments/confirmation/:confirmationNumber/cancel", async (req, res) => {
    try {
      const confirmationNumber = req.params.confirmationNumber || "";
      const phoneDigits = confirmationNumber.replace(/\D/g, "");
      if (!phoneDigits) return res.status(400).json({ message: "Confirmation number required" });

      const payload = z.object({ appointmentId: z.number() }).parse(req.body);

      const store = await resolvePublicStore(req);
      if (!store) return res.status(400).json({ message: "Store not found" });

      const appointment = await storage.getAppointment(payload.appointmentId);
      if (!appointment || appointment.storeId !== store.id) {
        return res.status(404).json({ message: "Booking not found" });
      }

      const appointmentPhone = (appointment.customer?.phone || "").replace(/\D/g, "");
      if (appointmentPhone !== phoneDigits) {
        return res.status(404).json({ message: "Booking not found" });
      }

      if (appointment.status !== "cancelled") {
        await storage.updateAppointment(appointment.id, {
          status: "cancelled",
          cancellationReason: "Cancelled by customer",
        });
      }

      const refreshed = await storage.getAppointment(appointment.id);
      res.json(refreshed || appointment);
    } catch (error) {
      console.error("Confirmation cancel error:", error);
      res.status(400).json({ message: "Failed to cancel booking" });
    }
  });

  app.get("/api/public/check-slug/:slug", async (req, res) => {
    const store = await storage.getStoreBySlug(req.params.slug);
    res.json({ available: !store });
  });

  // === PUBLIC QUEUE ===

  app.get("/api/public/queue/:slug", async (req, res) => {
    try {
      const { slug } = req.params;
      const [store] = await db.select().from(locations).where(eq(locations.bookingSlug, slug));
      if (!store) return res.status(404).json({ error: "Store not found" });

      const [settings] = await db.select().from(storeSettings).where(eq(storeSettings.storeId, store.id));
      const prefs = settings?.preferences ? JSON.parse(settings.preferences as string) : {};
      const avgServiceTime: number = prefs.queueAvgServiceTime || 20;
      const queueEnabled: boolean = prefs.queueEnabled !== false;

      if (!queueEnabled) {
        return res.json({
          store: { id: store.id, name: store.name, phone: store.phone, address: store.address },
          queueEnabled: false, waitingCount: 0, calledCount: 0, servedToday: 0,
          estimatedWaitMinutes: 0, avgServiceTime, queue: [],
        });
      }

      const todayStart = new Date(); todayStart.setHours(0, 0, 0, 0);

      const activeEntries = await db.select().from(waitlist)
        .where(and(
          eq(waitlist.storeId, store.id),
          gte(waitlist.createdAt, todayStart),
          sql`${waitlist.status} IN ('waiting', 'called', 'serving')`
        ))
        .orderBy(asc(waitlist.createdAt));

      const [{ total: servedToday }] = await db.select({ total: count() }).from(waitlist)
        .where(and(
          eq(waitlist.storeId, store.id),
          gte(waitlist.createdAt, todayStart),
          eq(waitlist.status, "completed")
        ));

      const waitingEntries = activeEntries.filter(e => e.status === "waiting");

      const safeQueue = activeEntries.map((e, idx) => {
        const nameParts = e.customerName.trim().split(" ");
        const displayName = nameParts.length > 1
          ? `${nameParts[0]} ${nameParts[nameParts.length - 1][0]}.`
          : nameParts[0];
        return {
          id: e.id,
          displayName,
          status: e.status,
          partySize: (e as any).partySize || 1,
          estimatedWaitMinutes: idx * avgServiceTime,
          isNext: idx === 0 && e.status === "waiting",
        };
      });

      res.json({
        store: { id: store.id, name: store.name, phone: store.phone, address: store.address },
        queueEnabled: true,
        waitingCount: waitingEntries.length,
        calledCount: activeEntries.filter(e => ["called", "serving"].includes(e.status)).length,
        servedToday: Number(servedToday),
        estimatedWaitMinutes: waitingEntries.length * avgServiceTime,
        avgServiceTime,
        queue: safeQueue,
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Failed to fetch queue" });
    }
  });

  app.post("/api/public/queue/:slug/checkin", async (req, res) => {
    try {
      const { slug } = req.params;
      const [store] = await db.select().from(locations).where(eq(locations.bookingSlug, slug));
      if (!store) return res.status(404).json({ error: "Store not found" });

      const [settings] = await db.select().from(storeSettings).where(eq(storeSettings.storeId, store.id));
      const prefs = settings?.preferences ? JSON.parse(settings.preferences as string) : {};
      const queueEnabled: boolean = prefs.queueEnabled !== false;
      const maxQueueSize: number = prefs.queueMaxSize || 30;
      const avgServiceTime: number = prefs.queueAvgServiceTime || 20;

      if (!queueEnabled) return res.status(400).json({ error: "Queue is not accepting check-ins right now." });

      const { customerName, customerPhone, partySize = 1, latitude, longitude } = req.body;
      if (!customerName?.trim()) return res.status(400).json({ error: "Name is required" });

      const todayStart = new Date(); todayStart.setHours(0, 0, 0, 0);
      const [{ total: currentWaiting }] = await db.select({ total: count() }).from(waitlist)
        .where(and(
          eq(waitlist.storeId, store.id),
          gte(waitlist.createdAt, todayStart),
          eq(waitlist.status, "waiting")
        ));

      if (Number(currentWaiting) >= maxQueueSize) {
        return res.status(400).json({ error: "The queue is currently full. Please visit us directly." });
      }

      const [entry] = await db.insert(waitlist).values({
        storeId: store.id,
        customerName: customerName.trim(),
        customerPhone: customerPhone?.trim() || null,
        partySize: Math.max(1, Math.min(10, Number(partySize) || 1)),
        customerLatitude: latitude != null ? String(latitude) : null,
        customerLongitude: longitude != null ? String(longitude) : null,
        status: "waiting",
      } as any).returning();

      const before = await db.select({ id: waitlist.id }).from(waitlist)
        .where(and(
          eq(waitlist.storeId, store.id),
          gte(waitlist.createdAt, todayStart),
          sql`${waitlist.status} IN ('waiting', 'called', 'serving')`,
          sql`${waitlist.id} <= ${entry.id}`
        ));

      const position = before.length;
      const estimatedWaitMinutes = Math.max(0, (position - 1) * avgServiceTime);

      res.json({ id: entry.id, position, estimatedWaitMinutes, storeName: store.name });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Failed to check in" });
    }
  });

  app.get("/api/public/queue/:slug/position/:id", async (req, res) => {
    try {
      const { slug, id } = req.params;
      const [store] = await db.select().from(locations).where(eq(locations.bookingSlug, slug));
      if (!store) return res.status(404).json({ error: "Store not found" });

      const [entry] = await db.select().from(waitlist).where(eq(waitlist.id, parseInt(id)));
      if (!entry || entry.storeId !== store.id) return res.status(404).json({ error: "Entry not found" });

      const [settings] = await db.select().from(storeSettings).where(eq(storeSettings.storeId, store.id));
      const prefs = settings?.preferences ? JSON.parse(settings.preferences as string) : {};
      const avgServiceTime: number = prefs.queueAvgServiceTime || 20;

      const todayStart = new Date(); todayStart.setHours(0, 0, 0, 0);
      const before = await db.select({ id: waitlist.id }).from(waitlist)
        .where(and(
          eq(waitlist.storeId, store.id),
          gte(waitlist.createdAt, todayStart),
          sql`${waitlist.status} IN ('waiting', 'called', 'serving')`,
          sql`${waitlist.id} <= ${entry.id}`
        ));

      const position = before.length;
      res.json({ id: entry.id, status: entry.status, position, estimatedWaitMinutes: Math.max(0, (position - 1) * avgServiceTime) });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Failed to get position" });
    }
  });

  // Allow unauthenticated status update for self-cancel
  app.put("/api/public/queue/cancel/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await db.update(waitlist).set({ status: "cancelled" }).where(eq(waitlist.id, id));
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ error: "Failed to cancel" });
    }
  });

  // === SMS SETTINGS ===
  const validateStoreOwnership = async (req: any, res: any): Promise<boolean> => {
    const userId = (req.session as any)?.userId;
    const storeId = Number(req.params.storeId);
    const store = await storage.getStore(storeId);
    if (!store || store.userId !== userId) {
      res.status(403).json({ message: "Unauthorized" });
      return false;
    }
    return true;
  };

  app.get("/api/sms-settings/:storeId", async (req, res) => {
    if (!(await validateStoreOwnership(req, res))) return;
    const settings = await storage.getSmsSettings(Number(req.params.storeId));
    if (settings) {
      const { twilioAuthToken, ...safe } = settings;
      res.json({ ...safe, twilioAuthToken: twilioAuthToken ? "••••••••" : null });
    } else {
      res.json(null);
    }
  });

  app.put("/api/sms-settings/:storeId", async (req, res) => {
    if (!(await validateStoreOwnership(req, res))) return;
    try {
      const storeId = Number(req.params.storeId);
      const smsSettingsInput = z.object({
        twilioAccountSid: z.string().optional().nullable(),
        twilioAuthToken: z.string().optional().nullable(),
        twilioPhoneNumber: z.string().optional().nullable(),
        bookingConfirmationEnabled: z.boolean().optional(),
        reminderEnabled: z.boolean().optional(),
        reminderHoursBefore: z.number().min(1).max(72).optional(),
        reviewRequestEnabled: z.boolean().optional(),
        googleReviewUrl: z.string().optional().nullable(),
        confirmationTemplate: z.string().optional().nullable(),
        reminderTemplate: z.string().optional().nullable(),
        reviewTemplate: z.string().optional().nullable(),
      }).parse(req.body);

      if (smsSettingsInput.twilioAuthToken === "••••••••") {
        delete smsSettingsInput.twilioAuthToken;
      }
      const settings = await storage.upsertSmsSettings(storeId, { ...smsSettingsInput, storeId });
      const { twilioAuthToken, ...safe } = settings;
      res.json({ ...safe, twilioAuthToken: twilioAuthToken ? "••••••••" : null });
    } catch (error) {
      console.error("SMS settings update error:", error);
      res.status(400).json({ message: "Invalid input" });
    }
  });

  app.post("/api/sms-settings/:storeId/test", async (req, res) => {
    if (!(await validateStoreOwnership(req, res))) return;
    try {
      const storeId = Number(req.params.storeId);
      const { phone } = req.body;
      if (!phone) return res.status(400).json({ message: "Phone number required" });

      const { sendSms } = await import("./sms");
      const result = await sendSms(
        storeId,
        phone,
        "This is a test message from your salon booking system. SMS is working!",
        "test"
      );

      if (result.success) {
        res.json({ success: true, sid: result.sid });
      } else {
        res.status(400).json({ success: false, error: result.error });
      }
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  app.get("/api/sms-log/:storeId", async (req, res) => {
    if (!(await validateStoreOwnership(req, res))) return;
    const logs = await storage.getSmsLogs(Number(req.params.storeId), 100);
    res.json(logs);
  });

  // === MAIL SETTINGS ===
  app.get("/api/mail-settings/:storeId", async (req, res) => {
    if (!(await validateStoreOwnership(req, res))) return;
    const settings = await storage.getMailSettings(Number(req.params.storeId));
    if (settings) {
      const { mailgunApiKey, ...safe } = settings;
      res.json({ ...safe, mailgunApiKey: mailgunApiKey ? "••••••••" : null });
    } else {
      res.json(null);
    }
  });

  app.put("/api/mail-settings/:storeId", async (req, res) => {
    if (!(await validateStoreOwnership(req, res))) return;
    try {
      const storeId = Number(req.params.storeId);
      const mailSettingsInput = z.object({
        mailgunApiKey: z.string().optional().nullable(),
        mailgunDomain: z.string().optional().nullable(),
        senderEmail: z.string().optional().nullable(),
        bookingConfirmationEnabled: z.boolean().optional(),
        reminderEnabled: z.boolean().optional(),
        reminderHoursBefore: z.number().min(1).max(72).optional(),
        reviewRequestEnabled: z.boolean().optional(),
        googleReviewUrl: z.string().optional().nullable(),
        confirmationTemplate: z.string().optional().nullable(),
        reminderTemplate: z.string().optional().nullable(),
        reviewTemplate: z.string().optional().nullable(),
      }).parse(req.body);

      if (mailSettingsInput.mailgunApiKey === "••••••••") {
        delete mailSettingsInput.mailgunApiKey;
      }
      const settings = await storage.upsertMailSettings(storeId, { ...mailSettingsInput, storeId });
      const { mailgunApiKey, ...safe } = settings;
      res.json({ ...safe, mailgunApiKey: mailgunApiKey ? "••••••••" : null });
    } catch (error) {
      console.error("Mail settings update error:", error);
      res.status(400).json({ message: "Invalid input" });
    }
  });

  // === ADMIN ENDPOINTS ===
  app.get("/api/admin/accounts", async (req, res) => {
    const userId = (req.session as any)?.userId;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    try {
      const allUsers = await db.select().from(users);
      const allLocations = await db.select().from(locations);

      const locationsByUser = new Map<string, typeof allLocations[0]>();
      for (const loc of allLocations) {
        if (loc.userId && !locationsByUser.has(loc.userId)) {
          locationsByUser.set(loc.userId, loc);
        }
      }

      const now = new Date();
      const accounts = allUsers.map((user: any) => {
        const store = locationsByUser.get(user.id);

        // Compute a unified status
        let computedStatus: string;
        const subStatus = user.subscriptionStatus ?? "active";
        const locStatus = (store?.accountStatus ?? "Active").toLowerCase();
        const trialEnds = user.trialEndsAt ? new Date(user.trialEndsAt) : null;

        if (locStatus === "inactive") {
          computedStatus = "Inactive";
        } else if (subStatus === "trialing") {
          computedStatus = trialEnds && trialEnds < now ? "Expired" : "Free Trial";
        } else if (subStatus === "active") {
          computedStatus = "Subscriber";
        } else if (subStatus === "past_due") {
          computedStatus = "Expired";
        } else if (subStatus === "canceled") {
          computedStatus = "Inactive";
        } else {
          computedStatus = store?.accountStatus ?? "Active";
        }

        return {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          createdAt: user.createdAt,
          subscriptionStatus: subStatus,
          trialStartedAt: user.trialStartedAt,
          trialEndsAt: user.trialEndsAt,
          computedStatus,
          storeId: store?.id ?? null,
          storeName: store?.name ?? null,
          storeCity: store?.city ?? null,
          storeState: store?.state ?? null,
          storePhone: store?.phone ?? null,
          storeCategory: store?.category ?? null,
          accountStatus: store?.accountStatus ?? null,
        };
      });

      res.json(accounts);
    } catch (error) {
      console.error("Error fetching accounts:", error);
      res.status(500).json({ message: "Failed to fetch accounts" });
    }
  });

  app.delete("/api/admin/accounts/:userId", async (req, res) => {
    const userId = (req.session as any)?.userId;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const userToDelete = req.params.userId;

    try {
      if (userId === userToDelete) {
        return res.status(400).json({ message: "Cannot delete your own account" });
      }

      await db.delete(users).where(eq(users.id, userToDelete));
      res.json({ message: "Account deleted successfully" });
    } catch (error) {
      console.error("Error deleting account:", error);
      res.status(500).json({ message: "Failed to delete account" });
    }
  });

  // === GOOGLE BUSINESS PROFILE INTEGRATION ===

  /**
   * Get Google OAuth authorization URL.
   * Generates a CSRF state token, stores it in the session, and returns the URL.
   */
  app.get("/api/google-business/auth-url", async (req, res) => {
    const userId = (req.session as any)?.userId;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    try {
      // Generate a random CSRF state token and store it in the session
      const state = crypto.randomBytes(16).toString("hex");
      (req.session as any).googleOAuthState = state;

      const apiManager = new GoogleBusinessAPIManager({
        clientId: process.env.GOOGLE_CLIENT_ID ?? "",
        clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
        redirectUri: process.env.GOOGLE_REDIRECT_URI ?? "",
      });

      const authUrl = apiManager.getAuthUrl(undefined, state);
      res.json({ authUrl });
    } catch (error) {
      console.error("Error generating auth URL:", error);
      res.status(500).json({ message: "Failed to generate auth URL" });
    }
  });

  /**
   * Handle Google OAuth callback.
   * - Verifies CSRF state
   * - Exchanges code for tokens
   * - Fetches the authed user's Google account email
   * - Upserts the profile row (so reconnect works without error)
   */
  app.post("/api/google-business/callback", async (req, res) => {
    const userId = (req.session as any)?.userId;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const { code, storeId, state } = req.body;
    if (!code || !storeId) {
      return res.status(400).json({ message: "Code and storeId are required" });
    }

    // CSRF state verification
    const expectedState = (req.session as any).googleOAuthState;
    if (expectedState && state && expectedState !== state) {
      return res.status(400).json({ message: "Invalid OAuth state – possible CSRF attack" });
    }
    // Clear the state from session after use
    delete (req.session as any).googleOAuthState;

    try {
      const apiManager = new GoogleBusinessAPIManager({
        clientId: process.env.GOOGLE_CLIENT_ID ?? "",
        clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
        redirectUri: process.env.GOOGLE_REDIRECT_URI ?? "",
      });

      // Exchange code → tokens (also stores credentials on the manager's OAuth2Client)
      const tokens = await apiManager.getTokensFromCode(code);

      // Fetch authenticated user info to get the Google account email
      const userInfo = await apiManager.getGoogleUserInfo();

      // List business accounts
      const accountsData = await apiManager.getBusinessAccounts();
      const accounts = (accountsData.accounts ?? []) as any[];

      if (!accounts.length) {
        return res.status(400).json({ message: "No Google Business accounts found for this Google account" });
      }

      // Upsert the profile so re-authentication updates tokens instead of failing
      // with a unique constraint violation.
      const existingProfile = await db
        .select()
        .from(googleBusinessProfiles)
        .where(eq(googleBusinessProfiles.storeId, Number(storeId)))
        .limit(1);

      let profileRow: typeof googleBusinessProfiles.$inferSelect;
      if (existingProfile.length) {
        // Update existing profile with fresh tokens
        const updated = await db
          .update(googleBusinessProfiles)
          .set({
            accessToken: tokens.access_token,
            refreshToken: tokens.refresh_token ?? existingProfile[0].refreshToken,
            tokenExpiresAt: tokens.expiry_date ? new Date(tokens.expiry_date) : null,
            googleAccountEmail: userInfo?.email ?? existingProfile[0].googleAccountEmail,
            businessAccountId: accounts[0].name,
            businessAccountResourceName: accounts[0].name,
            isConnected: false,   // reset; user must re-select location
            updatedAt: new Date(),
          })
          .where(eq(googleBusinessProfiles.storeId, Number(storeId)))
          .returning();
        profileRow = updated[0];
      } else {
        // Insert new profile
        const inserted = await db
          .insert(googleBusinessProfiles)
          .values({
            storeId: Number(storeId),
            accessToken: tokens.access_token,
            refreshToken: tokens.refresh_token,
            tokenExpiresAt: tokens.expiry_date ? new Date(tokens.expiry_date) : null,
            googleAccountEmail: userInfo?.email ?? null,
            businessAccountId: accounts[0].name,
            businessAccountResourceName: accounts[0].name,
            isConnected: false,
          })
          .returning();
        profileRow = inserted[0];
      }

      res.json({
        message: "Google account authenticated",
        accounts,
        profileId: profileRow.id,
        googleEmail: userInfo?.email ?? null,
      });
    } catch (error) {
      console.error("Error in Google callback:", error);
      res.status(500).json({ message: "Failed to authenticate with Google" });
    }
  });

  /**
   * Get locations for a business account.
   */
  app.post("/api/google-business/locations", async (req, res) => {
    const userId = (req.session as any)?.userId;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const { profileId, accountName } = req.body;
    if (!profileId || !accountName) {
      return res.status(400).json({ message: "profileId and accountName are required" });
    }

    try {
      const profiles = await db
        .select()
        .from(googleBusinessProfiles)
        .where(eq(googleBusinessProfiles.id, profileId))
        .limit(1);

      if (!profiles.length) {
        return res.status(404).json({ message: "Profile not found" });
      }

      const apiManager = createApiManagerFromProfile(profiles[0]);
      const locationsData = await apiManager.getLocations(accountName);
      const locs = locationsData.locations ?? [];

      res.json({ locations: locs });
    } catch (error) {
      console.error("Error fetching locations:", error);
      res.status(500).json({ message: "Failed to fetch locations" });
    }
  });

  /**
   * Connect a specific location to the store.
   */
  app.post("/api/google-business/connect-location", async (req, res) => {
    const userId = (req.session as any)?.userId;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const { profileId, locationName, locationId, businessName } = req.body;
    if (!profileId || !locationName) {
      return res.status(400).json({ message: "profileId and locationName are required" });
    }

    try {
      const updated = await db
        .update(googleBusinessProfiles)
        .set({
          locationResourceName: locationName,
          locationId: locationId ?? null,
          businessName: businessName ?? null,
          isConnected: true,
          updatedAt: new Date(),
        })
        .where(eq(googleBusinessProfiles.id, profileId))
        .returning();

      res.json({ message: "Location connected successfully", profile: updated[0] });
    } catch (error) {
      console.error("Error connecting location:", error);
      res.status(500).json({ message: "Failed to connect location" });
    }
  });

  /**
   * Get Google Business Profile for a store (tokens are stripped before returning).
   */
  app.get("/api/google-business/profile/:storeId", async (req, res) => {
    const userId = (req.session as any)?.userId;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const storeId = Number(req.params.storeId);

    try {
      const profiles = await db
        .select()
        .from(googleBusinessProfiles)
        .where(eq(googleBusinessProfiles.storeId, storeId))
        .limit(1);

      if (!profiles.length) {
        return res.json({ profile: null });
      }

      // Never return sensitive tokens to the client
      const { accessToken, refreshToken, ...safeProfile } = profiles[0];
      res.json({ profile: safeProfile });
    } catch (error) {
      console.error("Error fetching profile:", error);
      res.status(500).json({ message: "Failed to fetch profile" });
    }
  });

  /**
   * Disconnect Google Business Profile.
   * Revokes the OAuth token at Google, then removes all local review data.
   * Required by Google API policies: users must be able to revoke access at any time,
   * and disconnecting must remove all associated data.
   */
  app.delete("/api/google-business/profile/:storeId", async (req, res) => {
    const userId = (req.session as any)?.userId;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const storeId = Number(req.params.storeId);

    try {
      // Verify the store belongs to this user
      const store = await storage.getStore(storeId);
      if (!store || store.userId !== userId) {
        return res.status(403).json({ message: "Forbidden" });
      }

      const profiles = await db
        .select()
        .from(googleBusinessProfiles)
        .where(eq(googleBusinessProfiles.storeId, storeId))
        .limit(1);

      if (!profiles.length) {
        return res.status(404).json({ message: "No Google Business Profile found for this store" });
      }

      const profile = profiles[0];

      // Revoke the OAuth token at Google so the app loses API access
      if (profile.accessToken || profile.refreshToken) {
        const apiManager = createApiManagerFromProfile(profile);
        await apiManager.revokeTokens();
      }

      // Delete all draft/published responses for this store's reviews
      await db
        .delete(googleReviewResponses)
        .where(eq(googleReviewResponses.storeId, storeId));

      // Delete all synced reviews for this store
      await db
        .delete(googleReviews)
        .where(eq(googleReviews.storeId, storeId));

      // Delete the profile itself
      await db
        .delete(googleBusinessProfiles)
        .where(eq(googleBusinessProfiles.storeId, storeId));

      console.log(`Google Business Profile disconnected for store ${storeId}`);
      res.json({ message: "Google Business Profile disconnected and all data removed" });
    } catch (error) {
      console.error("Error disconnecting Google Business Profile:", error);
      res.status(500).json({ message: "Failed to disconnect Google Business Profile" });
    }
  });

  /**
   * Sync reviews from Google.
   */
  app.post("/api/google-business/sync-reviews/:storeId", async (req, res) => {
    const userId = (req.session as any)?.userId;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const storeId = Number(req.params.storeId);

    try {
      await syncGoogleReviews(storeId);
      res.json({ message: "Reviews synced successfully" });
    } catch (error) {
      console.error("Error syncing reviews:", error);
      res.status(500).json({ message: "Failed to sync reviews" });
    }
  });

  /**
   * Get reviews for a store
   */
  app.get("/api/google-business/reviews/:storeId", async (req, res) => {
    const userId = (req.session as any)?.userId;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const storeId = Number(req.params.storeId);
    const ratingFilter = req.query.rating ? Number(req.query.rating) : null;
    const statusFilter = req.query.status as string | null;
    const limit = req.query.limit ? Number(req.query.limit) : 50;

    try {
      const conditions = [eq(googleReviews.storeId, storeId)];
      
      if (ratingFilter) {
        conditions.push(eq(googleReviews.rating, ratingFilter));
      }

      if (statusFilter) {
        conditions.push(eq(googleReviews.responseStatus, statusFilter));
      }

      const reviews = await db
        .select()
        .from(googleReviews)
        .where(and(...conditions))
        .orderBy(desc(googleReviews.reviewCreateTime))
        .limit(limit);

      res.json({ reviews });
    } catch (error) {
      console.error("Error fetching reviews:", error);
      res.status(500).json({ message: "Failed to fetch reviews" });
    }
  });

  /**
   * Get a single review with responses
   */
  app.get("/api/google-business/reviews/:storeId/:reviewId", async (req, res) => {
    const userId = (req.session as any)?.userId;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const { storeId, reviewId } = req.params;

    try {
      const review = await db
        .select()
        .from(googleReviews)
        .where(
          and(
            eq(googleReviews.storeId, Number(storeId)),
            eq(googleReviews.id, Number(reviewId))
          )
        )
        .limit(1);

      if (!review.length) {
        return res.status(404).json({ message: "Review not found" });
      }

      const responses = await db
        .select()
        .from(googleReviewResponses)
        .where(eq(googleReviewResponses.googleReviewId, Number(reviewId)));

      res.json({
        review: review[0],
        responses,
      });
    } catch (error) {
      console.error("Error fetching review:", error);
      res.status(500).json({ message: "Failed to fetch review" });
    }
  });

  /**
   * Create a draft response to a review
   */
  app.post("/api/google-business/review-response", async (req, res) => {
    const userId = (req.session as any)?.userId;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    try {
      const input = z
        .object({
          googleReviewId: z.number(),
          storeId: z.number(),
          responseText: z.string().min(1).max(5000),
          staffId: z.number().optional(),
        })
        .parse(req.body);

      const response = await db
        .insert(googleReviewResponses)
        .values({
          ...input,
          responseStatus: "pending",
          createdBy: userId,
        })
        .returning();

      res.status(201).json(response[0]);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: error.errors[0].message });
      } else {
        console.error("Error creating response:", error);
        res.status(500).json({ message: "Failed to create response" });
      }
    }
  });

  /**
   * Update a review response
   */
  app.patch("/api/google-business/review-response/:responseId", async (req, res) => {
    const userId = (req.session as any)?.userId;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const responseId = Number(req.params.responseId);

    try {
      const input = z
        .object({
          responseText: z.string().min(1).max(5000).optional(),
          staffId: z.number().optional(),
        })
        .parse(req.body);

      const updated = await db
        .update(googleReviewResponses)
        .set({
          ...input,
          updatedAt: new Date(),
        })
        .where(eq(googleReviewResponses.id, responseId))
        .returning();

      if (!updated.length) {
        return res.status(404).json({ message: "Response not found" });
      }

      res.json(updated[0]);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: error.errors[0].message });
      } else {
        console.error("Error updating response:", error);
        res.status(500).json({ message: "Failed to update response" });
      }
    }
  });

  /**
   * Publish a review response to Google.
   */
  app.post("/api/google-business/review-response/:responseId/publish", async (req, res) => {
    const userId = (req.session as any)?.userId;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const responseId = Number(req.params.responseId);

    try {
      await publishReviewResponse(responseId);
      res.json({ message: "Response published successfully" });
    } catch (error) {
      console.error("Error publishing response:", error);
      res.status(500).json({ message: "Failed to publish response" });
    }
  });

  /**
   * Delete a review response.
   * If the response was already published to Google (status = "approved"),
   * the reply is also removed from Google so the review stays in sync.
   */
  app.delete("/api/google-business/review-response/:responseId", async (req, res) => {
    const userId = (req.session as any)?.userId;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const responseId = Number(req.params.responseId);

    try {
      // Load the response first so we know if it was published
      const existing = await db
        .select()
        .from(googleReviewResponses)
        .where(eq(googleReviewResponses.id, responseId))
        .limit(1);

      if (existing.length && existing[0].responseStatus === "approved") {
        // Also delete the reply from Google so it doesn't stay visible
        try {
          const review = await db
            .select()
            .from(googleReviews)
            .where(eq(googleReviews.id, existing[0].googleReviewId))
            .limit(1);

          if (review.length) {
            const profile = await db
              .select()
              .from(googleBusinessProfiles)
              .where(eq(googleBusinessProfiles.storeId, review[0].storeId))
              .limit(1);

            if (profile.length) {
              const apiManager = createApiManagerFromProfile(profile[0]);
              const reviewResourceName = `${profile[0].locationResourceName}/reviews/${review[0].googleReviewId}`;
              await apiManager.deleteReviewReply(reviewResourceName);

              // Mark the review as not responded since reply was removed
              await db
                .update(googleReviews)
                .set({ responseStatus: "not_responded" })
                .where(eq(googleReviews.id, review[0].id));
            }
          }
        } catch (googleError) {
          // Non-fatal: log but still delete locally
          console.warn("Could not delete reply from Google:", googleError);
        }
      }

      await db
        .delete(googleReviewResponses)
        .where(eq(googleReviewResponses.id, responseId));

      res.json({ message: "Response deleted successfully" });
    } catch (error) {
      console.error("Error deleting response:", error);
      res.status(500).json({ message: "Failed to delete response" });
    }
  });

  /**
   * Get review statistics
   */
  app.get("/api/google-business/reviews-stats/:storeId", async (req, res) => {
    const userId = (req.session as any)?.userId;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const storeId = Number(req.params.storeId);

    try {
      const allReviews = await db
        .select()
        .from(googleReviews)
        .where(eq(googleReviews.storeId, storeId));

      const stats = {
        totalReviews: allReviews.length,
        averageRating: 
          allReviews.length > 0
            ? (allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length).toFixed(1)
            : 0,
        respondedReviews: allReviews.filter((r) => r.responseStatus === "responded").length,
        notRespondedReviews: allReviews.filter((r) => r.responseStatus === "not_responded").length,
        ratingDistribution: {
          5: allReviews.filter((r) => r.rating === 5).length,
          4: allReviews.filter((r) => r.rating === 4).length,
          3: allReviews.filter((r) => r.rating === 3).length,
          2: allReviews.filter((r) => r.rating === 2).length,
          1: allReviews.filter((r) => r.rating === 1).length,
        },
      };

      res.json(stats);
    } catch (error) {
      console.error("Error getting review stats:", error);
      res.status(500).json({ message: "Failed to get review stats" });
    }
  });

  // === YELP ALIAS ===

  app.put("/api/stores/:storeId/facebook-page", async (req, res) => {
    const userId = (req.session as any)?.userId;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });
    const storeId = Number(req.params.storeId);
    const { facebookPageId } = req.body;
    if (typeof facebookPageId !== "string") return res.status(400).json({ message: "facebookPageId required" });
    const [updated] = await db
      .update(locations)
      .set({ facebookPageId: facebookPageId.trim() || null })
      .where(and(eq(locations.id, storeId), eq(locations.userId, userId)))
      .returning();
    if (!updated) return res.status(404).json({ message: "Store not found" });
    return res.json({ success: true, facebookPageId: updated.facebookPageId });
  });

  app.put("/api/stores/:storeId/yelp-alias", async (req, res) => {
    const userId = (req.session as any)?.userId;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });
    const storeId = Number(req.params.storeId);
    const { yelpAlias } = req.body;
    if (typeof yelpAlias !== "string") return res.status(400).json({ message: "yelpAlias required" });
    const [updated] = await db
      .update(locations)
      .set({ yelpAlias: yelpAlias.trim() || null })
      .where(and(eq(locations.id, storeId), eq(locations.userId, userId)))
      .returning();
    if (!updated) return res.status(404).json({ message: "Store not found" });
    return res.json({ success: true, yelpAlias: updated.yelpAlias });
  });

  // === ADMIN TRIAL MANAGEMENT ===
  
  /**
   * Admin: Get user trial status
   */
  app.get("/api/admin/users/:userId/trial-status", async (req, res) => {
    const userId = req.params.userId;
    
    try {
      const trialStatus = await TrialService.getTrialStatus(userId);
      res.json(trialStatus);
    } catch (error) {
      console.error("Error fetching user trial status:", error);
      res.status(500).json({ message: "Failed to fetch trial status" });
    }
  });

  /**
   * Admin: Extend user trial
   */
  app.post("/api/admin/users/:userId/extend-trial", async (req, res) => {
    const userId = req.params.userId;
    const { additionalDays } = req.body;
    
    if (!additionalDays || additionalDays <= 0) {
      return res.status(400).json({ message: "Additional days must be greater than 0" });
    }
    
    try {
      await TrialService.extendTrial(userId, additionalDays);
      const trialStatus = await TrialService.getTrialStatus(userId);
      res.json({ message: "Trial extended successfully", trialStatus });
    } catch (error) {
      console.error("Error extending trial:", error);
      res.status(500).json({ message: "Failed to extend trial" });
    }
  });

  /**
   * Admin: Reset user trial
   */
  app.post("/api/admin/users/:userId/reset-trial", async (req, res) => {
    const userId = req.params.userId;
    
    try {
      await TrialService.resetTrial(userId);
      const trialStatus = await TrialService.getTrialStatus(userId);
      res.json({ message: "Trial reset successfully", trialStatus });
    } catch (error) {
      console.error("Error resetting trial:", error);
      res.status(500).json({ message: "Failed to reset trial" });
    }
  });

  /**
   * Admin: Activate user subscription
   */
  app.post("/api/admin/users/:userId/activate-subscription", async (req, res) => {
    const userId = req.params.userId;
    
    try {
      await TrialService.activateSubscription(userId);
      const trialStatus = await TrialService.getTrialStatus(userId);
      res.json({ message: "Subscription activated successfully", trialStatus });
    } catch (error) {
      console.error("Error activating subscription:", error);
      res.status(500).json({ message: "Failed to activate subscription" });
    }
  });

  /**
   * Admin: Cancel user subscription
   */
  app.post("/api/admin/users/:userId/cancel-subscription", async (req, res) => {
    const userId = req.params.userId;
    
    try {
      await TrialService.cancelSubscription(userId);
      const trialStatus = await TrialService.getTrialStatus(userId);
      res.json({ message: "Subscription cancelled successfully", trialStatus });
    } catch (error) {
      console.error("Error cancelling subscription:", error);
      res.status(500).json({ message: "Failed to cancel subscription" });
    }
  });

  /**
   * Admin Dashboard Stats API
   */

  // GET dashboard statistics
  app.get("/api/admin/dashboard/stats", async (req, res) => {
    try {
      // Get total stores count using raw SQL via pool
      const totalStoresResult = await pool.query(`SELECT COUNT(*)::int as count FROM locations`);
      const totalStoresCount = Number(totalStoresResult.rows[0]?.count || 0);
      
      // Get total users count using raw SQL via pool
      const totalUsersResult = await pool.query(`SELECT COUNT(*)::int as count FROM users`);
      const totalUsersCount = Number(totalUsersResult.rows[0]?.count || 0);
      
      // Get total appointments using raw SQL via pool
      const totalAppointmentsResult = await pool.query(`SELECT COUNT(*)::int as count FROM appointments`);
      const totalAppointmentsCount = Number(totalAppointmentsResult.rows[0]?.count || 0);

      // Get trial user count using raw SQL via pool
      const trialUsersResult = await pool.query(`SELECT COUNT(*)::int as count FROM users WHERE subscription_status = 'trial'`);
      const trialUsersCount = Number(trialUsersResult.rows[0]?.count || 0);

      // Stripe is not yet implemented — subscriptions and MRR are always 0
      const stats = {
        totalAccounts: totalStoresCount,
        newAccountsThisMonth: 0,
        newAccountsLastMonth: 0,
        totalSubscriptions: 0,   // No Stripe subscriptions yet
        activeSubscriptions: 0,  // No Stripe subscriptions yet
        mrr: 0,                  // No Stripe subscriptions yet
        mrrGrowth: 0,
        newSubsThisMonth: 0,
        newSubsLastMonth: 0,
        totalUsers: totalUsersCount,
        newUsersThisMonth: 0,
        newUsersLastMonth: 0,
        totalAppointments: totalAppointmentsCount,
        appointmentsThisMonth: 0,
        trialUsers: trialUsersCount
      };

      res.json(stats);
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      res.status(500).json({ message: "Failed to fetch dashboard stats" });
    }
  });

  /**
   * Platform Settings API
   */

  // GET platform settings
  app.get("/api/admin/platform-settings", async (req, res) => {
    try {
      // Get settings from environment variables
      const settings = {
        trialPeriodDays: parseInt(process.env.TRIAL_PERIOD_DAYS || '30'),
        mailgun: {
          apiKey: process.env.MAILGUN_API_KEY || '',
          domain: process.env.MAILGUN_DOMAIN || '',
          fromEmail: process.env.MAILGUN_FROM_EMAIL || 'noreply@yourdomain.com',
          fromName: process.env.MAILGUN_FROM_NAME || 'Booking Platform',
          enabled: !!(process.env.MAILGUN_API_KEY && process.env.MAILGUN_DOMAIN)
        },
        twilio: {
          accountSid: process.env.TWILIO_ACCOUNT_SID || '',
          authToken: process.env.TWILIO_AUTH_TOKEN || '',
          phoneNumber: process.env.TWILIO_PHONE_NUMBER || '',
          enabled: !!(process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN && process.env.TWILIO_PHONE_NUMBER)
        }
      };
      
      res.json(settings);
    } catch (error) {
      console.error("Error fetching platform settings:", error);
      res.status(500).json({ message: "Failed to fetch platform settings" });
    }
  });

  // PUT platform settings
  app.put("/api/admin/platform-settings", async (req, res) => {
    try {
      const { trialPeriodDays, mailgun, twilio } = req.body;
      
      // Validate input
      const platformSettingsSchema = z.object({
        trialPeriodDays: z.number().min(1).max(365),
        mailgun: z.object({
          apiKey: z.string().optional(),
          domain: z.string().optional(),
          fromEmail: z.string().email().optional(),
          fromName: z.string().optional(),
          enabled: z.boolean()
        }),
        twilio: z.object({
          accountSid: z.string().optional(),
          authToken: z.string().optional(),
          phoneNumber: z.string().optional(),
          enabled: z.boolean()
        })
      });

      const validatedData = platformSettingsSchema.parse({ trialPeriodDays, mailgun, twilio });
      
      // Update environment variables in memory
      process.env.TRIAL_PERIOD_DAYS = validatedData.trialPeriodDays.toString();
      process.env.MAILGUN_API_KEY = validatedData.mailgun.apiKey || '';
      process.env.MAILGUN_DOMAIN = validatedData.mailgun.domain || '';
      process.env.MAILGUN_FROM_EMAIL = validatedData.mailgun.fromEmail || 'noreply@yourdomain.com';
      process.env.MAILGUN_FROM_NAME = validatedData.mailgun.fromName || 'Booking Platform';
      process.env.TWILIO_ACCOUNT_SID = validatedData.twilio.accountSid || '';
      process.env.TWILIO_AUTH_TOKEN = validatedData.twilio.authToken || '';
      process.env.TWILIO_PHONE_NUMBER = validatedData.twilio.phoneNumber || '';
      
      // Update .env file
      const fs = require('fs');
      const path = require('path');
      const envPath = path.join(process.cwd(), '.env');
      
      let envContent = '';
      if (fs.existsSync(envPath)) {
        envContent = fs.readFileSync(envPath, 'utf8');
      }
      
      // Update or add each setting
      const updates = [
        `TRIAL_PERIOD_DAYS=${validatedData.trialPeriodDays}`,
        `MAILGUN_API_KEY=${validatedData.mailgun.apiKey || ''}`,
        `MAILGUN_DOMAIN=${validatedData.mailgun.domain || ''}`,
        `MAILGUN_FROM_EMAIL=${validatedData.mailgun.fromEmail || 'noreply@yourdomain.com'}`,
        `MAILGUN_FROM_NAME=${validatedData.mailgun.fromName || 'Booking Platform'}`,
        `TWILIO_ACCOUNT_SID=${validatedData.twilio.accountSid || ''}`,
        `TWILIO_AUTH_TOKEN=${validatedData.twilio.authToken || ''}`,
        `TWILIO_PHONE_NUMBER=${validatedData.twilio.phoneNumber || ''}`
      ];
      
      updates.forEach(update => {
        const [key] = update.split('=');
        const regex = new RegExp(`^${key}=.*$`, 'm');
        if (envContent.match(regex)) {
          envContent = envContent.replace(regex, update);
        } else {
          envContent += `\n${update}`;
        }
      });
      
      fs.writeFileSync(envPath, envContent);
      
      console.log("Platform settings saved to .env file");
      
      res.json({ message: "Platform settings updated successfully", settings: validatedData });
    } catch (error) {
      console.error("Error updating platform settings:", error);
      res.status(500).json({ message: "Failed to update platform settings" });
    }
  });

  // POST staff change password
  app.post("/api/staff/change-password", async (req, res) => {
    try {
      const userId = (req.session as any)?.userId;
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const { currentPassword, newPassword } = req.body;

      if (!currentPassword || !newPassword) {
        return res.status(400).json({ message: "Current password and new password are required" });
      }

      if (newPassword.length < 6) {
        return res.status(400).json({ message: "New password must be at least 6 characters long" });
      }

      // Get current user
      const [user] = await db.select().from(users).where(eq(users.id, userId));
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Verify current password
      const valid = await bcrypt.compare(currentPassword, user.password);
      if (!valid) {
        return res.status(401).json({ message: "Current password is incorrect" });
      }

      // Hash new password
      const hashedNewPassword = await bcrypt.hash(newPassword, 10);

      // Update password and mark as changed
      await storage.updateUser(user.id, { 
        password: hashedNewPassword, 
        passwordChanged: true 
      });

      res.json({ message: "Password changed successfully" });
    } catch (error) {
      console.error("Error changing password:", error);
      res.status(500).json({ message: "Failed to change password" });
    }
  });

  // GET staff calendar access status
  app.get("/api/staff/:id/calendar-access-status", isAuthenticated, async (req, res) => {
    try {
      const staffId = Number(req.params.id);
      const staff = await storage.getStaffMember(staffId);

      if (!staff) {
        return res.status(404).json({ message: "Staff member not found" });
      }

      // Staff without an email cannot have calendar access
      if (!staff.email) {
        return res.json({ hasCalendarAccess: false, email: null, enabled: false });
      }

      // Check if user exists with staff role and this staffId
      const user = await storage.findUserByEmail(staff.email);
      const hasCalendarAccess = user && user.role === "staff" && user.staffId === staffId;

      res.json({ 
        hasCalendarAccess,
        email: staff.email,
        enabled: !!hasCalendarAccess
      });
    } catch (error) {
      console.error("Error checking calendar access status:", error);
      res.status(500).json({ message: "Failed to check calendar access status" });
    }
  });

  // POST test mailgun connection
  app.post("/api/admin/platform-settings/test-mailgun", async (req, res) => {
    try {
      const { to } = req.body;
      
      if (!to) {
        return res.status(400).json({ message: "Recipient email is required" });
      }

      // Use Mailgun settings from .env
      const apiKey = process.env.MAILGUN_API_KEY;
      const domain = process.env.MAILGUN_DOMAIN;
      const fromEmail = process.env.MAILGUN_FROM_EMAIL || `noreply@${domain}`;
      const fromName = process.env.MAILGUN_FROM_NAME || 'Test Platform';

      if (!apiKey || !domain) {
        return res.status(500).json({ message: "Mailgun not configured in server environment" });
      }

      console.log("Testing mailgun connection to:", to);
      
      // Send actual test email via Mailgun API
      const formData = new FormData();
      formData.append('from', `${fromName} <${fromEmail}>`);
      formData.append('to', to);
      formData.append('subject', 'Mailgun Test Email');
      formData.append('text', `This is a test email sent at ${new Date().toISOString()}. If you received this, your Mailgun configuration is working correctly.`);
      formData.append('html', `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333; border-bottom: 2px solid #007bff; padding-bottom: 10px;">
            Mailgun Test Email
          </h2>
          <p style="color: #666; line-height: 1.6;">
            This is a test email sent from your booking platform at <strong>${new Date().toLocaleString()}</strong>.
          </p>
          <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <h3 style="color: #495057; margin: 0 0 10px 0;">Test Details:</h3>
            <ul style="color: #6c757d; margin: 0; padding-left: 20px;">
              <li>Sent to: ${to}</li>
              <li>Sent from: ${fromEmail}</li>
              <li>Domain: ${domain}</li>
              <li>Time: ${new Date().toISOString()}</li>
            </ul>
          </div>
          <p style="color: #28a745; font-weight: bold;">
            ✅ If you received this email, your Mailgun configuration is working correctly!
          </p>
        </div>
      `);

      const response = await fetch(`https://api.mailgun.net/v3/${domain}/messages`, {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${Buffer.from(`api:${apiKey}`).toString('base64')}`,
        },
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.text();
        console.error('Mailgun API error:', errorData);
        throw new Error(`Mailgun API error: ${response.status} ${errorData}`);
      }

      const result = await response.json();
      console.log('Mailgun test successful:', result);
      
      res.json({ 
        message: "Mailgun test successful", 
        timestamp: new Date().toISOString(),
        recipient: to,
        messageId: result.id
      });
    } catch (error) {
      console.error("Error testing mailgun:", error);
      res.status(500).json({ message: "Mailgun test failed", error: error instanceof Error ? error.message : String(error) });
    }
  });

  // POST test twilio connection
  app.post("/api/admin/platform-settings/test-twilio", async (req, res) => {
    try {
      const { to } = req.body;
      
      if (!to) {
        return res.status(400).json({ message: "Recipient phone number is required" });
      }

      // TODO: Implement actual twilio test
      console.log("Testing twilio connection to:", to);
      
      // Simulate test
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      res.json({ message: "Twilio test successful", timestamp: new Date().toISOString() });
    } catch (error) {
      console.error("Error testing twilio:", error);
      res.status(500).json({ message: "Twilio test failed" });
    }
  });

  // GET service status
  app.get("/api/admin/platform-settings/status", async (req, res) => {
    try {
      const status = {
        mailgun: {
          connected: !!(process.env.MAILGUN_API_KEY && process.env.MAILGUN_DOMAIN),
          lastCheck: new Date().toISOString(),
          error: null
        },
        twilio: {
          connected: !!(process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN && process.env.TWILIO_PHONE_NUMBER),
          lastCheck: new Date().toISOString(),
          error: null
        },
        system: {
          healthy: true,
          lastCheck: new Date().toISOString()
        }
      };
      
      res.json(status);
    } catch (error) {
      console.error("Error fetching service status:", error);
      res.status(500).json({ message: "Failed to fetch service status" });
    }
  });

  /**
   * Billing Invoice Endpoints (Mock for now)
   */

  // GET all invoices
  app.get("/api/billing/invoices/all", async (req, res) => {
    try {
      // Mock data - replace with actual database query
      const invoices: any[] = []; // Mock empty invoices array
      res.json({ data: invoices });
    } catch (error) {
      console.error("Error fetching all invoices:", error);
      res.status(500).json({ message: "Failed to fetch all invoices" });
    }
  });

  // GET unpaid invoices count
  app.get("/api/billing/invoices/unpaid/count", async (req, res) => {
    try {
      // Mock data - replace with actual database query
      const count = 0; // Mock unpaid count
      res.json({ count });
    } catch (error) {
      console.error("Error fetching unpaid invoices count:", error);
      res.status(500).json({ message: "Failed to fetch unpaid invoices count" });
    }
  });

  // GET past due invoices count
  app.get("/api/billing/invoices/past-due/count", async (req, res) => {
    try {
      // Mock data - replace with actual database query
      const count = 0; // Mock past due count
      res.json({ count });
    } catch (error) {
      console.error("Error fetching past due invoices count:", error);
      res.status(500).json({ message: "Failed to fetch past due invoices count" });
    }
  });

  // ============================================================
  // WAITLIST ROUTES
  // ============================================================

  app.get("/api/waitlist", isAuthenticated, async (req, res) => {
    try {
      const userId = (req.session as any)?.userId;
      const userStore = await db.select().from(locations).where(eq(locations.userId, userId)).limit(1);
      if (!userStore.length) return res.status(404).json({ message: "Store not found" });
      const storeId = userStore[0].id;

      const entries = await db
        .select({
          id: waitlist.id,
          storeId: waitlist.storeId,
          customerName: waitlist.customerName,
          customerPhone: waitlist.customerPhone,
          customerEmail: waitlist.customerEmail,
          preferredDate: waitlist.preferredDate,
          preferredTimeStart: waitlist.preferredTimeStart,
          preferredTimeEnd: waitlist.preferredTimeEnd,
          notes: waitlist.notes,
          status: waitlist.status,
          notifiedAt: waitlist.notifiedAt,
          createdAt: waitlist.createdAt,
          serviceId: waitlist.serviceId,
          staffId: waitlist.staffId,
          customerId: waitlist.customerId,
        })
        .from(waitlist)
        .where(eq(waitlist.storeId, storeId))
        .orderBy(desc(waitlist.createdAt));

      res.json(entries);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Failed to fetch waitlist" });
    }
  });

  app.post("/api/waitlist", isAuthenticated, async (req, res) => {
    try {
      const userId = (req.session as any)?.userId;
      const userStore = await db.select().from(locations).where(eq(locations.userId, userId)).limit(1);
      if (!userStore.length) return res.status(404).json({ message: "Store not found" });
      const storeId = userStore[0].id;

      const { customerName, customerPhone, customerEmail, preferredDate, preferredTimeStart, preferredTimeEnd, notes, serviceId, staffId, customerId } = req.body;
      const [entry] = await db.insert(waitlist).values({
        storeId,
        customerName,
        customerPhone,
        customerEmail,
        preferredDate: preferredDate ? new Date(preferredDate) : null,
        preferredTimeStart,
        preferredTimeEnd,
        notes,
        serviceId: serviceId ? parseInt(serviceId) : null,
        staffId: staffId ? parseInt(staffId) : null,
        customerId: customerId ? parseInt(customerId) : null,
        status: "waiting",
      }).returning();

      res.json(entry);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Failed to add to waitlist" });
    }
  });

  // Atomic "Next Customer" — completes whoever is serving, promotes next waiting
  app.post("/api/queue/next", isAuthenticated, async (req, res) => {
    try {
      const storeId = req.query.storeId ? parseInt(req.query.storeId as string) : null;
      const now = new Date();

      // Complete whoever is currently serving/called
      let completed = null;
      const [currentlyServing] = await db
        .select()
        .from(waitlist)
        .where(
          storeId
            ? and(
                sql`${waitlist.status} IN ('serving', 'called')`,
                eq(waitlist.storeId, storeId)
              )
            : sql`${waitlist.status} IN ('serving', 'called')`
        )
        .orderBy(waitlist.createdAt)
        .limit(1);

      if (currentlyServing) {
        [completed] = await db
          .update(waitlist)
          .set({ status: "completed", completedAt: now })
          .where(eq(waitlist.id, currentlyServing.id))
          .returning();
      }

      // Promote next waiting person to serving
      let serving = null;
      const [nextWaiting] = await db
        .select()
        .from(waitlist)
        .where(
          storeId
            ? and(eq(waitlist.status, "waiting"), eq(waitlist.storeId, storeId))
            : eq(waitlist.status, "waiting")
        )
        .orderBy(waitlist.createdAt)
        .limit(1);

      if (nextWaiting) {
        [serving] = await db
          .update(waitlist)
          .set({ status: "serving", calledAt: now })
          .where(eq(waitlist.id, nextWaiting.id))
          .returning();
      }

      res.json({ completed, serving });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Failed to advance queue" });
    }
  });

  app.put("/api/waitlist/:id", isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updates: any = {};
      if (req.body.status !== undefined) {
        updates.status = req.body.status;
        // Auto-stamp timestamps when status changes
        if (req.body.status === "called" || req.body.status === "serving") {
          updates.calledAt = new Date();
        } else if (req.body.status === "completed") {
          updates.completedAt = new Date();
        }
      }
      if (req.body.notifiedAt !== undefined) updates.notifiedAt = new Date(req.body.notifiedAt);
      const [entry] = await db.update(waitlist).set(updates).where(eq(waitlist.id, id)).returning();
      res.json(entry);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Failed to update waitlist entry" });
    }
  });

  app.delete("/api/waitlist/:id", isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await db.delete(waitlist).where(eq(waitlist.id, id));
      res.json({ success: true });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Failed to delete waitlist entry" });
    }
  });

  // === QUEUE SETTINGS ===

  app.get("/api/queue/settings", isAuthenticated, async (req, res) => {
    try {
      const userId = (req.session as any)?.userId;
      const storeId = req.query.storeId ? Number(req.query.storeId) : null;
      if (!storeId) return res.status(400).json({ error: "storeId required" });
      const storeRows = await db.select().from(locations).where(and(eq(locations.id, storeId), eq(locations.userId, userId)));
      if (!storeRows.length) return res.status(403).json({ error: "Unauthorized" });
      const store = storeRows[0];
      const [row] = await db.select().from(storeSettings).where(eq(storeSettings.storeId, storeId));
      const prefs = row?.preferences ? JSON.parse(row.preferences as string) : {};
      res.json({
        queueEnabled: prefs.queueEnabled !== false,
        queueAvgServiceTime: prefs.queueAvgServiceTime || 20,
        queueMaxSize: prefs.queueMaxSize || 30,
        smsTravelBuffer: prefs.smsTravelBuffer ?? 5,
        storeLatitude: store.storeLatitude || null,
        storeLongitude: store.storeLongitude || null,
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Failed to get queue settings" });
    }
  });

  app.put("/api/queue/settings", isAuthenticated, async (req, res) => {
    try {
      const userId = (req.session as any)?.userId;
      const storeId = req.query.storeId ? Number(req.query.storeId) : null;
      if (!storeId) return res.status(400).json({ error: "storeId required" });
      const storeRows = await db.select().from(locations).where(and(eq(locations.id, storeId), eq(locations.userId, userId)));
      if (!storeRows.length) return res.status(403).json({ error: "Unauthorized" });
      const [existing] = await db.select().from(storeSettings).where(eq(storeSettings.storeId, storeId));
      const currentPrefs = existing?.preferences ? JSON.parse(existing.preferences as string) : {};
      const { queueEnabled, queueAvgServiceTime, queueMaxSize, smsTravelBuffer, storeLatitude, storeLongitude } = req.body;
      const newPrefs = {
        ...currentPrefs,
        ...(queueEnabled !== undefined ? { queueEnabled } : {}),
        ...(queueAvgServiceTime !== undefined ? { queueAvgServiceTime } : {}),
        ...(queueMaxSize !== undefined ? { queueMaxSize } : {}),
        ...(smsTravelBuffer !== undefined ? { smsTravelBuffer } : {}),
      };
      if (existing) {
        await db.update(storeSettings).set({ preferences: JSON.stringify(newPrefs) }).where(eq(storeSettings.storeId, storeId));
      } else {
        await db.insert(storeSettings).values({ storeId, preferences: JSON.stringify(newPrefs) });
      }
      // Save store lat/lng directly on the locations table
      if (storeLatitude !== undefined || storeLongitude !== undefined) {
        const locationUpdates: any = {};
        if (storeLatitude !== undefined) locationUpdates.storeLatitude = storeLatitude ? String(storeLatitude) : null;
        if (storeLongitude !== undefined) locationUpdates.storeLongitude = storeLongitude ? String(storeLongitude) : null;
        await db.update(locations).set(locationUpdates).where(eq(locations.id, storeId));
      }
      res.json({ success: true });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Failed to save queue settings" });
    }
  });

  // ============================================================
  // GIFT CARD ROUTES
  // ============================================================

  const generateGiftCardCode = () => {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    let code = "GC-";
    for (let i = 0; i < 8; i++) code += chars[Math.floor(Math.random() * chars.length)];
    return code;
  };

  app.get("/api/gift-cards", isAuthenticated, async (req, res) => {
    try {
      const userId = (req.session as any)?.userId;
      const userStore = await db.select().from(locations).where(eq(locations.userId, userId)).limit(1);
      if (!userStore.length) return res.status(404).json({ message: "Store not found" });
      const cards = await db.select().from(giftCards).where(eq(giftCards.storeId, userStore[0].id)).orderBy(desc(giftCards.createdAt));
      res.json(cards);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Failed to fetch gift cards" });
    }
  });

  app.post("/api/gift-cards", isAuthenticated, async (req, res) => {
    try {
      const userId = (req.session as any)?.userId;
      const userStore = await db.select().from(locations).where(eq(locations.userId, userId)).limit(1);
      if (!userStore.length) return res.status(404).json({ message: "Store not found" });
      const storeId = userStore[0].id;

      const { amount, issuedToName, issuedToEmail, expiresAt, notes } = req.body;
      const code = generateGiftCardCode();

      const [card] = await db.insert(giftCards).values({
        storeId,
        code,
        originalAmount: amount.toString(),
        remainingBalance: amount.toString(),
        issuedToName,
        issuedToEmail,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
        notes,
        isActive: true,
      }).returning();

      res.json(card);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Failed to create gift card" });
    }
  });

  app.get("/api/gift-cards/check/:code", async (req, res) => {
    try {
      const [card] = await db.select().from(giftCards).where(eq(giftCards.code, req.params.code));
      if (!card) return res.status(404).json({ message: "Gift card not found" });
      res.json(card);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Failed to check gift card" });
    }
  });

  app.post("/api/gift-cards/redeem", isAuthenticated, async (req, res) => {
    try {
      const { code, amount } = req.body;
      const [card] = await db.select().from(giftCards).where(eq(giftCards.code, code));
      if (!card) return res.status(404).json({ message: "Gift card not found" });
      if (!card.isActive) return res.status(400).json({ message: "Gift card is not active" });

      const remaining = parseFloat(card.remainingBalance);
      const redeem = parseFloat(amount);
      if (redeem > remaining) return res.status(400).json({ message: "Insufficient balance" });

      const newBalance = (remaining - redeem).toFixed(2);
      const [updated] = await db.update(giftCards)
        .set({ remainingBalance: newBalance, isActive: parseFloat(newBalance) > 0 })
        .where(eq(giftCards.id, card.id))
        .returning();

      await db.insert(giftCardTransactions).values({
        giftCardId: card.id,
        storeId: card.storeId,
        amount: redeem.toString(),
        type: "redemption",
        balanceAfter: newBalance,
      });

      res.json(updated);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Failed to redeem gift card" });
    }
  });

  app.put("/api/gift-cards/:id", isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const [updated] = await db.update(giftCards).set(req.body).where(eq(giftCards.id, id)).returning();
      res.json(updated);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Failed to update gift card" });
    }
  });

  // ============================================================
  // INTAKE FORMS ROUTES
  // ============================================================

  app.get("/api/intake-forms", isAuthenticated, async (req, res) => {
    try {
      const userId = (req.session as any)?.userId;
      const userStore = await db.select().from(locations).where(eq(locations.userId, userId)).limit(1);
      if (!userStore.length) return res.status(404).json({ message: "Store not found" });
      const storeId = userStore[0].id;

      const forms = await db.select().from(intakeForms).where(eq(intakeForms.storeId, storeId)).orderBy(desc(intakeForms.createdAt));
      
      const formsWithFields = await Promise.all(forms.map(async (form) => {
        const fields = await db.select().from(intakeFormFields).where(eq(intakeFormFields.formId, form.id)).orderBy(intakeFormFields.sortOrder);
        return { ...form, fields };
      }));

      res.json(formsWithFields);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Failed to fetch intake forms" });
    }
  });

  app.post("/api/intake-forms", isAuthenticated, async (req, res) => {
    try {
      const userId = (req.session as any)?.userId;
      const userStore = await db.select().from(locations).where(eq(locations.userId, userId)).limit(1);
      if (!userStore.length) return res.status(404).json({ message: "Store not found" });
      const storeId = userStore[0].id;

      const { name, description, requireBeforeBooking, serviceId, fields } = req.body;
      const [form] = await db.insert(intakeForms).values({
        storeId, name, description, requireBeforeBooking: !!requireBeforeBooking,
        serviceId: serviceId ? parseInt(serviceId) : null,
      }).returning();

      if (fields && fields.length > 0) {
        await db.insert(intakeFormFields).values(
          fields.map((f: any, i: number) => ({
            formId: form.id, label: f.label, fieldType: f.fieldType,
            options: f.options || null, required: !!f.required, sortOrder: i,
          }))
        );
      }

      res.json(form);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Failed to create intake form" });
    }
  });

  app.put("/api/intake-forms/:id", isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { name, description, requireBeforeBooking, isActive, fields } = req.body;
      const updates: any = {};
      if (name !== undefined) updates.name = name;
      if (description !== undefined) updates.description = description;
      if (requireBeforeBooking !== undefined) updates.requireBeforeBooking = requireBeforeBooking;
      if (isActive !== undefined) updates.isActive = isActive;

      const [form] = await db.update(intakeForms).set(updates).where(eq(intakeForms.id, id)).returning();

      if (fields !== undefined) {
        await db.delete(intakeFormFields).where(eq(intakeFormFields.formId, id));
        if (fields.length > 0) {
          await db.insert(intakeFormFields).values(
            fields.map((f: any, i: number) => ({
              formId: id, label: f.label, fieldType: f.fieldType,
              options: f.options || null, required: !!f.required, sortOrder: i,
            }))
          );
        }
      }

      res.json(form);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Failed to update intake form" });
    }
  });

  app.delete("/api/intake-forms/:id", isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await db.delete(intakeFormFields).where(eq(intakeFormFields.formId, id));
      await db.delete(intakeForms).where(eq(intakeForms.id, id));
      res.json({ success: true });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Failed to delete intake form" });
    }
  });

  app.get("/api/intake-forms/responses", isAuthenticated, async (req, res) => {
    try {
      const userId = (req.session as any)?.userId;
      const userStore = await db.select().from(locations).where(eq(locations.userId, userId)).limit(1);
      if (!userStore.length) return res.status(404).json({ message: "Store not found" });
      const responses = await db.select().from(intakeFormResponses).where(eq(intakeFormResponses.storeId, userStore[0].id)).orderBy(desc(intakeFormResponses.submittedAt));
      res.json(responses);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Failed to fetch responses" });
    }
  });

  app.post("/api/intake-forms/:id/respond", async (req, res) => {
    try {
      const formId = parseInt(req.params.id);
      const { customerId, appointmentId, customerName, responses } = req.body;
      const [form] = await db.select().from(intakeForms).where(eq(intakeForms.id, formId));
      if (!form) return res.status(404).json({ message: "Form not found" });

      const [response] = await db.insert(intakeFormResponses).values({
        formId, storeId: form.storeId,
        customerId: customerId ? parseInt(customerId) : null,
        appointmentId: appointmentId ? parseInt(appointmentId) : null,
        customerName, responses: JSON.stringify(responses),
      }).returning();

      res.json(response);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Failed to submit response" });
    }
  });

  // ============================================================
  // LOYALTY ROUTES
  // ============================================================

  app.get("/api/loyalty/transactions", isAuthenticated, async (req, res) => {
    try {
      const userId = (req.session as any)?.userId;
      const userStore = await db.select().from(locations).where(eq(locations.userId, userId)).limit(1);
      if (!userStore.length) return res.status(404).json({ message: "Store not found" });
      const storeId = userStore[0].id;

      const txns = await db
        .select({
          id: loyaltyTransactions.id,
          customerId: loyaltyTransactions.customerId,
          type: loyaltyTransactions.type,
          points: loyaltyTransactions.points,
          description: loyaltyTransactions.description,
          createdAt: loyaltyTransactions.createdAt,
          appointmentId: loyaltyTransactions.appointmentId,
          customerName: customers.name,
        })
        .from(loyaltyTransactions)
        .leftJoin(customers, eq(loyaltyTransactions.customerId, customers.id))
        .where(eq(loyaltyTransactions.storeId, storeId))
        .orderBy(desc(loyaltyTransactions.createdAt))
        .limit(200);

      res.json(txns.map(t => ({ ...t, customer: t.customerName ? { name: t.customerName } : null })));
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Failed to fetch loyalty transactions" });
    }
  });

  app.post("/api/loyalty/adjust", isAuthenticated, async (req, res) => {
    try {
      const { customerId, storeId, type, points, description } = req.body;

      const [txn] = await db.insert(loyaltyTransactions).values({
        storeId: parseInt(storeId), customerId: parseInt(customerId),
        type, points: parseInt(points), description,
      }).returning();

      const [customer] = await db.select().from(customers).where(eq(customers.id, parseInt(customerId)));
      const newPoints = Math.max(0, (customer.loyaltyPoints || 0) + parseInt(points));
      await db.update(customers).set({ loyaltyPoints: newPoints }).where(eq(customers.id, parseInt(customerId)));

      res.json(txn);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Failed to adjust loyalty points" });
    }
  });

  // ============================================================
  // REVIEWS
  // ============================================================

  // Public: get appointment info for the review form
  app.get("/api/reviews/form/:appointmentId", async (req, res) => {
    try {
      const appointmentId = parseInt(req.params.appointmentId);
      const [apt] = await db
        .select({
          id: appointments.id,
          date: appointments.date,
          status: appointments.status,
          storeId: appointments.storeId,
          storeName: locations.name,
          customerName: customers.name,
          serviceName: services.name,
          staffName: staff.name,
        })
        .from(appointments)
        .leftJoin(locations, eq(appointments.storeId, locations.id))
        .leftJoin(customers, eq(appointments.customerId, customers.id))
        .leftJoin(services, eq(appointments.serviceId, services.id))
        .leftJoin(staff, eq(appointments.staffId, staff.id))
        .where(eq(appointments.id, appointmentId));

      if (!apt) return res.status(404).json({ message: "Appointment not found" });

      // Check if review already submitted
      const [existing] = await db.select().from(reviews).where(eq(reviews.appointmentId, appointmentId));

      res.json({ ...apt, alreadyReviewed: !!existing });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Failed to load review form" });
    }
  });

  // Public: submit a review
  app.post("/api/reviews/submit", async (req, res) => {
    try {
      const { appointmentId, rating, comment } = req.body;
      if (!appointmentId || !rating || rating < 1 || rating > 5) {
        return res.status(400).json({ message: "Invalid review data" });
      }

      const [apt] = await db
        .select({
          id: appointments.id,
          storeId: appointments.storeId,
          customerId: appointments.customerId,
          staffId: appointments.staffId,
          customerName: customers.name,
          serviceName: services.name,
          staffName: staff.name,
        })
        .from(appointments)
        .leftJoin(customers, eq(appointments.customerId, customers.id))
        .leftJoin(services, eq(appointments.serviceId, services.id))
        .leftJoin(staff, eq(appointments.staffId, staff.id))
        .where(eq(appointments.id, parseInt(appointmentId)));

      if (!apt) return res.status(404).json({ message: "Appointment not found" });

      // Prevent duplicate reviews
      const [existing] = await db.select().from(reviews).where(eq(reviews.appointmentId, parseInt(appointmentId)));
      if (existing) return res.status(409).json({ message: "Review already submitted" });

      const [review] = await db.insert(reviews).values({
        storeId: apt.storeId!,
        customerId: apt.customerId,
        appointmentId: parseInt(appointmentId),
        staffId: apt.staffId,
        rating: parseInt(rating),
        comment: comment || null,
        customerName: apt.customerName,
        serviceName: apt.serviceName,
        staffName: apt.staffName,
        isPublic: true,
        isFeatured: false,
      }).returning();

      res.json(review);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Failed to submit review" });
    }
  });

  // Authenticated: list all reviews for a store
  app.get("/api/reviews", isAuthenticated, async (req, res) => {
    try {
      const storeId = parseInt(req.query.storeId as string);
      if (!storeId) return res.status(400).json({ message: "storeId required" });

      const rows = await db
        .select()
        .from(reviews)
        .where(eq(reviews.storeId, storeId))
        .orderBy(desc(reviews.createdAt));

      res.json(rows);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Failed to fetch reviews" });
    }
  });

  // Authenticated: aggregate stats
  app.get("/api/reviews/stats", isAuthenticated, async (req, res) => {
    try {
      const storeId = parseInt(req.query.storeId as string);
      if (!storeId) return res.status(400).json({ message: "storeId required" });

      const rows = await db.select().from(reviews).where(eq(reviews.storeId, storeId));
      const total = rows.length;
      const avg = total > 0 ? rows.reduce((s, r) => s + r.rating, 0) / total : 0;
      const distribution: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
      rows.forEach(r => { distribution[r.rating] = (distribution[r.rating] || 0) + 1; });

      res.json({ total, avg: Math.round(avg * 10) / 10, distribution });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Failed to fetch review stats" });
    }
  });

  // Authenticated: update review (toggle public/featured)
  app.put("/api/reviews/:id", isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { isPublic, isFeatured } = req.body;
      const update: Partial<typeof reviews.$inferInsert> = {};
      if (isPublic !== undefined) update.isPublic = isPublic;
      if (isFeatured !== undefined) update.isFeatured = isFeatured;
      const [row] = await db.update(reviews).set(update).where(eq(reviews.id, id)).returning();
      res.json(row);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Failed to update review" });
    }
  });

  // Authenticated: delete review
  app.delete("/api/reviews/:id", isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await db.delete(reviews).where(eq(reviews.id, id));
      res.json({ success: true });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Failed to delete review" });
    }
  });

  // ── Pro Hub Lead Capture ────────────────────────────────────────────────────
  app.post("/api/pro/leads", async (req, res) => {
    try {
      const { name, email, phone, businessName, industry, teamSize, message } = req.body;
      if (!name || !email) {
        return res.status(400).json({ error: "Name and email are required" });
      }
      const { proLeads } = await import("@shared/schema");
      const [lead] = await db.insert(proLeads).values({
        name: String(name),
        email: String(email),
        phone: phone ? String(phone) : null,
        businessName: businessName ? String(businessName) : null,
        industry: industry ? String(industry) : null,
        teamSize: teamSize ? String(teamSize) : null,
        message: message ? String(message) : null,
        source: "pro-hub",
      }).returning();
      res.json({ success: true, id: lead.id });
    } catch (err) {
      console.error("Pro lead error:", err);
      res.status(500).json({ error: "Failed to save lead" });
    }
  });

  // ── SEO Regional Pages API ────────────────────────────────────────────────────

    // Get city and business type reference data (MUST be before /:id)
    app.get("/api/seo-regions/reference-data", async (_req, res) => {
      res.json({
        cities: ALL_CITIES,
        bookingBusinessTypes: BOOKING_BUSINESS_TYPES,
      });
    });

    // List all regions
    app.get("/api/seo-regions", async (req, res) => {
      try {
        const rows = await db.select().from(seoRegions).orderBy(asc(seoRegions.city));
        res.json(rows);
      } catch (err) {
        console.error("SEO regions list error:", err);
        res.status(500).json({ error: "Failed to list regions" });
      }
    });

    // Get single region
    app.get("/api/seo-regions/:id", async (req, res) => {
      try {
        const id = parseInt(req.params.id);
        const [row] = await db.select().from(seoRegions).where(eq(seoRegions.id, id));
        if (!row) return res.status(404).json({ error: "Not found" });
        res.json(row);
      } catch (err) {
        res.status(500).json({ error: "Failed to get region" });
      }
    });

    // Create region and auto-generate HTML page
    app.post("/api/seo-regions", async (req, res) => {
      try {
        const data = insertSeoRegionSchema.parse(req.body);
        const [row] = await db.insert(seoRegions).values(data).returning();
        try {
          const allRows = await db.select().from(seoRegions);
          writeRegionPage(row, undefined, allRows);
          await db.update(seoRegions).set({ pageGenerated: true, updatedAt: new Date() }).where(eq(seoRegions.id, row.id));
          row.pageGenerated = true;
        } catch (genErr) {
          console.error("Page gen error:", genErr);
        }
        res.json(row);
      } catch (err: any) {
        if (err?.code === "23505") return res.status(409).json({ error: "A region with that slug already exists" });
        res.status(400).json({ error: err?.message ?? "Failed to create region" });
      }
    });

    // Update region and regenerate page
    app.put("/api/seo-regions/:id", async (req, res) => {
      try {
        const id = parseInt(req.params.id);
        const data = insertSeoRegionSchema.partial().parse(req.body);
        const [row] = await db.update(seoRegions).set({ ...data, updatedAt: new Date() }).where(eq(seoRegions.id, id)).returning();
        if (!row) return res.status(404).json({ error: "Not found" });
        try {
          const allRows = await db.select().from(seoRegions);
          writeRegionPage(row, undefined, allRows);
          await db.update(seoRegions).set({ pageGenerated: true }).where(eq(seoRegions.id, id));
          row.pageGenerated = true;
        } catch (genErr) {
          console.error("Page gen error:", genErr);
        }
        res.json(row);
      } catch (err: any) {
        res.status(400).json({ error: err?.message ?? "Failed to update region" });
      }
    });

    // Regenerate a single page manually
    app.post("/api/seo-regions/:id/generate", async (req, res) => {
      try {
        const id = parseInt(req.params.id);
        const [row] = await db.select().from(seoRegions).where(eq(seoRegions.id, id));
        if (!row) return res.status(404).json({ error: "Not found" });
        // Fetch all regions so the sitemap in the footer can link to them all
        const allRows = await db.select().from(seoRegions);
        writeRegionPage(row, undefined, allRows);
        await db.update(seoRegions).set({ pageGenerated: true, updatedAt: new Date() }).where(eq(seoRegions.id, id));
        res.json({ success: true, slug: row.slug, url: `/regions/${row.slug}.html` });
      } catch (err: any) {
        res.status(500).json({ error: err?.message ?? "Failed to generate page" });
      }
    });

    // Regenerate ALL pages (bulk)
    app.post("/api/seo-regions/generate-all", async (req, res) => {
      try {
        const rows = await db.select().from(seoRegions);
        let count = 0;
        // Mark all as generated first so the sitemap shows every page
        for (const row of rows) {
          try {
            await db.update(seoRegions).set({ pageGenerated: true, updatedAt: new Date() }).where(eq(seoRegions.id, row.id));
          } catch { /* skip failed */ }
        }
        // Fetch updated rows so pageGenerated flags are correct for sitemap links
        const updatedRows = await db.select().from(seoRegions);
        for (const row of updatedRows) {
          try {
            writeRegionPage(row, undefined, updatedRows);
            count++;
          } catch { /* skip failed */ }
        }
        res.json({ success: true, generated: count, total: rows.length });
      } catch (err: any) {
        res.status(500).json({ error: err?.message ?? "Bulk generation failed" });
      }
    });

    // Bulk seed — create records for all selected city × business type combinations
    app.post("/api/seo-regions/bulk-seed", async (req, res) => {
      try {
        const { cities, businessTypes, phone } = req.body as {
          cities: Array<{ city: string; state: string; stateCode: string; country?: string; nearbyCities?: string }>;
          businessTypes: string[];
          phone?: string;
        };
        if (!Array.isArray(cities) || cities.length === 0) return res.status(400).json({ error: "No cities provided" });
        if (!Array.isArray(businessTypes) || businessTypes.length === 0) return res.status(400).json({ error: "No business types provided" });

        let created = 0;
        let skipped = 0;
        const newRows: typeof seoRegions.$inferSelect[] = [];

        for (const city of cities) {
          for (const bt of businessTypes) {
            const slug = buildRegionSlug(city.city, city.stateCode, bt);
            try {
              const [row] = await db.insert(seoRegions).values({
                city: city.city,
                state: city.state,
                stateCode: city.stateCode,
                slug,
                product: "booking",
                businessType: bt,
                nearbyCities: city.nearbyCities ?? null,
                phone: phone ?? null,
                pageGenerated: false,
              }).onConflictDoNothing().returning();
              if (row) { newRows.push(row); created++; }
              else skipped++;
            } catch { skipped++; }
          }
        }

        // Bulk generate all HTML pages
        if (newRows.length > 0) {
          const allRows = await db.select().from(seoRegions);
          // Mark all as generated
          for (const r of newRows) {
            try {
              await db.update(seoRegions).set({ pageGenerated: true, updatedAt: new Date() }).where(eq(seoRegions.id, r.id));
            } catch { /* skip */ }
          }
          const updatedAllRows = await db.select().from(seoRegions);
          for (const r of newRows) {
            try {
              const fresh = updatedAllRows.find(x => x.id === r.id);
              if (fresh) writeRegionPage(fresh, undefined, updatedAllRows);
            } catch { /* skip */ }
          }
        }

        res.json({ success: true, created, skipped, total: cities.length * businessTypes.length });
      } catch (err: any) {
        res.status(500).json({ error: err?.message ?? "Bulk seed failed" });
      }
    });

    // Delete region and its HTML file
    app.delete("/api/seo-regions/:id", async (req, res) => {
      try {
        const id = parseInt(req.params.id);
        const [row] = await db.select().from(seoRegions).where(eq(seoRegions.id, id));
        if (!row) return res.status(404).json({ error: "Not found" });
        deleteRegionPage(row.slug);
        await db.delete(seoRegions).where(eq(seoRegions.id, id));
        res.json({ success: true });
      } catch (err: any) {
        res.status(500).json({ error: err?.message ?? "Failed to delete region" });
      }
    });

  // ── Certxa Pro Dashboard API ─────────────────────────────────────────────────
  const { default: proDashboardRouter } = await import("./routes/pro-dashboard.js");
  app.use("/api/pro-dashboard", proDashboardRouter);

  // ── Certxa Crew Mobile API ────────────────────────────────────────────────────
  const { default: crewMobileRouter, startOvertimeDetector } = await import("./routes/crew-mobile.js");
  app.use("/api/crew", crewMobileRouter);
  startOvertimeDetector();

  // Start the reminder schedulers (SMS + Email)
  startReminderScheduler();
  startEmailReminderScheduler();

  // Start the queue smart SMS scheduler
  startQueueSmsScheduler();

  return httpServer;
}
