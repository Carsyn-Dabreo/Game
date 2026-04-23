import { useGLTF } from '@react-three/drei'
import { useEffect } from 'react'

export default function City() {
  const { scene } = useGLTF('/models/city.glb')

  useEffect(() => {
    // Enable shadows on all meshes
    scene.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true
        child.receiveShadow = true
      }
    })
  }, [scene])

  return (
    <primitive 
      object={scene} 
      scale={1}        // Normal scale
      position={[0, 0, 0]}  // Center at origin
    />
  )
}

// Preload the model for better performance
useGLTF.preload('/models/city.glb')
