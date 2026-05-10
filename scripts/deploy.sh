#!/usr/bin/env bash
# =============================================================================
#  deploy.sh — Certxa VPS deploy script
#
#  Usage:
#    bash scripts/deploy.sh              # full deploy (pull → build → reload)
#    SKIP_GIT_PULL=1 bash scripts/deploy.sh   # skip git pull (e.g. after manual push)
#
#  What it does:
#    1. Pulls latest code from git
#    2. Installs / updates dependencies
#    3. Builds the production bundle
#    4. Clears any processes stuck on the app ports
#    5. Reloads PM2 with zero-downtime (reload, not restart)
#    6. Prints a health check summary
# =============================================================================
set -euo pipefail

# ── Resolve project root ──────────────────────────────────────────────────────
cd "$(dirname "$0")/.."
APP_DIR="$(pwd)"
APP_NAME="${PM2_APP_NAME:-certxa}"
APP_PORT="${PORT:-8100}"
PHP_PORT="${PHP_PORT:-8104}"

echo ""
echo "╔══════════════════════════════════════════════════════╗"
echo "║              Certxa — VPS Deploy Script              ║"
echo "╚══════════════════════════════════════════════════════╝"
echo ""
echo "  App dir : $APP_DIR"
echo "  App name: $APP_NAME (PM2)"
echo "  Port    : $APP_PORT"
echo ""

# ── 1. Pull latest code ───────────────────────────────────────────────────────
if [[ "${SKIP_GIT_PULL:-0}" != "1" ]]; then
  echo "▶ Step 1/5 — Pulling latest code"
  git pull --ff-only
else
  echo "▶ Step 1/5 — Skipping git pull (SKIP_GIT_PULL=1)"
fi

COMMIT="$(git rev-parse --short HEAD)"
BUILD_TIME="$(date -u +%Y-%m-%dT%H:%M:%SZ)"
echo "  Commit:     $COMMIT"
echo "  Build time: $BUILD_TIME"
echo ""

# ── 2. Install dependencies ───────────────────────────────────────────────────
echo "▶ Step 2/5 — Installing dependencies"
npm ci --prefer-offline 2>&1 | tail -3
echo ""

# ── 3. Build production bundle ────────────────────────────────────────────────
echo "▶ Step 3/5 — Building production bundle"
rm -rf dist node_modules/.vite
GIT_COMMIT="$COMMIT" BUILD_TIME="$BUILD_TIME" npm run build

NEW_BUNDLE="$(grep -oE 'index-[A-Za-z0-9_-]+\.js' dist/public/index.html | head -n1 || true)"
if [[ -z "$NEW_BUNDLE" ]]; then
  echo ""
  echo "  ERROR: Could not find a hashed index-*.js in dist/public/index.html"
  echo "  The build may have failed. Aborting to avoid serving a broken app."
  exit 1
fi
echo "  New bundle: $NEW_BUNDLE"
echo ""

# ── 4. Free up ports (in case a previous crash left processes behind) ─────────
echo "▶ Step 4/5 — Clearing ports $APP_PORT and $PHP_PORT"
for PORT_TO_CLEAR in "$APP_PORT" "$PHP_PORT"; do
  PIDS="$(lsof -t -i:"$PORT_TO_CLEAR" 2>/dev/null || true)"
  if [[ -n "$PIDS" ]]; then
    echo "  Killing stale process(es) on port $PORT_TO_CLEAR: $PIDS"
    kill -9 $PIDS 2>/dev/null || true
    sleep 1
  else
    echo "  Port $PORT_TO_CLEAR is free"
  fi
done
echo ""

# ── 5. Reload PM2 ────────────────────────────────────────────────────────────
echo "▶ Step 5/5 — Reloading PM2 ($APP_NAME)"

if pm2 describe "$APP_NAME" > /dev/null 2>&1; then
  pm2 reload ecosystem.config.cjs --update-env
else
  echo "  App not found in PM2 — starting fresh"
  pm2 start ecosystem.config.cjs
fi

pm2 save
echo ""

# ── Health check ──────────────────────────────────────────────────────────────
echo "  Waiting 4 seconds for app to come up..."
sleep 4

APP_URL="${APP_URL:-https://certxa.com}"
HTTP_STATUS="$(curl -s -o /dev/null -w "%{http_code}" --max-time 10 "$APP_URL/api/health" || echo "failed")"

echo ""
echo "╔══════════════════════════════════════════════════════╗"
echo "║                   Deploy Complete                    ║"
echo "╚══════════════════════════════════════════════════════╝"
echo ""
echo "  Commit    : $COMMIT"
echo "  Bundle    : $NEW_BUNDLE"
echo "  Health    : $APP_URL/api/health → HTTP $HTTP_STATUS"
echo ""

if [[ "$HTTP_STATUS" == "200" ]]; then
  echo "  ✅ App is healthy and serving traffic."
elif [[ "$HTTP_STATUS" == "503" ]]; then
  echo "  ⚠️  App started but health check returned 503 (check env vars or DB)."
  echo "     Run: pm2 logs $APP_NAME --lines 30"
else
  echo "  ❌ Health check failed (HTTP $HTTP_STATUS). Check PM2 logs:"
  echo "     pm2 logs $APP_NAME --lines 30"
fi

echo ""
