// server.js
const express = require('express');
const mongoose = require('mongoose');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
require('dotenv').config();

// Import routes
const authRoutes = require('./routes/auth.js');
const messageRoutes = require('./routes/message.js');
const userRoutes = require('./routes/users.js');
const uploadRoutes = require('./routes/upload.js');
const aiRoutes = require('./routes/ai');



// Import database connection
const connectDB = require('./config/database');

// Initialize Express app
const app = express();

// Create HTTP server for Socket.io
const server = http.createServer(app);

// Initialize Socket.io with CORS configuration
const io = socketIo(server, {
  cors: {
    origin: "http://localhost:5173", // Vite default port
    methods: ["GET", "POST"],
    credentials: true
  }
});

// Connect to MongoDB
connectDB();

// ========================
// MIDDLEWARE
// ========================

// CORS middleware - allows requests from different origins
app.use(cors({
  origin: "http://localhost:5173", // Vite default port
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE"]
}));

// Body parsing middleware - allows us to read JSON from requests
app.use(express.json());

// URL-encoded parsing middleware - for form data
app.use(express.urlencoded({ extended: true }));

// ========================
// ROUTES
// ========================

// Health check route - test if server is running
app.get('/', (req, res) => {
  res.json({ 
    success: true,
    message: '🚀 AdiChat Backend Server is Running!',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/users', userRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/ai', aiRoutes);



// ========================
// SOCKET.IO HANDLING
// ========================

const { socketAuth } = require('./middleware/socketAuth');
const { initializeSocket } = require('./socket/socketHandlers');
io.use(socketAuth);
initializeSocket(io);


// Socket.io connection handling for real-time features
io.on('connection', (socket) => {
  console.log('🔌 New client connected:', socket.id);
  
  // Handle user joining their personal room
  socket.on('join-user', (userId) => {
    socket.join(userId);
    console.log(`👤 User ${userId} joined their room`);
  });

  // Handle typing indicators
  socket.on('typing-start', (data) => {
    socket.to(data.receiverId).emit('user-typing', {
      senderId: data.senderId,
      isTyping: true
    });
  });

  socket.on('typing-stop', (data) => {
    socket.to(data.receiverId).emit('user-typing', {
      senderId: data.senderId,
      isTyping: false
    });
  });

  // Handle client disconnection
  socket.on('disconnect', () => {
    console.log('❌ Client disconnected:', socket.id);
  });
});

// ========================
// ERROR HANDLING MIDDLEWARE
// ========================

// 404 Handler - catch all undefined routes
// FIXED: Use proper wildcard syntax for newer Express versions
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`
  });
});

// Global error handler - catch all errors
app.use((error, req, res, next) => {
  console.error('🔥 Global Error Handler:', error);
  
  // Mongoose validation error
  if (error.name === 'ValidationError') {
    const messages = Object.values(error.errors).map(err => err.message);
    return res.status(400).json({
      success: false,
      message: 'Validation Error',
      errors: messages
    });
  }
  
  // Mongoose duplicate key error
  if (error.code === 11000) {
    const field = Object.keys(error.keyValue)[0];
    return res.status(400).json({
      success: false,
      message: `${field} already exists`
    });
  }
  
  // JWT errors
  if (error.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      message: 'Invalid token'
    });
  }
  
  // Default server error
  res.status(error.status || 500).json({
    success: false,
    message: error.message || 'Internal Server Error'
  });
});

// ========================
// SERVER CONFIGURATION
// ========================

// Define port from environment or default
const PORT = process.env.PORT || 5000;

// Start server only if not in test environment
if (process.env.NODE_ENV !== 'test') {
  server.listen(PORT, () => {
    console.log(`🎯 Server running on port ${PORT}`);
    console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🌐 Access at: http://localhost:${PORT}`);
    console.log(`🔗 API Base: http://localhost:${PORT}/api`);
  });
}

// Export app for testing purposes
module.exports = { app, server, io };