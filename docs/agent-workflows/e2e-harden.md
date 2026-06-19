# e2e-harden — E2E friction-to-durable-fix loop

A workflow for Codex agents maintaining the **`e2e-test` skill in this repo**
(`addisonk/claude-code-skills`, the skill lives at `dev-tools/e2e-test/`) while
running the onboarding e2e against the **diem/hifi** app repos. It exists because we
kept hitting the same harness friction across runs and patching it one-off. The point
is to turn each run's friction into a **permanent** fix in the skill and/or the app
repo, not a one-off.

## Purpose

Run the full **live** onboarding e2e (web desktop + web mobile + iOS, with a real
episode generated, published, and played), audit it honestly, and convert every
friction point into a durable fix at the right layer. Over iterations this drives the
harness toward snappy + near-foolproof.

The live generation (~5 min) is intended and stays. Do not "speed it up" by mocking
generation away. Optimize everything around it.

## When to use this workflow

- After an onboarding e2e run that was slow, flaky, or needed reruns/workarounds.
- When deliberately hardening the harness toward snappy + near-foolproof.
- NOT for shipping product features. NOT for a one-off screenshot (use the
  `share-screenshots` skill).

## Required context to inspect first (read it, do not assume)

- **The skill in this repo:** `dev-tools/e2e-test/` (`SKILL.md`,
  `references/expo-arm.md`, `references/web-arm.md`,
  `scripts/audit-test-folder.sh`, `templates/e2e-config.example.json`). Its critical
  rules already encode the hard-won lessons, follow them.
- **The runtime mirror:** `~/Dropbox/.agents/skills/e2e-test/`. This is the copy
  Codex actually loads at runtime. **Every skill edit must land in BOTH this and
  `dev-tools/e2e-test/`, byte-identical.** They have drifted before (the e2e-config
  template fell behind), so `diff` them after any edit.
- **The app repo where the e2e runs** (`~/Projects/diem`, or `~/Projects/hifi`):
  - `docs/testing/e2e-config.json` — pinned sim UDID, metro/serve-sim ports, reset
    deep link, baseUrl.
  - `apps/mobile/metro.config.js` — serve-sim `/.sim` preview is **already wired**
    (mounted via `config.server.enhanceMiddleware`). Do not re-add it.
  - `packages/convex/convex/users.ts` — `resetOwnOnboarding` (deterministic reset).
  - **Prior art: diem PR #1452** — the playback-fix pattern to mirror (read the
    published episode title from `published-episode.json`, reset scroll, assert that
    exact title, pinned UDID, bundle-id identity preflight before each Maestro leg).

## Exact steps to follow

1. **Preflight (gate — do not run if any check fails; report and stop).**
   - `multi_agent` active and Codex restarted (else `mode:parallel` runs serial).
   - Box **isolated**: no concurrent hifi or second diem heavy sim session.
   - Convex deployment matches the app's `EXPO_PUBLIC_CONVEX_URL` (`FunctionPathNotFound`
     = deployment drift, not a code bug).
   - Host recently rebooted (long uptime causes SpringBoard segfaults).
2. **Run + measure.** Run the e2e via the `e2e-test` skill in `mode:parallel`. Capture
   per-phase timing (preflight/dev-stack, each arm, upload) and every rerun/workaround.
3. **Audit.** Invoke the `realtalk` skill. Separate true-done from partial/workaround;
   list every friction point.
4. **Triage each finding into exactly one layer:**
   - Product bug → mark as a finding and escalate. **Never fix product code mid-run.**
   - Harness rule (generalizes) → fix in the `e2e-test` skill (both copies).
   - Repo wiring (diem/hifi-specific) → fix in that app repo.
   - Environment (machine/Codex/sim) → fix config/installer/machine-setup.
5. **Check before you change.** `grep` + Read the real target. Confirm the change does
   not already exist (serve-sim middleware already existed; do not repeat that miss).
6. **One change, written hypothesis.** Skill edits go in BOTH `dev-tools/e2e-test/`
   and `~/Dropbox/.agents/skills/e2e-test/`; `diff` to confirm identical. Validate
   edited JS/JSON (`node --check`, `JSON.parse`).
