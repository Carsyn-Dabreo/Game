import React, { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Box, Cylinder } from '@react-three/drei'
import * as THREE from 'three'

export default function Vehicle({ position, color = "#ff4444", type = "car" }) {
  const groupRef = useRef()
  
  useFrame((state) => {
    if (groupRef.current) {
      // Simple movement animation
      groupRef.current.position.x = position[0] + Math.sin(state.clock.elapsedTime * 0.3) * 5
      groupRef.current.rotation.y = Math.cos(state.clock.elapsedTime * 0.3) * 0.1
    }
  })

  if (type === "car") {
    return (
      <group ref={groupRef} position={position}>
        {/* Car body */}
        <Box args={[2, 0.8, 4]} position={[0, 0.4, 0]} castShadow receiveShadow>
          <meshStandardMaterial color={color} metalness={0.8} roughness={0.2} />
        </Box>
        
        {/* Car roof */}
        <Box args={[1.5, 0.6, 2]} position={[0, 1, 0]} castShadow>
          <meshStandardMaterial color={color} metalness={0.8} roughness={0.2} />
        </Box>
        
        {/* Wheels */}
        <Cylinder args={[0.3, 0.3, 0.2]} position={[0.8, 0.3, 1.2]} rotation={[Math.PI/2, 0, 0]}>
          <meshStandardMaterial color="#333" />
        </Cylinder>
        <Cylinder args={[0.3, 0.3, 0.2]} position={[-0.8, 0.3, 1.2]} rotation={[Math.PI/2, 0, 0]}>
          <meshStandardMaterial color="#333" />
        </Cylinder>
        <Cylinder args={[0.3, 0.3, 0.2]} position={[0.8, 0.3, -1.2]} rotation={[Math.PI/2, 0, 0]}>
          <meshStandardMaterial color="#333" />
        </Cylinder>
        <Cylinder args={[0.3, 0.3, 0.2]} position={[-0.8, 0.3, -1.2]} rotation={[Math.PI/2, 0, 0]}>
          <meshStandardMaterial color="#333" />
        </Cylinder>
        
        {/* Headlights */}
        <Box args={[0.3, 0.2, 0.1]} position={[0.6, 0.6, 2]}>
          <meshStandardMaterial color="#ffff00" emissive="#ffff00" emissiveIntensity={0.5} />
        </Box>
        <Box args={[0.3, 0.2, 0.1]} position={[-0.6, 0.6, 2]}>
          <meshStandardMaterial color="#ffff00" emissive="#ffff00" emissiveIntensity={0.5} />
        </Box>
      </group>
    )
  }
  
  return null
}
