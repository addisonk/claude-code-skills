#!/usr/bin/env bash
# audit-test-folder.sh - Validate completeness of an e2e test folder
#
# Usage: bash scripts/audit-test-folder.sh <test-folder-path>
# Example: bash scripts/audit-test-folder.sh docs/testing/onboarding-smoke
#
# Checks:
#   1. user-stories.md exists
#   2. Every story is checked off (pass/fail)
#   3. Every story has a recording (MANDATORY)
#   4. Every story has a screenshot (if screenshots were taken)
#   5. No orphan screenshots/recordings without a matching story
#   6. An HTML report (report.html) exists  [warns if stale test-report.md present]
#   7. Maestro flows present for iOS stories (informational)

set -euo pipefail

# --pre: pre-upload local check. Validates naming/structure/recordings/checkboxes
# on local files and treats a not-yet-built report.html as INFO, not FAIL - run it
# BEFORE uploading so naming fixes don't cost a re-upload + re-verify of every asset.
PRE=false
ARGS=()
for a in "$@"; do case "$a" in --pre) PRE=true ;; *) ARGS+=("$a") ;; esac; done
FOLDER="${ARGS[0]:?Usage: audit-test-folder.sh [--pre] <test-folder-path>}"
[ -d "$FOLDER" ] || { echo "ERROR: Folder not found: $FOLDER"; exit 1; }
[ "$PRE" = true ] && echo "(--pre: local pre-upload check; report/hosted checks skipped)"

STORIES_FILE="$FOLDER/user-stories.md"
[ -f "$STORIES_FILE" ] || { echo "ERROR: user-stories.md not found in $FOLDER"; exit 1; }

echo "=== E2E Test Folder Audit ==="
echo "Folder: $FOLDER"
echo ""

# Story labels (e.g. 1a, 2a, 3a) - supports **1a.** and plain 1a. prefixes
LABELS=$(grep -oE '\*?\*?[0-9]+[a-z]\.' "$STORIES_FILE" | sed 's/[*.]//g' | sort -u)
TOTAL_STORIES=$(echo "$LABELS" | grep -c . || true)
# iOS story labels (under the ## iOS heading) drive the Maestro-flow check
IOS_LABELS=$(awk 'tolower($0) ~ /^## *ios/{f=1;next} /^## /{f=0} f' "$STORIES_FILE" \
  | grep -oE '\*?\*?[0-9]+[a-z]\.' | sed 's/[*.]//g' | sort -u || true)
# Web story labels (under any ## Web heading) drive the Playwright-test check
WEB_LABELS=$(awk 'tolower($0) ~ /^## *web/{f=1;next} /^## /{f=0} f' "$STORIES_FILE" \
  | grep -oE '\*?\*?[0-9]+[a-z]\.' | sed 's/[*.]//g' | sort -u || true)

echo "--- Stories ---"
echo "Total stories: $TOTAL_STORIES"
echo "Labels: $(echo $LABELS | tr '\n' ' ')"
CHECKED=$(grep -cE '^\s*- \[x\]' "$STORIES_FILE" || true)
UNCHECKED=$(grep -cE '^\s*- \[ \]' "$STORIES_FILE" || true)
echo "Checked (tested): $CHECKED   Unchecked: $UNCHECKED"
echo ""

ISSUES=0
note_issue() { ISSUES=$((ISSUES + 1)); }

# --- Recordings (MANDATORY) ---
RECORDINGS=$(find "$FOLDER" -name 'recording-*.mp4' 2>/dev/null | sort || true)
REC_COUNT=$(echo "$RECORDINGS" | grep -c . || true)
echo "--- Recordings (mandatory) ---"
echo "Total recordings: $REC_COUNT"
# A label like 3a is covered by recording-3a-* OR a single group recording
# recording-3-* (one continuous clip covering 3a/3b/3c, typical for one iOS Maestro
# flow). This avoids faking per-story video copies of a single run.
MISSING_REC=""
for label in $LABELS; do
  group="${label%[a-z]}"
  echo "$RECORDINGS" | grep -qE "recording-(${label}|${group})-" || MISSING_REC="$MISSING_REC $label"
done
if [ -n "$MISSING_REC" ]; then
  echo "FAIL: Stories missing a recording (per-story or a group recording-<N>-):$MISSING_REC"; note_issue
