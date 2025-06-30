const express = require('express');
const { protect, transporterWithSubscription } = require('../middleware/auth');

const router = express.Router();

// @desc    Get transport jobs
// @route   GET /api/transport
// @access  Private/Transporter
router.get('/', protect, transporterWithSubscription, (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Get transport jobs - Coming soon',
    data: []
  });
});

// @desc    Accept transport job
// @route   POST /api/transport/:orderId/accept
// @access  Private/Transporter
router.post('/:orderId/accept', protect, transporterWithSubscription, (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Accept transport job - Coming soon'
  });
});

// @desc    Update delivery status
// @route   PUT /api/transport/:orderId/status
// @access  Private/Transporter
router.put('/:orderId/status', protect, transporterWithSubscription, (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Update delivery status - Coming soon'
  });
});

module.exports = router;
