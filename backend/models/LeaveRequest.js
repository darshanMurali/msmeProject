const mongoose = require('mongoose');

const leaveRequestSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  fromDate: {
    type: Date,
    required: [true, 'Please provide start date']
  },
  toDate: {
    type: Date,
    required: [true, 'Please provide end date']
  },
  reason: {
    type: String,
    required: [true, 'Please provide reason for leave'],
    maxlength: [500, 'Reason cannot be more than 500 characters']
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  adminComment: {
    type: String,
    maxlength: [300, 'Comment cannot be more than 300 characters']
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Create indexes for better performance
leaveRequestSchema.index({ student: 1, createdAt: -1 });
leaveRequestSchema.index({ status: 1 });
leaveRequestSchema.index({ fromDate: 1, toDate: 1 });

// Update the updatedAt field before saving
leaveRequestSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('LeaveRequest', leaveRequestSchema);
