# Certxa SalonOS — Full Platform Audit & Development Checklist

**Date:** May 8, 2026  
**Stack:** React 18 + TypeScript (frontend) · Node.js / Express (backend) · PostgreSQL / Drizzle ORM · Vite · Tailwind CSS · shadcn/ui  
**Database:** 56 tables · 14 migrations · 136+ performance indexes  
**API Surface:** ~250+ REST endpoints across 6 route files (~7,600 lines of server code)

---

## Legend

| Symbol | Meaning |
|--------|---------|
| ✅ | Fully built and working |
| 🟡 | Built but needs configuration / credentials / polish |
| 🔲 | Not yet started |
| 🚧 | Partially built — functional but incomplete |

---

## 1. Infrastructure & Architecture

| Item | Status | Notes |
|------|--------|-------|
| Express + TypeScript server | ✅ | `server/index.ts` · port 5000 · binds `0.0.0.0` |
| PostgreSQL + Drizzle ORM | ✅ | Full schema in `shared/schema.ts` (56 tables) |
| Vite frontend build | ✅ | HMR in dev · `dist/public` in prod |
| esbuild server bundle | ✅ | Outputs `dist/index.cjs` (ESM-safe) |
| Shared Zod route contracts | ✅ | `shared/routes.ts` — type-safe across client & server |
| Multi-timezone support | ✅ | All dates stored UTC · `date-fns-tz` on frontend |
| Session management | ✅ | `express-session` + `SESSION_SECRET` |
| In-process TTL cache | ✅ | `server/cache.ts` · 2,000-entry LRU · 60–600s TTL windows |
| Cursor-based pagination | ✅ | `server/lib/pagination.ts` · replaces OFFSET on large tables |
| PostgreSQL connection pool | ✅ | Production pool config in `server/db.ts` |
| 136 database indexes | ✅ | Migration `0009_db_performance_indexes.sql` |
| PHP middleware / proxy | ✅ | `server/php-proxy.ts` · serves PHP marketing pages alongside React SPA |
| Subdomain middleware | ✅ | `server/middleware/subdomain.ts` · routes `[slug].certxa.com` to LaunchSite |
| Static file priority | ✅ | Assets served before auth middleware — survives DB downtime |
| Error boundary | ✅ | `client/src/components/ErrorBoundary.tsx` |
| Client-side error logging | ✅ | `POST /api/client-errors` endpoint |
| SSR for marketing pages | ✅ | Vite `renderToString` on production for SEO |

---

## 2. Authentication & User Management

| Item | Status | Notes |
|------|--------|-------|
| Email / password registration | ✅ | `server/auth.ts` + bcrypt |
| Email / password login | ✅ | Session-based, `keepSignedIn` option |
| Google OAuth login (Sign in with Google) | ✅ | Passport.js · `GOOGLE_CLIENT_ID` required |
| Google OAuth callback | ✅ | New users → `TrialService.setupTrialForUser()` → `/onboarding`; returning users → `/manage` |
| Staff login (separate flow) | ✅ | `/staff-auth` page · PIN or password |
| Staff calendar access (PIN-based) | ✅ | Enable/disable per-staff from admin |
| Password reset (email link) | ✅ | Token table · `forgot-password` + `reset-password` pages |
| Account locked page | ✅ | `AccountLocked.tsx` |
| Account suspended page | ✅ | `AccountSuspended.tsx` |
| Session restore on refresh | ✅ | `hasStoredSession` flag in `useAuth` hook |
| Role-based permissions | ✅ | `permissions` + `roles` tables · `requirePermission()` middleware |
| `<Can>` permission component | ✅ | Fine-grained UI gating per permission key |
| Team management UI | ✅ | `/team` page · assign roles & permissions per staff member |
| AI Chatbot API (key-protected) | ✅ | `server/chatbot.ts` · lookup / confirm / cancel / reschedule via REST |
| Platform admin auth (`isAdmin` flag) | ✅ | `is_admin` boolean on `users` table · `isAdminAuthenticated` checks DB, no hardcoded keys |

---

## 3. 60-Day Free Trial System

