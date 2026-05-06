# Dependencies — React Bits Stack

Source of truth: `package.json` of the React Bits repo. Versions below are point-in-time (early 2026). Always cross-check the file in your checkout.

## Animation

| Package | Version | Used for | Canonical example (repo-relative) |
| --- | --- | --- | --- |
| `motion` | ^12.23.12 | Default declarative DOM animation; `AnimatePresence`, springs, layout, gestures | `src/ts-tailwind/TextAnimations/BlurText/BlurText.tsx`, `…/RotatingText/RotatingText.tsx`, `src/ts-tailwind/Animations/FadeContent/FadeContent.tsx`, `src/ts-tailwind/Components/AnimatedList/AnimatedList.tsx` |
| `gsap` | ^3.13.0 | Scroll-driven and complex timelines; SplitText, ScrollTrigger, Observer plugins | `src/ts-tailwind/TextAnimations/SplitText/SplitText.tsx`, `…/ScrollReveal/ScrollReveal.tsx`, `src/ts-tailwind/Animations/AnimatedContent/AnimatedContent.tsx`, `src/ts-tailwind/Backgrounds/Ballpit/Ballpit.tsx` (Observer) |
| `@gsap/react` | ^2.1.2 | `useGSAP()` hook with auto-cleanup of tweens/timelines/ScrollTriggers | every GSAP-backed component |
| `lenis` | ^1.3.13 | Smooth scroll for narrative pacing | `src/ts-tailwind/Components/ScrollStack/ScrollStack.tsx` |

Notes: Motion is imported as `motion/react` (the React entry point). GSAP plugins are registered at module scope via `gsap.registerPlugin(ScrollTrigger, useGSAP)`. SplitText additionally registers `gsap/SplitText`.

## 3D / WebGL

| Package | Version | Used for | Canonical example |
| --- | --- | --- | --- |
| `three` | ^0.167.1 | Core 3D engine (renderer, scene graph, materials, instancing) | `src/ts-tailwind/Backgrounds/Ballpit/Ballpit.tsx`, `…/Hyperspeed/Hyperspeed.tsx`, `src/ts-tailwind/Components/ModelViewer/ModelViewer.tsx`, `…/Silk/Silk.tsx` |
| `@react-three/fiber` | ^9.3.0 | JSX-as-scene-graph wrapper around Three | `src/ts-tailwind/Backgrounds/Silk/Silk.tsx`, `src/ts-tailwind/Components/ModelViewer/ModelViewer.tsx` |
| `@react-three/drei` | ^10.7.4 | Helpers (OrbitControls, useGLTF, useFBX, Environment, Html, useProgress, ContactShadows) | `src/ts-tailwind/Components/ModelViewer/ModelViewer.tsx` |
| `@react-three/postprocessing` | ^3.0.4 | EffectComposer / Bloom / DOF in JSX | `src/ts-tailwind/Backgrounds/DarkVeil/DarkVeil.tsx`, `…/PixelBlast/PixelBlast.tsx` |
| `@react-three/rapier` | ^2.1.0 | Rust-WASM 3D physics | `src/ts-tailwind/Components/Lanyard/Lanyard.tsx` |
| `postprocessing` | ^6.36.0 | Underlying engine for `@react-three/postprocessing` | (transitive) |
| `meshline` | ^3.3.1 | Thick-line rendering for Three.js (`<line>` is hardware-1px on most GPUs) | `src/ts-tailwind/Components/Lanyard/Lanyard.tsx` (lanyard cord) |
| `maath` | ^0.10.8 | pmndrs math helpers (random distributions for particle init; `easing.damp3` smooth following) | `src/ts-tailwind/Components/FluidGlass/FluidGlass.tsx` (`easing.damp3`) |
| `ogl` | ^1.0.11 | Minimal WebGL (~8kb gzip), Three-like API. Used for nearly every shader background | `src/ts-tailwind/Backgrounds/Aurora/Aurora.tsx`, `…/Iridescence/Iridescence.tsx`, `…/LiquidChrome/LiquidChrome.tsx`, `…/LiquidEther/LiquidEther.tsx`, `…/Particles/Particles.tsx`, `…/Plasma/Plasma.tsx`, `…/PlasmaWave/PlasmaWave.tsx`, `…/Threads/Threads.tsx` |
| `gl-matrix` | ^3.4.3 | Vector/matrix math for shader uniforms | OGL components needing matrix transforms |

Why both R3F and OGL? OGL is ~8kb gzipped; Three.js is ~150kb. For a single full-screen fragment shader, OGL is correct. R3F is reached for when a shader is one element of a larger scene graph (Silk).

