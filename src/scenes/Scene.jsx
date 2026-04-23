import React from 'react'
import { Sky, Stars } from '@react-three/drei'
import Player from '../components/game/Player'
import Environment from './Environment'

function Scene() {
  return (
    <>
      {/* Lighting */}
      <ambientLight intensity={0.2} />
      <directionalLight position={[10, 20, 5]} intensity={1} castShadow shadow-mapSize={[2048, 2048]} />
      <pointLight position={[0, 10, 0]} intensity={0.5} color="#00ffff" />
      
      {/* Environment */}
      <Sky distance={450000} sunPosition={[1, 0.4, 0]} inclination={0.6} azimuth={0.25} />
      <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
      
      {/* 3D Environment */}
      <Environment />
      
      {/* Player */}
      <Player />
    </>
  )
}

export default Scene
