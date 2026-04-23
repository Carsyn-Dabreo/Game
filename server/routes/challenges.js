const express = require('express');
const router = express.Router();
const OpenAI = require('openai');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const db = require('../db/db');
const auth = require('../middleware/auth');

// Initialize AI clients
const openai = process.env.OPENAI_API_KEY ? new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
}) : null;

const genAI = process.env.GEMINI_API_KEY ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY) : null;

// Get all available challenges
router.get('/', async (req, res) => {
  try {
    const result = await db.query(
      'SELECT * FROM challenges ORDER BY difficulty ASC'
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching challenges:', error);
    res.status(500).json({ error: 'Failed to fetch challenges' });
  }
});

// Get specific challenge by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db.query(
      'SELECT * FROM challenges WHERE id = $1',
      [id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Challenge not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching challenge:', error);
    res.status(500).json({ error: 'Failed to fetch challenge' });
  }
});

// Generate AI-powered challenge
router.post('/generate', auth, async (req, res) => {
  try {
    const { type, difficulty, category } = req.body;
    
    let prompt = `Generate a cybersecurity challenge with the following specifications:
    - Type: ${type || 'multiple choice'}
    - Difficulty: ${difficulty || 'medium'}
    - Category: ${category || 'general security'}
    
    Please provide:
    1. A clear question/problem statement
    2. Multiple choice options (if applicable)
    3. Correct answer
    4. Detailed explanation
    5. Learning points
    
    Format the response as JSON with the following structure:
    {
      "title": "Challenge Title",
      "description": "Problem description",
      "type": "${type || 'multiple_choice'}",
      "difficulty": "${difficulty || 'medium'}",
      "category": "${category || 'general'}",
      "question": "The actual question",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correct_answer": "Option A",
      "explanation": "Detailed explanation",
      "learning_points": ["Point 1", "Point 2"],
      "hints": ["Hint 1", "Hint 2"]
    }`;

    let response;
    
    // Try OpenAI first, fallback to Gemini
    if (openai) {
      const completion = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: "You are a cybersecurity expert creating educational challenges. Always respond with valid JSON."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 1000
      });
      
      response = JSON.parse(completion.choices[0].message.content);
    } else if (genAI) {
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      const result = await model.generateContent(prompt);
      response = JSON.parse(result.response.text());
    } else {
      return res.status(503).json({ error: 'No AI service available' });
    }

    // Save generated challenge to database
    const insertResult = await db.query(
      `INSERT INTO challenges (title, description, type, difficulty, category, question, options, correct_answer, explanation, learning_points, hints, created_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
       RETURNING *`,
      [
        response.title,
        response.description,
        response.type,
        response.difficulty,
        response.category,
        response.question,
        JSON.stringify(response.options),
        response.correct_answer,
        response.explanation,
        JSON.stringify(response.learning_points),
        JSON.stringify(response.hints),
        req.user.id
      ]
    );

    res.status(201).json(insertResult.rows[0]);
  } catch (error) {
    console.error('Error generating challenge:', error);
    res.status(500).json({ error: 'Failed to generate challenge' });
  }
});

// Submit challenge attempt
router.post('/:id/attempt', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const { answer } = req.body;
    const userId = req.user.id;

    // Get challenge details
    const challengeResult = await db.query(
      'SELECT * FROM challenges WHERE id = $1',
      [id]
    );

    if (challengeResult.rows.length === 0) {
      return res.status(404).json({ error: 'Challenge not found' });
    }

    const challenge = challengeResult.rows[0];
    const isCorrect = answer === challenge.correct_answer;

    // Update or insert progress
    await db.query(
      `INSERT INTO progress (user_id, object_label, completed, attempts)
       VALUES ($1, $2, $3, 1)
       ON CONFLICT (user_id, object_label)
       DO UPDATE SET 
         completed = EXCLUDED.completed,
         attempts = progress.attempts + 1,
         updated_at = NOW()`,
      [userId, `challenge-${id}`, isCorrect]
    );

    // Get AI feedback if answer is incorrect
    let aiFeedback = null;
    if (!isCorrect && (openai || genAI)) {
      const feedbackPrompt = `A user answered a cybersecurity question incorrectly. 
      
      Question: ${challenge.question}
      User's answer: ${answer}
      Correct answer: ${challenge.correct_answer}
      
      Provide helpful feedback explaining why the user's answer is incorrect and why the correct answer is right. Keep it educational and encouraging.`;

      try {
        if (openai) {
          const completion = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [
              {
                role: "system",
                content: "You are a helpful cybersecurity tutor providing feedback on incorrect answers."
              },
              {
                role: "user",
                content: feedbackPrompt
              }
            ],
            temperature: 0.7,
            max_tokens: 300
          });
          
          aiFeedback = completion.choices[0].message.content;
        } else if (genAI) {
          const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
          const result = await model.generateContent(feedbackPrompt);
          aiFeedback = result.response.text();
        }
      } catch (error) {
        console.error('Error generating AI feedback:', error);
      }
    }

    res.json({
      correct: isCorrect,
      correct_answer: isCorrect ? null : challenge.correct_answer,
      explanation: isCorrect ? challenge.explanation : null,
      ai_feedback: aiFeedback,
      points: isCorrect ? getPointsForDifficulty(challenge.difficulty) : 0
    });

  } catch (error) {
    console.error('Error submitting attempt:', error);
    res.status(500).json({ error: 'Failed to submit attempt' });
  }
});

// Get hint for challenge
router.get('/:id/hint', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const { hintIndex = 0 } = req.query;

    const result = await db.query(
      'SELECT hints FROM challenges WHERE id = $1',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Challenge not found' });
    }

    const hints = JSON.parse(result.rows[0].hints);
    
    if (hintIndex >= hints.length) {
      return res.status(400).json({ error: 'No more hints available' });
    }

    // Deduct points for using hints
    await db.query(
      `UPDATE progress 
       SET hint_used = true 
       WHERE user_id = $1 AND object_label = $2`,
      [req.user.id, `challenge-${id}`]
    );

    res.json({
      hint: hints[hintIndex],
      hintIndex: parseInt(hintIndex),
      remainingHints: hints.length - hintIndex - 1,
      pointDeduction: (hintIndex + 1) * 5
    });

  } catch (error) {
    console.error('Error getting hint:', error);
    res.status(500).json({ error: 'Failed to get hint' });
  }
});

// Helper function to calculate points based on difficulty
function getPointsForDifficulty(difficulty) {
  const points = {
    easy: 10,
    medium: 25,
    hard: 50,
    expert: 100
  };
  return points[difficulty] || 25;
}

module.exports = router;
