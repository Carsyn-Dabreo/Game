import React, { useRef, useMemo } from 'react'
import { useGLTF, Instances, Instance } from '@react-three/drei'
import * as THREE from 'three'

export default function RealisticVegetation() {
  // Load vegetation models
  const treeModel = useGLTF('/models/overgrown_tree.glb')
  const grassModel = useGLTF('/models/grass_cluster.glb')
  const vineModel = useGLTF('/models/vine.glb')
  
  // Generate random positions for vegetation
  const trees = useMemo(() => {
    return Array.from({ length: 15 }, (_, i) => ({
      position: [
        (Math.random() - 0.5) * 40,
        0,
        (Math.random() - 0.5) * 40
      ],
      rotation: [0, Math.random() * Math.PI * 2, 0],
      scale: 0.8 + Math.random() * 0.4,
      type: 'tree'
    }))
  }, [])
  
  const grass = useMemo(() => {
    return Array.from({ length: 50 }, (_, i) => ({
      position: [
        (Math.random() - 0.5) * 50,
        0,
        (Math.random() - 0.5) * 50
      ],
      rotation: [0, Math.random() * Math.PI * 2, 0],
      scale: 0.5 + Math.random() * 0.5,
      type: 'grass'
    }))
  }, [])
  
  const vines = useMemo(() => {
    return Array.from({ length: 20 }, (_, i) => ({
      position: [
        (Math.random() - 0.5) * 30,
        Math.random() * 5 + 2,
        (Math.random() - 0.5) * 30
      ],
      rotation: [
        Math.random() * 0.5,
        Math.random() * Math.PI * 2,
        Math.random() * 0.5
      ],
      scale: 0.3 + Math.random() * 0.3,
      type: 'vine'
    }))
  }, [])

  return (
    <group>
      {/* Trees */}
      {trees.map((tree, i) => (
        <primitive
          key={`tree-${i}`}
          object={treeModel.scene.clone()}
          position={tree.position}
          rotation={tree.rotation}
          scale={tree.scale}
          castShadow
          receiveShadow
        />
      ))}
      
      {/* Grass clusters */}
      {grass.map((grassItem, i) => (
        <primitive
          key={`grass-${i}`}
          object={grassModel.scene.clone()}
          position={grassItem.position}
          rotation={grassItem.rotation}
          scale={grassItem.scale}
          castShadow
          receiveShadow
        />
      ))}
      
      {/* Vines */}
      {vines.map((vine, i) => (
        <primitive
          key={`vine-${i}`}
          object={vineModel.scene.clone()}
          position={vine.position}
          rotation={vine.rotation}
          scale={vine.scale}
          castShadow
          receiveShadow
        />
      ))}
    </group>
  )
}

// Preload models
useGLTF.preload('/models/overgrown_tree.glb')
useGLTF.preload('/models/grass_cluster.glb')
useGLTF.preload('/models/vine.glb')
