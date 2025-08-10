import multer from 'multer';
import path from 'path';
import logger from '../utils/logger.js';
import cloudinaryService from '../services/cloudinary.js';

// Upload to Cloudinary helper function
export const uploadToCloudinary = async (fileBuffer, options = {}) => {
  try {
    const result = await cloudinaryService.uploadFile(fileBuffer, options);
    return result;
  } catch (error) {
    logger.error('Cloudinary upload error:', error.message);
    throw error;
  }
};

// Configure storage (memory storage for cloud upload)
const storage = multer.memoryStorage();

// File filter function
const fileFilter = (req, file, cb) => {
  const allowedTypes = ['.pdf', '.doc', '.docx'];
  const fileExtension = path.extname(file.originalname).toLowerCase();
  
  if (allowedTypes.includes(fileExtension)) {
    cb(null, true);
  } else {
    const error = new Error(`File type not allowed. Allowed types: ${allowedTypes.join(', ')}`);
    error.code = 'INVALID_FILE_TYPE';
    cb(error, false);
  }
};

// Configure multer
const upload = multer({
  storage: storage,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024, // 10MB default
    files: 1 // Single file upload
  },
  fileFilter: fileFilter
});

// Error handling middleware for multer
const handleMulterError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    logger.error('Multer error:', err.message);
    
    switch (err.code) {
      case 'LIMIT_FILE_SIZE':
        return res.status(400).json({
          success: false,
          error: 'File too large',
          message: `Maximum file size is ${(parseInt(process.env.MAX_FILE_SIZE) || 10485760) / 1024 / 1024}MB`
        });
      case 'LIMIT_FILE_COUNT':
        return res.status(400).json({
          success: false,
          error: 'Too many files',
          message: 'Only one file is allowed'
        });
      case 'LIMIT_UNEXPECTED_FILE':
        return res.status(400).json({
          success: false,
          error: 'Unexpected file field',
          message: 'File field name not recognized'
        });
      default:
        return res.status(400).json({
          success: false,
          error: 'File upload error',
          message: err.message
        });
    }
  } else if (err && err.code === 'INVALID_FILE_TYPE') {
    return res.status(400).json({
      success: false,
      error: 'Invalid file type',
      message: err.message
    });
  }
  
  next(err);
};

// Enhanced upload middleware with error handling
const uploadWithErrorHandling = (fieldName) => {
  return [
    upload.single(fieldName),
    handleMulterError
  ];
};

// Validate uploaded file
const validateFile = (req, res, next) => {
  if (!req.file) {
    return res.status(400).json({
      success: false,
      error: 'No file uploaded',
      message: 'Please select a file to upload'
    });
  }

  // Additional validation
  const { originalname, mimetype, size } = req.file;
  
  logger.info('File upload details:', {
    filename: originalname,
    mimetype: mimetype,
    size: `${(size / 1024 / 1024).toFixed(2)}MB`
  });

  // Check file size again (safety check)
  const maxSize = parseInt(process.env.MAX_FILE_SIZE) || 10485760;
  if (size > maxSize) {
    return res.status(400).json({
      success: false,
      error: 'File too large',
      message: `File size ${(size / 1024 / 1024).toFixed(2)}MB exceeds maximum allowed size of ${(maxSize / 1024 / 1024).toFixed(2)}MB`
    });
  }

  // Validate file extension
  const allowedTypes = ['.pdf', '.doc', '.docx'];
  const fileExtension = path.extname(originalname).toLowerCase();
  
  if (!allowedTypes.includes(fileExtension)) {
    return res.status(400).json({
      success: false,
      error: 'Invalid file type',
      message: `File type ${fileExtension} not allowed. Allowed types: ${allowedTypes.join(', ')}`
    });
  }

  next();
};

// Create upload middleware with validation
const createUploadMiddleware = (fieldName = 'file') => {
  return [
    ...uploadWithErrorHandling(fieldName),
    validateFile
  ];
};

export default {
  single: upload.single.bind(upload),
  multiple: upload.array.bind(upload),
  fields: upload.fields.bind(upload),
  uploadWithErrorHandling,
  validateFile,
  createUploadMiddleware,
  handleMulterError
};
