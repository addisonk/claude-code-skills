# Techniques — Distilled Patterns

Pair every pattern with the canonical example in the cached repo. All paths are repo-relative — drop them into `<your-react-bits-checkout>/`.

---

## Pattern 1 — 2D Motion-driven (BlurText / RotatingText shape)

**When:** DOM-based mount/unmount, hover, in-view animations. No WebGL.

**Skeleton:**

```tsx
import { motion } from 'motion/react';
import { useEffect, useRef, useState } from 'react';

const MyComponent: React.FC<Props> = ({ text = '', delay = 50, duration = 0.6, className = '' }) => {
  const [inView, setInView] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    if (!ref.current) return;
    const obs = new IntersectionObserver(
      ([e]) => e.isIntersecting && (setInView(true), obs.disconnect()),
      { threshold: 0.1 }
    );
    obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  return (
    <span ref={ref} className={`inline-block ${className}`}>
      {text.split('').map((ch, i) => (
        <motion.span
          key={i}
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration, delay: (i * delay) / 1000, ease: [0.16, 1, 0.3, 1] }}
          style={{ display: 'inline-block', willChange: 'transform, opacity' }}
        >
          {ch === ' ' ? ' ' : ch}
        </motion.span>
      ))}
    </span>
  );
};
```

**Canonical examples:** `src/ts-tailwind/TextAnimations/BlurText/BlurText.tsx`, `…/RotatingText/RotatingText.tsx` (adds `AnimatePresence mode="wait"` + imperative ref via `forwardRef` + `useImperativeHandle`), `…/Shuffle/Shuffle.tsx`.

**Gotchas:** stagger via `delay: (i * delay) / 1000`. `keyframes` arrays let Motion run multi-step tweens (BlurText does three-step blur→half→full without nesting timelines). Always preserve whitespace (` ` → ` `) so split letters keep word boundaries.

---

## Pattern 2 — GSAP scroll-pinned timeline (SplitText / ScrollReveal / AnimatedContent shape)

**When:** Scroll-tied progress, pinning, scrub timelines, complex multi-property easing.

**Skeleton:**

```tsx
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { useRef } from 'react';

gsap.registerPlugin(ScrollTrigger, useGSAP);

const MyScroll: React.FC<Props> = ({ children, ease = 'power3.out', threshold = 0.1 }) => {
  const ref = useRef<HTMLDivElement>(null);
  useGSAP(() => {
    if (!ref.current) return;
    const startPct = (1 - threshold) * 100;
    gsap.fromTo(
      ref.current,
      { opacity: 0, y: 50, willChange: 'transform, opacity' },
      {
        opacity: 1, y: 0, duration: 1, ease, force3D: true,
        scrollTrigger: { trigger: ref.current, start: `top ${startPct}%`, once: true, fastScrollEnd: true },
      }
    );
    return () => {
      ScrollTrigger.getAll().forEach(st => { if (st.trigger === ref.current) st.kill(); });
    };
  }, { dependencies: [ease, threshold], scope: ref });
  return <div ref={ref}>{children}</div>;
};
```

**Canonical examples:** `src/ts-tailwind/TextAnimations/SplitText/SplitText.tsx` (adds `gsap/SplitText`, font-loading wait, marginMatch parsing for rootMargin-style strings), `…/ScrollReveal/ScrollReveal.tsx` (per-word stagger with scrub), `src/ts-tailwind/Animations/AnimatedContent/AnimatedContent.tsx` (general wrapper with optional disappear-after).

**Defaults that match React Bits taste:** `ease: 'power3.out'`, `start: 'top 80%'` or `'top bottom-=20%'`, `scrub: true` for scroll-tied tweens, `once: true` for trigger-once entrances, `force3D: true` and `willChange: 'transform, opacity'` for GPU compositing.

---

## Pattern 3 — OGL fragment-shader background (Aurora / Iridescence shape)

**When:** Full-screen procedural background. No mesh hierarchy, just a fragment shader on a single triangle.

**Skeleton:**

