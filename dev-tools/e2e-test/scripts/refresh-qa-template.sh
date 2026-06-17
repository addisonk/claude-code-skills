#!/usr/bin/env bash
# refresh-qa-template.sh - Re-pull the canonical QA report template from the CDN
# into the skill's templates/ folder and record the fetched version.
#
# Run MANUALLY when the upstream block library changes - never during a test run.
#
# Usage: bash scripts/refresh-qa-template.sh

set -euo pipefail

SKILL_DIR="$(cd "$(dirname "$0")/.." && pwd)"
SRC="https://cdn.podist.ai/qa-artifacts/html/qa-report-blocks.html"
DEST="$SKILL_DIR/templates/qa-report-blocks.html"
MARKER="$SKILL_DIR/templates/.qa-template-version"

command -v curl >/dev/null 2>&1 || { echo "ERROR: curl is required." >&2; exit 1; }

echo "Fetching $SRC ..."
tmp="$(mktemp)"
http_code="$(curl -sS -L -o "$tmp" -w "%{http_code}" "$SRC")"
if [ "$http_code" != "200" ]; then
  rm -f "$tmp"
  echo "ERROR: fetch returned HTTP $http_code (expected 200)." >&2
  exit 1
fi

# Sanity check: it should be the QA report template, not an error page.
if ! grep -q 'id="report-data"' "$tmp"; then
  rm -f "$tmp"
  echo "ERROR: fetched file does not look like the QA report template (no report-data block)." >&2
  exit 1
fi

mv "$tmp" "$DEST"
fetched_at="$(date -u +"%Y-%m-%dT%H:%M:%SZ")"
sha="$(shasum -a 256 "$DEST" | awk '{print $1}')"
printf 'source: %s\nfetched_at: %s\nsha256: %s\n' "$SRC" "$fetched_at" "$sha" > "$MARKER"

echo "Updated $DEST"
echo "Version marker: $MARKER"
cat "$MARKER"
