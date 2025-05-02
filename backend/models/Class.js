const mongoose = require('mongoose');

const classSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Class name is required'],
    trim: true
  },
  stream: {
    type: String,
    required: [true, 'Stream is required'],
    enum: ['Science', 'Commerce']
  },
  level: {
    type: String,
    required: [true, 'Level is required'],
    enum: ['1st PUC', '2nd PUC']
  },
  section: {
    type: String,
    required: [true, 'Section is required'],
    trim: true
  },
  academicYear: {
    type: String,
    required: [true, 'Academic year is required']
  },
  isActive: {
    type: Boolean,
    default: true
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
classSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Create indexes for frequently queried fields
classSchema.index({ stream: 1, level: 1, section: 1 });
classSchema.index({ academicYear: 1 });
classSchema.index({ isActive: 1 });

const Class = mongoose.model('Class', classSchema);

module.exports = Class;
