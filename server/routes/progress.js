const express = require('express');
const router = express.Router();
const db = require('../db/db');
const auth = require('../middleware/auth');

// Get user's progress for all challenges
router.get('/', auth, async (req, res) => {
  try {
    const userId = req.user.id;

    const result = await db.query(
      `SELECT 
         object_label,
         completed,
         attempts,
         hint_used,
         updated_at
       FROM progress 
       WHERE user_id = $1
       ORDER BY updated_at DESC`,
      [userId]
    );

    // Calculate progress statistics
    const stats = {
      total_challenges: result.rows.length,
      completed_challenges: result.rows.filter(row => row.completed).length,
      total_attempts: result.rows.reduce((sum, row) => sum + row.attempts, 0),
      hints_used: result.rows.filter(row => row.hint_used).length,
      completion_rate: result.rows.length > 0 
        ? (result.rows.filter(row => row.completed).length / result.rows.length * 100).toFixed(2)
        : 0
    };

    res.json({
      progress: result.rows,
      stats
    });
  } catch (error) {
    console.error('Error fetching progress:', error);
    res.status(500).json({ error: 'Failed to fetch progress' });
  }
});

// Get progress for specific challenge
router.get('/:challengeId', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const { challengeId } = req.params;

    const result = await db.query(
      `SELECT 
         object_label,
         completed,
         attempts,
         hint_used,
         updated_at
       FROM progress 
       WHERE user_id = $1 AND object_label = $2`,
      [userId, `challenge-${challengeId}`]
    );

    if (result.rows.length === 0) {
      return res.json({
        completed: false,
        attempts: 0,
        hint_used: false,
        first_attempt: true
      });
    }

    res.json({
      ...result.rows[0],
      first_attempt: false
    });
  } catch (error) {
    console.error('Error fetching challenge progress:', error);
    res.status(500).json({ error: 'Failed to fetch challenge progress' });
  }
});

// Update progress for challenge
router.put('/:challengeId', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const { challengeId } = req.params;
    const { completed, attempts, hint_used } = req.body;

    const result = await db.query(
      `INSERT INTO progress (user_id, object_label, completed, attempts, hint_used)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (user_id, object_label)
       DO UPDATE SET 
         completed = COALESCE(EXCLUDED.completed, progress.completed),
         attempts = CASE 
           WHEN EXCLUDED.attempts > 0 THEN progress.attempts + EXCLUDED.attempts
           ELSE progress.attempts + 1
         END,
         hint_used = COALESCE(EXCLUDED.hint_used, progress.hint_used),
         updated_at = NOW()
       RETURNING *`,
      [userId, `challenge-${challengeId}`, completed, attempts || 1, hint_used || false]
    );

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating progress:', error);
    res.status(500).json({ error: 'Failed to update progress' });
  }
});

// Get user's achievement progress
router.get('/achievements', auth, async (req, res) => {
  try {
    const userId = req.user.id;

    // Get user's progress stats
    const progressResult = await db.query(
      `SELECT 
         COUNT(CASE WHEN completed = true THEN 1 END) as completed_challenges,
         COUNT(*) as total_attempts,
         COUNT(CASE WHEN hint_used = true THEN 1 END) as hints_used,
         MAX(updated_at) as last_activity
       FROM progress 
       WHERE user_id = $1`,
      [userId]
    );

    // Get user's scores
    const scoreResult = await db.query(
      `SELECT 
         MAX(score) as best_score,
         COUNT(CASE WHEN completed = true THEN 1 END) as completed_games,
         AVG(CASE WHEN completed = true THEN time_taken END) as avg_time
       FROM scores 
       WHERE user_id = $1`,
      [userId]
    );

    const stats = { ...progressResult.rows[0], ...scoreResult.rows[0] };

    // Calculate achievements
    const achievements = [
      {
        id: 'first_challenge',
        name: 'First Steps',
        description: 'Complete your first challenge',
        unlocked: stats.completed_challenges >= 1,
        progress: Math.min(stats.completed_challenges, 1),
        max_progress: 1
      },
      {
        id: 'challenge_master',
        name: 'Challenge Master',
        description: 'Complete 10 challenges',
        unlocked: stats.completed_challenges >= 10,
        progress: Math.min(stats.completed_challenges, 10),
        max_progress: 10
      },
      {
        id: 'high_scorer',
        name: 'High Scorer',
        description: 'Score over 100 points in a single game',
        unlocked: stats.best_score >= 100,
        progress: Math.min(stats.best_score, 100),
        max_progress: 100
      },
      {
        id: 'speed_demon',
        name: 'Speed Demon',
        description: 'Complete a game in under 5 minutes',
        unlocked: stats.avg_time && stats.avg_time < 300,
        progress: stats.avg_time ? Math.max(0, 100 - (stats.avg_time / 300 * 100)) : 0,
        max_progress: 100
      },
      {
        id: 'persistent',
        name: 'Persistent',
        description: 'Attempt 50 challenges',
        unlocked: stats.total_attempts >= 50,
        progress: Math.min(stats.total_attempts, 50),
        max_progress: 50
      },
      {
        id: 'no_hints',
        name: 'Independent Thinker',
        description: 'Complete 5 challenges without hints',
        unlocked: stats.completed_challenges >= 5 && stats.hints_used === 0,
        progress: Math.min(stats.completed_challenges - stats.hints_used, 5),
        max_progress: 5
      }
    ];

    // Calculate overall achievement progress
    const unlockedCount = achievements.filter(a => a.unlocked).length;
    const totalAchievements = achievements.length;

    res.json({
      achievements,
      stats: {
        unlocked_count: unlockedCount,
        total_count: totalAchievements,
        completion_percentage: (unlockedCount / totalAchievements * 100).toFixed(2)
      }
    });
  } catch (error) {
    console.error('Error fetching achievements:', error);
    res.status(500).json({ error: 'Failed to fetch achievements' });
  }
});

