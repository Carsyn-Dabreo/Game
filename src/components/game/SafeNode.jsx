import React, { useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { Box, Cylinder, Sphere } from '@react-three/drei'
import { useGameStore } from '../../stores/gameStore'
import * as THREE from 'three'

export default function SafeNode({ position, onInteract }) {
  const meshRef = useRef()
  const [hovered, setHovered] = useState(false)
  const [distance, setDistance] = useState(Infinity)
  const { playerPosition, setCurrentChallenge } = useGameStore()

  const challenge = {
    title: "Safe Terminal",
    type: "System Recovery",
    description: "Access the secure terminal to restore system integrity.",
    content: "Which encryption standard is most secure?\nA) AES-256\nB) DES\nC) MD5\nD) SHA-1",
    answer: "A"
  }

  useFrame(() => {
    if (meshRef.current && playerPosition) {
      const playerPos = new THREE.Vector3(...playerPosition)
      const nodePos = new THREE.Vector3(...position)
      const dist = playerPos.distanceTo(nodePos)
      setDistance(dist)

      // Gentle pulsing green glow
      const scale = 1 + Math.sin(Date.now() * 0.002) * 0.05
      meshRef.current.scale.setScalar(scale)
      
      // Slow rotation
      meshRef.current.rotation.y += 0.005

      // Check for interaction
      if (dist < 3 && !hovered) {
        setHovered(true)
        document.body.style.cursor = 'pointer'
      } else if (dist >= 3 && hovered) {
        setHovered(false)
        document.body.style.cursor = 'default'
      }
    }
  })

  const handleClick = () => {
    if (distance < 3) {
      setCurrentChallenge(challenge)
    }
  }

  return (
    <group position={position} onClick={handleClick}>
      {/* Terminal base */}
      <Cylinder ref={meshRef} args={[0.8, 1, 0.3]} position={[0, 0.15, 0]}>
        <meshStandardMaterial 
          color="#003366" 
          metalness={0.7}
          roughness={0.3}
        />
      </Cylinder>

      {/* Terminal screen */}
      <Box args={[1.2, 0.8, 0.1]} position={[0, 0.8, 0]}>
        <meshStandardMaterial 
          color="#001122" 
          emissive="#00ff00" 
          emissiveIntensity={hovered ? 0.3 : 0.1}
          metalness={0.9}
          roughness={0.1}
        />
      </Box>

      {/* Glowing core */}
      <Sphere args={[0.3]} position={[0, 0.8, 0.2]}>
        <meshStandardMaterial 
          color="#00ff00" 
          emissive="#00ff00" 
          emissiveIntensity={hovered ? 1.0 : 0.6}
          transparent 
          opacity={0.8}
        />
      </Sphere>

      {/* Energy rings */}
      {Array.from({ length: 3 }).map((_, i) => (
        <mesh 
          key={i} 
          position={[0, 0.8, 0]} 
          rotation={[0, (i / 3) * Math.PI, 0]}
        >
          <torusGeometry args={[0.6 + i * 0.2, 0.05, 8, 16]} />
          <meshStandardMaterial 
            color="#00ffaa" 
            emissive="#00ff00" 
            emissiveIntensity={0.4}
            transparent 
            opacity={0.6}
          />
        </mesh>
      ))}

      {/* Interaction prompt */}
      {distance < 3 && (
        <Box args={[2, 0.5, 0.1]} position={[0, 2, 0]}>
          <meshBasicMaterial color="#00ff00" transparent opacity={0.8} />
        </Box>
      )}
    </group>
  )
}
