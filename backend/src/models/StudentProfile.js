const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const profileSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  rollNumber: String,
  department: String,
  year: String,
  phone: String,
  dob: Date,
  about: String,
  // academic basics (GPA/grades can be extended)
  academics: {
    cgpa: Number,
    awards: [String]
  },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('StudentProfile', profileSchema);
