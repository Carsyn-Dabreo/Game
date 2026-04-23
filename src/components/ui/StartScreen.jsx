import React from 'react'
import GameModeSelector from './GameModeSelector'

function StartScreen() {
  return (
    <div style={{
      width: '100vw',
      height: '100vh',
      background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a2a 100%)',
      overflow: 'hidden',
      position: 'relative'
    }}>
      {/* Animated background elements */}
      <div style={{
        position: 'absolute',
        width: '100%',
        height: '100%',
        background: `
          radial-gradient(circle at 20% 50%, rgba(0, 255, 255, 0.1) 0%, transparent 50%),
          radial-gradient(circle at 80% 50%, rgba(0, 255, 0, 0.1) 0%, transparent 50%),
          radial-gradient(circle at 50% 20%, rgba(255, 0, 255, 0.05) 0%, transparent 50%)
        `
      }} />

      <GameModeSelector />
    </div>
  )
}

export default StartScreen
