# Signature Elements

The signature element is the one visual tic that makes a product recognizable. Tokens get the artifact 60–70% on-brand; primitives get it another 15–20%; the signature element is what makes the remaining gap close from "well-designed dark dashboard" to "this product specifically."

## Why one element matters

Every distinctive product has one thing a regular user could pick out of a lineup. Linear has the bezeled sidebar with the gradient seam. Notion has the rounded inline-mention pills. Stripe has the gradient-pulse hero panels. Arc has the glassy color-tinted browser chrome. Figma has the flat blue accent + bone-white surface combination. None of those products are recognizable from their *tokens alone* — they're recognizable from a single distinctive *shape*.

If you can't find one, the project either doesn't have a developed visual identity yet (don't fake one), or you haven't dug deep enough.

## How to find it

In rough priority order:

1. **Look for a custom-named component.** A repo with `hud-card.tsx`, `glass-panel.tsx`, `bezel-frame.tsx`, `feature-tile.tsx` is signaling that this thing is intentional and named. Read it. The naming itself is a tell.
2. **Look for unusual CSS in primitives.** `clip-path: polygon(...)`, complex `mask-image`, custom `border-image`, multi-layer `box-shadow`, gradients with weighted color stops — anything beyond "border + radius + bg-color" is a candidate.
3. **Look for SVG overlays inside primitives.** Brackets, corner marks, scanlines, status indicators baked into the component shell.
4. **Look at the dev preview pages or storybook.** If there's a page dedicated to one specific component (not a generic Card variant page, but a `/dev/hud-card` page), that's the team telling you what they care about.
5. **Look at the marketing screenshots.** If the team uses one component disproportionately in their hero shots, that's the brand.
6. **Look at the most-imported composition.** If a feature surface uses the same custom shell over and over, that shell is the system.

## Common signature patterns

| Signature | How it's built | Reproduce in HTML/CSS via |
|-----------|----------------|----------------------------|
| Chamfered card (corners cut) | `clip-path: polygon(...)` with corner cuts | Same `clip-path` + a hairline `::before` ring |
| Bracketed corners | SVG overlay with L-shapes | Inline SVG positioned absolutely |
| Bezeled / frame | `border-image` or layered box-shadows | Same |
| Glassy panel | `backdrop-filter: blur` + tinted bg | Same (note browser support if offline) |
| Scan-line overlay | Repeating linear-gradient at low opacity | Same |
| Gradient seam | Single thin gradient between two surfaces | Same |
| Branded radius rhythm | Specific radius pattern (e.g. only top corners rounded) | Match the exact radius rule |
| Custom focus ring | Multi-layered box-shadow with brand color | Same |
| Bespoke icon stroke convention | Specific Lucide stroke width + line-cap | Document and apply consistently |

## Reproducing it faithfully

The HTML output needs to *look like the source component* in a browser, not match its DOM. That means:

- **Read the React/Vue/Svelte source carefully.** Not just the JSX — the CSS module, the cva variants, the inline styles.
- **Extract the geometry math.** If the component computes a `clip-path: polygon(...)` from a `cut` prop, find what value it's actually called with in production usage and bake that in.
- **Verify in a browser.** Render side-by-side with the real component if you can.

For complex signature elements, fidelity below ~80% is a failure — readers can tell. Either invest in getting it right or document it as "approximate" with a link to the canonical source.

## Don't invent signatures

If a project genuinely has no signature element (it's pure shadcn defaults, no customization), don't manufacture one. Document what's there. Either:
- The product really is on the generic side and that's accurate
- The team hasn't developed visual identity yet and the right next step is design work, not extraction

Inventing a signature would make the design-system.html aspirational rather than descriptive, which breaks the "match this" contract for future prompts.

## When there are multiple signatures

Pick the most distinctive one for the dedicated section. Briefly note the others in the primitives gallery. Don't try to give equal weight to three signature elements — readers should be able to point to one thing and say "that's the brand."
