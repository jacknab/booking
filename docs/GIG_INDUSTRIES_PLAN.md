# Certxa — Gig Industries Expansion Plan

**Reference:** HouseCall Pro `/industries/` hub and `/industries/handyman-software/` individual page
**Goal:** Build a world-class Industries section that positions Certxa as the go-to platform for every gig and home-service professional, driving signups by vertically targeting each trade.

---

## Current State

Certxa already has individual landing pages for a first set of service types, all living under the main `Landing.tsx` carousel:

| Industry | Route | File |
|---|---|---|
| House Cleaning | `/house-cleaning` | `HouseCleaningLanding.tsx` |
| Handyman | `/handyman` | `HandymanLanding.tsx` |
| Lawn Care | `/lawn-care` | `LawnCareLanding.tsx` |
| Dog Walking | `/dog-walking` | `DogWalkingLanding.tsx` |
| Tutoring | `/tutoring` | `TutoringLanding.tsx` |
| Hair Salon | `/` (Landing) | `Landing.tsx` |
| Barber Shop | `/` (Landing) | `Landing.tsx` |
| Nail Salon | `/` (Landing) | `Landing.tsx` |
| Tattoo Studio | `/` (Landing) | `Landing.tsx` |
| Spa / Esthetician | `/` (Landing) | `Landing.tsx` |
| Pet Groomer | `/` (Landing) | `Landing.tsx` |

**Gaps identified:**
- No unified "all industries" hub page
- Existing gig pages have inconsistent structures and varying quality
- No feature-tab deep-dives or revenue calculator
- Routes use inconsistent slugs (`/lawn-care` vs `/industries/lawn-care`)
- Missing high-search-volume verticals: HVAC, plumbing, pest control, pressure washing, carpet cleaning, pool service, moving, junk removal, window cleaning, snow removal

---

## Phase 1 — Industries Hub Page (`/industries`)

**What it is:** A single destination page, like HouseCall Pro's `/industries/`, that lists every service category Certxa supports. This page becomes the top of the funnel for all gig workers discovering Certxa.

**Sections to build:**
1. **Hero** — Bold headline ("Built for every trade. Trusted by thousands."), short subheadline, email capture + CTA button, trust badge row (review count, business count, app store ratings).
2. **Industry Grid** — Card grid (icon + name + one-line description + arrow link) organized into two buckets:
   - *Home & Trade Services* — Handyman, House Cleaning, Lawn Care, HVAC, Plumbing, Electrical, Carpet Cleaning, Pressure Washing, Window Cleaning, Snow Removal, Pest Control, Pool Service, Appliance Repair, Painting, Moving & Junk Removal
   - *Personal & Pet Services* — Dog Walking / Pet Sitting, Pet Grooming, Tutoring, Personal Training, Photography, Massage Therapy
3. **Platform Stats Bar** — "10,000+ pros", "4.8/5 rating", "Save 8+ hrs/week" stat pills.
4. **Universal Feature Strip** — 4 icons in a horizontal bar: Scheduling · Online Booking · Invoicing · Payments — linking to feature detail pages.
5. **Final CTA** — Full-width conversion block with a signup button.

**Deliverables:**
- `client/src/pages/IndustriesHub.tsx`
- Route `/industries` added to `App.tsx`
- Nav link in `Landing.tsx` header (or top menu)
- Reusable `IndustryCard` sub-component

**Effort:** Medium (2–3 days)

---

## Phase 2 — Standardize & Upgrade Existing Gig Pages

**What it is:** Bring every existing gig landing page up to a consistent, high-conversion structure matching the best practices from HouseCall Pro's individual industry pages.

**Target pages:** House Cleaning, Handyman, Lawn Care, Dog Walking, Tutoring (the 5 fully-built pages).

**Standard page structure to enforce:**

| Section | Description |
|---|---|
| **Hero** | Full-viewport with industry background video, headline, sub-copy, email + CTA |
| **Social Proof Bar** | "X businesses trust Certxa", competitor alternative pills (e.g., "Jobber Alternative") |
| **Value Props (3-up)** | Grow revenue · Earn trust · Save time — short stat-backed statements |
| **Feature Tab Panel** | Tabbed interface: Scheduling / Online Booking / Invoicing / Payments / Client Management — each with a screenshot mock and bullet points tailored to the industry |
| **How It Works (3 Steps)** | Create account → Customize → Book your first job — with numbered steps |
| **Testimonials** | 3 industry-specific quote cards with name, business type, and star rating |
| **Compare Table** | Certxa vs "Other Apps" side-by-side feature checklist |
| **FAQ** | 4–6 industry-specific questions in an accordion |
| **Final CTA** | Dark gradient section with headline + email + button |

**Routing update:** Move gig pages from `/handyman` → `/industries/handyman`, `/lawn-care` → `/industries/lawn-care`, etc., with redirect aliases kept for backward compatibility.

**Shared component to create:**
- `IndustryLandingTemplate` — a single composable page template that accepts industry-specific props (headline, video, features, testimonials, FAQs) so future industries are added with zero boilerplate.

**Effort:** Large (4–6 days)

---

## Phase 3 — Revenue Benchmark Calculator

