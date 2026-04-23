import React, { useState, useEffect } from 'react'
import { useGameStore } from '../../stores/gameStore'

function PostApocalypticHUD() {
  const { progress, maxProgress, phase, playerPosition } = useGameStore()
  const [score, setScore] = useState(0)
  const [timer, setTimer] = useState(0)
  const [status, setStatus] = useState('Safe')

  useEffect(() => {
    const interval = setInterval(() => {
      setTimer(prev => prev + 1)
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    // Check if player is near threat nodes
    if (playerPosition) {
      const threatNodes = [
        [-6, 1.5, -6],
        [6, 1.5, -6],
        [0, 1.5, 0]
      ]
      
      const nearThreat = threatNodes.some(node => {
        const dist = Math.sqrt(
          Math.pow(playerPosition[0] - node[0], 2) +
          Math.pow(playerPosition[1] - node[1], 2) +
          Math.pow(playerPosition[2] - node[2], 2)
        )
        return dist < 5
      })

      setStatus(nearThreat ? 'Threat Detected' : 'Safe')
    }
  }, [playerPosition])

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  if (phase !== 'playing') return null

  return (
    <div style={{
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      padding: '20px',
      pointerEvents: 'none',
      fontFamily: 'monospace',
      color: '#00ff00',
      textShadow: '0 0 5px #00ff00',
      zIndex: 1000
    }}>
      {/* Top HUD */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        flexWrap: 'wrap'
      }}>
        {/* Score */}
        <div style={{
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
          padding: '10px 15px',
          border: '1px solid #00ff00',
          borderRadius: '5px',
          minWidth: '120px'
        }}>
          <div style={{ fontSize: '12px', opacity: 0.8 }}>SCORE</div>
          <div style={{ fontSize: '18px', fontWeight: 'bold' }}>{score}</div>
        </div>

        {/* Timer */}
        <div style={{
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
          padding: '10px 15px',
          border: '1px solid #00ff00',
          borderRadius: '5px',
          minWidth: '120px'
        }}>
          <div style={{ fontSize: '12px', opacity: 0.8 }}>TIME</div>
          <div style={{ fontSize: '18px', fontWeight: 'bold' }}>{formatTime(timer)}</div>
        </div>

        {/* Status */}
        <div style={{
          backgroundColor: status === 'Threat Detected' ? 'rgba(255, 0, 0, 0.3)' : 'rgba(0, 255, 0, 0.3)',
          padding: '10px 15px',
          border: `1px solid ${status === 'Threat Detected' ? '#ff0000' : '#00ff00'}`,
          borderRadius: '5px',
          minWidth: '150px',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '12px', opacity: 0.8 }}>STATUS</div>
          <div style={{ 
            fontSize: '14px', 
            fontWeight: 'bold',
            color: status === 'Threat Detected' ? '#ff0000' : '#00ff00',
            textShadow: `0 0 5px ${status === 'Threat Detected' ? '#ff0000' : '#00ff00'}`
          }}>
            {status}
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div style={{
        position: 'absolute',
        bottom: '30px',
        left: '50%',
        transform: 'translateX(-50%)',
        width: '300px',
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        border: '1px solid #00ff00',
        borderRadius: '10px',
        padding: '10px'
      }}>
        <div style={{ 
          fontSize: '12px', 
          marginBottom: '5px', 
          textAlign: 'center',
          opacity: 0.8
        }}>
          SYSTEM RECOVERY: {progress}/{maxProgress}
        </div>
        <div style={{
          width: '100%',
          height: '10px',
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          border: '1px solid #00ff00',
          borderRadius: '5px',
          overflow: 'hidden'
        }}>
          <div style={{
            width: `${(progress / maxProgress) * 100}%`,
            height: '100%',
            backgroundColor: '#00ff00',
            transition: 'width 0.3s ease',
            boxShadow: '0 0 10px #00ff00'
          }} />
        </div>
      </div>

      {/* Coordinates */}
      <div style={{
        position: 'absolute',
        bottom: '30px',
        right: '20px',
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        padding: '8px 12px',
        border: '1px solid #00ff00',
        borderRadius: '5px',
        fontSize: '10px',
        opacity: 0.8
      }}>
        {playerPosition && (
          <div>
            POS: [{Math.round(playerPosition[0])}, {Math.round(playerPosition[1])}, {Math.round(playerPosition[2])}]
          </div>
        )}
      </div>
    </div>
  )
}

export default PostApocalypticHUD
