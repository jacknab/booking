# Staff Training Tool — Development Plan

> Companion to `STAFF_TRAINING_TOOL_PLAN.md`. This file breaks the build into small, shippable phases. Each phase is **independently mergeable** and produces something the owner can see or click. Phases inside the same group are loosely ordered but most can be parallelized.

---

## Phase 0 — Foundations (no user-visible change yet)

### 0.1 — Schema scaffolding
- Add Drizzle definitions for the seven tables in §4.1 of the main plan.
- Run `npm run db:push --force`.
- Add a tiny seed script that inserts the initial `training_action_categories` rows (slugs only, real copy comes later).
- **Done when:** tables exist, seed runs cleanly, no UI change.

### 0.2 — `data-testid` audit
- Sweep the four big surfaces (Calendar, NewBooking, ClientLookup, ClientProfile) and add `data-testid` to every clickable thing the bot will need to point at.
- **Done when:** a written list of `data-testid`s per action category exists in `docs/training-testids.md`.

### 0.3 — Server endpoints (skeleton)
- `GET /api/training/state` → returns the current user's `training_user_profile` + per-category state.
- `POST /api/training/event` → accepts `{ category, type, helpLevel, metadata }`, writes to `training_events`, runs the reducer, updates `training_user_state`.
- `POST /api/training/reset/:userId` (owner only).
- **Done when:** endpoints respond with stubbed data; no UI yet.

---

## Phase 1 — The Engine (still mostly invisible)

### 1.1 — Adaptive reducer (pure function, fully unit-testable)
- Implement `applyEvent(state, event) → newState` using the rules from §3a.
- Promotion / demotion / graduation / per-category cooldown / silent-observation logic.
- **Done when:** the reducer works in isolation with hand-written event sequences.

### 1.2 — Server-side reducer hookup
- Wire `POST /api/training/event` to call the reducer and persist.
- Add `auto_enroll_new_staff` hook on staff creation → creates `training_user_profile` + initial `training_user_state` rows.
- **Done when:** creating a new staff user inserts the right rows; posting events updates them correctly.

### 1.3 — Client-side training context
- `<TrainingProvider />` at the root that fetches `/api/training/state` once per session and exposes `useTraining()` returning current help level per category.
- Tiny event emitter `trainingEvent(category, type, metadata?)` that POSTs (debounced) to `/api/training/event`.
- **Done when:** any component can call `useTraining('create-booking')` and get `{ helpLevel, graduated }`.

---

## Phase 2 — The Coach Overlay (visible, but unwired)

### 2.1 — `<CoachOverlay />` rendering primitives
- Spotlight ring (positioned over an element matched by `data-testid`).
- Coach card (title / body / "Why this matters" expander / dismiss).
- Tooltip pin variant.
- Whisper-dot variant (pulsing dot).
- Backdrop dim with click-to-skip on L3.
- **Done when:** a Storybook-style demo page renders all four levels against a fake button.

### 2.2 — Step descriptor types
- Implement `spotlight`, `tooltip`, `modal`, `wait-for-route`, `wait-for-state`.
- Each step takes a `data-testid` selector + an advance condition.
- **Done when:** a hard-coded test sequence ("click here, then here, then here") drives the overlay end-to-end.

### 2.3 — Hesitation / wrong-click / abandonment detectors
- Mouse-idle timer over the spotlit element → fires `hesitation` event after 8s.
- Document click listener: if click target is not the expected selector → `wrong-click`.
- Route change away from an in-progress flow → `abandoned`.
- **Done when:** events fire correctly in the demo page.

---

## Phase 3 — First Real Category: `create-booking`

### 3.1 — Author the step JSON for `create-booking`
- Walk the full new-booking flow and write the step descriptors (service → addon → staff tab → time → client → confirm).
- Store in `training_action_steps` via the seed script.

### 3.2 — Wire the overlay into NewBooking.tsx
- `<CoachOverlay category="create-booking" />` mounted near the top.
- It auto-opens when the user lands on `/new-booking` and `helpLevel >= 1`.
- Successful confirm → `success` event → reducer demotes.
- **Done when:** a fresh test user sees full L3 guidance through a complete booking; after 2 successful bookings they drop to L2 hints.

### 3.3 — Welcome modal
- On the first login of a newly enrolled user, show: *"Hi Sarah, I'll guide you through everything. Tap **?** anytime."*
- One-time, dismissible.

---

## Phase 4 — The Help Bubble

### 4.1 — Floating **?** button (always available)
- Bottom-right portal, present on every page for users with an active training profile.
- Tap → re-enables L2 hints for the current page for 5 minutes (sets a temporary `pinned_level` override that decays).
- **Done when:** tapping ? on a page where the user is at L0 brings hints back for 5 minutes.

### 4.2 — Search ("How do I…?")
- Long-press / second tap opens a search input.
- Searches `training_action_categories.title` + a few keyword aliases.
- Selecting a result navigates to the relevant page and forces L3 for that category.
- **Done when:** typing "refund" jumps to POS with full guidance.

---

## Phase 5 — Cover the Rest of the Surfaces

Each of these mirrors Phase 3 (author steps + wire overlay). Each is its own small PR.

- 5.1 — `open-calendar` + `navigate-date`
- 5.2 — `lookup-client-phone` + `create-new-client`
- 5.3 — `reschedule`
- 5.4 — `walk-in`
- 5.5 — `pos-checkout` + `apply-tip` + `apply-discount`
- 5.6 — `cancel-appointment` + `mark-no-show`
- 5.7 — `day-close`
- 5.8 — `refund` + `delete-client`

