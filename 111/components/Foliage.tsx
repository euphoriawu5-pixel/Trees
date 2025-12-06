import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { CONFIG, COLORS } from '../constants';
import { TreeState } from '../types';

// Shader code defined inline for portability
const vertexShader = `
  uniform float uTime;
  uniform float uProgress; // 0 = Scatter, 1 = Tree
  uniform float uContainerRadius;
  
  attribute vec3 aScatterPos;
  attribute vec3 aTreePos;
  attribute float aPhase;
  attribute float aSize;
  
  varying float vAlpha;
  varying vec3 vColor;

  // Cubic ease out for smoother motion
  float easeOutCubic(float x) {
    return 1.0 - pow(1.0 - x, 3.0);
  }

  void main() {
    float t = easeOutCubic(uProgress);
    
    // Interpolate position
    vec3 pos = mix(aScatterPos, aTreePos, t);
    
    // Add breathing/wind effect
    // More chaotic in scatter mode, more rhythmic in tree mode
    float breath = sin(uTime * 2.0 + aPhase) * 0.1;
    float wind = cos(uTime * 1.5 + pos.y * 0.5) * 0.15 * (1.0 - t); // Wind mostly in scatter
    
    pos.x += breath + wind;
    pos.z += breath + wind;
    pos.y += sin(uTime * 3.0 + aPhase) * 0.05;

    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
    gl_Position = projectionMatrix * mvPosition;
    
    // Distance attenuation for particle size
    gl_PointSize = aSize * (300.0 / -mvPosition.z);
    
    // Varying opacity based on state
    // In tree mode, we want them solid. In scatter, slight fade.
    vAlpha = 0.6 + 0.4 * t;
    
    // Color mixing in shader for efficiency (Emerald to Gold-tipped)
    vec3 emerald = vec3(0.0, 0.3, 0.2); // Dark Green
    vec3 gold = vec3(1.0, 0.8, 0.4); // Gold light
    
    // Tips of the tree or scattered sparkles get more gold
    float heightFactor = smoothstep(-5.0, 10.0, pos.y);
    float noise = sin(aPhase * 10.0);
    
    vColor = mix(emerald, emerald * 1.5, heightFactor);
    if (noise > 0.8) {
        vColor = mix(vColor, gold, 0.5);
    }
  }
`;

const fragmentShader = `
  varying float vAlpha;
  varying vec3 vColor;
  
  void main() {
    // Circular particle
    vec2 coord = gl_PointCoord - vec2(0.5);
    float r = length(coord);
    if (r > 0.5) discard;
    
    // Soft edge
    float glow = 1.0 - (r * 2.0);
    glow = pow(glow, 1.5);
    
    gl_FragColor = vec4(vColor, vAlpha * glow);
  }
`;

interface FoliageProps {
  treeState: TreeState;
}

const Foliage: React.FC<FoliageProps> = ({ treeState }) => {
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const targetProgress = treeState === TreeState.TREE_SHAPE ? 1.0 : 0.0;
  const currentProgress = useRef(targetProgress);

  const { count, positions, scatterPositions, phases, sizes } = useMemo(() => {
    const count = CONFIG.FOLIAGE_COUNT;
    const positions = new Float32Array(count * 3);
    const scatterPositions = new Float32Array(count * 3);
    const phases = new Float32Array(count);
    const sizes = new Float32Array(count);

    const dummy = new THREE.Vector3();

    for (let i = 0; i < count; i++) {
      // 1. Tree Positions (Cone)
      // Normalized height 0..1
      const hRel = Math.random(); 
      // y from 0 to HEIGHT
      const y = hRel * CONFIG.TREE_HEIGHT; 
      // Radius decreases as height increases
      const r = (1 - hRel) * CONFIG.TREE_RADIUS_BASE; 
      const theta = Math.random() * Math.PI * 2;
      
      // Volumetric filling of cone (not just surface)
      const rVol = r * Math.sqrt(Math.random());
      
      const x = rVol * Math.cos(theta);
      const z = rVol * Math.sin(theta);
      
      positions[i * 3] = x;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = z;

      // 2. Scatter Positions (Sphere)
      const u = Math.random();
      const v = Math.random();
      const phi = Math.acos(2 * v - 1);
      const randomTheta = 2 * Math.PI * u;
      const randomR = CONFIG.SCATTER_RADIUS * Math.cbrt(Math.random());
      
      const sx = randomR * Math.sin(phi) * Math.cos(randomTheta);
      const sy = randomR * Math.sin(phi) * Math.sin(randomTheta) + (CONFIG.TREE_HEIGHT / 2); // Centered height
      const sz = randomR * Math.cos(phi);

      scatterPositions[i * 3] = sx;
      scatterPositions[i * 3 + 1] = sy;
      scatterPositions[i * 3 + 2] = sz;

      // Attributes
      phases[i] = Math.random() * Math.PI * 2;
      sizes[i] = Math.random() * 0.4 + 0.2; // Size variation
    }

    return { count, positions, scatterPositions, phases, sizes };
  }, []);

  useFrame((state, delta) => {
    if (materialRef.current) {
      // Smooth interpolation for the global transition
      const speed = delta * CONFIG.ANIMATION_SPEED * 0.5; // Slower for particles
      const diff = targetProgress - currentProgress.current;
      
      if (Math.abs(diff) > 0.001) {
          currentProgress.current += diff * speed;
      } else {
          currentProgress.current = targetProgress;
      }

      materialRef.current.uniforms.uTime.value = state.clock.elapsedTime;
      materialRef.current.uniforms.uProgress.value = currentProgress.current;
    }
  });

  return (
    <points>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={positions} // Initial bounding box logic relies on this, though shader overrides
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-aTreePos"
          count={count}
          array={positions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-aScatterPos"
          count={count}
          array={scatterPositions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-aPhase"
          count={count}
          array={phases}
          itemSize={1}
        />
        <bufferAttribute
          attach="attributes-aSize"
          count={count}
          array={sizes}
          itemSize={1}
        />
      </bufferGeometry>
      <shaderMaterial
        ref={materialRef}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={{
          uTime: { value: 0 },
          uProgress: { value: 1 },
          uContainerRadius: { value: CONFIG.SCATTER_RADIUS }
        }}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
};

export default Foliage;