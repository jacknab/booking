#!/usr/bin/env bash
# =============================================================================
#  deploy.sh — Certxa Smart VPS Deploy Script
#
#  Usage:
#    bash scripts/deploy.sh                    # full deploy
#    SKIP_GIT_PULL=1 bash scripts/deploy.sh   # skip git pull
#    SKIP_MIGRATE=1  bash scripts/deploy.sh   # skip DB migrations
#    SKIP_BUILD=1    bash scripts/deploy.sh   # skip build (use existing dist)
#
#  What it does (in order):
#    1.  Pre-flight checks (env file, required vars, tools, disk space)
#    2.  Backs up current dist/ for automatic rollback
#    3.  Pulls latest code from git
#    4.  Installs / updates dependencies
#    5.  Runs database migrations (standalone, before the app restarts)
#    6.  Builds the production bundle
#    7.  Validates the build output
#    8.  Stops PM2 cleanly, frees ports
#    9.  Starts PM2 fresh (not reload — fork mode needs a clean start)
#    10. Smart health-check loop — retries up to 45 seconds with backoff
#    11. Auto-rollback + full diagnostics if startup fails
# =============================================================================
set -euo pipefail

# ── Colour helpers ─────────────────────────────────────────────────────────────
RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'
CYAN='\033[0;36m'; BOLD='\033[1m'; NC='\033[0m'
ok()    { echo -e "${GREEN}  ✅  $*${NC}"; }
info()  { echo -e "${CYAN}  ▶  $*${NC}"; }
warn()  { echo -e "${YELLOW}  ⚠️   $*${NC}"; }
fail()  { echo -e "${RED}  ❌  $*${NC}"; }
step()  { echo ""; echo -e "${BOLD}${CYAN}── $* ──${NC}"; }

# ── Resolve project root (works from any directory) ────────────────────────────
cd "$(dirname "$0")/.."
APP_DIR="$(pwd)"
APP_NAME="${PM2_APP_NAME:-certxa}"
APP_PORT="${PORT:-8100}"
PHP_PORT="${PHP_PORT:-8104}"
APP_URL="${APP_URL:-https://certxa.com}"
ENV_FILE="${ENV_FILE:-.env}"
DIST_DIR="$APP_DIR/dist"
BACKUP_DIR="/tmp/certxa-dist-backup"
LOG_DIR="$APP_DIR/logs"

mkdir -p "$LOG_DIR"

echo ""
echo -e "${BOLD}╔══════════════════════════════════════════════════════════╗${NC}"
echo -e "${BOLD}║          Certxa — Smart VPS Deploy Script                ║${NC}"
echo -e "${BOLD}╚══════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "  ${CYAN}App dir${NC} : $APP_DIR"
echo -e "  ${CYAN}PM2 name${NC}: $APP_NAME"
echo -e "  ${CYAN}Port${NC}    : $APP_PORT"
echo -e "  ${CYAN}App URL${NC} : $APP_URL"
echo -e "  ${CYAN}Env file${NC}: $ENV_FILE"
echo ""

# ═══════════════════════════════════════════════════════════════════════════════
step "Step 1/9 — Pre-flight checks"
# ═══════════════════════════════════════════════════════════════════════════════

PREFLIGHT_FAIL=0

# 1a. .env file
if [[ ! -f "$ENV_FILE" ]]; then
  fail ".env file not found at $APP_DIR/$ENV_FILE"
  fail "Copy .env.example to .env and fill in your secrets."
  PREFLIGHT_FAIL=1
else
  ok ".env file found"
fi

