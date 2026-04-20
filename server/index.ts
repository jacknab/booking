import "dotenv/config";
import cors from "cors";
import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupAuth } from "./auth";
import { subdomainMiddleware } from "./middleware/subdomain";
import { createServer } from "http";
import compression from "compression";
import passport from "./passport";
import cookieParser from "cookie-parser";
import jwt from "jsonwebtoken";
import path from "path";
import fs from "fs";
// In the esbuild CJS bundle, require is a real global — grab it the same
// way __dirname is grabbed above so it's available for loading the SSR bundle.
const _require: NodeRequire = (globalThis as any).require;

// Landing page routes that get server-side rendered for SEO
const SSR_ROUTES = new Set([
  "/industries",
  "/handyman",
  "/house-cleaning",
  "/lawn-care",
  "/snow-removal",
  "/dog-walking",
  "/tutoring",
  "/hvac",
  "/plumbing",
  "/electrical",
  "/carpet-cleaning",
  "/pressure-washing",
  "/window-cleaning",
  "/barbers",
  "/spa",
  "/nails",
  "/tattoo",
  "/haircuts",
  "/hair-salons",
  "/groomers",
  "/estheticians",
  "/ride-service",
]);
// In the esbuild CJS production bundle, __dirname is a real global that points
// to the dist/ directory. Capture it here before any async code runs.
// (globalThis cast avoids TypeScript errors in ESM source mode.)
const _cjsDirname: string | undefined = (globalThis as any).__dirname;

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
  setupAuth(app);

  app.use(passport.initialize());
  app.use(passport.session());

  // In production, serve static assets BEFORE registering API routes so that
  // /assets/* requests are always handled by express.static and never reach
  // any route handler (which would return JSON and trigger MIME-type errors).
  if (process.env.NODE_ENV === "production") {
    // Resolve relative to the compiled file's directory (_cjsDirname = dist/).
    // This is immune to PM2 setting a different working directory than the project root.
    // Falls back to process.cwd()/dist/public for non-bundle environments.
    const distPath = _cjsDirname
      ? path.resolve(_cjsDirname, "public")
      : path.resolve(process.cwd(), "dist/public");
    if (!fs.existsSync(distPath)) {
      console.error(`Build directory not found: ${distPath}. Run 'npm run build' first.`);
    } else {
      // Serve pre-compressed .gz files transparently when the client supports it.
      app.use((req: Request, res: Response, next: NextFunction) => {
        const acceptEncoding = req.headers["accept-encoding"] || "";
        if (
          acceptEncoding.includes("gzip") &&
          req.path.match(/\.(js|css|html|json|svg|ico|woff2?)$/)
        ) {
          const gzPath = path.resolve(distPath, req.path.slice(1) + ".gz");
          if (fs.existsSync(gzPath)) {
            res.setHeader("Content-Encoding", "gzip");
            // Set correct Content-Type based on original extension
            if (req.path.endsWith(".js")) res.setHeader("Content-Type", "application/javascript");
            else if (req.path.endsWith(".css")) res.setHeader("Content-Type", "text/css");
            req.url = req.url + ".gz";
          }
        }
        next();
      });

      app.use(express.static(distPath, {
        setHeaders(res, filePath) {
          // Ensure correct MIME types for assets
          if (filePath.endsWith(".js") || filePath.endsWith(".js.gz")) {
            res.setHeader("Content-Type", "application/javascript");
          } else if (filePath.endsWith(".css") || filePath.endsWith(".css.gz")) {
            res.setHeader("Content-Type", "text/css");
          }
          // Cache hashed assets for 1 year, everything else no-cache
          if (filePath.includes("/assets/")) {
            res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
          } else {
            res.setHeader("Cache-Control", "no-cache");
          }
        },
      }));
    }
  }

  // Register all API routes AFTER static assets so /assets/* never hits a route.
  await registerRoutes(httpServer, app);

  // Development: use Vite middleware. Production: SSR for landing pages + SPA catch-all.
  if (process.env.NODE_ENV === "production") {
    const distPath = _cjsDirname
      ? path.resolve(_cjsDirname, "public")
      : path.resolve(process.cwd(), "dist/public");

    if (fs.existsSync(distPath)) {
      const ssrBundlePath = _cjsDirname
        ? path.resolve(_cjsDirname, "server/entry-server.cjs")
        : path.resolve(process.cwd(), "dist/server/entry-server.cjs");

      const indexHtmlPath = path.resolve(distPath, "index.html");

      // Load SSR render function and template once at startup (not per-request)
      let ssrRender: ((url: string) => { html: string }) | null = null;
      let indexTemplate: string | null = null;

      if (fs.existsSync(ssrBundlePath) && fs.existsSync(indexHtmlPath)) {
        try {
          ssrRender = _require(ssrBundlePath).render;
          indexTemplate = fs.readFileSync(indexHtmlPath, "utf-8");
          log("SSR bundle loaded — landing pages will be server-rendered");
        } catch (err) {
          console.warn("[SSR] Failed to load SSR bundle, falling back to SPA-only:", err);
        }
      } else {
        log("SSR bundle not found — run npm run build to enable SSR in production");
      }

      // SSR handler — runs before the SPA catch-all
      app.use((req: Request, res: Response, next: NextFunction) => {
        if (req.path.startsWith("/api/")) return next();
        if (!SSR_ROUTES.has(req.path)) return next();
        if (!ssrRender || !indexTemplate) return next();

        try {
          const { html: appHtml } = ssrRender(req.originalUrl);
          const rendered = indexTemplate.replace("<!--ssr-outlet-->", appHtml);
          res
            .status(200)
            .set({ "Content-Type": "text/html", "Cache-Control": "no-cache" })
            .end(rendered);
        } catch (err) {
          console.warn(`[SSR] Render failed for ${req.path}, falling back to SPA:`, err);
          next();
        }
      });

      // SPA catch-all — handles all non-SSR, non-API routes
      app.use((req: Request, res: Response, next: NextFunction) => {
        if (req.path.startsWith("/api/")) return next();
        res.sendFile(indexHtmlPath);
      });
    }
  } else {
    const { setupVite } = await import("./vite");
    await setupVite(httpServer, app);
  }

  app.use((err: any, _req: Request, res: Response, next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    console.error("Internal Server Error:", err);

    if (res.headersSent) {
      return next(err);
    }

    return res.status(status).json({ message });
  });

  const port = parseInt(process.env.PORT || "5000", 10);
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