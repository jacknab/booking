# Certxa – Full VPS Deployment Guide

> **For the AI reading this:** This is a monorepo that ships THREE distinct applications as a single Node.js process. You must understand all three before touching anything.

---

## 1. What This Codebase Is

**Certxa** is a SaaS "business-in-a-box" for service businesses (salons, barbershops, spas, handymen, etc.). One Node.js/Express server stitches together:

| Application | Technology | URL Pattern |
|---|---|---|
| **Marketing / PHP site** | PHP 8.x served via built-in PHP dev server | `certxa.com/` root, `/assets/`, `/launchsite/`, `/templates/`, `.php` files |
| **Booking & Management App** | React (Vite) + Express REST API | `manage.certxa.com` subdomain OR any path starting with `/api/`, `/manage`, `/auth`, `/onboarding` |
| **Per-business Public Booking Pages** | React SPA served from same build | `<slug>.certxa.com` subdomains e.g. `tobys-barbershop.certxa.com` |

The Express server acts as the single entry point and routes traffic to the right destination.

---

## 2. System Architecture

```
Internet
    │
    ▼
Nginx (SSL termination + reverse proxy)
    │  proxy_pass → localhost:5000
    ▼
Node.js Express Server (port 5000)
    ├── /api/*                 → Express route handlers (TypeScript)
    ├── /assets/, /, *.php     → PHP proxy → PHP built-in server (port 8081)
    ├── /launchsite/           → PHP proxy → PHP built-in server (port 8081)
    ├── manage.certxa.com      → React SPA (served from dist/public)
    └── <slug>.certxa.com      → React SPA or PHP template
         │
PostgreSQL database (local or remote)
```

---

## 3. Prerequisites on the VPS

Install these before anything else:

```bash
# Node.js 20 (exact — the code uses Node 20 features)
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# PHP 8.1+ with required extensions
sudo apt-get install -y php8.1 php8.1-cli php8.1-curl php8.1-mbstring php8.1-xml php8.1-zip

# PostgreSQL 15 or 16
sudo apt-get install -y postgresql-16

# Build tools (needed for some npm native modules)
sudo apt-get install -y build-essential python3

# PM2 process manager
sudo npm install -g pm2

# Nginx
sudo apt-get install -y nginx

# Certbot for SSL
sudo apt-get install -y certbot python3-certbot-nginx
```

---

## 4. Environment Variables (Required)

Create `/home/deploy/certxa/.env` with ALL of these. Do not skip any — missing vars cause silent failures or crashes.

```env
# ─── Node ───────────────────────────────────────────────────────────────────
NODE_ENV=production
PORT=5000

# ─── Database ────────────────────────────────────────────────────────────────
# Format: postgresql://USER:PASSWORD@HOST:PORT/DBNAME?sslmode=disable
DATABASE_URL=postgresql://certxa_user:YOURPASSWORD@127.0.0.1:5432/certxa_db

# ─── Session ─────────────────────────────────────────────────────────────────
# CRITICAL: Must be a long random string. Generate with: openssl rand -hex 64
SESSION_SECRET=GENERATE_RANDOM_64_CHAR_HEX_STRING

# ─── App URL ─────────────────────────────────────────────────────────────────
APP_URL=https://certxa.com

# ─── CORS ────────────────────────────────────────────────────────────────────
CORS_ALLOW_ALL=false
CORS_ORIGINS=https://certxa.com,https://www.certxa.com,https://manage.certxa.com

# ─── Google OAuth (for user login) ───────────────────────────────────────────
GOOGLE_CLIENT_ID=your_google_oauth_client_id
GOOGLE_CLIENT_SECRET=your_google_oauth_client_secret
GOOGLE_AUTH_CALLBACK_URL=https://certxa.com/api/auth/google/callback

# ─── Google Business Profile API (for store Google reviews sync) ──────────────
GOOGLE_REDIRECT_URI=https://certxa.com/api/google-business/callback

# ─── Twilio (SMS notifications) ───────────────────────────────────────────────
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE_NUMBER=+18888147623

# ─── TextBelt (fallback SMS) ──────────────────────────────────────────────────
TEXTBELT_API_KEY=your_textbelt_key

# ─── Mailgun (email notifications) ───────────────────────────────────────────
MAILGUN_API_KEY=your_mailgun_api_key
MAILGUN_DOMAIN=mg.yourdomain.com
MAILGUN_FROM_EMAIL=noreply@yourdomain.com
MAILGUN_FROM_NAME=Certxa
MAILGUN_SENDER_EMAIL=noreply@yourdomain.com

# ─── Stripe (payments / subscriptions) ───────────────────────────────────────
STRIPE_SECRET_KEY=sk_live_xxxxxxxxxxxxxxxxxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxxxxxxxxx

# ─── OpenAI (AI chatbot / suggestions) ───────────────────────────────────────
OPENAI_API_KEY=sk-xxxxxxxxxxxxxxxxxxxx

# ─── Trial period ─────────────────────────────────────────────────────────────
TRIAL_PERIOD_DAYS=60

# ─── Active store groups (internal feature flag) ──────────────────────────────
ACTIVE_GROUPS=3
```

