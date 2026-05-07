import { type Request, type Response, type NextFunction } from 'express';
import { db } from '../db';
import { locations } from '@shared/schema';
import { eq, sql } from 'drizzle-orm';
import path from 'path';
import fs from 'fs';

declare global {
  namespace Express {
    interface Request {
      store?: typeof locations.$inferSelect;
      launchsiteSlug?: string;
    }
  }
}

// Reserved subdomains that should never be treated as user sites
const RESERVED_SUBDOMAINS = new Set([
  'www', 'app', 'api', 'mail', 'ftp', 'admin', 'certxa',
  'launchit', 'support', 'help', 'blog', 'shop', 'store',
  'test', 'demo', 'staging', 'dev', 'secure',
  'manage', // unified subscriber hub — handled by Express/React, not a user site
]);

export async function subdomainMiddleware(req: Request, res: Response, next: NextFunction) {
  const forwardedHost = req.headers["x-forwarded-host"];
  const hostHeader = Array.isArray(forwardedHost) ? forwardedHost[0] : forwardedHost;
  const host = (hostHeader || req.headers.host || "").split(":")[0];
  const parts = host.split('.');

  // Only act on subdomains: slug.certxa.com or slug.localhost
  if (parts.length < 2) return next();

  const subdomain = parts[0];

  // manage.certxa.com → unified subscriber hub served by the React SPA
  if (subdomain === 'manage') {
    (req as any).isManageSubdomain = true;
    return next();
  }

  if (RESERVED_SUBDOMAINS.has(subdomain)) return next();

  try {
    // 1. Check if this is a booking-app store subdomain (bookingSlug)
    const [store] = await db.select().from(locations).where(eq(locations.bookingSlug, subdomain));
    if (store) {
      req.store = store;
      return next();
    }

    // 2. Check if this is a launchsite user subdomain
    let row: any = null;
    try {
      const result = await db.execute(sql`
        SELECT os.template_id, os.business_name, os.hours, os.status
        FROM subdomains s
        JOIN onboarding_submissions os ON os.id = s.submission_id
        WHERE s.slug = ${subdomain}
        LIMIT 1
      `) as any;
      row = result?.rows?.[0];
    } catch {
      // subdomains/onboarding_submissions tables not yet created — skip launchsite lookup
    }
    if (row && row.status !== 'pending_payment') {
      req.launchsiteSlug = subdomain;

      // Serve the built template for this user's site
      const templateId: string = row.template_id;
      const templateDir = path.resolve(process.cwd(), 'php', 'templates', templateId);
      const indexPath = path.join(templateDir, 'index.html');

      if (fs.existsSync(indexPath)) {
        res.setHeader('Cache-Control', 'no-cache');
        return res.sendFile(indexPath);
      }

      // Template build not found — show a friendly holding page
      return res.send(`<!DOCTYPE html><html><head><title>${row.business_name}</title>
        <style>body{font-family:sans-serif;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0;background:#0a0a0a;color:#fff;}
        .box{text-align:center;padding:2rem;} h1{font-size:2rem;margin-bottom:0.5rem;} p{color:rgba(255,255,255,0.6);}</style>
        </head><body><div class="box"><h1>${row.business_name}</h1><p>Your website is being set up. Check back soon.</p></div></body></html>`);
    }
  } catch (error) {
    console.error('[Subdomain] Error:', error);
  }

  next();
}
