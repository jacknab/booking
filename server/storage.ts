import { 
  stores, services, staff, customers, appointments, products,
  type Store, type InsertStore,
  type Service, type InsertService,
  type Staff, type InsertStaff,
  type Customer, type InsertCustomer,
  type Appointment, type InsertAppointment, type AppointmentWithDetails,
  type Product, type InsertProduct
} from "@shared/schema";
import { db } from "./db";
import { eq, and, gte, lte } from "drizzle-orm";

export interface IStorage {
  // Stores
  getStores(): Promise<Store[]>;
  getStore(id: number): Promise<Store | undefined>;
  createStore(store: InsertStore): Promise<Store>;

  // Services
  getServices(storeId?: number): Promise<Service[]>;
  getService(id: number): Promise<Service | undefined>;
  createService(service: InsertService): Promise<Service>;
  updateService(id: number, service: Partial<InsertService>): Promise<Service | undefined>;
  deleteService(id: number): Promise<void>;

  // Staff
  getAllStaff(storeId?: number): Promise<Staff[]>;
  getStaffMember(id: number): Promise<Staff | undefined>;
  createStaff(staffMember: InsertStaff): Promise<Staff>;
  updateStaff(id: number, staffMember: Partial<InsertStaff>): Promise<Staff | undefined>;
  deleteStaff(id: number): Promise<void>;

  // Customers
  getCustomers(storeId?: number): Promise<Customer[]>;
  getCustomer(id: number): Promise<Customer | undefined>;
  createCustomer(customer: InsertCustomer): Promise<Customer>;
  updateCustomer(id: number, customer: Partial<InsertCustomer>): Promise<Customer | undefined>;
  deleteCustomer(id: number): Promise<void>;

  // Appointments
  getAppointments(filters?: { from?: Date; to?: Date; staffId?: number; storeId?: number }): Promise<AppointmentWithDetails[]>;
  getAppointment(id: number): Promise<AppointmentWithDetails | undefined>;
  createAppointment(appointment: InsertAppointment): Promise<Appointment>;
  updateAppointment(id: number, appointment: Partial<InsertAppointment>): Promise<Appointment | undefined>;
  deleteAppointment(id: number): Promise<void>;

  // Products
  getProducts(storeId?: number): Promise<Product[]>;
  getProduct(id: number): Promise<Product | undefined>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: number, product: Partial<InsertProduct>): Promise<Product | undefined>;
  deleteProduct(id: number): Promise<void>;
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
    await db.delete(staff).where(eq(staff.id, id));
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
  async getAppointments(filters?: { from?: Date; to?: Date; staffId?: number; storeId?: number }): Promise<AppointmentWithDetails[]> {
    const conditions = [];
    if (filters?.from) conditions.push(gte(appointments.date, filters.from));
    if (filters?.to) conditions.push(lte(appointments.date, filters.to));
    if (filters?.staffId) conditions.push(eq(appointments.staffId, filters.staffId));
    if (filters?.storeId) conditions.push(eq(appointments.storeId, filters.storeId));

    const result = await db.query.appointments.findMany({
      where: conditions.length > 0 ? and(...conditions) : undefined,
      with: {
        service: true,
        staff: true,
        customer: true,
        store: true,
      },
      orderBy: (appointments, { asc }) => [asc(appointments.date)],
    });
    
    return result;
  }

  async getAppointment(id: number): Promise<AppointmentWithDetails | undefined> {
    const result = await db.query.appointments.findFirst({
      where: eq(appointments.id, id),
      with: {
        service: true,
        staff: true,
        customer: true,
        store: true,
      },
    });
    return result;
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
}

export const storage = new DatabaseStorage();
