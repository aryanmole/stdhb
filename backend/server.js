require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');

const authRoutes = require('./src/routes/auth');
const profileRoutes = require('./src/routes/profile');
const activityRoutes = require('./src/routes/activity');
const exportRoutes = require('./src/routes/exports');
const dashboardRoutes = require('./src/routes/dashboard');

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/activity', activityRoutes);
app.use('/api/export', exportRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: err.message || 'Server error' });
});

const PORT = process.env.PORT || 4000;
mongoose.connect(process.env.MONGO_URI, { })
  .then(() => {
    console.log('Mongo connected');
    app.listen(PORT, () => console.log('Server running on', PORT));
  })
  .catch(err => {
    console.error('Mongo connection error', err);
  });
