# Certxa — Platform Improvement Roadmap
> Deep audit vs. Phorest, Fresha, Vagaro, Booksy, and Zomli

---

## 🔴 CRITICAL — Bugs & Broken Features (Fix First)

- [ ] **Add-on IDs not saved on public booking** — The `/api/public/store/:slug/book` endpoint receives `addonIds` from the client but does not process or persist them to the `appointment_addons` table. Customers can select add-ons but they silently vanish.
- [ ] **Email reminder scheduler is a stub** — `server/mail.ts` has `startEmailReminderScheduler()` declared but never implemented. SMS reminders fire; email reminders never do.
- [ ] **SMS opt-out not handled** — "Reply STOP" is in the template text but there is no Twilio inbound webhook to actually honor unsubscribes, creating compliance risk.
- [ ] **Password reset flow is missing** — No "Forgot Password" email link exists. Users who lose their password have no self-service recovery path.
- [ ] **No booking cancellation window enforcement** — Clients can cancel right up to the appointment minute with no configurable policy (e.g., "no cancellations within 24 hours").
- [ ] **No timezone edge-case handling** — Availability calculation uses `date-fns-tz` but DST transitions have not been stress-tested; slots around the clock-change hour can be off by one hour.
- [ ] **Admin auth uses a dev key** — `isAdminAuthenticated` is gated on a hardcoded header key. Replace with a proper role in the `users` table before production.
- [ ] **Google OAuth partially wired** — The callback and session logic exist but the full sign-up/link flow for new users via Google is incomplete.

---

## 🟠 HIGH PRIORITY — Core Platform Gaps

### Payments
- [ ] **Customer payments at booking** — Integrate Stripe on the public booking widget to collect deposits or full prepayment. The `appointments.total_paid` column exists but is never set during public booking.
- [ ] **Configurable deposit rules** — Let business owners require 25%, 50%, 100%, or a flat fee deposit per service. Store the policy in the `locations` table.
- [ ] **No-show & late cancellation fees** — Save card on file via Stripe `SetupIntent` and charge automatically if the client no-shows or cancels within the restricted window.
- [ ] **Split payment in POS** — Allow a ticket to be paid partly in cash and partly by card (e.g., cash for service, card for tip).
- [ ] **Refund flow** — No route or UI exists to issue full or partial refunds. Add `POST /api/appointments/:id/refund` with Stripe refund call and status update.
- [ ] **Stripe Connect for multi-tenant payouts** — If the platform ever facilitates payments on behalf of stores, Stripe Connect onboarding and payouts need to be added.
- [ ] **Gift cards / vouchers** — Issue and redeem gift cards in the POS. Common in Fresha and Vagaro, a significant booking driver.

### Calendar & Scheduling
- [ ] **Week and Month calendar views** — Currently only Day view. Week view is the most-used view in Fresha/Phorest. Add toggle between Day / Week / Month.
- [ ] **Drag-and-drop rescheduling** — Let staff drag an appointment card to a new time slot or staff column without opening a form. Industry standard.
- [ ] **Recurring / repeat appointments** — Allow "Book every 4 weeks" or "Book same day next month" at checkout. Critical for salons with regulars.
- [ ] **Waitlist management** — When a slot is full, offer the client a place on a waitlist and auto-notify them if a cancellation opens up.
- [ ] **Holiday / blackout dates** — A calendar UI to block out specific dates (holidays, vacations) beyond the weekly schedule.
- [ ] **Buffer times between appointments** — A per-service setting to auto-block 10–15 minutes after an appointment for cleanup, independent of the service duration.
- [ ] **Double-booking / overlap detection** — Add a hard check and a visible warning when manually creating appointments that overlap.
- [ ] **Staff breaks** — Allow scheduling named breaks (Lunch, Training) on the calendar that block that staff from being booked during that window.

### Client Experience & Portal
- [ ] **Client self-service portal** — Clients should be able to log in (phone/email magic link), view their upcoming/past appointments, reschedule, and cancel — not just via a confirmation link.
- [ ] **Client profiles enrichment** — Add fields: date of birth (for birthday messages), preferred staff, allergy/consultation notes, preferred contact method.
- [ ] **Intake forms / consultation questionnaires** — Let owners attach a form to a service (e.g., "Are you allergic to any hair products?") that clients fill out at booking. Store answers against the appointment.
- [ ] **Before & After photos per appointment** — Attach photos to a completed appointment, visible only to staff. Used extensively in Phorest.
- [ ] **Client tagging / segmentation** — Tag clients as "VIP", "New", "Lapsed", "Referral" etc. for filtering and targeted messaging.
- [ ] **Online rescheduling** — Clients can change their booking time themselves via the confirmation link, up to the policy cutoff.

---

## 🟡 MEDIUM PRIORITY — Competitive Feature Parity