| Item | Status | Notes |
|------|--------|-------|
| Trial setup on registration | ✅ | `setupTrialForUser()` called in `server/auth.ts` |
| Trial setup fallback on onboarding | ✅ | Belt-and-suspenders: also called during onboarding completion |
| Trial status API | ✅ | `GET /api/trial/status` → `{daysRemaining, subscriptionStatus, isActive}` |
| Hourly trial expiration scheduler | ✅ | `server/services/trial-expiration.ts` · marks locations `Inactive` |
| Trial paywall middleware | ✅ | `requireActiveTrial` on write endpoints (create staff, services, appointments) |
| Trial paywall modal (in-app) | ✅ | `TrialPaywallModal.tsx` · shown when trial-gated action blocked |
| Full-width trial countdown banner | ✅ | `TrialCountdownBanner.tsx` · 4 tiers: blue / amber / red / expired |
| Banner dismiss (per-session) | ✅ | Dismissible for non-expired tiers; re-appears when urgency tier increases |
| Reactivation on Stripe payment | ✅ | `invoice.payment_succeeded` webhook re-activates account |
| Admin trial controls | ✅ | Extend trial · reset trial · activate subscription per user |
| Trial email reminders (30/7/1 day) | ✅ | `server/services/trial-reminders.ts` · hourly scheduler · 30/7/1-day Mailgun emails |

---

## 4. Billing & Subscription (Stripe)

| Item | Status | Notes |
|------|--------|-------|
| Stripe subscription plans | ✅ | Plans stored in DB · managed via admin billing plans manager |
| Checkout session creation | ✅ | `POST /api/billing/create-checkout` |
| Customer portal (manage plan) | ✅ | `POST /api/billing/portal` → Stripe Customer Portal URL |
| Subscription status tracking | ✅ | `stripeSettings` table · linked to `locations.accountStatus` |
| Webhook handler | ✅ | `server/routes/billing-webhooks.ts` · 10 event types handled |
| `customer.updated` | ✅ | Syncs billing email |
| `subscription.created/updated/deleted` | ✅ | Keeps DB in sync with Stripe |
| `invoice.payment_succeeded` | ✅ | Reactivates account · caches cleared |
| `invoice.payment_failed` | ✅ | Marks account status |
| `payment_intent.succeeded/failed` | ✅ | Records payment intents |
| `charge.refunded` | ✅ | Logs refunds |
| `dispute.created/closed` | ✅ | Dispute logging |
| `checkout.session.completed` | ✅ | Subscription linkage |
| Admin billing dashboard | ✅ | `Admin/BillingDashboard.tsx` · MRR · all subscriptions · manual controls |
| Admin billing plans manager | ✅ | `Admin/BillingPlansManager.tsx` · create/edit/delete plans |
| Billing page (customer-facing) | ✅ | `manage/BillingPage.tsx` · 1,069 lines · invoices · upgrade/downgrade |
| Magstripe POS payments | 🟡 | Built · requires Stripe key starting with `sk_test_` |
| Stripe live key (production) | 🟡 | `STRIPE_SECRET_KEY` secret not set |
| Seat-based billing | 🚧 | Schema exists · billing service has seat tracking · UI not wired |

---

## 5. Onboarding Wizard

| Item | Status | Notes |
|------|--------|-------|
| 4-step wizard | ✅ | `Onboarding.tsx` · business type → details → hours → complete |
| Step 1 — Business type selector | ✅ | Groups: booking / queue / pro |
| Step 2 — Business details | ✅ | Name, phone, address, city, timezone |
| Step 3 — Business hours | ✅ | Day-by-day open/close with toggle |
| Step 4 — Completion | ✅ | Saves to DB · redirects to `/calendar` or `/pro-dashboard` |
| Onboarding data templates | ✅ | `server/onboarding-data.ts` · seeds sample services & staff |
| Pro setup flow | ✅ | `ProFeaturesSetup.tsx` · separate wizard for Certxa Pro |

---

## 6. Dashboard & Calendar

