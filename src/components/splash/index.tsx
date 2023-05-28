import {
  MathUtils,
  Color,
  Group,
  Vector3,
  PointLight
} from 'three';
import { Suspense, useRef } from 'react';
import { Canvas, useFrame, extend } from '@react-three/fiber';
import { useControls } from 'leva';
import Title from './Title'
import ApplyEffects from './Effects'
import Sparks, { Lines } from './Sparks';
import Particles from './Particles'
import './styles.css'

export const Splash = () => {
  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
  const { intensity, distance, color, ambientIntensity } = useControls('Main lights', {
    intensity: { value: 9, min: 0, max: 200, step: 0.5 },
    distance: { value: 100, min: -100, max: 100, step: 0.5 },
    color: "#7c0505",
    ambientIntensity: { value: 1, min: -3, max: 3, step: 0.1 },
  });
  return (
    <Canvas
      linear
      dpr={[1, 2]}
      camera={{ fov: 65, position: [0, 0, 30] }}>
      <fog attach="fog" args={['white', 50, 190]} />
      <ambientLight intensity={ambientIntensity} color="#f56e80" />
      {/* <pointLight distance={10} intensity={15} color="#f56e80" /> */}
      <pointLight distance={distance} intensity={intensity} color={color} />
      <Sparks count={20} colors={['#A2CCB6', '#FCEEB5', '#EE786E', '#e0feff', 'lightpink', 'lightblue']} />
      <Title />
      <Particles count={isMobile ? 5000 : 10000} />
      {/* <ApplyEffects /> */}
    </Canvas>
  )
}

