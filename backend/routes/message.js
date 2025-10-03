// routes/messages.js
const express = require('express');
const {
  sendMessage,
  getConversation,
  markMessagesAsRead,
  deleteMessage,
  getRecentConversations
} = require('../controllers/messageController');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// @route   POST /api/messages/send
// @desc    Send a new message
// @access  Private
router.post('/send', sendMessage);

// @route   GET /api/messages/conversation/:userId
// @desc    Get conversation between two users
// @access  Private
router.get('/conversation/:userId', getConversation);

// @route   GET /api/messages/conversations
// @desc    Get recent conversations
// @access  Private
router.get('/conversations', getRecentConversations);

// @route   PUT /api/messages/read
// @desc    Mark messages as read
// @access  Private
router.put('/read', markMessagesAsRead);

// @route   DELETE /api/messages/:messageId
// @desc    Delete a message
// @access  Private
router.delete('/:messageId', deleteMessage);

module.exports = router;