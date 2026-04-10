import type { Express, Request, Response } from "express";
import { readFileSync } from "fs";
import path from "path";
import { createRequire } from "module";

export const MARKETING_ROUTES = [
  "/industries",
  "/handyman", "/house-cleaning", "/lawn-care", "/snow-removal",
  "/dog-walking", "/tutoring",
  "/hvac", "/plumbing", "/electrical", "/carpet-cleaning",
  "/pressure-washing", "/window-cleaning",
  "/barbers", "/spa", "/nails", "/tattoo", "/haircuts",
  "/hair-salons", "/groomers", "/estheticians", "/ride-service",
];

interface RouteMeta {
  title: string;
  description: string;
  canonical: string;
}

const BASE = "https://certxa.com";

const META: Record<string, RouteMeta> = {
  "/industries":       { title: "Service Business Software for Every Industry | Certxa",       description: "One platform for 30+ service industries. Online booking, invoicing, scheduling, and client management — from HVAC to hair salons.",                       canonical: `${BASE}/industries`       },
  "/handyman":         { title: "Handyman Booking Software | Certxa",                          description: "Online booking, job-site notes, multi-trade invoicing, and client management for handymen and tradespeople. Try free for 60 days.",                    canonical: `${BASE}/handyman`         },
  "/house-cleaning":   { title: "House Cleaning Business Software | Certxa",                   description: "Recurring bookings, team scheduling, and instant invoicing for house cleaning businesses. Automate your schedule and get paid faster.",                 canonical: `${BASE}/house-cleaning`   },
  "/lawn-care":        { title: "Lawn Care Business Software | Certxa",                        description: "Recurring mowing schedules, seasonal contracts, and crew dispatch for lawn care businesses. Manage your whole route from one app.",                     canonical: `${BASE}/lawn-care`        },
  "/snow-removal":     { title: "Snow Removal Business Software | Certxa",                     description: "Storm-day dispatch, seasonal contracts, and automatic billing for snow removal businesses. One tap activates your whole route.",                        canonical: `${BASE}/snow-removal`     },
  "/dog-walking":      { title: "Dog Walking Business Software | Certxa",                      description: "GPS-tracked walks, daily reports, and recurring client plans for dog walkers. Manage bookings, invoicing, and client communication.",                   canonical: `${BASE}/dog-walking`      },
  "/tutoring":         { title: "Tutoring Business Software | Certxa",                         description: "Session scheduling, progress notes, and subscription billing for tutors and tutoring businesses. Manage students and get paid automatically.",           canonical: `${BASE}/tutoring`         },
  "/hvac":             { title: "HVAC Business Software for Contractors | Certxa",             description: "Online booking, service agreements, equipment history, and emergency dispatch for HVAC contractors. Try free for 60 days.",                             canonical: `${BASE}/hvac`             },
  "/plumbing":         { title: "Plumbing Business Software for Contractors | Certxa",         description: "Emergency dispatch, online booking, job-site photos, and itemized invoicing for plumbers. Manage every call from booking to payment.",                 canonical: `${BASE}/plumbing`         },
  "/electrical":       { title: "Electrical Contractor Software | Certxa",                     description: "Online booking, permit tracking, on-site quoting, and crew management for electricians. Run a tighter operation with less paperwork.",                  canonical: `${BASE}/electrical`       },
  "/carpet-cleaning":  { title: "Carpet Cleaning Business Software | Certxa",                  description: "Room-by-room online booking, annual re-booking reminders, and add-on upsells for carpet cleaning businesses. Grow your route automatically.",          canonical: `${BASE}/carpet-cleaning`  },
  "/pressure-washing": { title: "Pressure Washing Business Software | Certxa",                 description: "Online booking by surface, before and after photo documentation, and seasonal packages for pressure washing businesses.",                               canonical: `${BASE}/pressure-washing` },
  "/window-cleaning":  { title: "Window Cleaning Business Software | Certxa",                  description: "Recurring route scheduling, commercial account management, and seasonal re-booking for window cleaning businesses.",                                    canonical: `${BASE}/window-cleaning`  },
  "/barbers":          { title: "Barbershop Booking Software | Certxa",                        description: "Walk-in queues, appointment booking, and retail product sales for barbershops. Manage your whole shop from one platform.",                              canonical: `${BASE}/barbers`          },
  "/spa":              { title: "Day Spa Booking Software | Certxa",                           description: "Treatment menus, couples booking, and automated reminders for day spas. Professional spa management made simple.",                                       canonical: `${BASE}/spa`              },
  "/nails":            { title: "Nail Salon Booking Software | Certxa",                        description: "Multi-technician scheduling, add-ons, and membership plans for nail salons. Manage bookings and grow your nail business.",                              canonical: `${BASE}/nails`            },
  "/tattoo":           { title: "Tattoo Studio Booking Software | Certxa",                     description: "Deposit booking, design notes, and multi-artist scheduling for tattoo studios. Manage consultations, deposits, and appointments.",                      canonical: `${BASE}/tattoo`           },
  "/haircuts":         { title: "Walk-In Haircut Queue Management Software | Certxa",          description: "Live wait-time display, digital queue management, and no-app check-in for walk-in barbershops and hair salons.",                                        canonical: `${BASE}/haircuts`         },
  "/hair-salons":      { title: "Hair Salon Booking Software | Certxa",                        description: "Chair-level booking, stylist schedules, and loyalty rewards for hair salons. Everything your salon needs in one platform.",                             canonical: `${BASE}/hair-salons`      },
  "/groomers":         { title: "Pet Grooming Business Software | Certxa",                     description: "Breed notes, photo records, and recurring appointment management for pet groomers. Manage your grooming business with ease.",                           canonical: `${BASE}/groomers`         },
  "/estheticians":     { title: "Esthetician Booking Software | Certxa",                       description: "Intake forms, skin treatment history, and client retention tools for estheticians. Build a loyal client base with Certxa.",                             canonical: `${BASE}/estheticians`     },
  "/ride-service":     { title: "Ride Service Booking Software | Certxa",                      description: "On-demand booking, route tracking, and per-mile billing for ride service operators. Manage your fleet and drivers.",                                    canonical: `${BASE}/ride-service`     },
};

