#!/usr/bin/env bash
# =============================================================================
#  update.sh – Patch Certxa server files and rebuild on the VPS
#
#  Run from your app directory:
#    bash update.sh
# =============================================================================
set -euo pipefail

RED='\033[0;31m'; GREEN='\033[0;32m'; CYAN='\033[0;36m'; RESET='\033[0m'
info()    { echo -e "${CYAN}[INFO]${RESET}  $*"; }
success() { echo -e "${GREEN}[OK]${RESET}    $*"; }
error()   { echo -e "${RED}[ERROR]${RESET} $*" >&2; exit 1; }

APP_DIR="$(cd "$(dirname "$0")" && pwd)"
info "App directory: $APP_DIR"

# ── Detect service name from .setup_config (written by setup.sh) ────────────
SERVICE_NAME="certxa"
if [ -f "${APP_DIR}/.setup_config" ]; then
    # shellcheck disable=SC1090
    source "${APP_DIR}/.setup_config"
fi

# ── Detect APP_URL from .env (written by setup.sh step 6) ───────────────────
APP_URL=""
if [ -f "${APP_DIR}/.env" ]; then
    APP_URL=$(grep "^APP_URL=" "${APP_DIR}/.env" | head -1 | cut -d= -f2- | tr -d '"' | tr -d "'" || true)
fi
if [ -z "${APP_URL:-}" ]; then
    warn_msg() { echo -e "${CYAN}[WARN]${RESET}  $*"; }
    warn_msg "APP_URL not found in .env — sitemap/canonical URLs will be empty."
    warn_msg "Set APP_URL=https://yourdomain.com in ${APP_DIR}/.env and re-run."
fi

# NOTE: server/index.ts is NOT patched here — edit it directly in the repo
# and redeploy via git pull + rebuild. The source file is the canonical version.

# ── Sync server/static.ts from the repository source ───────────────────────
# server/static.ts reads APP_URL at runtime from process.env — no hardcoded
# domain. The canonical version lives in the git repo; this step is a no-op
# if the file already matches (git pull would have updated it).
info "Verifying server/static.ts is up to date (no hardcoded domains)..."
if grep -q 'BASE_URL = "https://' "${APP_DIR}/server/static.ts" 2>/dev/null; then
    error "server/static.ts still has a hardcoded BASE_URL. Pull the latest code from git and re-run."
fi
success "server/static.ts looks correct (reads APP_URL from environment)."

# ── Write server/static.ts ──────────────────────────────────────────────────
# This is written here only as a safety net in case the file is missing or
# corrupted. It always reads APP_URL from process.env — never hardcoded.
info "Writing server/static.ts ..."
cat > "$APP_DIR/server/static.ts" << 'ENDOFFILE'
import express, { type Express, type Request, type Response, type NextFunction } from "express";
import fs from "fs";
import path from "path";

const BASE_URL = (process.env.APP_URL ?? "").replace(/\/$/, "");

interface PageSeo { title: string; description: string; canonical: string; }

