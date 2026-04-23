import React from 'react'
import { Box, Cylinder } from '@react-three/drei'

export default function FallbackRealisticDebris() {
  return (
    <group>
      {/* Abandoned cars */}
      <group position={[-8, 0, -5]}>
        <Box args={[4, 1.5, 2]} position={[0, 0.75, 0]} castShadow>
          <meshStandardMaterial 
            color="#8B4513" 
            roughness={0.8}
            metalness={0.3}
          />
        </Box>
        {/* Broken windows */}
        <Box args={[0.8, 0.6, 0.1]} position={[1.5, 1, 0.8]}>
          <meshStandardMaterial 
            color="#000000" 
            roughness={0.9}
          />
        </Box>
        {/* Open door */}
        <Box args={[0.1, 1.2, 0.8]} position={[-2, 0.6, 0]} rotation={[0, Math.PI/6, 0]}>
          <meshStandardMaterial 
            color="#654321" 
            roughness={0.8}
          />
        </Box>
      </group>

      <group position={[6, 0, 3]}>
        <Box args={[3.5, 1.5, 2]} position={[0, 0.75, 0]} castShadow>
          <meshStandardMaterial 
            color="#696969" 
            roughness={0.9}
            metalness={0.4}
          />
        </Box>
        {/* Damaged roof */}
        <Box args={[3.5, 0.2, 2]} position={[0, 1.6, 0]} rotation={[0, 0, Math.PI/8]}>
          <meshStandardMaterial 
            color="#4a4a4a" 
            roughness={0.9}
          />
        </Box>
      </group>

      {/* Rubble piles */}
      {Array.from({ length: 6 }).map((_, i) => (
        <group key={`rubble-${i}`} position={[
          (Math.random() - 0.5) * 30,
          0,
          (Math.random() - 0.5) * 30
        ]}>
          <Box args={[1, 0.5, 1]} position={[0, 0.25, 0]} castShadow>
            <meshStandardMaterial 
              color="#696969" 
              roughness={0.95}
            />
          </Box>
          <Box args={[0.8, 0.3, 0.8]} position={[0.5, 0.15, 0.3]} castShadow>
            <meshStandardMaterial 
              color="#808080" 
              roughness={0.9}
            />
          </Box>
          <Box args={[0.6, 0.4, 0.6]} position={[-0.3, 0.2, -0.2]} castShadow>
            <meshStandardMaterial 
              color="#696969" 
              roughness={0.95}
            />
          </Box>
        </group>
      ))}

      {/* Broken poles */}
      <Cylinder 
        args={[0.2, 0.2, 8]} 
        position={[-10, 4, 0]} 
        rotation={[0.3, 0, 0]} 
        castShadow
      >
        <meshStandardMaterial 
          color="#4a4a4a" 
          roughness={0.8}
          metalness={0.5}
        />
      </Cylinder>

      <Cylinder 
        args={[0.15, 0.15, 6]} 
        position={[8, 3, -3]} 
        rotation={[-0.2, Math.PI/6, 0]} 
        castShadow
      >
        <meshStandardMaterial 
          color="#5a5a5a" 
          roughness={0.8}
          metalness={0.4}
        />
      </Cylinder>

      {/* Damaged signs */}
      <group position={[0, 0, -10]}>
        <Cylinder args={[0.1, 0.1, 3]} position={[0, 1.5, 0]} castShadow>
          <meshStandardMaterial 
            color="#696969" 
            roughness={0.8}
            metalness={0.5}
          />
        </Cylinder>
        <Box args={[2, 1, 0.1]} position={[0, 2.5, 0]} rotation={[0, Math.PI/8, 0.1]} castShadow>
          <meshStandardMaterial 
            color="#2a4a2a" 
            roughness={0.9}
          />
        </Box>
      </group>

      <group position={[-6, 0, 5]}>
        <Cylinder args={[0.08, 0.08, 2.5]} position={[0, 1.25, 0]} castShadow>
          <meshStandardMaterial 
            color="#5a5a5a" 
            roughness={0.8}
          />
        </Cylinder>
        <Box args={[1.5, 0.8, 0.08]} position={[0, 2, 0]} rotation={[0, -Math.PI/6, -0.2]} castShadow>
          <meshStandardMaterial 
            color="#3a5a3a" 
            roughness={0.9}
          />
        </Box>
      </group>
    </group>
  )
}
