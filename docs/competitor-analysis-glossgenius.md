# Certxa vs GlossGenius — Competitor Analysis & Improvement Roadmap
*Last updated: May 2026 | Based on deep research into GlossGenius.com*

---

## Executive Summary

GlossGenius serves 70,000+ beauty professionals with a mobile-first approach. It started as a solo/independent stylist app and scaled up. Certxa is stronger on multi-location, POS, virtual queue, and field services — but GlossGenius has several features and market positioning strategies we should match or beat.

---

## 1. Pages GlossGenius Has That We Are Now Building or Need

| Page / Segment | GlossGenius URL | Our Status | Action |
|---|---|---|---|
| Booth Renters | `/booth-renters` | ✅ **Built** (`/booth-renters.php`) | Done |
| Solo Professionals | `/solo-professionals` | ✅ **Built** (`/solo-professionals.php`) | Done |
| Payment Processing | `/payment-processing` | ✅ **Built** (`/payment-processing.php`) | Done |
| Medspa / Clinical | `/customers/medical-spa-software` | ❌ Missing | Build a medspa landing page |
| Estheticians | `/estheticians` | ✅ Have it | Good |
| Lash Artists | (blog/feature pages) | ❌ Missing | Build `/lash-artists.php` |
| Massage Therapists | (vertical page) | ❌ Missing | Build `/massage-therapists.php` |
| Memberships / Packages | `/memberships-packages` | ❌ Missing feature page | Build feature page + develop feature |
| Before/After Portfolio | (feature) | ❌ Missing | Add photo portfolio to client profiles |
| Smart Rebooking | (feature) | ⚠️ Partial | Improve with dedicated marketing page |
| Email Campaigns | (feature) | ❌ Missing app feature | Develop email campaign feature |
| Social Media Templates | (feature) | ❌ Missing | Add social post templates to dashboard |
| HIPAA Compliance page | `/hipaa` | ❌ Missing | Add HIPAA compliance page + BAA flow |

---

## 2. Features GlossGenius Has That We Should Build

### HIGH PRIORITY (Revenue & Retention Impact)

#### 2.1 Memberships & Recurring Packages
**What GlossGenius does:** Clients can subscribe to recurring service packages (e.g., "Monthly Blowout Club — $99/mo, includes 4 blowouts"). Charges automatically each month.  
**Why it matters:** Recurring revenue is predictable income for the business owner. Clients with memberships visit 3x more often.  
**What to build:**
- `memberships` table in DB: name, price_cents, billing_interval, services_included (JSON), active (bool)
- `client_memberships` table: client_id, membership_id, start_date, next_billing_date, status
- Stripe recurring billing integration for memberships
- Dashboard UI: create/edit memberships, view subscribers, pause/cancel
- Client-facing: membership badge on profile, auto-apply included services at checkout
- **Pages needed:** `/memberships.php` marketing page, in-app membership management

#### 2.2 Before/After Photo Portfolio
**What GlossGenius does:** Stylists can attach before/after photos to each client visit. Photos appear in the client's profile timeline and can optionally be added to a public stylist portfolio.  
**Why it matters:** Stylists choose software that helps them grow their following. Portfolio = marketing.  
**What to build:**
- Add `visit_photos` column (JSONB) to appointments table, or new `appointment_photos` table
- Before/After photo upload in appointment detail view (drag-and-drop)
- Client profile timeline shows photo thumbnails per visit
- Optional public portfolio page at `certxa.com/book/{slug}/portfolio`
- **Effort:** Medium (3–5 days)

#### 2.3 Email Marketing Campaigns
**What GlossGenius does:** Send one-time email broadcasts to all or segmented clients (e.g., "clients who haven't visited in 60 days"), with drag-and-drop template editor.  
**Why it matters:** Business owners who can email their client list stay. Those who can't will bolt to Mailchimp.  
**What to build:**
- `email_campaigns` table: name, subject, body_html, segment, scheduled_at, sent_at
- Segment options: all clients, lapsed (60/90 days), birthday this month, top spenders
- Send via Mailgun (already have API key)
- Dashboard: Campaign builder with simple block editor (header image, body text, CTA button)
- Analytics: open rate, click rate per campaign
- **Effort:** Large (1–2 weeks)

