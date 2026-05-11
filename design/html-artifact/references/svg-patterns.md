# Inline SVG Patterns

Three canonical patterns for diagrams. Use inline `<svg>` only — never `<img>`, never CDN-hosted assets. Every diagram uses `class="diagram"` (the theme styles width/height), `currentColor` for strokes and fills (so dark mode just works), and a `<title>` for accessibility.

## Data flow

Use for request, data, or artifact movement between systems.

```html
<svg class="diagram" viewBox="0 0 640 180" role="img" aria-labelledby="data-flow-title" xmlns="http://www.w3.org/2000/svg">
  <title id="data-flow-title">Data flow: source to transform to sink</title>
  <defs>
    <marker id="arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
      <path d="M 0 0 L 10 5 L 0 10 z" fill="currentColor"></path>
    </marker>
  </defs>
  <rect x="24" y="58" width="150" height="64" rx="8" fill="none" stroke="currentColor"></rect>
  <text x="99" y="95" text-anchor="middle">Source</text>
  <line x1="184" y1="90" x2="292" y2="90" stroke="currentColor" marker-end="url(#arrow)"></line>
  <rect x="302" y="58" width="150" height="64" rx="8" fill="none" stroke="currentColor"></rect>
  <text x="377" y="95" text-anchor="middle">Transform</text>
  <line x1="462" y1="90" x2="570" y2="90" stroke="currentColor" marker-end="url(#arrow)"></line>
  <rect x="580" y="58" width="36" height="64" rx="8" fill="none" stroke="currentColor"></rect>
  <text x="598" y="95" text-anchor="middle">Sink</text>
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

Use for implementation-unit prerequisites and phase ordering.

```html
<svg class="diagram" viewBox="0 0 640 220" role="img" aria-labelledby="dependency-title" xmlns="http://www.w3.org/2000/svg">
  <title id="dependency-title">Dependency graph between implementation units</title>
  <defs>
    <marker id="dep-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
      <path d="M 0 0 L 10 5 L 0 10 z" fill="currentColor"></path>
    </marker>
  </defs>
  <rect x="40" y="76" width="120" height="56" rx="8" fill="none" stroke="currentColor"></rect>
  <text x="100" y="110" text-anchor="middle">U1</text>
  <rect x="260" y="32" width="120" height="56" rx="8" fill="none" stroke="currentColor"></rect>
  <text x="320" y="66" text-anchor="middle">U2</text>
  <rect x="260" y="132" width="120" height="56" rx="8" fill="none" stroke="currentColor"></rect>
  <text x="320" y="166" text-anchor="middle">U3</text>
  <rect x="480" y="76" width="120" height="56" rx="8" fill="none" stroke="currentColor"></rect>
  <text x="540" y="110" text-anchor="middle">U4</text>
  <line x1="164" y1="94" x2="254" y2="66" stroke="currentColor" marker-end="url(#dep-arrow)"></line>
  <line x1="164" y1="114" x2="254" y2="154" stroke="currentColor" marker-end="url(#dep-arrow)"></line>
  <line x1="384" y1="60" x2="474" y2="94" stroke="currentColor" marker-end="url(#dep-arrow)"></line>
  <line x1="384" y1="160" x2="474" y2="116" stroke="currentColor" marker-end="url(#dep-arrow)"></line>
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
- **One `<title>` per SVG.** Either `role="img"` + `<title>` (informative) or `aria-hidden="true"` (decorative).
- **Don't draw what a `<table>` could show better.** SVG is for spatial relationships and flow; tabular data belongs in `<table>`.
- **Don't draw what real HTML can show.** A 3-step process is fine as a numbered `<ol>` — save SVG for when arrows, branching, or 2D layout actually help.
