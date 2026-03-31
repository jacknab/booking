# Certxa — Master Execution Plan
> Roadmap to compete with and surpass Phorest, Fresha, Vagaro, Booksy, and Zomli
> Check boxes as work is completed.

---

## PHASE 1 — Critical Bug Fixes *(Do First — These Break Real Bookings)*

- [x] **Fix: Add-on IDs silently dropped on public bookings** — The `/api/public/store/:slug/book` endpoint ignores `addonIds` sent by the client. Add-ons selected by the customer are never saved. Fixed by adding `addonIds` to the booking schema and calling `storage.setAppointmentAddons()` post-create.
- [x] **Fix: Email reminder scheduler is a stub** — `startEmailReminderScheduler()` in `server/mail.ts` was an empty function. Implemented a real 5-minute interval scheduler that mirrors the SMS reminder scheduler, sending reminder and review-request emails.
- [x] **Fix: Password reset flow missing** — No "Forgot Password" flow existed. Added `POST /api/auth/forgot-password` and `POST /api/auth/reset-password` routes with secure token generation, a `password_reset_tokens` DB table, and frontend pages at `/forgot-password` and `/reset-password`.
- [ ] **Fix: SMS opt-out not honored** — "Reply STOP" is in SMS templates but there is no Twilio inbound webhook. Add a `POST /api/webhooks/twilio/incoming` route that updates a `sms_opt_outs` table and skips future messages to opted-out numbers.
- [ ] **Fix: No cancellation window enforcement** — Clients can cancel right up to appointment time. Add a `cancellation_hours_cutoff` field to `locations` (default 24h) and enforce it on the public cancel endpoint.
- [ ] **Fix: Admin auth uses a hardcoded dev key** — `isAdminAuthenticated` checks for `x-admin-key: dev-admin-key-2024`. Replace with a proper `role: 'admin'` flag on the `users` table.
- [ ] **Fix: Google OAuth sign-up flow incomplete** — The callback and token exchange exist but new-user creation via Google is not wired end-to-end. Complete the Google sign-in → account creation → onboarding redirect flow.

---

## PHASE 2 — High Priority — Revenue & Core Competitive Gaps

### 2A — Payments
- [ ] **Stripe deposits at public booking** — Add Stripe `PaymentIntent` to the public booking widget. Allow business owners to configure 0% (no charge), 25%, 50%, or 100% deposit, or a flat fee per service.
- [ ] **Card on file for no-show protection** — Use Stripe `SetupIntent` to save a card without charging. Charge automatically if client no-shows or cancels inside the policy window.
- [ ] **Refund flow** — Add `POST /api/appointments/:id/refund` with a Stripe refund call. Show a Refund button on completed appointment cards.
- [ ] **Split payment in POS** — Let a ticket be settled partially in cash and partially by card.
- [ ] **Gift cards / vouchers** — Issue and redeem gift cards through the POS. Create a `gift_cards` table with balance tracking.

### 2B — Calendar
- [ ] **Week view** — Add a 7-column week view alongside the existing day view. Most-used view in Phorest/Fresha.
- [ ] **Month view** — High-level month grid showing booking counts per day with click-to-day-view.
- [ ] **Drag-and-drop rescheduling** — Staff can drag an appointment card to a new time slot or column without opening a form.
- [ ] **Recurring appointments** — "Book every 4 weeks" or "Same day next month" option at checkout.
- [ ] **Waitlist** — When a slot is full, offer a waitlist place and auto-notify on cancellation.
- [ ] **Holiday / blackout dates** — A calendar picker UI to block specific dates beyond the weekly schedule.
- [ ] **Buffer time per service** — A cleanup buffer (e.g., 10 min) auto-blocked after every appointment for that service.
- [ ] **Staff breaks** — Allow scheduling Lunch, Training, etc. on the calendar as non-bookable blocks.

