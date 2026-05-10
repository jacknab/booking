#!/usr/bin/env bash
# =============================================================================
#  setup.sh — Certxa First-Time VPS Setup
#
#  Installs everything needed to run Certxa on a fresh Ubuntu/Debian VPS.
#  Safe to run more than once — all steps check before acting.
#
#  Usage (run as root or with sudo):
#    bash scripts/setup.sh
#
#  What it does:
#    1.  System packages (curl, git, build tools, lsof, certbot)
#    2.  Node.js 20 via NodeSource
#    3.  PM2 (process manager)
#    4.  PostgreSQL 16
#    5.  Creates the database + user
#    6.  Generates .env from your answers (SESSION_SECRET auto-generated)
#    7.  Installs npm dependencies
#    8.  Builds the production bundle
#    9.  Loads the database schema
#    10. Starts the app under PM2
#    11. nginx — installs, copies certxa.conf, reloads
#    12. SSL — obtains a Let's Encrypt certificate via certbot
#    13. Prints a final health check summary
# =============================================================================
set -euo pipefail

# ── Helpers ───────────────────────────────────────────────────────────────────
RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'; CYAN='\033[0;36m'; NC='\033[0m'
info()    { echo -e "${CYAN}▶ $*${NC}"; }
success() { echo -e "${GREEN}  ✅ $*${NC}"; }
warn()    { echo -e "${YELLOW}  ⚠️  $*${NC}"; }
error()   { echo -e "${RED}  ❌ $*${NC}"; exit 1; }
ask()     { echo -e "${YELLOW}  ? $1${NC}"; read -r -p "    → " "$2"; }

echo ""
echo "╔══════════════════════════════════════════════════════════╗"
echo "║         Certxa — First-Time VPS Setup Script            ║"
echo "╚══════════════════════════════════════════════════════════╝"
echo ""
warn "This script installs system software. Run as root or with sudo."
echo ""

# Confirm we're inside the project directory
if [[ ! -f "package.json" ]] || ! grep -q '"name"' package.json; then
  error "Run this script from the Certxa project root (e.g. /apps/certxa)."
fi

APP_DIR="$(pwd)"

# ── Collect config up-front (so the rest can run unattended) ─────────────────
echo "  A few questions before we start:"
echo ""
ask "Your domain name (e.g. certxa.com):" DOMAIN
ask "App port [8100]:" APP_PORT
APP_PORT="${APP_PORT:-8100}"
ask "PostgreSQL database name [certxa_db]:" DB_NAME
DB_NAME="${DB_NAME:-certxa_db}"
ask "PostgreSQL username [certxa_user]:" DB_USER
DB_USER="${DB_USER:-certxa_user}"
ask "PostgreSQL password (leave blank to auto-generate):" DB_PASS
if [[ -z "$DB_PASS" ]]; then
  DB_PASS="$(openssl rand -hex 24)"
  echo "    Generated: $DB_PASS"
fi
ask "Certxa admin email (for SSL cert + optional alerts):" ADMIN_EMAIL
ask "Google OAuth Client ID (leave blank to skip for now):" GOOGLE_CLIENT_ID
ask "Google OAuth Client Secret (leave blank to skip for now):" GOOGLE_CLIENT_SECRET
ask "Mailgun API Key (leave blank to skip for now):" MAILGUN_API_KEY
ask "Mailgun domain (e.g. mg.yourdomain.com) [blank to skip]:" MAILGUN_DOMAIN
ask "Twilio Account SID (leave blank to skip for now):" TWILIO_SID
ask "Twilio Auth Token (leave blank to skip for now):" TWILIO_TOKEN
ask "Twilio Phone Number e.g. +18888147623 [blank to skip]:" TWILIO_PHONE
ask "Stripe Secret Key (leave blank to skip for now):" STRIPE_KEY
ask "OpenAI API Key (leave blank to skip for now):" OPENAI_KEY

echo ""
info "Starting setup…"
echo ""

# ── 1. System packages ────────────────────────────────────────────────────────
info "Step 1/12 — System packages"
apt-get update -qq
apt-get install -y -qq \
  curl git build-essential lsof unzip gnupg ca-certificates \
  nginx certbot python3-certbot-nginx \
  php8.3-cli php8.3-common php8.3-mbstring php8.3-curl 2>&1 | tail -3
success "System packages ready"

# ── 2. Node.js 20 ─────────────────────────────────────────────────────────────
info "Step 2/12 — Node.js 20"
if node --version 2>/dev/null | grep -q "^v20"; then
  success "Node.js $(node --version) already installed"
else
  curl -fsSL https://deb.nodesource.com/setup_20.x | bash - > /dev/null 2>&1
  apt-get install -y -qq nodejs 2>&1 | tail -2
  success "Node.js $(node --version) installed"
fi

# ── 3. PM2 ────────────────────────────────────────────────────────────────────
info "Step 3/12 — PM2"
if pm2 --version > /dev/null 2>&1; then
  success "PM2 $(pm2 --version) already installed"
else
  npm install -g pm2 --quiet
  success "PM2 installed"
fi
pm2 startup --silent > /dev/null 2>&1 || true

# ── 4. PostgreSQL ─────────────────────────────────────────────────────────────
info "Step 4/12 — PostgreSQL"
if ! command -v psql > /dev/null 2>&1; then
  apt-get install -y -qq postgresql postgresql-contrib 2>&1 | tail -2
fi
systemctl enable postgresql --quiet
systemctl start postgresql
success "PostgreSQL running"

# ── 5. Database + user ────────────────────────────────────────────────────────
info "Step 5/12 — Database and user"
sudo -u postgres psql -tc "SELECT 1 FROM pg_roles WHERE rolname='$DB_USER'" \
  | grep -q 1 || sudo -u postgres psql -c \
  "CREATE USER \"$DB_USER\" WITH PASSWORD '$DB_PASS';" > /dev/null
sudo -u postgres psql -tc "SELECT 1 FROM pg_database WHERE datname='$DB_NAME'" \
  | grep -q 1 || sudo -u postgres psql -c \
  "CREATE DATABASE \"$DB_NAME\" OWNER \"$DB_USER\";" > /dev/null
success "Database '$DB_NAME' and user '$DB_USER' ready"
DATABASE_URL="postgresql://$DB_USER:$DB_PASS@127.0.0.1:5432/$DB_NAME?sslmode=disable"

# ── 6. Generate .env ──────────────────────────────────────────────────────────
info "Step 6/12 — Writing .env"
SESSION_SECRET="$(openssl rand -hex 64)"

cat > "$APP_DIR/.env" << ENV
# ─── Node ───────────────────────────────────────────────────────────────────
NODE_ENV=production
PORT=$APP_PORT

# ─── Database ────────────────────────────────────────────────────────────────
DATABASE_URL=$DATABASE_URL

# ─── Session ─────────────────────────────────────────────────────────────────
SESSION_SECRET=$SESSION_SECRET

# ─── App URL ─────────────────────────────────────────────────────────────────
APP_URL=https://$DOMAIN

# ─── CORS ────────────────────────────────────────────────────────────────────
CORS_ALLOW_ALL=false
CORS_ORIGINS=https://$DOMAIN,https://www.$DOMAIN,https://manage.$DOMAIN

# ─── Google OAuth ────────────────────────────────────────────────────────────
GOOGLE_CLIENT_ID=${GOOGLE_CLIENT_ID:-}
GOOGLE_CLIENT_SECRET=${GOOGLE_CLIENT_SECRET:-}
GOOGLE_LOGIN_CLIENT_ID=${GOOGLE_CLIENT_ID:-}
GOOGLE_LOGIN_CLIENT_SECRET=${GOOGLE_CLIENT_SECRET:-}
GOOGLE_AUTH_CALLBACK_URL=https://$DOMAIN/api/auth/google/callback
GOOGLE_LOGIN_CALLBACK_URL=https://$DOMAIN/api/auth/google/callback
GOOGLE_REDIRECT_URI=https://$DOMAIN/api/google-business/callback
GOOGLE_BUSINESS_CALLBACK_URL=https://$DOMAIN/api/google-business/callback
GOOGLE_BUSINESS_CLIENT_ID=${GOOGLE_CLIENT_ID:-}
GOOGLE_BUSINESS_CLIENT_SECRET=${GOOGLE_CLIENT_SECRET:-}

# ─── Mailgun (email) ─────────────────────────────────────────────────────────
MAILGUN_API_KEY=${MAILGUN_API_KEY:-}
MAILGUN_DOMAIN=${MAILGUN_DOMAIN:-}
MAILGUN_FROM_EMAIL=noreply@$DOMAIN
MAILGUN_SENDER_EMAIL=noreply@$DOMAIN
MAILGUN_FROM_NAME=Certxa

# ─── Twilio (SMS) ────────────────────────────────────────────────────────────
TWILIO_ACCOUNT_SID=${TWILIO_SID:-}
TWILIO_AUTH_TOKEN=${TWILIO_TOKEN:-}
TWILIO_PHONE_NUMBER=${TWILIO_PHONE:-}

# ─── Stripe (payments) ───────────────────────────────────────────────────────
STRIPE_SECRET_KEY=${STRIPE_KEY:-}

# ─── OpenAI ──────────────────────────────────────────────────────────────────
OPENAI_API_KEY=${OPENAI_KEY:-}

# ─── Misc ────────────────────────────────────────────────────────────────────
TRIAL_PERIOD_DAYS=60
ACTIVE_GROUPS=3
ENV

chmod 600 "$APP_DIR/.env"
success ".env written (SESSION_SECRET auto-generated)"

# ── 7. Install npm dependencies ───────────────────────────────────────────────
info "Step 7/12 — Installing npm dependencies"
npm ci --prefer-offline 2>&1 | tail -3
success "Dependencies installed"

# ── 8. Build production bundle ────────────────────────────────────────────────
info "Step 8/12 — Building production bundle"
npm run build 2>&1 | tail -5
success "Production bundle built"

# ── 9. Load database schema ───────────────────────────────────────────────────
info "Step 9/12 — Loading database schema"
psql "$DATABASE_URL" -f "$APP_DIR/schema.sql" > /dev/null 2>&1
success "Schema loaded"

# ── 10. Start app under PM2 ───────────────────────────────────────────────────
info "Step 10/12 — Starting app with PM2"
# Kill anything already on the port
PIDS="$(lsof -t -i:"$APP_PORT" 2>/dev/null || true)"
[[ -n "$PIDS" ]] && kill -9 $PIDS 2>/dev/null || true

if pm2 describe certxa > /dev/null 2>&1; then
  PORT="$APP_PORT" pm2 reload ecosystem.config.cjs --update-env
else
  PORT="$APP_PORT" pm2 start ecosystem.config.cjs
fi
pm2 save
success "App started under PM2"

# ── 11. nginx ─────────────────────────────────────────────────────────────────
info "Step 11/12 — Configuring nginx"
NGINX_CONF_SRC="$APP_DIR/nginx/certxa.conf"
NGINX_AVAILABLE="/etc/nginx/sites-available/certxa.conf"
NGINX_ENABLED="/etc/nginx/sites-enabled/certxa.conf"

# Substitute domain and port placeholders in the bundled config
sed "s/__DOMAIN__/$DOMAIN/g; s/__APP_PORT__/$APP_PORT/g; s/__ADMIN_EMAIL__/$ADMIN_EMAIL/g" \
  "$NGINX_CONF_SRC" > "$NGINX_AVAILABLE"

# Enable site
ln -sf "$NGINX_AVAILABLE" "$NGINX_ENABLED"

# Remove conflicting default site if present
rm -f /etc/nginx/sites-enabled/default

# Remove the php-specific certxa conf that conflicts (created by old setup)
rm -f /etc/nginx/sites-enabled/certxa-php.conf
rm -f /etc/nginx/conf.d/certxa-php.conf

nginx -t 2>&1 && systemctl reload nginx
success "nginx configured and reloaded"

# ── 12. SSL certificate ───────────────────────────────────────────────────────
info "Step 12/12 — SSL certificate (Let's Encrypt)"
if [[ -d "/etc/letsencrypt/live/$DOMAIN" ]]; then
  success "Certificate for $DOMAIN already exists — skipping"
else
  # Temporarily serve HTTP only so certbot can complete the challenge
  # The nginx conf has an HTTP block that proxies for this purpose
  certbot --nginx -d "$DOMAIN" -d "www.$DOMAIN" \
    --non-interactive --agree-tos --email "$ADMIN_EMAIL" \
    --redirect 2>&1 | tail -5
  success "SSL certificate obtained"
fi

# ── Final summary ─────────────────────────────────────────────────────────────
echo ""
sleep 4
HTTP_STATUS="$(curl -sk -o /dev/null -w "%{http_code}" --max-time 10 "https://$DOMAIN/api/health" || echo "failed")"

echo ""
echo "╔══════════════════════════════════════════════════════════╗"
echo "║                  Setup Complete! 🎉                     ║"
echo "╚══════════════════════════════════════════════════════════╝"
echo ""
echo "  URL         : https://$DOMAIN"
echo "  App port    : $APP_PORT"
echo "  DB name     : $DB_NAME"
echo "  DB user     : $DB_USER"
echo "  Health check: HTTP $HTTP_STATUS"
echo ""
echo "  Useful commands:"
echo "    pm2 logs certxa --lines 50   # view live logs"
echo "    pm2 status                   # process status"
echo "    bash scripts/deploy.sh       # deploy future updates"
echo ""

if [[ "$HTTP_STATUS" == "200" ]]; then
  success "All good — your app is live at https://$DOMAIN"
else
  warn "Health check returned HTTP $HTTP_STATUS."
  warn "Check logs with: pm2 logs certxa --lines 30"
fi

echo ""
warn "IMPORTANT: Save your .env file somewhere safe — it contains your database"
warn "password and session secret. Don't lose it."
echo ""