| Item | Status | Notes |
|------|--------|-------|
| Main dashboard | ✅ | `Dashboard.tsx` · today's appointments, revenue, staff status |
| Weekly calendar view | ✅ | `Calendar.tsx` · drag-to-create, click-to-view, column per staff |
| Month calendar view | ✅ | Grid view in `Calendar.tsx` |
| Mobile calendar view | ✅ | `MobileCalendarView.tsx` · list-based for small screens |
| New booking flow | ✅ | `NewBooking.tsx` · service → staff → time → customer → confirm |
| Reschedule appointment | ✅ | Reuses `NewBooking.tsx` with `editId` param |
| Cancel appointment | ✅ | Inline cancel panel with reason |
| Appointment status tracking | ✅ | pending · confirmed · completed · cancelled · no_show |
| Auto no-show marking | ✅ | Migration `0008_add_auto_mark_no_shows.sql` |
| Appointment add-ons | ✅ | Link add-on services to any appointment |
| Staff calendar (read-only for staff) | ✅ | `StaffCalendar.tsx` · scoped to that staff member |
| Staff dashboard | ✅ | `StaffDashboard.tsx` |
| Notification bell | ✅ | `NotificationBell.tsx` · real-time in-app notifications |
| Recurring appointments | 🔲 | Schema does not yet have a recurrence rule column |

---

## 7. Services, Staff & Availability

| Item | Status | Notes |
|------|--------|-------|
| Service categories (CRUD) | ✅ | Drag-to-reorder · color-coded |
| Services (CRUD) | ✅ | Name · price · duration · description · category |
| Add-ons (CRUD) | ✅ | Linked to services · shown at booking |
| Staff (CRUD) | ✅ | Profile · photo · commission · services assigned |
| Staff–service assignments | ✅ | Many-to-many `staff_services` table |
| Staff availability rules | ✅ | Day-of-week rules + exceptions · `staffAvailability` table |
| Real-time availability engine | ✅ | `GET /api/availability/slots` · respects hours, existing bookings, buffer |
| Commission tracking | ✅ | `commissionEnabled` per staff · payout frequency on store |
| Commission report page | ✅ | `CommissionReport.tsx` · filterable by staff / date range |
| Staff password change | ✅ | `StaffPasswordChange.tsx` |
| Staff detail page | ✅ | `StaffDetail.tsx` |

---

## 8. Customers & CRM

| Item | Status | Notes |
|------|--------|-------|
| Customer list | ✅ | `Customers.tsx` · search · filter |
| Customer profile | ✅ | `ClientProfile.tsx` · appointment history · spend · notes |
| Client lookup (phone search) | ✅ | `ClientLookup.tsx` · fast phone-number search |
| Global CRM fuzzy search | ✅ | `GET /api/manage/crm-search` · pg_trgm across 5 entities |
| Customer intake forms (builder) | ✅ | Drag-to-add fields · `IntakeForms.tsx` |
| Public intake form submission | ✅ | `POST /api/intake-forms/:id/respond` · no auth required |
| Form responses (view) | ✅ | Responses list in dashboard |
| Customer portal (self-service) | 🔲 | Customers cannot log in to view/manage their own bookings |

---

## 9. Products & Inventory

| Item | Status | Notes |
|------|--------|-------|
| Product catalog (CRUD) | ✅ | `Products.tsx` · name · brand · price · stock |
| Stock tracking | ✅ | Stock level per product |
| Products sold via POS | ✅ | Products appear in POS interface |
| Low-stock alerts | ✅ | `lowStockThreshold` column on products · alert banners in `Products.tsx` · badge per card |
| Supplier / purchase order management | 🔲 | Not started |

---

## 10. Point of Sale (POS) & Cash Drawer

| Item | Status | Notes |
|------|--------|-------|
| POS interface | ✅ | `POSInterface.tsx` · services + products · discounts |
| Cash drawer sessions | ✅ | Open · close · Z-report |
| Drawer actions (cash in/out) | ✅ | Logged to `drawer_actions` table |
| Discrepancy acknowledgement | ✅ | Expected vs. actual mismatch flow |
| Z-report | ✅ | End-of-day report endpoint |
| Magstripe card payment | 🟡 | Built · blocked without test Stripe key |
| Receipt generation | ✅ | `Receipt.tsx` · printable receipt component |
| Cash drawer hardware integration | 🔲 | No USB/serial drawer trigger implemented |

---

## 11. SMS Notifications (Twilio)

