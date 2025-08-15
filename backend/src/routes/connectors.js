const express = require('express');
const router = express.Router();

// @desc    Get all connectors (placeholder)
// @route   GET /api/connectors
// @access  Private
router.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Connectors routes - coming soon',
    data: []
  });
});

module.exports = router;
