const express = require('express');
const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const xlsx = require('xlsx');
const Student = require('../models/Student');
const { protect, admin } = require('../middleware/auth');
const upload = require('../middleware/upload');
const router = express.Router();

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// @route   POST /api/import/students
// @desc    Import students from CSV or Excel
// @access  Private/Admin
router.post('/students', protect, admin, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Please upload a file' });
    }

    const filePath = req.file.path;
    const fileExt = path.extname(req.file.originalname).toLowerCase();
    
    let results = [];
    let errors = [];
    
    // Parse file based on extension
    if (fileExt === '.csv') {
      // Parse CSV file
      results = await parseCSV(filePath);
    } else if (fileExt === '.xlsx' || fileExt === '.xls') {
      // Parse Excel file
      results = parseExcel(filePath);
    } else {
      return res.status(400).json({ message: 'Unsupported file format' });
    }
    
    // Validate and process each record
    const processedResults = await processStudents(results);
    
    // Clean up - delete the uploaded file
    fs.unlinkSync(filePath);
    
    res.json({
      success: true,
      imported: processedResults.imported,
      errors: processedResults.errors,
      message: `Successfully imported ${processedResults.imported} students with ${processedResults.errors.length} errors`
    });
  } catch (error) {
    console.error('Error importing students:', error);
    
    // Clean up if file exists
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    
    res.status(500).json({ message: 'Server error' });
  }
});

// Parse CSV file
const parseCSV = (filePath) => {
  return new Promise((resolve, reject) => {
    const results = [];
    
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (data) => results.push(data))
      .on('end', () => {
        resolve(results);
      })
      .on('error', (error) => {
        reject(error);
      });
  });
};

// Parse Excel file
const parseExcel = (filePath) => {
  const workbook = xlsx.readFile(filePath);
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  
  // Convert to JSON
  return xlsx.utils.sheet_to_json(worksheet);
};

// Process student records
const processStudents = async (records) => {
  let imported = 0;
  let errors = [];
  
  for (let i = 0; i < records.length; i++) {
    const record = records[i];
    
    try {
      // Validate required fields
      if (!record.rollNumber || !record.firstName || !record.lastName || 
          !record.stream || !record.class || !record.section || 
          !record.batch || !record.parentName || !record.parentMobile) {
        errors.push({
          row: i + 2, // +2 because of header row and 0-indexing
          error: 'Missing required fields',
          data: record
        });
        continue;
      }
      
      // Check if student already exists
      const existingStudent = await Student.findOne({ rollNumber: record.rollNumber });
      if (existingStudent) {
        errors.push({
          row: i + 2,
          error: 'Student with this roll number already exists',
          data: record
        });
        continue;
      }
      
      // Create new student
      const student = new Student({
        rollNumber: record.rollNumber,
        firstName: record.firstName,
        lastName: record.lastName,
        stream: record.stream,
        class: record.class,
        section: record.section,
        batch: record.batch,
        parentName: record.parentName,
        parentMobile: record.parentMobile,
        parentWhatsApp: record.parentWhatsApp || record.parentMobile,
        parentEmail: record.parentEmail || '',
        address: record.address || ''
      });
      
      await student.save();
      imported++;
    } catch (error) {
      errors.push({
        row: i + 2,
        error: error.message,
        data: record
      });
    }
  }
  
  return { imported, errors };
};

// @route   GET /api/import/template
// @desc    Download import template
// @access  Private
router.get('/template', protect, (req, res) => {
  const format = req.query.format || 'csv';
  
  // Define template headers
  const headers = [
    'rollNumber',
    'firstName',
    'lastName',
    'stream',
    'class',
    'section',
    'batch',
    'parentName',
    'parentMobile',
    'parentWhatsApp',
    'parentEmail',
    'address'
  ];
  
  // Sample data
  const sampleData = [
    {
      rollNumber: 101,
      firstName: 'John',
      lastName: 'Doe',
      stream: 'Science',
      class: '1st PUC',
      section: 'A',
      batch: 2023,
      parentName: 'Parent Name',
      parentMobile: '9876543210',
      parentWhatsApp: '9876543210',
      parentEmail: 'parent@example.com',
      address: 'Sample Address'
    }
  ];
  
  if (format === 'csv') {
    // Create CSV content
    let csvContent = headers.join(',') + '\\n';
    
    sampleData.forEach(row => {
      const values = headers.map(header => {
        const value = row[header] || '';
        // Wrap values with commas in quotes
        return typeof value === 'string' && value.includes(',') ? `"${value}"` : value;
      });
      csvContent += values.join(',') + '\\n';
    });
    
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=student_import_template.csv');
    res.send(csvContent);
  } else if (format === 'excel') {
    // Create Excel workbook
    const workbook = xlsx.utils.book_new();
    const worksheet = xlsx.utils.json_to_sheet(sampleData, { header: headers });
    
    xlsx.utils.book_append_sheet(workbook, worksheet, 'Students');
    
    // Generate buffer
    const buffer = xlsx.write(workbook, { type: 'buffer', bookType: 'xlsx' });
    
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=student_import_template.xlsx');
    res.send(buffer);
  } else {
    res.status(400).json({ message: 'Unsupported format. Use csv or excel.' });
  }
});

module.exports = router;