```tsx
import { Renderer, Program, Mesh, Triangle, Color } from 'ogl';
import { useEffect, useRef } from 'react';

const VERT = `#version 300 es
in vec2 position;
void main() { gl_Position = vec4(position, 0.0, 1.0); }
`;
const FRAG = `#version 300 es
precision highp float;
uniform float uTime; uniform vec2 uResolution; uniform vec3 uColor;
out vec4 fragColor;
void main() {
  vec2 uv = gl_FragCoord.xy / uResolution;
  fragColor = vec4(uColor * (0.5 + 0.5 * sin(uTime + uv.x * 6.28)), 1.0);
}
`;

export default function MyShaderBg({ color = '#7c3aed', speed = 1 }: Props) {
  const ctn = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ctn.current; if (!el) return;
    const renderer = new Renderer({ alpha: true, antialias: true });
    const gl = renderer.gl; gl.clearColor(0, 0, 0, 0);
    const geometry = new Triangle(gl);
    if (geometry.attributes.uv) delete geometry.attributes.uv;
    const c = new Color(color);
    const program = new Program(gl, {
      vertex: VERT, fragment: FRAG,
      uniforms: { uTime: { value: 0 }, uResolution: { value: [0, 0] }, uColor: { value: [c.r, c.g, c.b] } },
    });
    const mesh = new Mesh(gl, { geometry, program });
    el.appendChild(gl.canvas);
    const resize = () => {
      renderer.setSize(el.offsetWidth, el.offsetHeight);
      program.uniforms.uResolution.value = [el.offsetWidth, el.offsetHeight];
    };
    window.addEventListener('resize', resize); resize();
    let id = 0;
    const tick = (t: number) => { id = requestAnimationFrame(tick); program.uniforms.uTime.value = t * 0.001 * speed; renderer.render({ scene: mesh }); };
    id = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(id);
      window.removeEventListener('resize', resize);
      if (gl.canvas.parentNode === el) el.removeChild(gl.canvas);
      gl.getExtension('WEBGL_lose_context')?.loseContext();
    };
  }, [color, speed]);
  return <div ref={ctn} className="w-full h-full" aria-hidden />;
}
```

**Canonical examples:** `src/ts-tailwind/Backgrounds/Aurora/Aurora.tsx` (color stops + simplex noise + COLOR_RAMP macro), `…/Iridescence/Iridescence.tsx` (mouse-driven UVs), `…/Particles/Particles.tsx` (POINTS instead of Triangle).

**Gotchas:**
- A full-screen `Triangle` (3 verts) is the canonical fragment-shader stage — 1 fewer vertex than a quad, no diagonal seam.
- Hex normalization is reimplemented per component (`Color(hex)` from OGL, then `[c.r, c.g, c.b]`). No shared util.
- Disposal is non-negotiable: `gl.getExtension('WEBGL_lose_context')?.loseContext();` releases the GPU context. Without it, mount/unmount cycles eventually exhaust the browser's WebGL context limit (~16) and silently break.
- Resize listens on `window`, not `ResizeObserver` — works because shader backgrounds fill `100% × 100%` of their parent.

---

## Pattern 4 — R3F shader plane (Silk shape)

**When:** You want JSX ergonomics + viewport math + `useFrame`, and don't mind the bigger Three.js runtime.

**Skeleton:**

```tsx
import { Canvas, useFrame, useThree, RootState } from '@react-three/fiber';
import { Color, Mesh, ShaderMaterial } from 'three';
import { useMemo, useRef, useLayoutEffect, forwardRef } from 'react';

const Plane = forwardRef<Mesh, { uniforms: any }>(function Plane({ uniforms }, ref) {
  const { viewport } = useThree();
  useLayoutEffect(() => {
    const m = ref as React.MutableRefObject<Mesh | null>;
    if (m.current) m.current.scale.set(viewport.width, viewport.height, 1);
  }, [viewport]);
  useFrame((_: RootState, delta: number) => {
    const m = ref as React.MutableRefObject<Mesh | null>;
    if (m.current) (m.current.material as ShaderMaterial).uniforms.uTime.value += delta;
  });
  return (
    <mesh ref={ref}>
      <planeGeometry args={[1, 1, 1, 1]} />
      <shaderMaterial uniforms={uniforms} vertexShader={vert} fragmentShader={frag} />
    </mesh>
  );
});

export default function MyR3FBg({ color = '#7B7481', speed = 1 }) {
  const meshRef = useRef<Mesh>(null);
  const uniforms = useMemo(() => ({
    uTime: { value: 0 }, uColor: { value: new Color(color) }, uSpeed: { value: speed },
  }), [color, speed]);
  return (
    <Canvas dpr={[1, 2]} frameloop="always">
      <Plane ref={meshRef} uniforms={uniforms} />
    </Canvas>
  );
}
```

