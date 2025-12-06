import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Environment } from '@react-three/drei';
import { EffectComposer, Bloom, Vignette, Noise } from '@react-three/postprocessing';
import { TreeState } from '../types';
import Foliage from './Foliage';
import Ornaments from './Ornaments';
import Star from './Star';

interface SceneProps {
  treeState: TreeState;
}

const Scene: React.FC<SceneProps> = ({ treeState }) => {
  return (
    <Canvas
      dpr={[1, 2]}
      gl={{ antialias: false, toneMappingExposure: 1.5 }}
      shadows
    >
      <PerspectiveCamera makeDefault position={[0, 2, 20]} fov={45} />
      <OrbitControls 
        enablePan={false} 
        minDistance={8} 
        maxDistance={30} 
        autoRotate={treeState === TreeState.TREE_SHAPE}
        autoRotateSpeed={0.5}
        maxPolarAngle={Math.PI / 1.5}
      />

      {/* Lighting - Moody and Cinematic */}
      <ambientLight intensity={0.2} color="#001a10" />
      <spotLight 
        position={[10, 20, 10]} 
        angle={0.3} 
        penumbra={1} 
        intensity={2} 
        color="#fff0d0" 
        castShadow 
      />
      <pointLight position={[-10, 5, -10]} intensity={1} color="#00ff88" distance={20} />
      <pointLight position={[5, -5, 5]} intensity={1} color="#ffaa00" distance={20} />

      {/* Environment Reflections */}
      <Environment preset="city" environmentIntensity={0.5} />

      {/* Content */}
      <Suspense fallback={null}>
        <group position={[0, -4, 0]}>
           <Foliage treeState={treeState} />
           <Ornaments treeState={treeState} />
           <Star treeState={treeState} />
        </group>
      </Suspense>

      {/* Post Processing */}
      <EffectComposer disableNormalPass>
        <Bloom 
          luminanceThreshold={0.6} 
          mipmapBlur 
          intensity={1.2} 
          radius={0.6}
        />
        <Vignette eskil={false} offset={0.1} darkness={0.6} />
        <Noise opacity={0.02} />
      </EffectComposer>
      
      {/* Background fill */}
      <color attach="background" args={['#000500']} />
      <fog attach="fog" args={['#000500', 10, 40]} />
    </Canvas>
  );
};

export default Scene;