# DESIGN.md spec reference

Full spec: https://github.com/google-labs-code/design.md (version: alpha).

## YAML frontmatter schema

```yaml
version: alpha             # optional
name: <string>             # required - project / brand name
description: <string>      # optional - one-line summary
colors:
  <token-name>: "<hex>"    # e.g. primary: "#da702c"
typography:
  <token-name>:
    fontFamily: <string>
    fontSize: <dimension>
    fontWeight: <number>
    lineHeight: <number | dimension>
    letterSpacing: <dimension>
    fontFeature: <string>
    fontVariation: <string>
rounded:
  <scale-level>: <dimension>   # e.g. base: 2px, md: 6px
spacing:
  <scale-level>: <dimension | number>
components:
  <component-name>:
    backgroundColor: <hex | "{colors.x}">
    textColor: <hex | "{colors.x}">
    typography: "{typography.x}"
    rounded: <dimension | "{rounded.x}">
    padding: <dimension>
    size: <dimension>
    height: <dimension>
    width: <dimension>
```

## Token types

| Type            | Format                              | Example                 |
|-----------------|-------------------------------------|-------------------------|
| Color           | Hex sRGB (3/4/6/8 digits)           | `"#1A1C1E"`, `"#000a"`  |
| Dimension       | Number + unit (`px`, `em`, `rem`)   | `48px`, `-0.02em`       |
| Token reference | `{path.to.token}`                   | `{colors.primary}`      |
| Typography      | Object with the fields above        | see schema              |

## Markdown section order

Optional but **must appear in this order** if present. Project-specific sections (Dark Theme Overrides, Voice & Microcopy, Visual Identity, Source Files) come **after** #8.

1. Overview (alias: Brand & Style)
2. Colors
3. Typography
4. Layout (alias: Layout & Spacing)
5. Elevation & Depth (alias: Elevation)
6. Shapes
7. Components
8. Do's and Don'ts

## Prose color table format

In the Colors section, render hex + oklch side-by-side. Two common shapes:

**Theme-paired (semantic tokens with light/dark variants):**

```markdown
| Token            | Light                                       | Dark                                        |
|------------------|---------------------------------------------|---------------------------------------------|
| `--background`   | `#efece6` `oklch(0.944 0.0086 84.57)`       | `#171616` `oklch(0.201 0.0016 17.29)`       |
| `--foreground`   | `#171616` `oklch(0.201 0.0016 17.29)`       | `#efece6` `oklch(0.944 0.0086 84.57)`       |
| `--primary`      | `#da702c` `oklch(0.658 0.1539 49.3)`        | same                                        |
```

**Single-value (palette anchor shades):**

```markdown
| Family   | Anchor | Hex       | oklch                          |
|----------|--------|-----------|--------------------------------|
| red      | 600    | `#cc434d` | `oklch(0.579 0.173 20.29)`     |
| orange   | 400    | `#e37b4c` | `oklch(0.691 0.143 44.03)`     |
```

When light and dark are identical, write `same` in the Dark column rather than repeating values.

## Example DESIGN.md skeleton

```markdown
---
version: alpha
name: di.gg
description: Terminal-native, information-dense feed
colors:
  background: "#171616"
  foreground: "#efece6"
  primary: "#da702c"
  accent: "#3aa99f"
  destructive: "#cc434d"
  success: "#6aa15a"
  border: "#ffffff1a"
typography:
  body:
    fontFamily: roobertMono
    fontSize: 12px
    lineHeight: 1.4
  heading:
    fontFamily: roobertMono
    fontSize: 16px
    fontWeight: 500
rounded:
  base: 2px
  md: 6px
  full: 9999px
components:
  button:
    backgroundColor: "{colors.primary}"
    textColor: "#fffcf0"
    rounded: "{rounded.base}"
    padding: 8px 12px
  card:
    backgroundColor: "{colors.background}"
    rounded: "{rounded.md}"
    padding: 16px
---

# di.gg Design System

## 1. Overview

Terminal-native, dense, information-first. Default dark; parity-built light. Square geometry; nearly flat; monospace body.

## 2. Colors

All values authored in `oklch()` in `app/globals.css` — those source files win when they diverge from this doc.

### Semantic tokens

