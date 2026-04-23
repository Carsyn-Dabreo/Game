import React, { useState, useEffect } from 'react'
import { Canvas } from '@react-three/fiber'
import { Suspense } from 'react'
import PostApocalypticScene from '../../scenes/PostApocalypticScene'
import PostApocalypticHUD from '../ui/PostApocalypticHUD'
import ChallengeModal from '../ui/ChallengeModal'

function PostApocalypticGame() {
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
        camera={{ position: [0, 3, 8], fov: 75 }} 
        shadows
        style={{ width: '100%', height: '100%' }}
        onClick={handleCanvasClick}
        gl={{
          antialias: true,
          alpha: false,
          powerPreference: 'high-performance'
        }}
      >
        <Suspense fallback={null}>
          <PostApocalypticScene />
        </Suspense>
      </Canvas>
      
      {!isPointerLocked && (
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          color: '#00ff00',
          fontSize: '24px',
          fontFamily: 'monospace',
          textAlign: 'center',
          pointerEvents: 'none',
          textShadow: '0 0 10px #00ff00',
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          padding: '30px',
          borderRadius: '10px',
          border: '2px solid #00ff00',
          minWidth: '400px'
        }}>
          <div style={{ marginBottom: '20px', fontSize: '28px', fontWeight: 'bold' }}>
            POST-APOCALYPTIC CYBERSECURITY
          </div>
          <div style={{ fontSize: '16px', lineHeight: '1.5' }}>
            Click to lock pointer<br />
            <span style={{ display: 'block', marginTop: '15px', opacity: 0.8 }}>
              WASD to move • Mouse to look • Space to jump<br />
              E to interact • ESC to unlock
            </span>
            <span style={{ display: 'block', marginTop: '15px', fontSize: '14px', opacity: 0.6 }}>
              Find safe nodes (green) and avoid threats (red)
            </span>
          </div>
        </div>
      )}
      
      <PostApocalypticHUD />
      <ChallengeModal />
    </div>
  )
}

export default PostApocalypticGame
