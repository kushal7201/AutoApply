import { validationResult } from 'express-validator';
import Profile from '../models/Profile.js';
import cloudinaryService from '../services/cloudinary.js';

// Helper function to upload to Cloudinary
const uploadToCloudinary = async (fileBuffer, options = {}) => {
  try {
    const result = await cloudinaryService.uploadFile(fileBuffer, options);
    return result;
  } catch (error) {
    throw error;
  }
};

// @route   GET /api/profile
// @desc    Get user profile
// @access  Private
export const getProfile = async (req, res) => {
  try {
    const profile = await Profile.findOne({ user: req.user.userId });
    
    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Profile not found'
      });
    }

    res.json({
      success: true,
      data: { profile }
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @route   POST /api/profile
// @desc    Create or update user profile
// @access  Private
export const updateProfile = async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const {
      firstName,
      lastName,
      phone,
      location,
      bio,
      skills,
      experience,
      education,
      linkedinUrl,
      githubUrl,
      portfolioUrl
    } = req.body;

    // Build profile object
    const profileFields = {
      user: req.user.userId,
      firstName,
      lastName,
      phone,
      location,
      bio,
      linkedinUrl,
      githubUrl,
      portfolioUrl
    };

    // Parse skills if it's a string
    if (skills) {
      profileFields.skills = typeof skills === 'string' ? skills.split(',').map(skill => skill.trim()) : skills;
    }

    // Parse experience and education if they're strings
    if (experience) {
      profileFields.experience = typeof experience === 'string' ? JSON.parse(experience) : experience;
    }
    if (education) {
      profileFields.education = typeof education === 'string' ? JSON.parse(education) : education;
    }

    // Check if profile exists
    let profile = await Profile.findOne({ user: req.user.userId });

    if (profile) {
      // Update existing profile
      profile = await Profile.findOneAndUpdate(
        { user: req.user.userId },
        { $set: profileFields },
        { new: true, upsert: true }
      );
    } else {
      // Create new profile
      profile = new Profile(profileFields);
      await profile.save();
    }

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: { profile }
    });
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @route   POST /api/profile/resume
// @desc    Upload resume
// @access  Private
export const uploadResume = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    // Upload to Cloudinary
    const result = await uploadToCloudinary(req.file.buffer, {
      folder: 'autoapply/resumes',
      resource_type: 'auto',
      public_id: `resume_${req.user.userId}_${Date.now()}`
    });

    // Update profile with resume URL
    const profile = await Profile.findOneAndUpdate(
      { user: req.user.userId },
      { 
        $set: { 
          resumeUrl: result.secure_url,
          resumePublicId: result.public_id
        }
      },
      { new: true, upsert: true }
    );

    res.json({
      success: true,
      message: 'Resume uploaded successfully',
      data: {
        resumeUrl: result.secure_url,
        profile
      }
    });
  } catch (error) {
    console.error('Resume upload error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during file upload'
    });
  }
};

// @route   POST /api/profile/photo
// @desc    Upload profile photo
// @access  Private
export const uploadPhoto = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    // Upload to Cloudinary
    const result = await uploadToCloudinary(req.file.buffer, {
      folder: 'autoapply/photos',
      resource_type: 'image',
      transformation: [
        { width: 300, height: 300, crop: 'fill', gravity: 'face' },
        { quality: 'auto', fetch_format: 'auto' }
      ],
      public_id: `photo_${req.user.userId}_${Date.now()}`
    });

    // Update profile with photo URL
    const profile = await Profile.findOneAndUpdate(
      { user: req.user.userId },
      { 
        $set: { 
          photoUrl: result.secure_url,
          photoPublicId: result.public_id
        }
      },
      { new: true, upsert: true }
    );

    res.json({
      success: true,
      message: 'Photo uploaded successfully',
      data: {
        photoUrl: result.secure_url,
        profile
      }
    });
  } catch (error) {
    console.error('Photo upload error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during file upload'
    });
  }
};

// @route   DELETE /api/profile
// @desc    Delete user profile
// @access  Private
export const deleteProfile = async (req, res) => {
  try {
    const profile = await Profile.findOneAndDelete({ user: req.user.userId });
    
    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Profile not found'
      });
    }

    res.json({
      success: true,
      message: 'Profile deleted successfully'
    });
  } catch (error) {
    console.error('Delete profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @route   GET /api/profile/resumes
// @desc    Get user resumes
// @access  Private
export const getResumes = async (req, res) => {
  try {
    const profile = await Profile.findOne({ user: req.user.userId });
    
    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Profile not found'
      });
    }

    // Return resume information
    const resumes = [];
    if (profile.resumeUrl) {
      resumes.push({
        id: 'primary',
        url: profile.resumeUrl,
        publicId: profile.resumePublicId,
        isPrimary: true,
        uploadedAt: profile.updatedAt
      });
    }

    res.json({
      success: true,
      data: { resumes }
    });
  } catch (error) {
    console.error('Get resumes error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @route   DELETE /api/profile/resume/:id
// @desc    Delete resume
// @access  Private
export const deleteResume = async (req, res) => {
  try {
    const profile = await Profile.findOne({ user: req.user.userId });
    
    if (!profile || !profile.resumeUrl) {
      return res.status(404).json({
        success: false,
        message: 'Resume not found'
      });
    }

    // Delete from Cloudinary if publicId exists
    if (profile.resumePublicId) {
      try {
        await cloudinaryService.deleteFile(profile.resumePublicId, 'raw');
      } catch (cloudinaryError) {
        console.error('Error deleting from Cloudinary:', cloudinaryError);
        // Continue with database deletion even if Cloudinary deletion fails
      }
    }

    // Remove resume from profile
    profile.resumeUrl = undefined;
    profile.resumePublicId = undefined;
    await profile.save();

    res.json({
      success: true,
      message: 'Resume deleted successfully'
    });
  } catch (error) {
    console.error('Delete resume error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @route   PUT /api/profile/resume/:id/primary
// @desc    Set resume as primary
// @access  Private
export const setPrimaryResume = async (req, res) => {
  try {
    const profile = await Profile.findOne({ user: req.user.userId });
    
    if (!profile || !profile.resumeUrl) {
      return res.status(404).json({
        success: false,
        message: 'Resume not found'
      });
    }

    // For now, since we only support one resume, just return success
    res.json({
      success: true,
      message: 'Resume is already set as primary',
      data: { profile }
    });
  } catch (error) {
    console.error('Set primary resume error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};
