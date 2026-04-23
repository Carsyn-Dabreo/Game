import React from 'react'
import { useGameStore } from '../../stores/gameStore'

function WinScreen() {
  const reset = useGameStore(state => state.reset)

  const handleRestart = () => reset()

  return (
    <div id="win-screen">
      <div className="win-content">
        <h1 className="glitch" data-text="SECURED">SECURED</h1>
        <p className="subtitle">ALL SYSTEMS RESTORED</p>
        <p className="win-stats" id="win-stats"></p>
        <button id="restart-btn" className="cyber-btn" onClick={handleRestart}>REINITIALIZE</button>
      </div>
    </div>
  )
}

export default WinScreen
