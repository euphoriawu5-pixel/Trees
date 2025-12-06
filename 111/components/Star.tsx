import React, { useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { COLORS, CONFIG } from '../constants';
import { TreeState } from '../types';

interface StarProps {
  treeState: TreeState;
}

const Star: React.FC<StarProps> = ({ treeState }) => {
  const meshRef = useRef<THREE.Group>(null);
  const targetY = CONFIG.TREE_HEIGHT + 0.5;
  const scatterPos = useRef(new THREE.Vector3(0, CONFIG.TREE_HEIGHT + 5, 0));
  
  // Initialize scattered slightly off center
  useEffect(() => {
     scatterPos.current.set(
        (Math.random() - 0.5) * 5,
        CONFIG.TREE_HEIGHT + 4 + Math.random() * 2,
        (Math.random() - 0.5) * 5
     );
  }, []);

  useFrame((state, delta) => {
    if (!meshRef.current) return;
    
    const isTree = treeState === TreeState.TREE_SHAPE;
    const targetPos = isTree 
        ? new THREE.Vector3(0, targetY, 0) 
        : scatterPos.current;

    // Smooth movement
    meshRef.current.position.lerp(targetPos, delta * 2);
    
    // Rotate
    meshRef.current.rotation.y += delta * 0.5;
    
    // Pulse scale
    const scale = 1 + Math.sin(state.clock.elapsedTime * 3) * 0.1;
    meshRef.current.scale.setScalar(scale);
  });

  return (
    <group ref={meshRef}>
      {/* Central bright core */}
      <mesh>
        <octahedronGeometry args={[0.8, 0]} />
        <meshBasicMaterial color="#ffffff" toneMapped={false} />
      </mesh>
      {/* Outer Gold Spikes */}
      <mesh rotation={[0, 0, Math.PI / 4]}>
        <octahedronGeometry args={[1.5, 0]} />
        <meshStandardMaterial 
            color={COLORS.GOLD_METALLIC} 
            emissive={COLORS.GOLD_METALLIC}
            emissiveIntensity={0.5}
            metalness={1} 
            roughness={0.2} 
        />
      </mesh>
      {/* Glow Halo (Billboard) */}
      <mesh>
        <planeGeometry args={[6, 6]} />
        <meshBasicMaterial 
            color={COLORS.GOLD_WARM} 
            transparent 
            opacity={0.3} 
            depthWrite={false}
            blending={THREE.AdditiveBlending}
            side={THREE.DoubleSide}
        >
             {/* Simple radial gradient in texture would be better, but we use alpha map logic or lookat camera. 
                 Since we don't have texture assets, we assume Bloom handles the glow. 
                 Using a simple mesh for volume.
             */}
        </meshBasicMaterial>
      </mesh>
    </group>
  );
};

export default Star;