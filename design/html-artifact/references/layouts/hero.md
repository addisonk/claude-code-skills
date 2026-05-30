# hero

Maximum impact. The headline IS the slide.

## When to use

- Cover slide / title
- Section opener
- The single most important idea in the document

## Composition

- Oversized display headline (`<h2>`), vertically centered in the canvas
- A short accent bar (`.hero-bar`) above the headline
- At most one subtitle line (`.hero-sub`) — no body copy, no lists
- Everything left-aligned; the empty space around it is the design

## HTML skeleton

```html
<section id="cover" class="slide layout-hero">
  <div class="hero-bar"></div>
  <h2>The one big idea</h2>
  <p class="hero-sub">A single supporting line — optional.</p>
</section>
```

## Notes

- The headline uses `--font-display` at `clamp(2.2rem, 5vw, 3.75rem)`.
- Keep it to one idea. If you need bullets or a figure, it isn't a hero —
  use `stack`, `editorial`, or the matching layout.
