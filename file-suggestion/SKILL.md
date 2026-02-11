---
name: file-suggestion
description: |
  Custom file suggestion for Claude Code using rg + fzf. Provides fast fuzzy file matching
  with symlink support and .gitignore awareness. This skill should be used when setting up
  Claude Code's file suggestion on a new machine.
---

# File Suggestion Setup

Fast file suggestion for Claude Code using `rg` (ripgrep) and `fzf` for fuzzy matching with symlink support.

## Dependencies

Install the required CLI tools:

**macOS:**
```bash
brew install fzf ripgrep jq
```

**Linux (Debian/Ubuntu):**
```bash
sudo apt-get install -y fzf ripgrep jq
```

**Linux (Arch):**
```bash
sudo pacman -S --noconfirm fzf ripgrep jq
```

## Setup

### 1. Copy the script

Copy `scripts/file-suggestion.sh` to `~/.claude/`:

```bash
cp scripts/file-suggestion.sh ~/.claude/file-suggestion.sh
chmod +x ~/.claude/file-suggestion.sh
```

### 2. Add to settings.json

Add the following to `~/.claude/settings.json`:

```json
{
  "fileSuggestion": {
    "type": "command",
    "command": "./.claude/file-suggestion.sh"
  }
}
```

### 3. (Optional) Auto-install dependencies

To automatically install missing dependencies on session start, copy the ensure-deps script and add a SessionStart hook:

```bash
cp scripts/ensure-deps.sh ~/.claude/scripts/ensure-deps.sh
chmod +x ~/.claude/scripts/ensure-deps.sh
```

Add to the `hooks` section of `~/.claude/settings.json`:

```json
{
  "hooks": {
    "SessionStart": [
      {
        "matcher": "startup",
        "hooks": [
          {
            "type": "command",
            "command": "~/.claude/scripts/ensure-deps.sh",
            "timeout": 60
          }
        ]
      }
    ]
  }
}
```

## How It Works

- Uses `rg --files --follow --hidden` to list all files, respecting `.gitignore` and following symlinks
- Pipes through `fzf --filter` for fast fuzzy matching against the query
- Returns the top 15 matches
- Reads `CLAUDE_PROJECT_DIR` env var for project root, falls back to current directory
