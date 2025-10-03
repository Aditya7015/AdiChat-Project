// middleware/auth.js
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Middleware to protect routes - verify JWT token
const authenticate = async (req, res, next) => {
  try {
    // Get token from header (format: "Bearer <token>")
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    // Check if token exists
    if (!token) {
      return res.status(401).json({ 
        success: false,
        message: 'No token provided, access denied' 
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Find user by ID from token
    const user = await User.findById(decoded.userId).select('-password');
    
    if (!user) {
      return res.status(401).json({ 
        success: false,
        message: 'Token is invalid - user not found' 
      });
    }

    // Add user to request object for use in next middleware/controllers
    req.user = user;
    next(); // Proceed to next middleware/route handler
    
  } catch (error) {
    console.error('Auth middleware error:', error);
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ 
        success: false,
        message: 'Invalid token' 
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        success: false,
        message: 'Token expired' 
      });
    }
    
    res.status(500).json({ 
      success: false,
      message: 'Server error in authentication' 
    });
  }
};

module.exports = { authenticate };