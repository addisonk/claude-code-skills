# SVG Code Conventions

The technical specification for how Lucide icon SVG code must be structured.

---

## Global SVG Wrapper

Every Lucide icon uses this exact SVG wrapper. No exceptions.

```xml
<svg
  xmlns="http://www.w3.org/2000/svg"
  width="24"
  height="24"
  viewBox="0 0 24 24"
  fill="none"
  stroke="currentColor"
  stroke-width="2"
  stroke-linecap="round"
  stroke-linejoin="round"
>
  <!-- icon elements here -->
</svg>
```

### Attribute Breakdown

| Attribute | Value | Purpose |
|-----------|-------|---------|
| `xmlns` | `http://www.w3.org/2000/svg` | SVG namespace declaration |
| `width` | `24` | Intrinsic width |
| `height` | `24` | Intrinsic height |
| `viewBox` | `0 0 24 24` | Coordinate system |
| `fill` | `none` | No fills by default |
| `stroke` | `currentColor` | Inherits parent text color |
| `stroke-width` | `2` | 2px consistent stroke |
| `stroke-linecap` | `round` | Rounded line endings |
| `stroke-linejoin` | `round` | Rounded corner joins |

### Why `currentColor`?

`currentColor` is a CSS keyword that resolves to the element's computed `color` property. This means:
- Icons inherit text color from their parent
- Theming is automatic (dark mode, brand colors)
- No hardcoded colors in the SVG
- Override via `color` prop or parent CSS

---

## Allowed SVG Elements

Only these 7 primitive elements are permitted inside icon SVGs:

### `<path>`

The most versatile and most common element. Used for any shape that can't be expressed with simpler primitives.

```xml
<path d="M20 6 9 17l-5-5" />
```

**Attributes**: Only `d` (path data).

**When to use**: Complex shapes, organic curves, compound shapes, any shape requiring bezier or arc commands.

### `<circle>`

For perfect circles.

```xml
<circle cx="12" cy="12" r="3" />
```

**Attributes**: `cx` (center x), `cy` (center y), `r` (radius).

**When to use**: Dots, heads (user icon), lenses (camera), rings (globe), note heads (music).

**Prefer over**: Arc-based paths when a perfect circle is needed.

### `<rect>`

For rectangles with optional rounded corners.

```xml
<rect x="3" y="4" width="18" height="18" rx="2" />
```

**Attributes**: `x`, `y`, `width`, `height`, `rx` (corner radius), optionally `ry`.

**When to use**: Envelopes, calendar bodies, lock bodies, screens, cards.

**Prefer over**: Path-drawn rectangles when the shape is clearly rectangular.

### `<line>`

For straight lines between two points.

```xml
<line x1="3" y1="12" x2="21" y2="12" />
```

**Attributes**: `x1`, `y1` (start), `x2`, `y2` (end).

**When to use**: Simple straight lines. Note: in practice, most Lucide icons use `<path d="M3 12h18">` instead, as paths are more versatile.

### `<polyline>`

For connected line segments (open shape).

```xml
<polyline points="4 7 4 4 20 4 20 7" />
```

**Attributes**: `points` (space or comma-separated coordinate pairs).

**When to use**: Multiple connected straight segments that don't close.

### `<polygon>`

For closed multi-sided shapes.

```xml
<polygon points="12 2 22 20 2 20" />
```

**Attributes**: `points` (automatically closed).

**When to use**: Triangles, pentagons, etc. Note: Lucide often prefers `<path>` for these to allow rounded corners via arc commands.

### `<ellipse>`

For ellipses (non-circular ovals).

```xml
<ellipse cx="12" cy="12" rx="8" ry="5" />
```

**Attributes**: `cx`, `cy` (center), `rx` (horizontal radius), `ry` (vertical radius).

**When to use**: Oval shapes, elliptical orbits. Rare in Lucide.

---

## Restrictions

These are **hard rules**. Any SVG containing these elements or attributes is non-compliant.

### Forbidden Elements

