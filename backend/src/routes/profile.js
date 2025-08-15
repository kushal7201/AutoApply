const express = require('express');
const router = express.Router();
const path = require('path');
const jwt = require('jsonwebtoken');
const { authenticate } = require('../middleware/auth');
const CandidateProfile = require('../models/CandidateProfile');
const multer = require('multer');
const fs = require('fs');

// Try to import cloudinary, ensure it's properly configured
let cloudinary;
let cloudinaryConfig;

try {
  // Ensure environment variables are loaded
  require('dotenv').config();

  cloudinaryConfig = require('../config/cloudinary');
  cloudinary = cloudinaryConfig.cloudinary;

  // Verify credentials are available
  if (
    !process.env.CLOUDINARY_CLOUD_NAME ||
    !process.env.CLOUDINARY_API_KEY ||
    !process.env.CLOUDINARY_API_SECRET
  ) {
    throw new Error('Cloudinary credentials not found in environment variables');
  }

  console.log('✅ Cloudinary configuration loaded successfully');
} catch (error) {
  console.error('❌ Failed to configure Cloudinary:', error.message);
  throw error; // Fail fast if Cloudinary is not configured
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/resumes/');
  },
  filename: function (req, file, cb) {
    cb(null, `${req.user.id}-${Date.now()}-${file.originalname}`);
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: function (req, file, cb) {
    // Accept only PDF, DOC, and DOCX files
    if (
      file.mimetype === 'application/pdf' ||
      file.mimetype === 'application/msword' ||
      file.mimetype ===
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ) {
      cb(null, true);
    } else {
      cb(new Error('Only PDF, DOC, and DOCX files are allowed'));
    }
  }
});
// ==========================
// Routes
// ==========================

// @desc    Get user profile
// @route   GET /api/profile
// @access  Private
router.get('/', authenticate, async (req, res) => {
  try {
    // First get the user data
    const User = require('../models/User');
    const user = await User.findById(req.user.id).select('-password');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    let profile = await CandidateProfile.findOne({ userId: req.user.id });

    if (!profile) {
      // Create a new profile with only the non-duplicate fields
      profile = new CandidateProfile({
        userId: req.user.id,
        personalInfo: {
          phone: '',
          address: {
            street: '',
            city: '',
            state: '',
            country: '',
            zipCode: ''
          },
          linkedIn: '',
          portfolio: '',
          github: '',
          website: ''
        },
        skills: [],
        workExperience: [],
        education: [],
        resumes: [],
        jobPreferences: {
          preferredTitles: [],
          preferredLocations: [],
          jobType: 'full-time',
          experienceLevel: 'mid-level',
          salaryRange: { min: null, max: null },
          remotePreference: 'no-preference'
        }
      });
      await profile.save();
    }

    // Merge user data with profile data
    const mergedProfile = {
      ...profile.toObject(),
      personalInfo: {
        ...profile.personalInfo,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email
      }
    };

    res.json({ success: true, data: mergedProfile });
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching profile',
      error: error.message
    });
  }
});

// @desc    Update personal information
// @route   PUT /api/profile/personal
// @access  Private
router.put('/personal', authenticate, async (req, res) => {
  try {
    const User = require('../models/User');
    
    let profile = await CandidateProfile.findOne({ userId: req.user.id });
    
    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Profile not found'
      });
    }

    // Get user data
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Separate the fields that belong to User model vs CandidateProfile model
    const userFields = {};
    const profileFields = {};
    
    // Fields that belong to User model
    if (req.body.firstName !== undefined) userFields.firstName = req.body.firstName;
    if (req.body.lastName !== undefined) userFields.lastName = req.body.lastName;
    if (req.body.email !== undefined) userFields.email = req.body.email;
    
    // Fields that belong to CandidateProfile model
    if (req.body.phone !== undefined) profileFields.phone = req.body.phone;
    if (req.body.address !== undefined) profileFields.address = req.body.address;
    if (req.body.linkedIn !== undefined) profileFields.linkedIn = req.body.linkedIn;
    if (req.body.portfolio !== undefined) profileFields.portfolio = req.body.portfolio;
    if (req.body.github !== undefined) profileFields.github = req.body.github;
    if (req.body.website !== undefined) profileFields.website = req.body.website;

    // Update User model if there are user fields
    if (Object.keys(userFields).length > 0) {
      await User.findByIdAndUpdate(req.user.id, userFields, { new: true });
    }

    // Update CandidateProfile model if there are profile fields
    if (Object.keys(profileFields).length > 0) {
      profile.personalInfo = { ...profile.personalInfo, ...profileFields };
    }
    
    profile.updatedAt = new Date();
    await profile.save();

    // Get updated user data for response
    const updatedUser = await User.findById(req.user.id).select('-password');
    
    // Merge response data
    const mergedProfile = {
      ...profile.toObject(),
      personalInfo: {
        ...profile.personalInfo,
        firstName: updatedUser.firstName,
        lastName: updatedUser.lastName,
        email: updatedUser.email
      }
    };

    res.json({
      success: true,
      message: 'Personal information updated successfully',
      data: mergedProfile
    });
  } catch (error) {
    console.error('Error updating personal info:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating personal information',
      error: error.message
    });
  }
});

