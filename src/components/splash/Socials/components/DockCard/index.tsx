import * as React from 'react'
import styled from '@emotion/styled'
import { animated, useIsomorphicLayoutEffect, useSpringValue } from '@react-spring/web'
import { useMousePosition } from '../hooks/useMousePosition'
import { useWindowResize } from '../hooks/useWindowResize'
import { useDock } from '../Dock/DockContext'

interface DockCardProps {
  children: React.ReactNode
}

const INITIAL_WIDTH = 48

const DockContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
`;

const DockDot = styled(animated.div)`
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background-color: #fff;
`;

const DockButton = styled(animated.button)`
  border-radius: 12px;
  border: solid 1px rgba(255, 255, 255, 0.1);
  background-color: #262626;
  filter: saturate(0.9) brightness(0.9);
  transition: filter 200ms;
  padding: 0;
  margin: 0;
  cursor: pointer;

  &:hover {
    filter: saturate(1) brightness(1.12);
  }
  svg {
    position: absolute;
    inset: 0;
    padding: 4px;
  }
`;

export default function DockCard({ children }: DockCardProps) {
  const cardRef = React.useRef<HTMLButtonElement>(null!)
  /**
   * This doesn't need to be real time, think of it as a static
   * value of where the card should go to at the end.
   */
  const [elCenterX, setElCenterX] = React.useState<number>(0)

  const size = useSpringValue(INITIAL_WIDTH, {
    config: {
      mass: 0.1,
      tension: 320,
    },
  })

  const opacity = useSpringValue(0)
  const y = useSpringValue(0, {
    config: {
      friction: 29,
      tension: 238,
    },
  })

  const dock = useDock()

  /**
   * This is just an abstraction around a `useSpring` hook, if you wanted you could do this
   * in the hook above, but these abstractions are useful to demonstrate!
   */
  useMousePosition(
    {
      onChange: ({ value }) => {
        const mouseX = value.x

        if (dock.width > 0) {
          const transformedValue =
            INITIAL_WIDTH + 36 * Math.cos((((mouseX - elCenterX) / dock.width) * Math.PI) / 2) ** 12

          if (dock.hovered) {
            size.start(transformedValue)
          }
        }
      },
    },
    [elCenterX, dock]
  )

  useIsomorphicLayoutEffect(() => {
    if (!dock.hovered) {
      size.start(INITIAL_WIDTH)
    }
  }, [dock.hovered])

  useWindowResize(() => {
    const { x } = cardRef.current.getBoundingClientRect()

    setElCenterX(x + INITIAL_WIDTH / 2)
  })

  const timesLooped = React.useRef(0)
  const timeoutRef = React.useRef<number>()
  const isAnimating = React.useRef(false)

  const handleClick = () => {
    if (!isAnimating.current) {
      isAnimating.current = true
      opacity.start(0.5)

      timesLooped.current = 0

      y.start(-INITIAL_WIDTH / 2, {
        loop: () => {
          if (3 === timesLooped.current++) {
            timeoutRef.current = setTimeout(() => {
              opacity.start(0)
              y.set(0)
              isAnimating.current = false
              timeoutRef.current = undefined
            }, 2000)
            y.stop()
          }
          return { reverse: true }
        },
      })
    } else {
      /**
       * Allow premature exit of animation
       * on a second click if we're currently animating
       */
      clearTimeout(timeoutRef.current)
      opacity.start(0)
      y.start(0)
      isAnimating.current = false
    }
  }

  React.useEffect(() => () => clearTimeout(timeoutRef.current), [])

  return (
    <DockContainer>
      <DockButton
        ref={cardRef}
        onClick={handleClick}
        style={{
          width: size,
          height: size,
          y,
        }}>
        {children}
      </DockButton>
      <DockDot style={{ opacity }} />
    </DockContainer>
  )
}