### 2C — Client Experience
- [ ] **Client self-service portal** — Magic-link login so clients can view, reschedule, or cancel their own appointments.
- [ ] **Client date of birth field** — Required for birthday automation. Add DOB to the `customers` table.
- [ ] **Intake forms / consultation questionnaires** — Attach a custom question form to a service. Clients fill it out at booking; answers stored against the appointment.
- [ ] **Client tagging** — Tag clients as VIP, New, Lapsed, Referral etc. for filtering and messaging.
- [ ] **Online rescheduling via confirmation link** — Clients can change their booking time themselves up to the policy cutoff.
- [ ] **Before & After photos per appointment** — Attach photos to a completed appointment, visible to staff only.

---

## PHASE 3 — Marketing & Automation

- [ ] **Automated re-booking reminders** — "It's been 6 weeks since your last cut — book again?" sent via SMS/email on a configurable per-service interval.
- [ ] **Lost-client win-back campaigns** — Auto-message clients who haven't visited in 90 days.
- [ ] **Birthday messages** — Auto-send a discount or greeting on the client's birthday (uses DOB field).
- [ ] **Bulk SMS / email campaigns** — Send a one-off promotion to a filtered segment.
- [ ] **Referral program** — Unique referral links for clients. Track in a `referrals` table; reward both parties.
- [ ] **Review request automation** — 2 hours after "Completed," auto-send an SMS with a Google review link (the infrastructure exists; wire the timing and per-store Google URL).
- [ ] **Promotional codes / discounts** — Create promo codes (% off, flat, first-visit, limited uses) redeemable at public booking.

---

## PHASE 4 — Analytics & Reporting

- [ ] **Dashboard charts** — Add revenue trend line chart, appointment volume bar chart, top services pie chart using `recharts` (already installed, not used).
- [ ] **Staff utilization report** — % of each staff member's available hours that are booked.
- [ ] **Service popularity report** — Revenue and bookings per service, trend over time.
- [ ] **Client retention report** — New vs. returning clients per week/month. Rebooking rate per staff member.
- [ ] **Cancellation & no-show rate** — Prominent metric on the dashboard.
- [ ] **Revenue forecasting** — Projected next-week/month revenue based on current bookings.
- [ ] **Commission report improvements** — Drill-down per appointment, CSV export, date range filter.
- [ ] **Styled Z-Report** — Printable end-of-day report with proper formatting.

---

## PHASE 5 — Inventory & Retail

- [ ] **POS auto-depletes stock** — Selling a product in the POS decrements `products.stock` automatically.
- [ ] **Low stock alerts** — In-app and email alert when stock drops below a configurable threshold.
- [ ] **Product barcode scanning** — Scan a barcode with the device camera (JS barcode library) to add a product to a POS ticket.
- [ ] **Vendor / purchase orders** — Create POs, track received quantities, update stock on receipt.

---

## PHASE 6 — Memberships, Packages & Loyalty

- [ ] **Service packages** — Sell a bundle (e.g., "10 haircuts for $180") that depletes with each visit.
- [ ] **Monthly memberships** — Recurring Stripe subscription for unlimited or discounted services.
- [ ] **Loyalty points** — Clients earn points per dollar spent, redeemable for discounts.

---

## PHASE 7 — Multi-Location & Integrations

- [ ] **Consolidated multi-location dashboard** — Combined revenue and appointment metrics across all locations for a single account.
- [ ] **Cross-location staff roaming** — Staff availability set per location.
- [ ] **Per-location service pricing** — Different prices at different locations under the same account.
- [ ] **Google Calendar sync (two-way)** — Staff sync their Certxa schedule to their personal Google Calendar.
- [ ] **Instagram "Book Now" button** — Meta API integration for booking directly from Instagram.
- [ ] **QuickBooks / Xero export** — Daily accounting export of revenue, taxes, and expenses.
- [ ] **Zapier / outbound webhooks** — Fire a webhook on appointment created, updated, or cancelled.
- [ ] **Public REST API with API keys** — Documented API for custom integrations (Phorest offers this).

