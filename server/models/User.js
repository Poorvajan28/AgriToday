const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
  // Basic Information
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [50, 'Name cannot be more than 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    match: [
      /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
      'Please provide a valid email'
    ]
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    match: [/^[6-9]\d{9}$/, 'Please provide a valid Indian phone number']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters']
  },
  
  // Role and Status
  role: {
    type: String,
    enum: ['farmer', 'buyer', 'transporter', 'admin'],
    required: [true, 'Please specify user role']
  },
  
  permissions: [{
    type: String,
    enum: [
      'read_users', 'write_users', 'delete_users',
      'read_products', 'write_products', 'delete_products',
      'read_orders', 'write_orders', 'delete_orders',
      'read_analytics', 'write_analytics',
      'manage_platform'
    ]
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  
  // Subscription Information
  subscription: {
    isActive: {
      type: Boolean,
      default: false
    },
    startDate: {
      type: Date
    },
    endDate: {
      type: Date
    },
    razorpaySubscriptionId: {
      type: String
    },
    lastPaymentDate: {
      type: Date
    }
  },
  
  // Profile Information
  profile: {
    avatar: {
      type: String,
      default: ''
    },
    address: {
      street: String,
      city: String,
      state: String,
      pincode: {
        type: String,
        match: [/^[1-9][0-9]{5}$/, 'Please provide a valid pincode']
      },
      country: {
        type: String,
        default: 'India'
      }
    },
    language: {
      type: String,
      enum: ['en', 'hi', 'ta'],
      default: 'en'
    },
    bio: {
      type: String,
      maxlength: [500, 'Bio cannot be more than 500 characters']
    }
  },
  
  // Role-specific Information
  farmerDetails: {
    farmSize: String,
    farmLocation: {
      latitude: Number,
      longitude: Number
    },
    specializations: [String],
    certifications: [String]
  },
  
  transporterDetails: {
    vehicleType: String,
    vehicleNumber: String,
    licenseNumber: String,
    serviceAreas: [String],
    pricePerKm: Number
  },
  
  // Ratings and Reviews
  ratings: {
    average: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    count: {
      type: Number,
      default: 0
    }
  },
  
  // Metadata
  lastLogin: {
    type: Date
  },
  resetPasswordToken: String,
  resetPasswordExpire: Date,
  verificationToken: String,
  verificationTokenExpire: Date
}, {
  timestamps: true
});

// Encrypt password before saving
UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    next();
  }
  
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password method
UserSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Check if subscription is active
UserSchema.methods.hasActiveSubscription = function() {
  return this.subscription.isActive && this.subscription.endDate > new Date();
};

// Get public profile (exclude sensitive information)
UserSchema.methods.getPublicProfile = function() {
  const userObj = this.toObject();
  delete userObj.password;
  delete userObj.resetPasswordToken;
  delete userObj.resetPasswordExpire;
  delete userObj.verificationToken;
  delete userObj.verificationTokenExpire;
  delete userObj.subscription.razorpaySubscriptionId;
  return userObj;
};

module.exports = mongoose.model('User', UserSchema);
