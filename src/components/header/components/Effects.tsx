import * as THREE from 'three'
import React, { useRef, useMemo, useEffect } from 'react'
import { extend, useThree, useFrame, ReactThreeFiber } from '@react-three/fiber';
import { EffectComposer, Sepia, Scanline, Bloom, Noise, DepthOfField, Vignette } from '@react-three/postprocessing';
import { BlendFunction, Resizer, KernelSize, Resolution, BlurPass } from 'postprocessing';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass'
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass'
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass'
import { FilmPass } from 'three/examples/jsm/postprocessing/FilmPass'
import { WaterPass } from './waterPass'

// declare global {
//   namespace JSX {
//     interface IntrinsicElements {
//       waterPass: ReactThreeFiber.Object3DNode<WaterPass, typeof WaterPass>,
//       unrealBloomPass: ReactThreeFiber.Object3DNode<UnrealBloomPass, typeof UnrealBloomPass>,
//     }
//   }
// }

extend({ ShaderPass, RenderPass, WaterPass, UnrealBloomPass, FilmPass })

export function Effects(): JSX.Element {
  const composer = useRef()
  const { scene, gl, size, camera } = useThree()
  const aspect = useMemo(() => new THREE.Vector2(window.innerWidth, window.innerHeight), [])
  useEffect(() => {
    if (composer.current) {
      console.log('composer.current.setSize', composer.current.setSize, size);
      composer.current.setSize(size.width, size.height)
    }
  }, [size])
  useFrame((state, delta) => composer.current?.render(delta), 1)
  console.log('xxx')
  return (
    <EffectComposer ref={composer} camera={camera} scene={scene}>
      <Bloom luminanceThreshold={0} mipmapBlur luminanceSmoothing={0.0} intensity={1} />
      <Vignette
        offset={0.3} // vignette offset
        darkness={0.9} // vignette darkness
        eskil={false} // Eskil's vignette technique
        blendFunction={BlendFunction.MULTIPLY} // blend mode
      />
    </EffectComposer>
  )
}