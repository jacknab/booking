import { z } from 'zod';
import { 
  insertStoreSchema,
  insertServiceCategorySchema,
  insertServiceSchema, 
  insertAddonSchema,
  insertServiceAddonSchema,
  insertAppointmentAddonSchema,
  insertStaffSchema,
  insertStaffServiceSchema,
  insertCustomerSchema, 
  insertAppointmentSchema, 
  insertProductSchema,
  stores,
  serviceCategories,
  services,
  addons,
  serviceAddons,
  appointmentAddons,
  staffServices,
  staff,
  customers,
  appointments,
  products
} from './schema';

export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  notFound: z.object({
    message: z.string(),
  }),
  internal: z.object({
    message: z.string(),
  }),
};

export const api = {
  stores: {
    list: {
      method: 'GET' as const,
      path: '/api/stores' as const,
      responses: {
        200: z.array(z.custom<typeof stores.$inferSelect>()),
      },
    },
    get: {
      method: 'GET' as const,
      path: '/api/stores/:id' as const,
      responses: {
        200: z.custom<typeof stores.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/stores' as const,
      input: insertStoreSchema,
      responses: {
        201: z.custom<typeof stores.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
  },
  serviceCategories: {
    list: {
      method: 'GET' as const,
      path: '/api/service-categories' as const,
      responses: {
        200: z.array(z.custom<typeof serviceCategories.$inferSelect>()),
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/service-categories' as const,
      input: insertServiceCategorySchema,
      responses: {
        201: z.custom<typeof serviceCategories.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
    update: {
      method: 'PATCH' as const,
      path: '/api/service-categories/:id' as const,
      input: insertServiceCategorySchema.partial(),
      responses: {
        200: z.custom<typeof serviceCategories.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    },
    delete: {
      method: 'DELETE' as const,
      path: '/api/service-categories/:id' as const,
      responses: {
        204: z.void(),
        404: errorSchemas.notFound,
      },
    },
  },
  services: {
    list: {
      method: 'GET' as const,
      path: '/api/services' as const,
      input: z.object({ storeId: z.coerce.number().optional() }).optional(),
      responses: {
        200: z.array(z.custom<typeof services.$inferSelect>()),
      },
    },
    get: {
      method: 'GET' as const,
      path: '/api/services/:id' as const,
      responses: {
        200: z.custom<typeof services.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/services' as const,
      input: insertServiceSchema,
      responses: {
        201: z.custom<typeof services.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
    update: {
      method: 'PATCH' as const,
      path: '/api/services/:id' as const,
      input: insertServiceSchema.partial(),
      responses: {
        200: z.custom<typeof services.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    },
    delete: {
      method: 'DELETE' as const,
      path: '/api/services/:id' as const,
      responses: {
        204: z.void(),
        404: errorSchemas.notFound,
      },
    },
  },
  addons: {
    list: {
      method: 'GET' as const,
      path: '/api/addons' as const,
      responses: {
        200: z.array(z.custom<typeof addons.$inferSelect>()),
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/addons' as const,
      input: insertAddonSchema,
      responses: {
        201: z.custom<typeof addons.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
    update: {
      method: 'PATCH' as const,
      path: '/api/addons/:id' as const,
      input: insertAddonSchema.partial(),
      responses: {
        200: z.custom<typeof addons.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    },
    delete: {
      method: 'DELETE' as const,
      path: '/api/addons/:id' as const,
      responses: {
        204: z.void(),
        404: errorSchemas.notFound,
      },
    },
  },
  serviceAddons: {
    list: {
      method: 'GET' as const,
      path: '/api/service-addons' as const,
      responses: {
        200: z.array(z.custom<typeof serviceAddons.$inferSelect & { addon: typeof addons.$inferSelect }>()),
      },
    },
    forService: {
      method: 'GET' as const,
      path: '/api/services/:id/addons' as const,
      responses: {
        200: z.array(z.custom<typeof addons.$inferSelect>()),
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/service-addons' as const,
      input: insertServiceAddonSchema,
      responses: {
        201: z.custom<typeof serviceAddons.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
    delete: {
      method: 'DELETE' as const,
      path: '/api/service-addons/:id' as const,
      responses: {
        204: z.void(),
      },
    },
  },
  appointmentAddons: {
    forAppointment: {
      method: 'GET' as const,
      path: '/api/appointments/:id/addons' as const,
      responses: {
        200: z.array(z.custom<typeof addons.$inferSelect>()),
      },
    },
    set: {
      method: 'POST' as const,
      path: '/api/appointments/:id/addons' as const,
      input: z.object({ addonIds: z.array(z.number()) }),
      responses: {
        200: z.object({ success: z.boolean() }),
        400: errorSchemas.validation,
        409: z.object({ message: z.string(), availableMinutes: z.number().optional() }),
      },
    },
  },
  staffServices: {
    list: {
      method: 'GET' as const,
      path: '/api/staff-services' as const,
      responses: {
        200: z.array(z.custom<typeof staffServices.$inferSelect>()),
      },
    },
    forService: {
      method: 'GET' as const,
      path: '/api/services/:id/staff' as const,
      responses: {
        200: z.array(z.custom<typeof staff.$inferSelect>()),
      },
    },
    set: {
      method: 'POST' as const,
      path: '/api/staff/:id/services' as const,
      input: z.object({ serviceIds: z.array(z.number()) }),
      responses: {
        200: z.object({ success: z.boolean() }),
      },
    },
  },
  availability: {
    slots: {
      method: 'GET' as const,
      path: '/api/availability/slots' as const,
      responses: {
        200: z.array(z.object({
          time: z.string(),
          staffId: z.number(),
          staffName: z.string(),
        })),
      },
    },
  },
  staff: {
    list: {
      method: 'GET' as const,
      path: '/api/staff' as const,
      input: z.object({ storeId: z.coerce.number().optional() }).optional(),
      responses: {
        200: z.array(z.custom<typeof staff.$inferSelect>()),
      },
    },
    get: {
      method: 'GET' as const,
      path: '/api/staff/:id' as const,
      responses: {
        200: z.custom<typeof staff.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/staff' as const,
      input: insertStaffSchema,
      responses: {
        201: z.custom<typeof staff.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
    update: {
      method: 'PATCH' as const,
      path: '/api/staff/:id' as const,
      input: insertStaffSchema.partial(),
      responses: {
        200: z.custom<typeof staff.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    },
    delete: {
      method: 'DELETE' as const,
      path: '/api/staff/:id' as const,
      responses: {
        204: z.void(),
        404: errorSchemas.notFound,
      },
    },
  },
  customers: {
    list: {
      method: 'GET' as const,
      path: '/api/customers' as const,
      input: z.object({ storeId: z.coerce.number().optional() }).optional(),
      responses: {
        200: z.array(z.custom<typeof customers.$inferSelect>()),
      },
    },
    searchByPhone: {
      method: 'GET' as const,
      path: '/api/customers/search' as const,
      input: z.object({ phone: z.string(), storeId: z.coerce.number() }),
      responses: {
        200: z.custom<typeof customers.$inferSelect>().nullable(),
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/customers' as const,
      input: insertCustomerSchema,
      responses: {
        201: z.custom<typeof customers.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
    update: {
      method: 'PATCH' as const,
      path: '/api/customers/:id' as const,
      input: insertCustomerSchema.partial(),
      responses: {
        200: z.custom<typeof customers.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    },
  },
  appointments: {
    list: {
      method: 'GET' as const,
      path: '/api/appointments' as const,
      input: z.object({
        from: z.string().optional(),
        to: z.string().optional(),
        staffId: z.coerce.number().optional(),
        storeId: z.coerce.number().optional(),
      }).optional(),
      responses: {
        200: z.array(z.custom<typeof appointments.$inferSelect & {
          service: typeof services.$inferSelect | null;
          staff: typeof staff.$inferSelect | null;
          customer: typeof customers.$inferSelect | null;
          store: typeof stores.$inferSelect | null;
        }>()),
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/appointments' as const,
      input: insertAppointmentSchema,
      responses: {
        201: z.custom<typeof appointments.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
    update: {
      method: 'PATCH' as const,
      path: '/api/appointments/:id' as const,
      input: insertAppointmentSchema.partial(),
      responses: {
        200: z.custom<typeof appointments.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    },
    delete: {
      method: 'DELETE' as const,
      path: '/api/appointments/:id' as const,
      responses: {
        204: z.void(),
        404: errorSchemas.notFound,
      },
    },
  },
  products: {
    list: {
      method: 'GET' as const,
      path: '/api/products' as const,
      input: z.object({ storeId: z.coerce.number().optional() }).optional(),
      responses: {
        200: z.array(z.custom<typeof products.$inferSelect>()),
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/products' as const,
      input: insertProductSchema,
      responses: {
        201: z.custom<typeof products.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
    update: {
      method: 'PATCH' as const,
      path: '/api/products/:id' as const,
      input: insertProductSchema.partial(),
      responses: {
        200: z.custom<typeof products.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    },
    delete: {
      method: 'DELETE' as const,
      path: '/api/products/:id' as const,
      responses: {
        204: z.void(),
        404: errorSchemas.notFound,
      },
    },
  }
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}
