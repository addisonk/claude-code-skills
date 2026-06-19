---
name: e2e-test
description: End-to-end testing across web desktop, web mobile, and Expo iOS, producing a shareable hosted HTML QA report. Web is driven with agent-browser; Expo iOS is driven with Maestro (semantic) plus serve-sim (gestures), with screen recordings via simctl. Use when you need to write user stories, run e2e/browser/simulator tests, verify a feature end-to-end, or produce a QA evidence report. Triggers on "e2e test", "browser test", "mobile test", "ios test", "test the app", "write user stories", "verify feature", "QA report".
---

# E2E Test

Write user stories for a feature, verify them across web desktop, web mobile, and (when an Expo app exists) iOS simulator, then publish a hosted HTML QA report.

One spine runs every platform: **stories → test → evidence → report → audit.** Only the "drive the app" step differs:

Every story produces a **rerunnable regression asset** plus a **recording**; the exploratory driver is just the agent's eyes/hands for the live walkthrough.

| Platform | Exploratory walkthrough | Rerunnable regression asset | Recording |
|----------|------------------------|-----------------------------|-----------|
| Web desktop | agent-browser (`snapshot -i`, `find`) | **Playwright test** (`.spec.ts`) | screen recording |
| Web mobile | agent-browser (`set device`) | **Playwright test** (mobile viewport) | screen recording |
| Expo iOS | serve-sim (coordinate gestures) | **Maestro flow** (`.yaml`) | `simctl` screen recording |

Web: agent-browser walks the flow live; you author a Playwright test as the kept regression asset. See [web-arm.md](references/web-arm.md). iOS: serve-sim streams the simulator as an MJPEG video (**not** a DOM, so agent-browser's semantic locators don't work on it); Maestro is the semantic driver + regression asset, and recordings come from `xcrun simctl io ... recordVideo`. See [expo-arm.md](references/expo-arm.md). Either arm allows an exploratory-only escape hatch (recording, no scripted asset) for stories too awkward to script - flag those in `gaps` as "not yet regression-covered".

## Script & file paths

1. This SKILL.md's directory is `SKILL_DIR`.
2. Scripts: `${SKILL_DIR}/scripts/<name>.sh` · Templates (incl. filled example reports): `${SKILL_DIR}/templates/` · References: `${SKILL_DIR}/references/`

## Critical rules (always enforced)

