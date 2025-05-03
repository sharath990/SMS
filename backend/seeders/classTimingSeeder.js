const ClassTiming = require('../models/ClassTiming');

/**
 * Seed class timings collection
 * @param {boolean} skipSeeding - Whether to skip seeding this collection
 */
const seed = async (skipSeeding) => {
  try {
    // Skip if class timings already exist and we're not force seeding
    if (skipSeeding) {
      console.log('⏰ Class timings collection already has data, skipping seeder...');
      return;
    }

    console.log('⏰ Seeding class timings...');

    // Create class timings
    const classTimings = [
      {
        name: 'Period 1',
        period: 1,
        startTime: '09:00 AM',
        endTime: '09:50 AM',
        description: 'First period of the day',
        isActive: true
      },
      {
        name: 'Period 2',
        period: 2,
        startTime: '09:50 AM',
        endTime: '10:40 AM',
        description: 'Second period',
        isActive: true
      },
      {
        name: 'Period 3',
        period: 3,
        startTime: '10:40 AM',
        endTime: '11:30 AM',
        description: 'Third period',
        isActive: true
      },
      {
        name: 'Break',
        period: 99,
        startTime: '11:30 AM',
        endTime: '11:45 AM',
        description: 'Morning break',
        isActive: true
      },
      {
        name: 'Period 4',
        period: 4,
        startTime: '11:45 AM',
        endTime: '12:35 PM',
        description: 'Fourth period',
        isActive: true
      },
      {
        name: 'Period 5',
        period: 5,
        startTime: '12:35 PM',
        endTime: '01:25 PM',
        description: 'Fifth period',
        isActive: true
      },
      {
        name: 'Lunch',
        period: 98,
        startTime: '01:25 PM',
        endTime: '02:10 PM',
        description: 'Lunch break',
        isActive: true
      },
      {
        name: 'Period 6',
        period: 6,
        startTime: '02:10 PM',
        endTime: '03:00 PM',
        description: 'Sixth period',
        isActive: true
      },
      {
        name: 'Period 7',
        period: 7,
        startTime: '03:00 PM',
        endTime: '03:50 PM',
        description: 'Seventh period',
        isActive: true
      },
      {
        name: 'Period 8',
        period: 8,
        startTime: '03:50 PM',
        endTime: '04:40 PM',
        description: 'Eighth period',
        isActive: true
      }
    ];

    // Save class timings to database
    await ClassTiming.insertMany(classTimings);

    console.log('✅ Class timings seeded successfully!');
  } catch (error) {
    console.error('❌ Error seeding class timings:', error);
  }
};

module.exports = { seed };
