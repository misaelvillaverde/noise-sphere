import { useMemo, useRef } from "react";

import * as THREE from "three";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";

import { EffectComposer } from "@react-three/postprocessing";

import bigFragment from "./shaders/bigSphere/fragment.glsl";
import bigVertex from "./shaders/bigSphere/vertex.glsl";

import smallFragment from "./shaders/smallSphere/fragment.glsl";
import smallVertex from "./shaders/smallSphere/vertex.glsl";
import { NoiseEffect } from "./components/NoiseEffect";

const BigSphere: React.FC<JSX.IntrinsicElements["mesh"]> = (props) => {
  const ref = useRef() as React.MutableRefObject<THREE.Mesh>;

  const uniforms = useMemo(
    () => ({
      time: { value: 0 },
    }),
    [],
  );

  useFrame((state) => {
    const { clock } = state;
    (ref.current.material as THREE.ShaderMaterial).uniforms.time.value =
      clock.getElapsedTime() * 0.4;
  });

  return (
    <mesh {...props} ref={ref}>
      <sphereGeometry args={[1.7, 32, 32]} />
      <shaderMaterial
        fragmentShader={bigFragment}
        vertexShader={bigVertex}
        uniforms={uniforms}
        side={THREE.BackSide}
      />
    </mesh>
  );
};

const cubeRenderTarget = new THREE.WebGLCubeRenderTarget(256, {
  format: THREE.RGBAFormat,
  generateMipmaps: true,
  minFilter: THREE.LinearMipmapLinearFilter,
});

const SmallSphere: React.FC<JSX.IntrinsicElements["mesh"]> = (props) => {
  const mesh = useRef() as React.MutableRefObject<THREE.Mesh>;
  const cubeCamera = useRef() as React.MutableRefObject<THREE.CubeCamera>;

  const uniforms = useMemo(
    () => ({
      tCube: { value: null },
    }),
    [],
  );

  useFrame((state) => {
    if (mesh.current && cubeCamera.current) {
      // To prevent feedback loop, we hide the mesh that is rendering to the cubeCamera
      mesh.current.visible = false;

      // Update cube camera
      cubeCamera.current.update(state.gl, state.scene);

      mesh.current.visible = true;

      // Update uniforms
      const material = mesh.current.material as THREE.ShaderMaterial;
      material.uniforms.tCube.value = cubeRenderTarget.texture;
    }
  });

  return (
    <mesh {...props} ref={mesh}>
      <sphereGeometry args={[0.3, 32, 32]} />
      <cubeCamera ref={cubeCamera} args={[0.1, 10, cubeRenderTarget]} />
      <shaderMaterial
        fragmentShader={smallFragment}
        vertexShader={smallVertex}
        uniforms={uniforms}
      />
    </mesh>
  );
};

function App() {
  return (
    <div className="h-full">
      <Canvas
        camera={{
          position: [0, 0, 1.3],
          fov: 70,
          near: 0.001,
          far: 1000,
        }}
      >
        <ambientLight intensity={Math.PI / 2} />
        <spotLight
          position={[10, 10, 10]}
          angle={0.15}
          penumbra={1}
          decay={0}
          intensity={Math.PI}
        />
        <pointLight position={[-10, -10, -10]} decay={0} intensity={Math.PI} />
        <BigSphere position={[0, 0, 0]} />
        <SmallSphere position={[0, 0, 0]} />
        <EffectComposer>
          <NoiseEffect amount={0.3} />
        </EffectComposer>
        <OrbitControls />
      </Canvas>
    </div>
  );
}

export default App;
