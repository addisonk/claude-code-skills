# Three.js / R3F — 3D Scenes (not full-screen shaders)

This reference covers real 3D scenes in React Bits: meshes, GLTF, lights, drei helpers, physics, post-processing, instancing. For full-screen procedural fragment shaders (Aurora, Silk, Plasma, Threads…) see `references/shaders.md`. For perf checklists see `references/performance.md`.

## When R3F vs OGL vs vanilla Three.js

| Primitive | Use when | Bundle | Canonical example |
| --- | --- | --- | --- |
| **OGL** | Single full-screen fragment shader. No mesh tree, no lights. | ~8kb gzip | `src/ts-tailwind/Backgrounds/Aurora/Aurora.tsx` |
| **R3F + drei** | Declarative scene graph; multiple meshes; GLTF; cameras; lights; physics; post. JSX-friendly. | ~150kb three + r3f | `src/ts-tailwind/Components/ModelViewer/ModelViewer.tsx`, `…/FluidGlass/FluidGlass.tsx`, `…/Lanyard/Lanyard.tsx` |
| **R3F shader-plane** | You want the OGL-shader aesthetic but need to compose with other R3F nodes (e.g. mesh on top, post pass). | ~150kb | `src/ts-tailwind/Backgrounds/Silk/Silk.tsx` |
| **Vanilla Three.js** | Custom render loop / tight perf control / class hierarchy / instancing patterns R3F's reconciler hides. | ~150kb | `src/ts-tailwind/Backgrounds/Ballpit/Ballpit.tsx`, `…/Hyperspeed/Hyperspeed.tsx` |

Most React Bits 3D work is R3F. Reach for vanilla Three when the reconciler cost matters or when porting an existing class-based engine.

## Canonical R3F scene shape

```tsx
import { Canvas, useFrame, useThree, invalidate } from '@react-three/fiber';

<Canvas
  dpr={[1, 2]}
  frameloop="demand"        // only render when invalidate() is called
  shadows
  camera={{ position: [0, 0, 5], fov: 50, near: 0.1, far: 100 }}
>
  <ambientLight intensity={0.4} />
  <directionalLight position={[5, 5, 5]} intensity={1} castShadow />
  <directionalLight position={[-5, 2, 5]} intensity={0.5} />
  <mesh>
    <boxGeometry args={[1, 1, 1]} />
    <meshStandardMaterial color="#7c3aed" />
  </mesh>
</Canvas>
```

Inside any child you can pull state with `useThree(s => s.viewport)` (world-space size at z=0) and animate with `useFrame((state, delta) => { /* mutate refs; never setState */ })`. With `frameloop="demand"`, call `invalidate()` to schedule a single-frame re-render.

## GLTF loading with `useGLTF`

Drei's `useGLTF` wraps the GLTFLoader in Suspense and caches by URL. Pattern from `ModelViewer.tsx:132` and `Lanyard.tsx:120`:

```tsx
import { useGLTF } from '@react-three/drei';

function Model({ url }: { url: string }) {
  const { nodes, materials, scene } = useGLTF(url);
  return <primitive object={scene} />;
  // or: <mesh geometry={nodes.card.geometry} material={materials.base} />
}

// Off-render preload (ModelViewer.tsx:407):
useEffect(() => { useGLTF.preload(url); }, [url]);
```

**Shipping `.glb` and texture assets through the registry.** React Bits ships non-code assets via `MANUAL_ASSETS` in `jsrepo.config.ts`. The Lanyard entry is the canonical example:

```ts
// jsrepo.config.ts
const MANUAL_ASSETS: Record<string, { path: string; dependencyResolution: 'manual' }[]> = {
  'Components/Lanyard': [
    { path: 'card.glb', dependencyResolution: 'manual' },
    { path: 'lanyard.png', dependencyResolution: 'manual' }
  ]
};
```

The component imports them directly (`Lanyard.tsx:19-20`):

```tsx
import cardGLB from './card.glb';
import lanyard from './lanyard.png';
```

The bundler turns the import into a URL; jsrepo copies the binary into the registry artifact. Without `MANUAL_ASSETS`, jsrepo would try (and fail) to resolve the `.glb` as a JS module.

