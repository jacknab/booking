# Certxa — VPS Deploy Script Guide

`scripts/deploy.sh` is a self-healing deploy script for the Certxa VPS.
It handles everything from pulling code to starting the app, and automatically
detects and fixes the most common failure modes — including missing database
tables, nginx misconfigurations, port conflicts, and more.

---

## Quick Reference

| Command | What it does |
|---|---|
| `bash scripts/deploy.sh` | Full deploy (pull → migrate → build → start) |
| `bash scripts/deploy.sh --nginx-only` | Audit and repair nginx only, no deploy |
| `bash scripts/deploy.sh --db-check` | Audit and repair DB schema only, no deploy |
| `bash scripts/deploy.sh --db-migrate` | Run pending migrations only, no deploy |
| `SKIP_GIT_PULL=1 bash scripts/deploy.sh` | Deploy without pulling from git |
| `SKIP_MIGRATE=1 bash scripts/deploy.sh` | Deploy without running migrations |
| `SKIP_BUILD=1 bash scripts/deploy.sh` | Deploy using the existing `dist/` (fast restart) |

---

## Full Deploy — What Happens Step by Step

### Step 1 — Pre-flight checks
Verifies everything is in place before touching anything:
- `.env` file exists and is loaded
- `DATABASE_URL`, `SESSION_SECRET`, and `APP_URL` are set
- Required tools are installed: `node`, `npm`, `pm2`, `git`, `lsof`, `curl`
- Node.js is version 20 or higher
- At least 500 MB of disk space is free
- PostgreSQL can be reached

If any pre-flight check fails, the script stops immediately and tells you what to fix.

### Step 2 — Backup current dist/
Copies the existing `dist/` to `/tmp/certxa-dist-backup` before touching anything.
If the deploy fails, the script auto-rolls back to this backup.

### Step 3 — Pull latest code
Runs a smart git pull that handles common problems automatically:
- Removes stale lock files (`.git/index.lock`)
- Aborts any in-progress merge, rebase, cherry-pick, or bisect
- Stashes any local uncommitted changes
- Confirms you are on the `main` branch
- Fetches from origin with exponential backoff (up to 4 retries)
- Hard-resets to `origin/main`

### Step 4 — Install dependencies
Runs `npm ci --prefer-offline` to install exact dependency versions from `package-lock.json`.

### Step 5 — Run database migrations
Runs `scripts/migrate.ts` to apply any SQL files in `migrations/` that have not yet
been applied. This uses the `schema_migrations` tracking table so each file only
runs once and is safe to call on every deploy.

**First-run on an existing database:** if `schema_migrations` is empty but core
tables already exist, all current migration files are marked as applied without
being re-run (baseline seed). Only new migrations added after the baseline will
execute in future deploys.

### Step 6 — Build production bundle
Runs `npm run build` which compiles the TypeScript server and Vite frontend
into `dist/index.cjs` and `dist/public/`.

### Step 7 — Validate build output
Confirms that `dist/index.cjs` and `dist/public/index.html` were created.
If either is missing the deploy is aborted.

### Step 8 — Start the app with PM2
Stops and deletes any existing PM2 process for the app, clears ports `8100` and
`8104`, then starts fresh using `ecosystem.config.cjs`.

### Step 9 — Self-healing health check loop
Runs up to **5 rounds** of health checking + auto-repair:

1. Calls `http://127.0.0.1:8100/api/health` directly (bypasses nginx)
2. If it returns `200`, also calls the public URL through nginx
3. If either check fails, the script reads PM2 logs, identifies the cause,
   applies a fix, and retests

---

## Self-Healing: What Gets Fixed Automatically

The script detects and fixes 13 known failure patterns:

| # | Detected problem | Automatic fix |
|---|---|---|
| 1 | Port 8100 already in use | Kills the stale process, restarts |
| 2 | `node_modules` missing or corrupt | Runs `npm ci`, restarts |
| 3 | `dist/index.cjs` not found | Runs `npm run build`, restarts |
| 4 | PostgreSQL not running | `systemctl start postgresql`, restarts |
| 5 | Bad DB credentials (wrong password/user) | Reports the problem, cannot auto-fix |
| 6 | Missing env vars (SESSION_SECRET etc.) | Reloads PM2 with `--update-env` |
| 7 | PHP binary not found | `apt-get install php-cli`, restarts |
| 8 | Too many open file descriptors | `ulimit -n 65536`, restarts |
| 9 | Out of memory / OOM kill | Reports memory usage, suggests adding swap |
| 10 | PM2 process stuck in restart loop | Full `pm2 delete` + fresh start |
| 11 | PM2 in errored state (no pattern matched) | Full `pm2 delete` + fresh start |
| **12** | **Missing DB tables or columns** | **Runs all pending migrations, restarts** |
| **13** | **nginx returning 502** (app is healthy internally) | **Full nginx audit + repair + reload** |

### How the DB schema fix works (Fix 12)

When PM2 logs contain errors like:

```
ERROR: relation "appointments" does not exist
ERROR: column "stripe_customer_id" does not exist
```

The script automatically:
1. Connects to PostgreSQL and checks all 9 required core tables
2. Lists any that are missing
3. Runs `scripts/migrate.ts` to apply all pending migration files
4. Verifies the missing tables now exist
5. Restarts the app

If a table is still missing after migrations (meaning no migration file creates it),
the script tells you exactly what to do:

```bash
touch migrations/$(date +%Y%m%d_%H%M%S)_fix_missing_table.sql
# Write the CREATE TABLE or ALTER TABLE SQL inside the file
bash scripts/deploy.sh --db-check   # re-run to verify
```

### How the nginx fix works (Fix 13)

When the app responds `200` internally but nginx returns `502`, the script runs
a full nginx audit covering both config files:

| Config | Domain | Port |
|---|---|---|
| `certxa` (Node.js app) | `manage.certxa.com` or your `APP_URL` | `8100` |
| `certxa-php.conf` (PHP marketing site) | `certxa.com` + `www.certxa.com` | `8422` |

The audit checks and auto-fixes:
- nginx not installed → installs via `apt-get`
- Config missing from `/etc/nginx/sites-available/` → copies from project
- `__DOMAIN__` / `__APP_PORT__` placeholders still in file → substitutes them
- Config not symlinked in `/etc/nginx/sites-enabled/` → creates symlink
- Wrong port in installed config (e.g. stale `6050`) → patches to `8100`
- SSL cert path not found → searches for real cert, patches the path
- Duplicate `limit_req_zone` names → removes duplicates
- Default nginx site conflicting → unlinks it
- `nginx -t` fails → attempts to auto-fix (missing `ssl-dhparams.pem`, etc.)
- After all fixes → reloads nginx and rechecks the public URL

---

## Standalone Flags

These flags let you run a specific repair task without doing a full deploy.
Useful for debugging on a live server without touching the app.

### `--nginx-only`

```bash
bash scripts/deploy.sh --nginx-only
```

Runs the full nginx audit and repair, then exits. Does not pull code, run
migrations, build, or restart the app. Use this when:

- You've just changed one of the `nginx/` config files and want to push it
- nginx is returning 502 or 504 and you want to diagnose it
- You've renewed an SSL cert and need nginx to reload
- You're setting up a fresh VPS and want to install the nginx configs

### `--db-check`

```bash
bash scripts/deploy.sh --db-check
```

Checks all 9 required tables, applies any pending migrations, and exits.
Use this when:

- The app crashes with `relation "X" does not exist` errors
- You've added a new migration file and want to apply it immediately
  without a full redeploy
- You want to verify the database schema is complete after restoring a backup

### `--db-migrate`

```bash
bash scripts/deploy.sh --db-migrate
```

Loads `.env` and runs `scripts/migrate.ts` directly, then exits. This is
the fastest way to apply new migration files without any other steps.

