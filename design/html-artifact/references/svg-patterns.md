# Inline SVG Patterns

Three canonical patterns for diagrams. Use inline `<svg>` only — never `<img>`, never CDN-hosted assets. Every diagram uses `class="diagram"` (the theme styles width/height), `currentColor` for strokes and fills (so dark mode just works), and a `<title>` for accessibility.

**Default to vertical layout.** Horizontal flows with more than 3–4 nodes get clipped on narrow viewports, in chat side panels, and when exported to PDF — the right-edge labels and trailing nodes are the first to disappear. Use a tall `viewBox` (roughly `320x640` for a 4-node flow) with arrows pointing down. The only pattern that stays horizontal is the sequence diagram, because actor lanes are inherently side-by-side; cap those at 3 lanes.

## Data flow

Use for request, data, or artifact movement between systems. Lay out top-to-bottom.

```html
<svg class="diagram" viewBox="0 0 320 480" role="img" aria-labelledby="data-flow-title" xmlns="http://www.w3.org/2000/svg">
  <title id="data-flow-title">Data flow: source to transform to sink</title>
  <defs>
    <marker id="arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
      <path d="M 0 0 L 10 5 L 0 10 z" fill="currentColor"></path>
    </marker>
  </defs>
  <rect x="60" y="24" width="200" height="64" rx="8" fill="none" stroke="currentColor"></rect>
  <text x="160" y="61" text-anchor="middle">Source</text>
  <line x1="160" y1="98" x2="160" y2="186" stroke="currentColor" marker-end="url(#arrow)"></line>
  <rect x="60" y="196" width="200" height="64" rx="8" fill="none" stroke="currentColor"></rect>
  <text x="160" y="233" text-anchor="middle">Transform</text>
  <line x1="160" y1="270" x2="160" y2="358" stroke="currentColor" marker-end="url(#arrow)"></line>
  <rect x="60" y="368" width="200" height="64" rx="8" fill="none" stroke="currentColor"></rect>
  <text x="160" y="405" text-anchor="middle">Sink</text>
</svg>
```

## Sequence

Use for ordered interactions between actors or subsystems.

```html
<svg class="diagram" viewBox="0 0 640 260" role="img" aria-labelledby="sequence-title" xmlns="http://www.w3.org/2000/svg">
  <title id="sequence-title">Sequence: actor A and B exchange via service</title>
  <defs>
    <marker id="seq-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
      <path d="M 0 0 L 10 5 L 0 10 z" fill="currentColor"></path>
    </marker>
  </defs>
  <text x="100" y="28" text-anchor="middle">Actor A</text>
  <text x="320" y="28" text-anchor="middle">Service</text>
  <text x="540" y="28" text-anchor="middle">Actor B</text>
  <line x1="100" y1="44" x2="100" y2="230" stroke="currentColor" stroke-dasharray="4 4"></line>
  <line x1="320" y1="44" x2="320" y2="230" stroke="currentColor" stroke-dasharray="4 4"></line>
  <line x1="540" y1="44" x2="540" y2="230" stroke="currentColor" stroke-dasharray="4 4"></line>
  <line x1="108" y1="82" x2="312" y2="82" stroke="currentColor" marker-end="url(#seq-arrow)"></line>
  <text x="210" y="74" text-anchor="middle">request</text>
  <line x1="328" y1="142" x2="532" y2="142" stroke="currentColor" marker-end="url(#seq-arrow)"></line>
  <text x="430" y="134" text-anchor="middle">notify</text>
  <line x1="312" y1="202" x2="108" y2="202" stroke="currentColor" marker-end="url(#seq-arrow)"></line>
  <text x="210" y="194" text-anchor="middle">result</text>
</svg>
```

## Dependency graph

Use for implementation-unit prerequisites and phase ordering. Lay out top-to-bottom; branch siblings sit side-by-side at each level.

```html
<svg class="diagram" viewBox="0 0 360 480" role="img" aria-labelledby="dependency-title" xmlns="http://www.w3.org/2000/svg">
  <title id="dependency-title">Dependency graph between implementation units</title>
  <defs>
    <marker id="dep-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
      <path d="M 0 0 L 10 5 L 0 10 z" fill="currentColor"></path>
    </marker>
  </defs>
  <rect x="120" y="24" width="120" height="56" rx="8" fill="none" stroke="currentColor"></rect>
  <text x="180" y="58" text-anchor="middle">U1</text>
  <rect x="40" y="200" width="120" height="56" rx="8" fill="none" stroke="currentColor"></rect>
  <text x="100" y="234" text-anchor="middle">U2</text>
  <rect x="200" y="200" width="120" height="56" rx="8" fill="none" stroke="currentColor"></rect>
  <text x="260" y="234" text-anchor="middle">U3</text>
  <rect x="120" y="376" width="120" height="56" rx="8" fill="none" stroke="currentColor"></rect>
  <text x="180" y="410" text-anchor="middle">U4</text>
  <line x1="160" y1="90" x2="110" y2="190" stroke="currentColor" marker-end="url(#dep-arrow)"></line>
  <line x1="200" y1="90" x2="250" y2="190" stroke="currentColor" marker-end="url(#dep-arrow)"></line>
  <line x1="110" y1="266" x2="160" y2="366" stroke="currentColor" marker-end="url(#dep-arrow)"></line>
  <line x1="250" y1="266" x2="200" y2="366" stroke="currentColor" marker-end="url(#dep-arrow)"></line>
</svg>
```

## Diff blocks

Not a diagram, but commonly needed for code-review artifacts. The theme provides `.diff-add`, `.diff-del`, `.diff-meta` colors.

```html
<pre><code><span class="diff-meta">--- a/src/login.ts</span>
<span class="diff-meta">+++ b/src/login.ts</span>
<span class="diff-meta">@@ -42,7 +42,10 @@</span>
   const user = await db.users.findByEmail(email);
<span class="diff-del">-  if (!user) return null;</span>
<span class="diff-add">+  if (!user) {</span>
<span class="diff-add">+    await delay(constantTimeMs);</span>
<span class="diff-add">+    return null;</span>
<span class="diff-add">+  }</span>
   return verifyPassword(user, password);</code></pre>
```

## Rules

- **Inline only.** No `<img src="...">`, no external SVG references.
- **`currentColor` everywhere.** Strokes and fills inherit from the page's text color, so dark mode flips automatically without per-SVG overrides.
- **`viewBox`, not `width`/`height` attributes.** The theme's `.diagram` rule handles responsive sizing.
- **Vertical, not horizontal.** Flows go top-to-bottom with arrows pointing down. Wide diagrams overflow narrow viewports and side panels and chop off the rightmost nodes and labels. Tall diagrams scroll naturally.
- **One `<title>` per SVG.** Either `role="img"` + `<title>` (informative) or `aria-hidden="true"` (decorative).
- **Don't draw what a `<table>` could show better.** SVG is for spatial relationships and flow; tabular data belongs in `<table>`.
- **Don't draw what real HTML can show.** A 3-step process is fine as a numbered `<ol>` — save SVG for when arrows, branching, or 2D layout actually help.
