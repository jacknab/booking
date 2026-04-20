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

# ── Patch server/index.ts ──────────────────────────────────────────────────
info "Writing server/index.ts ..."
cat > "$APP_DIR/server/index.ts" << 'ENDOFFILE'
import "dotenv/config";
import cors from "cors";
import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupAuth } from "./auth";
import { serveStatic } from "./static";
import { subdomainMiddleware } from "./middleware/subdomain";
import { createServer } from "http";
import compression from "compression";
import passport from "./passport";
import cookieParser from "cookie-parser";
import jwt from "jsonwebtoken";

// Replace with your actual DB functions
import { storage } from "./storage";

const app = express();
const httpServer = createServer(app);

// --- CORS Setup ---
const rawCorsOrigins =
  process.env.CORS_ORIGINS ||
  process.env.ALLOWED_ORIGINS ||
  process.env.CORS_ORIGIN ||
  "";
const allowAllCorsOrigins = process.env.CORS_ALLOW_ALL === "true";
const defaultCorsOrigins = ["https://certxa.com", "https://www.certxa.com"];
if (process.env.NODE_ENV !== "production") {
  defaultCorsOrigins.push("http://localhost:5173", "http://localhost:3000");
}
const allowedCorsOrigins = (rawCorsOrigins ? rawCorsOrigins.split(",") : defaultCorsOrigins)
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (allowAllCorsOrigins) return callback(null, true);
      if (allowedCorsOrigins.includes(origin)) return callback(null, true);
      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  }),
);

declare module "http" {
  interface IncomingMessage {
    rawBody: unknown;
    user?: any; // passport user typing
  }
}

// --- Security Headers ---
app.use((req, res, next) => {
  res.setHeader("Strict-Transport-Security", "max-age=31536000; includeSubDomains");
  res.setHeader("X-Frame-Options", "SAMEORIGIN");
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-XSS-Protection", "1; mode=block");
  res.setHeader(
    "Content-Security-Policy",
    "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://connect.facebook.net https://www.googletagmanager.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https:; media-src 'self' https:; connect-src 'self' https:;"
  );
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  res.setHeader("Permissions-Policy", "camera=(), microphone=(), geolocation=(), payment=()");
  next();
});

// --- Middleware ---
app.use(compression());
app.use(cookieParser());
app.use(
  express.json({
    limit: '10mb',
    verify: (req, _res, buf) => {
      req.rawBody = buf;
    },
  }),
);
app.use(express.urlencoded({ extended: false, limit: '10mb' }));
app.use(subdomainMiddleware);

// --- Logging Helper ---
export function log(message: string, source = "express") {
  const formattedTime = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      log(logLine);
    }
  });

  next();
});

// --- Passport Google OAuth Setup ---
// Moved to server/passport.ts

// --- Main Async Boot ---
(async () => {
  // Serve static files FIRST — before session/auth middleware — so that CSS/JS
  // assets are always served correctly even if the database session store has a
  // momentary connection issue.  The catch-all inside serveStatic skips /api/*
  // routes so they fall through to registerRoutes below.
  if (process.env.NODE_ENV === "production") {
    serveStatic(app);
  } else {
    const { setupVite } = await import("./vite");
    await setupVite(httpServer, app);
  }

  setupAuth(app);

  app.use(passport.initialize());
  app.use(passport.session());

  // --- Google Auth Routes ---
  app.get("/api/auth/google", (req, res, next) => {
    if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
      return res.status(500).send("Google OAuth is not configured on the server. Please check environment variables.");
    }
    console.log("Google OAuth: Initiating authentication...");
    passport.authenticate("google", { scope: ["profile", "email"] })(req, res, next);
  });

  app.get(
    "/api/auth/google/callback",
    passport.authenticate("google", { session: false, failureRedirect: "/login" }),
    (req: Request, res: Response) => {
      console.log("Google OAuth: Callback received, user:", req.user?.email);
      if (req.user) {
        (req.session as any).userId = req.user.id;
        req.session.save((err) => {
          if (err) {
            console.error("Session save error:", err);
            return res.redirect("/login");
          }
          console.log("Google OAuth: User logged in successfully, redirecting to /");
          res.redirect("/");
        });
      } else {
        console.error("Google OAuth: No user in request");
        res.redirect("/login");
      }
    }
  );

  await registerRoutes(httpServer, app);

  app.use((err: any, _req: Request, res: Response, next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    console.error("Internal Server Error:", err);

    if (res.headersSent) {
      return next(err);
    }

    return res.status(status).json({ message });
  });

  const port = parseInt(process.env.PORT || "5005", 10);
  httpServer.listen(
    {
      port,
      host: "0.0.0.0",
      reusePort: true,
    },
    () => {
      log(`serving on port ${port}`);
    },
  );
})();
ENDOFFILE
success "server/index.ts written."

# ── Patch server/static.ts ─────────────────────────────────────────────────
info "Writing server/static.ts ..."
cat > "$APP_DIR/server/static.ts" << 'ENDOFFILE'
import express, { type Express, type Request, type Response, type NextFunction } from "express";
import fs from "fs";
import path from "path";

export function serveStatic(app: Express) {
  const distPath = path.resolve(__dirname, "public");
  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`,
    );
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
    // Enable compression for text-based files
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
    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:mobile="http://www.google.com/schemas/sitemap-mobile/1.0">
    <url>
        <loc>https://mysalon.me/</loc>
        <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
        <changefreq>daily</changefreq>
        <priority>1.0</priority>
    </url>
    <url>
        <loc>https://mysalon.me/pricing</loc>
        <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
        <changefreq>weekly</changefreq>
        <priority>0.9</priority>
    </url>
    <url>
        <loc>https://mysalon.me/auth</loc>
        <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
        <changefreq>monthly</changefreq>
        <priority>0.8</priority>
    </url>
</urlset>`;
    res.send(sitemap);
  });

  // Fall through to index.html for SPA routing.
  // Use a plain app.use (no path pattern) so req.url/req.path are never
  // modified by Express path-stripping, and we can reliably skip /api/* routes.
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
    res.sendFile(path.resolve(distPath, "index.html"), (err) => {
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

# ── Restart PM2 ────────────────────────────────────────────────────────────
info "Restarting PM2 process ..."
if pm2 list 2>/dev/null | grep -q "certxa"; then
  pm2 restart certxa
  success "PM2 process 'certxa' restarted."
else
  warn "PM2 process 'certxa' not found. You may need to start it manually:"
  warn "  pm2 start dist/index.cjs --name certxa"
fi

echo ""
success "Update complete! Certxa should now be serving CSS and JS correctly."
echo ""
echo "Verify with:"
echo "  curl -I https://www.certxa.com/assets/index-CNEZRZxK.css | grep content-type"
echo "  (Should show: content-type: text/css)"
