# Built-In Smart Staff Training Tool — Plan

> **Goal:** A self-guided, in-app training experience that takes a brand-new staff member from zero to fully comfortable with the calendar, booking, lookup, and POS flows in about a week — so the salon owner doesn't have to sit down and train each new hire by hand.

---

## 1. Guiding Principles

1. **Learn by doing, not by reading.** Every concept is taught with a real interaction inside the app on a sandboxed practice store, not a slideshow.
2. **One-click in / one-click out.** The new hire can open the trainer from anywhere and resume exactly where they left off.
3. **Zero risk to live data.** All practice happens on a *Training Sandbox* dataset that is wiped/reset on demand and never touches real clients, payments, or SMS.
4. **Progressive unlock.** Day 1 unlocks the basics; harder flows (no-shows, refunds, reschedules across days, day close) unlock as earlier modules are passed.
5. **Pass with a real action.** Each lesson is "completed" only when the trainee performs the actual click sequence — not just by clicking "Next."
6. **Owner-visible progress.** The owner sees a dashboard of who has completed what, with timestamps and quiz scores.

---

## 2. End-User Experience (the New Hire)

### Entry point
- A **"Training" tab** appears in the staff sidebar for any user whose `trainingCompletedAt` is null.
- First-time login shows a welcome modal: *"Hi Sarah, your owner has set up a 7-day training plan for you. Want to start now?"* → **[Start Day 1]** / **[Remind me later]**

### Daily flow
- Each day is one **module** containing 3–6 **lessons**.
- A lesson opens an **interactive coach overlay**:
  - A semi-transparent dim covers the page.
  - A **spotlight ring** highlights the exact button to click.
  - A small **coach card** floats next to it with: title, 1–2 sentences of explanation, and a "Why this matters" expander.
  - The trainee performs the actual click; the overlay advances automatically.
- At the end of each day, a short **5-question quiz** (multiple choice + drag/drop) confirms retention.
- The trainee earns a **badge** per day: *Day 1 — Calendar Basics*, *Day 2 — Booking a Client*, etc.

### Always available
- A floating **"?" Help bubble** in the bottom-right of every page lets the staff member replay any lesson or ask "How do I…?" with a search box that jumps directly to the relevant lesson.

---

## 3. Curriculum (7-Day Plan)

| Day | Module | Lessons (interactive) |
|-----|--------|-----------------------|
| **1** | **Calendar Basics** | Open the calendar, read the columns (staff vs time), use Prev/Next, jump to today, jump to a date via the date picker, understand the "current time line" and the floating *Jump to Now* button, switch between *All Staff* and *My Schedule*. |
| **2** | **Booking a New Client** | Click an empty slot to start, pick a service category and service, add an addon, pick *Any Staff* vs *Specific Staff* on the new tab, pick a time slot, attach a client (lookup + new client + guest), confirm the booking, find the new appointment on the calendar. |
| **3** | **Client Lookup & Profile** | Use the numpad to look up by phone, handle "client not found" with the on-screen keyboard, read the client profile (Total Spend, No-Shows, Cancellations), open past/upcoming appointments, copy a review link to send to the client. |
| **4** | **Editing & Rescheduling** | Open an existing appointment, edit addons, change the client, reschedule to another day (notice that it opens directly to the *Time Slot* tab with the original staff pre-selected), cancel an appointment with the confirmation dialog. |
| **5** | **Walk-Ins & Quick Cash Out** | Start a walk-in (the system picks the soonest open slot today), check the customer out at POS, run a *Quick Cash Out*, understand tipping and discount entry. |
| **6** | **End-of-Day Tasks** | Use *Day Close* from the sidebar, read your daily summary, mark no-shows, handle a late arrival inside the grace period, send a "we missed you" message. |
| **7** | **Edge Cases & Confidence Test** | Reschedule across staff (re-assign), book back-to-back appointments using the *available minutes* gap calculator, handle a client who cancels mid-day, run through a 10-minute realistic *Practice Shift* simulation that mixes everything. Final certification quiz. |

> Each day is designed to take **15–25 minutes**. Total commitment ≈ 2 hours over 7 days.

---

## 4. Architecture

### 4.1 Data model (new tables)

```
training_modules
  id (serial, pk)
  day_number (int)            -- 1..7
  slug (varchar)              -- 'calendar-basics'
  title, description
  prerequisite_module_id (fk, nullable)

training_lessons
  id (serial, pk)
  module_id (fk)
  order (int)
  slug, title, body_md
  steps_json (jsonb)          -- array of step descriptors (see 4.3)
  estimated_minutes (int)

training_quiz_questions
  id, module_id (fk)
  question, options_json, correct_index, explanation

training_progress
  id (serial, pk)
  user_id (fk)
  lesson_id (fk)
  status ('not_started' | 'in_progress' | 'completed' | 'skipped')
  attempts (int)
  completed_at (timestamptz)
  duration_seconds (int)

training_quiz_results
  id, user_id, module_id, score, passed (bool), taken_at

training_settings (one row per store)
  enabled (bool)
  required_for_new_staff (bool)
  sandbox_store_id (fk)       -- the practice store
  daily_reminder_time (time)
```

