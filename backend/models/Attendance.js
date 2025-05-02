const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    required: true,
    enum: ['Present', 'Absent', 'Late', 'Excused']
  },
  reason: {
    type: String,
    trim: true
  },
  notificationSent: {
    type: Boolean,
    default: false
  },
  notificationDetails: {
    messageId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'MessageHistory'
    },
    sentAt: {
      type: Date
    }
  },
  recordedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
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

// Update the updatedAt field before saving
attendanceSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Create indexes for frequently queried fields
attendanceSchema.index({ student: 1, date: 1 }, { unique: true });
attendanceSchema.index({ date: 1 });
attendanceSchema.index({ status: 1 });
attendanceSchema.index({ notificationSent: 1 });

const Attendance = mongoose.model('Attendance', attendanceSchema);

module.exports = Attendance;
