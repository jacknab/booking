import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { setupAuth, registerAuthRoutes } from "./replit_integrations/auth";
import { z } from "zod";
import { fromZonedTime } from "date-fns-tz";
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
} from "@shared/schema";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  await setupAuth(app);
  registerAuthRoutes(app);

  // === STORES ===
  app.get(api.stores.list.path, async (_req, res) => {
    const stores = await storage.getStores();
    res.json(stores);
  });

  app.get(api.stores.get.path, async (req, res) => {
    const store = await storage.getStore(Number(req.params.id));
    if (!store) return res.status(404).json({ message: "Store not found" });
    res.json(store);
  });

  app.post(api.stores.create.path, async (req, res) => {
    try {
      const input = insertStoreSchema.parse(req.body);
      const store = await storage.createStore(input);
      res.status(201).json(store);
    } catch (error) {
      res.status(400).json({ message: "Invalid input" });
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

  // === AVAILABILITY ===
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

      const businessStartHour = 9;
      const businessEndHour = 21;
      const slotInterval = 30;

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
    res.json(appointments);
  });

  app.post(api.appointments.create.path, async (req, res) => {
    try {
      const input = insertAppointmentSchema.parse({
        ...req.body,
        date: new Date(req.body.date),
      });
      const appointment = await storage.createAppointment(input);
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

  // Seed Data
  await seedDatabase();

  return httpServer;
}

async function seedDatabase() {
  const existingStores = await storage.getStores();
  if (existingStores.length === 0) {
    console.log("Seeding database...");
    
    // Stores
    const store1 = await storage.createStore({
      name: "Main Street Salon",
      timezone: "America/New_York",
      address: "123 Main St, New York, NY",
    });
    const store2 = await storage.createStore({
      name: "West Side Spa",
      timezone: "America/Los_Angeles",
      address: "456 West Blvd, Los Angeles, CA",
    });

    // Categories - Store 1
    const catHair1 = await storage.createServiceCategory({ name: "Hair", storeId: store1.id });
    const catNails1 = await storage.createServiceCategory({ name: "Nails", storeId: store1.id });
    const catSkin1 = await storage.createServiceCategory({ name: "Skin Care", storeId: store1.id });
    const catWaxing1 = await storage.createServiceCategory({ name: "Waxing", storeId: store1.id });

    // Categories - Store 2
    const catHair2 = await storage.createServiceCategory({ name: "Hair", storeId: store2.id });
    const catMassage2 = await storage.createServiceCategory({ name: "Massage", storeId: store2.id });
    const catSkin2 = await storage.createServiceCategory({ name: "Skin Care", storeId: store2.id });

    // Services - Store 1 (Main Street Salon)
    const svcHaircutW = await storage.createService({
      name: "Haircut - Women", description: "Wash, cut and blow dry", duration: 60, price: "65.00",
      category: "Hair", categoryId: catHair1.id, storeId: store1.id,
    });
    const svcHaircutM = await storage.createService({
      name: "Haircut - Men", description: "Classic men's cut", duration: 30, price: "35.00",
      category: "Hair", categoryId: catHair1.id, storeId: store1.id,
    });
    const svcBlowDry = await storage.createService({
      name: "Blow Dry & Style", description: "Professional blow dry and styling", duration: 45, price: "45.00",
      category: "Hair", categoryId: catHair1.id, storeId: store1.id,
    });
    const svcColorFull = await storage.createService({
      name: "Color - Full", description: "Full head color application", duration: 120, price: "150.00",
      category: "Hair", categoryId: catHair1.id, storeId: store1.id,
    });
    const svcHighlights = await storage.createService({
      name: "Highlights", description: "Partial or full highlights", duration: 90, price: "120.00",
      category: "Hair", categoryId: catHair1.id, storeId: store1.id,
    });

    const svcManicure = await storage.createService({
      name: "Classic Manicure", description: "File, shape, cuticle care and polish", duration: 30, price: "25.00",
      category: "Nails", categoryId: catNails1.id, storeId: store1.id,
    });
    const svcGelMani = await storage.createService({
      name: "Gel Manicure", description: "Long-lasting gel polish manicure", duration: 45, price: "40.00",
      category: "Nails", categoryId: catNails1.id, storeId: store1.id,
    });
    const svcPedi = await storage.createService({
      name: "Deluxe Pedicure", description: "Soak, scrub, massage and polish", duration: 60, price: "55.00",
      category: "Nails", categoryId: catNails1.id, storeId: store1.id,
    });
    const svcSpaPedi = await storage.createService({
      name: "Spa Pedicure", description: "Premium pedicure with paraffin wax", duration: 75, price: "70.00",
      category: "Nails", categoryId: catNails1.id, storeId: store1.id,
    });

    const svcFacial = await storage.createService({
      name: "Classic Facial", description: "Deep cleanse and hydration", duration: 60, price: "85.00",
      category: "Skin Care", categoryId: catSkin1.id, storeId: store1.id,
    });
    const svcAntiAging = await storage.createService({
      name: "Anti-Aging Facial", description: "Targeted anti-aging treatment", duration: 75, price: "110.00",
      category: "Skin Care", categoryId: catSkin1.id, storeId: store1.id,
    });
    const svcEyebrowWax = await storage.createService({
      name: "Eyebrow Wax", description: "Precision eyebrow shaping", duration: 15, price: "18.00",
      category: "Waxing", categoryId: catWaxing1.id, storeId: store1.id,
    });
    const svcLegWax = await storage.createService({
      name: "Full Leg Wax", description: "Complete leg waxing", duration: 45, price: "65.00",
      category: "Waxing", categoryId: catWaxing1.id, storeId: store1.id,
    });

    // Services - Store 2 (West Side Spa)
    const svcBarberCut = await storage.createService({
      name: "Haircut - Men", description: "Wash and cut", duration: 30, price: "35.00",
      category: "Hair", categoryId: catHair2.id, storeId: store2.id,
    });
    const svcBeardTrim = await storage.createService({
      name: "Beard Trim", description: "Shape and trim beard", duration: 20, price: "20.00",
      category: "Hair", categoryId: catHair2.id, storeId: store2.id,
    });
    const svcHotTowel = await storage.createService({
      name: "Hot Towel Shave", description: "Traditional straight razor shave", duration: 30, price: "40.00",
      category: "Hair", categoryId: catHair2.id, storeId: store2.id,
    });

    const svcDeepTissue = await storage.createService({
      name: "Deep Tissue Massage", description: "60 min therapeutic massage", duration: 60, price: "95.00",
      category: "Massage", categoryId: catMassage2.id, storeId: store2.id,
    });
    const svcSwedish = await storage.createService({
      name: "Swedish Massage", description: "Relaxation full body massage", duration: 60, price: "85.00",
      category: "Massage", categoryId: catMassage2.id, storeId: store2.id,
    });
    const svcHotStone = await storage.createService({
      name: "Hot Stone Massage", description: "Heated stone therapy massage", duration: 75, price: "110.00",
      category: "Massage", categoryId: catMassage2.id, storeId: store2.id,
    });
    const svcAromaFacial = await storage.createService({
      name: "Aromatherapy Facial", description: "Essential oil infused facial", duration: 60, price: "90.00",
      category: "Skin Care", categoryId: catSkin2.id, storeId: store2.id,
    });
    const svcBodyScrub = await storage.createService({
      name: "Body Scrub", description: "Full body exfoliation treatment", duration: 45, price: "75.00",
      category: "Skin Care", categoryId: catSkin2.id, storeId: store2.id,
    });

    // Addons - Store 1 (linked to nail services)
    const addonFrenchTips = await storage.createAddon({
      name: "French Tips", description: "Classic white tips", price: "5.00", duration: 10, storeId: store1.id,
    });
    const addonNailArt = await storage.createAddon({
      name: "Nail Art - Advanced", description: "Detailed or multi-nail art", price: "15.00", duration: 25, storeId: store1.id,
    });
    const addonGelRemoval = await storage.createAddon({
      name: "Gel Removal", description: "Safe gel polish removal", price: "5.00", duration: 15, storeId: store1.id,
    });
    const addonParaffin = await storage.createAddon({
      name: "Paraffin Wax Treatment", description: "Hydrating wax treatment", price: "8.00", duration: 15, storeId: store1.id,
    });
    const addonHotOil = await storage.createAddon({
      name: "Hot Oil Cuticle Treatment", description: "Nourishing oil massage", price: "7.00", duration: 15, storeId: store1.id,
    });
    const addonExtraMassage = await storage.createAddon({
      name: "Extra Massage", description: "Additional massage time", price: "10.00", duration: 10, storeId: store1.id,
    });
    const addonNailArtSimple = await storage.createAddon({
      name: "Nail Art - Simple", description: "Simple designs on 1-2 nails", price: "5.00", duration: 10, storeId: store1.id,
    });
    const addonPolishChange = await storage.createAddon({
      name: "Polish Change", description: "Detailed or color", price: "5.00", duration: 5, storeId: store1.id,
    });

    // Addons - Store 1 (linked to hair services)
    const addonDeepCondition = await storage.createAddon({
      name: "Deep Conditioning", description: "Intensive moisture treatment", price: "15.00", duration: 15, storeId: store1.id,
    });
    const addonScalpMassage = await storage.createAddon({
      name: "Scalp Massage", description: "Relaxing scalp treatment", price: "10.00", duration: 10, storeId: store1.id,
    });

    // Link addons to services - Classic Manicure
    await storage.createServiceAddon({ serviceId: svcManicure.id, addonId: addonFrenchTips.id });
    await storage.createServiceAddon({ serviceId: svcManicure.id, addonId: addonNailArt.id });
    await storage.createServiceAddon({ serviceId: svcManicure.id, addonId: addonGelRemoval.id });
    await storage.createServiceAddon({ serviceId: svcManicure.id, addonId: addonParaffin.id });
    await storage.createServiceAddon({ serviceId: svcManicure.id, addonId: addonHotOil.id });
    await storage.createServiceAddon({ serviceId: svcManicure.id, addonId: addonExtraMassage.id });
    await storage.createServiceAddon({ serviceId: svcManicure.id, addonId: addonNailArtSimple.id });
    await storage.createServiceAddon({ serviceId: svcManicure.id, addonId: addonPolishChange.id });

    // Link addons to services - Gel Manicure
    await storage.createServiceAddon({ serviceId: svcGelMani.id, addonId: addonFrenchTips.id });
    await storage.createServiceAddon({ serviceId: svcGelMani.id, addonId: addonNailArt.id });
    await storage.createServiceAddon({ serviceId: svcGelMani.id, addonId: addonGelRemoval.id });
    await storage.createServiceAddon({ serviceId: svcGelMani.id, addonId: addonNailArtSimple.id });

    // Link addons to services - Pedicure
    await storage.createServiceAddon({ serviceId: svcPedi.id, addonId: addonFrenchTips.id });
    await storage.createServiceAddon({ serviceId: svcPedi.id, addonId: addonParaffin.id });
    await storage.createServiceAddon({ serviceId: svcPedi.id, addonId: addonExtraMassage.id });
    await storage.createServiceAddon({ serviceId: svcPedi.id, addonId: addonPolishChange.id });

    // Link addons to services - Haircut Women
    await storage.createServiceAddon({ serviceId: svcHaircutW.id, addonId: addonDeepCondition.id });
    await storage.createServiceAddon({ serviceId: svcHaircutW.id, addonId: addonScalpMassage.id });

    // Staff
    const staff1 = await storage.createStaff({
      name: "Sarah Jenkins", role: "Senior Stylist", bio: "10 years experience.", color: "#f472b6", storeId: store1.id,
    });
    const staff3 = await storage.createStaff({
      name: "Lisa Park", role: "Nail Tech", bio: "Nail art specialist.", color: "#a78bfa", storeId: store1.id,
    });
    const staff2 = await storage.createStaff({
      name: "Mike Chen", role: "Barber", bio: "Expert in fades.", color: "#60a5fa", storeId: store2.id,
    });
    const staff4 = await storage.createStaff({
      name: "Emma Rodriguez", role: "Massage Therapist", bio: "Certified LMT.", color: "#34d399", storeId: store2.id,
    });

    // Staff-Service links (which staff can perform which services)
    // Sarah Jenkins (Senior Stylist) - all hair, skin care, waxing
    await storage.setStaffServices(staff1.id, [
      svcHaircutW.id, svcHaircutM.id, svcBlowDry.id, svcColorFull.id, svcHighlights.id,
      svcFacial.id, svcAntiAging.id, svcEyebrowWax.id, svcLegWax.id,
    ]);
    // Lisa Park (Nail Tech) - all nail services, eyebrow wax, facials
    await storage.setStaffServices(staff3.id, [
      svcManicure.id, svcGelMani.id, svcPedi.id, svcSpaPedi.id,
      svcEyebrowWax.id, svcFacial.id, svcAntiAging.id,
    ]);
    // Mike Chen (Barber) - hair services at store 2, skin care
    await storage.setStaffServices(staff2.id, [
      svcBarberCut.id, svcBeardTrim.id, svcHotTowel.id,
      svcAromaFacial.id, svcBodyScrub.id,
    ]);
    // Emma Rodriguez (Massage Therapist) - massage services, skin care
    await storage.setStaffServices(staff4.id, [
      svcDeepTissue.id, svcSwedish.id, svcHotStone.id,
      svcAromaFacial.id, svcBodyScrub.id,
    ]);

    // Customers
    const cust1 = await storage.createCustomer({
      name: "Alice Smith", email: "alice@example.com", phone: "555-0101", notes: "Prefers tea over coffee.", storeId: store1.id,
    });
    const cust2 = await storage.createCustomer({
      name: "Bob Johnson", email: "bob@example.com", phone: "555-0202", storeId: store1.id,
    });
    const cust3 = await storage.createCustomer({
      name: "Carol Williams", email: "carol@example.com", phone: "555-0303", storeId: store2.id,
    });
    const cust4 = await storage.createCustomer({
      name: "David Lee", email: "david@example.com", phone: "555-0404", storeId: store2.id,
    });

    // Appointments
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const ny10am = new Date(today);
    ny10am.setUTCHours(15, 0, 0, 0);
    const apt1 = await storage.createAppointment({
      date: ny10am, duration: 60, status: "confirmed", notes: "Regular client",
      serviceId: svcHaircutW.id, staffId: staff1.id, customerId: cust1.id, storeId: store1.id,
    });

    const ny1130am = new Date(today);
    ny1130am.setUTCHours(16, 30, 0, 0);
    const apt2 = await storage.createAppointment({
      date: ny1130am, duration: 55, status: "pending", notes: "",
      serviceId: svcManicure.id, staffId: staff3.id, customerId: cust2.id, storeId: store1.id,
    });
    // Add addons to the manicure appointment
    await storage.setAppointmentAddons(apt2.id, [addonFrenchTips.id, addonHotOil.id]);

    const ny2pm = new Date(today);
    ny2pm.setUTCHours(19, 0, 0, 0);
    await storage.createAppointment({
      date: ny2pm, duration: 60, status: "confirmed",
      serviceId: svcHaircutW.id, staffId: staff1.id, customerId: cust2.id, storeId: store1.id,
    });

    const la10am = new Date(today);
    la10am.setUTCHours(18, 0, 0, 0);
    await storage.createAppointment({
      date: la10am, duration: 30, status: "confirmed", notes: "Beard trim too",
      serviceId: svcBarberCut.id, staffId: staff2.id, customerId: cust3.id, storeId: store2.id,
    });

    const la1pm = new Date(today);
    la1pm.setUTCHours(21, 0, 0, 0);
    await storage.createAppointment({
      date: la1pm, duration: 60, status: "pending",
      serviceId: svcDeepTissue.id, staffId: staff4.id, customerId: cust4.id, storeId: store2.id,
    });

    // Products
    await storage.createProduct({
      name: "Moroccan Oil Treatment", brand: "Moroccanoil", price: "48.00", stock: 15, category: "Hair Care", storeId: store1.id,
    });
    await storage.createProduct({
      name: "Beard Oil", brand: "Viking Revolution", price: "14.99", stock: 20, category: "Grooming", storeId: store2.id,
    });

    console.log("Database seeded with stores, categories, services, addons, staff, customers, and appointments!");
  }
}
