# Discovery Checklist

Read these in priority order during step 2 of the workflow. Skip what doesn't exist; don't infer.

## Tier 1 — Always read

These are the highest-signal files. Without them you don't have a design system to extract.

- **Token file.** Where the CSS custom properties or theme tokens live. Common locations:
  - `app/globals.css`, `apps/web/app/globals.css`, `src/styles/globals.css`
  - `packages/ui/src/styles/globals.css` (monorepo)
  - `tailwind.config.{ts,js,cjs}` — `theme.extend` block
  - `tokens.css`, `theme.css`, `variables.css`
  - A CSS-in-JS theme module (`theme.ts`, `tokens.ts`)
  - For Tailwind v4: look for an `@theme` or `@theme inline` block
- **Shadcn config.** `components.json` if present — captures style preset (e.g. `radix-nova`, `default`, `new-york`), `baseColor`, `iconLibrary`, alias paths.
- **5–10 primitive components.** Start with: button, card, badge, tabs, input, separator. Add: dialog, dropdown-menu, popover, tooltip, switch, checkbox if they exist. These define the shape vocabulary.

## Tier 2 — Read if it exists

High-signal but not always present.

- **Dedicated design-system app.** `apps/design-system/`, `apps/storybook/`, `packages/ui-docs/` — usually a runnable app showing primitives in context. Often has the canonical examples.
- **Dev preview pages.** `apps/web/app/dev/<component>/page.tsx`, `pages/__dev__/`, `src/dev/` — engineer-built component playgrounds. Often higher signal than tests.
- **Storybook stories.** `*.stories.{ts,tsx,mdx}` — show intended usage of each primitive.
- **The most-imported composition components.** Real product surfaces (a dashboard card, a list row, a header). These show how primitives combine in this codebase, which informs the Composition Examples section.

## Tier 3 — Look for the signature element

The discovery for this is its own thing. See [signature-elements.md](signature-elements.md).

## Tier 4 — Skip unless asked

Don't waste tokens on these unless the user explicitly asks for them in the output.

- Marketing site styles (different design language than the app)
- Email templates (different constraints)
- Mobile/native code (different platform conventions)
- Generated/build artifacts (`dist/`, `.next/`, `build/`)

## Reading order within Tier 1

1. `components.json` first — tells you which token system to expect (shadcn radix-nova vs default vs custom).
2. The token file second — gives you the palette, radii, type scale.
3. Primitives third — gives you the shape vocabulary.

This order matters because each step informs how to read the next. Reading `button.tsx` is much easier when you already know the token vars it references.

## Stop conditions

Stop reading and start generating when you have:

- Every color, radius, font, and spacing token
- Class shapes for buttons (variants × sizes), cards, badges, tabs, inputs
- One identified signature element with enough source to reproduce it
- Voice/tone signal from at least one real composition

Reading every file in `packages/ui` is over-discovery. If you've read 10 primitives and they all share the same token vocabulary, you have the system; move on.

## Token completeness checklist

Before generating, confirm you have at minimum:

- [ ] Background and foreground (page-level)
- [ ] Card / surface tokens
- [ ] Primary / accent
- [ ] Muted / secondary text
- [ ] Border (often hairline rgba)
- [ ] Semantic (success, warning, destructive)
- [ ] Radii (at least 2 sizes, often `--radius` + `--radius-sm/md/lg`)
- [ ] Type scale (heading + body + mono if used)

If any of these is missing from the project, document the gap in the output rather than inventing a value.