| Item | Status | Notes |
|------|--------|-------|
| Twilio integration | ✅ | `server/sms.ts` · per-store credentials from `sms_settings` table |
| SMS settings UI | ✅ | `SmsSettings.tsx` · account SID · auth token · phone number · test send |
| Booking confirmation SMS | ✅ | Sent on appointment create |
| Appointment reminder SMS | ✅ | Configurable hours-before · `reminderEnabled` flag |
| Review request SMS (post-visit) | ✅ | `server/sms.ts` · `review_request` type |
| Queue position SMS | ✅ | `server/queue-sms-scheduler.ts` · geolocation-based dispatch |
| SMS log (view) | ✅ | `GET /api/sms-log/:storeId` |
| Outbound dialer (voice) | ✅ | `server/dialer.ts` · Twilio voice calls for confirmations · DTMF response |
| Twilio credentials | 🟡 | Must be set per-store in admin settings (not global env) |
| Two-way SMS (inbound STOP/UNSTOP) | ✅ | `POST /api/webhooks/twilio/incoming` · `sms_opt_outs` table · `sendSms()` checks opt-out before sending |

---

## 12. Email Notifications (Mailgun)

| Item | Status | Notes |
|------|--------|-------|
| Mailgun integration | ✅ | `server/mail.ts` · platform-level Mailgun key |
| Email settings UI | ✅ | `MailSettings.tsx` · from name · from email · reply-to |
| Booking confirmation email | ✅ | HTML template sent on create |
| Appointment reminder email | ✅ | Scheduler fires before appointments |
| Review request email | ✅ | Post-appointment review link |
| Password reset email | ✅ | Token-based reset link |
| Platform Mailgun test endpoint | ✅ | `POST /api/admin/platform-settings/test-mailgun` |
| `MAILGUN_API_KEY` configured | 🟡 | Secret not set in environment |
| Trial expiry email reminders | 🔲 | 30-day / 7-day / 1-day reminders not built |
| Transactional email templates (HTML) | 🚧 | Basic templates · not brand-designed |

---

## 13. Google Business Profile Integration

| Item | Status | Notes |
|------|--------|-------|
| Google OAuth flow | ✅ | `server/google-business-api.ts` · `GoogleBusinessAPIManager` class |
| OAuth connect UI | ✅ | `GoogleConnectGate.tsx` + `GoogleBusinessProfileSetup.tsx` |
| Auth URL generation | ✅ | `GET /api/google-business/auth-url` |
| OAuth callback + token storage | ✅ | `POST /api/google-business/callback` |
| Location list & connect | ✅ | `POST /api/google-business/locations` + `connect-location` |
| Sync Google reviews | ✅ | `POST /api/google-business/sync-reviews/:storeId` · also auto-syncs every 6 hours via scheduler |
| View reviews | ✅ | `GoogleReviewsManager.tsx` · star filter · sort |
| Draft review response | ✅ | `ReviewResponseDialog.tsx` · draft saved to DB |
| Publish response to Google | ✅ | `POST /api/google-business/review-response/:id/publish` |
| Review stats | ✅ | `GET /api/google-business/reviews-stats` · avg rating · breakdown |
| `GOOGLE_CLIENT_SECRET` configured | 🟡 | Secret not set in environment |
| Auto-sync (scheduled) | 🔲 | Reviews only sync on manual trigger |

---

## 14. Waitlist

| Item | Status | Notes |
|------|--------|-------|
| Waitlist management | ✅ | `Waitlist.tsx` · add · move to appointment · remove |
| Waitlist API (CRUD) | ✅ | 4 endpoints in `routes.ts` |
| Waitlist → appointment conversion | ✅ | One-click promote from waitlist |

---

## 15. Gift Cards

| Item | Status | Notes |
|------|--------|-------|
| Gift card creation | ✅ | `GiftCards.tsx` · auto-generated codes |
| Gift card balance check | ✅ | `GET /api/gift-cards/check/:code` · public endpoint |
| Gift card redemption | ✅ | `POST /api/gift-cards/redeem` · logs transaction |
| Gift card balance update | ✅ | `PUT /api/gift-cards/:id` |
| Transaction history | ✅ | `gift_card_transactions` table |
| Customer-facing gift card purchase | 🔲 | Customers cannot buy gift cards online |

---

## 16. Loyalty Program

| Item | Status | Notes |
|------|--------|-------|
| Loyalty transactions (view) | ✅ | `Loyalty.tsx` · per-customer point history |
| Manual point adjustment | ✅ | `POST /api/loyalty/adjust` |
| Auto-earn on appointment completion | ✅ | Awards 1 pt per $1 paid when appointment marked completed · `loyaltyTransactions` row inserted |
| Point redemption at POS | 🔲 | No redemption flow in POS interface |
| Loyalty program settings | 🔲 | No UI to configure earn rate / redemption rate |

---

## 17. Analytics & Reports

