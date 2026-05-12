# Navigation — Removed Links

Links removed from the sidebar and mobile navigation menus as part of the nav
simplification. **The underlying pages still exist and are fully functional.**
They are accessible by navigating directly to the URL shown, or by re-adding
the link to `Sidebar.tsx` / `MobileBottomNav.tsx`.

---

## Removed Links

### Payment / Billing (primary reason for removal)

| Link label | URL | Was in section | Reason removed |
|---|---|---|---|
| **Billing** | `/billing` | Finance | Subscription and payment management — not relevant in day-to-day nav |
| **Gift Cards** | `/gift-cards` | Finance | Payment product — removes payment focus from the main nav |

### Redundant / rarely accessed

| Link label | URL | Was in section | Reason removed |
|---|---|---|---|
| **SMS Activity** | `/sms-activity` | Clients | Covered by SMS Inbox — activity log is a secondary view not needed in primary nav |
| **Training Settings** | `/dashboard/training/settings` | Business | One-time configuration, accessible from the Training page itself — not a daily nav item |
| **Website Templates** | `/launchsite/` | Launchit! | PHP admin link — not a typical user journey from the main app nav |
| **Website Editor** | `/launchsite/admin-edit.php` | Launchit! | PHP admin link — direct admin tool, not needed in primary nav |

---

## What was kept

Everything else remains — no functional pages were removed, only nav shortcuts.

The pages above are still reachable by their direct URL or by re-adding the
entry to the relevant `navGroups` array in `Sidebar.tsx` and the matching
`NAV_SECTIONS` array in `MobileBottomNav.tsx`.

---

## How to restore a link

### Sidebar (`client/src/components/layout/Sidebar.tsx`)

Add an entry to the appropriate `navGroups` section:

```ts
{ to: "/billing", label: "Billing", icon: CreditCard, permission: PERMISSIONS.STORE_SETTINGS, hideForStaff: true },
```

Restore the import at the top of the file if the icon is no longer imported:

```ts
import { CreditCard, Gift, LayoutTemplate, Palette } from "lucide-react";
```

### Mobile nav (`client/src/components/MobileBottomNav.tsx`)

Add an entry to the appropriate `NAV_SECTIONS` section:

```ts
{ to: "/billing", label: "Billing", icon: CreditCard },
```

Restore the import:

```ts
import { ..., CreditCard, Gift } from "lucide-react";
```

---

## Current nav structure (after cleanup)

### Sidebar

**Overview**
- Dashboard
- Analytics
- Revenue Intelligence

**Calendar**
- Calendar
- Calendar Settings

**Clients**
- Customers
- Waitlist
- Queue
- Loyalty Program
- SMS Inbox
- Campaigns
- Google Reviews

**Business**
- Services
- Team
- Staff Training
- Products
- Intake Forms

**Finance**
- Reports
- Cash Drawer
- Commissions

**Launchit!**
- Website Designs

**Settings**
- My Account
- Online Booking
- SMS Notifications
- Email Notifications
- Business Settings
- Roles & Permissions
- API Keys *(elite plan only)*
- Multi-Location *(elite plan only)*
