---
name: react-bits-components
description: Use when authoring or extending an animated React component in the React Bits (DavidHDev) style — Motion-first DOM, GSAP scroll timelines, OGL shader backgrounds, R3F 3D scenes, or matter-js physics — including any component intended for the React Bits four-variant registry (JS-CSS / JS-TW / TS-CSS / TS-TW), or any prop-heavy "statement piece" set-piece (Aurora, Silk, Ballpit, ScrollStack, SplitText, etc.).
---

# React Bits Components

## Overview

React Bits is David Haz's library of 110+ animated React components shipped in four variants (JS-CSS / JS-TW / TS-CSS / TS-TW) via jsrepo + shadcn-CLI registries. The ethos: single-file, prop-heavy "statement pieces" — one component file with 8–20 props exposing every visual lever, one primitive per effect (Motion / GSAP / OGL / R3F / matter-js), and the perform-or-abandon rule (if it can't hold 60fps on a mid-tier device, fall back to CSS).

Author philosophy: "I tried to add as many props and sliders and all kinds of tweak-able things." (DEV launch post, Jan 8 2025). "Ninety-nine percent of the time, it's `<AnimatePresence />` for clean enter and exit animations." (Motion Magazine interview, Jan 8 2026).

## When to use

- Authoring a new animated React component for the React Bits registry, or in the same style elsewhere.
- Adding to an existing React Bits checkout (must update all four variants — see references/four-variants.md).
- Building a prop-heavy "statement piece" — a hero shader, a scroll-pinned card stack, a 3D viewer, a Motion-driven text reveal.
- Picking the right primitive (Motion vs GSAP vs OGL vs R3F vs matter-js) for a specific effect.
- Reviewing performance/a11y of a Motion / R3F / OGL / GSAP component.

## When NOT to use

- Headless primitives (use Radix / shadcn/ui instead).
- Marketing page blocks (use Tailark / Magic UI).
- General Three.js / R3F help unrelated to React Bits idioms (use threejs-fundamentals, threejs-shaders).
- Server-side animation of any kind — every React Bits component is client-only.

## Primitive selection (decision table)

| Effect type | Primitive | Canonical example | Bundle cost |
| --- | --- | --- | --- |
| DOM mount/unmount, hover, in-view | **Motion** (`motion/react`) | `src/ts-tailwind/TextAnimations/BlurText/BlurText.tsx` | ~5kb with `LazyMotion` + `m`, ~30kb full |
| AnimatePresence wait-mode rotation | **Motion** (`AnimatePresence`) | `src/ts-tailwind/TextAnimations/RotatingText/RotatingText.tsx` | same |
| Scroll-pinned, scrub, complex timeline | **GSAP + ScrollTrigger** via `@gsap/react`'s `useGSAP` | `src/ts-tailwind/TextAnimations/SplitText/SplitText.tsx`, `src/ts-tailwind/Animations/AnimatedContent/AnimatedContent.tsx` | ~30kb gsap + plugins |
| Full-screen procedural shader background | **OGL** (`Renderer + Program + Mesh + Triangle`) | `src/ts-tailwind/Backgrounds/Aurora/Aurora.tsx` | ~8kb gzip |
| R3F shader-plane (full-screen procedural background rendered inside `<Canvas>`) | **R3F** (`<Canvas>` + `<shaderMaterial>` on a viewport-sized plane) | `src/ts-tailwind/Backgrounds/Silk/Silk.tsx` | ~150kb three + r3f |
| R3F 3D scene (meshes / GLTF / lights / drei helpers; optional physics / post) | **R3F + drei** (+ optional `@react-three/rapier`, `@react-three/postprocessing`, `meshline`) | `src/ts-tailwind/Components/ModelViewer/ModelViewer.tsx`, `…/Lanyard/Lanyard.tsx`, `…/FluidGlass/FluidGlass.tsx`, `src/ts-tailwind/Backgrounds/Hyperspeed/Hyperspeed.tsx` | ~150kb + drei |
| Custom render loop, instancing, scene class hierarchy | **Raw Three.js** | `src/ts-tailwind/Backgrounds/Ballpit/Ballpit.tsx`, `…/Hyperspeed/Hyperspeed.tsx` | ~150kb |
| 3D physics | **R3F + @react-three/rapier** | `src/ts-tailwind/Components/Lanyard/Lanyard.tsx` | rapier-wasm ~1MB |
| 2D physics | **matter-js** | `src/ts-tailwind/TextAnimations/FallingText/FallingText.tsx` | ~90kb |
| Cursor proximity / tilt / glare | Vanilla `mousemove` or **Motion** `useMotionValue` + `useSpring` | `src/ts-tailwind/Animations/Magnet/Magnet.tsx`, `src/ts-tailwind/Components/TiltedCard/TiltedCard.tsx` | ~0–5kb |
| Smooth scroll for narrative pacing | **lenis** wrapped + manual rAF | `src/ts-tailwind/Components/ScrollStack/ScrollStack.tsx` | ~5kb |
| Switch primitive when… | If 60fps cannot hold on a mid-tier 2021 laptop / Android, abandon WebGL and ship a CSS / Motion approximation. This is policy, not aspiration. (Haz, Motion Magazine interview, Jan 8 2026.) | | |

