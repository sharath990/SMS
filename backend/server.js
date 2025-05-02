const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Import routes
const authRoutes = require('./routes/auth');
const studentRoutes = require('./routes/students');
const classRoutes = require('./routes/classes');
const batchRoutes = require('./routes/batches');
const importRoutes = require('./routes/import');
const messageTemplateRoutes = require('./routes/messageTemplates');
const messagingRoutes = require('./routes/messaging');
const subjectRoutes = require('./routes/subjects');
const classTimingRoutes = require('./routes/classTimings');

// Load environment variables
dotenv.config();

// Initialize Express
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/classes', classRoutes);
app.use('/api/batches', batchRoutes);
app.use('/api/import', importRoutes);
app.use('/api/message-templates', messageTemplateRoutes);
app.use('/api/messaging', messagingRoutes);
app.use('/api/subjects', subjectRoutes);
app.use('/api/class-timings', classTimingRoutes);

// Home route
app.get('/', (req, res) => {
  res.send('API is running...');
});

// Connect to MongoDB and start server
async function startServer() {
  try {
    // Get MongoDB URI from environment variables or use default
    const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/mes_sms';

    // Connect to MongoDB with improved options
    await mongoose.connect(mongoUri, {
      // These options help with connection stability
      serverSelectionTimeoutMS: 5000,
      maxPoolSize: 10
    });
    console.log('Connected to MongoDB');

    // Start Express server
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });

    // Check for admin user
    try {
      const User = require('./models/User');
      const adminUser = await User.findOne({ email: 'admin@example.com' });

      if (!adminUser) {
        const bcrypt = require('bcryptjs');
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('password123', salt);

        await User.create({
          username: 'admin',
          firstName: 'Admin',
          lastName: 'User',
          email: 'admin@example.com',
          password: hashedPassword,
          mobileNumber: '1234567890',
          isAdmin: true
        });

        console.log('Admin user created');
      } else {
        console.log('Admin user already exists');
      }
    } catch (userError) {
      console.error('Error checking/creating admin user:', userError);
      // Continue server operation even if admin user creation fails
    }
  } catch (error) {
    console.error('Error starting server:', error);
    process.exit(1);
  }
}

// Start the server
startServer();

