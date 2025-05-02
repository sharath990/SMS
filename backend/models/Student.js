const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
  rollNumber: {
    type: Number,
    required: [true, 'Roll number is required'],
    unique: true
  },
  firstName: {
    type: String,
    required: [true, 'First name is required'],
    trim: true
  },
  lastName: {
    type: String,
    required: [true, 'Last name is required'],
    trim: true
  },
  stream: {
    type: String,
    required: [true, 'Stream is required'],
    enum: ['Science', 'Commerce']
  },
  class: {
    type: String,
    required: [true, 'Class is required'],
    enum: ['1st PUC', '2nd PUC']
  },
  section: {
    type: String,
    required: [true, 'Section is required'],
    trim: true
  },
  batch: {
    type: Number,
    required: [true, 'Batch year is required']
  },
  isActive: {
    type: Boolean,
    default: true
  },
  parentName: {
    type: String,
    required: [true, 'Parent name is required'],
    trim: true
  },
  parentMobile: {
    type: String,
    required: [true, 'Parent mobile number is required'],
    trim: true,
    match: [/^[0-9]{10}$/, 'Please enter a valid 10-digit mobile number']
  },
  parentWhatsApp: {
    type: String,
    trim: true,
    match: [/^[0-9]{10}$/, 'Please enter a valid 10-digit WhatsApp number']
  },
  parentEmail: {
    type: String,
    trim: true,
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, 'Please use a valid email address']
  },
  address: {
    type: String,
    trim: true
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
studentSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Create indexes for frequently queried fields
// Note: rollNumber already has an index due to unique: true
studentSchema.index({ stream: 1, class: 1, section: 1 });
studentSchema.index({ batch: 1 });
studentSchema.index({ isActive: 1 });

const Student = mongoose.model('Student', studentSchema);

module.exports = Student;
