import styled from '@emotion/styled';
import { Canvas } from '@react-three/fiber';
import Title from './Title';
import ApplyEffects from './Effects';
import Particles from './Particles';
import Socials from './Socials';

const Note = styled.div`
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
  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
  return (<>
      <Canvas
        dpr={window.devicePixelRatio}
        onCreated={({ gl }) => {
          gl.setClearColor(0x000000, 0);
          gl.clearDepth()
          gl.autoClear = false;
        }}
        gl={{ antialias: true, alpha: true }}
        camera={{ fov: 65, position: [0, 0, 30] }}>
        <ApplyEffects>
          <Title />
          <Particles count={isMobile ? 5000 : 10000} />
        </ApplyEffects>
      </Canvas>
      <Note>
        <p>BUILT WITH</p>
        <span>React, R3F, Emotion, TS</span>
      </Note>
      <Socials />
    </>
  )
}

