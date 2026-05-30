# Layout catalog

Named arrangements for slide-shape sections. Each layout is a CSS class
(`layout-<name>`) added alongside `slide` on a `<section>`. The class positions
the section's content **inside** the 16:9 slide canvas so the slide reads
composed instead of top-pinned. Most layouts center their content block
vertically; `editorial` uses a 60/40 grid.

Pick exactly one layout per section, matched to the content's *shape*. A section
with no `layout-*` class falls back to `stack` — top-aligned flow, the document
default. Full per-layout specs (when to use, HTML skeleton, the primitive each
wraps) live in `references/layouts/<name>.md`.

Adapted from the `ak-slide-deck` layout vocabulary, reinterpreted for
html-artifact's text + inline-SVG, no-raster-image contract: the image-forward
archetypes (hero, editorial, concept) become CSS compositions, with inline SVG
or a callout standing in for the photographic role.

## Layout index

| Layout | Purpose | Fill | Wraps primitive |
|--------|---------|------|-----------------|
| `hero` | Cover, section opener, the single biggest idea | flex, centered | headline + `.hero-bar` |
| `concept` | One abstract idea carried by a metaphor | flex, centered | `.diagram` SVG + caption |
| `editorial` | A paragraph beside a supporting visual | grid 60/40 | `.editorial-aside` |
| `data` | 2–4 anchor numbers / KPIs | flex, centered | `.stat-grid` |
| `comparison` | Picking between 2–4 approaches | flex, centered | `.compare-grid` |
| `quote` | One memorable sentence as a banner | flex, centered | `.pull-quote` |
| `checklist` | Ordered steps, gotchas, next actions | flex, centered | `.checklist` |
| `bento` | Feature overview, "X kinds of things" | flex, centered | `.bento` |
| `timeline` | Roadmap, phases, milestones (≤6) | flex, centered | `.timeline` |
| `diagram` | One diagram is the whole slide | flex, centered | `.diagram` SVG + caption |
| `stack` *(default)* | Prose, mixed bullets, anything else | top-aligned flow | — (no class) |

## Selection guide

| Content signal | Layout |
|----------------|--------|
| Title, cover, the one idea that matters most | `hero` |
| Mental model, framework, "how it works" abstraction | `concept` |
| A paragraph that needs a figure or callout beside it | `editorial` |
| Numbers, percentages, metrics, SLOs | `data` |
| Two-to-four candidate approaches with tradeoffs | `comparison` |
| A single quotable line worth setting off | `quote` |
| Steps, recommendations, gotchas, next actions | `checklist` |
| Feature inventory, multi-point overview | `bento` |
| Roadmap, phases, chronological progression | `timeline` |
| A flow / sequence / dependency graph that is the point | `diagram` |
| Prose or mixed content that fits no archetype | `stack` (no class) |

## Usage

```html
<section id="metrics" class="slide layout-data">
  <h2>By the numbers</h2>
  <div class="stat-grid">…</div>
</section>
```

- One layout per section. Don't combine two compositions in one slide — split
  into adjacent sections (one keeps its layout, the other picks its own).
- The layout only affects arrangement inside the canvas. The 16:9 shape, mobile
  collapse, and print page-per-slide behavior come from the slide-shape rules.
- Tall content (long tables, diffs, impl-unit detail) still opts out with
  `class="section-free"`; a free section ignores layout centering and grows.

## Deck rhythm

Vary the layout from slide to slide so a scrolled deck has texture — a `hero`
open, then `data`, `concept`, `editorial`, `comparison`, a `quote` breather, a
`checklist` close. Avoid three identical layouts in a row.

## Demo

`example-kitchen-sink.html` renders one slide per layout — open it to see all
eleven side by side, in light and dark mode.
