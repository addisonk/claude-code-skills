---
title: "feat: Slide-shape layer for html-artifact"
type: feat
status: complete
date: 2026-05-15
target_repo: addisonk/claude-code-skills
local_mirror: /Users/addisonkowalski/Dropbox/.agents/skills/html-artifact
---

# feat: Slide-shape layer for html-artifact

## Summary

Add a slide-shape layer to the `html-artifact` skill so every `<section>` inside the main column defaults to a 16:9 slide canvas with hard clipping (`overflow: hidden`), and certain content categories opt out via a new `.section-free` class. Pair the visual constraint with a slide grammar (one composition per section), a mobile-collapse breakpoint, print/PDF page-per-slide mapping, and CSS-counter slide numbers in the sidebar TOC.

All design decisions are locked from a prior grilling session — this plan only describes the technical breakdown to implement them, audit the four templates against the new rule, and ship to both the public repo (`design/html-artifact/`) and the local install (`/Users/addisonkowalski/Dropbox/.agents/skills/html-artifact/`).

## Problem Frame

Today, `<section>` elements in an html-artifact grow vertically to fit whatever content the LLM produces. The result is two failure modes:

1. **Sections become walls of text.** The artifact reads like a long markdown file with prettier typography — none of the "slide-shaped, glanceable" feel the inspiring article emphasizes.
2. **Mixed compositions inside a section.** A single section often combines a stat row + a paragraph + a diagram + a bullet list, with no visual rhythm.

The user wants every section to feel like a slide: one composition per canvas, ~16:9, predictable rhythm. The exception is content that is inherently tall (flowcharts, line-numbered diffs, long tables, implementation-unit detail) — those should opt out via a single class.

The constraint must enforce itself visually (hard clip), not just exist as advisory prose, so the LLM authoring the artifact gets immediate visual feedback when it overshoots.

## Requirements

| ID | Requirement | Source |
|----|-------------|--------|
| R1 | Every `<section>` inside `.layout > main` renders as `aspect-ratio: 16 / 9` with `overflow: hidden` by default | Grill Q1 / Q3 (locked) |
| R2 | A `.section-free` class on a section restores free height and visible overflow | Grill Q2 / Q10 |
| R3 | Mobile viewport ≤ 720px collapses all sections to free height; sidebar stacks above main | Grill Q5 |
| R4 | Print/PDF emits one section per landscape page; sidebar and frontmatter pills hidden in print; `.section-free` sections flow naturally | Grill Q8 |
| R5 | Sidebar TOC links carry a CSS-counter prefix (`01 Summary`, `02 Goals`, …) | Grill Q11 polish |
| R6 | All four shipped templates (`spec-or-plan.html`, `report.html`, `code-review.html`, `playground.html`) are audited so each `<section>` either fits the slide grammar or carries `.section-free` | Grill Q4 + Q6 |
| R7 | The "slide grammar" (one composition per slide: bullets, stat-grid, diagram, compare-grid, pull-quote, or short table) is documented in `SKILL.md` with worked examples | Grill Q6 |
| R8 | The local install at `/Users/addisonkowalski/Dropbox/.agents/skills/html-artifact/` mirrors the public-repo changes after the work lands | Shipping decision |
| R9 | Existing skill features must not regress: `.page-logo` slot, `--logo-filter`, scroll-spy `a.is-active` highlight, shadcn-default oklch palette, every existing layout primitive | Constraints |

## Key Technical Decisions

- **Selector scope is `.layout > main > section`, not bare `section`.** Bare `section` would catch any nested `<section>` (e.g., inside an `<article>`) and could also pull in semantic sections the templates don't currently use but might add later. Scoping to the layout's main column keeps the rule predictable and leaves `.doc-header` and any other top-level sections unaffected. *Trade-off: nested sections inside `<main>` would also get slide-shaped, but we don't currently nest sections so that's fine.*

- **Hard clip via `overflow: hidden`, no expand affordance.** The grill ratcheted to the purest enforcement — content that overflows is lost visually, and the LLM has to split the section. Failure mode is harsh but the only signal that actually pressures the author to compose tight slides. Soft alternatives (visible spill, scroll-inside, expand button) were considered and rejected.