// Get learning path recommendations
router.get('/recommendations', auth, async (req, res) => {
  try {
    const userId = req.user.id;

    // Get user's completed challenges and weak areas
    const progressResult = await db.query(
      `SELECT 
         p.object_label,
         p.completed,
         p.attempts,
         c.category,
         c.difficulty
       FROM progress p
       LEFT JOIN challenges c ON p.object_label = CONCAT('challenge-', c.id)
       WHERE p.user_id = $1`,
      [userId]
    );

    const userProgress = progressResult.rows;
    
    // Analyze performance by category
    const categoryStats = {};
    userProgress.forEach(progress => {
      if (progress.category) {
        if (!categoryStats[progress.category]) {
          categoryStats[progress.category] = {
            completed: 0,
            total: 0,
            avg_attempts: 0
          };
        }
        categoryStats[progress.category].total++;
        if (progress.completed) {
          categoryStats[progress.category].completed++;
        }
        categoryStats[progress.category].avg_attempts += progress.attempts;
      }
    });

    // Calculate averages and identify weak areas
    Object.keys(categoryStats).forEach(category => {
      const stats = categoryStats[category];
      stats.avg_attempts = stats.avg_attempts / stats.total;
      stats.completion_rate = (stats.completed / stats.total) * 100;
    });

    // Generate recommendations
    const recommendations = [];
    
    // Find categories with low completion rates
    const weakCategories = Object.entries(categoryStats)
      .filter(([_, stats]) => stats.completion_rate < 50)
      .map(([category, _]) => category);

    weakCategories.forEach(category => {
      recommendations.push({
        type: 'category_focus',
        title: `Focus on ${category}`,
        description: `You're struggling with ${category} challenges. Try practicing more in this area.`,
        priority: 'high'
      });
    });

    // Recommend next difficulty level
    const completedDifficulties = new Set(
      userProgress
        .filter(p => p.completed)
        .map(p => p.difficulty)
    );

    if (completedDifficulties.has('easy') && !completedDifficulties.has('medium')) {
      recommendations.push({
        type: 'difficulty_progression',
        title: 'Ready for Medium Challenges',
        description: 'You\'ve mastered easy challenges. Try medium difficulty!',
        priority: 'medium'
      });
    }

    if (completedDifficulties.has('medium') && !completedDifficulties.has('hard')) {
      recommendations.push({
        type: 'difficulty_progression',
        title: 'Challenge Yourself',
        description: 'You\'re doing great with medium challenges. Ready for hard mode?',
        priority: 'medium'
      });
    }

    // Recommend review if many attempts
    const highAttemptChallenges = userProgress.filter(p => p.attempts > 5);
    if (highAttemptChallenges.length > 3) {
      recommendations.push({
        type: 'review_needed',
        title: 'Review Previous Challenges',
        description: 'Some challenges took many attempts. Consider reviewing the learning materials.',
        priority: 'low'
      });
    }

    res.json({
      recommendations,
      category_stats: categoryStats,
      summary: {
        total_challenges: userProgress.length,
        completed_challenges: userProgress.filter(p => p.completed).length,
        weak_areas: weakCategories
      }
    });
  } catch (error) {
    console.error('Error generating recommendations:', error);
    res.status(500).json({ error: 'Failed to generate recommendations' });
  }
});

// Reset user progress (admin only or user's own with confirmation)
router.delete('/', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const { confirmed } = req.body;

    if (!confirmed) {
      return res.status(400).json({ 
        error: 'Confirmation required',
        message: 'This action cannot be undone. Please confirm you want to reset all progress.'
      });
    }

    await db.query('DELETE FROM progress WHERE user_id = $1', [userId]);
    
    res.json({ 
      message: 'All progress has been reset successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error resetting progress:', error);
    res.status(500).json({ error: 'Failed to reset progress' });
  }
});

module.exports = router;
