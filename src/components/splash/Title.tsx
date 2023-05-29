import {
  Vector3,
  Group,
  Mesh,
  PointLight,
  MathUtils
} from 'three';
import React, {
  forwardRef,
  useLayoutEffect,
  useRef,
  ForwardedRef,
  Suspense,
  useEffect
} from 'react';
import {
  useFrame
} from '@react-three/fiber';
import {
  Text3D,
  Text
} from '@react-three/drei';
import { useControls } from 'leva';
import fontBlob from './font.json';

interface TextProps {
  children: React.ReactNode;
  vAlign?: 'top' | 'center' | 'bottom';
  hAlign?: 'left' | 'center' | 'right';
  size?: number;
  color?: string;
  position?: Vector3;
}

export const Name = forwardRef((
  {
    children,
    vAlign = 'center',
    hAlign = 'center',
    size = 1,
    ...props
  }: TextProps, ref: ForwardedRef<Group>) => {
  const mesh = useRef<Mesh>(null);
  const { clearcoat, thickness, roughness, metalness, reflecivity, color } = useControls('Text Material', {
    clearcoat: { value: 0, min: -1, max: 1, step: 0.05 },
    roughness: { value: 0.1, min: -1, max: 1, step: 0.01 },
    thickness: { value: 1, min: -10, max: 10, step: 0.1 },
    metalness: { value: 0.85, min: 0.5, max: 1, step: 0.001 },
    reflecivity: { value: 0.1, min: -10, max: 10, step: 0.1 },
    color: "#ff7bb2",
  })
  useLayoutEffect(() => {
    const size = new Vector3()
    if (mesh.current) {
      mesh.current.geometry.computeBoundingBox();
      mesh.current.geometry.boundingBox?.getSize(size);
      mesh.current.position.x = hAlign === 'center' ? -size.x / 2 : hAlign === 'right' ? 0 : -size.x
      mesh.current.position.y = vAlign === 'center' ? -size.y / 2 : vAlign === 'top' ? 0 : -size.y
    }
  }, [children])
  return (
    <group ref={ref} {...props} scale={[0.1 * size, 0.1 * size, 0.1]}>
      <mesh>
        <Text3D ref={mesh} font={fontBlob} size={2} height={40} curveSegments={50}>
          {children}
          <meshStandardMaterial
            color={color}
            wireframe={true}
            roughness={roughness}
            clearcoat={clearcoat}
            thickness={thickness}
            metalness={metalness}
            reflectivity={reflecivity}
           />
        </Text3D>
      </mesh>
    </group>
  )
})



export default function Title() {
  const pointLight = useRef<PointLight>(null);
  const { intensity, distance, color, decay } = useControls('Title Point Light', {
    intensity: { value: 110, min: 0, max: 200, step: 0.5 },
    distance: { value: 12, min: -100, max: 100, step: 0.5 },
    decay: { value: 2, min: -100, max: 100, step: 0.5 },
    color: "#ff4d00",
  })

  const ref = useRef<Group>(null);
  useFrame((state) => {
    if (ref.current?.position) {
      ref.current.position.x = MathUtils.lerp(ref.current.position.x, state.mouse.x * 2, 0.1)
      ref.current.rotation.x = MathUtils.lerp(ref.current.rotation.x, state.mouse.y / 2, 0.1)
      ref.current.rotation.z = 0.1
      ref.current.rotation.y = 0.1
    }
    if (pointLight.current?.position) {
      pointLight.current.position.x = MathUtils.lerp(pointLight.current.position.x, state.mouse.x * 4, 0.1)
      pointLight.current.position.y = MathUtils.lerp(pointLight.current.position.y, state.mouse.x * 4, 0.1)
    }
  })
  return (
    <Suspense fallback={null}>
      <group ref={ref}>
        <pointLight ref={pointLight} distance={distance} intensity={intensity} color={color} decay={decay} />
        <Name size={15} position={new Vector3(0, 2, 0)}>
          SHANNON
        </Name>
        <Name size={15} position={new Vector3(0, -2, 0)}>
          HOCHKINS
        </Name>

        <Text position={new Vector3(0, -5.5, 0)}>
          PORTFOLIO COMING SOON
          <meshNormalMaterial />
        </Text>
      </group>
    </Suspense>
  )
}