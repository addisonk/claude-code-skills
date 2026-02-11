# 20 SVG Icon Examples

Real Lucide icon SVG code with annotations. Use these as reference for understanding element composition patterns, path data structures, and design decisions.

---

## 1. Heart (`heart`)

**Elements:** Single `<path>` with arc curves
**Pattern:** Organic shape — one continuous stroke

```xml
<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
  <path d="M2 9.5a5.5 5.5 0 0 1 9.591-3.676.56.56 0 0 0 .818 0A5.49 5.49 0 0 1 22 9.5c0 2.29-1.5 4-3 5.5l-5.492 5.313a2 2 0 0 1-3 .019L5 15c-1.5-1.5-3-3.2-3-5.5" />
</svg>
```

**Design notes:**
- Two heart lobes formed by arc commands (r=5.5 and r=5.49)
- Small arcs (r=0.56, r=2) connect the lobes and form the bottom point
- Single continuous path — no need for multiple elements
- Coordinates start at x=2 (respects 1px padding)
- Rightmost point at x=22 (respects padding on both sides)

---

## 2. Star (`star`)

**Elements:** Single `<path>` with arcs between points
**Pattern:** Polygon-like shape using path for rounded corners

```xml
<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
  <path d="M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z" />
</svg>
```

**Design notes:**
- Uses `<path>` instead of `<polygon>` to enable rounded tips via small arcs (r=0.53)
- Larger arcs (r=2.123) form the concave inner curves between star points
- Top point starts near y=2.295 (respects padding)
- Bottom point extends to ~y=21 (respects padding)
- `z` closes the path back to start
- All 5 points computed for even distribution around center (12,12)

---

## 3. Search (`search`)

**Elements:** `<circle>` + `<path>`
**Pattern:** Primitive composition — geometric shape + handle

```xml
<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
  <circle cx="11" cy="11" r="8" />
  <path d="m21 21-4.34-4.34" />
</svg>
```

**Design notes:**
- `<circle>` is the right choice — this IS a circle, not "a curve"
- Center offset to (11,11) not (12,12) — leaves room for handle (Rule 10: visual centering)
- Circle radius 8: outer edge at 11+8+1=20 (with stroke), inner at 11-8-1=2
- Handle path uses relative line-to from (21,21) going (-4.34, -4.34) — diagonal at 45°
- Handle touches circle edge: distance from (11,11) to (21-4.34, 21-4.34) ≈ r=8
- Handle extends to (21,21) — within padding (coord 21 + 1px stroke = 22, not 24)

---

## 4. Settings (`settings`)

**Elements:** Complex `<path>` + `<circle>`
**Pattern:** Gear shape (repeated arcs) + center dot

```xml
<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
  <path d="M9.671 4.136a2.34 2.34 0 0 1 4.659 0 2.34 2.34 0 0 0 3.319 1.915 2.34 2.34 0 0 1 2.33 4.033 2.34 2.34 0 0 0 0 3.831 2.34 2.34 0 0 1-2.33 4.033 2.34 2.34 0 0 0-3.319 1.915 2.34 2.34 0 0 1-4.659 0 2.34 2.34 0 0 0-3.32-1.915 2.34 2.34 0 0 1-2.33-4.033 2.34 2.34 0 0 0 0-3.831A2.34 2.34 0 0 1 6.35 6.051a2.34 2.34 0 0 0 3.319-1.915" />
  <circle cx="12" cy="12" r="3" />
</svg>
```

**Design notes:**
- Gear teeth formed by alternating arcs at consistent radius (2.34)
- All arcs use same rx/ry for uniform tooth shape
- Alternating `0 0 1` and `0 0 0` sweep flags create the in/out pattern
- Center circle at exact center (12,12) with r=3
- Two conceptually distinct elements: gear outline + center indicator
- `<circle>` chosen for center dot — perfect circle, semantically clear

---

## 5. User (`user`)

**Elements:** `<path>` + `<circle>`
**Pattern:** Body silhouette + head

```xml
<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
  <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
  <circle cx="12" cy="7" r="4" />
</svg>
```

**Design notes:**
- Minimal person representation — head + shoulders only
- Head: circle at (12,7) with r=4. Bottom at y=11
- Body: path starting at (19,21), arcing with r=4 for rounded shoulders
- Spacing: head bottom at y=11, body top at y=15 → 4px center gap = 2px edge gap (Rule 8) ✓
- Body anchors at y=21 (1px from bottom = 2px with stroke = respects padding)
- Symmetric around x=12

---

## 6. Bell (`bell`)

**Elements:** Two `<path>` elements
**Pattern:** Main body + separate small detail

```xml
<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
  <path d="M10.268 21a2 2 0 0 0 3.464 0" />
  <path d="M3.262 15.326A1 1 0 0 0 4 17h16a1 1 0 0 0 .74-1.673C19.41 13.956 18 12.499 18 8A6 6 0 0 0 6 8c0 4.499-1.411 5.956-2.738 7.326" />
</svg>
```

