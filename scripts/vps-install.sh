#!/usr/bin/env bash
# =============================================================================
#  vps-install.sh — Certxa Complete VPS Setup / Repair Script
#
#  Runs on a fresh OR existing Ubuntu 22.04 / 24.04 VPS.
#  Safe to re-run — every step checks before acting.
#
#  MODES:
#
#  Normal (first-time or re-run):
#    bash scripts/vps-install.sh
#    Asks a few questions, then does everything fully unattended.
#
#  Repair (existing server — no questions asked):
#    bash scripts/vps-install.sh --repair
#    Reads all values from the existing .env, skips package install questions,
#    rebuilds, fixes nginx/SSL if needed, and restarts PM2.
#    Use this when the app goes down and you need a one-command recovery.
#
#  Server status report (no install, no changes — read-only):
#    bash scripts/vps-install.sh --status
#    Checks PM2, nginx, PostgreSQL, SSL cert expiry, and HTTP/HTTPS health.
#    Finishes in seconds. Safe to run at any time.
#
#  Flags (work in all modes):
#    SKIP_SSL=1   — skip Let's Encrypt (use when SSL is handled by Cloudflare etc.)
#    SKIP_GIT=1   — skip git pull (use when code is already up to date on disk)
# =============================================================================
set -euo pipefail

# ── Colour helpers ─────────────────────────────────────────────────────────────
RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'
CYAN='\033[0;36m'; BOLD='\033[1m'; DIM='\033[2m'; NC='\033[0m'

ok()     { echo -e "${GREEN}  ✅  $*${NC}"; }
info()   { echo -e "${CYAN}  ▶  $*${NC}"; }
warn()   { echo -e "${YELLOW}  ⚠️   $*${NC}"; }
fail()   { echo -e "${RED}  ❌  $*${NC}"; }
step()   { echo ""; echo -e "${BOLD}${CYAN}━━  $*${NC}"; echo ""; }
banner() { echo -e "${BOLD}$*${NC}"; }
ask()    {
  echo -e "${YELLOW}  ? $1${NC}"
  read -r -p "    → " "$2"
}
ask_default() {
  local prompt="$1" varname="$2" default="$3"
  echo -e "${YELLOW}  ? $prompt ${DIM}[${default}]${NC}"
  read -r -p "    → " _tmp
  printf -v "$varname" '%s' "${_tmp:-$default}"
}
ask_secret() {
  echo -e "${YELLOW}  ? $1 ${DIM}(blank = skip for now)${NC}"
  read -r -s -p "    → " "$2"
  echo ""
}

# ── Must run from the project root ────────────────────────────────────────────
cd "$(dirname "$0")/.."
APP_DIR="$(pwd)"

if [[ ! -f "$APP_DIR/package.json" ]] || ! grep -q '"name"' "$APP_DIR/package.json"; then
  fail "Run this script from the Certxa project root."
  exit 1
fi

APP_PORT="8100"

# ── Detect flags ──────────────────────────────────────────────────────────────
REPAIR_MODE=0
STATUS_MODE=0
for arg in "$@"; do
  [[ "$arg" == "--repair" ]] && REPAIR_MODE=1
  [[ "$arg" == "--status" ]] && STATUS_MODE=1
done

