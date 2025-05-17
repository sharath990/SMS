const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { protect, admin } = require('../middleware/auth');
const router = express.Router();

// @route   POST /api/auth/login
// @desc    Login user and get token
// @access  Public
router.post('/login', async (req, res) => {
  try {
    console.log('Login attempt with:', req.body);
    const { email, password } = req.body;

    // Check if user exists
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      console.log('User not found with email:', email);
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    console.log('User found:', user.username);
    console.log('User password hash exists:', !!user.password);
    console.log('Password hash length:', user.password.length);

    // Check if password matches
    const isMatch = await user.matchPassword(password);
    console.log('Password match result:', isMatch);

    if (!isMatch) {
      console.log('Password does not match for user:', user.username);
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check if user account is active
    if (!user.isActive) {
      console.log('User account is inactive:', user.username);
      return res.status(401).json({ message: 'Your account has been deactivated. Please contact an administrator.' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET || 'mes_chaitanya_sms_secret_key_change_in_production',
      { expiresIn: process.env.JWT_EXPIRE || '24h' }
    );

    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        mobileNumber: user.mobileNumber,
        isAdmin: user.isAdmin,
        isActive: user.isActive
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/auth/user
// @desc    Get user data
// @access  Private
router.get('/user', protect, async (req, res) => {
  try {
    res.json({
      success: true,
      user: {
        id: req.user._id,
        username: req.user.username,
        firstName: req.user.firstName,
        lastName: req.user.lastName,
        email: req.user.email,
        mobileNumber: req.user.mobileNumber,
        isAdmin: req.user.isAdmin,
        isActive: req.user.isActive
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/auth/users
// @desc    Create a new user (Admin only)
// @access  Private/Admin
router.post('/users', protect, admin, async (req, res) => {
  try {
    console.log('Creating user - Request body:', req.body);
    const { username, firstName, lastName, email, mobileNumber, password } = req.body;

    // Check if required fields are present
    if (!username || !firstName || !lastName || !email || !mobileNumber || !password) {
      console.log('Missing required fields');
      return res.status(400).json({ message: 'Please provide username, first name, last name, email, mobile number and password' });
    }

    // Validate mobile number format
    const mobileRegex = /^[0-9]{10}$/;
    if (!mobileRegex.test(mobileNumber)) {
      console.log('Invalid mobile number format:', mobileNumber);
      return res.status(400).json({ message: 'Please enter a valid 10-digit mobile number' });
    }

    // Admin check is handled by the admin middleware

    // Check if user already exists
    let user = await User.findOne({ email });
    if (user) {
      console.log('User already exists with email:', email);
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    // Check if username is taken
    user = await User.findOne({ username });
    if (user) {
      console.log('Username already taken:', username);
      return res.status(400).json({ message: 'Username already taken' });
    }

    // Create new user
    user = new User({
      username,
      firstName,
      lastName,
      email,
      mobileNumber,
      password,
      isAdmin: req.body.isAdmin || false // Set isAdmin based on request or default to false
    });

    console.log('Saving new user:', { username, firstName, lastName, email, mobileNumber });
    await user.save();
    console.log('User saved successfully with ID:', user._id);

    res.status(201).json({
      success: true,
      user: {
        id: user._id,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        mobileNumber: user.mobileNumber,
        isAdmin: user.isAdmin,
        isActive: user.isActive
      }
    });
  } catch (error) {
    console.error('Error creating user:', error);
    // Send more detailed error message
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      return res.status(400).json({ message: messages.join(', ') });
    } else if (error.code === 11000) {
      return res.status(400).json({ message: 'Duplicate key error - username or email already exists' });
    }
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
});

// @route   GET /api/auth/users
// @desc    Get all users (Admin only)
// @access  Private/Admin
router.get('/users', protect, admin, async (req, res) => {
  try {

    const users = await User.find({}).select('-password');

    res.json({
      success: true,
      users
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/auth/users/:id
// @desc    Update a user (Admin only)
// @access  Private/Admin
router.put('/users/:id', protect, admin, async (req, res) => {
  try {
    console.log('Updating user - Request body:', req.body);
    const { username, firstName, lastName, email, mobileNumber, password } = req.body;
    const userId = req.params.id;

    // Find the user to update
    let user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if required fields are present
    if (!username || !firstName || !lastName || !email || !mobileNumber) {
      console.log('Missing required fields');
      return res.status(400).json({ message: 'Please provide username, first name, last name, email, and mobile number' });
    }

    // Validate mobile number format
    const mobileRegex = /^[0-9]{10}$/;
    if (!mobileRegex.test(mobileNumber)) {
      console.log('Invalid mobile number format:', mobileNumber);
      return res.status(400).json({ message: 'Please enter a valid 10-digit mobile number' });
    }

    // Check if email is being changed and if it's already in use by another user
    if (email !== user.email) {
      const emailExists = await User.findOne({ email, _id: { $ne: userId } });
      if (emailExists) {
        console.log('Email already in use:', email);
        return res.status(400).json({ message: 'Email already in use by another user' });
      }
    }

    // Check if username is being changed and if it's already taken by another user
    if (username !== user.username) {
      const usernameExists = await User.findOne({ username, _id: { $ne: userId } });
      if (usernameExists) {
        console.log('Username already taken:', username);
        return res.status(400).json({ message: 'Username already taken by another user' });
      }
    }

    // Update user fields
    user.username = username;
    user.firstName = firstName;
    user.lastName = lastName;
    user.email = email;
    user.mobileNumber = mobileNumber;

    // Update isAdmin status if provided
    if (req.body.isAdmin !== undefined) {
      user.isAdmin = req.body.isAdmin;
    }

    // Update isActive status if provided
    if (req.body.isActive !== undefined) {
      user.isActive = req.body.isActive;
    }

    // Only update password if provided
    if (password && password.length >= 6) {
      user.password = password;
    }

    console.log('Saving updated user:', { username, firstName, lastName, email, mobileNumber });
    await user.save();
    console.log('User updated successfully with ID:', user._id);

    res.json({
      success: true,
      user: {
        id: user._id,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        mobileNumber: user.mobileNumber,
        isAdmin: user.isAdmin,
        isActive: user.isActive
      }
    });
  } catch (error) {
    console.error('Error updating user:', error);
    // Send more detailed error message
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      return res.status(400).json({ message: messages.join(', ') });
    } else if (error.code === 11000) {
      return res.status(400).json({ message: 'Duplicate key error - username or email already exists' });
    }
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
});

// @route   DELETE /api/auth/users/:id
// @desc    Delete a user (Admin only)
// @access  Private/Admin
router.delete('/users/:id', protect, admin, async (req, res) => {
  try {
    const userId = req.params.id;

    // Prevent self-deletion
    if (userId === req.user._id.toString()) {
      return res.status(400).json({ message: 'You cannot delete your own account' });
    }

    // Find the user to delete
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Delete the user
    await User.findByIdAndDelete(userId);
    console.log('User deleted successfully with ID:', userId);

    res.json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
});

// @route   PATCH /api/auth/users/:id/toggle-status
// @desc    Toggle user active status (Admin only)
// @access  Private/Admin
router.patch('/users/:id/toggle-status', protect, admin, async (req, res) => {
  try {
    const userId = req.params.id;

    // Prevent self-deactivation
    if (userId === req.user._id.toString()) {
      return res.status(400).json({ message: 'You cannot change your own account status' });
    }

    // Find the user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Toggle the isActive status
    user.isActive = !user.isActive;

    await user.save();

    res.json({
      success: true,
      user: {
        id: user._id,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        mobileNumber: user.mobileNumber,
        isAdmin: user.isAdmin,
        isActive: user.isActive
      },
      message: `User ${user.isActive ? 'activated' : 'deactivated'} successfully`
    });
  } catch (error) {
    console.error('Error toggling user status:', error);
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
});

module.exports = router;
