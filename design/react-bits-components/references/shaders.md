# Shaders — OGL Boilerplate and GLSL Idioms

For 3D scenes with meshes / lights / GLTF / physics / postprocessing see `references/threejs.md`. This file covers full-screen fragment-shader backgrounds (OGL or R3F-shader-plane).

The OGL path is the canonical React Bits shader pattern (Aurora, Iridescence, Liquid Chrome, Plasma, Threads, Particles, …). OGL is ~8kb gzipped vs Three.js ~150kb — the right choice for a single full-screen fragment shader.

## OGL setup boilerplate

```ts
import { Renderer, Program, Mesh, Triangle, Color } from 'ogl';

// 1. Renderer
const renderer = new Renderer({
  alpha: true,           // transparent canvas
  antialias: true,
  premultipliedAlpha: true,
  dpr: [1, 2],           // optional DPR clamp
});
const gl = renderer.gl;
gl.clearColor(0, 0, 0, 0);

// 2. Geometry — full-screen Triangle (3 verts, 1 fewer than a quad, no diagonal seam)
const geometry = new Triangle(gl);
if (geometry.attributes.uv) delete geometry.attributes.uv; // shader uses gl_FragCoord, no uv needed

// 3. Program
const program = new Program(gl, {
  vertex: VERT_300_ES,
  fragment: FRAG_300_ES,
  uniforms: {
    uTime: { value: 0 },
    uResolution: { value: [0, 0] },
    uMouse: { value: [0.5, 0.5] },
    uColor: { value: [0.5, 0.2, 0.9] },
  },
});

// 4. Mesh + canvas mount
const mesh = new Mesh(gl, { geometry, program });
container.appendChild(gl.canvas);

// 5. rAF loop (uTime)
let id = 0;
const tick = (t: number) => {
  id = requestAnimationFrame(tick);
  program.uniforms.uTime.value = t * 0.001; // seconds
  renderer.render({ scene: mesh });
};
id = requestAnimationFrame(tick);

// 6. Resize listener
const resize = () => {
  renderer.setSize(container.offsetWidth, container.offsetHeight);
  program.uniforms.uResolution.value = [container.offsetWidth, container.offsetHeight];
};
window.addEventListener('resize', resize); resize();

// 7. Cleanup (mandatory)
return () => {
  cancelAnimationFrame(id);
  window.removeEventListener('resize', resize);
  if (gl.canvas.parentNode === container) container.removeChild(gl.canvas);
  gl.getExtension('WEBGL_lose_context')?.loseContext();
};
```

## Vertex shader — full-screen pass-through

```glsl
#version 300 es
in vec2 position;
void main() { gl_Position = vec4(position, 0.0, 1.0); }
```

Aurora and most shader backgrounds use this exact vertex shader. The fragment shader does all the work, sampling `gl_FragCoord.xy / uResolution`.

## Fragment shader skeleton

```glsl
#version 300 es
precision highp float;

uniform float uTime;
uniform vec2 uResolution;
uniform vec3 uColor;
out vec4 fragColor;

void main() {
  vec2 uv = gl_FragCoord.xy / uResolution;
  // …compute color from uv + uTime…
  fragColor = vec4(uColor, 1.0);
}
```

## GLSL idioms used in React Bits

### `smoothstep(edge0, edge1, x)`

