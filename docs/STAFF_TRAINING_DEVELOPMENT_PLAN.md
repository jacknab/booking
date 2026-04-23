# Staff Training Tool — Development Plan

> Companion to `STAFF_TRAINING_TOOL_PLAN.md`. This file breaks the build into small, shippable phases. Each phase is **independently mergeable** and produces something the owner can see or click. Phases inside the same group are loosely ordered but most can be parallelized.

---

## Phase 0 — Foundations (no user-visible change yet)

### 0.1 — Schema scaffolding ✅ DONE
- Add Drizzle definitions for the seven tables in §4.1 of the main plan.
- Run `npm run db:push --force`.
- Add a tiny seed script that inserts the initial `training_action_categories` rows (slugs only, real copy comes later).
- **Done when:** tables exist, seed runs cleanly, no UI change.
- **Shipped:** 6 training tables in `shared/schema.ts`; 20 categories seeded via `scripts/seed-training-categories.ts` (highRisk flagged on refund / day-close / cancel / no-show / delete-client).

### 0.2 — `data-testid` audit ⏭ DEFERRED
- Sweep the four big surfaces (Calendar, NewBooking, ClientLookup, ClientProfile) and add `data-testid` to every clickable thing the bot will need to point at.
- **Done when:** a written list of `data-testid`s per action category exists in `docs/training-testids.md`.
- **Status:** NewBooking already has comprehensive testids (used by Phase 3 wiring). Calendar / ClientLookup / ClientProfile audit will happen alongside their respective Phase 5 sub-PRs.

### 0.3 — Server endpoints (skeleton) ✅ DONE
- `GET /api/training/state` → returns the current user's `training_user_profile` + per-category state.
- `POST /api/training/event` → accepts `{ category, type, helpLevel, metadata }`, writes to `training_events`, runs the reducer, updates `training_user_state`.
- `POST /api/training/reset/:userId` (owner only).
- **Done when:** endpoints respond with stubbed data; no UI yet.
- **Shipped:** `server/routes/training.ts` registered at `/api/training`; auto-enrollment via `ensureProfile()` on first call; reset is owner/manager-only.

---

## Phase 1 — The Engine (still mostly invisible) ✅ DONE

### 1.1 — Adaptive reducer (pure function, fully unit-testable) ✅ DONE
- Implement `applyEvent(state, event) → newState` using the rules from §3a.
- Promotion / demotion / graduation / per-category cooldown / silent-observation logic.
- **Done when:** the reducer works in isolation with hand-written event sequences.
- **Shipped:** `server/training/reducer.ts` — pure `reduce({state, event, highRisk})` honoring L3→L2 (2 successes), L2→L1 (3), L1→L0 (3 + 24h gate), promotion +1 on any failure event, per-category graduation at L0 + 5 successes (skipped for high-risk), pinned-level passthrough. Daily silent-observation logic and 4-per-hour cooldown deferred to Phase 10 polish.

### 1.2 — Server-side reducer hookup ✅ DONE
- Wire `POST /api/training/event` to call the reducer and persist.
- Add `auto_enroll_new_staff` hook on staff creation → creates `training_user_profile` + initial `training_user_state` rows.
- **Done when:** creating a new staff user inserts the right rows; posting events updates them correctly.
- **Shipped:** `/api/training/event` runs reducer, upserts `training_user_state`, returns the new state in the response. Auto-enroll happens lazily on first `/state` or `/event` (race-safe via `onConflictDoNothing` + re-read). Per-category state rows are created on first event for that category.

### 1.3 — Client-side training context ✅ DONE
- `<TrainingProvider />` at the root that fetches `/api/training/state` once per session and exposes `useTraining()` returning current help level per category.
- Tiny event emitter `trainingEvent(category, type, metadata?)` that POSTs (debounced) to `/api/training/event`.
- **Done when:** any component can call `useTraining('create-booking')` and get `{ helpLevel, graduated }`.
- **Shipped:** `client/src/contexts/TrainingContext.tsx` mounted in `App.tsx` inside `ErrorBoundary`. Exposes `useTraining()` and convenience `useTrainingCategory(slug)`. Optimistic local overrides apply reducer response instantly; canonical state refetched every 5 min. Per-`(slug,type)` 1.5s throttle. Errors swallowed (warn in dev) so training never breaks the host app.

---

## Phase 2 — The Coach Overlay (visible, but unwired) ✅ DONE

