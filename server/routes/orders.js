const express = require('express');
const { protect, buyerWithSubscription } = require('../middleware/auth');

const router = express.Router();

// @desc    Get user orders
// @route   GET /api/orders
// @access  Private
router.get('/', protect, (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Get orders - Coming soon',
    data: []
  });
});

// @desc    Create new order
// @route   POST /api/orders
// @access  Private/Buyer
router.post('/', protect, buyerWithSubscription, (req, res) => {
  res.status(201).json({
    success: true,
    message: 'Create order - Coming soon'
  });
});

// @desc    Get single order
// @route   GET /api/orders/:id
// @access  Private
router.get('/:id', protect, (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Get single order - Coming soon'
  });
});

// @desc    Update order status
// @route   PUT /api/orders/:id
// @access  Private
router.put('/:id', protect, (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Update order - Coming soon'
  });
});

module.exports = router;
