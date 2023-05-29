import { WebGLRenderTarget, Vector2, Scene } from 'three';
import { useRef, useMemo, useEffect, useState } from 'react';
import { extend, useThree, useFrame, ReactThreeFiber } from '@react-three/fiber';
import { Effects } from '@react-three/drei';
import { RenderPass, WaterPass, UnrealBloomPass } from 'three-stdlib';
import type { EffectComposer as EffectComposerGeneric } from 'three-stdlib';
import { useControls } from 'leva';

extend({ UnrealBloomPass, RenderPass, WaterPass });

declare global {
  namespace JSX {
    interface IntrinsicElements {
      waterPass: ReactThreeFiber.Object3DNode<WaterPass, typeof WaterPass>,
      unrealBloomPass: ReactThreeFiber.Object3DNode<UnrealBloomPass, typeof UnrealBloomPass>,
    }
  }
}

export default function ApplyEffects({ children }: { children: React.ReactNode }) {
  const waterPass = useRef<WaterPass>(null!);
  const composer = useRef<EffectComposerGeneric<WebGLRenderTarget>>(null!)
  const { size, camera } = useThree();
  const aspect = useMemo(() => new Vector2(2046, 2046), [])
  const [scene, setScene] = useState<Scene>();
  const {strength, threshold, radius} = useControls('Bloom', {
    threshold: { value: 0.1, min: 0, max: 1, step: 0.01 },
    strength: { value: 1.5, min: 0, max: 10, step: 0.01 },
    radius: { value: 0.05, min: 0, max: 1, step: 0.01 },
  })
  useEffect(() => {
    if (composer.current) {
      composer.current.setSize(size.width, size.height)
    }
  }, [size])
  useFrame(() => {
    composer.current?.render();
    if (waterPass.current) {
      waterPass.current.time += 0.05;
    }
  }, 1);
  return <>
    <scene ref={(ref) => {
      if (ref && !scene) {
        setScene(ref);
      }
    }}>{children}</scene>
    <Effects ref={composer} disableGamma={true} disableRenderPass={false}>
      <waterPass ref={waterPass} attach="passes" factor={0.6} />
      <unrealBloomPass
        threshold={threshold}
        strength={strength}
        radius={radius}
        resolution={aspect} />
    </Effects>
  </>;
}

