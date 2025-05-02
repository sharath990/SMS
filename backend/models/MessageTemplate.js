const mongoose = require('mongoose');

const messageTemplateSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Template name is required'],
    unique: true,
    trim: true
  },
  type: {
    type: String,
    required: [true, 'Message type is required'],
    enum: ['SMS', 'WhatsApp', 'Both']
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: ['Absence', 'Announcement', 'Event', 'Exam', 'Fee', 'Other']
  },
  content: {
    type: String,
    required: [true, 'Content is required']
  },
  variables: [{
    type: String,
    trim: true
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  createdBy: {
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
messageTemplateSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Create indexes for frequently queried fields
messageTemplateSchema.index({ type: 1 });
messageTemplateSchema.index({ category: 1 });
messageTemplateSchema.index({ isActive: 1 });

const MessageTemplate = mongoose.model('MessageTemplate', messageTemplateSchema);

module.exports = MessageTemplate;
