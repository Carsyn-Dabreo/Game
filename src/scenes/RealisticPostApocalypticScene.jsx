import React from 'react'
import { Suspense } from 'react'
import RealisticPostApocalypticPlayer from '../components/game/RealisticPostApocalypticPlayer'
import City from '../components/City'

function RealisticPostApocalypticScene() {
  return (
    <>
      {/* Simple fog for atmosphere */}
      <fog attach="fog" args={['#888888', 50, 200]} />
      
      {/* Only the City Model */}
      <Suspense fallback={null}>
        <City />
      </Suspense>
      
      {/* Player */}
      <RealisticPostApocalypticPlayer />
    </>
  )
}

export default RealisticPostApocalypticScene
