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
      .on('data', (data) => {
        // Process the data to handle headers with asterisks
        const processedData = {};

        // Remove asterisks from field names
        Object.keys(data).forEach(key => {
          const cleanKey = key.replace(/\*$/, ''); // Remove trailing asterisk if present
          processedData[cleanKey] = data[key];
        });

        results.push(processedData);
      })
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

  // Get the raw data
  const rawData = xlsx.utils.sheet_to_json(worksheet);

  // Process the data to handle headers with asterisks
  return rawData.map(row => {
    const processedRow = {};

    // Remove asterisks from field names
    Object.keys(row).forEach(key => {
      const cleanKey = key.replace(/\*$/, ''); // Remove trailing asterisk if present
      processedRow[cleanKey] = row[key];
    });

    return processedRow;
  });
};

// Process student records
const processStudents = async (records) => {
  let imported = 0;
  let errors = [];

  for (let i = 0; i < records.length; i++) {
    const record = records[i];

    try {
      // Check each required field individually for better error messages
      const requiredFields = [
        { field: 'rollNumber', name: 'Roll Number' },
        { field: 'firstName', name: 'First Name' },
        { field: 'lastName', name: 'Last Name' },
        { field: 'stream', name: 'Stream' },
        { field: 'class', name: 'Class' },
        { field: 'section', name: 'Section' },
        { field: 'batch', name: 'Batch' },
        { field: 'parentName', name: 'Parent Name' },
        { field: 'parentMobile', name: 'Parent Mobile' },
        { field: 'parentWhatsApp', name: 'Parent WhatsApp' }
      ];

      // Check for missing required fields
      const missingFields = requiredFields.filter(field =>
        !record[field.field] || record[field.field].toString().trim() === ''
      );

      if (missingFields.length > 0) {
        errors.push({
          row: i + 2, // +2 because of header row and 0-indexing
          error: `Missing required fields: ${missingFields.map(f => f.name).join(', ')}`,
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

  // Define template headers with required field markers
  const headers = [
    'rollNumber*',
    'firstName*',
    'lastName*',
    'stream*',
    'class*',
    'section*',
    'batch*',
    'parentName*',
    'parentMobile*',
    'parentWhatsApp*',
    'parentEmail',
    'address'
  ];

  // Define the actual field names for data processing
  const dataFields = [
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
    },
    {
      rollNumber: 102,
      firstName: 'Jane',
      lastName: 'Smith',
      stream: 'Commerce',
      class: '2nd PUC',
      section: 'B',
      batch: 2023,
      parentName: 'Parent Name',
      parentMobile: '9876543211',
      parentWhatsApp: '9876543211',
      parentEmail: '', // Optional
      address: '' // Optional
    }
  ];

  if (format === 'csv') {
    // Create CSV content
    let csvContent = headers.join(',') + '\\n';

    sampleData.forEach(row => {
      const values = dataFields.map(field => {
        const value = row[field] || '';
        // Wrap values with commas in quotes
        return typeof value === 'string' && value.includes(',') ? `"${value}"` : value;
      });
      csvContent += values.join(',') + '\\n';
    });

    // Add a note about required fields
    csvContent += '\\n"Note: Fields marked with * are required"\\n';

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=student_import_template.csv');
    res.send(csvContent);
  } else if (format === 'excel') {
    // Create Excel workbook
    const workbook = xlsx.utils.book_new();

    // Create worksheet with the data
    const worksheet = xlsx.utils.json_to_sheet(sampleData, { header: dataFields });

    // Replace the header row with our headers that include required field markers
    const headerRange = xlsx.utils.decode_range(worksheet['!ref']);
    for (let i = 0; i <= headerRange.e.c; i++) {
      const cellAddress = xlsx.utils.encode_cell({ r: 0, c: i });
      worksheet[cellAddress].v = headers[i];
    }

    // Add a note about required fields
    const lastRow = headerRange.e.r + 2; // +2 for the two sample rows
    const noteCell = xlsx.utils.encode_cell({ r: lastRow + 1, c: 0 });
    worksheet[noteCell] = { t: 's', v: 'Note: Fields marked with * are required' };

    // Update the worksheet range to include the note
    const newRange = xlsx.utils.encode_range({
      s: { r: 0, c: 0 },
      e: { r: lastRow + 1, c: headerRange.e.c }
    });
    worksheet['!ref'] = newRange;

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
