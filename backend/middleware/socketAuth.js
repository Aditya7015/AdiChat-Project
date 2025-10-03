// middleware/socketAuth.js
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const socketAuth = async (socket, next) => {
  try {
    console.log('🔐 Attempting socket authentication...');
    
    // Try to get token from different sources
    let token;
    
    // 1. From handshake auth
    if (socket.handshake.auth && socket.handshake.auth.token) {
      token = socket.handshake.auth.token;
      console.log('📦 Token from handshake auth');
    }
    // 2. From query parameters
    else if (socket.handshake.query && socket.handshake.query.token) {
      token = socket.handshake.query.token;
      console.log('📦 Token from query parameters');
    }
    // 3. From headers (for Postman)
    else if (socket.handshake.headers && socket.handshake.headers.authorization) {
      const authHeader = socket.handshake.headers.authorization;
      if (authHeader.startsWith('Bearer ')) {
        token = authHeader.substring(7);
        console.log('📦 Token from authorization header');
      }
    }

    console.log('🔍 Token received:', token ? 'Yes' : 'No');
    
    if (!token) {
      console.log('❌ No token provided');
      return next(new Error('Authentication error: No token provided'));
    }

    // Clean token (remove any spaces)
    token = token.trim();

    // Verify JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('✅ Token decoded for user ID:', decoded.userId);
    
    // Find user
    const user = await User.findById(decoded.userId);
    if (!user) {
      console.log('❌ User not found in database');
      return next(new Error('Authentication error: User not found'));
    }

    // Attach user to socket
    socket.user = user;
    console.log(`✅ Socket authenticated for user: ${user.username} (${user._id})`);
    next();
    
  } catch (error) {
    console.error('❌ Socket authentication error:', error.message);
    
    if (error.name === 'JsonWebTokenError') {
      return next(new Error('Authentication error: Invalid token'));
    }
    if (error.name === 'TokenExpiredError') {
      return next(new Error('Authentication error: Token expired'));
    }
    
    next(new Error('Authentication error: ' + error.message));
  }
};

module.exports = { socketAuth };