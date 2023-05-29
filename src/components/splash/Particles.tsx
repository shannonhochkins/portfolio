import { Object3D, SpotLight, InstancedMesh } from 'three';
import { useRef, useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { useControls } from 'leva';
import { useStore } from '../../store';

// reference: https://varun.ca/three-js-particles/

export default function Particles() {
	const { device } = useStore();
	const meshRef = useRef<InstancedMesh>(null);
	const lightRef = useRef<SpotLight>(null);
	const count = useMemo(() => {
		return device === 'mobile' ? 5000 : 10000;
	}, [device]);
	const {
		intensity,
		distance,
		color,
		clearcoat,
		roughness,
		thickness,
		metalness,
		reflecivity,
		particleColor,
		angle,
		penumbra,
		decay,
	} = useControls('Particle lights', {
		intensity: { value: 12, min: 0, max: 100, step: 0.5 },
		angle: { value: 8, min: 0, max: 10, step: 0.01 },
		penumbra: { value: 0.6, min: 0, max: 1, step: 0.01 },
		decay: { value: 0.2, min: 0, max: 10, step: 0.1 },
		distance: { value: 16.5, min: -100, max: 100, step: 0.5 },
		clearcoat: { value: 0, min: -1, max: 1, step: 0.05 },
		roughness: { value: 0.1, min: -1, max: 1, step: 0.01 },
		thickness: { value: 1, min: -10, max: 10, step: 0.1 },
		metalness: { value: 0.92, min: 0.5, max: 1, step: 0.001 },
		reflecivity: { value: 0.1, min: -10, max: 10, step: 0.1 },
		color: '#2bceff',
		particleColor: '#ffaeae',
	});
	const { size, viewport } = useThree();
	const aspect = size.width / viewport.width;

	const dummy = useMemo(() => new Object3D(), []);
	const randomFactor = (min: number, max: number) =>
		min + Math.random() * (max - min);
	// Generate some random positions, speed factors and timings
	const particles = useMemo(() => {
		return Array.from({ length: count }, () => {
			const t = Math.random() * 10;
			const factor = 20 + Math.random() * 100;
			const speed = 0.01 + Math.random() / 200;
			const xFactor = randomFactor(-50, 50);
			const yFactor = randomFactor(-50, 50);
			const zFactor = randomFactor(-50, 50);
			return { t, factor, speed, xFactor, yFactor, zFactor, mx: 0, my: 0 };
		});
	}, [count]);
	// The innards of this hook will run every frame
	useFrame((state) => {
		if (lightRef.current) {
			const { x, y } = {
				x: state.mouse.x === 0 ? -0.67 : state.mouse.x,
				y: state.mouse.y === 0 ? 0.01 : state.mouse.y,
			};
			// Makes the light follow the mouse
			lightRef.current.position.set(x / aspect, -y / aspect, 0);
		}
		// Run through the randomized data to calculate some movement
		particles.forEach((particle, i) => {
			let { t, factor, speed, xFactor, yFactor, zFactor } = particle;
			// There is no sense or reason to any of this, just messing around with trigonometric functions
			t = particle.t += speed / 2;
			const a = Math.cos(t) + Math.sin(t * 1) / 10;
			const b = Math.sin(t) + Math.cos(t * 2) / 10;
			const s = Math.cos(t);
			particle.mx += (state.mouse.x - particle.mx) * 0.01;
			particle.my += (state.mouse.y * -1 - particle.my) * 0.01;
			// Update the dummy object
			dummy.position.set(
				(particle.mx / 10) * a +
					xFactor +
					Math.cos((t / 10) * factor) +
					(Math.sin(t * 1) * factor) / 10,
				(particle.my / 10) * b +
					yFactor +
					Math.sin((t / 10) * factor) +
					(Math.cos(t * 2) * factor) / 10,
				(particle.my / 10) * b +
					zFactor +
					Math.cos((t / 10) * factor) +
					(Math.sin(t * 3) * factor) / 10
			);
			dummy.scale.set(s, s, s);
			dummy.rotation.set(s * 5, s * 5, s * 5);
			dummy.updateMatrix();
			if (meshRef.current) {
				// And apply the matrix to the instanced item
				meshRef.current.setMatrixAt(i, dummy.matrix);
			}
		});
		if (meshRef.current) {
			meshRef.current.instanceMatrix.needsUpdate = true;
		}
	});
	return (
		<>
			<spotLight
				ref={lightRef}
				position={[-0.2, -0.07, 0]}
				distance={distance}
				intensity={intensity}
				angle={angle}
				penumbra={penumbra}
				decay={decay}
				color={color}
			/>
			<instancedMesh ref={meshRef} args={[undefined, undefined, count]}>
				<dodecahedronGeometry args={[0.2, 0]} />
				<meshPhysicalMaterial
					color={particleColor}
					{...{
						clearcoat,
						roughness,
						thickness,
						metalness,
						reflecivity,
					}}
				/>
			</instancedMesh>
		</>
	);
}
