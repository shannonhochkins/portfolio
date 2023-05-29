import * as React from 'react';
import { animated, useSpringValue } from '@react-spring/web';
import styled from '@emotion/styled';
import { clamp } from '@react-spring/shared';
import { useWindowResize } from '../hooks/useWindowResize';
import { DockContext } from './DockContext';

interface DockProps {
	children: React.ReactNode;
}

const Animated = styled(animated.div)`
	position: fixed;
	bottom: 12px;
	left: 50%;
	transform: translateX(-50%);
	align-items: flex-end;
	height: 58px;
	display: flex;
	padding: 10px;
	padding-bottom: 6px;
	gap: 12px;
	background-color: rgba(0, 0, 0, 0.92);
	will-change: contents;
	box-sizing: content-box;
	border-radius: 12px;
	transform-origin: center bottom;
`;

export const DOCK_ZOOM_LIMIT = [-100, 50];

export default function Dock({ children }: DockProps) {
	const [hovered, setHovered] = React.useState(false);
	const [width, setWidth] = React.useState(0);
	const isZooming = React.useRef(false);
	const dockRef = React.useRef<HTMLDivElement>(null!);

	const setIsZooming = React.useCallback((value: boolean) => {
		isZooming.current = value;
		setHovered(!value);
	}, []);

	const zoomLevel = useSpringValue(1, {
		onChange: () => {
			setWidth(dockRef.current.clientWidth);
		},
	});

	useWindowResize(() => {
		setWidth(dockRef.current.clientWidth);
	});

	return (
		<DockContext.Provider value={{ hovered, setIsZooming, width, zoomLevel }}>
			<Animated
				ref={dockRef}
				onMouseOver={() => {
					if (!isZooming.current) {
						setHovered(true);
					}
				}}
				onMouseOut={() => {
					setHovered(false);
				}}
				style={{
					x: '-50%',
					scale: zoomLevel
						.to({
							range: [DOCK_ZOOM_LIMIT[0], 1, DOCK_ZOOM_LIMIT[1]],
							output: [2, 1, 0.5],
						})
						.to((value) => clamp(0.5, 2, value)),
				}}
			>
				{children}
			</Animated>
		</DockContext.Provider>
	);
}