# ── --status: quick health report then exit ───────────────────────────────────
if [[ "$STATUS_MODE" == "1" ]]; then
  echo ""
  banner "╔══════════════════════════════════════════════════════════════╗"
  banner "║                Certxa — Server Status Report                ║"
  banner "╚══════════════════════════════════════════════════════════════╝"
  echo ""

  # ── PM2 ──────────────────────────────────────────────────────────────────
  echo -e "${BOLD}${CYAN}━━  PM2 Process${NC}"
  if command -v pm2 &>/dev/null; then
    PM2_STATUS="$(pm2 describe certxa 2>/dev/null | grep -E 'status' | awk '{print $4}' | head -1)"
    PM2_UPTIME="$(pm2 describe certxa 2>/dev/null | grep -E 'uptime' | awk '{print $4}' | head -1)"
    PM2_MEM="$(pm2 describe certxa 2>/dev/null | grep -E 'heap size' | awk '{print $NF}' | head -1)"
    if [[ "$PM2_STATUS" == "online" ]]; then
      ok "certxa is ${PM2_STATUS}  |  uptime: ${PM2_UPTIME:-unknown}  |  heap: ${PM2_MEM:-unknown}"
    elif [[ -n "$PM2_STATUS" ]]; then
      fail "certxa status: ${PM2_STATUS}"
      warn "To restart: pm2 restart certxa"
    else
      fail "certxa process not found in PM2"
      warn "To start: pm2 start ecosystem.config.cjs"
    fi
  else
    fail "PM2 not installed"
  fi
  echo ""

  # ── nginx ─────────────────────────────────────────────────────────────────
  echo -e "${BOLD}${CYAN}━━  nginx${NC}"
  if command -v nginx &>/dev/null; then
    NGINX_SVC="$(systemctl is-active nginx 2>/dev/null || echo 'unknown')"
    if [[ "$NGINX_SVC" == "active" ]]; then
      ok "nginx is running"
    else
      fail "nginx status: ${NGINX_SVC}"
      warn "To fix: sudo nginx -t && sudo systemctl restart nginx"
    fi
    if nginx -t 2>&1 | grep -q "ok"; then
      ok "nginx config test passed"
    else
      fail "nginx config has errors:"
      nginx -t 2>&1 | tail -5 | sed 's/^/    /'
    fi
  else
    fail "nginx not installed"
  fi
  echo ""

  # ── PostgreSQL ────────────────────────────────────────────────────────────
  echo -e "${BOLD}${CYAN}━━  PostgreSQL${NC}"
  PG_SVC="$(systemctl is-active postgresql 2>/dev/null || echo 'unknown')"
  if [[ "$PG_SVC" == "active" ]]; then
    ok "PostgreSQL is running"
    # Try to test DB connection using DATABASE_URL from .env
    ENV_FILE="$APP_DIR/.env"
    if [[ -f "$ENV_FILE" ]]; then
      DB_URL="$(grep -E '^DATABASE_URL=' "$ENV_FILE" | head -1 | sed -E 's/^DATABASE_URL=//')"
      if [[ -n "$DB_URL" ]]; then
        if psql "$DB_URL" -c "SELECT 1" >/dev/null 2>&1; then
          ok "Database connection verified"
        else
          fail "Could not connect to database with DATABASE_URL from .env"
          warn "Check credentials or run: sudo systemctl status postgresql"
        fi
      else
        warn "DATABASE_URL not found in .env — skipping connection test"
      fi
    else
      warn ".env not found at $ENV_FILE — skipping connection test"
    fi
  else
    fail "PostgreSQL status: ${PG_SVC}"
    warn "To fix: sudo systemctl start postgresql"
  fi
  echo ""

  # ── SSL Certificate ───────────────────────────────────────────────────────
  echo -e "${BOLD}${CYAN}━━  SSL Certificate${NC}"
  # Try to read domain from .env
  ENV_FILE="$APP_DIR/.env"
  STATUS_DOMAIN=""
  if [[ -f "$ENV_FILE" ]]; then
    STATUS_DOMAIN="$(grep -E '^APP_URL=' "$ENV_FILE" | head -1 | sed -E 's|^APP_URL=https?://(www\.)?||;s|/.*||')"
  fi
  if [[ -n "$STATUS_DOMAIN" ]]; then
    CERT_FOUND=""
    for CERT_PATH in \
      "/etc/letsencrypt/live/${STATUS_DOMAIN}/fullchain.pem" \
      "/etc/letsencrypt/live/www.${STATUS_DOMAIN}/fullchain.pem" \
      "/etc/letsencrypt/live/${STATUS_DOMAIN}-0001/fullchain.pem" \
      "/etc/letsencrypt/live/${STATUS_DOMAIN}-0002/fullchain.pem"; do
      [[ -f "$CERT_PATH" ]] && { CERT_FOUND="$CERT_PATH"; break; }
    done
    if [[ -n "$CERT_FOUND" ]]; then
      EXPIRY="$(openssl x509 -noout -enddate -in "$CERT_FOUND" 2>/dev/null | sed 's/notAfter=//')"
      EXPIRY_EPOCH="$(date -d "${EXPIRY}" +%s 2>/dev/null || echo 0)"
      NOW_EPOCH="$(date +%s)"
      DAYS_LEFT="$(( (EXPIRY_EPOCH - NOW_EPOCH) / 86400 ))"
      if [[ "$DAYS_LEFT" -gt 14 ]]; then
        ok "SSL cert valid — expires in ${DAYS_LEFT} days  (${EXPIRY})"
      elif [[ "$DAYS_LEFT" -gt 0 ]]; then
        warn "SSL cert expires in ${DAYS_LEFT} days — renew soon: certbot renew"
      else
        fail "SSL cert has EXPIRED — run: certbot renew"
      fi
    else
      warn "No Let's Encrypt cert found for ${STATUS_DOMAIN}"
    fi
  else
    warn "Could not determine domain — skipping SSL check (no .env found)"
  fi
  echo ""

  # ── HTTP/HTTPS Health ─────────────────────────────────────────────────────
  echo -e "${BOLD}${CYAN}━━  Health Endpoints${NC}"
  INT_STATUS="$(curl -s -o /dev/null -w "%{http_code}" --max-time 5 \
    "http://127.0.0.1:${APP_PORT}/api/health" 2>/dev/null || echo "000")"
  if [[ "$INT_STATUS" == "200" ]]; then
    ok "Internal  http://127.0.0.1:${APP_PORT}/api/health → HTTP ${INT_STATUS}"
  else
    fail "Internal  http://127.0.0.1:${APP_PORT}/api/health → HTTP ${INT_STATUS}"
  fi

  if [[ -n "$STATUS_DOMAIN" ]]; then
    EXT_STATUS="$(curl -sk -o /dev/null -w "%{http_code}" --max-time 8 \
      "https://${STATUS_DOMAIN}/api/health" 2>/dev/null || echo "000")"
    if [[ "$EXT_STATUS" == "200" ]]; then
      ok "External  https://${STATUS_DOMAIN}/api/health → HTTP ${EXT_STATUS}"
    else
      fail "External  https://${STATUS_DOMAIN}/api/health → HTTP ${EXT_STATUS}"
    fi
  fi
  echo ""

  # ── Quick fix hints ───────────────────────────────────────────────────────
  echo -e "  ${DIM}One-command recovery if something is broken:${NC}"
  echo -e "  ${DIM}  bash scripts/vps-install.sh --repair${NC}"
  echo -e "  ${DIM}  bash scripts/deploy.sh${NC}"
  echo ""
  exit 0
fi

