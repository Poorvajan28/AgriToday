const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
  // Basic Information
  name: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true,
    maxlength: [100, 'Product name cannot be more than 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Product description is required'],
    maxlength: [1000, 'Description cannot be more than 1000 characters']
  },
  category: {
    type: String,
    required: [true, 'Product category is required'],
    enum: [
      'vegetables',
      'fruits',
      'grains',
      'pulses',
      'spices',
      'dairy',
      'meat',
      'seeds',
      'fertilizers',
      'equipment',
      'other'
    ]
  },
  subcategory: {
    type: String,
    trim: true
  },
  
  // Farmer Information
  farmer: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: [true, 'Farmer is required']
  },
  farmerName: {
    type: String,
    required: true
  },
  farmLocation: {
    type: String,
    required: [true, 'Farm location is required']
  },
  
  // Product Details
  quantity: {
    available: {
      type: Number,
      required: [true, 'Available quantity is required'],
      min: [0, 'Available quantity cannot be negative']
    },
    total: {
      type: Number,
      required: [true, 'Total quantity is required'],
      min: [0, 'Total quantity cannot be negative']
    },
    unit: {
      type: String,
      required: [true, 'Unit is required'],
      enum: ['kg', 'quintal', 'ton', 'piece', 'dozen', 'liter']
    }
  },
  
  // Pricing
  pricing: {
    basePrice: {
      type: Number,
      required: [true, 'Base price is required'],
      min: [0, 'Price cannot be negative']
    },
    currency: {
      type: String,
      default: 'INR'
    },
    pricePerUnit: {
      type: String,
      required: true
    },
    negotiable: {
      type: Boolean,
      default: true
    },
    minimumOrder: {
      quantity: {
        type: Number,
        default: 1
      },
      unit: String
    }
  },
  
  // Quality and Certification
  quality: {
    grade: {
      type: String,
      enum: ['A+', 'A', 'B+', 'B', 'C'],
      default: 'A'
    },
    organic: {
      type: Boolean,
      default: false
    },
    certifications: [String],
    harvestDate: {
      type: Date,
      required: [true, 'Harvest date is required']
    },
    expiryDate: Date,
    storageConditions: String
  },
  
  // Media
  images: [{
    url: {
      type: String,
      required: true
    },
    caption: String,
    isPrimary: {
      type: Boolean,
      default: false
    }
  }],
  
  // Availability
  availability: {
    status: {
      type: String,
      enum: ['available', 'limited', 'out_of_stock', 'coming_soon'],
      default: 'available'
    },
    availableFrom: {
      type: Date,
      default: Date.now
    },
    availableUntil: Date,
    seasonality: {
      months: [Number], // 1-12 representing months
      description: String
    }
  },
  
  // Location and Logistics
  location: {
    coordinates: {
      latitude: {
        type: Number,
        required: true
      },
      longitude: {
        type: Number,
        required: true
      }
    },
    address: {
      street: String,
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
      }
    }
  },
  
  // Reviews and Ratings
  reviews: [{
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: true
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5
    },
    comment: {
      type: String,
      maxlength: [500, 'Review comment cannot be more than 500 characters']
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  averageRating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  
  totalReviews: {
    type: Number,
    default: 0
  },
  
  // Statistics
  views: {
    type: Number,
    default: 0
  },
  likes: [{
    type: mongoose.Schema.ObjectId,
    ref: 'User'
  }],
  totalOrders: {
    type: Number,
    default: 0
  },
  
  // Status
  isActive: {
    type: Boolean,
    default: true
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  tags: [String],
  
  // Metadata
  seo: {
    title: String,
    description: String,
    keywords: [String]
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Create index for search optimization
ProductSchema.index({
  name: 'text',
  description: 'text',
  category: 'text',
  tags: 'text'
});

ProductSchema.index({ 'location.coordinates.latitude': 1, 'location.coordinates.longitude': 1 });
ProductSchema.index({ farmer: 1 });
ProductSchema.index({ category: 1 });
ProductSchema.index({ 'pricing.basePrice': 1 });
ProductSchema.index({ 'availability.status': 1 });

// Calculate average rating
ProductSchema.pre('save', function(next) {
  if (this.reviews && this.reviews.length > 0) {
    const totalRating = this.reviews.reduce((acc, review) => acc + review.rating, 0);
    this.averageRating = totalRating / this.reviews.length;
    this.totalReviews = this.reviews.length;
  }
  next();
});

// Virtual for getting distance (will be populated by geospatial queries)
ProductSchema.virtual('distance');

// Method to check if product is available
ProductSchema.methods.isAvailable = function() {
  return this.availability.status === 'available' && this.quantity.available > 0;
};

// Method to update quantity after order
ProductSchema.methods.updateQuantity = function(orderedQuantity) {
  this.quantity.available -= orderedQuantity;
  if (this.quantity.available <= 0) {
    this.availability.status = 'out_of_stock';
  } else if (this.quantity.available <= this.quantity.total * 0.1) {
    this.availability.status = 'limited';
  }
  return this.save();
};

module.exports = mongoose.model('Product', ProductSchema);
