# Certxa — AI Onboarding Guide

> **Read this file first.** This document is the canonical orientation for any AI agent (or new human developer) touching this codebase. It explains what Certxa is, what its three internal apps do, how they wire together, where things live, what to watch out for, and how to debug common failures.
>
> **If you change something architectural, update this file.** It is part of the source-of-truth, not just notes.

---

## TL;DR — the 60-second pitch

**Certxa is one Node.js process that runs three websites:**

1. A PHP marketing site (the public `certxa.com` and the LaunchSite template catalog)
2. A React/Express SaaS booking + business management app (`manage.certxa.com`)
3. Per-business public booking pages on subdomains (`<slug>.certxa.com`)

A single Express server on **port 8100** is the front door. It:
- Spawns a PHP `php -S` server on **port 8104** as a child process and proxies `/`, `/launchsite/`, `*.php`, etc. to it.
- Serves the React SPA + REST API for `/api/*`, `/manage`, `/auth`, `/onboarding`, etc.
- Routes subdomains: `manage.` → React app, `<slug>.` → business booking page or installed React template.

PostgreSQL (port 5432, optionally via PgBouncer 6432) holds everything. Stripe handles billing, Twilio sends SMS, Mailgun sends email, Google OAuth + Google Business Profile + OpenAI provide auxiliary integrations.

PM2 supervises the Node process (`certxa`). PHP-FPM runs separately for the static marketing site on port 8422 (only on this VPS — see [`nginx/certxa-php.conf`](nginx/certxa-php.conf)).

---

## 1. The three apps in detail

### 1a. Marketing PHP site → `php/`

- Lives in [`php/`](php/), served by the embedded `php -S` on **port 8104**.
- Router file: [`php/router.php`](php/router.php:1) — directory-based clean URLs (`/overview` → [`php/overview/default.php`](php/overview/default.php:1)).
- Pages follow the **`/{slug}/default.php`** convention. Example slugs: `overview`, `pricing`, `online-booking`, `client-management`, `vs-vagaro`, `vs-glossgenius`, `payment-processing`, `barbershop-software`, `nail-salon-software`, `hair-salon-software`, etc.
- Static-asset MIME types are handled in [`php/router.php:14`](php/router.php:14) (`$mime_map`).
- 301 redirects from old `.php` URLs to clean URLs are at [`php/router.php:128`](php/router.php:128).
- `php/public/` is an alternate page root that the router falls back to (see [`php/router.php:114`](php/router.php:114)) — used for some legacy paths like `/SalonOS/`.

### 1b. LaunchSite template catalog → `php/launchsite/`

This is the most complex PHP subsystem. It lets the admin (you) **upload a ZIP of any React/Vite project** and have the server:
1. Extract it
2. Move source into [`artifacts/template-{id}/`](artifacts/)
3. Auto-rewrite [`vite.config.ts`](artifacts/) so it builds to [`php/launchsite/templates/{id}/`](php/launchsite/templates/) with the correct `base` path
4. Run `pnpm install && pnpm build`
5. Capture a thumbnail screenshot
6. Save the hero image to the per-category media library
7. Insert a row into the [`launchsite_templates`](shared/schema.ts:1) table so the catalog page picks it up

**Admin scripts** (all live in [`php/launchsite/`](php/launchsite/) and require the user be logged in via [`config.php`](php/launchsite/config.php:1) gate):

| File | Purpose |
|---|---|
| [`admin.php`](php/launchsite/admin.php) | UI / dashboard |
| [`admin-catalog.php`](php/launchsite/admin-catalog.php) | List installed templates with edit/delete/rebuild actions |
| [`admin-install.php`](php/launchsite/admin-install.php) | Install a template from uploaded ZIP (the streaming progress page) |
| [`admin-replace.php`](php/launchsite/admin-replace.php) | Replace source for an existing template ID |
| [`admin-delete.php`](php/launchsite/admin-delete.php) | Remove a template (built dir + source + thumb + DB row) |
| [`admin-detect.php`](php/launchsite/admin-detect.php) | Re-run metadata detection on existing artifacts |
| [`admin-edit.php`](php/launchsite/admin-edit.php) | Edit catalog metadata (name, accent, badge, etc.) |
| [`admin-rename.php`](php/launchsite/admin-rename.php) | Rename a template ID across DB, build dir, and artifacts |
| [`admin-duplicate.php`](php/launchsite/admin-duplicate.php) | Clone a template under a new ID |
| [`admin-thumb.php`](php/launchsite/admin-thumb.php) | Regenerate a single thumbnail (Puppeteer screenshot) |
| [`admin-regen-all-thumbs.php`](php/launchsite/admin-regen-all-thumbs.php) | Bulk regen all thumbnails |
| [`admin-upload-thumb.php`](php/launchsite/admin-upload-thumb.php) | Manual thumbnail upload |
| [`admin-media-library.php`](php/launchsite/admin-media-library.php) | Per-category hero image manager |
| [`admin-media-upload.php`](php/launchsite/admin-media-upload.php) | Upload to the media library |
| [`admin-media-delete.php`](php/launchsite/admin-media-delete.php) | Remove from the media library |
| [`admin-scraper.php`](php/launchsite/admin-scraper.php) | Scrape a competitor URL into a draft template |
| [`admin-scraper-save.php`](php/launchsite/admin-scraper-save.php) | Persist a scraper draft |
| [`admin-scraper-cleanup.php`](php/launchsite/admin-scraper-cleanup.php) | Garbage-collect old scrapes in [`scraped-tmp/`](php/launchsite/scraped-tmp/) |
| [`admin-rescrape.php`](php/launchsite/admin-rescrape.php) | Re-scrape a previously saved URL |
| [`admin-lib.php`](php/launchsite/admin-lib.php) | Shared helpers (`launchit_category_slug`, `launchit_media_dir`, `launchit_extract_hero_url`, `launchit_download_hero`) |

**Catalog data flow:**
- The PHP DB layer is [`php/launchsite/api/db.php`](php/launchsite/api/db.php) (PDO, reads the same `DATABASE_URL` env var via [`php/launchsite/api/db-templates.php`](php/launchsite/api/db-templates.php)).
- The template list is `launchit_all_templates()` → returns array keyed by template ID — see [`php/launchsite/data/templates.php`](php/launchsite/data/templates.php:1).
- DB table: `launchsite_templates` (Drizzle definition in [`shared/schema.ts`](shared/schema.ts:1) — search for `launchsiteTemplates`).
- Built React templates land under [`php/launchsite/templates/{id}/`](php/launchsite/templates/) and are served as static HTML by the PHP router.

### 1c. React + Express app → `client/` + `server/`

