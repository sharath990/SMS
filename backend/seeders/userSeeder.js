const User = require('../models/User');
const bcrypt = require('bcryptjs');

/**
 * Seed users collection
 * @param {boolean} skipSeeding - Whether to skip seeding this collection
 */
const seed = async (skipSeeding) => {
  try {
    // Skip if users already exist and we're not force seeding
    if (skipSeeding) {
      console.log('👤 Users collection already has data, skipping seeder...');
      return;
    }

    console.log('👤 Seeding users...');

    // Hash password for users
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('password123', salt);

    // Create admin user
    const adminUser = new User({
      username: 'admin',
      firstName: 'Admin',
      lastName: 'User',
      email: 'admin@example.com',
      password: hashedPassword,
      mobileNumber: '9876543210',
      isAdmin: true
    });

    // Create regular user
    const regularUser = new User({
      username: 'teacher',
      firstName: 'Teacher',
      lastName: 'User',
      email: 'teacher@example.com',
      password: hashedPassword,
      mobileNumber: '9876543211',
      isAdmin: false
    });

    // Create principal user
    const principalUser = new User({
      username: 'principal',
      firstName: 'Principal',
      lastName: 'User',
      email: 'principal@example.com',
      password: hashedPassword,
      mobileNumber: '9876543212',
      isAdmin: true
    });

    // Save users to database
    await User.insertMany([adminUser, regularUser, principalUser]);

    console.log('✅ Users seeded successfully!');
  } catch (error) {
    console.error('❌ Error seeding users:', error);
  }
};

module.exports = { seed };
