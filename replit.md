# Certxa

Certxa is a full-stack booking and business management application for service professionals across various industries, handling appointments, services, staff, customers, products, and analytics.

## Demo Accounts — Revenue Intelligence

Four fully-seeded demo stores, each with ~430 clients and ~2,900 appointments covering all 8 Revenue Intelligence archetypes (power clients, gel regulars, monthly spa, occasional, DRIFTING ★, new, lapsed ★, no-show prone ★). All reset to a pristine state automatically 90 minutes after engines complete.

| Business Type  | Email                    | Password  | Store Name                  | Slug                          |
|----------------|--------------------------|-----------|-----------------------------|-------------------------------|
| Nail Salon     | nail-demo@certxa.com     | demo1234  | Luxe Nails & Spa            | luxe-nails-spa-demo           |
| Hair Salon     | hair-demo@certxa.com     | demo1234  | Elevate Hair Studio         | elevate-hair-studio-demo      |
| Spa / Wellness | spa-demo@certxa.com      | demo1234  | Serenity Spa & Wellness     | serenity-spa-wellness-demo    |
| Barbershop     | barber-demo@certxa.com   | demo1234  | Prime Cuts Barbershop       | prime-cuts-barbershop-demo    |

**Demo flow:**
1. Log in with any demo account above
2. Navigate to **Revenue Intelligence** → click **⚡ Launch Engines**
3. Watch all 8 engines compute live against the real booking history
4. The guided walkthrough tour auto-appears, stepping through all 10 tabs with context
5. A session timer in the header counts down 90 minutes, then a full reseed fires automatically

**Seed / reset / reseed commands (run from project root):**
```
npm run db:seed:nail-demo      # Seed Luxe Nails & Spa
npm run db:reseed:nail-demo    # Full wipe + reseed (safe to re-run)
npm run db:reset:nail-demo     # Wipe only

npm run db:seed:hair-demo      # Seed Elevate Hair Studio
npm run db:reseed:hair-demo    # Full wipe + reseed
npm run db:reset:hair-demo     # Wipe only

npm run db:seed:spa-demo       # Seed Serenity Spa & Wellness
npm run db:reseed:spa-demo     # Full wipe + reseed
npm run db:reset:spa-demo      # Wipe only

npm run db:seed:barber-demo    # Seed Prime Cuts Barbershop
npm run db:reseed:barber-demo  # Full wipe + reseed
npm run db:reset:barber-demo   # Wipe only
```

**Key files:**
- `scripts/lib/seed-demo-base.ts` — shared parameterized seeder (used by all 4 business types)
- `scripts/lib/reset-demo-base.ts` — shared reset logic
- `scripts/seed-*.ts` / `scripts/reset-*.ts` / `scripts/reseed-*.ts` — per-business scripts
- `server/routes/intelligence-demo.ts` — SSE launch, status, and auto-reseed orchestration
- `client/src/components/intelligence/DemoWalkthrough.tsx` — guided tour component (8 steps)
- `client/src/pages/DemoLaunchEngines.tsx` — engine animation page (all 4 demo emails allowed)

## Run & Operate

- **Run Dev**: `npm run dev` (Vite HMR, `PORT=5000`, binds to `0.0.0.0`)
- **Build**: `npm run build` (Vite client to `dist/public`, esbuild server to `dist/index.cjs`)
- **Run Prod**: `npm start` (runs `dist/index.cjs`)
- **DB Push**: `npm run db:push` (pushes Drizzle schema changes to PostgreSQL)

**Required Environment Variables:**
- `DATABASE_URL`: PostgreSQL connection string.
- `SESSION_SECRET`: Secret for `express-session`.
- `ACTIVE_GROUPS`: Controls visibility of product groups on marketing pages (1, 2, or 3).
- `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_REDIRECT_URI`: For Google Business Profile integration.
- `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_PHONE_NUMBER`: Configured per-store in admin settings for SMS.

## Stack

