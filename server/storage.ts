import { 
  stores, services, staff, customers, appointments, products,
  serviceCategories, addons, serviceAddons, appointmentAddons, staffServices, staffAvailability,
  cashDrawerSessions, drawerActions,
  type Store, type InsertStore,
  type ServiceCategory, type InsertServiceCategory,
  type Service, type InsertService,
  type Addon, type InsertAddon,
  type ServiceAddon, type InsertServiceAddon,
  type AppointmentAddon, type InsertAppointmentAddon,
  type Staff, type InsertStaff,
  type StaffService, type InsertStaffService,
  type StaffAvailability, type InsertStaffAvailability,
  type Customer, type InsertCustomer,
  type Appointment, type InsertAppointment, type AppointmentWithDetails,
  type Product, type InsertProduct,
  type CashDrawerSession, type InsertCashDrawerSession, type CashDrawerSessionWithActions,
  type DrawerAction, type InsertDrawerAction
} from "@shared/schema";
import { db } from "./db";
import { eq, and, gte, lte, inArray, desc } from "drizzle-orm";

export interface IStorage {
  getStores(): Promise<Store[]>;
  getStore(id: number): Promise<Store | undefined>;
  createStore(store: InsertStore): Promise<Store>;

  getServiceCategories(storeId?: number): Promise<ServiceCategory[]>;
  createServiceCategory(cat: InsertServiceCategory): Promise<ServiceCategory>;
  updateServiceCategory(id: number, cat: Partial<InsertServiceCategory>): Promise<ServiceCategory | undefined>;
  deleteServiceCategory(id: number): Promise<void>;

  getServices(storeId?: number): Promise<Service[]>;
  getService(id: number): Promise<Service | undefined>;
  createService(service: InsertService): Promise<Service>;
  updateService(id: number, service: Partial<InsertService>): Promise<Service | undefined>;
  deleteService(id: number): Promise<void>;

  getAddons(storeId?: number): Promise<Addon[]>;
  getAddon(id: number): Promise<Addon | undefined>;
  createAddon(addon: InsertAddon): Promise<Addon>;
  updateAddon(id: number, addon: Partial<InsertAddon>): Promise<Addon | undefined>;
  deleteAddon(id: number): Promise<void>;

  getServiceAddons(serviceId?: number): Promise<(ServiceAddon & { addon: Addon })[]>;
  getAddonsForService(serviceId: number): Promise<Addon[]>;
  createServiceAddon(sa: InsertServiceAddon): Promise<ServiceAddon>;
  deleteServiceAddon(id: number): Promise<void>;

  getAppointmentAddons(appointmentId: number): Promise<(AppointmentAddon & { addon: Addon })[]>;
  setAppointmentAddons(appointmentId: number, addonIds: number[]): Promise<void>;

  getAllStaff(storeId?: number): Promise<Staff[]>;
  getStaffMember(id: number): Promise<Staff | undefined>;
  createStaff(staffMember: InsertStaff): Promise<Staff>;
  updateStaff(id: number, staffMember: Partial<InsertStaff>): Promise<Staff | undefined>;
  deleteStaff(id: number): Promise<void>;

  getStaffServices(staffId?: number, serviceId?: number): Promise<StaffService[]>;
  getStaffForService(serviceId: number): Promise<Staff[]>;
  setStaffServices(staffId: number, serviceIds: number[]): Promise<void>;

  getStaffAvailability(staffId: number): Promise<StaffAvailability[]>;
  setStaffAvailability(staffId: number, rules: InsertStaffAvailability[]): Promise<StaffAvailability[]>;
  deleteStaffAvailabilityRule(id: number): Promise<void>;

  getCustomers(storeId?: number): Promise<Customer[]>;
  getCustomer(id: number): Promise<Customer | undefined>;
  searchCustomerByPhone(phone: string, storeId: number): Promise<Customer | undefined>;
  createCustomer(customer: InsertCustomer): Promise<Customer>;
  updateCustomer(id: number, customer: Partial<InsertCustomer>): Promise<Customer | undefined>;
  deleteCustomer(id: number): Promise<void>;

  getAppointments(filters?: { from?: Date; to?: Date; staffId?: number; storeId?: number; customerId?: number }): Promise<AppointmentWithDetails[]>;
  getAppointment(id: number): Promise<AppointmentWithDetails | undefined>;
  createAppointment(appointment: InsertAppointment): Promise<Appointment>;
  updateAppointment(id: number, appointment: Partial<InsertAppointment>): Promise<Appointment | undefined>;
  deleteAppointment(id: number): Promise<void>;

