import express, { type Express, type Request, type Response, type NextFunction } from "express";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ASSET_EXT_RE = /\.(js|css|map|woff|woff2|ttf|eot|svg|png|jpg|jpeg|webp|ico|json|txt|xml|gz|br)$/i;

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
        <loc>https://certxa.com/</loc>
        <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
        <changefreq>daily</changefreq>
        <priority>1.0</priority>
    </url>
    <url>
        <loc>https://certxa.com/pricing</loc>
        <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
        <changefreq>weekly</changefreq>
        <priority>0.9</priority>
    </url>
    <url>
        <loc>https://certxa.com/auth</loc>
        <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
        <changefreq>monthly</changefreq>
        <priority>0.8</priority>
    </url>
</urlset>`;
    res.send(sitemap);
  });

  // For any request that looks like a static asset file (has a known extension)
  // but wasn't found by express.static above — return a proper 404 instead of
  // falling through to the SPA catch-all, which would serve index.html with the
  // wrong content-type and confuse the browser.
  app.use((req: Request, res: Response, next: NextFunction) => {
    const reqPath = req.url.split("?")[0];
    if (ASSET_EXT_RE.test(reqPath)) {
      console.warn(`[static] Asset not found: ${reqPath}`);
      res.status(404).type("text/plain").send(`Asset not found: ${reqPath}\nRun 'npm run build' and restart the server.`);
      return;
    }
    next();
  });

  // Fall through to index.html for SPA routing (navigation requests only).
  // Skips /api/*, /ws, and anything that looks like a file (handled above).
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
          res.status(500).type("text/html").send(`
            <h1>Application Error</h1>
            <p>Could not load the application. The build may be incomplete.</p>
            <p>Run <code>npm run build</code> and restart the server.</p>
          `);
        }
      }
    });
  });
}
