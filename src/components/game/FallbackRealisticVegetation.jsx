import React, { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Cone, Cylinder, Sphere } from '@react-three/drei'

export default function FallbackRealisticVegetation() {
  const groupRef = useRef()
  
  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = state.clock.elapsedTime * 0.02
    }
  })

  return (
    <group ref={groupRef}>
      {/* Dead trees */}
      {Array.from({ length: 8 }).map((_, i) => (
        <group 
          key={`tree-${i}`}
          position={[
            (Math.random() - 0.5) * 40,
            0,
            (Math.random() - 0.5) * 40
          ]}
        >
          {/* Trunk */}
          <Cylinder args={[0.3, 0.5, 6]} position={[0, 3, 0]} castShadow>
            <meshStandardMaterial 
              color="#3a2a1a" 
              roughness={0.95}
            />
          </Cylinder>
          
          {/* Broken branches */}
          <Cylinder 
            args={[0.1, 0.15, 3]} 
            position={[1, 5, 0]} 
            rotation={[0, 0, -Math.PI/3]} 
            castShadow
          >
            <meshStandardMaterial 
              color="#2a1a1a" 
              roughness={0.95}
            />
          </Cylinder>
          
          <Cylinder 
            args={[0.08, 0.12, 2.5]} 
            position={[-0.8, 4.5, 0.5]} 
            rotation={[0.2, 0, Math.PI/4]} 
            castShadow
          >
            <meshStandardMaterial 
              color="#2a1a1a" 
              roughness={0.95}
            />
          </Cylinder>
        </group>
      ))}

      {/* Overgrown grass patches */}
      {Array.from({ length: 20 }).map((_, i) => (
        <Cone 
          key={`grass-${i}`}
          args={[0.5, 1, 4]} 
          position={[
            (Math.random() - 0.5) * 50,
            0.5,
            (Math.random() - 0.5) * 50
          ]}
          castShadow
        >
          <meshStandardMaterial 
            color="#2a3a2a" 
            roughness={0.95}
          />
        </Cone>
      ))}

      {/* Vines on buildings */}
      {Array.from({ length: 12 }).map((_, i) => (
        <Cylinder 
          key={`vine-${i}`}
          args={[0.05, 0.05, 4]} 
          position={[
            (Math.random() - 0.5) * 30,
            2 + Math.random() * 4,
            (Math.random() - 0.5) * 30
          ]}
          rotation={[
            Math.random() * 0.3,
            Math.random() * Math.PI,
            Math.random() * 0.3
          ]}
        >
          <meshStandardMaterial 
            color="#1a2a1a" 
            roughness={0.9}
          />
        </Cylinder>
      ))}
    </group>
  )
}