// @desc    Update skills
// @route   PUT /api/profile/skills
// @access  Private
router.put('/skills', authenticate, async (req, res) => {
  try {
    let profile = await CandidateProfile.findOne({ userId: req.user.id });
    
    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Profile not found'
      });
    }

    profile.skills = req.body.skills || [];
    profile.updatedAt = new Date();
    
    await profile.save();

    res.json({
      success: true,
      message: 'Skills updated successfully',
      data: profile
    });
  } catch (error) {
    console.error('Error updating skills:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating skills',
      error: error.message
    });
  }
});

// @desc    Get resumes
// @route   GET /api/profile/resumes
// @access  Private
router.get('/resumes', authenticate, async (req, res) => {
  try {
    const profile = await CandidateProfile.findOne({ userId: req.user.id });
    
    if (!profile) {
      return res.json({
        success: true,
        data: []
      });
    }

    res.json({
      success: true,
      data: profile.resumes || []
    });
  } catch (error) {
    console.error('Error fetching resumes:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching resumes',
      error: error.message
    });
  }
});

// @desc    Upload resume
// @route   POST /api/profile/resume/upload
// @access  Private
router.post('/resume/upload', authenticate, upload.single('resume'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    let cloudinaryUrl = null;
    let cloudinaryPublicId = null;

    // Force Cloudinary upload - no local fallback for production use
    if (!cloudinary || !cloudinaryConfig) {
      return res.status(500).json({
        success: false,
        message: 'File upload service not available. Please contact administrator.'
      });
    }

    try {
      // Get file extension
      const fileExtension = req.file.originalname.split('.').pop().toLowerCase();
      
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: 'autoapply/resumes',
        resource_type: 'raw',
        public_id: `${req.user.id}-${Date.now()}-${req.body.name || 'resume'}`,
        use_filename: false,
        unique_filename: true
      });

      // Use the secure_url directly - this should work for downloads
      cloudinaryUrl = result.secure_url;
      cloudinaryPublicId = result.public_id;

      // Delete temporary file
      fs.unlinkSync(req.file.path);
      console.log('☁️  Resume uploaded to Cloudinary successfully:', cloudinaryUrl);
    } catch (cloudinaryError) {
      console.error('Cloudinary upload failed:', cloudinaryError);
      
      // Clean up temp file
      if (req.file && fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
      
      return res.status(500).json({
        success: false,
        message: 'Failed to upload file to cloud storage. Please try again.',
        error: cloudinaryError.message
      });
    }

    let profile = await CandidateProfile.findOne({ userId: req.user.id });
    
    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Profile not found'
      });
    }

    // Get file extension for fileType and validate it
    const fileExtension = req.file.originalname.split('.').pop().toLowerCase();
    
    // Validate file type matches our schema enum
    if (!['pdf', 'doc', 'docx'].includes(fileExtension)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid file type. Only PDF, DOC, and DOCX files are allowed.'
      });
    }
    
    // Check if this should be the default resume
    const isDefault = profile.resumes.length === 0 || req.body.isDefault === 'true';
    
    // If setting as default, update existing resumes
    if (isDefault) {
      profile.resumes.forEach(resume => resume.isDefault = false);
    }
    
    // Add new resume with all required fields
    const newResume = {
      filename: req.file.originalname,
      cloudinaryUrl: cloudinaryUrl,
      cloudinaryPublicId: cloudinaryPublicId,
      fileType: fileExtension,
      fileSize: req.file.size,
      isActive: true,
      isDefault: isDefault,
      uploadDate: new Date()
    };

    profile.resumes.push(newResume);
    profile.updatedAt = new Date();
    
    await profile.save();

    res.json({
      success: true,
      message: 'Resume uploaded successfully',
      data: newResume
    });
  } catch (error) {
    console.error('Error uploading resume:', error);
    
    // Clean up temp file if it exists
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    
    res.status(500).json({
      success: false,
      message: 'Error uploading resume',
      error: error.message
    });
  }
});

