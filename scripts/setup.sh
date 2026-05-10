#!/usr/bin/env bash
# =============================================================================
#  setup.sh — Certxa First-Time VPS Setup
#
#  Installs everything needed to run Certxa on a fresh Ubuntu/Debian VPS.
#  Safe to run more than once — all steps check before acting.
#
#  NOTE: nginx and SSL are NOT touched by this script. Configure those
#  separately using nginx/certxa.conf as a reference.
#
#  Usage (run as root or with sudo):
#    bash scripts/setup.sh
#
#  What it does:
#    1.  System packages (curl, git, build tools, lsof, php8.3)
#    2.  Node.js 20 via NodeSource
#    3.  PM2 (process manager)
#    4.  PostgreSQL
#    5.  Creates the database + user
#    6.  Writes .env (SESSION_SECRET auto-generated)
#    7.  Installs npm dependencies
#    8.  Builds the production bundle
#    9.  Loads the database schema
#    10. Starts the app under PM2
#    11. Final health check summary
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
warn "nginx and SSL are NOT touched — configure those separately."
echo ""

# Must be run from the project root
if [[ ! -f "package.json" ]] || ! grep -q '"name"' package.json; then
  error "Run this script from the Certxa project root (e.g. /apps/certxa)."
fi

APP_DIR="$(pwd)"

# ── Collect config up-front so the rest runs unattended ───────────────────────
echo "  A few questions before we start:"
echo ""
ask "Your domain name (e.g. certxa.com):" DOMAIN
ask "App port [8100]:" APP_PORT
APP_PORT="${APP_PORT:-8100}"
ask "PostgreSQL database name [certxa_db]:" DB_NAME
DB_NAME="${DB_NAME:-certxa_db}"
ask "PostgreSQL username [certxa_user]:" DB_USER
DB_USER="${DB_USER:-certxa_user}"
ask "PostgreSQL password (blank = auto-generate):" DB_PASS
if [[ -z "$DB_PASS" ]]; then
  DB_PASS="$(openssl rand -hex 24)"
  warn "Generated DB password: $DB_PASS  ← save this!"
fi
ask "Google OAuth Client ID (blank to skip for now):" GOOGLE_CLIENT_ID
ask "Google OAuth Client Secret (blank to skip for now):" GOOGLE_CLIENT_SECRET
ask "Mailgun API Key (blank to skip for now):" MAILGUN_API_KEY
ask "Mailgun domain e.g. mg.yourdomain.com (blank to skip):" MAILGUN_DOMAIN
ask "Twilio Account SID (blank to skip for now):" TWILIO_SID
ask "Twilio Auth Token (blank to skip for now):" TWILIO_TOKEN
ask "Twilio Phone Number e.g. +18888147623 (blank to skip):" TWILIO_PHONE
ask "Stripe Secret Key (blank to skip for now):" STRIPE_KEY
ask "OpenAI API Key (blank to skip for now):" OPENAI_KEY

echo ""
info "Starting setup…"
echo ""

# ── 1. System packages ────────────────────────────────────────────────────────
info "Step 1/10 — System packages"
apt-get update -qq 2>&1 | grep -v "^W:" || true
apt-get install -y -qq \
  curl git build-essential lsof unzip gnupg ca-certificates 2>&1 | tail -3
success "System packages ready"

# ── 2. Node.js 20 ─────────────────────────────────────────────────────────────
info "Step 2/10 — Node.js 20"
if node --version 2>/dev/null | grep -q "^v20"; then
  success "Node.js $(node --version) already installed"
else
  curl -fsSL https://deb.nodesource.com/setup_20.x | bash - > /dev/null 2>&1
  apt-get install -y -qq nodejs 2>&1 | tail -2
  success "Node.js $(node --version) installed"
fi

# ── 3. PM2 ────────────────────────────────────────────────────────────────────
info "Step 3/10 — PM2"
if pm2 --version > /dev/null 2>&1; then
  success "PM2 $(pm2 --version) already installed"
else
  npm install -g pm2 --quiet
  success "PM2 installed"
fi
pm2 startup --silent > /dev/null 2>&1 || true

# ── 4. PostgreSQL ─────────────────────────────────────────────────────────────
info "Step 4/10 — PostgreSQL"
if ! command -v psql > /dev/null 2>&1; then
  apt-get install -y -qq postgresql postgresql-contrib 2>&1 | tail -2
fi
systemctl enable postgresql --quiet
systemctl start postgresql
success "PostgreSQL running"

# ── 5. Database + user ────────────────────────────────────────────────────────
info "Step 5/10 — Database and user"
sudo -u postgres psql -tc "SELECT 1 FROM pg_roles WHERE rolname='$DB_USER'" \
  | grep -q 1 || sudo -u postgres psql -c \
  "CREATE USER \"$DB_USER\" WITH PASSWORD '$DB_PASS';" > /dev/null
sudo -u postgres psql -tc "SELECT 1 FROM pg_database WHERE datname='$DB_NAME'" \
  | grep -q 1 || sudo -u postgres psql -c \
  "CREATE DATABASE \"$DB_NAME\" OWNER \"$DB_USER\";" > /dev/null
success "Database '$DB_NAME' and user '$DB_USER' ready"
DATABASE_URL="postgresql://$DB_USER:$DB_PASS@127.0.0.1:5432/$DB_NAME?sslmode=disable"

