#!/usr/bin/env bash
# realtalk deterministic sweep. Run from the repo the task worked in:
#   bash scripts/checks.sh
# Context-free checks only; the agent layers PR-merge checks + self-report on top.
# Never fails the shell — it reports, it doesn't gate.
set +e

hr() { printf '\n### %s\n' "$1"; }

hr "git working tree"
if git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
  echo "branch: $(git symbolic-ref --short HEAD 2>/dev/null || echo 'DETACHED') @ $(git rev-parse --short HEAD 2>/dev/null)"
  porc=$(git status --porcelain)
  echo "dirty files: $(printf '%s' "$porc" | grep -c .)"
  printf '%s\n' "$porc" | sed '/^$/d' | head -30
  echo "stashes: $(git stash list 2>/dev/null | wc -l | tr -d ' ')"
  git stash list 2>/dev/null | head -5
  echo "vs upstream (left=behind right=ahead): $(git rev-list --left-right --count '@{u}...HEAD' 2>/dev/null || echo 'no upstream set')"
else
  echo "(cwd is not a git repo)"
fi

hr "worktrees + recent branches"
git worktree list 2>/dev/null
echo "recent local branches:"
git branch --sort=-committerdate 2>/dev/null | head -10

hr "stray artifacts outside the repo (common spots)"
found=0
for d in "$HOME/.codex/worktrees/docs" "$HOME/.codex/worktrees/apps" "$HOME/.codex/worktrees/packages"; do
  [ -e "$d" ] && { echo "  present (likely misplaced): $d"; found=1; }
done
# recently-modified scratch files in /tmp from this session (<2h old)
ls -dt /tmp/*e2e* /tmp/*preflight* /tmp/*-env.sh 2>/dev/null | head -10 | sed 's/^/  tmp: /' && found=1
[ "$found" = 0 ] && echo "  (none in common spots — still check any absolute path the task used)"

hr "leftover running processes / sessions"
echo "listening dev ports:"
lsof -nP -iTCP -sTCP:LISTEN 2>/dev/null | grep -E ':(3000|3001|3100|3200|3310|4000|5173|8080|8081|8787|9323)\b' | head -15 || echo "  (none on common dev ports)"
echo "booted simulators:"
xcrun simctl list devices booted 2>/dev/null | grep -i 'booted' | head || echo "  (none / no xcrun)"
echo "agent-browser sessions:"
command -v agent-browser >/dev/null 2>&1 && agent-browser session list 2>/dev/null | head || echo "  (agent-browser not on PATH)"
echo "serve-sim streams:"
npx --no-install serve-sim --list 2>/dev/null | head || echo "  (none / not installed)"
echo "dev-server processes:"
ps -axo pid,command 2>/dev/null | grep -E 'next dev|expo start|metro|convex dev|trigger.*dev|turbo (dev|run dev)|vite' | grep -v grep | head -10 || echo "  (none)"

printf '\n### done — now run the PR-merge checks (gh pr view) and the self-report (Step 2).\n'
