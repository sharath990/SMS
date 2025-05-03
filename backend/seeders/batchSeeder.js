const Batch = require('../models/Batch');

/**
 * Seed batches collection
 * @param {boolean} skipSeeding - Whether to skip seeding this collection
 */
const seed = async (skipSeeding) => {
  try {
    // Skip if batches already exist and we're not force seeding
    if (skipSeeding) {
      console.log('📚 Batches collection already has data, skipping seeder...');
      return;
    }

    console.log('📚 Seeding batches...');

    // Get current year
    const currentYear = new Date().getFullYear();

    // Create batches for the last 3 years and next year
    const batches = [
      {
        year: currentYear - 2,
        name: `Batch ${currentYear - 2}`,
        isGraduated: true,
        graduationDate: new Date(currentYear, 2, 31) // March 31st of the year
      },
      {
        year: currentYear - 1,
        name: `Batch ${currentYear - 1}`,
        isGraduated: true,
        graduationDate: new Date(currentYear, 2, 31) // March 31st of the year
      },
      {
        year: currentYear,
        name: `Batch ${currentYear}`,
        isGraduated: false
      },
      {
        year: currentYear + 1,
        name: `Batch ${currentYear + 1}`,
        isGraduated: false
      }
    ];

    // Save batches to database
    await Batch.insertMany(batches);

    console.log('✅ Batches seeded successfully!');
  } catch (error) {
    console.error('❌ Error seeding batches:', error);
  }
};

module.exports = { seed };
