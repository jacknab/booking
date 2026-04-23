# Built-In Smart Staff Training Tool — Plan

> **Goal:** A self-guided, in-app training experience that takes a brand-new staff member from zero to fully comfortable with the calendar, booking, lookup, and POS flows in about a week — so the salon owner doesn't have to sit down and train each new hire by hand.

---

## 1. Guiding Principles

1. **Learn by doing, in the real system.** The bot runs in the **live environment** alongside real bookings — every new staff member is enrolled automatically on first login. No sandbox, no separate "practice mode" to remember to open.
2. **Adaptive weaning, not fixed lessons.** The bot starts very hands-on (full spotlight + step-by-step coach card on every action) and **automatically reduces its help level** as the staff member proves they can perform actions correctly without it.
3. **Help that fades, never disappears mid-task.** Once the bot has weaned off a flow, it stays quiet — but if the staff member hesitates, makes a wrong click, or explicitly asks for help, it re-appears at exactly the right level for the moment.
4. **Independence by Day 7.** A competence score per action category determines graduation. By the end of week one, a staff member who has done the work passes a threshold and the bot disappears entirely for them. If they aren't there yet, the bot keeps assisting (with the owner notified).
5. **Pass with a real action.** A lesson is "complete" only when the staff member performs the real click sequence on real data — not by clicking "Next."
6. **Owner-visible progress.** The owner sees a dashboard of who has been auto-enrolled, their competence per area, and who has graduated.
7. **Safe by default.** The bot can intercept high-risk actions (refunds, cancellations, deletes) with an extra confirmation during the training week, even if the underlying app wouldn't normally show one.

---

## 2. End-User Experience (the New Hire)

### Auto-enrollment
- The moment an owner creates a new staff account, that user is automatically enrolled. No setup, no opt-in.
- On first login the bot greets them: *"Hi Sarah — I'm your training assistant. I'll walk you through everything for the first few days, then quietly step back as you get comfortable. You can call me back anytime with the **?** button."*

### What it looks like in practice (live system, real bookings)
The bot operates at one of **four help levels**, chosen per *action category* per *individual staff member*:

| Level | What the staff sees |
|-------|---------------------|
| **L3 — Full Guide** | Page dims, spotlight ring on the exact next button, coach card with title + explanation + "Why this matters". This is the Day-1 default. |
| **L2 — Hint** | No dim. A small coach card pinned next to the relevant button: *"Tap **Any Staff** when the client has no preference."* Dismissible. |
| **L1 — Whisper** | A subtle pulsing dot on the next-suggested button. Hover/tap reveals a one-line tooltip. |
| **L0 — Off** | Bot is silent for this action. A tiny **?** in the corner is the only trace. |

The bot **demotes itself one level** each time the staff completes the action correctly without using the hint. It **promotes itself one level** if the staff hesitates >8s, clicks the wrong target, or hits the **?**.

### The "?" Help bubble (always available)
- Floating bottom-right on every page.
- Tap once → re-enables L2 hints for the current page for 5 minutes.
- Tap and hold → search box: *"How do I refund a payment?"* — jumps directly to that flow with L3 guidance.
- Owner can disable the bubble per staff member after graduation if they want the UI fully clean.

### Graduation
- After **7 days** *or* once the staff member has reached **L0 in every action category**, the bot sends them a quiet *"You've graduated 🎓"* card and turns itself off completely.
- The owner is notified by email / in-app.

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

> The "days" are not scheduled lessons anymore — they are **rough capability milestones**. The bot decides which actions to surface based on what the staff member is actually doing in the live system that day. If a new hire never touches the cash drawer in week 1, they simply graduate without a Day-5 cash-out lesson; the next time they open the drawer (week 3, week 30) the bot pops back at L3 just for that flow.

---

## 3a. The Adaptive Weaning Algorithm

This is the brain of the system. It runs entirely on the client with state synced to the server.