- Entry point: [`server/index.ts`](server/index.ts:1).
- Booted by [`dist/index.cjs`](dist/index.cjs) in production (esbuild output of [`script/build.ts`](script/build.ts)).
- The React frontend lives in [`client/src/`](client/src/) — built by Vite into [`dist/public/`](dist/public/).
- An additional **SSR bundle** for SEO landing pages is built into [`dist/server/entry-server.cjs`](dist/server/entry-server.cjs) — see [`SSR_ROUTES`](server/index.ts:67) for the page list.
- React Router v6 in [`client/src/App.tsx`](client/src/App.tsx) — 110+ page components in [`client/src/pages/`](client/src/pages/).
- TanStack React Query for all API calls — wrapped via [`client/src/lib/queryClient.ts`](client/src/lib/queryClient.ts).
- shadcn/ui + Radix + Tailwind for UI; Recharts for charts; Framer Motion for animations.

---

## 2. Architecture diagram

```
                         Internet
                            │
                            ▼
                    Nginx :443 (SSL)
                    ├──→ certxa.com  →  PHP-FPM :8422  (static marketing site)
                    │                   nginx/certxa-php.conf
                    │
                    └──→ manage.certxa.com / *.certxa.com / api / etc.
                         │
                         ▼
                    Node :8100 (Express, PM2 process "certxa")
                    │
                    ├── server/middleware/subdomain.ts
                    │       └── identifies manage / slug / custom domains
                    │
                    ├── server/php-proxy.ts
                    │       └── spawns and proxies to:
                    │           PHP :8104 (php -S router.php)
                    │           ├── php/ (marketing pages)
                    │           └── php/launchsite/ (template catalog admin)
                    │
                    ├── server/routes.ts (224 endpoints)
                    │   + server/routes/*.ts (billing, intelligence, manage,
                    │                          training, clients, crm-search,
                    │                          crew-mobile, pro-dashboard,
                    │                          intelligence-demo)
                    │
                    ├── React SPA (Vite build) at dist/public/
                    │   served via express.static + SPA catch-all
                    │
                    └── PostgreSQL :5432 (or :6432 via PgBouncer)
                        ├── 60+ tables (shared/schema.ts + shared/schema/*.ts)
                        └── connection pool: server/db.ts
```

**Two separate PHP servers** exist on this VPS:
- **PHP-FPM 8.1 service `phpsite.service`** on port 8422 — serves the public marketing site at `certxa.com` (configured in [`nginx/certxa-php.conf`](nginx/certxa-php.conf)).
- **PHP built-in server `php -S` on port 8104** — child of the Node `certxa` PM2 process. This is the one the React/Express app proxies to. **The template install pages (`/launchsite/admin-install.php`) run here, NOT on PHP-FPM.**

Both must have the `zip` extension installed (`apt install php8.1-zip`).

---

## 3. Where things live (the cheat sheet)

