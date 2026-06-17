---
date: 2026-06-17
topic: e2e-test-skill
---

# e2e-test Skill Requirements

## Summary

Evolve the existing `e2e-browser-test` skill into a renamed, multi-platform `e2e-test` skill that runs one story → test → evidence → report → audit spine across web desktop, web mobile, and Expo iOS, and emits a shareable hosted HTML QA report instead of a markdown one. The Expo arm authors a rerunnable Maestro flow per story (the regression asset) while using serve-sim as the agent's browser-accessible driver inside the simulator. The skill is fully self-contained: it bundles a frozen QA-report template plus filled golden example reports the testing agent matches against.

## Problem Frame

The current `e2e-browser-test` skill covers only web (desktop + mobile via agent-browser) and reports results as a markdown `test-report.md`. Two gaps drive this work. First, products now ship an Expo iOS app that has no agent-driven e2e coverage, and the raw iOS simulator is hard for an agent to observe or drive directly. Second, the markdown report can't carry inline screenshots and video, so test evidence isn't shareable as a single link a reviewer can open. A richer HTML QA-report system already exists in the `html-artifact` skill, but the testing agent shouldn't have to load another skill to produce correct output - it needs the format demonstrated, not just described.

## Key Decisions

- **Evolve and rename, don't fork.** Broaden `e2e-browser-test` into `e2e-test` so one skill owns all three targets and the description reflects browser + simulator. The web arm (agent-browser flow) is preserved as-is; the rename retires the old trigger.
- **Self-contained over delegation.** The skill bundles a frozen snapshot of the QA-report HTML template and its block catalog rather than referencing `html-artifact` at runtime. Trade-off accepted: the snapshot duplicates a living library and must be refreshable (see R13).
- **Maestro is the semantic driver; serve-sim is the gesture/observation layer.** serve-sim streams the simulator as an MJPEG video, not a DOM, so agent-browser's semantic locators cannot drive it. Maestro locates elements and asserts via the view hierarchy (and is the durable rerunnable deliverable); serve-sim's CLI handles coordinate gestures Maestro can't express and provides the live stream the agent watches and records. The story → test → evidence → report → audit spine is shared across platforms, but the driver model is explicitly different per platform - the Expo arm does not mirror the web (agent-browser) flow.
- **HTML report replaces markdown.** The report step always produces the hosted HTML QA report. User stories remain a markdown input (`user-stories.md`); only the final report changes format.
- **Always upload evidence to CDN.** Every run uploads artifacts to `cdn.podist.ai/qa-artifacts` and the report references absolute URLs, so the report renders inline anywhere. Reuses the existing R2 upload helper rather than new infrastructure.
- **Examples are the spec.** The bundled golden reports demonstrate the block policy in realistic runs, so the agent matches a real artifact instead of interpreting prose.

## Requirements

### Skill identity and structure

- R1. The skill is renamed from `e2e-browser-test` to `e2e-test`; its description and triggers reflect web (desktop + mobile) and Expo iOS simulator testing. The old name is retired and internal references updated.
- R2. The skill keeps the existing story → test → evidence → report → audit spine, shared across all three platforms. The "drive the app" step differs per platform by design: web uses agent-browser semantic locators; Expo iOS uses Maestro (semantic) + serve-sim CLI (coordinate gestures). The spine is shared; the driver model is not, and the skill does not pretend the Expo arm mirrors the web flow.
- R3. The web desktop and web mobile arms retain the current agent-browser behavior unchanged.
- R4. The Expo arm activates only when an Expo project is detected - an `app.json` / `app.config.(js|ts)` with expo config, or `expo` in a package.json's dependencies. With exactly one match the skill uses it; with multiple matches (or expo deps but no clear app) the skill asks the user which app + simulator to target before running the Expo arm. When no Expo project is found, the skill runs web-only without prompting for mobile.

### Expo iOS arm

- R5. For each Expo iOS story, the agent boots the app on a simulator and drives it with Maestro for element location and assertions, using serve-sim's CLI for coordinate gestures Maestro can't express and for the live stream it screenshots/records. The agent does not attempt to drive the app via agent-browser against the serve-sim video stream.
- R6. The canonical deliverable per Expo story is a rerunnable Maestro flow plus a serve-sim stream recording of the run. serve-sim is the single recording pipeline for all Expo stories (scripted and exploratory); Maestro's built-in recording is not required.
- R7. serve-sim-only exploratory verification (recording + screenshots, no Maestro flow) is allowed for stories too awkward to script or for one-off smoke checks. Such stories are flagged "not yet regression-covered" in the report's `gaps` block.
- R8. The skill enforces multi-app simulator etiquette: target a specific simulator UDID/device name and dedicated serve-sim/Metro port; never run global simulator-erase or kill-all commands; before stopping any simulator, Metro, or serve-sim process, identify the owning app/port.

### HTML report and block policy