### Marketing & Automation
- [ ] **Automated re-booking reminders** — "It's been 6 weeks since your last cut — book again?" sent via SMS/email on a configurable interval per service type.
- [ ] **Lost client win-back campaigns** — Auto-send a message to clients who haven't visited in 90 days with a special offer.
- [ ] **Birthday messages** — Auto-send a birthday discount or message on the client's birthday (requires DOB field on client profile).
- [ ] **Bulk SMS / email campaigns** — Let owners send a one-off message or promotion to a filtered segment (e.g., all clients who visited in the last 30 days).
- [ ] **Referral program** — Clients get a unique referral link / code. When a new client books using it, both get a reward. Tracked in a new `referrals` table.
- [ ] **Review request automation** — 2 hours after an appointment is marked "Completed," auto-send an SMS with a Google review link (currently partial via Google integration).
- [ ] **Promotional codes / discounts** — Create and manage promo codes (percentage off, flat discount, first-visit, limited uses) that clients can enter at public booking checkout.

### Analytics & Reporting
- [ ] **Dashboard charts** — `recharts` is installed but unused. Add revenue trend line chart, appointment volume bar chart, top services pie chart on the dashboard.
- [ ] **Staff utilization report** — What % of each staff member's available hours are booked? Show side-by-side.
- [ ] **Service popularity report** — Which services generate the most revenue and bookings? Trend over time.
- [ ] **Client retention report** — New vs. returning clients per week/month. Rebooking rate per staff member.
- [ ] **Cancellation & no-show rate** — Track and display these prominently. A >20% rate is actionable.
- [ ] **Revenue forecasting** — Based on current bookings and historical trends, forecast next week/month revenue.
- [ ] **Commission report improvements** — Current report is basic. Add drill-down per appointment, export to CSV, and date range filtering.
- [ ] **Z-Report improvements** — The cash drawer Z-Report exists but is text-only. Add a printable styled layout matching a real end-of-day report.

### Inventory & Retail
- [ ] **POS auto-depletes stock** — When a product is sold through the POS, the `products.stock` count should automatically decrement.
- [ ] **Low stock alerts** — Notify the owner via email/in-app when a product's stock drops below a configurable threshold.
- [ ] **Product barcode scanning** — Support adding products to a POS ticket by scanning a barcode (using the device camera via a JS barcode library).
- [ ] **Vendor / purchase orders** — Create purchase orders to restock from named vendors. Track received quantities against ordered quantities.
- [ ] **Products integrated in public booking upsell** — "Add a bottle of shampoo to your appointment" shown at checkout.

### Memberships & Packages
- [ ] **Service packages** — Sell a bundle of services (e.g., "10 haircuts for $180") that deplete with each visit. Common in Fresha/Vagaro.
- [ ] **Monthly memberships** — Charge a recurring Stripe subscription for unlimited or discounted services each month (e.g., "Member: 2 cuts/month for $49").
- [ ] **Loyalty points** — Clients earn points per dollar spent, redeemable for discounts. Creates retention and gamification.

---

## 🟢 LOWER PRIORITY — Polish & Scale

### Staff & Operations
- [ ] **Staff time clock** — Clock in / clock out for each staff member to track actual hours worked vs. scheduled. Required for payroll in many jurisdictions.
- [ ] **Payroll summary export** — From the commission report, generate a payroll export (CSV) with hours, commission, and tips per staff member.
- [ ] **Staff performance leaderboard** — Revenue generated, appointments completed, and average ticket per staff member. Motivates the team.
- [ ] **Staff app / dedicated staff login view** — A simplified mobile-optimized view for staff showing just their own schedule and client notes for the day (the `StaffDashboard.tsx` and `StaffCalendar.tsx` exist but could be enhanced).
- [ ] **Staff color assignment on calendar** — Let owners pick a custom color per staff member to make the calendar more readable. Column exists in schema, wire it fully to the calendar UI.

### Multi-Location
- [ ] **Consolidated multi-location dashboard** — An owner with 3 locations should see combined revenue, appointments, and top metrics across all locations on one screen.
- [ ] **Cross-location staff roaming** — Staff who work at multiple locations can have availability set per location.
- [ ] **Per-location pricing** — Allow different service prices at different locations under the same account.

### Integrations & API
- [ ] **Zapier / webhook outbound** — Fire a webhook on appointment created, updated, or cancelled. Allows integration with any external tool without Certxa needing to build every connector.
- [ ] **Google Calendar sync (two-way)** — Staff can sync their Certxa schedule to their personal Google Calendar.
- [ ] **Instagram "Book Now" button** — With the Meta API, enable a "Book" button directly on the business's Instagram profile.
- [ ] **QuickBooks / Xero export** — Daily/weekly accounting export of revenue, taxes, and expenses for bookkeeping.
- [ ] **Public REST API** — Documented public API with API keys so businesses can build custom integrations (Phorest has this).
- [ ] **Mailchimp / Klaviyo sync** — Push client list and booking data to an email marketing platform for advanced campaigns.

