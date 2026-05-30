# editorial

Magazine-style split: prose on the left, a supporting visual or callout on the
right.

## When to use

- An idea that needs a paragraph of explanation **and** a figure beside it
- Case studies, feature highlights, "claim + evidence" slides
- Anywhere a single column would feel either too text-heavy or too sparse

## Composition

- A 60/40 CSS grid: prose column left, aside column right, both vertically
  centered in the canvas
- Left: a heading and 1–2 short paragraphs
- Right (`.editorial-aside`): one supporting element — a `.stat-card`, a small
  inline-SVG `.diagram`, a `.pull-quote`, or a compact callout
- Collapses to one column below 768px

## HTML skeleton

```html
<section id="why" class="slide layout-editorial">
  <div>
    <h2>The split that reads like a spread</h2>
    <p>A paragraph of explanation on the left…</p>
    <p>…with a second short paragraph if needed.</p>
  </div>
  <div class="editorial-aside">
    <div class="stat-card">
      <p class="stat-label">image : text</p>
      <p class="stat-value">40 / 60</p>
      <p class="stat-context">no raster — SVG or callout</p>
    </div>
  </div>
</section>
```

## Notes

- This is the one catalog layout that is a grid, not a centered flex column.
- Keep the aside to a single element; it is support, not a second slide.