```
/apps/certxa/
├── client/                        React 18 + Vite frontend
│   ├── src/
│   │   ├── App.tsx                React Router v6 root
│   │   ├── entry-server.tsx       SSR entry (used by build to make entry-server.cjs)
│   │   ├── pages/                 110+ route components
│   │   │   ├── Admin/             Platform admin (super-admin) pages
│   │   │   ├── manage/            Subscriber hub pages (manage.certxa.com)
│   │   │   └── queue/             Walk-in queue UI
│   │   ├── hooks/                 use-auth, use-store, use-services, etc.
│   │   ├── components/            UI (shadcn) + business components
│   │   ├── lib/
│   │   │   ├── queryClient.ts     Configured TanStack Query client
│   │   │   └── utils.ts           cn(), etc.
│   │   └── contexts/              StoreProvider, TrainingContext, PracticeMode
│   └── public/                    Static assets that take priority over PHP
│       ├── *.html                 Generated SEO landing pages (compressed .gz)
│       ├── seo-assets/            Shared CSS/JS for SEO pages
│       └── videos/                Marketing videos
│
├── server/                        Express backend (TypeScript)
│   ├── index.ts                   Boot sequence — read this first
│   ├── routes.ts                  Main API surface (8,287 lines, 224 routes)
│   ├── routes/                    Domain-grouped route modules
│   │   ├── billing.ts             Stripe customer portal, plan changes
│   │   ├── billing-plans-admin.ts Super-admin plan CRUD
│   │   ├── billing-webhooks.ts    Stripe webhook receiver (raw body required)
│   │   ├── clients.ts             Client (CRM) endpoints — replaces old /customers
│   │   ├── crew-mobile.ts         Field-tech mobile app endpoints
│   │   ├── crm-search.ts          Cross-table client search
│   │   ├── intelligence.ts        Revenue Intelligence dashboard endpoints
│   │   ├── intelligence-demo.ts   Demo SSE endpoint, auto-reseed orchestrator
│   │   ├── manage.ts              Subscriber hub (billing, settings, team)
│   │   ├── pro-dashboard.ts       Pro / handyman dashboard endpoints
│   │   └── training.ts            Onboarding training mode + sandbox
│   │
│   ├── intelligence/              Revenue Intelligence engines
│   │   ├── orchestrator.ts        Runs all engines for a store
│   │   ├── churn.ts               Predicts who's leaving
│   │   ├── ltv.ts                 Lifetime value calc
│   │   ├── revenue-leakage.ts     What you're losing
│   │   ├── revenue-forecast.ts
│   │   ├── growth-score.ts
│   │   ├── rebooking-rates.ts
│   │   ├── no-show.ts / no-show-winback.ts
│   │   ├── cancellation-recovery.ts
│   │   ├── dead-seats.ts          Underused staff time
│   │   ├── drift-recovery.ts      Clients whose visit cadence is slipping
│   │   ├── cadence.ts             Per-archetype visit cadence
│   │   ├── sms-guard.ts           Daily/weekly SMS spend caps per store
│   │   ├── weekly-digest-email.ts Owner email scheduler
│   │   ├── tester-seeder.ts
│   │   └── demo-runner.ts         SSE engine launch animations
│   │
│   ├── middleware/
│   │   ├── api-auth.ts            Bearer token auth for /api/v1/*
│   │   ├── permissions.ts         attachAuthContext, requirePermission, can()
│   │   ├── plan-middleware.ts     Plan tier gating (free / pro / elite)
│   │   ├── subdomain.ts           manage. / slug. / custom-domain detection
│   │   └── trial-middleware.ts    60-day trial gate
│   │
│   ├── services/
│   │   ├── billing-service.ts     Stripe subscription operations
│   │   ├── trial-service.ts       Trial status + extension logic
│   │   ├── trial-expiration.ts    Hourly expiration scheduler
│   │   └── trial-reminders.ts     30/7/1 day reminder scheduler
│   │
│   ├── startup/                   One-time tasks at boot
│   │   ├── runMigrations.ts       Apply migrations/*.sql in order
│   │   ├── repairOwnerRoles.ts    Backfill owner role for store owners
│   │   └── migrateSmsAllowance.ts SMS allowance backfill from legacy column
│   │
│   ├── training/                  Sandbox practice mode for new owners
│   │   ├── sandbox.ts             Clone a store into a sandbox copy
│   │   ├── reducer.ts             State machine for training progress
│   │   └── graduation-scheduler.ts Hourly graduation sweep + 6h digest
│   │
│   ├── replit_integrations/       Replit-only vendor-locked integrations
│   │   ├── audio/                 Live voice transcription (web socket)
│   │   ├── batch/                 OpenAI batch jobs
│   │   ├── chat/                  Long-running chatbot infra
│   │   └── image/                 Image-gen endpoint
│   │
│   ├── auth.ts                    setupAuth(app), session, login/register, OAuth login finalizer
│   ├── passport.ts                Google OAuth strategy
│   ├── db.ts                      pg.Pool (connection pooling)
│   ├── storage.ts                 IStorage interface — main DB query layer
│   ├── mail.ts                    Mailgun + reminder schedulers
│   ├── sms.ts                     Twilio + reminder scheduler
│   ├── notifications.ts           In-app WebSocket notification hub
│   ├── chatbot.ts                 OpenAI chatbot endpoints
│   ├── dialer.ts                  AI auto-dialer
│   ├── google-business-api.ts     Google Business Profile API client
│   ├── google-review-sync.ts      Periodic review sync scheduler
│   ├── google-quota-guard.ts      Throttling + persisted state
│   ├── stripe-subscriptions.js    Stripe legacy module (still imported)
│   ├── billing-dunning-scheduler.ts Charges-failed escalation, 30-day lockout
│   ├── lapsed-client-scheduler.ts   Daily lapsed-client re-engagement
│   ├── queue-sms-scheduler.ts       Walk-in queue smart travel-alert SMS
│   ├── seo-pages.ts                 SEO landing page middleware (HTML files)
│   ├── seo-cities.ts                City list + slug builder for SEO regions
│   ├── php-proxy.ts                 Spawns + proxies to PHP, isPhpRoute()
│   ├── rate-limits.ts               OAuth and other shared rate-limit state
│   ├── cache.ts                     In-memory caches
│   ├── static.ts                    Static helpers
│   ├── vite.ts                      Dev-mode Vite middleware (only NODE_ENV=development)
│   └── onboarding-data.ts           Default service templates per business type
│
├── shared/                        Code shared between client + server
│   ├── schema.ts                  Main Drizzle schema (61 tables)
│   ├── schema/
│   │   ├── auth.ts                users + sessions
│   │   ├── clients.ts             Client CRM (13 tables) — replacing old customers
│   │   ├── billing.ts             Stripe + invoices + payment_transactions (13 tables)
│   │   ├── campaigns.ts           Marketing campaigns
│   │   ├── api-keys.ts            Bearer keys for /api/v1
│   │   ├── intelligence.ts        Intelligence-engine outputs
│   ├── models/
│   │   ├── auth.ts                users, sessions (re-exported from schema.ts)
│   │   └── chat.ts                Chatbot conversations table
│   ├── permissions.ts             PERMISSIONS enum + computePermissions()
│   └── routes.ts                  Shared route-path constants used by client + server
│
├── php/                           Both PHP applications
│   ├── router.php                 Built-in server router
│   ├── index.php                  Marketing site landing page
│   ├── config.php                 Marketing site config
│   ├── includes/                  header.php, footer.php, nav.php
│   ├── api/                       PHP REST endpoints
│   │   ├── db.php                 PDO connection (uses DATABASE_URL)
│   │   ├── check-subdomain.php
│   │   └── submit-onboarding.php
│   ├── {slug}/default.php         Marketing pages (overview, pricing, etc.)
│   ├── public/                    Alternate page root
│   ├── assets/                    Marketing CSS/JS/images
│   ├── videos/                    Marketing videos
│   └── launchsite/                Template catalog (see §1b for full list)
│       ├── admin-*.php            19 admin scripts
│       ├── api/                   db-templates.php, templates.php
│       ├── data/templates.php     Template registry loader
│       ├── pages/dns-setup.php    DNS setup instructions UI
│       ├── templates/{id}/        Built React templates (vite output)
│       ├── media/{category}/      Per-category hero image library
│       └── scraped-tmp/           Temp dir for the scraper
│
├── artifacts/                     Source uploads from admin-install.php
│   ├── template-{id}/             One per installed template
│   └── mockup-sandbox/             Permanent: shared shadcn/Tailwind sandbox
│
├── scripts/                       Operational scripts (run via npm run db:*)
│   ├── migrate.ts                 Apply migrations/*.sql (used by startup too)
│   ├── db-push.mjs                drizzle-kit push wrapper
│   ├── db-push.ts                 Internal helper
│   ├── seed.ts                    First-time minimal seed (admin user, plans)
│   ├── seed-billing-plans.ts      Stripe plan seed
│   ├── seed-{biz}-demo.ts         Each demo business seed
│   ├── reset-{biz}-demo.ts        Wipes demo data
│   ├── reseed-{biz}-demo.ts       Reset + seed
│   ├── lib/seed-demo-base.ts      Parameterized seeder (used by all 4 demos)
│   ├── lib/reset-demo-base.ts     Parameterized reset
│   ├── seed-names.ts              First+last name pools
│   ├── reset.ts                   Nuke everything (dangerous)
│   ├── check-db.ts                Connectivity test
│   ├── verify-build.ts            Sandbox-execute the built bundle, fail on TDZ/syntax errors
│   ├── deploy.sh                  Deploy script
│   ├── setup.sh                   Initial VPS setup (renders nginx config)
│   ├── vps-install.sh             Full bootstrap
│   ├── fix-db-permissions.sh      psql GRANT helper
│   └── screenshot-{template,url}.mjs  Puppeteer screenshot tools (used by admin-thumb)
│
├── script/                        (singular — older scripts dir)
│   ├── build.ts                   Production build pipeline
│   └── 20260227_add_sort_order_to_service_categories.sql  (one-off)
│
├── migrations/                    Drizzle SQL migrations applied on boot
│   ├── 0000-0015_*.sql            Run in lex-sort order by startup/runMigrations.ts
│   └── meta/                      Drizzle journal
│
├── nginx/
│   ├── certxa.conf                Node app config (manage.certxa.com)
│   └── certxa-php.conf            PHP-FPM marketing site config (certxa.com)
│
├── seo-pages/                     Static HTML for SEO landing pages
│   └── *.html                     Served by seoPageMiddleware
│
├── client/public/                 Per-city static SEO pages (compressed .gz)
│
├── docs/                          User-facing technical docs
│
├── data/                          Runtime data (NOT tracked in git)
│   └── google-quota-state.json    Persisted Google API quota counters
│
├── logs/                          PM2 logs (NOT tracked)
│
├── ecosystem.config.cjs           PM2 config
├── package.json                   Node deps + npm scripts
├── tsconfig.json                  TS config (paths: @/, @shared/, @assets/)
├── vite.config.ts                 Client build config
├── tailwind.config.ts
├── postcss.config.js
├── drizzle.config.ts              Drizzle Kit config
├── eslint.config.js
├── replit.md                      Replit dev notes (ALSO has demo creds, useful)
├── VPS_DEPLOYMENT_GUIDE.md        Full deploy guide (READ THIS for ops)
└── AI_CODEBASE_GUIDE.md           ← You are here
```

