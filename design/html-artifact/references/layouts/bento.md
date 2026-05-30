# bento

Varied-size tiles, one hero. Apple-keynote feel.

## When to use

- Feature overviews, product summaries
- "X kinds of things" inventories
- 4–6 related-but-distinct points shown at once

## Composition

- One `.bento` grid, vertically centered in the canvas
- One `.bento-hero` tile (2×2) anchors it; 3–5 smaller tiles surround
- Use `.bento-wide` / `.bento-tall` to vary tile spans
- Each tile is self-contained: a short `<h3>` + one line

## HTML skeleton

```html
<section id="features" class="slide layout-bento">
  <h2>Feature bento</h2>
  <div class="bento">
    <div class="bento-hero"><h3>Hero tile</h3><p>The anchor.</p></div>
    <div><h3>Tile</h3><p>Supporting point.</p></div>
    <div><h3>Tile</h3><p>Supporting point.</p></div>
    <div class="bento-wide"><h3>Wide tile</h3><p>Spans two columns.</p></div>
  </div>
</section>
```

## Notes

- Keep tiles terse — bento is a glanceable overview, not a detail view.
- On mobile the grid collapses to two columns automatically.
