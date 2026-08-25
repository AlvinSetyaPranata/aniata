#!/usr/bin/env bash
# migration.sh — apply DB migrations + refresh framework caches, then reload web.
source "$(dirname "$0")/_common.sh"
echo "==> Running migrations only"
cd "${BE_DIR}"
php artisan migrate --force
php artisan config:cache
php artisan route:cache
php artisan view:cache
reload_web
echo "==> Migration complete"
