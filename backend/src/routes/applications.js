import express from 'express';
import {
  applyToJob,
  getApplications,
  getApplication,
  retryApplication,
  cancelApplication,
  startRapidApply,
  stopRapidApply,
  getRapidApplyStatus
} from '../controllers/applications.js';
import auth from '../middleware/auth.js';

const router = express.Router();

// All routes are protected
router.use(auth);

// @route   POST /api/applications/apply/:jobId
// @desc    Apply to job
// @access  Private
router.post('/apply/:jobId', applyToJob);

// @route   GET /api/applications
// @desc    Get user applications
// @access  Private
router.get('/', getApplications);

// @route   GET /api/applications/:id
// @desc    Get application details
// @access  Private
router.get('/:id', getApplication);

// @route   POST /api/applications/:id/retry
// @desc    Retry failed application
// @access  Private
router.post('/:id/retry', retryApplication);

// @route   DELETE /api/applications/:id
// @desc    Cancel application
// @access  Private
router.delete('/:id', cancelApplication);

// @route   POST /api/applications/rapid-apply/start
// @desc    Start rapid apply
// @access  Private
router.post('/rapid-apply/start', startRapidApply);

// @route   POST /api/applications/rapid-apply/stop
// @desc    Stop rapid apply
// @access  Private
router.post('/rapid-apply/stop', stopRapidApply);

// @route   GET /api/applications/rapid-apply/status
// @desc    Get rapid apply status
// @access  Private
router.get('/rapid-apply/status', getRapidApplyStatus);

export default router;