#### 2.4 Smart Rebooking Prompts at Checkout
**What GlossGenius does:** At the end of checkout, a prompt appears: "Rebook {Client Name} for their next {Service}?" with pre-filled date/time suggestions based on their average visit frequency.  
**Why it matters:** The single most effective retention tool. Average rebooking rate jumps from ~35% to 75%+.  
**What to build:**
- Calculate average visit interval per client (from appointment history)
- Show rebooking prompt in checkout flow after payment is completed
- Pre-fill suggested date (today + average interval)
- One-click confirmation books the appointment
- **Effort:** Small-Medium (2–3 days)

#### 2.5 Social Media Post Templates
**What GlossGenius does:** Pre-designed Instagram/Facebook post templates stylists can customize and download — "New availability", "Special offer", "Holiday hours", etc.  
**Why it matters:** Stylists struggle with content creation. This is sticky — they come back to the app for it.  
**What to build:**
- Library of 20–30 template designs (SVG/Canvas-based)
- Fill in: business name, service, discount code, photo
- Download as PNG or copy for Instagram Stories
- **Effort:** Medium (4–6 days)

#### 2.6 Automated Review Requests (Enhanced)
**What GlossGenius does:** After each appointment closes, automatically sends a personalized SMS/email asking for a Google or Facebook review. Tracks which clients have left reviews.  
**What we have:** Google Reviews manager (sync, respond). We send review request SMS.  
**Gap:** We don't track which clients have already left reviews or gate the request to only happy clients first.  
**What to build:**
- Survey step before review link (quick thumbs up/down — if down, route to internal feedback instead)
- Track `review_requested_at` and `has_reviewed` per client
- Skip clients who already left a review this year
- **Effort:** Small (1–2 days)

