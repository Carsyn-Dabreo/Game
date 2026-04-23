import React, { useRef, useMemo } from 'react'
import { useGLTF } from '@react-three/drei'
import * as THREE from 'three'

export default function RealisticDebris() {
  // Load debris models
  const carModel = useGLTF('/models/abandoned_car.glb')
  const rubbleModel = useGLTF('/models/rubble.glb')
  const poleModel = useGLTF('/models/broken_pole.glb')
  const signModel = useGLTF('/models/damaged_sign.glb')
  
  // Generate random debris positions
  const debris = useMemo(() => {
    return [
      // Abandoned cars
      {
        type: 'car',
        position: [-8, 0, -5],
        rotation: [0, Math.PI / 4, 0],
        scale: 1,
        model: carModel
      },
      {
        type: 'car',
        position: [6, 0, 3],
        rotation: [0, -Math.PI / 6, 0],
        scale: 0.9,
        model: carModel
      },
      // Rubble piles
      {
        type: 'rubble',
        position: [-4, 0, -8],
        rotation: [0, Math.random() * Math.PI, 0],
        scale: 1.2,
        model: rubbleModel
      },
      {
        type: 'rubble',
        position: [3, 0, 7],
        rotation: [0, Math.random() * Math.PI, 0],
        scale: 0.8,
        model: rubbleModel
      },
      // Broken poles
      {
        type: 'pole',
        position: [-10, 0, 0],
        rotation: [0.2, 0, 0],
        scale: 1,
        model: poleModel
      },
      {
        type: 'pole',
        position: [8, 0, -3],
        rotation: [-0.3, Math.PI / 4, 0],
        scale: 0.9,
        model: poleModel
      },
      // Damaged signs
      {
        type: 'sign',
        position: [0, 0, -10],
        rotation: [0, Math.PI / 3, 0.1],
        scale: 1,
        model: signModel
      },
      {
        type: 'sign',
        position: [-6, 0, 5],
        rotation: [0, -Math.PI / 4, -0.2],
        scale: 0.8,
        model: signModel
      }
    ]
  }, [carModel, rubbleModel, poleModel, signModel])

  return (
    <group>
      {debris.map((item, i) => (
        <primitive
          key={`${item.type}-${i}`}
          object={item.model.scene.clone()}
          position={item.position}
          rotation={item.rotation}
          scale={item.scale}
          castShadow
          receiveShadow
        />
      ))}
    </group>
  )
}

// Preload models
useGLTF.preload('/models/abandoned_car.glb')
useGLTF.preload('/models/rubble.glb')
useGLTF.preload('/models/broken_pole.glb')
useGLTF.preload('/models/damaged_sign.glb')