7. **Validate live on the pinned sim** (not just unit tests). Deep-link, recorder, and
   selector behavior only prove out on-device.
8. **Land it.** Commit + push. A repo fix gets a PR with live evidence linked. Append
   an iteration-log row. Repeat until a stop condition.

## Commands to run

Keep the two skill copies in sync (run after any skill edit):
```bash
diff -ru ~/Dropbox/.agents/skills/e2e-test/ dev-tools/e2e-test/    # must be empty
```

Preflight on the app-repo box:
```bash
xcrun simctl list devices booted                                   # foreign sims?
lsof -iTCP -sTCP:LISTEN | grep -E '3000|3100|3200|808[0-9]'        # foreign Metro/serve-sim?
uptime                                                              # recently rebooted?
```

iOS arm (pinned UDID + identity preflight before driving):
```bash
UDID=$(node -p "require('./docs/testing/e2e-config.json').expo.simulatorUdid")
xcrun simctl listapps "$UDID" | grep com.digg.podist                # installed here?
xcrun simctl launch "$UDID" com.digg.podist                         # foreground it
npx serve-sim -d "$UDID" --detach -q                                # open the "url", NOT :3100/stream.mjpeg
```

Validate + audit:
```bash
node --check <edited>.js
node -e "JSON.parse(require('fs').readFileSync('<edited>.json','utf8'))"
bash dev-tools/e2e-test/scripts/audit-test-folder.sh docs/testing/<feature>
```

PR / merge state (diem squash-merges; branches go BEHIND main quickly):
```bash
gh pr view <n> --repo basic-intelligence/diem --json mergeStateStatus,mergeable,state
```

## How to verify success

- **3 consecutive clean `mode:parallel` passes**, zero reruns, zero workarounds, under
  the agreed wall-clock.
- `realtalk` surfaces no buried friction.
- Evidence audit passes (`audit-test-folder.sh` on the feature folder).
- Working tree clean; only this run's sims/ports were stopped (etiquette).
- Both skill copies byte-identical (`diff` empty).

## How to handle review comments

- diem **squash-merges**, so a feature branch goes `BEHIND main` fast. Update the
  branch (or expect an admin merge) before re-requesting; check
  `gh pr view --json mergeStateStatus` first.
- Address each thread with a fixup commit and a reply stating what changed.
- For any thread about flakiness or a selector/recorder/timeout, **re-run the affected
  arm on the sim and link fresh evidence** before resolving it. Never resolve a
  flakiness thread on reasoning alone.

## What not to do

- Do not fix product code mid-run. The test produces findings; fixes are a separate,
  reviewable step.
- Do not add serve-sim middleware — it is already in the app's `apps/mobile/metro.config.js`.
- Do not point a browser at `:3100/stream.mjpeg` — open the `url` from
  `serve-sim --detach -q`. `/.sim` on the Metro origin also works.
- Do not target episodes by ordinal selector (`episode-row-first`). Target the
  published episode by title (from `published-episode.json`), after resetting scroll.
- Do not edit only one skill copy — `dev-tools/e2e-test/` and the Dropbox mirror drift.
- Do not run two heavy sim sessions on one machine — they contend for CPU/GPU/sim and
  share the same Convex deployment + test account, which corrupts onboarding state.
- Do not trust unit tests for deep-link/recorder/selector behavior; validate on-device.
- Do not `xcrun simctl erase all` / `shutdown all` or bare `serve-sim --kill`. Target a
  specific UDID/device.
- Do not assume `origin/master` (stale in diem); the integration branch is `origin/main`.

## When to stop and ask me

- Before merging any PR, especially an `--admin` override on a `BEHIND` branch.
- Product-behavior decisions (e.g. full-live vs a smoke split).
- Anything touching secrets or credentials.
- Destructive simulator or machine operations (`erase`, reboot, killing processes you
  do not own).
- When a real product bug is found (escalate the finding; do not fix it mid-run).
