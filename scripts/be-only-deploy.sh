#!/usr/bin/env bash
# be-only-deploy.sh — pull + backend build + reload web stack (no frontend).
source "$(dirname "$0")/_common.sh"
git_pull
build_backend
install_and_reload_web
echo "==> Backend-only deploy complete"
