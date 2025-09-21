const express = require('express');
const Activity = require('../models/Activity');
const StudentProfile = require('../models/StudentProfile');
const User = require('../models/User');
const PDFDocument = require('pdfkit');
const { Parser } = require('json2csv');
const s3 = require('../utils/s3');

const router = express.Router();

// Generate portfolio PDF for a student (authenticated)
router.get('/portfolio/:studentId', async (req, res) => {
  // public or protected — in MVP keep it protected:
  // If you want public shareable link, create a signed URL store, or a tokenized route
  try {
    const studentId = req.params.studentId;
    const user = await User.findById(studentId);
    if (!user) return res.status(404).json({ error: 'Student not found' });

    const profile = await StudentProfile.findOne({ user: studentId });
    const activities = await Activity.find({ student: studentId, status: 'approved' });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=portfolio-${user._id}.pdf`);
    const doc = new PDFDocument();
    doc.pipe(res);

    doc.fontSize(20).text(user.name || user.email, { underline: true });
    if (profile) {
      doc.fontSize(12).text(`Roll: ${profile.rollNumber || '-'}`);
      doc.text(`Department: ${profile.department || '-'}`);
      doc.text(`Year: ${profile.year || '-'}`);
      doc.moveDown();
      doc.text(profile.about || '');
      doc.moveDown();
    }

    doc.fontSize(16).text('Approved Activities');
    activities.forEach((a, idx) => {
      doc.fontSize(12).text(`${idx+1}. ${a.title} (${a.category || 'N/A'}) - ${a.dateOfActivity ? new Date(a.dateOfActivity).toLocaleDateString() : ''}`);
      if (a.description) doc.text(a.description);
      doc.moveDown();
    });

    doc.end();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// CSV export for NAAC: basic fields (admin only)
router.get('/naac/csv', async (req, res) => {
  // simple auth: expect admin secret query token in MVP or protect with auth middleware
  // For brevity, require ?adminKey=...
  if (req.query.adminKey !== (process.env.ADMIN_KEY || 'naac-demo-key')) return res.status(401).json({ error: 'Unauthorized' });

  const activities = await Activity.find().populate('student','name email');
  const rows = activities.map(a => ({
    studentName: a.student?.name || '',
    studentEmail: a.student?.email || '',
    title: a.title,
    category: a.category,
    dateOfActivity: a.dateOfActivity?.toISOString() || '',
    status: a.status,
    approver: a.approver ? String(a.approver) : ''
  }));

  const parser = new Parser();
  const csv = parser.parse(rows);
  res.setHeader('Content-disposition', 'attachment; filename=naac_activities.csv');
  res.set('Content-Type', 'text/csv');
  res.status(200).send(csv);
});

// Generate pre-signed download URL for attachments (secure)
router.get('/attachment/:key', async (req, res) => {
  const key = req.params.key;
  const signed = s3.getSignedUrl('getObject', { Bucket: process.env.S3_BUCKET, Key: key, Expires: 60 * 5 });
  res.json({ url: signed });
});

module.exports = router;
