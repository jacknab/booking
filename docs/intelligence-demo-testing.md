# Revenue Intelligence — Demo Testing Guide

This guide covers everything you need to spin up the Luxe Nails & Spa test account, understand what data is seeded and why, and verify every Revenue Intelligence module is working correctly.

---

## Quick Reference — Commands

| What you want to do | Command |
|---|---|
| Seed the demo account (first time) | `npm run db:seed:nail-demo` |
| Wipe and re-seed from scratch | `npm run db:reseed:nail-demo` |
| Wipe only (no re-seed) | `npm run db:reset:nail-demo` |

---

## Demo Account Credentials

| Field | Value |
|---|---|
| Email | `nail-demo@certxa.com` |
| Password | `demo1234` |
| Store | Luxe Nails & Spa — Austin, TX |
| Login URL | `/auth` |

---

## What the Seed Does

Running `npm run db:seed:nail-demo` creates a fully populated nail salon account with approximately **400 clients** and **6 months of appointment history** (~2,800 bookings). It is designed to trigger every Revenue Intelligence module with realistic, varied data.

After all data is inserted, the script automatically runs the Intelligence engine on the store so every tab is pre-populated when you log in. No manual refresh is needed.

The entire seed takes approximately **2–3 minutes** to complete.

---

## Client Archetypes (why each group exists)

| Archetype | Count | Cadence | Purpose in RI |
|---|---|---|---|
| Power clients | 60 | Every 2–3 weeks | High LTV baseline, preferred staff loyalty, rebooking rate data |
| Gel regulars | 100 | Every 3–4 weeks | Core rebooking and churn risk data |
| Monthly spa clients | 80 | Every 4–5 weeks | LTV scoring, occasional cancellations |
| Occasional clients | 70 | Every 6–8 weeks | Moderate churn risk signals |
| **Drifting clients ★** | 50 | Regular cadence — last visit 20–60% overdue | Triggers the **Client Drift Engine** |
| New clients | 45 | 1–3 visits in last 6 weeks | Low churn risk, no established cadence yet |
| **Lapsed / churned ★** | 40 | Last visit 4–6 months ago | Triggers the **Revenue Leakage Report** |
| **No-show prone ★** | 25 | 25–45% historical no-show rate | Triggers **No-Show Risk Scoring** |

The ★ groups are the most important for Intelligence testing — they are deliberately seeded to fire each detection engine.

---

## Dead Seat Slots

The following time windows are intentionally sparse in the seeded data so the **Dead Seat Detector** fires on them:

- Monday 9–11am
- Tuesday 9–10am
- Wednesday 5–7pm

---

## Staff Profiles (Rebooking Rate Testing)

Five nail techs are created with varied rebooking profiles to make the **Rebooking Rate by Stylist** module meaningful:

| Staff | Role | Expected rebooking profile |
|---|---|---|
| Jessica Tran | Owner / Lead | High rebooking — power client base |
| Lily Chen | Stylist | Top performer |
| Sofia Morales | Stylist | Solid mid-range |
| Priya Patel | Stylist | Newer, improving |
| Megan Brooks | Stylist | Lower rebooking — coaching candidate |

---

## Revenue Intelligence Modules — What to Check

After seeding and logging in, go to **Revenue Intelligence** in the sidebar. Each tab below should have meaningful data immediately.

### Overview tab
- Growth Score ring should show a score with a letter grade
- "Clients Needing Attention" list should be populated
- "Today's Priority Actions" panel should show 3–5 items

### At-Risk Clients tab
- Should show clients with elevated churn scores (Medium / High / Critical)
- "Auto-pilot on · runs every 6h" badge should be visible
- LTV values should vary significantly across the list

### Revenue Leakage tab
- Total Leakage figure should be in the thousands
- Breakdown should show no-show losses, cancellation losses, and discount leakage separately
- "Recovery auto-pilot is on" banner should appear at the top
- "What SalonOS is doing automatically" card should list the three active recovery actions

### Dead Seats tab
- Monday 9–11am and Tuesday 9–10am should appear as underutilised slots
- Each slot should show an estimated lost revenue figure

### No-Show Risks tab
- Should list upcoming confirmed appointments with a risk score
- Several clients from the no-show-prone archetype (25–45% history) should rank high

### Rebooking Rates tab
- Should show all 5 staff members with varying rates
- Trend arrows (up / down / flat) should appear

### Staff tab
- Revenue per appointment, no-show rate, and unique clients served should all differ across techs

### Forecast tab
- 30 / 60 / 90-day revenue projections should be populated
- Booking heatmap (below the forecast) should show density concentrated in busy hours and sparse in the dead-seat windows

### Campaigns tab
- Segment counts (At-Risk, Drifting, High LTV, Birthday) should all be non-zero

### Services tab
- No-show rate should vary across services
- Revenue per minute of chair time should be computed for all services

---

## Re-Seeding

If you want a clean slate at any time — for example after running automated win-back campaigns that change client state — run:

```
npm run db:reseed:nail-demo
```

This wipes every record associated with the demo account (customers, appointments, intelligence tables, SMS logs, staff, services, everything) and re-seeds fresh data in one step. It is fully idempotent and safe to run as many times as needed.

---

## How the Intelligence Engine Works (Background)

The engine runs automatically every 6 hours for all stores. It also runs once at server startup (after a 15-second delay). During each run it:

1. Computes per-client cadence, LTV, and churn risk scores
2. Updates the `client_intelligence` table for every customer
3. Computes staff rebooking rates and updates `staff_intelligence`
4. Detects dead seat patterns
5. Snapshots the Growth Score into `growth_score_snapshots`
6. Sends automated win-back SMS to drifting clients (30-day cooldown per client)
7. Sends rebooking nudges to clients whose next expected visit is 3–7 days away
8. Sends win-back SMS to clients who no-showed or cancelled in the last 7 days

The seed script calls step 1–5 directly (`runIntelligenceForStore`) so the dashboard is ready immediately after seeding. Steps 6–8 (SMS sending) only fire when Twilio credentials are configured and will silently skip in a dev environment without them.

---

## Files Referenced

| File | Purpose |
|---|---|
| `scripts/seed-nail-demo.ts` | Main seed script — creates all demo data and auto-runs the engine |
| `scripts/reset-nail-demo.ts` | Wipe script — removes every record tied to the demo account |
| `scripts/reseed-nail-demo.ts` | Combined reset + seed in one command |
| `server/intelligence/orchestrator.ts` | Intelligence engine — `runIntelligenceForStore` and the 6-hour scheduler |
| `server/intelligence/drift-recovery.ts` | Drifting client win-back SMS logic |
| `server/lapsed-client-scheduler.ts` | Daily 10am lapsed client re-engagement (90+ day lapsed) |
| `client/src/pages/Intelligence.tsx` | Frontend dashboard — all 10 tabs |
| `server/routes/intelligence.ts` | API routes for all Intelligence endpoints |