#### 2.7 Client Retention Scoring
**What GlossGenius does:** Flags clients as "at risk" (haven't booked in X days) and shows this prominently in the client list.  
**What to build:**
- Calculate `retention_score` per client: days since last visit vs. their average visit frequency
- Color-coded client list: green (active), yellow (at risk), red (lapsed)
- Filter: "Show only at-risk clients" → trigger a re-engagement campaign
- **Effort:** Small (1 day)

---

### MEDIUM PRIORITY (Differentiation)

#### 2.8 Medspa / HIPAA Mode
**What GlossGenius does:** HIPAA-compliant mode with a Business Associate Agreement (BAA), HIPAA-compliant notification text, and clinical note fields.  
**What to build:**
- HIPAA mode toggle in store settings (hides certain PHI from non-admin staff)
- BAA acceptance flow (digital signature on account setup)
- Clinical notes section in client profiles (separate from general notes, admin-only access)
- Consent form templates (e.g., "Botox Consent", "Chemical Peel Consent")
- `/medspa.php` marketing landing page
- **Effort:** Large (2–3 weeks, involves legal review)

#### 2.9 Packages (Prepaid Service Bundles)
**What GlossGenius does:** Sell bundles of services upfront — "Buy 10 massages, get 1 free" — client balance tracked in their profile.  
**What to build:**
- `service_packages` table: name, services[], quantity, price_cents, expiry_days
- `client_package_balance` table: client_id, package_id, remaining_uses, purchased_at
- Checkout auto-detects if client has applicable package balance and applies it
- **Effort:** Medium (3–5 days)

#### 2.10 Booth Renter Management (Salon Owner View)
**What we need even on the salon side:** Salon owners need to manage booth renters on their premises — collect rent, track which renters are active, manage shared resources.  
**What to build:**
- `booth_renters` table: linked to a staff member, booth_number, rent_amount_cents, rent_day
- Monthly rent invoicing: auto-generate invoice on rent_day, track payment status
- Shared calendar view: owner sees all renters' bookings (read-only) to manage floor capacity
- **Effort:** Medium (4–6 days)

---

### LOWER PRIORITY (Nice to Have)

#### 2.11 Automated Birthday & Anniversary Campaigns
**We partly have this** (birthday scheduler). GlossGenius also includes anniversary of first visit.  
**Gap:** Add "first visit anniversary" milestone messages.

#### 2.12 Cancellation Fee Enforcement
**What GlossGenius does:** Require a card on file at booking, automatically charge the cancellation fee if the client cancels within the window.  
**We have:** No-show deposit collection (manual). Need auto-charge on late cancel.  
**What to build:** Auto-charge flow using stored Stripe payment method when appointment is cancelled inside the policy window.

#### 2.13 Waitlist Auto-Fill
**What GlossGenius does:** When an appointment cancels, automatically offer the slot to the next client on the waitlist with an SMS.  
**We have:** Waitlist exists. Need auto-SMS offer + one-tap claim.

---

## 3. Marketing & Positioning Gaps

### 3.1 We Need These Landing Pages
| Page | Priority | Notes |
|---|---|---|
| `/lash-artists.php` | High | Huge market — GlossGenius targets this heavily |
| `/massage-therapists.php` | High | Clear target segment |
| `/medspa.php` | High | Growing market, premium price point |
| `/estheticians.php` | Medium | We have an SEO page but no feature-rich PHP page |
| `/memberships.php` | High | Feature marketing page |
| `/hipaa.php` | Medium | Trust signal for medical/medspa clients |
| `/mobile-app.php` | Medium | GlossGenius is mobile-first — we need a mobile app story |

### 3.2 Pricing Positioning
GlossGenius: $24/mo Standard, $48/mo Gold, ~$96/mo Platinum  
Certxa: Starting $29/mo  

**Issue:** We're positioned $5/mo higher at entry but our free trial is 60 days vs GlossGenius's 14 days. We win on trial length — lean into that harder everywhere.  
**Recommendation:** Add "4x longer free trial than GlossGenius" to homepage hero and pricing page.

### 3.3 Mobile App Story
GlossGenius is phone-first — heavily marketed as "manage your whole salon from your iPhone."  
We need a `/mobile-app.php` page showing our mobile experience with app store screenshots.

### 3.4 Data Migration CTA
GlossGenius → Certxa migration is a high-intent keyword. We have a `/data-transfer.php` page but should add:  
- "Switch from GlossGenius" CTA in the comparison page hero
- Dedicated migration landing page for GlossGenius switchers

---

## 4. Payment Processing Findings

### HMS (Host Merchant Services)
- **Model:** Interchange-plus ONLY — the most transparent model
- **Salon/Retail markup:** +0.25% + $0.10/transaction over interchange
- **Monthly fee:** $0
- **Cancellation fee:** $0
- **No long-term contracts**
- **Chargeback fee:** $25
- **Batch fee:** $0.10/day
- **PCI compliance:** $0 (if compliant)

### Djavoo (Payment Hardware)
- **Important:** Djavoo is a **terminal hardware manufacturer** — not a payment processor
- Rates are set by the ISO/processor (HMS), not Djavoo
- Djavoo sells through ISOs/resellers only (B2B) — no direct public pricing
- **Key terminals:** Z1 (countertop), Z11 (wireless), Z9 (PIN pad combo)
- All EMV/PCI certified, NFC tap, Apple Pay, Google Pay

**⚠️ Action Required:** Your business partner needs to confirm the exact HMS rate schedule negotiated for Certxa merchants. The rates on the payment-processing.php page use HMS's standard published rates — confirm these match your actual agreement.

---

## 5. Implementation Priority Queue

| # | Item | Impact | Effort | Priority |
|---|---|---|---|---|
| 1 | Smart rebooking prompt at checkout | High | Low | 🔴 Now |
| 2 | Before/After photo uploads on client profiles | High | Medium | 🔴 Now |
| 3 | Lash artists & massage therapist landing pages | Medium | Low | 🔴 Now |
| 4 | Memberships & recurring packages | Very High | Large | 🟡 Next sprint |
| 5 | Email marketing campaigns | High | Large | 🟡 Next sprint |
| 6 | Client retention scoring (at-risk flags) | High | Low | 🟡 Next sprint |
| 7 | Cancellation fee auto-charge | Medium | Medium | 🟡 Next sprint |
| 8 | Waitlist auto-fill on cancellation | Medium | Small | 🟡 Next sprint |
| 9 | Booth renter management (owner side) | Medium | Medium | 🟢 Backlog |
| 10 | HIPAA / Medspa mode | Medium | Large | 🟢 Backlog |
| 11 | Social media post templates | Low | Medium | 🟢 Backlog |
| 12 | Service packages (prepaid bundles) | Medium | Medium | 🟢 Backlog |

---

## 6. Quick Wins (Can Build This Week)

These are small but visible improvements that directly counter GlossGenius's advantages:

1. **Rebooking prompt at checkout** — 2–3 days, massive retention impact
2. **Before/After photos on client profiles** — 2–3 days, sticky feature stylists love
3. **Client retention score (at-risk flag)** — 1 day, adds premium feel to dashboard
4. **Lash artist landing page** — 1 day, captures large GlossGenius customer segment
5. **Massage therapist landing page** — 1 day, new vertical
6. **"4x longer trial" messaging on homepage** — 2 hours, conversion win

---

*This document was generated from a deep research analysis of glossgenius.com features, pricing, and positioning conducted May 2026.*
