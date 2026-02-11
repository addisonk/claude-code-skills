# Patterns Summary

Key patterns observed across the Lucide icon set, based on analysis of 20 representative icons.

---

## Element Usage Frequency

| Pattern | Frequency | Examples |
|---------|-----------|----------|
| Single `<path>` | ~40% | heart, star, check, cloud, bookmark, shield, zap |
| `<path>` + `<circle>` | ~35% | search, settings, user, camera, globe, map-pin |
| Multiple `<path>` | ~15% | bell, house, arrow-right |
| `<rect>` + `<path>` | ~15% | mail, calendar, lock |
| `<path>` + multiple `<circle>` | ~5% | music |

**Key insight**: ~75% of icons use `<path>` as their primary (or only) element. `<circle>` is the second most common, used when a perfect circle is semantically clear.

---

## Composition Patterns

### Pattern 1: Single Path (Simplest)

The entire icon is one continuous `<path>` element.

**When to use**:
- Organic shapes (heart, cloud, shield)
- Simple geometric shapes (check, bookmark)
- Closed shapes that can be drawn in one stroke

**Advantages**:
- Minimum DOM nodes (1 element)
- Smallest file size
- No spacing concerns (single shape)

**Examples**: check (2 line segments), star (5-point polygon), zap (lightning bolt)

---

### Pattern 2: Path + Circle (Most Common Compound)

A `<path>` for the main shape, with one or more `<circle>` elements for dots/rings.

**When to use**:
- Icons with a distinct circular element (head, lens, dot, ring)
- When the circle is semantically a "dot" or "ring" (not just a curved path section)

**Decision rule**: If you'd call it "a circle" when describing the icon, use `<circle>`. If it's "a curve that happens to be circular", use a path arc.

**Examples**:
- search: lens (circle) + handle (path)
- user: head (circle) + body (path)
- camera: lens (circle) + body (path)
- settings: center dot (circle) + gear outline (path)
- map-pin: center dot (circle) + teardrop (path)

---

### Pattern 3: Multiple Paths

Two or more `<path>` elements representing distinct visual parts.

**When to use**:
- Icon has visually separate components (shaft + arrowhead)
- Parts that could independently animate or be styled
- Separation improves readability of the SVG code

**Decision rule**: Split into multiple paths when the parts represent **conceptually different things** (bell body vs clapper, arrow shaft vs head).

**Examples**:
- bell: body dome (path) + clapper arc (path)
- house: structure (path) + door (path)
- arrow-right: shaft line (path) + chevron head (path)

---

### Pattern 4: Rect + Path

A `<rect>` for the primary rectangular body, with `<path>` elements for details.

**When to use**:
- Icon has a clearly rectangular component (envelope, screen, card, body)
- The rectangle would be verbose as a path (`M x y h w v h h -w Z` vs `<rect x y width height>`)

**Decision rule**: If the shape is an axis-aligned rectangle with optional rounded corners, use `<rect>`. If it's rotated or has non-uniform corners, use `<path>`.

**Examples**:
- mail: envelope body (rect rx=2) + flap V-line (path)
- calendar: body (rect rx=2) + posts + separator (paths)
- lock: lock body (rect rx=2) + shackle arc (path)

---

### Pattern 5: Path + Multiple Circles

One path connecting multiple circular elements.

**When to use**: Rare. Only when icon has multiple distinct dots/circles (musical notes, molecular structures).

**Examples**: music: staff (path) + two note heads (circles)

---

## Design Decision Framework

When creating a new icon, choose elements in this order:

```
1. Can it be a single <path>?
   → YES: Use single path (40% of icons do this)
   → NO: Continue...

2. Does it have a circular element?
   → YES: Use <path> + <circle> (35% of icons)
   → NO: Continue...

3. Does it have a rectangular element?
   → YES: Use <rect> + <path> (15% of icons)
   → NO: Use multiple <path> elements (15% of icons)
```

---

## Path Data Patterns

### Simple Strokes (check, arrow, plus)

Just move-to and line-to commands:
```
M20 6 9 17l-5-5        (checkmark: two connected lines)
M5 12h14               (horizontal line)
m12 5 7 7-7 7          (chevron)
```

### Rounded Rectangles (house body, lock body, camera body)

Arc commands for corners:
```
M3 10a2 2 0 0 1 .709-1.528l7-6a2 2 0 0 1 2.582 0l7 6A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z
```

Pattern: `a2 2 0 0 1 2 2` = 2px radius rounded corner (the standard Lucide corner).

### Organic Curves (heart, cloud, shield)

Arcs with larger radii for natural-looking curves:
```
M2 9.5a5.5 5.5 0 0 1 9.591-3.676    (heart lobe arc)
M17.5 19H9a7 7 0 1 1 6.71-9         (cloud: r=7 body arc)
```

### Gear/Star Patterns (settings, star)

Repeated arcs at consistent radii:
```
a2.34 2.34 0 0 1 4.659 0   (gear tooth - repeated 6 times)
a.53.53 0 0 1 .95 0        (star point tip arc)
```

---

## Visual Weight Guidelines

### Filling the Canvas

| Weight | Approach | Example |
|--------|----------|---------|
| Light | Thin strokes, open shapes | check, minus, plus |
| Medium | Single closed path | heart, star, bookmark |
| Full | Large circle + details | globe, settings, clock |
| Heavy | Multiple elements + fills | AVOID — too dense |

### Balancing Asymmetric Icons

When an icon is asymmetric (search, flag, pen):
- Offset the main body toward center of gravity
- Leave more space on the "light" side
- The visual center should feel centered, not the bounding box

---

## Common Anti-Patterns

### Don't Do This

| Anti-Pattern | Why It's Wrong | Fix |
|--------------|---------------|-----|
| Path for a simple circle | Verbose, less semantic | Use `<circle>` |
| Path for axis-aligned rect | Verbose, harder to read | Use `<rect>` |
| Multiple elements for one shape | Extra DOM nodes | Combine into single path |
| Group elements in `<g>` | Forbidden by spec | Flatten to siblings |
| Add transform for rotation | Forbidden by spec | Bake rotation into coordinates |
| Use gradient fill | Forbidden by spec | Stroke-only design |
| Separate elements < 2px apart | Violates spacing rule | Increase spacing or merge |
| Mix stroke widths | Violates Rule 3 | All strokes = 2px |
