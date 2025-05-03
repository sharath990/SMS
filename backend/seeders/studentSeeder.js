const Student = require('../models/Student');
const mongoose = require('mongoose');

/**
 * Seed students collection
 * @param {boolean} skipSeeding - Whether to skip seeding this collection
 */
const seed = async (skipSeeding) => {
  try {
    // Skip if students already exist and we're not force seeding
    if (skipSeeding) {
      console.log('👨‍🎓 Students collection already has data, skipping seeder...');
      return;
    }

    console.log('👨‍🎓 Seeding students...');

    // Get current year for batch
    const currentYear = new Date().getFullYear();

    // Generate random students for each stream, class, and section
    const students = [];

    // First names pool
    const firstNames = [
      'Aarav', 'Aditi', 'Akshay', 'Ananya', 'Arjun', 'Diya', 'Ishaan', 'Kavya',
      'Manish', 'Neha', 'Pranav', 'Priya', 'Rahul', 'Riya', 'Rohan', 'Sanya',
      'Siddharth', 'Tanvi', 'Varun', 'Zara', 'Vikram', 'Meera', 'Karan', 'Nisha',
      'Aditya', 'Pooja', 'Raj', 'Simran', 'Aryan', 'Aisha'
    ];

    // Last names pool
    const lastNames = [
      'Sharma', 'Patel', 'Singh', 'Kumar', 'Joshi', 'Gupta', 'Desai', 'Reddy',
      'Nair', 'Menon', 'Iyer', 'Rao', 'Verma', 'Malhotra', 'Chopra', 'Agarwal',
      'Bhat', 'Hegde', 'Kamath', 'Shetty', 'Gowda', 'Iyengar', 'Pillai', 'Mukherjee',
      'Banerjee', 'Chatterjee', 'Das', 'Sen', 'Bose', 'Dutta'
    ];

    // Parent names pool
    const parentNames = [
      'Mr. & Mrs. Sharma', 'Mr. & Mrs. Patel', 'Mr. & Mrs. Singh', 'Mr. & Mrs. Kumar',
      'Mr. & Mrs. Joshi', 'Mr. & Mrs. Gupta', 'Mr. & Mrs. Desai', 'Mr. & Mrs. Reddy',
      'Mr. & Mrs. Nair', 'Mr. & Mrs. Menon', 'Mr. & Mrs. Iyer', 'Mr. & Mrs. Rao',
      'Mr. & Mrs. Verma', 'Mr. & Mrs. Malhotra', 'Mr. & Mrs. Chopra', 'Mr. & Mrs. Agarwal',
      'Dr. & Mrs. Bhat', 'Dr. & Mrs. Hegde', 'Dr. & Mrs. Kamath', 'Dr. & Mrs. Shetty',
      'Dr. & Mrs. Gowda', 'Dr. & Mrs. Iyengar', 'Dr. & Mrs. Pillai', 'Dr. & Mrs. Mukherjee',
      'Mr. & Dr. Banerjee', 'Mr. & Dr. Chatterjee', 'Mr. & Dr. Das', 'Mr. & Dr. Sen',
      'Prof. & Mrs. Bose', 'Prof. & Mrs. Dutta'
    ];

    // Generate random 10-digit mobile number
    const generateMobile = () => {
      return '9' + Math.floor(Math.random() * 9000000000 + 1000000000).toString().substring(1);
    };

    // Generate random email
    const generateEmail = (firstName, lastName) => {
      return `${firstName.toLowerCase()}.${lastName.toLowerCase()}@example.com`;
    };

    // Generate random address
    const generateAddress = () => {
      const doorNumbers = ['123', '456', '789', '234', '567', '890', '345', '678', '901', '432'];
      const streets = ['MG Road', 'Brigade Road', 'Residency Road', 'Church Street', 'Commercial Street', 'Infantry Road', 'Cunningham Road', 'Richmond Road', 'Lavelle Road', 'St. Marks Road'];
      const areas = ['Indiranagar', 'Koramangala', 'Jayanagar', 'JP Nagar', 'Malleswaram', 'Rajajinagar', 'Basavanagudi', 'Banashankari', 'Whitefield', 'Electronic City'];
      const cities = ['Bangalore', 'Mysore', 'Mangalore', 'Hubli', 'Belgaum', 'Gulbarga', 'Shimoga', 'Udupi', 'Dharwad', 'Davangere'];

      return `${doorNumbers[Math.floor(Math.random() * 10)]}, ${streets[Math.floor(Math.random() * 10)]}, ${areas[Math.floor(Math.random() * 10)]}, ${cities[Math.floor(Math.random() * 10)]} - ${Math.floor(Math.random() * 900000 + 100000)}`;
    };

    // Generate students for Science stream
    // 1st PUC - Sections A, B, C
    for (let section of ['A', 'B', 'C']) {
      // Generate 20-30 students per section
      const studentCount = Math.floor(Math.random() * 11 + 20); // 20-30 students

      for (let i = 0; i < studentCount; i++) {
        const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
        const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
        const parentName = parentNames[Math.floor(Math.random() * parentNames.length)];
        const mobile = generateMobile();

        students.push({
          rollNumber: 100 + students.length, // Start from 100
          firstName,
          lastName,
          stream: 'Science',
          class: '1st PUC',
          section,
          batch: currentYear,
          isActive: true,
          parentName,
          parentMobile: mobile,
          parentWhatsApp: mobile,
          parentEmail: generateEmail(firstName, lastName),
          address: generateAddress()
        });
      }
    }

    // 2nd PUC - Sections A, B
    for (let section of ['A', 'B']) {
      // Generate 20-30 students per section
      const studentCount = Math.floor(Math.random() * 11 + 20); // 20-30 students

      for (let i = 0; i < studentCount; i++) {
        const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
        const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
        const parentName = parentNames[Math.floor(Math.random() * parentNames.length)];
        const mobile = generateMobile();

        students.push({
          rollNumber: 100 + students.length, // Continue from last number
          firstName,
          lastName,
          stream: 'Science',
          class: '2nd PUC',
          section,
          batch: currentYear - 1,
          isActive: true,
          parentName,
          parentMobile: mobile,
          parentWhatsApp: mobile,
          parentEmail: generateEmail(firstName, lastName),
          address: generateAddress()
        });
      }
    }

    // Generate students for Commerce stream
    // 1st PUC - Sections A, B
    for (let section of ['A', 'B']) {
      // Generate 20-30 students per section
      const studentCount = Math.floor(Math.random() * 11 + 20); // 20-30 students

      for (let i = 0; i < studentCount; i++) {
        const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
        const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
        const parentName = parentNames[Math.floor(Math.random() * parentNames.length)];
        const mobile = generateMobile();

        students.push({
          rollNumber: 100 + students.length, // Continue from last number
          firstName,
          lastName,
          stream: 'Commerce',
          class: '1st PUC',
          section,
          batch: currentYear,
          isActive: true,
          parentName,
          parentMobile: mobile,
          parentWhatsApp: mobile,
          parentEmail: generateEmail(firstName, lastName),
          address: generateAddress()
        });
      }
    }

    // 2nd PUC - Sections A, B
    for (let section of ['A', 'B']) {
      // Generate 20-30 students per section
      const studentCount = Math.floor(Math.random() * 11 + 20); // 20-30 students

      for (let i = 0; i < studentCount; i++) {
        const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
        const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
        const parentName = parentNames[Math.floor(Math.random() * parentNames.length)];
        const mobile = generateMobile();

        students.push({
          rollNumber: 100 + students.length, // Continue from last number
          firstName,
          lastName,
          stream: 'Commerce',
          class: '2nd PUC',
          section,
          batch: currentYear - 1,
          isActive: true,
          parentName,
          parentMobile: mobile,
          parentWhatsApp: mobile,
          parentEmail: generateEmail(firstName, lastName),
          address: generateAddress()
        });
      }
    }

    // Save students to database
    await Student.insertMany(students);

    console.log(`✅ ${students.length} students seeded successfully!`);
  } catch (error) {
    console.error('❌ Error seeding students:', error);
  }
};

module.exports = { seed };