### Action categories
Every guided interaction is tagged with an **action category**, e.g.:
`open-calendar`, `navigate-date`, `open-appointment`, `create-booking`, `pick-service`, `pick-staff`, `pick-time-slot`, `attach-client`, `lookup-client-phone`, `create-new-client`, `reschedule`, `cancel-appointment`, `walk-in`, `pos-checkout`, `apply-tip`, `apply-discount`, `refund`, `day-close`, `mark-no-show`.

### Per-staff, per-category state

```ts
{
  category: 'create-booking',
  helpLevel: 3,                // current L3..L0
  successStreak: 0,            // consecutive unaided successes
  failures: 0,                 // wrong clicks / hint requests / hesitations
  totalAttempts: 4,
  lastSeenAt: '2026-04-23T...',
  graduatedAt: null
}
```

### Demotion rules (bot helps less)
- **L3 → L2** after **2** consecutive successful unaided completions of any action in the category.
- **L2 → L1** after **3** consecutive successes.
- **L1 → L0** after **3** consecutive successes **AND** at least **24h** since enrollment in this category (prevents speed-running through on Day 1 with no real retention).

### Promotion rules (bot helps more)
Triggered if **any** of the following happens during an action:
- Hesitation > **8 seconds** with no click on a known target.
- Click on a wrong / unrelated element 2× in 10s.
- Staff taps the **?** bubble.
- Staff backs out of a flow without completing it (e.g. opens New Booking, drops out before confirming) — counts as a soft fail.

Promotion is **always +1 level**, never skipping straight to L3, so the bot doesn't feel intrusive after a small slip.

### Graduation per category
- Reach L0 with **5 total** successful unaided completions → category is marked `graduatedAt`.
- A graduated category is silent forever, **except**: if the staff returns to it after a long gap (>30 days) and shows hesitation, the bot pops back at L1 ("welcome back" mode).

### Overall graduation (bot turns off)
- Day ≥ 7 **AND** every category the staff has touched ≥ 3 times is at L0 → bot disables itself globally.
- If Day 7 arrives but some categories are still L2/L3 (or never attempted), the bot stays on with a softer cadence and **emails the owner**: *"Sarah is doing well on bookings but hasn't tried day-close yet. She might benefit from a 5-minute walkthrough with you."*

### Anti-dependency safeguards
- **Silent observation periods.** Once per day the bot picks a single random already-known action and stays silent on the first attempt to test independence — even if the staff is still at L3 elsewhere. Success → instant -1 level. This stops people from waiting for the spotlight before clicking anything.
- **No auto-advance below L2.** At L1/L0 the bot never *makes* the staff click — it only suggests. The staff must drive.
- **Cooldowns.** A coach card never re-opens for the same category more than 4 times per hour, to prevent annoyance.
- **Owner override.** Owner can pin a category at a fixed level (e.g. always L2 for refunds) regardless of the algorithm.

---

## 4. Architecture

### 4.1 Data model (new tables)

```
training_action_categories            -- seeded once, code-backed
  id (serial, pk)
  slug (varchar, unique)              -- 'create-booking', 'pos-checkout', ...
  title, description
  default_help_level (int, 0..3)
  high_risk (bool)                    -- enables extra confirmations during training

training_action_steps                 -- the JSON descriptors per category
  id (serial, pk)
  category_id (fk)
  order (int)
  step_json (jsonb)                   -- selector, copy, advance condition (see 4.3)

training_user_state                   -- the brain, one row per user per category
  id (serial, pk)
  user_id (fk)
  category_id (fk)
  help_level (int, 0..3)              -- current adaptive level
  success_streak (int)
  failures (int)
  total_attempts (int)
  last_seen_at (timestamptz)
  graduated_at (timestamptz, nullable)
  pinned_level (int, nullable)        -- owner override
  unique(user_id, category_id)

training_events                       -- raw event log feeding the algorithm
  id (bigserial, pk)
  user_id (fk)
  category_id (fk)
  type ('view' | 'success' | 'hesitation' | 'wrong-click' | 'help-requested' | 'abandoned')
  help_level_at_time (int)
  occurred_at (timestamptz)
  metadata (jsonb)

training_user_profile                 -- one row per staff user
  user_id (pk, fk)
  enrolled_at (timestamptz)
  graduated_at (timestamptz, nullable)
  graduation_notified_owner (bool)

training_settings                     -- one row per store
  store_id (pk, fk)
  enabled (bool, default true)
  auto_enroll_new_staff (bool, default true)
  graduation_min_days (int, default 7)
  show_help_bubble_after_graduation (bool, default true)
```