- **Frontend**: React 18, TypeScript, React Router v6, TanStack React Query, shadcn/ui (Radix UI), Tailwind CSS, Recharts, Framer Motion, React Hook Form, Zod.
- **Backend**: Node.js, TypeScript, Express.js.
- **Database**: PostgreSQL.
- **ORM**: Drizzle ORM with `drizzle-zod`.
- **Build Tool**: Vite (frontend), esbuild (backend).

## Where things live

- `client/`: React frontend source.
  - `client/src/pages/`: Route page components.
  - `client/public/regions/`: Statically generated SEO region pages.
- `server/`: Express backend source.
  - `server/index.ts`: Server entry point.
  - `server/routes/`: API route handlers.
- `shared/`: Code shared between client and server.
  - `shared/schema.ts`: Drizzle database schema & Zod validation schemas.
  - `shared/routes.ts`: API route contracts (paths, methods, Zod schemas).
- `migrations/`: Drizzle migration files.
- `script/build.ts`: Production build script.
- `server/seo-cities.ts`: Source of truth for SEO regional page generation cities.
- `server/onboarding-data.ts`: Templates for initial store setup.
- `client/public/seo-assets/seo.css`, `seo.js`: Shared assets for static SEO pages.

## Architecture decisions

- **Multi-Timezone Support**: All dates stored in UTC in DB; frontend handles conversion to/from store-specific IANA timezones.
- **Shared Schema & Route Contracts**: Database schema and API contracts are defined once in `shared/` with Zod, ensuring type-safety across frontend and backend.
- **SSR for SEO**: Marketing landing pages are Server-Side Rendered in production using Vite + `renderToString` for optimal SEO.
- **Static File Serving Priority**: Static assets are served before session/auth middleware to prevent blank pages if the database is temporarily unavailable.
- **Modular Data Hooks**: Frontend data fetching and mutations are organized into custom React hooks, scoped by `selectedStore.id`.

## Product

- **Booking & Management**: Appointments, services, staff, customers, products, inventory, POS, and analytics dashboard.
- **SEO Regional Pages**: Admin UI to generate static HTML pages for specific business types and cities (e.g., `dallas-tx-hair-salons`).
- **Dynamic Marketing Pages**: Landing pages for 20+ industries, `Pro Hub` for field services, and `Industries Hub`.
- **Certxa Queue**: Virtual check-in system with public check-in, TV display board, staff dashboard, and smart SMS dispatch based on geolocation.
- **Certxa Pro Dashboard**: Field service management (dispatch map, job management, estimates, invoices, CRM, crew management, reports).
- **Authentication & Onboarding**: Email/password auth, 4-step onboarding wizard for new stores.
- **SMS Notifications**: Twilio integration for booking confirmations, reminders, and review requests.
- **Google Business Profile Integration**: Connect, sync, and respond to Google reviews directly from the dashboard.
- **Additional Features**: Analytics, Waitlist, Gift Cards, Client Intake Forms, Loyalty Program.

## Revenue Intelligence System

A full revenue co-pilot layer built on top of the booking data. All logic lives in `server/intelligence/` and the schema in `shared/schema/intelligence.ts`. The orchestrator runs every 6 hours automatically.

**Backend modules (`server/intelligence/`):**
- `cadence.ts` — Computes each client's average visit cadence (e.g. every 5 weeks) and flags when they've drifted 20%+ past it
- `ltv.ts` — 12-month and all-time LTV, avg ticket, visit count, LTV score
- `churn.ts` — Multi-factor churn risk score (0–100) and label (low/medium/high/critical) based on cadence overdue %, visit history, no-show rate
- `dead-seats.ts` — Finds chronically underbooked day/hour slots and estimates lost revenue potential
- `no-show.ts` — Scores each upcoming appointment for no-show risk using client history, time of day, and booking lead time
- `rebooking-rates.ts` — Per-stylist rebooking rate with trend (up/down/stable) vs prior 90-day period
- `cancellation-recovery.ts` — When a cancellation hits, finds top candidates from waitlist + lapsed clients who've taken that service
- `growth-score.ts` — Single 0–100 business health score composed of retention, rebooking, utilization, revenue, new client components
- `revenue-leakage.ts` — Monthly report: lapsed clients, estimated lost revenue, recovery potential
- `revenue-forecast.ts` — Forward-looking revenue estimate based on drift rates and LTV
- `drift-recovery.ts` — Automated winback SMS campaign for drifting clients (rate-limited to 1 message/30 days)
- `orchestrator.ts` — Runs all of the above for all stores every 6 hours; also sends rebooking nudge SMSes

