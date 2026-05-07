# Launchit Catalog Admin Guide

## Accessing the Admin Panel

**URL:** `https://your-domain.com/launchsite/admin.php`

In development (Replit), open the PHP catalog preview and navigate to `/launchsite/admin.php`.

**Default password:** `launchit-admin`

To set a custom password, add an environment variable:
- Variable name: `ADMIN_PASSWORD`
- Variable value: your chosen password

---

## What You Can Do in the Admin

- **View all templates** — see every template across Hair Salons, Barbershops, and Nail Salons at a glance, with their type (PHP or React) and thumbnail status
- **Upload React/Vite templates** — drag-drop a `.zip` file and the admin auto-installs it into the catalog
- **Preview any template** — click "Preview ↗" next to any template to open it in the full-screen preview

---

## Uploading a New React Template

### Step 1 — Prepare your ZIP

Your `.zip` should contain a React/Vite project at its root (with `package.json`, `src/`, etc.). It can optionally include a `launchit.json` manifest file to pre-fill the upload form automatically.

**Example ZIP structure:**
```
my-template.zip
├── launchit.json          ← optional: auto-fills the form
├── package.json
├── vite.config.ts         ← will be overwritten automatically
├── src/
│   ├── main.tsx
│   ├── App.tsx
│   └── ...
└── public/
```

### Step 2 — Include a `launchit.json` (optional but recommended)

If your ZIP includes this file, the upload form fills in automatically:

```json
{
  "id": "my-nail-template",
  "name": "My Nail Template",
  "category": "Nail Salon",
  "style": "Modern",
  "desc": "Short description shown in the catalog.",
  "badge": "new",
  "accent": "#f43f5e",
  "dark": "#111827",
  "light": "#1f2937",
  "business_name": "My Nail Studio",
  "hero_tagline": "Where beauty meets relaxation.",
  "hero_sub": "Premium nail care in a serene environment."
}
```

**Category options:** `Hair Salon`, `Barbershop`, `Nail Salon`
**Badge options:** `new`, `popular`, `premium`, or leave empty

### Step 3 — Upload and install

1. Go to `/launchsite/admin.php` and sign in
2. Scroll to **Upload New React/Vite Template**
3. Drag your `.zip` onto the drop zone (or click to browse)
4. Fill in the form fields (auto-filled if `launchit.json` is present)
5. Click **Install Template**

The admin will:
- Extract your ZIP to `artifacts/template-{id}/`
- Write a `vite.config.ts` with the correct base path and output directory
- Run `pnpm install` to install dependencies
- Run `vite build` to compile the app
- Register the template in the catalog data file
- Generate a thumbnail image for the catalog card
- Automatically make the template appear in its category page

The process takes **30–60 seconds** depending on the number of dependencies.

### Step 4 — Done

Your template appears immediately in:
- The category page (e.g. `/launchsite/nail-salons.php`)
- The admin template list
- The preview page (`/launchsite/preview.php?id=your-template-id`)

---

## How Uploaded Templates Work

React/Vite templates are built into static files at:
```
launchsite-php/templates/{id}/
```

They are served by the PHP catalog's router and displayed in the preview page inside an iframe. The catalog keeps the chrome bar (back button, device toggle, "Use This Design" button) around the template.

---

## Updating an Existing Template

The admin does not currently support updating an existing template through the UI. To rebuild a template manually:

```bash
# From the workspace root
cd artifacts/template-{id}
pnpm install
pnpm exec vite build
```

The built output in `launchsite-php/templates/{id}/` will be updated automatically.

---

## Regenerating All Thumbnails

To regenerate PHP-rendered thumbnails for all original templates:

```bash
cd launchsite-php
php generate-thumbs.php
```

---

## Production Deployment

On a VPS (Apache/Nginx), copy the entire `launchsite-php/` directory to:
```
/var/www/certxa.com/launchsite/
```

No `router.php` is needed in production — Apache/Nginx handles routing. The `templates/` subdirectory containing all built React SPAs deploys alongside the PHP files.