**Cache discipline.** `useGLTF` keeps scenes in a global cache. To free a model that won't be reused, call `useGLTF.clear(url)`. In typical apps the cache stays warm; explicit clearing is rare.

## Drei helpers actually used in React Bits

Verified against the cached source — only helpers that appear in at least one component are listed.

| Helper | Used in | Purpose |
| --- | --- | --- |
| `OrbitControls` | `Components/ModelViewer/ModelViewer.tsx` | Mouse/touch camera orbit + zoom; `makeDefault` so other helpers (raycasters) target it |
| `useGLTF` | `Components/ModelViewer/ModelViewer.tsx`, `…/Lanyard/Lanyard.tsx`, `…/FluidGlass/FluidGlass.tsx` | Suspense-wrapped GLTFLoader with global cache |
| `useFBX` | `Components/ModelViewer/ModelViewer.tsx` | FBX loading (alongside `useGLTF`) |
| `Environment` | `Components/Lanyard/Lanyard.tsx`, `…/ModelViewer/ModelViewer.tsx` | IBL (image-based lighting) — preset name (`'city'`, `'sunset'`, …) or custom Lightformers |
| `Lightformer` | `Components/Lanyard/Lanyard.tsx` (4×) | Rectangular area-light children inside `<Environment>` for precise reflections |
| `MeshTransmissionMaterial` | `Components/FluidGlass/FluidGlass.tsx` | Glass / lens material (transmission, thickness, IOR, chromatic aberration) — heavier than `MeshPhysicalMaterial` |
| `useTexture` | `Components/Lanyard/Lanyard.tsx` | Suspense-wrapped TextureLoader for PNG/JPG/WEBP |
| `Html` | `Components/ModelViewer/ModelViewer.tsx` (loader) | Project DOM into 3D space; used as the Suspense fallback for loading % |
| `useProgress` | `Components/ModelViewer/ModelViewer.tsx` | Reads loading progress from the global Three.js manager |
| `ContactShadows` | `Components/ModelViewer/ModelViewer.tsx` | Cheap planar shadow under a model — better-than-nothing without a real shadow setup |
| `useFBO` | `Components/FluidGlass/FluidGlass.tsx` | Frame buffer for render-to-texture (refraction backing buffer) |
| `ScrollControls` / `Scroll` / `useScroll` | `Components/FluidGlass/FluidGlass.tsx` | Scroll-driven camera/scene; `useScroll().range(start, len)` returns 0–1 progress |
| `Image` / `Text` | `Components/FluidGlass/FluidGlass.tsx` | Drei's billboarded `Image` and SDF `Text` components |
| `Preload` | `Components/FluidGlass/FluidGlass.tsx` | Forces upload of all assets to GPU before first frame |

`Stats`, `<Perf>` (r3f-perf), and `PerformanceMonitor` are recommended diagnostics but are not imported in the cached source. Use them in development; remove before shipping.

## Rapier physics (Lanyard pattern)

`@react-three/rapier` wraps Rapier (Rust → WASM) and exposes JSX-y rigid bodies and joints. The Lanyard is the canonical example: a fixed anchor + 3 dynamic ball-collider segments + 1 cuboid card, joined by rope joints and a spherical joint.

```tsx
// Lanyard.tsx:6-14, :54, :129-135, :184-228
import { Physics, RigidBody, BallCollider, CuboidCollider,
         useRopeJoint, useSphericalJoint } from '@react-three/rapier';

<Physics gravity={[0, -40, 0]} timeStep={isMobile ? 1 / 30 : 1 / 60}>
  {/* anchor */}
  <RigidBody ref={fixed} type="fixed" />
  {/* segments */}
  <RigidBody ref={j1} type="dynamic" position={[0.5, 0, 0]}>
    <BallCollider args={[0.1]} />
  </RigidBody>
  {/* …j2, j3… */}
  {/* card */}
  <RigidBody ref={card} type={dragged ? 'kinematicPosition' : 'dynamic'}>
    <CuboidCollider args={[0.8, 1.125, 0.01]} />
    {/* card meshes (geometry/clip/clamp) */}
  </RigidBody>
</Physics>

// Joints declared via hooks (Lanyard.tsx:129-135):
useRopeJoint(fixed, j1, [[0, 0, 0], [0, 0, 0], 1]);
useRopeJoint(j1, j2,    [[0, 0, 0], [0, 0, 0], 1]);
useRopeJoint(j2, j3,    [[0, 0, 0], [0, 0, 0], 1]);
useSphericalJoint(j3, card, [[0, 0, 0], [0, 1.45, 0]]);
```

