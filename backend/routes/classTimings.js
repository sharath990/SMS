const express = require('express');
const ClassTiming = require('../models/ClassTiming');
const { protect, admin } = require('../middleware/auth');
const router = express.Router();

// @route   GET /api/class-timings
// @desc    Get all class timings
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    // Extract query parameters for filtering
    const { isActive, search } = req.query;

    // Build filter object
    const filter = {};

    if (isActive !== undefined) filter.isActive = isActive === 'true';

    // Add search functionality
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
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
    const classTimings = await ClassTiming.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limit);

    // Get total count for pagination
    const total = await ClassTiming.countDocuments(filter);

    res.json({
      success: true,
      count: classTimings.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      data: classTimings
    });
  } catch (error) {
    console.error('Error fetching class timings:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/class-timings/:id
// @desc    Get class timing by ID
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const classTiming = await ClassTiming.findById(req.params.id);

    if (!classTiming) {
      return res.status(404).json({ message: 'Class timing not found' });
    }

    res.json({
      success: true,
      data: classTiming
    });
  } catch (error) {
    console.error('Error fetching class timing:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/class-timings
// @desc    Create a new class timing
// @access  Private/Admin
router.post('/', protect, admin, async (req, res) => {
  try {
    const { name, period, startTime, endTime, description } = req.body;

    // Check if class timing with the same name already exists
    const existingTiming = await ClassTiming.findOne({ name });

    if (existingTiming) {
      return res.status(400).json({
        message: `Class timing with name "${name}" already exists`
      });
    }

    // Create new class timing
    const classTiming = new ClassTiming({
      name,
      period,
      startTime,
      endTime,
      description
    });

    await classTiming.save();

    res.status(201).json({
      success: true,
      data: classTiming
    });
  } catch (error) {
    console.error('Error creating class timing:', error);

    // Handle validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      return res.status(400).json({ message: messages.join(', ') });
    }

    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/class-timings/:id
// @desc    Update a class timing
// @access  Private/Admin
router.put('/:id', protect, admin, async (req, res) => {
  try {
    const { name, period, startTime, endTime, description, isActive } = req.body;

    // Find class timing
    let classTiming = await ClassTiming.findById(req.params.id);

    if (!classTiming) {
      return res.status(404).json({ message: 'Class timing not found' });
    }

    // Check if name is being changed and if it already exists
    if (name !== classTiming.name) {
      const existingTiming = await ClassTiming.findOne({
        name,
        _id: { $ne: req.params.id }
      });

      if (existingTiming) {
        return res.status(400).json({
          message: `Class timing with name "${name}" already exists`
        });
      }
    }

    // Update class timing fields
    classTiming.name = name;
    classTiming.period = period;
    classTiming.startTime = startTime;
    classTiming.endTime = endTime;
    classTiming.description = description;
    classTiming.isActive = isActive !== undefined ? isActive : classTiming.isActive;

    await classTiming.save();

    res.json({
      success: true,
      data: classTiming
    });
  } catch (error) {
    console.error('Error updating class timing:', error);

    // Handle validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      return res.status(400).json({ message: messages.join(', ') });
    }

    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/class-timings/:id
// @desc    Delete a class timing
// @access  Private/Admin
router.delete('/:id', protect, admin, async (req, res) => {
  try {
    const classTiming = await ClassTiming.findById(req.params.id);

    if (!classTiming) {
      return res.status(404).json({ message: 'Class timing not found' });
    }

    await classTiming.deleteOne();

    res.json({
      success: true,
      message: 'Class timing removed'
    });
  } catch (error) {
    console.error('Error deleting class timing:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
