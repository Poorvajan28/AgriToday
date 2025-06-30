const express = require('express');
const { protect, farmerWithSubscription } = require('../middleware/auth');

const router = express.Router();

// @desc    Get all products
// @route   GET /api/products
// @access  Public
router.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Products listing - Coming soon',
    data: []
  });
});

// @desc    Create new product
// @route   POST /api/products
// @access  Private/Farmer
router.post('/', protect, farmerWithSubscription, (req, res) => {
  res.status(201).json({
    success: true,
    message: 'Create product - Coming soon'
  });
});

// @desc    Get single product
// @route   GET /api/products/:id
// @access  Public
router.get('/:id', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Get single product - Coming soon'
  });
});

// @desc    Update product
// @route   PUT /api/products/:id
// @access  Private/Farmer
router.put('/:id', protect, farmerWithSubscription, (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Update product - Coming soon'
  });
});

// @desc    Delete product
// @route   DELETE /api/products/:id
// @access  Private/Farmer
router.delete('/:id', protect, farmerWithSubscription, (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Delete product - Coming soon'
  });
});

module.exports = router;
