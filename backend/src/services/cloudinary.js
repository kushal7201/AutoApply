import { v2 as cloudinary } from 'cloudinary';
import logger from '../utils/logger.js';

class CloudinaryService {
  constructor() {
    this.isConfigured = false;
    this.configure();
  }

  configure() {
    try {
      cloudinary.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET,
        secure: true
      });

      if (!process.env.CLOUDINARY_CLOUD_NAME || 
          !process.env.CLOUDINARY_API_KEY || 
          !process.env.CLOUDINARY_API_SECRET) {
        logger.warn('Cloudinary credentials not fully configured');
        return;
      }

      this.isConfigured = true;
      logger.info('☁️ Cloudinary configured successfully');
    } catch (error) {
      logger.error('Failed to configure Cloudinary:', error.message);
      this.isConfigured = false;
    }
  }

  // Upload file from buffer
  async uploadFile(fileBuffer, options = {}) {
    if (!this.isConfigured) {
      throw new Error('Cloudinary not configured');
    }

    try {
      return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            resource_type: 'auto',
            folder: 'autoapply',
            ...options
          },
          (error, result) => {
            if (error) {
              logger.error('Cloudinary upload error:', error.message);
              reject(error);
            } else {
              logger.info(`📤 File uploaded to Cloudinary: ${result.public_id}`);
              resolve(result);
            }
          }
        );

        uploadStream.end(fileBuffer);
      });
    } catch (error) {
      logger.error('Error uploading file to Cloudinary:', error.message);
      throw error;
    }
  }

  // Upload resume
  async uploadResume(fileBuffer, userId, filename) {
    return await this.uploadFile(fileBuffer, {
      folder: `autoapply/resumes/${userId}`,
      public_id: `resume_${Date.now()}`,
      resource_type: 'raw',
      tags: ['resume', userId],
      context: {
        alt: filename,
        caption: `Resume for user ${userId}`
      }
    });
  }

  // Upload screenshot
  async uploadScreenshot(fileBuffer, applicationId) {
    return await this.uploadFile(fileBuffer, {
      folder: `autoapply/screenshots/${applicationId}`,
      public_id: `screenshot_${Date.now()}`,
      resource_type: 'image',
      tags: ['screenshot', applicationId],
      transformation: [
        { quality: 'auto' },
        { fetch_format: 'auto' }
      ]
    });
  }

  // Delete file
  async deleteFile(publicId, resourceType = 'auto') {
    if (!this.isConfigured) {
      throw new Error('Cloudinary not configured');
    }

    try {
      const result = await cloudinary.uploader.destroy(publicId, {
        resource_type: resourceType
      });

      if (result.result === 'ok') {
        logger.info(`🗑️ File deleted from Cloudinary: ${publicId}`);
        return { success: true, result };
      } else {
        logger.warn(`Failed to delete file from Cloudinary: ${publicId}`);
        return { success: false, result };
      }
    } catch (error) {
      logger.error('Error deleting file from Cloudinary:', error.message);
      throw error;
    }
  }

  // Get file info
  async getFileInfo(publicId, resourceType = 'auto') {
    if (!this.isConfigured) {
      throw new Error('Cloudinary not configured');
    }

    try {
      const result = await cloudinary.api.resource(publicId, {
        resource_type: resourceType
      });

      return result;
    } catch (error) {
      logger.error('Error getting file info from Cloudinary:', error.message);
      throw error;
    }
  }

  // Generate signed URL for private files
  async generateSignedUrl(publicId, options = {}) {
    if (!this.isConfigured) {
      throw new Error('Cloudinary not configured');
    }

    try {
      const signedUrl = cloudinary.url(publicId, {
        sign_url: true,
        type: 'authenticated',
        expires_at: Math.floor(Date.now() / 1000) + 3600, // 1 hour
        ...options
      });

      return signedUrl;
    } catch (error) {
      logger.error('Error generating signed URL:', error.message);
      throw error;
    }
  }

  // List files in a folder
  async listFiles(folder, options = {}) {
    if (!this.isConfigured) {
      throw new Error('Cloudinary not configured');
    }

    try {
      const result = await cloudinary.api.resources({
        type: 'upload',
        prefix: folder,
        max_results: 50,
        ...options
      });

      return result.resources;
    } catch (error) {
      logger.error('Error listing files from Cloudinary:', error.message);
      throw error;
    }
  }

  // Health check
  async healthCheck() {
    if (!this.isConfigured) {
      return { status: 'not_configured', message: 'Cloudinary not configured' };
    }

    try {
      // Test API connectivity by getting account details
      await cloudinary.api.ping();
      
      return {
        status: 'connected',
        configured: this.isConfigured,
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME
      };
    } catch (error) {
      return {
        status: 'error',
        message: error.message,
        configured: false
      };
    }
  }
}

// Create singleton instance
const cloudinaryService = new CloudinaryService();

export default cloudinaryService;
