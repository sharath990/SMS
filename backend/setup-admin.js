const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Import User model
const User = require('./models/User');

async function setupAdmin() {
  try {
    // Connect to MongoDB
    const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/mes_sms';
    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 5000,
      maxPoolSize: 10
    });
    console.log('Connected to MongoDB');

    // Check if admin user exists
    const adminUser = await User.findOne({ email: 'admin@example.com' });

    if (adminUser) {
      console.log('Admin user already exists:', adminUser);
      
      // If admin user exists but doesn't have a username, update it
      if (!adminUser.username) {
        adminUser.username = 'admin';
        await adminUser.save();
        console.log('Updated admin user with username');
      }
    } else {
      // Create admin user with all required fields
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('password123', salt);

      const newAdmin = await User.create({
        username: 'admin',
        firstName: 'Admin',
        lastName: 'User',
        email: 'admin@example.com',
        password: hashedPassword,
        mobileNumber: '1234567890',
        isAdmin: true
      });

      console.log('Admin user created:', newAdmin);
    }

    // Disconnect from MongoDB
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  } catch (error) {
    console.error('Error setting up admin user:', error);
  }
}

// Run the setup function
setupAdmin();
