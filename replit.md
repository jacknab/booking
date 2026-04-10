# Project Guide

## Overview

This is the **Certxa** platform — a full-stack booking and business management app for service pros across all industries (salons, spas, home services, gig work, and trades). It handles appointments, services, staff, customers, products/inventory, and provides a dashboard with analytics. The app has a public marketing section targeting 30+ industries and a full management dashboard behind authentication.

**Key public pages:**
- `/` — Main landing page (salon/spa focus with business type carousel)
- `/industries` — Industries Hub (all 30+ supported service categories in a grid)
- `/handyman`, `/house-cleaning`, `/lawn-care`, `/dog-walking`, `/tutoring` — Gig industry landing pages
- `/barbers`, `/hair-salons`, `/nails`, `/spa`, `/estheticians`, `/tattoo`, `/haircuts`, `/groomers`, `/ride-service`, `/snow-removal` — Beauty & personal service landing pages

**Key dashboard pages:** `/dashboard`, `/calendar`, `/services`, `/staff`, `/customers`, `/products`, `/analytics`, `/reports`, `/commission-report`, `/pos`, `/loyalty`, `/gift-cards`, `/reviews`, `/waitlist`, `/intake-forms`

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter (lightweight client-side router)
- **State/Data Fetching**: TanStack React Query for server state management
- **UI Components**: shadcn/ui (new-york style) built on Radix UI primitives
- **Styling**: Tailwind CSS with CSS custom properties for theming (salon-inspired teal/coral palette)
- **Fonts**: Outfit (display/headings) and DM Sans (body text)
- **Charts**: Recharts for dashboard analytics
- **Animations**: Framer Motion for page transitions
- **Forms**: React Hook Form with Zod resolvers for validation
- **Build Tool**: Vite with React plugin

### Backend
- **Runtime**: Node.js with TypeScript (tsx for dev, esbuild for production)
- **Framework**: Express.js
- **HTTP Server**: Node's native `http.createServer` wrapping Express
- **API Design**: RESTful JSON API under `/api/*` prefix. Route definitions are shared between client and server via `shared/routes.ts`, which defines paths, methods, input schemas, and response schemas using Zod.

### Data Storage
- **Database**: PostgreSQL
- **ORM**: Drizzle ORM with `drizzle-zod` for schema-to-validation integration
- **Schema Location**: `shared/schema.ts` (shared between client and server)
- **Migrations**: Drizzle Kit with `db:push` command
- **Connection**: `node-postgres` (pg) Pool via `DATABASE_URL` environment variable

### Database Tables
- `stores` — Multi-store support (name, timezone, address, phone, userId for ownership)
- `services` — Salon services (name, duration, price, category, linked to store)
- `staff` — Team members (name, role, color for calendar, linked to store)
- `customers` — Client records (name, contact info, notes, linked to store)
- `appointments` — Bookings (date, time, status, payment details, linked to customer/staff/service/store)
- `products` — Retail inventory (name, price, stock, linked to store)
- `cashDrawerSessions` — Cash drawer shift sessions (storeId, openedAt, closedAt, openingBalance, closingBalance, status, openedBy, closedBy, notes)
- `drawerActions` — Actions within a drawer session (sessionId, type [open_drawer/close_drawer/cash_in/cash_out], amount, reason, performedBy, performedAt)
- `smsSettings` — Per-store Twilio SMS configuration (credentials, enabled flags for confirmation/reminder/review, message templates, Google review URL)
- `smsLog` — SMS message log (storeId, appointmentId, phone, messageType, status, twilioSid, sentAt)
- `users` — Auth users (email/password, onboardingCompleted flag)
- `sessions` — Session storage for authentication
- `waitlist` — Per-store waitlist entries (customerName, phone, email, requestedService, requestedDate, requestedTime, notes, status, notifiedAt)
- `giftCards` — Issued gift cards (code, storeId, originalAmount, remainingBalance, issuedToName, issuedToEmail, expiresAt, isActive, notes)
- `giftCardTransactions` — Ledger of gift card use (giftCardId, appointmentId, type [issue/redeem/adjustment], amount, balanceBefore, balanceAfter, notes)
- `intakeForms` — Custom client intake forms (storeId, name, description, isActive, fields array with label/type/required/options)
- `intakeFormResponses` — Client responses to intake forms (formId, appointmentId, customerName, customerEmail, responses jsonb)
- `loyaltyTransactions` — Point ledger per customer (storeId, customerId, appointmentId, type [earn/redeem/manual], points, balanceBefore, balanceAfter, notes)
- Extended `customers` with: loyaltyPoints, birthday, marketingOptIn
- Extended `appointments` with: recurrenceRule, depositRequired, giftCardId, loyaltyPointsEarned

