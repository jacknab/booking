#!/usr/bin/env bash
# =============================================================================
#  deploy.sh — Certxa Self-Healing VPS Deploy Script
#
#  Usage:
#    bash scripts/deploy.sh                    # full deploy
#    bash scripts/deploy.sh --nginx-only       # audit + repair nginx only, no deploy
#    bash scripts/deploy.sh --db-check         # audit + repair DB schema only, no deploy
#    bash scripts/deploy.sh --db-migrate       # run pending migrations only, no deploy
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
#      • Missing DB tables / columns  → re-run migrations automatically, restart
#      • PM2 process in error/loop    → full delete + fresh start
#      • nginx 502 (app OK internally)→ full nginx audit + repair + reload
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
#  NGINX AUDIT & AUTO-REPAIR
#
#  Knows about both Certxa nginx configs:
#    nginx/certxa.conf      → Node.js app  (port __APP_PORT__, domain __DOMAIN__)
#    nginx/certxa-php.conf  → PHP site     (port 8422, certxa.com hard-coded)
#
#  Checks (and auto-fixes) in order:
#    1.  nginx is installed
#    2.  Both source configs exist in project nginx/ directory
#    3.  certxa-php.conf is installed + enabled in sites-available/enabled
#    4.  certxa.conf is installed + enabled (placeholders substituted)
#    5.  Installed configs point to the correct ports (patches if stale)
#    6.  SSL cert paths exist (suggests alternatives if not)
#    7.  No duplicate limit_req_zone names between the two files
#    8.  nginx -t passes
#    9.  nginx reloaded
#
#  Returns 0 if nginx is healthy (or was successfully fixed), 1 otherwise.
# ══════════════════════════════════════════════════════════════════════════════
NGINX_SITES_AVAIL="/etc/nginx/sites-available"
NGINX_SITES_ENABLED="/etc/nginx/sites-enabled"
NGINX_CONF_NODE="certxa"             # installed name for Node.js config
NGINX_CONF_PHP="certxa-php.conf"     # installed name for PHP config

