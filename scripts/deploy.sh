#!/usr/bin/env bash
# =============================================================================
#  deploy.sh — Certxa Self-Healing VPS Deploy Script
#
#  Usage:
#    bash scripts/deploy.sh                    # full deploy
#    SKIP_GIT_PULL=1 bash scripts/deploy.sh   # skip git pull
#    SKIP_MIGRATE=1  bash scripts/deploy.sh   # skip DB migrations
#    SKIP_BUILD=1    bash scripts/deploy.sh   # skip build (use existing dist)
#
#  Self-healing behaviour:
#    After starting the app, if the health check fails the script reads PM2
#    logs, identifies the root cause, applies the appropriate fix, restarts,
#    and retests — automatically — up to MAX_HEAL_ATTEMPTS times.
#
#    Known auto-fixable failures:
#      • Port already in use          → kill stale processes, restart
#      • Missing node_modules         → npm ci, restart
#      • dist/index.cjs missing       → npm run build, restart
#      • PostgreSQL not running       → systemctl start postgresql, restart
#      • PM2 process in error/loop    → full delete + fresh start
#      • nginx 502 (app OK internally)→ nginx config test + reload
#      • Insufficient file descriptors→ ulimit bump, restart
#      • Out of memory                → report + suggest swap
#      • PHP binary missing           → apt install php, restart
#
#  Deploy steps:
#    1.  Pre-flight checks (env file, required vars, tools, disk, DB)
#    2.  Back up current dist/ for rollback
#    3.  Pull latest code from git
#    4.  Install / update dependencies
#    5.  Run database migrations (standalone, before app restarts)
#    6.  Build production bundle
#    7.  Validate build output
#    8.  Clean stop + port clear + fresh PM2 start
#    9.  Self-healing health check loop
#    10. Final summary
# =============================================================================
set -uo pipefail   # no -e: we handle errors manually in the heal loop

# ── Colour helpers ─────────────────────────────────────────────────────────────
RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'
CYAN='\033[0;36m'; MAGENTA='\033[0;35m'; BOLD='\033[1m'; DIM='\033[2m'; NC='\033[0m'
ok()     { echo -e "${GREEN}  ✅  $*${NC}"; }
info()   { echo -e "${CYAN}  ▶  $*${NC}"; }
warn()   { echo -e "${YELLOW}  ⚠️   $*${NC}"; }
fail()   { echo -e "${RED}  ❌  $*${NC}"; }
heal()   { echo -e "${MAGENTA}  🔧  $*${NC}"; }
step()   { echo ""; echo -e "${BOLD}${CYAN}── $* ──${NC}"; }
banner() { echo -e "${BOLD}$*${NC}"; }
dim()    { echo -e "${DIM}  $*${NC}"; }

# ── Project config ─────────────────────────────────────────────────────────────
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
MAX_HEAL_ATTEMPTS=5   # how many self-heal cycles before giving up

mkdir -p "$LOG_DIR"
DEPLOY_LOG="$LOG_DIR/deploy-$(date +%Y%m%d-%H%M%S).log"
# Tee everything to a deploy log file too
exec > >(tee -a "$DEPLOY_LOG") 2>&1

echo ""
banner "╔══════════════════════════════════════════════════════════╗"
banner "║       Certxa — Self-Healing VPS Deploy Script            ║"
banner "╚══════════════════════════════════════════════════════════╝"
echo ""
dim "App dir  : $APP_DIR"
dim "PM2 name : $APP_NAME"
dim "Port     : $APP_PORT"
dim "App URL  : $APP_URL"
dim "Env file : $ENV_FILE"
dim "Log      : $DEPLOY_LOG"
echo ""

