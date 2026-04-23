// index.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const http = require('http');
const socketIo = require('socket.io');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const winston = require('winston');

// Import routes
const authRoutes = require('./routes/auth');
const challengeRoutes = require('./routes/challenges');
const scoreRoutes = require('./routes/scores');
const progressRoutes = require('./routes/progress');

// Logger setup
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' }),
    new winston.transports.Console({
      format: winston.format.simple()
    })
  ]
});

const app = express();
const server = http.createServer(app);

// Socket.IO setup
const io = socketIo(server, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    methods: ["GET", "POST"]
  }
});

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CLIENT_URL || "http://localhost:5173",
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use('/api/', limiter);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/challenges', challengeRoutes);
app.use('/api/scores', scoreRoutes);
app.use('/api/progress', progressRoutes);

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'ok', 
    message: 'CyberGrid Server is running',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Socket.IO connection handling
io.on('connection', (socket) => {
  logger.info(`User connected: ${socket.id}`);

  // Join game room
  socket.on('join-game', (userData) => {
    socket.join('game-room');
    socket.broadcast.to('game-room').emit('player-joined', userData);
    logger.info(`User ${socket.id} joined game room`);
  });

  // Handle challenge attempts
  socket.on('challenge-attempt', async (data) => {
    try {
      // Broadcast to other players for real-time updates
      socket.broadcast.to('game-room').emit('challenge-update', {
        userId: data.userId,
        challengeId: data.challengeId,
        status: 'attempting'
      });

      // Here you would integrate with AI service to validate the challenge
      // For now, just acknowledging receipt
      socket.emit('challenge-received', { 
        challengeId: data.challengeId,
        status: 'received' 
      });
    } catch (error) {
      logger.error('Challenge attempt error:', error);
      socket.emit('error', { message: 'Failed to process challenge attempt' });
    }
  });

  // Handle real-time score updates
  socket.on('score-update', (data) => {
    socket.broadcast.to('game-room').emit('leaderboard-update', data);
    logger.info(`Score update from ${socket.id}:`, data);
  });

  // Handle player movement (for multiplayer features)
  socket.on('player-movement', (data) => {
    socket.broadcast.to('game-room').emit('player-position', {
      userId: data.userId,
      position: data.position,
      rotation: data.rotation
    });
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    socket.broadcast.to('game-room').emit('player-left', { userId: socket.id });
    logger.info(`User disconnected: ${socket.id}`);
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  logger.error(err.stack);
  res.status(500).json({ 
    error: 'Something went wrong!',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

const PORT = process.env.PORT || 3001;

server.listen(PORT, () => {
  logger.info(`Server started on port ${PORT}`);
  logger.info(`Socket.IO server ready for real-time connections`);
});

module.exports = { app, server, io };
