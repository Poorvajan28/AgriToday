const Razorpay = require('razorpay');
const crypto = require('crypto');
const User = require('../models/User');

// Initialize Razorpay
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});

// @desc    Create subscription order
// @route   POST /api/payments/create-subscription-order
// @access  Private
const createSubscriptionOrder = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if user already has active subscription
    if (user.hasActiveSubscription()) {
      return res.status(400).json({
        success: false,
        message: 'User already has an active subscription',
        subscription: {
          isActive: user.subscription.isActive,
          endDate: user.subscription.endDate
        }
      });
    }

    const amount = parseInt(process.env.SUBSCRIPTION_AMOUNT); // ₹49 in paise
    const currency = process.env.SUBSCRIPTION_CURRENCY || 'INR';

    // Create order with Razorpay
    const order = await razorpay.orders.create({
      amount: amount,
      currency: currency,
      receipt: `sub_${user._id}_${Date.now()}`,
      payment_capture: 1,
      notes: {
        user_id: user._id.toString(),
        subscription_type: 'monthly',
        plan_name: 'AgroCulture Basic'
      }
    });

    res.status(200).json({
      success: true,
      order: {
        id: order.id,
        amount: order.amount,
        currency: order.currency,
        key: process.env.RAZORPAY_KEY_ID
      },
      user: {
        name: user.name,
        email: user.email,
        phone: user.phone
      }
    });
  } catch (error) {
    console.error('Create subscription order error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating subscription order',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Verify subscription payment
// @route   POST /api/payments/verify-subscription
// @access  Private
const verifySubscriptionPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: 'Missing payment verification details'
      });
    }

    // Verify signature
    const body = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: 'Payment verification failed'
      });
    }

    // Fetch payment details from Razorpay
    const payment = await razorpay.payments.fetch(razorpay_payment_id);

    if (payment.status !== 'captured') {
      return res.status(400).json({
        success: false,
        message: 'Payment not captured'
      });
    }

    // Update user subscription
    const user = await User.findById(req.user.id);
    const startDate = new Date();
    const endDate = new Date(startDate.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 days

    user.subscription = {
      isActive: true,
      startDate: startDate,
      endDate: endDate,
      razorpaySubscriptionId: razorpay_payment_id,
      lastPaymentDate: startDate
    };

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Subscription activated successfully',
      subscription: {
        isActive: user.subscription.isActive,
        startDate: user.subscription.startDate,
        endDate: user.subscription.endDate,
        amount: payment.amount / 100, // Convert paise to rupees
        currency: payment.currency
      }
    });
  } catch (error) {
    console.error('Verify subscription payment error:', error);
    res.status(500).json({
      success: false,
      message: 'Error verifying payment',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Get subscription status
// @route   GET /api/payments/subscription-status
// @access  Private
const getSubscriptionStatus = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const daysRemaining = user.subscription.endDate ? 
      Math.ceil((user.subscription.endDate - new Date()) / (1000 * 60 * 60 * 24)) : 0;

    res.status(200).json({
      success: true,
      subscription: {
        isActive: user.hasActiveSubscription(),
        startDate: user.subscription.startDate,
        endDate: user.subscription.endDate,
        lastPaymentDate: user.subscription.lastPaymentDate,
        daysRemaining: Math.max(0, daysRemaining),
        amount: process.env.SUBSCRIPTION_AMOUNT / 100,
        currency: process.env.SUBSCRIPTION_CURRENCY
      }
    });
  } catch (error) {
    console.error('Get subscription status error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching subscription status'
    });
  }
};

// @desc    Cancel subscription
// @route   POST /api/payments/cancel-subscription
// @access  Private
const cancelSubscription = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (!user.hasActiveSubscription()) {
      return res.status(400).json({
        success: false,
        message: 'No active subscription to cancel'
      });
    }

    // Don't immediately deactivate, let it expire naturally
    // This allows users to use their paid time
    user.subscription.isActive = false; // Mark as cancelled but keep end date

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Subscription cancelled successfully',
      note: 'Your subscription will remain active until the end date',
      subscription: {
        isActive: false,
        endDate: user.subscription.endDate
      }
    });
  } catch (error) {
    console.error('Cancel subscription error:', error);
    res.status(500).json({
      success: false,
      message: 'Error cancelling subscription'
    });
  }
};

// @desc    Razorpay webhook handler
// @route   POST /api/payments/webhook
// @access  Public (but secured with webhook signature)
const handleWebhook = async (req, res) => {
  try {
    const webhookSignature = req.headers['x-razorpay-signature'];
    const webhookBody = JSON.stringify(req.body);

    // Verify webhook signature
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_WEBHOOK_SECRET)
      .update(webhookBody)
      .digest('hex');

    if (webhookSignature !== expectedSignature) {
      return res.status(400).json({
        success: false,
        message: 'Invalid webhook signature'
      });
    }

    const event = req.body;

    // Handle different webhook events
    switch (event.event) {
      case 'payment.captured':
        // Handle successful payment
        console.log('Payment captured:', event.payload.payment.entity);
        break;

      case 'payment.failed':
        // Handle failed payment
        console.log('Payment failed:', event.payload.payment.entity);
        break;

      case 'subscription.charged':
        // Handle subscription renewal
        console.log('Subscription charged:', event.payload.subscription.entity);
        break;

      default:
        console.log('Unhandled webhook event:', event.event);
    }

    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).json({
      success: false,
      message: 'Webhook processing error'
    });
  }
};

// @desc    Get payment history
// @route   GET /api/payments/history
// @access  Private
const getPaymentHistory = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // This is a basic implementation
    // In a production app, you'd store detailed payment history in a separate collection
    const paymentHistory = [];

    if (user.subscription.lastPaymentDate) {
      paymentHistory.push({
        date: user.subscription.lastPaymentDate,
        amount: process.env.SUBSCRIPTION_AMOUNT / 100,
        currency: process.env.SUBSCRIPTION_CURRENCY,
        description: 'Monthly Subscription',
        status: 'completed',
        razorpayPaymentId: user.subscription.razorpaySubscriptionId
      });
    }

    res.status(200).json({
      success: true,
      payments: paymentHistory,
      total: paymentHistory.length
    });
  } catch (error) {
    console.error('Get payment history error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching payment history'
    });
  }
};

module.exports = {
  createSubscriptionOrder,
  verifySubscriptionPayment,
  getSubscriptionStatus,
  cancelSubscription,
  handleWebhook,
  getPaymentHistory
};
