# Four Variants — Production Discipline

React Bits ships every component in four variants. CONTRIBUTING.md hard-rule: every change reflected in all four. PRs that don't get rejected.

## The four variants

| Variant | Path | Files |
| --- | --- | --- |
| JS-CSS | `src/content/<Category>/<Name>/` | `<Name>.jsx` + `<Name>.css` |
| JS-TW | `src/tailwind/<Category>/<Name>/` | `<Name>.jsx` |
| TS-CSS | `src/ts-default/<Category>/<Name>/` | `<Name>.tsx` + `<Name>.css` |
| TS-TW | `src/ts-tailwind/<Category>/<Name>/` | `<Name>.tsx` |

Demo and code-string are shared across variants:

| Concern | Path |
| --- | --- |
| Demo | `src/demo/<Category>/<Name>Demo.jsx` |
| Code-as-string for docs | `src/constants/code/<Category>/<nameLower>Code.js` |
| Asset (GLB, PNG) | colocated under `<Name>/`, listed in `MANUAL_ASSETS` of `jsrepo.config.ts` |

(Verified against `inspiration/primary/react-bits-repo/scripts/generateComponent.js` lines 19–43.)

## Scaffold

```bash
npm run new:component <Category> <ComponentName>
# Runs: node scripts/generateComponent.js
# Creates 8 empty files under 6 directories (Backgrounds | Components | Animations | TextAnimations × 4 + demo + constants/code).
```

`<Category>` is one of `TextAnimations`, `Animations`, `Components`, `Backgrounds`. `<ComponentName>` is PascalCase.

## Authoring order

1. **TS-TW first** (`src/ts-tailwind/<Category>/<Name>/<Name>.tsx`). This is canonical. Define the `Props` interface, defaults, primitive wiring, cleanup. Get the demo working with this variant.
2. **TS-CSS** = TS-TW with Tailwind classes replaced by sibling `.css` rules. The `.tsx` source stays the same; classNames change. Add `<Name>.css` and `import './<Name>.css';` at the top.
3. **JS-TW** = strip type annotations from TS-TW, rename `.tsx` → `.jsx`. No CSS file.
4. **JS-CSS** = strip types AND replace Tailwind with CSS. Both `.jsx` and `.css`.

## AI-assisted conversion

Per the Motion Magazine interview (Haz uses Opus 4.5):

- **TS → JS**: have AI strip type annotations and rename. Watch for `as const`, generics, `forwardRef<…>` — these all need careful handling.
- **Tailwind → CSS**: have AI emit a sibling `.css` file with one selector per element that previously had a Tailwind className. Use BEM-ish naming (`.<name>__<part>`). Verify hover/focus states translate.

**Manual review is mandatory.** Run all four variants locally and visually compare. Common AI mistakes:

- TS→JS strips a `forwardRef<Mesh, Props>` to `forwardRef`, which still works but loses the ref typing. Verify in the consumer.
- Tailwind→CSS misses `dark:` and `hover:` prefixes. Re-check the variant equivalents.
- Tailwind v4 arbitrary values like `[clip-path:inset(0)]` must be hand-translated.
- `tailwind-merge`-style conditional classes need to be re-expressed as conditional `className` joins or CSS classes toggled with state.

## Registry mechanics

`jsrepo.config.ts` (cached at `inspiration/primary/react-bits-repo/jsrepo.config.ts`) declares one config that drives one build:

```ts
defineConfig({
  registry: {
    name: '@react-bits',
    excludeDeps: ['react'],
    outputs: [output({ dir: 'public/r', format: true })], // @jsrepo/shadcn adapter
    items: [...componentMetadata.map(c => defineComponent({ ... }))].flat()
  }
});
```

The internal `defineComponent` helper (lines 72-162 of the cached `jsrepo.config.ts`) emits up to four `RegistryItem`s per component — one per variant — with `files: withManualFiles('src/<variant>/<Category>/<Name>')`. The `MANUAL_ASSETS` map is the escape hatch for non-code files (Lanyard's `card.glb` and `lanyard.png`).

Build commands (`package.json`):

```bash
npm run registry:build   # jsrepo build
npm run registry:dev     # jsrepo build --watch
npm run dev              # concurrently: registry:dev + vite (docs site)
```

After a successful build, `public/r/<Name>-{JS-CSS,JS-TW,TS-CSS,TS-TW}.json` exist. Each is shadcn-CLI-compatible (`$schema: ui.shadcn.com/schema/registry-item.json`).

## Per-component install

Two CLIs both work, both consume the registry artifacts above:

```bash
# shadcn
npx shadcn@latest add @react-bits/<Name>-TS-TW

# jsrepo
npx jsrepo@latest add github/DavidHDev/react-bits/src/ts-tailwind/<Category>/<Name>
```

`excludeDeps: ['react']` means the registry assumes consumers already have React. All other runtime deps the component uses are declared per-component in the artifact (e.g. `three@^0.167.1` for ASCIIText).

## Local testing of all four

```bash
# Watch mode rebuilds on file changes
npm run registry:dev

# In another terminal, run the docs site
npm run dev

# Or together
npm run dev   # already concurrently runs both
```

Visually verify all four variants from the docs site's variant switcher. The build will fail if a referenced source path doesn't exist — useful pressure to keep the four in sync.

## Common variant pitfalls

| Pitfall | Symptom | Fix |
| --- | --- | --- |
| Edit one variant, forget the others | PR rejected by CONTRIBUTING.md rule | Use `npm run new:component` first; treat the four files as one logical unit |
| Tailwind v4 arbitrary value lost in CSS variant | Visual regression | Hand-translate; AI misses these |
| `forwardRef<X, Y>` typing lost in JS variant | TS users hitting any | Re-add JSDoc `@type` if downstream typing matters |
| `gsap.registerPlugin` placed inside the component | Re-registration warnings | Module scope only |
| `'use client'` absent in App Router consumer | Hydration error | Document on the docs page that App Router consumers must add it |

## What community contributors should know

Per `CONTRIBUTING.md`, "new components from the community are currently not being accepted into the library, only component enhancements and bug fixes." If you've authored a new statement piece in this style, it lives in your own repo or a third-party registry — not upstream. (You can still install via the jsrepo CLI from your own GitHub repo: `npx jsrepo@latest add github/<you>/<repo>/src/ts-tailwind/<Category>/<Name>`.)
