const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Token = require('../models/Token');
const { sendPasswordSetupEmail } = require('../utils/emailService');
const bcrypt = require('bcryptjs');

/**
 * @route   POST /api/password-reset/request
 * @desc    Request a password reset
 * @access  Public
 */
router.post('/request', async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }
    
    // Find user by email
    const user = await User.findOne({ email });
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Send password reset email
    const emailSent = await sendPasswordSetupEmail(user);
    
    if (emailSent) {
      res.json({ 
        success: true, 
        message: 'Password reset email sent successfully' 
      });
    } else {
      res.status(500).json({ 
        success: false, 
        message: 'Failed to send password reset email' 
      });
    }
  } catch (error) {
    console.error('Error requesting password reset:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @route   GET /api/password-reset/verify/:token
 * @desc    Verify password reset token
 * @access  Public
 */
router.get('/verify/:token', async (req, res) => {
  try {
    const { token } = req.params;
    
    // Find token in database
    const resetToken = await Token.findOne({ 
      token, 
      type: 'password-reset' 
    });
    
    if (!resetToken) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid or expired token' 
      });
    }
    
    // Find user
    const user = await User.findById(resetToken.userId);
    
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }
    
    res.json({ 
      success: true, 
      message: 'Token is valid',
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName
      }
    });
  } catch (error) {
    console.error('Error verifying token:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @route   POST /api/password-reset/reset
 * @desc    Reset password with token
 * @access  Public
 */
router.post('/reset', async (req, res) => {
  try {
    const { token, password } = req.body;
    
    if (!token || !password) {
      return res.status(400).json({ message: 'Token and password are required' });
    }
    
    // Validate password
    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters long' });
    }
    
    // Find token in database
    const resetToken = await Token.findOne({ 
      token, 
      type: 'password-reset' 
    });
    
    if (!resetToken) {
      return res.status(400).json({ message: 'Invalid or expired token' });
    }
    
    // Find user
    const user = await User.findById(resetToken.userId);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Update password
    user.password = password;
    await user.save();
    
    // Delete token
    await Token.deleteOne({ _id: resetToken._id });
    
    res.json({ 
      success: true, 
      message: 'Password reset successful' 
    });
  } catch (error) {
    console.error('Error resetting password:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
