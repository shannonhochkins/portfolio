
import {
  ACESFilmicToneMapping,
  SRGBColorSpace,
  Color
} from 'three';
import { useRef, useState, Suspense, useMemo, useEffect } from 'react'
import { Canvas, useFrame, extend, useThree } from '@react-three/fiber';
import { useGLTF, useBoxProjectedEnv, CubeCamera, Environment, OrbitControls, BakeShadows } from '@react-three/drei'
import { easing } from 'maath';
import {
  Html,
  Icosahedron,
  useTexture,
  useCubeTexture,
  MeshDistortMaterial
} from "@react-three/drei";
import { Plane } from './components/Plane';
import { Effects } from './components/Effects';
import { Particles } from './components/Particles';

// import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

export function Header() {
  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
  const mouse = useRef([0, 0]);
  return (
    <Canvas
      shadows
      linear
      gl={{
        powerPreference: "high-performance",
        alpha: true,
        antialias: true,
        stencil: false,
        depth: true
      }}
      dpr={[1, 1.5]}
      camera={{ fov: 100, position: [0, 0, 30] }}
      // camera={{ position: [0, 1, 0], fov: 65, near: 1, far: 1000 }}
      eventSource={document.getElementById('root') as HTMLElement}
      eventPrefix="client"
      onCreated={({ gl }) => {
        gl.outputColorSpace = SRGBColorSpace;
        gl.toneMapping = ACESFilmicToneMapping;
      }}>
      <fog attach="fog" args={['white', 50, 190]} />
      <pointLight distance={100} intensity={4} color="white" />
      <Suspense fallback={<Html center>Loading.</Html>}>
        <Plane position={[0, 0, -100]} />
        <Particles count={isMobile ? 5000 : 10000} mouse={mouse} />
      </Suspense>
      <Effects />
      {/* <OrbitControls minPolarAngle={Math.PI / 2} maxPolarAngle={Math.PI / 2} /> */}
      <CameraRig />
    </Canvas>
  )
}

const INTENSITY = 5;
function CameraRig() {
  useFrame((state, delta) => {
    easing.damp3(state.camera.position, [(state.pointer.x * state.viewport.width) / INTENSITY, ((state.pointer.y * state.viewport.height) / INTENSITY), 10], .5, delta)
    state.camera.lookAt(0, 0, 0);
  })
  return null;
}

