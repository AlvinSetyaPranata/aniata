#!/usr/bin/env bash
# fe-only-deploy.sh — pull + both frontend builds + nginx + pm2 restart (no backend changes).
source "$(dirname "$0")/_common.sh"
git_pull
install_nginx_config
build_frontend
build_admin
echo "==> Frontend-only deploy complete"
