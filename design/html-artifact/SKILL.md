---
name: html-artifact
description: Use when the user asks for an HTML file or HTML artifact instead of markdown — specs, plans, brainstorms, reports, research write-ups, PR / code review explainers, design explorations, mockups, prototypes, playground editors, slideshows, or any output that benefits from richer-than-markdown formatting (tables, SVG diagrams, color, layout, dark mode, mobile responsiveness). Trigger phrases include "make a HTML file", "make an HTML artifact", "HTML version", "HTML view", "as HTML", "explorer page", "explainer page", "interactive page", or any request for a shareable single-file deliverable. Produces one self-contained HTML5 file (embedded CSS, inline SVG, no external resources) ready to open locally or upload anywhere.
allowed-tools: Read, Write, Edit, Glob, Grep, Bash, Agent
---

# HTML Artifact

## Overview

Markdown is the default file format agents use to talk back to humans, but it stops scaling around ~100 lines. Specs, plans, reports, code reviews, and design explorations all get harder to read and share as they grow. A single self-contained HTML file gets you tables, color, SVG diagrams, mobile layout, dark mode, anchored TOCs, and a link you can drop into a chat — without giving up the "model wrote it, I can re-prompt it" workflow.

**Core principle:** one file, no external resources, opens anywhere. Embedded `<style>`, inline `<svg>`, no remote fonts/scripts/images. The artifact survives email attachments, S3 uploads, AirDrop, and offline reading.

Inspired by Thariq Shihipar's [The Unreasonable Effectiveness of HTML](https://thariqs.github.io/html-effectiveness/) and the [compound-engineering ce-plan `--html`](https://github.com/EveryInc/compound-engineering-plugin/pull/809) shared theme. This skill generalizes the shared theme so any document-style output — not just plans — can be emitted as HTML.

## When to Use

- User explicitly asks for HTML: "make an HTML file", "HTML artifact", "HTML version", "as HTML"
- A spec, plan, brainstorm, report, or research write-up is about to exceed ~100 lines of markdown
- Output benefits from at least one of: real tables, inline SVG diagrams, color-coded callouts, side-by-side comparison, anchored TOC, a copy-to-clipboard button
- User wants something shareable beyond the terminal — a link to drop in Slack, an attachment for a PR, a page they can show a non-technical reviewer
- A PR / code-review explainer where rendered diffs, severity-colored findings, or flowcharts beat a markdown wall of text
- A design exploration: 6 variants in a grid, mobile/desktop side-by-side, an interactive prototype with sliders
- A "throwaway editor" — drag-and-drop reordering, form-based config editor, prompt tuner — with a copy-as-JSON / copy-as-prompt button

## When NOT to Use

- The output is meant to be consumed by another agent or skill that expects markdown (ce-work, ce-doc-review, ce-code-review) — produce markdown and optionally also produce an HTML view
- The artifact will be source-controlled and reviewed in PR diffs — HTML diffs are noisy and hard to read; prefer markdown
- The output is a short answer that fits in one screen of the terminal — just answer in chat
- The user wants a full React/Next app or production page — use `frontend-design`, `shadcn`, or `interface-design` instead
- The project already has a design system extracted to `design-system.html` and the user wants on-brand HTML — combine this skill with `design-system-to-html` (reference its tokens)

## Quick Start

If the user just said "make an HTML file for X", you can move fast:

1. Read `templates/spec-or-plan.html`, `templates/report.html`, `templates/code-review.html`, or `templates/playground.html` — whichever fits the use case (see `references/use-cases.md` for picking the right one).
2. Fill in the content. Keep the embedded `<style>` block from the template — it pulls from `styles/globals.css` and gives you light/dark mode + mobile responsive out of the box.
3. Write to disk at the path agreed with the user (default: `<cwd>/<descriptive-name>.html`).
4. Print the absolute path so the user can ⌘-click to open, and offer to run `scripts/open-in-browser.sh <path>`.

## Workflow

### 1. Pick the use case

Five canonical use cases — see `references/use-cases.md` for full examples and matching prompts.

- **Spec / Plan / Brainstorm** — long-form document with TOC, sections, tables, optional SVG. Template: `spec-or-plan.html`.
- **Report / Research / Explainer** — synthesizes a topic with diagrams, callouts, and a "key takeaways" block. Template: `report.html`.
- **Code review / PR explainer** — line-numbered diff with severity-colored margin annotations and a findings table. Template: `code-review.html`.
- **Design exploration / mockup grid** — 2–6 variants laid out side-by-side for comparison. Template: `spec-or-plan.html` with the `.compare-grid` block (selected card marked with `is-selected`).
- **Playground / throwaway editor** — interactive sliders, toggles, drag-and-drop, form editors with copy-as-prompt / copy-as-diff / copy-as-JSON exports. Template: `playground.html`.

### 2. Decide on file location

Default save paths in order of preference:

```
docs/<descriptive-name>.html         # if a docs/ folder already exists
docs/plans/<YYYY-MM-DD>-<name>.html  # for plans
docs/reports/<name>.html             # for reports
./<descriptive-name>.html            # cwd fallback
/tmp/<name>.html                     # for throwaway editors / explorations
```

