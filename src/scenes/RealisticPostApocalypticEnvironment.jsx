import React from 'react'
import { Environment } from '@react-three/drei'
import FallbackRealisticGround from '../components/game/FallbackRealisticGround'
import FallbackRealisticBuilding from '../components/game/FallbackRealisticBuilding'
import FallbackRealisticVegetation from '../components/game/FallbackRealisticVegetation'
import FallbackRealisticDebris from '../components/game/FallbackRealisticDebris'
import DustParticles from '../components/effects/DustParticles'

export default function RealisticPostApocalypticEnvironment() {
  return (
    <>
      {/* HDRI Environment with dramatic sunset lighting */}
      <Environment preset="sunset" background={false} />
      
      {/* Enhanced lighting setup */}
      <ambientLight intensity={0.15} color="#8B7355" />
      
      {/* Main directional light (low sun) */}
      <directionalLight 
        position={[15, 8, 10]} 
        intensity={2.0} 
        castShadow
        shadow-mapSize={[4096, 4096]}
        shadow-camera-far={80}
        shadow-camera-left={-40}
        shadow-camera-right={40}
        shadow-camera-top={40}
        shadow-camera-bottom={-40}
        shadow-bias={-0.0001}
        color="#FF8C42"
      />
      
      {/* Rim light for dramatic effect */}
      <directionalLight 
        position={[-10, 5, -10]} 
        intensity={0.8} 
        color="#4A90E2"
      />
      
      {/* Warm fill light */}
      <pointLight 
        position={[5, 10, 5]} 
        intensity={0.5} 
        color="#FFB366"
        distance={30}
      />
      
      {/* Cool ambient fill */}
      <pointLight 
        position={[-5, 8, -5]} 
        intensity={0.3} 
        color="#6B8CAE"
        distance={25}
      />
      
      {/* Ground with realistic textures */}
      <FallbackRealisticGround />
      
      {/* Buildings on both sides of the street */}
      <FallbackRealisticBuilding position={[-12, 0, -8]} rotation={[0, Math.PI / 6, 0]} scale={1.2} />
      <FallbackRealisticBuilding position={[-15, 0, 0]} rotation={[0, -Math.PI / 8, 0]} scale={1.0} />
      <FallbackRealisticBuilding position={[-10, 0, 8]} rotation={[0, Math.PI / 4, 0]} scale={0.9} />
      
      <FallbackRealisticBuilding position={[12, 0, -8]} rotation={[0, -Math.PI / 6, 0]} scale={1.1} />
      <FallbackRealisticBuilding position={[15, 0, 0]} rotation={[0, Math.PI / 8, 0]} scale={1.3} />
      <FallbackRealisticBuilding position={[10, 0, 8]} rotation={[0, -Math.PI / 4, 0]} scale={0.8} />
      
      {/* Overgrown vegetation */}
      <FallbackRealisticVegetation />
      
      {/* Scattered debris */}
      <FallbackRealisticDebris />
      
      {/* Atmospheric dust particles */}
      <DustParticles count={300} />
    </>
  )
}
