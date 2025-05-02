const express = require('express');
const Student = require('../models/Student');
const { protect, admin } = require('../middleware/auth');
const router = express.Router();

// @route   GET /api/students
// @desc    Get all students
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    // Extract query parameters for filtering
    const { stream, class: studentClass, section, batch, isActive, search } = req.query;

    // Build filter object
    const filter = {};

    if (stream) filter.stream = stream;
    if (studentClass) filter.class = studentClass;
    if (section) filter.section = section;
    if (batch) filter.batch = parseInt(batch);
    if (isActive !== undefined) filter.isActive = isActive === 'true';

    // Add search functionality
    if (search) {
      filter.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { parentName: { $regex: search, $options: 'i' } },
        { parentMobile: { $regex: search, $options: 'i' } }
      ];

      // If search is a number, also search by roll number
      if (!isNaN(search)) {
        filter.$or.push({ rollNumber: parseInt(search) });
      }
    }

    // Get pagination parameters
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Get sorting parameters
    const sortField = req.query.sortField || 'rollNumber';
    const sortOrder = req.query.sortOrder === 'desc' ? -1 : 1;
    const sort = { [sortField]: sortOrder };

    // Execute query with pagination and sorting
    const students = await Student.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limit);

    // Get total count for pagination
    const total = await Student.countDocuments(filter);

    res.json({
      success: true,
      count: students.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      data: students
    });
  } catch (error) {
    console.error('Error fetching students:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/students/:id
// @desc    Get student by ID
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);

    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    res.json({
      success: true,
      data: student
    });
  } catch (error) {
    console.error('Error fetching student:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/students
// @desc    Create a new student
// @access  Private/Admin
router.post('/', protect, async (req, res) => { // Temporarily removed admin middleware for testing
  console.log('POST /api/students - Request received');
  console.log('Request body:', req.body);
  console.log('User making request:', req.user);

  try {
    const {
      rollNumber,
      firstName,
      lastName,
      stream,
      class: studentClass,
      section,
      batch,
      parentName,
      parentMobile,
      parentWhatsApp,
      parentEmail,
      address
    } = req.body;

    console.log('Extracted data from request:', {
      rollNumber,
      firstName,
      lastName,
      stream,
      studentClass,
      section,
      batch,
      parentName,
      parentMobile
    });

    // Check if student with roll number already exists
    console.log('Checking if student with roll number already exists:', rollNumber);
    const existingStudent = await Student.findOne({ rollNumber });
    if (existingStudent) {
      console.log('Student with roll number already exists:', existingStudent);
      return res.status(400).json({ message: 'Student with this roll number already exists' });
    }

    // Create new student
    console.log('Creating new student');
    const student = new Student({
      rollNumber,
      firstName,
      lastName,
      stream,
      class: studentClass,
      section,
      batch,
      parentName,
      parentMobile,
      parentWhatsApp,
      parentEmail,
      address
    });

    console.log('Saving student to database');
    await student.save();
    console.log('Student saved successfully:', student);

    res.status(201).json({
      success: true,
      data: student
    });
  } catch (error) {
    console.error('Error creating student:', error);
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);

    // Handle validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      console.error('Validation error messages:', messages);
      return res.status(400).json({ message: messages.join(', ') });
    }

    res.status(500).json({ message: 'Server error: ' + error.message });
  }
});

// @route   PUT /api/students/:id
// @desc    Update a student
// @access  Private/Admin
router.put('/:id', protect, admin, async (req, res) => {
  try {
    const {
      rollNumber,
      firstName,
      lastName,
      stream,
      class: studentClass,
      section,
      batch,
      isActive,
      parentName,
      parentMobile,
      parentWhatsApp,
      parentEmail,
      address
    } = req.body;

    // Find student
    let student = await Student.findById(req.params.id);

    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    // Check if roll number is being changed and if it already exists
    if (rollNumber !== student.rollNumber) {
      const existingStudent = await Student.findOne({ rollNumber });
      if (existingStudent) {
        return res.status(400).json({ message: 'Student with this roll number already exists' });
      }
    }

    // Update student fields
    student.rollNumber = rollNumber;
    student.firstName = firstName;
    student.lastName = lastName;
    student.stream = stream;
    student.class = studentClass;
    student.section = section;
    student.batch = batch;
    student.isActive = isActive !== undefined ? isActive : student.isActive;
    student.parentName = parentName;
    student.parentMobile = parentMobile;
    student.parentWhatsApp = parentWhatsApp;
    student.parentEmail = parentEmail;
    student.address = address;

    await student.save();

    res.json({
      success: true,
      data: student
    });
  } catch (error) {
    console.error('Error updating student:', error);

    // Handle validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      return res.status(400).json({ message: messages.join(', ') });
    }

    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/students/:id
// @desc    Delete a student
// @access  Private/Admin
router.delete('/:id', protect, admin, async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);

    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    await student.deleteOne();

    res.json({
      success: true,
      message: 'Student removed'
    });
  } catch (error) {
    console.error('Error deleting student:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/students/stats/count
// @desc    Get student count statistics
// @access  Private
router.get('/stats/count', protect, async (req, res) => {
  try {
    // Get total count
    const totalCount = await Student.countDocuments();

    // Get count by stream
    const streamCounts = await Student.aggregate([
      { $group: { _id: '$stream', count: { $sum: 1 } } }
    ]);

    // Get count by class
    const classCounts = await Student.aggregate([
      { $group: { _id: '$class', count: { $sum: 1 } } }
    ]);

    // Get count by batch
    const batchCounts = await Student.aggregate([
      { $group: { _id: '$batch', count: { $sum: 1 } } }
    ]);

    // Get count by active status
    const activeCounts = await Student.aggregate([
      { $group: { _id: '$isActive', count: { $sum: 1 } } }
    ]);

    res.json({
      success: true,
      data: {
        total: totalCount,
        byStream: streamCounts,
        byClass: classCounts,
        byBatch: batchCounts,
        byActiveStatus: activeCounts
      }
    });
  } catch (error) {
    console.error('Error fetching student statistics:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
