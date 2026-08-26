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

# Resolve the active php-fpm version. The box may have several PHP versions
# installed (/etc/php/8.1, /etc/php/8.3, ...); `ls /etc/php | head -n1` would
# pick the wrong (lowest) one and point nginx at a non-existent socket -> 502.
# Prefer the version whose php-fpm is actually listening, then the active CLI
# php (the one Laravel's artisan uses), then fall back to /etc/php.
php_fpm_ver() {
  local v
  v=$(sudo ss -xln 2>/dev/null | grep -oP 'php\K[0-9.]+(?=-fpm\.sock)' | head -n1)
  [ -z "$v" ] && v=$(php -r 'echo PHP_MAJOR_VERSION.".".PHP_MINOR_VERSION;' 2>/dev/null)
  [ -z "$v" ] && v=$(ls /etc/php 2>/dev/null | head -n1)
  echo "$v"
}

# Install the nginx site config (Aniata SPA on :3001 + /api -> php-fpm),
# served alongside any existing app already bound to :80/:443.
install_nginx_config() {
  echo "==> Installing nginx site config"
  local src="${DEPLOY_DIR}/scripts/aniata.nginx.conf"
  local avail="/etc/nginx/sites-available/aniata"
  local domain="${APP_DOMAIN:-$(hostname)}"
  # The php-fpm socket name is versioned (/run/php/phpX.Y-fpm.sock); resolve it
  # from the installed PHP version instead of hardcoding 8.3.
  local php_ver sock
  php_ver=$(php_fpm_ver)
  sock="/run/php/php${php_ver}-fpm.sock"
  echo "    php-fpm socket: ${sock:-<unknown>}"
  # The stock default site listens on :80, which is already taken by the
  # existing app on this box. Drop it so our nginx only binds :83.
  sudo rm -f /etc/nginx/sites-enabled/default
  sudo cp "${src}" "${avail}"
  sudo sed -i "s/__APP_DOMAIN__/${domain}/g" "${avail}"
  sudo sed -i "s#__PHP_FPM_SOCK__#${sock}#g" "${avail}"
  # Verify the placeholder was actually replaced; otherwise nginx would try to
  # connect to a literal file named __PHP_FPM_SOCK__ and 502. Fail loudly.
  if grep -q '__PHP_FPM_SOCK__' "${avail}"; then
    echo "ERROR: php-fpm socket placeholder not substituted (sock='${sock}')" >&2
    exit 1
  fi
  sudo ln -sf "${avail}" /etc/nginx/sites-enabled/aniata
  sudo nginx -t
}

