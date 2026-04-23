import React, { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { Box, Text } from '@react-three/drei'
import * as THREE from 'three'

export default function NPC({ position, name, task }) {
  const meshRef = useRef()
  const originalPosition = useMemo(() => new THREE.Vector3(...position), [position])
  
  useFrame((state) => {
    if (meshRef.current) {
      // Simple floating animation
      meshRef.current.position.y = originalPosition.y + Math.sin(state.clock.elapsedTime + originalPosition.x) * 0.1
      meshRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.2
      
      // Make NPC look at player occasionally
      if (Math.random() < 0.01) {
        meshRef.current.rotation.y = Math.atan2(
          state.camera.position.x - meshRef.current.position.x,
          state.camera.position.z - meshRef.current.position.z
        )
      }
    }
  })

  return (
    <group position={position}>
      {/* NPC Body */}
      <Box ref={meshRef} args={[0.8, 1.8, 0.8]} position={[0, 0.9, 0]} castShadow>
        <meshStandardMaterial color="#4a90e2" />
      </Box>
      
      {/* NPC Head */}
      <Box args={[0.5, 0.5, 0.5]} position={[0, 2.2, 0]} castShadow>
        <meshStandardMaterial color="#fdbcb4" />
      </Box>
      
      {/* Name tag */}
      <Text
        position={[0, 2.8, 0]}
        fontSize={0.3}
        color="#00ffff"
        anchorX="center"
        anchorY="middle"
      >
        {name}
      </Text>
      
      {/* Task hint */}
      <Text
        position={[0, 2.5, 0]}
        fontSize={0.2}
        color="#ffff00"
        anchorX="center"
        anchorY="middle"
      >
        Press E to talk
      </Text>
    </group>
  )
}
