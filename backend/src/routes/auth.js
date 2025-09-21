const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

// Register (students/admin/faculty)
router.post('/register', async (req, res) => {
  const { email, password, name, role } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Missing email or password' });
  try {
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ error: 'Email exists' });
    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({ email, passwordHash, name, role });
    res.json({ ok: true, user: { id: user._id, email: user.email, role: user.role }});
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Login
router.post('/login', async (req,res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Missing' });
  const user = await User.findOne({ email });
  if (!user) return res.status(400).json({ error: 'Invalid' });
  const match = await bcrypt.compare(password, user.passwordHash);
  if (!match) return res.status(400).json({ error: 'Invalid' });
  const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });
  res.json({ token, user: { id: user._id, email: user.email, name: user.name, role: user.role } });
});

// simple 'me' endpoint
router.get('/me', authMiddleware, async (req, res) => {
  const u = req.user;
  res.json({ id: u._id, email: u.email, name: u.name, role: u.role });
});

module.exports = router;