if [[ "$REPAIR_MODE" == "1" ]]; then
  echo ""
  banner "╔══════════════════════════════════════════════════════════════╗"
  banner "║               Certxa — Repair / Recovery Mode               ║"
  banner "╚══════════════════════════════════════════════════════════════╝"
  echo ""
  warn "Running in REPAIR mode — all values will be read from the existing .env."
  echo ""

  ENV_FILE="$APP_DIR/.env"
  if [[ ! -f "$ENV_FILE" ]]; then
    fail "No .env file found at $ENV_FILE — cannot repair without it."
    fail "Run without --repair to do a fresh install instead."
    exit 1
  fi

  # Helper: extract a value from .env (handles quoted and unquoted values)
  env_val() {
    local key="$1"
    grep -E "^${key}=" "$ENV_FILE" | head -1 | sed -E "s/^${key}=//;s/^['\"]//;s/['\"]$//"
  }

  DOMAIN="$(env_val APP_URL | sed -E 's|https?://(www\.)?||;s|/.*||')"
  [[ -z "$DOMAIN" ]] && DOMAIN="$(env_val DOMAIN)"
  if [[ -z "$DOMAIN" ]]; then
    fail "Could not determine DOMAIN from .env (APP_URL or DOMAIN key missing)."
    ask "Enter your domain manually (e.g. certxa.com):" DOMAIN
    [[ -z "$DOMAIN" ]] && { fail "Domain is required."; exit 1; }
  fi

  DATABASE_URL="$(env_val DATABASE_URL)"
  if [[ -z "$DATABASE_URL" ]]; then
    fail "DATABASE_URL not found in .env — cannot repair database connection."
    exit 1
  fi

  # Extract DB components from DATABASE_URL
  # Format: postgresql://user:pass@host:port/dbname?...
  DB_USER="$(echo "$DATABASE_URL" | sed -E 's|postgresql://([^:]+):.*|\1|')"
  DB_PASS="$(echo "$DATABASE_URL" | sed -E 's|postgresql://[^:]+:([^@]+)@.*|\1|')"
  DB_NAME="$(echo "$DATABASE_URL" | sed -E 's|.*/([^?]+)(\?.*)?$|\1|')"

  # Load remaining API keys from .env so they survive the repair
  GOOGLE_CLIENT_ID="$(env_val GOOGLE_CLIENT_ID)"
  GOOGLE_CLIENT_SECRET="$(env_val GOOGLE_CLIENT_SECRET)"
  MAILGUN_API_KEY="$(env_val MAILGUN_API_KEY)"
  MAILGUN_DOMAIN="$(env_val MAILGUN_DOMAIN)"
  TWILIO_SID="$(env_val TWILIO_ACCOUNT_SID)"
  TWILIO_TOKEN="$(env_val TWILIO_AUTH_TOKEN)"
  TWILIO_PHONE="$(env_val TWILIO_PHONE_NUMBER)"
  STRIPE_KEY="$(env_val STRIPE_SECRET_KEY)"
  OPENAI_KEY="$(env_val OPENAI_API_KEY)"

  ok "Read configuration from .env"
  info "  Domain      : $DOMAIN"
  info "  DB name     : $DB_NAME"
  info "  DB user     : $DB_USER"
  info "  App port    : $APP_PORT"
  echo ""
  info "Starting repair — this usually takes 3-8 minutes."
  echo ""

else
  echo ""
  banner "╔══════════════════════════════════════════════════════════════╗"
  banner "║          Certxa — Complete VPS Setup Script                 ║"
  banner "╚══════════════════════════════════════════════════════════════╝"
  echo ""
  warn "This installs system packages and configures nginx. Run as root or with sudo."
  echo ""

  # ── Collect everything up-front so the rest runs unattended ────────────────
  echo "  Please answer a few questions. Press Enter to accept defaults."
  echo ""

  ask "Your domain (e.g. certxa.com — no https://, no www):" DOMAIN
  [[ -z "$DOMAIN" ]] && { fail "Domain is required."; exit 1; }

  ask_default "PostgreSQL database name:" DB_NAME "certxa_db"
  ask_default "PostgreSQL user name:" DB_USER "certxa_user"

  echo -e "${YELLOW}  ? PostgreSQL password ${DIM}(blank = auto-generate)${NC}"
  read -r -s -p "    → " DB_PASS
  echo ""
  if [[ -z "$DB_PASS" ]]; then
    DB_PASS="$(openssl rand -hex 24)"
    warn "Generated DB password: ${BOLD}$DB_PASS${NC}  ← save this somewhere safe!"
  fi

  echo ""
  echo "  Now enter your API keys. All are optional — skip with Enter and add later."
  echo ""

  ask_secret "Google OAuth Client ID:" GOOGLE_CLIENT_ID
  ask_secret "Google OAuth Client Secret:" GOOGLE_CLIENT_SECRET
  ask_secret "Mailgun API Key:" MAILGUN_API_KEY
  ask_default "Mailgun domain (e.g. mg.${DOMAIN}):" MAILGUN_DOMAIN "mg.${DOMAIN}"
  ask_secret "Twilio Account SID:" TWILIO_SID
  ask_secret "Twilio Auth Token:" TWILIO_TOKEN
  ask_default "Twilio phone number:" TWILIO_PHONE "+18888147623"
  ask_secret "Stripe Secret Key:" STRIPE_KEY
  ask_secret "OpenAI API Key:" OPENAI_KEY

  echo ""
  info "All answers collected — starting fully automated setup."
  info "This will take 5-15 minutes depending on server speed."
  echo ""

  DATABASE_URL="postgresql://${DB_USER}:${DB_PASS}@127.0.0.1:5432/${DB_NAME}?sslmode=disable"
fi

# ══════════════════════════════════════════════════════════════════════════════
# STEP 1 — System packages
# ══════════════════════════════════════════════════════════════════════════════
step "Step 1/10 — System packages"

export DEBIAN_FRONTEND=noninteractive
apt-get update -qq 2>&1 | grep -v "^W:" | tail -3 || true

apt-get install -y -qq \
  curl wget git build-essential lsof unzip gnupg ca-certificates \
  software-properties-common 2>&1 | tail -3
ok "Base packages ready"

# ── Node.js 20 ────────────────────────────────────────────────────────────────
if node --version 2>/dev/null | grep -q "^v20"; then
  ok "Node.js $(node --version) already installed"
else
  info "Installing Node.js 20 via NodeSource..."
  curl -fsSL https://deb.nodesource.com/setup_20.x | bash - >/dev/null 2>&1
  apt-get install -y -qq nodejs 2>&1 | tail -2
  ok "Node.js $(node --version) installed"
fi

# ── PHP 8.3 (required — the marketing site runs via PHP built-in server) ──────
if php --version 2>/dev/null | grep -q "^PHP 8"; then
  ok "PHP $(php --version | head -1 | awk '{print $2}') already installed"
