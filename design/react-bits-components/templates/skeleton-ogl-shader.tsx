// Skeleton: OGL fragment-shader background (TS-TW)
// Modeled on: src/ts-tailwind/Backgrounds/Aurora/Aurora.tsx
// Pattern: Renderer + Program + Mesh + Triangle, full-screen frag shader,
// rAF loop driving uTime, mandatory WEBGL_lose_context cleanup.
//
// Drop into:  src/ts-tailwind/<Category>/<Name>/<Name>.tsx

import { useEffect, useRef } from 'react';
import { Renderer, Program, Mesh, Color, Triangle } from 'ogl';

const VERT = `#version 300 es
in vec2 position;
void main() { gl_Position = vec4(position, 0.0, 1.0); }
`;

const FRAG = `#version 300 es
precision highp float;

uniform float uTime;
uniform vec2  uResolution;
uniform vec3  uColor;
uniform float uSpeed;

out vec4 fragColor;

void main() {
  vec2 uv = gl_FragCoord.xy / uResolution;
  float t = uTime * uSpeed;
  float wave = 0.5 + 0.5 * sin(6.2831 * uv.x + t);
  fragColor = vec4(uColor * wave, wave);
}
`;

export interface MyShaderBgProps {
  /** Hex string. */
  color?: string;
  /** Animation speed multiplier. */
  speed?: number;
  /** Devicepixelratio clamp; reduces fillrate cost on retina. */
  dpr?: number | [number, number];
  className?: string;
}

const MyShaderBg: React.FC<MyShaderBgProps> = ({
  color = '#7c3aed',
  speed = 1,
  dpr = [1, 2],
  className = '',
}) => {
  const ctn = useRef<HTMLDivElement>(null);
  // Latest props live behind a ref so the rAF loop reads current values
  // without re-running the entire effect on every prop change.
  const propsRef = useRef({ color, speed });
  propsRef.current = { color, speed };

  useEffect(() => {
    const el = ctn.current;
    if (!el) return;

    const reduceMq = window.matchMedia('(prefers-reduced-motion: reduce)');

    const renderer = new Renderer({
      alpha: true,
      premultipliedAlpha: true,
      antialias: true,
      dpr: Array.isArray(dpr) ? Math.min(window.devicePixelRatio, dpr[1]) : dpr,
    });
    const gl = renderer.gl;
    gl.clearColor(0, 0, 0, 0);
    gl.canvas.style.backgroundColor = 'transparent';

    const geometry = new Triangle(gl);
    if (geometry.attributes.uv) delete geometry.attributes.uv;

    const c = new Color(color);
    const program = new Program(gl, {
      vertex: VERT,
      fragment: FRAG,
      uniforms: {
        uTime: { value: 0 },
        uResolution: { value: [el.offsetWidth, el.offsetHeight] },
        uColor: { value: [c.r, c.g, c.b] },
        uSpeed: { value: speed },
      },
    });
    const mesh = new Mesh(gl, { geometry, program });

    const resize = () => {
      renderer.setSize(el.offsetWidth, el.offsetHeight);
      program.uniforms.uResolution.value = [el.offsetWidth, el.offsetHeight];
    };
    window.addEventListener('resize', resize);
    el.appendChild(gl.canvas);
    resize();

    let rafId = 0;
    const tick = (t: number) => {
      rafId = requestAnimationFrame(tick);
      const { color: hex, speed: s } = propsRef.current;
      const k = new Color(hex);
      program.uniforms.uColor.value = [k.r, k.g, k.b];
      program.uniforms.uSpeed.value = s;
      program.uniforms.uTime.value = t * 0.001;
      renderer.render({ scene: mesh });
    };

    if (reduceMq.matches) {
      // Render a single static frame, no rAF loop.
      renderer.render({ scene: mesh });
    } else {
      rafId = requestAnimationFrame(tick);
    }

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('resize', resize);
      if (gl.canvas.parentNode === el) el.removeChild(gl.canvas);
      // Mandatory: release the GPU context. Without this, mount/unmount
      // cycles eventually exhaust the browser's WebGL context limit (~16).
      gl.getExtension('WEBGL_lose_context')?.loseContext();
    };
    // dpr is read once on mount; color/speed live in propsRef.
  }, [dpr]);

  return <div ref={ctn} className={`w-full h-full ${className}`} aria-hidden />;
};

export default MyShaderBg;