---

## 5. PostgreSQL Setup

```bash
# Switch to postgres user
sudo -u postgres psql

-- Inside psql:
CREATE USER certxa_user WITH PASSWORD 'YOURPASSWORD';
CREATE DATABASE certxa_db OWNER certxa_user;
GRANT ALL PRIVILEGES ON DATABASE certxa_db TO certxa_user;
\q
```

Then push the schema (run from the project root after npm install):

```bash
npm run db:push
```

This uses Drizzle ORM to create all tables from `shared/schema.ts`. You do NOT run raw SQL migrations manually — Drizzle handles it.

---

## 6. Clone & Install

```bash
# As your deploy user (not root)
cd /home/deploy
git clone https://github.com/YOUR_ORG/certxa.git certxa
cd certxa

# Install ALL dependencies (including devDependencies — needed for the build)
npm install

# Copy in your .env file
cp /path/to/your/.env .env
```

---

## 7. Build for Production

```bash
# Inside the project root
npm run build
```

This runs `script/build.ts` which does THREE things in order:
1. **Vite build** — compiles the React frontend → `dist/public/`
2. **SSR bundle** — builds server-side rendering for SEO routes → `dist/server/entry-server.cjs`
3. **Express server bundle** — compiles all TypeScript server code → `dist/index.cjs`

After the build, verify:
```bash
ls dist/          # should show: index.cjs, public/, server/
ls dist/public/   # should show: index.html, assets/
ls dist/server/   # should show: entry-server.cjs
```

If any of these are missing, the build failed. Check the output for errors.

---

## 8. PHP Server (CRITICAL — do not skip)

The PHP server starts **automatically** when Node starts (see `server/php-proxy.ts`). Node spawns `php -S 127.0.0.1:8081` inside the `php/` directory using `php/router.php`.

**Verify PHP is installed:**
```bash
php --version   # must be 8.1+
which php       # must return a path
```

If PHP is not found, the entire marketing site (certxa.com homepage, all .php pages, launchsite templates) will return 502 errors.

The PHP server:
- Runs on `127.0.0.1:8081` (not exposed externally)
- Serves everything in the `php/` directory
- Is proxied by Express at routes matching: `/`, `/assets/`, `/videos/`, `/launchsite/`, `/editor/`, `/templates/`, and any `.php` file

---

## 9. PM2 Process Configuration

Use the included `ecosystem.config.cjs`:

```bash
cat ecosystem.config.cjs
```

It should look like this (verify before using):
```js
module.exports = {
  apps: [{
    name: 'certxa',
    script: './dist/index.cjs',
    instances: 1,           // increase to 'max' for multi-core only after testing
    exec_mode: 'fork',      // NOT cluster — the app manages its own PHP subprocess
    env_production: {
      NODE_ENV: 'production',
      PORT: 5000
    }
  }]
}
```

**IMPORTANT:** Do NOT use `exec_mode: 'cluster'` — the app spawns a child PHP process and cluster mode would spawn multiple competing PHP servers.

Start the app:
```bash
pm2 start ecosystem.config.cjs --env production
pm2 save
pm2 startup    # follow the printed command to make it survive reboots
```

---

## 10. Nginx Configuration

Create `/etc/nginx/sites-available/certxa`:

