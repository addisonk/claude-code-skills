# concept

Explain an abstract idea through a single visual metaphor.

## When to use

- Mental models, frameworks, strategies
- "How it works" explanations that benefit from a symbol
- An idea that lands better as an image than a paragraph

## Composition

- One inline-SVG metaphor (a key for access, a lock for security, a funnel for
  filtering), centered in the canvas
- A short caption beneath naming the idea the symbol stands for
- Content is center-aligned; the SVG is capped at ~60% of canvas height

## HTML skeleton

```html
<section id="access-model" class="slide layout-concept">
  <h2>Access is a key, not a wall</h2>
  <figure style="margin:0">
    <svg class="diagram" viewBox="0 0 200 200" role="img" aria-label="key">…</svg>
    <figcaption>One credential opens exactly the doors it should.</figcaption>
  </figure>
</section>
```

## Notes

- No raster images — the metaphor is inline SVG using `currentColor` so it
  inverts cleanly in dark mode.
- If the visual is a literal system flow rather than a metaphor, use `diagram`.