---

## PHASE 8 — Staff & Operations

- [ ] **Staff time clock** — Clock in / clock out tracking for payroll compliance.
- [ ] **Payroll summary export** — CSV of hours, commission, and tips per staff member from the commission report.
- [ ] **Staff performance leaderboard** — Revenue, appointments, and average ticket per staff member.
- [ ] **Staff color fully wired on calendar** — The `color` column exists in the schema; wire it all the way through to column headers on the calendar.

---

## PHASE 9 — Security & Compliance

- [ ] **Two-factor authentication (2FA)** — Optional TOTP for owner logins.
- [ ] **Granular role permissions** — Manager, Receptionist, Stylist roles with different data access levels.
- [ ] **Audit log** — Track who changed what and when (appointment edits, price changes, refunds).
- [ ] **GDPR / data privacy** — "Request my data" and "Delete my account" flows for clients.
- [ ] **Session timeout** — Idle session auto-logout after a configurable period.

---

## PHASE 10 — UX Polish & Scale

- [ ] **Quick-add appointment modal** — Create a new appointment from the calendar without navigating away (modal instead of full page).
- [ ] **Drag-and-drop appointment creation** — Click and drag on an empty calendar slot to set duration visually.
- [ ] **Keyboard shortcuts** — `N` for new appointment, `Esc` to close, arrow keys to change calendar date.
- [ ] **Onboarding checklist for new accounts** — "Getting Started" checklist on first login to reduce churn.
- [ ] **In-app notification center** — Bell icon with real-time alerts for new bookings, cancellations, and low stock.
- [ ] **Dark mode for merchant portal** — Staff portal dark theme.
- [ ] **Multi-language support (i18n)** — Especially for the public booking widget. Spanish, French, Portuguese.
- [ ] **Improved mobile responsiveness on merchant portal** — Calendar and dashboard optimized for phone screens.
- [ ] **Progressive Web App (PWA)** — Manifest and service worker so staff can install from the browser.
- [ ] **QR code generator** — Per-store or per-service QR code for physical signage.
- [ ] **Multiple services per public booking** — Clients book a haircut + beard trim as one appointment.
- [ ] **Group booking** — Book for 2+ people simultaneously with automatic staff assignment.
- [ ] **Booking policy acceptance checkbox** — "I agree to the cancellation policy" before confirming.

---

## PHASE 11 — Technical Debt & Infrastructure

- [ ] **Rate limiting on public endpoints** — Add `express-rate-limit` to all `/api/public/` routes.
- [ ] **Pagination on all list endpoints** — `/api/appointments`, `/api/customers`, `/api/products` — add `page` and `limit` query params.
- [ ] **React Error Boundaries** — Wrap the calendar and POS in error boundaries so one uncaught error doesn't crash the whole app.
- [ ] **WebSockets for real-time calendar** — Use the already-installed `ws` package to push appointment changes to all connected clients.
- [ ] **Image uploads to cloud storage** — Replace base64 DB storage for avatars and service images with Cloudflare R2 or S3.
- [ ] **Database indexes** — Add indexes on `appointments.date`, `appointments.storeId`, `appointments.staffId`, `customers.storeId`.
- [ ] **TypeScript strict mode** — Enable `strict: true` in `tsconfig.json` to surface hidden bugs.
- [ ] **Structured logging** — Replace `console.log` with `pino` and JSON-structured logs.
- [ ] **Health check endpoint** — `GET /health` returning DB connectivity status.
- [ ] **Background job queue** — Replace `setInterval` reminder scheduler with BullMQ + Redis for reliability and horizontal scaling.
- [ ] **Input validation audit** — Audit every POST/PUT route for Zod validation; several routes accept unvalidated bodies.
- [ ] **Zero automated tests** — Add Vitest unit tests for the availability algorithm and Playwright E2E tests for the full public booking flow.
