const express = require('express');
const { protect, adminOnly } = require('../middleware/auth');

const router = express.Router();

// @desc    Get admin dashboard stats
// @route   GET /api/admin/dashboard
// @access  Private/Admin
router.get('/dashboard', protect, adminOnly, (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Admin dashboard - Coming soon',
    data: {
      totalUsers: 0,
      totalProducts: 0,
      totalOrders: 0,
      totalRevenue: 0
    }
  });
});

// @desc    Get all users for admin
// @route   GET /api/admin/users
// @access  Private/Admin
router.get('/users', protect, adminOnly, (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Admin users management - Coming soon',
    data: []
  });
});

// @desc    Get all transactions
// @route   GET /api/admin/transactions
// @access  Private/Admin
router.get('/transactions', protect, adminOnly, (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Admin transactions - Coming soon',
    data: []
  });
});

// @desc    Manage user status
// @route   PUT /api/admin/users/:id/status
// @access  Private/Admin
router.put('/users/:id/status', protect, adminOnly, (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Update user status - Coming soon'
  });
});

module.exports = router;