### 2.1 — `<CoachOverlay />` rendering primitives ✅ DONE
- Spotlight ring (positioned over an element matched by `data-testid`).
- Coach card (title / body / "Why this matters" expander / dismiss).
- Tooltip pin variant.
- Whisper-dot variant (pulsing dot).
- Backdrop dim with click-to-skip on L3.
- **Done when:** a Storybook-style demo page renders all four levels against a fake button.
- **Shipped:** `client/src/components/training/CoachOverlay.tsx` portals into `document.body` with all four levels wired to `helpLevel`: L3 = backdrop + spotlight ring + coach card; L2 = floating coach card only; L1 = pulsing whisper dot beside target; L0 = silent. Coach card has dismiss + "Why this matters" expander. Backdrop click-to-skip implemented. Storybook demo page skipped — the live NewBooking wiring exercises every variant.

### 2.2 — Step descriptor types ✅ DONE
- Implement `spotlight`, `tooltip`, `modal`, `wait-for-route`, `wait-for-state`.
- Each step takes a `data-testid` selector + an advance condition.
- **Done when:** a hard-coded test sequence ("click here, then here, then here") drives the overlay end-to-end.
- **Shipped:** `client/src/components/training/types.ts` defines `StepDescriptor` + `AdvanceCondition` (`click`, `any-click` for dynamic lists, `route`, `manual`). `variantForHelpLevel()` maps the current help level to the rendered variant. `useTargetRect()` rAF-tracks the live bounding rect of the target so the spotlight follows scroll/resize.

### 2.3 — Hesitation / wrong-click / abandonment detectors ✅ DONE
- Mouse-idle timer over the spotlit element → fires `hesitation` event after 8s.
- Document click listener: if click target is not the expected selector → `wrong-click`.
- Route change away from an in-progress flow → `abandoned`.
- **Done when:** events fire correctly in the demo page.
- **Shipped:** Detectors live inside `CoachOverlay` so they activate per step automatically. Hesitation timer = 8s after target appears. Document-level capture listener distinguishes the expected target (advances) from interactive misclicks (`wrong-click`); non-interactive div clicks ignored. Unmount-while-mid-sequence fires `abandoned`.

---

## Phase 3 — First Real Category: `create-booking`

### 3.1 — Author the step JSON for `create-booking` ✅ DONE
- Walk the full new-booking flow and write the step descriptors (service → addon → staff tab → time → client → confirm).
- Store in `training_action_steps` via the seed script.
- **Shipped:** `client/src/components/training/steps/createBooking.ts` defines 8 steps (pick-category → pick-service → addons → pick-staff → confirm-staff → pick-slot → complete-booking → confirm-success). Stored in code rather than `training_action_steps` for now — DB-driven steps will land if owner-customizable copy becomes a real requirement; until then code-defined keeps copy reviewable in Git.

### 3.2 — Wire the overlay into NewBooking.tsx ✅ DONE
- `<CoachOverlay category="create-booking" />` mounted near the top.
- It auto-opens when the user lands on `/new-booking` and `helpLevel >= 1`.
- Successful confirm → `success` event → reducer demotes.
- **Done when:** a fresh test user sees full L3 guidance through a complete booking; after 2 successful bookings they drop to L2 hints.
- **Shipped:** `<CoachOverlay category="create-booking" steps={CREATE_BOOKING_STEPS} active />` mounted at the top of NewBooking. End-of-sequence dispatches `success`, the server reducer demotes, the new help level is echoed back and immediately drives the next render. L0/graduated users get nothing.

### 3.3 — Welcome modal ⏭ DEFERRED
- On the first login of a newly enrolled user, show: *"Hi Sarah, I'll guide you through everything. Tap **?** anytime."*
- One-time, dismissible.
- **Status:** Will land alongside Phase 4.1 (the floating ? bubble) so the modal can point at it.

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

## Phase 8 — Graduation ✅ DONE

### 8.1 — Graduation logic ✅ DONE
- A scheduled job (or a check on each event) that computes: enrolled ≥ 7 days AND every touched category at L0.
- Sets `graduated_at`.
- **Shipped:** `server/training/graduation-scheduler.ts` runs `graduationSweep()` hourly (plus once at boot). For every non-graduated profile, looks up the user's store-level `graduationMinDays` (default 7), checks every touched `training_user_state` row is at `helpLevel === 0`, and stamps `profile.graduatedAt` + resets `graduationNotifiedOwner`/`graduationStaffNotified` so the owner toast (Phase 6) and staff card (8.2) re-fire. The original per-event check in `/api/training/event` still fires (immediate path), but the scheduler catches users who hit L0 in many categories without triggering further events.

