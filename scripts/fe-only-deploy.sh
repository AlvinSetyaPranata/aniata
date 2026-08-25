#!/usr/bin/env bash
# fe-only-deploy.sh — pull + frontend build + pm2 restart (no backend changes).
source "$(dirname "$0")/_common.sh"
git_pull
build_frontend
echo "==> Frontend-only deploy complete"
