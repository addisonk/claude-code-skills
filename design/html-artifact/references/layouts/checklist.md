# checklist

Ordered steps with big numerals.

## When to use

- Sequential steps or instructions
- Recommendations, next actions, gotchas
- Anywhere a flat `<ul>` reads too quietly

## Composition

- One `.checklist` (`<ol>`), vertically centered in the canvas
- Each `<li>` gets a large accent-colored numeral via CSS counter
- A heading above; keep to ~3–5 items so they fit the canvas

## HTML skeleton

```html
<section id="how" class="slide layout-checklist">
  <h2>How to use a layout</h2>
  <ol class="checklist">
    <li>Pick the archetype that matches your content shape.</li>
    <li>Add <code>class="slide layout-name"</code> to the section.</li>
    <li>Drop in the matching primitive — the layout centers it.</li>
  </ol>
</section>
```

## Notes

- More than ~5 items will overflow the 16:9 canvas — split, or mark the section
  `.section-free` if the full list must stay together.
- Numerals use `--font-display` in the accent color.
