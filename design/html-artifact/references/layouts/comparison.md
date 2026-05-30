# comparison

Side-by-side approaches with tradeoffs, so a reader can pick.

## When to use

- Choosing between 2–4 candidate approaches
- Option A vs B vs C with pros and cons
- "We considered X, chose Y" decisions

## Composition

- One `.compare-grid` of 2–4 `.compare-card`s, vertically centered in the canvas
- Each card: a tag, a heading, a one-line description, and a
  `.compare-tradeoffs` list of `.pro` / `.con` items
- Mark the chosen option with `is-selected` for the accent ring

## HTML skeleton

```html
<section id="approaches" class="slide layout-comparison">
  <h2>Pick an approach</h2>
  <div class="compare-grid">
    <article class="compare-card">
      <span class="compare-tag">A</span>
      <h3>Polling</h3>
      <p>Simple, chatty.</p>
      <ul class="compare-tradeoffs"><li class="pro">trivial</li><li class="con">latency</li></ul>
    </article>
    <article class="compare-card is-selected">
      <span class="compare-tag">B</span>
      <h3>Webhooks</h3>
      <p>Chosen.</p>
      <ul class="compare-tradeoffs"><li class="pro">fast</li><li class="con">retries</li></ul>
    </article>
  </div>
</section>
```

## Notes

- Exactly one `is-selected` card per comparison reads clearest.
- Beyond 4 options the cards get too narrow — split or shortlist first.
