# Certxa

Certxa is a full-stack booking and business management application for service professionals across various industries, handling appointments, services, staff, customers, products, and analytics.

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

- **Frontend**: React 18, TypeScript, Wouter, TanStack React Query, shadcn/ui (Radix UI), Tailwind CSS, Recharts, Framer Motion, React Hook Form, Zod.
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