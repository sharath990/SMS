const express = require('express');
const Batch = require('../models/Batch');
const Student = require('../models/Student');
const { protect, admin } = require('../middleware/auth');
const router = express.Router();

// @route   GET /api/batches
// @desc    Get all batches
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    // Extract query parameters for filtering
    const { year, isGraduated, search } = req.query;

    // Build filter object
    const filter = {};

    if (year) filter.year = parseInt(year);
    if (isGraduated !== undefined) filter.isGraduated = isGraduated === 'true';

    // Add search functionality
    if (search) {
      // Convert search to number if it's a valid number for year search
      const yearSearch = !isNaN(search) ? parseInt(search) : null;

      const searchFilter = [
        { name: { $regex: search, $options: 'i' } }
      ];

      // Add year search if the search term is a valid number
      if (yearSearch !== null) {
        searchFilter.push({ year: yearSearch });
      }

      filter.$or = searchFilter;
    }

    // Get sorting parameters
    const sortField = req.query.sortField || 'year';
    const sortOrder = req.query.sortOrder === 'desc' ? -1 : 1;
    const sort = { [sortField]: sortOrder };

    // Execute query with sorting
    const batches = await Batch.find(filter).sort(sort);

    res.json({
      success: true,
      count: batches.length,
      data: batches
    });
  } catch (error) {
    console.error('Error fetching batches:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/batches/:id
// @desc    Get batch by ID
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const batch = await Batch.findById(req.params.id);

    if (!batch) {
      return res.status(404).json({ message: 'Batch not found' });
    }

    res.json({
      success: true,
      data: batch
    });
  } catch (error) {
    console.error('Error fetching batch:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/batches
// @desc    Create a new batch
// @access  Private/Admin
router.post('/', protect, admin, async (req, res) => {
  try {
    const { year, name } = req.body;

    // Check if batch with year already exists
    const existingBatch = await Batch.findOne({ year });
    if (existingBatch) {
      return res.status(400).json({ message: 'Batch with this year already exists' });
    }

    // Create new batch
    const batch = new Batch({
      year,
      name
    });

    await batch.save();

    res.status(201).json({
      success: true,
      data: batch
    });
  } catch (error) {
    console.error('Error creating batch:', error);

    // Handle validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      return res.status(400).json({ message: messages.join(', ') });
    }

    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/batches/:id
// @desc    Update a batch
// @access  Private/Admin
router.put('/:id', protect, admin, async (req, res) => {
  try {
    const { year, name, isGraduated, graduationDate } = req.body;

    // Find batch
    let batch = await Batch.findById(req.params.id);

    if (!batch) {
      return res.status(404).json({ message: 'Batch not found' });
    }

    // Check if year is being changed and if it already exists
    if (year !== batch.year) {
      const existingBatch = await Batch.findOne({ year });
      if (existingBatch) {
        return res.status(400).json({ message: 'Batch with this year already exists' });
      }
    }

    // Update batch fields
    batch.year = year;
    batch.name = name;

    if (isGraduated !== undefined) {
      batch.isGraduated = isGraduated;

      // If marking as graduated, set graduation date
      if (isGraduated && !batch.graduationDate) {
        batch.graduationDate = graduationDate || new Date();
      }

      // If marking as not graduated, clear graduation date
      if (!isGraduated) {
        batch.graduationDate = null;
      }
    }

    // If graduation date is provided, update it
    if (graduationDate) {
      batch.graduationDate = graduationDate;
    }

    await batch.save();

    res.json({
      success: true,
      data: batch
    });
  } catch (error) {
    console.error('Error updating batch:', error);

    // Handle validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      return res.status(400).json({ message: messages.join(', ') });
    }

    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/batches/:id
// @desc    Delete a batch
// @access  Private/Admin
router.delete('/:id', protect, admin, async (req, res) => {
  try {
    const batch = await Batch.findById(req.params.id);

    if (!batch) {
      return res.status(404).json({ message: 'Batch not found' });
    }

    // Check if there are students in this batch
    const studentCount = await Student.countDocuments({ batch: batch.year });

    if (studentCount > 0) {
      return res.status(400).json({
        message: `Cannot delete batch with ${studentCount} students. Please reassign or delete the students first.`
      });
    }

    await batch.deleteOne();

    res.json({
      success: true,
      message: 'Batch removed'
    });
  } catch (error) {
    console.error('Error deleting batch:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/batches/:id/students
// @desc    Get students in a batch
// @access  Private
router.get('/:id/students', protect, async (req, res) => {
  try {
    const batch = await Batch.findById(req.params.id);

    if (!batch) {
      return res.status(404).json({ message: 'Batch not found' });
    }

    // Get pagination parameters
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Get sorting parameters
    const sortField = req.query.sortField || 'rollNumber';
    const sortOrder = req.query.sortOrder === 'desc' ? -1 : 1;
    const sort = { [sortField]: sortOrder };

    // Find students in this batch
    const students = await Student.find({ batch: batch.year })
      .sort(sort)
      .skip(skip)
      .limit(limit);

    // Get total count for pagination
    const total = await Student.countDocuments({ batch: batch.year });

    res.json({
      success: true,
      count: students.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      data: students
    });
  } catch (error) {
    console.error('Error fetching students in batch:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
