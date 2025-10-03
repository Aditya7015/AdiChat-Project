// models/User.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Define the user schema (blueprint for user documents)
const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, 'Username is required'], // Validation message
    unique: true, // No duplicate usernames
    trim: true, // Remove whitespace
    minlength: [3, 'Username must be at least 3 characters'],
    maxlength: [30, 'Username cannot exceed 30 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    trim: true,
    lowercase: true, // Store email in lowercase
    match: [ // Email validation regex
      /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
      'Please enter a valid email'
    ]
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters']
  },
  avatar: {
    type: String,
    default: '' // Will store URL to avatar image
  },
  isOnline: {
    type: Boolean,
    default: false // Track user's online status
  },
  lastSeen: {
    type: Date,
    default: Date.now // Track when user was last active
  }
}, {
  timestamps: true // Automatically adds createdAt and updatedAt
});

// Middleware: Hash password before saving user
userSchema.pre('save', async function(next) {
  // Only hash the password if it's modified (or new)
  if (!this.isModified('password')) {
    return next();
  }
  
  try {
    // Generate salt (random data for hashing)
    const salt = await bcrypt.genSalt(10);
    // Hash the password with the salt
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method: Compare entered password with hashed password
userSchema.methods.comparePassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Method: Convert user to JSON (exclude password)
userSchema.methods.toJSON = function() {
  const user = this.toObject();
  delete user.password; // Never send password to frontend
  return user;
};

// Create User model from schema
const User = mongoose.model('User', userSchema);

module.exports = User;