---

## Environment Variables

All configuration is read from `.env` in the project root.

| Variable | Required | Description |
|---|---|---|
| `DATABASE_URL` | Yes | PostgreSQL connection string |
| `SESSION_SECRET` | Yes | Secret for signing session cookies |
| `APP_URL` | Yes | Public URL of the app (e.g. `https://manage.certxa.com`) |
| `PORT` | No | Node.js port — defaults to `8100` |
| `PHP_PORT` | No | Internal PHP server port — defaults to `8104` |
| `PM2_APP_NAME` | No | PM2 process name — defaults to `certxa` |
| `ENV_FILE` | No | Path to env file — defaults to `.env` |

Override these at the command line without changing `.env`:

```bash
PORT=9000 APP_URL=https://staging.certxa.com bash scripts/deploy.sh
```

Skip flags:

```bash
SKIP_GIT_PULL=1  bash scripts/deploy.sh   # useful after a manual git pull
SKIP_MIGRATE=1   bash scripts/deploy.sh   # skip migrations (use with care)
SKIP_BUILD=1     bash scripts/deploy.sh   # restart without rebuilding
```

---

## Deploy Logs

Every deploy writes a timestamped log to `logs/deploy-YYYYMMDD-HHMMSS.log`.

```bash
ls -lt logs/          # see all deploy logs, newest first
cat logs/deploy-*.log # read a specific log
```

The log captures everything printed to the terminal, so if a deploy failed at
3am you can always go back and read exactly what happened.

---

## Rollback

If the deploy fails after building, the script automatically restores the
previous `dist/` from `/tmp/certxa-dist-backup` and restarts the old build.

You will see this in the output:

```
❌  Deploy FAILED. Your previous build has been restored.
```

To manually trigger a rollback to any earlier git commit:

```bash
git log --oneline -10         # find the commit you want
git checkout <commit-hash>    # check it out
npm run build                 # rebuild
SKIP_GIT_PULL=1 SKIP_MIGRATE=1 bash scripts/deploy.sh
```

---

## PM2 Management

The app runs under PM2 using `ecosystem.config.cjs`.

```bash
pm2 list                          # see all running processes
pm2 logs certxa --lines 100       # tail live app logs
pm2 logs certxa --err --lines 50  # errors only
pm2 monit                         # real-time CPU/memory dashboard
pm2 restart certxa                # quick restart (no full deploy)
pm2 stop certxa                   # stop the app
pm2 save                          # persist current process list across reboots
pm2 startup                       # generate systemd startup script
```

---

## nginx Management

```bash
nginx -t                          # test config (always do this before reload)
systemctl reload nginx            # graceful reload (no downtime)
systemctl restart nginx           # full restart (brief downtime)
systemctl status nginx            # check nginx status
tail -f /var/log/nginx/certxa_node_error.log    # Node app nginx errors
tail -f /var/log/nginx/certxa_php_error.log     # PHP site nginx errors
```

To manually install or update the nginx configs:

```bash
bash scripts/deploy.sh --nginx-only
```

---

## SSL Certificates

SSL is managed by Certbot / Let's Encrypt.

```bash
certbot certificates                          # list all certs and expiry dates
certbot renew --dry-run                       # test renewal
certbot renew                                 # renew all expiring certs
bash scripts/deploy.sh --nginx-only           # reload nginx after renewal
```

Cert locations used by the nginx configs:

| Config | Cert path |
|---|---|
| `certxa` (Node app) | `/etc/letsencrypt/live/<APP_URL_DOMAIN>/` |
| `certxa-php.conf` (PHP site) | `/etc/letsencrypt/live/certxa.com-0001/` |

If a cert path is wrong, `--nginx-only` will auto-detect and patch it.

---

## Common Problems & Solutions

### App returns 502 Bad Gateway

The app is not running or nginx is pointing at the wrong port.

```bash
pm2 list                              # is certxa running?
bash scripts/deploy.sh --nginx-only   # audit + fix nginx
curl http://127.0.0.1:8100/api/health # test the app directly (bypass nginx)
```

