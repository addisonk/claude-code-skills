---
name: design-md
description: Generate or re-sync a project's DESIGN.md file following the Google Labs design.md spec (YAML frontmatter + prescribed section order), with hex+oklch color tables in the prose body. Use when the user asks to create, update, regenerate, or sync DESIGN.md, extract a design system into a doc, or add a DESIGN.md to a project.
---

# design-md

Generates `DESIGN.md` at the project root, conforming to the [Google Labs design.md spec](https://github.com/google-labs-code/design.md): hex-only YAML frontmatter, sections in prescribed order, and an oklch column alongside hex in the prose color tables (since shadcn / Tailwind v4 projects author colors in oklch and humans want both).

Ships with `scripts/color-convert.mjs`, a symmetric oklch↔hex CLI + ESM module used to fill in whichever color form is missing from the source CSS.

## Workflow

### Fresh generation

1. **Find the CSS token source.** Try in order: `app/globals.css`, `src/app/globals.css`, `styles/globals.css`, `app/styles/colors.css`, any other `*.css` file in the project containing `:root {` and `--`. If none, ask the user where their tokens live.
2. **Parse `:root` and `.dark` blocks.** Extract `--token-name: <value>` pairs. Record both values when both modes exist.
3. **Normalize each color.** Run `node ${SKILL_DIR}/scripts/color-convert.mjs '<value>'` to get the complement form. Store both. Tokens that aren't colors (radii, spacing, font families) skip this step.
4. **Detect typography.** Grep for `--font-*`, font imports (`next/font`), and Tailwind theme entries.
5. **Detect radii and spacing.** Read `--radius`, `--spacing`, the Tailwind theme block, and any explicit scale.
6. **Write DESIGN.md** at the project root with the structure in [REFERENCE.md](REFERENCE.md).

### Re-sync of an existing DESIGN.md

1. **Read the existing file.** Parse the YAML frontmatter as the previous machine-readable state.
2. **Re-parse the CSS source** the same way as fresh generation.
3. **Diff and update.** Overwrite the YAML frontmatter and the Colors section's hex+oklch table with the current values. **Leave every other prose section untouched** — the user wrote those.
4. **Report the diff.** Tell the user which tokens changed (added/removed/value-changed).

## Color converter

```bash
node scripts/color-convert.mjs '#da702c'             # -> oklch(0.6576 0.1539 49.3)
node scripts/color-convert.mjs 'oklch(0.658 0.1539 49.3)' # -> #da702c
node scripts/color-convert.mjs --json '#da702c80'    # -> JSON with hex, oklch, rgb, alpha
echo '#171616' | node scripts/color-convert.mjs      # reads stdin
```

Auto-detects input format. Round-trips cleanly. Alpha supported in both directions.

Import in your own scripts:

```js
import { convert, hexToOklch, oklchToHex } from './scripts/color-convert.mjs';
```

## Spec essentials

- **YAML frontmatter is hex-only.** Tailwind oklch values get converted to hex for the frontmatter; the original oklch lives in the prose color table.
- **Section order matters** when sections are present (extras allowed after #8):
  1. Overview (alias: Brand & Style)
  2. Colors
  3. Typography
  4. Layout (alias: Layout & Spacing)
  5. Elevation & Depth (alias: Elevation)
  6. Shapes
  7. Components
  8. Do's and Don'ts
- **Component token keys**: `backgroundColor`, `textColor`, `typography`, `rounded`, `padding`, `size`, `height`, `width`. Variants (hover, pressed) are separate entries with related key names.
- **Token references** use `{path.to.token}` notation in YAML (e.g. `{colors.primary}`).

Full spec, token types, example output, and the prose color table format are in [REFERENCE.md](REFERENCE.md).

## When to ask the user

- No CSS file found → ask where their tokens live, or whether to draft tokens from a brand description.
- Project has multiple theme files (light, dark, system) → ask which to treat as canonical.
- Re-sync would overwrite custom hand-written tokens in YAML → confirm before overwriting.
