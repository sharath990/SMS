const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Import User model
const User = require('./models/User');

async function resetAdminPassword() {
  try {
    // Connect to MongoDB
    const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/mes_sms';
    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 5000,
      maxPoolSize: 10
    });
    console.log('Connected to MongoDB');

    // Find admin user
    const adminUser = await User.findOne({ email: 'admin@example.com' });

    if (adminUser) {
      console.log('Found admin user:', adminUser.username);
      
      // Generate new password hash
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('password123', salt);
      
      // Update password directly in the database to bypass any middleware
      const result = await User.updateOne(
        { _id: adminUser._id },
        { $set: { password: hashedPassword } }
      );
      
      console.log('Password reset result:', result);
      console.log('Admin password has been reset to "password123"');
    } else {
      console.log('Admin user not found');
    }

    // Disconnect from MongoDB
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  } catch (error) {
    console.error('Error resetting admin password:', error);
  }
}

// Run the reset function
resetAdminPassword();
