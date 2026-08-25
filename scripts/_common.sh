#!/usr/bin/env bash
#
# Shared configuration + helpers for Aniata deploy scripts.
# Sourced by the other scripts in this directory; not run directly.

set -euo pipefail

# --- Targets on the VPS ---
DEPLOY_DIR="/home/ubuntu/aniata"
BRANCH="main"
FE_DIR="${DEPLOY_DIR}/frontend"
BE_DIR="${DEPLOY_DIR}/backend"

# Pull latest, discarding any local drift in the working tree.
git_pull() {
  echo "==> Pulling origin/${BRANCH}"
  cd "${DEPLOY_DIR}"
  git fetch origin "${BRANCH}"
  git reset --hard "origin/${BRANCH}"
}

# Install deps, build the Vite bundle, and (re)start under pm2.
build_frontend() {
  echo "==> Building frontend"
  cd "${FE_DIR}"
  npm ci
  npm run build

  echo "==> Restarting frontend (pm2)"
  if pm2 describe aniata-fe > /dev/null 2>&1; then
    pm2 restart aniata-fe
  else
    pm2 start ecosystem.config.cjs
  fi
  pm2 save
}

# Production deps + migrations + framework caches.
build_backend() {
  echo "==> Building backend"
  cd "${BE_DIR}"
  composer install --no-dev --optimize-autoloader --no-interaction
  php artisan migrate --force
  php artisan config:cache
  php artisan route:cache
  php artisan view:cache
}

# Reload the web stack (nginx + php-fpm).
reload_web() {
  echo "==> Reloading web stack"
  sudo systemctl reload nginx || sudo systemctl restart nginx
  sudo systemctl restart php8.3-fpm || sudo systemctl restart php-fpm || true
}