| Token            | Light                                       | Dark                                        |
|------------------|---------------------------------------------|---------------------------------------------|
| `--background`   | `#efece6` `oklch(0.944 0.0086 84.57)`       | `#171616` `oklch(0.201 0.0016 17.29)`       |
| `--foreground`   | `#171616` `oklch(0.201 0.0016 17.29)`       | `#efece6` `oklch(0.944 0.0086 84.57)`       |
| `--primary`      | `#da702c` `oklch(0.658 0.1539 49.3)`        | same                                        |
| `--accent`       | `#3aa99f` `oklch(0.67 0.0999 186.58)`       | same                                        |

## 3. Typography

`--font-mono` (default): `roobertMono`. `--font-sans`: `roobert` — opt-in via `font-sans`. Microlabels: uppercase with `tracking-wider`; numerics: `tabular-nums`.

## 4. Layout

4px base, container `max-w-7xl`, page padding `px-6` to `px-8`, gaps `gap-2`/`gap-3`/`gap-4`.

## 5. Elevation & Depth

Effectively flat. Separation comes from a 1px `--border` hairline + a one-step lighter card surface. No drop shadows on cards.

## 6. Shapes

| Use            | Radius     |
|----------------|------------|
| Buttons, chips | 2px        |
| Cards, popovers| 4-7px      |
| Pills, avatars | 9999px     |

## 7. Components

See YAML frontmatter for token values. Buttons use `--primary` background with `--primary-foreground` text; cards use `--card` (one step lighter than `--background`) with `1px solid --border`.

## 8. Do's and Don'ts

- DON'T use `bg-gray-*`, `text-slate-*`, `border-zinc-*` — map to `muted` / `muted-foreground` / `border`.
- DON'T put hex / rgb / oklch literals in components — consume `var(--token)` or `bg-token` utilities.
- DON'T use `text-white` / `text-black` outside `components/ui/*` — use `text-background` / `text-foreground` (they auto-invert).
- DO use tabular-nums for any column of numbers.

## Source files (authoritative)

- `app/globals.css` — semantic tokens
- `app/styles/colors.css` — chromatic 50-950 scales
```

## Re-sync algorithm

When `DESIGN.md` already exists:

1. Read the file. Split frontmatter (between `---` lines) from body.
2. Parse YAML frontmatter into a token map.
3. Re-parse the CSS source files.
4. **Replace frontmatter** with newly-computed values, preserving any non-color custom keys the user added.
5. **Find the Colors section** (`## 2. Colors`, `## Colors`, or `## Color Palette & Roles`) and replace any table that has columns matching `Token`/`Hex`/`oklch`/`Light`/`Dark` with the regenerated table.
6. **Leave every other section's prose alone.** This is the user's hand-written voice.
7. Diff-report: list which tokens were added, removed, or had their value change.

If the user's frontmatter has custom fields not in the schema (e.g. `motion:`, `icons:`), preserve them.

## Color converter contract

`scripts/color-convert.mjs` exports:

```js
convert(input)                  // -> { input, direction, hex, oklch, rgb, alpha }
hexToOklch(hex)                 // -> { L, C, h, alpha }
oklchToHex({ L, C, h, alpha })  // -> "#rrggbb" or "#rrggbbaa"
parseOklch(string)              // -> { L, C, h, alpha }
formatOklch({ L, C, h, alpha }) // -> "oklch(L C h)" or "oklch(L C h / a)"
```

Accepts:
- Hex: `#rgb`, `#rgba`, `#rrggbb`, `#rrggbbaa`
- Oklch: `oklch(L C h)`, `oklch(L C h / α)`, with optional `%` on L/α and `deg` on h. Tolerant of bare L like `65.8` (treated as 65.8%).

Math: standard sRGB ↔ linear ↔ Oklab matrices (Ottosson). Out-of-gamut oklch values are clamped to `[0,255]` in sRGB.

## Common project layouts

| Stack                      | Where to find tokens                                              |
|----------------------------|-------------------------------------------------------------------|
| Next.js + Tailwind v4      | `app/globals.css` (`@theme` block + `:root` / `.dark`)            |
| Next.js + shadcn (v3)      | `app/globals.css` + `tailwind.config.ts`                          |
| Vite + Tailwind            | `src/index.css` or `src/styles/globals.css`                       |
| Expo + NativeWind          | `global.css` + `tailwind.config.js`                               |
| Plain CSS                  | `:root` block wherever it lives                                   |

For Tailwind v4 `@theme` blocks, treat `--color-<name>` declarations the same as `--<name>` in `:root`.
