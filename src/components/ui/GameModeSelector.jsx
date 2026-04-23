import React from 'react'
import { useGameStore } from '../../stores/gameStore'

function GameModeSelector() {
  const { setGameMode, setPhase } = useGameStore()

  const selectCyberpunk = () => {
    setGameMode('cyberpunk')
    setPhase('playing')
  }

  const selectPostApocalyptic = () => {
    setGameMode('postapocalyptic')
    setPhase('playing')
  }

  const selectRealisticPostApocalyptic = () => {
    setGameMode('realisticpostapocalyptic')
    setPhase('playing')
  }

  return (
    <div style={{
      position: 'absolute',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '30px'
    }}>
      <h1 style={{
        color: '#00ffff',
        fontSize: '48px',
        fontFamily: 'Orbitron, monospace',
        textAlign: 'center',
        textShadow: '0 0 20px #00ffff',
        marginBottom: '20px'
      }}>
        CYBERGRID
      </h1>

      <div style={{
        display: 'flex',
        gap: '40px',
        flexWrap: 'wrap',
        justifyContent: 'center'
      }}>
        {/* Cyberpunk Mode */}
        <div
          onClick={selectCyberpunk}
          style={{
            backgroundColor: 'rgba(0, 255, 255, 0.1)',
            border: '2px solid #00ffff',
            borderRadius: '15px',
            padding: '30px',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            minWidth: '250px',
            textAlign: 'center'
          }}
          onMouseEnter={(e) => {
            e.target.style.backgroundColor = 'rgba(0, 255, 255, 0.2)'
            e.target.style.transform = 'scale(1.05)'
            e.target.style.boxShadow = '0 0 30px #00ffff'
          }}
          onMouseLeave={(e) => {
            e.target.style.backgroundColor = 'rgba(0, 255, 255, 0.1)'
            e.target.style.transform = 'scale(1)'
            e.target.style.boxShadow = 'none'
          }}
        >
          <div style={{
            color: '#00ffff',
            fontSize: '24px',
            fontFamily: 'Orbitron, monospace',
            marginBottom: '15px',
            fontWeight: 'bold'
          }}>
            CYBERPUNK CITY
          </div>
          <div style={{
            color: '#aaaaaa',
            fontSize: '14px',
            fontFamily: 'Share Tech Mono, monospace',
            lineHeight: '1.4'
          }}>
            High-tech futuristic city<br />
            Neon lights & holograms<br />
            Active security systems<br />
            Fast-paced challenges
          </div>
        </div>

        {/* Post-Apocalyptic Mode */}
        <div
          onClick={selectPostApocalyptic}
          style={{
            backgroundColor: 'rgba(0, 255, 0, 0.1)',
            border: '2px solid #00ff00',
            borderRadius: '15px',
            padding: '30px',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            minWidth: '250px',
            textAlign: 'center'
          }}
          onMouseEnter={(e) => {
            e.target.style.backgroundColor = 'rgba(0, 255, 0, 0.2)'
            e.target.style.transform = 'scale(1.05)'
            e.target.style.boxShadow = '0 0 30px #00ff00'
          }}
          onMouseLeave={(e) => {
            e.target.style.backgroundColor = 'rgba(0, 255, 0, 0.1)'
            e.target.style.transform = 'scale(1)'
            e.target.style.boxShadow = 'none'
          }}
        >
          <div style={{
            color: '#00ff00',
            fontSize: '24px',
            fontFamily: 'monospace',
            marginBottom: '15px',
            fontWeight: 'bold'
          }}>
            POST-APOCALYPTIC
          </div>
          <div style={{
            color: '#aaaaaa',
            fontSize: '14px',
            fontFamily: 'monospace',
            lineHeight: '1.4'
          }}>
            Abandoned ruins & nature<br />
            Dark moody atmosphere<br />
            Threat & safe nodes<br />
            Survival challenges
          </div>
        </div>

        {/* Realistic Post-Apocalyptic Mode */}
        <div
          onClick={selectRealisticPostApocalyptic}
          style={{
            backgroundColor: 'rgba(139, 115, 85, 0.1)',
            border: '2px solid #8B7355',
            borderRadius: '15px',
            padding: '30px',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            minWidth: '250px',
            textAlign: 'center'
          }}
          onMouseEnter={(e) => {
            e.target.style.backgroundColor = 'rgba(139, 115, 85, 0.2)'
            e.target.style.transform = 'scale(1.05)'
            e.target.style.boxShadow = '0 0 30px #8B7355'
          }}
          onMouseLeave={(e) => {
            e.target.style.backgroundColor = 'rgba(139, 115, 85, 0.1)'
            e.target.style.transform = 'scale(1)'
            e.target.style.boxShadow = 'none'
          }}
        >
          <div style={{
            color: '#D2691E',
            fontSize: '24px',
            fontFamily: 'serif',
            marginBottom: '15px',
            fontWeight: 'bold'
          }}>
            REALISTIC APOCALYPSE
          </div>
          <div style={{
            color: '#aaaaaa',
            fontSize: '14px',
            fontFamily: 'serif',
            lineHeight: '1.4'
          }}>
            "The Last of Us" style<br />
            Real GLTF assets & PBR<br />
            Cinematic lighting<br />
            Ultra-realistic visuals
          </div>
        </div>
      </div>

      <div style={{
        color: '#666666',
        fontSize: '12px',
        fontFamily: 'monospace',
        textAlign: 'center',
        marginTop: '20px'
      }}>
        Select your environment to begin the cybersecurity training simulation
      </div>
    </div>
  )
}

export default GameModeSelector