else
  info "Installing PHP 8.3..."
  add-apt-repository ppa:ondrej/php -y >/dev/null 2>&1 || true
  apt-get update -qq 2>&1 | tail -2 || true
  apt-get install -y -qq php8.3 php8.3-cli php8.3-curl php8.3-mbstring \
    php8.3-xml php8.3-zip php8.3-pgsql 2>&1 | tail -3
  ok "PHP $(php --version | head -1 | awk '{print $2}') installed"
fi

# ── nginx ─────────────────────────────────────────────────────────────────────
if ! command -v nginx &>/dev/null; then
  apt-get install -y -qq nginx 2>&1 | tail -2
  systemctl enable nginx >/dev/null 2>&1
  ok "nginx installed"
else
  ok "nginx $(nginx -v 2>&1 | grep -oP '[\d.]+' | head -1) already installed"
fi

# ── certbot (Let's Encrypt SSL) ───────────────────────────────────────────────
if [[ "${SKIP_SSL:-0}" != "1" ]]; then
  if ! command -v certbot &>/dev/null; then
    apt-get install -y -qq certbot python3-certbot-nginx 2>&1 | tail -2
    ok "certbot installed"
  else
    ok "certbot already installed"
  fi
fi

# ── PostgreSQL ────────────────────────────────────────────────────────────────
if ! command -v psql &>/dev/null; then
  apt-get install -y -qq postgresql postgresql-contrib 2>&1 | tail -2
fi
systemctl enable postgresql >/dev/null 2>&1
systemctl start postgresql
ok "PostgreSQL $(psql --version | awk '{print $3}') running"

# ══════════════════════════════════════════════════════════════════════════════
# STEP 2 — PM2
# ══════════════════════════════════════════════════════════════════════════════
step "Step 2/10 — PM2 process manager"

if pm2 --version >/dev/null 2>&1; then
  ok "PM2 $(pm2 --version) already installed"
else
  npm install -g pm2 --quiet --no-progress
  ok "PM2 installed"
fi

# Silently configure PM2 to start on boot (generates the systemd unit)
PM2_STARTUP_CMD="$(pm2 startup --no-daemon 2>&1 | grep 'sudo' | tail -1 || true)"
if [[ -n "$PM2_STARTUP_CMD" ]]; then
  eval "$PM2_STARTUP_CMD" >/dev/null 2>&1 || true
fi
ok "PM2 startup configured"

# ══════════════════════════════════════════════════════════════════════════════
# STEP 3 — PostgreSQL database and user
# ══════════════════════════════════════════════════════════════════════════════
step "Step 3/10 — PostgreSQL database and user"

# Create user if it doesn't exist
if sudo -u postgres psql -tc "SELECT 1 FROM pg_roles WHERE rolname='$DB_USER'" 2>/dev/null | grep -q 1; then
  ok "DB user '$DB_USER' already exists"
else
  sudo -u postgres psql -c "CREATE USER \"$DB_USER\" WITH PASSWORD '$DB_PASS';" >/dev/null
  ok "Created DB user: $DB_USER"
fi

# Create database if it doesn't exist
if sudo -u postgres psql -tc "SELECT 1 FROM pg_database WHERE datname='$DB_NAME'" 2>/dev/null | grep -q 1; then
  ok "Database '$DB_NAME' already exists"
else
  sudo -u postgres psql -c "CREATE DATABASE \"$DB_NAME\" OWNER \"$DB_USER\";" >/dev/null
  ok "Created database: $DB_NAME"
fi

# Grant permissions
sudo -u postgres psql -d "$DB_NAME" -c "
  GRANT ALL PRIVILEGES ON DATABASE \"$DB_NAME\" TO \"$DB_USER\";
  GRANT ALL ON SCHEMA public TO \"$DB_USER\";
  ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO \"$DB_USER\";
  ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO \"$DB_USER\";
" >/dev/null 2>&1
ok "Permissions granted to $DB_USER on $DB_NAME"

# Test connection
if psql "$DATABASE_URL" -c "SELECT 1" >/dev/null 2>&1; then
  ok "Database connection verified"
else
  fail "Cannot connect to database. Check PostgreSQL is running and credentials are correct."
  fail "URL tested: $DATABASE_URL"
  exit 1
fi

# ══════════════════════════════════════════════════════════════════════════════
# STEP 4 — .env file
# ══════════════════════════════════════════════════════════════════════════════
step "Step 4/10 — Environment file (.env)"

if [[ "$REPAIR_MODE" == "1" ]]; then
  ok ".env kept as-is (repair mode — existing credentials preserved)"
else

SESSION_SECRET="$(openssl rand -hex 64)"

if [[ -f "$APP_DIR/.env" ]]; then
  cp "$APP_DIR/.env" "$APP_DIR/.env.bak.$(date +%Y%m%d%H%M%S)"
  warn "Existing .env backed up as .env.bak.*"
fi

cat > "$APP_DIR/.env" << ENVFILE
# ─── Node ─────────────────────────────────────────────────────────────────────
NODE_ENV=production
PORT=${APP_PORT}

# ─── Database ─────────────────────────────────────────────────────────────────
DATABASE_URL=${DATABASE_URL}

# ─── Session ──────────────────────────────────────────────────────────────────
# Generated automatically — do not share this value
SESSION_SECRET=${SESSION_SECRET}

# ─── App URL ──────────────────────────────────────────────────────────────────
APP_URL=https://${DOMAIN}

# ─── CORS ─────────────────────────────────────────────────────────────────────
CORS_ALLOW_ALL=false
CORS_ORIGINS=https://${DOMAIN},https://www.${DOMAIN},https://manage.${DOMAIN}

