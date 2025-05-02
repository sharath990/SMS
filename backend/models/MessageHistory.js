const mongoose = require('mongoose');

const messageHistorySchema = new mongoose.Schema({
  messageType: {
    type: String,
    required: [true, 'Message type is required'],
    enum: ['SMS', 'WhatsApp', 'Both']
  },
  templateId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'MessageTemplate'
  },
  content: {
    type: String,
    required: [true, 'Content is required']
  },
  recipients: [{
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      required: true
    },
    status: {
      type: String,
      enum: ['Pending', 'Sent', 'Mock-Sent', 'Delivered', 'Failed'],
      default: 'Pending'
    },
    personalizedContent: {
      type: String
    },
    contactNumber: {
      type: String
    },
    statusDetails: {
      type: String
    },
    deliveredAt: {
      type: Date
    },
    failureReason: {
      type: String
    },
    error: {
      type: String
    },
    deliveryDetails: {
      type: Object
    }
  }],
  targetType: {
    type: String,
    required: [true, 'Target type is required'],
    enum: [
      'College',
      'Stream', 'MultipleStreams',
      'Class', 'MultipleClasses',
      'Section', 'MultipleSections',
      'Batch', 'MultipleBatches',
      'Individual'
    ]
  },
  targetDetails: {
    type: Object
  },
  subject: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subject',
    default: null
  },
  classTiming: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ClassTiming',
    default: null
  },
  sentBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  sentAt: {
    type: Date,
    default: Date.now
  }
});

// Create indexes for frequently queried fields
messageHistorySchema.index({ messageType: 1 });
messageHistorySchema.index({ templateId: 1 });
messageHistorySchema.index({ sentBy: 1 });
messageHistorySchema.index({ sentAt: 1 });
messageHistorySchema.index({ 'recipients.status': 1 });

const MessageHistory = mongoose.model('MessageHistory', messageHistorySchema);

module.exports = MessageHistory;
