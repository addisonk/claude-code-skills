// Skeleton: R3F 3D scene with GLTF + drei + lighting (TS-TW)
// Modeled on: src/ts-tailwind/Components/ModelViewer/ModelViewer.tsx
//   and:      src/ts-tailwind/Components/Lanyard/Lanyard.tsx
//
// This is the real-3D-scene pattern (mesh tree, GLTF, drei OrbitControls, lights,
// frameloop="demand", optional Environment IBL). For full-screen procedural shader
// backgrounds rendered on a single plane, see templates/skeleton-r3f-shader-plane.tsx.
// Reference docs: references/threejs.md (decision matrix, drei helpers, perf).
//
// Drop into:  src/ts-tailwind/Components/<Name>/<Name>.tsx
// If shipping a .glb / .png alongside the component, add the entry to
// MANUAL_ASSETS in jsrepo.config.ts (see Lanyard for the canonical example).

/* eslint-disable react/no-unknown-property */
import { FC, Suspense, useEffect, useRef, useState } from 'react';
import { Canvas, invalidate, useFrame } from '@react-three/fiber';
import {
  OrbitControls,
  useGLTF,
  Environment,
  ContactShadows,
  Html,
  useProgress,
} from '@react-three/drei';
import * as THREE from 'three';

export interface MyScenePresetProps {
  /** URL of a .glb / .gltf model. TODO: ship via MANUAL_ASSETS or pass a public URL. */
  modelUrl: string;
  cameraPosition?: [number, number, number];
  cameraFov?: number;
  enableControls?: boolean;
  autoRotate?: boolean;
  /** rad/sec when autoRotate is on */
  autoRotateSpeed?: number;
  ambientIntensity?: number;
  keyLightIntensity?: number;
  fillLightIntensity?: number;
  environmentPreset?:
    | 'city'
    | 'sunset'
    | 'night'
    | 'dawn'
    | 'studio'
    | 'apartment'
    | 'forest'
    | 'park'
    | 'none';
  /** Disables idle auto-rotation when prefers-reduced-motion: reduce. */
  respectReducedMotion?: boolean;
  width?: number | string;
  height?: number | string;
  className?: string;
  onLoaded?: () => void;
}

const Loader: FC = () => {
  const { progress } = useProgress();
  return <Html center>{`${Math.round(progress)} %`}</Html>;
};

interface ModelProps {
  url: string;
  autoRotate: boolean;
  autoRotateSpeed: number;
  reduce: boolean;
  onLoaded?: () => void;
}

const Model: FC<ModelProps> = ({ url, autoRotate, autoRotateSpeed, reduce, onLoaded }) => {
  // useGLTF Suspends until the asset resolves; the parent <Suspense fallback> shows the Loader.
  const gltf = useGLTF(url);
  const ref = useRef<THREE.Group>(null);

  useEffect(() => {
    onLoaded?.();
    invalidate();
  }, [onLoaded]);

  useFrame((_, dt) => {
    if (!ref.current || !autoRotate || reduce) return;
    ref.current.rotation.y += autoRotateSpeed * dt;
    invalidate(); // demand-render only the frames we actually need
  });

  return (
    <group ref={ref}>
      <primitive object={gltf.scene} />
    </group>
  );
};

const MyScenePreset: FC<MyScenePresetProps> = ({
  modelUrl,
  cameraPosition = [0, 0, 5],
  cameraFov = 50,
  enableControls = true,
  autoRotate = true,
  autoRotateSpeed = 0.35,
  ambientIntensity = 0.4,
  keyLightIntensity = 1,
  fillLightIntensity = 0.5,
  environmentPreset = 'city',
  respectReducedMotion = true,
  width = '100%',
  height = '100%',
  className = '',
  onLoaded,
}) => {
  // Preload the GLTF off the render path so the first paint is fast.
  // (See ModelViewer.tsx:407 — same pattern.)
  useEffect(() => {
    useGLTF.preload(modelUrl);
  }, [modelUrl]);

  // Reduced-motion gate. Disables the idle auto-rotate; manual OrbitControls remain.
  const [reduce, setReduce] = useState<boolean>(false);
  useEffect(() => {
    if (!respectReducedMotion) return;
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReduce(mq.matches);
    update();
    mq.addEventListener?.('change', update);
    return () => mq.removeEventListener?.('change', update);
  }, [respectReducedMotion]);

  return (
    <div className={className} style={{ width, height, position: 'relative' }}>
      <Canvas
        dpr={[1, 2]}
        // demand: only render frames when invalidate() is called (controls, useFrame, resize).
        // Cheaper than "always" for static-when-idle scenes (ModelViewer.tsx:464 uses this).
        frameloop="demand"
        shadows
        camera={{ position: cameraPosition, fov: cameraFov, near: 0.1, far: 100 }}
        onCreated={({ gl }) => {
          gl.toneMapping = THREE.ACESFilmicToneMapping;
          gl.outputColorSpace = THREE.SRGBColorSpace;
        }}
      >
        {/* 3-point lighting baseline. Tune intensities via props. */}
        <ambientLight intensity={ambientIntensity} />
        <directionalLight position={[5, 5, 5]} intensity={keyLightIntensity} castShadow />
        <directionalLight position={[-5, 2, 5]} intensity={fillLightIntensity} />

        {environmentPreset !== 'none' && (
          <Environment preset={environmentPreset} background={false} />
        )}

        <ContactShadows position={[0, -0.5, 0]} opacity={0.35} scale={10} blur={2} />

        <Suspense fallback={<Loader />}>
          <Model
            url={modelUrl}
            autoRotate={autoRotate}
            autoRotateSpeed={autoRotateSpeed}
            reduce={reduce}
            onLoaded={onLoaded}
          />
        </Suspense>

        {enableControls && (
          <OrbitControls
            makeDefault
            enableDamping
            dampingFactor={0.08}
            // OrbitControls calls invalidate() under "demand" automatically when the user drags.
          />
        )}
      </Canvas>
    </div>
  );
};

export default MyScenePreset;

// Cleanup notes:
// - useGLTF caches scenes globally. To free a model that won't be reused, call
//   useGLTF.clear(url) on unmount of the consuming page (not done here — typical
//   apps keep the cache warm).
// - <Canvas> handles renderer.dispose() on unmount automatically.
// - For raw three.js objects you instantiate yourself, dispose geometries/materials
//   in a useEffect cleanup: scene.traverse((o) => { o.geometry?.dispose?.();
//   o.material?.dispose?.(); }); — see references/performance.md.
