const mongoose = require('mongoose');

const batchSchema = new mongoose.Schema({
  year: {
    type: Number,
    required: [true, 'Batch year is required'],
    unique: true
  },
  name: {
    type: String,
    required: [true, 'Batch name is required'],
    trim: true
  },
  isGraduated: {
    type: Boolean,
    default: false
  },
  graduationDate: {
    type: Date
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
batchSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Create indexes for frequently queried fields
// Note: year already has an index due to unique: true
batchSchema.index({ isGraduated: 1 });

const Batch = mongoose.model('Batch', batchSchema);

module.exports = Batch;