### 8.2 — Graduation card to the staff ✅ DONE
- One-time *"You've graduated 🎓"* card on next login.
- **Shipped:** `client/src/components/training/GraduationCard.tsx` mounted in `App.tsx`. Renders when `profile.graduatedAt && !profile.graduationStaffNotified`. Dismiss → `POST /api/training/acknowledge-graduation` flips the flag so it never re-fires (and re-fires after an owner reset, which clears the flag).

### 8.3 — Owner Day-7 digest email ✅ DONE
- For trainees who **didn't** graduate by Day 7: per-staff "still needs help with X, Y" breakdown.
- **Shipped:** `day7DigestSweep()` runs every 6h. For each eligible trainee (enrolled ≥ `graduationMinDays`, not graduated, no digest sent yet), groups by store owner, sends a single Mailgun email per owner listing every staff member and the categories they're stuck on (any state with `helpLevel > 0`). Stamps `profile.day7DigestSentAt` on success so each trainee triggers exactly one digest. Owner reset clears the timestamp so the digest can fire again after a reset.

---

## Phase 9 — Practice Mode (sandbox overlay)

Built in parallel with Phases 5–8. Each sub-phase is its own PR.

### 9.1 — Sandbox store + seeder ✅ DONE
- `locations.is_training_sandbox` + `sandbox_parent_store_id` columns.
- `server/training/sandbox.ts` — `ensureSandboxForStore` / `resetSandboxData` / `resetAllSandboxes` / `ensureSandboxForUser`.
- Hooked into `ensureProfile` so the first time a user enrolls, their store gets a sandbox.
- `scripts/seed-training-sandbox.ts` — manual reseed (all stores or specific ids).
- Nightly cron in graduation-scheduler (24h tick) wipes & reseeds every sandbox.
- `POST /api/training/sandbox/reset` admin endpoint + *Reset Practice Data* button on TrainingAdmin.
- Sandbox stores have `userId=null` so they stay out of the owner's normal store picker.

### 9.2 — Side-effect short-circuits ✅ DONE
- `isSandboxStore(storeId)` helper in `server/training/sandbox.ts` (60s in-memory cache, manual invalidation on sandbox create).
- Guard at the top of `sendSms` (server/sms.ts) — logs to `sms_log` with status `sandbox-skipped`, returns `{ success: true, skipped: true }`. Twilio is never called.
- Guard at the top of `sendEmail` (server/mail.ts) — logs once, returns `{ success: true, skipped: true }`. Mailgun is never called.
- Guard at the Stripe test-magstripe payment endpoint (server/routes.ts) — returns a fake successful payment intent so the trainee's POS flow completes.
- All call sites already route through these three helpers, so reminder/dialer/queue flows inherit the guard automatically.
- Smoke-tested live: SMS + email return `{skipped: true}` for sandbox storeIds and behave normally for real ones.

### 9.3 — `<PracticeOverlay />` portal ✅ DONE
- `client/src/contexts/PracticeModeContext.tsx` — `inPractice` state + `enterPractice` / `exitPractice` / `togglePractice`.
- `client/src/components/training/PracticeOverlay.tsx` — `createPortal` to `document.body`, 90vw × 90vh panel with rounded edges over a `bg-black/40` backdrop so the live calendar stays visible at the edges.
- Closes on **✕** button, **Esc** keydown (capture phase), and outside-click (mousedown on backdrop).
- Body scroll locked while open to prevent layout shift on open/close.
- Animated in <200ms via Tailwind `animate-in fade-in zoom-in-95 duration-150` — well under the 300ms target.
- Temporary trigger: **Cmd/Ctrl + Shift + P** opens or closes the overlay (sidebar entry comes in 9.8).
- Mounted inside `TrainingProvider` in App.tsx so it inherits training state for future phases.

### 9.4 — `StoreContext` override + route remount ✅ DONE
- `GET /api/training/sandbox` returns (and lazily creates) the caller's sandbox `locations` row.
- `client/src/components/training/SandboxStoreProvider.tsx` fetches it and re-supplies the existing `StoreContext` with the sandbox as `selectedStore`. Every page that calls `useSelectedStore()` automatically operates on the sandbox without code changes.
- `client/src/components/training/SandboxRoutes.tsx` reuses the live page components (Calendar, NewBooking, ClientLookup, POSInterface, Customers, ClientProfile, Dashboard) — no duplicated UI.
- `PracticeOverlay` mounts those routes inside a `MemoryRouter` (initial entry `/calendar`), so practice navigation never changes the live URL bar and live and practice keep separate route stacks.

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