| Item | Status | Notes |
|------|--------|-------|
| Analytics dashboard | ✅ | `Analytics.tsx` · revenue · bookings · top services |
| Revenue reports | ✅ | Filterable by date range |
| Commission report | ✅ | `CommissionReport.tsx` · per-staff breakdown |
| Z-report (cash drawer end-of-day) | ✅ | `GET /api/cash-drawer/z-report` |
| Admin platform stats | ✅ | `GET /api/admin/dashboard/stats` · MRR · total accounts · new signups |
| Admin store-level analytics | ✅ | `GET /api/admin/stores/:id/analytics` |
| Reports page (Pro) | ✅ | `pro-dashboard/ReportsPage.tsx` |
| Staff performance report | 🔲 | No per-staff KPIs (utilization rate, no-show rate) |
| Retention / churn report | 🔲 | No customer retention analytics |
| Revenue export (CSV) | 🔲 | No CSV/Excel export of financial reports |

---

## 18. Certxa Queue (Virtual Check-in)

| Item | Status | Notes |
|------|--------|-------|
| Public check-in page | ✅ | `queue/PublicCheckIn.tsx` · at `/queue/:slug` · auto-polls every 30s |
| TV display board | ✅ | `queue/QueueDisplay.tsx` · shows current queue for lobby screen |
| Staff queue dashboard | ✅ | `queue/QueueDashboard.tsx` · call next · serve · remove |
| Queue settings | ✅ | `queue/QueueSettings.tsx` · enable/disable · max size · avg service time |
| Geolocation SMS dispatch | ✅ | `server/queue-sms-scheduler.ts` · SMS when customer is ~5 min away |
| Queue position tracking | ✅ | `GET /api/public/queue/:slug/position/:id` |
| Queue cancel (self-service) | ✅ | `PUT /api/public/queue/cancel/:id` |
| Queue → appointment conversion | 🔲 | No one-click "convert queue entry to appointment" |

---

## 19. Certxa Pro Dashboard (Field Services)

| Item | Status | Notes |
|------|--------|-------|
| Pro dashboard layout | ✅ | `pro-dashboard/ProDashboardLayout.tsx` · sidebar navigation |
| Dispatch dashboard | ✅ | `DispatchDashboard.tsx` |
| Interactive dispatch map | ✅ | `MapPage.tsx` · crew locations on map |
| Jobs board | ✅ | `JobsBoard.tsx` · kanban-style |
| Job detail | ✅ | `JobDetail.tsx` · notes · status · crew assignment |
| New job creation | ✅ | `NewJob.tsx` |
| Estimates (CRUD) | ✅ | `EstimatesPage.tsx` · `pro_estimates` table |
| Estimate → Invoice conversion | ✅ | `POST /api/pro/estimates/:id/convert` |
| Invoices (CRUD) | ✅ | `InvoicesPage.tsx` · `pro_invoices` table |
| Crew management | ✅ | `CrewsPage.tsx` · crews + crew location tracking |
| Pro CRM (customers) | ✅ | `CustomersPage.tsx` · `pro_customers` table |
| Schedule page | ✅ | `SchedulePage.tsx` |
| Reports (Pro) | ✅ | `ReportsPage.tsx` |
| Settings (Pro) | ✅ | `SettingsPage.tsx` |
| Crew mobile API | ✅ | `server/routes/crew-mobile.ts` · mobile-friendly endpoints |
| Google Reviews (Pro) | ✅ | `GoogleReviewsPage.tsx` |
| Pro feature setup wizard | ✅ | `ProFeaturesSetup.tsx` |
| Pro lead capture | ✅ | `POST /api/pro/leads` · stores lead in `pro_leads` table |
| Mobile app (iOS/Android) for crews | 🔲 | API ready · no native app built |
| Invoice PDF generation | 🔲 | Invoices exist in DB · no PDF export |
| Online payment link (invoice) | 🔲 | No Stripe payment link generated from invoice |

---

## 20. Reviews (Internal)

| Item | Status | Notes |
|------|--------|-------|
| Post-appointment review form | ✅ | `ReviewSubmit.tsx` · public URL per appointment |
| Review submission | ✅ | `POST /api/reviews/submit` |
| Review management dashboard | ✅ | `Reviews.tsx` · star filter · flag · delete |
| Review stats | ✅ | `GET /api/reviews/stats` · avg rating · count by star |
| Auto review request (SMS + email) | ✅ | `server/sms.ts` + `server/mail.ts` · `review_request` type |
| Reply to internal review | 🚧 | Schema has `review_responses` · UI reply flow not surfaced |

