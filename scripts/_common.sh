#!/usr/bin/env bash
#
# Shared configuration + helpers for Aniata deploy scripts.
# Sourced by the other scripts in this directory; not run directly.

set -euo pipefail

# Non-interactive SSH shells don't source profiles, so node/npm/pm2 (often
# installed via nvm) may be off PATH. Load them explicitly.
export NVM_DIR="${NVM_DIR:-$HOME/.nvm}"
if [ -s "$NVM_DIR/nvm.sh" ]; then
  source "$NVM_DIR/nvm.sh"
fi
export PATH="$HOME/.local/bin:$HOME/.npm-global/bin:/usr/local/bin:/usr/bin:$PATH"

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

# Install the nginx site config (Aniata SPA on :3001 + /api -> php-fpm),
# served alongside any existing app already bound to :80/:443.
install_nginx_config() {
  echo "==> Installing nginx site config"
  local src="${DEPLOY_DIR}/scripts/aniata.nginx.conf"
  local avail="/etc/nginx/sites-available/aniata"
  local domain="${APP_DOMAIN:-$(hostname)}"
  # The stock default site listens on :80, which is already taken by the
  # existing app on this box. Drop it so our nginx only binds :83.
  sudo rm -f /etc/nginx/sites-enabled/default
  sudo cp "${src}" "${avail}"
  sudo sed -i "s/__APP_DOMAIN__/${domain}/g" "${avail}"
  sudo ln -sf "${avail}" /etc/nginx/sites-enabled/aniata
  sudo nginx -t
}

# Install deps, build the Vite bundle, and (re)start under pm2.
build_frontend() {
  echo "==> Building frontend"
  cd "${FE_DIR}"
  # Production must talk to the API same-origin (nginx proxies /api -> php-fpm).
  export VITE_API_URL="${VITE_API_URL:-/api}"
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

# Ensure the app's DB role can create tables/sequences (Postgres 15+ revokes
# CREATE on public by default). Idempotent; warns but does not abort if it
# can't (e.g. managed DB without superuser shell access).
grant_db_privileges() {
  echo "==> Ensuring DB privileges for ${DB_USERNAME}"
  local sql="GRANT CREATE, USAGE ON SCHEMA public TO \"${DB_USERNAME}\"; \
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO \"${DB_USERNAME}\"; \
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO \"${DB_USERNAME}\";"
  sudo -u postgres psql -d "${DB_DATABASE}" -c "${sql}" \
    || echo "WARN: could not apply DB grants automatically; apply them manually"
}

# Production deps + migrations + framework caches.
build_backend() {
  echo "==> Building backend"
  cd "${BE_DIR}"
  set -a; [ -f .env ] && source .env; set +a
  grant_db_privileges
  composer install --no-dev --optimize-autoloader --no-interaction
  php artisan migrate --force
  php artisan db:seed --force
  php artisan config:cache
  php artisan route:cache
  php artisan view:cache
}

# Align nginx + php-fpm to the deploy user so they can read/write the app
# files (which are owned by ubuntu and live under its home dir).
ensure_permissions() {
  echo "==> Aligning web-service users to deploy user (ubuntu)"
  sudo sed -i 's/^user .*;/user ubuntu;/' /etc/nginx/nginx.conf
  if [ -f /etc/php/8.3/fpm/pool.d/www.conf ]; then
    sudo sed -i 's/^user = .*/user = ubuntu/; s/^group = .*/group = ubuntu/' /etc/php/8.3/fpm/pool.d/www.conf
  fi
  sudo systemctl restart php8.3-fpm || sudo systemctl restart php-fpm || true
}

# Reload the web stack (nginx + php-fpm).
reload_web() {
  echo "==> Reloading web stack"
  ensure_permissions
  sudo systemctl reload-or-restart nginx
  sudo systemctl restart php8.3-fpm || sudo systemctl restart php-fpm || true
}

# Install the site config once, then reload. Safe to call on every deploy.
install_and_reload_web() {
  install_nginx_config
  reload_web
}