Notes:
- `timeStep` halves on mobile — physics is a CPU cost, not GPU.
- `canSleep: true` + `angularDamping`/`linearDamping` keep the cord from oscillating forever.
- For drag, switch the body type from `'dynamic'` to `'kinematicPosition'` while the pointer is held, then call `setNextKinematicTranslation(...)` from `useFrame` (`Lanyard.tsx:152-156`).

## `meshline` for thick lines

Three.js's built-in `<line>` is hardware-1px regardless of `linewidth` on most platforms — useless for visible cords/ribbons/beams. `meshline` (pmndrs) replaces it with a triangle-strip mesh that supports `lineWidth`, `dashArray`, textures, and resolution-aware aliasing.

```tsx
// Lanyard.tsx:15, :22, :230-241
import { MeshLineGeometry, MeshLineMaterial } from 'meshline';
import { extend } from '@react-three/fiber';
extend({ MeshLineGeometry, MeshLineMaterial });   // make them JSX-elements

<mesh ref={band}>
  <meshLineGeometry />
  <meshLineMaterial
    color="white"
    depthTest={false}
    resolution={isMobile ? [1000, 2000] : [1000, 1000]}
    useMap
    map={texture}
    repeat={[-4, 1]}
    lineWidth={1}
  />
</mesh>

// Per-frame: rebuild geometry from a CatmullRomCurve3 or other point set.
band.current.geometry.setPoints(curve.getPoints(isMobile ? 16 : 32));   // Lanyard.tsx:171
```

