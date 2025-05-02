const express = require('express');
const MessageTemplate = require('../models/MessageTemplate');
const MessageHistory = require('../models/MessageHistory');
const Student = require('../models/Student');
const Subject = require('../models/Subject');
const ClassTiming = require('../models/ClassTiming');
const { protect, admin } = require('../middleware/auth');
const router = express.Router();

// @route   GET /api/messaging/history
// @desc    Get message history
// @access  Private
router.get('/history', protect, async (req, res) => {
  try {
    // Extract query parameters for filtering
    const { messageType, targetType, status, search } = req.query;

    // Build filter object
    const filter = {};

    if (messageType) filter.messageType = messageType;
    if (targetType) filter.targetType = targetType;
    if (status) filter['recipients.status'] = status;

    // Add search functionality
    if (search) {
      filter.$or = [
        { content: { $regex: search, $options: 'i' } }
      ];
    }

    // Get pagination parameters
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Get sorting parameters
    const sortField = req.query.sortField || 'sentAt';
    const sortOrder = req.query.sortOrder === 'desc' ? -1 : 1;
    const sort = { [sortField]: sortOrder };

    // Execute query with pagination and sorting
    const messages = await MessageHistory.find(filter)
      .populate('templateId', 'name type category')
      .populate('sentBy', 'username firstName lastName')
      .populate('recipients.student', 'rollNumber firstName lastName')
      .sort(sort)
      .skip(skip)
      .limit(limit);

    // Get total count for pagination
    const total = await MessageHistory.countDocuments(filter);

    res.json({
      success: true,
      count: messages.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      data: messages
    });
  } catch (error) {
    console.error('Error fetching message history:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/messaging/history/:id
// @desc    Get message history by ID
// @access  Private
router.get('/history/:id', protect, async (req, res) => {
  try {
    const message = await MessageHistory.findById(req.params.id)
      .populate('templateId', 'name type category')
      .populate('sentBy', 'username firstName lastName')
      .populate('recipients.student', 'rollNumber firstName lastName parentMobile parentWhatsApp');

    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }

    res.json({
      success: true,
      data: message
    });
  } catch (error) {
    console.error('Error fetching message:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/messaging/send
// @desc    Send a new message
// @access  Private
router.post('/send', protect, async (req, res) => {
  try {
    const {
      messageType,
      templateId,
      content,
      targetType,
      targetDetails,
      recipientIds,
      subjectId,
      classTimingId
    } = req.body;

    // Validate required fields
    if (!messageType || !content || !targetType) {
      return res.status(400).json({ message: 'Message type, content, and target type are required' });
    }

    // Find recipients based on target type and details
    let students = [];

    if (targetType === 'Individual' && recipientIds && recipientIds.length > 0) {
      // Individual students selected directly
      students = await Student.find({ _id: { $in: recipientIds }, isActive: true })
        .select('_id firstName lastName rollNumber parentMobile parentWhatsApp class section stream');
    } else {
      // Build filter for finding students
      const filter = { isActive: true };

      // Handle single selections
      if (targetType === 'Section') {
        filter.stream = targetDetails.stream;
        filter.class = targetDetails.class;
        filter.section = targetDetails.section;
      } else if (targetType === 'Class') {
        filter.stream = targetDetails.stream;
        filter.class = targetDetails.class;
      } else if (targetType === 'Stream') {
        filter.stream = targetDetails.stream;
      } else if (targetType === 'Batch') {
        filter.batch = targetDetails.batch;
      }
      // Handle multiple selections
      else if (targetType === 'MultipleStreams' && targetDetails.streams && targetDetails.streams.length > 0) {
        filter.stream = { $in: targetDetails.streams };
      } else if (targetType === 'MultipleClasses' && targetDetails.classes && targetDetails.classes.length > 0) {
        filter.stream = targetDetails.stream;
        filter.class = { $in: targetDetails.classes };
      } else if (targetType === 'MultipleSections' && targetDetails.sections && targetDetails.sections.length > 0) {
        filter.stream = targetDetails.stream;
        filter.class = targetDetails.class;
        filter.section = { $in: targetDetails.sections };
      } else if (targetType === 'MultipleBatches' && targetDetails.batches && targetDetails.batches.length > 0) {
        filter.batch = { $in: targetDetails.batches };
      }

      // Find students matching the filter
      students = await Student.find(filter)
        .select('_id firstName lastName rollNumber parentMobile parentWhatsApp class section stream');
    }

    // If no recipients found, return error
    if (students.length === 0) {
      return res.status(400).json({ message: 'No recipients found for the selected criteria' });
    }

    // Get subject and class timing details if provided
    let subjectDetails = null;
    let classTimingDetails = null;

    if (subjectId) {
      subjectDetails = await Subject.findById(subjectId);
    }

    if (classTimingId) {
      classTimingDetails = await ClassTiming.findById(classTimingId);
    }

    // Process message content for each student (server-side variable replacement)
    const recipients = students.map(student => {
      // Create a copy of the content for this student
      let personalizedContent = content;

      // Replace placeholders with actual values
      personalizedContent = personalizedContent.replace(/\[STUDENT_NAME\]/g, `${student.firstName} ${student.lastName}`);
      personalizedContent = personalizedContent.replace(/\[ROLL_NUMBER\]/g, student.rollNumber);
      personalizedContent = personalizedContent.replace(/\[CLASS\]/g, student.class);
      personalizedContent = personalizedContent.replace(/\[SECTION\]/g, student.section);
      personalizedContent = personalizedContent.replace(/\[PARENT_NAME\]/g, student.parentName || 'Parent');
      personalizedContent = personalizedContent.replace(/\[DATE\]/g, new Date().toLocaleDateString());

      // Add subject-related placeholders if subject is provided
      if (subjectDetails) {
        personalizedContent = personalizedContent.replace(/\[SUBJECT_NAME\]/g, subjectDetails.name);
        personalizedContent = personalizedContent.replace(/\[SUBJECT_CODE\]/g, subjectDetails.code);
      }

      // Add class timing-related placeholders if class timing is provided
      if (classTimingDetails) {
        personalizedContent = personalizedContent.replace(/\[PERIOD_NUMBER\]/g, classTimingDetails.period.toString());
        personalizedContent = personalizedContent.replace(/\[PERIOD_TIME\]/g, `${classTimingDetails.startTime} - ${classTimingDetails.endTime}`);
        personalizedContent = personalizedContent.replace(/\[DAY_OF_WEEK\]/g, classTimingDetails.description || 'N/A');
        personalizedContent = personalizedContent.replace(/\[CLASS_TIMING_NAME\]/g, classTimingDetails.name);
      }

      return {
        student: student._id,
        status: 'Pending',
        content: personalizedContent,
        contactNumber: messageType === 'SMS' ? student.parentMobile : student.parentWhatsApp
      };
    });

    // Create new message history entry
    const messageHistory = new MessageHistory({
      messageType,
      templateId: templateId || null,
      content, // Original template
      recipients: recipients.map(r => ({
        student: r.student,
        status: r.status,
        personalizedContent: r.content,
        contactNumber: r.contactNumber
      })),
      targetType,
      targetDetails,
      subject: subjectId || null,
      classTiming: classTimingId || null,
      sentBy: req.user.id,
      sentAt: Date.now()
    });

    await messageHistory.save();

    // Import messaging service
    let messagingService;
    try {
      messagingService = require('../services/messagingService');
      console.log('Messaging service loaded successfully');
    } catch (error) {
      console.error('Error loading messaging service:', error);
      return res.status(500).json({
        message: 'Failed to load messaging service',
        error: error.message
      });
    }

    // Start a background process to send messages
    process.nextTick(async () => {
      try {
        console.log(`Starting to send ${recipients.length} messages...`);

        for (let i = 0; i < recipients.length; i++) {
          try {
            const recipient = recipients[i];
            let sendResult;

            // Validate contact number
            if (!recipient.contactNumber) {
              console.error(`Missing contact number for student ID ${recipient.student}`);

              // Update status to Failed
              await MessageHistory.updateOne(
                {
                  _id: messageHistory._id,
                  'recipients.student': recipient.student
                },
                {
                  $set: {
                    'recipients.$.status': 'Failed',
                    'recipients.$.error': 'Missing contact number'
                  }
                }
              );
              continue; // Skip to next recipient
            }

            // Send message based on message type
            if (messageType === 'SMS' || messageType === 'Both') {
              // Send SMS
              sendResult = await messagingService.sendSMS(
                recipient.contactNumber,
                recipient.content
              );

              if (sendResult.success) {
                console.log(`SMS sent to student ID ${recipient.student}: ${sendResult.sid}`);
              } else {
                console.error(`Failed to send SMS to student ID ${recipient.student}: ${sendResult.error}`);
              }
            }

            if (messageType === 'WhatsApp' || messageType === 'Both') {
              // Send WhatsApp message
              sendResult = await messagingService.sendWhatsApp(
                recipient.contactNumber,
                recipient.content
              );

              if (sendResult.success) {
                console.log(`WhatsApp message sent to student ID ${recipient.student}: ${sendResult.sid}`);
              } else {
                console.error(`Failed to send WhatsApp message to student ID ${recipient.student}: ${sendResult.error}`);
              }
            }

            // Determine status based on result
            const status = !sendResult ? 'Failed' :
                          sendResult.success === false ? 'Failed' :
                          sendResult.mock ? 'Mock-Sent' : 'Sent';

            // Update this recipient's status
            await MessageHistory.updateOne(
              {
                _id: messageHistory._id,
                'recipients.student': recipient.student
              },
              {
                $set: {
                  'recipients.$.status': status,
                  'recipients.$.deliveredAt': status !== 'Failed' ? Date.now() : undefined,
                  'recipients.$.deliveryDetails': sendResult,
                  'recipients.$.error': sendResult && !sendResult.success ? sendResult.error : undefined
                }
              }
            );
          } catch (error) {
            console.error(`Error sending message to recipient ${recipients[i].student}:`, error);

            // Update status to Failed
            await MessageHistory.updateOne(
              {
                _id: messageHistory._id,
                'recipients.student': recipients[i].student
              },
              {
                $set: {
                  'recipients.$.status': 'Failed',
                  'recipients.$.error': error.message
                }
              }
            );
          }

          // Log progress every 10 messages
          if (i % 10 === 0 || i === recipients.length - 1) {
            console.log(`Processed ${i + 1}/${recipients.length} messages`);
          }
        }

        console.log(`All ${recipients.length} messages processed successfully`);
      } catch (error) {
        console.error('Error in background message processing:', error);
      }
    });

    res.status(201).json({
      success: true,
      data: {
        messageId: messageHistory._id,
        recipientCount: recipients.length,
        message: `Message queued for sending to ${recipients.length} recipients`
      }
    });
  } catch (error) {
    console.error('Error sending message:', error);
    // Return more detailed error information
    res.status(500).json({
      message: 'Server error',
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// @route   GET /api/messaging/variables
// @desc    Get available template variables
// @access  Private
router.get('/variables', protect, async (req, res) => {
  try {
    // Return available variables for templates
    const variables = [
      { name: 'studentName', description: 'Full name of the student' },
      { name: 'firstName', description: 'First name of the student' },
      { name: 'lastName', description: 'Last name of the student' },
      { name: 'rollNumber', description: 'Roll number of the student' },
      { name: 'class', description: 'Class of the student' },
      { name: 'section', description: 'Section of the student' },
      { name: 'stream', description: 'Stream of the student' },
      { name: 'parentName', description: 'Name of the parent' },
      { name: 'date', description: 'Current date' },
      { name: 'schoolName', description: 'Name of the school' },
      { name: 'subjectName', description: 'Name of the subject' },
      { name: 'subjectCode', description: 'Code of the subject' },
      { name: 'periodNumber', description: 'Period number (e.g., 1, 2, 3)' },
      { name: 'periodTime', description: 'Time of the period (e.g., 9:00 AM - 10:00 AM)' },
      { name: 'dayOfWeek', description: 'Day of the week (e.g., Monday, Tuesday)' }
    ];

    res.json({
      success: true,
      data: variables
    });
  } catch (error) {
    console.error('Error fetching variables:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
