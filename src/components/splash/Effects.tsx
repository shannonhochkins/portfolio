import { WebGLRenderTarget, Vector2 } from 'three';
import { useRef, useMemo, useEffect } from 'react';
import {
	extend,
	useThree,
	useFrame,
	ReactThreeFiber,
} from '@react-three/fiber';
import { Effects } from '@react-three/drei';
import { RenderPass, WaterPass, UnrealBloomPass } from 'three-stdlib';
import type { EffectComposer as EffectComposerGeneric } from 'three-stdlib';
import { useControls } from 'leva';

extend({ UnrealBloomPass, RenderPass, WaterPass });

declare global {
	namespace JSX {
		interface IntrinsicElements {
			waterPass: ReactThreeFiber.Object3DNode<WaterPass, typeof WaterPass>;
			unrealBloomPass: ReactThreeFiber.Object3DNode<
				UnrealBloomPass,
				typeof UnrealBloomPass
			>;
		}
	}
}

export default function ApplyEffects({
	children,
}: {
	children: React.ReactNode;
}) {
	const waterPassRef = useRef<WaterPass>(null!);
	const composerRef = useRef<EffectComposerGeneric<WebGLRenderTarget>>(null!);
	const { size } = useThree();
	const aspect = useMemo(() => new Vector2(2046, 2046), []);
	const { strength, threshold, radius } = useControls('Bloom', {
		threshold: { value: 0.1, min: 0, max: 1, step: 0.01 },
		strength: { value: 1.5, min: 0, max: 10, step: 0.01 },
		radius: { value: 0.05, min: 0, max: 1, step: 0.01 },
	});
	useEffect(() => {
		if (composerRef.current) {
			composerRef.current.setSize(size.width, size.height);
		}
	}, [size]);
	useFrame(() => {
		composerRef.current?.render();
		if (waterPassRef.current) {
			waterPassRef.current.time += 0.05;
		}
	}, 1);
	return (
		<>
			<scene>{children}</scene>
			<Effects ref={composerRef} disableGamma={true} disableRenderPass={false}>
				<waterPass ref={waterPassRef} attach="passes" factor={0.6} />
				<unrealBloomPass
					threshold={threshold}
					strength={strength}
					radius={radius}
					resolution={aspect}
				/>
			</Effects>
		</>
	);
}
