#!/usr/bin/env bash
# upload-artifact.sh - thin wrapper around upload-artifact.mjs (dependency-free
# node S3/R2 uploader). Kept so existing references to the .sh keep working.
#
# Usage:
#   upload-artifact.sh <file> [--key <object-key>]   # upload, print public URL
#   upload-artifact.sh --verify <url> [<url> ...]     # check hosted assets return 200
#
# Target + creds come from R2_* env (R2_ENDPOINT, R2_BUCKET, R2_PUBLIC_URL,
# R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY), e.g. injected by Claude Code from
# ~/.claude/settings.json. Optional per-project override: docs/testing/e2e-config.json
# -> upload {}. See references/uploader.md.
set -euo pipefail
command -v node >/dev/null 2>&1 || { echo "ERROR: node is required to run the uploader." >&2; exit 1; }
exec node "$(cd "$(dirname "$0")" && pwd)/upload-artifact.mjs" "$@"
