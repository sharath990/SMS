const express = require('express');
const Subject = require('../models/Subject');
const { protect, admin } = require('../middleware/auth');
const router = express.Router();

// @route   GET /api/subjects
// @desc    Get all subjects
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    // Extract query parameters for filtering
    const { stream, isActive, search } = req.query;
    
    // Build filter object
    const filter = {};
    
    if (stream) filter.stream = stream;
    if (isActive !== undefined) filter.isActive = isActive === 'true';
    
    // Add search functionality
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { code: { $regex: search, $options: 'i' } },
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
    const subjects = await Subject.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limit);
    
    // Get total count for pagination
    const total = await Subject.countDocuments(filter);
    
    res.json({
      success: true,
      count: subjects.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      data: subjects
    });
  } catch (error) {
    console.error('Error fetching subjects:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/subjects/:id
// @desc    Get subject by ID
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const subject = await Subject.findById(req.params.id);
    
    if (!subject) {
      return res.status(404).json({ message: 'Subject not found' });
    }
    
    res.json({
      success: true,
      data: subject
    });
  } catch (error) {
    console.error('Error fetching subject:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/subjects
// @desc    Create a new subject
// @access  Private/Admin
router.post('/', protect, admin, async (req, res) => {
  try {
    const { name, code, stream, description } = req.body;
    
    // Check if subject with same code already exists
    const existingSubject = await Subject.findOne({ code });
    if (existingSubject) {
      return res.status(400).json({ message: 'Subject with this code already exists' });
    }
    
    // Create new subject
    const subject = new Subject({
      name,
      code,
      stream,
      description
    });
    
    await subject.save();
    
    res.status(201).json({
      success: true,
      data: subject
    });
  } catch (error) {
    console.error('Error creating subject:', error);
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      return res.status(400).json({ message: messages.join(', ') });
    }
    
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/subjects/:id
// @desc    Update a subject
// @access  Private/Admin
router.put('/:id', protect, admin, async (req, res) => {
  try {
    const { name, code, stream, description, isActive } = req.body;
    
    // Find subject
    let subject = await Subject.findById(req.params.id);
    
    if (!subject) {
      return res.status(404).json({ message: 'Subject not found' });
    }
    
    // Check if code is being changed and if it already exists
    if (code !== subject.code) {
      const existingSubject = await Subject.findOne({ code });
      if (existingSubject) {
        return res.status(400).json({ message: 'Subject with this code already exists' });
      }
    }
    
    // Update subject fields
    subject.name = name;
    subject.code = code;
    subject.stream = stream;
    subject.description = description;
    subject.isActive = isActive !== undefined ? isActive : subject.isActive;
    subject.updatedAt = Date.now();
    
    await subject.save();
    
    res.json({
      success: true,
      data: subject
    });
  } catch (error) {
    console.error('Error updating subject:', error);
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      return res.status(400).json({ message: messages.join(', ') });
    }
    
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/subjects/:id
// @desc    Delete a subject
// @access  Private/Admin
router.delete('/:id', protect, admin, async (req, res) => {
  try {
    const subject = await Subject.findById(req.params.id);
    
    if (!subject) {
      return res.status(404).json({ message: 'Subject not found' });
    }
    
    await subject.deleteOne();
    
    res.json({
      success: true,
      message: 'Subject removed'
    });
  } catch (error) {
    console.error('Error deleting subject:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
