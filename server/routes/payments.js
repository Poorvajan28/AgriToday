const express = require('express');
const {
  createSubscriptionOrder,
  verifySubscriptionPayment,
  getSubscriptionStatus,
  cancelSubscription,
  handleWebhook,
  getPaymentHistory
} = require('../controllers/paymentController');

const { protect } = require('../middleware/auth');

const router = express.Router();

// Protected routes (require authentication)
router.post('/create-subscription-order', protect, createSubscriptionOrder);
router.post('/verify-subscription', protect, verifySubscriptionPayment);
router.get('/subscription-status', protect, getSubscriptionStatus);
router.post('/cancel-subscription', protect, cancelSubscription);
router.get('/history', protect, getPaymentHistory);

// Public webhook route (secured by Razorpay signature verification)
router.post('/webhook', handleWebhook);

module.exports = router;
