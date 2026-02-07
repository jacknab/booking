import { z } from 'zod';
import { 
  insertStoreSchema,
  insertServiceSchema, 
  insertStaffSchema, 
  insertCustomerSchema, 
  insertAppointmentSchema, 
  insertProductSchema,
  stores,
  services,
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