# ─── Google OAuth (login + Business Profile) ──────────────────────────────────
GOOGLE_CLIENT_ID=${GOOGLE_CLIENT_ID:-}
GOOGLE_CLIENT_SECRET=${GOOGLE_CLIENT_SECRET:-}
GOOGLE_LOGIN_CLIENT_ID=${GOOGLE_CLIENT_ID:-}
GOOGLE_LOGIN_CLIENT_SECRET=${GOOGLE_CLIENT_SECRET:-}
GOOGLE_BUSINESS_CLIENT_ID=${GOOGLE_CLIENT_ID:-}
GOOGLE_BUSINESS_CLIENT_SECRET=${GOOGLE_CLIENT_SECRET:-}
GOOGLE_AUTH_CALLBACK_URL=https://${DOMAIN}/api/auth/google/callback
GOOGLE_LOGIN_CALLBACK_URL=https://${DOMAIN}/api/auth/google/callback
GOOGLE_REDIRECT_URI=https://${DOMAIN}/api/google-business/callback
GOOGLE_BUSINESS_CALLBACK_URL=https://${DOMAIN}/api/google-business/callback

# ─── Mailgun (email) ──────────────────────────────────────────────────────────
MAILGUN_API_KEY=${MAILGUN_API_KEY:-}
MAILGUN_DOMAIN=${MAILGUN_DOMAIN:-}
MAILGUN_FROM_EMAIL=noreply@${DOMAIN}
MAILGUN_SENDER_EMAIL=noreply@${DOMAIN}
MAILGUN_FROM_NAME=Certxa

# ─── Twilio (SMS) ─────────────────────────────────────────────────────────────
TWILIO_ACCOUNT_SID=${TWILIO_SID:-}
TWILIO_AUTH_TOKEN=${TWILIO_TOKEN:-}
TWILIO_PHONE_NUMBER=${TWILIO_PHONE:-}

# ─── Stripe (payments) ────────────────────────────────────────────────────────
STRIPE_SECRET_KEY=${STRIPE_KEY:-}

# ─── OpenAI (AI features) ─────────────────────────────────────────────────────
OPENAI_API_KEY=${OPENAI_KEY:-}

# ─── Feature flags ────────────────────────────────────────────────────────────
TRIAL_PERIOD_DAYS=60
ACTIVE_GROUPS=3
ENVFILE

chmod 600 "$APP_DIR/.env"
ok ".env written (permissions: 600 — root-only)"

fi  # end repair-mode skip block for .env

# ══════════════════════════════════════════════════════════════════════════════
# STEP 5 — npm dependencies
# ══════════════════════════════════════════════════════════════════════════════
step "Step 5/10 — Installing npm dependencies"

# NODE_ENV=production (set in .env above) causes npm to skip devDependencies.
# Override it here so tsx, vite, esbuild and other build tools get installed.
NODE_ENV=development npm install --prefer-offline --loglevel=warn 2>&1 | grep -v "^npm warn" | tail -5
ok "npm dependencies installed"

# ══════════════════════════════════════════════════════════════════════════════
# STEP 6 — git pull (unless skipped)
# ══════════════════════════════════════════════════════════════════════════════
if [[ "${SKIP_GIT:-0}" != "1" ]] && git remote get-url origin &>/dev/null; then
  step "Step 6/10 — Pulling latest code from git"
  git fetch origin --prune --tags 2>&1 | tail -3
  git reset --hard origin/main 2>&1 | tail -2
  ok "Code is at latest commit: $(git rev-parse --short HEAD)"
else
  step "Step 6/10 — Skipping git pull (SKIP_GIT=1 or no remote configured)"
  ok "Using code already on disk"
fi

# ══════════════════════════════════════════════════════════════════════════════
# STEP 7 — Production build
# ══════════════════════════════════════════════════════════════════════════════
step "Step 7/10 — Building production bundle"
info "This step compiles the React frontend, SSR bundle, and Express server."
info "It takes 2-5 minutes — please wait..."
echo ""

rm -rf "$APP_DIR/dist" "$APP_DIR/node_modules/.vite"

if npm run build 2>&1; then
  echo ""
else
  fail "Build failed — see output above."
  fail "Common fix: check you have enough memory (1 GB minimum for the build)."
  exit 1
fi

# Verify all three outputs exist
BUILD_OK=1
for required_file in \
  "$APP_DIR/dist/index.cjs" \
  "$APP_DIR/dist/public/index.html"; do
  if [[ ! -f "$required_file" ]]; then
    fail "Build output missing: $required_file"
    BUILD_OK=0
  fi
done

if [[ "$BUILD_OK" -eq 0 ]]; then
  fail "Build output is incomplete. Run 'npm run build' manually to see full errors."
  exit 1
fi

ASSET_COUNT="$(ls "$APP_DIR/dist/public/assets/"*.js 2>/dev/null | wc -l || echo 0)"
ok "Build complete — $ASSET_COUNT JS asset(s) in dist/public/assets/"

# ══════════════════════════════════════════════════════════════════════════════
# STEP 8 — nginx configuration
# ══════════════════════════════════════════════════════════════════════════════
step "Step 8/10 — nginx configuration"

mkdir -p /var/www/certbot

# ── Find any existing SSL cert for this domain (checks common Let's Encrypt paths) ──
SSL_CERT_DIR=""
for _candidate in \
  "/etc/letsencrypt/live/${DOMAIN}" \
  "/etc/letsencrypt/live/www.${DOMAIN}" \
  "/etc/letsencrypt/live/${DOMAIN}-0001" \
  "/etc/letsencrypt/live/${DOMAIN}-0002"; do
  if [[ -f "${_candidate}/fullchain.pem" && -f "${_candidate}/privkey.pem" ]]; then
    SSL_CERT_DIR="$_candidate"
    break
  fi
done

if [[ -n "$SSL_CERT_DIR" ]]; then
  ok "Existing SSL certificate found: $SSL_CERT_DIR"
else
  warn "No SSL certificate found yet — will write HTTP-only nginx config for now"
fi