See references/techniques.md for full skeletons of each primitive's pattern.

## Canonical workflow

1. **Pick the slot** — Category is one of `TextAnimations`, `Animations`, `Components`, `Backgrounds`. Pick the closest existing analog (see references/components-catalog.md) and read it deeply before diverging.
2. **Scaffold** — `npm run new:component <Category> <ComponentName>` runs `node scripts/generateComponent.js`, which creates 8 empty files across 6 directories (the four-variant matrix + demo + code-string).
3. **Build TS-TW first** — Author the canonical variant at `src/ts-tailwind/<Category>/<ComponentName>/<ComponentName>.tsx`. Define a `<Name>Props` interface with sensible defaults for every prop. Always accept `className`. Wire the reduced-motion gate (see references/performance.md).
4. **Mirror the other 3 variants** — AI-assisted: TS→JS strips type annotations and renames `.tsx`→`.jsx`; Tailwind→CSS replaces classes with sibling `.css` rules. Manually verify code and visual parity in each. (Haz uses Opus 4.5 per the Motion Magazine interview; agents should emulate but always review.) See references/four-variants.md.
5. **Wire the demo** — `src/demo/<Category>/<Name>Demo.jsx` mirrors existing demos (PreviewTab + Customize sliders + PropTable + Dependencies). Pull props through `useComponentProps(DEFAULT_PROPS)`.
6. **Code constants** — `src/constants/code/<Category>/<nameLower>Code.js` holds the code-as-string used by the docs site CodeExample.
7. **Local registry build** — `npm run registry:dev` (`jsrepo build --watch`) emits the four registry artifacts under `public/r/`. Verify they appear.
8. **Perf + a11y check** — `r3f-perf` `<Perf />` for R3F; Chrome DevTools Performance for OGL/canvas; `prefers-reduced-motion` gate (Motion: `useReducedMotion()`; OGL/R3F: media-query check); `aria-hidden="true"` on decorative backgrounds; ensure animated text remains screen-reader-readable.
9. **PR** — Per `CONTRIBUTING.md`: every change reflected in all four variants, manual local test, screen recording at 60fps on a mid-tier device. Note that "new components from the community are currently not being accepted" upstream — community contributions are limited to enhancements and bug fixes.

## Prop API conventions

Concrete rules pulled from Aurora, SplitText, ScrollStack, Silk, ModelViewer:

