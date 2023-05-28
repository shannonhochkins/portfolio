import { WebGLRenderTarget, Vector2 } from 'three';
import { useRef, useMemo, useEffect } from 'react';
import { extend, useThree, useFrame, ReactThreeFiber } from '@react-three/fiber';
import { Effects } from '@react-three/drei';
import { UnrealBloomPass, RenderPass, WaterPass, BloomPass } from 'three-stdlib';
import type { EffectComposer as EffectComposerGeneric } from 'three-stdlib';

extend({ UnrealBloomPass, RenderPass, WaterPass, BloomPass });

declare global {
  namespace JSX {
    interface IntrinsicElements {
      waterPass: ReactThreeFiber.Object3DNode<WaterPass, typeof WaterPass>,
      unrealBloomPass: ReactThreeFiber.Object3DNode<UnrealBloomPass, typeof UnrealBloomPass>,
      bloomPass: ReactThreeFiber.Object3DNode<BloomPass, typeof BloomPass>,
    }
  }
}

export default function ApplyEffects() {
  const waterPass = useRef<WaterPass>(null!);
  const composer = useRef<EffectComposerGeneric<WebGLRenderTarget>>(null!)
  const { scene, gl, size, camera } = useThree()
  const aspect = useMemo(() => new Vector2(512, 512), [])
  // const { intensity, distance, color, ambientIntensity } = useControls('Bloom', {
  //   intensity: { value: 9, min: 0, max: 200, step: 0.5 },
  //   distance: { value: 100, min: -100, max: 100, step: 0.5 },
  //   color: "#7c0505",
  //   ambientIntensity: { value: 1, min: -3, max: 3, step: 0.1 },
  // });
  useEffect(() => {
    if (composer.current) {
      composer.current.setSize(size.width, size.height)
    }
  }, [size])
  useFrame((state, delta) => {
    composer.current?.render();
    if (waterPass.current) {
      waterPass.current.time += 0.05;
    }
  }, 1)
  console.log('waterPass', waterPass);
  return (
    <Effects ref={composer} disableGamma={true} disableRenderPass={true} >
      <renderPass scene={scene} camera={camera} />
      <waterPass ref={waterPass} attach="passes" factor={0.6} />
      <unrealBloomPass
        threshold={0.1}
        strength={1.5}
        radius={0.05}
        resolution={aspect} />
    </Effects>
  )
}
