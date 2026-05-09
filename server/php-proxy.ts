import { createProxyMiddleware } from "http-proxy-middleware";
import { spawn, type ChildProcess } from "child_process";
import net from "net";
import path from "path";
import fs from "fs";
import type { Request, Response, NextFunction } from "express";

// Directory where Vite serves its static public assets (client/public/).
// Files here take priority over the PHP site for the same URL path.
const CLIENT_PUBLIC_DIR = path.resolve(process.cwd(), "client", "public");

const PHP_PORT = parseInt(process.env.PHP_PORT || "8104", 10);
const PHP_HOST = process.env.PHP_HOST || "127.0.0.1";
const PHP_BASE_URL = `http://${PHP_HOST}:${PHP_PORT}`;

let phpProcess: ChildProcess | null = null;
let phpReady = false;
let phpReadyPromise: Promise<void> | null = null;

// Resolve the php/ directory safely in both ESM (dev) and esbuild CJS (prod).
// esbuild injects __dirname in CJS bundles pointing to dist/ — one level above
// is the project root where php/ lives. In ESM dev, process.cwd() is the
// project root (tsx is invoked from there), so php/ is directly accessible.
// Avoids import.meta.url which becomes undefined after esbuild CJS minification.
const _cjsDir: string | undefined = (globalThis as any).__dirname; // dist/ in prod
const phpDir = _cjsDir
  ? path.resolve(_cjsDir, "..", "php")   // prod: dist/ → project root → php/
  : path.resolve(process.cwd(), "php");  // dev:  cwd = project root → php/

/** Poll the PHP port until it accepts a TCP connection (max 10 s). */
function waitForPhpReady(maxMs = 10_000): Promise<void> {
  const start = Date.now();
  return new Promise((resolve, reject) => {
    function attempt() {
      const socket = net.connect(PHP_PORT, PHP_HOST);
      socket.once("connect", () => {
        socket.destroy();
        phpReady = true;
        console.log("[PHP] Server is ready");
        resolve();
      });
      socket.once("error", () => {
        socket.destroy();
        if (Date.now() - start >= maxMs) {
          reject(new Error(`PHP server did not become ready within ${maxMs}ms`));
        } else {
          setTimeout(attempt, 150);
        }
      });
    }
    attempt();
  });
}

/** Returns true once the PHP built-in server has accepted its first TCP connection. */
export function isPhpReady(): boolean {
  return phpReady;
}

export function startPhpServer(): void {
  phpProcess = spawn("php", [
    "-d", "upload_max_filesize=55M",
    "-d", "post_max_size=60M",
    "-d", "memory_limit=256M",
    "-S", `${PHP_HOST}:${PHP_PORT}`,
    "router.php",
  ], {
    cwd: phpDir,
    stdio: ["ignore", "pipe", "pipe"],
    env: { ...process.env },
  });

  phpProcess.stdout?.on("data", (data: Buffer) => {
    const msg = data.toString().trim();
    if (msg) console.log(`[PHP] ${msg}`);
  });

  phpProcess.stderr?.on("data", (data: Buffer) => {
    const msg = data.toString().trim();
    if (msg && !msg.includes("Development Server")) {
      console.error(`[PHP] ${msg}`);
    }
  });

  phpProcess.on("error", (err) => {
    console.error("[PHP] Failed to start server:", err.message);
  });

  phpProcess.on("exit", (code, signal) => {
    phpReady = false;
    if (signal !== "SIGTERM" && signal !== "SIGKILL") {
      console.warn(`[PHP] Server exited (code=${code}, signal=${signal})`);
    }
  });

  console.log(`[PHP] Starting on port ${PHP_PORT}`);
  phpReadyPromise = waitForPhpReady().catch((err) => {
    console.error("[PHP] Readiness check failed:", err.message);
  });
}

export function stopPhpServer(): void {
  if (phpProcess) {
    phpProcess.kill("SIGTERM");
    phpProcess = null;
  }
}

process.on("exit", stopPhpServer);
process.on("SIGINT", () => { stopPhpServer(); process.exit(); });
process.on("SIGTERM", () => { stopPhpServer(); process.exit(); });

// ── Routes that belong to the PHP site ──────────────────────────────────────
// Exact paths served by the main certxa.com PHP site
const PHP_EXACT_PATHS = new Set([
  "/",
  "/sitemap.xml",
  "/robots.txt",
  "/favicon.svg",
]);

// Path prefixes that belong to PHP (main site + launchsite catalog)
const PHP_PREFIXES = [
  "/assets/",   // main certxa site CSS/JS/images
  "/videos/",   // main site product videos
  "/launchsite/", // entire LaunchSite template catalog
  "/editor/",   // template editor
  "/templates/", // main certxa site templates pages
];

// Express/booking-app paths — must never be forwarded to PHP
const BOOKING_APP_PREFIXES = [
  "/api/auth",
  "/api/stores",
  "/api/appointments",
  "/api/staff",
  "/api/services",
  "/api/customers",
  "/api/payments",
  "/api/stripe",
  "/api/twilio",
  "/api/google",
  "/api/reports",
  "/api/admin",
  "/api/queue",
  "/api/pos",
  "/api/webhooks",
  "/vite-hmr",
  "/src/",
  "/node_modules/",
  "/@",
];

export function isPhpRoute(reqPath: string): boolean {
  for (const prefix of BOOKING_APP_PREFIXES) {
    if (reqPath.startsWith(prefix)) return false;
  }
  if (reqPath.endsWith(".php")) return true;
  if (PHP_EXACT_PATHS.has(reqPath)) return true;
  for (const prefix of PHP_PREFIXES) {
    if (reqPath.startsWith(prefix)) return true;
  }
  return false;
}

// ── Proxy middleware ──────────────────────────────────────────────────────────
const phpProxy = createProxyMiddleware({
  target: PHP_BASE_URL,
  changeOrigin: true,
  on: {
    error: (err: Error, _req: Request, res: any) => {
      console.error("[PHP Proxy] Error:", err.message);
      if (!(res as any).headersSent) {
        (res as Response).status(502).send(
          "<!DOCTYPE html><html><body><h2>Page unavailable</h2><p>The page server failed to respond. Please try again shortly.</p></body></html>"
        );
      }
    },
  },
});

// Combined middleware: waits for PHP readiness then proxies
export async function phpMiddleware(req: Request, res: Response, next: NextFunction): Promise<void> {
  // manage.certxa.com is served entirely by Express/React — never send to PHP
  if ((req as any).isManageSubdomain) return next();
  if (!isPhpRoute(req.path)) return next();

  // For paths that could be served by either PHP or Vite (e.g. /videos/),
  // prefer the local client/public copy if it exists so the React app's
  // assets (onboarding videos, etc.) are never accidentally swallowed by PHP.
  if (req.path.startsWith("/videos/") || req.path.startsWith("/assets/")) {
    const localFile = path.join(CLIENT_PUBLIC_DIR, req.path);
    if (fs.existsSync(localFile)) return next();
  }

  if (!phpReady && phpReadyPromise) {
    try {
      await phpReadyPromise;
    } catch {
      res.status(503).send("PHP server is starting up, please retry in a moment.");
      return;
    }
  }

  (phpProxy as any)(req, res, next);
}