Smooth Hermite interpolation. Used everywhere for soft edges (Aurora's `auroraAlpha = smoothstep(midPoint - uBlend * 0.5, midPoint + uBlend * 0.5, intensity);` at `Aurora.tsx:102`).

### Color-stop interpolation (Aurora COLOR_RAMP macro)

```glsl
struct ColorStop { vec3 color; float position; };

#define COLOR_RAMP(colors, factor, finalColor) {                  \
  int index = 0;                                                  \
  for (int i = 0; i < 2; i++) {                                   \
    ColorStop currentColor = colors[i];                           \
    bool isInBetween = currentColor.position <= factor;           \
    index = int(mix(float(index), float(i), float(isInBetween))); \
  }                                                               \
  ColorStop currentColor = colors[index];                         \
  ColorStop nextColor = colors[index + 1];                        \
  float range = nextColor.position - currentColor.position;       \
  float lerpFactor = (factor - currentColor.position) / range;    \
  finalColor = mix(currentColor.color, nextColor.color, lerpFactor); \
}
```

(`Aurora.tsx:71-83`.) The macro avoids the GLSL ES 3.00 ban on dynamic indexing into a const array.

### 2D simplex noise (Aurora's `snoise`)

The canonical implementation is Stefan Gustavson's. Aurora ships a 2D version (`Aurora.tsx:22-64`). Use it for organic flow, terrain heights, cloud shapes. Sample at `vec2(uv.x * scale + uTime * speed, uTime * other_speed)` to animate.

### Noise idioms (FBM, value, perlin)

For typically used patterns:

- **FBM** (fractional Brownian motion): sum noise octaves with halving amplitude and doubling frequency. Reference: thebookofshaders.com/13.
- **Value noise**: cheaper than simplex, less smooth.
- **Worley / cellular**: for crystalline / organic-cell patterns.

Inline the noise function — there is no shared utils module in React Bits.

### Polar coordinates

```glsl
vec2 polar = vec2(length(uv - 0.5), atan(uv.y - 0.5, uv.x - 0.5));
```

Used for radial / spiral / orb shaders (Orb, Iridescence). Reference: thebookofshaders.com/09.

### Mouse-driven UVs

```glsl
uniform vec2 uMouse;
vec2 uv = (gl_FragCoord.xy - 0.5 * uResolution) / min(uResolution.x, uResolution.y);
uv += uMouse * 0.1;
```

Iridescence does mouse interaction via cosine/sine on UVs. Pattern: never pay for an event listener you don't use — Iridescence has `mouseReact` boolean prop, no handler attached when false.

### Hex → normalized RGB

Each shader component reimplements this inline. There is no shared util.

```ts
// OGL provides Color
import { Color } from 'ogl';
const c = new Color('#5227FF');
program.uniforms.uColor.value = [c.r, c.g, c.b];

// Or hand-rolled (Silk pattern)
const hexToNormalizedRGB = (hex: string): [number, number, number] => {
  const clean = hex.replace('#', '');
  return [
    parseInt(clean.slice(0, 2), 16) / 255,
    parseInt(clean.slice(2, 4), 16) / 255,
    parseInt(clean.slice(4, 6), 16) / 255,
  ];
};
```

## DPR clamping

| Surface | Pattern |
| --- | --- |
| OGL | `new Renderer({ dpr: Math.min(window.devicePixelRatio, 2) })` or pass `[1, 2]` array |
| R3F | `<Canvas dpr={[1, 2]}>` |
| ShapeBlur | thermal management — explicit DPR cap to avoid throttling on retina |

Without this, retina screens render at 4× fillrate (2× width × 2× height) — the silent killer of shader perf.

## Pause-when-offscreen

```ts
const io = new IntersectionObserver(([entry]) => { isVisible = entry.isIntersecting; });
io.observe(container);

const tick = (t: number) => {
  id = requestAnimationFrame(tick);
  if (!isVisible) return; // skip render but keep rAF alive (cheap) — or cancel rAF entirely
  program.uniforms.uTime.value = t * 0.001;
  renderer.render({ scene: mesh });
};
```

ASCIIText and Ballpit follow this pattern (Ballpit's `#intersectionObserver`).

## Reduced-motion gate (recommended; underused in source)

```ts
const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
if (mq.matches) {
  // Render a single static frame, no rAF loop
  program.uniforms.uTime.value = 0;
  renderer.render({ scene: mesh });
  return;
}
// …else start the rAF loop normally…
```

## Authoritative GLSL references

| Source | Best for |
| --- | --- |
| https://thebookofshaders.com | Patricio González Vivo's GLSL primer; canonical free reference for noise / FBM / smoothstep / polar / SDF |
| https://iquilezles.org/articles/ | Inigo Quilez's distance functions, noise, easing — the reference for ray-marching, SDFs, and procedural noise |
| https://www.shadertoy.com | The fragment-shader gallery Haz draws inspiration from (per Motion Magazine interview) |
| https://oframe.github.io/ogl/examples/ | OGL's own examples — useful when adapting Three.js samples |
| https://threejs-journey.com | Bruno Simon's paid course — canonical for Three.js, R3F, shaders, post-processing, performance, Blender |
| https://easings.net + http://robertpenner.com/easing/ | The numerical basis for most easing curves used in Motion and GSAP |

## Shader performance gotchas

- **Texture lookups are expensive.** Inline procedural noise beats sampling a noise texture for cheap shaders.
- **`pow()` is slow.** Use `x*x*x*x` for `pow(x, 4)`.
- **Branching is slow on older GPUs.** Use `mix()` and `step()` instead of `if`.
- **`gl.POINTS` is fine for small particle counts.** Beyond ~10k, switch to `InstancedMesh` (Three.js) for true instancing.
- **`#version 300 es` requires WebGL2.** OGL detects and falls back automatically; React Bits' shaders are written for WebGL2 throughout.
