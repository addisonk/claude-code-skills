# diagram

One diagram is the whole slide.

## When to use

- A flow, sequence, or dependency graph that IS the point
- System overviews, pipelines, request paths
- Anywhere the picture explains faster than prose

## Composition

- One inline-SVG `.diagram`, centered in the canvas, capped at ~60% height
- A short caption beneath
- A heading above; no competing body copy

## HTML skeleton

```html
<section id="pipeline" class="slide layout-diagram">
  <h2>Pipeline overview</h2>
  <figure style="margin:0;width:100%">
    <svg class="diagram" viewBox="0 0 640 130" role="img" aria-label="pipeline">…</svg>
    <figcaption>Source → Transform → Sink.</figcaption>
  </figure>
</section>
```

## Notes

- See `references/svg-patterns.md` for data-flow, sequence, and dependency-graph
  SVG templates.
- **Portrait/tall diagrams** (vertical flowcharts) overflow the 16:9 canvas — put
  those in a `.section-free` section instead of `layout-diagram`.
- `diagram` is for a literal system picture; for a metaphor, use `concept`.