### 4.2 Sandbox store
- A new boolean `stores.is_training_sandbox` flag.
- A seeder (`scripts/seed-training-sandbox.ts`) creates: 4 demo staff, ~20 services across 4 categories, ~30 demo clients, and ~40 appointments spread over the past/next 14 days.
- A "**Reset Sandbox**" button restores it to seed state.
- Inside the sandbox: outbound SMS/email is short-circuited at the service layer (`if (store.is_training_sandbox) return { skipped: true }`), Stripe calls use the test key only, and a persistent banner reads **"TRAINING MODE — no real messages or payments will be sent"**.

### 4.3 The Coach Overlay engine

A reusable React component `<CoachOverlay steps={lesson.steps} onComplete={...} />`.

Each **step** is a JSON descriptor — no code changes needed to author new lessons:

```json
{
  "type": "spotlight",
  "selector": "[data-testid='button-staff-any']",
  "title": "Choose 'Any Staff'",
  "body": "When the client doesn't care who serves them, pick this. The system books the first available staff for the chosen time.",
  "advance": "click",            // 'click' | 'next-button' | 'route-change'
  "expectedRoute": "/new-booking"
}
```

Step types we'll support:
- `spotlight` — dim the page, ring a `data-testid`, wait for the user to click it
- `tooltip` — non-blocking hint pinned to an element
- `modal` — full-screen explainer with a "Got it" button
- `wait-for-route` — advance only when the URL matches a pattern
- `wait-for-state` — advance when an event fires (e.g. `appointment-created`)
- `quiz-question` — inline single-question check

The engine relies on the `data-testid` attributes that already exist throughout the app (`button-slot-`, `tab-staff`, `card-staff-any`, etc.). **No UI rewrites needed** — we just keep adding test ids where lessons need them.

### 4.4 Owner Dashboard

New page **Settings → Training**:
- List of staff with: progress bar, current day, last activity, quiz scores.
- Per-staff actions: *Reset progress*, *Skip to day N*, *Mark as certified*.
- Toggle: "Require training for new staff" (blocks live calendar access until Day 3 is passed).
- Button: *Reset training sandbox*.

---

## 5. Implementation Plan

### Phase 1 — Foundation (week 1)
- DB tables + Drizzle schema + migrations
- Sandbox store flag + seeder + SMS/email/Stripe short-circuits + persistent banner
- `<CoachOverlay>` engine with `spotlight`, `tooltip`, `modal`, `wait-for-route` step types
- "Training" tab in sidebar + welcome modal + resume-where-you-left-off

### Phase 2 — Day 1 & 2 content (week 2)
- Author Calendar Basics + New Booking lessons (the highest-value modules)
- First quiz wired in
- Owner dashboard read-only

### Phase 3 — Days 3–5 (week 3)
- Lookup, profile, reschedule, walk-in, POS lessons
- `wait-for-state` step type wired to existing app events
- Owner dashboard write actions (reset, skip, certify)

### Phase 4 — Days 6–7 + Help bubble (week 4)
- Day-close, no-show, late-arrival lessons
- *Practice Shift* simulator (scripted timeline that triggers fake "incoming" events)
- Floating help bubble + searchable lesson index
- Final certification + email-the-owner-when-certified

### Phase 5 — Polish
- Analytics: which lessons get retried most (signals confusing UI)
- A/B test daily reminder times
- Localization scaffolding (lesson copy in JSON makes this easy)

---

## 6. Open Questions for You

1. **Sandbox isolation:** OK to create a separate `stores` row per training sandbox (so each owner gets their own), or do you want one shared global sandbox?
2. **Hard gating:** Should new staff be **blocked** from real calendar access until Day 3 is passed, or just *strongly nudged*?
3. **Certification:** Do you want a printable certificate / badge for the staff member at the end?
4. **Mobile:** Same coach overlay on tablet/phone, or training is desktop-only at first?
5. **Owner customization:** Should owners be able to add their own custom lessons (e.g. "How we do tip-out at this salon"), or is the curriculum fixed v1?

---

## 7. Why This Is Worth Building

- **Owner time saved:** every new hire today is ~3–4 hours of the owner's time. This drops it to ~30 minutes (review the dashboard at end of week).
- **Consistency:** every staff member learns the same things in the same order, including the non-obvious flows (auto-advance date, available-minutes gap, reschedule pre-fill) that owners often forget to mention.
- **Retention signal:** the owner can see if a hire isn't engaging (no lessons opened in 2 days) and intervene before week 1 is over.
- **Sales:** "built-in staff training" is a strong differentiator for the salon SaaS market — competitors don't have this.

---

*Ready for your review. Once you sign off on scope (especially items in §6), I can break Phase 1 into concrete tasks and start building.*
