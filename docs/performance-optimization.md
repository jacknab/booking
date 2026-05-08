# Certxa — Database Performance & Trial System

## Database Performance Optimization

### Overview

Certxa runs on PostgreSQL 16. The performance layer adds 136 compound, partial, and trigram GIN indexes across all 39 tables, an in-process TTL cache, cursor-based pagination, and a production-grade connection pool.

---

### Indexes (`migrations/0009_db_performance_indexes.sql`)

**Extensions enabled**
- `pg_trgm` — powers fuzzy trigram search on names, emails, and phone numbers
- `btree_gin` — enables GIN indexes on scalar columns for multi-column GIN use

**Appointments (8 indexes)**

| Index | Columns | Purpose |
|---|---|---|
| `idx_appt_store_date` | `(store_id, start_time DESC)` | Calendar load — most-used query |
| `idx_appt_store_date_status` | `(store_id, start_time DESC, status)` | Filtered calendar by status |
| `idx_appt_store_status` | `(store_id, status)` | Dashboard status counters |
| `idx_appt_customer_date` | `(customer_id, start_time DESC)` | Customer history page |
| `idx_appt_staff_date` | `(staff_id, start_time DESC)` | Staff schedule page |
| `idx_appt_store_active` | `(store_id, start_time DESC)` WHERE status IN (...) | Active-only partial index |
| `idx_appt_store_completed_date` | `(store_id, start_time DESC)` WHERE status = 'completed' | Analytics queries |
| `idx_appt_service_id` | `(service_id)` | Join from services |

**Customers — trigram fuzzy search**

| Index | Type | Purpose |
|---|---|---|
| `idx_customers_name_trgm` | GIN (trgm) | `ILIKE '%smith%'` on name |
| `idx_customers_email_trgm` | GIN (trgm) | Fuzzy email search |
| `idx_customers_phone_trgm` | GIN (trgm) | Fuzzy phone search |
| `idx_customers_store_id` | btree | Tenant isolation |
| `idx_customers_store_name` | `(store_id, name)` | Sorted name listing |

**Billing tables**

- `customer_billing_profiles` — 6 indexes covering salon_id, user_id, stripe_customer_id, account_status (partial: delinquent, account_hold)
- `stripe_subscriptions`, `stripe_customers` — customer_id, subscription_id lookup
- `stripe_webhook_events` — event_id (unique), partial index on unprocessed events
- `invoice_records`, `payment_transactions`, `refunds` — compound `(salon_id, created_at DESC)` for fast per-store billing history

**Staff**

- `idx_staff_name_trgm` — GIN trigram for staff name fuzzy search
- `idx_staff_permissions_gin` — GIN on JSONB permissions column
- `idx_staff_store_active` — partial index: `is_active = true`
- `idx_staff_store_id`, `idx_staff_email` — tenant isolation and login lookup

**All other tables** have indexes for FK columns (staff_services, staff_availability, service_categories, services, addons, products, gift_cards, sms_log, etc.) that were previously causing full-table scans on every join.

---

### Connection Pool (`server/db.ts`)

```
max: 20 connections
min: 2 (always warm)
idleTimeoutMillis: 30,000
connectionTimeoutMillis: 5,000
statement_timeout: 30s
```

**Slow query logging** — any query that takes more than 200ms is logged to console with the full SQL statement for investigation.

**Health check** — `dbHealthCheck()` is exported for use in `/api/health` endpoints and startup checks.

---

### In-Process Cache (`server/cache.ts`)

A lightweight TTL cache backed by a `Map`. No Redis dependency — swappable to ioredis with the same public API.

**Configuration**
- Max entries: 2,000 (LRU eviction)
- Cleanup interval: 60 seconds
- Default TTL: 120 seconds

**Billing namespace**

| Helper | Key pattern | TTL |
|---|---|---|
| `cache.billing.getProfile(salonId)` | `billing:profile:{id}` | 120s |
| `cache.billing.getSubscription(salonId)` | `billing:sub:{id}` | 120s |
| `cache.billing.getSeats(salonId)` | `billing:seats:{id}` | 60s |
| `cache.billing.invalidate(salonId)` | clears all three | — |

**Cache-aside pattern** — every read checks the cache first, populates on miss, and all write paths (cancel, resume, plan change, seat update) call `cache.billing.invalidate(salonId)`.

---

### Cursor Pagination (`server/lib/pagination.ts`)

Replaces offset/limit pagination which degrades on large tables.

```ts
import { encodeCursor, decodeCursor, buildCursorWhere, sliceByIdCursor } from "../lib/pagination";

// Encode an ID into a base64url opaque cursor
const cursor = encodeCursor(lastRow.id);

// Build a Drizzle WHERE clause from a cursor string
const where = buildCursorWhere(table.id, cursorString);

// For in-memory slicing (when filtering is already done)
const page = sliceByIdCursor(allRows, cursorString, limit);
```