// @desc    Set default resume
// @route   PUT /api/profile/resume/:id/default
// @access  Private
router.put('/resume/:id/default', authenticate, async (req, res) => {
  try {
    const profile = await CandidateProfile.findOne({ userId: req.user.id });
    
    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Profile not found'
      });
    }

    const resume = profile.resumes.id(req.params.id);
    
    if (!resume) {
      return res.status(404).json({
        success: false,
        message: 'Resume not found'
      });
    }

    // Set all resumes to non-default
    profile.resumes.forEach(r => r.isDefault = false);
    
    // Set this resume as default
    resume.isDefault = true;
    profile.updatedAt = new Date();
    
    await profile.save();

    res.json({
      success: true,
      message: 'Default resume updated successfully',
      data: profile.resumes
    });
  } catch (error) {
    console.error('Error setting default resume:', error);
    res.status(500).json({
      success: false,
      message: 'Error setting default resume',
      error: error.message
    });
  }
});

// @desc    Download/View resume
// @route   GET /api/profile/resume/:id/download
// @access  Private
router.get('/resume/:id/download', async (req, res) => {
  try {
    console.log('Download request for resume ID:', req.params.id);
    
    // Check for token in query params for direct download links
    let token = req.headers.authorization?.replace('Bearer ', '');
    if (!token && req.query.token) {
      token = req.query.token;
    }
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'No authentication token provided'
      });
    }
    
    // Verify token manually
    const jwt = require('jsonwebtoken');
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token'
      });
    }
    
    // Set CORS headers for download
    res.header('Access-Control-Allow-Origin', req.headers.origin || '*');
    res.header('Access-Control-Allow-Credentials', 'true');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    
    const profile = await CandidateProfile.findOne({ userId: decoded.id });
    
    if (!profile) {
      console.log('Profile not found for user:', decoded.id);
      return res.status(404).json({
        success: false,
        message: 'Profile not found'
      });
    }

    const resume = profile.resumes.id(req.params.id);
    
    if (!resume) {
      console.log('Resume not found with ID:', req.params.id);
      return res.status(404).json({
        success: false,
        message: 'Resume not found'
      });
    }

    console.log('Resume found:', {
      filename: resume.filename,
      cloudinaryUrl: resume.cloudinaryUrl,
      cloudinaryPublicId: resume.cloudinaryPublicId
    });

    // For untrusted Cloudinary accounts, we need a workaround
    if (resume.cloudinaryUrl && resume.cloudinaryUrl.startsWith('http')) {
      console.log('Attempting to serve file for untrusted account');
      
      // For untrusted accounts, the best approach is to:
      // 1. Download the file ourselves from Cloudinary (this usually works)
      // 2. Stream it to the user with proper headers
      
      try {
        const axios = require('axios');
        
        // Try to fetch the file from the original Cloudinary URL
        const response = await axios({
          method: 'GET',
          url: resume.cloudinaryUrl,
          responseType: 'stream',
          timeout: 30000 // 30 second timeout
        });
        
        // Set proper headers for the file
        res.setHeader('Content-Type', resume.fileType === 'pdf' ? 'application/pdf' : 'application/octet-stream');
        res.setHeader('Content-Disposition', `inline; filename="${resume.filename}"`);
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Cache-Control', 'public, max-age=3600'); // Cache for 1 hour
        
        // Pipe the response
        response.data.pipe(res);
        console.log('Successfully streaming file from Cloudinary');
        return;
        
      } catch (fetchError) {
        console.error('Error fetching from Cloudinary:', fetchError.message);
        
        // If direct access fails, try with authentication
        if (fetchError.response?.status === 403 || fetchError.response?.status === 401) {
          return res.status(403).json({
            success: false,
            message: 'File access restricted. Please contact support to verify your Cloudinary account.',
            hint: 'This is likely due to Cloudinary account restrictions for new/free accounts.'
          });
        }
        
        return res.status(500).json({
          success: false,
          message: 'Unable to access file from cloud storage'
        });
      }
    }
    
    // If we have a cloudinaryPublicId but no URL, try to generate the basic URL
    if (resume.cloudinaryPublicId && cloudinary) {
      console.log('Generating basic Cloudinary URL for public ID:', resume.cloudinaryPublicId);
      
      try {
        // Generate a basic raw file URL without transformations
        const basicUrl = `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/raw/upload/${resume.cloudinaryPublicId}`;
        console.log('Generated basic URL:', basicUrl);
        
        // Try to fetch and stream this URL
        const axios = require('axios');
        const response = await axios({
          method: 'GET',
          url: basicUrl,
          responseType: 'stream',
          timeout: 30000
        });
        
        res.setHeader('Content-Type', resume.fileType === 'pdf' ? 'application/pdf' : 'application/octet-stream');
        res.setHeader('Content-Disposition', `inline; filename="${resume.filename}"`);
        res.setHeader('Access-Control-Allow-Origin', '*');
        
        response.data.pipe(res);
        return;
        
      } catch (urlError) {
        console.error('Error with basic Cloudinary URL:', urlError.message);
      }
    }
    
    // If somehow a file doesn't have a proper Cloudinary URL, return error
    console.log('Invalid resume URL - not a Cloudinary URL:', resume.cloudinaryUrl);
    res.status(404).json({
      success: false,
      message: 'Resume file not accessible - invalid storage location'
    });
  } catch (error) {
    console.error('Error downloading resume:', error);
    res.status(500).json({
      success: false,
      message: 'Error downloading resume',
      error: error.message
    });
  }
});

