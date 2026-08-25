#!/usr/bin/env bash
# be-only-deploy.sh — pull + backend build + reload web stack (no frontend).
source "$(dirname "$0")/_common.sh"
git_pull
install_nginx_config
build_backend
reload_web
echo "==> Backend-only deploy complete"
