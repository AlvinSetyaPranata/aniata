#!/usr/bin/env bash
#
# deployment.sh — top-level entry point.
# Usage: ./deployment.sh [full|fe|be|migrate]   (defaults to: full)
#
# Delegates to the matching script in this directory.

MODE="${1:-full}"
SELF_DIR="$(cd "$(dirname "$0")" && pwd)"

case "${MODE}" in
  full)    bash "${SELF_DIR}/full-deploy.sh" ;;
  fe)      bash "${SELF_DIR}/fe-only-deploy.sh" ;;
  be)      bash "${SELF_DIR}/be-only-deploy.sh" ;;
  migrate) bash "${SELF_DIR}/migration.sh" ;;
  *)       echo "Unknown mode: ${MODE} (use: full|fe|be|migrate)"; exit 1 ;;
esac
