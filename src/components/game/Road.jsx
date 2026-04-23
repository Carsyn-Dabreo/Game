import React from 'react'
import { Plane } from '@react-three/drei'

export default function Road({ position, width = 4, length = 20 }) {
  return (
    <group position={position}>
      {/* Road surface */}
      <Plane args={[width, length]} rotation={[-Math.PI/2, 0, 0]} position={[0, 0.01, 0]}>
        <meshStandardMaterial color="#333333" />
      </Plane>
      
      {/* Road lines */}
      <Plane args={[0.1, length]} rotation={[-Math.PI/2, 0, 0]} position={[0, 0.02, 0]}>
        <meshStandardMaterial color="#ffffff" />
      </Plane>
    </group>
  )
}