## Physics

| Package | Version | Used for | Canonical example |
| --- | --- | --- | --- |
| `matter-js` | ^0.20.0 | 2D rigid-body physics | `src/ts-tailwind/TextAnimations/FallingText/FallingText.tsx` |
| `@react-three/rapier` | ^2.1.0 | 3D physics (also above) | `src/ts-tailwind/Components/Lanyard/Lanyard.tsx` |

## Math / Utility

| Package | Version | Used for |
| --- | --- | --- |
| `mathjs` | ^14.6.0 | General-purpose math (rare in components) |
| `gl-matrix` | ^3.4.3 | (above) |

## Interaction

| Package | Version | Used for | Canonical example |
| --- | --- | --- | --- |
| `@use-gesture/react` | ^10.2.27 | Pointer/wheel/drag/pinch with multi-touch | `src/ts-tailwind/Components/Carousel/Carousel.tsx`, `…/ElasticSlider/ElasticSlider.tsx` |
| `face-api.js` | ^0.22.2 | Face detection (webcam-driven reflection) | `src/ts-tailwind/Components/ReflectiveCard/ReflectiveCard.tsx` |

## Styling

| Package | Version | Used for |
| --- | --- | --- |
| `tailwindcss` | ^4.0.3 | Utility CSS for `*-Tailwind` variants |
| `@tailwindcss/vite` | ^4.0.3 | Tailwind v4 Vite plugin |
| `tailwind-merge` | ^3.3.1 | Safe merge of conditional Tailwind classes (`cn(...)` helper) |
| `clsx` | ^2.1.1 | Conditional className concatenation |
| `class-variance-authority` | ^0.7.1 | Variant-class helper (mainly for the docs site, rare in components) |

## Build & Distribution

| Package | Version | Used for |
| --- | --- | --- |
| `vite` | ^5.3.4 | Dev server / docs site bundler |
| `@vitejs/plugin-react` | ^4.3.4 | React plugin for Vite |
| `jsrepo` | ^3.2.0 | Registry build CLI (`jsrepo build`) |
| `@jsrepo/shadcn` | ^2.0.0 | Output adapter — emits shadcn-CLI-compatible artifacts |
| `concurrently` | ^9.1.2 | Runs registry watcher + Vite dev concurrently |
| `eslint`, `prettier`, `typescript` | various | Lint/format/typecheck |
| `tw-animate-css` | ^1.4.0 | Tailwind plugin adding animate utilities |
| `postcss-safe-parser` | ^7.0.1 | Tolerant PostCSS parser |

## Site-only (NOT shipped per-component)

These are dependencies of the docs site at reactbits.dev, not of any component you would copy:

`@chakra-ui/react`, `@chakra-ui/icons`, `@emotion/react`, `react-router-dom`, `react-syntax-highlighter`, `react-virtualized`, `next-themes`, `nuqs`, `sonner`, `react-confetti`, `lucide-react`, `react-icons`, `geist`, `react-haiku`.

When you read the registry artifact for a component (e.g. `react-bits-asciitext-registry/page.json`), only the deps the component actually uses are declared (e.g. `three@^0.167.1` for ASCIIText).

## Version-pinning posture

- Caret ranges (`^`) throughout — open to minor/patch bumps. The lockfile pins exact resolutions.
- React 19 is required (`react ^19.0.0`). The registry config uses `excludeDeps: ['react']` — the registry assumes consumers already have React.
- TypeScript 5.7+ for the TS variants.
- Tailwind v4 — major break vs v3. The Tailwind variants assume v4 features (`@tailwindcss/vite`, no config file).

## "If I add a new component, what dependencies are 'free'?"

If your component already needs:

- **DOM animation only** → `motion` is free, no new deps.
- **Scroll-tied animation** → `gsap`, `@gsap/react`, optionally `lenis` — free.
- **Full-screen shader background** → `ogl`, `gl-matrix` — free.
- **3D scene** → `three`, `@react-three/fiber`, `@react-three/drei`, optionally `@react-three/postprocessing`, `@react-three/rapier`, `meshline`, `maath` — free.
- **2D physics** → `matter-js` — free.
- **3D physics** → `@react-three/rapier` — free.
- **Custom gestures** → `@use-gesture/react` — free.

Adding a new primitive >5kb gzip means convincing the maintainer; given the closed-to-new-components contribution policy upstream, this is effectively only a concern in your own fork. The bias is "use what's already in package.json."