| Element | Why Forbidden |
|---------|--------------|
| `<g>` | No grouping — flat structure only |
| `<defs>` | No definitions — no reuse references |
| `<use>` | No symbol references — self-contained only |
| `<symbol>` | No symbol definitions |
| `<filter>` | No filter effects (blur, shadow, etc.) |
| `<linearGradient>` | No gradients |
| `<radialGradient>` | No gradients |
| `<pattern>` | No patterns |
| `<clipPath>` | No clipping |
| `<mask>` | No masking |
| `<text>` | No text elements |
| `<image>` | No embedded images |
| `<foreignObject>` | No foreign content |

### Forbidden Attributes

| Attribute | Why Forbidden |
|-----------|--------------|
| `transform` | No transforms (translate, rotate, scale, skew) |
| `style` | No inline styles |
| `class` | No CSS classes |
| `id` | No identifiers |
| `fill` (on children) | Inherited from root `<svg>` |
| `stroke` (on children) | Inherited from root `<svg>` |
| `stroke-width` (on children) | Inherited from root `<svg>` |
| `opacity` | No opacity on elements |
| `filter` | No filter references |
| `clip-path` | No clip references |
| `mask` | No mask references |

### Why These Restrictions?

1. **Portability** — Icons work identically across all rendering contexts
2. **Predictability** — No hidden state, transforms, or references to resolve
3. **Tree-shaking** — Each icon is self-contained with no shared dependencies
4. **Minimal file size** — No metadata, no redundant structures
5. **Accessibility** — Simple DOM structure for screen readers
6. **Theming** — Only `currentColor` needs to change for recoloring

---

## Path Data (`d` attribute) Conventions

### Commands Used in Lucide Icons

| Command | Name | Parameters | Example |
|---------|------|-----------|---------|
| `M` | Move to (absolute) | `x y` | `M12 2` |
| `m` | Move to (relative) | `dx dy` | `m0 5` |
| `L` | Line to (absolute) | `x y` | `L20 20` |
| `l` | Line to (relative) | `dx dy` | `l-5-5` |
| `H` | Horizontal line (absolute) | `x` | `H20` |
| `h` | Horizontal line (relative) | `dx` | `h14` |
| `V` | Vertical line (absolute) | `y` | `V21` |
| `v` | Vertical line (relative) | `dy` | `v-8` |
| `A` | Arc (absolute) | `rx ry rot large sweep x y` | `A5 5 0 0 1 17 7` |
| `a` | Arc (relative) | `rx ry rot large sweep dx dy` | `a2 2 0 0 1 2 2` |
| `Z`/`z` | Close path | — | `Z` |

### Path Data Style

- **Implicit line-to**: After `M`, subsequent coordinates without a command letter are treated as `L` (line-to)
  - `M20 6 9 17` = `M20 6 L9 17`
- **Spaces vs commas**: Lucide uses spaces between coordinates, no commas
- **Relative vs absolute**: Mix freely based on readability
- **Close path**: Use `Z` or `z` when shape should connect back to start

### Arc Command Deep Dive

Arcs are the most complex command. Format: `A rx ry x-rotation large-arc-flag sweep-flag x y`

| Parameter | Meaning |
|-----------|---------|
| `rx` | Horizontal radius |
| `ry` | Vertical radius (same as rx for circular arcs) |
| `x-rotation` | Rotation of ellipse (usually `0`) |
| `large-arc-flag` | `0` = minor arc, `1` = major arc |
| `sweep-flag` | `0` = counter-clockwise, `1` = clockwise |
| `x y` | End point |

**Common patterns in Lucide**:
- Rounded corners: `a2 2 0 0 1 2 2` (2px radius corner)
- Semicircles: `a5 5 0 0 1 10 0` (5px radius, 180° arc)
- Full circles: Two arcs back-to-back (rare, prefer `<circle>`)

---

## File Size Optimization

Lucide icons are optimized for minimal file size:

1. **Prefer fewer elements** — One path over multiple simpler shapes
2. **Use implicit commands** — `M20 6 9 17` not `M20 6 L9 17`
3. **Relative where shorter** — `l-5-5` vs `L15 15`
4. **No unnecessary precision** — `M12 2` not `M12.000 2.000`
5. **No comments or metadata** — Pure geometry only
6. **No whitespace in production** — Minified in distribution

**Development format** (readable):
```xml
<svg ...>
  <path d="M20 6 9 17l-5-5" />
</svg>
```

**Production format** (minified):
```xml
<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
```
