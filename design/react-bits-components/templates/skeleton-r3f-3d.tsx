// Skeleton: R3F shader-plane background (TS-TW)
// Modeled on: src/ts-tailwind/Backgrounds/Silk/Silk.tsx
// Pattern: <Canvas dpr={[1,2]}> + forwardRef'd <mesh> with <shaderMaterial>;
// uniforms memoized; uTime mutated in useFrame.
//
// Drop into:  src/ts-tailwind/<Category>/<Name>/<Name>.tsx
// Note: Silk currently uses frameloop="always". For static-when-idle scenes, prefer
// frameloop="demand" + invalidate() — see references/performance.md.

/* eslint-disable react/no-unknown-property */
import { Canvas, useFrame, useThree, RootState } from '@react-three/fiber';
import { Color, Mesh, ShaderMaterial, IUniform } from 'three';
import { useEffect, useMemo, useRef, useLayoutEffect, forwardRef, useState } from 'react';

type NormalizedRGB = [number, number, number];

const hexToNormalizedRGB = (hex: string): NormalizedRGB => {
  const c = hex.replace('#', '');
  return [
    parseInt(c.slice(0, 2), 16) / 255,
    parseInt(c.slice(2, 4), 16) / 255,
    parseInt(c.slice(4, 6), 16) / 255,
  ];
};

const vertexShader = /* glsl */ `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

const fragmentShader = /* glsl */ `
varying vec2 vUv;
uniform float uTime;
uniform vec3  uColor;
uniform float uSpeed;

void main() {
  vec2 uv = vUv;
  float t = uTime * uSpeed;
  float pattern = 0.5 + 0.5 * sin(6.2831 * (uv.x + uv.y) + t);
  gl_FragColor = vec4(uColor * pattern, 1.0);
}
`;

interface MyUniforms {
  uTime: { value: number };
  uColor: { value: Color };
  uSpeed: { value: number };
  [k: string]: IUniform;
}

const Plane = forwardRef<Mesh, { uniforms: MyUniforms; reduce: boolean }>(function Plane(
  { uniforms, reduce },
  ref,
) {
  const { viewport } = useThree();

  useLayoutEffect(() => {
    const m = ref as React.MutableRefObject<Mesh | null>;
    if (m.current) m.current.scale.set(viewport.width, viewport.height, 1);
  }, [ref, viewport]);

  useFrame((_state: RootState, delta: number) => {
    if (reduce) return; // Skip per-frame mutation; render single static frame
    const m = ref as React.MutableRefObject<Mesh | null>;
    if (m.current) {
      const mat = m.current.material as ShaderMaterial & { uniforms: MyUniforms };
      mat.uniforms.uTime.value += delta;
    }
  });

  return (
    <mesh ref={ref}>
      <planeGeometry args={[1, 1, 1, 1]} />
      <shaderMaterial uniforms={uniforms} vertexShader={vertexShader} fragmentShader={fragmentShader} />
    </mesh>
  );
});
Plane.displayName = 'Plane';

export interface MyR3FBgProps {
  color?: string;
  speed?: number;
  className?: string;
}

const MyR3FBg: React.FC<MyR3FBgProps> = ({ color = '#7B7481', speed = 1, className = '' }) => {
  const meshRef = useRef<Mesh>(null);

  // Reduced-motion gate (lives outside <Canvas> so we can gate frameloop).
  const [reduce, setReduce] = useState<boolean>(false);
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReduce(mq.matches);
    update();
    mq.addEventListener?.('change', update);
    return () => mq.removeEventListener?.('change', update);
  }, []);

  const uniforms = useMemo<MyUniforms>(
    () => ({
      uTime: { value: 0 },
      uColor: { value: new Color(...hexToNormalizedRGB(color)) },
      uSpeed: { value: speed },
    }),
    [color, speed],
  );

  return (
    <div className={`w-full h-full ${className}`} aria-hidden>
      <Canvas dpr={[1, 2]} frameloop={reduce ? 'demand' : 'always'}>
        <Plane ref={meshRef} uniforms={uniforms} reduce={reduce} />
      </Canvas>
    </div>
  );
};

export default MyR3FBg;
