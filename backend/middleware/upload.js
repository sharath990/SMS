const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
  console.log('Created uploads directory:', uploadsDir);
}

// Set storage engine
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, uploadsDir); // Use the absolute path to uploads directory
  },
  filename: function(req, file, cb) {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

// Check file type
const fileFilter = (req, file, cb) => {
  // Log the file information for debugging
  console.log('File upload attempt:', {
    originalname: file.originalname,
    mimetype: file.mimetype,
    extension: path.extname(file.originalname).toLowerCase()
  });

  // Allowed extensions
  const allowedExtensions = /\.(csv|xlsx|xls)$/i;

  // Allowed MIME types for Excel and CSV files
  const allowedMimeTypes = [
    'text/csv',
    'application/csv',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/octet-stream',  // Some systems use this for binary files
    'application/excel'
  ];

  // Check extension
  const extname = allowedExtensions.test(file.originalname.toLowerCase());

  // Check mime type - more permissive check
  const mimetype = allowedMimeTypes.includes(file.mimetype);

  if (extname) {
    // If the extension is correct, accept the file regardless of mimetype
    // This is more permissive but ensures files with correct extensions are accepted
    return cb(null, true);
  } else {
    cb(new Error('Only CSV and Excel files (.csv, .xlsx, .xls) are allowed'));
  }
};

// Initialize upload
const upload = multer({
  storage: storage,
  limits: { fileSize: 10000000 }, // 10MB max file size
  fileFilter: fileFilter
});

module.exports = upload;
