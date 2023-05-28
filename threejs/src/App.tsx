import * as THREE from 'three';
import { useRef, useState, Suspense, useMemo, useEffect } from 'react'
import { Canvas, useFrame, extend, useThree } from '@react-three/fiber';
import {
  Html,
  Icosahedron,
  useTexture,
  useCubeTexture,
  MeshDistortMaterial
} from "@react-three/drei";
import { EffectComposer, DepthOfField,
  Bloom,
  Noise,
  Vignette } from '@react-three/postprocessing';
import { easing } from 'maath'
import snake from './snake-repeat.jpg';
import { WaterPass } from './waterRippleShader';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass'
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass'
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass'
import OrbitControls from 'three/addons/controls/OrbitControls';
import Particles from './Particles';
import Sparks from './Sparks';
const textureLoader = new THREE.TextureLoader();
const normalTexture = textureLoader.load(snake);
normalTexture.wrapS = normalTexture.wrapT = THREE.RepeatWrapping;

THREE.

const geometrySize = [30, 30]; // The size of the planeGeometry
const repeatFactor = [150, 150]; // The number of times to repeat the texture

normalTexture.repeat.set(repeatFactor[0] / geometrySize[0], repeatFactor[1] / geometrySize[1]);

extend({ WaterPass, ShaderPass, RenderPass, UnrealBloomPass })



function screenToWorld(screenX: number, screenY: number, camera) {
  // convert the 2D screen position to normalized device coordinates (NDC)
  let x = (screenX / window.innerWidth) * 2 - 1;
  let y = -(screenY / window.innerHeight) * 2 + 1;

  let vector = new THREE.Vector3(x, y, 0.5);  // z = 0.5 puts the location in the middle of the camera's frustum

  // unproject the NDC coordinates to world coordinates
  vector.unproject(camera);

  return vector;
}


function Box(props: JSX.IntrinsicElements['mesh']) {
  // This reference will give us direct access to the THREE.Mesh object
  const ref = useRef<THREE.Mesh>(null!)
  // Hold state for hovered and clicked events
  const [hovered, hover] = useState(false)
  const [clicked, click] = useState(false)
  // Rotate mesh every frame, this is outside of React without overhead
  // useFrame((state, delta) => (ref.current.rotation.x += delta));

  return (
    <mesh
      {...props}
      ref={ref}
      scale={clicked ? 1.5 : 1}
      onClick={(event) => click(!clicked)}
      onPointerOver={(event) => hover(true)}
      onPointerOut={(event) => hover(false)}>
        
      <planeGeometry args={geometrySize} />
      <meshStandardMaterial
        metalness={0.7}
        normalMap={normalTexture}
        roughness={0.1}
        color={hovered ? 'hotpink' : 'orange'} />
      
    </mesh>
  )
}

function MainSphere({ material } : {
  material: THREE.Material
}) {
  const main = useRef();
  // main sphere rotates following the mouse position
  useFrame(({ clock, mouse }) => {
    main.current.rotation.z = clock.getElapsedTime();
    main.current.rotation.y = THREE.MathUtils.lerp(
      main.current.rotation.y,
      mouse.x * Math.PI,
      0.1
    );
    main.current.rotation.x = THREE.MathUtils.lerp(
      main.current.rotation.x,
      mouse.y * Math.PI,
      0.1
    );
  });
  return (
    <Icosahedron
      args={[1, 4]}
      ref={main}
      material={material}
      position={[0, 0, 0]}
    />
  );
}

function Instances({ material }: {
  material: THREE.Material
}) {
  // we use this array ref to store the spheres after creating them
  const [sphereRefs] = useState<Array<THREE.Mesh<THREE.BufferGeometry<THREE.NormalBufferAttributes>, THREE.Material | THREE.Material[]>>>(() => []);
  // we use this array to initialize the background spheres
  const initialPositions = [
    [-4, 20, -12],
    [-10, 12, -4],
    [-11, -12, -23],
    [-16, -6, -10],
    [12, -2, -3],
    [13, 4, -12],
    [14, -2, -23],
    [8, 10, -20]
  ];
  // smaller spheres movement
  useFrame(() => {
    // animate each sphere in the array
    sphereRefs.forEach((el) => {
      el.position.y += 0.02;
      if (el.position.y > 19) el.position.y = -18;
      el.rotation.x += 0.06;
      el.rotation.y += 0.06;
      el.rotation.z += 0.02;
    });
  });
  return (
    <>
      {/* <MainSphere material={material} /> */}
      <group position={[0, 1, 0]}>
        <Box material={material} position={[0, 0, 0]} />
      </group>
      {/* {initialPositions.map((pos, i) => (
        <Icosahedron
          args={[1, 4]}
          position={[pos[0], pos[1], pos[2]]}
          material={material}
          key={i}
          ref={(ref) => {
            if (ref !== null) {
              (sphereRefs[i] = ref)
            }
          }}
        />
      ))} */}
    </>
  );
}