### App crashes with "relation X does not exist"

A database table or column that the app needs doesn't exist yet.

```bash
bash scripts/deploy.sh --db-check
# Script will auto-run migrations and tell you if a new one is needed
```

### App crashes with "column X does not exist"

A migration that adds a new column hasn't been applied yet.

```bash
bash scripts/deploy.sh --db-migrate
pm2 restart certxa
```

### Missing tables after restoring a database backup

The backup may be from before certain migrations ran.

```bash
bash scripts/deploy.sh --db-check
# Applies all pending migrations against the restored DB
```

### App won't start — port 8100 in use

```bash
lsof -i:8100           # see what's using the port
kill -9 <PID>          # kill it
pm2 restart certxa     # restart the app
```

Or just run a full deploy — it kills stale port holders automatically.

### Out of memory (OOM)

```bash
free -h                # check current memory
pm2 monit              # watch memory usage live
# Add swap if you have none:
fallocate -l 2G /swapfile
chmod 600 /swapfile
mkswap /swapfile
swapon /swapfile
echo '/swapfile none swap sw 0 0' >> /etc/fstab
```

### Migrations failing with "permission denied"

```bash
psql "$DATABASE_URL" -c "SELECT current_user, current_database();"
# Grant CREATE if missing:
psql postgres -c "GRANT ALL ON DATABASE <dbname> TO <user>;"
psql postgres -c "ALTER USER <user> CREATEDB;"
```

---

## Setting Up a Fresh VPS

1. Clone the repo and `cd` into it
2. Copy `.env.example` to `.env` and fill in all required values
3. Install Node.js 20+, npm, PM2, PostgreSQL, nginx, certbot
4. Create the database and user referenced in `DATABASE_URL`
5. Run the full deploy:

```bash
bash scripts/deploy.sh
```

The script will:
- Install npm dependencies
- Apply all migrations (creating the full schema from scratch)
- Build the production bundle
- Start the app with PM2
- Install both nginx configs (`certxa` + `certxa-php.conf`)
- Test and reload nginx

If nginx configs are missing, the `--nginx-only` flag installs them:

```bash
bash scripts/deploy.sh --nginx-only
```

Then issue SSL certs:

```bash
certbot --nginx -d certxa.com -d www.certxa.com
certbot --nginx -d manage.certxa.com
```

---

## Migration Files

All SQL migrations live in `migrations/` and are named with a numeric prefix
so they run in order:

```
migrations/
  0000_colossal_old_lace.sql
  0001_add_trial_fields.sql
  0002_add_mail_settings.sql
  0003_add_sms_tokens.sql
  ...
  0013_seed_launchsite_templates.sql
```

To add a new migration:

```bash
touch migrations/$(date +%Y%m%d_%H%M%S)_describe_the_change.sql
# Write your SQL (CREATE TABLE, ALTER TABLE ADD COLUMN, etc.)
bash scripts/deploy.sh --db-migrate   # apply it immediately
```

Migration rules:
- Each file runs exactly once (tracked in `schema_migrations`)
- Files run in alphabetical order — use a numeric prefix to control order
- Each migration runs inside a transaction — if it fails, it rolls back cleanly
- Never edit an already-applied migration file; write a new one instead

---

## File Reference

| File | Purpose |
|---|---|
| `scripts/deploy.sh` | Main deploy and self-heal script |
| `scripts/migrate.ts` | Standalone migration runner |
| `ecosystem.config.cjs` | PM2 process configuration |
| `nginx/certxa.conf` | nginx config for Node.js app (uses placeholders) |
| `nginx/certxa-php.conf` | nginx config for PHP marketing site |
| `migrations/*.sql` | SQL migration files, one per schema change |
| `.env` | Environment variables (not committed to git) |
| `.env.example` | Template for `.env` |
| `logs/deploy-*.log` | Timestamped deploy logs |
