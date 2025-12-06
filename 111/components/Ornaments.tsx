import React, { useMemo, useRef, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { CONFIG, COLORS } from '../constants';
import { TreeState } from '../types';

// Helper to generate positions
const generateOrnamentData = (count: number, type: 'SPHERE' | 'BOX') => {
  const data = [];
  for (let i = 0; i < count; i++) {
    // Tree Position (Surface of cone mostly)
    const hRel = Math.random();
    const y = hRel * CONFIG.TREE_HEIGHT;
    const rBase = (1 - hRel) * CONFIG.TREE_RADIUS_BASE;
    // Push slightly inside or outside
    const r = rBase * (0.8 + Math.random() * 0.4); 
    const theta = Math.random() * Math.PI * 2;

    const tx = r * Math.cos(theta);
    const ty = y;
    const tz = r * Math.sin(theta);

    // Scatter Position (Sphere)
    const u = Math.random();
    const v = Math.random();
    const phi = Math.acos(2 * v - 1);
    const randTheta = 2 * Math.PI * u;
    const randR = CONFIG.SCATTER_RADIUS * (0.5 + Math.random() * 0.5); // Outer shell of scatter

    const sx = randR * Math.sin(phi) * Math.cos(randTheta);
    const sy = randR * Math.sin(phi) * Math.sin(randTheta) + 6;
    const sz = randR * Math.cos(phi);

    data.push({
      treePos: new THREE.Vector3(tx, ty, tz),
      scatterPos: new THREE.Vector3(sx, sy, sz),
      rotation: new THREE.Euler(Math.random() * Math.PI, Math.random() * Math.PI, 0),
      scale: Math.random() * 0.5 + 0.3,
      speed: Math.random() * 0.5 + 0.5
    });
  }
  return data;
};

interface OrnamentGroupProps {
  treeState: TreeState;
  geometry: THREE.BufferGeometry;
  material: THREE.Material;
  data: ReturnType<typeof generateOrnamentData>;
}

const OrnamentGroup: React.FC<OrnamentGroupProps> = ({ treeState, geometry, material, data }) => {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  
  // Current animation progress (0 to 1)
  const progress = useRef(treeState === TreeState.TREE_SHAPE ? 1 : 0);
  
  // Store current positions to avoid recalculating from zero every frame, 
  // though simple lerp from A to B is easier and robust.
  
  useFrame((state, delta) => {
    if (!meshRef.current) return;

    const target = treeState === TreeState.TREE_SHAPE ? 1 : 0;
    // Lerp progress
    const speed = CONFIG.ANIMATION_SPEED * delta;
    if (Math.abs(target - progress.current) > 0.001) {
        progress.current = THREE.MathUtils.lerp(progress.current, target, speed);
    } else {
        progress.current = target;
    }
    
    const t = progress.current;
    // Ease the transition for position
    const easeT = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t; // EaseInOutQuad

    const time = state.clock.elapsedTime;

    data.forEach((item, i) => {
        // Interpolate position
        dummy.position.lerpVectors(item.scatterPos, item.treePos, easeT);
        
        // Add floating noise based on state
        // When scattered (t=0), float more. When tree (t=1), subtle breathe.
        const floatIntensity = (1.0 - t) * 0.5 + 0.05;
        dummy.position.y += Math.sin(time * item.speed + i) * floatIntensity * 0.1;
        
        dummy.rotation.copy(item.rotation);
        // Rotate slowly
        dummy.rotation.y += time * 0.2 * (1 - t); 
        dummy.rotation.x += time * 0.1 * (1 - t);

        dummy.scale.setScalar(item.scale * (t > 0.1 ? 1 : Math.max(0.5, 1 - t))); // Slight scale down on scatter

        dummy.updateMatrix();
        meshRef.current!.setMatrixAt(i, dummy.matrix);
    });
    
    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh
      ref={meshRef}
      args={[geometry, material, data.length]}
      castShadow
      receiveShadow
    />
  );
};

const Ornaments: React.FC<{ treeState: TreeState }> = ({ treeState }) => {
  // 1. Gold Spheres (Baubles)
  const sphereGeo = useMemo(() => new THREE.SphereGeometry(0.5, 32, 32), []);
  const goldMat = useMemo(() => new THREE.MeshPhysicalMaterial({
    color: COLORS.GOLD_METALLIC,
    metalness: 1,
    roughness: 0.15,
    clearcoat: 1,
    clearcoatRoughness: 0.1,
    emissive: COLORS.GOLD_WARM,
    emissiveIntensity: 0.2
  }), []);
  const sphereData = useMemo(() => generateOrnamentData(250, 'SPHERE'), []);

  // 2. Red Gift Boxes
  const boxGeo = useMemo(() => new THREE.BoxGeometry(0.8, 0.8, 0.8), []);
  const redMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: COLORS.RED_VELVET,
    roughness: 0.4,
    metalness: 0.2,
  }), []);
  const boxData = useMemo(() => generateOrnamentData(100, 'BOX'), []);
  
  // 3. Glowing Lights (Small Spheres)
  const lightGeo = useMemo(() => new THREE.SphereGeometry(0.15, 16, 16), []);
  const lightMat = useMemo(() => new THREE.MeshBasicMaterial({
    color: COLORS.LIGHT_WARM,
    toneMapped: false // Super bright for bloom
  }), []);
  const lightData = useMemo(() => generateOrnamentData(CONFIG.LIGHT_COUNT, 'SPHERE'), []);

  return (
    <group>
      <OrnamentGroup 
        treeState={treeState} 
        geometry={sphereGeo} 
        material={goldMat} 
        data={sphereData} 
      />
      <OrnamentGroup 
        treeState={treeState} 
        geometry={boxGeo} 
        material={redMat} 
        data={boxData} 
      />
      <OrnamentGroup 
        treeState={treeState} 
        geometry={lightGeo} 
        material={lightMat} 
        data={lightData} 
      />
    </group>
  );
};

export default Ornaments;