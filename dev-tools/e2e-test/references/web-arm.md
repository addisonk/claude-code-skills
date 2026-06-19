# Web Arm - agent-browser + Playwright

The web arm tests web desktop and web mobile. Two tools, distinct roles (mirrors the iOS arm's serve-sim + Maestro split):

- **agent-browser** - the agent's eyes and hands for the **live exploratory walkthrough**. Drives the app via semantic locators (`snapshot -i`, `find role/label/text`), captures a screenshot at **each screen** in the flow (the `userflows` block is the full screen-by-screen sequence - one frame per screen, not one per story) plus a recording per story. See [techniques.md](techniques.md) and [device-presets.md](device-presets.md).
  - **In Codex, use the `@browser` plugin instead** (agent-browser is often not on Codex's PATH). Either way, drive a **headless/sandboxed** automation browser - **never the user's real, interactive Chrome**. If neither is available, stop and tell the user (don't hijack their desktop browser).
  - **Recording caveat (Next / RSC dev apps):** `agent-browser record start "<path>"` can corrupt some Next dev sessions - the page re-renders as the raw RSC/script payload and locators go blank. If that happens right after `record start`, use the `record start <path> <url>` form (start the recording **and** navigate in one call), or fall back to **Playwright per-test video** for the recording. Playwright is the kept regression asset anyway, so its video doubles as the walkthrough evidence - prefer that over fighting the recorder.
- **Playwright** - the **durable, rerunnable regression asset**. Each web story gets a Playwright test (`.spec.ts`) you keep and re-run later, exactly like a Maestro flow is the iOS regression asset. Lean on the `playwright-test` and `playwright-best-practices` skills for authoring.

## Canonical per-story deliverable

For each web story: **a rerunnable Playwright test + an agent-browser recording (and screenshots) of the walkthrough.**

Exception - **agent-browser-only exploratory** verification (recording + screenshots, no Playwright test) is allowed for stories too awkward to script or one-off smoke checks. Mark every such story "not yet regression-covered" in the report's `gaps` block. Never silently skip the test without flagging it.

## Workflow

### 1. Walk the story with agent-browser

Drive the flow live (Steps 3-4): configure viewport/device, authenticate, record the run, and at **every screen** do `snapshot -i` -> interact -> **wait for the screen to settle** -> **screenshot** (one per screen, named in order, e.g. `screenshot-1a-01-topic.png`). This is how you observe behavior and learn the exact locators before scripting - and the per-screen shots become the `userflows` frames.

**Wait before every screenshot** so frames aren't blank/mid-load: after navigating or interacting, gate the shot on the screen's anchor - `agent-browser wait --text "<text on the new screen>"` (or `wait --selector <locator>` / `wait --load networkidle`) before `screenshot`. Never screenshot immediately after a click or on a fixed `wait <ms>`.

### 2. Author a Playwright test (the regression asset)

Capture the same flow as a test under the test folder:

```
docs/testing/<feature>/specs/<label>-<slug>.spec.ts
```

- Use semantic locators (`getByRole`, `getByLabel`, `getByText`) and web-first assertions (`await expect(locator).toBeVisible()`), so the test is robust - the same locators agent-browser surfaced.
- **Assert the screen anchor visible before `page.screenshot()`** so spec screenshots aren't mid-load: `await expect(anchor).toBeVisible()` (locators + `expect` auto-wait), optionally `await page.waitForLoadState('networkidle')`. Never `page.waitForTimeout()` for this. See the `playwright-best-practices` skill (`assertions-waiting.md`).
- Match the device: for **web mobile** stories set the mobile viewport/UA (`test.use({ ...devices['iPhone 15'] })` or an explicit `viewport`), mirroring the agent-browser `set device` run.

### 3. Run it, capturing artifacts

```bash
npx playwright test docs/testing/<feature>/specs/<label>-<slug>.spec.ts --reporter=html
```

Save the HTML report (and trace on failure) as evidence; upload it and link from the report's `playwright` block.

### 4. Report evidence

- `flow-results` row per story (status + device).
- `playwright` block listing the spec + run results / report (uploaded URLs) - the web regression surface, analogous to the iOS `maestro` block.
- `userflows` / `recording` for the agent-browser walkthrough.
- `gaps` entry for any agent-browser-only story ("not yet regression-covered").

## Artifact naming (matches iOS arm + audit script)

```
docs/testing/<feature>/
├── specs/1a-admin-opens-switcher.spec.ts   # Playwright test (rerunnable)
├── recording-1a-admin-opens-switcher.mp4    # agent-browser walkthrough
├── screenshot-1a-admin-opens-switcher.png
└── playwright-report/                        # optional HTML report output
```

## Notes

- Playwright needs browsers installed once: `npx playwright install`. If `@playwright/test` isn't in the project, install it (`npm i -D @playwright/test`) - per the skill's "missing -> instruct" rule, stop and tell the user rather than skipping the regression asset.
- `docs/testing/<feature>/specs/` holds the run's evidence copy. For a kept regression suite, also place/keep the spec in the project's own Playwright test directory so CI picks it up.
