#!/usr/bin/env bash
# upload-artifact.sh - Upload an e2e evidence file to S3-compatible storage and
# print its absolute public URL. Repo-agnostic: reads target from
# docs/testing/e2e-config.json (`upload` block) and credentials from env.
#
# Usage:
#   upload-artifact.sh <file> [--key <object-key>]      # upload, print public URL
#   upload-artifact.sh --verify <url> [<url> ...]        # check hosted assets return 200
#
# Config (docs/testing/e2e-config.json → upload):
#   endpoint, region, bucket, publicBase, keyPrefix
# Credentials (env only, never committed):
#   E2E_UPLOAD_ACCESS_KEY_ID, E2E_UPLOAD_SECRET_ACCESS_KEY
#
# Fails loudly (non-zero) on missing config, creds, or tooling - never a local fallback.

set -euo pipefail

die() { echo "ERROR: $*" >&2; exit 1; }

content_type_for() {
  case "${1##*.}" in
    html) echo "text/html; charset=utf-8" ;;
    png)  echo "image/png" ;;
    jpg|jpeg) echo "image/jpeg" ;;
    webp) echo "image/webp" ;;
    gif)  echo "image/gif" ;;
    mp4)  echo "video/mp4" ;;
    webm) echo "video/webm" ;;
    json) echo "application/json" ;;
    yaml|yml|log|txt|xml) echo "text/plain; charset=utf-8" ;;
    *)    echo "application/octet-stream" ;;
  esac
}

# ---- Verify mode -------------------------------------------------------------
if [ "${1:-}" = "--verify" ]; then
  shift
  [ "$#" -gt 0 ] || die "Usage: upload-artifact.sh --verify <url> [<url> ...]"
  fail=0
  for url in "$@"; do
    line=$(curl -sS -o /dev/null -w "%{http_code} %{content_type}" -I "$url" || echo "000 -")
    code=${line%% *}; ctype=${line#* }
    if [ "$code" = "200" ]; then
      echo "OK   $code  $ctype  $url"
    else
      echo "FAIL $code  $ctype  $url"; fail=1
    fi
  done
  exit "$fail"
fi

# ---- Upload mode -------------------------------------------------------------
FILE="${1:?Usage: upload-artifact.sh <file> [--key <object-key>]}"
KEY=""
shift || true
while [ "$#" -gt 0 ]; do
  case "$1" in
    --key) KEY="${2:?--key needs a value}"; shift 2 ;;
    *) die "Unknown argument: $1" ;;
  esac
done

[ -f "$FILE" ] || die "File not found: $FILE"

# Locate config: walk up from the file's dir, then cwd, looking for docs/testing/e2e-config.json
find_config() {
  local dir; dir="$(cd "$(dirname "$FILE")" && pwd)"
  while [ "$dir" != "/" ]; do
    [ -f "$dir/docs/testing/e2e-config.json" ] && { echo "$dir/docs/testing/e2e-config.json"; return; }
    [ -f "$dir/e2e-config.json" ] && { echo "$dir/e2e-config.json"; return; }
    dir="$(dirname "$dir")"
  done
  [ -f "docs/testing/e2e-config.json" ] && { echo "docs/testing/e2e-config.json"; return; }
  return 1
}

CONFIG="$(find_config || true)"
[ -n "$CONFIG" ] || die "No e2e-config.json found (looked for docs/testing/e2e-config.json). Add an 'upload' block - see references/uploader.md."

command -v node >/dev/null 2>&1 || die "node is required to read e2e-config.json."
# Extract upload.* fields; missing required fields abort.
read_cfg() { node -e '
  const c = require(process.argv[1]).upload || {};
  const k = process.argv[2];
  if (c[k] == null || c[k] === "") { process.exit(3); }
  process.stdout.write(String(c[k]));
' "$CONFIG" "$1" 2>/dev/null || die "e2e-config.json 'upload' block is missing required field: $1 (see references/uploader.md)"; }

ENDPOINT="$(read_cfg endpoint)"
BUCKET="$(read_cfg bucket)"
PUBLIC_BASE="$(read_cfg publicBase)"
REGION="$(node -e 'process.stdout.write(String((require(process.argv[1]).upload||{}).region||"auto"))' "$CONFIG")"
KEY_PREFIX="$(node -e 'process.stdout.write(String((require(process.argv[1]).upload||{}).keyPrefix||""))' "$CONFIG")"

[ -n "${E2E_UPLOAD_ACCESS_KEY_ID:-}" ] || die "E2E_UPLOAD_ACCESS_KEY_ID is not set. Export S3 credentials before uploading (see references/uploader.md)."
[ -n "${E2E_UPLOAD_SECRET_ACCESS_KEY:-}" ] || die "E2E_UPLOAD_SECRET_ACCESS_KEY is not set."
command -v aws >/dev/null 2>&1 || die "aws CLI not found. Install with 'brew install awscli' (see references/uploader.md)."

# Default key: <keyPrefix>/<feature-folder>/<basename>
if [ -z "$KEY" ]; then
  base="$(basename "$FILE")"
  feature="$(basename "$(dirname "$FILE")")"
  KEY="${KEY_PREFIX:+$KEY_PREFIX/}${feature}/${base}"
fi

CT="$(content_type_for "$FILE")"
PUBLIC_BASE="${PUBLIC_BASE%/}"

AWS_ACCESS_KEY_ID="$E2E_UPLOAD_ACCESS_KEY_ID" \
AWS_SECRET_ACCESS_KEY="$E2E_UPLOAD_SECRET_ACCESS_KEY" \
AWS_DEFAULT_REGION="$REGION" \
  aws s3 cp "$FILE" "s3://${BUCKET}/${KEY}" \
    --endpoint-url "$ENDPOINT" \
    --content-type "$CT" \
    --only-show-errors \
  || die "Upload failed for $FILE → s3://${BUCKET}/${KEY}"

echo "${PUBLIC_BASE}/${KEY}"