- **If something needed is missing: bootstrap what a repo script can fix, stop and instruct for the rest - never hack around, fake, or give up.** First run the repo's own setup script for fresh-worktree deps (`node scripts/setup-codex-worktree.mjs`, else `pnpm install`; see Setup). For what a repo script can't provide - system tools, credentials, a running dev server, a test account - halt that step and tell the user exactly what to add and the command to add it. Never fabricate or placeholder evidence, silently skip a story, or downgrade the output to route around the gap. A real report reflects only what actually ran; anything blocked or unverifiable goes in the `gaps` block with the reason.
- **A failing story is a finding, not a stop. Test observes; it never fixes product code mid-run and never halts on the first bug.** When a story fails, capture the evidence (screenshot, log, repro), mark it failed in `flow-results`, and **continue** - a QA sweep's value is the full picture, so one bug must not abort the rest. If a failure blocks downstream stories, mark those `blocked` (not silently skipped). Only *harness* friction (env, tooling, a flaky driver) may be worked around to keep testing - never the product code under test, and disclose every workaround. Fixing discovered bugs is a separate, opt-in, reviewable step (Step 10), the run **produces findings, it does not patch the app.**
- **The report is a hosted HTML QA report, never markdown.** Build it by copying the closest example template and editing only its `report-data` JSON (Step 7). See [report-blocks.md](references/report-blocks.md).
- **Always upload evidence to CDN.** Every screenshot, MP4, log, Maestro report/YAML, and the report HTML uploads via `scripts/upload-artifact.sh` (dependency-free node; reads `R2_*` env for endpoint/bucket/public URL + creds). The report references absolute CDN URLs only - never `file://` or local paths. Missing `R2_*` env → **fail loudly** and point the user to `~/.claude/settings.json`; never fall back to local. See [uploader.md](references/uploader.md).
- **Five report blocks are mandatory:** `report` header, `verdict`, `flow-results`, a `recording` per story, and `gaps`. Everything else renders only when real evidence exists.
- **A screen recording is mandatory for every story; one continuous recording may cover a story group run in a single flow.** Web stories record per-test (Playwright). A single iOS Maestro flow that walks 3a/3b/3c in one session is **one** recording named for the group (`recording-3-...`), never copied into fake per-story files. Likewise a shared Playwright spec / Maestro flow can cover several stories (`specs/web-...`, `maestro/ios-...`); the audit accepts group/shared coverage, so never pad with per-label symlinks.
- **Screenshot every screen, not just once per story.** The `userflows` block is the screen-by-screen sequence: capture a screenshot at *each distinct screen/state* the flow passes through (every navigation, form step, picker, modal, confirmation, result) and put them all in `userflows`. A 6-screen onboarding flow yields ~6 frames, not 1 - that screen-by-screen trail is the whole point of a userflow.
- **Wait for the screen to settle before each screenshot - never shoot on a fixed timer or right after a tap/navigation.** A frame captured mid-load is blank/spinner/half-rendered evidence. Gate every screenshot on the screen's *anchor element being visible*: web - agent-browser `wait --text "<anchor>"` (or a locator) / Playwright `await expect(anchor).toBeVisible()` (auto-waits); iOS - Maestro `assertVisible: "<anchor>"` then `waitForAnimationToEnd` before `takeScreenshot`/`simctl io screenshot`. Both Playwright locators and Maestro `assertVisible`/`tapOn` auto-wait with retry, lean on that, **never `waitForTimeout`/`sleep`**. See [web-arm.md](references/web-arm.md), [expo-arm.md](references/expo-arm.md), and the `playwright-best-practices` (`assertions-waiting.md`) + `maestro-e2e` (`rules/advanced/waiting.md`) skills.
- **Multi-app simulator etiquette:** target a specific simulator UDID/device name and a dedicated serve-sim/Metro port. Never run global simulator-erase or kill-all. Before stopping any simulator/Metro/serve-sim process, identify the owning app + port. See [expo-arm.md](references/expo-arm.md).
- **Web driver: agent-browser, or the Codex `@browser` skill when running in Codex - never the user's real Chrome.** Drive a headless/sandboxed automation browser. If `agent-browser` isn't on PATH (common in Codex), use Codex's `@browser` plugin instead of falling back to the user's interactive Chrome. Never open a real desktop Chrome to drive the app or to view a serve-sim preview - iOS screenshots come from `xcrun simctl io ... screenshot`, not a browser.
- **Pin a fixed desktop resolution - never let the host display decide it.** Before any web-desktop capture, explicitly set the viewport to a fixed size (default **1440×900**, or `defaults.viewport` from `e2e-config.json`): `agent-browser set viewport 1440 900` for the walkthrough **and** `test.use({ viewport: { width: 1440, height: 900 } })` in the Playwright spec. Odd or HiDPI host resolutions otherwise clip desktop screenshots and make frames inconsistent across machines; a pinned viewport keeps every frame the same size and uncropped. `reload` after setting it (and re-apply after auth redirects), and start recording only once it's stable.
- **Mobile web:** close the desktop session, open fresh, `set device`, `reload` before auth; re-apply device + reload after auth redirects; start recording only after viewport is stable.
- **Always ask the user about capture format, devices, and color scheme before testing** (unless `e2e-config.json` answers them).

## Setup (preflight)

Two kinds of "missing", handled differently:

1. **Fresh worktree / uninstalled deps → bootstrap it yourself first.** A fresh git worktree has no `node_modules`/`.env.local`, so project deps (e.g. `@playwright/test`) won't resolve. Before flagging anything missing, run the repo's own setup script if it has one - `node scripts/setup-codex-worktree.mjs`, else `pnpm install` / `npm install`. This is the authorized, safe way to bootstrap; don't stop and ask the user for what a repo script fixes. If the worktree is behind `origin/main` and the task needs latest code, `git fetch origin && git rebase origin/main` (never over uncommitted work).
2. **Genuinely missing system tools / creds → stop and instruct.** For things a repo script can't provide, give the user the exact command and do not skip the step or fake the output:

- **Node** - report tooling + uploader.
- **R2 credentials in your agent env** - `R2_ENDPOINT`, `R2_BUCKET`, `R2_PUBLIC_URL`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`. Store them in `~/.claude/settings.json` `env` (and your Codex env). The uploader is dependency-free node - no aws CLI needed. See [uploader.md](references/uploader.md).
- **ffmpeg** (`brew install ffmpeg`) - web video `.webm` → `.mp4` conversion.
- **agent-browser** - the web desktop + web mobile exploratory driver.
- **Playwright** (`npm i -D @playwright/test` + `npx playwright install`) - the web rerunnable regression asset. See [web-arm.md](references/web-arm.md).
- Expo iOS only: **Xcode + an iOS simulator** (`xcrun simctl`), **a JDK** (Maestro needs Java: `brew install --cask temurin` - `/usr/bin/java` alone is just a stub), **Maestro** (`curl -Ls https://get.maestro.mobile.dev | bash`), and **serve-sim** (`npx serve-sim`, auto-installs). See [expo-arm.md](references/expo-arm.md).
- **Env note:** different agents see different environments. R2 creds + Homebrew tools (agent-browser, ffmpeg) present for Claude Code aren't automatically present for Codex. For **Codex**, set `PATH` (incl. `/opt/homebrew/bin`) and the `R2_*` vars under `[shell_environment_policy]` `set` in `~/.codex/config.toml` - Codex trims PATH and filters `KEY`/`SECRET` vars, so a shell-profile export alone won't reach subprocesses (see [uploader.md](references/uploader.md)). The preflight (Step 0) catches this per agent.

## Project config (auto-detected)

Before asking anything, read `docs/testing/e2e-config.json` if present and use it as defaults. See [templates/e2e-config.example.json](templates/e2e-config.example.json) for the full shape. The `upload` block is **optional** (it overrides the `R2_*` env defaults per project); `theme`/`auth`/`defaults`/`expo` are optional too. If absent, ask the manual questions; upload still works off the `R2_*` env.

If `expo.reset` is set (a deep link or supported test endpoint that returns the app to a fresh onboarding/first-run state, e.g. `"reset": "podist:///?replay=1"`), **use it** to reach first-run instead of rediscovering it - don't trial-and-error deep-link shapes or fight the in-app Settings reset. If it's not set and you have to discover one, tell the user to add it to `e2e-config.json` so the next run is instant.

## Decision tree (execute first)

```
Request analysis
├─ Write stories only?            → Steps 0-2 (--stories-only)
├─ Test existing stories?         → Steps 0, 3-9 (--test-only)
├─ Retest specific stories?       → Steps 0, 3-9 filtered (--retest 1a,3b)
├─ Audit an existing test folder? → Step 9 only (--audit)
├─ Full workflow?                 → Steps 0-10 [DEFAULT]
├─ Pipeline stage (mode:pipeline)?→ Steps 0-10, non-interactive (see Skill composition)
└─ Faster wall-clock (mode:parallel)?→ preflight once, then fan the arms out as subagents (see Parallel mode)
```

## Skills this composes with

This skill is the spine; it **summons specialists** at the right step rather than reimplementing them:

| Skill | When |
|-------|------|
| `playwright-test` + `playwright-best-practices` | author/run web Playwright specs (Step 3-4) |
| `maestro-e2e` | author iOS Maestro flows (Step 5) |
| `realtalk` | end-of-run honesty pass (Step 10) |
| `github-project-management` | file findings as issues (Step 10, optional) |

Two rules when invoking any of them:

- **Resolve the name verbatim against the available-skills list the host provides** - some platforms namespace skills (e.g. `compound-engineering:ce-...`), others use the bare name; a guessed short form fails. Match a listed entry before calling Skill/Task.
- **If a referenced skill is NOT in that list, call it out - never fake its work.** Tell the user the exact missing skill name and that they should install it (point them at `/find-skills` or their skills marketplace). Then either continue only with the lower-fidelity fallback this skill documents and **flag it in `gaps`** ("authored without the `maestro-e2e` skill"), or stop that step. Never silently reimplement a missing specialist from memory.

