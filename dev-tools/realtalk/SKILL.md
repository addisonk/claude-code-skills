---
name: realtalk
description: Post-task reality audit. Runs concrete checks (git status, whether the session's PRs actually merged, files/artifacts left outside the repo, stray branches/worktrees, leftover dev servers/sims/browser sessions) AND forces disclosure of the friction agents normally bury — work that looks done but isn't, workarounds used instead of real fixes, guessed or inferred evidence, deviations from the request, unverified claims — then emits a severity-ranked report with prioritized follow-ups. Use when an agent (or you) just finished a task and you want the real story instead of the victory-lap summary, when you want to verify an "it's merged / tests pass / it's done" claim before trusting it, or to audit a pasted task transcript. Triggers on "/realtalk", "real talk", "what really happened", "audit this run", "what did you actually leave".
---

# realtalk

The tidy "done!" summary hides the friction. `realtalk` surfaces it: **verify what actually happened, then disclose what got buried.** Don't take the agent's word for it (the whole problem is agents don't volunteer their mess), run the checks.

## When to run
- Right after an agent finishes a coding task, or against a pasted transcript.
- Before trusting any "it's merged / tests pass / it's done / it's clean" claim.

## Step 1 — Active checks (verify, don't ask)

Run `scripts/checks.sh` from each repo the task touched for the deterministic sweep (working tree, stashes, worktrees, stray artifacts, listening dev ports, booted sims, agent-browser/serve-sim sessions, dev-server processes). Report exact results, not vibes.

Then add the checks the script can't infer:

- **PRs vs reality (the headline check).** For every PR the task touched: `gh pr view <n> --json state,mergedAt,mergeStateStatus`. **OPEN ≠ merged.** A fix that "looks done" but sits on an unmerged branch is the #1 thing this skill exists to catch. Cross-check every "merged / landed / on main" claim against the PR state and `git log origin/main`.
- **Squash-merge gotcha:** a squash-merged branch shows as *un*-merged by `git branch --merged`. Trust the PR's `mergedAt`, not commit ancestry.
- **Task-specific paths:** any absolute path the task wrote to outside the cwd repo (the script checks common spots; you know the task's).

## Step 2 — Self-report (introspect the session/transcript)

Bullets. Write "none" if genuinely empty — never pad.

1. **Not actually done** — looks finished but isn't: unmerged fixes, "passing with caveats", skipped steps. Name the branch/PR.
2. **Workarounds & hacks** — worked around vs fixed (inline sanitizing, tool fallbacks, hardcoded paths, retrying to get green). For each: the proper fix you skipped.
3. **Guesses & assumptions** — inferred, not verified; evidence or labels assigned by inference (e.g. mapping files by duration). Flag what could be wrong.
4. **Deviations** — where you diverged from the request/plan, and why.
5. **Unverified claims** — anything you stated but didn't actually confirm.

## Step 3 — Emit the report

Severity-ranked and skimmable:

- 🔴 **Broken / not done** — fix before trusting (e.g. "PostHog fix is OPEN as PR #1384, not on main").
- 🟡 **Fragile / guessed** — could be wrong; verify (e.g. "video→story labels assigned by duration guess").
- 🟠 **Mess / cleanup** — leftovers with **exact paths/PIDs** (e.g. "artifacts at ~/.codex/worktrees/docs/…; metro still on :8081").
- 🔵 **Notes** — tooling gaps, minor.

End with **Follow-ups for you** — concrete human actions in priority order (merge X, clean path Y, fix root cause Z).

**Rule:** one ugly truth beats a clean summary that hides it. If a check couldn't run, say so — never skip it silently.
