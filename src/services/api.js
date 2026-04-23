import io from 'socket.io-client';

// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:3001';

// Create axios-like fetch wrapper
class ApiClient {
  constructor(baseURL) {
    this.baseURL = baseURL;
    this.token = localStorage.getItem('token');
  }

  setToken(token) {
    this.token = token;
    localStorage.setItem('token', token);
  }

  removeToken() {
    this.token = null;
    localStorage.removeItem('token');
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...(this.token && { Authorization: `Bearer ${this.token}` }),
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `HTTP error! status: ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  get(endpoint, params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const url = queryString ? `${endpoint}?${queryString}` : endpoint;
    return this.request(url, { method: 'GET' });
  }

  post(endpoint, data = {}) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  put(endpoint, data = {}) {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  delete(endpoint) {
    return this.request(endpoint, { method: 'DELETE' });
  }
}

// Create API client instance
const api = new ApiClient(API_BASE_URL);

// Socket.IO client
let socket = null;

export const initializeSocket = () => {
  if (socket) {
    socket.disconnect();
  }

  socket = io(SOCKET_URL, {
    auth: {
      token: api.token,
    },
  });

  socket.on('connect', () => {
    console.log('Connected to server:', socket.id);
  });

  socket.on('disconnect', () => {
    console.log('Disconnected from server');
  });

  return socket;
};

export const getSocket = () => {
  if (!socket) {
    return initializeSocket();
  }
  return socket;
};

// Authentication API
export const authAPI = {
  register: (userData) => api.post('/api/auth/register', userData),
  login: (credentials) => api.post('/api/auth/login', credentials),
  verify: () => api.get('/api/auth/verify'),
  logout: () => {
    api.removeToken();
    if (socket) {
      socket.disconnect();
    }
  },
};

// Challenges API
export const challengesAPI = {
  getAll: (params) => api.get('/api/challenges', params),
  getById: (id) => api.get(`/api/challenges/${id}`),
  generate: (data) => api.post('/api/challenges/generate', data),
  attempt: (id, answer) => api.post(`/api/challenges/${id}/attempt`, { answer }),
  getHint: (id, hintIndex) => api.get(`/api/challenges/${id}/hint`, { hintIndex }),
};

// Scores API
export const scoresAPI = {
  getLeaderboard: (params) => api.get('/api/scores/leaderboard', params),
  getHistory: (params) => api.get('/api/scores/history', params),
  submit: (scoreData) => api.post('/api/scores', scoreData),
  getRank: () => api.get('/api/scores/rank'),
  getStats: () => api.get('/api/scores/stats'),
  delete: (id) => api.delete(`/api/scores/${id}`),
};

// Progress API
export const progressAPI = {
  getAll: () => api.get('/api/progress'),
  getById: (challengeId) => api.get(`/api/progress/${challengeId}`),
  update: (challengeId, data) => api.put(`/api/progress/${challengeId}`, data),
  getAchievements: () => api.get('/api/progress/achievements'),
  getRecommendations: () => api.get('/api/progress/recommendations'),
  reset: () => api.delete('/api/progress', { confirmed: true }),
};

// Socket.IO events
export const socketEvents = {
  // Game events
  joinGame: (userData) => {
    const socket = getSocket();
    socket.emit('join-game', userData);
  },

  attemptChallenge: (data) => {
    const socket = getSocket();
    socket.emit('challenge-attempt', data);
  },

  updateScore: (data) => {
    const socket = getSocket();
    socket.emit('score-update', data);
  },

  updatePosition: (data) => {
    const socket = getSocket();
    socket.emit('player-movement', data);
  },

  // Event listeners
  onPlayerJoined: (callback) => {
    const socket = getSocket();
    socket.on('player-joined', callback);
  },

  onPlayerLeft: (callback) => {
    const socket = getSocket();
    socket.on('player-left', callback);
  },

  onChallengeUpdate: (callback) => {
    const socket = getSocket();
    socket.on('challenge-update', callback);
  },

  onChallengeReceived: (callback) => {
    const socket = getSocket();
    socket.on('challenge-received', callback);
  },

  onLeaderboardUpdate: (callback) => {
    const socket = getSocket();
    socket.on('leaderboard-update', callback);
  },

  onPlayerPosition: (callback) => {
    const socket = getSocket();
    socket.on('player-position', callback);
  },

  onError: (callback) => {
    const socket = getSocket();
    socket.on('error', callback);
  },

  // Remove listeners
  off: (event, callback) => {
    const socket = getSocket();
    socket.off(event, callback);
  },
};

// Utility functions
export const apiUtils = {
  // Handle API errors consistently
  handleError: (error, showToast = true) => {
    console.error('API Error:', error);
    
    const message = error.message || 'An unexpected error occurred';
    
    if (showToast) {
      // You can integrate with your toast library here
      // toast.error(message);
      alert(message); // Fallback
    }
    
    return { error: message };
  },

  // Check if user is authenticated
  isAuthenticated: () => {
    return !!api.token;
  },

  // Get current user info from token
  getCurrentUser: () => {
    if (!api.token) return null;
    
    try {
      const payload = JSON.parse(atob(api.token.split('.')[1]));
      return payload;
    } catch (error) {
      console.error('Invalid token:', error);
      api.removeToken();
      return null;
    }
  },
};

export default api;
