const express = require('express');
const Class = require('../models/Class');
const Student = require('../models/Student');
const { protect, admin } = require('../middleware/auth');
const router = express.Router();

// @route   GET /api/classes
// @desc    Get all classes
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    // Extract query parameters for filtering
    const { stream, level, section, academicYear, isActive, search } = req.query;

    // Build filter object
    const filter = {};

    if (stream) filter.stream = stream;
    if (level) filter.level = level;
    if (section) filter.section = section;
    if (academicYear) filter.academicYear = academicYear;
    if (isActive !== undefined) filter.isActive = isActive === 'true';

    // Add search functionality
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { stream: { $regex: search, $options: 'i' } },
        { level: { $regex: search, $options: 'i' } },
        { section: { $regex: search, $options: 'i' } },
        { academicYear: { $regex: search, $options: 'i' } }
      ];
    }

    // Get pagination parameters
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Get sorting parameters
    const sortField = req.query.sortField || 'name';
    const sortOrder = req.query.sortOrder === 'desc' ? -1 : 1;
    const sort = { [sortField]: sortOrder };

    // Execute query with pagination and sorting
    const classes = await Class.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limit);

    // Get total count for pagination
    const total = await Class.countDocuments(filter);

    res.json({
      success: true,
      count: classes.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      data: classes
    });
  } catch (error) {
    console.error('Error fetching classes:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/classes/:id
// @desc    Get class by ID
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const classItem = await Class.findById(req.params.id);

    if (!classItem) {
      return res.status(404).json({ message: 'Class not found' });
    }

    res.json({
      success: true,
      data: classItem
    });
  } catch (error) {
    console.error('Error fetching class:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/classes
// @desc    Create a new class
// @access  Private/Admin
router.post('/', protect, admin, async (req, res) => {
  try {
    const {
      name,
      stream,
      level,
      section,
      academicYear
    } = req.body;

    // Check if class already exists
    const existingClass = await Class.findOne({
      stream,
      level,
      section,
      academicYear
    });

    if (existingClass) {
      return res.status(400).json({ message: 'Class with these details already exists' });
    }

    // Create new class
    const classItem = new Class({
      name,
      stream,
      level,
      section,
      academicYear
    });

    await classItem.save();

    res.status(201).json({
      success: true,
      data: classItem
    });
  } catch (error) {
    console.error('Error creating class:', error);

    // Handle validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      return res.status(400).json({ message: messages.join(', ') });
    }

    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/classes/:id
// @desc    Update a class
// @access  Private/Admin
router.put('/:id', protect, admin, async (req, res) => {
  try {
    const {
      name,
      stream,
      level,
      section,
      academicYear,
      isActive
    } = req.body;

    // Find class
    let classItem = await Class.findById(req.params.id);

    if (!classItem) {
      return res.status(404).json({ message: 'Class not found' });
    }

    // Check if updated details would create a duplicate
    if (stream !== classItem.stream || level !== classItem.level ||
        section !== classItem.section || academicYear !== classItem.academicYear) {
      const existingClass = await Class.findOne({
        stream,
        level,
        section,
        academicYear,
        _id: { $ne: req.params.id }
      });

      if (existingClass) {
        return res.status(400).json({ message: 'Class with these details already exists' });
      }
    }

    // Update class fields
    classItem.name = name;
    classItem.stream = stream;
    classItem.level = level;
    classItem.section = section;
    classItem.academicYear = academicYear;
    classItem.isActive = isActive !== undefined ? isActive : classItem.isActive;

    await classItem.save();

    res.json({
      success: true,
      data: classItem
    });
  } catch (error) {
    console.error('Error updating class:', error);

    // Handle validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      return res.status(400).json({ message: messages.join(', ') });
    }

    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/classes/:id
// @desc    Delete a class
// @access  Private/Admin
router.delete('/:id', protect, admin, async (req, res) => {
  try {
    const classItem = await Class.findById(req.params.id);

    if (!classItem) {
      return res.status(404).json({ message: 'Class not found' });
    }

    // Check if there are students in this class
    const studentCount = await Student.countDocuments({
      stream: classItem.stream,
      class: classItem.level,
      section: classItem.section
    });

    if (studentCount > 0) {
      return res.status(400).json({
        message: `Cannot delete class with ${studentCount} students. Please reassign or delete the students first.`
      });
    }

    await classItem.deleteOne();

    res.json({
      success: true,
      message: 'Class removed'
    });
  } catch (error) {
    console.error('Error deleting class:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/classes/:id/students
// @desc    Get students in a class
// @access  Private
router.get('/:id/students', protect, async (req, res) => {
  try {
    const classItem = await Class.findById(req.params.id);

    if (!classItem) {
      return res.status(404).json({ message: 'Class not found' });
    }

    // Get pagination parameters
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Get sorting parameters
    const sortField = req.query.sortField || 'rollNumber';
    const sortOrder = req.query.sortOrder === 'desc' ? -1 : 1;
    const sort = { [sortField]: sortOrder };

    // Find students in this class
    const students = await Student.find({
      stream: classItem.stream,
      class: classItem.level,
      section: classItem.section
    })
      .sort(sort)
      .skip(skip)
      .limit(limit);

    // Get total count for pagination
    const total = await Student.countDocuments({
      stream: classItem.stream,
      class: classItem.level,
      section: classItem.section
    });

    res.json({
      success: true,
      count: students.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      data: students
    });
  } catch (error) {
    console.error('Error fetching students in class:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
