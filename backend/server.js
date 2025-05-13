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
    const mongoUri = process.env.MONGO_URI || 'mongodb+srv://meschaitanya:admin@meschaitanya.3zzdbhu.mongodb.net/mes_sms?retryWrites=true&w=majority&appName=meschaitanya';

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

    // Run database seeders
    try {
      // Check if SEED_DATABASE environment variable is set to true
      if (process.env.SEED_DATABASE === 'true') {
        console.log('🌱 Database seeding enabled');
        const { runSeeders } = require('./seeders/index');
        await runSeeders();
      } else {
        console.log('Database seeding disabled. Set SEED_DATABASE=true in .env to enable.');
      }
    } catch (seedError) {
      console.error('Error running database seeders:', seedError);
      // Continue server operation even if seeding fails
    }
  } catch (error) {
    console.error('Error starting server:', error);
    process.exit(1);
  }
}

// Start the server
startServer();

