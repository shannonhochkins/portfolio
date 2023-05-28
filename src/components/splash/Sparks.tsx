import {
  Vector3,
  MathUtils,
  CatmullRomCurve3,
  Mesh,
  Color
} from 'three'
import React, { useRef, useMemo } from 'react'
import { extend, useFrame, useThree, ReactThreeFiber } from '@react-three/fiber'
import { MeshLine, MeshLineMaterial, MeshLineRaycast } from 'three.meshline'

extend({ MeshLine, MeshLineMaterial })

declare global {
  namespace JSX {
    interface IntrinsicElements {
      meshLine: ReactThreeFiber.Object3DNode<MeshLine, typeof MeshLine>,
      meshLineMaterial: ReactThreeFiber.Object3DNode<MeshLineMaterial, typeof MeshLineMaterial>,
    }
  }
}

const r = () => Math.max(0.2, Math.random())

interface FatlineProps {
  curve: number[]
  width: number
  color: string
  speed: number
}

function Fatline({ curve, width, color, speed }: FatlineProps) {
  const ref = useRef<MeshLineMaterial>(null!)
  useFrame((state, delta) => {
    ref.current.dashOffset -= speed
    // (ref.current.material.dashOffset -= (delta * speed) / 10)
  });
  console.log('color', color);
  return (
    <mesh>
      <meshLine attach="geometry" points={curve} />
      <meshLineMaterial
        ref={ref}
        attach="material"
        color={color} />
    </mesh>
  )
}

interface SparksProps {
  count: number
  colors: string[]
  radius?: number
}

export default function Sparks({ count, colors, radius = 10 }: SparksProps) {
  const lines = useMemo(
    () =>
      new Array(count).fill(undefined).map((_, index) => {
        const pos = new Vector3(Math.sin(0) * radius * r(), Math.cos(0) * radius * r(), 0)
        const points = new Array(30).fill(undefined).map((_, index) => {
          const angle = (index / 20) * Math.PI * 2
          return pos.add(new Vector3(Math.sin(angle) * radius * r(), Math.cos(angle) * radius * r(), 0)).clone()
        })
        const curve = new CatmullRomCurve3(points).getPoints(1000)
        return {
          color: colors[parseInt(`${colors.length * Math.random()}`)],
          width: Math.max(0.1, (0.2 * index) / 10),
          speed: Math.max(0.001, 0.004 * Math.random()),
          curve: curve.flatMap((point) => point.toArray())
        }
      }),
    [count]
  )

  const ref = useRef<Mesh>()
  const { size, viewport } = useThree()
  const aspect = size.width / viewport.width
  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.x = MathUtils.lerp(ref.current.rotation.x, 0 + state.mouse.y / aspect / 200, 0.1)
      ref.current.rotation.y = MathUtils.lerp(ref.current.rotation.y, 0 + state.mouse.x / aspect / 400, 0.1)
    }
  })

  return lines.map((props, index) => <Fatline key={index} {...props} />)
}