---

## 4. Boot sequence (read [`server/index.ts`](server/index.ts:1) to verify)

When PM2 starts the `certxa` process:

1. `import "dotenv/config"` — loads [`/apps/certxa/.env`](/apps/certxa/.env). **`.env` is gitignored** — never commit it.
2. `validateEnv()` IIFE checks for `DATABASE_URL`, `SESSION_SECRET`, `APP_URL`. **Hard-exits if any are missing.**
3. CORS, security headers, compression (with PHP and SSE bypasses), cookie parser, JSON body parser are registered.
4. Rate limiters on `/api/auth`, `/api/public`, `/api/book` (production only).
5. `/api/health` endpoint registered (no auth).
6. `subdomainMiddleware` runs first — sets `req.isManageSubdomain`, `req.store`, or `req.launchsiteSlug`.
7. `phpMiddleware` runs next — proxies anything PHP-eligible.
8. Async boot:
    - `runMigrations()` — applies any pending [`migrations/*.sql`](migrations/) — fatal on failure.
    - `startPhpServer()` — spawns `php -S 127.0.0.1:8104 router.php` from [`php/`](php/).
    - `setupAuth(app)` — Express session backed by `connect-pg-simple`, passport init.
    - In production: `express.static(dist/public, ...)` is mounted **before** routes so hashed asset filenames never fall through to the SPA catch-all.
    - `registerRoutes()` — wires the 224 routes from [`server/routes.ts`](server/routes.ts:1) and submodules.
    - One-time fixers: `repairOwnerRoles`, `migrateSmsAllowance`.
    - All schedulers start (see §6 below).
    - `seoPageMiddleware` (HTML files from [`seo-pages/`](seo-pages/) win over React).
    - In production: SSR handler for `SSR_ROUTES` set, then SPA catch-all (`sendFile(index.html)`).
9. `httpServer.listen(PORT)`.

---

## 5. Subdomain & PHP routing rules — the 4 cases

Read [`server/middleware/subdomain.ts`](server/middleware/subdomain.ts:1) and [`server/php-proxy.ts:isPhpRoute`](server/php-proxy.ts:142) when in doubt.

### Case A — `certxa.com` apex / `www.certxa.com`
On this VPS, **Nginx routes the apex to PHP-FPM directly on port 8422**, so the Node app never sees these requests. The Node app's PHP proxy on 8104 is only used by the React/booking/admin paths.

### Case B — `manage.certxa.com`
[`subdomainMiddleware`](server/middleware/subdomain.ts:1) sets `req.isManageSubdomain = true`. The PHP middleware respects that flag and skips ([`php-proxy.ts:199`](server/php-proxy.ts:199)). All requests are handled by Express + the React SPA.

### Case C — `<slug>.certxa.com` (per-business booking page)
[`subdomainMiddleware`](server/middleware/subdomain.ts:1) looks up the slug in:
1. `locations.booking_slug` — if found, attaches `req.store`. The React app's `<PublicBooking />` route renders the booking widget.
2. Otherwise tries the `subdomains` join with `onboarding_submissions` — sets `req.launchsiteSlug` and serves the installed React template.
3. Otherwise renders a **"Did you mean…" suggestion page** using Jaro-Winkler similarity ([`subdomain.ts:90-265`](server/middleware/subdomain.ts:90)).

The reserved subdomain set lives in [`subdomain.ts`](server/middleware/subdomain.ts:1) — `manage`, `www`, `api`, etc. never reach the slug lookup.

### Case D — Custom domain (e.g. `mybusiness.com` pointing to the VPS)
If the host is not the app domain or its subdomain, the middleware treats it as a custom domain and looks up by domain. New code added by Copilot (commit `1df33df`) adds DNS verification API + setup page — see [`server/routes.ts`](server/routes.ts:1) (the recently-added DNS endpoints) and [`php/launchsite/pages/dns-setup.php`](php/launchsite/pages/dns-setup.php:1).

### Case E — PHP path on `manage.` or default host
[`isPhpRoute`](server/php-proxy.ts:142) decides:
- **Never PHP**: `/api/`, `/vite-hmr`, `/src/`, `/node_modules/`, `/@`
- **Always PHP**: anything ending `.php`, `/sitemap.xml`, `/robots.txt`, `/favicon.svg`, `/assets/`, `/videos/`, `/launchsite/`, `/editor/`, `/templates/`, root `/`
- **Dynamic check**: any clean-URL path with a corresponding `php/{slug}/default.php` or `php/public/{slug}/default.php` is PHP.

**Important asset rule**: `/assets/index-HASH.css|js` could exist in either Vite's [`dist/public/`](dist/public/) or the PHP marketing site. The PHP middleware [explicitly checks](server/php-proxy.ts:208) for files in `client/public/` and `dist/public/` first to avoid the dreaded "Refused to apply style — MIME `text/html`" error.

---

## 6. Schedulers (`pm2 logs certxa` will show all of these starting)

Each runs inside the Node process:

| Name | Frequency | File |
|---|---|---|
| Migrations | Once at boot | [`server/startup/runMigrations.ts`](server/startup/runMigrations.ts) |
| Owner role repair | Once at boot | [`server/startup/repairOwnerRoles.ts`](server/startup/repairOwnerRoles.ts) |
| SMS allowance migration | Once at boot | [`server/startup/migrateSmsAllowance.ts`](server/startup/migrateSmsAllowance.ts) |
| TrialExpiration | Hourly | [`server/services/trial-expiration.ts`](server/services/trial-expiration.ts) |
| TrialReminder | Hourly (30/7/1d) | [`server/services/trial-reminders.ts`](server/services/trial-reminders.ts) |
| WeeklyDigest | Hourly check, fires Mondays 9am | [`server/intelligence/weekly-digest-email.ts`](server/intelligence/weekly-digest-email.ts) |
| LapsedClient | Hourly check, fires daily 10am | [`server/lapsed-client-scheduler.ts`](server/lapsed-client-scheduler.ts) |
| Email reminders | Every 5 min | [`server/mail.ts`](server/mail.ts) |
| SMS reminders | Every 5 min | [`server/sms.ts`](server/sms.ts) |
| Queue SMS travel-alert | Every 2 min | [`server/queue-sms-scheduler.ts`](server/queue-sms-scheduler.ts) |
| Crew overtime | Every 2 min | (registered in routes/crew-mobile.ts) |
| Dunning (failed payments) | Hourly | [`server/billing-dunning-scheduler.ts`](server/billing-dunning-scheduler.ts) |
| GoogleReviews sync | Every 6 hours | [`server/google-review-sync.ts`](server/google-review-sync.ts) |
| Intelligence orchestrator | Every 6 hours | [`server/intelligence/orchestrator.ts`](server/intelligence/orchestrator.ts) |
| Training graduation | Hourly + 6h digest + daily sandbox reset | [`server/training/graduation-scheduler.ts`](server/training/graduation-scheduler.ts) |

