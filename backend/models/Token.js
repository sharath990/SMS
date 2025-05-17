const mongoose = require('mongoose');

/**
 * Token Schema
 * 
 * Used for password reset and account verification tokens
 */
const tokenSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User'
  },
  token: {
    type: String,
    required: true
  },
  type: {
    type: String,
    required: true,
    enum: ['password-reset', 'account-verification']
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 3600 // Token expires after 1 hour
  }
});

const Token = mongoose.model('Token', tokenSchema);

module.exports = Token;