// @desc    Delete resume
// @route   DELETE /api/profile/resume/:id
// @access  Private
router.delete('/resume/:id', authenticate, async (req, res) => {
  try {
    const profile = await CandidateProfile.findOne({ userId: req.user.id });
    
    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Profile not found'
      });
    }

    const resume = profile.resumes.id(req.params.id);
    
    if (!resume) {
      return res.status(404).json({
        success: false,
        message: 'Resume not found'
      });
    }

    // Delete from Cloudinary if it was uploaded there
    if (resume.cloudinaryPublicId && cloudinary) {
      try {
        await cloudinary.uploader.destroy(resume.cloudinaryPublicId, { resource_type: 'raw' });
      } catch (cloudinaryError) {
        console.warn('Failed to delete from Cloudinary:', cloudinaryError.message);
        // Continue with local deletion
      }
    }

    // If it's a local file, try to delete it
    if (!resume.cloudinaryPublicId && resume.fileUrl) {
      try {
        const localPath = resume.fileUrl.replace('http://localhost:5000/', '');
        if (fs.existsSync(localPath)) {
          fs.unlinkSync(localPath);
        }
      } catch (fileError) {
        console.warn('Failed to delete local file:', fileError.message);
      }
    }

    // Remove from profile
    profile.resumes.pull(req.params.id);
    profile.updatedAt = new Date();
    
    await profile.save();

    res.json({
      success: true,
      message: 'Resume deleted successfully',
      data: profile.resumes
    });
  } catch (error) {
    console.error('Error deleting resume:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting resume',
      error: error.message
    });
  }
});

// @desc    Add work experience
// @route   POST /api/profile/experience
// @access  Private
router.post('/experience', authenticate, async (req, res) => {
  try {
    const profile = await CandidateProfile.findOne({ userId: req.user.id });
    
    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Profile not found'
      });
    }

    profile.workExperience.push(req.body);
    profile.updatedAt = new Date();
    
    await profile.save();

    res.json({
      success: true,
      message: 'Work experience added successfully',
      data: profile
    });
  } catch (error) {
    console.error('Error adding work experience:', error);
    res.status(500).json({
      success: false,
      message: 'Error adding work experience',
      error: error.message
    });
  }
});

// @desc    Update work experience
// @route   PUT /api/profile/experience/:id
// @access  Private
router.put('/experience/:id', authenticate, async (req, res) => {
  try {
    const profile = await CandidateProfile.findOne({ userId: req.user.id });
    
    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Profile not found'
      });
    }

    const experience = profile.workExperience.id(req.params.id);
    
    if (!experience) {
      return res.status(404).json({
        success: false,
        message: 'Work experience not found'
      });
    }

    // Update experience
    Object.assign(experience, req.body);
    profile.updatedAt = new Date();
    
    await profile.save();

    res.json({
      success: true,
      message: 'Work experience updated successfully',
      data: profile
    });
  } catch (error) {
    console.error('Error updating work experience:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating work experience',
      error: error.message
    });
  }
});

// @desc    Delete work experience
// @route   DELETE /api/profile/experience/:id
// @access  Private
router.delete('/experience/:id', authenticate, async (req, res) => {
  try {
    const profile = await CandidateProfile.findOne({ userId: req.user.id });
    
    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Profile not found'
      });
    }

    profile.workExperience.pull(req.params.id);
    profile.updatedAt = new Date();
    
    await profile.save();

    res.json({
      success: true,
      message: 'Work experience deleted successfully',
      data: profile
    });
  } catch (error) {
    console.error('Error deleting work experience:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting work experience',
      error: error.message
    });
  }
});

