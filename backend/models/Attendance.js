const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  date: {
    type: Date,
    required: true,
    default: Date.now
  },
  time: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['present', 'absent', 'late'],
    default: 'present'
  },
  location: {
    type: String,
    default: 'Hostel Gate'
  },
  method: {
    type: String,
    enum: ['qr', 'manual', 'face'],
    default: 'qr'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Create index for faster queries
attendanceSchema.index({ student: 1, date: 1 });

module.exports = mongoose.model('Attendance', attendanceSchema);