const SEO_CONFIG: Record<string, PageSeo> = {
  "/industries": { title: "Booking Software for Every Service Industry | Certxa", description: "Certxa works for barbers, spas, HVAC, plumbers, dog walkers, tutors, and 20+ more industries. One platform — every service business.", canonical: `${BASE_URL}/industries` },
  "/barbers": { title: "Barber Shop Booking Software — Online Appointments & POS | Certxa", description: "Let clients book barber appointments 24/7. Manage walk-ins, track chair revenue, and send automatic SMS reminders. Free 60-day trial.", canonical: `${BASE_URL}/barbers` },
  "/spa": { title: "Day Spa & Wellness Booking Software — Memberships & Gift Cards | Certxa", description: "Booking, memberships, gift cards, and therapist scheduling for day spas and wellness centers. Replace Mindbody for a fraction of the cost.", canonical: `${BASE_URL}/spa` },
  "/nails": { title: "Nail Salon Booking Software — Online Scheduling & POS | Certxa", description: "Online booking, service menus, and automatic reminders built for nail salons. Reduce no-shows and fill your appointment book every day.", canonical: `${BASE_URL}/nails` },
  "/tattoo": { title: "Tattoo Studio Booking Software — Deposits & Appointments | Certxa", description: "Manage tattoo consultations, deposits, and artist schedules in one place. Automated SMS reminders reduce costly no-shows.", canonical: `${BASE_URL}/tattoo` },
  "/haircuts": { title: "Walk-In Haircut & Barbershop Queue Management | Certxa", description: "Digital check-in, live queue display, and wait-time estimates for walk-in haircut businesses. Keep clients informed and reduce lobby crowding.", canonical: `${BASE_URL}/haircuts` },
  "/hair-salons": { title: "Hair Salon Booking Software — Stylists, Color & Cuts | Certxa", description: "Online booking for hair salons — manage stylists, color appointments, and retail products. Automatic reminders cut no-shows by up to 60%.", canonical: `${BASE_URL}/hair-salons` },
  "/groomers": { title: "Pet Grooming Booking Software — Dog & Cat Appointments | Certxa", description: "Online scheduling, pet profiles, and automated reminders for pet groomers. Manage multiple groomers and track grooming history per pet.", canonical: `${BASE_URL}/groomers` },
  "/estheticians": { title: "Esthetician Booking Software — Skin Care & Facials | Certxa", description: "Booking software built for estheticians and skin care professionals. Manage facials, waxing, and lash appointments with intake forms and reminders.", canonical: `${BASE_URL}/estheticians` },
  "/house-cleaning": { title: "House Cleaning Scheduling Software — Jobs & Invoices | Certxa", description: "Schedule recurring house cleaning jobs, dispatch crews, and send invoices automatically. Built for solo cleaners and multi-crew cleaning businesses.", canonical: `${BASE_URL}/house-cleaning` },
  "/handyman": { title: "Handyman Scheduling Software — Jobs, Estimates & Invoices | Certxa", description: "Manage handyman jobs, estimates, and invoices from your phone. Schedule crews, track job status, and get paid faster with Certxa.", canonical: `${BASE_URL}/handyman` },
  "/ride-service": { title: "Ride Service Booking Software — Dispatch & Scheduling | Certxa", description: "Online booking and dispatch for private ride services, chauffeurs, and transportation businesses. Manage drivers, routes, and payments in one place.", canonical: `${BASE_URL}/ride-service` },
  "/snow-removal": { title: "Snow Removal Scheduling Software — Routes & Crews | Certxa", description: "Schedule snow removal routes, dispatch crews, and invoice clients automatically. Built for snow plowing and ice management businesses.", canonical: `${BASE_URL}/snow-removal` },
  "/lawn-care": { title: "Lawn Care Scheduling Software — Routes, Crews & Invoices | Certxa", description: "Schedule lawn mowing routes, dispatch crews, and collect recurring payments. Built for solo lawn care operators and multi-crew landscaping businesses.", canonical: `${BASE_URL}/lawn-care` },
  "/tutoring": { title: "Tutoring Booking Software — Sessions, Scheduling & Payments | Certxa", description: "Let students book tutoring sessions online. Manage subjects, tutor availability, and payments automatically. Free 60-day trial.", canonical: `${BASE_URL}/tutoring` },
  "/dog-walking": { title: "Dog Walking Booking Software — Scheduling & GPS Tracking | Certxa", description: "Online booking, walker scheduling, and automated updates for dog walking businesses. Clients can book and pay from any device.", canonical: `${BASE_URL}/dog-walking` },
  "/hvac": { title: "HVAC Scheduling Software — Jobs, Dispatching & Invoices | Certxa", description: "Schedule HVAC service calls, dispatch technicians, and collect payments on-site. Built for HVAC contractors of all sizes.", canonical: `${BASE_URL}/hvac` },
  "/plumbing": { title: "Plumbing Scheduling Software — Jobs, Crews & Invoices | Certxa", description: "Manage plumbing service calls, dispatch plumbers, and send invoices from your phone. Built for plumbing contractors.", canonical: `${BASE_URL}/plumbing` },
  "/electrical": { title: "Electrical Contractor Scheduling Software — Jobs & Invoices | Certxa", description: "Schedule electrical jobs, manage permits, dispatch electricians, and invoice clients. Built for electrical contractors and small crews.", canonical: `${BASE_URL}/electrical` },
  "/carpet-cleaning": { title: "Carpet Cleaning Scheduling Software — Jobs & Invoices | Certxa", description: "Book carpet cleaning jobs online, dispatch crews, and send invoices automatically. Built for carpet and upholstery cleaning businesses.", canonical: `${BASE_URL}/carpet-cleaning` },
  "/pressure-washing": { title: "Pressure Washing Scheduling Software — Jobs & Invoices | Certxa", description: "Manage pressure washing jobs, dispatch crews, and collect payments fast. Online booking lets customers request quotes 24/7.", canonical: `${BASE_URL}/pressure-washing` },
  "/window-cleaning": { title: "Window Cleaning Scheduling Software — Routes & Invoices | Certxa", description: "Schedule window cleaning routes, manage recurring clients, and invoice automatically. Built for residential and commercial window cleaners.", canonical: `${BASE_URL}/window-cleaning` },
};

