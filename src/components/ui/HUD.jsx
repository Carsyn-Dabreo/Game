import React from 'react'
import { useGameStore } from '../../stores/gameStore'

function HUD() {
  const { progress, maxProgress, missionText } = useGameStore()

  return (
    <div id="hud">
      <div id="hud-top">
        <div id="hud-mission">
          <div className="hud-label">MISSION</div>
          <div id="mission-text">{missionText}</div>
        </div>
        <div id="hud-progress">
          <div className="hud-label">SYSTEMS SECURED</div>
          <div id="progress-bar"><div id="progress-fill" style={{ width: `${(progress / maxProgress) * 100}%` }}></div></div>
          <div id="progress-text">{progress} / {maxProgress}</div>
        </div>
      </div>
      <div id="hud-bottom">
        <div id="interact-prompt" className="hidden">
          <span className="key-hint">E</span> INTERACT
        </div>
      </div>
      <div id="hud-alerts"></div>
      <div id="minimap">
        <canvas id="minimap-canvas" width="180" height="180"></canvas>
      </div>
    </div>
  )
}

export default HUD