```nginx
# ── Rate limiting ──────────────────────────────────────────────────────────
limit_req_zone $binary_remote_addr zone=api:10m rate=30r/m;
limit_req_zone $binary_remote_addr zone=auth:10m rate=10r/m;

# ── HTTP → HTTPS redirect ──────────────────────────────────────────────────
server {
    listen 80;
    server_name certxa.com www.certxa.com manage.certxa.com *.certxa.com;
    return 301 https://$host$request_uri;
}

# ── Main HTTPS server ──────────────────────────────────────────────────────
server {
    listen 443 ssl http2;
    server_name certxa.com www.certxa.com manage.certxa.com *.certxa.com;

    ssl_certificate     /etc/letsencrypt/live/certxa.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/certxa.com/privkey.pem;
    ssl_protocols       TLSv1.2 TLSv1.3;
    ssl_ciphers         HIGH:!aNULL:!MD5;

    # ── Security headers (app also sets these, Nginx adds a second layer) ──
    add_header X-Frame-Options SAMEORIGIN always;
    add_header X-Content-Type-Options nosniff always;

    # ── Client upload limit (for profile photos, import files) ────────────
    client_max_body_size 55M;

    # ── Proxy everything to the Node app ──────────────────────────────────
    location / {
        proxy_pass         http://127.0.0.1:5000;
        proxy_http_version 1.1;

        # WebSocket support (used by Vite HMR in dev and internal WS connections)
        proxy_set_header Upgrade    $http_upgrade;
        proxy_set_header Connection "upgrade";

        # Pass real client IP through
        proxy_set_header Host              $host;
        proxy_set_header X-Real-IP         $remote_addr;
        proxy_set_header X-Forwarded-For   $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header X-Forwarded-Host  $host;

        # Timeouts — important for long-running requests (PDF gen, AI, etc.)
        proxy_connect_timeout 60s;
        proxy_send_timeout    120s;
        proxy_read_timeout    120s;
    }

    # ── Rate-limit auth endpoints ──────────────────────────────────────────
    location /api/auth/ {
        limit_req zone=auth burst=5 nodelay;
        proxy_pass         http://127.0.0.1:5000;
        proxy_http_version 1.1;
        proxy_set_header Host              $host;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header X-Forwarded-Host  $host;
        proxy_set_header X-Real-IP         $remote_addr;
        proxy_set_header X-Forwarded-For   $proxy_add_x_forwarded_for;
    }

    # ── Cache static assets aggressively ──────────────────────────────────
    location /assets/ {
        proxy_pass http://127.0.0.1:5000;
        proxy_cache_valid 200 365d;
        add_header Cache-Control "public, max-age=31536000, immutable";
    }
}
```

Enable and test:
```bash
sudo ln -s /etc/nginx/sites-available/certxa /etc/nginx/sites-enabled/
sudo nginx -t          # must say "test is successful"
sudo systemctl reload nginx
```

---

## 11. SSL Certificates

```bash
# Issue wildcard cert (covers certxa.com, *.certxa.com, manage.certxa.com)
sudo certbot certonly --nginx \
  -d certxa.com \
  -d www.certxa.com \
  -d manage.certxa.com \
  -d "*.certxa.com"

# Auto-renewal (certbot sets this up automatically, verify it)
sudo certbot renew --dry-run
```

---

## 12. DNS Records Required

In your DNS provider (Cloudflare, etc.), add:

| Type | Name | Value | Notes |
|---|---|---|---|
| `A` | `certxa.com` | `YOUR_VPS_IP` | Root domain |
| `A` | `www` | `YOUR_VPS_IP` | |
| `A` | `manage` | `YOUR_VPS_IP` | Subscriber dashboard |
| `A` | `*` | `YOUR_VPS_IP` | Wildcard for booking slugs |
| `MX` | `mg` | Mailgun MX records | Email sending |
| `TXT` | `mg` | Mailgun SPF/DKIM records | Email auth |

**If using Cloudflare:** Set the wildcard `*` record to **DNS only (grey cloud)** — NOT proxied. Cloudflare's free plan does not proxy wildcard subdomains.

---

## 13. CORS — Understanding & Fixing

CORS is configured in `server/index.ts`. In production these origins are allowed:
- `https://certxa.com`
- `https://www.certxa.com`
- `https://manage.certxa.com`
- Any `*.certxa.com` subdomain

**The most common CORS mistake:** The `CORS_ORIGINS` env var is being set but doesn't match what the browser sends.

Rules:
- Origins must include protocol: `https://certxa.com` ✅ / `certxa.com` ❌
- No trailing slash: `https://certxa.com` ✅ / `https://certxa.com/` ❌
- Nginx MUST pass `X-Forwarded-Host` to Node (see Nginx config above) — without it, subdomain detection fails

