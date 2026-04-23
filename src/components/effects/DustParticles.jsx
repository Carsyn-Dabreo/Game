import React, { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { Points, PointMaterial } from '@react-three/drei'
import * as THREE from 'three'

export default function DustParticles({ count = 500 }) {
  const pointsRef = useRef()
  
  // Generate random particle positions
  const particles = useMemo(() => {
    const positions = new Float32Array(count * 3)
    const velocities = new Float32Array(count * 3)
    
    for (let i = 0; i < count; i++) {
      const i3 = i * 3
      
      // Random position in a large area
      positions[i3] = (Math.random() - 0.5) * 100
      positions[i3 + 1] = Math.random() * 20 + 5
      positions[i3 + 2] = (Math.random() - 0.5) * 100
      
      // Random velocity for floating effect
      velocities[i3] = (Math.random() - 0.5) * 0.01
      velocities[i3 + 1] = (Math.random() - 0.5) * 0.005
      velocities[i3 + 2] = (Math.random() - 0.5) * 0.01
    }
    
    return { positions, velocities }
  }, [count])
  
  useFrame((state) => {
    if (pointsRef.current) {
      const positions = pointsRef.current.geometry.attributes.position.array
      
      for (let i = 0; i < count; i++) {
        const i3 = i * 3
        
        // Update positions based on velocities
        positions[i3] += particles.velocities[i3]
        positions[i3 + 1] += particles.velocities[i3 + 1]
        positions[i3 + 2] += particles.velocities[i3 + 2]
        
        // Wrap particles around boundaries
        if (Math.abs(positions[i3]) > 50) positions[i3] *= -1
        if (Math.abs(positions[i3 + 2]) > 50) positions[i3 + 2] *= -1
        if (positions[i3 + 1] > 25) positions[i3 + 1] = 5
        if (positions[i3 + 1] < 5) positions[i3 + 1] = 25
      }
      
      pointsRef.current.geometry.attributes.position.needsUpdate = true
      pointsRef.current.rotation.y = state.clock.elapsedTime * 0.01
    }
  })
  
  return (
    <Points ref={pointsRef} positions={particles.positions} stride={3} frustumCulled={false}>
      <PointMaterial
        transparent
        opacity={0.3}
        size={0.05}
        sizeAttenuation={true}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        color="#8B7355"
      />
    </Points>
  )
}