> No new tables for "modules / lessons / quizzes" — the live-mode bot is event-driven, not lesson-driven. The 7-day curriculum from §3 is just the *default discovery order* the bot uses if the staff member hasn't naturally encountered an action yet.

### 4.2 Live-mode safety (no sandbox)
Because the bot now runs on real data, we add safeguards in the live system **for users who have an active training profile**:
- **Extra confirmation** on `high_risk = true` categories (cancel, refund, delete client, day-close) for the first 7 days, regardless of help level. Worded plainly: *"You're still learning — are you sure you want to refund $84.00 to Maria?"*
- **Undo window** extended from 5s to 30s for trainees on reversible actions (cancel/no-show toggle).
- **Owner notification** when a trainee performs a high-risk action for the first time (so the owner can review).
- **Rate limiting** on bulk-destructive operations (e.g. cannot delete >3 appointments in 10 minutes during training).

These safeguards auto-disable when the user graduates.

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
- List of staff with: enrolled date, days active, % of categories at L0, last activity.
- Heat-grid per staff showing each action category and its current help level (L3 red → L0 green) — at a glance the owner sees who is struggling with what.
- Per-staff actions: *Reset all progress*, *Mark as graduated*, *Pin a category at level X* (e.g. always L2 for refunds).
- Per-store toggles: *Auto-enroll new staff* (default on), *Show help bubble after graduation* (default on), *Email me when a trainee uses a high-risk action*.
- Activity feed of high-risk actions performed by trainees in the last 7 days.

---

## 5. Implementation Plan

### Phase 1 — Foundation (week 1)
- DB tables + Drizzle schema (`npm run db:push --force` to sync)
- Auto-enrollment hook on staff creation (creates `training_user_profile`)
- `<CoachOverlay>` engine with the 4 help levels (L3 spotlight, L2 hint, L1 whisper, L0 off)
- Event tracker: hesitation timer, wrong-click detector, success detector, abandonment detector
- The adaptive-weaning algorithm (in §3a) implemented as a small reducer running on every event
- The floating **?** help bubble

### Phase 2 — First two action categories (week 2)
- Wire `create-booking` and `open-calendar` (the two most common actions) end-to-end
- Welcome message on first login
- Owner dashboard, read-only

### Phase 3 — Cover the rest of the calendar/booking surface (week 3)
- Add categories: `lookup-client-phone`, `create-new-client`, `reschedule`, `walk-in`, `pos-checkout`, `apply-tip`, `apply-discount`
- Live-mode safety layer: extra confirmations on high-risk actions, extended undo window, owner notifications
- Owner dashboard write actions: reset, mark-graduated, pin-level

### Phase 4 — Day-close / refunds / edge cases + graduation (week 4)
- Add categories: `day-close`, `mark-no-show`, `refund`, `cancel-appointment`, `delete-client`
- Graduation logic + "You've graduated 🎓" card
- Owner email digest at Day 7 (per trainee status)
- Heat-grid view in owner dashboard

### Phase 5 — Polish
- Analytics: which categories take the longest to graduate, which selectors get the most wrong-clicks (signals confusing UI to refactor)
- "Welcome back" mode for graduated staff returning to long-unused flows
- Localization scaffolding (all coach copy lives in JSON)

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
