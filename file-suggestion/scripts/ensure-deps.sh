#!/bin/bash
# Ensure CLI dependencies are installed on any machine

DEPS=("fzf" "ripgrep:rg" "jq")

install_if_missing() {
  local pkg="$1"
  local bin="${2:-$1}"

  command -v "$bin" &>/dev/null && return 0

  echo "Installing $pkg..."
  if command -v brew &>/dev/null; then
    brew install "$pkg" 2>/dev/null
  elif command -v apt-get &>/dev/null; then
    sudo apt-get install -y "$pkg" 2>/dev/null
  elif command -v pacman &>/dev/null; then
    sudo pacman -S --noconfirm "$pkg" 2>/dev/null
  else
    echo "Warning: Could not install $pkg - no supported package manager found"
    return 1
  fi
}

for entry in "${DEPS[@]}"; do
  pkg="${entry%%:*}"
  bin="${entry#*:}"
  install_if_missing "$pkg" "$bin"
done
