const express = require('express');
const { authMiddleware, allowRoles } = require('../middleware/auth');
const Activity = require('../models/Activity');
const User = require('../models/User');
const StudentProfile = require('../models/StudentProfile');

const router = express.Router();

router.get('/summary', authMiddleware, async (req, res) => {
  // Student sees own counts, admin/faculty sees global
  if (req.user.role === 'student') {
    const total = await Activity.countDocuments({ student: req.user._id });
    const pending = await Activity.countDocuments({ student: req.user._id, status: 'pending' });
    const approved = await Activity.countDocuments({ student: req.user._id, status: 'approved' });
    res.json({ total, pending, approved });
  } else {
    // admin/faculty global overview
    const totalActivities = await Activity.countDocuments();
    const pending = await Activity.countDocuments({ status: 'pending' });
    const approved = await Activity.countDocuments({ status: 'approved' });
    const students = await User.countDocuments({ role: 'student' });
    res.json({ totalActivities, pending, approved, students });
  }
});

// recent activities
router.get('/recent', authMiddleware, allowRoles('faculty','admin'), async (req, res) => {
  const list = await Activity.find().sort({ submittedAt: -1 }).limit(20).populate('student','name email');
  res.json(list);
});

module.exports = router;