- **8–20 props is normal.** Aurora ships 5 (`colorStops`, `amplitude`, `blend`, `time`, `speed`); SplitText 13; ScrollStack 11; ModelViewer 23. Don't be shy.
- **Every visual lever is a prop with a default.** No magic numbers buried in the body. If the shader has an amplitude, expose `amplitude`. If the timeline has an ease, expose `ease`.
- **Always accept `className`.** Components that compose with surrounding layout merge with `tailwind-merge`'s `cn(...)` when conditional Tailwind classes are involved (`tailwind-merge` is in `package.json`, version `^3.3.1`).
- **Defaults match the demo screenshot.** A user copy-pasting the component with no props should get the visual on reactbits.dev. Aurora: `colorStops = ['#5227FF', '#7cff67', '#5227FF']`, `amplitude = 1.0`, `blend = 0.5`.
- **Callbacks for lifecycle moments.** SplitText: `onLetterAnimationComplete`. ScrollStack: `onStackComplete`. AnimatedContent: `onComplete`, `onDisappearanceComplete`.
- **Imperative API via `forwardRef` + `useImperativeHandle` for stateful components.** RotatingText exposes `next`, `previous`, `jumpTo`, `reset`.
- **Motion components: `useMotionValue` + `useSpring` for smooth derived values.** TiltedCard does the rotation + scale + glare position this way.
- **GSAP components: `useGSAP({ scope: ref, dependencies: [...] })`** so tweens and ScrollTriggers cleanup on unmount or dep change. Always.
- **WebGL components: hex colors normalized inside the component**, written into uniforms as `[r, g, b]`. Aurora reimplements `hexToRgb`; Silk reimplements `hexToNormalizedRGB` — there is no shared util.
- **Defaults preserve performance.** `dpr={[1, 2]}` in R3F; `mouseReact = false` opt-in for shader components; `useWindowScroll = false` (use container scroll) in ScrollStack.

## Quick reference: where each file goes

| Concern | Path |
| --- | --- |
| TS-TW source (canonical) | `src/ts-tailwind/<Category>/<Name>/<Name>.tsx` |
| TS-CSS source | `src/ts-default/<Category>/<Name>/<Name>.tsx` + `<Name>.css` |
| JS-TW source | `src/tailwind/<Category>/<Name>/<Name>.jsx` |
| JS-CSS source | `src/content/<Category>/<Name>/<Name>.jsx` + `<Name>.css` |
| Demo (JSX, single shared file consumed by the docs site) | `src/demo/<Category>/<Name>Demo.jsx` |
| Code-as-string for docs viewer | `src/constants/code/<Category>/<nameLower>Code.js` |
| Asset (GLB, PNG) | colocated under `<Name>/` and listed in `MANUAL_ASSETS` of `jsrepo.config.ts` |
| Registry artifacts (generated) | `public/r/<Name>-{JS-CSS,JS-TW,TS-CSS,TS-TW}.json` |

(Exact mapping verified against `inspiration/primary/react-bits-repo/scripts/generateComponent.js` and `jsrepo.config.ts`.)

## Stack at a glance

| Package | Version | Used for |
| --- | --- | --- |
| `react` | ^19.0.0 | Required (registry config: `excludeDeps: ['react']`) |
| `motion` | ^12.23.12 | Default DOM animation; AnimatePresence, springs, layout |
| `gsap` | ^3.13.0 | Scroll/timeline; SplitText / ScrollTrigger / Observer |
| `@gsap/react` | ^2.1.2 | `useGSAP()` auto-cleanup |
| `three` | ^0.167.1 | 3D engine |
| `@react-three/fiber` | ^9.3.0 | JSX scene graph |
| `@react-three/drei` | ^10.7.4 | Helpers (OrbitControls, useGLTF, Environment, Html) |
| `@react-three/postprocessing` | ^3.0.4 | EffectComposer in JSX |
| `@react-three/rapier` | ^2.1.0 | 3D physics |
| `ogl` | ^1.0.11 | 8kb-gzip WebGL for shader backgrounds |
| `matter-js` | ^0.20.0 | 2D physics |
| `meshline` | ^3.3.1 | Thick-line rendering |
| `maath` | ^0.10.8 | pmndrs math helpers |
| `gl-matrix` | ^3.4.3 | Vector/matrix math for shaders |
| `lenis` | ^1.3.13 | Smooth-scroll for narrative pacing |
| `@use-gesture/react` | ^10.2.27 | Pointer/wheel/drag gestures |
| `tailwindcss` | ^4.0.3 | Utility CSS for Tailwind variants |
| `tailwind-merge` | ^3.3.1 | Safe merge of conditional Tailwind classes |
| `jsrepo` | ^3.2.0 | Registry build CLI |
| `@jsrepo/shadcn` | ^2.0.0 | shadcn-CLI output adapter |