**Pipeline mode (`mode:pipeline`):** when run as a stage in a larger flow (e.g. `lfg`), run **non-interactively** - take every choice from `e2e-config.json` + documented defaults (never AskUserQuestion), and replace Step 10's interactive offers with **structured output** the caller can read (verdict, per-story pass/blocked, hosted report URL, findings split into product bugs vs harness friction + proposed issues). Still **invoke `realtalk`** for the disclosure, but **don't** open issues or fix-PRs yourself in pipeline mode - emit them for the orchestrator to act on.

**Parallel mode (`mode:parallel`):** the three platform arms are independent once the dev stack is up, so fan them out to cut wall-clock:
1. **Shared + serial first:** Step 0 (config/detect) + bring the dev stack up **once** (web, Metro, Convex/Trigger). The arms attach to this one running stack - subagents must **not** each start their own.
2. **Fan out one subagent per active arm, concurrently:** `web-desktop` (Step 3), `web-mobile` (Step 4), `iOS` (Step 5). Each captures screenshots/recordings + authors its regression asset into the shared `docs/testing/<feature>/` folder. **Multi-app etiquette is mandatory:** each web arm uses a uniquely-named agent-browser session; the iOS arm owns the one simulator + serve-sim port; no subagent kills the shared dev stack or another arm's sessions. Story labels keep artifacts collision-free (web-desktop `1x`, web-mobile `2x`, iOS `3x`).
3. **Barrier, then the serial tail (parent):** Step 6 (prune + `audit --pre` + upload), 7 (report), 8 (verify), 9 (audit), 10 (findings).

A failed arm = its stories are `blocked` in the report (mark-and-continue), never an aborted run. **Wall-clock floor = preflight + slowest arm (usually iOS) + upload** - you can't beat the slowest arm, but you stop paying for the others serially. Opt-in (extra coordination + token cost); the default stays serial. Composes with `mode:pipeline` (a pipeline caller can request parallel arms).

## Platform detection

- **Web** is always available.
- **Expo iOS** activates only when an Expo project is detected: an `app.json` / `app.config.(js|ts)` with expo config, or `expo` in a package.json's dependencies. One match → use it. Multiple matches (or expo deps but no clear app) → ask which app + simulator to target. No Expo project → run web-only without prompting for mobile.

## Workflow

Copy this checklist and check items off:

```
E2E Test Progress:
- [ ] Step 0: Load config + detect platforms + ask user
- [ ] Step 1: Create test folder
- [ ] Step 2: Write user stories (grouped by platform)
- [ ] Step 3: Test web desktop stories
- [ ] Step 4: Test web mobile stories
- [ ] Step 5: Test Expo iOS stories (if app exists)
- [ ] Step 6: Prep (prune failed artifacts + `audit --pre`) + upload to CDN
- [ ] Step 7: Build + upload the HTML QA report
- [ ] Step 8: Verify hosted report + assets return 200
- [ ] Step 9: Audit test folder
- [ ] Step 10: Findings & next steps (issues / fix-as-PR / rerun)
```

### Step 0 - Config, detection, questions

Read `e2e-config.json`; run platform detection above. Then ask only what config didn't answer: feature, capture format (screenshots / video / both), devices, color scheme (default dark). Use AskUserQuestion when available. Tell the user which defaults were loaded.

### Step 1 - Test folder

```bash
mkdir -p docs/testing/<feature-name>
```
Short descriptive slug (e.g. `community-switcher`, `onboarding-smoke`). All artifacts live here. Use `/tmp` only for transient `.webm` before ffmpeg conversion.

### Step 2 - User stories