---

## 21. LaunchSite Builder (Salon Websites)

| Item | Status | Notes |
|------|--------|-------|
| LaunchSite admin panel (PHP) | ✅ | `php/launchsite/admin.php` · full CRUD for site sections |
| Template selection | ✅ | 6 templates available |
| Template: luxury-nails-spa | ✅ | Full built-out template |
| Template: nail-salon-template-1 | ✅ | |
| Template: project-bolt (3 variants) | ✅ | |
| Template: project-sb1 | ✅ | |
| Live preview | ✅ | `php/launchsite/preview.php` |
| Subdomain assignment | ✅ | `subdomains` table · `[slug].certxa.com` routing |
| Media library (upload/manage) | ✅ | `admin-media-library.php` + `admin-media-upload.php` |
| Inactive site → 402 page | ✅ | `server/middleware/subdomain.ts` · returns "account inactive" on expired trial |
| Booking widget embed | ✅ | `BookingWidgetPage.tsx` · embeddable iframe snippet |
| More templates | 🔲 | Only 6 templates · need more variety |
| Template editor (drag-and-drop) | 🔲 | Current editor is section-based text editor · no visual drag-drop |
| Custom domain (CNAME) | 🔲 | Only `*.certxa.com` subdomains · no BYOD support |
| SEO meta editing per-page | 🚧 | Some meta fields exist · not fully exposed in editor UI |

---

## 22. SEO Regional Pages

| Item | Status | Notes |
|------|--------|-------|
| SEO regions admin UI | ✅ | `admin/SeoRegionsAdmin.tsx` |
| Reference data API | ✅ | `GET /api/seo-regions/reference-data` · cities + business types |
| Region CRUD | ✅ | Create · edit · delete regions |
| Per-region static HTML generation | ✅ | `POST /api/seo-regions/:id/generate` |
| Bulk generate all | ✅ | `POST /api/seo-regions/generate-all` |
| Bulk seed cities | ✅ | `POST /api/seo-regions/bulk-seed` |
| City source of truth | ✅ | `server/seo-cities.ts` |
| Shared SEO assets | ✅ | `client/public/seo-assets/seo.css` + `seo.js` |
| Generated pages on disk | 🟡 | `client/public/regions/` is empty — pages need to be generated |

---

## 23. Public Booking Widget

| Item | Status | Notes |
|------|--------|-------|
| Public booking page | ✅ | `PublicBooking.tsx` + `public-booking/BookingWidget.tsx` |
| Three UI themes | ✅ | Classic · Simple · Mobile themes |
| Service selection | ✅ | |
| Staff selection | ✅ | |
| Date / time slot picker | ✅ | Real-time availability |
| Customer info collection | ✅ | Name · phone · email |
| Booking confirmation page | ✅ | `BookingConfirmation.tsx` · confirmation number |
| Appointment cancel (customer self-serve) | ✅ | `POST /api/appointments/confirmation/:num/cancel` · enforces `cancellationHoursCutoff` window |
| Cancellation policy settings | ✅ | `CancellationSettings` component in BusinessSettings · per-store cutoff (0–168h) |
| Appointment reschedule (customer self-serve) | 🔲 | Cancel works · reschedule link not provided to customer |
| Payment collection at booking | 🔲 | No card-on-file or deposit at booking time |
| Google Calendar / iCal add | ✅ | `BookingConfirmation.tsx` — "Google Calendar" link + "Download .ics" button |

---

## 24. PHP Marketing Website

