const express = require('express');
const StudentProfile = require('../models/StudentProfile');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

// Get own profile
router.get('/', authMiddleware, async (req, res) => {
  let profile = await StudentProfile.findOne({ user: req.user._id }).populate('user','name email');
  if (!profile) return res.json(null);
  res.json(profile);
});

// Create or update profile
router.post('/', authMiddleware, async (req, res) => {
  const body = req.body;
  let profile = await StudentProfile.findOne({ user: req.user._id });
  if (!profile) {
    profile = new StudentProfile({...body, user: req.user._id});
  } else {
    Object.assign(profile, body);
  }
  await profile.save();
  res.json(profile);
});

// Admin can fetch profiles (basic)
router.get('/all', authMiddleware, async (req, res) => {
  // basic admin/faculty access allowed
  if (!['admin','faculty'].includes(req.user.role)) return res.status(403).json({ error: 'Forbidden' });
  const q = await StudentProfile.find().populate('user','name email');
  res.json(q);
});

module.exports = router;