function getMeta(urlPath: string): RouteMeta {
  return META[urlPath] ?? {
    title: "Certxa — Business Software for Service Pros",
    description: "The all-in-one booking, scheduling, and payment platform for service businesses across every industry.",
    canonical: `${BASE}${urlPath}`,
  };
}

function injectSSR(template: string, appHtml: string, urlPath: string): string {
  const meta = getMeta(urlPath);
  return template
    .replace('<div id="root"></div>', `<div id="root">${appHtml}</div>`)
    .replace(/<title>[^<]*<\/title>/, `<title>${meta.title}</title>`)
    .replace(/(<meta\s+name="description"\s+content=")[^"]*(")/,   `$1${meta.description}$2`)
    .replace(/(<link\s+rel="canonical"\s+href=")[^"]*(")/,         `$1${meta.canonical}$2`)
    .replace(/(<meta\s+property="og:title"\s+content=")[^"]*(")/,  `$1${meta.title}$2`)
    .replace(/(<meta\s+property="og:description"\s+content=")[^"]*(")/,`$1${meta.description}$2`)
    .replace(/(<meta\s+property="og:url"\s+content=")[^"]*(")/,    `$1${meta.canonical}$2`)
    .replace(/(<meta\s+name="twitter:title"\s+content=")[^"]*(")/,       `$1${meta.title}$2`)
    .replace(/(<meta\s+name="twitter:description"\s+content=")[^"]*(")/,  `$1${meta.description}$2`);
}

type RenderFn = (url: string) => { html: string };

export function setupSSR(app: Express): void {
  if (process.env.NODE_ENV !== "production") return;

  let render: RenderFn | null = null;
  try {
    const bundlePath = path.resolve(__dirname, "server", "entry-server.cjs");
    const req = createRequire(__filename);
    const mod = req(bundlePath) as { render: RenderFn };
    render = mod.render;
    console.log("[SSR] Bundle loaded successfully");
  } catch (e) {
    console.warn("[SSR] SSR bundle not available — serving SPA for all routes:", e);
    return;
  }

  const templatePath = path.resolve(__dirname, "public", "index.html");
  let template: string;
  try {
    template = readFileSync(templatePath, "utf-8");
  } catch (e) {
    console.error("[SSR] Cannot read index.html:", e);
    return;
  }

  console.log(`[SSR] Activating SSR for ${MARKETING_ROUTES.length} marketing routes`);

  for (const route of MARKETING_ROUTES) {
    app.get(route, (req: Request, res: Response) => {
      try {
        const { html: appHtml } = render!(req.path);
        if (!appHtml) {
          res.setHeader("Cache-Control", "public, max-age=0, must-revalidate");
          return void res.sendFile(templatePath);
        }
        const fullHtml = injectSSR(template, appHtml, req.path);
        res.setHeader("Content-Type", "text/html; charset=utf-8");
        res.setHeader("Cache-Control", "public, max-age=300, stale-while-revalidate=3600");
        res.send(fullHtml);
      } catch (err) {
        console.error("[SSR] Render error for", req.path, err);
        res.setHeader("Cache-Control", "public, max-age=0, must-revalidate");
        void res.sendFile(templatePath);
      }
    });
  }
}
