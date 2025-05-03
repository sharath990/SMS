const Class = require('../models/Class');

/**
 * Seed classes collection
 * @param {boolean} skipSeeding - Whether to skip seeding this collection
 */
const seed = async (skipSeeding) => {
  try {
    // Skip if classes already exist and we're not force seeding
    if (skipSeeding) {
      console.log('🏫 Classes collection already has data, skipping seeder...');
      return;
    }

    console.log('🏫 Seeding classes...');

    // Get current year
    const currentYear = new Date().getFullYear();
    const academicYear = `${currentYear}-${currentYear + 1}`;

    // Create classes for Science and Commerce streams
    const classes = [
      // Science 1st PUC
      {
        name: 'Science 1st PUC A',
        stream: 'Science',
        level: '1st PUC',
        section: 'A',
        academicYear,
        isActive: true
      },
      {
        name: 'Science 1st PUC B',
        stream: 'Science',
        level: '1st PUC',
        section: 'B',
        academicYear,
        isActive: true
      },
      {
        name: 'Science 1st PUC C',
        stream: 'Science',
        level: '1st PUC',
        section: 'C',
        academicYear,
        isActive: true
      },

      // Science 2nd PUC
      {
        name: 'Science 2nd PUC A',
        stream: 'Science',
        level: '2nd PUC',
        section: 'A',
        academicYear,
        isActive: true
      },
      {
        name: 'Science 2nd PUC B',
        stream: 'Science',
        level: '2nd PUC',
        section: 'B',
        academicYear,
        isActive: true
      },

      // Commerce 1st PUC
      {
        name: 'Commerce 1st PUC A',
        stream: 'Commerce',
        level: '1st PUC',
        section: 'A',
        academicYear,
        isActive: true
      },
      {
        name: 'Commerce 1st PUC B',
        stream: 'Commerce',
        level: '1st PUC',
        section: 'B',
        academicYear,
        isActive: true
      },

      // Commerce 2nd PUC
      {
        name: 'Commerce 2nd PUC A',
        stream: 'Commerce',
        level: '2nd PUC',
        section: 'A',
        academicYear,
        isActive: true
      },
      {
        name: 'Commerce 2nd PUC B',
        stream: 'Commerce',
        level: '2nd PUC',
        section: 'B',
        academicYear,
        isActive: true
      }
    ];

    // Save classes to database
    await Class.insertMany(classes);

    console.log('✅ Classes seeded successfully!');
  } catch (error) {
    console.error('❌ Error seeding classes:', error);
  }
};

module.exports = { seed };
