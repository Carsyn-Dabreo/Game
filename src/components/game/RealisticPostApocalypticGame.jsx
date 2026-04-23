import React, { useState, useEffect } from 'react'
import { Canvas } from '@react-three/fiber'
import { Suspense } from 'react'
import RealisticPostApocalypticScene from '../../scenes/RealisticPostApocalypticScene'
import PostApocalypticHUD from '../ui/PostApocalypticHUD'
import ChallengeModal from '../ui/ChallengeModal'
import * as THREE from 'three'

function RealisticPostApocalypticGame() {
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

  const handleCanvasClick = (e) => {
    if (!isPointerLocked && e.target.tagName === 'CANVAS') {
      e.target.requestPointerLock()
    }
  }

  return (
    <div style={{ 
      width: '100vw', 
      height: '100vh', 
      margin: 0, 
      padding: 0, 
      overflow: 'hidden', 
      cursor: isPointerLocked ? 'none' : 'crosshair',
      background: '#0a0a0a'
    }}>
      <Canvas 
        camera={{ position: [0, 2.5, 10], fov: 75 }} 
        shadows
        style={{ width: '100%', height: '100%' }}
        onClick={handleCanvasClick}
        gl={{
          antialias: true,
          alpha: false,
          powerPreference: 'high-performance',
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.2,
          shadowMapType: THREE.PCFSoftShadowMap,
          shadowMap: true
        }}
        shadowMap
      >
        <Suspense fallback={null}>
          <RealisticPostApocalypticScene />
        </Suspense>
      </Canvas>
      
      {!isPointerLocked && (
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          color: '#8B7355',
          fontSize: '24px',
          fontFamily: 'serif',
          textAlign: 'center',
          pointerEvents: 'none',
          textShadow: '0 0 10px rgba(139, 115, 85, 0.5)',
          backgroundColor: 'rgba(10, 10, 10, 0.8)',
          padding: '30px',
          borderRadius: '10px',
          border: '2px solid rgba(139, 115, 85, 0.3)',
          minWidth: '400px'
        }}>
          <div style={{ marginBottom: '20px', fontSize: '28px', fontWeight: 'bold', color: '#D2691E' }}>
            THE LAST OF US - CYBERSECURITY
          </div>
          <div style={{ fontSize: '16px', lineHeight: '1.5' }}>
            Click to enter the abandoned city<br />
            <span style={{ display: 'block', marginTop: '15px', opacity: 0.8 }}>
              WASD to move • Mouse to look • Space to jump<br />
              E to interact • ESC to unlock
            </span>
            <div style={{ display: 'block', marginTop: '15px', fontSize: '14px', opacity: '0.6' }}>
              Explore the ruins and find secure terminals
            </div>
          </div>
        </div>
      )}
      
      <PostApocalypticHUD />
      <ChallengeModal />
    </div>
  )
}

export default RealisticPostApocalypticGame