- R9. The report is the data-driven HTML QA report: the agent edits the report-data JSON and leaves the template's CSS and render script intact.
- R10. Five blocks are always present in every report - `report` header frame (title, verdict, device, commit, timestamp, testTypes), `verdict`, `results` (per-story flow table with linked artifacts), `media-evidence` (at minimum a `recording` per story), and `gaps`.
- R11. All other blocks render by presence of real evidence only: `assertions`, `collapsible`, `metrics`, `charts`, `properties`, `context`, `flowchart`, `detail-lists`. They are included when the matching evidence exists and omitted otherwise.
- R12. A screen recording per story is mandatory and lands in `media-evidence` (for Expo, the serve-sim stream recording); `userflows`/`before-after` are added when screenshots warrant.

### Bundled examples and self-containment

- R13. The skill bundles a frozen snapshot of the QA-report template and block catalog (the kitchen-sink showing the full block vocabulary) in its own folder, plus a bundled refresh script that, on demand, re-pulls the canonical CDN file (`cdn.podist.ai/qa-artifacts/html/qa-report-blocks.html`) into the skill's template path and records the fetched version/date in a marker file. The refresh runs manually when blocks change - never during a test run.
- R14. The skill bundles one filled golden example report per platform - web desktop, web mobile, Expo iOS - hand-curated from a representative real run, that the testing agent can open and copy from. Each golden report demonstrates the five always-blocks (R10) and a representative optional block or two, so the block policy is shown, not just stated.
- R14b. The golden examples' media (screenshots, recordings) is uploaded once to a stable, dedicated CDN prefix (e.g. `qa-artifacts/examples/`) that is never garbage-collected, so the examples never rot. Golden-example media is distinct from per-run artifact uploads (R15).

### Evidence hosting

- R15. Every run uploads its screenshots, MP4 recordings, logs, Maestro reports/YAML, and the final report HTML to a configured object-storage target via the skill's own bundled, repo-agnostic uploader, and the report references absolute CDN URLs (never `file://` or local relative paths). The uploader is not coupled to any single repo's helper, so the skill works in any project.
- R15b. The uploader is S3-compatible (works against Cloudflare R2, AWS S3, or any S3-compatible store). Its target - endpoint, bucket, public CDN base, key prefix - is configured in `docs/testing/e2e-config.json` under an `upload` block; credentials are read from environment variables only and never committed.
- R16. After upload, the agent verifies the hosted report and each referenced asset return 200 with the expected content type (`text/html`, `image/*`, `video/mp4`, `text/plain`).
- R17. When the `upload` config or its credentials are missing, the run fails loudly on the report step with the configuration/env path to fix, rather than silently degrading to a local-only report.

## Key Flows

- F1. Web story (desktop or mobile)
  - **Trigger:** A web story is selected for testing.
  - **Steps:** Configure browser/viewport → authenticate → drive via agent-browser → capture screenshot/recording → upload artifacts → append a `results` row + `media-evidence` entry.
  - **Covered by:** R3, R9–R12, R15.

- F2. Expo iOS story - scripted (default)
  - **Trigger:** An Expo story is selected and is scriptable.
  - **Steps:** Boot app on a dedicated simulator UDID/port → observe via serve-sim stream, author a Maestro flow (serve-sim CLI for any coordinate gestures Maestro can't express) → run the flow capturing a recording → upload Maestro report/YAML + recording → append `results` row + `media-evidence` recording.
  - **Covered by:** R5, R6, R8, R9–R12, R15.

- F3. Expo iOS story - exploratory escape hatch
  - **Trigger:** An Expo story is too awkward to script or is a one-off smoke check.
  - **Steps:** Drive via serve-sim → capture recording + screenshots → upload → append `results` row + `media-evidence` + a `gaps` entry marking the story "not yet regression-covered."
  - **Covered by:** R7, R8, R10, R12, R15.

## Scope Boundaries

- Android testing - out of scope; this is iOS-only even though Maestro supports Android.
- Running the Maestro regression flows in CI or on a schedule - out of scope; the skill produces the rerunnable asset, wiring it into CI is separate work.
- (Resolved during grilling: the skill DOES ship its own repo-agnostic uploader rather than reusing a single repo's helper - see R15. This was an explicit reversal of the original "no new upload tooling" boundary.)

## Dependencies / Assumptions

- serve-sim is available on the machine (macOS, Apple Silicon, Xcode CLT) and exposes the simulator stream and CLI the agent drives.
- Maestro is installed for authoring and running iOS flows.
- The project sets an `upload` block in `docs/testing/e2e-config.json` (S3-compatible endpoint, bucket, public CDN base, key prefix) and provides credentials via env vars; "always upload" depends on this config + creds being present.
- The bundled QA template snapshot is a point-in-time copy of the upstream `html-artifact` block library and will drift until refreshed (R13).

## Outstanding Questions

### Resolve before planning

- None.

### Deferred to planning

- The exact serve-sim CLI surface the skill standardizes on for coordinate gestures and stream recording, and how ports/UDIDs are allocated per run (R5, R8) - to be pinned against serve-sim's actual CLI during planning/implementation.
