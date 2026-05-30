# data

Numbers are the message.

## When to use

- 2–4 anchor metrics: SLOs, volumes, deadlines, growth figures
- A "by the numbers" slide
- Before/after or target/actual pairs

## Composition

- One `.stat-grid` of 2–4 `.stat-card`s, vertically centered in the canvas
- Each card: big value in the accent color, short uppercase label, optional
  one-line context
- A heading above; nothing else competing for attention

## HTML skeleton

```html
<section id="stats" class="slide layout-data">
  <h2>By the numbers</h2>
  <div class="stat-grid">
    <div class="stat-card">
      <p class="stat-label">p99 latency</p>
      <p class="stat-value">180 ms</p>
      <p class="stat-context">at the gateway</p>
    </div>
    <div class="stat-card">
      <p class="stat-label">volume</p>
      <p class="stat-value">12k/s</p>
      <p class="stat-context">peak day</p>
    </div>
  </div>
</section>
```

## Notes

- Cap at 4 cards — beyond that the row wraps and stops scanning as "anchors."
- The big values render in `--font-display` (sans-serif) in the accent color.
