const MessageTemplate = require('../models/MessageTemplate');
const User = require('../models/User');

/**
 * Seed message templates collection
 * @param {boolean} skipSeeding - Whether to skip seeding this collection
 */
const seed = async (skipSeeding) => {
  try {
    // Skip if message templates already exist and we're not force seeding
    if (skipSeeding) {
      console.log('📝 Message templates collection already has data, skipping seeder...');
      return;
    }

    console.log('📝 Seeding message templates...');

    // Get admin user for createdBy field
    const adminUser = await User.findOne({ isAdmin: true });

    if (!adminUser) {
      console.error('❌ Admin user not found. Please run user seeder first.');
      return;
    }

    // Create message templates
    const messageTemplates = [
      // Absence templates
      {
        name: 'Student Absence Notification',
        type: 'SMS',
        category: 'Absence',
        content: 'Dear [PARENT_NAME], this is to inform you that [STUDENT_NAME] was absent from college today. Please ensure regular attendance. - MES Chaitanya PU College',
        variables: ['PARENT_NAME', 'STUDENT_NAME'],
        isActive: true,
        createdBy: adminUser._id
      },
      {
        name: 'Continuous Absence Warning',
        type: 'SMS',
        category: 'Absence',
        content: 'Dear [PARENT_NAME], [STUDENT_NAME] has been absent for multiple days. Please contact the college immediately. - MES Chaitanya PU College',
        variables: ['PARENT_NAME', 'STUDENT_NAME'],
        isActive: true,
        createdBy: adminUser._id
      },

      // Announcement templates
      {
        name: 'General Announcement',
        type: 'Both',
        category: 'Announcement',
        content: 'Dear [PARENT_NAME], this is an important announcement from MES Chaitanya PU College: [ANNOUNCEMENT_TEXT]. Thank you.',
        variables: ['PARENT_NAME', 'ANNOUNCEMENT_TEXT'],
        isActive: true,
        createdBy: adminUser._id
      },
      {
        name: 'Holiday Announcement',
        type: 'SMS',
        category: 'Announcement',
        content: 'Dear [PARENT_NAME], please note that MES Chaitanya PU College will remain closed on [DATE] due to [REASON]. Classes will resume on the next working day.',
        variables: ['PARENT_NAME', 'DATE', 'REASON'],
        isActive: true,
        createdBy: adminUser._id
      },

      // Event templates
      {
        name: 'College Event Invitation',
        type: 'WhatsApp',
        category: 'Event',
        content: 'Dear [PARENT_NAME], MES Chaitanya PU College invites you to [EVENT_NAME] on [DATE] at [TIME]. We look forward to your presence.',
        variables: ['PARENT_NAME', 'EVENT_NAME', 'DATE', 'TIME'],
        isActive: true,
        createdBy: adminUser._id
      },
      {
        name: 'Sports Day Notification',
        type: 'SMS',
        category: 'Event',
        content: 'Dear [PARENT_NAME], MES Chaitanya PU College is organizing Annual Sports Day on [DATE]. [STUDENT_NAME] is participating in [SPORT_EVENT]. Your presence is requested.',
        variables: ['PARENT_NAME', 'STUDENT_NAME', 'DATE', 'SPORT_EVENT'],
        isActive: true,
        createdBy: adminUser._id
      },

      // Exam templates
      {
        name: 'Exam Schedule Notification',
        type: 'Both',
        category: 'Exam',
        content: 'Dear [PARENT_NAME], the [EXAM_NAME] for [STUDENT_NAME] will begin from [DATE]. Please ensure proper preparation. Timetable has been shared with students. - MES Chaitanya PU College',
        variables: ['PARENT_NAME', 'STUDENT_NAME', 'EXAM_NAME', 'DATE'],
        isActive: true,
        createdBy: adminUser._id
      },
      {
        name: 'Exam Result Notification',
        type: 'SMS',
        category: 'Exam',
        content: 'Dear [PARENT_NAME], [STUDENT_NAME]\'s results for [EXAM_NAME] are now available. Please collect the report card on [DATE] between [TIME]. - MES Chaitanya PU College',
        variables: ['PARENT_NAME', 'STUDENT_NAME', 'EXAM_NAME', 'DATE', 'TIME'],
        isActive: true,
        createdBy: adminUser._id
      },

      // Fee templates
      {
        name: 'Fee Payment Reminder',
        type: 'SMS',
        category: 'Fee',
        content: 'Dear [PARENT_NAME], this is a reminder that [STUDENT_NAME]\'s fee payment of Rs.[AMOUNT] for [TERM] is due on [DUE_DATE]. Please make the payment on time. - MES Chaitanya PU College',
        variables: ['PARENT_NAME', 'STUDENT_NAME', 'AMOUNT', 'TERM', 'DUE_DATE'],
        isActive: true,
        createdBy: adminUser._id
      },
      {
        name: 'Fee Payment Confirmation',
        type: 'SMS',
        category: 'Fee',
        content: 'Dear [PARENT_NAME], we have received the fee payment of Rs.[AMOUNT] for [STUDENT_NAME] for [TERM]. Receipt No: [RECEIPT_NO]. Thank you. - MES Chaitanya PU College',
        variables: ['PARENT_NAME', 'STUDENT_NAME', 'AMOUNT', 'TERM', 'RECEIPT_NO'],
        isActive: true,
        createdBy: adminUser._id
      },

      // Other templates
      {
        name: 'Parent-Teacher Meeting',
        type: 'Both',
        category: 'Other',
        content: 'Dear [PARENT_NAME], a Parent-Teacher Meeting is scheduled on [DATE] at [TIME]. Your presence is important to discuss [STUDENT_NAME]\'s academic progress. - MES Chaitanya PU College',
        variables: ['PARENT_NAME', 'STUDENT_NAME', 'DATE', 'TIME'],
        isActive: true,
        createdBy: adminUser._id
      },
      {
        name: 'College Reopening',
        type: 'SMS',
        category: 'Other',
        content: 'Dear [PARENT_NAME], MES Chaitanya PU College will reopen after [HOLIDAY_NAME] on [DATE]. Regular classes will commence from [TIME]. - MES Chaitanya PU College',
        variables: ['PARENT_NAME', 'HOLIDAY_NAME', 'DATE', 'TIME'],
        isActive: true,
        createdBy: adminUser._id
      }
    ];

    // Save message templates to database
    await MessageTemplate.insertMany(messageTemplates);

    console.log('✅ Message templates seeded successfully!');
  } catch (error) {
    console.error('❌ Error seeding message templates:', error);
  }
};

module.exports = { seed };