Write `docs/testing/<feature-name>/user-stories.md` from [templates/user-stories.md](templates/user-stories.md). Group by `## Web Desktop`, `## Web Mobile`, `## iOS` headings. Every story gets a label (`1a`, `2a`, `3a`) that matches its artifact filenames. User language, independently testable, context-first. **Write one story per screen or discrete action, not coarse multi-screen transitions** - split "topic → style" into "pick a topic" / "pick a style" / "reach home" so each story maps to a screen the userflow can show.

### Step 3-4 - Web (desktop, then mobile)

Per story: walk the flow live with agent-browser (configure viewport/device → color scheme → authenticate → record → then **at every screen in the flow**: `snapshot -i` → interact → **screenshot that screen** (one per screen, so `userflows` shows the whole journey, not just start/end) → stop+convert recording → check `errors`), **then author a Playwright test** (`docs/testing/<feature>/specs/<label>-<slug>.spec.ts`) as the rerunnable regression asset and run it, capturing artifacts for the `playwright` report block. **Invoke the `playwright-test` skill to author the spec** (and `playwright-best-practices` for robust locators / auto-wait / non-flaky assertions) - load that expertise rather than guessing the API. Test all desktop stories, then close + reopen with `set device` for mobile. Full workflow: [web-arm.md](references/web-arm.md). Command references: [techniques.md](references/techniques.md), [device-presets.md](references/device-presets.md).

### Step 5 - Expo iOS (if app exists)

**Invoke the `maestro-e2e` skill before authoring the flow** - it carries the assertion / wait (`assertVisible`, `waitForAnimationToEnd`) / gesture syntax, so you don't fumble flow steps. Drive with Maestro for element location/assertions; use serve-sim for coordinate gestures (`tap`/`gesture`/`button`/`type`), and record the screen with `xcrun simctl io <udid> recordVideo`. The canonical per-story deliverable is **a rerunnable Maestro flow + a `simctl` screen recording**. serve-sim-only exploratory verification (recording + screenshots, no flow) is allowed for stories too awkward to script - flag those "not yet regression-covered" in the report's `gaps` block. Full workflow, ports, UDID allocation, and etiquette: [expo-arm.md](references/expo-arm.md).

### Step 6 - Prep + upload artifacts

**Before uploading** (this saves re-uploading + re-verifying every asset later):
1. **Prune failed-attempt / debug artifacts** so only the final *passing* evidence ships - delete `screenshot-debug-*`, `*-failed-*`, probe clips, and any earlier failed-setup screenshots/logs from the folder.
2. **Run the pre-upload audit locally** to catch naming / recording / checkbox issues *now*, not after 70 uploads:
   ```bash
   bash ${SKILL_DIR}/scripts/audit-test-folder.sh --pre docs/testing/<feature-name>
   ```
   Fix everything it flags before you upload a single file.

Then upload every artifact and capture the returned absolute CDN URLs for the report:
```bash
bash ${SKILL_DIR}/scripts/upload-artifact.sh docs/testing/<feature-name>/<file>
```
The script reads the `upload` block from `e2e-config.json` and S3 creds from env. Missing config/creds → it exits non-zero; stop and tell the user how to fix, do not produce a local-only report. See [uploader.md](references/uploader.md).

### Step 7 - Build the HTML QA report

Copy the example closest to what you tested to `docs/testing/<feature-name>/report.html`, then edit only its `report-data` JSON. Pick: `templates/qa-report.html` (multi-platform, collapsible groups), `templates/example-expo.html` (single platform, flat), or `templates/example-web.html` (web desktop + mobile web). Reference `templates/qa-report-blocks.html` for any block's shape. Keep the mandatory blocks; add optional blocks only where real evidence exists; use the uploaded absolute CDN URLs for all media. **Keep it lean - no setup/process narration (`context`) and no header-duplicating `properties` dumps** (see report-blocks.md "Keep it lean"). Block policy, format rules, and schema: [report-blocks.md](references/report-blocks.md). Then upload `report.html` itself.

### Step 8 - Verify hosted report

