import { Object3D, PointLight, InstancedMesh } from 'three'
import { useRef, useMemo } from 'react'
import { useFrame, useThree } from '@react-three/fiber';
import { useControls } from 'leva';


interface ParticlesProps {
  count: number;
}
export default function Particles({ count }: ParticlesProps) {
  const mesh = useRef<InstancedMesh>(null);
  const light = useRef<PointLight>(null);
  const {
    intensity,
    distance,
    color,
    clearcoat,
    roughness,
    thickness,
    metalness,
    reflecivity,
    particleColor
  } = useControls('Particle lights', {
    intensity: { value: 10, min: 0, max: 100, step: 0.5 },
    distance: { value: 80, min: -100, max: 100, step: 0.5 },
    clearcoat: { value: 0, min: -1, max: 1, step: 0.05 },
    roughness: { value: 0.1, min: -1, max: 1, step: 0.01 },
    thickness: { value: 1, min: -10, max: 10, step: 0.1 },
    metalness: { value: 0.85, min: 0.5, max: 1, step: 0.001 },
    reflecivity: { value: 0.1, min: -10, max: 10, step: 0.1 },
    color: "lightblue",
    particleColor: '#050505'
  });
  const { size, viewport } = useThree();
  const aspect = size.width / viewport.width

  const dummy = useMemo(() => new Object3D(), [])
  // Generate some random positions, speed factors and timings
  const particles = useMemo(() => {
    const temp = []
    for (let i = 0; i < count; i++) {
      const t = Math.random() * 10
      const factor = 20 + Math.random() * 100
      const speed = 0.01 + Math.random() / 200
      const xFactor = -150 + Math.random() * 300
      const yFactor = -50 + Math.random() * 100
      const zFactor = -50 + Math.random() * 100
      temp.push({ t, factor, speed, xFactor, yFactor, zFactor, mx: 0, my: 0 })
    }
    return temp
  }, [count])
  // The innards of this hook will run every frame
  useFrame((state) => {
    if (light.current) {
      // Makes the light follow the mouse
      light.current.position.set(state.mouse.x / aspect, -state.mouse.y / aspect, 0)
    }
    if (!mesh.current) {
      return;
    }
    
    // Run through the randomized data to calculate some movement
    particles.forEach((particle, i) => {
      let { t, factor, speed, xFactor, yFactor, zFactor } = particle
      // There is no sense or reason to any of this, just messing around with trigonometric functions
      t = particle.t += speed / 2
      const a = Math.cos(t) + Math.sin(t * 1) / 10
      const b = Math.sin(t) + Math.cos(t * 2) / 10
      const s = Math.cos(t)
      particle.mx += (state.mouse.x - particle.mx) * 0.01
      particle.my += (state.mouse.y * -1 - particle.my) * 0.01
      // Update the dummy object
      dummy.position.set(
        (particle.mx / 10) * a + xFactor + Math.cos((t / 10) * factor) + (Math.sin(t * 1) * factor) / 10,
        (particle.my / 10) * b + yFactor + Math.sin((t / 10) * factor) + (Math.cos(t * 2) * factor) / 10,
        (particle.my / 10) * b + zFactor + Math.cos((t / 10) * factor) + (Math.sin(t * 3) * factor) / 10
      )
      dummy.scale.set(s, s, s)
      dummy.rotation.set(s * 5, s * 5, s * 5)
      dummy.updateMatrix();
      if (mesh.current) {
        // And apply the matrix to the instanced item
        mesh.current.setMatrixAt(i, dummy.matrix)
      }
    })
    mesh.current.instanceMatrix.needsUpdate = true
  })
  return (
    <>
      <pointLight ref={light} distance={distance} intensity={intensity} color={color} />
      <instancedMesh ref={mesh} args={[undefined, undefined, count]}>
        <dodecahedronGeometry args={[0.2, 0]} />
        <meshPhysicalMaterial color={particleColor} {...{
          clearcoat,
          roughness,
          thickness,
          metalness,
          reflecivity,
        }}/>
      </instancedMesh>
    </>
  )
}
