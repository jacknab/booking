# AI Chatbot & Twilio Outbound Dialer API

Complete reference for the appointment management chatbot API and the automated outbound voice dialer built on top of Twilio.

---

## Table of Contents

1. [Overview](#overview)
2. [Authentication](#authentication)
3. [AI Chatbot API](#ai-chatbot-api)
   - [Lookup Appointments by Phone](#1-lookup-appointments-by-phone)
   - [Get Single Appointment](#2-get-single-appointment)
   - [Confirm Appointment](#3-confirm-appointment)
   - [Cancel Appointment](#4-cancel-appointment)
   - [Reschedule Appointment](#5-reschedule-appointment)
   - [Check Availability](#6-check-availability)
4. [Twilio Outbound Dialer](#twilio-outbound-dialer)
   - [Preview Pending Calls](#1-preview-pending-calls)
   - [Trigger Outbound Calls](#2-trigger-outbound-calls)
   - [TwiML: Voice Greeting](#3-twiml-voice-greeting)
   - [TwiML: Handle Key Press](#4-twiml-handle-key-press)
   - [Call Status Webhook](#5-call-status-webhook)
5. [Environment Variables](#environment-variables)
6. [Appointment Status Reference](#appointment-status-reference)
7. [Integration Examples](#integration-examples)

---

## Overview

This system exposes two groups of endpoints:

| Group | Base Path | Purpose |
|---|---|---|
| AI Chatbot API | `/api/chatbot` | Allows an AI chatbot to look up, confirm, cancel, and reschedule appointments |
| Twilio Outbound Dialer | `/api/dialer` | Initiates automated reminder calls to customers and handles their DTMF responses |

Both groups bypass the standard session-based authentication and instead use their own API key guards. Twilio webhook endpoints (`/voice`, `/gather`, `/status`) do not require a key since they are called directly by Twilio.

---

## Authentication

### Chatbot API Key

Set the environment variable `CHATBOT_API_KEY` to a secret string. Every request to `/api/chatbot/*` must include:

```
X-Chatbot-Key: <your_key>
```

If `CHATBOT_API_KEY` is not set, authentication is skipped (useful during local development).

### Dialer API Key

Set the environment variable `DIALER_API_KEY` to a secret string. The trigger and pending endpoints require:

```
X-Dialer-Key: <your_key>
```

Twilio webhook endpoints (`/voice`, `/gather`, `/status`) are intentionally unauthenticated because Twilio calls them directly. Twilio request signing can be added for additional security.

---

## AI Chatbot API

### 1. Lookup Appointments by Phone

Find all appointments associated with a customer's phone number.

```
POST /api/chatbot/lookup
```

**Request Body**

| Field | Type | Required | Description |
|---|---|---|---|
| `phone` | string | Yes | Customer phone number (any format — digits are normalized) |
| `storeId` | number | No | Restrict results to a specific store |
| `upcomingOnly` | boolean | No | Default `true`. When true, only returns future non-cancelled/completed appointments |

**Example Request**

```json
{
  "phone": "720-243-6886",
  "storeId": 1,
  "upcomingOnly": true
}
```

**Example Response**

```json
{
  "count": 1,
  "appointments": [
    {
      "id": 42,
      "date": "2026-04-20T14:00:00.000Z",
      "dateFormatted": "Monday, April 20 at 2:00 PM",
      "duration": 60,
      "status": "pending",
      "notes": null,
      "cancellationReason": null,
      "service": { "id": 5, "name": "Gel Full Set", "price": "55.00" },
      "staff": { "id": 2, "name": "Sarah" },
      "customer": { "id": 1, "name": "Jane Smith", "phone": "7202436886", "email": "jane@example.com" },
      "store": { "id": 1, "name": "Luxury Nails", "phone": "3038720748" }
    }
  ]
}
```

---

### 2. Get Single Appointment

Retrieve full details for one appointment by its ID.

```
GET /api/chatbot/appointment/:id
```

**URL Parameter:** `id` — integer appointment ID

**Example Response**

```json
{
  "id": 42,
  "date": "2026-04-20T14:00:00.000Z",
  "dateFormatted": "Monday, April 20 at 2:00 PM",
  "duration": 60,
  "status": "confirmed",
  "notes": null,
  "cancellationReason": null,
  "service": { "id": 5, "name": "Gel Full Set", "price": "55.00" },
  "staff": { "id": 2, "name": "Sarah" },
  "customer": { "id": 1, "name": "Jane Smith", "phone": "7202436886", "email": null },
  "store": { "id": 1, "name": "Luxury Nails", "phone": "3038720748" }
}
```

---

### 3. Confirm Appointment

Set an appointment's status to `confirmed`. Sends the customer an SMS confirmation.

```
POST /api/chatbot/confirm
```

**Request Body**

| Field | Type | Required | Description |
|---|---|---|---|
| `appointmentId` | number | Yes | ID of the appointment to confirm |
| `notifyCustomer` | boolean | No | Default `true`. Send confirmation SMS to customer |

**Example Request**

```json
{
  "appointmentId": 42,
  "notifyCustomer": true
}
```

**Example Response**

```json
{
  "success": true,
  "appointment": {
    "id": 42,
    "status": "confirmed",
    "dateFormatted": "Monday, April 20 at 2:00 PM",
    ...
  }
}
```

**Error Cases**

| HTTP | Reason |
|---|---|
| 400 | Appointment is already cancelled or completed |
| 404 | Appointment not found |

**SMS sent to customer:**
> ✅ Your Gel Full Set on Monday, April 20 at 2:00 PM is confirmed! We look forward to seeing you. Reply STOP to opt out.

---

### 4. Cancel Appointment

Set an appointment's status to `cancelled`. Sends the customer an SMS notice.

```
POST /api/chatbot/cancel
```

**Request Body**

| Field | Type | Required | Description |
|---|---|---|---|
| `appointmentId` | number | Yes | ID of the appointment to cancel |
| `reason` | string | No | Cancellation reason (stored on the record) |
| `notifyCustomer` | boolean | No | Default `true`. Send cancellation SMS to customer |

**Example Request**

```json
{
  "appointmentId": 42,
  "reason": "Customer requested cancellation",
  "notifyCustomer": true
}
```

**Example Response**

```json
{
  "success": true,
  "appointment": {
    "id": 42,
    "status": "cancelled",
    "cancellationReason": "Customer requested cancellation",
    ...
  }
}
```

**SMS sent to customer:**
> ❌ Your Gel Full Set on Monday, April 20 at 2:00 PM has been cancelled. Reason: Customer requested cancellation. Please contact us to rebook. Reply STOP to opt out.

---

### 5. Reschedule Appointment

Move an appointment to a new date and time. Status is set to `confirmed` after rescheduling.

```
POST /api/chatbot/reschedule
```

**Request Body**

| Field | Type | Required | Description |
|---|---|---|---|
| `appointmentId` | number | Yes | ID of the appointment to reschedule |
| `newDate` | string | Yes | ISO 8601 datetime string for the new slot (must be in the future) |
| `notifyCustomer` | boolean | No | Default `true`. Send rescheduling SMS to customer |

**Example Request**

```json
{
  "appointmentId": 42,
  "newDate": "2026-04-25T10:00:00.000Z",
  "notifyCustomer": true
}
```

**Example Response**

```json
{
  "success": true,
  "appointment": {
    "id": 42,
    "date": "2026-04-25T10:00:00.000Z",
    "dateFormatted": "Saturday, April 25 at 10:00 AM",
    "status": "confirmed",
    ...
  }
}
```

**Error Cases**

| HTTP | Reason |
|---|---|
| 400 | `newDate` is in the past |
| 400 | Appointment is cancelled or completed |
| 404 | Appointment not found |

**SMS sent to customer:**
> 📅 Your Gel Full Set has been rescheduled from Monday, April 20 at 2:00 PM to Saturday, April 25 at 10:00 AM. Reply STOP to opt out.

---

### 6. Check Availability

Return open time slots for a given store and date. Use this before rescheduling to present valid options.

```
GET /api/chatbot/availability
```

**Query Parameters**

| Parameter | Type | Required | Description |
|---|---|---|---|
| `storeId` | number | Yes | Store to check availability for |
| `date` | string | Yes | Date in `YYYY-MM-DD` format |
| `staffId` | number | No | Restrict to a specific staff member's schedule |
| `slotDuration` | number | No | Slot size in minutes. Default `30`, min `15`, max `240` |

**Example Request**

```
GET /api/chatbot/availability?storeId=1&date=2026-04-25&slotDuration=60
```

**Example Response**

```json
{
  "storeId": 1,
  "date": "2026-04-25",
  "slotDuration": 60,
  "openHour": 9,
  "closeHour": 17,
  "slots": [
    { "time": "2026-04-25T09:00:00.000Z", "available": true },
    { "time": "2026-04-25T10:00:00.000Z", "available": false },
    { "time": "2026-04-25T11:00:00.000Z", "available": true },
    { "time": "2026-04-25T12:00:00.000Z", "available": true },
    { "time": "2026-04-25T13:00:00.000Z", "available": false },
    { "time": "2026-04-25T14:00:00.000Z", "available": true },
    { "time": "2026-04-25T15:00:00.000Z", "available": true },
    { "time": "2026-04-25T16:00:00.000Z", "available": true }
  ]
}
```

`available: false` means at least one existing non-cancelled appointment overlaps that slot.

---

## Twilio Outbound Dialer

### How It Works

```
1. You call  POST /api/dialer/trigger
        ↓
2. For each eligible appointment, Twilio dials the customer
        ↓
3. Customer answers → Twilio fetches TwiML from POST /api/dialer/voice
        ↓
4. Customer presses 1, 2, or 3 → Twilio posts to POST /api/dialer/gather
        ↓
   1 → Confirmed in DB + confirmation SMS sent
   2 → Cancelled in DB + cancellation SMS sent
   3 → Message repeated
        ↓
5. Call ends → Twilio posts final status to POST /api/dialer/status
        ↓
   If missed/busy/failed → fallback SMS sent automatically
```

---

### 1. Preview Pending Calls

Returns which appointments would be called without placing any calls. Use this to review before triggering.

```
GET /api/dialer/pending
```

Requires `X-Dialer-Key` header.

**Query Parameters**

| Parameter | Type | Required | Description |
|---|---|---|---|
| `storeId` | number | No | Restrict preview to one store |
| `hoursAhead` | number | No | How far ahead to look. Default `24`, max `168` (7 days) |

**Example Request**

```
GET /api/dialer/pending?hoursAhead=48&storeId=1
```

**Example Response**

```json
{
  "windowHours": 48,
  "count": 3,
  "appointments": [
    {
      "id": 42,
      "date": "2026-04-16T14:00:00.000Z",
      "dateFormatted": "Thursday, April 16 at 2:00 PM",
      "status": "pending",
      "customer": { "name": "Jane Smith", "phone": "7202436886" },
      "service": "Gel Full Set",
      "store": "Luxury Nails"
    }
  ]
}
```

Only appointments with status `pending` or `started` (not `confirmed`, `cancelled`, or `completed`) and a valid customer phone number are included.

---

### 2. Trigger Outbound Calls

Places outbound calls to all eligible customers with upcoming unconfirmed appointments.

```
POST /api/dialer/trigger
```

Requires `X-Dialer-Key` header.

**Request Body**

| Field | Type | Required | Description |
|---|---|---|---|
| `storeId` | number | No | Restrict to one store |
| `hoursAhead` | number | No | Look-ahead window in hours. Default `24`, max `168` |
| `dryRun` | boolean | No | Default `false`. If `true`, returns what would be called without dialing |

**Example Request**

```json
{
  "storeId": 1,
  "hoursAhead": 24,
  "dryRun": false
}
```

**Example Response**

```json
{
  "message": "Dialer triggered for 2 appointment(s)",
  "called": [
    {
      "appointmentId": 42,
      "customer": "Jane Smith",
      "phone": "+17202436886",
      "callSid": "CA1234567890abcdef",
      "status": "dialing"
    },
    {
      "appointmentId": 43,
      "customer": "Mark Johnson",
      "phone": "+13035551234",
      "callSid": "CA0987654321fedcba",
      "status": "dialing"
    }
  ]
}
```

**Answering Machine Detection**

The dialer uses Twilio's `machineDetection: "Enable"`. If a voicemail system is detected, a short pre-recorded message is left and the call ends gracefully.

---

### 3. TwiML: Voice Greeting

Called by Twilio when the customer picks up. Returns TwiML that greets the customer and asks them to press a key.

```
POST /api/dialer/voice?appointmentId=42
```

This endpoint is called by Twilio — you do not call it directly.

**Voice prompt played to customer:**
> "Hello Jane, this is a reminder call from Luxury Nails. You have Gel Full Set scheduled for Monday, April 20 at 2:00 PM. Press 1 to confirm your appointment. Press 2 to cancel your appointment. Press 3 to hear this message again."

---

### 4. TwiML: Handle Key Press

Processes the DTMF digit the customer pressed and updates the appointment accordingly.

```
POST /api/dialer/gather?appointmentId=42
```

This endpoint is called by Twilio — you do not call it directly.

| Key | Action | DB Update | SMS Sent |
|---|---|---|---|
| `1` | Confirm | `status = "confirmed"` | ✅ Confirmation SMS |
| `2` | Cancel | `status = "cancelled"`, reason logged | ❌ Cancellation SMS |
| `3` | Repeat | No change | None — message replayed |
| Other | Re-prompt | No change | None |

---

### 5. Call Status Webhook

Twilio posts to this endpoint when a call ends. If the call was not answered (no-answer, busy, or failed), a fallback SMS is automatically sent to the customer.

```
POST /api/dialer/status
```

This endpoint is called by Twilio — you do not call it directly.

**Fallback SMS (sent on missed/busy/failed calls):**
> 📞 We tried to reach you about your Gel Full Set on Monday, April 20 at 2:00 PM. Call us at 303-872-0748 to confirm or cancel. Reply STOP to opt out.

---

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `TWILIO_ACCOUNT_SID` | Yes | Your Twilio Account SID |
| `TWILIO_AUTH_TOKEN` | Yes | Your Twilio Auth Token |
| `TWILIO_PHONE_NUMBER` | Yes | The Twilio number calls and SMS are sent from |
| `CHATBOT_API_KEY` | Recommended | Secret key for `X-Chatbot-Key` header. Skip to disable auth |
| `DIALER_API_KEY` | Recommended | Secret key for `X-Dialer-Key` header. Skip to disable auth |
| `PUBLIC_BASE_URL` | Optional | Override the base URL used in Twilio callback URLs (e.g. `https://dashboard.certxa.com`). Falls back to `REPLIT_DEV_DOMAIN` or the request host |

---

## Appointment Status Reference

| Status | Meaning |
|---|---|
| `pending` | Booked but not yet confirmed |
| `confirmed` | Customer or staff confirmed |
| `started` | Service in progress |
| `completed` | Service finished |
| `cancelled` | Cancelled by customer or staff |
| `no-show` | Customer did not show up |

The chatbot and dialer will refuse to modify appointments with status `cancelled` or `completed`.

---

## Integration Examples

### Connect an AI Chatbot (e.g. OpenAI Function Calling)

Define these as tools/functions your AI can call:

```json
[
  {
    "name": "lookup_appointments",
    "description": "Look up a customer's upcoming appointments by phone number",
    "parameters": {
      "type": "object",
      "properties": {
        "phone": { "type": "string", "description": "Customer phone number" },
        "storeId": { "type": "number", "description": "Optional store ID" }
      },
      "required": ["phone"]
    }
  },
  {
    "name": "confirm_appointment",
    "description": "Confirm an appointment",
    "parameters": {
      "type": "object",
      "properties": {
        "appointmentId": { "type": "number" }
      },
      "required": ["appointmentId"]
    }
  },
  {
    "name": "cancel_appointment",
    "description": "Cancel an appointment with an optional reason",
    "parameters": {
      "type": "object",
      "properties": {
        "appointmentId": { "type": "number" },
        "reason": { "type": "string" }
      },
      "required": ["appointmentId"]
    }
  },
  {
    "name": "reschedule_appointment",
    "description": "Reschedule an appointment to a new date and time",
    "parameters": {
      "type": "object",
      "properties": {
        "appointmentId": { "type": "number" },
        "newDate": { "type": "string", "description": "ISO 8601 datetime string" }
      },
      "required": ["appointmentId", "newDate"]
    }
  },
  {
    "name": "check_availability",
    "description": "Get available time slots for a store on a specific date",
    "parameters": {
      "type": "object",
      "properties": {
        "storeId": { "type": "number" },
        "date": { "type": "string", "description": "YYYY-MM-DD" },
        "slotDuration": { "type": "number", "description": "Slot size in minutes" }
      },
      "required": ["storeId", "date"]
    }
  }
]
```

Each function maps directly to one chatbot endpoint. Your function-calling handler POSTs to the corresponding URL with `X-Chatbot-Key` set.

---

### Schedule Nightly Dialer Runs

Use a cron job or scheduler to call the trigger endpoint once per day (e.g. the night before) for next-day appointments:

```bash
curl -X POST https://dashboard.certxa.com/api/dialer/trigger \
  -H "Content-Type: application/json" \
  -H "X-Dialer-Key: your_dialer_key" \
  -d '{ "hoursAhead": 24 }'
```

Or do a dry run first to review who will be called:

```bash
curl -X POST https://dashboard.certxa.com/api/dialer/trigger \
  -H "Content-Type: application/json" \
  -H "X-Dialer-Key: your_dialer_key" \
  -d '{ "hoursAhead": 24, "dryRun": true }'
```

---

### Twilio Webhook Configuration

When Twilio places a call, it needs a publicly accessible URL for the voice and status callbacks. These are constructed automatically from the request host. In production, set:

```
PUBLIC_BASE_URL=https://dashboard.certxa.com
```

This ensures Twilio callbacks point to:
- `https://dashboard.certxa.com/api/dialer/voice?appointmentId=X`
- `https://dashboard.certxa.com/api/dialer/gather?appointmentId=X`
- `https://dashboard.certxa.com/api/dialer/status`
