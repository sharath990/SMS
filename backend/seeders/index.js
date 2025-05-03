const mongoose = require('mongoose');
const userSeeder = require('./userSeeder');
const studentSeeder = require('./studentSeeder');
const classSeeder = require('./classSeeder');
const batchSeeder = require('./batchSeeder');
const subjectSeeder = require('./subjectSeeder');
const classTimingSeeder = require('./classTimingSeeder');
const messageTemplateSeeder = require('./messageTemplateSeeder');

/**
 * Run all seeders in sequence
 */
const runSeeders = async () => {
  try {
    console.log('🌱 Starting database seeding...');

    // Get force seed option from environment variable
    const forceSeed = process.env.FORCE_SEED === 'true';

    if (forceSeed) {
      console.log('🔄 Force seeding enabled - will seed regardless of existing data');
    }

    // Check database collections
    const collections = await mongoose.connection.db.collections();
    const hasData = {};

    for (const collection of collections) {
      const count = await collection.countDocuments();
      hasData[collection.collectionName] = count > 0;

      if (count > 0 && forceSeed) {
        console.log(`Collection ${collection.collectionName} has ${count} documents - will be cleared and reseeded`);
        // Clear collection if force seeding is enabled
        await collection.deleteMany({});
        hasData[collection.collectionName] = false;
      } else if (count > 0) {
        console.log(`Collection ${collection.collectionName} has ${count} documents`);
      }
    }

    // Run all seeders - they will check if they should seed based on hasData and forceSeed
    await userSeeder.seed(hasData.users && !forceSeed);
    await batchSeeder.seed(hasData.batches && !forceSeed);
    await classSeeder.seed(hasData.classes && !forceSeed);
    await subjectSeeder.seed(hasData.subjects && !forceSeed);
    await classTimingSeeder.seed(hasData.classtimings && !forceSeed);
    await studentSeeder.seed(hasData.students && !forceSeed);
    await messageTemplateSeeder.seed(hasData.messagetemplates && !forceSeed);

    console.log('✅ Database seeding completed successfully!');
  } catch (error) {
    console.error('❌ Error seeding database:', error);
  }
};

module.exports = { runSeeders };