# ── Find the nginx config file for this domain (may be named differently) ────
NGINX_CONF=""
for _candidate in \
  "/etc/nginx/sites-available/${DOMAIN}" \
  "/etc/nginx/sites-available/certxa" \
  "/etc/nginx/sites-available/certxa.conf" \
  "/etc/nginx/conf.d/${DOMAIN}.conf" \
  "/etc/nginx/conf.d/certxa.conf"; do
  if [[ -f "$_candidate" ]]; then
    NGINX_CONF="$_candidate"
    break
  fi
done

# Decide the target config path (use existing one if found, else create new)
NGINX_CONF_TARGET="${NGINX_CONF:-/etc/nginx/sites-available/${DOMAIN}}"

# ── Check if the existing config already looks correct ───────────────────────
NGINX_NEEDS_REWRITE=1
if [[ -n "$NGINX_CONF" ]]; then
  # Config is correct if it proxies to the right port AND has SSL if cert exists
  _proxies_right_port=0
  _has_ssl_block=0
  grep -q "127.0.0.1:${APP_PORT}" "$NGINX_CONF" && _proxies_right_port=1
  grep -q "listen 443" "$NGINX_CONF"            && _has_ssl_block=1

  if [[ "$_proxies_right_port" -eq 1 ]]; then
    if [[ -n "$SSL_CERT_DIR" && "$_has_ssl_block" -eq 1 ]]; then
      ok "Existing nginx config already correct (port ${APP_PORT}, HTTPS enabled)"
      NGINX_NEEDS_REWRITE=0
    elif [[ -z "$SSL_CERT_DIR" && "$_has_ssl_block" -eq 0 ]]; then
      ok "Existing nginx config already correct (port ${APP_PORT}, HTTP-only — no cert yet)"
      NGINX_NEEDS_REWRITE=0
    elif [[ -n "$SSL_CERT_DIR" && "$_has_ssl_block" -eq 0 ]]; then
      warn "Existing config found but is missing the HTTPS block — will add it now"
    elif [[ "$_proxies_right_port" -eq 0 ]]; then
      warn "Existing config routes to a different port — will update to ${APP_PORT}"
    fi
  else
    warn "Existing nginx config found but proxies to wrong port — will rewrite for port ${APP_PORT}"
  fi
fi

# ── Write (or rewrite) the nginx config ──────────────────────────────────────
write_nginx_config() {
  local cert_dir="$1"   # empty = HTTP-only, non-empty = include HTTPS block

  if [[ -n "$cert_dir" ]]; then
    # Full HTTP + HTTPS config
    cat > "$NGINX_CONF_TARGET" << NGINXFULL
# ── Rate limiting ──────────────────────────────────────────────────────────────
limit_req_zone \$binary_remote_addr zone=certxa_api:10m rate=30r/m;
limit_req_zone \$binary_remote_addr zone=certxa_auth:10m rate=10r/m;

# ── HTTP → HTTPS redirect ──────────────────────────────────────────────────────
server {
    listen 80;
    listen [::]:80;
    server_name ${DOMAIN} www.${DOMAIN} manage.${DOMAIN} *.${DOMAIN};
    location /.well-known/acme-challenge/ { root /var/www/certbot; }
    location / { return 301 https://\$host\$request_uri; }
}

# ── HTTPS server ───────────────────────────────────────────────────────────────
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name ${DOMAIN} www.${DOMAIN} manage.${DOMAIN} *.${DOMAIN};

    ssl_certificate     ${cert_dir}/fullchain.pem;
    ssl_certificate_key ${cert_dir}/privkey.pem;
    ssl_protocols       TLSv1.2 TLSv1.3;
    ssl_ciphers         HIGH:!aNULL:!MD5;
    ssl_session_cache   shared:SSL:10m;
    ssl_session_timeout 10m;

    add_header X-Frame-Options SAMEORIGIN always;
    add_header X-Content-Type-Options nosniff always;
    add_header Referrer-Policy strict-origin-when-cross-origin always;
    client_max_body_size 55M;

    location / {
        proxy_pass         http://127.0.0.1:${APP_PORT};
        proxy_http_version 1.1;
        proxy_set_header Upgrade    \$http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host              \$host;
        proxy_set_header X-Real-IP         \$remote_addr;
        proxy_set_header X-Forwarded-For   \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_set_header X-Forwarded-Host  \$host;
        proxy_connect_timeout 60s;
        proxy_send_timeout    120s;
        proxy_read_timeout    120s;
    }

    location /api/auth/ {
        limit_req zone=certxa_auth burst=5 nodelay;
        proxy_pass         http://127.0.0.1:${APP_PORT};
        proxy_http_version 1.1;
        proxy_set_header Host              \$host;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_set_header X-Forwarded-Host  \$host;
        proxy_set_header X-Real-IP         \$remote_addr;
        proxy_set_header X-Forwarded-For   \$proxy_add_x_forwarded_for;
    }

    location /assets/ {
        proxy_pass http://127.0.0.1:${APP_PORT};
        add_header Cache-Control "public, max-age=31536000, immutable";
    }
}
NGINXFULL
  else
    # HTTP-only config (SSL cert not available yet)
    cat > "$NGINX_CONF_TARGET" << NGINXHTTP
# ── Rate limiting ──────────────────────────────────────────────────────────────
limit_req_zone \$binary_remote_addr zone=certxa_api:10m rate=30r/m;
limit_req_zone \$binary_remote_addr zone=certxa_auth:10m rate=10r/m;

# ── HTTP server (HTTPS redirect added once SSL cert is issued) ─────────────────
server {
    listen 80;
    listen [::]:80;
    server_name ${DOMAIN} www.${DOMAIN} manage.${DOMAIN} *.${DOMAIN};

    # Let's Encrypt ACME challenge (needed when issuing the cert)
    location /.well-known/acme-challenge/ { root /var/www/certbot; }

    location / {
        proxy_pass         http://127.0.0.1:${APP_PORT};
        proxy_http_version 1.1;
        proxy_set_header Upgrade    \$http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host              \$host;
        proxy_set_header X-Real-IP         \$remote_addr;
        proxy_set_header X-Forwarded-For   \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_set_header X-Forwarded-Host  \$host;
        proxy_connect_timeout 60s;
        proxy_send_timeout    120s;
        proxy_read_timeout    120s;
    }

    location /assets/ {
        proxy_pass http://127.0.0.1:${APP_PORT};
        add_header Cache-Control "public, max-age=31536000, immutable";
    }
}
NGINXHTTP
  fi
}