| Item | Status | Notes |
|------|--------|-------|
| Home / overview page | ✅ | `/overview.php` |
| SalonOS landing page | ✅ | `/salonos.php` |
| Online Booking feature page | ✅ | `/online-booking.php` |
| Client Management page | ✅ | `/client-management.php` |
| Client Notifications page | ✅ | `/client-notifications.php` |
| Client Reviews page | ✅ | `/client-reviews.php` |
| Payments page | ✅ | `/payments.php` |
| Card Reader & POS page | ✅ | `/card-reader-pos.php` |
| Reserve with Google page | ✅ | `/reserve-with-google.php` |
| LaunchSite marketing page | ✅ | `/launchsite.php` |
| Hair Salon software page | ✅ | `/hair-salon-software.php` |
| Nail Salon software page | ✅ | `/nail-salon-software.php` |
| Barbershop software page | ✅ | `/barbershop-software.php` |
| Pricing page | ✅ | `/pricing.php` |
| Comparison: vs GlossGenius | ✅ | `/vs-glossgenius.php` |
| Comparison: vs Vagaro | ✅ | `/vs-vagaro.php` |
| Case Studies page | ✅ | `/case-studies.php` |
| Contact page | ✅ | `/contact.php` |
| Blog page | 🚧 | `/blog.php` — stub page · no posts |
| Custom website builder page | 🚧 | `/custom-website-builder.php` — stub |
| Help Centre | 🔲 | Nav link present · page is `#` placeholder |
| Webinars | 🔲 | Nav link present · page is `#` placeholder |
| Community | 🔲 | Nav link present · page is `#` placeholder |
| Nav header (React) — matches PHP style | ✅ | `MarketingNav.tsx` · Cormorant Garamond logo · 70px height · blur backdrop |
| Auth page (`/auth`) | ✅ | Two-panel layout · no scrollbars · viewport-locked |

---

## 25. Platform Admin

| Item | Status | Notes |
|------|--------|-------|
| Admin dashboard overview | ✅ | `Admin/DashboardOverview.tsx` · MRR · total accounts · new signups |
| Accounts manager | ✅ | `admin/AccountsAdmin.tsx` · search · view · delete accounts |
| Billing dashboard (admin) | ✅ | `Admin/BillingDashboard.tsx` · all subscriptions · unpaid invoices |
| Billing plans manager | ✅ | `Admin/BillingPlansManager.tsx` · create/edit/delete plans |
| Platform settings | ✅ | Mailgun · Twilio · global config |
| Test Mailgun | ✅ | `POST /api/admin/platform-settings/test-mailgun` |
| Test Twilio | ✅ | `POST /api/admin/platform-settings/test-twilio` |
| Platform status check | ✅ | `GET /api/admin/platform-settings/status` |
| Add-ons manager (admin) | ✅ | `Admin/AddOnsManager.tsx` |
| Training admin | ✅ | `TrainingAdmin.tsx` · training categories · steps · user state |
| Per-user trial controls | ✅ | Extend · reset · activate · cancel via admin |
| SEO regions admin | ✅ | `admin/SeoRegionsAdmin.tsx` |

---

## 26. Training System

| Item | Status | Notes |
|------|--------|-------|
| Training action categories (CRUD) | ✅ | `training_action_categories` table |
| Training action steps | ✅ | `training_action_steps` table |
| Training user state tracking | ✅ | `training_user_state` · per-user progress |
| Training events log | ✅ | `training_events` table |
| Training user profile | ✅ | `training_user_profile` table |
| Training settings | ✅ | `training_settings` table |
| Training admin UI | ✅ | `TrainingAdmin.tsx` + `TrainingSettings.tsx` |
| User-facing training UI | 🚧 | Tables and API exist · in-app guided training UI not complete |

---

## 27. Third-Party Integrations

| Item | Status | Notes |
|------|--------|-------|
| Google Business Profile | 🟡 | Built · needs `GOOGLE_CLIENT_SECRET` |
| Facebook Page | 🚧 | `FacebookConnectGate.tsx` + `FacebookPageForm.tsx` · partial — stores page ID only |
| Yelp | 🚧 | `YelpConnectGate.tsx` + `YelpAliasForm.tsx` · stores alias only · no live sync |
| Stripe (billing) | 🟡 | Built · needs `STRIPE_SECRET_KEY` |
| Twilio (SMS + voice) | 🟡 | Built · needs per-store credentials |
| Mailgun (email) | 🟡 | Built · needs `MAILGUN_API_KEY` |
| Google OAuth | 🟡 | Built · needs `GOOGLE_CLIENT_SECRET` |

---

## 28. Performance & Reliability