// @desc    Add education
// @route   POST /api/profile/education
// @access  Private
router.post('/education', authenticate, async (req, res) => {
  try {
    const profile = await CandidateProfile.findOne({ userId: req.user.id });
    
    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Profile not found'
      });
    }

    profile.education.push(req.body);
    profile.updatedAt = new Date();
    
    await profile.save();

    res.json({
      success: true,
      message: 'Education added successfully',
      data: profile
    });
  } catch (error) {
    console.error('Error adding education:', error);
    res.status(500).json({
      success: false,
      message: 'Error adding education',
      error: error.message
    });
  }
});

// @desc    Update education
// @route   PUT /api/profile/education/:id
// @access  Private
router.put('/education/:id', authenticate, async (req, res) => {
  try {
    const profile = await CandidateProfile.findOne({ userId: req.user.id });
    
    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Profile not found'
      });
    }

    const education = profile.education.id(req.params.id);
    
    if (!education) {
      return res.status(404).json({
        success: false,
        message: 'Education not found'
      });
    }

    // Update education
    Object.assign(education, req.body);
    profile.updatedAt = new Date();
    
    await profile.save();

    res.json({
      success: true,
      message: 'Education updated successfully',
      data: profile
    });
  } catch (error) {
    console.error('Error updating education:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating education',
      error: error.message
    });
  }
});

// @desc    Delete education
// @route   DELETE /api/profile/education/:id
// @access  Private
router.delete('/education/:id', authenticate, async (req, res) => {
  try {
    const profile = await CandidateProfile.findOne({ userId: req.user.id });
    
    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Profile not found'
      });
    }

    profile.education.pull(req.params.id);
    profile.updatedAt = new Date();
    
    await profile.save();

    res.json({
      success: true,
      message: 'Education deleted successfully',
      data: profile
    });
  } catch (error) {
    console.error('Error deleting education:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting education',
      error: error.message
    });
  }
});

// @desc    Update job preferences
// @route   PUT /api/profile/preferences
// @access  Private
router.put('/preferences', authenticate, async (req, res) => {
  try {
    const profile = await CandidateProfile.findOne({ userId: req.user.id });
    
    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Profile not found'
      });
    }

    profile.jobPreferences = { ...profile.jobPreferences, ...req.body };
    profile.updatedAt = new Date();
    
    await profile.save();

    res.json({
      success: true,
      message: 'Job preferences updated successfully',
      data: profile
    });
  } catch (error) {
    console.error('Error updating job preferences:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating job preferences',
      error: error.message
    });
  }
});

// @desc    Get profile completion status
// @route   GET /api/profile/completion
// @access  Private
router.get('/completion', authenticate, async (req, res) => {
  try {
    const profile = await CandidateProfile.findOne({ userId: req.user.id });
    
    if (!profile) {
      return res.json({
        success: true,
        data: {
          overall: 0,
          sections: {
            personalInfo: 0,
            skills: 0,
            workExperience: 0,
            education: 0,
            resumes: 0
          }
        }
      });
    }

    // Get user data for completion calculation
    const User = require('../models/User');
    const user = await User.findById(req.user.id).select('-password');
    
    // Calculate completion percentages
    const personalInfoFields = ['firstName', 'lastName', 'email', 'phone'];
    const personalInfoCompleted = personalInfoFields.filter(field => {
      if (field === 'firstName' || field === 'lastName' || field === 'email') {
        // These come from User model
        return user[field] && user[field].trim() !== '';
      } else {
        // These come from CandidateProfile model
        return profile.personalInfo[field] && profile.personalInfo[field].trim() !== '';
      }
    }).length;
    const personalInfoPercent = (personalInfoCompleted / personalInfoFields.length) * 100;

    const skillsPercent = profile.skills.length > 0 ? 100 : 0;
    const workExperiencePercent = profile.workExperience.length > 0 ? 100 : 0;
    const educationPercent = profile.education.length > 0 ? 100 : 0;
    const resumesPercent = profile.resumes.length > 0 ? 100 : 0;

    const overall = (personalInfoPercent + skillsPercent + workExperiencePercent + educationPercent + resumesPercent) / 5;

    res.json({
      success: true,
      data: {
        overall: Math.round(overall),
        sections: {
          personalInfo: Math.round(personalInfoPercent),
          skills: skillsPercent,
          workExperience: workExperiencePercent,
          education: educationPercent,
          resumes: resumesPercent
        }
      }
    });
  } catch (error) {
    console.error('Error calculating profile completion:', error);
    res.status(500).json({
      success: false,
      message: 'Error calculating profile completion',
      error: error.message
    });
  }
});

module.exports = router;
