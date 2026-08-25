#!/usr/bin/env bash
# full-deploy.sh — pull + frontend build + backend build + reload web stack.
source "$(dirname "$0")/_common.sh"
git_pull
build_frontend
build_backend
reload_web
echo "==> Full deploy complete"
