const express = require('express');
const router = express.Router();

// @desc    Get all profiles (placeholder)
// @route   GET /api/profile
// @access  Private
router.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Profile routes - coming soon',
    data: []
  });
});

module.exports = router;