If you still get CORS errors in development, temporarily set `CORS_ALLOW_ALL=true` to confirm the issue is CORS and not something else, then fix origins properly.

---

## 14. Subdomain Routing (How Slugs Work)

The `server/middleware/subdomain.ts` middleware inspects the `Host` header on every request:

- `certxa.com` → normal request, goes through PHP proxy for root/marketing pages
- `manage.certxa.com` → marks request as `isManageSubdomain=true`, serves React SPA
- `<slug>.certxa.com` → looks up `locations.bookingSlug` in the database; if found, serves the booking React SPA with that store pre-loaded

**This only works with a wildcard DNS record AND a wildcard SSL cert.** Without both of these, sub-business pages will show SSL errors.

---

## 15. Port Map

| Port | Service | Exposed? |
|---|---|---|
| `80` | Nginx (HTTP → redirect) | Yes |
| `443` | Nginx (HTTPS) | Yes |
| `5000` | Node.js Express app | **No — localhost only** |
| `8081` | PHP built-in server | **No — localhost only** |
| `5432` | PostgreSQL | **No — localhost only** |

Never expose port 5000 or 8081 directly to the internet.

---

## 16. Startup & Shutdown Sequence

**Start:**
1. `pm2 start ecosystem.config.cjs --env production`
2. Node starts on port 5000
3. Node automatically spawns PHP on port 8081
4. App is ready once you see: `serving on port 5000` in PM2 logs

**Stop:**
```bash
pm2 stop certxa
```
This sends SIGTERM to Node, which automatically sends SIGTERM to the PHP subprocess (handled in `server/php-proxy.ts`).

**Restart after code deploy:**
```bash
npm run build && pm2 restart certxa
```

**View logs:**
```bash
pm2 logs certxa          # live logs
pm2 logs certxa --lines 200  # last 200 lines
```

---

## 17. Deploy Flow (After Initial Setup)

```bash
cd /home/deploy/certxa
git pull origin main
npm install              # only if package.json changed
npm run build            # always rebuild
pm2 restart certxa
pm2 logs certxa          # verify no startup errors
```

---

## 18. Database Migrations

Schema changes are handled by Drizzle ORM. After pulling new code:

```bash
npm run db:push
```

This auto-diffs `shared/schema.ts` against the live database and applies changes. It is safe to run on a running production database (no downtime for most changes).

Never run the raw SQL files in `migrations/` directly unless told to — Drizzle manages the migration state.

---

## 19. Health Checks

The app exposes `/api/health` (check `server/routes.ts`). Use it to verify the app is up:

```bash
curl https://certxa.com/api/health
```

Expected response: `{"status":"ok","db":true}` or similar.

---

## 20. Common Problems & Fixes

### "502 Bad Gateway" on marketing pages
→ PHP is not running. Check: `ps aux | grep php`. If missing, restart the Node app — it spawns PHP automatically.

### "404" on `/api/*` routes in production
→ The build is missing or stale. Run `npm run build` and `pm2 restart certxa`.

### Session not persisting / logged out immediately
→ `SESSION_SECRET` is missing or empty. Also check that `DATABASE_URL` is correct — sessions are stored in the `sessions` table in PostgreSQL.

### Google OAuth fails
→ `GOOGLE_AUTH_CALLBACK_URL` must exactly match what is registered in Google Cloud Console. It must be `https://certxa.com/api/auth/google/callback`.

### Stripe webhooks failing
→ `STRIPE_WEBHOOK_SECRET` must match the secret from the Stripe dashboard webhook endpoint. Register `https://certxa.com/api/webhooks/stripe` as the endpoint.

### SMS not sending
→ Twilio credentials are per-store — check the store's SMS Settings in the admin panel. The `TWILIO_*` env vars are global defaults only.

### Subdomain booking pages not loading
→ Check DNS: `dig +short slug.certxa.com` must return your VPS IP. Check wildcard SSL cert covers `*.certxa.com`.

### CORS error in browser console
→ Check that Nginx is forwarding `X-Forwarded-Host` correctly. Verify `CORS_ORIGINS` matches the browser's `Origin` header exactly (include protocol, no trailing slash).

---

## 21. File Structure Reference

