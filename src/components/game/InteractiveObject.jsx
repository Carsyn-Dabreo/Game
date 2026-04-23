import React, { useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { Box, Text } from '@react-three/drei'
import { useGameStore } from '../../stores/gameStore'
import * as THREE from 'three'

export default function InteractiveObject({ position, size, challenge, onInteract }) {
  const meshRef = useRef()
  const [hovered, setHovered] = useState(false)
  const [distance, setDistance] = useState(Infinity)
  const { playerPosition, setCurrentChallenge } = useGameStore()

  useFrame(() => {
    if (meshRef.current) {
      // Calculate distance to player
      const meshPosition = new THREE.Vector3(...position)
      const playerPos = new THREE.Vector3(...playerPosition)
      const dist = meshPosition.distanceTo(playerPos)
      setDistance(dist)

      // Floating animation
      meshRef.current.position.y = position[1] + Math.sin(Date.now() * 0.001) * 0.1
      meshRef.current.rotation.y += 0.01

      // Glow effect when close
      if (dist < 5) {
        meshRef.current.material.emissiveIntensity = 0.3 + Math.sin(Date.now() * 0.003) * 0.2
      } else {
        meshRef.current.material.emissiveIntensity = 0.1
      }
    }
  })

  const handleClick = () => {
    if (distance < 5) {
      setCurrentChallenge(challenge)
      onInteract?.()
    }
  }

  const isNear = distance < 5

  return (
    <group position={position}>
      <Box
        ref={meshRef}
        args={size}
        onClick={handleClick}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
        castShadow
        receiveShadow
      >
        <meshStandardMaterial 
          color="#ff00ff" 
          emissive="#ff00ff" 
          emissiveIntensity={0.1}
          transparent
          opacity={hovered ? 0.8 : 0.6}
        />
      </Box>
      
      {isNear && (
        <Text
          position={[0, size[1] + 1, 0]}
          fontSize={0.5}
          color="#00ffff"
          anchorX="center"
          anchorY="middle"
        >
          Press E to interact
        </Text>
      )}
    </group>
  )
}
