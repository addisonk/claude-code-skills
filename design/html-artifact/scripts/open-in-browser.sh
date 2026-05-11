#!/usr/bin/env bash
# Open an HTML artifact in the system default browser.
# Usage: open-in-browser.sh <path-to-html>

set -euo pipefail

if [[ $# -lt 1 ]]; then
  echo "usage: $(basename "$0") <path-to-html>" >&2
  exit 64
fi

path="$1"

if [[ ! -f "$path" ]]; then
  echo "error: file not found: $path" >&2
  exit 66
fi

# Resolve to an absolute path so the browser is unambiguous.
abs="$(cd "$(dirname "$path")" && pwd)/$(basename "$path")"

case "$(uname -s)" in
  Darwin)
    open "$abs"
    ;;
  Linux)
    if command -v xdg-open >/dev/null 2>&1; then
      xdg-open "$abs"
    elif command -v gnome-open >/dev/null 2>&1; then
      gnome-open "$abs"
    else
      echo "error: no opener found (install xdg-utils)" >&2
      exit 69
    fi
    ;;
  MINGW*|MSYS*|CYGWIN*)
    start "" "$abs"
    ;;
  *)
    echo "error: unsupported OS: $(uname -s)" >&2
    exit 69
    ;;
esac

echo "Opened: $abs"