Site-only deps (NOT shipped per-component): `@chakra-ui/react`, `react-router-dom`, `react-syntax-highlighter`, `react-virtualized`, `next-themes`, `nuqs`, `sonner`, `react-confetti`, `lucide-react`, `react-icons`, `geist`, `react-haiku`. Per-component registry artifacts only declare the runtime deps they actually need.

See references/dependencies.md for grouped tables and per-component citations.

## Performance must-haves

- **Animate only `transform`, `opacity`, `filter`.** Never `width`/`height`/`top`/`left` in animation loops (Motion Magazine perf tier list).
- **`willChange: 'transform, opacity'` + `force3D: true`** (GSAP) — set before the tween, optional remove after settle.
- **`useGSAP({ scope: ref })`** for every GSAP component. Auto-cleanup of tweens, timelines, ScrollTriggers.
- **WebGL cleanup is mandatory.** OGL: `gl.getExtension('WEBGL_lose_context')?.loseContext();` in the `useEffect` cleanup. Three.js: `renderer.dispose(); renderer.forceContextLoss();` plus a `scene.traverse` disposing geometries/materials/textures.
- **DPR clamp.** R3F: `<Canvas dpr={[1, 2]}>`. OGL: pass `dpr` to `Renderer({ dpr })`. Retina x4 fillrate is the silent killer.
- **IntersectionObserver-gated init.** Don't burn cycles offscreen. ASCIIText defers Three.js init until the host is intersecting and has nonzero size.
- **`InstancedMesh` for ≥100 repeats.** One draw call beats N. Ballpit's pattern.
- **`frameloop="demand"` + `invalidate()`** for static-when-idle R3F scenes (Silk currently uses `"always"` — a missed optimization in the source).
- **Reduced-motion gate.** `useReducedMotion()` (Motion) or `matchMedia('(prefers-reduced-motion: reduce)')` (OGL/R3F). The shipped React Bits source frequently misses this — close the gap on new components.
- **Abandon-when-slow.** If you cannot hold 60fps on a mid-tier device, ship a CSS/Motion fallback. Haz's stated rule.

See references/performance.md for full checklists.

## Common mistakes

| Mistake | Reality |
| --- | --- |
| Inventing a new dep when an existing one will do | The bias is hard: "use what's already in package.json." A new physics or shader lib >5kb gzip needs maintainer buy-in (and community-sourced new components are not currently being accepted upstream). |
| Shipping `frameloop="always"` for a static R3F scene | Use `frameloop="demand"` + `invalidate()`. R3F scaling-performance docs are explicit. |
| Forgetting `useGSAP` cleanup, hand-rolling `useEffect` for GSAP | `useGSAP({ scope: ref })` is the only correct pattern. Tweens, timelines, ScrollTriggers all get killed on unmount automatically. |
| Skipping `prefers-reduced-motion` | Most shipped React Bits components miss this; new code should not. `useReducedMotion()` for Motion; media-query for shaders. |
| Shipping only one variant | CONTRIBUTING.md hard-rule: every change reflected in all four (JS-CSS, JS-TW, TS-CSS, TS-TW). |
| Confusing CSS Aurora (Aceternity / shadcn.io) with React Bits OGL Aurora | React Bits' Aurora is shader-driven via OGL with simplex noise + 3 color stops. Aceternity's "Aurora" is a CSS gradient. Don't conflate. |
| Pure-Framer-Motion semantics that block RSC | Motion components require `"use client"` in Next.js App Router. CSS-only and OGL/R3F components don't (they client-init via `useEffect`). |
| Animating `width`/`height`/`left`/`top` | S/A-tier per Motion Magazine: `transform`, `opacity`, `filter` only. Layout-changing animations are F-tier. |
| Forgetting `gl.loseContext()` on OGL unmount | Browsers cap WebGL contexts (~16). Mount/unmount-without-cleanup eventually breaks rendering silently. Aurora's pattern is canonical: `gl.getExtension('WEBGL_lose_context')?.loseContext();` in the useEffect cleanup. |
| Hand-writing the four variants from scratch | Always run `npm run new:component <Category> <ComponentName>` first — the scaffolder writes 8 files in 6 directories. |
| Shared util for hex→RGB | Doesn't exist in the codebase. Each shader component reimplements `hexToRgb` / `hexToNormalizedRGB` inline. Match the surrounding component's style; don't add a shared util in a single PR. |
| Treating shader-plane and 3D scene as the same primitive | Shader-plane (Silk) is a fragment shader rendered on a single viewport-sized mesh. 3D scene (ModelViewer / Lanyard / FluidGlass) is a real graph with GLTF, lights, cameras, and interaction. Pick the right template and reference — see `references/threejs.md`. |
| Loading GLTF in render path without `useGLTF.preload(url)` | Causes Suspense-fallback flash on first paint. ModelViewer's pattern (`ModelViewer.tsx:407`) is `useEffect(() => { useGLTF.preload(url); }, [url])`. Pair with `MANUAL_ASSETS` in `jsrepo.config.ts` so jsrepo ships the binary. |
| Using `<line>` for visible cords / beams / ribbons | Hardware-1px on most platforms regardless of `linewidth`. Use `meshline` (`extend({ MeshLineGeometry, MeshLineMaterial })`, then `<meshLineGeometry />` + `<meshLineMaterial lineWidth={…} resolution={…} />`) — Lanyard pattern. |

