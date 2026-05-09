# Staff Direct Booking Links & Embeddable Website Blocks

This document covers three connected features in Certxa:
1. **Direct Staff Booking Links** — unique URLs that pre-select a specific team member on the booking page
2. **Embeddable Staff Card Widget** — a ready-to-paste HTML snippet for the salon's own website
3. **Launchit Block Library** — a library of pre-built HTML blocks for use in any website template

---

## 1. Direct Staff Booking Links

### What they are
Each team member gets their own unique booking URL. When a client clicks it, the online booking page opens pre-filtered to only show that team member's available time slots.

### URL format
```
https://yourdomain.com/book/<salon-slug>?staff=<staffId>
```

**Example:**
```
https://app.certxa.com/book/luxe-studio?staff=12
```

- `salon-slug` is the booking slug set in **Online Booking settings**.
- `staffId` is the internal numeric ID of the team member.

### How to find and copy links
1. Go to the **Certxa dashboard**.
2. Navigate to **Online Booking** (in the sidebar under Settings or Booking).
3. Scroll to the **Team Booking Links** card.
4. Each active team member is listed with their unique URL displayed beneath their name.
5. Click **Copy** next to any team member to copy their link to the clipboard.

### How the booking page behaves
When a client visits a staff-specific link:
- The availability calendar only shows time slots for that team member.
- A badge appears in the booking header: **"Booking with [Name]"** — so the client knows exactly who they're booking with.
- This works across all three booking themes (Simple, Mobile App UI, Classic).

### Where to use staff booking links
- On your salon website, next to each stylist's photo or profile section.
- In your Instagram bio (link to a specific stylist).
- In email newsletters highlighting a team member.
- On business cards for individual stylists ("Book directly with me").

---

## 2. Embeddable Staff Card Widget

### What it is
A self-contained HTML code snippet that renders up to 4 staff cards on any website. Each card shows the team member's photo, name, bio, and a "Book with me" button that links to their individual booking URL.

### How to get your personalised snippet
1. Go to **Online Booking** in the Certxa dashboard.
2. Scroll to the **Embed Staff Cards on Your Website** card (just below Team Booking Links).
3. The HTML snippet is automatically generated using your actual staff data and booking URLs.
4. Click **Copy HTML** to copy the entire snippet to your clipboard.

### Pasting it into your website
The snippet is pure HTML with inline styles — no external CSS or JavaScript required. Paste it into:
- **WordPress**: Add a "Custom HTML" block in the Gutenberg editor.
- **Squarespace**: Use a "Code" block in any page.
- **Wix**: Add an "HTML iframe" or "Custom Code" element.
- **Webflow**: Paste into an "Embed" element.
- **Any HTML file**: Paste directly into the `<body>` section.

### What it looks like
Four cards displayed in a responsive grid. Each card contains:
| Element | Source |
|---|---|
| Photo | Staff avatar URL from Certxa profile |
| Name | Staff name from Certxa profile |
| Bio | Staff bio from Certxa profile |
| "Book with me" button | Links to `/book/<slug>?staff=<id>` |

If a staff member has no photo, a placeholder avatar icon is shown instead.

### Customising the snippet
After copying, you can edit any part of the HTML:
- Change the button colour: find `background:#7c3aed` and replace with your brand colour.
- Adjust card width: change `minmax(200px,1fr)` in the grid style.
- Reduce to fewer cards: delete the extra `<div>` blocks.

---

## 3. Launchit Block Library

### What it is
The Block Library is a collection of pre-built HTML blocks inside the Launchit admin panel. Each block is a self-contained, copy-paste-ready HTML snippet designed to drop into any website template — no coding experience required.

### How to access it
1. Log into the **Launchit Admin** at `/launchsite/admin.php`.
2. Click **Block Library** in the top navigation bar.
3. Browse blocks by category using the filter buttons.

### Available blocks