- **Slide grammar codified in `SKILL.md` prose, not CSS-enforced.** No CSS can detect "two compositions in one slide" cheaply. Enforcement is via SKILL.md guidance — one composition per section, with the six allowed shapes listed explicitly. The hard clip in CSS catches the symptom (too much content); the grammar catches the cause (mixing kinds of content).

- **Mobile breakpoint at 720px, not the existing 768px the rest of the theme uses.** The existing theme has `@media (max-width: 768px)` for table reflow and TOC stacking. The new slide-collapse breakpoint sits at 720px so it triggers slightly earlier than the table reflow — sections become free-height *before* the inline tables collapse to label-prefixed blocks, so the visual transition feels staged rather than cliff-edge. *Confirm during verification.* If staging looks worse than coincidence, unify on a single breakpoint.

- **Print mapping uses `@page { size: landscape; }` + `page-break-before: always` per section.** The simplest possible mapping. Free-shape sections that exceed one page naturally span multiple pages (the cost of the strict-clip-only-for-slide-shape decision). Hidden in print: `.toc`, `.doc-header .pill-row` (visual chrome), `.doc-footer`.

- **TOC counter via pure CSS `counter-reset` / `counter-increment`.** Zero JavaScript. Counters re-flow automatically when sections are added or reordered. Active-section highlighting is already JS via IntersectionObserver and stays as-is.

- **The Dropbox install is a passive mirror.** All authoring lands in the public repo first; Dropbox is `cp`-synced as the last step. No git in Dropbox, no separate review surface.

## High-Level Technical Design

The change is conceptually small (one CSS rule plus per-template audits) but touches many files. Visualizing the rule as a decision diagram clarifies the per-section question authors and the LLM have to answer:

```
                  Is this section content tall/free-form?
                                  │
                  ┌───────────────┴────────────────┐
                 YES                               NO
                  │                                 │
        Add class="section-free"          Keep section as-is (slide-shape)
                  │                                 │
        ┌─────────┼─────────┐               ┌───────┴───────┐
        ▼         ▼         ▼               ▼               ▼
   Vertical   Line-num   Table > 5    Pick ONE         Two compositions?
   flowchart    diff       rows       composition:    → split into 2 sections
              (.window-                  • bullets
               chrome)                   • stat-grid
                                         • diagram
                                         • compare-grid
                                         • pull-quote
                                         • short table
```

This is directional guidance, not implementation specification. The implementing agent should treat it as context, not code to reproduce.

## Implementation Units

### U1. Sync Dropbox-local additions into the public repo

**Goal:** The public repo (`design/html-artifact/`) trails the local install by ~133 lines (the `.page-logo` slot, `--logo-filter` token, scroll-spy IntersectionObserver, and any incidental edits). Get them on the same baseline before adding the slide-shape layer so subsequent work isn't fighting an out-of-date public copy.

