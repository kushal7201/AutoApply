const express = require('express');
const router = express.Router();

// @desc    Get all applications (placeholder)
// @route   GET /api/applications
// @access  Private
router.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Applications routes - coming soon',
    data: []
  });
});

module.exports = router;
