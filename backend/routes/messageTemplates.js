const express = require('express');
const MessageTemplate = require('../models/MessageTemplate');
const { protect, admin } = require('../middleware/auth');
const router = express.Router();

// @route   GET /api/message-templates
// @desc    Get all message templates
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    // Extract query parameters for filtering
    const { type, category, isActive, search } = req.query;
    
    // Build filter object
    const filter = {};
    
    if (type) filter.type = type;
    if (category) filter.category = category;
    if (isActive !== undefined) filter.isActive = isActive === 'true';
    
    // Add search functionality
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } }
      ];
    }
    
    // Get pagination parameters
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    // Get sorting parameters
    const sortField = req.query.sortField || 'createdAt';
    const sortOrder = req.query.sortOrder === 'desc' ? -1 : 1;
    const sort = { [sortField]: sortOrder };
    
    // Execute query with pagination and sorting
    const templates = await MessageTemplate.find(filter)
      .populate('createdBy', 'username firstName lastName')
      .sort(sort)
      .skip(skip)
      .limit(limit);
    
    // Get total count for pagination
    const total = await MessageTemplate.countDocuments(filter);
    
    res.json({
      success: true,
      count: templates.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      data: templates
    });
  } catch (error) {
    console.error('Error fetching message templates:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/message-templates/:id
// @desc    Get message template by ID
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const template = await MessageTemplate.findById(req.params.id)
      .populate('createdBy', 'username firstName lastName');
    
    if (!template) {
      return res.status(404).json({ message: 'Message template not found' });
    }
    
    res.json({
      success: true,
      data: template
    });
  } catch (error) {
    console.error('Error fetching message template:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/message-templates
// @desc    Create a new message template
// @access  Private/Admin
router.post('/', protect, admin, async (req, res) => {
  try {
    const { name, type, category, content, variables } = req.body;
    
    // Check if template with same name already exists
    const existingTemplate = await MessageTemplate.findOne({ name });
    if (existingTemplate) {
      return res.status(400).json({ message: 'Template with this name already exists' });
    }
    
    // Create new template
    const template = new MessageTemplate({
      name,
      type,
      category,
      content,
      variables: variables || [],
      createdBy: req.user.id
    });
    
    await template.save();
    
    res.status(201).json({
      success: true,
      data: template
    });
  } catch (error) {
    console.error('Error creating message template:', error);
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      return res.status(400).json({ message: messages.join(', ') });
    }
    
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/message-templates/:id
// @desc    Update a message template
// @access  Private/Admin
router.put('/:id', protect, admin, async (req, res) => {
  try {
    const { name, type, category, content, variables, isActive } = req.body;
    
    // Find template
    let template = await MessageTemplate.findById(req.params.id);
    
    if (!template) {
      return res.status(404).json({ message: 'Message template not found' });
    }
    
    // Check if name is being changed and if it already exists
    if (name !== template.name) {
      const existingTemplate = await MessageTemplate.findOne({ name });
      if (existingTemplate) {
        return res.status(400).json({ message: 'Template with this name already exists' });
      }
    }
    
    // Update template fields
    template.name = name;
    template.type = type;
    template.category = category;
    template.content = content;
    template.variables = variables || [];
    template.isActive = isActive !== undefined ? isActive : template.isActive;
    template.updatedAt = Date.now();
    
    await template.save();
    
    res.json({
      success: true,
      data: template
    });
  } catch (error) {
    console.error('Error updating message template:', error);
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      return res.status(400).json({ message: messages.join(', ') });
    }
    
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/message-templates/:id
// @desc    Delete a message template
// @access  Private/Admin
router.delete('/:id', protect, admin, async (req, res) => {
  try {
    const template = await MessageTemplate.findById(req.params.id);
    
    if (!template) {
      return res.status(404).json({ message: 'Message template not found' });
    }
    
    await template.deleteOne();
    
    res.json({
      success: true,
      message: 'Message template removed'
    });
  } catch (error) {
    console.error('Error deleting message template:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