### Security & Compliance
- [ ] **Two-factor authentication (2FA)** — Add optional TOTP-based 2FA for owner logins. Required for HIPAA-adjacent health/wellness businesses.
- [ ] **Role-based permissions granularity** — Currently binary (authenticated vs. not). Add granular roles: Manager (can see all revenue), Receptionist (can book, no financial data), Stylist (own schedule only).
- [ ] **Audit log** — Track who changed what and when (appointment edits, price changes, refunds) for accountability.
- [ ] **GDPR / data privacy** — Add a "Request my data" and "Delete my account" flow for clients to comply with GDPR/CCPA.
- [ ] **Session timeout** — Idle session auto-logout after configurable period (currently sessions persist indefinitely).

### UX & Accessibility
- [ ] **Drag-and-drop appointment creation on calendar** — Click and drag down on an empty slot to set duration visually, rather than navigating to a form.
- [ ] **Quick-add appointment modal** — Instead of navigating to `/booking/new`, open a modal directly on the calendar.
- [ ] **Keyboard shortcuts** — `N` for new appointment, `Esc` to close a modal, arrow keys to change calendar date. Power users expect this.
- [ ] **Onboarding checklist for new accounts** — A "Getting Started" checklist on first login (Add your services → Set your hours → Invite staff → Share your booking link). Reduces churn dramatically.
- [ ] **In-app notification center** — Bell icon with real-time alerts: new booking, cancellation, low stock, bad review.
- [ ] **Dark mode for merchant portal** — The landing pages are already dark. Extend that to the dashboard for staff who stare at it all day.
- [ ] **Multi-language support (i18n)** — Especially for the public booking widget. Spanish, French, Portuguese are high-value given the target industries (salons, barbershops).
- [ ] **Improved mobile responsiveness on merchant portal** — The dashboard and calendar are functional but not optimized for mobile. Staff often check schedules on their phone.
- [ ] **Progressive Web App (PWA)** — Add a manifest and service worker so staff can install Certxa as a home-screen app on any device without a native app.

### Public Booking Widget
- [ ] **Google / Apple / Facebook social login for clients** — Reduces friction at booking. The platform already has Google OAuth wiring on the merchant side — extend to clients.
- [ ] **QR code generator per service or store** — Business owners can print and display a QR code (physical signage) that goes directly to a service's booking page.
- [ ] **Real-time slot counter** — "Only 2 spots left today" urgency indicator on the booking widget.
- [ ] **Booking policy acceptance checkbox** — "I agree to the cancellation policy" before confirming. Creates legal protection.
- [ ] **Multiple services in one booking** — Allow clients to book a haircut + beard trim as one appointment (vs. two separate bookings). Currently only 1 service per booking.
- [ ] **Group booking** — "Book for 2 people at the same time" with automatic staff assignment for both. Common for nail salons and spas.

---

## 📐 TECHNICAL DEBT & INFRASTRUCTURE

- [ ] **TypeScript strict mode** — Enable `strict: true` in `tsconfig.json`. There are implicit `any` types throughout `server/routes.ts` that mask bugs.
- [ ] **API response types** — Define shared TypeScript interfaces for every API response shape in `shared/`. Currently responses are typed as `any` on the client.
- [ ] **Test coverage** — Zero automated tests. Add Vitest unit tests for the availability algorithm (most complex business logic) and Playwright E2E tests for the full booking flow.
- [ ] **Rate limiting** — No rate limiting on public endpoints (`/api/public/`). Add express-rate-limit to prevent scraping and abuse.
- [ ] **Input sanitization** — Form inputs are validated with Zod on some routes but not all. Audit every `POST`/`PUT` route for validation completeness.
- [ ] **Error boundary on frontend** — No React error boundaries. An uncaught JS error on the calendar crashes the whole page instead of showing a graceful fallback.
- [ ] **Image upload to cloud storage** — Staff avatars and service images are stored as base64 strings in the database. Replace with Cloudflare R2 or S3 to keep the DB lean and images fast.
- [ ] **Database indexes** — Add indexes on `appointments.date`, `appointments.storeId`, `appointments.staffId`, and `customers.storeId` for query performance as data grows.
- [ ] **Pagination on all list endpoints** — `/api/appointments`, `/api/customers`, `/api/products` have no pagination. With a busy salon this will become slow within months.
- [ ] **WebSockets for real-time calendar updates** — The `ws` package is installed. Use it to push appointment changes to all connected clients so two receptionists see the same state without refreshing.
- [ ] **Structured logging** — Replace `console.log` with a proper logger (e.g., `pino`) with log levels and structured JSON output for production observability.
- [ ] **Health check endpoint** — Add `GET /health` returning DB connectivity status for the deployment load balancer to use.
- [ ] **Background job queue** — The reminder scheduler runs on a `setInterval` in the main process. Move to a proper queue (BullMQ + Redis) so reminders survive server restarts and scale horizontally.