check_and_fix_nginx() {
  local fixed_something=0
  local domain
  domain="$(echo "${APP_URL:-https://certxa.com}" | sed 's|https\?://||;s|/.*||')"

  echo ""
  echo -e "${CYAN}${BOLD}  ┌─ nginx Audit ──────────────────────────────────────────┐${NC}"
  echo -e "${CYAN}  │  Node config : $NGINX_CONF_NODE${NC}"
  echo -e "${CYAN}  │  PHP config  : $NGINX_CONF_PHP${NC}"
  echo -e "${CYAN}  │  Domain      : $domain${NC}"
  echo -e "${CYAN}  │  App port    : $APP_PORT${NC}"
  echo -e "${CYAN}  └────────────────────────────────────────────────────────${NC}"
  echo ""

  # ── 1. nginx installed? ──────────────────────────────────────────────────────
  if ! command -v nginx &>/dev/null; then
    fail "nginx is not installed."
    if command -v apt-get &>/dev/null; then
      heal "FIX: Installing nginx via apt-get."
      apt-get install -y nginx 2>&1 | tail -5
      systemctl enable nginx 2>/dev/null || true
      systemctl start nginx 2>/dev/null || true
      fixed_something=1
    else
      fail "Cannot auto-install nginx (no apt-get). Install manually."
      return 1
    fi
  else
    ok "nginx is installed: $(nginx -v 2>&1 | head -1)"
  fi

  # ── 2. Source configs exist in project? ─────────────────────────────────────
  local src_node="$APP_DIR/nginx/certxa.conf"
  local src_php="$APP_DIR/nginx/certxa-php.conf"

  if [[ ! -f "$src_node" ]]; then
    fail "Source config not found: $src_node"
    fail "Make sure nginx/certxa.conf exists in the project repo."
    return 1
  fi
  if [[ ! -f "$src_php" ]]; then
    fail "Source config not found: $src_php"
    fail "Make sure nginx/certxa-php.conf exists in the project repo."
    return 1
  fi
  ok "Source configs found in project nginx/"

  # ── 3. Install certxa-php.conf (PHP marketing site) ─────────────────────────
  local dst_php="$NGINX_SITES_AVAIL/$NGINX_CONF_PHP"
  local link_php="$NGINX_SITES_ENABLED/$NGINX_CONF_PHP"

  _nginx_install_php_config() {
    heal "Installing $NGINX_CONF_PHP → $dst_php"
    cp "$src_php" "$dst_php"
    chmod 644 "$dst_php"

    # Check if SSL cert path is correct; try to find the real one if not
    local cert_path
    cert_path="$(grep -m1 'ssl_certificate ' "$dst_php" | awk '{print $2}' | tr -d ';')"
    if [[ -n "$cert_path" && ! -f "$cert_path" ]]; then
      warn "SSL cert not found at: $cert_path"
      # Try common alternative cert locations
      local alt_cert=""
      for candidate in \
        "/etc/letsencrypt/live/certxa.com/fullchain.pem" \
        "/etc/letsencrypt/live/certxa.com-0001/fullchain.pem" \
        "/etc/letsencrypt/live/www.certxa.com/fullchain.pem"; do
        if [[ -f "$candidate" ]]; then
          alt_cert="$candidate"
          break
        fi
      done

      if [[ -n "$alt_cert" ]]; then
        local alt_dir
        alt_dir="$(dirname "$alt_cert")"
        heal "FIX: Updating SSL cert paths in $NGINX_CONF_PHP to use: $alt_dir"
        local orig_cert_dir
        orig_cert_dir="$(grep -m1 'ssl_certificate ' "$src_php" | awk '{print $2}' | tr -d ';' | xargs dirname)"
        sed -i "s|$orig_cert_dir|$alt_dir|g" "$dst_php"
        ok "SSL cert paths updated → $alt_dir"
      else
        warn "Could not find an SSL cert for certxa.com under /etc/letsencrypt/live/"
        warn "Run:  certbot --nginx -d certxa.com -d www.certxa.com"
        warn "The config has been installed but nginx will not start until SSL is set up."
      fi
    else
      ok "SSL cert path verified: $cert_path"
    fi
    fixed_something=1
  }

  if [[ ! -f "$dst_php" ]]; then
    _nginx_install_php_config
  else
    ok "$NGINX_CONF_PHP exists in sites-available"
  fi

  # Symlink in sites-enabled
  if [[ ! -L "$link_php" ]]; then
    heal "Enabling $NGINX_CONF_PHP (creating symlink in sites-enabled)"
    ln -sf "$dst_php" "$link_php"
    ok "Symlink created: $link_php → $dst_php"
    fixed_something=1
  else
    ok "$NGINX_CONF_PHP is enabled (symlink exists)"
  fi

  # ── 4. Install certxa (Node.js app) ─────────────────────────────────────────
  local dst_node="$NGINX_SITES_AVAIL/$NGINX_CONF_NODE"
  local link_node="$NGINX_SITES_ENABLED/$NGINX_CONF_NODE"

  _nginx_install_node_config() {
    heal "Installing $NGINX_CONF_NODE → $dst_node"
    sed "s/__DOMAIN__/$domain/g; s/__APP_PORT__/$APP_PORT/g" "$src_node" > "$dst_node"
    chmod 644 "$dst_node"

    # Remove limit_req_zone lines from certxa.conf to avoid duplicates if
    # certxa-php.conf is loaded in the same nginx process. The zones are only
    # needed once — we keep them only if certxa-php.conf is NOT enabled.
    if [[ -L "$link_php" ]]; then
      # Both configs active — remove limit_req_zone from certxa.conf to avoid
      # "duplicate zone" errors (certxa-php.conf does not define them, so this
      # is safe to keep in certxa.conf; no removal needed currently).
      # Reserved for future-proofing if certxa-php.conf ever adds rate zones.
      :
    fi

    # SSL cert check for Node config
    local cert_path
    cert_path="$(grep -m1 'ssl_certificate ' "$dst_node" | awk '{print $2}' | tr -d ';')"
    if [[ -n "$cert_path" && ! -f "$cert_path" ]]; then
      warn "SSL cert not found at: $cert_path"
      for candidate in \
        "/etc/letsencrypt/live/$domain/fullchain.pem" \
        "/etc/letsencrypt/live/${domain}-0001/fullchain.pem"; do
        if [[ -f "$candidate" ]]; then
          local alt_dir
          alt_dir="$(dirname "$candidate")"
          heal "FIX: Updating SSL cert paths in $NGINX_CONF_NODE to: $alt_dir"
          sed -i "s|/etc/letsencrypt/live/$domain|$alt_dir|g" "$dst_node"
          ok "SSL cert paths updated → $alt_dir"
          break
        fi
      done
      if [[ -n "$cert_path" && ! -f "$cert_path" ]]; then
        warn "No SSL cert found for $domain under /etc/letsencrypt/live/"
        warn "Run:  certbot --nginx -d $domain"
      fi
    else
      [[ -n "$cert_path" ]] && ok "SSL cert path verified: $cert_path"
    fi
    fixed_something=1
  }

  if [[ ! -f "$dst_node" ]]; then
    _nginx_install_node_config
  else
    ok "$NGINX_CONF_NODE exists in sites-available"

    # ── 4a. Check port is correct in installed config ─────────────────────────
    local installed_port
    installed_port="$(grep -oP '127\.0\.0\.1:\K\d+' "$dst_node" | sort -u | head -1 || true)"
    if [[ -n "$installed_port" && "$installed_port" != "$APP_PORT" ]]; then
      warn "Installed $NGINX_CONF_NODE routes to port $installed_port but app runs on $APP_PORT."
      heal "FIX: Patching port in $dst_node ($installed_port → $APP_PORT)"
      sed -i "s/127\.0\.0\.1:$installed_port/127.0.0.1:$APP_PORT/g" "$dst_node"
      ok "Port updated: $installed_port → $APP_PORT"
      fixed_something=1
    else
      ok "$NGINX_CONF_NODE correctly points to port $APP_PORT"
    fi

    # ── 4b. Check domain is correct ───────────────────────────────────────────
    if grep -q "__DOMAIN__" "$dst_node"; then
      warn "Installed $NGINX_CONF_NODE still has __DOMAIN__ placeholder."
      heal "FIX: Substituting __DOMAIN__ → $domain"
      sed -i "s/__DOMAIN__/$domain/g" "$dst_node"
      ok "Domain placeholder replaced with: $domain"
      fixed_something=1
    fi

    # ── 4c. Check __APP_PORT__ placeholder ───────────────────────────────────
    if grep -q "__APP_PORT__" "$dst_node"; then
      warn "Installed $NGINX_CONF_NODE still has __APP_PORT__ placeholder."
      heal "FIX: Substituting __APP_PORT__ → $APP_PORT"
      sed -i "s/__APP_PORT__/$APP_PORT/g" "$dst_node"
      ok "Port placeholder replaced with: $APP_PORT"
      fixed_something=1
    fi
  fi

  # Symlink in sites-enabled
  if [[ ! -L "$link_node" ]]; then
    heal "Enabling $NGINX_CONF_NODE (creating symlink in sites-enabled)"
    ln -sf "$dst_node" "$link_node"
    ok "Symlink created: $link_node → $dst_node"
    fixed_something=1
  else
    ok "$NGINX_CONF_NODE is enabled (symlink exists)"
  fi

  # ── 5. Check for duplicate limit_req_zone names ──────────────────────────────
  local all_zones
  all_zones="$(grep -h 'limit_req_zone' "$NGINX_SITES_ENABLED"/* 2>/dev/null | \
               grep -oP 'zone=\K[^:]+' | sort | uniq -d || true)"
  if [[ -n "$all_zones" ]]; then
    warn "Duplicate limit_req_zone names found: $all_zones"
    warn "This causes nginx to fail with 'duplicate zone' errors."
    heal "FIX: Removing duplicate zone definitions from $dst_node"
    for zone in $all_zones; do
      sed -i "/limit_req_zone.*zone=${zone}:/d" "$dst_node" 2>/dev/null || true
    done
    ok "Duplicate zones removed from $NGINX_CONF_NODE"
    fixed_something=1
  else
    ok "No duplicate limit_req_zone names"
  fi

  # ── 6. Remove default nginx site if it conflicts ──────────────────────────────
  if [[ -L "$NGINX_SITES_ENABLED/default" ]]; then
    local default_names
    default_names="$(grep -h 'server_name' "$NGINX_SITES_AVAIL/default" 2>/dev/null | head -3 || true)"
    # Only remove if it catches all hosts (server_name _ or server_name localhost)
    if grep -qE 'server_name\s+(_|localhost)\s*;' "$NGINX_SITES_AVAIL/default" 2>/dev/null; then
      warn "Default nginx site is enabled and may conflict."
      heal "FIX: Disabling default site (unlinking $NGINX_SITES_ENABLED/default)"
      rm -f "$NGINX_SITES_ENABLED/default"
      ok "Default site disabled"
      fixed_something=1
    fi
  fi

  # ── 7. Test nginx config ──────────────────────────────────────────────────────
  echo ""
  info "Running nginx -t to validate configuration…"
  local nginx_test_output
  nginx_test_output="$(nginx -t 2>&1 || true)"

  if echo "$nginx_test_output" | grep -q "test is successful"; then
    ok "nginx config test passed"
  else
    fail "nginx config test FAILED:"
    echo "$nginx_test_output"
    echo ""

    # Try to auto-fix common nginx -t errors
    # Missing include files (options-ssl-nginx.conf, ssl-dhparams.pem)
    if echo "$nginx_test_output" | grep -q "options-ssl-nginx.conf"; then
      heal "FIX: /etc/letsencrypt/options-ssl-nginx.conf is missing."
      if command -v certbot &>/dev/null; then
        heal "Running certbot to restore Let's Encrypt nginx options…"
        certbot --nginx --reinstall -d "$domain" --non-interactive 2>&1 | tail -10 || true
      else
        fail "certbot not installed. Install it: sudo snap install certbot --classic"
      fi
    fi

    if echo "$nginx_test_output" | grep -q "ssl-dhparams.pem"; then
      heal "FIX: /etc/letsencrypt/ssl-dhparams.pem is missing — generating…"
      openssl dhparam -out /etc/letsencrypt/ssl-dhparams.pem 2048 2>&1 | tail -5 || true
      fixed_something=1
    fi

    # Re-test after fixes
    nginx_test_output="$(nginx -t 2>&1 || true)"
    if echo "$nginx_test_output" | grep -q "test is successful"; then
      ok "nginx config test passed after auto-fix"
    else
      fail "nginx config still failing after auto-fix attempts."
      fail "Review errors above and fix manually, then run: nginx -t && systemctl reload nginx"
      return 1
    fi
  fi

  # ── 8. Reload nginx ──────────────────────────────────────────────────────────
  info "Reloading nginx…"
  if systemctl reload nginx 2>/dev/null || service nginx reload 2>/dev/null; then
    ok "nginx reloaded successfully"
  else
    warn "Reload failed — attempting restart instead."
    systemctl restart nginx 2>/dev/null || service nginx restart 2>/dev/null || {
      fail "nginx restart also failed."
      return 1
    }
    ok "nginx restarted successfully"
  fi

  if [[ "$fixed_something" -eq 1 ]]; then
    heal "nginx audit complete — issues were detected and fixed automatically."
  else
    ok "nginx audit complete — both configs are correctly installed and active."
  fi

  return 0
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
    heal "FIX: Running full nginx audit and repair (both certxa + certxa-php.conf)."
    if check_and_fix_nginx; then
      return 0
    else
      return 1
    fi
  fi

  # ── Fix 12: Missing DB tables or columns ──────────────────────────────────
  # Catches PostgreSQL errors like:
  #   ERROR: relation "X" does not exist  (missing table)
  #   ERROR: column "X" does not exist    (missing column)
  #   42P01 / 42703                       (PostgreSQL error codes)
  if echo "$logs" | grep -qiE \
       'relation "[^"]*" does not exist|column "[^"]*" does not exist|ERROR.*42P01|ERROR.*42703|table "[^"]*" does not exist|column [a-z_]+ of relation' && \
     [[ -z "${APPLIED_FIXES[db_schema]:-}" ]]; then
    APPLIED_FIXES[db_schema]=1

    # Extract the offending object name for the message
    local missing_obj
    missing_obj="$(echo "$logs" | grep -oiE \
      '(relation|column|table) "[^"]+"' | head -1 || echo "unknown")"

    heal "DIAGNOSIS: Database schema mismatch — $missing_obj does not exist."
    heal "FIX: Running database migrations to create missing tables/columns."

    if check_db_schema; then
      ok "Schema repaired — restarting app."
      pm2_fresh_start
      return 0
    else
      fail "Schema repair failed — migrations could not fix the problem."
      fail "You may need to write a new migration file."
      fail "  touch migrations/\$(date +%Y%m%d_%H%M%S)_fix_missing_schema.sql"
      fail "  # Add the missing CREATE TABLE / ALTER TABLE SQL, then re-run deploy."
      return 1
    fi
  fi

  # ── Fix 13: Generic — PM2 shows errors but no known pattern matched ───────
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
#  DATABASE SCHEMA AUDIT & AUTO-REPAIR
#
#  Checks that all core tables exist and re-runs migrations if any are missing.
#  Also detects missing columns reported in PM2 logs and patches via migrations.
#
#  Core tables checked:
#    users, locations, staff, appointments, services, clients, categories,
#    business_hours, schema_migrations
#
#  Returns 0 if schema is healthy (or was fixed), 1 if migration failed.
# ══════════════════════════════════════════════════════════════════════════════

# Core tables required for the app to function
REQUIRED_TABLES=(
  users locations staff appointments services clients
  categories business_hours schema_migrations
)

check_db_schema() {
  local db_url="${DATABASE_URL:-}"
  local ran_migration=0

  echo ""
  echo -e "${CYAN}${BOLD}  ┌─ Database Schema Audit ─────────────────────────────────┐${NC}"
  echo -e "${CYAN}  │  Checking ${#REQUIRED_TABLES[@]} required tables…${NC}"
  echo -e "${CYAN}  └─────────────────────────────────────────────────────────${NC}"
  echo ""

  # ── Require DATABASE_URL ─────────────────────────────────────────────────────
  if [[ -z "$db_url" ]]; then
    fail "DATABASE_URL is not set — cannot audit DB schema."
    fail "Make sure .env is loaded and DATABASE_URL is defined."
    return 1
  fi

  # ── Can we reach the database? ───────────────────────────────────────────────
  if ! psql "$db_url" -c "SELECT 1" &>/dev/null 2>&1; then
    fail "Cannot connect to database: $db_url"
    fail "Is PostgreSQL running?  sudo systemctl start postgresql"
    return 1
  fi
  ok "Database connection: OK"

  # ── Query existing tables ─────────────────────────────────────────────────────
  local existing_tables
  existing_tables="$(psql "$db_url" -t -A -c \
    "SELECT table_name FROM information_schema.tables \
     WHERE table_schema = 'public'" 2>/dev/null || true)"

  # ── Find missing tables ───────────────────────────────────────────────────────
  local missing_tables=()
  for tbl in "${REQUIRED_TABLES[@]}"; do
    if ! echo "$existing_tables" | grep -qx "$tbl"; then
      missing_tables+=("$tbl")
    fi
  done

  if [[ "${#missing_tables[@]}" -eq 0 ]]; then
    ok "Schema: all ${#REQUIRED_TABLES[@]} required tables are present"

    # Even when tables exist, check pending migrations and apply them
    info "Checking for unapplied migrations…"
    local pending_count
    pending_count="$(DATABASE_URL="$db_url" \
      node_modules/.bin/tsx scripts/migrate.ts --dry-run 2>/dev/null \
      | grep -c 'pending\|would apply' || echo "0")"

    if [[ "${pending_count:-0}" -gt 0 ]]; then
      heal "Found $pending_count pending migration(s) — applying now."
      if DATABASE_URL="$db_url" node_modules/.bin/tsx scripts/migrate.ts; then
        ok "Pending migrations applied"
        ran_migration=1
      else
        fail "Migration run failed — check migrate.ts output above."
        return 1
      fi
    else
      ok "Migrations: database is up to date"
    fi

    return 0
  fi

  # ── Auto-fix: run migrations ──────────────────────────────────────────────────
  warn "Missing table(s): ${missing_tables[*]}"
  heal "FIX: Re-running all pending migrations to create missing tables…"

  if DATABASE_URL="$db_url" node_modules/.bin/tsx scripts/migrate.ts; then
    ok "Migrations applied successfully"
    ran_migration=1
  else
    fail "Migration failed — see output above."
    fail "Common causes:"
    fail "  • DATABASE_URL has wrong credentials"
    fail "  • PostgreSQL user lacks CREATE TABLE permission"
    fail "  • A migration file has a syntax error"
    fail ""
    fail "Check: psql \"\$DATABASE_URL\" -c 'SELECT NOW()'"
    return 1
  fi

  # ── Re-verify after migration ─────────────────────────────────────────────────
  existing_tables="$(psql "$db_url" -t -A -c \
    "SELECT table_name FROM information_schema.tables \
     WHERE table_schema = 'public'" 2>/dev/null || true)"

  local still_missing=()
  for tbl in "${missing_tables[@]}"; do
    if ! echo "$existing_tables" | grep -qx "$tbl"; then
      still_missing+=("$tbl")
    fi
  done

  if [[ "${#still_missing[@]}" -eq 0 ]]; then
    ok "All missing tables have been created: ${missing_tables[*]}"

    # List all tables now present for visibility
    info "Current public tables:"
    echo "$existing_tables" | sort | while read -r t; do
      [[ -n "$t" ]] && dim "  $t"
    done
    return 0
  else
    fail "Still missing after migration: ${still_missing[*]}"
    fail ""
    fail "These tables are not created by any migration file."
    fail "You may need to write a new migration:"
    fail "  touch migrations/$(date +%Y%m%d_%H%M%S)_add_missing_tables.sql"
    return 1
  fi
}

# ══════════════════════════════════════════════════════════════════════════════
#  STANDALONE FLAG HANDLING
#  --nginx-only  → audit + repair nginx, then exit  (no deploy)
#  --db-check    → audit + repair DB schema, then exit  (no deploy)
#  --db-migrate  → load .env and run pending migrations, then exit  (no deploy)
# ══════════════════════════════════════════════════════════════════════════════
DEPLOY_FLAG="${1:-}"

if [[ "$DEPLOY_FLAG" == "--nginx-only" ]]; then
  step "nginx-only mode — auditing and repairing nginx"
  load_env
  if check_and_fix_nginx; then
    echo ""
    ok "nginx audit complete."
  else
    echo ""
    fail "nginx audit finished with errors — see output above."
    exit 1
  fi
  exit 0
fi

if [[ "$DEPLOY_FLAG" == "--db-check" ]]; then
  step "db-check mode — auditing and repairing database schema"
  load_env
  if check_db_schema; then
    echo ""
    ok "Database schema audit complete."
  else
    echo ""
    fail "Database schema audit finished with errors — see output above."
    exit 1
  fi
  exit 0
fi

if [[ "$DEPLOY_FLAG" == "--db-migrate" ]]; then
  step "db-migrate mode — running pending migrations"
  load_env
  if [[ -z "${DATABASE_URL:-}" ]]; then
    fail "DATABASE_URL is not set in .env"
    exit 1
  fi
  info "Applying pending migrations against: $(echo "${DATABASE_URL}" | sed 's/:\/\/[^:]*:[^@]*@/:\/\/****:****@/')"
  if DATABASE_URL="${DATABASE_URL}" node_modules/.bin/tsx scripts/migrate.ts; then
    echo ""
    ok "Migrations complete."
  else
    echo ""
    fail "Migration failed — see output above."
    exit 1
  fi
  exit 0
fi

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

# NODE_ENV=production (loaded from .env) causes npm to skip devDependencies,
# which means tsx, esbuild, vite and other build tools never get installed.
# Override it to development for this step only so ALL dependencies are installed.
NODE_ENV=development npm ci --prefer-offline --loglevel=warn 2>&1 | grep -v "^npm warn" | tail -5
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
  echo ""
  heal "App is healthy — the problem is nginx. Running full nginx audit…"
  if check_and_fix_nginx; then
    # Re-test external after nginx fix
    sleep 2
    RECHECK="$(external_health)"
    if [[ "$RECHECK" == "200" ]]; then
      echo ""
      echo -e "${GREEN}${BOLD}  🎉  nginx fixed! App is now fully live at $APP_URL${NC}"
    else
      warn "nginx was repaired but external check still returned HTTP $RECHECK."
      warn "This may be a DNS propagation delay or SSL cert issue."
      warn "Try again in 30 seconds: curl -I $APP_URL/api/health"
    fi
  else
    warn "Automatic nginx repair could not fully resolve the issue."
    warn "See the nginx audit output above for what to fix manually."
  fi

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
