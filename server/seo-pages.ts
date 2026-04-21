import { type Request, type Response, type NextFunction } from "express";
import fs from "fs";
import path from "path";

const SEO_PAGE_ROUTES: Record<string, string> = {
  "/":                  "index.html",
  "/barbers":           "barbers.html",
  "/hair-salons":       "hair-salons.html",
  "/haircuts":          "hair-salons.html",
  "/spa":               "spa.html",
  "/nails":             "nails.html",
  "/tattoo":            "tattoo.html",
  "/estheticians":      "estheticians.html",
  "/groomers":          "groomers.html",
  "/handyman":          "handyman.html",
  "/hvac":              "hvac.html",
  "/plumbing":          "plumbing.html",
  "/electrical":        "electrical.html",
  "/lawn-care":         "lawn-care.html",
  "/house-cleaning":    "house-cleaning.html",
  "/tutoring":          "tutoring.html",
  "/snow-removal":      "snow-removal.html",
  "/dog-walking":       "dog-walking.html",
  "/carpet-cleaning":   "carpet-cleaning.html",
  "/pressure-washing":  "pressure-washing.html",
  "/window-cleaning":   "window-cleaning.html",
  "/ride-service":      "ride-service.html",
  "/industries":        "industries.html",
};

const SEO_PAGES_DIR = path.resolve(process.cwd(), "seo-pages");

export function seoPageMiddleware(req: Request, res: Response, next: NextFunction) {
  if (req.method !== "GET" && req.method !== "HEAD") return next();
  const filename = SEO_PAGE_ROUTES[req.path];
  if (!filename) return next();
  const filePath = path.join(SEO_PAGES_DIR, filename);
  if (!fs.existsSync(filePath)) return next();
  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.setHeader("Cache-Control", "no-cache");
  res.sendFile(filePath);
}
