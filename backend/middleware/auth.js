const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  let token;

  // Check if token exists in headers
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.headers['x-auth-token']) {
    token = req.headers['x-auth-token'];
  }

  // If no token found
  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token' });
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'mes_chaitanya_sms_secret_key_change_in_production');

    // Add user to request object
    req.user = await User.findById(decoded.id).select('-password');

    if (!req.user) {
      return res.status(404).json({ message: 'User not found' });
    }

    next();
  } catch (error) {
    console.error(error);
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Not authorized, token failed' });
    }
    res.status(500).json({ message: 'Server error' });
  }
};

// Admin middleware
const admin = (req, res, next) => {
  console.log('Admin middleware check');
  console.log('User:', req.user);
  console.log('Is admin?', req.user?.isAdmin);

  if (req.user && req.user.isAdmin) {
    console.log('User is admin, proceeding to next middleware');
    next();
  } else {
    console.log('User is not admin, returning 401');
    res.status(401).json({ message: 'Not authorized as an admin' });
  }
};

module.exports = { protect, admin };