  getProducts(storeId?: number): Promise<Product[]>;
  getProduct(id: number): Promise<Product | undefined>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: number, product: Partial<InsertProduct>): Promise<Product | undefined>;
  deleteProduct(id: number): Promise<void>;

  getCashDrawerSessions(storeId: number): Promise<CashDrawerSessionWithActions[]>;
  getCashDrawerSession(id: number): Promise<CashDrawerSessionWithActions | undefined>;
  getOpenCashDrawerSession(storeId: number): Promise<CashDrawerSessionWithActions | undefined>;
  createCashDrawerSession(session: InsertCashDrawerSession): Promise<CashDrawerSession>;
  updateCashDrawerSession(id: number, data: Partial<InsertCashDrawerSession>): Promise<CashDrawerSession | undefined>;
  createDrawerAction(action: InsertDrawerAction): Promise<DrawerAction>;
  getDrawerActions(sessionId: number): Promise<DrawerAction[]>;
}

export class DatabaseStorage implements IStorage {
  // Stores
  async getStores(): Promise<Store[]> {
    return await db.select().from(stores);
  }
  async getStore(id: number): Promise<Store | undefined> {
    const [store] = await db.select().from(stores).where(eq(stores.id, id));
    return store;
  }
  async createStore(insertStore: InsertStore): Promise<Store> {
    const [store] = await db.insert(stores).values(insertStore).returning();
    return store;
  }

  // Service Categories
  async getServiceCategories(storeId?: number): Promise<ServiceCategory[]> {
    if (storeId) return await db.select().from(serviceCategories).where(eq(serviceCategories.storeId, storeId));
    return await db.select().from(serviceCategories);
  }
  async createServiceCategory(cat: InsertServiceCategory): Promise<ServiceCategory> {
    const [result] = await db.insert(serviceCategories).values(cat).returning();
    return result;
  }
  async updateServiceCategory(id: number, cat: Partial<InsertServiceCategory>): Promise<ServiceCategory | undefined> {
    const [result] = await db.update(serviceCategories).set(cat).where(eq(serviceCategories.id, id)).returning();
    return result;
  }
  async deleteServiceCategory(id: number): Promise<void> {
    await db.delete(serviceCategories).where(eq(serviceCategories.id, id));
  }

  // Services
  async getServices(storeId?: number): Promise<Service[]> {
    if (storeId) return await db.select().from(services).where(eq(services.storeId, storeId));
    return await db.select().from(services);
  }
  async getService(id: number): Promise<Service | undefined> {
    const [service] = await db.select().from(services).where(eq(services.id, id));
    return service;
  }
  async createService(insertService: InsertService): Promise<Service> {
    const [service] = await db.insert(services).values(insertService).returning();
    return service;
  }
  async updateService(id: number, updateData: Partial<InsertService>): Promise<Service | undefined> {
    const [service] = await db.update(services).set(updateData).where(eq(services.id, id)).returning();
    return service;
  }
  async deleteService(id: number): Promise<void> {
    await db.delete(services).where(eq(services.id, id));
  }

  // Addons
  async getAddons(storeId?: number): Promise<Addon[]> {
    if (storeId) return await db.select().from(addons).where(eq(addons.storeId, storeId));
    return await db.select().from(addons);
  }
  async getAddon(id: number): Promise<Addon | undefined> {
    const [addon] = await db.select().from(addons).where(eq(addons.id, id));
    return addon;
  }
  async createAddon(insertAddon: InsertAddon): Promise<Addon> {
    const [addon] = await db.insert(addons).values(insertAddon).returning();
    return addon;
  }
  async updateAddon(id: number, updateData: Partial<InsertAddon>): Promise<Addon | undefined> {
    const [addon] = await db.update(addons).set(updateData).where(eq(addons.id, id)).returning();
    return addon;
  }
  async deleteAddon(id: number): Promise<void> {
    await db.delete(addons).where(eq(addons.id, id));
  }

  // Service Addons
  async getServiceAddons(serviceId?: number): Promise<(ServiceAddon & { addon: Addon })[]> {
    const result = await db.query.serviceAddons.findMany({
      where: serviceId ? eq(serviceAddons.serviceId, serviceId) : undefined,
      with: { addon: true },
    });
    return result as any;
  }
  async getAddonsForService(serviceId: number): Promise<Addon[]> {
    const result = await db.query.serviceAddons.findMany({
      where: eq(serviceAddons.serviceId, serviceId),
      with: { addon: true },
    });
    return result.map((sa: any) => sa.addon);
  }
  async createServiceAddon(sa: InsertServiceAddon): Promise<ServiceAddon> {
    const [result] = await db.insert(serviceAddons).values(sa).returning();
    return result;
  }
  async deleteServiceAddon(id: number): Promise<void> {
    await db.delete(serviceAddons).where(eq(serviceAddons.id, id));
  }

