import { type Request, type Response, type NextFunction } from 'express';
import { db } from '../db';
import { locations } from '@shared/schema';
import { eq } from 'drizzle-orm';

// Define a custom property on the Express Request object
declare global {
  namespace Express {
    interface Request {
      store?: typeof locations.$inferSelect;
    }
  }
}

export async function subdomainMiddleware(req: Request, res: Response, next: NextFunction) {
  const forwardedHost = req.headers["x-forwarded-host"];
  const hostHeader = Array.isArray(forwardedHost) ? forwardedHost[0] : forwardedHost;
  const host = (hostHeader || req.headers.host || "").split(":" )[0];
  // In development, you might use something like 'ginas.localhost:5005'
  // In production, this will be 'ginas.mysalon.me'
  const parts = host.split('.');

  // This logic assumes a structure like `slug.domain.tld` or `slug.localhost`
  if (parts.length > 1) {
    const subdomain = parts[0];

    // Exclude common subdomains that are not store slugs
    if (subdomain === 'www' || subdomain === 'app' || subdomain === 'api') {
      return next();
    }
    
    try {
      const [store] = await db.select().from(locations).where(eq(locations.bookingSlug, subdomain));

      if (store) {
        // Attach store to the request object
        req.store = store;
      }
    } catch (error) {
      console.error('Error fetching store by subdomain:', error);
      // Decide how to handle DB errors. Maybe just log and continue.
    }
  }

  next();
}