if [[ "$NGINX_NEEDS_REWRITE" -eq 1 ]]; then
  # Back up the existing config if present
  if [[ -n "$NGINX_CONF" && -f "$NGINX_CONF" ]]; then
    cp "$NGINX_CONF" "${NGINX_CONF}.bak.$(date +%Y%m%d%H%M%S)"
    warn "Existing nginx config backed up as ${NGINX_CONF}.bak.*"
  fi
  write_nginx_config "$SSL_CERT_DIR"
  ok "nginx config written: $NGINX_CONF_TARGET"
fi

# ── Enable the site (symlink in sites-enabled) ────────────────────────────────
NGINX_ENABLED_LINK="/etc/nginx/sites-enabled/$(basename "$NGINX_CONF_TARGET")"
if [[ ! -L "$NGINX_ENABLED_LINK" ]]; then
  ln -sf "$NGINX_CONF_TARGET" "$NGINX_ENABLED_LINK"
  ok "nginx site enabled: $NGINX_ENABLED_LINK"
else
  ok "nginx site already enabled: $NGINX_ENABLED_LINK"
fi

# ── Disable the default site (it catches all traffic if left enabled) ─────────
if [[ -L "/etc/nginx/sites-enabled/default" ]]; then
  rm -f /etc/nginx/sites-enabled/default
  ok "Default nginx site disabled"
fi

# ── Validate and reload ───────────────────────────────────────────────────────
if nginx -t 2>&1; then
  systemctl reload nginx
  ok "nginx validated and reloaded"
else
  fail "nginx config test failed. Config is at: $NGINX_CONF_TARGET"
  fail "Original backed up as: ${NGINX_CONF_TARGET}.bak.*"
  nginx -t
  exit 1
fi

# ══════════════════════════════════════════════════════════════════════════════
# STEP 9 — SSL certificate
# ══════════════════════════════════════════════════════════════════════════════
step "Step 9/10 — SSL certificate"

if [[ "${SKIP_SSL:-0}" == "1" ]]; then
  warn "Skipping SSL (SKIP_SSL=1) — configure SSL manually and reload nginx."

elif [[ -n "$SSL_CERT_DIR" ]]; then
  ok "SSL certificate already exists at $SSL_CERT_DIR — skipping certbot"
  ok "nginx is already configured to use it"

  # Make sure auto-renewal is set up (may not be if cert was issued manually)
  if ! crontab -l 2>/dev/null | grep -q "certbot renew"; then
    (crontab -l 2>/dev/null; echo "0 3 * * * certbot renew --quiet --post-hook 'systemctl reload nginx'") \
      | sort -u | crontab -
    ok "SSL auto-renewal cron job added (daily at 3am)"
  else
    ok "SSL auto-renewal already scheduled"
  fi

else
  info "No SSL certificate found — requesting one from Let's Encrypt..."
  info "Make sure ${DOMAIN} and www.${DOMAIN} DNS records point to this server's IP first."
  echo ""

  if certbot certonly --webroot \
    --webroot-path /var/www/certbot \
    --non-interactive \
    --agree-tos \
    --register-unsafely-without-email \
    -d "${DOMAIN}" \
    -d "www.${DOMAIN}" \
    -d "manage.${DOMAIN}" \
    2>&1; then

    # Find the cert that was just issued
    SSL_CERT_DIR=""
    for _candidate in \
      "/etc/letsencrypt/live/${DOMAIN}" \
      "/etc/letsencrypt/live/${DOMAIN}-0001"; do
      if [[ -f "${_candidate}/fullchain.pem" ]]; then
        SSL_CERT_DIR="$_candidate"
        break
      fi
    done

    ok "SSL certificate issued: $SSL_CERT_DIR"

    # Rewrite nginx config with the HTTPS block now that the cert exists
    write_nginx_config "$SSL_CERT_DIR"
    nginx -t && systemctl reload nginx
    ok "nginx reloaded with HTTPS enabled"

    # Set up auto-renewal
    (crontab -l 2>/dev/null; echo "0 3 * * * certbot renew --quiet --post-hook 'systemctl reload nginx'") \
      | sort -u | crontab -
    ok "SSL auto-renewal scheduled (daily at 3am)"

  else
    warn "certbot could not issue a certificate automatically."
    warn "This usually means the domain DNS doesn't point here yet, or port 80 is blocked."
    warn ""
    warn "Once DNS is ready, run manually:"
    warn "  certbot certonly --webroot --webroot-path /var/www/certbot -d ${DOMAIN} -d www.${DOMAIN}"
    warn "  # Then re-run this script — it will detect the cert and update nginx."
    warn ""
    warn "Continuing with HTTP-only for now."
  fi
fi

# ══════════════════════════════════════════════════════════════════════════════
# STEP 10 — Start the app under PM2
# ══════════════════════════════════════════════════════════════════════════════
step "Step 10/10 — Starting Certxa under PM2"

mkdir -p "$APP_DIR/logs"

# Kill anything already on the app port
STALE_PIDS="$(lsof -t -i:"${APP_PORT}" 2>/dev/null || true)"
if [[ -n "$STALE_PIDS" ]]; then
  warn "Killing stale process(es) on port ${APP_PORT}: $STALE_PIDS"
  # shellcheck disable=SC2086
  kill -9 $STALE_PIDS 2>/dev/null || true
  sleep 1