Confirm the hosted report and every referenced asset return `200` with the right content type (`text/html`, `image/*`, `video/mp4`, `text/plain`):
```bash
bash ${SKILL_DIR}/scripts/upload-artifact.sh --verify <url> [<url> ...]
```
Then **actually open the hosted `report.html` and confirm it renders** - load it in agent-browser (or the Codex `@browser` plugin) and screenshot it, eyeballing that blocks, images, and video embeds resolve. A `200` proves the file uploaded, not that the page renders or that its media URLs resolve; never call the report "green" on `200` alone.

Once verify passes, the **bulky local evidence is redundant** - screenshots, `*.mp4`/`*.webm`, and logs all live on R2 now. Prune those local binaries so the folder doesn't balloon (the last run left ~69 MB untracked); **keep** the lightweight rerunnable source (`specs/`, `flows/`, `user-stories.md`, `report.html`, the upload manifest). If `docs/testing/` isn't already in the repo's `.gitignore`, recommend adding it so evidence runs never show as "dirty" or get accidentally committed.

### Step 9 - Audit

```bash
bash ${SKILL_DIR}/scripts/audit-test-folder.sh docs/testing/<feature-name>
```
Validates story↔artifact alignment, mandatory recordings, the HTML report, and Maestro flows. Fix flagged issues before reporting done.

### Step 10 - Findings & next steps

Testing is done; now triage what it found. **Never fix product code during the run** - this is the separate, opt-in step.

1. **List findings.** For each failed/blocked story or product bug: one-line title, repro steps, the evidence URL (hosted screenshot/recording), severity, and affected flow. Keep genuine *product bugs* separate from *harness friction* (a tooling gap to fix in the harness, not a product issue), and list the harness workarounds you applied so nothing is hidden. **Invoke the `realtalk` skill** here for the honesty pass - it verifies what actually happened (git state, whether PRs merged, files/processes left behind) and discloses buried friction.
2. **Offer issues; don't auto-file.** Draft ready-to-create GitHub issues (title + repro + evidence link); ask before filing. Use the `github-project-management` skill if present.
3. **Offer the fix loop (human-gated).** Ask whether to: open issues, dispatch a fix agent per finding, or just hand over the report. If the user opts to fix, each fix lands as its **own PR** (reviewable, never silently merged), then **`--retest <labels>`** reruns only the affected stories on the fix to confirm green. The validated pattern is **red on main → fix as PR → green on the fix → merge** - never patch the app inside the test run.

## Quality standards

Every completed run: all stories checked off or marked blocked with a reason; a recording per story; HTML report with the five mandatory blocks; all media hosted and returning 200; audit passes; sessions/simulators closed (respecting etiquette); **failed stories surfaced as findings with proposed issues (Step 10), never silently fixed or worked around.**

## Progressive references (load on demand)

| File | Content |
|------|---------|
| [references/web-arm.md](references/web-arm.md) | agent-browser walkthrough + Playwright regression test authoring |
| [references/expo-arm.md](references/expo-arm.md) | serve-sim + Maestro workflow, ports/UDID allocation, multi-app etiquette |
| [references/report-blocks.md](references/report-blocks.md) | Always-vs-optional block policy, `report-data` schema, canonical order |
| [references/uploader.md](references/uploader.md) | S3-compatible uploader config, env vars, key prefixes, troubleshooting |
| [references/techniques.md](references/techniques.md) | agent-browser command chaining, refs, waiting, eval, diffing |
| [references/device-presets.md](references/device-presets.md) | Desktop viewports, mobile devices, iOS simulator |
| [templates/qa-report.html](templates/qa-report.html) | Example report: multi-platform (Expo + web), collapsible platform groups |
| templates/example-expo.html | Example report: single platform (Expo iOS), flat layout |
| templates/example-web.html | Example report: web desktop + mobile web, two grouped platforms |
| [templates/qa-report-blocks.html](templates/qa-report-blocks.html) | Full block catalog (kitchen sink) - reference for every block's shape |
| [templates/user-stories.md](templates/user-stories.md) | User stories starter |
| [templates/e2e-config.example.json](templates/e2e-config.example.json) | Project config incl. `upload` block |
| [scripts/refresh-qa-template.sh](scripts/refresh-qa-template.sh) | Re-pull the canonical QA template from CDN |

Load reference files for the current step only - do not preload everything.