When debugging "did this scheduler run?", grep `pm2 logs certxa --nostream` for the bracketed tag (e.g. `[Dunning]`, `[GoogleReviews]`, `[intelligence]`).

---

## 7. Authentication & permissions

### Sessions
- `express-session` with `connect-pg-simple` storing rows in the `sessions` table (auto-created).
- `SESSION_SECRET` env var signs cookies. **Generate with `openssl rand -hex 64`.**
- Cookie name: `connect.sid`. `secure: true` in production (Nginx terminates SSL, Express sees `trust proxy = 1`).

### Auth strategies
- **Email + password**: bcryptjs hashes, `/api/auth/login` and `/api/auth/register` in [`server/auth.ts`](server/auth.ts:1).
- **Google OAuth**: passport-google-oauth20 in [`server/passport.ts`](server/passport.ts:1). Requires `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_AUTH_CALLBACK_URL` (e.g. `https://certxa.com/api/auth/google/callback`).
- **Bearer API keys**: [`server/middleware/api-auth.ts`](server/middleware/api-auth.ts:1) — used for `/api/v1/*` programmatic access. Keys live in `api_keys` table.
- **JWT** (`jsonwebtoken`) — used for one-shot links (e.g. password reset, accept-invite) — see [`server/auth.ts`](server/auth.ts:1).

### Permissions
- [`shared/permissions.ts`](shared/permissions.ts:1) defines the `PERMISSIONS` enum (e.g. `manage:billing`, `manage:staff`, `view:appointments`).
- Roles: `owner`, `manager`, `staff`, `super_admin` (platform admin), `front_desk`, `pro_owner` (handyman).
- Middleware: `attachAuthContext`, `requirePermission(perm)`, `ownStaffScope`, `can(req, perm)` from [`server/middleware/permissions.ts`](server/middleware/permissions.ts:1).
- `computePermissions(role)` returns the actual set of permissions for a normalized role string.
- A user owning a `locations` row automatically gets the `owner` role (enforced by [`startup/repairOwnerRoles.ts`](server/startup/repairOwnerRoles.ts:1)).

### Trial gating
- 60-day free trial set on store creation. [`server/middleware/trial-middleware.ts:requireActiveTrial`](server/middleware/trial-middleware.ts) blocks billing-locked routes.
- [`server/services/trial-service.ts:TrialService`](server/services/trial-service.ts) — read/extend/expire trials.
- Configurable via `TRIAL_PERIOD_DAYS` env (default 60).

---

## 8. Database (PostgreSQL via Drizzle ORM)

- Connection: [`server/db.ts`](server/db.ts) — uses a `pg.Pool`.
- Schema: [`shared/schema.ts`](shared/schema.ts:1) (1499 lines, ~50 tables) + 5 sub-schemas in [`shared/schema/`](shared/schema/).
- Total **~93 tables** combined.

### Major table groups

| Domain | Key tables |
|---|---|
| Auth | `users`, `sessions`, `password_reset_tokens` |
| Stores | `locations` (the row representing one business), `business_hours`, `store_settings` |
| Staff | `staff`, `staff_services`, `staff_availability`, `roles`, `permissions` |
| Services | `services`, `service_categories`, `addons`, `service_addons` |
| Customers (legacy) | `customers` |
| Clients (new CRM) | `clients` + 12 satellites (emails, phones, addresses, tags, notes, marketing prefs, custom fields, audit logs, export/import jobs) |
| Appointments | `appointments`, `appointment_addons`, `waitlist` |
| POS | `products`, `cash_drawer_sessions`, `drawer_actions` |
| Loyalty | `loyalty_transactions`, `gift_cards`, `gift_card_transactions` |
| Forms | `intake_forms`, `intake_form_fields`, `intake_form_responses` |
| Reviews | `reviews`, `google_reviews`, `google_review_responses` |
| Google | `google_business_profiles`, `google_business_accounts`, `google_business_locations`, `google_business_sync_logs` |
| Messaging | `mail_settings`, `sms_settings`, `sms_log`, `sms_conversations`, `messages`, `conversations` |
| Marketing | `campaigns`, `seo_regions` |
| Billing | `billing_plans`, `subscriptions`, `stripe_customers`, `stripe_subscriptions`, `stripe_orders`, `customer_billing_profiles`, `invoice_records`, `payment_transactions`, `stripe_webhook_events`, `billing_activity_logs`, `refunds`, `subscription_plan_changes`, `scheduled_plan_changes` |
| Intelligence | `client_intelligence`, `intelligence_interventions`, `growth_score_snapshots`, `dead_seat_patterns` |
| Pro features (handyman/services) | `pro_customers`, `pro_crews`, `pro_crew_locations`, `pro_estimates`, `pro_invoices`, `pro_leads`, `pro_service_orders`, `pro_order_notes` |
| Onboarding | `onboarding_submissions`, `subdomains` |
| LaunchSite | `launchsite_templates` |
| Misc | `names` (first/last name pool for demos), `app` (key-value config), `api_keys` |

### Migrations
- Lex-sorted apply order ensures determinism: [`migrations/0000_*.sql`](migrations/) → `0015_*.sql`.
- [`server/startup/runMigrations.ts`](server/startup/runMigrations.ts:1) runs them on every boot. **Only run once-ever** because each is idempotent (`CREATE TABLE IF NOT EXISTS`, `DO $$ ... EXCEPTION WHEN duplicate_column THEN NULL END $$`).
- For DDL changes, **prefer `npm run db:push`** (Drizzle Kit auto-syncs schema → DB) for dev, **and** add a corresponding `migrations/NNNN_*.sql` for prod boots.

### Storage layer
- [`server/storage.ts`](server/storage.ts:1) defines the `IStorage` interface with all CRUD operations. The default impl is `DrizzleStorage`. **Most route handlers go through `storage.*` rather than calling `db.select()` directly.** When adding new tables, extend `IStorage`.

---

## 9. External integrations

