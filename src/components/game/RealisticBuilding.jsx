import React, { useRef } from 'react'
import { useGLTF } from '@react-three/drei'
import * as THREE from 'three'

export default function RealisticBuilding({ position, rotation = [0, 0, 0], scale = 1 }) {
  const buildingRef = useRef()
  
  // Load a realistic ruined building model
  // Note: You would replace this with actual GLTF URLs
  const { scene } = useGLTF('/models/ruined_building.glb')
  
  // Clone the scene to allow multiple instances
  const buildingClone = scene.clone()
  
  return (
    <primitive 
      ref={buildingRef}
      object={buildingClone} 
      position={position}
      rotation={rotation}
      scale={scale}
      castShadow
      receiveShadow
    />
  )
}

// Preload the model
useGLTF.preload('/models/ruined_building.glb')