else
  echo "OK: every story has a recording"
fi
for rec in $RECORDINGS; do
  fname=$(basename "$rec"); matched=false
  for label in $LABELS; do
    group="${label%[a-z]}"
    echo "$fname" | grep -qE "recording-(${label}|${group})-" && { matched=true; break; }
  done
  [ "$matched" = false ] && { echo "WARN: orphan recording (no matching story/group): $fname"; note_issue; }
done
echo ""

# --- Screenshots (if any taken) ---
SHOTS=$(find "$FOLDER" -name 'screenshot-*.png' 2>/dev/null | sort || true)
SHOT_COUNT=$(echo "$SHOTS" | grep -c . || true)
echo "--- Screenshots ---"
echo "Total screenshots: $SHOT_COUNT"
if [ "$SHOT_COUNT" -gt 0 ]; then
  MISSING_SHOT=""
  for label in $LABELS; do echo "$SHOTS" | grep -q "screenshot-${label}-" || MISSING_SHOT="$MISSING_SHOT $label"; done
  [ -n "$MISSING_SHOT" ] && echo "WARN: stories missing screenshots:$MISSING_SHOT" || echo "OK: all stories have screenshots"
  for s in $SHOTS; do
    fname=$(basename "$s"); matched=false
    for label in $LABELS; do echo "$fname" | grep -q "screenshot-${label}-" && { matched=true; break; }; done
    [ "$matched" = false ] && { echo "WARN: orphan screenshot: $fname"; note_issue; }
  done
fi
echo ""

# --- Maestro flows for iOS stories (informational) ---
if [ -n "$IOS_LABELS" ]; then
  echo "--- Maestro flows (iOS) ---"
  # Look in flows/ or maestro/; a label is covered by a per-label file, a group
  # file (3-*), or one shared iOS flow (ios-*) - no need for per-label symlinks.
  FLOWS=$(find "$FOLDER/flows" "$FOLDER/maestro" \( -name '*.yaml' -o -name '*.yml' \) 2>/dev/null | sort || true)
  for label in $IOS_LABELS; do
    group="${label%[a-z]}"
    if echo "$FLOWS" | grep -qE "/(${label}|${group}|ios)[-.]"; then
      echo "OK: iOS story $label has a Maestro flow (per-label, group, or one shared flow)"
    else
      echo "INFO: iOS story $label has no Maestro flow - must be flagged 'not yet regression-covered' in the report gaps block"
    fi
  done
  echo ""
fi

# --- Playwright tests for web stories (informational) ---
if [ -n "$WEB_LABELS" ]; then
  echo "--- Playwright tests (web) ---"
  SPECS=$(find "$FOLDER/specs" \( -name '*.spec.ts' -o -name '*.spec.js' \) 2>/dev/null | sort || true)
  # Covered by a per-label spec, a group spec (1-*), or one shared web spec
  # (web-*) covering several stories - no need for per-label symlinks.
  for label in $WEB_LABELS; do
    group="${label%[a-z]}"
    if echo "$SPECS" | grep -qE "/(${label}|${group}|web)[-.]"; then
      echo "OK: web story $label has a Playwright test (per-label, group, or one shared spec)"
    else
      echo "INFO: web story $label has no Playwright test - must be flagged 'not yet regression-covered' in the report gaps block"
    fi
  done
  echo ""
fi

# --- HTML report ---
echo "--- Report ---"
if [ -f "$FOLDER/report.html" ]; then
  echo "OK: report.html found"
elif [ "$PRE" = true ]; then
  echo "INFO (--pre): report.html not built yet - build + verify it after upload"
else
  echo "FAIL: report.html not found (the report must be the hosted HTML QA report)"; note_issue
fi
[ -f "$FOLDER/test-report.md" ] && echo "WARN: stale test-report.md present - the report format is now HTML (report.html); remove the markdown report"
echo ""

# --- Story completion ---
[ "$UNCHECKED" -gt 0 ] && { echo "WARN: $UNCHECKED story(ies) not checked off"; note_issue; }

echo "=== Audit Result ==="
if [ "$ISSUES" -eq 0 ]; then
  echo "PASS: all checks passed ($TOTAL_STORIES stories, $CHECKED tested, $REC_COUNT recordings)"
else
  echo "WARN: $ISSUES issue(s) found - review above"
  exit 1
fi