`extend({ ... })` registers the class as a JSX intrinsic so you can write `<meshLineGeometry />` (lower-cased per R3F's convention).

## Postprocessing pipeline

Two libraries with confusingly similar names:

- `postprocessing` (^6.36.0) — the underlying engine: `EffectComposer`, `RenderPass`, `EffectPass`, individual effects (`BloomEffect`, `SMAAEffect`, `ChromaticAberrationEffect`, `NoiseEffect`, `VignetteEffect`, …).
- `@react-three/postprocessing` (^3.0.4) — the JSX wrapper: `<EffectComposer>`, `<Bloom>`, `<ChromaticAberration>`, `<Noise>`, `<Vignette>`, `wrapEffect`.

**Vanilla engine (Hyperspeed pattern).** `Hyperspeed.tsx:1` imports `BloomEffect, EffectComposer, EffectPass, RenderPass, SMAAEffect, SMAAPreset` from `postprocessing` and composes them imperatively (`Hyperspeed.tsx:1040-1067`):

```ts
this.composer = new EffectComposer(this.renderer);
this.renderPass = new RenderPass(this.scene, this.camera);
this.bloomPass = new EffectPass(this.camera,
  new BloomEffect({ luminanceThreshold: 0.2, luminanceSmoothing: 0, resolutionScale: 1 }));
const smaaPass = new EffectPass(this.camera, new SMAAEffect({ preset: SMAAPreset.MEDIUM }));
this.renderPass.renderToScreen = false;
this.bloomPass.renderToScreen = false;
smaaPass.renderToScreen = true;
this.composer.addPass(this.renderPass);
this.composer.addPass(this.bloomPass);
this.composer.addPass(smaaPass);
```

**JSX wrapper (Dither pattern).** `Backgrounds/Dither/Dither.tsx:4` imports `EffectComposer, wrapEffect` from `@react-three/postprocessing`. Inside `<Canvas>`:

```tsx
<EffectComposer>
  <Bloom intensity={0.6} luminanceThreshold={0.2} luminanceSmoothing={0} />
  <ChromaticAberration offset={[0.0008, 0.0008]} />
  <Noise opacity={0.03} />
  <Vignette eskil={false} offset={0.1} darkness={0.6} />
</EffectComposer>
```

Notes:
- **Order matters.** Effects run top-to-bottom. Bloom before chromatic-aberration looks different from after. Anti-aliasing usually goes last.
- **One extra render pass.** Postprocessing forces an off-screen render before drawing to the canvas. Budget for it.
- **Transparent meshes interact badly with post.** The composer renders the entire scene to a buffer first; transparent surfaces lose their depth-sort relative to bloom thresholds. Workarounds: render transparent meshes with `renderOrder` and `depthWrite={false}`, or split the scene into two composer chains.
- **`wrapEffect`** lets you turn any vanilla `Effect` subclass into a JSX-mountable component (Dither does this for a custom retinal-cell shader effect).

## Instancing for ≥100 repeats

When you want many copies of the same geometry — particles, balls, leaves, stars — use `THREE.InstancedMesh` (one draw call instead of N).

`Backgrounds/Ballpit/Ballpit.tsx:9, :681` imports `InstancedMesh` from three and defines `class Z extends InstancedMesh` for the ball cloud. Each ball updates its own transform via `setMatrixAt(i, matrix)` per frame; one draw call paints all of them.

In R3F, drei provides `<Instances>` and `<Instance>` for the same pattern declaratively:

```tsx
import { Instances, Instance } from '@react-three/drei';

<Instances limit={1000}>
  <sphereGeometry args={[0.1, 16, 16]} />
  <meshStandardMaterial />
  {balls.map((b, i) => (
    <Instance key={i} position={b.position} color={b.color} />
  ))}
</Instances>
```

`<Instances>` is not used in the cached React Bits source (Ballpit goes vanilla for tight class-hierarchy control). Use it in new R3F components when ≥100 repeats are involved — the perf delta is the difference between 60fps and 8fps.

## Camera + lighting cookbook

**Perspective camera defaults** (matches `ModelViewer.tsx:473`, `Lanyard.tsx:36`, `FluidGlass.tsx:48`):

| Use case | FOV | Near | Far | Position |
| --- | --- | --- | --- | --- |
| Product / model viewer | `50` | `0.01` | `100` | `[0, 0, 5]` (auto-fit on load if `autoFrame`) |
| Wide hero / dramatic lens | `15` (FluidGlass) – `20` (Lanyard) | `0.1` | `100` | further back, e.g. `[0, 0, 20]` |
| Game-y / wide FOV | `75–90` | `0.1` | `1000` | scene-dependent |

**3-point lighting baseline** (matches `ModelViewer.tsx:478-481`):

```tsx
<ambientLight intensity={0.3} />                                   {/* fill */}
<directionalLight position={[5, 5, 5]} intensity={1} castShadow /> {/* key */}
<directionalLight position={[-5, 2, 5]} intensity={0.5} />         {/* fill */}
<directionalLight position={[0, 4, -5]} intensity={0.8} />         {/* rim/back */}
```

**Environment IBL.** `<Environment preset="city" />` from drei loads an HDR cubemap and uses it for both reflections (PMREM) and ambient lighting. Presets: `'city' | 'sunset' | 'night' | 'dawn' | 'studio' | 'apartment' | 'forest' | 'park'`. ModelViewer ships `'forest'` as default. Lanyard composes a custom Environment from 4 `<Lightformer>` rectangles for precise card highlights.

**Tone mapping + color space** (Ballpit pattern, `ModelViewer.tsx:470-471`):

```tsx
gl.toneMapping = THREE.ACESFilmicToneMapping;
gl.outputColorSpace = THREE.SRGBColorSpace;
```

Pair these with PMREM environment maps for filmic, predictable color across browsers.

## Performance must-haves for 3D scenes

Cross-reference: `references/performance.md` has the full checklist. Short summary:

- **`frameloop="demand"` + `invalidate()`** for static-when-idle scenes (ModelViewer uses this; Silk does not).
- **Clamp DPR.** `<Canvas dpr={[1, 2]}>` — retina at 4× fillrate is the silent killer.
- **`useGLTF.preload(url)`** off the render path so first paint is fast.
- **Reuse geometries / materials.** Don't allocate per-render.
- **Dispose on unmount.** `<Canvas>` handles its own renderer; for raw `THREE.*` objects you instantiated, `scene.traverse(o => { o.geometry?.dispose?.(); o.material?.dispose?.(); }); renderer.dispose(); renderer.forceContextLoss();`
- **`r3f-perf` `<Perf />`** in dev for draw-call / FPS / GPU-time HUD. Remove before shipping.
- **IntersectionObserver gate.** Don't init the renderer until the host is on-screen with nonzero size.
- **`InstancedMesh` for ≥100 repeats** (Ballpit pattern).
- **ACES + sRGB + PMREM** for predictable polished look (Ballpit, ModelViewer).

## maath math helpers

`maath` (^0.10.8, pmndrs) — small math grab-bag: random distributions (`maath/random` — `inSphere`, `inBox`, `onSphere` for particle init), eased damping (`maath/easing` — `damp`, `damp3`, `damp4`), buffer math, geometry helpers. Used in `Components/FluidGlass/FluidGlass.tsx:16` for `easing.damp3(ref.current.position, [destX, destY, 15], 0.15, delta)` — a smooth pointer-following motion. Repo: https://github.com/pmndrs/maath.

For new particle components needing unit-sphere distributions, prefer `maath/random.inSphere(buffer, { radius: 1 })` over hand-rolled rejection sampling.

## Common Three.js / R3F mistakes

| Mistake | Reality |
| --- | --- |
| Treating shader-plane and 3D scene as the same primitive | They are different patterns — shader-plane is a fragment-shader-on-a-fullscreen-mesh (Silk), 3D scene has lights / GLTF / cameras / interaction (ModelViewer, Lanyard, FluidGlass). Pick the right template. |
| Loading the same GLTF without `useGLTF.preload(url)` | Causes a jarring Suspense flash. Preload off the render path. |
| Forgetting `extend({ MeshLineGeometry, MeshLineMaterial })` | JSX intrinsics are unknown until extended; `<meshLineGeometry />` errors silently or types-error. |
| Using `<line>` and getting hairline width | Most platforms cap GL line width at 1px regardless of `linewidth`. Use `meshline` for any visible cord/beam/ribbon. |
| `frameloop="always"` for static scenes | Burns CPU/GPU for no reason. Use `frameloop="demand"` + `invalidate()` on user input and useFrame loops that actually need it. |
| Driving R3F state from React `useState` per frame | React reconciliation per frame kills perf. Mutate refs in `useFrame`; never `setState` from a per-frame callback. |
| Postprocessing applied before transparent meshes resolve | Bloom thresholds + transparency depth-sort interact badly. Use `renderOrder` + `depthWrite={false}` on transparent meshes, or split composer chains. |
| Not clamping DPR | `<Canvas>` defaults to `window.devicePixelRatio` — retina displays render 4× the fillrate. Always `dpr={[1, 2]}`. |
| Mixing Rapier joints with manual `setNextKinematicTranslation` while the body is `'dynamic'` | Kinematic translation only applies to `'kinematicPosition'` bodies. Lanyard switches the card's type when the user grabs it (`Lanyard.tsx:198`). |
| Forgetting to dispose raw three.js objects | `<Canvas>` disposes its own renderer; objects you `new`-up yourself need explicit `geometry.dispose()` / `material.dispose()` / `texture.dispose()` in cleanup. |
| Importing `MeshTransmissionMaterial` for everything glass-y | Heavy. For matte-glass, `meshPhysicalMaterial` with `transmission`, `roughness`, `thickness` is often enough. Reserve `MeshTransmissionMaterial` for true lens/refraction (FluidGlass). |
| Treating `<Environment preset>` as free | Loads ~1MB HDR cubemap on first use. Cache survives across components, but the first paint pays for it. |

See also: `references/shaders.md` (full-screen fragment shaders, OGL boilerplate, GLSL idioms), `references/performance.md` (full perf + a11y checklist), `references/dependencies.md` (versions and per-component citations for every 3D dep).