// Public landing pages that get server-side rendered for SEO.
// All other routes fall through to the SPA catch-all below.
const SSR_ROUTES = new Set(Object.keys(SEO_CONFIG));

export function serveStatic(app: Express) {
  const distPath = path.resolve(__dirname, "public");
  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`,
    );
  }

  // Load SSR bundle and index.html template once at startup (not per-request).
  // __dirname in the CJS bundle points to dist/, so paths resolve correctly.
  const ssrBundlePath = path.resolve(__dirname, "server/entry-server.cjs");
  const indexHtmlPath = path.resolve(distPath, "index.html");
  let ssrRender: ((url: string) => { html: string }) | null = null;
  let indexTemplate: string | null = null;

  if (fs.existsSync(ssrBundlePath) && fs.existsSync(indexHtmlPath)) {
    try {
      ssrRender = require(ssrBundlePath).render;
      indexTemplate = fs.readFileSync(indexHtmlPath, "utf-8");
      console.log("[SSR] Bundle loaded — landing pages will be server-rendered");
    } catch (err) {
      console.warn("[SSR] Failed to load bundle, falling back to SPA:", err);
    }
  } else {
    console.log("[SSR] Bundle not found at", ssrBundlePath, "— serving SPA only");
  }

  // Cache control middleware for static assets
  app.use((req: Request, res: Response, next: NextFunction) => {
    // Immutable assets (have hash in filename) - cache for 1 year
    if (/\.[a-f0-9]{8}\.|assets\/.*\/.+\.[a-f0-9]{8}\./.test(req.path)) {
      res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
    }
    // SVG, PNG, JPG, WebP - cache for 30 days
    else if (/\.(svg|png|jpg|jpeg|webp|ico)$/.test(req.path)) {
      res.setHeader("Cache-Control", "public, max-age=2592000");
    }
    // CSS and JS - cache for 1 hour
    else if (/\.(css|js)$/.test(req.path)) {
      res.setHeader("Cache-Control", "public, max-age=3600");
    }
    // Fonts - cache for 1 year
    else if (/\.(woff|woff2|ttf|eot)$/.test(req.path)) {
      res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
    }
    // HTML - never cache
    else if (/\.html$/.test(req.path) || req.path === "/") {
      res.setHeader("Cache-Control", "public, max-age=0, must-revalidate");
      res.setHeader("ETag", `"${Date.now()}"`);
    }
    next();
  });

  // Serve static files with Express
  app.use(express.static(distPath, {
    maxAge: "1h",
    dotfiles: "deny",
  }));

  // Serve robots.txt
  app.get("/robots.txt", (_req: Request, res: Response) => {
    res.setHeader("Cache-Control", "public, max-age=86400");
    res.sendFile(path.resolve(distPath, "robots.txt"));
  });

  // Serve sitemap.xml
  app.get("/sitemap.xml", (_req: Request, res: Response) => {
    res.setHeader("Content-Type", "application/xml");
    res.setHeader("Cache-Control", "public, max-age=86400");
    const today = new Date().toISOString().split("T")[0];
    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:mobile="http://www.google.com/schemas/sitemap-mobile/1.0">
    <url>
        <loc>${BASE_URL}/</loc>
        <lastmod>${today}</lastmod>
        <changefreq>daily</changefreq>
        <priority>1.0</priority>
    </url>
    <url>
        <loc>${BASE_URL}/pricing</loc>
        <lastmod>${today}</lastmod>
        <changefreq>weekly</changefreq>
        <priority>0.9</priority>
    </url>
    <url>
        <loc>${BASE_URL}/auth</loc>
        <lastmod>${today}</lastmod>
        <changefreq>monthly</changefreq>
        <priority>0.8</priority>
    </url>
</urlset>`;
    res.send(sitemap);
  });

  // SSR handler — intercepts landing page routes and injects pre-rendered HTML.
  // Runs BEFORE the SPA catch-all so search engines get full page content.
  // Any failure falls through to the SPA catch-all so the app never breaks.
  app.use((req: Request, res: Response, next: NextFunction) => {
    const reqPath = req.url.split("?")[0];
    if (reqPath.startsWith("/api/") || reqPath === "/ws" || reqPath.startsWith("/ws/")) {
      return next();
    }
    if (!SSR_ROUTES.has(reqPath)) return next();
    if (!ssrRender || !indexTemplate) return next();

    try {
      const { html: appHtml } = ssrRender(req.url);
      // Support both the <!--ssr-outlet--> placeholder and the plain root div,
      // so this works regardless of when the client was last built.
      let rendered = indexTemplate;
      if (indexTemplate.includes("<!--ssr-outlet-->")) {
        rendered = indexTemplate.replace("<!--ssr-outlet-->", appHtml);
      } else {
        rendered = indexTemplate.replace('<div id="root"></div>', `<div id="root">${appHtml}</div>`);
      }
      // Inject page-specific title, meta description, og tags, and canonical.
      const seo = SEO_CONFIG[reqPath];
      if (seo) {
        rendered = rendered.replace(/<title>[^<]*<\/title>/, `<title>${seo.title}</title>`);
        rendered = rendered.replace(/(<meta\s+name="description"\s+content=")[^"]*(")/i, `$1${seo.description}$2`);
        rendered = rendered.replace(/(<meta\s+property="og:title"\s+content=")[^"]*(")/i, `$1${seo.title}$2`);
        rendered = rendered.replace(/(<meta\s+property="og:description"\s+content=")[^"]*(")/i, `$1${seo.description}$2`);
        rendered = rendered.replace(/(<meta\s+property="og:url"\s+content=")[^"]*(")/i, `$1${seo.canonical}$2`);
        rendered = rendered.replace(/(<link\s+rel="canonical"\s+href=")[^"]*(")/i, `$1${seo.canonical}$2`);
      }
      res
        .status(200)
        .set({ "Content-Type": "text/html", "Cache-Control": "no-cache" })
        .end(rendered);
    } catch (err) {
      console.warn(`[SSR] Render failed for ${reqPath}, falling back to SPA:`, err);
      next();
    }
  });

  // SPA catch-all — serves index.html for all remaining non-API routes.
  app.use((req: Request, res: Response, next: NextFunction) => {
    const reqPath = req.url.split("?")[0];
    if (
      reqPath.startsWith("/api/") ||
      reqPath === "/ws" ||
      reqPath.startsWith("/ws/")
    ) {
      return next();
    }
    res.setHeader("Cache-Control", "public, max-age=0, must-revalidate");
    res.sendFile(indexHtmlPath, (err) => {
      if (err) {
        console.error("[static] Failed to serve index.html:", err);
        if (!res.headersSent) {
          res.status(500).send("Server error: could not load the application.");
        }
      }
    });
  });
}
ENDOFFILE
success "server/static.ts written."

# ── Rebuild SSR bundle (entry-server.tsx → dist/server/entry-server.cjs) ───
info "Rebuilding SSR bundle ..."
mkdir -p "$APP_DIR/dist/server"
node - << 'ENDOFJS'
const { build } = require('esbuild');
const { existsSync } = require('fs');
const path = require('path');

const ROOT = process.cwd();
const extensions = ['.tsx','.ts','.jsx','.js','/index.tsx','/index.ts','/index.jsx','/index.js'];

function resolveWithExt(base) {
  for (const ext of extensions) {
    const full = base + ext;
    if (existsSync(full)) return full;
  }
  return undefined;
}

const pathAliasPlugin = {
  name: 'path-alias',
  setup(build) {
    build.onResolve({ filter: /^@\// }, (args) => {
      const base = path.resolve(ROOT, 'client/src', args.path.slice(2));
      return { path: resolveWithExt(base) ?? base };
    });
    build.onResolve({ filter: /^@shared\// }, (args) => {
      const base = path.resolve(ROOT, 'shared', args.path.slice(8));
      return { path: resolveWithExt(base) ?? base };
    });
    build.onResolve({ filter: /^@assets\// }, (args) => {
      const base = path.resolve(ROOT, 'attached_assets', args.path.slice(8));
      return { path: resolveWithExt(base) ?? base };
    });
  },
};

build({
  entryPoints: [path.resolve(ROOT, 'client/src/entry-server.tsx')],
  platform: 'node',
  bundle: true,
  format: 'cjs',
  outfile: path.resolve(ROOT, 'dist/server/entry-server.cjs'),
  jsx: 'automatic',
  define: { 'process.env.NODE_ENV': '"production"' },
  plugins: [pathAliasPlugin],
  logLevel: 'info',
  minify: false,
}).then(() => {
  console.log('SSR bundle rebuilt successfully.');
}).catch(err => {
  console.error('SSR build failed:', err);
  process.exit(1);
});
ENDOFJS
success "SSR bundle rebuilt → dist/server/entry-server.cjs"

# ── Rebuild server bundle only (fast, ~2 seconds) ─────────────────────────
info "Rebuilding server bundle ..."
node - << 'ENDOFJS'
const { build } = require('esbuild');
const { readFileSync } = require('fs');

const pkg = JSON.parse(readFileSync('package.json', 'utf-8'));
const allowlist = [
  'bcryptjs','connect-pg-simple','date-fns','date-fns-tz',
  'drizzle-orm','drizzle-zod','express','express-session',
  'nanoid','pg','ws','zod','zod-validation-error',
];
const allDeps = [
  ...Object.keys(pkg.dependencies || {}),
  ...Object.keys(pkg.devDependencies || {}),
];
const externals = allDeps.filter(d => !allowlist.includes(d));

build({
  entryPoints: ['server/index.ts'],
  platform: 'node',
  bundle: true,
  format: 'cjs',
  outfile: 'dist/index.cjs',
  define: { 'process.env.NODE_ENV': '"production"' },
  minify: true,
  external: externals,
  logLevel: 'info',
}).then(() => {
  console.log('Server bundle rebuilt successfully.');
}).catch(err => {
  console.error('Build failed:', err);
  process.exit(1);
});
ENDOFJS
success "Server bundle rebuilt → dist/index.cjs"

# ── Apply database schema ──────────────────────────────────────────────────
info "Applying database schema (npm run db:push) ..."
if command -v npx &>/dev/null; then
    npx tsx scripts/db-push.ts \
        && success "Database schema applied." \
        || { echo -e "${RED}[WARN]${RESET}  db:push failed — check DATABASE_URL and schema.sql, then re-run manually."; }
else
    info "npx not found — skipping db:push. Run 'npm run db:push' manually after deploy."
fi

# ── Restart PM2 ────────────────────────────────────────────────────────────
info "Restarting PM2 process '${SERVICE_NAME}'..."
if pm2 list 2>/dev/null | grep -q "${SERVICE_NAME}"; then
    pm2 restart "${SERVICE_NAME}"
    success "PM2 process '${SERVICE_NAME}' restarted."
else
    info "PM2 process '${SERVICE_NAME}' not found — attempting to start from ecosystem config..."
    if [ -f "${APP_DIR}/ecosystem.config.cjs" ]; then
        pm2 start "${APP_DIR}/ecosystem.config.cjs"
        pm2 save
        success "PM2 process started from ecosystem.config.cjs."
    else
        info "No ecosystem.config.cjs found. Starting dist/index.cjs directly..."
        pm2 start dist/index.cjs --name "${SERVICE_NAME}"
        pm2 save
        success "PM2 process '${SERVICE_NAME}' started."
    fi
fi

echo ""
success "Update complete! The app should now be running correctly."
echo ""
if [ -n "${APP_URL:-}" ]; then
    echo "Verify with:"
    echo "  curl -I ${APP_URL}/assets/ | head"
    echo "  (CSS/JS assets should return content-type: text/css or application/javascript)"
fi
echo ""
echo "Check logs with: pm2 logs ${SERVICE_NAME} --lines 30"
