const express = require('express');
const { sendToGrok, getGrokConversation } = require('../controllers/grokController');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

router.post('/grok', authenticate, sendToGrok);
router.get('/grok/conversation', authenticate, getGrokConversation);

module.exports = router;