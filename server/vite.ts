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

  // When running inside Replit, attach HMR to the existing HTTP server so
  // the WebSocket upgrade is handled in-process (no separate port needed).
  // clientPort: 443 tells the browser to connect to the Replit HTTPS proxy port.
  const hmrConfig = replitDomain
    ? {
        server,
        path: "/vite-hmr",
        clientPort: 443,
        host: replitDomain,
        protocol: "wss" as const,
        timeout: 30000,
      }
    : { server, path: "/vite-hmr" };

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
