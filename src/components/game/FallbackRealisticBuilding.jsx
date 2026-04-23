import React from 'react'
import { Box, Cylinder, Plane, Sphere } from '@react-three/drei'

export default function FallbackRealisticBuilding({ position, rotation = [0, 0, 0], scale = 1 }) {
  return (
    <group position={position} rotation={rotation} scale={scale}>
      {/* Main building structure with concrete texture */}
      <Box args={[8, 15, 8]} position={[0, 7.5, 0]} castShadow receiveShadow>
        <meshStandardMaterial 
          color="#3a3a3a" 
          roughness={0.95}
          metalness={0.05}
        />
      </Box>

      {/* Damaged roof section */}
      <Box args={[6, 1, 6]} position={[0, 14.5, 0]} castShadow receiveShadow>
        <meshStandardMaterial 
          color="#2a2a2a" 
          roughness={0.98}
        />
      </Box>

      {/* Collapsed section */}
      <Box args={[4, 3, 4]} position={[3, 1.5, 2]} rotation={[0.3, 0, 0.2]} castShadow receiveShadow>
        <meshStandardMaterial 
          color="#1a1a1a" 
          roughness={0.9}
        />
      </Box>

      {/* More detailed broken windows */}
      {Array.from({ length: 12 }).map((_, i) => (
        <group key={i}>
          <Box 
            args={[1.2, 1.8, 0.3]} 
            position={[
              (i % 3 === 0 ? -3.5 : i % 3 === 1 ? 0 : 3.5),
              3 + Math.floor(i / 3) * 2.5,
              4.1
            ]}
            castShadow
            receiveShadow
          >
            <meshStandardMaterial 
              color="#111111" 
              roughness={0.7}
              metalness={0.3}
            />
          </Box>
          {/* Broken glass shards */}
          {Math.random() > 0.5 && (
            <Box 
              args={[0.3, 0.5, 0.1]} 
              position={[
                (i % 3 === 0 ? -3.2 : i % 3 === 1 ? 0.3 : 3.2),
                3 + Math.floor(i / 3) * 2.5 + (Math.random() - 0.5),
                4.2
              ]}
              rotation={[Math.random() * 0.5, Math.random() * 0.5, 0]}
              castShadow
            >
              <meshStandardMaterial 
                color="#222222" 
                roughness={0.2}
                metalness={0.8}
                transparent
                opacity={0.7}
              />
            </Box>
          )}
        </group>
      ))}

      {/* Large cracks on walls */}
      {Array.from({ length: 4 }).map((_, i) => (
        <Plane 
          key={i}
          args={[0.2, 12]} 
          position={[
            i % 2 === 0 ? 4 : -4,
            7.5,
            (i < 2 ? 2 : -2)
          ]} 
          rotation={[0, i % 2 === 0 ? Math.PI/2 : -Math.PI/2, (Math.random() - 0.5) * 0.3]}
        >
          <meshStandardMaterial 
            color="#000000" 
            transparent 
            opacity={0.8}
            roughness={1}
          />
        </Plane>
      ))}

      {/* Debris and rubble at base */}
      {Array.from({ length: 6 }).map((_, i) => (
        <Box 
          key={i}
          args={[
            0.5 + Math.random() * 1.5,
            0.2 + Math.random() * 0.8,
            0.5 + Math.random() * 1.5
          ]} 
          position={[
            (Math.random() - 0.5) * 10,
            0.1 + Math.random() * 0.4,
            (Math.random() - 0.5) * 10
          ]}
          rotation={[Math.random() * 0.5, Math.random() * 0.5, Math.random() * 0.5]}
          castShadow
          receiveShadow
        >
          <meshStandardMaterial 
            color="#2a2a2a" 
            roughness={0.95}
          />
        </Box>
      ))}

      {/* Overgrown vegetation on building */}
      <Cylinder args={[2, 2.5, 0.3]} position={[0, 15.1, 0]} receiveShadow>
        <meshStandardMaterial 
          color="#1a3a1a" 
          roughness={0.98}
        />
      </Cylinder>

      {/* Vines on walls */}
      {Array.from({ length: 8 }).map((_, i) => (
        <Cylinder 
          key={i}
          args={[0.1, 0.15, 3 + Math.random() * 5]} 
          position={[
            (i % 2 === 0 ? 3.8 : -3.8),
            2 + Math.random() * 8,
            (Math.random() - 0.5) * 6
          ]}
          rotation={[Math.random() * 0.2, 0, Math.random() * 0.3]}
          receiveShadow
        >
          <meshStandardMaterial 
            color="#2a4a2a" 
            roughness={0.95}
          />
        </Cylinder>
      ))}

      {/* Exposed rebar */}
      {Array.from({ length: 3 }).map((_, i) => (
        <Cylinder 
          key={i}
          args={[0.05, 0.05, 2 + Math.random() * 3]} 
          position={[
            (Math.random() - 0.5) * 6,
            8 + Math.random() * 4,
            4
          ]}
          rotation={[Math.random() * 0.3, Math.random() * 0.3, 0]}
          castShadow
        >
          <meshStandardMaterial 
            color="#8a8a8a" 
            roughness={0.3}
            metalness={0.8}
          />
        </Cylinder>
      ))}
    </group>
  )
}