  // Appointment Addons
  async getAppointmentAddons(appointmentId: number): Promise<(AppointmentAddon & { addon: Addon })[]> {
    const result = await db.query.appointmentAddons.findMany({
      where: eq(appointmentAddons.appointmentId, appointmentId),
      with: { addon: true },
    });
    return result as any;
  }
  async setAppointmentAddons(appointmentId: number, addonIds: number[]): Promise<void> {
    await db.delete(appointmentAddons).where(eq(appointmentAddons.appointmentId, appointmentId));
    if (addonIds.length > 0) {
      await db.insert(appointmentAddons).values(
        addonIds.map(addonId => ({ appointmentId, addonId }))
      );
    }
  }

  // Staff
  async getAllStaff(storeId?: number): Promise<Staff[]> {
    if (storeId) return await db.select().from(staff).where(eq(staff.storeId, storeId));
    return await db.select().from(staff);
  }
  async getStaffMember(id: number): Promise<Staff | undefined> {
    const [staffMember] = await db.select().from(staff).where(eq(staff.id, id));
    return staffMember;
  }
  async createStaff(insertStaff: InsertStaff): Promise<Staff> {
    const [staffMember] = await db.insert(staff).values(insertStaff).returning();
    return staffMember;
  }
  async updateStaff(id: number, updateData: Partial<InsertStaff>): Promise<Staff | undefined> {
    const [staffMember] = await db.update(staff).set(updateData).where(eq(staff.id, id)).returning();
    return staffMember;
  }
  async deleteStaff(id: number): Promise<void> {
    await db.delete(staffServices).where(eq(staffServices.staffId, id));
    await db.delete(staff).where(eq(staff.id, id));
  }

  // Staff Services
  async getStaffServices(staffId?: number, serviceId?: number): Promise<StaffService[]> {
    const conditions = [];
    if (staffId) conditions.push(eq(staffServices.staffId, staffId));
    if (serviceId) conditions.push(eq(staffServices.serviceId, serviceId));
    return await db.select().from(staffServices).where(
      conditions.length > 0 ? and(...conditions) : undefined
    );
  }

  async getStaffForService(serviceId: number): Promise<Staff[]> {
    const result = await db.query.staffServices.findMany({
      where: eq(staffServices.serviceId, serviceId),
      with: { staff: true },
    });
    return result.map((ss: any) => ss.staff);
  }

  async setStaffServices(staffId: number, serviceIds: number[]): Promise<void> {
    await db.delete(staffServices).where(eq(staffServices.staffId, staffId));
    if (serviceIds.length > 0) {
      await db.insert(staffServices).values(
        serviceIds.map(serviceId => ({ staffId, serviceId }))
      );
    }
  }

  // Staff Availability
  async getStaffAvailability(staffId: number): Promise<StaffAvailability[]> {
    return await db.select().from(staffAvailability).where(eq(staffAvailability.staffId, staffId));
  }

  async setStaffAvailability(staffId: number, rules: InsertStaffAvailability[]): Promise<StaffAvailability[]> {
    await db.delete(staffAvailability).where(eq(staffAvailability.staffId, staffId));
    if (rules.length > 0) {
      const result = await db.insert(staffAvailability).values(
        rules.map(r => ({ ...r, staffId }))
      ).returning();
      return result;
    }
    return [];
  }

  async deleteStaffAvailabilityRule(id: number): Promise<void> {
    await db.delete(staffAvailability).where(eq(staffAvailability.id, id));
  }

  // Customers
  async getCustomers(storeId?: number): Promise<Customer[]> {
    if (storeId) return await db.select().from(customers).where(eq(customers.storeId, storeId));
    return await db.select().from(customers);
  }
  async getCustomer(id: number): Promise<Customer | undefined> {
    const [customer] = await db.select().from(customers).where(eq(customers.id, id));
    return customer;
  }
  async searchCustomerByPhone(phone: string, storeId: number): Promise<Customer | undefined> {
    const [customer] = await db.select().from(customers).where(
      and(eq(customers.phone, phone), eq(customers.storeId, storeId))
    );
    return customer;
  }
  async createCustomer(insertCustomer: InsertCustomer): Promise<Customer> {
    const [customer] = await db.insert(customers).values(insertCustomer).returning();
    return customer;
  }
  async updateCustomer(id: number, updateData: Partial<InsertCustomer>): Promise<Customer | undefined> {
    const [customer] = await db.update(customers).set(updateData).where(eq(customers.id, id)).returning();
    return customer;
  }
  async deleteCustomer(id: number): Promise<void> {
    await db.delete(customers).where(eq(customers.id, id));
  }

