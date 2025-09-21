const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const activitySchema = new Schema({
  student: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  description: String,
  dateOfActivity: Date,
  category: String, // conference, workshop, sports, etc.
  attachments: [ // S3 URLs and metadata
    {
      url: String,
      key: String,
      filename: String,
      contentType: String
    }
  ],
  submittedAt: { type: Date, default: Date.now },
  status: { type: String, enum: ['pending','approved','rejected'], default: 'pending' },
  approver: { type: Schema.Types.ObjectId, ref: 'User' },
  approvalComments: String
});

module.exports = mongoose.model('Activity', activitySchema);
