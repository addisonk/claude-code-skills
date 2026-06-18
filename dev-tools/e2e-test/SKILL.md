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

- **If something needed is missing, stop and instruct the user - never hack around, fake, or give up.** When a required tool, dependency, credential, config value, running dev server, or test account is absent, halt that step and tell the user exactly what to add and the command to add it (see Setup below). Never fabricate or placeholder evidence, silently skip a story, or downgrade the output to route around the gap. A real report reflects only what actually ran; anything blocked or unverifiable goes in the `gaps` block with the reason.
- **The report is a hosted HTML QA report, never markdown.** Build it by copying the closest example template and editing only its `report-data` JSON (Step 7). See [report-blocks.md](references/report-blocks.md).
- **Always upload evidence to CDN.** Every screenshot, MP4, log, Maestro report/YAML, and the report HTML uploads via `scripts/upload-artifact.sh` (dependency-free node; reads `R2_*` env for endpoint/bucket/public URL + creds). The report references absolute CDN URLs only - never `file://` or local paths. Missing `R2_*` env → **fail loudly** and point the user to `~/.claude/settings.json`; never fall back to local. See [uploader.md](references/uploader.md).
- **Five report blocks are mandatory:** `report` header, `verdict`, `flow-results`, a `recording` per story, and `gaps`. Everything else renders only when real evidence exists.
- **A screen recording per story is mandatory.**
- **Multi-app simulator etiquette:** target a specific simulator UDID/device name and a dedicated serve-sim/Metro port. Never run global simulator-erase or kill-all. Before stopping any simulator/Metro/serve-sim process, identify the owning app + port. See [expo-arm.md](references/expo-arm.md).
- **Mobile web:** close the desktop session, open fresh, `set device`, `reload` before auth; re-apply device + reload after auth redirects; start recording only after viewport is stable.
- **Always ask the user about capture format, devices, and color scheme before testing** (unless `e2e-config.json` answers them).

## Setup (required tools - install if missing, never work around)

If any tool below is missing for the platforms you're testing, stop and give the user the install command. Do not skip the step or fake the output.

- **Node** - report tooling + uploader.
- **R2 credentials in your agent env** - `R2_ENDPOINT`, `R2_BUCKET`, `R2_PUBLIC_URL`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`. Store them in `~/.claude/settings.json` `env` (and your Codex env). The uploader is dependency-free node - no aws CLI needed. See [uploader.md](references/uploader.md).
- **ffmpeg** (`brew install ffmpeg`) - web video `.webm` → `.mp4` conversion.
- **agent-browser** - the web desktop + web mobile exploratory driver.
- **Playwright** (`npm i -D @playwright/test` + `npx playwright install`) - the web rerunnable regression asset. See [web-arm.md](references/web-arm.md).
- Expo iOS only: **Xcode + an iOS simulator** (`xcrun simctl`), **a JDK** (Maestro needs Java: `brew install --cask temurin` - `/usr/bin/java` alone is just a stub), **Maestro** (`curl -Ls https://get.maestro.mobile.dev | bash`), and **serve-sim** (`npx serve-sim`, auto-installs). See [expo-arm.md](references/expo-arm.md).
- **Env note:** different agents see different environments. R2 creds + Homebrew tools (ffmpeg) present for Claude Code aren't automatically present for Codex - set `R2_*` and `PATH` in each agent's env. The preflight (Step 0) catches this per agent.

## Project config (auto-detected)

Before asking anything, read `docs/testing/e2e-config.json` if present and use it as defaults. See [templates/e2e-config.example.json](templates/e2e-config.example.json) for the full shape. The `upload` block is **optional** (it overrides the `R2_*` env defaults per project); `theme`/`auth`/`defaults`/`expo` are optional too. If absent, ask the manual questions; upload still works off the `R2_*` env.

## Decision tree (execute first)

