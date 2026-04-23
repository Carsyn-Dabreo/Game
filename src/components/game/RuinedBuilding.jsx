import React from 'react'
import { Box, Plane } from '@react-three/drei'

export default function RuinedBuilding({ position, size, rotation = [0, 0, 0] }) {
  return (
    <group position={position} rotation={rotation}>
      {/* Main structure */}
      <Box args={size} position={[0, size[1]/2, 0]} castShadow receiveShadow>
        <meshStandardMaterial 
          color="#2a2a2a" 
          roughness={0.9}
          metalness={0.1}
        />
      </Box>

      {/* Broken sections */}
      <Box args={[size[0] * 0.8, size[1] * 0.3, size[2] * 0.8]} 
           position={[0, size[1] * 0.8, 0]} castShadow>
        <meshStandardMaterial 
          color="#1a1a1a" 
          roughness={0.95}
        />
      </Box>

      {/* Debris */}
      <Box args={[size[0] * 0.2, size[1] * 0.1, size[2] * 0.2]} 
           position={[size[0] * 0.6, 0.05, size[2] * 0.6]} castShadow>
        <meshStandardMaterial 
          color="#333333" 
          roughness={0.8}
        />
      </Box>

      <Box args={[size[0] * 0.15, size[1] * 0.15, size[2] * 0.15]} 
           position={[-size[0] * 0.5, 0.075, -size[2] * 0.4]} castShadow>
        <meshStandardMaterial 
          color="#2a2a2a" 
          roughness={0.85}
        />
      </Box>

      {/* Cracks on walls */}
      <Plane args={[0.02, size[1] * 0.6]} 
             position={[size[0]/2, size[1]/2, 0]} 
             rotation={[0, 0, Math.PI/6]}>
        <meshStandardMaterial 
          color="#000000" 
          transparent 
          opacity={0.7}
        />
      </Plane>

      {/* Overgrown vegetation patches */}
      <Box args={[size[0] * 0.3, 0.1, size[2] * 0.3]} 
           position={[0, 0.05, size[2] * 0.3]}>
        <meshStandardMaterial 
          color="#1a3a1a" 
          roughness={0.95}
        />
      </Box>
    </group>
  )
}
