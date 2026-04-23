import React, { useState, useEffect } from 'react'
import { Canvas } from '@react-three/fiber'
import { Suspense } from 'react'
import Scene from '../../scenes/Scene'
import HUD from '../ui/HUD'
import ChallengeModal from '../ui/ChallengeModal'

function Game() {
  const [isPointerLocked, setIsPointerLocked] = useState(false)

  useEffect(() => {
    const handlePointerLockChange = () => {
      setIsPointerLocked(document.pointerLockElement !== null)
    }

    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isPointerLocked) {
        document.exitPointerLock()
      }
    }

    document.addEventListener('pointerlockchange', handlePointerLockChange)
    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('pointerlockchange', handlePointerLockChange)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isPointerLocked])

  const handleCanvasClick = () => {
    if (!isPointerLocked) {
      document.querySelector('canvas').requestPointerLock()
    }
  }

  return (
    <div style={{ width: '100vw', height: '100vh', margin: 0, padding: 0, overflow: 'hidden', cursor: isPointerLocked ? 'none' : 'crosshair' }}>
      <Canvas 
        camera={{ position: [0, 2, 5], fov: 75 }} 
        shadows
        style={{ width: '100%', height: '100%' }}
        onClick={handleCanvasClick}
      >
        <Suspense fallback={null}>
          <Scene />
        </Suspense>
      </Canvas>
      
      {!isPointerLocked && (
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          color: '#00ffff',
          fontSize: '24px',
          fontFamily: 'Orbitron, monospace',
          textAlign: 'center',
          pointerEvents: 'none',
          textShadow: '0 0 10px #00ffff',
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
          padding: '20px',
          borderRadius: '10px',
          border: '2px solid #00ffff'
        }}>
          Click to lock pointer<br />
          <span style={{ fontSize: '16px', display: 'block', marginTop: '10px' }}>
            WASD to move • Mouse to look • Space to jump • ESC to unlock
          </span>
        </div>
      )}
      
      <HUD />
      <ChallengeModal />
    </div>
  )
}

export default Game
