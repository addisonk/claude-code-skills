# quote

One statement dominates the slide.

## When to use

- A memorable line, principle, or design tenet
- A user quote or a one-sentence thesis
- A breather between dense slides

## Composition

- One `.pull-quote`, enlarged and vertically centered in the canvas
- Optional `<cite>` for attribution
- Nothing else — the sentence is the whole slide

## HTML skeleton

```html
<section id="thesis" class="slide layout-quote">
  <blockquote class="pull-quote">
    Every section is a slide; one composition per canvas.
    <cite>— the design brief</cite>
  </blockquote>
</section>
```

## Notes

- In this layout the pull-quote scales up to `clamp(1.5rem, 2.6vw, 2.15rem)`.
- Use sparingly — one or two per deck. Overused, the impact flattens.
