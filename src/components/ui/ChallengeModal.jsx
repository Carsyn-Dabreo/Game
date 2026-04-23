import React, { useState } from 'react'
import { useGameStore } from '../../stores/gameStore'

function ChallengeModal() {
  const { currentChallenge, setCurrentChallenge, progress, setProgress, maxProgress, setPhase } = useGameStore()
  const [userAnswer, setUserAnswer] = useState('')
  const [feedback, setFeedback] = useState('')

  if (!currentChallenge) return null

  const handleSubmit = () => {
    if (userAnswer.toUpperCase() === currentChallenge.answer.toUpperCase()) {
      setFeedback('Correct! System secured.')
      setTimeout(() => {
        setProgress(progress + 1)
        setCurrentChallenge(null)
        if (progress + 1 >= maxProgress) {
          setPhase('win')
        }
      }, 1500)
    } else {
      setFeedback('Incorrect. Try again!')
      setTimeout(() => setFeedback(''), 2000)
    }
  }

  const handleClose = () => {
    setCurrentChallenge(null)
    setUserAnswer('')
    setFeedback('')
  }

  return (
    <div id="challenge-overlay">
      <div id="challenge-panel">
        <div id="challenge-header">
          <div id="challenge-icon"></div>
          <h2 id="challenge-title">{currentChallenge.title || 'Challenge'}</h2>
          <div id="challenge-type-badge">{currentChallenge.type || 'Cyber'}</div>
        </div>
        <div id="challenge-description">{currentChallenge.description || 'Solve this challenge'}</div>
        <div id="challenge-content" style={{ whiteSpace: 'pre-line' }}>
          {currentChallenge.content || 'Content here'}
        </div>
        <div style={{ margin: '20px 0' }}>
          <input
            type="text"
            value={userAnswer}
            onChange={(e) => setUserAnswer(e.target.value)}
            placeholder="Enter your answer (A, B, C, or D)"
            style={{
              width: '100%',
              padding: '10px',
              background: '#1a1a1a',
              border: '1px solid #00ffff',
              color: '#00ffff',
              borderRadius: '4px',
              fontSize: '16px'
            }}
            onKeyPress={(e) => e.key === 'Enter' && handleSubmit()}
          />
        </div>
        {feedback && (
          <div id="challenge-feedback" style={{ 
            color: feedback.includes('Correct') ? '#00ff00' : '#ff0000',
            margin: '10px 0',
            textAlign: 'center'
          }}>
            {feedback}
          </div>
        )}
        <div id="challenge-actions">
          <button id="challenge-submit" className="cyber-btn" onClick={handleSubmit}>SUBMIT</button>
          <button id="challenge-close" className="cyber-btn secondary" onClick={handleClose}>ABORT</button>
        </div>
      </div>
    </div>
  )
}

export default ChallengeModal
