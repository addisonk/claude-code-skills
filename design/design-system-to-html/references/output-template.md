# Output Template

Section structure for `design-system.html`. All sections are required unless noted.

## Document shell

- HTML5 doctype, `<html lang="...">`
- `<meta name="viewport" content="width=device-width, initial-scale=1">`
- All CSS in a single `<style>` block in `<head>`
- `:root` block declaring every project token as a CSS custom property at the top of the style block — this is what makes the file self-demonstrating
- Body uses the project's `--background` and `--foreground` tokens directly
- Sticky TOC on the left at desktop widths (`position: sticky; top: 24px`)

## 1. Header

- Kicker (uppercase, muted): `<PROJECT-NAME> · DESIGN SYSTEM`
- H1: `Visual reference`
- Lead paragraph (3–5 lines): one-line description of the project, then how to use this file in prompts ("Paste this line into any Claude Code prompt: 'match the style of <path>/design-system.html'.")
- Last-generated date

## 2. Tokens

Show every token visibly. Don't list tokens in prose — render them.

### Colors

Grouped swatch grid. Each swatch:
- 64×64px colored square using the live var
- Var name (mono, e.g. `--primary`)
- Raw value (e.g. `oklch(0.623 0.214 259.815)`)
- One-line "where it's used" hint (e.g. "buttons, focus rings, primary brand")

Group by purpose:
- **Surface** — background, card, popover, sidebar
- **Text** — foreground, muted-foreground, primary-foreground, accent-foreground
- **Brand** — primary, accent, ring (and any team/brand-specific tokens)
- **Semantic** — success, warning, destructive, info
- **Borders** — border, input, hairline tokens

### Radii

Visual ruler — one box per radius token at the actual radius. Label each with var name and value. Order from sharpest to roundest.

### Type scale

Sample blocks at real sizes. For each: heading text, var name, font-family, font-size (px and rem), font-weight, line-height, letter-spacing.

Cover at minimum: h1, h2, h3, body, small, mono. Use `--font-sans` and `--font-heading` if the project defines them.

### Spacing

Visual scale — labeled gaps between dots showing 4 / 8 / 12 / 16 / 24 / 32 / 48 / 64 px (or whatever the project actually uses; match Tailwind/shadcn conventions if present).

## 3. Primitives gallery

For each primitive, render a real working version using inline HTML/CSS that matches the project's primitive's actual class composition. Include the import path the developer would use (e.g. `import { Button } from '@workspace/ui/components/button'`).

Required primitives:
- **Button** — every variant × every size that exists in the project's `button.tsx`. Each row labeled.
- **Card** — standard composition with Header / Title / Description / Content / Footer, populated with realistic product copy.
- **Badge** — every variant.
- **Tabs** — the project's actual tab style (underline, pill, segmented, etc.) with realistic labels.
- **Input** — at minimum default with placeholder. Add disabled/error if those exist.
- **Separator** — horizontal.

Optional primitives if they exist and are visually distinctive: dialog, dropdown-menu, popover, tooltip, switch, checkbox, slider, progress.

## 4. Signature element

This section gets more space than any other. Read [signature-elements.md](signature-elements.md) for how to identify it.

Include:
- A "raw shell" — the empty primitive so the geometry is visible
- A "fully composed" example with realistic content in every slot/prop
- A 2-up showing it next to the closest equivalent generic primitive (e.g. signature card next to default shadcn card) so the difference is visible
- Implementation notes: how the geometry is built (clip-path / SVG overlay / box-shadow / etc.), what props/slots exist, when to use vs the generic version

If fidelity below ~80%, label it "approximate" and link to the canonical source file in the codebase.

## 5. Composition examples

Three small assembled blocks showing how primitives combine in this product. Pick from real product surfaces:

1. A stat tile or KPI card
2. A list row (table row, conversation row, item row)
3. A faux page chrome (page header + tab strip + first card) representative of a typical surface in the app

Use the actual composition components in the codebase as visual reference.

## 6. Iconography

Inline 12–16 Lucide icons (or the project's chosen icon library) at the project's actual size and stroke convention. Show each at the inline size (typically 16–20px, stroke 1.5–2). Label each with name.

Pick icons the project actually uses — check imports in the most-active composition components.

## 7. Voice + tone

4–6 lines of project-specific prose:
- Who the product addresses
- The register (formal/casual, technical/friendly, terse/verbose)
- Domain vocabulary used without explanation
- Any voice-shifts in specific surfaces (e.g. "the AI Coach tab leans warmer")

This section is short on purpose. It's a sanity check more than a style guide.

## 8. Use-me footer

A copy-pasteable instruction block:

> **Using this file in prompts**
>
> When you ask Claude Code to generate an HTML artifact in this repo (a plan, a mockup, an exploration), include this line: *"Match the visual style of `<absolute-path>/design-system.html`. Use the tokens, primitives, and signature element documented there. Do not invent new colors or shapes."*
>
> Or, even shorter: *"Match `design-system.html`."*

Plus a regeneration note: when to regenerate (new tokens, redesigned signature element, new primitive added) and how (`/design-system-to-html`).

## Layout / chrome details

- Sticky TOC on the left at ≥900px viewports. Single-column at <900px.
- Each section has an anchor ID and is linkable from the TOC.
- Generous vertical rhythm between sections (96–128px).
- Consistent section header style: small kicker + H2.
- Footer with last-generated date and a "regenerate" hint.

## Size budget

Typical: 40–80KB. Hard ceiling: 100KB. If approaching the ceiling, audit:
- SVG bloat (some Lucide icons are surprisingly large)
- Repeated CSS (consolidate into utility classes)
- Over-detailed composition examples

## Anti-patterns

- **Tables of tokens with no swatches.** If a reader has to read the value to know the color, you've failed. Always render.
- **Primitives without realistic content.** A button labeled "Button" is useless. Use product-realistic copy.
- **Multiple signature elements with equal weight.** Pick one.
- **Web fonts.** Single-file, offline-readable; use `font-family: var(--font-sans), system-ui, ...` and let the browser substitute.
- **External images.** Inline SVG only.
- **A "design principles" section.** This file documents what exists, not what should exist. Principles belong in a separate doc.