### Authentication & Onboarding
- **Method**: Simple email/password authentication
- **Password Hashing**: bcryptjs
- **Session Store**: PostgreSQL via `connect-pg-simple`
- **Session Management**: `express-session`
- **Auth File**: `server/auth.ts` — register, login, logout routes + isAuthenticated middleware
- **Frontend**: `/auth` page with login/register toggle, `useAuth()` hook in `client/src/hooks/use-auth.ts`
- **Onboarding**: 4-step wizard: (1) Business type selection, (2) Business info (name, address, phone, auto-detected timezone), (3) Business hours setup with per-day toggles, (4) Staff count with name inputs. Creates store, business hours, template services/categories/addons, staff with availability matching business hours, and auto-assigns all services to staff. Templates in `server/onboarding-data.ts` are production-ready with comprehensive categories:
  - **Nail Salon**: Manicures (5 services), Pedicures (5), Nail Enhancements (4), Spa Services (6), Kids Services (3), Nail Repair (5) — with 15+ addons mapped to applicable services
  - **Hair Salon**: Haircuts (6), Color (7), Treatments (5), Styling (5), Texture (2) — with addons like Olaplex, Deep Conditioning, Toner
  - **Spa**: Massage (9), Facials (7), Body Treatments (4), Waxing (12), Packages (3) — with addons like Aromatherapy, LED, Cupping
  - **Barbershop**: Haircuts (7), Beard & Shave (4), Combos (3), Grooming (6) — with addons like Hot Towel, Beard Oil, Design/Line Up

### Project Structure
```
client/           — React frontend
  src/
    components/   — UI components (shadcn/ui in ui/, layout components in layout/)
    hooks/        — Custom React hooks (data fetching, auth, mobile detection)
    lib/          — Utilities (queryClient, auth-utils, cn helper)
    pages/        — Route page components
server/           — Express backend
  index.ts        — Server entry point
  routes.ts       — API route handlers
  storage.ts      — Database access layer (IStorage interface + implementation)
  db.ts           — Database connection setup
  static.ts       — Production static file serving
  vite.ts         — Dev server Vite middleware
  auth.ts         — Email/password authentication
  sms.ts          — Twilio SMS service (booking confirmations, reminders, review requests, scheduler)
shared/           — Code shared between client and server
  schema.ts       — Drizzle database schema + Zod insert schemas
  routes.ts       — API route contracts (paths, methods, input/output schemas)
  models/auth.ts  — Auth-related table definitions
migrations/       — Drizzle migration files
script/build.ts   — Production build script (Vite + esbuild)
```

### Multi-Timezone Architecture
- Each store has a `timezone` field (IANA timezone string, e.g. "America/New_York")
- All dates are stored in UTC in the database
- Frontend converts UTC to store-local time for display using `date-fns-tz` (formatInTimeZone, toZonedTime)
- Appointment creation converts store-local input to UTC using `fromZonedTime` before sending to the API
- `StoreProvider` context manages the currently selected store; all data hooks filter by `selectedStore.id`
- Sidebar shows a store switcher dropdown and timezone indicator
- Calendar and Dashboard display times in the selected store's timezone
- Switching stores resets calendar date to "today" in the new store's timezone

