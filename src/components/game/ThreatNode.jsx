import React, { useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { Box, Sphere } from '@react-three/drei'
import { useGameStore } from '../../stores/gameStore'
import * as THREE from 'three'

export default function ThreatNode({ position, onInteract }) {
  const meshRef = useRef()
  const [hovered, setHovered] = useState(false)
  const [distance, setDistance] = useState(Infinity)
  const { playerPosition, setCurrentChallenge } = useGameStore()

  const challenge = {
    title: "Threat Detected",
    type: "Security Breach",
    description: "A malicious node has been detected. Neutralize the threat.",
    content: "What is the primary defense against malware?\nA) Antivirus software\nB) Firewall\nC) Both A and B\nD) None of the above",
    answer: "C"
  }

  useFrame(() => {
    if (meshRef.current && playerPosition) {
      const playerPos = new THREE.Vector3(...playerPosition)
      const nodePos = new THREE.Vector3(...position)
      const dist = playerPos.distanceTo(nodePos)
      setDistance(dist)

      // Pulsing red glow effect
      const scale = 1 + Math.sin(Date.now() * 0.003) * 0.1
      meshRef.current.scale.setScalar(scale)
      
      // Rotation animation
      meshRef.current.rotation.y += 0.01
      meshRef.current.rotation.x += 0.005

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
      {/* Outer glow */}
      <Sphere ref={meshRef} args={[1.2]}>
        <meshStandardMaterial 
          color="#ff0000" 
          emissive="#ff0000" 
          emissiveIntensity={hovered ? 0.8 : 0.4}
          transparent 
          opacity={0.3}
        />
      </Sphere>
      
      {/* Core */}
      <Box args={[0.8, 0.8, 0.8]}>
        <meshStandardMaterial 
          color="#ff3333" 
          emissive="#ff0000" 
          emissiveIntensity={hovered ? 1.0 : 0.6}
          metalness={0.8}
          roughness={0.2}
        />
      </Box>

      {/* Warning particles */}
      {Array.from({ length: 6 }).map((_, i) => (
        <Sphere 
          key={i} 
          args={[0.1]} 
          position={[
            Math.sin((i / 6) * Math.PI * 2) * 1.5,
            Math.cos((i / 6) * Math.PI * 2) * 0.5,
            Math.cos((i / 6) * Math.PI * 2) * 1.5
          ]}
        >
          <meshStandardMaterial 
            color="#ff6666" 
            emissive="#ff0000" 
            emissiveIntensity={0.8}
          />
        </Sphere>
      ))}

      {/* Interaction prompt */}
      {distance < 3 && (
        <Box args={[2, 0.5, 0.1]} position={[0, 2, 0]}>
          <meshBasicMaterial color="#ff0000" transparent opacity={0.8} />
        </Box>
      )}
    </group>
  )
}
