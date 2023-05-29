import { useEffect } from 'react';
import styled from '@emotion/styled';
import { Canvas } from '@react-three/fiber';
import Title from './Title';
import ApplyEffects from './Effects';
import Particles from './Particles';
import Socials from './Socials';
import { useWindowSize } from '../../hooks/useWindowSize';
import { useStore } from '../../store';

const Note = styled.div<{
	isMobile: boolean;
}>`
	font-size: 1rem;
	position: absolute;
	bottom: 0;
	right: 1%;
	text-align: center;
	display: flex;
	align-items: center;
	justify-content: center;
	font-weight: 300;
	flex-direction: column;
	${(props) =>
		props.isMobile &&
		`
    width: 100%;
    position: abosolute;
    right: auto;
  `}
	p {
		font-weight: 300;
		margin: 0;
	}
	span {
		display: block;
		font-size: 0.8rem;
		padding-bottom: 0.5rem;
	}
`;

export const Splash = () => {
	const { setDeviceType, device } = useStore();
	const size = useWindowSize();
	useEffect(() => {
		setDeviceType();
	}, [size]);
	return (
		<>
			<Canvas
				dpr={window.devicePixelRatio}
				gl={{ antialias: true, alpha: true }}
				camera={{ fov: 65, position: [0, 0, 30] }}
			>
				<ApplyEffects>
					<Title />
					<Particles />
				</ApplyEffects>
			</Canvas>
			<Note isMobile={device === 'mobile'}>
				<p>BUILT WITH</p>
				<span>React, R3F, Emotion, TS, Zustand</span>
			</Note>
			<Socials />
		</>
	);
};
