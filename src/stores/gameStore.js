import { create } from 'zustand'

export const useGameStore = create((set) => ({
  phase: 'start',
  progress: 0,
  maxProgress: 3,
  missionText: 'Initialize connection to the cybergrid...',
  alerts: [],
  currentChallenge: null,
  playerPosition: [0, 2, 5],
  gameMode: 'cyberpunk',

  setPhase: (phase) => set({ phase }),
  setProgress: (progress) => set({ progress }),
  setMissionText: (missionText) => set({ missionText }),
  addAlert: (alert) => set((state) => ({ alerts: [...state.alerts, alert] })),
  setCurrentChallenge: (challenge) => set({ currentChallenge: challenge }),
  setPlayerPosition: (position) => set({ playerPosition: position }),
  setGameMode: (gameMode) => set({ gameMode }),
  
  reset: () => set({
    phase: 'start',
    progress: 0,
    currentChallenge: null,
    playerPosition: [0, 2, 5],
    gameMode: 'cyberpunk'
  })
}))
