const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables from .env file
dotenv.config({ path: path.resolve(__dirname, '..', '.env') });

// Get MongoDB URI from environment variables or use default
const db = process.env.MONGO_URI || 'mongodb://localhost:27017/mes_sms';

// Connect to MongoDB
mongoose.connect(db, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('MongoDB Connected...'))
.catch(err => {
  console.error('MongoDB Connection Error:', err);
  process.exit(1);
});

// Import the old and new models
const ClassTiming = require('../models/ClassTiming');

// Migration function
const migrateClassTimings = async () => {
  try {
    console.log('Starting class timing migration...');

    // Check if the collection exists
    const collections = await mongoose.connection.db.listCollections({ name: 'classtimings' }).toArray();
    if (collections.length === 0) {
      console.log('No class timings collection found. Creating a new one with the updated schema.');
      process.exit(0);
    }

    // Get all class timings from the database
    const classTimings = await mongoose.connection.db.collection('classtimings').find({}).toArray();

    console.log(`Found ${classTimings.length} class timings to migrate`);

    if (classTimings.length === 0) {
      console.log('No class timings to migrate. Exiting.');
      process.exit(0);
    }

    // Create a backup of the collection
    console.log('Creating backup of existing collection...');
    await mongoose.connection.db.collection('classtimings').aggregate([
      { $match: {} },
      { $out: 'classtimings_backup' }
    ]).toArray();
    console.log('Backup created as classtimings_backup');

    // Drop the existing collection to start fresh
    await mongoose.connection.db.collection('classtimings').drop();
    console.log('Dropped existing collection');

    // Create new class timings with the updated schema
    for (const oldTiming of classTimings) {
      try {
        // Generate a name based on the old data
        const name = `Period ${oldTiming.period} (${oldTiming.startTime} - ${oldTiming.endTime})`;

        // Create description from old fields
        let description = '';
        if (oldTiming.stream) description += `Stream: ${oldTiming.stream}, `;
        if (oldTiming.class) description += `Class: ${oldTiming.class}, `;
        if (oldTiming.section) description += `Section: ${oldTiming.section}, `;
        if (oldTiming.dayOfWeek) description += `Day: ${oldTiming.dayOfWeek}`;

        // Create new class timing
        const newTiming = new ClassTiming({
          _id: oldTiming._id, // Keep the same ID
          name,
          period: oldTiming.period || 1,
          startTime: oldTiming.startTime || '00:00',
          endTime: oldTiming.endTime || '00:00',
          description: description.trim(),
          isActive: oldTiming.isActive !== undefined ? oldTiming.isActive : true,
          createdAt: oldTiming.createdAt || new Date(),
          updatedAt: new Date()
        });

        await newTiming.save();
        console.log(`Migrated: ${name}`);
      } catch (err) {
        console.error(`Error migrating timing with ID ${oldTiming._id}:`, err.message);
        // Continue with the next timing
      }
    }

    console.log('Migration completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    console.log('You can restore the backup by running:');
    console.log('db.classtimings_backup.aggregate([{ $match: {} }, { $out: "classtimings" }])');
    process.exit(1);
  }
};

// Run the migration
migrateClassTimings();
