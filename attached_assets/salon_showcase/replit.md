# Certxa Launchit Catalog

A PHP-based website design catalog for Certxa's **Launchit** product — salon owners browse professionally pre-built websites (Hair Salons, Barbershops, Nail Salons), pick a design, connect their domain, and go live. They can optionally edit any text.

## Run & Operate

- PHP catalog runs on **both port 5000 (webview preview) and port 8008 (canvas iframe)** — both launched in parallel by the "LaunchSite PHP Catalog" workflow
- `pnpm --filter @workspace/api-server run dev` — Express API server (port 8080)
- `pnpm --filter @workspace/db run push` — push Drizzle schema changes to Postgres
- To add a new React template: (1) extract zip to `artifacts/template-{id}/`, (2) install (`pnpm install`), (3) set `base` + `outDir` in `vite.config.ts`, (4) build (`pnpm run build`), (5) register in `data/templates.php` with `type: 'react'` + `react_path`, (6) add card to category page, (7) regenerate thumbnail.
- Required env: `DATABASE_URL` — Postgres connection string (used by API server AND PHP catalog PDO)

## Stack

- **Catalog frontend**: PHP 8.2 (built-in dev server), vanilla CSS, vanilla JS
- **React templates**: React 18 + Vite, built as static SPAs into `launchsite-php/templates/{id}/`
- **API server**: Node.js 24, Express 5, TypeScript 5.9
- **DB schema**: `lib/db/` — Drizzle ORM + `pg`, schema in `lib/db/src/schema/`
- DB: PostgreSQL + Drizzle ORM

## Where things live

- `launchsite-php/` — PHP catalog pages (served at `/launchsite/`)
  - `index.php` — Main catalog page with hero, category cards, How It Works
  - `hair-salons.php`, `barbershops.php`, `nail-salons.php` — Category template grids
  - `preview.php` — Full-page live preview; PHP templates = PHP-rendered site; React templates = full-page iframe
  - `select.php` — **4-step onboarding wizard** (business info → hours → booking → domain)
  - `data/templates.php` — **Central template data** (19 templates keyed by ID)
  - `config.php` — `BASE_PATH` constant
  - `router.php` — PHP built-in server router (strips `/launchsite` prefix; serves directory index.html for React SPAs)
  - `api/db.php` — PDO connection helper (parses `DATABASE_URL`)
  - `api/check-subdomain.php` — GET `?name=xxx` → `{available, name}` (real-time subdomain check)
  - `api/submit-onboarding.php` — POST JSON → inserts into `onboarding_submissions` + `subdomains`
  - `assets/css/style.css` — Catalog styles (Certxa dark navy/purple theme); wizard CSS appended at bottom
  - `assets/img/thumbs/` — JPEG thumbnails (900×620) for all template cards
  - `templates/` — Built React SPAs (e.g. `templates/luxury-nails-spa/`)
  - `generate-thumbs.php` — GD-based thumbnail generator (run from `launchsite-php/`)
- `lib/db/src/schema/onboarding.ts` — Drizzle tables: `onboarding_submissions`, `subdomains`
- `artifacts/template-{id}/` — Source for each React/Vite template
- `artifacts/api-server/` — Express backend (health route only; onboarding handled by PHP PDO directly)
- `artifacts/launchsite-catalog/` — Artifact registration (routes `/launchsite` → port 8008)

## Architecture decisions

- PHP built-in server with `router.php` strips the `/launchsite` prefix. Static files via `readfile()`; directory requests serve `index.html` (needed for React SPAs).
- Two template types coexist: `type: 'php'` (default) uses PHP-rendered preview in `preview.php`; `type: 'react'` uses an `<iframe>` pointing at `react_path` (`/launchsite/templates/{id}/`).
- **Onboarding uses PHP PDO directly** (not via the Node API) to avoid cross-origin complexity. `api/check-subdomain.php` + `api/submit-onboarding.php` connect to Postgres using `DATABASE_URL` env var. Same DB tables as Drizzle schema.
- Subdomain availability uses a `SELECT ... FOR UPDATE` in a transaction on final submit to prevent race conditions.
- Free accounts stored with `powered_by_certxa = true` and `plan = 'free'`. Custom domains stored with `domain_payment_status = 'pending'` and `status = 'pending_payment'`.
- `data/templates.php` is the single source of truth for all templates. Category pages define their own ID arrays for the card loop; `preview.php` reads from the central file.

## Product

**Launchit** — Pre-built professional salon websites. Salon owners: (1) pick a design, (2) connect their domain, (3) go live — optionally editing any text. Not a website builder. The site is fully built; text editing is optional.

Categories: Hair Salons, Barbershops, Nail Salons. 19 templates total (18 PHP-rendered + 1 React: luxury-nails-spa).

**Onboarding wizard** (select.php): Step 1 — business info (name, phone, email, address); Step 2 — business hours (7 days, open/close selects, closed toggle per day); Step 3 — online booking (locked, subscriber feature placeholder); Step 4 — domain (free `name.certxa.com` subdomain with live availability check, or custom domain at £15/year with DNS instructions).

## User preferences

- Service name: **Launchit** (not LaunchSite)
- PHP for the catalog frontend
- React/Vite for real uploaded templates (built as SPAs, iframed in preview)
- React for Part 2: domain setup, optional text editing, account management
- Certxa.com design: dark navy/purple background, purple + orange accents
- Files deployable to certxa.com/launchsite/ on VPS
- Nginx only (no Apache), PHP-FPM in production

## Gotchas

- Port 8080 is taken by the API server. PHP catalog uses port 8008.
- PHP router MUST serve static files via `readfile()`, NOT `return false`.
- React SPA router entry: `router.php` checks `is_dir($file)` and serves `index.html` — this must come BEFORE the static file check.
- Production deployment: Nginx handles routing — no router.php needed. Files go in `/var/www/certxa.com/launchsite/`.
- `preview.php` detects `$is_react` and branches: iframe for React, PHP-rendered site for PHP templates.
- Vite builds for React templates must use `pnpm run build` (not `pnpm run build:all` which runs tsc first).
- After any schema change: run `pnpm --filter @workspace/db run push` to sync Postgres.

## Pointers

- See the `pnpm-workspace` skill for workspace structure details
- DB schema: `lib/db/src/schema/onboarding.ts`
