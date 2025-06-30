const express = require('express');
const { protect, adminOnly } = require('../middleware/auth');

const router = express.Router();

// @desc    Get all users (Admin only)
// @route   GET /api/users
// @access  Private/Admin
router.get('/', protect, adminOnly, (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Users endpoint - Coming soon'
  });
});

// @desc    Get user by ID
// @route   GET /api/users/:id
// @access  Private
router.get('/:id', protect, (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Get user by ID - Coming soon'
  });
});

module.exports = router;
