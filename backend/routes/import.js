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
    // Log the request for debugging
    console.log('Import request received:', {
      file: req.file ? {
        originalname: req.file.originalname,
        mimetype: req.file.mimetype,
        size: req.file.size
      } : 'No file'
    });

    if (!req.file) {
      return res.status(400).json({ message: 'Please upload a file' });
    }

    const filePath = req.file.path;
    const fileExt = path.extname(req.file.originalname).toLowerCase();

    // Validate file extension
    if (!['.csv', '.xlsx', '.xls'].includes(fileExt)) {
      // Clean up the invalid file
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
      return res.status(400).json({
        message: `Unsupported file format: ${fileExt}. Please upload a CSV or Excel file (.csv, .xlsx, .xls).`
      });
    }

    // Check if file is empty
    const stats = fs.statSync(filePath);
    if (stats.size === 0) {
      // Clean up the empty file
      fs.unlinkSync(filePath);
      return res.status(400).json({ message: 'The uploaded file is empty' });
    }

    let results = [];
    let errors = [];

    try {
      // Parse file based on extension
      if (fileExt === '.csv') {
        // Parse CSV file
        results = await parseCSV(filePath);
      } else if (fileExt === '.xlsx' || fileExt === '.xls') {
        // Parse Excel file
        results = parseExcel(filePath);
      }

      console.log(`Parsed ${results.length} records from ${fileExt} file`);

      // Check if any records were found
      if (results.length === 0) {
        // Clean up the file
        fs.unlinkSync(filePath);
        return res.status(400).json({
          message: 'No records found in the uploaded file. Please check the file format and content.'
        });
      }
    } catch (parseError) {
      console.error('Error parsing file:', parseError);

      // Clean up the file
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }

      return res.status(400).json({
        message: `Error parsing file: ${parseError.message}. Please check the file format and content.`
      });
    }

    // Validate and process each record
    const processedResults = await processStudents(results);

    console.log('Import processing complete:', {
      imported: processedResults.imported,
      errors: processedResults.errors.length
    });

    // Clean up - delete the uploaded file
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    // Determine the appropriate response message
    let responseMessage = '';
    let responseStatus = 200;

    if (processedResults.imported > 0 && processedResults.errors.length === 0) {
      responseMessage = `Successfully imported all ${processedResults.imported} students`;
    } else if (processedResults.imported > 0 && processedResults.errors.length > 0) {
      responseMessage = `Partially imported ${processedResults.imported} students with ${processedResults.errors.length} errors`;
      responseStatus = 207; // Multi-Status
    } else if (processedResults.imported === 0 && processedResults.errors.length > 0) {
      responseMessage = `Failed to import any students. Found ${processedResults.errors.length} errors`;
      responseStatus = 422; // Unprocessable Entity
    }

    res.status(responseStatus).json({
      success: processedResults.imported > 0,
      imported: processedResults.imported,
      errors: processedResults.errors,
      message: responseMessage
    });
  } catch (error) {
    console.error('Error importing students:', error);

    // Clean up if file exists
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    res.status(500).json({
      message: `Server error: ${error.message || 'Unknown error occurred during import'}`
    });
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

  console.log(`Processing ${records.length} student records`);

  for (let i = 0; i < records.length; i++) {
    const record = records[i];
    const rowNumber = i + 2; // +2 because of header row and 0-indexing

    try {
      // Log the record being processed (without sensitive data)
      console.log(`Processing record ${rowNumber}:`, {
        rollNumber: record.rollNumber,
        firstName: record.firstName,
        lastName: record.lastName
      });

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
      const missingFields = requiredFields.filter(field => {
        const value = record[field.field];
        return value === undefined || value === null || value.toString().trim() === '';
      });

      if (missingFields.length > 0) {
        errors.push({
          row: rowNumber,
          error: `Missing required fields: ${missingFields.map(f => f.name).join(', ')}`,
          severity: 'error'
        });
        continue;
      }

      // Validate roll number format (must be a number)
      const rollNumber = parseInt(record.rollNumber);
      if (isNaN(rollNumber)) {
        errors.push({
          row: rowNumber,
          error: 'Roll Number must be a valid number',
          severity: 'error'
        });
        continue;
      }

      // Validate batch format (must be a number)
      const batch = parseInt(record.batch);
      if (isNaN(batch)) {
        errors.push({
          row: rowNumber,
          error: 'Batch must be a valid number (year)',
          severity: 'error'
        });
        continue;
      }

      // Validate mobile number format (10 digits)
      const mobileRegex = /^\d{10}$/;
      if (!mobileRegex.test(record.parentMobile)) {
        errors.push({
          row: rowNumber,
          error: 'Parent Mobile must be a 10-digit number without spaces or special characters',
          severity: 'error'
        });
        continue;
      }

      // Validate WhatsApp number format if provided
      if (record.parentWhatsApp && !mobileRegex.test(record.parentWhatsApp)) {
        errors.push({
          row: rowNumber,
          error: 'Parent WhatsApp must be a 10-digit number without spaces or special characters',
          severity: 'error'
        });
        continue;
      }

      // Validate email format if provided
      if (record.parentEmail && record.parentEmail.trim() !== '') {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(record.parentEmail)) {
          errors.push({
            row: rowNumber,
            error: 'Parent Email must be a valid email address',
            severity: 'error'
          });
          continue;
        }
      }

      // Check if student already exists
      const existingStudent = await Student.findOne({ rollNumber: rollNumber });
      if (existingStudent) {
        errors.push({
          row: rowNumber,
          error: `Student with Roll Number ${rollNumber} already exists`,
          severity: 'error'
        });
        continue;
      }

      // Create new student with validated data
      const student = new Student({
        rollNumber: rollNumber,
        firstName: record.firstName.trim(),
        lastName: record.lastName.trim(),
        stream: record.stream.trim(),
        class: record.class.trim(),
        section: record.section.trim(),
        batch: batch,
        parentName: record.parentName.trim(),
        parentMobile: record.parentMobile.trim(),
        parentWhatsApp: (record.parentWhatsApp || record.parentMobile).trim(),
        parentEmail: record.parentEmail ? record.parentEmail.trim() : '',
        address: record.address ? record.address.trim() : '',
        isActive: true
      });

      // Save the student record
      await student.save();
      console.log(`Successfully imported student with Roll Number ${rollNumber}`);
      imported++;
    } catch (error) {
      console.error(`Error processing record ${rowNumber}:`, error);
      errors.push({
        row: rowNumber,
        error: `Database error: ${error.message}`,
        severity: 'error'
      });
    }
  }

  console.log(`Import summary: ${imported} imported, ${errors.length} errors`);
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