function Scene() {
  const bumpMap = useTexture(snake);
  // const envMap = useCubeTexture(
  //   ["px.png", "nx.png", "py.png", "ny.png", "pz.png", "nz.png"],
  //   { path: "/cube/" }
  // );
  // We use `useResource` to be able to delay rendering the spheres until the material is ready
  const [material, set] = useState<THREE.Material>(null!);
  console.log('scene', material);
  return (
    <>
      <MeshDistortMaterial
        ref={set}
        // envMap={envMap}
        bumpMap={bumpMap}
        color={"#010101"}
        roughness={0.1}
        metalness={1}
        bumpScale={0.005}
        clearcoat={1}
        clearcoatRoughness={1}
        radius={1}
        distort={0.4}
      />
      {material && <Instances material={material} />}
    </>
  );
}

function Effects() {
  const composer = useRef()
  const { scene, gl, size, camera } = useThree()
  const aspect = useMemo(() => new THREE.Vector2(512, 512), [])
  useEffect(() => void composer.current.setSize(size.width, size.height), [size])
  useFrame(() => composer.current.render(), 1)
  console.log('camera', camera, scene);
  return (
    <EffectComposer ref={composer} disableNormalPass>
      <Bloom luminanceThreshold={0} mipmapBlur luminanceSmoothing={0.0} intensity={10} />
      <DepthOfField target={[0, 0, 13]} focalLength={0.1} bokehScale={5} height={700} />
    </EffectComposer>
  )
}

function App() {
  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
  const mouse = useRef([0, 0]);
  return (
    <Canvas
      shadows
      gl={{
        powerPreference: "high-performance",
        alpha: false,
        antialias: false,
        stencil: false,
        depth: false
      }}
      dpr={[1, 1.5]}
      camera={{ position: [1, 1, 5.5], fov: 50, near: 1, far: 20 }}
      eventSource={document.getElementById('root') as HTMLElement}
      eventPrefix="client">
      <fog attach="fog" args={['white', 50, 190]} />
      {/* <spotLight position={[10, 20, 10]} angle={0.12} penumbra={1} intensity={1} castShadow shadow-mapSize={256} /> */}
      {/* <group position={[0, 1, 0]}>
        <Box position={[0, 0, 0]} />
      </group> */}
      <Suspense fallback={<Html center>Loading.</Html>}>
        <Scene />
      </Suspense>
      {/* <Particles count={isMobile ? 5000 : 10000} mouse={mouse} /> */}
      {/* <Sparks count={20} mouse={mouse} colors={['#A2CCB6', '#FCEEB5', '#EE786E', '#e0feff', 'lightpink', 'lightblue']} /> */}
      <Effects />
      <CameraRig />
      {/* <EffectComposer ref={composer} disableNormalPass>
        <Bloom luminanceThreshold={0} mipmapBlur luminanceSmoothing={0.0} intensity={10} />
        <DepthOfField target={[0, 0, 13]} focalLength={0.1} bokehScale={5} height={700} />
        <renderPass attachArray="passes" scene={scene} camera={camera} />
        <waterPass attachArray="passes" factor={1.5} />
        <unrealBloomPass attachArray="passes" args={[aspect, 2, 1, 0]} />
      </EffectComposer> */}
    </Canvas>
  )
}

function CameraRig() {
  useFrame((state, delta) => {
    easing.damp3(state.camera.position, [-1 + (state.pointer.x * state.viewport.width) / 50, (1 + (state.pointer.y * state.viewport.height) / 50), 5.5], 0.5, delta)
    state.camera.lookAt(0, 0, 0)
  })
  return null;
}


export default App
