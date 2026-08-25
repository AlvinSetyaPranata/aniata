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
echo "==> Full deploy complete"