**Canonical example:** `src/ts-tailwind/Backgrounds/Silk/Silk.tsx`.

**Gotchas:** `useMemo` the uniforms object so React doesn't recreate it every render; per-frame mutation in `useFrame`. Use `useThree(state => state.viewport)` for world-space sizing — `mesh.scale.set(viewport.width, viewport.height, 1)` fills the canvas with a unit-sized plane. **Add `frameloop="demand"` + `invalidate()`** for static-when-idle scenes (Silk currently uses `"always"`).

---

## Pattern 5 — Custom Three.js with class hierarchy (Ballpit / Hyperspeed shape)

**When:** You need a class hierarchy, custom physics, ResizeObserver/IntersectionObserver gating, or tight render-loop control that R3F's reconciler hides.

**Skeleton:**

```tsx
import { useEffect, useRef } from 'react';
import * as THREE from 'three';

class MyEngine {
  renderer: THREE.WebGLRenderer; scene: THREE.Scene; camera: THREE.PerspectiveCamera; rafId = 0;
  constructor(container: HTMLElement) {
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    container.appendChild(this.renderer.domElement);
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
  }
  start() { const tick = () => { this.rafId = requestAnimationFrame(tick); this.renderer.render(this.scene, this.camera); }; tick(); }
  resize(w: number, h: number) { this.renderer.setSize(w, h); this.camera.aspect = w / h; this.camera.updateProjectionMatrix(); }
  dispose() {
    cancelAnimationFrame(this.rafId);
    this.scene.traverse((o: any) => { o.geometry?.dispose?.(); o.material?.dispose?.(); });
    this.renderer.dispose(); this.renderer.forceContextLoss();
  }
}

export default function MyComponent() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!ref.current) return;
    const engine = new MyEngine(ref.current);
    engine.start();
    const ro = new ResizeObserver(([e]) => engine.resize(e.contentRect.width, e.contentRect.height));
    ro.observe(ref.current);
    return () => { ro.disconnect(); engine.dispose(); };
  }, []);
  return <div ref={ref} className="w-full h-full" />;
}
```

**Canonical examples:**
- `src/ts-tailwind/Backgrounds/Ballpit/Ballpit.tsx` (875 lines; `class X { #config; #postprocessing; … }` with `InstancedMesh` + `RoomEnvironment` + `PMREMGenerator` + ACES tone mapping + sRGB color space).
- `src/ts-tailwind/Backgrounds/Hyperspeed/Hyperspeed.tsx` (1315 lines, custom postprocessing pipeline; ships `HyperSpeedPresets.ts` sibling).
- ASCIIText (canvas → `THREE.CanvasTexture` → `ShaderMaterial` → DOM `<pre>` overlay).

**Gotchas:** ACES filmic tone mapping + sRGB color space + PMREM environment map are common pairings (Ballpit:18-21). IntersectionObserver gating is mandatory — don't burn cycles offscreen.

---

## Pattern 6 — Pointer-reactive (Magnet / TiltedCard shape)

**When:** Cursor proximity / tilt / glare / magnet-style attraction.

**Skeleton (vanilla, no library):**

```tsx
import { useEffect, useRef, useState } from 'react';

const Magnet: React.FC<Props> = ({
  children, padding = 100, strength = 2,
  activeT = 'transform 0.3s ease-out',
  inactiveT = 'transform 0.5s ease-in-out',
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(false);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (!ref.current) return;
      const r = ref.current.getBoundingClientRect();
      const cx = r.left + r.width / 2, cy = r.top + r.height / 2;
      const dx = Math.abs(cx - e.clientX), dy = Math.abs(cy - e.clientY);
      if (dx < r.width / 2 + padding && dy < r.height / 2 + padding) {
        setActive(true);
        setPos({ x: (e.clientX - cx) / strength, y: (e.clientY - cy) / strength });
      } else { setActive(false); setPos({ x: 0, y: 0 }); }
    };
    window.addEventListener('mousemove', onMove);
    return () => window.removeEventListener('mousemove', onMove);
  }, [padding, strength]);
  return (
    <div ref={ref} style={{ position: 'relative', display: 'inline-block' }}>
      <div style={{ transform: `translate3d(${pos.x}px, ${pos.y}px, 0)`, transition: active ? activeT : inactiveT, willChange: 'transform' }}>
        {children}
      </div>
    </div>
  );
};
```

