const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Import User model
const User = require('../server/models/User');

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/agroculture', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

// Create admin user
const createAdmin = async () => {
  try {
    await connectDB();

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: 'admin@agritoday.com' });
    
    if (existingAdmin) {
      console.log('Admin user already exists!');
      console.log('Admin Email: admin@agritoday.com');
      console.log('Please use the existing admin account or delete it first.');
      process.exit(0);
    }

    // Create admin user
    const adminData = {
      name: 'AgriToday Admin',
      email: 'admin@agritoday.com',
      phone: '6381672467',
      password: 'Admin@123456', // Strong default password
      role: 'admin',
      isVerified: true,
      isActive: true,
      profile: {
        address: {
          street: 'AgriToday Headquarters',
          city: 'Chennai',
          state: 'Tamil Nadu',
          pincode: '600001',
          country: 'India'
        },
        bio: 'System Administrator for AgriToday platform'
      },
      permissions: [
        'read_users',
        'write_users',
        'delete_users',
        'read_products',
        'write_products',
        'delete_products',
        'read_orders',
        'write_orders',
        'delete_orders',
        'read_analytics',
        'write_analytics',
        'manage_platform'
      ]
    };

    const admin = await User.create(adminData);
    
    console.log('✅ Admin user created successfully!');
    console.log('===============================');
    console.log('Admin Credentials:');
    console.log('Email: admin@agritoday.com');
    console.log('Password: Admin@123456');
    console.log('Role: admin');
    console.log('===============================');
    console.log('⚠️  IMPORTANT: Please change the password after first login!');
    console.log('Admin ID:', admin._id);
    
  } catch (error) {
    console.error('Error creating admin user:', error);
  } finally {
    mongoose.connection.close();
  }
};

// Run the script
createAdmin();
