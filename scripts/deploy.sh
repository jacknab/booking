#!/usr/bin/env bash
#
# Clean deploy script for VPS.
#
# Usage:
#   bash scripts/deploy.sh                  # default: pm2 restart all
#   RESTART_CMD="systemctl restart myapp" bash scripts/deploy.sh
#   SKIP_GIT_PULL=1 bash scripts/deploy.sh  # don't run git pull
#
set -euo pipefail

cd "$(dirname "$0")/.."
APP_DIR="$(pwd)"
echo "==> Deploying from: $APP_DIR"

if [[ "${SKIP_GIT_PULL:-0}" != "1" ]]; then
  echo "==> Pulling latest code"
  git pull --ff-only
fi

COMMIT="$(git rev-parse --short HEAD)"
BUILD_TIME="$(date -u +%Y-%m-%dT%H:%M:%SZ)"
echo "==> Commit:     $COMMIT"
echo "==> Build time: $BUILD_TIME"

echo "==> Removing stale build artifacts"
rm -rf dist node_modules/.vite

echo "==> Installing dependencies (npm ci)"
npm ci

echo "==> Building production bundle"
GIT_COMMIT="$COMMIT" BUILD_TIME="$BUILD_TIME" npm run build

NEW_HASH="$(grep -oE 'index-[A-Za-z0-9_-]+\.js' dist/public/index.html | head -n1 || true)"
if [[ -z "$NEW_HASH" ]]; then
  echo "!! Could not find a hashed index-*.js in dist/public/index.html"
  echo "!! Build may have failed. Aborting."
  exit 1
fi
echo "==> New bundle: $NEW_HASH"

echo "==> Verifying built bundle (build:check)"
npm run build:check

RESTART_CMD="${RESTART_CMD:-pm2 restart all}"
echo "==> Restarting service: $RESTART_CMD"
eval "$RESTART_CMD"

echo ""
echo "==> Done."
echo "    Bundle hash: $NEW_HASH"
echo "    Verify at:   curl https://YOUR-DOMAIN/api/version"
echo ""
echo "    If your browser still loads the old hash, also clear your"
echo "    reverse-proxy cache (e.g. nginx) and Cloudflare cache."
