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
const passwordResetRoutes = require('./routes/passwordReset');

// Load environment variables
dotenv.config();

// Initialize Express
const app = express();

// Middleware
// CORS: In production, restrict origin to your frontend domain
app.use(cors({
  origin: process.env.CORS_ORIGIN , // Set CORS_ORIGIN in .env for production
  credentials: true
}));

// Security: Add helmet for secure HTTP headers in production
const helmet = require('helmet');
app.use(helmet());

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
app.use('/api/password-reset', passwordResetRoutes);

// Home route
app.get('/', (req, res) => {
  res.send('API is running...');
});

// Connect to MongoDB and start server
async function startServer() {
  try {
    // Get MongoDB URI from environment variables ONLY
    const mongoUri = process.env.MONGO_URI;
    if (!mongoUri) {
      throw new Error('MONGO_URI environment variable is required.');
    }

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
  } catch (error) {
    console.error('Error starting server:', error);
    process.exit(1);
  }
}

// Start the server
startServer();