Confirm with the user before writing if the path isn't obvious.

### 3. Generate the file

Use the matching template from `templates/`. Each template:

- Inlines the entire CSS theme from `styles/globals.css` in a single `<style>` block
- Provides a header (eyebrow + h1 + summary + frontmatter pills + JSON script tag)
- Provides an anchored TOC and `<main>` container
- Includes the dark-mode + mobile-responsive media queries
- Uses semantic HTML (`<section>`, `<article>`, `<table>`, `<thead>`, `<tbody>`, `<th>`)

If the project already has a `design-system.html`, prefer its tokens over the default theme — read it and replace `:root` variables. See the `design-system-to-html` skill.

After reading project styling sources such as `globals.css`, `DESIGN.md`, design tokens, or `design-system.html`, also read `references/document-readability.md`. Treat project styling as brand input; use the readability reference to adapt typography, spacing, and section layout for long-form documents.

### 4. Add diagrams when they help

Use inline SVG, never images. Three canonical patterns are in `references/svg-patterns.md`:

- **Data flow** — request/data/artifact movement between systems
- **Sequence** — ordered interactions between actors
- **Dependency graph** — phase ordering, unit prerequisites

Each pattern uses `class="diagram"`, `currentColor` for stroke/fill, and a `<title>` for accessibility. Strokes follow the dark-mode-aware theme automatically.

**Lay out flows vertically (top-to-bottom), not horizontally.** Horizontal chains with more than 3–4 nodes get cropped on narrow viewports, in side panels, and in PDFs — labels at the right edge get cut off. Use a tall `viewBox` (e.g. `320x640`) with arrows pointing down. Sequence diagrams are the one exception: their actor lanes are inherently horizontal, but keep them to ≤3 lanes.

### 4b. Reach for layout primitives instead of plain prose

The theme ships composable blocks that read faster than a wall of paragraphs. Use them when the content shape matches:

- **`.stat-grid` / `.stat-card`** — 2–4 anchor numbers (SLOs, volumes, deadlines). Big sans-serif value in accent color over a short uppercase label.
- **`.bento`** — varied-size tiles with one hero + 3–5 supporting. Good for "X kinds of things" overviews, feature inventories, design-system summaries.
- **`.timeline`** — horizontal milestone bar for roadmaps and phases (≤6 milestones). Stacks vertically on mobile.
- **`.checklist`** — ordered list with big accent-colored numerals. Use for gotchas, recommendations, and next-step lists where a flat `<ul>` reads too quietly.
- **`.compare-grid` / `.compare-card`** — 2–4 side-by-side approach cards with `+ / −` tradeoffs. Mark the chosen one with `is-selected`.
- **`.tabs`** — pill-style tab nav. Use as an alternative to the sidebar TOC when the document splits into a few large parts.
- **`.window-chrome` + `.code-numbered`** — macOS-style file-window wrap around line-numbered code. Pairs with `.margin-note.severity-{blocking,nit,nice}` to attach review comments beside the code.
- **`.pull-quote`** — for the one sentence in a report worth setting off as a banner.

These are all composable — drop them inside any `<section>` of any template. They share the same dark-mode-aware tokens, so no per-component theming is needed.

### 4c. Add the product logo (optional but recommended)

Every template now ships with a `<div class="page-logo" hidden>` slot inside the sidebar `<nav class="toc">` and a built-in scroll-spy script that highlights the section currently in view. A logo in the sidebar makes the artifact feel like the product's, not a generic template.

**Detect it.** Auto-search the usual spots:

```bash
find . -maxdepth 4 \( -name "logo.svg" -o -name "logo.png" -o -name "logo.jpg" \
  -o -name "logo-light.svg" -o -name "logo-dark.svg" -o -name "icon.svg" \) \
  -not -path "*/node_modules/*" -not -path "*/.git/*" -not -path "*/dist/*" \
  -not -path "*/build/*" -not -path "*/.next/*" 2>/dev/null | head
```

Look in `public/`, `assets/`, `src/assets/`, `app/`, `brand/`, `branding/`, `static/`.

**Found one?** Use AskUserQuestion to confirm: *"Use `<path>` as the artifact's header logo?"* Options: **Yes** / **Pick a different path** / **Skip (use text-only header)**.

**Found nothing?** AskUserQuestion: *"No product logo found. Provide a path, or skip?"* Options: **Provide path** / **Skip**.

**Embed it.** Replace the `<div class="page-logo" hidden></div>` slot and drop the `hidden` attribute:

- **SVG:** paste the raw markup. Inline SVG stays crisp at any zoom.
  ```html
  <div class="page-logo"><svg viewBox="0 0 24 24">…</svg></div>
  ```
- **PNG / JPG:** base64-encode and use a data URL on an `<img>`:
  ```html
  <img class="page-logo" alt="Acme" src="data:image/png;base64,…">
  ```

Never use an external `src` — that defeats the offline / single-file contract.