**DB tables (`shared/schema/intelligence.ts`):**
- `client_intelligence` — Per-client computed row: cadence, LTV, churn risk, drift status, winback tracking
- `staff_intelligence` — Per-stylist: rebooking rate, trend, revenue, no-show count
- `intelligence_interventions` — Log of every automated SMS sent (winback, nudge, cancellation recovery)
- `growth_score_snapshots` — Historical daily growth score for trend charting
- `dead_seat_patterns` — Detected underbooked time slots with utilization %

**API routes (`/api/intelligence/`):**
- `GET /dashboard` — Summary KPIs, at-risk clients, score history, recent interventions
- `GET /growth-score` — Full breakdown + 30-day history
- `GET /revenue-leakage` — Monthly lapsed client report with recoverable amounts
- `GET /dead-seats` — Underbooked slot analysis with fill campaign candidates
- `GET /no-show-risks` — Tomorrow's appointments ranked by no-show probability
- `GET /rebooking-rates` — Live + cached per-stylist rebooking stats
- `GET /at-risk-clients` — Clients with churn score ≥ 25, sorted by LTV
- `GET /staff-performance` — Enriched staff table: rebooking, revenue, trend, no-show rate
- `GET /service-performance` — Services ranked by revenue, no-show rate, revenue/min
- `GET /price-optimization` — Suggestions to raise, discount, or require deposit per service
- `GET /booking-heatmap` — Day×hour heatmap of appointment volume (90d)
- `GET /daily-digest` — Top 5 prioritized action items for today
- `GET /forecast` — Revenue forecast based on drift/LTV data
- `GET /client/:customerId` — Single-client intelligence + intervention history
- `GET /campaigns/segments` — Audience counts for at-risk, drifting, high-LTV, birthday segments
- `GET /campaigns/export` — CSV export of any segment
- `GET /cancellation-recovery/:appointmentId` — Top 3 candidates to fill a cancelled slot
- `POST /winback` — Send a manual winback SMS to one client
- `POST /winback-campaign` — Run the full automated drift recovery for a store
- `POST /fill-slot` — Send a cancellation recovery SMS to one candidate
- `POST /campaigns/send` — Bulk SMS campaign to a segment (personalized with {name})
- `POST /refresh` — Trigger an on-demand intelligence recompute for a store

**Frontend:** `client/src/pages/Intelligence.tsx` — Full Revenue Intelligence dashboard with 10 tabs: Overview, At-Risk Clients, Revenue Leakage, Dead Seats, No-Show Risks, Rebooking Rates, Staff, Forecast, Campaigns, Services.

## User preferences

Preferred communication style: Simple, everyday language.

## Gotchas

- API routes like `reference-data` and `generate-all` must be registered **before** routes with `/:id` parameters to prevent incorrect parameter capture.
- SSR bundle outputs as `.cjs` because `package.json` has `"type": "module"`.
- Static file serving is registered **before** session/auth middleware to avoid asset loading issues if DB is down.
- Mag-stripe test payments are blocked unless the Stripe secret key starts with `sk_test_`.

## Pointers

- **UI Components**: [shadcn/ui documentation](https://ui.shadcn.com/)
- **State Management**: [TanStack Query documentation](https://tanstack.com/query/latest)
- **Form Validation**: [React Hook Form](https://react-hook-form.com/) and [Zod](https://zod.dev/)
- **ORM**: [Drizzle ORM documentation](https://orm.drizzle.team/)
- **Styling**: [Tailwind CSS documentation](https://tailwindcss.com/)
- **Timezone Handling**: [date-fns-tz documentation](https://date-fns.org/docs/date-fns-tz)
- **Twilio API**: [Twilio documentation](https://www.twilio.com/docs)
- **Google Business Profile API**: [Google My Business API documentation](https://developers.google.com/my-business)