| Service | Env vars | Used for | Module |
|---|---|---|---|
| **PostgreSQL** | `DATABASE_URL` | Everything | [`server/db.ts`](server/db.ts) |
| **Stripe** | `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET` | Subscriptions, payments, invoices, refunds | [`server/stripe-subscriptions.js`](server/stripe-subscriptions.js), [`server/services/billing-service.ts`](server/services/billing-service.ts), [`server/routes/billing*.ts`](server/routes/) |
| **Twilio** | `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_PHONE_NUMBER` | SMS reminders, queue alerts, marketing | [`server/sms.ts`](server/sms.ts) — also can be configured per-store in admin settings |
| **TextBelt** | `TEXTBELT_API_KEY` | Fallback SMS | [`server/sms.ts`](server/sms.ts) |
| **Mailgun** | `MAILGUN_API_KEY`, `MAILGUN_DOMAIN`, `MAILGUN_FROM_EMAIL`, `MAILGUN_FROM_NAME`, `MAILGUN_SENDER_EMAIL` | Email reminders, digests, password resets | [`server/mail.ts`](server/mail.ts) |
| **Google OAuth (login)** | `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_AUTH_CALLBACK_URL` | "Sign in with Google" | [`server/passport.ts`](server/passport.ts) |
| **Google Business Profile** | `GOOGLE_REDIRECT_URI` | Pulling reviews into stores' dashboards | [`server/google-business-api.ts`](server/google-business-api.ts), [`server/google-review-sync.ts`](server/google-review-sync.ts), [`server/google-quota-guard.ts`](server/google-quota-guard.ts) |
| **OpenAI** | `OPENAI_API_KEY` | Chatbot, AI dialer, image gen, scrape-to-template | [`server/chatbot.ts`](server/chatbot.ts), [`server/dialer.ts`](server/dialer.ts), [`server/replit_integrations/`](server/replit_integrations/) |

When adding a new integration, follow this pattern:
1. Add env vars to [`.env.example`](.env.example) and [`VPS_DEPLOYMENT_GUIDE.md`](VPS_DEPLOYMENT_GUIDE.md).
2. Add a presence-only check in `/api/health` ([`server/index.ts:293`](server/index.ts:293)).
3. Initialize lazily — never crash the server because a third-party key is missing; just disable the feature.

---

## 10. Build & deploy

### Local dev
```bash
npm install
npm run db:push        # sync schema → DB
npm run dev            # tsx server/index.ts on PORT=5000
```

### Production build
```bash
npm run build          # script/build.ts: vite client + esbuild SSR + esbuild server
npm run build:check    # build + scripts/verify-build.ts (sandbox-execute the bundle)
npm run build:verify   # just the verifier
```

The build produces:
- `dist/public/` — Vite client output (`index.html`, hashed assets, gzipped)
- `dist/server/entry-server.cjs` — SSR bundle for SEO landing pages (not minified)
- `dist/index.cjs` — Express server bundle (1.9 MB)

### Production run via PM2
```bash
pm2 start ecosystem.config.cjs --env production
pm2 save                      # persist process list across reboots
pm2 startup systemd           # generate the systemd unit
```

The PM2 config is [`ecosystem.config.cjs`](ecosystem.config.cjs:1):
- `script: ./dist/index.cjs` (NOT `npm run dev`, NOT `tsx`)
- `exec_mode: fork` (MUST be fork — the app spawns a child PHP process)
- `instances: 1`
- `NODE_ENV: production`, `PORT: 8100`
- `max_memory_restart: 1G`

### Nginx
- [`nginx/certxa-php.conf`](nginx/certxa-php.conf) — apex `certxa.com` → PHP-FPM `:8422`
- [`nginx/certxa.conf`](nginx/certxa.conf) — `manage.certxa.com` and any non-PHP subdomain → Node `:8100`

### Always after server-side code changes
```bash
npm run build && pm2 restart certxa
```

### After PHP-only changes
**Nothing. PHP-FPM and `php -S` re-read files per request.** Just hit the page again.

### Git note
This repo is local-only on the VPS — there is no `git push` flow. Commits accumulate locally on `main`. That's fine; the VPS deploys from the working tree, not from GitHub.

---

## 11. Foot-guns & gotchas (read this twice)

### A. **Never run `npm run dev` in production.** It registers Vite middleware that intercepts `/assets/*` and breaks hashed asset serving. Always `npm run build && pm2 start ecosystem.config.cjs --env production`.

### B. **Don't touch `Transfer-Encoding: chunked` headers in PHP.**
The PHP built-in server / `http-proxy-middleware` chain mangles manual chunked encoding (`[PHP Proxy] Error: Parse Error: Invalid character in chunk size`). Use `set_time_limit(N)` for long-running scripts and let the server handle chunking — see [`php/launchsite/admin-install.php`](php/launchsite/admin-install.php:524) for the correct pattern.

### C. **PHP must have the `zip` extension.**
Many admin scripts use `ZipArchive`. Install with `apt install php8.1-zip` and **reload BOTH** PHP-FPM (`systemctl reload php8.1-fpm`) and `pm2 restart certxa` (because the Node process spawned the CLI PHP `php -S` before zip was loaded).

### D. **`.env` is gitignored — never commit secrets.**
Backups should go in `/apps/certxa-backups/`, not in the project tree. The Copilot worktree branch (`copilot/worktree-2026-05-13T03-16-21`) had a -51 line diff that removed `.env` from tracking — that was correct. If you ever see `.env` show up as a tracked file, run `git rm --cached .env` immediately.

### E. **The PHP server runs as root.** That's because PM2 launches Node as root, and PHP inherits the parent's user. This is fine on a single-tenant VPS but **you don't get permissions errors as a debugging signal** — if something fails, it's a real bug, not a chmod issue.

### F. **`compression` middleware must skip PHP and SSE routes.**
[`server/index.ts:226`](server/index.ts:226) explicitly bypasses compression for any path matched by `isPhpRoute()` and any SSE path. Don't remove this; gzip buffering breaks streaming for `admin-install.php` progress and the `/api/intelligence/demo/launch` SSE endpoint.

### G. **Static assets must be served BEFORE `registerRoutes`.**
[`server/index.ts:396-441`](server/index.ts:396) mounts `express.static` for `dist/public` first. If you move it after the API routes, the SPA catch-all will swallow `/assets/index-HASH.css` and return `index.html`, causing the infamous "Refused to apply style" MIME error. **Read [`VPS_DEPLOYMENT_GUIDE.md` §1](VPS_DEPLOYMENT_GUIDE.md) for the full diagnosis.**

### H. **`trust proxy = 1`, NOT `true`.**
[`server/auth.ts`](server/auth.ts:1) sets `app.set("trust proxy", 1)`. Setting it to `true` triggers `express-rate-limit`'s `ERR_ERL_PERMISSIVE_TRUST_PROXY` because every X-Forwarded-For becomes "trusted" and rate limits become bypassable.

### I. **`SSR_ROUTES` is an allowlist.**
Only the paths in [`server/index.ts:67`](server/index.ts:67) get server-side-rendered. Adding a new SEO landing page? Add the route both to `SSR_ROUTES` AND to [`client/src/entry-server.tsx`](client/src/entry-server.tsx).

