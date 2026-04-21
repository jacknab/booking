# Waitlist & Live Queue

A single feature, two faces. The same `waitlist` table backs **both**:

1. **Waitlist** (`/waitlist`) — clients who want a *future* appointment but couldn't get the slot they wanted. Staff work the list manually and book them in when something opens up.
2. **Live Queue** (`/dashboard/queue`) — walk-in flow for shops where customers join a line *today* and get served in order (barbershops, walk-in salons, nail bars). Includes a public check-in page and a smart "time to head over" SMS.

Both views read and write the same rows; the only difference is which `status` values they care about and how the row was created.

---

## Why this exists

Two real-world problems it solves:

- **No-show recovery / upsell.** When a slot cancels, you want to call the next person who asked for that day instead of leaving the spot empty. The Waitlist view is your shortlist.
- **Walk-in chaos.** A busy barbershop has people standing at the door asking "how long?" — the Live Queue lets them check in from their phone, see their position, and only drive in when it's actually their turn. The smart SMS uses their GPS + your real-time service speed to time the alert.

The same row model handles both because the data is identical: a person, optionally a service/staff preference, and a status.

---

## Data model

`shared/schema.ts` → `waitlist` table:

| Column | Purpose |
|---|---|
| `id`, `storeId`, `createdAt` | Standard. |
| `customerName`, `customerPhone`, `customerEmail`, `customerId` | Who. `customerId` links to your customers table when known; the others are always captured. |
| `serviceId`, `staffId` | Optional preferences. |
| `preferredDate`, `preferredTimeStart`, `preferredTimeEnd` | Used by the **future-slot** Waitlist view. Ignored by the live queue. |
| `partySize` | Live queue only (walk-in groups). Defaults to 1. |
| `notes` | Free text. |
| `status` | The state machine: `waiting`, `called`, `serving`, `completed`, `cancelled`, `notified`, `booked`. |
| `notifiedAt`, `calledAt`, `completedAt` | Auto-stamped when status flips. |
| `customerLatitude`, `customerLongitude` | Captured by the public check-in page (browser geolocation). Used by the smart-SMS scheduler. |
| `smsSentAt` | Set once the travel alert SMS goes out, so it never fires twice for the same person. |

### Status meaning

| Status | Used in | Meaning |
|---|---|---|
| `waiting` | Both | Default state on insert. |
| `notified` | Waitlist | A staff member pressed "Notify" — they've reached out about an open slot. |
| `booked` | Waitlist | A real appointment was created and this entry is closed. |
| `cancelled` | Both | Customer dropped out. |
| `called` | Live queue | Customer was called up but hasn't started yet. |
| `serving` | Live queue | Currently in the chair. |
| `completed` | Live queue | Service finished. Used by the smart-SMS scheduler to learn your real avg service time. |

---

## How a row gets created

There are three entry points:

### 1. Staff add to Waitlist (future slot)
**UI:** `/waitlist` → "Add to Waitlist" button.
**API:** `POST /api/waitlist`
Captures name + phone/email + optional preferred date/time + notes. Status starts at `waiting`.

### 2. Staff add to Live Queue (walk-in)
**UI:** `/dashboard/queue` → check-in dialog.
Same `POST /api/waitlist` endpoint, no `preferredDate` set, party size optional.

### 3. Customer self-check-in (public)
**UI:** `/queue/:slug` (also embeddable QR code).
**API:** `POST /api/public/queue/:slug/checkin`
The browser asks for geolocation; if granted, `customerLatitude`/`customerLongitude` get stored — that's what enables the smart travel-time SMS later. The customer then lands on a position page (`/api/public/queue/:slug/position/:id`) that auto-refreshes.

---

## How rows move through states

### Waitlist (future-slot) actions
On the `/waitlist` page each row shows three primary buttons (visible based on current status):

- **Notify** → flips `waiting` → `notified`, stamps `notifiedAt`. Use this when you've called/texted them about an opening.
- **Booked** → flips `waiting`/`notified` → `booked`. You've created a real appointment in the calendar; this archives the row.
- **Cancel** → flips anything → `cancelled`. They no longer want a slot.
- **Trash** → hard-delete.

> Note: "Booked" does **not** auto-create an appointment. It only marks the waitlist row done. Create the appointment from the Calendar like normal, then click Booked here. Keeps the moving parts independent and avoids accidental double-bookings.

### Live queue actions
On `/dashboard/queue`, the central action is **Next Customer**:

**`POST /api/queue/next`** is atomic. In one transaction it:
1. Finds whoever is currently `serving`/`called` and marks them `completed` (`completedAt = now`).
2. Finds the oldest `waiting` row and promotes it to `serving` (`calledAt = now`).

Other manual actions update `status` directly through `PUT /api/waitlist/:id`. Status changes auto-stamp the right timestamp:

```ts
if (req.body.status === "called" || req.body.status === "serving") updates.calledAt = new Date();
else if (req.body.status === "completed") updates.completedAt = new Date();
```

---

## The smart travel-alert SMS (live queue only)

This is the part that makes the queue feel magical. Code: `server/queue-sms-scheduler.ts`. It runs every 2 minutes (started in `server/routes.ts`).

For each waiting customer who has a phone *and* shared their GPS *and* hasn't been texted yet, it computes:

