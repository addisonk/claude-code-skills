# Lucide Design Principles — The 13 Rules

Every Lucide icon must adhere to these 13 core design rules. These are non-negotiable constraints that define the visual language of the icon set.

---

## Rule 1: Canvas Size

Icons must be designed on a **24 by 24 pixel** canvas.

- The `viewBox` is always `"0 0 24 24"`
- `width` and `height` attributes are always `"24"`
- All coordinates exist within this 24x24 space

**Why**: Consistent canvas ensures predictable scaling. 24px divides evenly by 2, 3, 4, 6, 8, 12 — making grid alignment natural.

---

## Rule 2: Padding

Icons must have at least **1 pixel padding** within the canvas.

- No element coordinates should be at 0 or 24
- Effective drawing area: 1–23 on both axes (22x22 usable space)
- Stroke width extends 1px beyond path center, so coordinates at 1 mean the stroke edge touches 0

**Practical check**: Look for coordinates like `x="0"`, `y="24"`, paths starting at `M0` or ending at `24`. These violate padding.

**Exception**: The `stroke-width="2"` means a path at x=1 has its outer edge at x=0. Account for this — place paths at x=2 minimum for true 1px visual padding.

---

## Rule 3: Stroke Width

Icons must have a **stroke width of 2 pixels**.

- Set globally via `stroke-width="2"` on the root `<svg>`
- Never override on child elements
- This is the single most defining visual characteristic of Lucide

**Impact on design**: A 2px stroke on a 24px canvas means stroke takes up ~8.3% of canvas width. Elements smaller than ~6px become hard to read.

---

## Rule 4: Joins

Icons must use **round joins**.

- Set via `stroke-linejoin="round"` on root `<svg>`
- Where two strokes meet at a corner, the join is rounded
- Never mitered (sharp) or beveled (flat)

**Visual effect**: Creates softer, friendlier icons. Prevents sharp points that look harsh at small sizes.

---

## Rule 5: Caps

Icons must use **round caps**.

- Set via `stroke-linecap="round"` on root `<svg>`
- Open stroke endpoints are rounded (semicircular)
- Never square (flat) or butt (no extension)

**Visual effect**: Round caps add ~1px visually beyond the path endpoint. Account for this in spacing calculations.

---

## Rule 6: Stroke Alignment

Icons must use **centered strokes**.

- The 2px stroke straddles the path equally: 1px inside, 1px outside
- This is default SVG behavior (no explicit attribute needed)
- Never use `stroke-alignment` (not widely supported anyway)

**Practical impact**: A `<circle cx="12" cy="12" r="10">` with 2px centered stroke spans from 1 to 23 (10-1=9 to 10+1+12=23 wait — center at 12, radius 10, outer edge at 12+10+1=23, inner edge at 12-10-1=1). Nearly fills the canvas.

---

## Rule 7: Border Radius

Shapes must have rounded corners:
- **2 pixel radius** (`rx="2"`) if the shape is at least 8 pixels in size
- **1 pixel radius** (`rx="1"`) if smaller than 8 pixels

**Applies to**: `<rect>` elements and path-drawn rectangles (via arc commands in path data).

**Examples**:
- Calendar body (18x18): `rx="2"` ✓
- Small checkbox (6x6): `rx="1"` ✓
- Lock body (18x11): `rx="2"` ✓

---

## Rule 8: Element Spacing

Distinct elements must have **2 pixels of spacing between each other**.

- Measured from stroke edge to stroke edge (not center to center)
- With 2px strokes, this means path centers must be ≥4px apart
- Prevents visual blending at small render sizes

**Examples**:
- User icon: head circle bottom (y=11) to body top (y=15) = 4px center-to-center = 2px edge-to-edge ✓
- Calendar posts: spaced at x=8 and x=16 (8px apart, well above minimum) ✓

**Exception**: Elements that are intentionally connected (like arrow shaft meeting head) don't need spacing.

---

## Rule 9: Optical Volume

Icons should match the visual weight of a circle or square occupying the same canvas.

- A filled circle at 24x24 represents "full weight"
- Icons shouldn't appear significantly darker or lighter
- **Test**: Blur the icon and compare to a blurred reference circle

**Light icons** (too little weight): Single thin strokes like `check`, `minus`
- These are acceptable because they represent inherently simple concepts

**Heavy icons** (too much weight): Dense details, thick fills, many elements
- Reduce detail, increase spacing, or thin elements

---

## Rule 10: Visual Centering

Icons should be centered by their **center of gravity**, not their bounding box.

- Symmetrical icons: align to geometric center (12,12)
- Asymmetrical icons: may offset to appear visually centered
- Icons with "handles" (search, magnifying glass): offset the body to leave room

**Examples**:
- Search: circle center at (11,11) not (12,12) — makes room for handle
- Play button: often shifted right by 1-2px to account for the triangle's center of mass
- Arrow: shaft extends equally from center

---

## Rule 11: Density

Maintain consistent visual density across the icon set.

- Don't add excessive detail that makes one icon heavier than others
- At small sizes, over-detailed icons become muddy blobs
- Match the density of existing icons in the set

**Test**: Render your icon at 16px alongside existing icons. Does it stand out as significantly more or less detailed?

**Guidelines**:
- Prefer fewer, larger elements over many small ones
- If you need detail, use spacing (Rule 8) to keep it readable
- Compare with similar-complexity icons (settings gear, calendar, mail)

---

## Rule 12: Smooth Curves

Continuous curves should join smoothly.

- Use arcs or quadratic curves with mirrored control points
- No visible inflection points or abrupt direction changes
- Adjacent curves should have matching tangent angles at join points

**Path commands for smooth curves**:
- `A rx ry` — arc (most common in Lucide)
- `Q cx cy x y` — quadratic bezier
- `C c1x c1y c2x c2y x y` — cubic bezier (rare in Lucide)

**Test**: Zoom in on curves. Look for "kinks" where direction changes abruptly. These indicate misaligned control points.

---

## Rule 13: Pixel Perfection

Align elements and arc centers to the pixel grid for sharpness on low-DPI displays.

- Coordinates should land on whole pixels (preferred) or half-pixels
- Center points of circles/arcs should be on whole pixels
- Line endpoints should be on whole pixels
- Avoid coordinates like `3.7` or `11.333`

**Why**: On 1x displays, a line at x=3.5 renders as a blurred 2px line instead of a crisp 1px line. Whole-pixel coordinates ensure maximum sharpness.

**Exception**: Complex organic shapes (heart, cloud, shield) may use fractional coordinates for smooth curves — this is acceptable as long as key anchor points are grid-aligned.

---

## Applying All 13 Rules: A Checklist

When reviewing an icon, check in this order:

1. ✓ Canvas 24x24? (`viewBox="0 0 24 24"`)
2. ✓ 1px padding? (no coords at 0/24)
3. ✓ Stroke width 2? (`stroke-width="2"`)
4. ✓ Round joins? (`stroke-linejoin="round"`)
5. ✓ Round caps? (`stroke-linecap="round"`)
6. ✓ Centered strokes? (default, no override)
7. ✓ Correct border radius? (2px for ≥8px shapes, 1px for smaller)
8. ✓ 2px element spacing? (edge-to-edge)
9. ✓ Optical volume matches? (blur test)
10. ✓ Visually centered? (center of gravity)
11. ✓ Consistent density? (compare at 16px)
12. ✓ Smooth curves? (no kinks)
13. ✓ Pixel-aligned coords? (whole/half pixels)