**Design notes:**
- Two separate paths — body and clapper are conceptually distinct parts
- Bell dome uses arc (r=6) for the curved top
- Flared base is a horizontal line at y=17 with rounded corners (r=1 arcs)
- Clapper: small arc at bottom (r=2), centered at ~x=12
- Clapper starts at y=21 (bottom padding respected)

---

## 7. House (`house`)

**Elements:** Two `<path>` elements
**Pattern:** Structure body + door detail

```xml
<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
  <path d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8" />
  <path d="M3 10a2 2 0 0 1 .709-1.528l7-6a2 2 0 0 1 2.582 0l7 6A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
</svg>
```

**Design notes:**
- House structure as single path: roof peak (via line-to) + body (rounded rect with r=2)
- Door as separate path: rect from y=13 to y=21 with r=1 corners (small, so 1px radius per Rule 7)
- Roof angle: from (3,10) up to center peak, back down to (21,10) — symmetric
- Body extends from y=10 to y=21 (fills lower half)
- Uses `z` to close the body path

---

## 8. Mail (`mail`)

**Elements:** `<rect>` + `<path>`
**Pattern:** Semantic rectangle + V-shaped overlay

```xml
<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
  <rect x="2" y="4" width="20" height="16" rx="2" />
  <path d="m22 7-8.991 5.727a2 2 0 0 1-2.009 0L2 7" />
</svg>
```

**Design notes:**
- `<rect>` for envelope body — clearly rectangular, more semantic than path
- `rx="2"` for rounded corners (envelope is 20px wide, so ≥8px → 2px radius) ✓
- Flap: V-shaped path from top corners dipping to center
- Flap arc (r=2) creates slight curve at the V's bottom point
- Rect spans nearly full canvas: x=2 to x=22, y=4 to y=20

---

## 9. Check (`check`)

**Elements:** Single `<path>` — minimal
**Pattern:** Two connected line segments

```xml
<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
  <path d="M20 6 9 17l-5-5" />
</svg>
```

**Design notes:**
- Simplest possible icon — just 3 coordinates
- `M20 6` (start top-right), implicit `L9 17` (diagonal down-left), `l-5-5` (relative up-left)
- Asymmetric arms: right arm longer than left (optically correct for checkmarks)
- Round linecap creates visible dot-endpoints
- Right arm: 15.6px length. Left arm: 7.07px length. Ratio ≈ 2.2:1
- Centered in canvas by visual weight, not bounding box

---

## 10. Arrow Right (`arrow-right`)

**Elements:** Two `<path>` elements
**Pattern:** Shaft + chevron head

```xml
<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
  <path d="M5 12h14" />
  <path d="m12 5 7 7-7 7" />
</svg>
```

**Design notes:**
- Shaft and head as separate elements (conceptually distinct parts)
- Shaft: horizontal line from x=5 to x=19 (14px, centered at y=12)
- Head: chevron with equal 7px arms creating 90° angle
- Head apex at (19,12) — meets shaft endpoint
- Head spans y=5 to y=19 (14px tall, centered)
- Both elements share the meeting point at (19,12)

---

## 11. Calendar (`calendar`)

**Elements:** `<rect>` + multiple `<path>` elements
**Pattern:** Rectangle body with line details

```xml
<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
  <path d="M8 2v4" />
  <path d="M16 2v4" />
  <rect width="18" height="18" x="3" y="4" rx="2" />
  <path d="M3 10h18" />
</svg>
```

**Design notes:**
- `<rect>` for calendar body (18x18, clearly rectangular)
- Two vertical paths for binding posts (y=2 to y=6, extending above rect)
- One horizontal path for header separator (y=10, full width)
- Posts at x=8 and x=16: evenly distributed on 18px width (at 1/3 and 2/3)
- Posts start at y=2 (top padding) and extend into the rect body
- `rx="2"` on rect (18px wide → ≥8px → 2px radius) ✓

---

## 12. Lock (`lock`)

**Elements:** `<rect>` + `<path>`
**Pattern:** Rectangle body + arc shackle

```xml
<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
  <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
</svg>
```

**Design notes:**
- Lock body: `<rect>` at bottom half (y=11 to y=22, height=11)
- Shackle: path with arc (r=5) creating the U-shape above the body
- Shackle starts at (7,11), goes up to (7,7), arcs to (17,7), back down to (17,11)
- `rx="2"` on rect (18px wide → 2px radius) ✓
- Shackle width: 10px (x=7 to x=17), matching arc diameter (2×r=10)
- Body and shackle overlap at y=11 (connected, not separate)

---

## 13. Cloud (`cloud`)

**Elements:** Single `<path>`
**Pattern:** Organic compound arcs

```xml
<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
  <path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z" />
</svg>
```

**Design notes:**
- Single path despite organic shape — one continuous stroke
- Main body: arc with r=7 (large circle forming left/bottom/top)
- Right bump: arc with r=4.5 (smaller circle on right side)
- `Z` closes path back to start
- Flat bottom at y=19, bumpy top with two different radii
- Demonstrates that complex organic shapes can be single-path

---

## 14. Camera (`camera`)

**Elements:** `<path>` + `<circle>`
**Pattern:** Body silhouette + centered lens

