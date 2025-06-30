const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Protect routes - general authentication
const protect = async (req, res, next) => {
  let token;

  // Check for token in header
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  // Make sure token exists
  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized to access this route'
    });
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Get user from token
    const user = await User.findById(decoded.id).select('-password');
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Account has been deactivated'
      });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(401).json({
      success: false,
      message: 'Not authorized to access this route'
    });
  }
};

// Check subscription status
const checkSubscription = async (req, res, next) => {
  try {
    const user = req.user;

    // Admin users don't need subscription
    if (user.role === 'admin') {
      return next();
    }

    // Check if user has active subscription
    if (!user.hasActiveSubscription()) {
      return res.status(403).json({
        success: false,
        message: 'Active subscription required to access this feature',
        code: 'SUBSCRIPTION_REQUIRED',
        subscriptionStatus: {
          isActive: user.subscription.isActive,
          endDate: user.subscription.endDate,
          amount: process.env.SUBSCRIPTION_AMOUNT,
          currency: process.env.SUBSCRIPTION_CURRENCY
        }
      });
    }

    next();
  } catch (error) {
    console.error('Subscription check error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error checking subscription status'
    });
  }
};

// Authorize specific roles
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `User role ${req.user.role} is not authorized to access this route`
      });
    }
    next();
  };
};

// Check if user owns the resource or is admin
const ownerOrAdmin = (resourceUserField = 'user') => {
  return (req, res, next) => {
    // Admin can access anything
    if (req.user.role === 'admin') {
      return next();
    }

    // For product routes, check if user is the farmer
    if (req.route.path.includes('products') && req.user.role === 'farmer') {
      return next();
    }

    // For order routes, check if user is buyer or farmer of the order
    if (req.route.path.includes('orders')) {
      // This will be handled in the controller to check buyer/farmer
      return next();
    }

    // Check if user owns the resource
    if (req.params.userId && req.params.userId === req.user._id.toString()) {
      return next();
    }

    return res.status(403).json({
      success: false,
      message: 'Not authorized to access this resource'
    });
  };
};

// Rate limiting for sensitive operations
const sensitiveOperationLimit = (req, res, next) => {
  // This can be enhanced with Redis for production
  // For now, we'll use the express-rate-limit middleware in server.js
  next();
};

// Verify email before certain actions
const requireEmailVerification = (req, res, next) => {
  if (!req.user.isVerified) {
    return res.status(403).json({
      success: false,
      message: 'Email verification required',
      code: 'EMAIL_VERIFICATION_REQUIRED'
    });
  }
  next();
};

// Role-specific middleware
const farmerOnly = authorize('farmer');
const buyerOnly = authorize('buyer');
const transporterOnly = authorize('transporter');
const adminOnly = authorize('admin');

// Combined middleware for role + subscription
const farmerWithSubscription = [protect, authorize('farmer'), checkSubscription];
const buyerWithSubscription = [protect, authorize('buyer'), checkSubscription];
const transporterWithSubscription = [protect, authorize('transporter'), checkSubscription];

module.exports = {
  protect,
  checkSubscription,
  authorize,
  ownerOrAdmin,
  sensitiveOperationLimit,
  requireEmailVerification,
  farmerOnly,
  buyerOnly,
  transporterOnly,
  adminOnly,
  farmerWithSubscription,
  buyerWithSubscription,
  transporterWithSubscription
};
