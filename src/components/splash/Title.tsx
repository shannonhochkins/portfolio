import { Vector3, Group, PointLight, MathUtils } from 'three';
import React, {
	forwardRef,
	useRef,
	useMemo,
	ForwardedRef,
	Suspense,
} from 'react';
import { useFrame } from '@react-three/fiber';
import { Text3D, Text, Center } from '@react-three/drei';
import { useControls } from 'leva';
import roboto from './assets/roboto';
import { useStore } from '../../store';

interface TextProps {
	children: React.ReactNode;
	vAlign?: 'top' | 'center' | 'bottom';
	hAlign?: 'left' | 'center' | 'right';
	size?: number;
	color?: string;
	position?: Vector3;
}

export const WireframeText = forwardRef(
	(
		{
			children,
			vAlign = 'center',
			hAlign = 'center',
			size = 1,
			...props
		}: TextProps,
		ref: ForwardedRef<Group>
	) => {
		const { roughness, metalness, color } = useControls('Text Material', {
			roughness: { value: 0.1, min: -1, max: 1, step: 0.01 },
			metalness: { value: 0.85, min: 0.5, max: 1, step: 0.001 },
			color: '#ff7bb2',
		});
		return (
			<group ref={ref} {...props} scale={[0.1 * size, 0.1 * size, 0.1]}>
				<mesh>
					<Center>
						<Text3D font={roboto} size={2} height={40} curveSegments={50}>
							{children}
							<meshStandardMaterial
								color={color}
								wireframe={true}
								roughness={roughness}
								metalness={metalness}
							/>
						</Text3D>
					</Center>
				</mesh>
			</group>
		);
	}
);

export default function Title() {
	const groupRef = useRef<Group>(null);
	const pointLightRef = useRef<PointLight>(null);
	const { device } = useStore();
	const fontSize = useMemo(() => {
		return device === 'mobile' ? 9 : 15;
	}, [device]);
	const { intensity, distance, color, decay } = useControls(
		'Title Point Light',
		{
			intensity: { value: 110, min: 0, max: 200, step: 0.5 },
			distance: { value: 12, min: -100, max: 100, step: 0.5 },
			decay: { value: 2, min: -100, max: 100, step: 0.5 },
			color: '#ff4d00',
		}
	);
	useFrame((state) => {
		if (groupRef.current) {
			groupRef.current.position.x = MathUtils.lerp(
				groupRef.current.position.x,
				state.mouse.x * 2,
				0.1
			);
			groupRef.current.rotation.set(
				MathUtils.lerp(groupRef.current.rotation.x, state.mouse.y / 2, 0.1),
				0.1,
				0.1
			);
		}
		if (pointLightRef.current) {
			pointLightRef.current.position.set(
				MathUtils.lerp(
					pointLightRef.current.position.x,
					state.mouse.x * 4,
					0.1
				),
				MathUtils.lerp(
					pointLightRef.current.position.y,
					state.mouse.y * 4,
					0.1
				),
				0
			);
		}
	});
	return (
		<Suspense fallback={null}>
			<group ref={groupRef}>
				<pointLight
					ref={pointLightRef}
					distance={distance}
					intensity={intensity}
					color={color}
					decay={decay}
				/>
				<WireframeText size={fontSize} position={new Vector3(0, 2, 0)}>
					SHANNON
				</WireframeText>
				<WireframeText size={fontSize} position={new Vector3(0, -2, 0)}>
					HOCHKINS
				</WireframeText>
				<Text position={new Vector3(0, -5.5, 0)}>
					PORTFOLIO COMING SOON
					<meshNormalMaterial />
				</Text>
			</group>
		</Suspense>
	);
}
