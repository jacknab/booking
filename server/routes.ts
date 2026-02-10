import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { setupAuth, isAuthenticated } from "./auth";
import { z } from "zod";
import { db } from "./db";
import { users } from "@shared/models/auth";
import { eq } from "drizzle-orm";
import { businessTemplates } from "./onboarding-data";
import { fromZonedTime, toZonedTime } from "date-fns-tz";
import { sendBookingConfirmation, startReminderScheduler } from "./sms";
import { 
  insertStoreSchema,
  insertServiceCategorySchema,
  insertServiceSchema, 
  insertAddonSchema,
  insertServiceAddonSchema,
  insertStaffSchema,
  insertCustomerSchema, 
  insertAppointmentSchema, 
  type Staff,
  insertProductSchema,
  insertCashDrawerSessionSchema,
  insertCalendarSettingsSchema,
} from "@shared/schema";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  setupAuth(app);

  app.use("/api", (req, res, next) => {
    if (req.path.startsWith("/auth/")) return next();
    isAuthenticated(req, res, next);
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

  app.post(api.stores.create.path, async (req, res) => {
    try {
      const userId = (req.session as any)?.userId;
      if (!userId) return res.status(401).json({ message: "Unauthorized" });
      const input = insertStoreSchema.parse(req.body);
      const store = await storage.createStore({ ...input, userId });
      res.status(201).json(store);
    } catch (error) {
      res.status(400).json({ message: "Invalid input" });
    }
  });

  app.patch("/api/stores/:id", async (req, res) => {
    try {
      const id = Number(req.params.id);
      const input = insertStoreSchema.partial().parse(req.body);
      const store = await storage.updateStore(id, input);
      if (!store) return res.status(404).json({ message: "Store not found" });
      res.json(store);
    } catch (error) {
      res.status(400).json({ message: "Invalid input" });
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

  app.post(api.services.create.path, async (req, res) => {
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

  app.post(api.staff.create.path, async (req, res) => {
    try {
      const input = insertStaffSchema.parse(req.body);
      const member = await storage.createStaff(input);
      res.status(201).json(member);
    } catch (error) {
      res.status(400).json({ message: "Invalid input" });
    }
  });

  app.patch(api.staff.update.path, async (req, res) => {
    try {
      const input = insertStaffSchema.partial().parse(req.body);
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
        candidateStaff = member ? [member] : [];
      } else {
        candidateStaff = await storage.getStaffForService(serviceId);
      }

      if (candidateStaff.length === 0) {
        return res.json([]);
      }

      const tz = store.timezone || "UTC";

      const calSettings = await storage.getCalendarSettings(storeId);
      const allowOutside = calSettings?.allowBookingOutsideHours ?? true;
      const businessStartHour = allowOutside ? 7 : 9;
      const businessEndHour = allowOutside ? 22 : 18;
      const slotInterval = calSettings?.timeSlotInterval || 15;

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

      const businessEndUtc = fromZonedTime(new Date(`${date}T${String(businessEndHour).padStart(2, "0")}:00:00`), tz);
      const nowUtc = new Date();

      for (let hour = businessStartHour; hour < businessEndHour; hour++) {
        for (let min = 0; min < 60; min += slotInterval) {
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

  app.post(api.customers.create.path, async (req, res) => {
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
    const filters = {
      from: req.query.from ? new Date(req.query.from as string) : undefined,
      to: req.query.to ? new Date(req.query.to as string) : undefined,
      staffId: req.query.staffId ? Number(req.query.staffId) : undefined,
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

  app.post(api.appointments.create.path, async (req, res) => {
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
      }

      res.status(201).json(appointment);
    } catch (error) {
       console.error(error);
      res.status(400).json({ message: "Invalid input" });
    }
  });

  app.patch(api.appointments.update.path, async (req, res) => {
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
      const userId = (req.session as any).userId;

      const [currentUser] = await db.select().from(users).where(eq(users.id, userId));
      if (currentUser?.onboardingCompleted) {
        const { password: _, ...safeUser } = currentUser;
        return res.json({ store: null, user: safeUser });
      }

      const onboardingSchema = z.object({
        businessType: z.enum(["Hair Salon", "Nail Salon", "Spa", "Barbershop"]),
        businessName: z.string().min(1).max(100),
        timezone: z.string().min(1).default("America/New_York"),
      });

      const parsed = onboardingSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ message: "Invalid input", errors: parsed.error.flatten() });
      }

      const { businessType, businessName, timezone } = parsed.data;

      const template = businessTemplates[businessType];
      if (!template) {
        return res.status(400).json({ message: "Invalid business type" });
      }

      const store = await storage.createStore({
        name: businessName,
        timezone: timezone,
        userId: userId,
      });

      const addonCache: Record<string, number> = {};

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

      await db.update(users).set({ onboardingCompleted: true }).where(eq(users.id, userId));

      const [updatedUser] = await db.select().from(users).where(eq(users.id, userId));
      const { password: _, ...safeUser } = updatedUser;

      res.json({ store, user: safeUser });
    } catch (error) {
      console.error("Onboarding error:", error);
      res.status(500).json({ message: "Failed to complete onboarding" });
    }
  });

  // === PUBLIC BOOKING ROUTES (no auth required) ===

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
        customerPhone: z.string().optional(),
        notes: z.string().optional(),
      });

      const input = bookingSchema.parse(req.body);

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

      const fullAppointment = await storage.getAppointment(appointment.id);
      if (fullAppointment) {
        sendBookingConfirmation(fullAppointment).catch(console.error);
      }

      res.status(201).json(appointment);
    } catch (error) {
      console.error("Public booking error:", error);
      res.status(400).json({ message: "Failed to create booking" });
    }
  });

  app.get("/api/public/check-slug/:slug", async (req, res) => {
    const store = await storage.getStoreBySlug(req.params.slug);
    res.json({ available: !store });
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

  // Start the reminder scheduler
  startReminderScheduler();

  return httpServer;
}
