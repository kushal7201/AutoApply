const cloudinary = require('cloudinary').v2;
const logger = require('../utils/logger');

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Test connection
const testConnection = async () => {
  try {
    // Verify credentials are present
    if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
      console.warn('❌ Cloudinary credentials missing in environment variables');
      return false;
    }

    const result = await cloudinary.api.ping();
    if (result.status === 'ok') {
      console.log('☁️  Cloudinary Connected Successfully');
      return true;
    }
    return false;
  } catch (error) {
    console.warn('❌ Cloudinary connection error:', error.message);
    if (error.error && error.error.message) {
      console.warn('❌ Cloudinary error details:', error.error.message);
    }
    return false;
  }
};

// Upload file to Cloudinary
const uploadFile = async (filePath, options = {}) => {
  try {
    const defaultOptions = {
      resource_type: 'auto',
      folder: 'autoapply',
      use_filename: true,
      unique_filename: true,
    };

    const result = await cloudinary.uploader.upload(filePath, {
      ...defaultOptions,
      ...options,
    });

    logger.info(`📤 File uploaded to Cloudinary: ${result.public_id}`);
    return {
      success: true,
      url: result.secure_url,
      public_id: result.public_id,
      format: result.format,
      bytes: result.bytes,
      width: result.width,
      height: result.height,
    };
  } catch (error) {
    logger.error('Error uploading to Cloudinary:', error);
    return {
      success: false,
      error: error.message,
    };
  }
};

// Upload from buffer
const uploadBuffer = async (buffer, options = {}) => {
  try {
    return new Promise((resolve, reject) => {
      const defaultOptions = {
        resource_type: 'auto',
        folder: 'autoapply',
        use_filename: true,
        unique_filename: true,
      };

      cloudinary.uploader.upload_stream(
        { ...defaultOptions, ...options },
        (error, result) => {
          if (error) {
            logger.error('Error uploading buffer to Cloudinary:', error);
            reject({
              success: false,
              error: error.message,
            });
          } else {
            logger.info(`📤 Buffer uploaded to Cloudinary: ${result.public_id}`);
            resolve({
              success: true,
              url: result.secure_url,
              public_id: result.public_id,
              format: result.format,
              bytes: result.bytes,
              width: result.width,
              height: result.height,
            });
          }
        }
      ).end(buffer);
    });
  } catch (error) {
    logger.error('Error uploading buffer to Cloudinary:', error);
    return {
      success: false,
      error: error.message,
    };
  }
};

// Delete file from Cloudinary
const deleteFile = async (publicId) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    if (result.result === 'ok') {
      logger.info(`🗑️  File deleted from Cloudinary: ${publicId}`);
      return { success: true };
    } else {
      logger.warn(`⚠️  File not found in Cloudinary: ${publicId}`);
      return { success: false, error: 'File not found' };
    }
  } catch (error) {
    logger.error('Error deleting from Cloudinary:', error);
    return {
      success: false,
      error: error.message,
    };
  }
};

// Generate signed upload URL for direct uploads
const generateSignedUploadUrl = (options = {}) => {
  try {
    const timestamp = Math.round(new Date().getTime() / 1000);
    const defaultOptions = {
      timestamp,
      folder: 'autoapply',
      resource_type: 'auto',
    };

    const params = { ...defaultOptions, ...options };
    const signature = cloudinary.utils.api_sign_request(params, process.env.CLOUDINARY_API_SECRET);

    return {
      success: true,
      upload_url: `https://api.cloudinary.com/v1_1/${process.env.CLOUDINARY_CLOUD_NAME}/auto/upload`,
      params: {
        ...params,
        signature,
        api_key: process.env.CLOUDINARY_API_KEY,
      },
    };
  } catch (error) {
    logger.error('Error generating signed upload URL:', error);
    return {
      success: false,
      error: error.message,
    };
  }
};

module.exports = {
  cloudinary,
  uploadFile,
  uploadBuffer,
  deleteFile,
  generateSignedUploadUrl,
  testConnection,
};
