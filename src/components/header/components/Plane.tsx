
import {
  RepeatWrapping,
  CanvasTexture,
  Texture,
  Vector2,
  Vector3,
  SRGBColorSpace,
  ACESFilmicToneMapping,
  PMREMGenerator,
  Color,
  Mesh,
  BufferGeometry,
  NormalBufferAttributes,
  Material,
  MathUtils,
  Camera
} from 'three';
import { useRef, useState, useMemo, useEffect } from 'react';
import { Canvas, useFrame, extend, useThree } from '@react-three/fiber';
import { useTexture } from '@react-three/drei';
import { FlakesTexture } from 'three/examples/jsm/textures/FlakesTexture';
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader';


import nebulaFile from './particles.jpg';
// import { fragmentShader } from './fragmentShader';
// import { vertexShader } from './vertexShader';

// const MovingPlane = () => {
//   // This reference will give us direct access to the mesh
//   const mesh = useRef<Mesh<BufferGeometry<NormalBufferAttributes>, Material | Material[]>>();

//   const uniforms = useMemo(
//     () => ({
//       u_time: {
//         value: 0.0,
//       },
//       u_colorA: { value: new Color("#FFE486") },
//       u_colorB: { value: new Color("#FEB3D9") },
//     }), []
//   );

//   useFrame((state) => {
//     const { clock } = state;
//     if (mesh.current) {
//       console.log('mesh.current.material', mesh.current.material);
//       mesh.current.material.uniforms.u_time.value = clock.getElapsedTime();
//     }
//   });

//   return (
//     <mesh ref={mesh} position={[0, 0, 0]}  scale={1.5}>
//       <planeGeometry args={[1, 1, 30, 30]} />
//       <shaderMaterial
//         fragmentShader={fragmentShader}
//         vertexShader={vertexShader}
//         uniforms={uniforms}
//         wireframe={false}
//       />
//     </mesh>
//   );
// };

const vertexShader = `
  uniform float time;
  varying vec2 vUv;
  void main() {
    vUv = uv;
    vec3 pos = position;
    float dist = distance(vUv, vec2(0.5));
    pos.z += sin(dist * 10.0 - time * 3.0) * 5.0;
    gl_Position = projectionMatrix * modelViewMatrix * vec4( pos, 1.0 );
  }
`;

const fragmentShader = `
  uniform float time;
  uniform sampler2D textureFile;
  varying vec2 vUv;

  void main() {
    vec2 uv = vUv;
    vec4 textureColor = texture2D(textureFile, uv);

    // Define the number of lines and the thickness of each line
    float numLinesX = 80.0;
    float numLinesY = 80.0;
    float lineThickness = 0.4;

    // Calculate the size of each grid cell
    vec2 cellSize = vec2(1.0 / numLinesX, 1.0 / numLinesY);

    // Calculate the UV coordinates within the current cell
    vec2 cellUV = fract(uv / cellSize);

    // Calculate the distance to the nearest grid line
    float distToLine = min(cellUV.x, cellUV.y);

    // Create the transparency mask for the grid lines
    float lineTransparency = step(lineThickness, distToLine);

    // Apply transparency to the texture color
    vec4 finalColor = vec4(textureColor.rgb, 1.0 - lineTransparency);

    gl_FragColor = finalColor;
  }
`;

function screenToWorld(screenX: number, screenY: number, camera: Camera) {
  // convert the 2D screen position to normalized device coordinates (NDC)
  let x = (screenX / window.innerWidth) * 2 - 1;
  let y = -(screenY / window.innerHeight) * 2 + 1;

  let vector = new Vector3(x, y, 0.5);  // z = 0.5 puts the location in the middle of the camera's frustum

  // unproject the NDC coordinates to world coordinates
  vector.unproject(camera);

  return vector;
}

// Linear interpolation (lerp) function
function lerp(start: number, end: number, amt: number) {
  return (1 - amt) * start + amt * end;
}

// Clamp function
function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

export function Plane(props: JSX.IntrinsicElements['mesh']) {
  // This reference will give us direct access to the THREE.Mesh object
  const ref = useRef<THREE.Mesh>(null!)
  const { gl, camera } = useThree();
  const [normalMap, setNormalMap] = useState<CanvasTexture | null>(null);
  const [texture, setTexture] = useState<Texture | null>(null);
  gl.outputColorSpace = SRGBColorSpace;
  gl.toneMapping = ACESFilmicToneMapping;
  gl.toneMappingExposure = 1;
  const envmapLoader = new PMREMGenerator(gl);
  // useEffect(() => {
  //   new RGBELoader().load(nebula, (texture) => {
  //     const { texture: envMap } = envmapLoader.fromEquirectangular(texture)
  //     const flakesTexture = new CanvasTexture(new FlakesTexture());
  //     flakesTexture.wrapS = flakesTexture.wrapT = RepeatWrapping
  //     flakesTexture.repeat.set(10, 6);
  //     setNormalMap(flakesTexture);
  //     setTexture(envMap);
  //     console.log('setting');
  //     // gl.copyTextureToTexture(new Vector2(0, 0), snakeTexture, texture);
  //   });
  // }, [])
  
  const nebula = useTexture(nebulaFile);
  const snakeTexture = useTexture(nebulaFile);
  snakeTexture.wrapS = snakeTexture.wrapT = RepeatWrapping;
  const geometrySize = [30, 30]; // The size of the planeGeometry
  const repeatFactor = [1, 1]; // The number of times to repeat the texture
  snakeTexture.repeat.set(repeatFactor[0] / geometrySize[0], repeatFactor[1] / geometrySize[1]);

  // Interpolation factor, adjust this value to control the easing speed

  // Keep track of the current and target mouse values
  // Rotate mesh every frame, this is outside of React without overhead
  // useFrame((state, delta) => (ref.current.rotation.x += delta));
  
  const uniforms = {
    time: { value: 0 },
    textureFile: { value: snakeTexture },
  };

  useFrame((state, delta) => {
    // Update time uniform for animation
    // uniforms.time.value += state.clock.getDelta();
    // Update time uniform for animation
    
    if (ref.current) {
      ref.current.material.uniforms.time.value += delta * 0.5;
    }
  });

  console.log({
    x: screenToWorld(0, 0, camera),
    x_: screenToWorld(window.innerWidth, 0, camera)
  })

  return (
    <mesh
      {...props}
      // scale={[2, 2, 1]}
      position={[0,0,-102]}
      ref={ref}>
      {/* <MovingPlane /> */}
      {/* <planeGeometry args={[30, 30, 50, 50]} /> */}
      <planeGeometry attach="geometry" args={[16 * 25, 9 * 25, 100, 100]} />
      <shaderMaterial
        fragmentShader={fragmentShader}
        vertexShader={vertexShader}
        uniforms={uniforms}
        wireframe={true}
      />
      {/* <meshPhysicalMaterial
        metalness={0.9}
        clearcoatRoughness={0.1}
        clearcoat={1}
        normalScale={new Vector2(0.15, 0.15)}
        normalMap={normalMap}
        envMap={texture}
        roughness={0.5}
        color={0x9418ca} /> */}
      
    </mesh>
  )
}