fi

# Stop and remove any existing PM2 certxa process, then start fresh
if pm2 describe certxa &>/dev/null; then
  pm2 stop certxa 2>/dev/null || true
  pm2 delete certxa 2>/dev/null || true
  sleep 1
fi

# Set the correct cwd in ecosystem.config.cjs (in case it's stale)
sed -i "s|cwd:.*|// cwd: '$APP_DIR'  ← auto-configured by vps-install.sh|g" \
  "$APP_DIR/ecosystem.config.cjs" 2>/dev/null || true

# Start with the ecosystem config from the project root
cd "$APP_DIR"
pm2 start ecosystem.config.cjs --update-env
pm2 save --force >/dev/null
ok "PM2 started — process name: certxa"

# ── Wait for the app to boot (it auto-runs DB migrations on first start) ──────
info "Waiting up to 60 seconds for the app to boot and run migrations..."
echo ""

BOOT_ELAPSED=0
BOOT_STATUS="000"
while [[ "$BOOT_ELAPSED" -lt 60 ]]; do
  BOOT_STATUS="$(curl -s -o /dev/null -w "%{http_code}" --max-time 5 \
    "http://127.0.0.1:${APP_PORT}/api/health" 2>/dev/null || echo "000")"

  if [[ "$BOOT_STATUS" == "200" || "$BOOT_STATUS" == "503" ]]; then
    break
  fi

  printf "    %ds — waiting (HTTP %s)...\r" "$BOOT_ELAPSED" "$BOOT_STATUS"
  sleep 3
  BOOT_ELAPSED="$((BOOT_ELAPSED + 3))"
done
echo ""

# ── Final health check ────────────────────────────────────────────────────────
INTERNAL_STATUS="$(curl -s -o /dev/null -w "%{http_code}" --max-time 10 \
  "http://127.0.0.1:${APP_PORT}/api/health" 2>/dev/null || echo "000")"

EXTERNAL_STATUS="000"
if [[ "${SKIP_SSL:-0}" != "1" ]]; then
  EXTERNAL_STATUS="$(curl -sk -o /dev/null -w "%{http_code}" --max-time 10 \
    "https://${DOMAIN}/api/health" 2>/dev/null || echo "000")"
fi

# ══════════════════════════════════════════════════════════════════════════════
# FINAL SUMMARY
# ══════════════════════════════════════════════════════════════════════════════
echo ""
banner "╔══════════════════════════════════════════════════════════════╗"
banner "║                    Setup Complete!                          ║"
banner "╚══════════════════════════════════════════════════════════════╝"
echo ""
echo -e "  ${BOLD}Domain    :${NC} https://${DOMAIN}"
echo -e "  ${BOLD}App port  :${NC} ${APP_PORT}  (Node.js, localhost-only)"
echo -e "  ${BOLD}Database  :${NC} ${DB_NAME}  (user: ${DB_USER})"
echo -e "  ${BOLD}PHP port  :${NC} 8104  (auto-started by Node, internal only)"
echo ""

if [[ "$INTERNAL_STATUS" == "200" ]]; then
  ok "Internal health check (port ${APP_PORT}): HTTP 200"
elif [[ "$INTERNAL_STATUS" == "503" ]]; then
  warn "Internal health check: HTTP 503 (degraded — check DB or env vars)"
  warn "Run: curl http://127.0.0.1:${APP_PORT}/api/health"
else
  warn "Internal health check: HTTP ${INTERNAL_STATUS} — app may still be booting"
  warn "Check: pm2 logs certxa --lines 30"
fi

if [[ "${SKIP_SSL:-0}" != "1" ]]; then
  if [[ "$EXTERNAL_STATUS" == "200" ]]; then
    ok "External health check (https://${DOMAIN}): HTTP 200"
    echo ""
    echo -e "${GREEN}${BOLD}  🎉  Certxa is live at https://${DOMAIN}${NC}"
  else
    warn "External health check (https://${DOMAIN}): HTTP ${EXTERNAL_STATUS}"
    warn "If SSL cert was just issued, wait 30s and try: curl https://${DOMAIN}/api/health"
    warn "If still failing, check: sudo nginx -t && sudo systemctl status nginx"
  fi
fi

echo ""
echo -e "  ${DIM}Useful commands:${NC}"
echo -e "  ${DIM}  pm2 logs certxa --lines 50    # live application logs${NC}"
echo -e "  ${DIM}  pm2 monit                      # real-time process monitor${NC}"
echo -e "  ${DIM}  pm2 list                       # all process statuses${NC}"
echo -e "  ${DIM}  bash scripts/deploy.sh         # deploy future code updates${NC}"
echo ""
echo -e "  ${YELLOW}  Save your .env file — it contains your DB password and session secret.${NC}"
echo ""

# ── DNS reminder ──────────────────────────────────────────────────────────────
VPS_IP="$(curl -s --max-time 5 https://api.ipify.org 2>/dev/null || ip route get 1 | awk '{print $7; exit}' 2>/dev/null || echo 'YOUR_VPS_IP')"
echo ""
echo -e "  ${BOLD}DNS records required in your domain registrar / Cloudflare:${NC}"
echo ""
printf "  %-10s %-20s %-16s %s\n" "Type" "Name" "Value" "Notes"
printf "  %-10s %-20s %-16s %s\n" "────" "────────────────────" "────────────────" "─────────────────────────────────"
printf "  %-10s %-20s %-16s %s\n" "A" "${DOMAIN}" "${VPS_IP}" "Root domain"
printf "  %-10s %-20s %-16s %s\n" "A" "www" "${VPS_IP}" ""
printf "  %-10s %-20s %-16s %s\n" "A" "manage" "${VPS_IP}" "Dashboard subdomain"
printf "  %-10s %-20s %-16s %s\n" "A" "*" "${VPS_IP}" "Wildcard (booking pages) — DNS-only if Cloudflare"
echo ""
