import express from 'express';
import {
  getProfile,
  updateProfile,
  uploadResume,
  deleteResume,
  setPrimaryResume,
  getResumes
} from '../controllers/profile.js';
import auth from '../middleware/auth.js';
import upload from '../middleware/upload.js';

const router = express.Router();

// All routes are protected
router.use(auth);

// @route   GET /api/profile
// @desc    Get user profile
// @access  Private
router.get('/', getProfile);

// @route   PUT /api/profile
// @desc    Update user profile
// @access  Private
router.put('/', updateProfile);

// @route   GET /api/profile/resumes
// @desc    Get user resumes
// @access  Private
router.get('/resumes', getResumes);

// @route   POST /api/profile/resume
// @desc    Upload resume
// @access  Private
router.post('/resume', upload.single('resume'), uploadResume);

// @route   DELETE /api/profile/resume/:id
// @desc    Delete resume
// @access  Private
router.delete('/resume/:id', deleteResume);

// @route   PUT /api/profile/resume/:id/primary
// @desc    Set resume as primary
// @access  Private
router.put('/resume/:id/primary', setPrimaryResume);

export default router;