  // Appointments
  async getAppointments(filters?: { from?: Date; to?: Date; staffId?: number; storeId?: number; customerId?: number }): Promise<AppointmentWithDetails[]> {
    const conditions = [];
    if (filters?.from) conditions.push(gte(appointments.date, filters.from));
    if (filters?.to) conditions.push(lte(appointments.date, filters.to));
    if (filters?.staffId) conditions.push(eq(appointments.staffId, filters.staffId));
    if (filters?.storeId) conditions.push(eq(appointments.storeId, filters.storeId));
    if (filters?.customerId) conditions.push(eq(appointments.customerId, filters.customerId));

    const result = await db.query.appointments.findMany({
      where: conditions.length > 0 ? and(...conditions) : undefined,
      with: {
        service: true,
        staff: true,
        customer: true,
        store: true,
        appointmentAddons: {
          with: { addon: true },
        },
      },
      orderBy: (appointments, { asc }) => [asc(appointments.date)],
    });
    
    return result as any;
  }

  async getAppointment(id: number): Promise<AppointmentWithDetails | undefined> {
    const result = await db.query.appointments.findFirst({
      where: eq(appointments.id, id),
      with: {
        service: true,
        staff: true,
        customer: true,
        store: true,
        appointmentAddons: {
          with: { addon: true },
        },
      },
    });
    return result as any;
  }

  async createAppointment(insertAppointment: InsertAppointment): Promise<Appointment> {
    const [appointment] = await db.insert(appointments).values(insertAppointment).returning();
    return appointment;
  }

  async updateAppointment(id: number, updateData: Partial<InsertAppointment>): Promise<Appointment | undefined> {
    const [appointment] = await db.update(appointments).set(updateData).where(eq(appointments.id, id)).returning();
    return appointment;
  }

  async deleteAppointment(id: number): Promise<void> {
    await db.delete(appointmentAddons).where(eq(appointmentAddons.appointmentId, id));
    await db.delete(appointments).where(eq(appointments.id, id));
  }

  // Products
  async getProducts(storeId?: number): Promise<Product[]> {
    if (storeId) return await db.select().from(products).where(eq(products.storeId, storeId));
    return await db.select().from(products);
  }
  async getProduct(id: number): Promise<Product | undefined> {
    const [product] = await db.select().from(products).where(eq(products.id, id));
    return product;
  }
  async createProduct(insertProduct: InsertProduct): Promise<Product> {
    const [product] = await db.insert(products).values(insertProduct).returning();
    return product;
  }
  async updateProduct(id: number, updateData: Partial<InsertProduct>): Promise<Product | undefined> {
    const [product] = await db.update(products).set(updateData).where(eq(products.id, id)).returning();
    return product;
  }
  async deleteProduct(id: number): Promise<void> {
    await db.delete(products).where(eq(products.id, id));
  }

  // Cash Drawer Sessions
  async getCashDrawerSessions(storeId: number): Promise<CashDrawerSessionWithActions[]> {
    const result = await db.query.cashDrawerSessions.findMany({
      where: eq(cashDrawerSessions.storeId, storeId),
      with: { actions: true },
      orderBy: (sessions, { desc }) => [desc(sessions.openedAt)],
    });
    return result as any;
  }

  async getCashDrawerSession(id: number): Promise<CashDrawerSessionWithActions | undefined> {
    const result = await db.query.cashDrawerSessions.findFirst({
      where: eq(cashDrawerSessions.id, id),
      with: { actions: true },
    });
    return result as any;
  }

  async getOpenCashDrawerSession(storeId: number): Promise<CashDrawerSessionWithActions | undefined> {
    const result = await db.query.cashDrawerSessions.findFirst({
      where: and(eq(cashDrawerSessions.storeId, storeId), eq(cashDrawerSessions.status, "open")),
      with: { actions: true },
    });
    return result as any;
  }

  async createCashDrawerSession(session: InsertCashDrawerSession): Promise<CashDrawerSession> {
    const [result] = await db.insert(cashDrawerSessions).values(session).returning();
    return result;
  }

  async updateCashDrawerSession(id: number, data: Partial<InsertCashDrawerSession>): Promise<CashDrawerSession | undefined> {
    const [result] = await db.update(cashDrawerSessions).set(data).where(eq(cashDrawerSessions.id, id)).returning();
    return result;
  }

  async createDrawerAction(action: InsertDrawerAction): Promise<DrawerAction> {
    const [result] = await db.insert(drawerActions).values(action).returning();
    return result;
  }

  async getDrawerActions(sessionId: number): Promise<DrawerAction[]> {
    return await db.select().from(drawerActions).where(eq(drawerActions.sessionId, sessionId));
  }
}

export const storage = new DatabaseStorage();
