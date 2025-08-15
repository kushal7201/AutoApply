const express = require('express');
const router = express.Router();

// @desc    Get admin dashboard (placeholder)
// @route   GET /api/admin
// @access  Private (Admin only)
router.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Admin routes - coming soon',
    data: []
  });
});

module.exports = router;
