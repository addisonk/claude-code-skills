# Document Skeleton

The canonical structure every HTML artifact extends. Templates in `templates/` are concrete instances of this skeleton. Read this when you need to extend a template or build a section it doesn't cover.

## Bare skeleton

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>{{title}}</title>
  <style>
    /* Paste the entire contents of styles/theme.css here. */
  </style>
</head>
<body>
  <header class="doc-header">
    <p class="eyebrow">{{kicker}}</p>
    <h1>{{title}}</h1>
    <p class="summary">{{one_paragraph_summary}}</p>
    <div class="pill-row" aria-label="Frontmatter">
      {{frontmatter_pills}}
    </div>
    <script type="application/json" id="{{slug}}-frontmatter">
      {{frontmatter_json}}
    </script>
  </header>

  <div class="layout">
    <nav class="toc" aria-label="Table of contents">
      {{toc_links}}
    </nav>

    <main>
      {{sections}}
    </main>
  </div>

  <footer class="doc-footer">
    <p>{{origin_note}}</p>
  </footer>
</body>
</html>
```

## Frontmatter Contract

Every artifact preserves frontmatter in two places.

**1. Human-readable pills** — one chip per scannable key:

```html
<span class="pill pill-status-active">status: active</span>
<span class="pill pill-type-feat">type: feat</span>
<span class="pill pill-date">date: 2026-05-11</span>
<span class="pill pill-origin">origin: docs/brainstorms/onboarding.md</span>
```

Pill classes follow `pill pill-<key>-<value>` for keys with a small enum (status, type), or just `pill pill-<key>` for free-form values.

**2. Machine-readable JSON** — inside `<script type="application/json">`:

```html
<script type="application/json" id="onboarding-frontmatter">
  {
    "title": "Onboarding Redesign",
    "type": "feat",
    "status": "active",
    "date": "2026-05-11",
    "origin": "docs/brainstorms/onboarding.md"
  }
</script>
```

The script `id` is the artifact slug + `-frontmatter`. The JSON must round-trip exactly to the original frontmatter — same keys, same values, no synthesis.

## Anchor ID conventions

Use stable ASCII IDs so anchors survive edits and the TOC keeps working.

Common section IDs:

- `#summary`
- `#problem-frame`
- `#requirements`
- `#scope-boundaries`
- `#context-research`
- `#key-technical-decisions`
- `#implementation-units`
- `#u1` … `#uN` for implementation units (don't renumber across edits)
- `#system-wide-impact`
- `#test-scenarios`
- `#risks-open-questions`
- `#sources`

Reports / explainers use:

- `#summary`
- `#takeaways`
- `#how-it-works`
- `#deep-dive`
- `#gotchas`
- `#references`

Playgrounds use:

- `#preview`
- `#controls`
- `#export`

## TOC structure

The TOC is a sticky sidebar on desktop and stacks on top on mobile (the theme handles both). Use one `<a href="#id">Label</a>` per top-level section.

```html
<nav class="toc" aria-label="Table of contents">
  <a href="#summary">Summary</a>
  <a href="#requirements">Requirements</a>
  <a href="#implementation-units">Implementation</a>
  <a href="#u1">U1. Scaffold the route</a>
  <a href="#u2">U2. Wire the form</a>
  <a href="#test-scenarios">Tests</a>
  <a href="#sources">Sources</a>
</nav>
```

Unit-level entries (U1, U2) are optional but useful when a plan has more than 3 units.

## Section types

### Plain section

```html
<section id="summary">
  <h2>Summary</h2>
  <p>One or two paragraphs.</p>
</section>
```

### Section with table

```html
<section id="requirements">
  <h2>Requirements</h2>
  <div class="table-wrap">
    <table>
      <thead>
        <tr><th>ID</th><th>Requirement</th><th>Status</th></tr>
      </thead>
      <tbody>
        <tr>
          <td data-label="ID">R1</td>
          <td data-label="Requirement">Users can log in with email + password.</td>
          <td data-label="Status"><span class="status-ok">Met</span></td>
        </tr>
      </tbody>
    </table>
  </div>
</section>
```

`data-label` attributes drive the mobile (≤768px) collapsed-row view automatically.

### Implementation unit article

```html
<article id="u1">
  <h3>U1. Scaffold the route</h3>
  <p>One-sentence purpose.</p>
  <h4>Test scenarios</h4>
  <div class="table-wrap">
    <table>
      <thead><tr><th>Scenario</th><th>Expected</th></tr></thead>
      <tbody>
        <tr>
          <td data-label="Scenario">Visit /onboarding</td>
          <td data-label="Expected">Returns 200 with the email step</td>
        </tr>
      </tbody>
    </table>
  </div>
</article>
```

### Callout

```html
<aside class="notice">
  <strong>Note:</strong> This is the HTML view. The markdown source lives at <code>docs/plans/2026-05-11-onboarding.md</code>.
</aside>

<aside class="callout callout-warning">
  <strong>Warning:</strong> This migration is irreversible.
</aside>

<aside class="callout callout-success">
  <strong>Done:</strong> All checks passed.
</aside>
```

### Risk block

```html
<div class="risk risk-high">
  <strong>High risk:</strong> Concurrent writes during the backfill window.
</div>
```

## Implementation note

If the HTML view is derived from a markdown source that another agent / skill consumes, always emit this near the top:

```html
<aside class="notice">
  <strong>Implementation note:</strong> This is the HTML view of <code>{{source_path}}</code>. The markdown source remains the workflow source of truth — downstream skills consume the markdown.
</aside>
```

This prevents confusion when someone hands the HTML file to an agent that expected the markdown.
