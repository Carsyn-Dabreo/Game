import React from 'react'
import { Sky, Stars } from '@react-three/drei'
import { Suspense } from 'react'
import PostApocalypticPlayer from '../components/game/PostApocalypticPlayer'
import PostApocalypticEnvironment from './PostApocalypticEnvironment'

function PostApocalypticScene() {
  return (
    <>
      {/* Fog for atmosphere */}
      <fog attach="fog" args={['#1a1a2a', 10, 50]} />

      {/* Lighting */}
      <ambientLight intensity={0.2} color="#4a4a6a" />
      <directionalLight 
        position={[10, 20, 5]} 
        intensity={0.5} 
        castShadow 
        shadow-mapSize={[2048, 2048]}
        color="#8a8aaa"
      />
      <pointLight 
        position={[0, 10, 0]} 
        intensity={0.3} 
        color="#6666aa"
      />
      
      {/* Environment */}
      <Sky 
        distance={450000} 
        sunPosition={[1, 0.4, 0]} 
        inclination={0.6} 
        azimuth={0.25}
        turbidity={10}
        rayleigh={3}
        mieCoefficient={0.005}
        mieDirectionalG={0.8}
      />
      <Stars 
        radius={100} 
        depth={50} 
        count={2000} 
        factor={4} 
        saturation={0} 
        fade 
        speed={1}
      />
      
      {/* 3D Environment */}
      <Suspense fallback={null}>
        <PostApocalypticEnvironment />
      </Suspense>
      
      {/* Player */}
      <PostApocalypticPlayer />
    </>
  )
}

export default PostApocalypticScene
