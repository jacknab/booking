# Certxa Stripe Billing Infrastructure

**Version:** 1.0 — May 2026  
**Scope:** All subscription billing, payment processing, webhook handling, refunds, and admin tooling.  
**Relevant for:** Agent system database integration, future billing extensions, third-party automation.

---

## Table of Contents

1. [Overview](#overview)
2. [Environment Variables](#environment-variables)
3. [Database Schema](#database-schema)
4. [API Endpoints](#api-endpoints)
5. [Server-Side Service Functions](#server-side-service-functions)
6. [Webhook Events](#webhook-events)
7. [Data Flow Diagrams](#data-flow-diagrams)
8. [Frontend Routes](#frontend-routes)
9. [Agent System Integration Guide](#agent-system-integration-guide)
10. [Plan Codes Reference](#plan-codes-reference)
11. [Error Handling & Resilience](#error-handling--resilience)
12. [Security Notes](#security-notes)

---

## Overview

Certxa uses Stripe for all subscription billing. The infrastructure is fully server-side with:

- **Checkout Sessions** for new subscriptions (Stripe-hosted payment page)
- **Customer Portal** for self-service card updates, invoice downloads
- **Webhooks** for real-time sync of all payment events into the local database
- **Local mirrors** of all Stripe data (invoices, subscriptions, charges) for fast queries without hitting the Stripe API
- **Admin dashboard** with full billing visibility, refund tooling, and per-salon timelines
- **Activity logs** for every billing event (auditable, timestamped, severity-tagged)

The billing code lives in:

```
server/
  services/billing-service.ts      ← Core Stripe service layer
  routes/billing.ts                ← REST API (30+ endpoints)
  routes/billing-webhooks.ts       ← Stripe webhook handler

shared/schema/billing.ts           ← All 13 Drizzle table definitions

client/src/pages/
  manage/BillingPage.tsx           ← Customer-facing billing page
  Admin/BillingDashboard.tsx       ← Admin billing dashboard
  Admin/BillingPlansManager.tsx    ← Admin plan editor
```

---

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `STRIPE_SECRET_KEY` | Yes (for payments) | Stripe secret key. Use `sk_test_...` for test mode, `sk_live_...` for production. |
| `STRIPE_TEST_SECRET_KEY` | No | Fallback test key. If set and `STRIPE_SECRET_KEY` is not, this is used. |
| `STRIPE_WEBHOOK_SECRET` | Yes (for webhooks) | Signing secret from the Stripe webhook endpoint config (`whsec_...`). |
| `STRIPE_TEST_WEBHOOK_SECRET` | No | Fallback webhook secret for test environments. |
| `DATABASE_URL` | Yes | PostgreSQL connection string. |
| `SESSION_SECRET` | Yes | Express session secret. |

The billing service gracefully degrades when `STRIPE_SECRET_KEY` is not set — the `/api/billing/status` endpoint returns `{ configured: false }` and all Stripe-calling endpoints return HTTP 503.

---

## Database Schema

All tables are defined in `shared/schema/billing.ts` and re-exported from `shared/schema.ts`.

### `billing_plans`

Master plan catalog. One row per plan tier + interval combination.

| Column | Type | Notes |
|---|---|---|
| `id` | serial PK | Auto-increment |
| `code` | text UNIQUE | Stable identifier. e.g. `starter`, `professional_annual` |
| `name` | text | Display name |
| `description` | text | Short description |
| `price_cents` | decimal | Price in cents. Monthly plans: monthly cost. Annual: full year cost. |
| `contacts_min` | decimal | Minimum contacts included (usually 0) |
| `contacts_max` | decimal | Maximum contacts (null = unlimited) |
| `stripe_price_id` | text | Stripe Price ID (`price_...`). Set after Stripe setup. |
| `stripe_product_id` | text | Stripe Product ID (`prod_...`). Auto-set on first checkout. |
| `interval` | text | `month` or `year` |
| `sms_credits` | decimal | Included SMS credits per billing period |
| `currency` | text | `usd` default |
| `active` | boolean | Only active plans are shown in checkout |
| `features_json` | jsonb | `{ features: string[], highlight: bool, badge?: string }` |
| `created_at` | timestamp | |
| `updated_at` | timestamp | |

**Plan codes (seeded):** `free`, `starter`, `professional`, `growth`, `enterprise`, plus `_annual` variants for paid tiers.

---

### `stripe_customers`

Maps a Certxa user + store to a Stripe Customer ID.

| Column | Type | Notes |
|---|---|---|
| `id` | serial PK | |
| `user_id` | text FK → users.id | |
| `customer_id` | text UNIQUE | Stripe `cus_...` ID |
| `store_number` | integer FK → locations.id UNIQUE | One Stripe customer per store |
| `created_at` | timestamp | |
| `updated_at` | timestamp | |
| `deleted_at` | timestamp | Soft delete |

**Key behavior:** `getOrCreateStripeCustomer(salonId)` is idempotent — it creates the customer in Stripe the first time and returns the cached ID thereafter.

---

### `stripe_subscriptions`

Low-level mirror of the Stripe Subscription object. Updated by webhooks.

| Column | Type | Notes |
|---|---|---|
| `id` | serial PK | |
| `customer_id` | text UNIQUE | Stripe `cus_...` |
| `subscription_id` | text | Stripe `sub_...` |
| `price_id` | text | Active Stripe Price ID |
| `current_period_start` | bigint | Unix timestamp |
| `current_period_end` | bigint | Unix timestamp |
| `cancel_at_period_end` | boolean | |
| `payment_method_brand` | text | e.g. `visa`, `mastercard` |
| `payment_method_last4` | text | Last 4 digits |
| `status` | text | Stripe subscription status |
| `created_at` | timestamp | |
| `updated_at` | timestamp | |
| `deleted_at` | timestamp | |

---

### `subscriptions`

High-level Certxa record linking a store to a plan. This is the primary table to query for "what plan is this store on?".

| Column | Type | Notes |
|---|---|---|
| `id` | serial PK | |
| `store_number` | integer FK → locations.id | |
| `plan_code` | text FK → billing_plans.code | |
| `stripe_customer_id` | text | |
| `stripe_subscription_id` | text | |
| `status` | text | Mirrors Stripe: `active`, `trialing`, `past_due`, `canceled`, `unpaid` |
| `current_period_end` | text | ISO date string |
| `interval` | text | `month` or `year` |
| `price_id` | text | |
| `cancel_at_period_end` | integer | 0 or 1 |
| `payment_method_brand` | text | |
| `payment_method_last4` | text | |
| `created_at` | timestamp | |
| `updated_at` | timestamp | |

**Agent query pattern:**
```sql
SELECT s.*, p.name, p.price_cents, p.features_json
FROM subscriptions s
JOIN billing_plans p ON p.code = s.plan_code
WHERE s.store_number = $1
  AND s.status IN ('active', 'trialing')
LIMIT 1;
```

---

### `stripe_orders`

Records completed checkout sessions (one-time and subscription purchases).

| Column | Type | Notes |
|---|---|---|
| `id` | serial PK | |
| `checkout_session_id` | text | Stripe `cs_...` |
| `payment_intent_id` | text | Stripe `pi_...` |
| `customer_id` | text | Stripe `cus_...` |
| `amount_subtotal` | bigint | Cents |
| `amount_total` | bigint | Cents |
| `currency` | text | |
| `payment_status` | text | |
| `status` | text | `pending`, `completed` |
| `created_at` | timestamp | |
| `updated_at` | timestamp | |

---

### `scheduled_plan_changes`

Queued future plan transitions (e.g. downgrade at period end).

| Column | Type | Notes |
|---|---|---|
| `id` | serial PK | |
| `stripe_subscription_id` | text | |
| `new_plan_code` | text FK → billing_plans.code | |
| `interval` | text | |
| `effective_at` | bigint | Unix timestamp when the change takes effect |
| `status` | text | `pending`, `applied`, `canceled` |
| `created_at` | timestamp | |

---

### `customer_billing_profiles`

Rich, denormalized billing profile per store. The single most useful table for the agent system — contains a complete snapshot of billing health.

| Column | Type | Notes |
|---|---|---|
| `id` | serial PK | |
| `user_id` | text UNIQUE FK → users.id | |
| `salon_id` | integer FK → locations.id | |
| `stripe_customer_id` | text UNIQUE | |
| `default_payment_method_id` | text | Stripe `pm_...` |
| `customer_email` | text | |
| `customer_name` | text | |
| `billing_address_*` | text | Full billing address fields |
| `tax_exempt_status` | text | `none`, `exempt`, `reverse` |
| `preferred_currency` | text | `usd` |
| `current_plan_id` | integer FK → billing_plans.id | |
| `current_subscription_status` | text | Latest known status |
| `trial_ends_at` | timestamp | |
| `current_period_start` | timestamp | |
| `current_period_end` | timestamp | |
| `cancel_at_period_end` | boolean | |
| `canceled_at` | timestamp | |
| `subscription_started_at` | timestamp | |
| `lifetime_value_cents` | bigint | Total amount paid (decremented by refunds) |
| `total_successful_payments` | integer | |
| `total_failed_payments` | integer | |
| `last_payment_date` | timestamp | |
| `last_payment_amount_cents` | bigint | |
| `last_failed_payment_date` | timestamp | |
| `last_failed_payment_reason` | text | Stripe decline message |
| `delinquent` | boolean | Set `true` when payment fails |
| `account_hold` | boolean | Manual admin hold flag |
| `internal_billing_notes` | text | Admin-only notes |
| `created_at` | timestamp | |
| `updated_at` | timestamp | |

**Agent query pattern — check if a store can access premium features:**
```sql
SELECT
  cbp.current_subscription_status,
  cbp.current_period_end,
  cbp.delinquent,
  cbp.account_hold,
  bp.code AS plan_code,
  bp.features_json
FROM customer_billing_profiles cbp
LEFT JOIN billing_plans bp ON bp.id = cbp.current_plan_id
WHERE cbp.salon_id = $1;
```

---

### `invoice_records`

Local copy of every Stripe invoice. Updated by webhooks on every invoice event.

| Column | Type | Notes |
|---|---|---|
| `id` | serial PK | |
| `stripe_invoice_id` | text UNIQUE | Stripe `in_...` |
| `stripe_customer_id` | text | |
| `stripe_subscription_id` | text | |
| `salon_id` | integer FK → locations.id | |
| `invoice_number` | text | Human-readable invoice number |
| `status` | text | `draft`, `open`, `paid`, `uncollectible`, `void` |
| `paid` | boolean | |
| `attempted` | boolean | |
| `forgiven` | boolean | |
| `collection_method` | text | |
| `currency` | text | |
| `subtotal_cents` | bigint | |
| `tax_cents` | bigint | |
| `total_cents` | bigint | |
| `amount_paid_cents` | bigint | |
| `amount_remaining_cents` | bigint | |
| `hosted_invoice_url` | text | Stripe-hosted invoice page URL |
| `invoice_pdf_url` | text | Direct PDF download URL |
| `billing_reason` | text | `subscription_create`, `subscription_cycle`, etc. |
| `period_start` | timestamp | |
| `period_end` | timestamp | |
| `due_date` | timestamp | |
| `paid_at` | timestamp | |
| `next_payment_attempt` | timestamp | For failed invoices |
| `created_at` | timestamp | |
| `updated_at` | timestamp | |

---

### `payment_transactions`

One row per Stripe charge/payment intent. Updated by webhooks.

| Column | Type | Notes |
|---|---|---|
| `id` | serial PK | |
| `stripe_payment_intent_id` | text | Stripe `pi_...` |
| `stripe_charge_id` | text UNIQUE | Stripe `ch_...` |
| `stripe_invoice_id` | text | |
| `salon_id` | integer FK → locations.id | |
| `user_id` | text FK → users.id | |
| `status` | text | `succeeded`, `failed`, `pending` |
| `payment_method_brand` | text | `visa`, `mastercard`, etc. |
| `payment_method_last4` | text | |
| `payment_method_fingerprint` | text | For dedup detection |
| `card_exp_month` | integer | |
| `card_exp_year` | integer | |
| `amount_cents` | bigint | |
| `currency` | text | |
| `failure_code` | text | Stripe decline code |
| `failure_message` | text | Human-readable decline reason |
| `receipt_url` | text | |
| `refunded` | boolean | |
| `refund_amount_cents` | bigint | |
| `dispute_status` | text | `under_review`, `won`, `lost`, etc. |
| `created_at` | timestamp | |
| `updated_at` | timestamp | |

---

### `stripe_webhook_events`

Idempotency log. Every incoming Stripe event is recorded here before processing. Prevents double-processing on retries.

| Column | Type | Notes |
|---|---|---|
| `id` | serial PK | |
| `stripe_event_id` | text UNIQUE | Stripe `evt_...` |
| `event_type` | text | e.g. `invoice.payment_succeeded` |
| `api_version` | text | Stripe API version |
| `processed` | boolean | Set `true` after successful processing |
| `processing_attempts` | integer | Retry counter |
| `processing_error` | text | Last error message if failed |
| `payload_json` | jsonb | Full Stripe event payload |
| `received_at` | timestamp | |
| `processed_at` | timestamp | |

---

### `billing_activity_logs`

Auditable timeline of every billing event. Used by the admin UI timeline and available to the agent system for reasoning about account health.

| Column | Type | Notes |
|---|---|---|
| `id` | serial PK | |
| `salon_id` | integer FK → locations.id | |
| `user_id` | text FK → users.id | |
| `event_type` | text | See event type reference below |
| `severity` | text | `info`, `warn`, `error`, `success` |
| `message` | text | Human-readable description |
| `metadata_json` | jsonb | Structured event data |
| `source` | text | `system`, `webhook`, `api`, `admin` |
| `ip_address` | text | |
| `created_at` | timestamp | |

**Event type reference:**

| Event Type | Severity | Trigger |
|---|---|---|
| `customer.created` | info | New Stripe customer created |
| `checkout.session.created` | info | User initiated checkout |
| `checkout.completed` | success | Checkout session completed |
| `subscription.created` | success | Subscription activated |
| `subscription.updated` | info | Any subscription field changed |
| `subscription.canceled` | warn | Cancellation scheduled or immediate |
| `subscription.resumed` | success | Cancellation reversed |
| `subscription.deleted` | warn | Subscription ended |
| `subscription.plan.upgrade` | info | Plan changed to higher tier |
| `subscription.plan.downgrade` | info | Plan changed to lower tier |
| `payment.succeeded` | success | Invoice paid successfully |
| `payment.failed` | error | Invoice payment failed |
| `invoice.payment.retried` | info/error | Manual payment retry |
| `refund.issued` | warn | Refund processed |
| `charge.refunded` | warn | Charge refunded (from webhook) |
| `dispute.created` | error | Chargeback opened |
| `dispute.closed` | warn | Chargeback resolved |
| `coupon.applied` | info | Discount applied |
| `portal.session.created` | info | Customer opened billing portal |

---

### `refunds`

One row per refund issued (manual admin refunds and automatic Stripe refunds).

| Column | Type | Notes |
|---|---|---|
| `id` | serial PK | |
| `stripe_refund_id` | text UNIQUE | Stripe `re_...` |
| `stripe_charge_id` | text | |
| `stripe_payment_intent_id` | text | |
| `stripe_invoice_id` | text | |
| `salon_id` | integer FK → locations.id | |
| `user_id` | text FK → users.id | Account owner |
| `initiated_by_user_id` | text FK → users.id | Admin who issued refund |
| `amount_cents` | bigint | |
| `currency` | text | |
| `reason` | text | `duplicate`, `fraudulent`, `requested_by_customer` |
| `internal_reason_notes` | text | Admin-only notes (never shown to customer) |
| `refund_type` | text | `manual`, `automatic` |
| `status` | text | `pending`, `succeeded`, `failed`, `canceled` |
| `receipt_url` | text | |
| `metadata_json` | jsonb | |
| `created_at` | timestamp | |
| `updated_at` | timestamp | |

---

### `subscription_plan_changes`

Audit trail of every plan upgrade or downgrade.

| Column | Type | Notes |
|---|---|---|
| `id` | serial PK | |
| `salon_id` | integer FK → locations.id | |
| `user_id` | text FK → users.id | |
| `stripe_subscription_id` | text | |
| `old_plan_id` | integer FK → billing_plans.id | |
| `new_plan_id` | integer FK → billing_plans.id | |
| `old_price_cents` | bigint | |
| `new_price_cents` | bigint | |
| `change_type` | text | `upgrade` or `downgrade` |
| `proration_used` | boolean | Whether Stripe prorated the change |
| `prorated_amount_cents` | bigint | Immediate charge/credit from proration |
| `effective_date` | timestamp | |
| `initiated_by` | text | User ID or `system` |
| `reason` | text | |
| `metadata_json` | jsonb | |
| `created_at` | timestamp | |

---

## API Endpoints

Base path: `/api/billing`

All endpoints require an active session (`req.session.userId`) unless noted as **public**.

### Public Endpoints (no auth required)

| Method | Path | Description |
|---|---|---|
| GET | `/api/billing/status` | Returns `{ configured: boolean }` — whether Stripe is set up |
| GET | `/api/billing/plans` | Returns `{ plans: BillingPlan[] }` — all active plans |
| POST | `/api/billing/webhook` | Stripe webhook receiver — uses Stripe signature, not session auth |

### Customer Endpoints (requires session)

| Method | Path | Body / Query | Description |
|---|---|---|---|
| GET | `/api/billing/profile/:salonId` | — | Full billing profile for a store |
| POST | `/api/billing/checkout` | `{ salonId, planCode, interval?, trialDays?, couponId? }` | Creates Stripe Checkout Session, returns `{ url, sessionId }` |
| POST | `/api/billing/portal` | `{ salonId }` | Creates Customer Portal session, returns `{ url }` |
| GET | `/api/billing/subscription/:salonId` | — | Current subscription details |
| POST | `/api/billing/cancel/:salonId` | `{ stripeSubscriptionId, atPeriodEnd?, reason? }` | Cancel subscription |
| POST | `/api/billing/resume/:salonId` | `{ stripeSubscriptionId }` | Reverse a scheduled cancellation |
| GET | `/api/billing/plan-preview/:salonId` | `?newPlanCode=&interval=` | Proration preview before changing plan |
| POST | `/api/billing/change-plan/:salonId` | `{ newPlanCode, interval?, immediate? }` | Upgrade or downgrade plan |
| GET | `/api/billing/invoices/:salonId` | `?limit=` | Invoice history (local DB, Stripe fallback) |
| POST | `/api/billing/invoices/:invoiceId/retry` | `{ salonId }` | Retry a failed invoice payment |
| GET | `/api/billing/transactions/:salonId` | `?limit=` | Payment transaction history |
| GET | `/api/billing/refunds/:salonId` | — | Refunds for a salon |
| POST | `/api/billing/refund` | `{ salonId, stripeChargeId?, stripePaymentIntentId?, amountCents?, reason?, internalNotes? }` | Issue a refund |
| POST | `/api/billing/coupon` | `{ salonId, couponId }` | Apply a coupon to active subscription |
| GET | `/api/billing/activity/:salonId` | `?limit=` | Billing activity timeline |
| GET | `/api/billing/invoices/all` | — | All invoices (legacy route, admin) |
| GET | `/api/billing/invoices/unpaid/count` | — | Count of unpaid invoices |

### Admin Endpoints (requires `platform_admin` or `admin` role)

| Method | Path | Description |
|---|---|---|
| GET | `/api/billing/admin/overview` | Platform KPIs: MRR, active/trial/delinquent counts + all profiles |
| GET | `/api/billing/admin/salon/:salonId` | Full billing detail for one salon |
| POST | `/api/billing/admin/refund` | Issue a refund on behalf of a salon |

### Plan Management Endpoints (admin)

| Method | Path | Body | Description |
|---|---|---|---|
| GET | `/api/billing/admin/plans` | — | All plans (including inactive) |
| POST | `/api/billing/admin/plans` | `{ code, name, description, priceCents, interval, smsCredits, currency, featuresJson }` | Create new plan |
| PUT | `/api/billing/admin/plans/:id` | plan fields | Update plan |
| PATCH | `/api/billing/admin/plans/:id/toggle` | — | Toggle active/inactive |
| DELETE | `/api/billing/admin/plans/:id` | — | Soft-delete (sets active=false) |

---

## Server-Side Service Functions

All exported from `server/services/billing-service.ts`.

```typescript
// Stripe availability check
stripeAvailable(): boolean

// Customer management
getOrCreateStripeCustomer(salonId: number): Promise<string>  // returns Stripe customer ID

// Billing profile
getBillingProfile(salonId: number): Promise<{ profile, subscription, stripeSub, plan, paymentMethod, store }>

// Checkout & portal
createCheckoutSession({ salonId, planCode, interval, successUrl, cancelUrl, trialDays?, couponId? }): Promise<{ url, sessionId }>
createPortalSession({ salonId, returnUrl }): Promise<{ url }>

// Subscription management
getSubscription(salonId: number): Promise<any>
cancelSubscription({ salonId, stripeSubscriptionId, atPeriodEnd?, reason?, userId? }): Promise<any>
resumeSubscription({ salonId, stripeSubscriptionId, userId? }): Promise<any>

// Plan changes
previewPlanChange({ salonId, newPlanCode, interval? }): Promise<{ immediateChargeCents, nextInvoiceCents, currency, lines, newPlan }>
changePlan({ salonId, newPlanCode, interval?, immediate?, userId? }): Promise<any>

// Invoices
getInvoices(salonId: number, limit?: number): Promise<any[]>
retryInvoicePayment({ stripeInvoiceId, salonId, userId? }): Promise<{ paid, status }>

// Transactions
getTransactions(salonId: number, limit?: number): Promise<any[]>

// Refunds
issueRefund({ stripeChargeId?, stripePaymentIntentId?, stripeInvoiceId?, amountCents?, reason?, internalNotes?, salonId, userId?, initiatedByUserId? }): Promise<any>
getRefunds(salonId: number, limit?: number): Promise<any[]>

// Activity timeline
getActivityTimeline(salonId: number, limit?: number): Promise<any[]>

// Admin
getAdminBillingOverview(): Promise<{ totalMrrCents, activeCount, trialCount, delinquentCount, profiles }>
getAdminSalonBilling(salonId: number): Promise<{ billing, invoices, transactions, refunds, timeline, planChanges }>

// Coupon
applyCoupon({ salonId, couponId, userId? }): Promise<any>

// Plans
getActivePlans(): Promise<BillingPlan[]>

// Logging
logBillingActivity({ salonId?, userId?, eventType, severity?, message, metadata?, source?, ipAddress? }): Promise<void>
```

---

## Webhook Events

Webhook endpoint: `POST /api/billing/webhook`  
Required header: `Stripe-Signature`  
Raw body required (express.json verify callback captures it as `req.rawBody`)

### Handled Events

| Stripe Event | Handler Action |
|---|---|
| `customer.created` | Update `customer_billing_profiles` email/name |
| `customer.updated` | Update `customer_billing_profiles` email/name |
| `customer.subscription.created` | Upsert `stripe_subscriptions`, update `customer_billing_profiles` |
| `customer.subscription.updated` | Update `stripe_subscriptions`, `subscriptions`, `customer_billing_profiles` |
| `customer.subscription.deleted` | Mark canceled in all tables |
| `invoice.created` | Upsert `invoice_records` |
| `invoice.finalized` | Upsert `invoice_records` |
| `invoice.payment_succeeded` | Upsert `invoice_records`, update profile stats, set `delinquent=false` |
| `invoice.payment_failed` | Upsert `invoice_records`, set `delinquent=true`, log failure reason |
| `payment_intent.succeeded` | Upsert `payment_transactions` |
| `payment_intent.payment_failed` | Upsert `payment_transactions` with failure code |
| `charge.refunded` | Update `payment_transactions.refunded`, log |
| `charge.dispute.created` | Update `payment_transactions.dispute_status`, log error |
| `charge.dispute.closed` | Update `payment_transactions.dispute_status`, log |
| `checkout.session.completed` | Insert `stripe_orders`, log |
| `refund.created` | Upsert `refunds` |
| `refund.updated` | Update `refunds.status` |

### Idempotency

Every event is stored in `stripe_webhook_events` before processing. If an event with the same `stripe_event_id` is received again and `processed=true`, it is silently acknowledged without re-processing. This protects against Stripe retries on network failures.

---

## Data Flow Diagrams

### New Subscription Flow

```
User clicks "Subscribe"
  → POST /api/billing/checkout { salonId, planCode }
  → billing-service: getOrCreateStripeCustomer(salonId)
      → INSERT stripe_customers (if new)
      → INSERT customer_billing_profiles (if new)
  → billing-service: ensureStripePrice(plan)
      → Creates Stripe Product + Price if not yet linked
      → UPDATE billing_plans SET stripe_price_id, stripe_product_id
  → stripe.checkout.sessions.create(...)
  → Return { url } → Frontend redirects to Stripe

Stripe processes payment
  → Stripe fires: checkout.session.completed
      → INSERT stripe_orders
  → Stripe fires: customer.subscription.created
      → UPSERT stripe_subscriptions
      → UPDATE customer_billing_profiles
  → Stripe fires: invoice.payment_succeeded
      → UPSERT invoice_records
      → UPDATE customer_billing_profiles (lifetime_value, last_payment_date, delinquent=false)
      → INSERT billing_activity_logs (payment.succeeded)
```

### Payment Failure Flow

```
Stripe fails to charge card
  → Stripe fires: invoice.payment_failed
      → UPSERT invoice_records (status=open, next_payment_attempt set)
      → UPDATE stripe_subscriptions (status=past_due)
      → UPDATE subscriptions (status=past_due)
      → UPDATE customer_billing_profiles:
          delinquent=true
          last_failed_payment_date=NOW()
          last_failed_payment_reason=<decline message>
          total_failed_payments++
      → INSERT billing_activity_logs (payment.failed, severity=error)

Customer goes to /manage/billing
  → Sees "Past Due" status badge + red warning banner
  → Clicks "Manage Billing" → Stripe Portal for card update
  → Or: Admin sees delinquent=true in admin dashboard
```

### Refund Flow (Admin)

```
Admin opens Admin → Billing → select salon → Payments tab → clicks refund icon
  → RefundDialog opens (amount, reason, internal notes)
  → POST /api/billing/admin/refund { salonId, stripeChargeId, amountCents, reason, internalNotes }
  → billing-service.issueRefund(...)
      → stripe.refunds.create(...)
      → INSERT refunds (with initiatedByUserId = admin's userId)
      → UPDATE payment_transactions (refunded=true, refund_amount_cents)
      → UPDATE customer_billing_profiles (lifetime_value_cents -= refund amount)
      → INSERT billing_activity_logs (refund.issued, severity=warn, source=admin)
  → Stripe fires: charge.refunded (async)
      → UPDATE payment_transactions (confirmed)
      → INSERT billing_activity_logs (charge.refunded, source=webhook)
```

---

## Frontend Routes

| URL | Component | Auth | Description |
|---|---|---|---|
| `/manage/billing` | `ManageBillingWrapper` → `BillingPage` | Session | Customer billing page |
| `/isadmin/billing` | `BillingDashboard` | Admin role | Platform billing overview |
| `/isadmin/billing/plans` | `BillingPlansManager` | Admin role | Plan editor |

### BillingPage (`/manage/billing`)

Props: `salonId: number` (resolved from `/api/manage/overview`)

Tabs:
- **Overview** — current plan, status, renewal date, payment method, KPI stats, action buttons
- **Invoices** — invoice history with PDF download and payment retry
- **Plans** — plan list with upgrade/downgrade buttons

### BillingDashboard (`/isadmin/billing`)

- KPI row: MRR, active subscriptions, trialing, delinquent count
- Searchable table of all billing profiles
- Click any row → `SalonBillingDetail` view
  - Sub-tabs: Overview, Invoices, Payments, Refunds, Timeline, Plan History

### BillingPlansManager (`/isadmin/billing` via tab)

- List all plans (including inactive)
- Create new plan (inline form)
- Edit any plan field including Stripe Price ID
- Toggle active/inactive per plan

---

## Agent System Integration Guide

The agent system can connect directly to the same PostgreSQL database. Here are the recommended read patterns.

### Check if a store has an active paid subscription

```sql
SELECT
  s.status,
  s.plan_code,
  s.current_period_end,
  s.cancel_at_period_end,
  cbp.delinquent,
  cbp.account_hold,
  bp.name AS plan_name,
  bp.price_cents,
  bp.features_json
FROM subscriptions s
JOIN billing_plans bp ON bp.code = s.plan_code
LEFT JOIN customer_billing_profiles cbp ON cbp.salon_id = s.store_number
WHERE s.store_number = $salonId
  AND s.status IN ('active', 'trialing')
ORDER BY s.updated_at DESC
LIMIT 1;
```

### Get all delinquent accounts (for churn risk alerts)

```sql
SELECT
  cbp.salon_id,
  cbp.customer_name,
  cbp.customer_email,
  cbp.last_failed_payment_date,
  cbp.last_failed_payment_reason,
  cbp.total_failed_payments,
  cbp.current_subscription_status,
  bp.name AS plan_name,
  bp.price_cents
FROM customer_billing_profiles cbp
LEFT JOIN billing_plans bp ON bp.id = cbp.current_plan_id
WHERE cbp.delinquent = true
  AND cbp.account_hold = false
ORDER BY cbp.last_failed_payment_date DESC;
```

### Get recent billing events for context window injection

```sql
SELECT event_type, severity, message, metadata_json, created_at
FROM billing_activity_logs
WHERE salon_id = $salonId
ORDER BY created_at DESC
LIMIT 20;
```

### Get all subscriptions expiring in the next 7 days (renewal alerts)

```sql
SELECT
  s.store_number,
  s.plan_code,
  s.current_period_end,
  s.cancel_at_period_end,
  l.name AS store_name,
  l.email AS store_email
FROM subscriptions s
JOIN locations l ON l.id = s.store_number
WHERE s.status = 'active'
  AND s.current_period_end::timestamp BETWEEN NOW() AND NOW() + INTERVAL '7 days';
```

### Check which features a store has access to

```sql
SELECT (features_json->'features') AS features
FROM billing_plans bp
JOIN subscriptions s ON s.plan_code = bp.code
WHERE s.store_number = $salonId
  AND s.status IN ('active', 'trialing')
LIMIT 1;
```

### Write a billing activity log from the agent

Call the REST API (recommended to avoid bypassing validation):
```
POST /api/billing/activity  [future endpoint — add as needed]
```

Or directly via the service:
```typescript
import { logBillingActivity } from "../services/billing-service";

await logBillingActivity({
  salonId: 1234,
  eventType: "agent.action",
  severity: "info",
  message: "Agent sent renewal reminder email",
  metadata: { agentId: "renewal-agent-v1", templateId: "7day-renewal" },
  source: "agent",
});
```

### Stripe API calls from the agent

The agent should **never call Stripe directly**. All Stripe operations must go through `server/services/billing-service.ts` or the `/api/billing/*` REST endpoints to ensure:
- Activity logs are written
- Local DB tables are kept in sync
- Idempotency is maintained

---

## Plan Codes Reference

| Code | Name | Monthly Price | Annual Price | SMS Credits |
|---|---|---|---|---|
| `free` | Free | $0 | — | 0 |
| `starter` | Starter | $49/mo | — | 200 |
| `professional` | Professional | $99/mo | — | 750 |
| `growth` | Growth | $199/mo | — | 2,000 |
| `enterprise` | Enterprise | $399/mo | — | 10,000 |
| `starter_annual` | Starter (Annual) | — | $470/yr | 200 |
| `professional_annual` | Professional (Annual) | — | $950/yr | 750 |
| `growth_annual` | Growth (Annual) | — | $1,910/yr | 2,000 |
| `enterprise_annual` | Enterprise (Annual) | — | $3,830/yr | 10,000 |

Annual plans reflect a 20% discount vs. monthly billing.

---

## Error Handling & Resilience

- **Stripe unavailable:** All Stripe-calling endpoints check `stripeAvailable()` and return HTTP 503 if no key is set. UI shows a friendly degraded state.
- **Webhook failures:** Processing errors are caught, stored in `stripe_webhook_events.processing_error`, and the endpoint always returns 200 to Stripe (to prevent retries on logic errors).
- **Idempotency:** Webhook events are deduplicated by `stripe_event_id`. Safe to replay.
- **Activity log failures:** Wrapped in try/catch — a logging failure never breaks the main operation.
- **Missing Stripe objects:** `getOrCreateStripeCustomer` handles stale customer IDs gracefully (non-fatal update errors).

---

## Security Notes

- The webhook endpoint verifies `Stripe-Signature` using `stripe.webhooks.constructEvent()` before any processing.
- Raw body (`req.rawBody`) is captured by the express.json verify callback in `server/index.ts` and required for signature verification.
- Admin billing endpoints check `req.session.role === 'platform_admin' || 'admin'` before responding.
- Refund `internalReasonNotes` is stored in the DB but never returned to customer-facing endpoints.
- Stripe secret keys are only accessed server-side, never in frontend bundles.
- The `/api/billing/webhook` path is whitelisted from session auth (uses its own Stripe signature auth instead).
