const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
  email: { type: String, required: true, unique: true, lowercase: true },
  passwordHash: { type: String, required: true },
  name: String,
  role: { type: String, enum: ['student','faculty','admin'], default: 'student' },
  createdAt: { type: Date, default: Date.now },
  // basic in-app notifications
  notifications: [{ type: Schema.Types.ObjectId, ref: 'Notification' }]
});

module.exports = mongoose.model('User', userSchema);