**Dark mode.** The theme defines `--logo-filter`. In light mode the logo renders in its natural color; in dark mode (`prefers-color-scheme: dark`) it's collapsed to a white silhouette via `brightness(0) invert(1)`. Color logos lose color in dark mode — acceptable v1 tradeoff. If color preservation matters for a specific artifact, override `--logo-filter: none` in that file's `<style>` block.

### 5. Verify

Open the file in a browser. Required checks (the `agent-browser` skill can automate these):

- Light mode renders without overflow at desktop (1280px+)
- Dark mode (toggle OS or check via `prefers-color-scheme`) renders without color drift
- Mobile (400px) layout reflows — TOC stacks on top, tables convert to label-prefixed blocks
- No console errors, no broken anchors, no missing resource warnings (proves the file is truly self-contained)
- File size under 80KB for typical document outputs; under 200KB for design-heavy explorations

### 6. Share or hand off

After the file is written:

1. Print the absolute path on its own line (clickable in most terminals).
2. Offer next steps:
   - "Open in browser" — run `scripts/open-in-browser.sh <path>`
   - "Upload for sharing" — if Vercel / S3 / GitHub Pages is wired up
   - "Iterate" — keep the same file open and edit sections in place

## Frontmatter Contract

Every HTML artifact preserves frontmatter in two places so it round-trips with markdown sources:

1. **Pills** in the header — one chip per scannable key (status, type, date, origin)
2. **JSON script tag** — `<script type="application/json" id="<slug>-frontmatter">{...}</script>` for programmatic parsing

This makes HTML artifacts a strict superset of markdown frontmatter, not a replacement.

## Quality Bar

- **Self-contained** — no `<link rel="stylesheet">`, no `<script src="...">`, no `<img src="https://...">`, no `@import url(...)`, no web fonts. Open offline to verify.
- **Embedded theme** — single `<style>` block at the top, the full theme from `styles/globals.css`. No CSS files referenced externally.
- **Semantic HTML** — real `<table>` for tabular data, real `<section>` / `<article>` for grouping, real `<h2>` / `<h3>` for headings. No `<div>` soup.
- **ASCII IDs only** — anchors like `#summary`, `#requirements`, `#u1`. No emoji or non-ASCII in IDs.
- **Mobile-responsive** — readable at 400px viewport. Tables collapse to stacked label-prefixed rows.
- **Dark mode** — `@media (prefers-color-scheme: dark)` automatically swaps the palette.
- **Inline SVG only** — `class="diagram"`, `currentColor`, `<title>` for accessibility. No raster images.
- **Embedded logo (if used)** — inline SVG markup or a base64 data URL in `<div class="page-logo">` / `<img class="page-logo">`. Never an external `src=`. Dark-mode silhouetting is automatic via the `--logo-filter` theme variable.
- **Under 80KB** for typical documents; under 200KB for visual-heavy explorations.

## Common Mistakes

- **Linking to CDN fonts / Tailwind / a script src.** Defeats the offline / shareable property. Embed everything.
- **Producing HTML when the consumer needs markdown.** If `ce-work` / `ce-doc-review` / another agent will read the file, write markdown. HTML is a *view* of the source, not a replacement for it.
- **Wrapping markdown in `<pre>`.** That just renders monospaced text. Convert structure to semantic HTML — `<table>`, `<section>`, `<article>` — so the artifact actually reads better than the markdown source.
- **ASCII diagrams in `<pre>` when SVG would do.** SVG is the whole point. If you find yourself using box-drawing characters, swap to an inline SVG from `references/svg-patterns.md`.
- **Unique CSS per artifact.** The theme exists so every artifact looks like the same product family. Customize tokens (`:root` variables) if needed, not selectors.
- **Skipping the JSON frontmatter script tag.** Without it, the HTML can't round-trip with markdown sources, which kills the spec-as-source-of-truth workflow.
- **Skipping mobile-responsive testing.** The CSS handles it for you — verify in a browser at 400px width before declaring done.
- **Not verifying in a browser.** Type-checking the markup is not the same as seeing it render. Always open the file (or use `agent-browser` to take a screenshot) before reporting done.

## Files in this skill

- `SKILL.md` — this file
- `references/use-cases.md` — five canonical use cases with example prompts and structural hints
- `references/document-readability.md` — advisory rules for adapting brand styling into readable long-form artifacts
- `references/skeleton.md` — the canonical document skeleton, frontmatter contract, and anchor ID conventions
- `references/svg-patterns.md` — data-flow, sequence, and dependency-graph inline SVG patterns
- `styles/globals.css` — embedded CSS theme (light/dark, mobile-responsive) — copied into every artifact's `<style>` block
- `templates/spec-or-plan.html` — spec / plan / brainstorm starting template
- `templates/report.html` — report / research / explainer template with key-takeaways callout
- `templates/code-review.html` — PR explainer with line-numbered diff and severity-colored margin annotations
- `templates/playground.html` — interactive playground / throwaway editor template with copy-as-prompt / copy-as-diff / copy-as-JSON
- `scripts/open-in-browser.sh` — open a generated HTML file in the system default browser