| Block Name | Category | Description |
|---|---|---|
| **Team Booking Cards** | Team | 4 staff cards with photo, name, bio, and individual booking buttons |
| **Book Now Button** | Booking | A single styled "Book an Appointment" CTA button |
| **Booking Banner** | Booking | A full-width gradient banner with headline, tagline, and booking link |
| **Mini Service Menu** | Services | A 3-column service listing with name, description, price, and booking link |
| **Review Strip** | Social Proof | 3 client review cards with star ratings and reviewer names |

### How to use a block
1. Click **Copy Code** on the block you want.
2. Open your website editor (WordPress, Squarespace, Wix, Webflow, or any HTML editor).
3. Paste the code into an HTML or Code block.
4. Replace all `PLACEHOLDER` values (shown in `ALL_CAPS_WITH_UNDERSCORES`) with your real content.
5. Save and publish.

### The Team Booking Cards block in detail
This is the most important block. After pasting:
- Replace `PHOTO_URL_1` through `PHOTO_URL_4` with direct image links to your stylist photos.
- Replace `STAFF_NAME_1` through `STAFF_NAME_4` with your team members' names.
- Replace `STAFF_BIO_1` through `STAFF_BIO_4` with a short description for each person.
- Replace `BOOKING_URL_1` through `BOOKING_URL_4` with each person's individual booking link from the Certxa dashboard (see Section 1 above).

**Tip:** If you have fewer than 4 staff members, simply delete the extra `<div>` card blocks.

### Adding new blocks (for developers)
New blocks are defined in the `$blocks` array at the top of `php/launchsite/blocks.php`. Each block entry requires:
```php
[
    'id'       => 'unique-block-id',       // used as the textarea ID
    'name'     => 'Block Display Name',
    'category' => 'Team',                  // Team | Booking | Services | Social Proof
    'desc'     => 'Short description.',
    'badge'    => 'new',                   // 'new', 'popular', or '' for none
    'code'     => <<<'HTML'
<!-- Your HTML block goes here -->
HTML,
]
```

---

## Technical Reference

### Backend
- No backend changes were needed for staff direct booking links.
- The existing availability API at `GET /api/public/store/:slug/availability` already accepts an optional `staffId` query parameter which filters slots to that staff member only.

### Frontend files changed
| File | Change |
|---|---|
| `client/src/pages/PublicBooking.tsx` | Reads `?staff=<id>` from URL and passes `preselectedStaffId` to all themes |
| `client/src/pages/public-booking/SimpleTheme.tsx` | Accepts `preselectedStaffId`, filters availability, shows staff badge |
| `client/src/pages/public-booking/MobileTheme.tsx` | Same as above |
| `client/src/pages/public-booking/ClassicTheme.tsx` | Same as above |
| `client/src/pages/OnlineBooking.tsx` | Adds Team Booking Links card and Embed Staff Cards card |

### Launchit files changed/created
| File | Change |
|---|---|
| `php/launchsite/blocks.php` | New file — the Block Library page |
| `php/launchsite/admin.php` | Added "Block Library" link to the admin header nav |

---

## Frequently Asked Questions

**Q: What if a staff member's ID changes?**
A: Staff IDs in Certxa are permanent numeric database IDs that do not change. You only need to copy the link once.

**Q: What happens if a client visits a staff link for someone who has left?**
A: If the staff member has no availability set, the booking page will show no available slots and the client will see a message indicating no times are available.

**Q: Can I use staff booking links in Google Ads or Facebook Ads?**
A: Yes. They are standard HTTPS URLs and work anywhere a regular link works.

**Q: Do the embeddable blocks slow down my website?**
A: No. The blocks are pure HTML with inline styles. There is no JavaScript, no external fonts, and no tracking. They are as lightweight as it gets.

**Q: Can I change the button colour in the blocks?**
A: Yes. Find `background:#7c3aed` in the copied HTML and change the hex colour to match your brand.
