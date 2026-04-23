import React, { useRef } from 'react'
import { useGLTF } from '@react-three/drei'

export default function RealisticGround() {
  const groundRef = useRef()
  
  // Load realistic ground model with cracked asphalt, dirt, and puddles
  const { scene } = useGLTF('/models/abandoned_road.glb')
  
  return (
    <primitive 
      ref={groundRef}
      object={scene} 
      position={[0, 0, 0]}
      receiveShadow
    />
  )
}

// Preload the model
useGLTF.preload('/models/abandoned_road.glb')
