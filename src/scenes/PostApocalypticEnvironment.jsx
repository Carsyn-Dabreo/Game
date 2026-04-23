import React, { useMemo } from 'react'
import { Box, Plane, Sphere } from '@react-three/drei'
import RuinedBuilding from '../components/game/RuinedBuilding'
import PostApocalypticTree from '../components/game/PostApocalypticTree'
import ThreatNode from '../components/game/ThreatNode'
import SafeNode from '../components/game/SafeNode'

export default function PostApocalypticEnvironment() {
  // Ruined buildings
  const buildings = useMemo(() => [
    { position: [-8, 0, -8], size: [4, 8, 4], rotation: [0, Math.PI/4, 0] },
    { position: [8, 0, -8], size: [3, 6, 3], rotation: [0, -Math.PI/6, 0] },
    { position: [-10, 0, 5], size: [5, 10, 5], rotation: [0, Math.PI/3, 0] },
    { position: [10, 0, 5], size: [3.5, 7, 3.5], rotation: [0, -Math.PI/4, 0] },
    { position: [0, 0, -12], size: [6, 12, 6], rotation: [0, 0, 0] },
  ], [])

  // Trees
  const trees = useMemo(() => [
    { position: [-5, 0, -5], height: 3.5, type: 'dead' },
    { position: [5, 0, -5], height: 4.5, type: 'overgrown' },
    { position: [-8, 0, 2], height: 3, type: 'dead' },
    { position: [8, 0, 2], height: 5, type: 'overgrown' },
    { position: [0, 0, 8], height: 4, type: 'dead' },
    { position: [-3, 0, 8], height: 3.5, type: 'overgrown' },
    { position: [3, 0, 8], height: 4.5, type: 'dead' },
    { position: [-12, 0, -2], height: 3, type: 'overgrown' },
    { position: [12, 0, -2], height: 5.5, type: 'dead' },
  ], [])

  // Threat nodes
  const threatNodes = useMemo(() => [
    { position: [-6, 1.5, -6] },
    { position: [6, 1.5, -6] },
    { position: [0, 1.5, 0] },
  ], [])

  // Safe nodes
  const safeNodes = useMemo(() => [
    { position: [-8, 1.5, 8] },
    { position: [8, 1.5, 8] },
    { position: [0, 1.5, -10] },
  ], [])

  // Ground debris
  const debris = useMemo(() => [
    { position: [-2, 0.1, -2], size: [1, 0.2, 1] },
    { position: [3, 0.05, 3], size: [0.8, 0.1, 0.8] },
    { position: [-4, 0.08, 4], size: [1.2, 0.15, 1.2] },
    { position: [2, 0.06, -4], size: [0.6, 0.12, 0.6] },
    { position: [-6, 0.1, 6], size: [0.9, 0.2, 0.9] },
  ], [])

  return (
    <>
      {/* Ground */}
      <Plane args={[100, 100]} rotation={[-Math.PI/2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <meshStandardMaterial 
          color="#1a1a1a" 
          roughness={0.95}
          metalness={0.0}
        />
      </Plane>

      {/* Grass patches */}
      {Array.from({ length: 30 }).map((_, i) => (
        <Plane 
          key={i}
          args={[Math.random() * 2 + 1, Math.random() * 2 + 1]} 
          rotation={[-Math.PI/2, Math.random() * Math.PI, 0]} 
          position={[
            (Math.random() - 0.5) * 40,
            0.01,
            (Math.random() - 0.5) * 40
          ]}
        >
          <meshStandardMaterial 
            color="#1a2a1a" 
            roughness={0.95}
            transparent 
            opacity={0.8}
          />
        </Plane>
      ))}

      {/* Ruined buildings */}
      {buildings.map((building, i) => (
        <RuinedBuilding key={i} {...building} />
      ))}

      {/* Trees */}
      {trees.map((tree, i) => (
        <PostApocalypticTree key={i} {...tree} />
      ))}

      {/* Threat nodes */}
      {threatNodes.map((node, i) => (
        <ThreatNode key={i} {...node} />
      ))}

      {/* Safe nodes */}
      {safeNodes.map((node, i) => (
        <SafeNode key={i} {...node} />
      ))}

      {/* Ground debris */}
      {debris.map((item, i) => (
        <Box key={i} {...item} castShadow>
          <meshStandardMaterial 
            color="#2a2a2a" 
            roughness={0.9}
          />
        </Box>
      ))}

      {/* Floating particles (dust/pollen) */}
      {Array.from({ length: 20 }).map((_, i) => (
        <Sphere 
          key={i} 
          args={[0.02]} 
          position={[
            (Math.random() - 0.5) * 30,
            Math.random() * 5 + 1,
            (Math.random() - 0.5) * 30
          ]}
        >
          <meshStandardMaterial 
            color="#3a3a3a" 
            transparent 
            opacity={0.6}
          />
        </Sphere>
      ))}

      {/* Broken tech pieces */}
      {Array.from({ length: 8 }).map((_, i) => (
        <Box 
          key={i}
          args={[Math.random() * 0.5 + 0.2, Math.random() * 0.3 + 0.1, Math.random() * 0.5 + 0.2]} 
          position={[
            (Math.random() - 0.5) * 30,
            0.1,
            (Math.random() - 0.5) * 30
          ]}
          rotation={[
            Math.random() * Math.PI,
            Math.random() * Math.PI,
            Math.random() * Math.PI
          ]}
          castShadow
        >
          <meshStandardMaterial 
            color="#1a2a3a" 
            roughness={0.7}
            metalness={0.3}
            emissive="#003366"
            emissiveIntensity={0.1}
          />
        </Box>
      ))}
    </>
  )
}