**What it is:** An interactive multi-step widget (matching HouseCall Pro's revenue estimator) embedded on both the hub page and each individual industry page.

**Flow (4 steps):**
1. **Industry selector** — dropdown or icon-grid selection of their trade
2. **Team size** — "Just me / 2–5 / 6–10 / 11+" icon picker
3. **Location** — zip code input (or "use my location")
4. **Results** — Estimated annual revenue range + "Businesses using Certxa increase revenue by 35%" stat + signup CTA

**Implementation notes:**
- Frontend-only calculation using a lookup table of revenue ranges by industry + team size + region tier (urban / suburban / rural bucketed by zip prefix)
- No backend endpoint needed in MVP; can later connect to real benchmark data
- Reusable `RevenueCalculator` component embedded via a `<RevenueCalculatorWidget />` include

**Deliverables:**
- `client/src/components/marketing/RevenueCalculator.tsx`
- Embedded on `/industries` hub and all individual industry pages

**Effort:** Medium (2–3 days)

---

## Phase 4 — New Industry Pages (Expansion Verticals)

**What it is:** Launch individual landing pages for the highest-search-volume industries not yet covered. Each page uses the `IndustryLandingTemplate` from Phase 2, requiring only a data file per industry.

**Priority order (by search volume / business potential):**

### Batch A — Home & Trade (highest priority)
| Industry | Route | Notes |
|---|---|---|
| HVAC | `/industries/hvac` | High avg ticket, seasonal |
| Plumbing | `/industries/plumbing` | Year-round, emergency bookings |
| Electrical | `/industries/electrical` | Licensing-aware copy |
| Carpet Cleaning | `/industries/carpet-cleaning` | Recurring revenue focus |
| Pressure Washing | `/industries/pressure-washing` | Seasonal, upsell-friendly |
| Window Cleaning | `/industries/window-cleaning` | Residential + commercial |
| Snow Removal | `/industries/snow-removal` | Recurring contracts |

### Batch B — Personal & Specialty
| Industry | Route | Notes |
|---|---|---|
| Pest Control | `/industries/pest-control` | Subscription model |
| Pool Service | `/industries/pool-service` | Recurring, high loyalty |
| Appliance Repair | `/industries/appliance-repair` | Emergency + scheduled |
| Painting | `/industries/painting` | Estimate-heavy workflow |
| Moving & Junk Removal | `/industries/moving` | Multi-crew dispatch |
| Personal Training | `/industries/personal-training` | Package/membership focus |
| Photography | `/industries/photography` | Package booking, deposit flow |

**Deliverables (per industry):**
- One data config file: `client/src/data/industries/[slug].ts`
- Page auto-generated from template
- Route entry in `App.tsx`
- Card entry on hub page

**Effort:** Medium-Large (5–7 days for Batch A, 4–5 days for Batch B)

---

## Phase 5 — SEO Infrastructure & Discoverability

**What it is:** Technical and content foundations that help each industry page rank on Google for "[industry] scheduling software", "[industry] app for contractors", etc.

**Tasks:**
1. **Meta tags per page** — `<title>`, `<meta name="description">`, Open Graph tags, canonical URLs using a `usePageMeta(industry)` hook.
2. **Structured data (JSON-LD)** — `SoftwareApplication` and `FAQPage` schema on each industry page.
3. **Sitemap update** — Auto-generate `/sitemap.xml` from the industry routes list.
4. **Internal linking** — Hub page links to all industry pages; each industry page links back to hub + 2 related industries.
5. **URL canonicalization** — Ensure redirect from old routes (`/handyman`) to new (`/industries/handyman`) returns HTTP 301.
6. **Analytics events** — Fire a `industry_page_view` event with the industry slug for conversion tracking.

**Effort:** Small-Medium (2–3 days)

---

## Phase 6 — Salon & Spa Industry Integration

**What it is:** Bring the existing salon/spa industry types (Hair Salon, Barber, Nail Salon, Tattoo, Spa, Esthetician, Pet Groomer) — which currently only appear on the main `Landing.tsx` carousel — onto their own dedicated pages using the same template and hub integration.

**Tasks:**
- Create individual pages for each salon/spa type using `IndustryLandingTemplate`
- Route them under `/industries/hair-salon`, `/industries/barber`, etc.
- Add them to the hub page under a third bucket: *Beauty & Wellness*
- Keep the existing `Landing.tsx` hero carousel pointing to these new routes

**This phase bridges the two halves of Certxa's product** — the salon booking tool and the gig services tool — under one unified Industries umbrella.

**Effort:** Medium (3–4 days)

---

## Summary Timeline

| Phase | Description | Effort | Priority |
|---|---|---|---|
| **1** | Industries Hub Page (`/industries`) | 2–3 days | High |
| **2** | Standardize existing 5 gig pages + shared template | 4–6 days | High |
| **3** | Revenue Benchmark Calculator widget | 2–3 days | Medium |
| **4a** | New industry pages — Batch A (7 trades) | 5–7 days | Medium |
| **4b** | New industry pages — Batch B (7 more) | 4–5 days | Low-Medium |
| **5** | SEO infrastructure | 2–3 days | Medium |
| **6** | Salon & spa pages unified into hub | 3–4 days | Medium |

**Total estimated effort: 22–31 development days**

---

## Key Design Principles

- **One template, many industries.** The `IndustryLandingTemplate` component is the foundation — it accepts industry-specific props and renders the full page. Adding a new industry should take less than an hour once the template exists.
- **Gig-first language.** Copy on gig pages emphasizes independence, flexibility, and earning more. Avoid enterprise/corporate language.
- **Conversion at every scroll depth.** CTA buttons appear in the hero, after the feature tabs, after testimonials, and in the final block — so no matter when a visitor is convinced, they can convert immediately.
- **Trust signals are industry-specific.** A plumber is more impressed by "trusted by 5,000 plumbers" than a generic number. Testimonials, stats, and competitor comparisons should feel tailored.
- **Mobile-first.** Gig workers book and manage jobs from their phones. All pages must be fully responsive and fast on mobile.