### J. **Sandbox stores short-circuit ALL side effects.**
`locations.is_training_sandbox = true` means: no SMS, no email, no Stripe, no webhooks, no Google sync. Always check this flag before dispatching any external side effect. The training system clones a real store into a sandbox copy; the parent ID lives in `locations.sandbox_parent_store_id`.

### K. **Don't use `mockup-sandbox` as a template ID.**
[`/apps/certxa/artifacts/mockup-sandbox/`](artifacts/mockup-sandbox/) is a permanent shared shadcn/Tailwind playground used by the scraper-to-template flow. The `admin-install.php` script will silently overwrite it if you upload a ZIP whose detected ID becomes `mockup-sandbox`.

### L. **Drizzle errors with `mail_settings` columns.**
[`migrations/0002_add_mail_settings.sql`](migrations/0002_add_mail_settings.sql) was added later — older databases may be missing columns. Run `npm run db:push` to align Drizzle's view of the schema with the actual DB before debugging "syntax error at or near `=`" — that error from `[DemoReseed:err]` historically meant a column rename mid-flight.

### M. **PgBouncer transaction-pooling mode breaks prepared statements.**
If you connect via `:6432` (PgBouncer), make sure Drizzle / `pg` is configured for transaction pooling: don't hold long-lived prepared statements. The default `pg.Pool` works, but custom `client.query("PREPARE ...")` does not.

### N. **`npm install` on the VPS can be slow** because Puppeteer downloads Chromium. The dep is `puppeteer-core` (no auto-download) — but if anything in transitive deps pulls full `puppeteer`, the install bloats by ~300 MB. Check [`package.json`](package.json) for `puppeteer` (without `-core`) before merging dep updates.

### O. **Don't commit anything from `data/`, `logs/`, `dist/`, `node_modules/`, `.env*`.**
[`.gitignore`](.gitignore) covers these. PM2 logs in particular churn every minute; keep them untracked.

### P. **The `customers` table is being phased out in favor of `clients`.**
New code should use [`shared/schema/clients.ts`](shared/schema/clients.ts) and [`server/routes/clients.ts`](server/routes/clients.ts). [`scripts/lib/migrate-customers-to-clients.ts`](scripts/lib/migrate-customers-to-clients.ts) backfills old data. Don't add features to `customers` without also updating the new schema.

### Q. **Demo accounts auto-reseed every 90 minutes.**
Logging in as any of the 4 demo users (`nail-demo@`, `hair-demo@`, `spa-demo@`, `barber-demo@certxa.com` — password `demo1234`) starts a 90-min timer. Do not test long-running migrations on demo stores — they get nuked. See [`replit.md`](replit.md) and [`server/routes/intelligence-demo.ts`](server/routes/intelligence-demo.ts).

### R. **`output_buffering=Off` is set on the embedded PHP server.**
[`server/php-proxy.ts:71`](server/php-proxy.ts:71). Don't change this — without it, streaming pages like [`admin-install.php`](php/launchsite/admin-install.php:1) won't show progress steps until completion. PHP-FPM (port 8422) for the marketing site has its own `php.ini` with default buffering — that's fine because none of those pages stream.

### S. **`ACTIVE_GROUPS` env var hides marketing pages.**
[`replit.md`](replit.md) calls this out — set to `1`, `2`, or `3` to control which product groups appear on the marketing site. Used by feature-flag checks in [`php/`](php/) pages.

### T. **`index.html` must NEVER be cached.**
[`server/index.ts:524`](server/index.ts:524) sets `Cache-Control: no-cache, no-store, must-revalidate` on the SPA catch-all. If you cache `index.html`, users will keep referencing old hashed asset names from the previous build → 404s + blank pages until they hard-reload.

---

## 12. Common debugging recipes

### "I can't tell what's going wrong"
```bash
pm2 logs certxa --lines 200 --nostream | tail -100
pm2 logs certxa --err --lines 200 --nostream
curl -s http://localhost:8100/api/health | jq .
```

### "PHP page is returning 502 / blank"
1. Is the embedded PHP server up? `ss -ltnp | grep 8104`
2. Is PHP-FPM up (for `certxa.com` apex)? `systemctl status php8.1-fpm phpsite.service`
3. Manual proxy test: `curl -v http://127.0.0.1:8104/`
4. Check [`pm2 logs certxa --nostream | grep "PHP Proxy\|PHP Fatal"`](pm2)

### "Migration didn't apply"
```bash
psql "$DATABASE_URL" -c "\dt"           # see what tables exist
node_modules/.bin/tsx scripts/migrate.ts --dry-run    # simulate
node_modules/.bin/tsx scripts/migrate.ts              # actually apply
```

### "A scheduler isn't running"
Restart pm2 (`pm2 restart certxa`) and watch `pm2 logs certxa --nostream` for the specific bracketed startup line (e.g. `[Dunning] Billing dunning scheduler started`). If absent, the import in [`server/index.ts`](server/index.ts:1) async boot block has a problem — check the surrounding `try/catch`.

### "User logged in but `/api/auth/me` returns 401"
1. `SESSION_SECRET` must be set and consistent across restarts. Changing it invalidates all sessions.
2. The cookie is `Secure`. In dev (`NODE_ENV=development`), it's not, so HTTP works. In prod, must be HTTPS.
3. Reverse-proxy must forward `Cookie` header — verify Nginx config has `proxy_set_header Host $host; proxy_set_header X-Forwarded-Proto $scheme;` and `proxy_pass_request_headers on`.

### "Stripe webhook returns 400"
The webhook receiver in [`server/routes/billing-webhooks.ts`](server/routes/billing-webhooks.ts) requires the **raw** request body for signature verification. This is why [`server/index.ts:237`](server/index.ts:237) configures `express.json` with `verify: (req, _res, buf) => { req.rawBody = buf; }`. **Do not remove that.** Webhooks must be POSTed to a path that hits `app.use(express.json(...))` BEFORE the route handler reads `req.rawBody`.

### "I changed a TS file but the change isn't live"
You almost certainly forgot to rebuild:
```bash
npm run build && pm2 restart certxa
```

### "Build succeeds but app crashes at boot with TDZ error"
[`scripts/verify-build.ts`](scripts/verify-build.ts) is supposed to catch this — run `npm run build:check` to surface "Cannot access X before initialization" and SyntaxError before deploy. The `OK*` (with asterisk) result means the bundle parsed fine but the simulated browser hit something benign — that's a pass.

### "Subdomain points to the 'website not found' page even though my slug exists"
[`server/middleware/subdomain.ts`](server/middleware/subdomain.ts:1) only counts a `locations` row if `booking_slug IS NOT NULL`, and only counts a `subdomains` row if its `onboarding_submissions.status` is not `'inactive'` or `'pending_payment'`. Check those filters first.

