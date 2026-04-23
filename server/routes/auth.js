// routes/auth.js
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../db/db');

const router = express.Router();

router.post('/register', async (req, res) => {
  const { username, email, password } = req.body;
  try {
    const userExists = await pool.query('SELECT * FROM users WHERE email = $1 OR username = $2', [email, username]);
    if (userExists.rows.length > 0) {
      return res.status(400).json({ error: 'Username or email already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = await pool.query(
      'INSERT INTO users (username, email, password) VALUES ($1, $2, $3) RETURNING id, username, email',
      [username, email, hashedPassword]
    );

    res.status(201).json(newUser.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (user.rows.length === 0) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.rows[0].password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    const payload = {
      user: {
        id: user.rows[0].id,
      },
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET || 'fallback_secret_do_not_use_in_prod',
      { expiresIn: '5h' },
      (err, token) => {
        if (err) throw err;
        res.json({ token, user: { id: user.rows[0].id, username: user.rows[0].username } });
      }
    );
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;