### Key Design Patterns
1. **Shared Schema**: Database schema in `shared/schema.ts` is used by both server (for DB operations) and client (for form validation via `drizzle-zod`)
2. **Shared Route Contracts**: `shared/routes.ts` defines API contracts with Zod schemas, ensuring type safety across the stack
3. **Storage Interface**: `server/storage.ts` defines an `IStorage` interface, abstracting database operations for potential swapping
4. **Custom Hooks Pattern**: Each data domain (appointments, services, staff, etc.) has its own hook file with CRUD mutations and queries. All hooks use `useSelectedStore()` to scope queries by store.
5. **Dev/Prod Split**: In dev, Vite middleware serves the frontend with HMR. In production, pre-built static files are served from `dist/public`

### Business-Type Landing Pages
Marketing landing pages targeting specific industries, each with a hero video background, feature grid, testimonials, comparison table, and CTA:

| Business Type | Route | File |
|---|---|---|
| Barbershops | `/barbers` | `BarberLanding.tsx` |
| Day Spas | `/spa` | `SpaLanding.tsx` |
| Nail Salons | `/nails` | `NailSalonLanding.tsx` |
| Tattoo Artists | `/tattoo` | `TattooLanding.tsx` |
| Walk-In Shops | `/haircuts` | `WalkInLanding.tsx` |
| Hair Salons | `/hair-salons` | `HairSalonLanding.tsx` |
| Pet Groomers | `/groomers` | `PetGroomerLanding.tsx` |
| Estheticians | `/estheticians` | `EstheticianLanding.tsx` |
| House Cleaning | `/house-cleaning` | `HouseCleaningLanding.tsx` |
| Handyman | `/handyman` | `HandymanLanding.tsx` |
| Ride Service | `/ride-service` | `RideServiceLanding.tsx` |
| Snow Removal | `/snow-removal` | `SnowRemovalLanding.tsx` |
| Lawn Care | `/lawn-care` | `LawnCareLanding.tsx` |
| Tutoring | `/tutoring` | `TutoringLanding.tsx` |
| Dog Walking | `/dog-walking` | `DogWalkingLanding.tsx` |

Each page has a matching `*HeroVideo.tsx` component in `client/src/pages/components/` that cycles through Pexels video clips with Unsplash image fallbacks.

### Competitor Features (Added)
Five features researched from top platforms (Fresha, Vagaro, Square Appointments, Acuity, Mindbody) and implemented:

| Feature | Route | Page | Backend Routes |
|---|---|---|---|
| Analytics Dashboard | `/analytics` | `Analytics.tsx` | Uses existing `/api/appointments` + `/api/staff` |
| Waitlist System | `/waitlist` | `Waitlist.tsx` | `GET/POST/PUT/DELETE /api/waitlist` |
| Gift Cards / Vouchers | `/gift-cards` | `GiftCards.tsx` | `GET/POST /api/gift-cards`, `/api/gift-cards/check/:code`, `/api/gift-cards/redeem`, `PUT /api/gift-cards/:id` |
| Client Intake Forms | `/intake-forms` | `IntakeForms.tsx` | `GET/POST/PUT/DELETE /api/intake-forms`, `GET/POST /api/intake-forms/responses` |
| Loyalty Program | `/loyalty` | `Loyalty.tsx` | `GET /api/loyalty/transactions`, `POST /api/loyalty/adjust`, `GET /api/loyalty/customer/:id` |

Sidebar uses grouped `navGroups` structure (OVERVIEW / CLIENTS / BUSINESS / FINANCE) in `Sidebar.tsx`.

### Build & Run
- **Dev**: `npm run dev` — runs tsx with Vite dev middleware
- **Build**: `npm run build` — Vite builds client to `dist/public`, esbuild bundles server to `dist/index.cjs`
- **Production**: `npm start` — runs the bundled `dist/index.cjs`
- **DB Push**: `npm run db:push` — pushes schema changes to PostgreSQL

### SMS Notifications (Twilio)
- **Service File**: `server/sms.ts` — Twilio integration for sending SMS
- **Configuration**: Per-store via `sms_settings` table (Twilio credentials, message templates, toggle per type)
- **Message Types**: booking_confirmation (on new booking), reminder (24h before appointment), review_request (30min after completion)
- **Scheduler**: Runs every 5 minutes checking for appointments needing reminders. Deduplicates via `sms_log` table.
- **Admin Page**: `/sms-settings` — Configure Twilio creds, enable/disable message types, customize templates, send test SMS, view log
- **Template Variables**: `{customerName}`, `{storeName}`, `{appointmentDate}`, `{appointmentTime}`, `{serviceName}`, `{reviewUrl}`

