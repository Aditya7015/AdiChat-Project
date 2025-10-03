// routes/auth.js
const express = require('express');
const {
  registerUser,
  loginUser,
  getMe,
  logoutUser
} = require('../controllers/authController');
const { authenticate } = require('../middleware/auth');

// Create router instance
const router = express.Router();

// @route   POST /api/auth/register
// @desc    Register new user
// @access  Public
router.post('/register', registerUser);

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post('/login', loginUser);

// @route   GET /api/auth/me
// @desc    Get current user
// @access  Private (requires authentication)
router.get('/me', authenticate, getMe);

// @route   POST /api/auth/logout
// @desc    Logout user
// @access  Private
router.post('/logout', authenticate, logoutUser);

module.exports = router;