const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema({
  // Order Identification
  orderNumber: {
    type: String,
    required: true,
    unique: true
  },
  
  // Parties Involved
  buyer: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: [true, 'Buyer is required']
  },
  farmer: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: [true, 'Farmer is required']
  },
  
  // Product Details
  products: [{
    product: {
      type: mongoose.Schema.ObjectId,
      ref: 'Product',
      required: true
    },
    productName: {
      type: String,
      required: true
    },
    quantity: {
      amount: {
        type: Number,
        required: true,
        min: [0, 'Quantity cannot be negative']
      },
      unit: {
        type: String,
        required: true
      }
    },
    pricing: {
      unitPrice: {
        type: Number,
        required: true,
        min: [0, 'Unit price cannot be negative']
      },
      totalPrice: {
        type: Number,
        required: true,
        min: [0, 'Total price cannot be negative']
      },
      currency: {
        type: String,
        default: 'INR'
      }
    },
    specifications: {
      grade: String,
      organic: Boolean,
      harvestDate: Date,
      specialRequests: String
    }
  }],
  
  // Order Financial Details
  orderValue: {
    subtotal: {
      type: Number,
      required: true,
      min: [0, 'Subtotal cannot be negative']
    },
    taxes: {
      type: Number,
      default: 0,
      min: [0, 'Taxes cannot be negative']
    },
    deliveryCharges: {
      type: Number,
      default: 0,
      min: [0, 'Delivery charges cannot be negative']
    },
    discount: {
      type: Number,
      default: 0,
      min: [0, 'Discount cannot be negative']
    },
    total: {
      type: Number,
      required: true,
      min: [0, 'Total cannot be negative']
    },
    currency: {
      type: String,
      default: 'INR'
    }
  },
  
  // Order Status and Timeline
  status: {
    current: {
      type: String,
      enum: [
        'pending',
        'confirmed',
        'processing',
        'ready_for_pickup',
        'picked_up',
        'in_transit',
        'delivered',
        'cancelled',
        'returned'
      ],
      default: 'pending'
    },
    history: [{
      status: {
        type: String,
        required: true
      },
      timestamp: {
        type: Date,
        default: Date.now
      },
      updatedBy: {
        type: mongoose.Schema.ObjectId,
        ref: 'User'
      },
      notes: String,
      location: {
        latitude: Number,
        longitude: Number,
        address: String
      }
    }]
  },
  
  // Delivery Information
  delivery: {
    method: {
      type: String,
      enum: ['pickup', 'delivery', 'third_party'],
      required: [true, 'Delivery method is required']
    },
    address: {
      recipient: {
        name: {
          type: String,
          required: true
        },
        phone: {
          type: String,
          required: true
        }
      },
      location: {
        street: {
          type: String,
          required: true
        },
        city: {
          type: String,
          required: true
        },
        state: {
          type: String,
          required: true
        },
        pincode: {
          type: String,
          required: true,
          match: [/^[1-9][0-9]{5}$/, 'Please provide a valid pincode']
        },
        country: {
          type: String,
          default: 'India'
        },
        coordinates: {
          latitude: Number,
          longitude: Number
        }
      },
      instructions: String
    },
    expectedDate: {
      type: Date,
      required: true
    },
    actualDate: Date,
    transporter: {
      type: mongoose.Schema.ObjectId,
      ref: 'User'
    },
    transportDetails: {
      vehicleNumber: String,
      driverName: String,
      driverPhone: String,
      trackingId: String
    }
  },
  
  // Payment Information
  payment: {
    method: {
      type: String,
      enum: ['cash', 'razorpay', 'bank_transfer', 'upi'],
      required: [true, 'Payment method is required']
    },
    status: {
      type: String,
      enum: ['pending', 'processing', 'completed', 'failed', 'refunded'],
      default: 'pending'
    },
    razorpayOrderId: String,
    razorpayPaymentId: String,
    transactionId: String,
    paidAmount: {
      type: Number,
      default: 0
    },
    paidAt: Date,
    refundAmount: {
      type: Number,
      default: 0
    },
    refundedAt: Date,
    paymentHistory: [{
      amount: Number,
      status: String,
      transactionId: String,
      timestamp: {
        type: Date,
        default: Date.now
      },
      notes: String
    }]
  },
  
  // Quality and Reviews
  quality: {
    farmerRating: {
      rating: {
        type: Number,
        min: 1,
        max: 5
      },
      review: String,
      ratedAt: Date
    },
    buyerRating: {
      rating: {
        type: Number,
        min: 1,
        max: 5
      },
      review: String,
      ratedAt: Date
    },
    qualityIssues: [{
      issue: String,
      reportedBy: {
        type: mongoose.Schema.ObjectId,
        ref: 'User'
      },
      reportedAt: {
        type: Date,
        default: Date.now
      },
      resolved: {
        type: Boolean,
        default: false
      },
      resolution: String
    }]
  },
  
  // Communication
  messages: [{
    sender: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: true
    },
    message: {
      type: String,
      required: true,
      maxlength: [1000, 'Message cannot be more than 1000 characters']
    },
    timestamp: {
      type: Date,
      default: Date.now
    },
    read: {
      type: Boolean,
      default: false
    }
  }],
  
  // Additional Information
  specialRequests: {
    type: String,
    maxlength: [500, 'Special requests cannot be more than 500 characters']
  },
  
  // Cancellation
  cancellation: {
    isCancelled: {
      type: Boolean,
      default: false
    },
    cancelledBy: {
      type: mongoose.Schema.ObjectId,
      ref: 'User'
    },
    cancelledAt: Date,
    reason: String,
    refundProcessed: {
      type: Boolean,
      default: false
    }
  },
  
  // Metadata
  source: {
    type: String,
    enum: ['web', 'mobile', 'api'],
    default: 'web'
  },
  tags: [String],
  internalNotes: String
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for efficient queries
OrderSchema.index({ orderNumber: 1 });
OrderSchema.index({ buyer: 1 });
OrderSchema.index({ farmer: 1 });
OrderSchema.index({ 'status.current': 1 });
OrderSchema.index({ 'payment.status': 1 });
OrderSchema.index({ createdAt: -1 });
OrderSchema.index({ 'delivery.expectedDate': 1 });

