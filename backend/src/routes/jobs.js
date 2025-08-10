import express from 'express';
import {
  searchJobs,
  getJob,
  saveJob,
  unsaveJob,
  getSavedJobs
} from '../controllers/jobs.js';
import auth from '../middleware/auth.js';

const router = express.Router();

// All routes are protected
router.use(auth);

// @route   GET /api/jobs/search
// @desc    Search jobs
// @access  Private
router.get('/search', searchJobs);

// @route   GET /api/jobs/saved
// @desc    Get saved jobs
// @access  Private
router.get('/saved', getSavedJobs);

// @route   GET /api/jobs/:id
// @desc    Get job details
// @access  Private
router.get('/:id', getJob);

// @route   POST /api/jobs/:id/save
// @desc    Save job
// @access  Private
router.post('/:id/save', saveJob);

// @route   DELETE /api/jobs/:id/save
// @desc    Unsave job
// @access  Private
router.delete('/:id/save', unsaveJob);

export default router;