| Item | Status | Notes |
|------|--------|-------|
| 136 database indexes | ✅ | Applied via migration `0009` |
| In-process TTL cache | ✅ | `server/cache.ts` · wired on all read + invalidated on all writes |
| Cursor-based pagination | ✅ | `server/lib/pagination.ts` |
| Production DB pool config | ✅ | `server/db.ts` · max connections · idle timeout |
| Redis / distributed cache | 🔲 | Currently in-process only · multi-instance not supported |
| Background job queue | 🔲 | No BullMQ / pg-boss — schedulers are in-process |
| Health check endpoint | 🟡 | `GET /api/version` exists · no dedicated `/health` with DB ping |
| Rate limiting | ✅ | `express-rate-limit` · auth 10/min · public/book 60/min · prod-only |

---

## 29. What's Left to Build (Priority Order)

### High Priority
| Item | Why |
|------|-----|
| Set production secrets (`STRIPE_SECRET_KEY`, `MAILGUN_API_KEY`, `GOOGLE_CLIENT_SECRET`) | Blocks billing, email, and Google integration in production |
| Generate SEO regional pages | `client/public/regions/` is empty — no SEO pages live yet |
| Recurring appointments | Frequently requested by salon owners |
| Loyalty — redemption at POS | Earned points can't be spent |
| Loyalty — program settings (earn rate, tiers) | No config UI |

### Medium Priority
| Item | Why |
|------|-----|
| Customer self-service portal | Customers can't log in to reschedule/cancel |
| Payment at booking (deposit / card-on-file) | Reduces no-shows |
| Invoice PDF export (Pro) | Core for field service billing |
| Invoice Stripe payment link (Pro) | Enables online payment collection |
| Staff performance KPIs (utilization, no-show rate) | Management reporting |
| Blog (real posts) | SEO and content marketing |

### Lower Priority
| Item | Why |
|------|-----|
| Additional LaunchSite templates | More variety for different salon types |
| Custom domain (BYOD) for LaunchSite | Premium feature for established businesses |
| Mobile app for salon owners | Currently web-only |
| Crew mobile app (iOS/Android) | Pro API is ready · no native app |
| Revenue CSV/Excel export | Accounting integration |
| Customer retention / churn analytics | Advanced reporting |
| Help Centre (real content) | Reduces support burden |
| Webinars page | Marketing / education |
| Community page | Customer retention |
| Drag-and-drop LaunchSite editor | UX improvement over current section editor |
| Redis cache (multi-instance ready) | Needed when scaling beyond single process |
| Automated test suite | Long-term code quality |

---

## Summary Scorecard

| Area | Complete | In Progress | Not Started |
|------|----------|------------|-------------|
| Infrastructure | 17 / 17 | 0 | 0 |
| Auth & Users | 13 / 14 | 0 | 1 |
| Trial System | 10 / 11 | 0 | 1 |
| Billing / Stripe | 16 / 17 | 1 | 0 |
| Onboarding | 7 / 7 | 0 | 0 |
| Calendar & Appointments | 13 / 14 | 0 | 1 |
| Services & Staff | 11 / 11 | 0 | 0 |
| CRM & Customers | 7 / 8 | 0 | 1 |
| Products & Inventory | 3 / 6 | 0 | 3 |
| POS & Cash Drawer | 7 / 9 | 0 | 2 |
| SMS (Twilio) | 7 / 9 | 0 | 2 |
| Email (Mailgun) | 7 / 10 | 2 | 1 |
| Google Business | 10 / 12 | 0 | 2 |
| Queue (Virtual Check-in) | 8 / 9 | 0 | 1 |
| Pro Dashboard | 15 / 18 | 0 | 3 |
| LaunchSite Builder | 9 / 13 | 1 | 3 |
| SEO Regional Pages | 8 / 9 | 1 | 0 |
| Public Booking Widget | 7 / 10 | 0 | 3 |
| Marketing Website | 18 / 23 | 2 | 3 |
| Platform Admin | 12 / 12 | 0 | 0 |
| Analytics & Reports | 7 / 12 | 0 | 5 |
| Gift Cards | 5 / 6 | 0 | 1 |
| Loyalty Program | 2 / 6 | 0 | 4 |
| Waitlist | 3 / 3 | 0 | 0 |
| Reviews | 5 / 6 | 1 | 0 |
| Training System | 7 / 8 | 1 | 0 |
| Third-Party Integrations | 0 / 7 | 5 | 2 |
| Performance & Reliability | 5 / 8 | 0 | 3 |

**Overall: ~248 items · ~196 complete (79%) · ~16 in progress (6%) · ~36 not started (15%)**

---

*Generated by audit on May 8, 2026. Update this document as features ship.*