// Pre-save middleware to generate order number
OrderSchema.pre('save', async function(next) {
  if (!this.orderNumber) {
    const count = await this.constructor.countDocuments();
    this.orderNumber = `AGR${Date.now()}${String(count + 1).padStart(4, '0')}`;
  }
  
  // Add status to history if status changed
  if (this.isModified('status.current')) {
    this.status.history.push({
      status: this.status.current,
      timestamp: new Date(),
      notes: 'Status updated'
    });
  }
  
  next();
});

// Virtual for order age
OrderSchema.virtual('orderAge').get(function() {
  return Math.floor((Date.now() - this.createdAt) / (1000 * 60 * 60 * 24));
});

// Method to check if order can be cancelled
OrderSchema.methods.canBeCancelled = function() {
  const nonCancellableStatuses = ['delivered', 'cancelled', 'returned'];
  return !nonCancellableStatuses.includes(this.status.current);
};

// Method to update order status
OrderSchema.methods.updateStatus = function(newStatus, updatedBy, notes) {
  this.status.current = newStatus;
  this.status.history.push({
    status: newStatus,
    timestamp: new Date(),
    updatedBy: updatedBy,
    notes: notes || `Status updated to ${newStatus}`
  });
  return this.save();
};

// Method to add message
OrderSchema.methods.addMessage = function(senderId, message) {
  this.messages.push({
    sender: senderId,
    message: message,
    timestamp: new Date(),
    read: false
  });
  return this.save();
};

// Method to calculate delivery charges based on distance
OrderSchema.methods.calculateDeliveryCharges = function(distance) {
  // Basic calculation: ₹5 per km with minimum ₹20
  const baseRate = 5; // per km
  const minimumCharge = 20;
  return Math.max(distance * baseRate, minimumCharge);
};

module.exports = mongoose.model('Order', OrderSchema);
