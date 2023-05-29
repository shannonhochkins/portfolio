import { useGesture } from '@use-gesture/react'
import styled from '@emotion/styled';
import { useDock } from '../Dock/DockContext'
import { DOCK_ZOOM_LIMIT } from '../Dock'

const Divider = styled.div`
  width: 1px;
  height: 100%;
  border-radius: 2px;
  background-color: rgba(255, 255, 255, 0.1);

  span {
    height: 100%;
    display: flex;
    align-items: center;
    padding: 0 4px;

    &:hover {
      cursor: ns-resize;
    }
  }
`;

export default function DockDivider() {
  const { zoomLevel, setIsZooming } = useDock()

  const bind = useGesture(
    {
      onDrag: ({ down, offset: [_ox, oy], cancel, direction: [_dx, dy] }) => {
        /**
         * Stop the drag gesture if the user goes out of bounds otherwise
         * the animation feels stuck but it's the gesture state catching
         * up to a point where the scaling can actualy animate again.
         */
        if (oy <= DOCK_ZOOM_LIMIT[0] && dy === -1) {
          cancel()
        } else if (oy >= DOCK_ZOOM_LIMIT[1] && dy === 1) {
          cancel()
        } else if (zoomLevel) {
          zoomLevel.start(oy, {
            immediate: down,
          })
        }
      },
      onDragStart: () => {
        setIsZooming(true)
      },
      onDragEnd: () => {
        setIsZooming(false)
      },
    },
    {
      drag: {
        axis: 'y',
      },
    }
  )

  if (!zoomLevel) {
    return null
  }

  return (
    <Divider {...bind()}>
      <span></span>
    </Divider>
  )
}