Use cursor pagination on any endpoint that returns lists — invoices, audit logs, activity feeds, appointment history.

---

### Global CRM Search (`GET /api/manage/crm-search`)

Powered by the trigram GIN indexes. Searches customers, staff, services, appointments, and products in a single round-trip.

**Request**
```
GET /api/manage/crm-search?q=sarah&store_id=42
```

**Response**
```json
{
  "query": "sarah",
  "totalCount": 7,
  "results": {
    "customers": [...],
    "staff": [...],
    "services": [...],
    "appointments": [...],
    "products": [...]
  }
}
```

- Minimum query length: 2 characters
- Similarity threshold: 0.10 (catches typos and partial matches)
- Max 8 results per entity type
- Results sorted by trigram similarity score descending

---

## Free Trial System

### Overview

Every new account gets a **60-day free trial** starting the moment they register. No credit card required. When the trial ends:

- If the account has not subscribed to a paid plan → **account is deactivated**
- If the account subscribes at any point → **account is reactivated**

---

### Trial Setup

**On registration** (`POST /api/auth/register`)

`TrialService.setupTrialForUser(userId)` is called immediately after the user row is created. It writes:

| Field | Value |
|---|---|
| `users.subscription_status` | `'trial'` |
| `users.trial_started_at` | current UTC timestamp |
| `users.trial_ends_at` | current UTC + 60 days |

A belt-and-suspenders call also runs at the end of onboarding in case the register call was skipped (e.g. Google OAuth flow).

**Configurable** — the trial length is controlled by the `TRIAL_PERIOD_DAYS` environment variable. Default: 60.

---

### Trial Expiration

**Scheduler** (`server/services/trial-expiration.ts`) — runs every hour via `setInterval`.

For each user where `subscription_status = 'trial'` AND `trial_ends_at < now()`:

1. Check if the user has an active paid subscription → if yes, skip (the subscription takes over)
2. Set `users.subscription_status = 'expired'`
3. Set `locations.account_status = 'Inactive'` — **blocks booking system access**
4. Set `onboarding_submissions.status = 'inactive'` — **deactivates the LaunchSite webpage**
5. Clears the billing cache for that store
6. Logs a `trial.expired` billing activity record

**Booking system** — the existing `AccountStatusGate` component and `requireActiveTrial` middleware both check `account_status` and `subscription_status`. An `Inactive` location or `expired` subscription status will block access to the dashboard and all booking features.

**LaunchSite** — the subdomain middleware (`server/middleware/subdomain.ts`) now checks for `status = 'inactive'` and returns an HTTP 402 page explaining the account's trial has ended, instead of serving the user's website.

---

### Reactivation After Payment

When Stripe sends an `invoice.payment_succeeded` webhook:

1. `restoreAccount(salonId)` — clears billing suspension (`customer_billing_profiles.account_status → 'active'`)
2. `reactivateExpiredAccount(salonId)` — additionally:
   - Sets `locations.account_status = 'Active'`
   - Sets `users.subscription_status = 'active'`, clears `trial_ends_at`
   - Sets `onboarding_submissions.status = 'completed'` — **restores the LaunchSite**
   - Clears the billing cache

This means the moment a client adds a payment method and pays, all services come back online automatically — no manual intervention required.

---

### Status Flow

```
Register
  └─> subscriptionStatus = 'trial'
      trialStartedAt = now
      trialEndsAt = now + 60 days

Day 60 (no payment)
  └─> subscriptionStatus = 'expired'
      locations.accountStatus = 'Inactive'
      onboarding_submissions.status = 'inactive'
      [booking blocked] [LaunchSite returns 402]

Client pays (Stripe webhook)
  └─> subscriptionStatus = 'active'
      locations.accountStatus = 'Active'
      onboarding_submissions.status = 'completed'
      [all services restored]
```

---

### Files Changed

| File | Change |
|---|---|
| `server/services/trial-service.ts` | Default trial period changed from 14 → 60 days |
| `server/services/trial-expiration.ts` | New: expiration scheduler + reactivation logic |
| `server/auth.ts` | Calls `setupTrialForUser` on every registration |
| `server/routes.ts` | Belt-and-suspenders call at onboarding completion |
| `server/routes/billing-webhooks.ts` | `invoice.payment_succeeded` calls `reactivateExpiredAccount` |
| `server/middleware/subdomain.ts` | Blocks `status = 'inactive'` LaunchSites with 402 page |
| `server/index.ts` | Starts the hourly expiration scheduler at boot |
| `server/routes/crm-search.ts` | New: trigram-powered global CRM search endpoint |
| `server/cache.ts` | In-process TTL cache (billing namespace) |
| `server/lib/pagination.ts` | Cursor pagination utilities |
| `server/db.ts` | Production pool config + slow query logging |
| `migrations/0009_db_performance_indexes.sql` | 101 new indexes, applied to DB |