```
certxa/
├── client/              # React frontend (Vite)
│   └── src/
│       ├── pages/       # All app pages (Calendar, POS, Inventory, etc.)
│       ├── components/  # Shared UI components
│       └── entry-server.tsx  # SSR entry point
├── server/              # Express backend (TypeScript)
│   ├── index.ts         # Main server entry — reads all env vars here
│   ├── auth.ts          # Login/register/Google OAuth endpoints
│   ├── routes.ts        # ALL API route registrations (100+ endpoints)
│   ├── db.ts            # PostgreSQL connection pool (Drizzle ORM)
│   ├── php-proxy.ts     # Spawns PHP server + proxies marketing routes
│   ├── passport.ts      # Google OAuth passport strategy
│   ├── mail.ts          # Mailgun email sending
│   ├── storage.ts       # IStorage interface — DB access layer
│   ├── middleware/
│   │   └── subdomain.ts # Wildcard subdomain routing logic
│   ├── services/
│   │   ├── billing-service.ts   # Stripe billing
│   │   ├── trial-service.ts     # 60-day free trial logic
│   │   └── trial-expiration.ts  # Scheduler that disables expired trials
│   └── startup/
│       ├── repairOwnerRoles.ts  # One-time data fix on boot
│       └── migrateSmsAllowance.ts
├── shared/              # Shared TypeScript types (used by both client & server)
│   ├── schema.ts        # Drizzle ORM table definitions — the source of truth
│   └── models/
│       └── auth.ts      # users & sessions tables
├── php/                 # PHP marketing site
│   ├── router.php       # PHP built-in server router
│   ├── index.php        # certxa.com homepage
│   ├── launchsite/      # LaunchSite template catalog
│   └── templates/       # Built HTML templates for user websites
├── migrations/          # Drizzle migration files (managed automatically)
├── script/
│   └── build.ts         # Production build script (Vite + SSR + ESBuild)
├── dist/                # BUILD OUTPUT — generated by npm run build
│   ├── index.cjs        # Compiled Express server
│   ├── public/          # Compiled React frontend
│   └── server/
│       └── entry-server.cjs  # SSR bundle
├── ecosystem.config.cjs # PM2 config
├── .env                 # Environment variables (never commit this)
└── package.json
```

---

## 22. Environment Variable Quick Reference

| Variable | Required | What it does |
|---|---|---|
| `NODE_ENV` | Yes | `production` or `development` |
| `PORT` | Yes | Port Node listens on (default `5000`) |
| `DATABASE_URL` | Yes | PostgreSQL connection string |
| `SESSION_SECRET` | Yes | Signs session cookies — must be long & random |
| `APP_URL` | Yes | Base URL e.g. `https://certxa.com` — used in password reset emails |
| `CORS_ALLOW_ALL` | No | Set `true` only for debugging CORS |
| `CORS_ORIGINS` | No | Comma-separated allowed origins (overrides defaults) |
| `GOOGLE_CLIENT_ID` | For Google login | From Google Cloud Console |
| `GOOGLE_CLIENT_SECRET` | For Google login | From Google Cloud Console |
| `GOOGLE_AUTH_CALLBACK_URL` | For Google login | Must match Google Console exactly |
| `GOOGLE_REDIRECT_URI` | For Google Business | Callback for Google Business Profile OAuth |
| `TWILIO_ACCOUNT_SID` | For SMS | Global default (also set per-store in admin panel) |
| `TWILIO_AUTH_TOKEN` | For SMS | Global default |
| `TWILIO_PHONE_NUMBER` | For SMS | Sending number |
| `TEXTBELT_API_KEY` | For SMS fallback | Alternative SMS provider |
| `MAILGUN_API_KEY` | For email | Mailgun API key |
| `MAILGUN_DOMAIN` | For email | e.g. `mg.certxa.com` |
| `MAILGUN_FROM_EMAIL` | For email | Sender address |
| `MAILGUN_FROM_NAME` | For email | Sender display name |
| `STRIPE_SECRET_KEY` | For billing | Stripe secret key |
| `STRIPE_WEBHOOK_SECRET` | For billing webhooks | From Stripe dashboard |
| `OPENAI_API_KEY` | For AI features | OpenAI API key |
| `TRIAL_PERIOD_DAYS` | No | Default `60` |
| `ACTIVE_GROUPS` | No | Default `3` — internal feature flag |