- **Position in line** = number of `waiting`/`called`/`serving` entries ahead of them, ordered by `createdAt`.
- **Time until their turn** = `peopleAhead × realAvgServiceTime`.
  - `realAvgServiceTime` is computed from today's actual completion timestamps (gaps between consecutive `completed` rows, outliers filtered, then blended 60/40 with the configured default for stability). Falls back to the configured value if there's not enough data yet.
- **Drive time** = Haversine distance between customer GPS and store GPS, converted to minutes via a conservative urban-speed table (3 mph below ¼ mile, scaling up to ~33 mph past 8 miles).
- **Trigger:** when `timeUntilTurn ≤ driveMinutes + smsTravelBuffer`, send the SMS and stamp `smsSentAt` so it can't fire again.

Two message variants:
- Position 1: *"You're NEXT — head over now"*
- Position 2+: *"You're #N in line — time to start heading over"*

Both include a Google Maps link to the store.

### What the store needs to set up for this to work
Settings page (`/dashboard/queue/settings`, API `PUT /api/queue/settings`) controls:

| Setting | Purpose |
|---|---|
| `queueEnabled` | Master on/off for the live queue. |
| `queueAvgServiceTime` (min) | Fallback used when there's no real data yet. |
| `queueMaxSize` | Hard cap on active queue length. |
| `smsTravelBuffer` (min) | Safety margin added to drive time. Higher = SMS sent earlier. |
| `storeLatitude`, `storeLongitude` | **Required** for travel-time math. Without these, no SMS goes out. |

---

## REST API summary

### Authenticated (staff)
| Method | Path | Purpose |
|---|---|---|
| GET | `/api/waitlist` | List entries for the signed-in user's store. |
| POST | `/api/waitlist` | Create a new entry. |
| PUT | `/api/waitlist/:id` | Update status / `notifiedAt`. Auto-stamps `calledAt`/`completedAt` based on the new status. |
| DELETE | `/api/waitlist/:id` | Hard delete. |
| POST | `/api/queue/next` | Atomic complete-current + promote-next. |
| GET / PUT | `/api/queue/settings` | Per-store live-queue settings. |

### Public (no auth)
| Method | Path | Purpose |
|---|---|---|
| GET | `/api/public/queue/:slug` | Returns store name + current queue length. |
| POST | `/api/public/queue/:slug/checkin` | Customer self-joins (name, phone, party size, optional GPS). |
| GET | `/api/public/queue/:slug/position/:id` | Live position lookup for the customer's status page. |
| PUT | `/api/public/queue/cancel/:id` | Customer self-cancels. |

---

## How to use it (operational guide)

### Run a future-slot Waitlist
1. Customer calls/walks in wanting an appointment that's already booked.
2. **Waitlist → Add to Waitlist.** Fill in name, phone, preferred date, optional notes (e.g. "anytime Tuesday afternoon").
3. When a slot opens, sort the list by status filter (`waiting`), call the most relevant person.
4. Hit **Notify** to mark you've reached out (so the rest of the team can see it). Then **Booked** once the appointment is on the calendar.

### Run a walk-in queue
1. Once: configure store coordinates and avg service time in queue settings, post the public check-in URL or QR code at the door.
2. As people arrive (or check in remotely), they appear under `waiting`.
3. Press **Next Customer** when a chair frees up. The current person flips to `completed`, the next waiting person to `serving`, all in one click.
4. The scheduler quietly handles the "head over now" SMS in the background — you don't manage it manually.

### Daily reset
Nothing automated; the scheduler scopes everything to "today" via `createdAt >= today 00:00`, so old entries stop counting on their own. Use the `cancelled` filter + Trash to tidy up if you want.

---

## Files

| File | Role |
|---|---|
| `shared/schema.ts` | `waitlist` table + types. |
| `server/routes.ts` | All `/api/waitlist`, `/api/queue/*`, `/api/public/queue/*` endpoints. |
| `server/queue-sms-scheduler.ts` | Smart travel-alert background job (every 2 min). |
| `server/sms.ts` | Underlying Twilio sender. |
| `client/src/pages/Waitlist.tsx` | Future-slot Waitlist page. |
| `client/src/pages/queue/QueueDashboard.tsx` | Live queue dashboard for staff. |
| `client/src/pages/queue/QueueSettings.tsx` | Per-store queue settings UI. |
| `client/src/pages/queue/PublicCheckIn.tsx` | Customer-facing self check-in. |
| `client/src/pages/queue/QueueDisplay.tsx` | TV/lobby display of the current queue. |

---

## Design notes & gotchas

- **One table, two UIs is intentional.** The shared row makes it possible for, say, a future waitlist entry to be "promoted" into today's live queue with a status flip — no data migration needed.
- **No automatic appointment creation.** Marking `booked` is bookkeeping only; the appointment must already exist in the calendar. This is deliberate: waitlist preferences are loose ("anytime Tuesday") and don't map cleanly to a single calendar slot.
- **Smart SMS only fires once per entry** (`smsSentAt`). If you cancel and re-add a customer they get a fresh shot.
- **No store coordinates = no travel SMS.** The scheduler skips silently rather than sending a useless message.
- **Permissions.** The Waitlist sidebar link is gated by `customers.view` — the same permission that controls customer access. There are currently no per-action endpoint guards (the permission system is cosmetic / nav-only by design).