---

## 13. How to add a new feature without breaking things

### New API endpoint
1. Pick the right module:
    - General → [`server/routes.ts`](server/routes.ts:1)
    - Domain-specific → [`server/routes/{domain}.ts`](server/routes/) and import in [`registerRoutes`](server/routes.ts:1)
2. Add the path to [`shared/routes.ts`](shared/routes.ts:1) so the client uses a constant.
3. Apply correct middleware chain: `attachAuthContext`, `requirePermission(...)`, `requireActiveTrial` if billing-gated.
4. Use `storage.*` for DB reads/writes when possible.
5. Return JSON; never `res.send(string)` from `/api/*` — the client expects JSON.

### New table
1. Add the Drizzle table to [`shared/schema.ts`](shared/schema.ts:1) (or a sub-schema if it's a coherent group).
2. Run `npm run db:push` (dev) to align local DB.
3. Write `migrations/NNNN_<description>.sql` for production. Make it idempotent (`CREATE TABLE IF NOT EXISTS`, `ALTER TABLE ... ADD COLUMN ... DEFAULT ... ON CONFLICT DO NOTHING` where appropriate).
4. Add types + helpers to [`server/storage.ts`](server/storage.ts:1) (interface + implementation).

### New React page
1. Create [`client/src/pages/{PageName}.tsx`](client/src/pages/).
2. Add the route to [`client/src/App.tsx`](client/src/App.tsx:1) `<Routes>` block.
3. If admin-only or subscriber-only, use the appropriate layout (e.g. `<AdminLayout>` for super-admin, page sits in [`client/src/pages/Admin/`](client/src/pages/Admin/)).
4. Add nav link in the relevant nav component.
5. **DO NOT add it to `SSR_ROUTES`** unless it's a public marketing page that needs SEO SSR.

### New PHP marketing page
1. Create `php/{slug}/default.php` (or `php/public/{slug}/default.php`).
2. The router auto-discovers it; no nginx changes.
3. `<?php require __DIR__ . '/../includes/header.php'; ?>` at top, footer at bottom for consistent chrome.
4. To make it indexable by Google, also add to the sitemap PHP file if there is one.

### New scheduler
1. Create `server/{name}-scheduler.ts` exporting `start{Name}Scheduler()`.
2. Use `setTimeout` / `setInterval`. **Always** check `is_training_sandbox` before side effects.
3. Import + call from the async boot block in [`server/index.ts`](server/index.ts:374-470).
4. Use a unique log tag like `[YourName] ...` so it's grep-able in `pm2 logs`.

---

## 14. Quick reference: ports, services, processes

| Port | Service | Owner |
|---|---|---|
| 80 | Nginx HTTP→HTTPS redirect | nginx |
| 443 | Nginx HTTPS terminator | nginx |
| 5000 | Node dev server | `npm run dev` only |
| 5432 | PostgreSQL direct | `postgres` user |
| 6432 | PgBouncer (optional) | `pgbouncer` |
| 8100 | Node Express (production) | PM2 process `certxa` |
| 8104 | PHP `php -S router.php` | child of `certxa` |
| 8422 | PHP-FPM marketing site | `phpsite.service` (systemd) |

Other PM2 processes on this VPS (NOT this codebase): `booking-backend`, `ccsc-api`, `customer-portal`, `lead-app-api`, `lead-app-web`, `project`, `review-app`. **Don't touch them when working on certxa.**

---

## 15. Where to read next

- [`VPS_DEPLOYMENT_GUIDE.md`](VPS_DEPLOYMENT_GUIDE.md) — full operational runbook (881 lines). The "BLANK PAGE" section at the top is the most-encountered prod issue.
- [`replit.md`](replit.md) — demo account creds, dev quickstart, stack list.
- [`SCHEMA_REVIEW.md`](SCHEMA_REVIEW.md) — table-by-table schema notes.
- [`AUDIT.md`](AUDIT.md) — security/architecture audit notes (30 KB).
- [`docs/deploy-guide.md`](docs/deploy-guide.md) — abbreviated deploy.
- [`docs/performance-optimization.md`](docs/performance-optimization.md) — caching, bundle size, query optimization.
- [`docs/STAFF_TRAINING_DEVELOPMENT_PLAN.md`](docs/STAFF_TRAINING_DEVELOPMENT_PLAN.md) — training mode internals.
- [`docs/intelligence-demo-testing.md`](docs/intelligence-demo-testing.md) — demo SSE flow + auto-reseed.
- [`docs/stripe-billing-infrastructure.md`](docs/stripe-billing-infrastructure.md) — Stripe wiring.
- [`docs/chatbot-dialer-api.md`](docs/chatbot-dialer-api.md) — chatbot/dialer integration.
- [`docs/elite-api-access.md`](docs/elite-api-access.md) — elite tier API key access.
- [`GOOGLE_BUSINESS_PROFILE_README.md`](GOOGLE_BUSINESS_PROFILE_README.md) — Google reviews integration.
- [`WIDGET_IMPLEMENTATION.md`](WIDGET_IMPLEMENTATION.md) — embeddable booking widget.
- [`php/launchsite/README.md`](php/launchsite/README.md) — LaunchSite specifics.
- [`php/launchsite/SCRAPER-GUIDE.md`](php/launchsite/SCRAPER-GUIDE.md) — competitor URL → template flow.

---

## 16. House rules for AI agents

1. **Never assume.** If you're not sure how a piece works, read the file. The codebase is too big to guess at safely.
2. **PHP changes don't need a rebuild.** TS/TSX changes do. SQL migration changes need both `npm run db:push` (or migrate) AND a server restart.
3. **Keep `.env` out of commits, always.** Move backups to `/apps/certxa-backups/`.
4. **When adding error messages**, surface what failed with WHY, not generic "permission denied" guesses. The pattern in [`admin-install.php`](php/launchsite/admin-install.php:642) (capture `error_get_last()`, capture cp stderr, show src + dest) is the gold standard.
5. **Sandbox stores must short-circuit ALL side effects.** Check `locations.is_training_sandbox` early and `return` before SMS/email/Stripe/webhooks.
6. **Don't break the SPA asset path.** Touching [`server/index.ts`](server/index.ts:1) ordering, [`server/php-proxy.ts:isPhpRoute`](server/php-proxy.ts:142), or [`subdomainMiddleware`](server/middleware/subdomain.ts:1) is high-risk — read them top-to-bottom first.
7. **When in doubt, run `/api/health`.** It tells you DB status, PHP status, env-var presence — without exposing values.
8. **Update this file** when the architecture changes. Future AIs (and humans) will thank you.

---

_Last updated: 2026-05-13. Regenerate with: read every file under `server/`, `client/src/`, `shared/`, `php/`, `scripts/` and the top-level `*.md` and update sections accordingly._
