const express = require('express');
const router = express.Router();

// @desc    Get all jobs (placeholder)
// @route   GET /api/jobs
// @access  Public
router.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Jobs routes - coming soon',
    data: []
  });
});

module.exports = router;
