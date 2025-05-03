const Subject = require('../models/Subject');

/**
 * Seed subjects collection
 * @param {boolean} skipSeeding - Whether to skip seeding this collection
 */
const seed = async (skipSeeding) => {
  try {
    // Skip if subjects already exist and we're not force seeding
    if (skipSeeding) {
      console.log('📖 Subjects collection already has data, skipping seeder...');
      return;
    }

    console.log('📖 Seeding subjects...');

    // Create subjects for Science and Commerce streams
    const subjects = [
      // Common subjects for both streams
      {
        name: 'English',
        code: 'ENG',
        stream: 'Both',
        description: 'English language and literature',
        isActive: true
      },
      {
        name: 'Kannada',
        code: 'KAN',
        stream: 'Both',
        description: 'Kannada language and literature',
        isActive: true
      },
      {
        name: 'Hindi',
        code: 'HIN',
        stream: 'Both',
        description: 'Hindi language and literature',
        isActive: true
      },

      // Science subjects
      {
        name: 'Physics',
        code: 'PHY',
        stream: 'Science',
        description: 'Study of matter, energy, and the interaction between them',
        isActive: true
      },
      {
        name: 'Chemistry',
        code: 'CHE',
        stream: 'Science',
        description: 'Study of the composition, structure, properties, and change of matter',
        isActive: true
      },
      {
        name: 'Mathematics',
        code: 'MAT',
        stream: 'Science',
        description: 'Study of numbers, quantity, structure, space, and change',
        isActive: true
      },
      {
        name: 'Biology',
        code: 'BIO',
        stream: 'Science',
        description: 'Study of living organisms and their interactions',
        isActive: true
      },
      {
        name: 'Computer Science',
        code: 'CS',
        stream: 'Science',
        description: 'Study of computers and computational systems',
        isActive: true
      },

      // Commerce subjects
      {
        name: 'Accountancy',
        code: 'ACC',
        stream: 'Commerce',
        description: 'Study of recording financial transactions',
        isActive: true
      },
      {
        name: 'Business Studies',
        code: 'BUS',
        stream: 'Commerce',
        description: 'Study of business organizations and management',
        isActive: true
      },
      {
        name: 'Economics',
        code: 'ECO',
        stream: 'Commerce',
        description: 'Study of production, distribution, and consumption of goods and services',
        isActive: true
      },
      {
        name: 'Statistics',
        code: 'STA',
        stream: 'Commerce',
        description: 'Study of collection, analysis, interpretation, and presentation of data',
        isActive: true
      }
    ];

    // Save subjects to database
    await Subject.insertMany(subjects);

    console.log('✅ Subjects seeded successfully!');
  } catch (error) {
    console.error('❌ Error seeding subjects:', error);
  }
};

module.exports = { seed };