**Requirements:** R9 (don't regress existing features).

**Dependencies:** none.

**Files:**
- `design/html-artifact/SKILL.md` (gains the new 4c. logo section + scroll-spy reference)
- `design/html-artifact/styles/globals.css` (gains `.page-logo`, `--logo-filter`, `.toc a.is-active`)
- `design/html-artifact/templates/spec-or-plan.html`, `report.html`, `code-review.html`, `playground.html` (each gains the `.page-logo` slot in `<nav class="toc">` and the scroll-spy `<script>` block before `</body>`)

**Approach:**
- For each file pair, diff `Dropbox/.agents/skills/html-artifact/<file>` against `design/html-artifact/<file>`.
- Treat the Dropbox version as source-of-truth.
- Copy in full where the changes are isolated to the additions described above.
- Spot-verify no slide-shape work has accidentally landed in the Dropbox version already (none expected — the user said the slide layer hasn't been added yet).

**Patterns to follow:** see the existing scroll-spy script in `Dropbox/.agents/skills/html-artifact/templates/spec-or-plan.html` (lines ~280–300) and the `.page-logo` rule in `Dropbox/.agents/skills/html-artifact/styles/globals.css`.

**Test scenarios:**
- Visual: open `spec-or-plan.html` after sync with theme inlined; confirm the page-logo slot is present (hidden) and the scroll-spy script runs without console errors.
- File: `wc -l` matches Dropbox install for all six files.

**Verification:** `diff -r Dropbox/.agents/skills/html-artifact design/html-artifact` (filtered to relevant files) returns no differences.

---

### U2. Add slide-shape CSS rules to `globals.css`

**Goal:** Land the default `aspect-ratio: 16/9` + `overflow: hidden` rule on `.layout > main > section`, the `.section-free` opt-out, the mobile reset at 720px, and the print rules. Also add the TOC slide-number counter.

**Requirements:** R1, R2, R3, R4, R5.

**Dependencies:** U1.

**Files:**
- `design/html-artifact/styles/globals.css`
- `Dropbox/.agents/skills/html-artifact/styles/globals.css` (mirror)

**Approach:**
- Find the existing "composable layout primitives" block (where `.stat-grid`, `.bento`, etc. live). Add a new commented section header above the dark-mode media query: `/* === Slide-shape sections === */`.
- Add three rules inside it:
  1. `.layout > main > section { aspect-ratio: 16 / 9; overflow: hidden; }` — slide default.
  2. `.layout > main > section.section-free { aspect-ratio: auto; overflow: visible; }` — opt-out.
  3. TOC counter: `.toc { counter-reset: slide; }`, `.toc a { counter-increment: slide; }`, `.toc a::before { content: counter(slide, decimal-leading-zero) " "; color: var(--text-muted); font-variant-numeric: tabular-nums; }`.
- Inside the existing `@media (max-width: 720px)` block (or add it if 720px doesn't exist — the existing theme uses 768px for tables; create a new 720px block above the 768px one): reset `.layout > main > section { aspect-ratio: auto; overflow: visible; }`. *Decision point during implementation:* if mobile staging across 720px and 768px looks wrong, unify on one breakpoint (see Key Technical Decisions).
- Add a new `@media print` block at the very bottom of the file:
  ```
  @page { size: landscape; }
  .layout > main > section { page-break-before: always; aspect-ratio: auto; overflow: visible; }
  .toc, .doc-header .pill-row, .doc-footer { display: none; }
  ```

**Patterns to follow:** existing primitive blocks in `globals.css` (look for `/* --- Window chrome ---`, `/* --- Stat grid ---` etc.) — same commenting style, same selector precision.

**Test scenarios:**
- Open the kitchen-sink test artifact at 1280×800 (light + dark). Confirm slide-shape sections render as 16:9 of the main column and clip overflow.
- Add `class="section-free"` to one section in the test. Confirm it returns to free height with full overflow visible.
- Resize the browser to 400px wide. Confirm all sections return to free height and the sidebar stacks on top.
- Resize back to 1280px. Confirm slide-shape resumes cleanly.
- Trigger print preview via `agent-browser pdf /tmp/slide-test.pdf`. Open the PDF. Confirm each slide-shape section is on its own landscape page; `.section-free` sections may span multiple pages.
- Sidebar TOC link text reads "01 Summary", "02 Goals", "03 …" with monospace-aligned numbers.

**Verification:** Visual smoke test against the kitchen-sink artifact in agent-browser at three viewports (1280, 720, 400) plus a PDF export. No console errors. CSS brace count balances.

---

### U3. Audit `spec-or-plan.html` against the slide grammar

**Goal:** Promote each `<article id="uN">` to a top-level `<section id="uN" class="section-free">` directly under `<main>`. Mark the implementation-units overview section `.section-free` (it contains the dependency SVG which is inherently tall). Audit every other section against the six-composition slide grammar and split or trim where needed.

**Requirements:** R6, R7.

**Dependencies:** U2.

**Files:**
- `design/html-artifact/templates/spec-or-plan.html`
- `Dropbox/.agents/skills/html-artifact/templates/spec-or-plan.html`

**Approach:**
- Walk each `<section>` in current `<main>`:
  - `#summary`: split into two slides — one for the prose paragraph(s), one for the optional `.stat-grid`. Currently mixes two compositions.
  - `#problem-frame`: headline + 1–2 paragraphs → fits slide-shape (composition a, prose variant).
  - `#requirements`: short table (≤5 rows in the template example) → fits slide-shape (composition f). Add a comment noting that real specs with > 5 requirements should mark the section `.section-free`.
  - `#key-technical-decisions`: list of decisions OR a `.compare-grid`. The template currently shows both. Split into two slides: one bullets-only section, one compare-grid section.
  - `#implementation-units`: mark `.section-free` (contains the dependency SVG, which is portrait-oriented and inherently tall). Strip the previous `<article>` wrappers — they become standalone sections below.
  - Each unit `U1`, `U2`, etc.: promote to top-level `<section id="uN" class="section-free">`. Mention this restructure in the TOC so authors keep the pattern.
  - `#test-scenarios`: short bullets → fits slide-shape.
  - `#risks-open-questions`: composition (a) — fits.
  - `#sources`: composition (a, list variant) — fits.
- Update the sidebar `<nav class="toc">` link list to match the new section IDs.
- Refresh the `<!-- comment -->` blocks above each section to call out the chosen composition (e.g., `<!-- composition: stat-grid -->`) so future authors see the grammar in action.

**Patterns to follow:** Existing section comments in the template (see the `Optional pill-tab nav` block).

**Test scenarios:**
- Visual: render the updated template (with theme inlined) and confirm each slide-shape section fits without clipping when filled with the template's placeholder content.
- Each unit section (`U1`, `U2`) shows up as a separate entry in the sidebar TOC with its own counter number.
- Print preview shows the implementation-units overview slide on its own page, then each unit section flowing onto subsequent pages (free-shape, may span multiple pages).

**Verification:** Manual visual audit at 1280×800; no clipping on slide-shape sections; sidebar TOC reads cleanly.

---

### U4. Audit `report.html` against the slide grammar

**Goal:** Mark the deep-dive code-with-margin section `.section-free` (annotated code is tall). Audit takeaways, how-it-works, and gotchas to fit the slide grammar.

**Requirements:** R6, R7.

**Dependencies:** U2.

**Files:**
- `design/html-artifact/templates/report.html`
- `Dropbox/.agents/skills/html-artifact/templates/report.html`

**Approach:**
- `#takeaways`: already a single callout — fits slide-shape (composition a, bullets variant).
- `#how-it-works`: headline + diagram → fits slide-shape (composition c).
- `#deep-dive`: contains code-with-margin + table. Mark `.section-free` — the annotated code is tall and the table may grow beyond 5 rows in real reports.
- `#gotchas`: checklist of ≤3 items → fits slide-shape (composition a, numbered variant).
- `#references`: list → fits slide-shape (composition a).

**Test scenarios:** Same shape as U3 — render the template, confirm slide-shape sections don't clip the placeholder content, confirm the deep-dive section grows freely.

**Verification:** Visual audit at 1280×800.

---

### U5. Audit `code-review.html` against the slide grammar

**Goal:** Mark the annotated-diff section `.section-free` (`.window-chrome` + line-numbered diff is inherently tall). Mark the findings section `.section-free` because real PRs commonly have > 5 findings. Keep the at-a-glance stats section slide-shape.

**Requirements:** R6, R7.

**Dependencies:** U2.

**Files:**
- `design/html-artifact/templates/code-review.html`
- `Dropbox/.agents/skills/html-artifact/templates/code-review.html`

**Approach:**
- `#summary-stats`: stat-grid → fits slide-shape (composition b).
- `#findings`: mark `.section-free` (table commonly > 5 rows in real reviews).
- `#diffs`: mark `.section-free` (window-chrome diff is tall).
- `#flow`: vertical SVG → mark `.section-free` (matches the R4-Q4 auto-free rule for portrait diagrams).
- `#tests`: short bullets → fits slide-shape.
- `#open`: short bullets → fits slide-shape.

**Test scenarios:** Visual audit; confirm the diffs section grows freely and the stat-grid summary clips into a slide cleanly.

**Verification:** Visual audit at 1280×800.

---

### U6. Wrap `playground.html` sections in `.section-free`

**Goal:** Playground sections are interactive control panels, not slide-shaped narrative. Apply `.section-free` to every section so the live preview, controls, and export blocks all grow to fit their content.

**Requirements:** R6.

**Dependencies:** U2.

**Files:**
- `design/html-artifact/templates/playground.html`
- `Dropbox/.agents/skills/html-artifact/templates/playground.html`

**Approach:**
- Add `class="section-free"` to `<section id="preview">`, `<section id="controls">`, `<section id="export">`.
- Leave the prose comment block (the "Other playground shapes" notes) inside `<main>` outside any section, since it's reference material not a slide.

**Test scenarios:** Open the template; confirm the preview pane, control grid, and export buttons all render without clipping. The playground.html template explicitly opts out of slide-shape uniformly.

**Verification:** Visual smoke test of the playground template at 1280×800.

---

### U7. Document the slide-shape layer in `SKILL.md`, `references/use-cases.md`, `references/skeleton.md`

**Goal:** Land prose guidance for the slide-shape layer alongside the existing layout-primitives guidance. Cover the 16:9 default, the `.section-free` opt-out with its four auto-categories, the slide grammar with worked examples, mobile + print behavior. Add `.section-free` to the class list in skeleton.md and the primitives list in use-cases.md.

**Requirements:** R7.

**Dependencies:** none (independent of CSS/template work; can run in parallel with U2–U6).

**Files:**
- `design/html-artifact/SKILL.md`
- `design/html-artifact/references/use-cases.md`
- `design/html-artifact/references/skeleton.md`
- The Dropbox-mirror equivalents.

**Approach:**
- In `SKILL.md`, add a new subsection right after `4b. Reach for layout primitives` (call it `4d. Slide-shape sections` since `4c. Add the product logo` already exists). Content:
  - The default rule: every `<section>` in `<main>` is 16:9 and clips overflow.
  - The opt-out: `class="section-free"` returns to free height.
  - The four auto-`section-free` categories (vertical flowcharts, `.code-numbered` diffs, tables > 5 rows, implementation-unit detail).
  - Slide grammar: list the six compositions and the "one per slide" rule. Forbid mixing.
  - Two worked examples: (1) "what fits in one slide" — show a stat-grid section. (2) "this needs splitting" — show a section that mixes a stat-grid and a bullet list, and the recommended split into two adjacent sections.
  - Mobile: `≤720px` collapses to free-height.
  - Print: each slide is one landscape page; `.section-free` sections flow naturally.
- In `references/use-cases.md`, add `.section-free` to the "Layout primitives" bullet list and include a one-line note on the slide grammar.
- In `references/skeleton.md`, add `.section-free` to the class names list (look for the existing class-list block).

**Patterns to follow:** the existing `4b. Reach for layout primitives` section in `SKILL.md` — same prose style, same level of detail, same use of inline class names in backticks.

**Test scenarios:**
- Skim each updated file end-to-end to verify the prose reads cleanly and references the right class names.
- Cross-reference the four templates — the worked examples should use real composition class names (`.stat-grid`, `.compare-grid`) that exist in the theme.

**Verification:** Manual read-through. No broken backtick references; no class names that don't exist; the slide-grammar list matches what's in the CSS.

---

### U8. Build kitchen-sink test artifact and verify in agent-browser

**Goal:** Generate a single self-contained HTML file that exercises the new slide-shape rule with a mix of slide and `.section-free` sections. Open it in agent-browser, screenshot at three viewports, and export as PDF. Use the screenshots to confirm visual correctness; do not commit the test artifact.

**Requirements:** R1, R2, R3, R4, R5 (verification of all visual requirements).

**Dependencies:** U2, U3, U4, U5, U6, U7.

**Files:**
- `/tmp/slide-test.html` (transient; not committed)
- `/tmp/slide-test.pdf` (transient; not committed)

**Approach:**
- Compose `slide-test.html` with the updated `globals.css` inlined.
- Include a sequence of sections that exercises every composition: stat-grid, bullets, compare-grid, pull-quote, short table, diagram (vertical → `.section-free`), `.code-numbered` (→ `.section-free`).
- Use `agent-browser open` then `agent-browser set viewport 1280 800`, then `agent-browser set media light` and `screenshot`. Repeat for dark.
- Resize to 400×800 mobile; screenshot.
- Export PDF: `agent-browser pdf /tmp/slide-test.pdf`. Open the PDF locally and visually confirm one slide per landscape page.

**Test scenarios:**
- Light desktop: every slide-shape section is exactly 16:9 of its column. None clip the placeholder content. `.section-free` sections grow naturally.
- Dark desktop: same, with no color drift.
- Mobile: every section is free-height. Sidebar stacks above main.
- PDF: each slide-shape section is on its own landscape page. `.section-free` sections may span multiple pages with `page-break-before: always` separating them from the next section.
- Console: no errors, no warnings, no missing resources.

**Verification:** Three screenshots saved to `/tmp/` for visual audit, plus the PDF. The implementer should LGTM the screenshots before commit. Do not commit the test artifacts.

---

### U9. Mirror Dropbox install and ship

**Goal:** Final mirror of `design/html-artifact/` → `Dropbox/.agents/skills/html-artifact/` so both copies are identical. Commit the public-repo changes with the unified commit message specified below and push to `addisonk/claude-code-skills` main.

**Requirements:** R8.

**Dependencies:** U1, U2, U3, U4, U5, U6, U7, U8.

**Files:** all files touched by U1–U7 across both repos.

**Approach:**
- `rsync` or `cp` from `design/html-artifact/` (public repo) to `/Users/addisonkowalski/Dropbox/.agents/skills/html-artifact/`. Confirm with a `diff -r` post-sync that the two trees match (excluding the public repo's `docs/plans/` and any other public-only directories).
- Stage and commit in the public repo only:
  ```
  feat(html-artifact): add slide-shape layer

  Every <section> in .layout > main now defaults to a 16:9 slide canvas
  with overflow: hidden. Sections opt out via class="section-free":
  vertical flowcharts, line-numbered diffs, tables > 5 rows, and
  implementation-unit detail are free by default. Slide grammar codified
  in SKILL.md: one composition per section (bullets, stat-grid, diagram,
  compare-grid, pull-quote, or short table). Mobile collapses to free
  height at <= 720px. Print emits one slide per landscape page; sidebar
  hidden. TOC links carry CSS-counter slide numbers.

  Also syncs prior local-only additions (page-logo slot, --logo-filter,
  scroll-spy IntersectionObserver) from the Dropbox install into the
  public repo so both copies are now in lockstep.
  ```
- `git push origin main`.

**Test scenarios:**
- `diff -r design/html-artifact/ Dropbox/.agents/skills/html-artifact/` returns zero differences (modulo any public-only files).
- `git log -1` on the public repo shows the commit landed.
- `git push` returns clean.

**Verification:** Confirm both with `git log --oneline -1` (public) and a tree diff (Dropbox mirror).

---

## Risks & Open Questions

<div class="risk risk-medium">
<strong>Medium risk: aspect-ratio + nested grids.</strong> The existing `.layout` uses a CSS grid. Aspect-ratio on its children inside a `minmax(0, 1fr)` track should work, but I haven't seen the exact combination tested. Mitigation: U2's verification step in agent-browser catches this early — if the grid track collapses or sections render with wrong width, fix during U2 before U3–U7 build on top.
</div>

<div class="risk risk-low">
<strong>Low risk: print page-break flooding.</strong> A real-world spec with 15 implementation units becomes 15 free-shape sections + their wrapper slides = potentially 30+ landscape pages in the PDF. That's actually the right outcome (a deck), but the user may want a `@media print` rule that collapses adjacent slide-shape sections onto one page when there's room. Defer to a follow-up if it becomes a complaint.
</div>

- **Open question (deferred to implementation):** does the existing 768px mobile breakpoint for table reflow interact awkwardly with the new 720px section collapse? Decide during U2 verification (see Key Technical Decisions).
- **Open question (deferred to implementation):** the `4c. Add the product logo` section in SKILL.md is in the Dropbox version but not the public version. U1 syncs it; U7 adds `4d. Slide-shape sections` after it. Double-check the section numbering doesn't collide with anything in the public version's existing headings.

## Scope Boundaries

**In scope:**
- The four shipped templates (`spec-or-plan.html`, `report.html`, `code-review.html`, `playground.html`).
- `styles/globals.css`.
- `SKILL.md` and the two reference files listed above.
- The Dropbox mirror.
- Visual verification in agent-browser at three viewports + PDF.

**Out of scope (deferred to follow-up work):**
- Scroll-snap (Q7 was explicit: plain scroll).
- Deck-mode JS (one-slide-at-a-time presentation mode).
- Adjacent-slide-collapse on print (the low-risk above).
- Slide thumbnails in the sidebar.

**Outside this skill's identity:**
- Generating slide-deck PowerPoint/Keynote output. The artifact remains an HTML file first; PDF is a side effect of print.

## Sources & References

- Prior grilling session in this conversation (Q1 through Q11) — every decision is captured in this plan's Requirements table.
- Existing `design/html-artifact/styles/globals.css` for the primitive-block style and selector precision.
- Existing `Dropbox/.agents/skills/html-artifact/templates/spec-or-plan.html` for the scroll-spy pattern and `.page-logo` slot.
- The inspiring article (referenced earlier in this conversation): "Using Claude Code: The Unreasonable Effectiveness of HTML."
