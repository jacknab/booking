# Project Guide

## Overview

This is a **salon/spa management application** (a Zolmi clone) — a full-stack web app for managing salon businesses. It handles appointments, services, staff, customers, products/inventory, and provides a dashboard with analytics. The app features a landing page for unauthenticated users and a full management dashboard behind authentication.

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

### Authentication & Onboarding
- **Method**: Simple email/password authentication
- **Password Hashing**: bcryptjs
- **Session Store**: PostgreSQL via `connect-pg-simple`
- **Session Management**: `express-session`
- **Auth File**: `server/auth.ts` — register, login, logout routes + isAuthenticated middleware
- **Frontend**: `/auth` page with login/register toggle, `useAuth()` hook in `client/src/hooks/use-auth.ts`
- **Onboarding**: After registration, new users are directed to `/onboarding` where they select a business type (Hair Salon, Nail Salon, Spa, Barbershop). This auto-creates the store with categories, services, and addons from templates defined in `server/onboarding-data.ts`. The `onboardingCompleted` flag on the user controls redirect logic. Existing users with stores are auto-marked as onboarding completed.

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

## External Dependencies

- **PostgreSQL**: Required. Connection via `DATABASE_URL` environment variable
- **Session Secret**: Uses `SESSION_SECRET` environment variable for express-session
- **Twilio**: Optional. Per-store SMS credentials configured in admin SMS Settings page
- **Google Fonts**: Outfit, DM Sans, Fira Code, Geist Mono (loaded via CDN in index.html and CSS imports)
- **Vite**: Build tool with React plugin for frontend bundling