### Google Business Profile Integration
Business owners can connect their Google Business Profile to sync and respond to customer reviews directly from the dashboard.

**Database Tables:**
- `google_business_profiles` — OAuth tokens + connection info per store (storeId FK, accessToken, refreshToken, tokenExpiresAt, googleAccountEmail, businessName, businessAccountId, locationResourceName, locationId, isConnected, lastSyncedAt)
- `google_reviews` — Synced reviews (storeId, googleReviewId, customerName, rating, reviewText, reviewCreateTime, responseStatus)
- `google_review_responses` — Draft/published responses (googleReviewId, storeId, responseText, responseStatus, createdBy)

**Key Files:**
- `server/google-business-api.ts` — `GoogleBusinessAPIManager` class (OAuth2, accounts, locations, reviews via direct HTTP to `mybusinessreviews.googleapis.com`), `syncGoogleReviews()`, `publishReviewResponse()`
- `client/src/components/GoogleBusinessProfileSetup.tsx` — 4-step OAuth wizard (Connect → Select Account → Select Location → Connected)
- `client/src/components/GoogleReviewsManager.tsx` — Review list with stats, filters, and sync button
- `client/src/components/ReviewResponseDialog.tsx` — Per-review response dialog with draft → publish workflow
- `client/src/pages/GoogleBusiness.tsx` — Tabbed page (Connection + Reviews) at `/google-business`

**OAuth Flow:**
1. User clicks "Connect Google Business Profile" → GET `/api/google-business/auth-url` (CSRF state stored in session)
2. Browser redirects to Google consent screen
3. Google redirects back to `/google-business?code=...&state=...`
4. Frontend component detects `?code=` and POSTs to `/api/google-business/callback` (code exchange + upsert profile)
5. User selects business account → POST `/api/google-business/locations` (list locations)
6. User selects location → POST `/api/google-business/connect-location` (saves businessName + location)

**APIs Used:**
- `mybusinessaccountmanagement v1` — List business accounts (via googleapis npm package)
- `mybusinessbusinessinformation v1` — List locations (via googleapis npm package)
- `mybusinessreviews.googleapis.com/v1` — List/reply/delete reviews (direct HTTP via `oauth2Client.request()` — NOT in googleapis npm package)

**Environment Variables Required:**
- `GOOGLE_CLIENT_ID` — Google OAuth2 client ID
- `GOOGLE_CLIENT_SECRET` — Google OAuth2 client secret
- `GOOGLE_REDIRECT_URI` — Must match registered URI in Google Cloud Console (e.g., `https://<domain>/google-business`)

**Route:** `/google-business` (sidebar: "Google Reviews")

## Production VPS Deployment Notes

### Middleware order fix (important)
Static file serving (`server/static.ts`) is intentionally registered **before** the session/auth middleware in `server/index.ts`. This ensures CSS, JS, and image assets are served directly even if the database session store has a momentary connection issue at startup. Without this order, the PostgreSQL session middleware would intercept every request (including asset requests) and, if it encountered a DB error, would return `application/json` for CSS/JS files — causing a blank page.

The SPA catch-all in `server/static.ts` explicitly skips `/api/*` and `/ws` paths so they fall through to the API route layer.

### Re-deploying on VPS after code changes
1. Pull latest code to the VPS
2. `npm run build` (rebuild client + server bundle)
3. `pm2 restart certxa` (reload the running process)

## External Dependencies

- **PostgreSQL**: Required. Connection via `DATABASE_URL` environment variable
- **Session Secret**: Uses `SESSION_SECRET` environment variable for express-session
- **Twilio**: Optional. Per-store SMS credentials configured in admin SMS Settings page
- **Google OAuth**: Required for Google Business Profile integration. `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_REDIRECT_URI` env vars needed.
- **Google Fonts**: Outfit, DM Sans, Fira Code, Geist Mono (loaded via CDN in index.html and CSS imports)
- **Vite**: Build tool with React plugin for frontend bundling