## Templates index

| Template | Models on |
| --- | --- |
| [templates/skeleton-motion-2d.tsx](templates/skeleton-motion-2d.tsx) | `src/ts-tailwind/TextAnimations/BlurText/BlurText.tsx` (Motion + IntersectionObserver) |
| [templates/skeleton-r3f-shader-plane.tsx](templates/skeleton-r3f-shader-plane.tsx) | `src/ts-tailwind/Backgrounds/Silk/Silk.tsx` (R3F `<Canvas>` + `<shaderMaterial>` on a viewport-sized plane — *not* a 3D scene) |
| [templates/skeleton-r3f-scene.tsx](templates/skeleton-r3f-scene.tsx) | `src/ts-tailwind/Components/ModelViewer/ModelViewer.tsx` + `…/Lanyard/Lanyard.tsx` (real 3D scene: GLTF, drei, lights, `frameloop="demand"`) |
| [templates/skeleton-ogl-shader.tsx](templates/skeleton-ogl-shader.tsx) | `src/ts-tailwind/Backgrounds/Aurora/Aurora.tsx` (OGL Renderer/Program/Triangle) |
| [templates/skeleton-gsap-scroll.tsx](templates/skeleton-gsap-scroll.tsx) | `src/ts-tailwind/Animations/AnimatedContent/AnimatedContent.tsx` + SplitText pattern |
| [templates/skeleton-demo.tsx](templates/skeleton-demo.tsx) | `src/demo/Backgrounds/AuroraDemo.jsx` (PreviewTab + Customize sliders + PropTable) |

## References index

| Reference | When to use |
| --- | --- |
| [references/dependencies.md](references/dependencies.md) | Picking which lib to reach for; verifying versions; "is X already free?" |
| [references/techniques.md](references/techniques.md) | Full skeletons of each primitive's idiom (Motion, GSAP, OGL, R3F, raw Three, matter-js, pointer-reactive, scroll-stack) |
| [references/components-catalog.md](references/components-catalog.md) | Shopping aisle; finding the closest existing component to study before diverging |
| [references/performance.md](references/performance.md) | R3F + Motion + GSAP + a11y checklists, the abandon-when-slow rule, reduced-motion gating |
| [references/four-variants.md](references/four-variants.md) | Mapping table; `npm run new:component`; AI-assisted TS↔JS / Tailwind↔CSS workflow with manual-review caveats; `jsrepo` registry mechanics |
| [references/shaders.md](references/shaders.md) | OGL boilerplate; GLSL idioms (smoothstep, FBM, noise, polar coords, color stops); thebookofshaders.com / iquilezles.org pointers; DPR clamping and pause-when-offscreen |
| [references/threejs.md](references/threejs.md) | R3F vs OGL vs vanilla decision matrix; canonical R3F scene shape; `useGLTF` + `MANUAL_ASSETS`; drei helpers in use; Rapier physics; meshline; postprocessing pipeline; instancing; camera + lighting cookbook; common 3D scene mistakes |