# ── 6. Write .env ─────────────────────────────────────────────────────────────
info "Step 6/10 — Writing .env"

if [[ -f "$APP_DIR/.env" ]]; then
  cp "$APP_DIR/.env" "$APP_DIR/.env.bak.$(date +%Y%m%d%H%M%S)"
  warn "Existing .env backed up"
fi

SESSION_SECRET="$(openssl rand -hex 64)"

cat > "$APP_DIR/.env" << ENV
# ─── Node ────────────────────────────────────────────────────────────────────
NODE_ENV=production
PORT=$APP_PORT

# ─── Database ─────────────────────────────────────────────────────────────────
DATABASE_URL=$DATABASE_URL

# ─── Session ──────────────────────────────────────────────────────────────────
SESSION_SECRET=$SESSION_SECRET

# ─── App URL ──────────────────────────────────────────────────────────────────
APP_URL=https://$DOMAIN

# ─── CORS ─────────────────────────────────────────────────────────────────────
CORS_ALLOW_ALL=false
CORS_ORIGINS=https://$DOMAIN,https://www.$DOMAIN,https://manage.$DOMAIN

# ─── Google OAuth ─────────────────────────────────────────────────────────────
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

# ─── Mailgun (email) ──────────────────────────────────────────────────────────
MAILGUN_API_KEY=${MAILGUN_API_KEY:-}
MAILGUN_DOMAIN=${MAILGUN_DOMAIN:-}
MAILGUN_FROM_EMAIL=noreply@$DOMAIN
MAILGUN_SENDER_EMAIL=noreply@$DOMAIN
MAILGUN_FROM_NAME=Certxa

# ─── Twilio (SMS) ─────────────────────────────────────────────────────────────
TWILIO_ACCOUNT_SID=${TWILIO_SID:-}
TWILIO_AUTH_TOKEN=${TWILIO_TOKEN:-}
TWILIO_PHONE_NUMBER=${TWILIO_PHONE:-}

# ─── Stripe (payments) ────────────────────────────────────────────────────────
STRIPE_SECRET_KEY=${STRIPE_KEY:-}

# ─── OpenAI ───────────────────────────────────────────────────────────────────
OPENAI_API_KEY=${OPENAI_KEY:-}

# ─── Misc ─────────────────────────────────────────────────────────────────────
TRIAL_PERIOD_DAYS=60
ACTIVE_GROUPS=3
ENV

chmod 600 "$APP_DIR/.env"
success ".env written (SESSION_SECRET auto-generated)"

# ── 7. npm dependencies ───────────────────────────────────────────────────────
info "Step 7/10 — Installing npm dependencies"
npm ci --prefer-offline 2>&1 | tail -3
success "Dependencies installed"

# ── 8. Production build ───────────────────────────────────────────────────────
info "Step 8/10 — Building production bundle"
npm run build 2>&1 | tail -5
success "Production bundle built"

# ── 9. Database schema ────────────────────────────────────────────────────────
info "Step 9/10 — Loading database schema"
psql "$DATABASE_URL" -f "$APP_DIR/schema.sql" > /dev/null 2>&1
success "Schema loaded"

# ── 10. Start under PM2 ───────────────────────────────────────────────────────
info "Step 10/10 — Starting app with PM2"
PIDS="$(lsof -t -i:"$APP_PORT" 2>/dev/null || true)"
[[ -n "$PIDS" ]] && kill -9 $PIDS 2>/dev/null || true

if pm2 describe certxa > /dev/null 2>&1; then
  pm2 reload ecosystem.config.cjs --update-env
else
  pm2 start ecosystem.config.cjs
fi
pm2 save
success "App started under PM2"

# ── Summary ───────────────────────────────────────────────────────────────────
echo ""
info "Waiting 4 seconds for the app to boot..."
sleep 4

HTTP_STATUS="$(curl -sk -o /dev/null -w "%{http_code}" --max-time 10 \
  "https://$DOMAIN/api/health" || echo "failed")"

echo ""
echo "╔══════════════════════════════════════════════════════════╗"
echo "║                  Setup Complete!                        ║"
echo "╚══════════════════════════════════════════════════════════╝"
echo ""
echo "  URL         : https://$DOMAIN"
echo "  App port    : $APP_PORT"
echo "  DB          : $DB_NAME  (user: $DB_USER)"
echo "  Health      : https://$DOMAIN/api/health → HTTP $HTTP_STATUS"
echo ""
echo "  Next steps:"
echo "    • If nginx isn't yet pointed at port $APP_PORT, use nginx/certxa.conf"
echo "      as a reference — it has all the right proxy/WebSocket settings."
echo "    • To deploy future updates: bash scripts/deploy.sh"
echo "    • To view live logs:        pm2 logs certxa --lines 50"
echo ""

if [[ "$HTTP_STATUS" == "200" ]]; then
  success "App is healthy and serving traffic."
elif [[ "$HTTP_STATUS" == "503" ]]; then
  warn "App started but health check returned 503 — check env vars or DB."
  warn "Run: pm2 logs certxa --lines 30"
else
  warn "Health check returned HTTP $HTTP_STATUS — nginx may not be"
  warn "pointed at port $APP_PORT yet, or the app is still booting."
  warn "Run: pm2 logs certxa --lines 30"
fi

echo ""
warn "Save your .env somewhere safe — it has your DB password and session secret."
echo ""
