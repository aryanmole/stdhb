const express = require('express');
const multer = require('multer');
const multerS3 = require('multer-s3');
const shortid = require('shortid');
const s3 = require('../utils/s3');
const Activity = require('../models/Activity');
const Notification = require('../models/Notification');
const User = require('../models/User');
const { authMiddleware, allowRoles } = require('../middleware/auth');
const { sendMail } = require('../utils/mailer');

const router = express.Router();

const bucket = process.env.S3_BUCKET;

const upload = multer({
  storage: multerS3({
    s3,
    bucket,
    acl: 'private',
    key: (req, file, cb) => {
      const ext = (file.originalname || '').split('.').pop();
      cb(null, `attachments/${shortid.generate()}-${Date.now()}.${ext}`);
    }
  }),
  limits: { fileSize: 10 * 1024 * 1024 } // optional: 10MB per file
});


// Student submits activity with attachments
router.post('/submit', authMiddleware, upload.array('attachments', 5), async (req, res) => {
  // only students submit activities in MVP
  if (req.user.role !== 'student') return res.status(403).json({ error: 'Only students' });
  const { title, description, dateOfActivity, category } = req.body;
  const files = (req.files || []).map(f => ({
    url: `s3://${f.bucket}/${f.key}`,
    key: f.key,
    filename: f.originalname,
    contentType: f.mimetype
  }));
  const activity = await Activity.create({
    student: req.user._id,
    title, description,
    dateOfActivity: dateOfActivity ? new Date(dateOfActivity) : new Date(),
    category,
    attachments: files
  });
  // notify admins & faculty (simple)
  const admins = await User.find({ role: { $in: ['faculty','admin'] }});
  for (const a of admins) {
    const n = await Notification.create({ user: a._id, title: 'New activity pending', message: `${req.user.name || req.user.email} submitted "${title}"`, data: { activityId: activity._id }});
    a.notifications.push(n._id);
    await a.save();
    // optional email (non-blocking)
    sendMail(a.email, 'New activity submitted', `Activity "${title}" submitted and pending approval.`).catch(e=>console.warn('mail err', e.message));
  }

  res.json({ ok: true, activity });
});

// Faculty/Admin: list pending
router.get('/pending', authMiddleware, allowRoles('faculty','admin'), async (req, res) => {
  const list = await Activity.find({ status: 'pending' }).populate('student','name email');
  res.json(list);
});

// Approve / Reject
router.post('/:id/approve', authMiddleware, allowRoles('faculty','admin'), async (req, res) => {
  const { comment } = req.body;
  const id = req.params.id;
  const activity = await Activity.findById(id);
  if (!activity) return res.status(404).json({ error: 'Not found' });
  activity.status = 'approved';
  activity.approver = req.user._id;
  activity.approvalComments = comment;
  await activity.save();

  // notify student
  const n = await Notification.create({ user: activity.student, title: 'Activity approved', message: `Your activity "${activity.title}" was approved.`, data: { activityId: activity._id }});
  await User.findByIdAndUpdate(activity.student, { $push: { notifications: n._id } });

  // email
  const studentUser = await User.findById(activity.student);
  sendMail(studentUser.email, 'Activity approved', `Your activity "${activity.title}" has been approved.`).catch(()=>{});
  res.json(activity);
});

router.post('/:id/reject', authMiddleware, allowRoles('faculty','admin'), async (req, res) => {
  const { comment } = req.body;
  const id = req.params.id;
  const activity = await Activity.findById(id);
  if (!activity) return res.status(404).json({ error: 'Not found' });
  activity.status = 'rejected';
  activity.approver = req.user._id;
  activity.approvalComments = comment;
  await activity.save();

  // notify student
  const n = await Notification.create({ user: activity.student, title: 'Activity rejected', message: `Your activity "${activity.title}" was rejected. Reason: ${comment}`, data: { activityId: activity._id }});
  await User.findByIdAndUpdate(activity.student, { $push: { notifications: n._id } });

  const studentUser = await User.findById(activity.student);
  sendMail(studentUser.email, 'Activity rejected', `Your activity "${activity.title}" was rejected. Reason: ${comment}`).catch(()=>{});
  res.json(activity);
});

// Student: list own activities
router.get('/mine', authMiddleware, async (req, res) => {
  const list = await Activity.find({ student: req.user._id }).sort({ submittedAt: -1 });
  res.json(list);
});

module.exports = router;