```
Request analysis
├─ Write stories only?            → Steps 0-2 (--stories-only)
├─ Test existing stories?         → Steps 0, 3-9 (--test-only)
├─ Retest specific stories?       → Steps 0, 3-9 filtered (--retest 1a,3b)
├─ Audit an existing test folder? → Step 9 only (--audit)
└─ Full workflow?                 → Steps 0-9 [DEFAULT]
```

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
- [ ] Step 6: Upload all artifacts to CDN
- [ ] Step 7: Build + upload the HTML QA report
- [ ] Step 8: Verify hosted report + assets return 200
- [ ] Step 9: Audit test folder
```

### Step 0 - Config, detection, questions

Read `e2e-config.json`; run platform detection above. Then ask only what config didn't answer: feature, capture format (screenshots / video / both), devices, color scheme (default dark). Use AskUserQuestion when available. Tell the user which defaults were loaded.

### Step 1 - Test folder

```bash
mkdir -p docs/testing/<feature-name>
```
Short descriptive slug (e.g. `community-switcher`, `onboarding-smoke`). All artifacts live here. Use `/tmp` only for transient `.webm` before ffmpeg conversion.

### Step 2 - User stories

Write `docs/testing/<feature-name>/user-stories.md` from [templates/user-stories.md](templates/user-stories.md). Group by `## Web Desktop`, `## Web Mobile`, `## iOS` headings. Every story gets a label (`1a`, `2a`, `3a`) that matches its artifact filenames. User language, independently testable, context-first.

### Step 3-4 - Web (desktop, then mobile)

Per story: walk the flow live with agent-browser (configure viewport/device → color scheme → authenticate → record → navigate → `snapshot -i` → interact → screenshot → stop+convert recording → check `errors`), **then author a Playwright test** (`docs/testing/<feature>/specs/<label>-<slug>.spec.ts`) as the rerunnable regression asset and run it, capturing artifacts for the `playwright` report block. Test all desktop stories, then close + reopen with `set device` for mobile. Full workflow: [web-arm.md](references/web-arm.md). Command references: [techniques.md](references/techniques.md), [device-presets.md](references/device-presets.md).

### Step 5 - Expo iOS (if app exists)

Drive with Maestro for element location/assertions; use serve-sim for coordinate gestures (`tap`/`gesture`/`button`/`type`), and record the screen with `xcrun simctl io <udid> recordVideo`. The canonical per-story deliverable is **a rerunnable Maestro flow + a `simctl` screen recording**. serve-sim-only exploratory verification (recording + screenshots, no flow) is allowed for stories too awkward to script - flag those "not yet regression-covered" in the report's `gaps` block. Full workflow, ports, UDID allocation, and etiquette: [expo-arm.md](references/expo-arm.md).

### Step 6 - Upload artifacts

Upload every artifact and capture the returned absolute CDN URLs for the report:
```bash
bash ${SKILL_DIR}/scripts/upload-artifact.sh docs/testing/<feature-name>/<file>
```
The script reads the `upload` block from `e2e-config.json` and S3 creds from env. Missing config/creds → it exits non-zero; stop and tell the user how to fix, do not produce a local-only report. See [uploader.md](references/uploader.md).

### Step 7 - Build the HTML QA report

Copy the example closest to what you tested to `docs/testing/<feature-name>/report.html`, then edit only its `report-data` JSON. Pick: `templates/qa-report.html` (multi-platform, collapsible groups), `templates/example-expo.html` (single platform, flat), or `templates/example-web.html` (web desktop + mobile web). Reference `templates/qa-report-blocks.html` for any block's shape. Keep the mandatory blocks; add optional blocks only where evidence exists; use the uploaded absolute CDN URLs for all media. Block policy, format rules, and schema: [report-blocks.md](references/report-blocks.md). Then upload `report.html` itself.

### Step 8 - Verify hosted report

Confirm the hosted report and every referenced asset return `200` with the right content type (`text/html`, `image/*`, `video/mp4`, `text/plain`):
```bash
bash ${SKILL_DIR}/scripts/upload-artifact.sh --verify <url> [<url> ...]
```

### Step 9 - Audit

```bash
bash ${SKILL_DIR}/scripts/audit-test-folder.sh docs/testing/<feature-name>
```
Validates story↔artifact alignment, mandatory recordings, the HTML report, and Maestro flows. Fix flagged issues before reporting done.

## Quality standards

Every completed run: all stories checked off or marked blocked with a reason; a recording per story; HTML report with the five mandatory blocks; all media hosted and returning 200; audit passes; sessions/simulators closed (respecting etiquette).

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
