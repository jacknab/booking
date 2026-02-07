import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { setupAuth, registerAuthRoutes } from "./replit_integrations/auth";
import { z } from "zod";
import { 
  insertStoreSchema,
  insertServiceSchema, 
  insertStaffSchema, 
  insertCustomerSchema, 
  insertAppointmentSchema, 
  insertProductSchema 
} from "@shared/schema";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Auth Setup
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

  // === CUSTOMERS ===
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

  // Seed Data
  await seedDatabase();

  return httpServer;
}

async function seedDatabase() {
  const existingStores = await storage.getStores();
  if (existingStores.length === 0) {
    console.log("Seeding database with stores...");
    
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

    // Services
    const service1 = await storage.createService({
      name: "Haircut - Women",
      description: "Wash, cut and blow dry",
      duration: 60,
      price: "65.00",
      category: "Hair",
      storeId: store1.id,
    });
    const service2 = await storage.createService({
      name: "Haircut - Men",
      description: "Wash and cut",
      duration: 30,
      price: "35.00",
      category: "Hair",
      storeId: store2.id,
    });

    // Staff
    const staff1 = await storage.createStaff({
      name: "Sarah Jenkins",
      role: "Senior Stylist",
      bio: "10 years experience.",
      color: "#f472b6",
      storeId: store1.id,
    });
    const staff2 = await storage.createStaff({
      name: "Mike Chen",
      role: "Barber",
      bio: "Expert in fades.",
      color: "#60a5fa",
      storeId: store2.id,
    });

    console.log("Database seeded with stores!");
  }
}