**Canonical examples:** `src/ts-tailwind/Animations/Magnet/Magnet.tsx`, `src/ts-tailwind/Components/TiltedCard/TiltedCard.tsx` (Motion `useSpring` + `useMotionValue` for smoother tilt).

**Idiom worth copying:** asymmetric transitions (`activeT` fast, `inactiveT` slow) mirrors Disney's slow-in/slow-out for return-to-rest.

---

## Pattern 7 — Scroll-stack pin (ScrollStack shape)

**When:** Card-stack pinned-on-scroll layouts where stacking, scaling, and blurring depend on relative scroll progress per card.

**Key ideas (from `src/ts-tailwind/Components/ScrollStack/ScrollStack.tsx`):**

- Use Lenis for smooth scroll, attach a `scroll` listener that schedules a `requestAnimationFrame` update.
- Compute each card's scale/translate/blur from its own per-index trigger range:
  ```ts
  const triggerStart = cardTop - stackPositionPx - itemStackDistance * i;
  const triggerEnd = cardTop - scaleEndPositionPx;
  const scaleProgress = (scrollTop - triggerStart) / (triggerEnd - triggerStart);
  ```
- Cache last-applied transforms; skip the DOM write if no property changed beyond a threshold (`> 0.1` px / `> 0.001` scale).
- Add a sentinel `<div className="scroll-stack-end" />` to mark the pin release point.
- Props: `itemDistance`, `itemScale`, `itemStackDistance`, `stackPosition`, `scaleEndPosition`, `baseScale`, `scaleDuration`, `rotationAmount`, `blurAmount`, `useWindowScroll`, `onStackComplete`.

---

## Pattern 8 — matter-js 2D physics (FallingText shape)

**When:** Falling/bouncing/colliding 2D entities.

**Skeleton:**

```tsx
import { useEffect, useRef } from 'react';
import Matter from 'matter-js';

export default function FallingText() {
  const ctn = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ctn.current; if (!el) return;
    const engine = Matter.Engine.create();
    const render = Matter.Render.create({ element: el, engine, options: { width: el.clientWidth, height: el.clientHeight, wireframes: false, background: 'transparent' } });
    /* …add bodies… */
    Matter.Runner.run(engine);
    Matter.Render.run(render);
    return () => {
      Matter.Render.stop(render);
      Matter.Engine.clear(engine);
      render.canvas.remove();
    };
  }, []);
  return <div ref={ctn} className="w-full h-full" />;
}
```

**Canonical examples:** `src/ts-tailwind/TextAnimations/FallingText/FallingText.tsx`, `src/ts-tailwind/Animations/StickerPeel/StickerPeel.tsx`.

---

## Pattern 9 — OGL particle system (Particles shape)

**When:** Many-points particles — stars, snow, sparks, dust.

**Key ideas (from `src/ts-tailwind/Backgrounds/Particles/Particles.tsx`):**

- OGL `Geometry` with `mode: gl.POINTS` + per-point `random` attribute + `gl_PointSize` set in vertex shader.
- Position randomization uses rejection sampling for unit-sphere distribution (or use `maath/random`'s `inSphere`).
- Mouse repulsion implemented as a position offset on the entire mesh (`particles.position.x = -mouseRef.current.x * particleHoverFactor`), not per-particle force — far cheaper than running a force solver per frame.
- For 3D physics-driven particles (Antigravity, MetaBalls), Three.js `InstancedMesh` is used instead of point sprites.

---

## Pattern 10 — Reduced-motion gate (recommended; underused in shipped React Bits)

```tsx
import { useReducedMotion } from 'motion/react';

const reduce = useReducedMotion();
return reduce ? <StaticFallback /> : <AnimatedVersion />;
```

For shader/canvas components: render a single static frame and skip the rAF loop when `prefers-reduced-motion: reduce`.

```tsx
useEffect(() => {
  const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
  if (mq.matches) { renderer.render({ scene: mesh }); return; }
  /* …rAF loop… */
}, []);
```

**Pattern is recommended; the shipped React Bits source frequently misses it.** Close the gap on new components.
