import { useState, useEffect, useCallback, useRef } from 'react';
import { 
  initializeSocket, 
  getSocket, 
  socketEvents,
  scoresAPI,
  progressAPI,
  apiUtils
} from '../services/api';

export const useGameState = (user) => {
  const [isConnected, setIsConnected] = useState(false);
  const [players, setPlayers] = useState(new Map());
  const [leaderboard, setLeaderboard] = useState([]);
  const [userStats, setUserStats] = useState(null);
  const [achievements, setAchievements] = useState([]);
  const [challengeStatus, setChallengeStatus] = useState({});
  const [error, setError] = useState(null);
  
  const socketRef = useRef(null);
  const updateIntervalRef = useRef(null);

  // Initialize socket connection
  useEffect(() => {
    if (user) {
      const socket = initializeSocket();
      socketRef.current = socket;

      socket.on('connect', () => {
        setIsConnected(true);
        setError(null);
        // Join game room
        socketEvents.joinGame({
          userId: user.id,
          username: user.username,
        });
      });

      socket.on('disconnect', () => {
        setIsConnected(false);
      });

      // Set up event listeners
      setupEventListeners();

      // Start periodic updates
      startPeriodicUpdates();

      return () => {
        cleanup();
      };
    }
  }, [user]);

  const setupEventListeners = useCallback(() => {
    const socket = getSocket();

    // Player events
    socketEvents.onPlayerJoined((playerData) => {
      setPlayers(prev => new Map(prev).set(playerData.userId, {
        ...playerData,
        joinedAt: new Date(),
      }));
    });

    socketEvents.onPlayerLeft((data) => {
      setPlayers(prev => {
        const newPlayers = new Map(prev);
        newPlayers.delete(data.userId);
        return newPlayers;
      });
    });

    socketEvents.onPlayerPosition((data) => {
      setPlayers(prev => {
        const newPlayers = new Map(prev);
        const player = newPlayers.get(data.userId);
        if (player) {
          newPlayers.set(data.userId, {
            ...player,
            position: data.position,
            rotation: data.rotation,
            lastSeen: new Date(),
          });
        }
        return newPlayers;
      });
    });

    // Challenge events
    socketEvents.onChallengeUpdate((data) => {
      setChallengeStatus(prev => ({
        ...prev,
        [data.challengeId]: {
          ...prev[data.challengeId],
          userId: data.userId,
          status: data.status,
          timestamp: new Date(),
        },
      }));
    });

    socketEvents.onChallengeReceived((data) => {
      setChallengeStatus(prev => ({
        ...prev,
        [data.challengeId]: {
          ...prev[data.challengeId],
          status: data.status,
          timestamp: new Date(),
        },
      }));
    });

    // Leaderboard events
    socketEvents.onLeaderboardUpdate((data) => {
      setLeaderboard(prev => {
        const updated = [...prev];
        const existingIndex = updated.findIndex(p => p.userId === data.userId);
        
        if (existingIndex >= 0) {
          updated[existingIndex] = { ...updated[existingIndex], ...data };
        } else {
          updated.push(data);
        }
        
        return updated.sort((a, b) => b.score - a.score);
      });
    });

    socketEvents.onError((error) => {
      setError(error.message);
    });
  }, []);

  const startPeriodicUpdates = useCallback(() => {
    // Update leaderboard every 30 seconds
    updateIntervalRef.current = setInterval(async () => {
      try {
        const leaderboardData = await scoresAPI.getLeaderboard({ limit: 10 });
        setLeaderboard(leaderboardData);
      } catch (error) {
        console.error('Failed to update leaderboard:', error);
      }
    }, 30000);

    // Initial load
    loadInitialData();
  }, []);

  const loadInitialData = useCallback(async () => {
    try {
      // Load user stats
      const statsData = await scoresAPI.getHistory({ limit: 1 });
      setUserStats(statsData.stats);

      // Load achievements
      const achievementsData = await progressAPI.getAchievements();
      setAchievements(achievementsData.achievements);

      // Load initial leaderboard
      const leaderboardData = await scoresAPI.getLeaderboard({ limit: 10 });
      setLeaderboard(leaderboardData);
    } catch (error) => {
      console.error('Failed to load initial data:', error);
      apiUtils.handleError(error, false);
    }
  }, []);

  const cleanup = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.disconnect();
    }
    if (updateIntervalRef.current) {
      clearInterval(updateIntervalRef.current);
    }
  }, []);

  // Game actions
  const updatePlayerPosition = useCallback((position, rotation) => {
    if (user && isConnected) {
      socketEvents.updatePosition({
        userId: user.id,
        position,
        rotation,
      });
    }
  }, [user, isConnected]);

  const attemptChallenge = useCallback(async (challengeId, answer) => {
    try {
      setChallengeStatus(prev => ({
        ...prev,
        [challengeId]: {
          ...prev[challengeId],
          status: 'attempting',
          timestamp: new Date(),
        },
      }));

      // Emit to socket for real-time updates
      socketEvents.attemptChallenge({
        userId: user.id,
        challengeId,
        answer,
      });

      // Submit to API
      const result = await challengesAPI.attempt(challengeId, answer);

      // Update local state
      setChallengeStatus(prev => ({
        ...prev,
        [challengeId]: {
          ...prev[challengeId],
          status: result.correct ? 'completed' : 'failed',
          result,
          timestamp: new Date(),
        },
      }));

      // Update score if completed
      if (result.correct && result.points > 0) {
        const currentScore = userStats?.best_score || 0;
        const newScore = currentScore + result.points;
        
        socketEvents.updateScore({
          userId: user.id,
          score: newScore,
          points: result.points,
        });

        setUserStats(prev => ({
          ...prev,
          best_score: newScore,
        }));
      }

      return result;
    } catch (error) {
      setChallengeStatus(prev => ({
        ...prev,
        [challengeId]: {
          ...prev[challengeId],
          status: 'error',
          error: error.message,
          timestamp: new Date(),
        },
      }));
      throw error;
    }
  }, [user, userStats]);

  const submitScore = useCallback(async (scoreData) => {
    try {
      const result = await scoresAPI.submit(scoreData);
      
      // Update local stats
      setUserStats(prev => ({
        ...prev,
        best_score: Math.max(prev?.best_score || 0, scoreData.score),
        games_played: (prev?.games_played || 0) + 1,
      }));

      // Broadcast to other players
      socketEvents.updateScore({
        userId: user.id,
        score: scoreData.score,
        rank: result.rank,
      });

      return result;
    } catch (error) {
      apiUtils.handleError(error);
      throw error;
    }
  }, [user]);

  const getChallengeHint = useCallback(async (challengeId, hintIndex = 0) => {
    try {
      const hintData = await challengesAPI.getHint(challengeId, hintIndex);
      
      setChallengeStatus(prev => ({
        ...prev,
        [challengeId]: {
          ...prev[challengeId],
          hintUsed: true,
          currentHint: hintData.hint,
          hintIndex,
          pointDeduction: hintData.pointDeduction,
        },
      }));

      return hintData;
    } catch (error) {
      apiUtils.handleError(error);
      throw error;
    }
  }, []);

  // Computed values
  const gameState = {
    isConnected,
    players: Array.from(players.values()),
    playerCount: players.size,
    leaderboard,
    userStats,
    achievements,
    challengeStatus,
    error,
  };

  const actions = {
    updatePlayerPosition,
    attemptChallenge,
    submitScore,
    getChallengeHint,
    clearError: () => setError(null),
  };

  return {
    gameState,
    actions,
  };
};

export default useGameState;
