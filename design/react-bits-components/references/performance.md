# Performance — Checklists

Before shipping any React Bits component, walk every applicable section.

## The abandon-when-slow rule

Quote (Haz, Motion Magazine interview, Jan 8 2026): "I end up abandoning components because some devices simply can't handle them performance-wise, so I can't ship them."

This is policy, not aspiration. Test on a baseline mid-tier device (a 2021 MacBook Air, mid-tier Android). If 60fps cannot hold, ship a CSS or Motion approximation instead. Do not ship a janky WebGL component.

## WebGL / R3F

- [ ] **Dispose on unmount.** Three.js: `scene.traverse((o) => { o.geometry?.dispose?.(); o.material?.dispose?.(); }); renderer.dispose(); renderer.forceContextLoss();` OGL: `gl.getExtension('WEBGL_lose_context')?.loseContext();`
- [ ] **Clamp DPR.** R3F: `<Canvas dpr={[1, 2]}>`. OGL: pass `dpr` to `Renderer({ dpr })`. Without this, retina renders at 4× fillrate.
- [ ] **`frameloop="demand"` + `invalidate()`** for static-when-idle scenes. (Silk uses `"always"` — a missed optimization.)
- [ ] **`InstancedMesh` for ≥100 repeats.** One draw call beats N. Ballpit's pattern.
- [ ] **Use `<PerformanceMonitor>` (drei)** to react to dropped frames — typical pattern is to lower DPR or disable post-processing when frame budget is exceeded.
- [ ] **Use LODs (`<Detailed>` from drei)** for distance-dependent geometry.
- [ ] **Reuse geometries and materials** across instances. Don't allocate per-render.
- [ ] **`r3f-perf` `<Perf />` HUD** during development to inspect draw calls / FPS. Remove before shipping.
- [ ] **IntersectionObserver gate.** Don't initialize the renderer until the host is intersecting and has nonzero size (ASCIIText pattern).
- [ ] **ResizeObserver for size changes** rather than `window` resize, so embedded components react to parent resizes.
- [ ] **ACES filmic tone mapping + sRGB color space + PMREM env map** for any 3D scene that needs polish (Ballpit pattern, `Ballpit.tsx:18-21`).

## Motion (motion/react)

- [ ] **Animate `transform`, `opacity`, `filter` only.** Never `width`/`height`/`top`/`left` (Motion Magazine perf tier list).
- [ ] **Use `LazyMotion` + `m.*`** for bundle-size-sensitive components. `useAnimate` mini = 2.3kb; `m + LazyMotion` = 4.6kb initial vs full Motion ~30kb.
- [ ] **`useMotionValue` + `useSpring` for derived values** (TiltedCard pattern). Don't drive React state from a per-frame source.
- [ ] **Layout animations are expensive.** Use `layout` prop only when you need automatic FLIP. Prefer explicit `animate` keyframes when you control the geometry.
- [ ] **`useReducedMotion()`** — gate or shorten animations. The shipped React Bits source frequently misses this; close the gap on new components.
- [ ] **`AnimatePresence mode="wait"`** for sequential exit→enter (RotatingText pattern).
- [ ] **`willChange: 'transform, opacity'`** on the animated element style.

## GSAP

- [ ] **`useGSAP({ scope: ref })`** for every GSAP component. Auto-cleanup of tweens, timelines, ScrollTriggers.
- [ ] **Register only the plugins you need.** `gsap.registerPlugin(ScrollTrigger, useGSAP)`. Module-scope, not per-render.
- [ ] **`force3D: true` + `willChange: 'transform, opacity'`** on tweens for GPU compositing.
- [ ] **`scrub: true`** for scroll-tied tweens; `once: true` for trigger-once entrances.
- [ ] **Filtered ScrollTrigger cleanup** in your useEffect/useGSAP return: `ScrollTrigger.getAll().forEach(st => { if (st.trigger === el) st.kill(); });`
- [ ] **`fastScrollEnd: true`** — finish in-progress tweens fast when the user scrolls past quickly.
- [ ] **Cache last-applied transforms; skip the DOM write if unchanged** for high-frequency manual scroll math (ScrollStack pattern, threshold `> 0.1` px / `> 0.001` scale).

## Manual rAF loops (canvas, lenis-driven)

- [ ] **`cancelAnimationFrame(id)`** in cleanup.
- [ ] **Schedule only one rAF per tick.** Use a flag (`isUpdatingRef`) to dedupe rapid-fire scroll callbacks.
- [ ] **Pause when offscreen.** IntersectionObserver toggles a `paused` flag the loop checks first.
- [ ] **Cap delta** for tab-switch resumes: `Math.min(delta, 0.1)` so re-entering a tab doesn't fire one giant tick.

## Accessibility

- [ ] **Reduced-motion gate** on every animated component.
  - Motion: `useReducedMotion()` → render static fallback or shorter animation.
  - GSAP: `gsap.matchMedia()` with `(prefers-reduced-motion: reduce)`.
  - OGL/canvas: `window.matchMedia('(prefers-reduced-motion: reduce)').matches` → render single static frame, skip rAF.
- [ ] **`aria-hidden="true"`** on purely decorative backgrounds and shader containers. (Aurora ships without this — fix on new components.)
- [ ] **Animated text remains selectable + screen-reader-readable.** Don't replace text content with rendered images.
- [ ] **Focus rings preserved.** Hover-driven micro-interactions should not disable `:focus-visible` outlines.
- [ ] **Prefers-color-scheme respected** if your component uses background colors.

## Bundle size

- [ ] **Don't import the entire library** if a sub-import works. `motion/react` not `motion`. `gsap/ScrollTrigger`, not the entire plugin pack.
- [ ] **Tree-shake plugins.** Register only what you use.
- [ ] **Lazy-load heavy components** (`React.lazy` + Suspense) when they're below the fold or behind interaction.

## Diagnostic tools

- `r3f-perf` — `<Perf position="top-left" />` HUD inside a `<Canvas>`. Draw calls, FPS, GPU time.
- `<PerformanceMonitor>` (drei) — programmatic perf events; swap renderer settings under load.
- Chrome DevTools Performance — for OGL, canvas, and scroll-driven manual loops.
- `requestAnimationFrame` time delta logging — quick floor-test before reaching for DevTools.

## Real-world failure modes

| Symptom | Likely cause | Fix |
| --- | --- | --- |
| WebGL components silently stop rendering after a few hot-reloads | `gl.loseContext()` not called on unmount; browser exhausted ~16-context limit | Add the `WEBGL_lose_context` cleanup |
| Retina screen drops to 30fps in shader background | DPR uncapped | `<Canvas dpr={[1, 2]}>` or `Renderer({ dpr: [1, 2] })` |
| GSAP component leaks animations after route change | `useEffect` instead of `useGSAP` | Switch to `useGSAP({ scope: ref })` |
| ScrollStack stutters on heavy scroll | Per-tick DOM writes for unchanged values | Add the `> 0.1` / `> 0.001` thresholds before writing |
| Motion component bundle is ~30kb | Default Motion import | `LazyMotion` + `m.*` (4.6kb initial) |
| 3D scene burns CPU when offscreen | Default `frameloop="always"` + no IntersectionObserver | `frameloop="demand"` + `invalidate()` on input, or IO-gated init |
| Reduced-motion users get full animation | `useReducedMotion()` not wired | Add it; render static fallback or skip rAF |
