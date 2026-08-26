#!/usr/bin/env bash
# full-deploy.sh — pull + frontend build + backend build + reload web stack.
source "$(dirname "$0")/_common.sh"
git_pull
# Install the nginx site config early so the web tier is correct even if a
# later step (e.g. DB migration) fails.
install_nginx_config
build_frontend
build_backend
reload_web

# End-to-end sanity: hit the API and the SPA through nginx (127.0.0.1:83).
# php-fpm can be down while the deploy "succeeds" (artisan uses CLI php), so we
# verify the actual web tier here and WARN loudly if it isn't serving.
sleep 2
api_code=$(curl -s -o /dev/null -w "%{http_code}" --max-time 10 http://127.0.0.1:83/api/products 2>/dev/null || echo 000)
spa_code=$(curl -s -o /dev/null -w "%{http_code}" --max-time 10 http://127.0.0.1:83/ 2>/dev/null || echo 000)
echo "==> Health check: API=${api_code} SPA=${spa_code}"
if [ "$api_code" != "200" ] || [ "$spa_code" != "200" ]; then
  echo "WARN: web tier not fully healthy after deploy (API=${api_code}, SPA=${spa_code})"
fi
echo "==> Full deploy complete"
