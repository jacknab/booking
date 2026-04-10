# Certxa Queue — Smart Location-Based SMS Dispatch

## What It Does

Certxa Queue lets customers check in to a barbershop or hair studio remotely — they join the virtual line from their phone and go about their day instead of sitting in a waiting room. When it's almost their turn, the system automatically texts them telling them to start heading over.

The text goes out at **exactly the right moment** — calculated using two things:

1. **How far away the customer is** from the store (measured in real drive time, not just miles)
2. **How fast the line is actually moving** right now today (not just a configured estimate)

---

## How It Works — Step by Step

### 1. Customer Checks In

The customer visits the store's check-in page at `/q/your-store-slug` on their phone.

- The page asks for their **location** automatically
- If they allow it, a green banner confirms: *"Location shared! We'll text you when it's time to head over."*
- If they deny it, an amber banner appears: *"Add your phone number below and we'll text you when you're almost up!"*
- They enter their name, phone number, and party size, then tap **Get in Line**
- Their GPS coordinates are stored with their queue entry

### 2. The Queue Moves

As customers get served, staff click **Call** then **Done** in the Queue Dashboard. Each completion is time-stamped automatically.

### 3. The Scheduler Runs Every 2 Minutes

A background process checks all waiting customers with a phone number and shared location. For each one it:

**A — Measures actual queue speed**

Looks at the last 12 completions today and measures the average time between each one. This is blended with the configured average (60% real data, 40% configured) to stay stable early in the day when there's less data.

**B — Calculates drive time**

Using the Haversine formula (great-circle distance on a sphere), it computes the straight-line distance between the customer and the store, then converts to estimated drive time:

| Distance | Speed Assumption | Drive Time |
|---|---|---|
| Under 0.25 miles | Walking | 3 minutes flat |
| 0.25 – 1 mile | ~10 mph (heavy urban) | 6 min per mile |
| 1 – 3 miles | ~15 mph (city) | 4 min per mile |
| 3 – 8 miles | ~24 mph (mixed) | 2.5 min per mile |
| Over 8 miles | ~33 mph (suburban/highway) | 1.8 min per mile |

**C — Decides whether to send**

If the estimated time until their turn is less than or equal to the drive time plus the configured buffer, the SMS goes out:

```
Time until turn  ≤  Drive time  +  Head-start buffer
```

For example, if there are 2 people ahead at 18 minutes each (36 min wait), the customer is 6 miles away (15 min drive), and the buffer is 5 minutes — the SMS fires when the wait drops to 20 minutes or less.

**D — Sends the text**

The customer receives a message like:

> *Hey Sarah! You're #3 in line at Mike's Barbershop — time to start heading over now so you're here on time! 🚗 https://maps.google.com/?q=40.712,−74.006*

If they're next up:

> *Hey Sarah! You're NEXT at Mike's Barbershop — head over now, we'll be ready for you! 🚗 https://maps.google.com/?q=40.712,−74.006*

Each customer receives **at most one travel alert** — the system marks the entry as texted and never sends again.

---

## Setup — What the Business Owner Does

### Step 1 — Pin the Store Location

Go to **Queue → Settings → Smart SMS Dispatch**.

Open this page on a device that is physically at the store (a phone or laptop in the shop). Click **Pin Store Location**. The browser captures the GPS coordinates and saves them.

A green confirmation shows the coordinates. These are what the scheduler uses as the destination point for all distance calculations.

### Step 2 — Set the Head-Start Buffer

In Queue Settings, choose an SMS Head-Start Buffer — this is how many extra minutes before the drive time you want to send the alert:

| Buffer | Effect |
|---|---|
| 0 min | Text fires exactly when drive time equals wait time |
| 5 min (default) | Text fires 5 minutes earlier — recommended |
| 10–15 min | Better for customers who take longer to get ready |

A buffer of 5 minutes means if the customer is a 10-minute drive away, they'll get texted when they have 15 minutes left in the queue.

### Step 3 — Make Sure Twilio Is Configured

The system uses Twilio to send texts. This requires the `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, and `TWILIO_PHONE_NUMBER` environment variables to be set, and the store to have SMS tokens available.

---

## What Shows in the Queue Dashboard

The staff **Queue Dashboard** (`/dashboard/queue`) shows each customer's name, party size, how long ago they checked in, and their phone number. Staff can:

- **Call** — marks the customer as called (auto-stamps the time)
- **Done** — marks as completed (auto-stamps completion time, feeds into queue speed data)
- **Remove** — deletes the entry

The completion timestamps are what make the queue speed calculation accurate. The more the staff uses Done instead of just deleting entries, the better the SMS timing becomes throughout the day.

---

## The Display Board

A full-screen TV board at `/q/your-store-slug/display` shows:

- Live queue list with position numbers (names shown as "First L." for privacy)
- A "Now Serving" section at the top
- A QR code on the right side so walk-in customers can scan to join the line
- Auto-refreshes every 10 seconds

---

## Customer Check-In Page Features

The public check-in page at `/q/your-store-slug`:

- Shows current wait count and estimated time
- Asks for name, phone (optional), and party size (1–4+)
- Requests location automatically with a clear status banner
- After check-in: shows live position with countdown, updates every 15 seconds
- Cancel button removes them from the queue
- Works fully on mobile without any app download

---

## Embed It on Your Website

In Queue Settings, there are ready-to-copy iframe codes for both the check-in widget and the display board:

**Check-in widget** — embed on your website so customers can join from your homepage:
```html
<iframe
  src="https://yourdomain.com/q/your-slug"
  width="100%"
  height="600"
  style="border:none;border-radius:16px;"
  title="Virtual Check-In"
></iframe>
```

**Display board** — embed full-screen on a lobby TV or second monitor:
```html
<iframe
  src="https://yourdomain.com/q/your-slug/display"
  width="100%"
  height="100vh"
  style="border:none;"
  allowfullscreen
  title="Queue Display Board"
></iframe>
```

A downloadable QR code is also available to print and place at the front desk.

---

## Summary of All Pages

| Page | URL | Who Uses It |
|---|---|---|
| Customer Check-In | `/q/:slug` | Customer (public, no login) |
| TV Display Board | `/q/:slug/display` | Lobby screen (public, no login) |
| Staff Queue Dashboard | `/dashboard/queue` | Staff (login required) |
| Queue Settings | `/dashboard/queue/settings` | Business owner (login required) |