```xml
<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
  <path d="M13.997 4a2 2 0 0 1 1.76 1.05l.486.9A2 2 0 0 0 18.003 7H20a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2h1.997a2 2 0 0 0 1.759-1.048l.489-.904A2 2 0 0 1 10.004 4z" />
  <circle cx="12" cy="13" r="3" />
</svg>
```

**Design notes:**
- Body: complex path with viewfinder bump (raised section at top)
- All corners use r=2 arcs (≥8px body → 2px radius) ✓
- Lens: `<circle>` at (12,13) — offset below center to account for bump above
- Lens r=3: 6px diameter, clearly visible within ~14px body height
- Body spans x=2 to x=22, y=4 to y=20 (with viewfinder bump from y=4 to y=7)
- `z` closes the body path

---

## 15. Music (`music`)

**Elements:** `<path>` + two `<circle>` elements
**Pattern:** Connecting staff + terminal note heads

```xml
<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
  <path d="M9 18V5l12-2v13" />
  <circle cx="6" cy="18" r="3" />
  <circle cx="18" cy="16" r="3" />
</svg>
```

**Design notes:**
- Only icon with multiple `<circle>` elements (two note heads)
- Staff path: vertical line (9,18)→(9,5), diagonal bar (9,5)→(21,3), vertical (21,3)→(21,16)
- Left note head: circle at (6,18) r=3. Connected to staff at (9,18)
- Right note head: circle at (18,16) r=3. Connected to staff at (21,16)
- Note heads at different heights (18 vs 16) — musical notation style
- Path touches circles at their edges (9-3=6=cx, 21-3=18=cx)

---

## 16. Globe (`globe`)

**Elements:** `<circle>` + two `<path>` elements
**Pattern:** Primary circle + overlay detail lines

```xml
<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
  <circle cx="12" cy="12" r="10" />
  <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" />
  <path d="M2 12h20" />
</svg>
```

**Design notes:**
- Outer circle: r=10 at (12,12). Edge at 2 and 22 (respects padding with stroke)
- Meridian: arc with r=14.5 (larger than circle radius → subtle curve, not semicircle)
- Equator: simple horizontal line from x=2 to x=22
- Three layers of detail: outline → meridian → equator
- All centered at (12,12) — perfectly symmetric icon

---

## 17. Bookmark (`bookmark`)

**Elements:** Single `<path>`
**Pattern:** Ribbon shape with pointed bottom

```xml
<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
  <path d="M17 3a2 2 0 0 1 2 2v15a1 1 0 0 1-1.496.868l-4.512-2.578a2 2 0 0 0-1.984 0l-4.512 2.578A1 1 0 0 1 5 20V5a2 2 0 0 1 2-2z" />
</svg>
```

**Design notes:**
- Single path for the entire bookmark ribbon
- Top corners: r=2 arcs (body is 14px wide → ≥8px → 2px radius) ✓
- Bottom V: formed by two angled line-to commands meeting at center
- Small arcs (r=1) at V point for slight rounding
- Spans y=3 to y≈21 (nearly full height within padding)
- Width: x=5 to x=19 (14px, centered)
- `z` closes the path

---

## 18. Shield (`shield`)

**Elements:** Single `<path>`
**Pattern:** Organic protective silhouette

```xml
<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
  <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" />
</svg>
```

**Design notes:**
- Single closed path (`z`) for the shield outline
- Top: subtle pointed arch via curved control points
- Sides: straight vertical sections (x=4 and x=20)
- Bottom: tapers to a point via cubic bezier curves
- Uses mix of arcs (r=1, r=1.17) for subtle top curves
- Curve commands create the organic "protective" shape
- Width: x=4 to x=20 (16px). Height: y≈2.28 to y≈21.95

---

## 19. Zap (`zap`)

**Elements:** Single `<path>`
**Pattern:** Angular lightning bolt with rounded corners

```xml
<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
  <path d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z" />
</svg>
```

**Design notes:**
- Closed path (`z`) for the lightning bolt
- Uses small arcs (r=1 and r=0.5) at direction changes
- Maintains round-join aesthetic even on this angular shape
- Bolt spans full canvas height: y≈2.17 to y≈21.83
- Horizontal center section creates the "step" in the bolt
- Two triangular sections pointing in opposite directions
- Round corners prevent the bolt from looking too sharp/aggressive

---

## 20. Map Pin (`map-pin`)

**Elements:** `<path>` + `<circle>`
**Pattern:** Teardrop container + center dot

```xml
<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
  <path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0" />
  <circle cx="12" cy="10" r="3" />
</svg>
```

**Design notes:**
- Teardrop: path with arc (r=8) for circular top, curves to point at bottom
- Arc center at (12,10): not canvas center — shifted up to make room for point
- Bottom point extends to y≈21.8 (near bottom padding limit)
- Center dot: `<circle>` at (12,10) — matches arc center
- Dot r=3: clearly visible within the 8px-radius circular section
- Width at widest: x=4 to x=20 (16px, from arc edges)
- Two elements: teardrop container + location indicator dot