---

## Phase 6 — Live-mode Safety Layer

### 6.1 — High-risk confirmation modal
- Reusable `<TraineeGuardrail action="refund" amount={84} />` component.
- Wraps the existing confirm flows; shows extra trainee-specific copy if `useTraining()` says they're not graduated.
- **Done when:** a trainee attempting a refund sees the extra confirmation; a graduated user does not.

### 6.2 — Extended undo window for trainees
- Hook into the existing toast/undo system to bump the duration from 5s to 30s when the actor is a trainee.

### 6.3 — Owner notification on first high-risk action
- Server: on first event of `type=success` for a high-risk category, send an in-app notification + email.

### 6.4 — Rate-limit destructive bulk ops for trainees
- Middleware on the relevant routes: `if isTrainee && this is the 4th delete in 10 minutes → 429 with friendly message`.

---

## Phase 7 — Owner Dashboard

### 7.1 — Read-only roster
- New page **Settings → Training**: list of staff, enrolled date, days active, % L0, last activity.
- **Done when:** owner can see who's where.

### 7.2 — Per-staff heat-grid
- Table: rows = staff, columns = action categories, cells = current level (color-coded).

### 7.3 — Owner write actions
- Reset progress, mark graduated, pin category at level X.
- Toggles: auto-enroll new staff, show help bubble after graduation, email me on high-risk first-use.

### 7.4 — Recent high-risk activity feed

---

## Phase 8 — Graduation

### 8.1 — Graduation logic
- A scheduled job (or a check on each event) that computes: enrolled ≥ 7 days AND every touched category at L0.
- Sets `graduated_at`.

### 8.2 — Graduation card to the staff
- One-time *"You've graduated 🎓"* card on next login.

### 8.3 — Owner Day-7 digest email
- For trainees who **didn't** graduate by Day 7: per-staff "still needs help with X, Y" breakdown.

---

## Phase 9 — Practice Mode (sandbox overlay)

Built in parallel with Phases 5–8. Each sub-phase is its own PR.

### 9.1 — Sandbox store + seeder
- `stores.is_training_sandbox` boolean column.
- One sandbox store auto-created per real store on first staff enrollment.
- `scripts/seed-training-sandbox.ts` (4 demo staff, ~20 services, ~30 clients, ~40 appointments).
- Nightly cron that resets the sandbox.
- *Reset Practice Data* button.

### 9.2 — Side-effect short-circuits
- Single guard at the top of each external service call (SMS, email, Stripe, webhooks): if the operation's `storeId` is the sandbox → return `{ skipped: true }`.
- Unit tests confirming nothing leaves the building when sandbox.

### 9.3 — `<PracticeOverlay />` portal
- Renders as a portal over the live app, ~90% of viewport, leaving live calendar visible at the edges.
- Closes on **✕**, **Esc**, outside-click.
- **Done when:** can be opened and closed in <300ms with no lag.

### 9.4 — `StoreContext` override + route remount
- Inside the overlay, the existing app routes mount with a sandbox `storeId`.
- No duplicated UI — the same Calendar / NewBooking / Lookup components.

### 9.5 — Resume-where-you-left-off
- Persist overlay route + scroll + in-progress form state in `localStorage` keyed by user id.
- Restore on re-open.

### 9.6 — *Client just walked in!* shortcut
- Header button: closes overlay and navigates the live app to `/client-lookup`.

### 9.7 — Practice events feed the live algorithm at half weight
- Practice-mode events are tagged; the reducer counts successes at 0.5 toward demotion, ignores failures.

### 9.8 — Sidebar entry point
- "Practice" button in the staff sidebar for active trainees, hidden behind *Brush up* in profile menu after graduation.

---

## Phase 10 — Polish & Analytics

- 10.1 — Analytics dashboard for the owner: avg time to graduate, hardest categories, most-clicked-wrong selectors.
- 10.2 — "Welcome back" L1 mode for graduated staff returning to long-unused flows (>30 days).
- 10.3 — Localization scaffolding (move all coach copy into JSON files keyed by locale).
- 10.4 — Performance pass: ensure the overlay never adds >16ms to any frame.

---

## Suggested Sequencing & Parallelism

```
Week 1  →  Phase 0 + Phase 1
Week 2  →  Phase 2 + Phase 3
Week 3  →  Phase 4 + Phase 5.1–5.3 + start Phase 9.1–9.2
Week 4  →  Phase 5.4–5.6 + Phase 6 + Phase 9.3–9.5
Week 5  →  Phase 5.7–5.8 + Phase 7 + Phase 9.6–9.8
Week 6  →  Phase 8 + Phase 10 + bug bash + owner UAT
```

Phases 5.x, 6.x, 7.x, 9.x are **embarrassingly parallel** within their groups — multiple developers can work side-by-side without stepping on each other.

---

## What Ships at the End of Each Week

- **End of Week 1** → schema + reducer pass tests; nothing visible.
- **End of Week 2** → a new staff user gets fully guided through a real booking. Owner sees nothing yet.
- **End of Week 3** → bot adapts and demotes; help bubble works; sandbox dataset exists.
- **End of Week 4** → most calendar/booking flows guided; live-mode safety guards active; Practice overlay opens/closes.
- **End of Week 5** → all flows guided; owner dashboard live; Practice mode usable end-to-end.
- **End of Week 6** → graduation works; analytics + polish; ready to ship to production.

---

*Ready for your sign-off. Once you approve, I'll start with Phase 0.1.*
