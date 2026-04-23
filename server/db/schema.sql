-- CyberGrid Database Schema
-- Run this after: docker compose up -d db

-- Users table with additional fields
CREATE TABLE IF NOT EXISTS users (
  id            SERIAL PRIMARY KEY,
  username      VARCHAR(50)  UNIQUE NOT NULL,
  email         VARCHAR(255) UNIQUE NOT NULL,
  password      VARCHAR(255) NOT NULL,         -- bcrypt hash
  total_score   INT DEFAULT 0,
  games_played  INT DEFAULT 0,
  best_score    INT DEFAULT 0,
  last_played   TIMESTAMP,
  created_at    TIMESTAMP DEFAULT NOW(),
  updated_at    TIMESTAMP DEFAULT NOW()
);

-- Challenges table for AI-generated and static challenges
CREATE TABLE IF NOT EXISTS challenges (
  id              SERIAL PRIMARY KEY,
  title           VARCHAR(255) NOT NULL,
  description     TEXT,
  type            VARCHAR(50) DEFAULT 'multiple_choice',  -- multiple_choice, code, simulation
  difficulty      VARCHAR(20) DEFAULT 'medium',           -- easy, medium, hard, expert
  category        VARCHAR(100),                           -- networking, cryptography, web_security, etc.
  question        TEXT NOT NULL,
  options         JSONB,                                  -- For multiple choice
  correct_answer  TEXT NOT NULL,
  explanation     TEXT,
  learning_points JSONB,
  hints           JSONB,
  created_by      INT REFERENCES users(id),
  is_active       BOOLEAN DEFAULT TRUE,
  created_at      TIMESTAMP DEFAULT NOW(),
  updated_at      TIMESTAMP DEFAULT NOW()
);

-- Scores / leaderboard
CREATE TABLE IF NOT EXISTS scores (
  id          SERIAL PRIMARY KEY,
  user_id     INT REFERENCES users(id) ON DELETE CASCADE,
  score       INT  NOT NULL DEFAULT 0,
  time_taken  FLOAT,                        -- seconds to complete
  completed   BOOLEAN DEFAULT FALSE,
  challenges_completed INT DEFAULT 0,
  played_at   TIMESTAMP DEFAULT NOW()
);

-- Per-user challenge progress
CREATE TABLE IF NOT EXISTS progress (
  id           SERIAL PRIMARY KEY,
  user_id      INT REFERENCES users(id) ON DELETE CASCADE,
  object_label VARCHAR(100) NOT NULL,       -- e.g. "challenge-1", "SERVER-01"
  completed    BOOLEAN DEFAULT FALSE,
  attempts     INT DEFAULT 0,
  hint_used    BOOLEAN DEFAULT FALSE,
  updated_at   TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, object_label)
);

-- User achievements
CREATE TABLE IF NOT EXISTS achievements (
  id          SERIAL PRIMARY KEY,
  user_id     INT REFERENCES users(id) ON DELETE CASCADE,
  achievement_id VARCHAR(50) NOT NULL,
  unlocked_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, achievement_id)
);

-- Session tracking for real-time features
CREATE TABLE IF NOT EXISTS user_sessions (
  id          SERIAL PRIMARY KEY,
  user_id     INT REFERENCES users(id) ON DELETE CASCADE,
  socket_id   VARCHAR(255),
  status      VARCHAR(20) DEFAULT 'online',  -- online, offline, playing
  last_seen   TIMESTAMP DEFAULT NOW(),
  created_at  TIMESTAMP DEFAULT NOW()
);

-- Indexes for fast lookups
CREATE INDEX IF NOT EXISTS idx_scores_user       ON scores(user_id);
CREATE INDEX IF NOT EXISTS idx_scores_completed ON scores(completed, score DESC);
CREATE INDEX IF NOT EXISTS idx_progress_user     ON progress(user_id);
CREATE INDEX IF NOT EXISTS idx_progress_label   ON progress(object_label);
CREATE INDEX IF NOT EXISTS idx_challenges_difficulty ON challenges(difficulty);
CREATE INDEX IF NOT EXISTS idx_challenges_category ON challenges(category);
CREATE INDEX IF NOT EXISTS idx_challenges_active ON challenges(is_active);
CREATE INDEX IF NOT EXISTS idx_achievements_user ON achievements(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_user    ON user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_socket  ON user_sessions(socket_id);

-- Insert some default challenges
INSERT INTO challenges (title, description, type, difficulty, category, question, options, correct_answer, explanation, learning_points, hints) VALUES
('Basic Password Security', 'Test your knowledge of password best practices', 'multiple_choice', 'easy', 'security_basics', 
 'Which of the following is the strongest password?', 
 '["123456", "password", "P@ssw0rd!2023", "qwerty"]', 
 'P@ssw0rd!2023',
 'Strong passwords use a combination of uppercase, lowercase, numbers, and special characters.',
 '["Use mixed character types", "Avoid common words", "Make it long enough"]',
 '["Think length + complexity", "Special characters add strength"]'),
('Phishing Detection', 'Identify phishing email characteristics', 'multiple_choice', 'medium', 'social_engineering',
 'What is a common sign of a phishing email?',
 '["Generic greetings", "Personalized messages", "Known sender", "No attachments"]',
 'Generic greetings',
 'Phishing emails often use generic greetings like "Dear Customer" instead of your name.',
 '["Check sender carefully", "Look for urgency tactics", "Verify links before clicking"]',
 '["Legitimate companies use your name", "Urgency is a red flag"]'),
('SQL Injection Basics', 'Understanding SQL injection vulnerabilities', 'multiple_choice', 'hard', 'web_security',
 'What technique prevents SQL injection attacks?',
 '["Input validation", "Parameterized queries", "Output encoding", "All of the above"]',
 'All of the above',
 'Comprehensive protection requires multiple security layers working together.',
 '["Never trust user input", "Use prepared statements", "Always validate and sanitize"]',
 '["Defense in depth is key", "No single solution is perfect"]')
ON CONFLICT DO NOTHING;
