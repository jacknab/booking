import { type Express } from "express";
import { createServer as createViteServer, createLogger } from "vite";
import { type Server } from "http";
import viteConfig from "../vite.config";
import fs from "fs";
import path from "path";
import { nanoid } from "nanoid";

const viteLogger = createLogger();

// Routes handled by entry-server.tsx SSR rendering
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
  "/nails",
  "/tattoo",
  "/haircuts",
  "/hair-salons",
  "/groomers",
  "/estheticians",
  "/ride-service",
]);

export async function setupVite(server: Server, app: Express) {
  const replitDomain = process.env.REPLIT_DEV_DOMAIN;

  // Fall back to the APP_URL hostname (e.g. certxa.com) when the Replit dev
  // domain isn't set — covers custom-domain dev and staging environments.
  const appUrlHost = (() => {
    try {
      const u = process.env.APP_URL;
      return u ? new URL(u).hostname : null;
    } catch {
      return null;
    }
  })();

  // Use whichever public hostname the browser actually reaches us at.
  // clientPort: 443 tells the Vite HMR client to connect via the HTTPS proxy
  // (wss://<host>/vite-hmr) rather than falling back to localhost.
  const effectiveHost = replitDomain ?? appUrlHost;

  // Vite 7 uses token-based WebSocket security. The Replit proxy strips query
  // parameters from WebSocket upgrade requests, so the ?token= value never
  // reaches Vite and the HMR handshake is immediately rejected (400).
  // Disabling HMR here removes the console error; the app still works fine
  // and you can refresh manually after code changes. If running outside
  // Replit (e.g. local dev with a direct port), HMR will be enabled.
  const useHmr = !process.env.REPLIT_DEV_DOMAIN;
  const hmrConfig: false | Record<string, unknown> = useHmr
    ? {
        server,
        ...(effectiveHost
          ? {
              clientPort: 443,
              host: effectiveHost,
              protocol: "wss",
              timeout: 30000,
            }
          : {}),
      }
    : false;

  const serverOptions = {
    middlewareMode: true,
    hmr: hmrConfig,
    allowedHosts: true as const,
    cors: true,
  };

  const vite = await createViteServer({
    ...viteConfig,
    configFile: false,
    customLogger: {
      ...viteLogger,
      // Do NOT call process.exit here — a non-fatal Vite error should not
      // kill the entire Express server.
      error: (msg, options) => {
        viteLogger.error(msg, options);
      },
    },
    server: serverOptions,
    appType: "custom",
  });

  app.use(vite.middlewares);

  app.use("/{*path}", async (req, res, next) => {
    // Skip API routes — let Express handle them
    if (req.path.startsWith("/api/")) return next();

    const url = req.originalUrl;
    const urlPath = url.split("?")[0];

    try {
      const clientTemplate = path.resolve(
        import.meta.dirname,
        "..",
        "client",
        "index.html",
      );

      // Always reload the index.html file from disk in case it changes
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`,
      );
      const page = await vite.transformIndexHtml(url, template);

      // SSR: pre-render landing pages into the HTML shell
      if (SSR_ROUTES.has(urlPath)) {
        try {
          const { render } = await vite.ssrLoadModule("/src/entry-server.tsx");
          const { html: appHtml } = render(url);
          const rendered = page.replace("<!--ssr-outlet-->", appHtml);
          res.status(200).set({ "Content-Type": "text/html" }).end(rendered);
          return;
        } catch (ssrError) {
          // If SSR fails for any reason, fall back to the client-side shell
          // so the page still loads — React will hydrate it on the client
          console.warn(`[SSR] Failed to render ${urlPath}, falling back to CSR:`, ssrError);
        }
      }

      // Default: serve the client-side shell (React takes over in the browser)
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e as Error);
      next(e);
    }
  });
}