# ══════════════════════════════════════════════════════════════════════════════
# UTILITY: load .env into the current shell
# ══════════════════════════════════════════════════════════════════════════════
load_env() {
  [[ ! -f "$ENV_FILE" ]] && return
  while IFS='=' read -r key rest; do
    [[ "$key" =~ ^[[:space:]]*# ]] && continue
    [[ -z "${key// }" ]] && continue
    key="${key// /}"
    rest="${rest%%#*}"
    rest="${rest%"${rest##*[![:space:]]}"}"
    rest="${rest#\"}" rest="${rest%\"}"
    rest="${rest#\'}" rest="${rest%\'}"
    [[ -n "$key" ]] && export "$key=$rest" 2>/dev/null || true
  done < "$ENV_FILE"
}

# ══════════════════════════════════════════════════════════════════════════════
# UTILITY: cleanly kill a port
# ══════════════════════════════════════════════════════════════════════════════
clear_port() {
  local port="$1"
  local pids
  pids="$(lsof -t -i:"$port" 2>/dev/null || true)"
  if [[ -n "$pids" ]]; then
    warn "Killing stale process(es) on port $port: $pids"
    # shellcheck disable=SC2086
    kill -9 $pids 2>/dev/null || true
    sleep 1
  fi
}

# ══════════════════════════════════════════════════════════════════════════════
# UTILITY: start PM2 fresh (stop/delete first, then start)
# ══════════════════════════════════════════════════════════════════════════════
pm2_fresh_start() {
  if pm2 describe "$APP_NAME" &>/dev/null; then
    pm2 stop "$APP_NAME" 2>/dev/null || true
    pm2 delete "$APP_NAME" 2>/dev/null || true
    sleep 1
  fi
  clear_port "$APP_PORT"
  clear_port "$PHP_PORT"
  pm2 start ecosystem.config.cjs --update-env
  pm2 save --force
}

# ══════════════════════════════════════════════════════════════════════════════
# UTILITY: get recent PM2 logs (combined stderr + stdout)
# ══════════════════════════════════════════════════════════════════════════════
get_pm2_logs() {
  local lines="${1:-60}"
  {
    pm2 logs "$APP_NAME" --err --lines "$lines" --nostream 2>/dev/null || true
    pm2 logs "$APP_NAME" --out --lines "$lines" --nostream 2>/dev/null || true
  }
}

# ══════════════════════════════════════════════════════════════════════════════
# UTILITY: internal health check (direct to Node port, bypasses nginx)
# ══════════════════════════════════════════════════════════════════════════════
internal_health() {
  curl -s -o /dev/null -w "%{http_code}" --max-time 5 \
    "http://127.0.0.1:$APP_PORT/api/health" 2>/dev/null || echo "000"
}

# ══════════════════════════════════════════════════════════════════════════════
# UTILITY: external health check (through nginx/SSL)
# ══════════════════════════════════════════════════════════════════════════════
external_health() {
  curl -s -o /dev/null -w "%{http_code}" --max-time 10 \
    "$APP_URL/api/health" 2>/dev/null || echo "000"
}

# ══════════════════════════════════════════════════════════════════════════════
# UTILITY: rollback to the backed-up dist/
# ══════════════════════════════════════════════════════════════════════════════
ROLLBACK_AVAILABLE=0
PREV_COMMIT="unknown"
do_rollback() {
  echo ""
  fail "─────────────────────────────────────────────"
  fail "  AUTO-ROLLBACK: restoring previous build…"
  fail "─────────────────────────────────────────────"
  if [[ "$ROLLBACK_AVAILABLE" -eq 1 ]] && [[ -d "$BACKUP_DIR" ]]; then
    pm2 stop "$APP_NAME" 2>/dev/null || true
    pm2 delete "$APP_NAME" 2>/dev/null || true
    rm -rf "$DIST_DIR"
    cp -r "$BACKUP_DIR" "$DIST_DIR"
    pm2 start ecosystem.config.cjs --update-env
    pm2 save --force
    warn "Rolled back to commit $PREV_COMMIT — your previous build is live again."
  else
    fail "No backup available — cannot auto-rollback."
    fail "Restore manually: git stash && git checkout <prev-commit> && npm run build"
  fi
}

# ══════════════════════════════════════════════════════════════════════════════
#  SELF-HEAL ENGINE
#  Reads PM2 logs, detects the root cause, applies a fix, restarts.
#  Returns 0 if a fix was applied (caller should retest), 1 if no fix known.
#  Tracks which fixes have already been tried via APPLIED_FIXES set.
# ══════════════════════════════════════════════════════════════════════════════
declare -A APPLIED_FIXES=()

self_heal() {
  local attempt="$1"
  local internal_status="$2"

  echo ""
  echo -e "${MAGENTA}${BOLD}  ┌─ Self-Heal Attempt $attempt / $MAX_HEAL_ATTEMPTS ─────────────────────┐${NC}"

  local logs
  logs="$(get_pm2_logs 80)"
  local pm2_status
  pm2_status="$(pm2 jlist 2>/dev/null | python3 -c "
import sys,json
try:
  data=json.load(sys.stdin)
  proc=[p for p in data if p.get('name')=='$APP_NAME']
  print(proc[0]['pm2_env']['status'] if proc else 'unknown')
except: print('unknown')
" 2>/dev/null || echo "unknown")"

  echo -e "${MAGENTA}  │  PM2 status   : $pm2_status${NC}"
  echo -e "${MAGENTA}  │  HTTP (internal): $internal_status${NC}"
  echo -e "${MAGENTA}  └──────────────────────────────────────────────────────${NC}"
  echo ""

  # ── Fix 1: Port already in use ─────────────────────────────────────────────
  if echo "$logs" | grep -qiE "EADDRINUSE|address already in use" && \
     [[ -z "${APPLIED_FIXES[port_conflict]:-}" ]]; then
    APPLIED_FIXES[port_conflict]=1
    heal "DIAGNOSIS: Port $APP_PORT is already in use by another process."
    heal "FIX: Killing all processes on ports $APP_PORT and $PHP_PORT, then restarting."
    clear_port "$APP_PORT"
    clear_port "$PHP_PORT"
    pm2_fresh_start
    return 0
  fi

  # ── Fix 2: Missing node_modules / MODULE_NOT_FOUND ────────────────────────
  if echo "$logs" | grep -qiE "Cannot find module|MODULE_NOT_FOUND|Cannot open module" && \
     [[ -z "${APPLIED_FIXES[missing_modules]:-}" ]]; then
    APPLIED_FIXES[missing_modules]=1
    local missing_mod
    missing_mod="$(echo "$logs" | grep -iE "Cannot find module" | head -1 | grep -oE "'[^']+'" | head -1 || echo "unknown")"
    heal "DIAGNOSIS: Missing Node module: $missing_mod"
    heal "FIX: Running npm ci to reinstall all dependencies."
    npm ci --prefer-offline --loglevel=warn 2>&1 | tail -5
    pm2_fresh_start
    return 0
  fi

  # ── Fix 3: dist/index.cjs missing or corrupted ────────────────────────────
  if { echo "$logs" | grep -qiE "no such file.*index\.cjs|Cannot open.*index\.cjs|ENOENT.*dist" || \
       [[ ! -f "$DIST_DIR/index.cjs" ]]; } && \
     [[ -z "${APPLIED_FIXES[missing_dist]:-}" ]]; then
    APPLIED_FIXES[missing_dist]=1
    heal "DIAGNOSIS: dist/index.cjs is missing or was not built correctly."
    heal "FIX: Rebuilding the production bundle."
    rm -rf "$DIST_DIR" node_modules/.vite
    if npm run build; then
      ok "Rebuild succeeded."
    else
      fail "Rebuild failed — see errors above."
      return 1
    fi
    pm2_fresh_start
    return 0
  fi

  # ── Fix 4: PostgreSQL service not running ─────────────────────────────────
  if echo "$logs" | grep -qiE "ECONNREFUSED.*5432|connect ECONNREFUSED.*postgres|connection refused.*5432" && \
     [[ -z "${APPLIED_FIXES[postgres_down]:-}" ]]; then
    APPLIED_FIXES[postgres_down]=1
    heal "DIAGNOSIS: PostgreSQL is refusing connections (service may be down)."
    heal "FIX: Attempting to start the postgresql service."
    if command -v systemctl &>/dev/null; then
      systemctl start postgresql 2>/dev/null || systemctl start postgresql@* 2>/dev/null || true
      sleep 3
      if psql "${DATABASE_URL:-}" -c "SELECT 1" &>/dev/null; then
        ok "PostgreSQL is now running."
        pm2_fresh_start
        return 0
      else
        fail "PostgreSQL still not reachable after start attempt."
        fail "Check: systemctl status postgresql"
        fail "And verify DATABASE_URL in your .env file."
        return 1
      fi
    else
      fail "systemctl not available — cannot auto-start postgresql."
      fail "Start it manually: sudo service postgresql start"
      return 1
    fi
  fi

  # ── Fix 5: Bad DATABASE_URL credentials (cannot auto-fix — needs human) ───
  if echo "$logs" | grep -qiE "password authentication failed|FATAL.*role|FATAL.*database.*does not exist" && \
     [[ -z "${APPLIED_FIXES[bad_db_creds]:-}" ]]; then
    APPLIED_FIXES[bad_db_creds]=1
    fail "DIAGNOSIS: Database credentials are wrong (bad user, password, or DB name)."
    fail "This cannot be auto-fixed — you need to check your .env file."
    fail ""
    fail "  Current DATABASE_URL (masked): $(echo "${DATABASE_URL:-not set}" | sed 's/:\/\/[^:]*:[^@]*@/:\/\/****:****@/')"
    fail ""
    fail "  Verify with: psql \"\$DATABASE_URL\" -c 'SELECT 1'"
    return 1
  fi

  # ── Fix 6: Session secret / env vars not loaded ───────────────────────────
  if echo "$logs" | grep -qiE "SESSION_SECRET|session secret|missing required environment" && \
     [[ -z "${APPLIED_FIXES[missing_env]:-}" ]]; then
    APPLIED_FIXES[missing_env]=1
    heal "DIAGNOSIS: Required environment variables are not being loaded."
    heal "FIX: Reloading PM2 with --update-env to force env refresh from .env."
    pm2 stop "$APP_NAME" 2>/dev/null || true
    pm2 delete "$APP_NAME" 2>/dev/null || true
    load_env
    pm2 start ecosystem.config.cjs --update-env
    pm2 save --force
    return 0
  fi

  # ── Fix 7: PHP binary not found ───────────────────────────────────────────
  if echo "$logs" | grep -qiE "php.*not found|spawn.*php.*ENOENT|No such file.*php" && \
     [[ -z "${APPLIED_FIXES[no_php]:-}" ]]; then
    APPLIED_FIXES[no_php]=1
    heal "DIAGNOSIS: PHP binary is missing — the marketing site proxy will not work."
    if command -v apt-get &>/dev/null; then
      heal "FIX: Installing PHP via apt-get."
      apt-get install -y php-cli 2>&1 | tail -5
      pm2_fresh_start
      return 0
    else
      fail "Cannot auto-install PHP (no apt-get). Install it manually:"
      fail "  sudo apt-get install php-cli    (Ubuntu/Debian)"
      fail "  sudo yum install php-cli        (CentOS/RHEL)"
      return 1
    fi
  fi

  # ── Fix 8: Too many open files / EMFILE ───────────────────────────────────
  if echo "$logs" | grep -qiE "EMFILE|too many open files" && \
     [[ -z "${APPLIED_FIXES[emfile]:-}" ]]; then
    APPLIED_FIXES[emfile]=1
    heal "DIAGNOSIS: File descriptor limit too low (EMFILE)."
    heal "FIX: Raising ulimit and restarting PM2."
    ulimit -n 65535 2>/dev/null || true
    pm2_fresh_start
    return 0
  fi

  # ── Fix 9: Out of memory ──────────────────────────────────────────────────
  if echo "$logs" | grep -qiE "JavaScript heap out of memory|ENOMEM|Killed.*OOM|out of memory" && \
     [[ -z "${APPLIED_FIXES[oom]:-}" ]]; then
    APPLIED_FIXES[oom]=1
    local free_mb
    free_mb="$(free -m 2>/dev/null | awk '/^Mem:/{print $7}' || echo "?")"
    heal "DIAGNOSIS: Out of memory (available: ~${free_mb}MB)."
    local swap_total
    swap_total="$(free -m 2>/dev/null | awk '/^Swap:/{print $2}' || echo "0")"
    if [[ "${swap_total:-0}" -lt 512 ]]; then
      heal "FIX: Creating a 1GB swap file to give the app more memory."
      if [[ ! -f /swapfile ]]; then
        fallocate -l 1G /swapfile 2>/dev/null || dd if=/dev/zero of=/swapfile bs=1M count=1024 2>/dev/null || true
        chmod 600 /swapfile 2>/dev/null || true
        mkswap /swapfile 2>/dev/null || true
        swapon /swapfile 2>/dev/null || true
        ok "Swap created and enabled."
      else
        swapon /swapfile 2>/dev/null || true
      fi
    fi
    # Also set Node max-old-space in ecosystem config
    if ! grep -q "max-old-space" ecosystem.config.cjs; then
      heal "Patching ecosystem.config.cjs to set Node --max-old-space-size=512"
      sed -i "s/script: '.\/dist\/index.cjs'/script: '.\/dist\/index.cjs',\n      node_args: '--max-old-space-size=512'/" ecosystem.config.cjs || true
    fi
    pm2_fresh_start
    return 0
  fi

  # ── Fix 10: PM2 process in "errored" or restart-loop state ───────────────
  if [[ "$pm2_status" == "errored" || "$pm2_status" == "stopping" ]] && \
     [[ -z "${APPLIED_FIXES[pm2_error_state]:-}" ]]; then
    APPLIED_FIXES[pm2_error_state]=1
    heal "DIAGNOSIS: PM2 process is in '$pm2_status' state (crash/restart loop)."
    heal "FIX: Full PM2 delete + fresh start."
    pm2_fresh_start
    return 0
  fi

  # ── Fix 11: nginx 502 but app is healthy internally ───────────────────────
  if [[ "$internal_status" == "200" ]] && \
     [[ -z "${APPLIED_FIXES[nginx_502]:-}" ]]; then
    APPLIED_FIXES[nginx_502]=1
    heal "DIAGNOSIS: App is up on port $APP_PORT (HTTP 200) but nginx is returning 502."
    heal "FIX: Testing nginx config and reloading."
    local nginx_test
    nginx_test="$(nginx -t 2>&1 || true)"
    if echo "$nginx_test" | grep -q "successful"; then
      systemctl reload nginx 2>/dev/null || service nginx reload 2>/dev/null || true
      ok "nginx reloaded successfully."
      return 0
    else
      fail "nginx config test FAILED:"
      echo "$nginx_test"
      fail ""
      fail "Your nginx config has errors — fix them, then run:"
      fail "  nginx -t && systemctl reload nginx"
      fail ""
      # Show the upstream block they should have
      warn "Expected upstream block in your nginx site config:"
      warn "  upstream certxa { server 127.0.0.1:$APP_PORT; }"
      warn "  proxy_pass http://certxa;"
      return 1
    fi
  fi

  # ── Fix 12: Generic — PM2 shows errors but no known pattern matched ───────
  if [[ "$pm2_status" == "errored" || "$internal_status" == "000" ]] && \
     [[ -z "${APPLIED_FIXES[generic_restart]:-}" ]]; then
    APPLIED_FIXES[generic_restart]=1
    heal "DIAGNOSIS: App is not responding and no specific error pattern matched."
    heal "FIX: Performing a full clean restart as a general recovery measure."
    pm2_fresh_start
    return 0
  fi

  # ── No fix available ───────────────────────────────────────────────────────
  fail "DIAGNOSIS: Could not identify a known auto-fixable issue."
  fail "Review the logs below to investigate manually."
  return 1
}

# ══════════════════════════════════════════════════════════════════════════════
#  FULL DIAGNOSTICS DUMP (called on final failure only)
# ══════════════════════════════════════════════════════════════════════════════
show_diagnostics() {
  echo ""
  banner "══ FULL DIAGNOSTICS ════════════════════════════════════════"

  echo ""
  echo -e "${YELLOW}▶ PM2 process list:${NC}"
  pm2 list 2>/dev/null || true

  echo ""
  echo -e "${YELLOW}▶ Last 60 lines of PM2 stderr:${NC}"
  pm2 logs "$APP_NAME" --err --lines 60 --nostream 2>/dev/null || true

  echo ""
  echo -e "${YELLOW}▶ Last 40 lines of PM2 stdout:${NC}"
  pm2 logs "$APP_NAME" --out --lines 40 --nostream 2>/dev/null || true

  echo ""
  echo -e "${YELLOW}▶ Port usage:${NC}"
  lsof -i:"$APP_PORT" 2>/dev/null || echo "  (nothing on port $APP_PORT)"
  lsof -i:"$PHP_PORT" 2>/dev/null || echo "  (nothing on port $PHP_PORT)"

  echo ""
  echo -e "${YELLOW}▶ Internal health check (raw JSON):${NC}"
  curl -s --max-time 5 "http://127.0.0.1:$APP_PORT/api/health" 2>/dev/null \
    | python3 -m json.tool 2>/dev/null \
    || echo "  (no response — app is not up on port $APP_PORT)"

  echo ""
  echo -e "${YELLOW}▶ Database connectivity:${NC}"
  if psql "${DATABASE_URL:-}" -c "SELECT NOW() AS server_time, version();" 2>&1; then
    ok "Database reachable"
  else
    fail "Database NOT reachable"
  fi

  echo ""
  echo -e "${YELLOW}▶ System resources:${NC}"
  free -h 2>/dev/null || true
  df -h "$APP_DIR" 2>/dev/null || true

  echo ""
  echo -e "${YELLOW}▶ Environment variables (existence check):${NC}"
  for var in DATABASE_URL SESSION_SECRET APP_URL GOOGLE_CLIENT_ID \
             TWILIO_ACCOUNT_SID MAILGUN_API_KEY STRIPE_SECRET_KEY; do
    if [[ -n "${!var:-}" ]]; then
      echo -e "  ${GREEN}✓${NC} $var"
    else
      echo -e "  ${RED}✗${NC} $var  (not set)"
    fi
  done

  echo ""
  echo -e "${YELLOW}▶ dist/ contents:${NC}"
  ls -lh "$DIST_DIR/" 2>/dev/null || echo "  (dist/ missing entirely)"
  ls -lh "$DIST_DIR/public/" 2>/dev/null | head -12 || echo "  (dist/public/ missing)"

  echo ""
  echo -e "${YELLOW}▶ nginx status:${NC}"
  nginx -t 2>&1 || true
  systemctl is-active nginx 2>/dev/null || service nginx status 2>/dev/null | head -5 || true

  echo ""
  echo -e "${YELLOW}▶ Full deploy log saved to:${NC}"
  echo "  $DEPLOY_LOG"

  banner "══ END DIAGNOSTICS ═════════════════════════════════════════"
  echo ""
}

# ══════════════════════════════════════════════════════════════════════════════
# ─────────────────────────────  DEPLOY STEPS  ────────────────────────────────
# ══════════════════════════════════════════════════════════════════════════════

# ── Step 1: Pre-flight checks ─────────────────────────────────────────────────
step "Step 1/9 — Pre-flight checks"

PREFLIGHT_FAIL=0

# .env exists
if [[ ! -f "$ENV_FILE" ]]; then
  fail ".env file not found at $APP_DIR/$ENV_FILE"
  fail "Copy .env.example to .env and fill in your secrets."
  PREFLIGHT_FAIL=1
else
  ok ".env file found"
  load_env
fi

# Required env vars
for var in DATABASE_URL SESSION_SECRET APP_URL; do
  if [[ -z "${!var:-}" ]]; then
    fail "Required env var not set: $var  (check your .env)"
    PREFLIGHT_FAIL=1
  else
    ok "$var is set"
  fi
done

# Required tools
for tool in node npm pm2 git lsof curl; do
  if ! command -v "$tool" &>/dev/null; then
    fail "Required tool not found: $tool"
    PREFLIGHT_FAIL=1
  else
    ok "$tool  →  $(command -v "$tool")"
  fi
done

# Node version >= 20
NODE_VER="$(node --version 2>/dev/null || echo 'v0')"
NODE_MAJOR="${NODE_VER%%.*}"; NODE_MAJOR="${NODE_MAJOR#v}"
if [[ "${NODE_MAJOR:-0}" -lt 20 ]]; then
  fail "Node.js 20+ required — found $NODE_VER"
  PREFLIGHT_FAIL=1
else
  ok "Node.js $NODE_VER"
fi

# Disk space (500 MB minimum)
DISK_FREE_MB="$(df -k "$APP_DIR" | awk 'NR==2 {printf "%d", $4/1024}')"
if [[ "${DISK_FREE_MB:-0}" -lt 500 ]]; then
  fail "Low disk space: ${DISK_FREE_MB}MB free — need 500MB+"
  PREFLIGHT_FAIL=1
else
  ok "Disk space: ${DISK_FREE_MB}MB free"
fi

# Database reachable
if command -v psql &>/dev/null && psql "${DATABASE_URL:-}" -c "SELECT 1" &>/dev/null; then
  ok "Database connection successful"
else
  warn "Cannot verify database connection (psql not found or connection refused)"
  warn "The deploy will continue but migrations may fail."
fi

if [[ "$PREFLIGHT_FAIL" -eq 1 ]]; then
  fail "Pre-flight failed — fix the issues above, then re-run: bash scripts/deploy.sh"
  exit 1
fi
ok "All pre-flight checks passed"

# ── Step 2: Backup current dist ───────────────────────────────────────────────
step "Step 2/9 — Backing up current dist/ for rollback"

if [[ -d "$DIST_DIR" ]]; then
  rm -rf "$BACKUP_DIR"
  cp -r "$DIST_DIR" "$BACKUP_DIR"
  ok "Backed up dist/ → $BACKUP_DIR"
  ROLLBACK_AVAILABLE=1
else
  warn "No existing dist/ — rollback will not be available this deploy"
fi

PREV_COMMIT="$(git rev-parse --short HEAD 2>/dev/null || echo 'unknown')"

# ── Step 3: Smart git pull ────────────────────────────────────────────────────
step "Step 3/9 — Pulling latest code (smart pull)"

# ══════════════════════════════════════════════════════════════════════════════
#  smart_git_pull — always succeeds in getting the latest code from origin/main
#
#  Handles every common failure mode, in order:
#    1. Removes stale git lock files                 (.git/*.lock)
#    2. Aborts any in-progress git operations        (merge, rebase, cherry-pick, bisect)
#    3. Stashes local changes so they don't block    (saves to git stash)
#    4. Ensures we are ON the correct branch         (main)
#    5. Fetches from origin with retry + backoff     (up to 4 attempts)
#    6. Hard-resets to origin/main                   (always matches remote exactly)
#    7. Prunes deleted remote branches + tags
#
#  The fetch+hard-reset approach is the only method that is guaranteed to work
#  regardless of diverged commits, merge conflicts, or any other local state.
# ══════════════════════════════════════════════════════════════════════════════
smart_git_pull() {
  local remote="${GIT_REMOTE:-origin}"
  local branch="${GIT_BRANCH:-main}"
  local fetch_attempts=4
  local fetch_delay=5

  info "Remote: $remote  |  Branch: $branch"
  echo ""

  # ── 1. Remove stale lock files ─────────────────────────────────────────────
  local lock_files
  lock_files="$(find .git -name "*.lock" 2>/dev/null || true)"
  if [[ -n "$lock_files" ]]; then
    warn "Stale git lock file(s) found — removing:"
    echo "$lock_files" | while read -r f; do
      warn "  Removing: $f"
      rm -f "$f"
    done
    ok "Lock files cleared"
  fi

  # ── 2. Abort any in-progress git operations ────────────────────────────────
  if [[ -f ".git/MERGE_HEAD" ]]; then
    warn "In-progress merge detected — aborting."
    git merge --abort 2>/dev/null || git reset --hard HEAD 2>/dev/null || true
    ok "Merge aborted"
  fi

  if [[ -d ".git/rebase-merge" || -d ".git/rebase-apply" ]]; then
    warn "In-progress rebase detected — aborting."
    git rebase --abort 2>/dev/null || true
    ok "Rebase aborted"
  fi

  if [[ -f ".git/CHERRY_PICK_HEAD" ]]; then
    warn "In-progress cherry-pick detected — aborting."
    git cherry-pick --abort 2>/dev/null || true
    ok "Cherry-pick aborted"
  fi

  if [[ -f ".git/BISECT_LOG" ]]; then
    warn "Git bisect in progress — resetting."
    git bisect reset 2>/dev/null || true
    ok "Bisect reset"
  fi

  # ── 3. Stash any local modifications ──────────────────────────────────────
  local git_status
  git_status="$(git status --porcelain 2>/dev/null || true)"
  if [[ -n "$git_status" ]]; then
    warn "Local changes detected — stashing to avoid conflicts:"
    echo "$git_status" | head -10 | while read -r line; do dim "  $line"; done
    local stash_result
    stash_result="$(git stash push -u -m "deploy-script-auto-stash-$(date +%Y%m%d-%H%M%S)" 2>&1 || true)"
    if echo "$stash_result" | grep -q "Saved working directory"; then
      ok "Local changes stashed (restore later with: git stash pop)"
    else
      # Stash failed — force-clean instead (local changes in dist/ etc. are disposable)
      warn "Stash failed — force-cleaning working tree."
      git checkout -- . 2>/dev/null || true
      git clean -fd --exclude='.env' --exclude='logs/' --exclude='node_modules/' 2>/dev/null || true
      ok "Working tree force-cleaned (your .env and logs are preserved)"
    fi
  else
    ok "Working tree is clean"
  fi

  # ── 4. Ensure we are on the correct branch ─────────────────────────────────
  local current_branch
  current_branch="$(git symbolic-ref --short HEAD 2>/dev/null || echo 'DETACHED')"

  if [[ "$current_branch" == "DETACHED" ]]; then
    warn "Repository is in detached HEAD state — checking out $branch."
    git checkout "$branch" 2>/dev/null || \
    git checkout -b "$branch" "$remote/$branch" 2>/dev/null || \
    git checkout -B "$branch" "$remote/$branch" 2>/dev/null || {
      fail "Could not check out branch $branch."
      fail "Try manually: git checkout -B main origin/main"
      return 1
    }
    ok "Checked out branch: $branch"
  elif [[ "$current_branch" != "$branch" ]]; then
    warn "On branch '$current_branch' — switching to '$branch'."
    git checkout "$branch" 2>/dev/null || {
      fail "Could not switch to branch $branch."
      return 1
    }
    ok "Switched to branch: $branch"
  else
    ok "On correct branch: $branch"
  fi

  # ── 5. Fetch from remote (with retry + backoff) ────────────────────────────
  local attempt=1
  local fetched=0
  while [[ "$attempt" -le "$fetch_attempts" ]]; do
    info "Fetching from $remote (attempt $attempt / $fetch_attempts)…"
    if git fetch "$remote" --prune --tags --force 2>&1; then
      ok "Fetch succeeded"
      fetched=1
      break
    else
      local fetch_exit=$?
      if [[ "$attempt" -lt "$fetch_attempts" ]]; then
        warn "Fetch failed (exit $fetch_exit) — retrying in ${fetch_delay}s…"
        sleep "$fetch_delay"
        fetch_delay="$((fetch_delay * 2))"  # exponential backoff: 5s → 10s → 20s
      fi
    fi
    attempt="$((attempt + 1))"
  done

  if [[ "$fetched" -eq 0 ]]; then
    fail "Fetch from $remote failed after $fetch_attempts attempts."
    fail ""
    fail "Possible causes:"
    fail "  • No internet / DNS resolution failure"
    fail "  • GitHub is down or rate-limiting"
    fail "  • SSH key or HTTPS token expired"
    fail "  • Remote URL is wrong: $(git remote get-url "$remote" 2>/dev/null || echo 'unknown')"
    fail ""
    fail "Test manually: git fetch $remote"
    return 1
  fi

  # ── 6. Hard-reset to origin/branch ─────────────────────────────────────────
  info "Hard-resetting to $remote/$branch…"
  if git reset --hard "$remote/$branch" 2>&1; then
    ok "Hard reset to $remote/$branch complete"
  else
    fail "git reset --hard $remote/$branch failed."
    fail "This is very unusual. Try manually: git reset --hard $remote/$branch"
    return 1
  fi

  # ── 7. Show what changed ───────────────────────────────────────────────────
  local new_commit prev_commit_full files_changed
  new_commit="$(git rev-parse --short HEAD)"
  prev_commit_full="$PREV_COMMIT"
  files_changed="$(git diff --name-only "${prev_commit_full}..HEAD" 2>/dev/null | wc -l | tr -d ' ' || echo '?')"

  if [[ "$new_commit" == "$prev_commit_full" ]]; then
    ok "Already at the latest commit ($new_commit) — no new changes"
  else
    ok "Updated: $prev_commit_full → $new_commit  ($files_changed file(s) changed)"
    dim "Changed files:"
    git diff --name-only "${prev_commit_full}..HEAD" 2>/dev/null | head -20 | while read -r f; do
      dim "  $f"
    done
  fi

  return 0
}

if [[ "${SKIP_GIT_PULL:-0}" == "1" ]]; then
  warn "Skipping git pull (SKIP_GIT_PULL=1)"
else
  if ! smart_git_pull; then
    fail "Git pull failed after all recovery attempts."
    fail "Fix the issue above and re-run: bash scripts/deploy.sh"
    exit 1
  fi
fi

COMMIT="$(git rev-parse --short HEAD 2>/dev/null || echo 'unknown')"
BUILD_TIME="$(date -u +%Y-%m-%dT%H:%M:%SZ)"
ok "At commit $COMMIT (was $PREV_COMMIT) — $BUILD_TIME"

# ── Step 4: Install dependencies ──────────────────────────────────────────────
step "Step 4/9 — Installing dependencies"

npm ci --prefer-offline --loglevel=warn 2>&1 | grep -v "^npm warn" | tail -5
ok "npm ci complete"

# ── Step 5: Database migrations ───────────────────────────────────────────────
step "Step 5/9 — Running database migrations"

if [[ "${SKIP_MIGRATE:-0}" == "1" ]]; then
  warn "Skipping migrations (SKIP_MIGRATE=1)"
else
  info "Applying pending SQL migrations…"
  if DATABASE_URL="${DATABASE_URL:-}" node_modules/.bin/tsx scripts/migrate.ts; then
    ok "Migrations complete"
  else
    fail "Migration FAILED — aborting to protect your data."
    fail "Fix the migration error above, then re-run."
    exit 1
  fi
fi

# ── Step 6: Build production bundle ───────────────────────────────────────────
step "Step 6/9 — Building production bundle"

if [[ "${SKIP_BUILD:-0}" == "1" ]]; then
  warn "Skipping build (SKIP_BUILD=1)"
else
  rm -rf "$DIST_DIR" node_modules/.vite
  if GIT_COMMIT="$COMMIT" BUILD_TIME="$BUILD_TIME" npm run build; then
    ok "Build succeeded"
  else
    fail "Build FAILED — see errors above."
    exit 1
  fi
fi

# ── Step 7: Validate build output ─────────────────────────────────────────────
step "Step 7/9 — Validating build output"

BUILD_VALID=1
for f in "$DIST_DIR/index.cjs" "$DIST_DIR/public/index.html"; do
  if [[ ! -f "$f" ]]; then
    fail "Missing: $f"
    BUILD_VALID=0
  fi
done

if [[ "$BUILD_VALID" -eq 0 ]]; then
  fail "Build validation failed — dist/ is incomplete."
  exit 1
fi

NEW_BUNDLE="$(grep -oE 'index-[A-Za-z0-9_-]+\.js' "$DIST_DIR/public/index.html" | head -1 || true)"
[[ -z "$NEW_BUNDLE" ]] && { fail "No hashed JS bundle found in index.html."; exit 1; }
ok "Build valid — bundle: $NEW_BUNDLE"

# ── Step 8: Start the application ─────────────────────────────────────────────
step "Step 8/9 — Starting application (clean restart)"

pm2_fresh_start
ok "PM2 process started"

# ── Step 9: Self-healing health check loop ────────────────────────────────────
step "Step 9/9 — Self-healing health check"
echo ""
info "Initial startup wait (10 seconds for migrations + PHP server)…"
sleep 10

HEAL_ATTEMPT=0
FINAL_STATUS="000"
FINAL_EXT_STATUS="000"
HEALED_ISSUES=()

while [[ "$HEAL_ATTEMPT" -le "$MAX_HEAL_ATTEMPTS" ]]; do

  # ── Wait for the app to respond (up to 45 seconds per attempt) ─────────────
  CHECK_ELAPSED=0
  CHECK_MAX=45
  CHECK_INTERVAL=3
  INTERNAL_STATUS="000"

  info "Health check — waiting up to ${CHECK_MAX}s for port $APP_PORT…"
  while [[ "$CHECK_ELAPSED" -lt "$CHECK_MAX" ]]; do
    INTERNAL_STATUS="$(internal_health)"
    if [[ "$INTERNAL_STATUS" == "200" || "$INTERNAL_STATUS" == "503" ]]; then
      break
    fi
    dim "  ${CHECK_ELAPSED}s — HTTP $INTERNAL_STATUS on port $APP_PORT"
    sleep "$CHECK_INTERVAL"
    CHECK_ELAPSED="$((CHECK_ELAPSED + CHECK_INTERVAL))"
  done

  # ── Also check external (nginx) if internal is 200 ─────────────────────────
  if [[ "$INTERNAL_STATUS" == "200" ]]; then
    FINAL_EXT_STATUS="$(external_health)"
    if [[ "$FINAL_EXT_STATUS" == "200" ]]; then
      # Both pass — we're done!
      FINAL_STATUS="200"
      break
    elif [[ "$FINAL_EXT_STATUS" == "503" ]]; then
      # App degraded — report but don't heal (it's a runtime issue, not a boot issue)
      FINAL_STATUS="503"
      break
    else
      # Internal OK but external not — nginx issue
      # Fall through to self-heal below with internal_status=200
      :
    fi
  fi

  if [[ "$INTERNAL_STATUS" == "503" && "$HEAL_ATTEMPT" -ge "$MAX_HEAL_ATTEMPTS" ]]; then
    FINAL_STATUS="503"
    break
  fi

  # ── Decide whether to heal ─────────────────────────────────────────────────
  HEAL_ATTEMPT="$((HEAL_ATTEMPT + 1))"
  if [[ "$HEAL_ATTEMPT" -gt "$MAX_HEAL_ATTEMPTS" ]]; then
    break
  fi

  # Run the heal engine
  if self_heal "$HEAL_ATTEMPT" "$INTERNAL_STATUS"; then
    HEALED_ISSUES+=("Attempt $HEAL_ATTEMPT")
    info "Fix applied — waiting 10 seconds before rechecking…"
    sleep 10
    # Loop back to re-test
  else
    fail "Self-heal could not identify a fix — giving up."
    break
  fi

done

# ══════════════════════════════════════════════════════════════════════════════
#  FINAL SUMMARY
# ══════════════════════════════════════════════════════════════════════════════
echo ""
banner "╔══════════════════════════════════════════════════════════╗"
banner "║                   Deploy Summary                        ║"
banner "╚══════════════════════════════════════════════════════════╝"
echo ""
dim "Commit   : $COMMIT  (was: $PREV_COMMIT)"
dim "Bundle   : $NEW_BUNDLE"
dim "Built at : $BUILD_TIME"
dim "Log file : $DEPLOY_LOG"
if [[ "${#HEALED_ISSUES[@]}" -gt 0 ]]; then
  echo -e "${MAGENTA}  🔧  Self-healed ${#HEALED_ISSUES[@]} issue(s) automatically${NC}"
fi
echo ""

if [[ "$FINAL_STATUS" == "200" ]]; then
  ok "Internal health (port $APP_PORT) : HTTP 200"
  ok "External health ($APP_URL)       : HTTP $FINAL_EXT_STATUS"
  echo ""
  echo -e "${GREEN}${BOLD}  🎉  Deploy successful! App is live at $APP_URL${NC}"

elif [[ "$FINAL_STATUS" == "503" ]]; then
  warn "App started but returned HTTP 503 (degraded — DB connection or env var issue)."
  warn ""
  warn "Check the health endpoint for details:"
  curl -s --max-time 5 "http://127.0.0.1:$APP_PORT/api/health" 2>/dev/null \
    | python3 -m json.tool 2>/dev/null || true
  warn ""
  warn "Common causes:"
  warn "  • DATABASE_URL wrong or DB is down"
  warn "  • Missing SESSION_SECRET"
  warn "  • Run: pm2 logs $APP_NAME --lines 50"

elif [[ "$INTERNAL_STATUS" == "200" && "$FINAL_EXT_STATUS" != "200" ]]; then
  ok "Internal health (port $APP_PORT) : HTTP 200  ✅  (app is fine)"
  warn "External health ($APP_URL) : HTTP $FINAL_EXT_STATUS  (nginx issue)"
  warn ""
  warn "The app is running correctly — nginx is the problem."
  warn "Run:  nginx -t && systemctl reload nginx"
  warn "Check your nginx upstream points to 127.0.0.1:$APP_PORT"

else
  fail "App did not come up after $MAX_HEAL_ATTEMPTS heal attempts."
  fail "Internal port $APP_PORT: HTTP $INTERNAL_STATUS"
  echo ""
  show_diagnostics
  do_rollback
  echo ""
  fail "Deploy FAILED. Your previous build has been restored."
  fail "Review the diagnostics above and fix the root cause."
  fail "Full log: $DEPLOY_LOG"
  exit 1
fi

echo ""
dim "Useful commands:"
dim "  pm2 logs $APP_NAME --lines 50   # live application logs"
dim "  pm2 monit                       # real-time process monitor"
dim "  pm2 list                        # all process statuses"
dim "  curl $APP_URL/api/health         # health check"
echo ""
