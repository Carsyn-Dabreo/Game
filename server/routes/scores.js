const express = require('express');
const router = express.Router();
const db = require('../db/db');
const auth = require('../middleware/auth');

// Get leaderboard (top scores)
router.get('/leaderboard', async (req, res) => {
  try {
    const { limit = 10, timeFilter = 'all' } = req.query;
    
    let timeCondition = '';
    if (timeFilter === 'daily') {
      timeCondition = 'AND played_at >= CURRENT_DATE';
    } else if (timeFilter === 'weekly') {
      timeCondition = 'AND played_at >= CURRENT_DATE - INTERVAL \'7 days\'';
    } else if (timeFilter === 'monthly') {
      timeCondition = 'AND played_at >= CURRENT_DATE - INTERVAL \'30 days\'';
    }

    const query = `
      SELECT 
        u.username,
        u.email,
        MAX(s.score) as best_score,
        MIN(s.time_taken) as best_time,
        COUNT(s.id) as attempts,
        MAX(s.played_at) as last_played
      FROM scores s
      JOIN users u ON s.user_id = u.id
      WHERE s.completed = true ${timeCondition}
      GROUP BY u.id, u.username, u.email
      ORDER BY best_score DESC, best_time ASC
      LIMIT $1
    `;

    const result = await db.query(query, [limit]);
    
    // Add rank to each entry
    const leaderboard = result.rows.map((row, index) => ({
      ...row,
      rank: index + 1
    }));

    res.json(leaderboard);
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    res.status(500).json({ error: 'Failed to fetch leaderboard' });
  }
});

// Get user's score history
router.get('/history', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const { limit = 20, offset = 0 } = req.query;

    const result = await db.query(
      `SELECT 
        id,
        score,
        time_taken,
        completed,
        played_at
      FROM scores 
      WHERE user_id = $1
      ORDER BY played_at DESC
      LIMIT $2 OFFSET $3`,
      [userId, limit, offset]
    );

    // Get user's stats
    const statsResult = await db.query(
      `SELECT 
        COUNT(*) as total_attempts,
        COUNT(CASE WHEN completed = true THEN 1 END) as completed_attempts,
        MAX(score) as best_score,
        AVG(CASE WHEN completed = true THEN score END) as avg_score,
        MIN(CASE WHEN completed = true THEN time_taken END) as best_time
      FROM scores 
      WHERE user_id = $1`,
      [userId]
    );

    res.json({
      history: result.rows,
      stats: statsResult.rows[0]
    });
  } catch (error) {
    console.error('Error fetching score history:', error);
    res.status(500).json({ error: 'Failed to fetch score history' });
  }
});

// Submit new score
router.post('/', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const { score, timeTaken, completed, challengesCompleted } = req.body;

    // Validate input
    if (typeof score !== 'number' || score < 0) {
      return res.status(400).json({ error: 'Invalid score' });
    }

    if (typeof timeTaken !== 'number' || timeTaken < 0) {
      return res.status(400).json({ error: 'Invalid time taken' });
    }

    const result = await db.query(
      `INSERT INTO scores (user_id, score, time_taken, completed)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [userId, score, timeTaken, completed]
    );

    // Update user's overall stats if completed
    if (completed) {
      await db.query(
        `UPDATE users 
         SET total_score = COALESCE(total_score, 0) + $1,
             games_played = COALESCE(games_played, 0) + 1,
             best_score = GREATEST(COALESCE(best_score, 0), $1),
             last_played = NOW()
         WHERE id = $2`,
        [score, userId]
      );
    }

    // Get user's new rank
    const rankResult = await db.query(
      `SELECT COUNT(*) + 1 as rank
       FROM (
         SELECT user_id, MAX(score) as max_score
         FROM scores 
         WHERE completed = true
         GROUP BY user_id
       ) user_scores
       WHERE max_score > $1`,
      [score]
    );

    res.status(201).json({
      ...result.rows[0],
      rank: rankResult.rows[0].rank
    });

  } catch (error) {
    console.error('Error submitting score:', error);
    res.status(500).json({ error: 'Failed to submit score' });
  }
});

// Get user's ranking
router.get('/rank', auth, async (req, res) => {
  try {
    const userId = req.user.id;

    const result = await db.query(
      `SELECT 
         COUNT(*) + 1 as rank,
         COUNT(*) as total_players
       FROM (
         SELECT user_id, MAX(score) as max_score
         FROM scores 
         WHERE completed = true
         GROUP BY user_id
       ) user_scores
       JOIN (
         SELECT MAX(score) as user_max_score
         FROM scores 
         WHERE user_id = $1 AND completed = true
       ) user_score ON user_scores.max_score > user_score.user_max_score`,
      [userId]
    );

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching rank:', error);
    res.status(500).json({ error: 'Failed to fetch rank' });
  }
});

// Get global statistics
router.get('/stats', async (req, res) => {
  try {
    const result = await db.query(
      `SELECT 
         COUNT(DISTINCT user_id) as total_players,
         COUNT(*) as total_attempts,
         COUNT(CASE WHEN completed = true THEN 1 END) as completed_games,
         AVG(CASE WHEN completed = true THEN score END) as avg_score,
         MAX(score) as highest_score,
         AVG(CASE WHEN completed = true THEN time_taken END) as avg_completion_time
       FROM scores`
    );

    // Get daily active players
    const dailyResult = await db.query(
      `SELECT COUNT(DISTINCT user_id) as daily_active
       FROM scores 
       WHERE played_at >= CURRENT_DATE`
    );

    res.json({
      ...result.rows[0],
      daily_active_players: dailyResult.rows[0].daily_active
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

// Delete score (user's own score)
router.delete('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const result = await db.query(
      'DELETE FROM scores WHERE id = $1 AND user_id = $2 RETURNING *',
      [id, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Score not found or unauthorized' });
    }

    res.json({ message: 'Score deleted successfully' });
  } catch (error) {
    console.error('Error deleting score:', error);
    res.status(500).json({ error: 'Failed to delete score' });
  }
});

module.exports = router;
