# Certxa Elite — API Access & Integrations

Complete reference for the **Elite** subscription tier's developer API, covering authentication, all available integration endpoints, rate limits, webhooks, and code examples.

---

## Table of Contents

1. [What Is Elite API Access?](#1-what-is-elite-api-access)
2. [Plan Overview & Pricing](#2-plan-overview--pricing)
3. [Getting Started](#3-getting-started)
4. [Authentication](#4-authentication)
5. [Rate Limits & Quotas](#5-rate-limits--quotas)
6. [Core REST API](#6-core-rest-api)
   - [Appointments](#61-appointments)
   - [Customers](#62-customers)
   - [Services](#63-services)
   - [Staff](#64-staff)
   - [Availability](#65-availability)
7. [AI Chatbot Integration API](#7-ai-chatbot-integration-api)
8. [Outbound Dialer API (Twilio)](#8-outbound-dialer-api-twilio)
9. [SMS Notifications API (Twilio)](#9-sms-notifications-api-twilio)
10. [Email Notifications API (Mailgun)](#10-email-notifications-api-mailgun)
11. [Google Business Profile API](#11-google-business-profile-api)
12. [Facebook Reviews API](#12-facebook-reviews-api)
13. [Webhooks](#13-webhooks)
14. [API Key Scopes Reference](#14-api-key-scopes-reference)
15. [HTTP Error Codes](#15-http-error-codes)
16. [SDK & Integration Examples](#16-sdk--integration-examples)
17. [Environment Variables Reference](#17-environment-variables-reference)
18. [SLA & Support](#18-sla--support)

---

## 1. What Is Elite API Access?

The **Elite** plan unlocks full programmatic access to your Certxa account. It allows you to:

- Build custom integrations with third-party tools (CRMs, ERPs, marketing platforms)
- Automate appointment workflows via REST API or AI chatbots
- Trigger outbound voice reminders and SMS campaigns
- Sync appointment and review data with external systems
- Connect Certxa to your own mobile or web applications

All Elite API features sit on top of the platform's existing infrastructure — the same endpoints that power the Certxa dashboard.

---

## 2. Plan Overview & Pricing

| Feature | Starter ($19/mo) | Professional ($39/mo) | Growth ($199/mo) | Enterprise ($399/mo) | **Elite (API)** |
|---|---|---|---|---|---|
| Contacts | 500 | 2,500 | 10,000 | Unlimited | Unlimited |
| Locations | 1 | 3 | 10 | Unlimited | Unlimited |
| SMS Credits / mo | 200 | 750 | 2,000 | 10,000 | **50,000** |
| API Keys | — | — | — | — | **Unlimited** |
| API Rate Limit | — | — | — | — | **1,000 req/min** |
| Chatbot API | — | — | — | — | **Included** |
| Outbound Dialer | — | — | — | — | **Included** |
| Webhooks | — | — | — | — | **Included** |
| Google Reviews API | — | ✓ | ✓ | ✓ | **✓ + Write** |
| White-label Booking | — | — | — | ✓ | ✓ |
| Dedicated Onboarding | — | — | — | ✓ | ✓ |
| SLA & Uptime Guarantee | — | — | — | ✓ | **99.9% SLA** |
| Developer Support | — | — | — | Standard | **Priority (4 h)** |

> **Annual billing** is available with a **20% discount** on the monthly rate.

**Plan code:** `elite`  
**Plan code (annual):** `elite_annual`

---

## 3. Getting Started

### Step 1 — Generate an API Key

1. Log in to your Certxa dashboard.
2. Navigate to **Settings → API Keys**.
3. Click **Create API Key**, enter a descriptive name, and select the required [scopes](#14-api-key-scopes-reference).
4. Copy the key immediately — it is shown **only once**.

Keys have the format:

```
cxa_live_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

Development / test keys:

```
cxa_test_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

### Step 2 — Make Your First Request

```bash
curl https://dashboard.certxa.com/api/appointments \
  -H "Authorization: Bearer cxa_live_YOUR_KEY_HERE" \
  -H "Content-Type: application/json"
```

### Step 3 — Set Up Webhooks (Optional)

Register a publicly reachable HTTPS URL in **Settings → Webhooks** to receive real-time event notifications when appointments are created, updated, cancelled, etc.

---

## 4. Authentication

All Elite API requests are authenticated with a **Bearer token** in the `Authorization` header.

```
Authorization: Bearer cxa_live_YOUR_KEY_HERE
```

API keys are:
- **Scoped** — each key only has access to the scopes you selected at creation time
- **Store-scoped** — a key created under store `42` can only access data for that store
- **Hashed** — the raw key is never stored; only a bcrypt hash is kept in the database
- **Revocable** — delete a key at any time from **Settings → API Keys**
- **Expirable** — optionally set an expiry date when creating a key

### Key Prefixes

| Prefix | Environment |
|---|---|
| `cxa_live_` | Production |
| `cxa_test_` | Sandbox / Development |

### Error Response on Invalid Key

```json
HTTP 401 Unauthorized

{
  "error": "Unauthorized",
  "message": "Invalid or missing API key"
}
```

---

## 5. Rate Limits & Quotas

| Plan | Requests per Minute | Requests per Day |
|---|---|---|
| Elite | **1,000** | **100,000** |
| Enterprise | 500 | 50,000 |
| Growth | 200 | 20,000 |

Rate limit headers are returned on every response:

```
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 986
X-RateLimit-Reset: 1714867200
```

When the limit is exceeded:

```json
HTTP 429 Too Many Requests

{
  "error": "Rate limit exceeded",
  "retryAfter": 14
}
```

**SMS Quota** — Elite includes **50,000 SMS credits per billing period**. Additional credits can be purchased in blocks of 5,000.

---

## 6. Core REST API

Base URL: `https://dashboard.certxa.com/api`

All request and response bodies use **JSON**. Dates are **ISO 8601 UTC** strings.

---

### 6.1 Appointments

#### List Appointments

```
GET /api/appointments
```

**Query Parameters**

| Parameter | Type | Description |
|---|---|---|
| `storeId` | number | Filter by store |
| `staffId` | number | Filter by staff member |
| `customerId` | number | Filter by customer |
| `status` | string | `pending` \| `confirmed` \| `started` \| `completed` \| `cancelled` \| `no-show` |
| `startDate` | string | ISO 8601 — only return appointments on or after this date |
| `endDate` | string | ISO 8601 — only return appointments on or before this date |
| `limit` | number | Max results (default `50`, max `200`) |
| `offset` | number | Pagination offset |

**Example Response**

```json
{
  "appointments": [
    {
      "id": 42,
      "date": "2026-05-10T14:00:00.000Z",
      "dateFormatted": "Sunday, May 10 at 2:00 PM",
      "duration": 60,
      "status": "confirmed",
      "notes": null,
      "cancellationReason": null,
      "service": { "id": 5, "name": "Gel Full Set", "price": "55.00" },
      "staff":    { "id": 2, "name": "Sarah" },
      "customer": { "id": 1, "name": "Jane Smith", "phone": "7202436886", "email": "jane@example.com" },
      "store":    { "id": 1, "name": "Luxury Nails" },
      "createdAt": "2026-05-01T09:15:00.000Z"
    }
  ],
  "total": 128,
  "limit": 50,
  "offset": 0
}
```

---

#### Get Single Appointment

```
GET /api/appointments/:id
```

Returns a single appointment object (same shape as above).

---

#### Create Appointment

```
POST /api/appointments
```

**Request Body**

| Field | Type | Required | Description |
|---|---|---|---|
| `storeId` | number | Yes | Store to book at |
| `serviceId` | number | Yes | Service being booked |
| `staffId` | number | No | Assign a specific staff member |
| `customerId` | number | Yes | Existing customer record |
| `date` | string | Yes | ISO 8601 datetime in the store's timezone |
| `duration` | number | No | Override service duration in minutes |
| `notes` | string | No | Internal notes |
| `notifyCustomer` | boolean | No | Send SMS/email confirmation. Default `true` |

---

#### Update Appointment

```
PATCH /api/appointments/:id
```

Accepts any subset of the create body fields (plus `status` and `cancellationReason`).

---

#### Cancel Appointment

```
POST /api/appointments/:id/cancel
```

**Request Body**

| Field | Type | Required | Description |
|---|---|---|---|
| `reason` | string | No | Cancellation reason |
| `notifyCustomer` | boolean | No | Send cancellation SMS. Default `true` |

---

### 6.2 Customers

#### List Customers

```
GET /api/customers
```

**Query Parameters:** `storeId`, `search` (name/phone/email), `limit`, `offset`

#### Get Single Customer

```
GET /api/customers/:id
```

#### Create Customer

```
POST /api/customers
```

| Field | Type | Required |
|---|---|---|
| `storeId` | number | Yes |
| `name` | string | Yes |
| `phone` | string | No |
| `email` | string | No |
| `notes` | string | No |

#### Update Customer

```
PATCH /api/customers/:id
```

#### Get Customer Appointment History

```
GET /api/customers/:id/appointments
```

Returns all appointments (past and future) for a customer.

---

### 6.3 Services

#### List Services

```
GET /api/services?storeId=1
```

Returns all active services with pricing and duration.

#### Get Single Service

```
GET /api/services/:id
```

---

### 6.4 Staff

#### List Staff Members

```
GET /api/staff?storeId=1
```

Returns all active staff members.

#### Get Staff Schedule

```
GET /api/staff/:id/schedule?startDate=2026-05-10&endDate=2026-05-17
```

Returns the staff member's appointments within the given date range.

---

### 6.5 Availability

```
GET /api/availability
```

Returns open booking slots for a given store, date, and optional service/staff combination.

**Query Parameters**

| Parameter | Type | Required | Description |
|---|---|---|---|
| `storeId` | number | Yes | Target store |
| `date` | string | Yes | `YYYY-MM-DD` |
| `serviceId` | number | No | Automatically uses service duration |
| `staffId` | number | No | Restrict to a specific staff member |
| `slotDuration` | number | No | Duration in minutes. Default `30` |

**Example Response**

```json
{
  "storeId": 1,
  "date": "2026-05-10",
  "slotDuration": 60,
  "timezone": "America/Denver",
  "openHour": 9,
  "closeHour": 18,
  "slots": [
    { "time": "2026-05-10T09:00:00.000Z", "available": true  },
    { "time": "2026-05-10T10:00:00.000Z", "available": false },
    { "time": "2026-05-10T11:00:00.000Z", "available": true  },
    { "time": "2026-05-10T12:00:00.000Z", "available": true  },
    { "time": "2026-05-10T13:00:00.000Z", "available": false },
    { "time": "2026-05-10T14:00:00.000Z", "available": true  },
    { "time": "2026-05-10T15:00:00.000Z", "available": true  },
    { "time": "2026-05-10T16:00:00.000Z", "available": true  },
    { "time": "2026-05-10T17:00:00.000Z", "available": false }
  ]
}
```

`available: false` means an existing non-cancelled appointment overlaps that slot.

---

## 7. AI Chatbot Integration API

Allows an external AI agent to manage appointments on behalf of customers via natural-language interactions. These endpoints use a separate key (`CHATBOT_API_KEY`) sent in the `X-Chatbot-Key` header.

| Endpoint | Method | Description |
|---|---|---|
| `/api/chatbot/lookup` | POST | Look up appointments by customer phone |
| `/api/chatbot/appointment/:id` | GET | Get a single appointment |
| `/api/chatbot/confirm` | POST | Confirm an appointment (triggers SMS) |
| `/api/chatbot/cancel` | POST | Cancel an appointment (triggers SMS) |
| `/api/chatbot/reschedule` | POST | Move appointment to a new time (triggers SMS) |
| `/api/chatbot/availability` | GET | Get open time slots |

Full request/response schemas, examples, and OpenAI function-calling definitions are in [chatbot-dialer-api.md](./chatbot-dialer-api.md).

### Quick Example — Lookup by Phone

```bash
curl -X POST https://dashboard.certxa.com/api/chatbot/lookup \
  -H "X-Chatbot-Key: $CHATBOT_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{ "phone": "720-243-6886", "storeId": 1, "upcomingOnly": true }'
```

### Connecting to OpenAI

```js
const tools = [
  {
    type: "function",
    function: {
      name: "lookup_appointments",
      description: "Look up a customer's upcoming appointments by phone number",
      parameters: {
        type: "object",
        properties: {
          phone:   { type: "string" },
          storeId: { type: "number" }
        },
        required: ["phone"]
      }
    }
  },
  // confirm_appointment, cancel_appointment, reschedule_appointment, check_availability ...
];

const response = await openai.chat.completions.create({
  model: "gpt-4o",
  messages: [{ role: "user", content: userMessage }],
  tools
});
```

When the model calls a tool, POST the arguments to the corresponding `/api/chatbot/*` endpoint with `X-Chatbot-Key` set.

---

## 8. Outbound Dialer API (Twilio)

Triggers automated voice reminder calls to customers with unconfirmed appointments. Customers respond via their keypad (DTMF) to confirm, cancel, or hear the message again.

**Authentication:** `X-Dialer-Key` header with the value of `DIALER_API_KEY`.

### Call Flow

```
POST /api/dialer/trigger
    ↓
Twilio dials each eligible customer
    ↓
Customer picks up → Twilio fetches TwiML from POST /api/dialer/voice
    ↓
Customer presses key → POST /api/dialer/gather
  1 → Confirmed  (DB update + SMS)
  2 → Cancelled  (DB update + SMS)
  3 → Replay message
    ↓
Call ends → POST /api/dialer/status
  Missed/busy/failed → automatic fallback SMS sent
```

### Endpoints

| Endpoint | Method | Auth | Description |
|---|---|---|---|
| `/api/dialer/pending` | GET | `X-Dialer-Key` | Preview calls without dialing |
| `/api/dialer/trigger` | POST | `X-Dialer-Key` | Place outbound calls |
| `/api/dialer/voice` | POST | None (Twilio) | TwiML voice greeting |
| `/api/dialer/gather` | POST | None (Twilio) | TwiML DTMF handler |
| `/api/dialer/status` | POST | None (Twilio) | Call status webhook |

### Trigger Request

```bash
curl -X POST https://dashboard.certxa.com/api/dialer/trigger \
  -H "X-Dialer-Key: $DIALER_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{ "storeId": 1, "hoursAhead": 24 }'
```

| Field | Type | Description |
|---|---|---|
| `storeId` | number | Restrict to one location (omit for all stores) |
| `hoursAhead` | number | Look-ahead window in hours. Default `24`, max `168` |
| `dryRun` | boolean | If `true`, returns what would be called without placing calls |

Full schemas are in [chatbot-dialer-api.md](./chatbot-dialer-api.md).

### Required Twilio Configuration

In your `.env`:

```
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_PHONE_NUMBER=+13035550100
PUBLIC_BASE_URL=https://dashboard.certxa.com
DIALER_API_KEY=your_secret_dialer_key
```

---

## 9. SMS Notifications API (Twilio)

Certxa sends SMS messages automatically on appointment events (booking, confirmation, reminder, review request). With Elite API access you can also trigger custom SMS messages programmatically.

### Automatic SMS Events

| Trigger | Template |
|---|---|
| Appointment booked | "Your [Service] is booked for [Date] at [Location]. Reply STOP to opt out." |
| Appointment confirmed | "✅ Your [Service] on [Date] is confirmed! We look forward to seeing you." |
| Appointment cancelled | "❌ Your [Service] on [Date] has been cancelled. [Reason]. Please contact us to rebook." |
| Appointment rescheduled | "📅 Your [Service] has been rescheduled to [NewDate]." |
| Reminder (configurable) | "📅 Reminder: You have [Service] tomorrow at [Time] with [Staff]." |
| Review request | "Hi [Name], how was your visit? Leave us a review: [Link]" |
| Queue position update | "You are #[Position] in line. Estimated wait: [Minutes] min." |

### SMS Credits

SMS credits are consumed on every outbound message. Credits are included in your plan and reset each billing period.

| Plan | Included SMS Credits |
|---|---|
| Starter | 200 |
| Professional | 750 |
| Growth | 2,000 |
| Enterprise | 10,000 |
| **Elite** | **50,000** |

Additional blocks of 5,000 credits can be purchased at any time from **Settings → Billing**.

### Twilio Configuration per Location

Each store can use its own Twilio credentials, configured in **Settings → Notifications**:

- `TWILIO_ACCOUNT_SID`
- `TWILIO_AUTH_TOKEN`
- `TWILIO_PHONE_NUMBER`

When store-level credentials are not set, the platform-wide credentials defined in the server's `.env` are used as fallback.

---

## 10. Email Notifications API (Mailgun)

All outbound email (booking confirmations, reminders, staff invitations) is handled through **Mailgun**. Elite accounts use the platform-managed Mailgun setup unless they supply their own credentials.

### Required Environment Variables

```
MAILGUN_API_KEY=key-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
MAILGUN_DOMAIN=mg.yourdomain.com
MAILGUN_FROM_EMAIL=hello@yourdomain.com
MAILGUN_FROM_NAME=Your Business Name
MAILGUN_SENDER_EMAIL=noreply@yourdomain.com
```

### Automatic Email Events

| Event | Recipient |
|---|---|
| Appointment booked | Customer |
| Appointment confirmed | Customer |
| Appointment cancelled | Customer |
| Appointment reminder | Customer |
| Review request | Customer |
| Staff invitation | Staff member |
| Password reset | Account owner |

### Using Your Own Mailgun Domain

To send emails from your own domain rather than Certxa's shared sender:

1. Add a verified domain in your [Mailgun account](https://mailgun.com).
2. Add the DNS records Mailgun provides (MX, TXT/DKIM, CNAME tracking).
3. Set the four `MAILGUN_*` variables above in **Settings → Integrations**.

---

## 11. Google Business Profile API

Requires connecting a Google account with access to the Business Profile. OAuth credentials are configured via:

```
GOOGLE_CLIENT_ID=your_client_id
GOOGLE_CLIENT_SECRET=your_client_secret
GOOGLE_REDIRECT_URI=https://dashboard.certxa.com/google-business
GOOGLE_AUTH_CALLBACK_URL=https://dashboard.certxa.com/api/auth/google/callback
APP_URL=https://dashboard.certxa.com
```

### What It Does

| Feature | Description |
|---|---|
| Fetch reviews | Pulls all Google reviews for the connected Business Profile |
| Reply to reviews | Post owner replies directly from the Certxa dashboard |
| Sync business info | Read business hours, address, and phone from GBP |

### Connect Flow

1. In the Certxa dashboard, go to **Reviews → Google**.
2. Click **Connect Google Account**.
3. Complete the OAuth consent screen (authorizes `business.manage` scope).
4. Reviews appear in the dashboard once the token is stored.

### Read Reviews (Internal Endpoint)

```
GET /api/google-business/reviews?storeId=1
```

**Response**

```json
{
  "reviews": [
    {
      "reviewId": "AbFvAqxyz...",
      "reviewer": { "displayName": "Jane S." },
      "starRating": "FIVE",
      "comment": "Absolutely amazing experience!",
      "createTime": "2026-04-20T14:22:00.000Z",
      "updateTime": "2026-04-20T14:22:00.000Z",
      "reviewReply": null
    }
  ]
}
```

### Post a Reply

```
POST /api/google-business/reviews/:reviewId/reply
```

```json
{
  "reply": "Thank you so much for the kind words, Jane! We look forward to seeing you again."
}
```

---

## 12. Facebook Reviews API

Facebook Page reviews are synced manually in the current implementation. Full OAuth integration is in progress (pending Meta App Review).

### Current Setup

1. Go to **Reviews → Facebook** in the dashboard.
2. Enter your **Facebook Page ID** (the numeric ID, not the slug).
3. Reviews from your Page are fetched and displayed alongside Google reviews.

### Finding Your Page ID

```
https://www.facebook.com/your-page-name/about
```

Or extract it programmatically:

```bash
curl "https://graph.facebook.com/v19.0/your-page-name?fields=id&access_token=YOUR_TOKEN"
```

### Future: Full OAuth Flow

Once Meta App Review completes, the integration will move to a full OAuth flow:

1. Click **Connect Facebook Page** in the dashboard
2. Authorize Certxa to access `pages_read_engagement` and `pages_show_list`
3. Select the Page to link
4. Reviews are synced automatically every hour

---

## 13. Webhooks

Elite accounts can register HTTPS webhook endpoints to receive real-time push notifications for platform events.

### Registering a Webhook

Go to **Settings → Webhooks → Add Endpoint**. Provide:

- **URL**: Your publicly accessible HTTPS endpoint
- **Events**: Select which events to receive (or subscribe to all)
- **Secret**: A signing secret used to verify the payload

### Payload Signature Verification

Every webhook delivery includes an `X-Certxa-Signature` header. Verify it in your handler:

```js
import crypto from "crypto";

function verifySignature(rawBody, signature, secret) {
  const expected = crypto
    .createHmac("sha256", secret)
    .update(rawBody)
    .digest("hex");
  return crypto.timingSafeEqual(
    Buffer.from(`sha256=${expected}`),
    Buffer.from(signature)
  );
}
```

### Webhook Payload Structure

```json
{
  "id": "evt_01HX9...",
  "event": "appointment.confirmed",
  "timestamp": "2026-05-10T14:00:00.000Z",
  "storeId": 1,
  "data": {
    "appointment": { ... }
  }
}
```

### Available Events

| Event | Fired When |
|---|---|
| `appointment.created` | A new appointment is booked |
| `appointment.confirmed` | An appointment is confirmed |
| `appointment.cancelled` | An appointment is cancelled |
| `appointment.rescheduled` | An appointment is moved to a new time |
| `appointment.completed` | An appointment is marked complete |
| `appointment.no_show` | Customer marked as no-show |
| `customer.created` | A new customer record is created |
| `customer.updated` | A customer record is updated |
| `review.received` | A new Google or Facebook review is synced |
| `sms.delivered` | An outbound SMS is confirmed delivered |
| `sms.failed` | An outbound SMS failed to deliver |
| `queue.checkin` | A customer checks in to the virtual queue |
| `queue.called` | A customer is called from the queue |

### Retry Policy

If your endpoint returns a non-2xx status, Certxa retries with exponential backoff:

| Attempt | Delay |
|---|---|
| 1 | Immediate |
| 2 | 5 minutes |
| 3 | 30 minutes |
| 4 | 2 hours |
| 5 | 24 hours |

After 5 failed attempts the event is marked as **failed** and appears in the webhook log at **Settings → Webhooks → Delivery Log**.

---

## 14. API Key Scopes Reference

Select the minimum scopes required for each integration.

| Scope | Access |
|---|---|
| `read` | Read all store data (appointments, customers, services, staff) |
| `write` | Create and update appointments and customers |
| `appointments:read` | Read-only access to appointments |
| `appointments:write` | Create, update, and cancel appointments |
| `customers:read` | Read-only access to customer records |
| `customers:write` | Create and update customer records |
| `services:read` | Read-only access to services and pricing |
| `staff:read` | Read-only access to staff members and schedules |
| `availability:read` | Query open booking slots |
| `reviews:read` | Read synced Google and Facebook reviews |
| `reviews:write` | Post replies to Google reviews |
| `sms:send` | Trigger outbound SMS messages |
| `webhooks:manage` | Register and delete webhook endpoints |
| `billing:read` | Read subscription and invoice data |

---

## 15. HTTP Error Codes

| Code | Meaning |
|---|---|
| `200 OK` | Request succeeded |
| `201 Created` | Resource created |
| `400 Bad Request` | Validation error — see `message` for details |
| `401 Unauthorized` | Missing, invalid, or expired API key |
| `403 Forbidden` | Valid key but insufficient scope |
| `404 Not Found` | Resource does not exist or belongs to another store |
| `409 Conflict` | Duplicate resource (e.g., double-booking) |
| `422 Unprocessable Entity` | Business logic error (e.g., appointment in the past) |
| `429 Too Many Requests` | Rate limit exceeded — see `X-RateLimit-Reset` header |
| `500 Internal Server Error` | Unexpected server error — contact support |

**Error response shape:**

```json
{
  "error": "Bad Request",
  "message": "The requested time slot is already booked.",
  "code": "SLOT_UNAVAILABLE"
}
```

---

## 16. SDK & Integration Examples

### Node.js / TypeScript

```ts
const BASE = "https://dashboard.certxa.com";
const KEY  = process.env.CERTXA_API_KEY!;

async function getAvailability(storeId: number, date: string) {
  const res = await fetch(
    `${BASE}/api/availability?storeId=${storeId}&date=${date}`,
    { headers: { Authorization: `Bearer ${KEY}` } }
  );
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}

async function bookAppointment(payload: {
  storeId: number;
  serviceId: number;
  customerId: number;
  date: string;
}) {
  const res = await fetch(`${BASE}/api/appointments`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ ...payload, notifyCustomer: true }),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}
```

### Python

```python
import os, requests

BASE = "https://dashboard.certxa.com"
HEADERS = {
    "Authorization": f"Bearer {os.environ['CERTXA_API_KEY']}",
    "Content-Type": "application/json",
}

def list_appointments(store_id: int, status: str = "pending"):
    r = requests.get(
        f"{BASE}/api/appointments",
        params={"storeId": store_id, "status": status},
        headers=HEADERS,
    )
    r.raise_for_status()
    return r.json()

def cancel_appointment(appointment_id: int, reason: str = ""):
    r = requests.post(
        f"{BASE}/api/appointments/{appointment_id}/cancel",
        json={"reason": reason, "notifyCustomer": True},
        headers=HEADERS,
    )
    r.raise_for_status()
    return r.json()
```

### cURL — Nightly Dialer Cron

```bash
#!/bin/bash
# Run nightly at 8 PM to call next-day unconfirmed appointments

curl -s -X POST https://dashboard.certxa.com/api/dialer/trigger \
  -H "Content-Type: application/json" \
  -H "X-Dialer-Key: ${DIALER_API_KEY}" \
  -d '{ "hoursAhead": 18, "dryRun": false }' \
  | jq '.called | length' \
  | xargs -I{} echo "{} appointment calls triggered"
```

### Zapier / Make.com

Use **Webhooks by Zapier** or Make's **HTTP module** with:

- **Method**: GET or POST
- **URL**: `https://dashboard.certxa.com/api/appointments`
- **Headers**: `Authorization: Bearer cxa_live_YOUR_KEY`

This lets you pipe new appointments into Slack, HubSpot, Google Sheets, or any other tool without writing code.

---

## 17. Environment Variables Reference

All variables are set in the server's `.env` file (or via **Settings → Integrations** in the dashboard for per-store overrides).

| Variable | Required | Description |
|---|---|---|
| `DATABASE_URL` | Yes | PostgreSQL connection string |
| `SESSION_SECRET` | Yes | Express session encryption secret |
| `NODE_ENV` | Yes | `production` in all deployed environments |
| `PORT` | Yes | HTTP port the server binds to (default `5080`) |
| `APP_URL` | Yes | Public base URL, e.g. `https://dashboard.certxa.com` |
| `CORS_ORIGINS` | Yes | Allowed CORS origins (comma-separated) |
| `TRIAL_PERIOD_DAYS` | Yes | Free trial length in days (default `60`) |
| `ACTIVE_GROUPS` | Yes | Controls visible product groups on marketing pages (`1`–`3`) |
| `STRIPE_SECRET_KEY` | Yes | Stripe secret key (`sk_live_…` or `sk_test_…`) |
| `STRIPE_WEBHOOK_SECRET` | Yes | Stripe webhook signing secret |
| `TWILIO_ACCOUNT_SID` | SMS/Dialer | Twilio Account SID |
| `TWILIO_AUTH_TOKEN` | SMS/Dialer | Twilio Auth Token |
| `TWILIO_PHONE_NUMBER` | SMS/Dialer | Outbound Twilio phone number |
| `CHATBOT_API_KEY` | Chatbot | API key for `X-Chatbot-Key` header |
| `DIALER_API_KEY` | Dialer | API key for `X-Dialer-Key` header |
| `PUBLIC_BASE_URL` | Dialer | Override for Twilio callback URLs |
| `MAILGUN_API_KEY` | Email | Mailgun private API key |
| `MAILGUN_DOMAIN` | Email | Verified Mailgun sending domain |
| `MAILGUN_FROM_EMAIL` | Email | Sender email address |
| `MAILGUN_FROM_NAME` | Email | Sender display name |
| `MAILGUN_SENDER_EMAIL` | Email | Envelope-from address |
| `GOOGLE_CLIENT_ID` | Google | Google OAuth 2.0 client ID |
| `GOOGLE_CLIENT_SECRET` | Google | Google OAuth 2.0 client secret |
| `GOOGLE_REDIRECT_URI` | Google | OAuth redirect URI |
| `GOOGLE_AUTH_CALLBACK_URL` | Google | OAuth callback URL |
| `TEXTBELT_API_KEY` | SMS (alt) | TextBelt API key (fallback SMS provider) |

---

## 18. SLA & Support

### Uptime SLA

Elite accounts are covered by a **99.9% monthly uptime SLA** for the core booking and API platform.

| Downtime per Month | Credit |
|---|---|
| 44 min – 4 h 22 min | 10% of monthly fee |
| 4 h 22 min – 8 h 45 min | 25% of monthly fee |
| > 8 h 45 min | 50% of monthly fee |

Credits are applied to the next billing cycle upon written request within 7 days of the incident.

### Developer Support

| Support Channel | Response Time |
|---|---|
| In-app chat | Business hours |
| Email: api-support@certxa.com | **4 hours** (business days) |
| Emergency hotline | 1 hour (P0/P1 issues only) |

**P0** — API completely down or data loss  
**P1** — Major integration broken, significant revenue impact  
**P2** — Degraded performance or non-critical integration issues  
**P3** — General questions, feature requests

### Dedicated Onboarding

Every new Elite account receives a **60-minute onboarding call** with a Certxa integration engineer to:

- Review your architecture and integration goals
- Walk through API authentication and key scoping
- Configure Twilio, Mailgun, and Google OAuth
- Set up and test webhooks in your environment
- Answer technical questions specific to your stack

To schedule: email **onboarding@certxa.com** with your account domain and preferred time.

---

*Document version: 1.0 — Last updated May 2026*  
*For the Chatbot & Dialer full reference, see [chatbot-dialer-api.md](./chatbot-dialer-api.md)*  
*For billing infrastructure details, see [stripe-billing-infrastructure.md](./stripe-billing-infrastructure.md)*
