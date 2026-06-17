# QA Report - Block Policy & Schema

The report is **data-driven**: copy `templates/qa-report-blocks.html`, then edit **only** the JSON inside `<script type="application/json" id="report-data">`. Leave the CSS and render script untouched. Blocks are **presence-based** - a block renders only if it appears in `blocks`, in a fixed canonical order. Include only what you actually ran.

Bundled files. Copy the **example closest to what you tested**, then edit its `report-data`:

- `templates/qa-report-blocks.html` - the **full block catalog** (kitchen sink): every block rendered with sample data + its JSON. Reference this for any block's shape.
- `templates/qa-report.html` - **multi-platform** report (Mobile/Expo + Web Mobile + Web Desktop) using collapsible platform groups. Use for cross-platform features.
- `templates/example-expo.html` - **single platform** (Expo iOS), flat layout (no grouping), showing Details, Verdict, Flow results, Userflow, Recording, Maestro, Gaps.
- `templates/example-web.html` - **web desktop + mobile web**, two grouped platforms, a partial verdict with a failing story, plus a Playwright block.

Format rules of thumb: **one platform means flat blocks (no groups); two or more platforms means a collapsible group per platform** holding that platform's userflow + recording. Shared blocks (Details, Verdict, Flow results, Gaps, Playwright/Maestro summaries) sit at the top level, outside the groups.

> Rendering note: the current engine renders a **block-gallery / catalog layout** (cover header + each block as a titled section with a "Show JSON" toggle), not a stripped-down report. A clean report-only render mode is a separate, still-open item.

## Always vs optional

**Always present in every report (the five mandatory blocks):**

| Block | Carries |
|-------|---------|
| `report` (top frame) | `title`, `verdict` (`pass`/`fail`/`partial`), `device`, `commit`, `timestamp`, `testTypes[]` |
| `verdict` | 2–4 conclusion cards |
| `flow-results` | per-story table - one row per story (`name`, `device?`, `duration?`, `status`) linking the run |
| `recording` | a screen recording per story (mandatory evidence) |
| `gaps` | limitations + every serve-sim-only story marked "not yet regression-covered". Never hide uncertainty in the summary. |

**Optional - render only when the matching evidence exists:** `maestro` (iOS flow artifacts - always present for scripted iOS stories), `playwright`, `unit-tests`, `backend`, `userflows` (screenshot sequences), `before-after`, `assertions`, `collapsible`, `metrics`, `charts`, `flowchart`, `specs`, `ledger`, `properties`, `context`.

The rule: the five mandatory blocks are non-negotiable scaffolding; everything else appears by presence of real evidence - same data-driven model html-artifact uses.

## Canonical block order

The renderer sorts blocks into this order regardless of array order:

```
properties → context → verdict → metrics → charts → flow-results → assertions →
collapsible → flowchart → userflows → before-after → recording → specs → ledger →
unit-tests → playwright → maestro → backend → gaps
```

## Schema (the blocks you'll use most)

```jsonc
"report": {
  "title": "Onboarding smoke",            // HTML ok
  "verdict": "pass",                       // pass | fail | partial
  "device": "iPhone 17 · iOS 26.5",
  "commit": "abc1234",
  "timestamp": "Jun 17, 2026",
  "testTypes": [ { "name": "Maestro", "status": "pass" }, { "name": "agent-browser", "status": "pass" } ]
}
```

```jsonc
{ "type": "verdict", "lead": "...", "items": [ { "title": "≤4 words", "desc": "..." } ] }

{ "type": "flow-results",
  "stats": { "passed": 5, "failed": 0, "flaky": 0, "skipped": 0, "duration": "2m 14s" },
  "flows": [ { "name": "1a Admin sees switcher", "device": "Desktop 1440×900", "duration": "8s", "status": "pass" } ] }

{ "type": "recording", "lead": "...", "video": "https://cdn.../recording-1a.mp4",
  "poster": "https://cdn.../poster-1a.png",
  "links": [ { "label": "Hosted MP4", "url": "https://cdn.../recording-1a.mp4" } ] }

{ "type": "userflows", "label": "Onboarding", "variant": "mobile",
  "steps": [ { "name": "Baseline", "note": "Cover picker", "image": "https://cdn.../01.png" } ] }   // variant "desktop" = wider

{ "type": "before-after", "lead": "...",
  "pairs": [ { "before": { "image": "https://cdn.../b.png", "caption": "..." },
              "after":  { "image": "https://cdn.../a.png", "caption": "..." } } ] }

{ "type": "maestro", "lead": "...", "artifacts": [ { "name": "onboarding.yaml", "meta": "flow", "url": "https://cdn.../flows/3a.yaml" } ] }

{ "type": "gaps", "items": [ "Story 3b verified via serve-sim only - not yet regression-covered (no Maestro flow).", "Tablet sizes not tested." ] }
```

Full schema for every block (`metrics`, `charts`, `assertions`, `collapsible`, `flowchart`, `specs`, `ledger`, `properties`, `playwright`, `unit-tests`, `backend`) is in the comment block at the top of `templates/qa-report-blocks.html`.

## Rules

- **All media URLs are absolute CDN URLs** from the uploader - never `file://` or local relative paths.
- One `recording` per story is mandatory; add multiple `recording`/`userflows` blocks as needed (they group under their section).
- Screenshots render uncropped by default; don't pre-crop unless clearly labeled.
- Keep the monochrome theme - color is reserved for pass/warn/fail status.
- Short block leads; the evidence carries the weight.
- After building, verify the hosted report + every asset return `200` (Step 8).

## Maintaining the examples

`qa-report.html` and the `example-*.html` files all share one engine: `qa-report-blocks.html`'s CSS + render script, with only their `report-data` differing. To change an example, edit its `report-data` directly. The engine adds a few authoring-only conveniences read from `report-data`: `report.eyebrow` / `report.summary` / `report.footer` for the cover and footer, and per-block `_group` (collapsible platform section), `_eyebrow` (kicker above a block title), and `_name` (block title). Underscore-prefixed keys are stripped from the "Show JSON" view.

If `scripts/refresh-qa-template.sh` updates the catalog, re-apply those engine additions to it (or diff against the current `qa-report.html` engine) before regenerating the examples.

All example media points at the live `cdn.podist.ai/qa-artifacts/...` demo assets, so they render out of the box. For a real run, swap those for the run's own uploaded CDN URLs.