# Install deps, build the Vite bundle, and (re)start under pm2.
build_frontend() {
  echo "==> Building frontend"
  cd "${FE_DIR}"
  # Production must talk to the API same-origin (nginx proxies /api -> php-fpm).
  export VITE_API_URL="${VITE_API_URL:-/api}"
  # Seller WhatsApp number (digits, country code, no +) and store name used by the
  # checkout "send order to WhatsApp" flow. Override per host via environment.
  export VITE_WHATSAPP_NUMBER="${VITE_WHATSAPP_NUMBER:-6281234567890}"
  export VITE_STORE_NAME="${VITE_STORE_NAME:-Aniata}"
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
  local php_ver sock
  php_ver=$(php_fpm_ver)
  sock="/run/php/php${php_ver}-fpm.sock"

  # nginx now runs as ubuntu; its temp/proxy dirs are still owned by www-data,
  # so workers can't buffer upstream responses (e.g. SPA assets) -> 403/blank
  # page. Hand the whole temp tree to ubuntu.
  if [ -d /var/lib/nginx ]; then
    sudo chown -R ubuntu:ubuntu /var/lib/nginx
  fi

  # php-fpm pool files live under a versioned dir (/etc/php/X.Y/fpm/pool.d);
  # edit every one we find so we don't depend on a hardcoded PHP version.
  local pool
  for pool in /etc/php/*/fpm/pool.d/www.conf; do
    [ -f "$pool" ] || continue
    echo "    patching ${pool}"
    # Run the worker as ubuntu (so it can read app files under /home/ubuntu)...
    sudo sed -i 's/^user = .*/user = ubuntu/; s/^group = .*/group = ubuntu/' "$pool"
    # ...and make the FastCGI listen socket owned by ubuntu too, otherwise the
    # nginx worker (also ubuntu) gets EACCES on connect -> 502. The listen.*
    # lines may be commented out by default, so strip a leading ';' if present.
    sudo sed -i 's/^;*listen.owner = .*/listen.owner = ubuntu/; s/^;*listen.group = .*/listen.group = ubuntu/; s/^;*listen.mode = .*/listen.mode = 0660/' "$pool"
  done

  # Restart the php-fpm service — resolve the actual unit name instead of
  # guessing php8.3-fpm (which may not exist on this box). systemctl restart
  # can report non-zero in CI (Type=notify quirk) even when the service is
  # actually up, so we verify the real state instead of trusting the exit code.
  local fpm_unit
  fpm_unit=$(systemctl list-unit-files --type=service --no-legend --no-pager 2>/dev/null \
    | awk '{print $1}' | grep -E '^php[0-9.]*-fpm\.service$' | head -n1)
  if [ -n "$fpm_unit" ]; then
    sudo systemctl restart "$fpm_unit" 2>&1 || true
  else
    sudo systemctl restart php-fpm 2>&1 || true
  fi
  if systemctl is-active --quiet "${fpm_unit:-php-fpm}"; then
    echo "    ${fpm_unit:-php-fpm} is active"
  else
    echo "    WARN: ${fpm_unit:-php-fpm} not active after restart:"
    sudo systemctl status "${fpm_unit:-php-fpm}" --no-pager || true
  fi

  # is-active can be true while the listener is gone (stale socket -> 502).
  # Verify php-fpm is actually listening on its socket before we declare success.
  local i listening=0
  for i in 1 2 3 4 5; do
    if sudo ss -xln 2>/dev/null | grep -q "php${php_ver}-fpm.sock" \
       || pgrep -f "php-fpm${php_ver}" >/dev/null 2>&1; then
      listening=1
      echo "    php-fpm listening on ${sock}"
      break
    fi
    sleep 1
  done
  if [ "$listening" -eq 0 ]; then
    echo "    WARN: ${fpm_unit:-php-fpm} not listening after restart (stale socket -> 502 likely)"
    sudo systemctl status "${fpm_unit:-php-fpm}" --no-pager || true
  fi

  # Sanity: the php-fpm MASTER is always root; the worker (which does the
  # file stat) runs as the pool user. Inspect a non-root worker, not the master.
  local worker_user
  worker_user=$(ps -o user= -C "php-fpm${php_ver}" --no-headers 2>/dev/null | grep -v root | head -n1 | tr -d ' ')
  if [ -n "$worker_user" ]; then
    echo "    php-fpm worker running as: ${worker_user} (want: ubuntu)"
  else
    echo "    WARN: could not find a non-root php-fpm worker; verify the pool user"
  fi

  # Sanity: nginx worker user (the one doing try_files stat()).
  local nginx_user
  nginx_user=$(grep -E '^[[:space:]]*user[[:space:]]+' /etc/nginx/nginx.conf 2>/dev/null | awk '{print $2}' | tr -d ';')
  echo "    nginx worker configured as: ${nginx_user:-<unset>} (want: ubuntu)"
}

# Reload the web stack (nginx + php-fpm).
reload_web() {
  echo "==> Reloading web stack"
  ensure_permissions

  # A full restart (not reload) is required for the nginx 'user' directive to
  # take effect. As with php-fpm, systemctl can return non-zero in CI even when
  # the service is actually up, so verify the real active state.
  echo "==> Restarting nginx"
  sudo systemctl restart nginx 2>&1 || true
  if systemctl is-active --quiet nginx; then
    echo "    nginx is active"
  else
    echo "ERROR: nginx not active after restart:" >&2
    sudo systemctl status nginx --no-pager || true
    exit 1
  fi

  local fpm_unit
  fpm_unit=$(systemctl list-unit-files --type=service --no-legend --no-pager 2>/dev/null \
    | awk '{print $1}' | grep -E '^php[0-9.]*-fpm\.service$' | head -n1)
  if [ -n "$fpm_unit" ]; then
    echo "==> Restarting ${fpm_unit}"
    if ! sudo systemctl restart "$fpm_unit"; then
      echo "ERROR: ${fpm_unit} failed to restart:" >&2
      sudo systemctl status "$fpm_unit" --no-pager || true
      exit 1
    fi
  fi
}

# Install the site config once, then reload. Safe to call on every deploy.
install_and_reload_web() {
  install_nginx_config
  reload_web
}
