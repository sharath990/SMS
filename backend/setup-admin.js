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
    const mongoUri = process.env.MONGO_URI;
    if (!mongoUri) throw new Error('MONGO_URI environment variable is required.');
    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 5000,
      maxPoolSize: 10
    });
    console.log('Connected to MongoDB');

    // Get admin credentials from environment variables
    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPassword = process.env.ADMIN_PASSWORD;
    const adminUsername = process.env.ADMIN_USERNAME;
    const adminFirstName = process.env.ADMIN_FIRSTNAME;
    const adminLastName = process.env.ADMIN_LASTNAME;
    const adminMobile = process.env.ADMIN_MOBILE;

    if (!adminEmail || !adminPassword) {
      throw new Error('ADMIN_EMAIL and ADMIN_PASSWORD environment variables are required.');
    }

    // Check if admin user exists
    const adminUser = await User.findOne({ email: adminEmail });

    if (adminUser) {
      console.log('Admin user already exists:', adminUser);
      // If admin user exists but doesn't have a username, update it
      if (!adminUser.username) {
        adminUser.username = adminUsername;
        await adminUser.save();
        console.log('Updated admin user with username');
      }
    } else {
      // Create admin user with all required fields
      const newAdmin = await User.create({
        username: adminUsername,
        firstName: adminFirstName,
        lastName: adminLastName,
        email: adminEmail,
        password: adminPassword, // plain password, will be hashed by pre-save hook
        mobileNumber: adminMobile,
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
