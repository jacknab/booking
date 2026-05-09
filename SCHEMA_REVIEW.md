# Certxa — Schema & Code Review Notes

*Generated May 9, 2026 — items for owner review*

---

## ✅ Already Fixed This Session

| Item | What Was Done |
|---|---|
| `api_keys` table missing from DB | Re-exported from `shared/schema.ts` and pushed |
| `campaigns` table missing from DB | Re-exported from `shared/schema.ts` and pushed |
| Login page layout | Right panel stabilized to 500px, marketing content vertically centered |
| "Reviews" sidebar link | Hidden (commented out) — Google Reviews link remains |
| PHP thumbnail generator | Updated to correct script path, port 8104, Chromium env var |

---

## 🔶 Suggested Schema Improvements

These are not bugs — the app works as-is — but they create confusion for AI code generation tools and are worth addressing when convenient.

---

### 1. `appointments` table — Non-standard column names

The schema uses column names that differ from what every AI and developer expects. This is the most likely source of "column not found" errors.

| What AI/devs expect | What the schema actually has | Notes |
|---|---|---|
| `start_time` | `date` | Stores the appointment start as a timestamp |
| `end_time` | *(computed)* | Not stored — derived from `date + duration` |
| `total_price` | `total_paid` | The charged amount |
| `created_at` | *(missing)* | No audit trail of when the record was created |
| `updated_at` | *(missing)* | No audit trail of last modification |
| `source` | *(missing)* | Can't track if booking came from widget, walk-in, staff, etc. |
| `color` | *(missing)* | Can't color-code individual appointments on the calendar |
| `no_show_at` | *(missing)* | No timestamp for when a no-show was marked |
| `intake_form_response_id` | *(missing)* | Can't directly link an appointment to its intake form |

**Recommended additions:**
```ts
createdAt: timestamp("created_at").defaultNow(),
updatedAt: timestamp("updated_at").defaultNow(),
source: text("source").default("staff"),         // staff | widget | walk_in | phone
color: text("color"),
noShowAt: timestamp("no_show_at"),
intakeFormResponseId: integer("intake_form_response_id"),
```

---

### 2. `staff` table — Missing standard columns

| What AI/devs expect | What the schema actually has | Notes |
|---|---|---|
| `active` | `status` | Schema uses `status` (active/invited/deactivated/removed) — good design but confuses AI tools |
| `profile_image_url` | `avatar_url` | Different name than what AI typically generates |
| `created_at` | *(missing)* | No record of when a staff member was added |
| `hire_date` | *(missing)* | Can't track tenure or anniversary |
| `pin_hash` | *(missing)* | Can't support PIN-based POS login for staff |

**Recommended additions:**
```ts
createdAt: timestamp("created_at").defaultNow(),
hireDate: text("hire_date"),
pinHash: text("pin_hash"),
```

---

### 3. `services` table — Missing standard columns

| What AI/devs expect | What the schema actually has | Notes |
|---|---|---|
| `active` | *(missing)* | Can't soft-disable a service without deleting it |
| `color` | *(missing)* | Can't color-code services on the calendar |
| `created_at` | *(missing)* | No audit trail |
| `max_clients` | *(missing)* | Can't support group/class bookings |

**Recommended additions:**
```ts
active: boolean("active").default(true),
color: text("color"),
createdAt: timestamp("created_at").defaultNow(),
maxClients: integer("max_clients").default(1),
```

---

### 4. `customers` (legacy) vs `clients` (new) — Duplicate tables

The database has **two customer tables**:

| Table | Purpose |
|---|---|
| `customers` | Original simple table (name, email, phone, notes, birthday, allergies) |
| `clients` | New rich client data architecture (full normalized design with separate emails, phones, addresses, tags, notes, audit logs, etc.) |

Both tables exist and both are actively used by different parts of the app. This means the app has split data and some features won't see records from the other table.

**Recommendation:** Decide on a migration path:
- Option A: Migrate `customers` data into `clients` and deprecate the old table
- Option B: Keep both but add a `customer_id` foreign key on the `clients` table as a bridge

---

### 5. `drizzle.config.ts` — Only reads one schema file

The drizzle config currently only points to `./shared/schema.ts`:
```ts
schema: "./shared/schema.ts",
```

Any table defined in a sub-file (`shared/schema/*.ts`) must be manually re-exported from `shared/schema.ts` or it will be invisible to `db:push`. This is what caused the `api_keys` and `campaigns` tables to be missing.

**Recommendation:** Either:
- Change the config to use a glob: `schema: "./shared/schema/**/*.ts"` — picks up all sub-files automatically
- Or keep the current pattern but always remember to add re-exports when adding new schema files

---

### 6. `sms_settings` — Column name note (not a bug)

The schema correctly uses `twilio_account_sid`, `twilio_auth_token`, `twilio_phone_number`. AI tools sometimes look for `account_sid`, `auth_token`, `phone_number` (shorter versions). This is fine as-is but worth knowing when prompting AI tools about SMS settings.

---

## 📋 Priority Order (Suggested)

| Priority | Item | Effort |
|---|---|---|
| High | Add `created_at` to `appointments`, `staff`, `services` | Low — add columns + db:push |
| High | Fix drizzle config to use glob pattern | Low — one-line change |
| Medium | Add `active` to `services` | Low |
| Medium | Add `source` and `color` to `appointments` | Low |
| Medium | Add `pin_hash` to `staff` for POS PIN login | Low |
| Low | Rename `appointments.date` → `start_time` | High — requires migration + all query updates |
| Low | Resolve `customers` vs `clients` dual-table issue | High — data migration required |

---

*All items marked ✅ are complete. Items above are suggestions only — no changes have been made to these yet.*
