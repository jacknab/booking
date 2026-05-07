# Launchit — VPS Deployment Guide

Complete instructions for deploying the Certxa Launchit catalog to a production VPS.
The catalog lives at `certxa.com/launchsite/` alongside the rest of your site.

---

## Table of Contents

1. [Server Requirements](#1-server-requirements)
2. [Get the Files onto Your VPS](#2-get-the-files-onto-your-vps)
3. [Web Server Configuration](#3-web-server-configuration)
4. [PHP Configuration](#4-php-configuration)
5. [File Permissions](#5-file-permissions)
6. [Admin Password](#6-admin-password)
7. [Node.js + pnpm (React template uploads)](#7-nodejs--pnpm-react-template-uploads)
8. [Chromium / Puppeteer (Regen Thumb)](#8-chromium--puppeteer-regen-thumb)
9. [First-Run Checklist](#9-first-run-checklist)
10. [Ongoing Admin Workflow](#10-ongoing-admin-workflow)
11. [Security Hardening](#11-security-hardening)
12. [Troubleshooting](#12-troubleshooting)

---

## 1. Server Requirements

| Component | Minimum | Notes |
|---|---|---|
| OS | Ubuntu 22.04 LTS | Other Debian-based distros work too |
| Web server | **Nginx 1.18+** | |
| PHP | **8.2+** | 8.3 is fine |
| PHP-FPM | **8.2** | Nginx uses FPM to run PHP |
| PHP extensions | `gd`, `mbstring`, `json`, `session` | GD is required for thumbnail upload/resize |
| Node.js | **20 LTS** or 22 LTS | Required only for React template installs |
| pnpm | **8+** | Package manager for React templates |
| Disk space | 2 GB+ free | Each React template build ~50–200 MB |
| RAM | 1 GB+ | 2 GB recommended if using Puppeteer |

---

## 2. Get the Files onto Your VPS

### Option A — rsync from your local machine (recommended)

From your local machine (or Replit shell), push the catalog files directly:

```bash
rsync -avz --delete \
  /path/to/workspace/launchsite-php/ \
  user@your-vps-ip:/var/www/certxa.com/launchsite/
```

> **Note:** The `launchsite-php/` folder is the web root for the catalog.
> Everything inside it (PHP files, assets, templates, thumbs) goes into `/var/www/certxa.com/launchsite/`.

### Option B — Git

If your repo is on GitHub/GitLab:

```bash
ssh user@your-vps-ip
cd /var/www/certxa.com
git clone https://github.com/yourname/yourrepo.git .
# then copy launchsite-php/ into place:
cp -r launchsite-php/ launchsite/
```

### Option C — SFTP / FileZilla

Connect with your SFTP client and upload the contents of `launchsite-php/` into `/var/www/certxa.com/launchsite/`.

---

## 3. Web Server Configuration

> `router.php` is **only** used by the PHP built-in dev server (Replit).
> On Nginx you do **not** use `router.php` — Nginx handles routing directly.

### Install Nginx and PHP-FPM

```bash
sudo apt update
sudo apt install -y nginx php8.2-fpm php8.2-gd php8.2-mbstring php8.2-json
```

### Create the Nginx server block

```bash
sudo nano /etc/nginx/sites-available/certxa
```

Paste the following (adjust `server_name` and paths to match your setup):

```nginx
server {
    listen 80;
    server_name certxa.com www.certxa.com;
    root /var/www/certxa.com;
    index index.php index.html;

    # ── Launchit catalog ──────────────────────────────────────────────────────

    # React SPA fallback — must come BEFORE the general /launchsite block
    # Each templates/{id}/ directory is its own SPA; non-file routes serve index.html
    location ~ ^/launchsite/templates/([^/]+)/(.+)$ {
        try_files $uri /launchsite/templates/$1/index.html;
    }

    # Main catalog — PHP pages and static assets
    location /launchsite {
        try_files $uri $uri/ @launchit_php;
    }

    location @launchit_php {
        fastcgi_pass unix:/run/php/php8.2-fpm.sock;
        fastcgi_index index.php;
        fastcgi_param SCRIPT_FILENAME $document_root$fastcgi_script_name;
        include fastcgi_params;
    }

    # PHP execution
    location ~ \.php$ {
        fastcgi_pass unix:/run/php/php8.2-fpm.sock;
        fastcgi_param SCRIPT_FILENAME $document_root$fastcgi_script_name;
        include fastcgi_params;
    }

    # Block direct access to the template registry
    location /launchsite/data/ {
        deny all;
    }

    # Disable directory listings
    autoindex off;

    # Max upload size (must match php.ini values below)
    client_max_body_size 65M;

    error_log  /var/log/nginx/certxa_error.log;
    access_log /var/log/nginx/certxa_access.log;
}
```

### Enable the site and test

```bash
sudo ln -s /etc/nginx/sites-available/certxa /etc/nginx/sites-enabled/
sudo nginx -t          # must print: configuration file ... syntax is ok
sudo systemctl reload nginx
```

### HTTPS with Let's Encrypt

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d certxa.com -d www.certxa.com
```

Certbot automatically adds HTTPS redirects and sets up auto-renewal.

---

## 4. PHP Configuration

Edit the PHP-FPM php.ini:

```bash
sudo nano /etc/php/8.2/fpm/php.ini
```

Find and update these values:

```ini
; Required for React template ZIP uploads
upload_max_filesize = 60M
post_max_size       = 65M
max_execution_time  = 180
max_input_time      = 120
memory_limit        = 256M

; Required for thumbnail generation
extension=gd
```

Verify GD is active:

```bash
php -m | grep gd
# should print: gd
```

If GD is missing:

```bash
sudo apt install php8.2-gd -y
```

Restart PHP-FPM after any php.ini change:

```bash
sudo systemctl restart php8.2-fpm
```

---

## 5. File Permissions

The web server user (`www-data`) must be able to **read** all files and **write** to specific directories the admin panel uses.

```bash
# Set ownership
sudo chown -R www-data:www-data /var/www/certxa.com/launchsite/

# Set standard permissions
sudo find /var/www/certxa.com/launchsite/ -type f -exec chmod 644 {} \;
sudo find /var/www/certxa.com/launchsite/ -type d -exec chmod 755 {} \;

# Directories the admin panel writes to — must be writable
sudo chmod 775 /var/www/certxa.com/launchsite/data/
sudo chmod 775 /var/www/certxa.com/launchsite/assets/img/thumbs/
sudo chmod 775 /var/www/certxa.com/launchsite/templates/
```

> If you also deploy React template source files (`artifacts/template-*/`), keep them **outside** the web root — e.g. `/var/www/certxa-artifacts/` — so they are not publicly accessible. The admin install script only needs write access to `templates/` and `data/`.

---

## 6. Admin Password

The admin panel (`/launchsite/admin.php`) is protected by a password.

### Set via PHP-FPM pool config (recommended)

```bash
sudo nano /etc/php/8.2/fpm/pool.d/www.conf
```

Add this line anywhere in the file (near the other `env[…]` lines if present):

```ini
env[ADMIN_PASSWORD] = your-strong-password-here
```

Restart FPM to apply:

```bash
sudo systemctl restart php8.2-fpm
```

### Generate a strong password

```bash
openssl rand -base64 24
# example output: K8mXpQ2nLv7rJwYcFtAdEhBs
```

### Fallback default

If no environment variable is set, the default password is `launchit-admin`.
**Change this before going live.**

---

## 7. Node.js + pnpm (React template uploads)

Required if you want to upload new React/Vite template ZIPs through the admin panel and have them built automatically on the server.

```bash
# Install Node.js 20 LTS
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Verify
node -v    # v20.x.x
npm -v

# Install pnpm globally
sudo npm install -g pnpm

# Verify
pnpm -v    # 8.x or 9.x
```

The admin install script runs `pnpm install` and `pnpm run build` as the `www-data` user. If `www-data` cannot find `node` or `pnpm` due to a restricted PATH, fix it in the FPM pool config:

```bash
sudo nano /etc/php/8.2/fpm/pool.d/www.conf
```

Add:

```ini
env[PATH] = /usr/local/bin:/usr/bin:/bin
```

Then restart FPM:

```bash
sudo systemctl restart php8.2-fpm
```

---

## 8. Chromium / Puppeteer (Regen Thumb)

The **Regen Thumb** button takes a headless browser screenshot of the live template and saves it as the catalog card image. This requires Chromium on the server.

```bash
# Install Chromium
sudo apt install -y chromium-browser

# Confirm the path
which chromium-browser
# typically: /usr/bin/chromium-browser
```

Update the screenshot script to use the server's Chromium path. Open `scripts/src/screenshot.mjs` and find the `executablePath` line — change it to:

```js
executablePath: '/usr/bin/chromium-browser',
```

Install script dependencies once on the server:

```bash
cd /path/to/scripts/   # wherever your scripts/ folder lives on the VPS
pnpm install
```

> **Note:** The **Upload Image** button does not need Chromium — it uses PHP GD to resize your image directly. Chromium is only needed for the automatic screenshot feature.

---

## 9. First-Run Checklist

After uploading files and configuring the server, run through this list:

```
[ ] Visit https://certxa.com/launchsite/ — catalog homepage loads
[ ] Visit https://certxa.com/launchsite/hair-salons.php — template grid loads with thumbnails
[ ] Click a template card — preview page opens correctly
[ ] Visit https://certxa.com/launchsite/admin.php — login form appears
[ ] Log in with your admin password — template table loads
[ ] Click "Preview ↗" on a PHP template — full preview renders
[ ] Click "Preview ↗" on a React template — iframe loads the built SPA
[ ] Click "Edit" on any template — modal opens with current values
[ ] Edit a field, Save — flash message confirms, change appears in table
[ ] Click "Upload Image" — modal opens, upload a test image, thumbnail updates
[ ] Try uploading a React ZIP through the admin panel
```

---

## 10. Ongoing Admin Workflow

Once live, manage everything through the admin panel at `/launchsite/admin.php`.

### Adding a new React template

1. Zip your React/Vite project source folder
2. Log into the admin panel
3. Click **Upload New React/Vite Template**, choose category, upload ZIP
4. The server installs dependencies, builds the site, registers it, and generates a thumbnail — takes 30–90 seconds
5. The new template card appears in the catalog immediately

### Updating a template's catalog entry

- **Edit** — change name, description, colors, badge, hero text directly in the admin
- **Upload Image** — replace the catalog card thumbnail with any JPG/PNG/WebP
- **Regen Thumb** — re-capture a fresh screenshot from the live template
- **Duplicate** — create a second catalog entry (React: also copies built files)
- **Replace** — upload a new ZIP to rebuild the template completely

### Pushing code updates from Replit to VPS

After making changes in Replit, sync to the server with rsync:

```bash
rsync -avz --delete \
  /path/to/workspace/launchsite-php/ \
  user@your-vps-ip:/var/www/certxa.com/launchsite/

# Fix ownership after sync
ssh user@your-vps-ip "sudo chown -R www-data:www-data /var/www/certxa.com/launchsite/"
```

---

## 11. Security Hardening

### Block access to sensitive paths in Nginx

These are already in the server block above, but confirm they are present:

```nginx
# Block the template registry from public access
location /launchsite/data/ {
    deny all;
}

# Optionally restrict admin pages to your IP only
location ~ ^/launchsite/admin.*\.php$ {
    allow 203.0.113.0;   # replace with your IP
    deny all;
    fastcgi_pass unix:/run/php/php8.2-fpm.sock;
    fastcgi_param SCRIPT_FILENAME $document_root$fastcgi_script_name;
    include fastcgi_params;
}
```

### Keep software updated

```bash
sudo apt update && sudo apt upgrade -y
sudo systemctl restart nginx php8.2-fpm
```

### File upload directory

Uploaded ZIP files are written to `/tmp` by default — they are never web-accessible there.

### Prevent PHP execution inside the templates/ directory

React template directories contain only static HTML/JS/CSS. Block PHP execution inside them:

```nginx
location ~ ^/launchsite/templates/.*\.php$ {
    deny all;
}
```

Add this block to your server config above the general `\.php$` handler.

---

## 12. Troubleshooting

### Catalog page shows a PHP parse error

The `data/templates.php` file has a syntax error (can happen after a failed install or delete).

```bash
php -l /var/www/certxa.com/launchsite/data/templates.php
```

If it fails, open the file and look for the broken entry near the end. Remove the incomplete block. Each entry must look like:

```php
'template-id' => [
    'id'       => 'template-id',
    'name'     => '...',
    ...
    'type'     => 'react',
],
```

### React template shows 404 or blank white page

The SPA routing location block is not matching. Check:

- The `location ~ ^/launchsite/templates/([^/]+)/(.+)$` block is defined **before** the general `/launchsite` block in your Nginx config
- Built files actually exist: `ls /var/www/certxa.com/launchsite/templates/{template-id}/`
- Test Nginx config: `sudo nginx -t` and reload: `sudo systemctl reload nginx`

### Thumbnail not generating (Regen Thumb)

- Verify Chromium is installed: `which chromium-browser`
- Check the `executablePath` in `scripts/src/screenshot.mjs` matches that path
- Confirm `pnpm install` has been run in the `scripts/` directory
- The `www-data` user must be able to run `node` — check `env[PATH]` in `www.conf`

### ZIP upload fails or times out

- Increase limits in `/etc/php/8.2/fpm/php.ini` (Section 4)
- Confirm `post_max_size` is larger than `upload_max_filesize`
- Confirm `client_max_body_size 65M` is set in your Nginx server block
- Verify disk space: `df -h`
- Check `/tmp` is writable: `ls -la /tmp`

### pnpm install fails during template upload

- Confirm `env[PATH]` is set in `www.conf` (Section 7)
- Check internet access: `curl https://registry.npmjs.org`
- Check disk space: `df -h`

### Admin panel redirects to login after every action

PHP sessions are not persisting. Check the session directory:

```bash
php -i | grep session.save_path
ls -la /var/lib/php/sessions/
```

Fix ownership:

```bash
sudo chown www-data:www-data /var/lib/php/sessions/
sudo chmod 700 /var/lib/php/sessions/
sudo systemctl restart php8.2-fpm
```

---

## Quick Reference

| URL | What it is |
|---|---|
| `certxa.com/launchsite/` | Catalog homepage |
| `certxa.com/launchsite/hair-salons.php` | Hair salon template grid |
| `certxa.com/launchsite/barbershops.php` | Barbershop template grid |
| `certxa.com/launchsite/nail-salons.php` | Nail salon template grid |
| `certxa.com/launchsite/preview.php?id={id}` | Full template preview |
| `certxa.com/launchsite/admin.php` | Admin panel (password protected) |

| File / Directory | Purpose |
|---|---|
| `data/templates.php` | Central template registry — source of truth |
| `assets/img/thumbs/` | Catalog card thumbnails (900×620 JPEG) |
| `templates/{id}/` | Built React SPA files |
| `assets/css/style.css` | Catalog styles |
| `config.php` | `BASE_PATH` constant |

| Key config file | Purpose |
|---|---|
| `/etc/nginx/sites-available/certxa` | Nginx server block |
| `/etc/php/8.2/fpm/php.ini` | PHP settings (upload limits, GD) |
| `/etc/php/8.2/fpm/pool.d/www.conf` | FPM pool — env vars (password, PATH) |
| `/var/lib/php/sessions/` | PHP session storage |
