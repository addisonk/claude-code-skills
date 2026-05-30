# timeline

Horizontal milestones along a line.

## When to use

- Roadmaps, phases, release schedules
- Chronological progression (≤6 milestones)
- Any "then → then → then" sequence

## Composition

- One `.timeline`, vertically centered in the canvas
- Each `.milestone` has a `.date` and a `.label`; markers alternate above/below
  the connecting line
- A heading above

## HTML skeleton

```html
<section id="roadmap" class="slide layout-timeline">
  <h2>Roadmap</h2>
  <div class="timeline">
    <div class="milestone"><span class="date">W1</span><span class="label">CSS catalog</span></div>
    <div class="milestone"><span class="date">W2</span><span class="label">Reference docs</span></div>
    <div class="milestone"><span class="date">W3</span><span class="label">Templates</span></div>
    <div class="milestone"><span class="date">W4</span><span class="label">Ship</span></div>
  </div>
</section>
```

## Notes

- Cap at ~6 milestones; beyond that the labels crowd. Split into two slides.
- On mobile the timeline rotates to a vertical list automatically.
