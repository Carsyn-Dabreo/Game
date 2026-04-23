import React from 'react'
import { Plane, Box } from '@react-three/drei'

export default function FallbackRealisticGround() {
  return (
    <group>
      {/* Main ground - asphalt base */}
      <Plane args={[200, 200]} rotation={[-Math.PI/2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <meshStandardMaterial 
          color="#1a1a1a" 
          roughness={0.98}
          metalness={0.02}
        />
      </Plane>

      {/* Main road surface */}
      <Plane args={[16, 200]} rotation={[-Math.PI/2, 0, 0]} position={[0, 0.01, 0]} receiveShadow>
        <meshStandardMaterial 
          color="#2a2a2a" 
          roughness={0.95}
          metalness={0.05}
        />
      </Plane>

      {/* Road markings (faded) */}
      {Array.from({ length: 20 }).map((_, i) => (
        <Plane 
          key={`marking-${i}`}
          args={[0.3, 2]} 
          rotation={[-Math.PI/2, 0, 0]} 
          position={[
            0,
            0.02,
            -100 + i * 10
          ]}
        >
          <meshStandardMaterial 
            color="#4a4a4a" 
            roughness={0.9}
            transparent 
            opacity={0.3}
          />
        </Plane>
      ))}

      {/* Major cracks in road */}
      {Array.from({ length: 15 }).map((_, i) => (
        <Plane 
          key={`crack-${i}`}
          args={[0.15, Math.random() * 8 + 3]} 
          rotation={[-Math.PI/2, 0, Math.random() * Math.PI]} 
          position={[
            (Math.random() - 0.5) * 14,
            0.02,
            (Math.random() - 0.5) * 100
          ]}
        >
          <meshStandardMaterial 
            color="#000000" 
            transparent 
            opacity={0.9}
            roughness={1}
          />
        </Plane>
      ))}

      {/* Potholes */}
      {Array.from({ length: 8 }).map((_, i) => (
        <Box 
          key={`pothole-${i}`}
          args={[Math.random() * 1.5 + 0.8, 0.1, Math.random() * 1.5 + 0.8]} 
          position={[
            (Math.random() - 0.5) * 12,
            -0.05,
            (Math.random() - 0.5) * 80
          ]}
          receiveShadow
        >
          <meshStandardMaterial 
            color="#0a0a0a" 
            roughness={1}
          />
        </Box>
      ))}

      {/* Sidewalks */}
      <Plane args={[4, 200]} rotation={[-Math.PI/2, 0, 0]} position={[10, 0.01, 0]} receiveShadow>
        <meshStandardMaterial 
          color="#3a3a3a" 
          roughness={0.9}
          metalness={0.1}
        />
      </Plane>
      <Plane args={[4, 200]} rotation={[-Math.PI/2, 0, 0]} position={[-10, 0.01, 0]} receiveShadow>
        <meshStandardMaterial 
          color="#3a3a3a" 
          roughness={0.9}
          metalness={0.1}
        />
      </Plane>

      {/* Dirt and overgrown areas */}
      {Array.from({ length: 25 }).map((_, i) => (
        <Plane 
          key={`dirt-${i}`}
          args={[Math.random() * 4 + 2, Math.random() * 4 + 2]} 
          rotation={[-Math.PI/2, Math.random() * Math.PI, 0]} 
          position={[
            (Math.random() - 0.5) * 60,
            0.02,
            (Math.random() - 0.5) * 60
          ]}
        >
          <meshStandardMaterial 
            color="#2a1a0a" 
            roughness={0.98}
            transparent 
            opacity={0.8}
          />
        </Plane>
      ))}

      {/* Puddles with reflection */}
      {Array.from({ length: 12 }).map((_, i) => (
        <Plane 
          key={`puddle-${i}`}
          args={[Math.random() * 2 + 0.5, Math.random() * 2 + 0.5]} 
          rotation={[-Math.PI/2, Math.random() * Math.PI, 0]} 
          position={[
            (Math.random() - 0.5) * 40,
            0.03,
            (Math.random() - 0.5) * 40
          ]}
        >
          <meshStandardMaterial 
            color="#1a2a4a" 
            roughness={0.05}
            metalness={0.9}
            transparent 
            opacity={0.7}
          />
        </Plane>
      ))}

      {/* Oil stains */}
      {Array.from({ length: 10 }).map((_, i) => (
        <Plane 
          key={`oil-${i}`}
          args={[Math.random() * 1.5 + 0.8, Math.random() * 1.5 + 0.8]} 
          rotation={[-Math.PI/2, Math.random() * Math.PI, 0]} 
          position={[
            (Math.random() - 0.5) * 15,
            0.02,
            (Math.random() - 0.5) * 50
          ]}
        >
          <meshStandardMaterial 
            color="#1a1a2a" 
            roughness={0.2}
            metalness={0.7}
            transparent 
            opacity={0.4}
          />
        </Plane>
      ))}

      {/* Scattered debris and trash */}
      {Array.from({ length: 30 }).map((_, i) => (
        <Box 
          key={`debris-${i}`}
          args={[
            Math.random() * 0.3 + 0.1,
            Math.random() * 0.1 + 0.02,
            Math.random() * 0.3 + 0.1
          ]} 
          rotation={[-Math.PI/2, Math.random() * Math.PI, Math.random() * 0.5]} 
          position={[
            (Math.random() - 0.5) * 50,
            0.04 + Math.random() * 0.02,
            (Math.random() - 0.5) * 50
          ]}
          castShadow
          receiveShadow
        >
          <meshStandardMaterial 
            color={i % 3 === 0 ? "#3a3a3a" : i % 3 === 1 ? "#4a3a2a" : "#2a2a3a"}
            roughness={0.8 + Math.random() * 0.2}
            metalness={0.1 + Math.random() * 0.3}
          />
        </Box>
      ))}

      {/* Fallen leaves and vegetation */}
      {Array.from({ length: 20 }).map((_, i) => (
        <Plane 
          key={`leaf-${i}`}
          args={[0.2, 0.3]} 
          rotation={[-Math.PI/2, Math.random() * Math.PI, Math.random() * Math.PI]} 
          position={[
            (Math.random() - 0.5) * 40,
            0.03,
            (Math.random() - 0.5) * 40
          ]}
        >
          <meshStandardMaterial 
            color="#2a3a1a" 
            roughness={0.9}
            transparent 
            opacity={0.8}
          />
        </Plane>
      ))}
    </group>
  )
}