# 1b. Load env so we can validate vars (without exporting everything blindly)
if [[ -f "$ENV_FILE" ]]; then
  set +u  # allow unbound during source
  # Parse .env manually (handles comments and quoted values)
  while IFS='=' read -r key value; do
    [[ "$key" =~ ^[[:space:]]*# ]] && continue  # skip comments
    [[ -z "$key" ]] && continue                  # skip blank lines
    key="${key// /}"                              # trim spaces from key
    value="${value%%#*}"                          # strip inline comments
    value="${value%"${value##*[![:space:]]}"}"    # trim trailing whitespace
    value="${value#\"}" value="${value%\"}"        # strip surrounding quotes
    value="${value#\'}" value="${value%\'}"
    export "$key=$value" 2>/dev/null || true
  done < "$ENV_FILE"
  set -u
fi

# 1c. Required environment variables
REQUIRED_VARS=(DATABASE_URL SESSION_SECRET APP_URL)
for var in "${REQUIRED_VARS[@]}"; do
  if [[ -z "${!var:-}" ]]; then
    fail "Required env var missing: $var"
    PREFLIGHT_FAIL=1
  else
    ok "$var is set"
  fi
done

# 1d. Required tools
for tool in node npm pm2 git lsof curl psql; do
  if ! command -v "$tool" &>/dev/null; then
    fail "Required tool not found: $tool"
    PREFLIGHT_FAIL=1
  else
    ok "$tool found ($(command -v "$tool"))"
  fi
done

# 1e. Node version check (must be 20.x)
NODE_VER="$(node --version)"
NODE_MAJOR="${NODE_VER%%.*}"
NODE_MAJOR="${NODE_MAJOR#v}"
if [[ "$NODE_MAJOR" -lt 20 ]]; then
  fail "Node.js 20+ required, found: $NODE_VER"
  PREFLIGHT_FAIL=1
else
  ok "Node.js $NODE_VER"
fi

# 1f. Disk space — need at least 500 MB free
DISK_FREE_KB="$(df -k "$APP_DIR" | awk 'NR==2 {print $4}')"
DISK_FREE_MB="$((DISK_FREE_KB / 1024))"
if [[ "$DISK_FREE_MB" -lt 500 ]]; then
  fail "Low disk space: ${DISK_FREE_MB}MB free (need 500MB+)"
  PREFLIGHT_FAIL=1
else
  ok "Disk space: ${DISK_FREE_MB}MB free"
fi

# 1g. Database connectivity test
info "Testing database connection…"
if psql "$DATABASE_URL" -c "SELECT 1" &>/dev/null; then
  ok "Database connection successful"
else
  fail "Cannot connect to database: $DATABASE_URL"
  fail "Check your DATABASE_URL in $ENV_FILE"
  PREFLIGHT_FAIL=1
fi

if [[ "$PREFLIGHT_FAIL" -eq 1 ]]; then
  echo ""
  fail "Pre-flight checks failed — aborting deploy. Fix the issues above and re-run."
  exit 1
fi

ok "All pre-flight checks passed"

# ═══════════════════════════════════════════════════════════════════════════════
step "Step 2/9 — Backing up current dist for rollback"
# ═══════════════════════════════════════════════════════════════════════════════

ROLLBACK_AVAILABLE=0
if [[ -d "$DIST_DIR" ]]; then
  rm -rf "$BACKUP_DIR"
  cp -r "$DIST_DIR" "$BACKUP_DIR"
  ok "dist/ backed up to $BACKUP_DIR"
  ROLLBACK_AVAILABLE=1
else
  warn "No existing dist/ to back up — rollback will not be available"
fi

# Capture commit before pull for comparison
PREV_COMMIT="$(git rev-parse --short HEAD 2>/dev/null || echo 'unknown')"

# ═══════════════════════════════════════════════════════════════════════════════
step "Step 3/9 — Pulling latest code"
# ═══════════════════════════════════════════════════════════════════════════════

if [[ "${SKIP_GIT_PULL:-0}" == "1" ]]; then
  warn "Skipping git pull (SKIP_GIT_PULL=1)"
else
  git pull --ff-only
fi

COMMIT="$(git rev-parse --short HEAD)"
BUILD_TIME="$(date -u +%Y-%m-%dT%H:%M:%SZ)"
ok "Commit: $COMMIT (was: $PREV_COMMIT)  |  $BUILD_TIME"

# ═══════════════════════════════════════════════════════════════════════════════
step "Step 4/9 — Installing dependencies"
# ═══════════════════════════════════════════════════════════════════════════════

npm ci --prefer-offline --loglevel=warn 2>&1 | grep -v "^npm warn" | tail -5
ok "Dependencies installed"

# ═══════════════════════════════════════════════════════════════════════════════
step "Step 5/9 — Running database migrations"
# ═══════════════════════════════════════════════════════════════════════════════

if [[ "${SKIP_MIGRATE:-0}" == "1" ]]; then
  warn "Skipping database migrations (SKIP_MIGRATE=1)"
else
  info "Running pending SQL migrations against: $DATABASE_URL"
  # Run the standalone migrate script (not via startup — that runs inside the
  # live server and we want migrations done BEFORE PM2 restarts).
  if DATABASE_URL="$DATABASE_URL" node_modules/.bin/tsx scripts/migrate.ts; then
    ok "Database migrations complete"
  else
    fail "Database migration FAILED — aborting deploy to protect your data."
    fail "Fix the migration error above, then re-run: bash scripts/deploy.sh"
    exit 1
  fi
fi

# ═══════════════════════════════════════════════════════════════════════════════
step "Step 6/9 — Building production bundle"
# ═══════════════════════════════════════════════════════════════════════════════

if [[ "${SKIP_BUILD:-0}" == "1" ]]; then
  warn "Skipping build (SKIP_BUILD=1)"
else
  rm -rf dist node_modules/.vite
  GIT_COMMIT="$COMMIT" BUILD_TIME="$BUILD_TIME" npm run build
  ok "Build complete"
fi

# ═══════════════════════════════════════════════════════════════════════════════
step "Step 7/9 — Validating build output"
# ═══════════════════════════════════════════════════════════════════════════════

BUILD_OK=1
for required_file in dist/index.cjs dist/public/index.html; do
  if [[ ! -f "$required_file" ]]; then
    fail "Missing required build artifact: $required_file"
    BUILD_OK=0
  fi
done

if [[ "$BUILD_OK" -eq 0 ]]; then
  fail "Build validation failed. The dist/ is incomplete — aborting."
  exit 1
fi

NEW_BUNDLE="$(grep -oE 'index-[A-Za-z0-9_-]+\.js' dist/public/index.html | head -n1 || true)"
if [[ -z "$NEW_BUNDLE" ]]; then
  fail "Could not find a hashed JS bundle in dist/public/index.html — build may be broken."
  exit 1
fi
ok "Build validated — bundle: $NEW_BUNDLE"

# ═══════════════════════════════════════════════════════════════════════════════
step "Step 8/9 — Starting application (clean restart)"
# ═══════════════════════════════════════════════════════════════════════════════

# Stop PM2 gracefully first (fork mode apps need a full stop/start for clean state)
info "Stopping PM2 process: $APP_NAME"
if pm2 describe "$APP_NAME" &>/dev/null; then
  pm2 stop "$APP_NAME" 2>/dev/null || true
  pm2 delete "$APP_NAME" 2>/dev/null || true
  ok "PM2 process stopped and deleted"
else
  warn "PM2 process '$APP_NAME' was not running"
fi

# Kill any lingering processes on our ports
for PORT_TO_CLEAR in "$APP_PORT" "$PHP_PORT"; do
  PIDS="$(lsof -t -i:"$PORT_TO_CLEAR" 2>/dev/null || true)"
  if [[ -n "$PIDS" ]]; then
    warn "Killing stale process(es) on port $PORT_TO_CLEAR: $PIDS"
    kill -9 $PIDS 2>/dev/null || true
    sleep 1
  fi
done

# Start fresh with ecosystem config
info "Starting PM2: $APP_NAME"
pm2 start ecosystem.config.cjs --update-env
pm2 save
ok "PM2 started"

# ═══════════════════════════════════════════════════════════════════════════════
step "Step 9/9 — Health check (up to 45 seconds)"
# ═══════════════════════════════════════════════════════════════════════════════

# ── Rollback function ──────────────────────────────────────────────────────────
do_rollback() {
  echo ""
  fail "═══════════════════════════════════════════"
  fail "  ROLLING BACK to previous build…"
  fail "═══════════════════════════════════════════"
  if [[ "$ROLLBACK_AVAILABLE" -eq 1 ]] && [[ -d "$BACKUP_DIR" ]]; then
    pm2 stop "$APP_NAME" 2>/dev/null || true
    pm2 delete "$APP_NAME" 2>/dev/null || true
    rm -rf "$DIST_DIR"
    cp -r "$BACKUP_DIR" "$DIST_DIR"
    pm2 start ecosystem.config.cjs --update-env
    pm2 save
    warn "Rollback to commit $PREV_COMMIT complete."
    warn "Your previous version has been restored."
  else
    fail "No backup available — cannot roll back automatically."
    fail "You may need to re-deploy manually or restore from git."
  fi
}

# ── Diagnostics function ───────────────────────────────────────────────────────
show_diagnostics() {
  echo ""
  echo -e "${BOLD}${YELLOW}══ DIAGNOSTICS ══════════════════════════════════════${NC}"

  echo ""
  echo -e "${YELLOW}▶ PM2 status:${NC}"
  pm2 list 2>/dev/null || true

  echo ""
  echo -e "${YELLOW}▶ Last 40 PM2 log lines (error):${NC}"
  pm2 logs "$APP_NAME" --err --lines 40 --nostream 2>/dev/null || true

  echo ""
  echo -e "${YELLOW}▶ Last 40 PM2 log lines (output):${NC}"
  pm2 logs "$APP_NAME" --out --lines 40 --nostream 2>/dev/null || true

  echo ""
  echo -e "${YELLOW}▶ Port $APP_PORT usage:${NC}"
  lsof -i:"$APP_PORT" 2>/dev/null || echo "  (nothing on port $APP_PORT)"

  echo ""
  echo -e "${YELLOW}▶ Database connectivity from server:${NC}"
  if psql "$DATABASE_URL" -c "SELECT NOW() AS db_time, version();" 2>&1; then
    ok "Database is reachable"
  else
    fail "Database is NOT reachable from this server"
  fi

  echo ""
  echo -e "${YELLOW}▶ .env loaded vars (existence only):${NC}"
  for var in DATABASE_URL SESSION_SECRET APP_URL GOOGLE_CLIENT_ID TWILIO_ACCOUNT_SID MAILGUN_API_KEY STRIPE_SECRET_KEY; do
    if [[ -n "${!var:-}" ]]; then
      echo -e "  ${GREEN}✓${NC} $var is set"
    else
      echo -e "  ${RED}✗${NC} $var is NOT set"
    fi
  done

  echo ""
  echo -e "${YELLOW}▶ dist/ contents:${NC}"
  ls -lh dist/ 2>/dev/null || echo "  (dist/ missing)"
  ls -lh dist/public/ 2>/dev/null | head -10 || echo "  (dist/public/ missing)"

  echo ""
  echo -e "${YELLOW}▶ Internal health check (bypass nginx):${NC}"
  curl -s --max-time 5 "http://127.0.0.1:$APP_PORT/api/health" 2>/dev/null \
    | python3 -m json.tool 2>/dev/null \
    || echo "  (no response on port $APP_PORT — app is not up)"

  echo ""
  echo -e "${BOLD}${YELLOW}══ END DIAGNOSTICS ══════════════════════════════════${NC}"
  echo ""
}

# ── Health check retry loop ────────────────────────────────────────────────────
MAX_WAIT=45
INTERVAL=3
ELAPSED=0
HTTP_STATUS="000"

info "Waiting for app to come up (checking every ${INTERVAL}s, timeout ${MAX_WAIT}s)…"
echo ""

while [[ "$ELAPSED" -lt "$MAX_WAIT" ]]; do
  # First check the app port directly (bypasses nginx — catches app-not-up vs nginx issues)
  INTERNAL_STATUS="$(curl -s -o /dev/null -w "%{http_code}" --max-time 4 "http://127.0.0.1:$APP_PORT/api/health" 2>/dev/null || echo "000")"

  if [[ "$INTERNAL_STATUS" == "200" ]]; then
    ok "App is up on port $APP_PORT (internal check passed in ${ELAPSED}s)"
    HTTP_STATUS="200"
    break
  elif [[ "$INTERNAL_STATUS" == "503" ]]; then
    warn "App responded 503 on port $APP_PORT (starting up or DB issue) — waiting…"
  else
    info "  ${ELAPSED}s — port $APP_PORT: HTTP $INTERNAL_STATUS — waiting…"
  fi

  sleep "$INTERVAL"
  ELAPSED="$((ELAPSED + INTERVAL))"
done

# ── Final result ───────────────────────────────────────────────────────────────
echo ""
echo -e "${BOLD}╔══════════════════════════════════════════════════════════╗${NC}"
echo -e "${BOLD}║                   Deploy Summary                        ║${NC}"
echo -e "${BOLD}╚══════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "  ${CYAN}Commit${NC}   : $COMMIT (was: $PREV_COMMIT)"
echo -e "  ${CYAN}Bundle${NC}   : $NEW_BUNDLE"
echo -e "  ${CYAN}Started${NC}  : $BUILD_TIME"
echo ""

if [[ "$HTTP_STATUS" == "200" ]]; then
  # Also do the external health check through nginx
  EXT_STATUS="$(curl -s -o /dev/null -w "%{http_code}" --max-time 10 "$APP_URL/api/health" 2>/dev/null || echo "failed")"
  ok "Internal health check: HTTP 200 ✅"
  if [[ "$EXT_STATUS" == "200" ]]; then
    ok "External health check ($APP_URL): HTTP 200 ✅"
    echo ""
    echo -e "${GREEN}${BOLD}  🎉 Deploy successful! App is live at $APP_URL${NC}"
  else
    warn "External health check ($APP_URL): HTTP $EXT_STATUS"
    warn "The app is running fine internally but nginx returned $EXT_STATUS."
    warn "This is usually an nginx config or SSL issue, not the app itself."
    warn "Check: nginx -t && systemctl reload nginx"
    echo ""
    echo -e "${YELLOW}  App is up internally but may not be reachable via nginx.${NC}"
  fi

elif [[ "$HTTP_STATUS" == "503" ]]; then
  warn "App started but health check returned 503 — check your env vars or DB."
  warn "Run:  pm2 logs $APP_NAME --lines 50"
  echo ""
  show_diagnostics

else
  fail "App did not come up after ${MAX_WAIT}s (HTTP $HTTP_STATUS on port $APP_PORT)."
  echo ""
  show_diagnostics
  do_rollback
  echo ""
  fail "Deploy FAILED. Your previous build has been restored."
  fail "Fix the errors shown above, then re-run: bash scripts/deploy.sh"
  exit 1
fi

echo ""
echo -e "  ${CYAN}Useful commands:${NC}"
echo -e "    pm2 logs $APP_NAME --lines 50     # live logs"
echo -e "    pm2 monit                         # process monitor"
echo -e "    curl $APP_URL/api/health           # health check"
echo ""
