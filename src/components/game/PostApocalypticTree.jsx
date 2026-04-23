import React, { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Cone, Cylinder, Sphere } from '@react-three/drei'

export default function PostApocalypticTree({ position, height = 4, type = 'dead' }) {
  const groupRef = useRef()

  useFrame((state) => {
    if (groupRef.current) {
      // Gentle swaying animation
      groupRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 0.5 + position[0]) * 0.02
    }
  })

  if (type === 'dead') {
    return (
      <group ref={groupRef} position={position}>
        {/* Trunk */}
        <Cylinder args={[0.2, 0.3, height]} position={[0, height/2, 0]} castShadow>
          <meshStandardMaterial 
            color="#3a2a1a" 
            roughness={0.9}
            metalness={0.0}
          />
        </Cylinder>

        {/* Dead branches */}
        <Cylinder args={[0.05, 0.08, height * 0.6]} 
                   position={[0.5, height * 0.8, 0]} 
                   rotation={[0, 0, -Math.PI/4]} castShadow>
          <meshStandardMaterial 
            color="#2a1a1a" 
            roughness={0.95}
          />
        </Cylinder>

        <Cylinder args={[0.04, 0.07, height * 0.5]} 
                   position={[-0.4, height * 0.7, 0.2]} 
                   rotation={[0.2, 0, Math.PI/3]} castShadow>
          <meshStandardMaterial 
            color="#2a1a1a" 
            roughness={0.95}
          />
        </Cylinder>

        <Cylinder args={[0.03, 0.06, height * 0.4]} 
                   position={[0.3, height * 0.6, -0.3]} 
                   rotation={[-0.3, 0.2, -Math.PI/6]} castShadow>
          <meshStandardMaterial 
            color="#2a1a1a" 
            roughness={0.95}
          />
        </Cylinder>
      </group>
    )
  }

  // Overgrown tree
  return (
    <group ref={groupRef} position={position}>
      {/* Trunk */}
      <Cylinder args={[0.3, 0.4, height]} position={[0, height/2, 0]} castShadow>
        <meshStandardMaterial 
          color="#2a1a1a" 
          roughness={0.9}
        />
      </Cylinder>

      {/* Foliage */}
      <Cone args={[height * 0.4, height * 0.6]} position={[0, height + 0.3, 0]} castShadow>
        <meshStandardMaterial 
          color="#1a3a1a" 
          roughness={0.95}
        />
      </Cone>

      <Cone args={[height * 0.3, height * 0.5]} 
            position={[height * 0.2, height + 0.2, height * 0.1]} 
            rotation={[0.1, 0, 0]} castShadow>
        <meshStandardMaterial 
          color="#1a3a1a" 
          roughness={0.95}
        />
      </Cone>

      {/* Vines */}
      <Cylinder args={[0.02, 0.02, height * 0.8]} 
                position={[0.35, height * 0.4, 0]} 
                rotation={[0.1, 0, Math.PI/8]}>
        <meshStandardMaterial 
          color="#1a2a1a" 
          roughness={0.9}
        />
      </Cylinder>
    </group>
  )
}
