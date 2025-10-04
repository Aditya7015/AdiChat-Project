// const axios = require('axios');
// const User = require('../models/User');
// const Message = require('../models/Message');

// // AI Chatbot user details
// const GROK_BOT = {
//   _id: 'ai_grok_assistant',
//   username: 'Grok AI',
//   email: 'grok@adichat.com',
//   avatar: '🤖',
//   isOnline: true,
//   isAI: true
// };

// // Free Grok API endpoint (similar to AdiShop)
// const GROK_API_URL = 'https://api.freegpt.org/v1/chat/completions';

// // System prompt for Grok
// const SYSTEM_PROMPT = `You are Grok, a friendly and helpful AI assistant in AdiChat. You are:
// - Conversational and engaging
// - Helpful with questions and information
// - Can tell jokes and have casual chats
// - Keep responses brief (1-2 paragraphs max)
// - Be empathetic and adapt to user's tone
// - Remember you're in a chat app, be social!`;

// // @desc    Send message to Grok AI
// // @route   POST /api/ai/grok
// // @access  Private
// const sendToGrok = async (req, res) => {
//   try {
//     const { message } = req.body;
//     const userId = req.user._id;

//     if (!message || message.trim() === '') {
//       return res.status(400).json({
//         success: false,
//         message: 'Message is required'
//       });
//     }

//     console.log('🤖 Grok AI request from user:', req.user.username);

//     // Prepare messages for Grok
//     const messages = [
//       { role: 'system', content: SYSTEM_PROMPT },
//       { role: 'user', content: message }
//     ];

//     // Call Free Grok API
//     const response = await axios.post(
//       GROK_API_URL,
//       {
//         model: 'gpt-3.5-turbo', // Using free model
//         messages: messages,
//         max_tokens: 300,
//         temperature: 0.7,
//         stream: false
//       },
//       {
//         headers: {
//           'Content-Type': 'application/json'
//         },
//         timeout: 10000 // 10 second timeout
//       }
//     );

//     const aiResponse = response.data.choices[0].message.content;

//     console.log('✅ Grok response generated');

//     // Save both messages to database
//     const userMessage = new Message({
//       sender: userId,
//       receiver: GROK_BOT._id,
//       receiverModel: 'User',
//       content: message.trim(),
//       messageType: 'text',
//       createdAt: new Date()
//     });

//     const botMessage = new Message({
//       sender: GROK_BOT._id,
//       receiver: userId,
//       receiverModel: 'User',
//       content: aiResponse,
//       messageType: 'text',
//       createdAt: new Date(Date.now() + 1000) // 1 second later
//     });

//     await userMessage.save();
//     await botMessage.save();

//     res.json({
//       success: true,
//       data: {
//         response: aiResponse,
//         message: {
//           _id: botMessage._id,
//           sender: GROK_BOT,
//           receiver: userId,
//           content: aiResponse,
//           messageType: 'text',
//           createdAt: botMessage.createdAt
//         }
//       }
//     });

//   } catch (error) {
//     console.error('❌ Grok AI error:', error.response?.data || error.message);
    
//     // Fun fallback responses
//     const fallbackResponses = [
//       "Hey there! I'm Grok, but I'm taking a quick coffee break ☕. Try again in a moment!",
//       "Oops! I'm having a brain freeze 🧊. What was that again?",
//       "I'm currently orbiting Mars 🚀. Signal's a bit weak, try again!",
//       "Beep boop! 🤖 Technical difficulties detected. Let's try that again!",
//       "I'm learning to human better 🤷. Could you repeat that?",
//       "My circuits are tingling! ⚡ Let me recalibrate and try again."
//     ];
    
//     const fallbackResponse = fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)];
    
//     res.json({
//       success: true,
//       data: {
//         response: fallbackResponse,
//         isFallback: true
//       }
//     });
//   }
// };

// // @desc    Get conversation history with Grok
// // @route   GET /api/ai/grok/conversation
// // @access  Private
// const getGrokConversation = async (req, res) => {
//   try {
//     const userId = req.user._id;
//     const page = parseInt(req.query.page) || 1;
//     const limit = parseInt(req.query.limit) || 50;
//     const skip = (page - 1) * limit;

//     const messages = await Message.find({
//       $or: [
//         { sender: userId, receiver: GROK_BOT._id },
//         { sender: GROK_BOT._id, receiver: userId }
//       ]
//     })
//     .sort({ createdAt: 1 }) // Oldest first for conversation flow
//     .skip(skip)
//     .limit(limit)
//     .lean();

//     // Convert bot messages to have proper sender info
//     const formattedMessages = messages.map(msg => {
//       if (msg.sender.toString() === GROK_BOT._id) {
//         return {
//           ...msg,
//           sender: GROK_BOT
//         };
//       }
//       return msg;
//     });

//     res.json({
//       success: true,
//       data: {
//         messages: formattedMessages,
//         currentPage: page,
//         hasMore: messages.length === limit,
//         bot: GROK_BOT
//       }
//     });

//   } catch (error) {
//     console.error('❌ Get Grok conversation error:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Server error while fetching conversation'
//     });
//   }
// };

// module.exports = {
//   sendToGrok,
//   getGrokConversation,
//   GROK_BOT
// };

const Groq = require("groq-sdk");

// Initialize Groq client
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

// AI Chatbot user details
const GROK_BOT = {
  _id: 'ai_grok_assistant',
  username: 'Grok AI 🤖',
  email: 'grok@adichat.com',
  avatar: '🤖',
  isOnline: true,
  isAI: true
};

// System prompt for Grok AI
const SYSTEM_PROMPT = `You are Adi Ai, a friendly and helpful AI assistant in AdiChat. You are:
- Conversational, engaging, and witty
- Helpful with questions, information, and casual chats
- Can tell jokes and have interesting conversations
- Keep responses brief but meaningful (2-3 sentences max)
- Be empathetic and adapt to user's tone
- Remember you're in a chat app - be social and fun!
- Use emojis occasionally to make it engaging

IMPORTANT: Keep responses short and chat-like, not essay-like.`;

// @desc    Send message to Grok AI (using Groq)
// @route   POST /api/ai/grok
// @access  Private
const sendToGrok = async (req, res) => {
  try {
    const { message } = req.body;
    const userId = req.user._id;

    if (!message || message.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Message is required'
      });
    }

    console.log('🤖 Grok AI request from user:', req.user.username);
    console.log('💬 Message:', message);

    // Get AI response using Groq
    const aiResponse = await getAIResponse(message.trim());
    
    console.log('✅ Grok response generated:', aiResponse.substring(0, 50) + '...');

    // Create the AI message object for frontend
    const aiMessage = {
      _id: `ai-${Date.now()}`,
      sender: GROK_BOT,
      receiver: userId,
      content: aiResponse,
      messageType: 'text',
      read: true,
      createdAt: new Date()
    };

    res.json({
      success: true,
      data: {
        message: aiMessage
      }
    });

  } catch (error) {
    console.error('❌ Grok AI error:', error.message);
    
    // Fun fallback responses
    const fallbackResponse = getFallbackResponse();
    
    const aiMessage = {
      _id: `ai-fallback-${Date.now()}`,
      sender: GROK_BOT,
      receiver: req.user._id,
      content: fallbackResponse,
      messageType: 'text',
      read: true,
      createdAt: new Date(),
      isFallback: true
    };

    res.json({
      success: true,
      data: {
        message: aiMessage
      }
    });
  }
};

// Get AI response using Groq
const getAIResponse = async (message) => {
  try {
    console.log('🟡 Using Groq model: llama-3.1-8b-instant');
    
    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: SYSTEM_PROMPT
        },
        {
          role: "user",
          content: message
        }
      ],
      model: "llama-3.1-8b-instant",
      temperature: 0.7,
      max_tokens: 150,
      stream: false
    });

    const response = completion.choices[0]?.message?.content;
    
    if (!response) {
      throw new Error('No response from AI');
    }

    console.log('🟢 Groq response successful');
    return response;
    
  } catch (error) {
    console.error('🔴 Groq API error:', error.message);
    return getFallbackResponse();
  }
};

// Smart fallback responses
const getFallbackResponse = () => {
  const fallbackResponses = [
    "Hey there! I'm Grok, but I'm taking a quick coffee break ☕. Try again in a moment!",
    "Oops! I'm having a brain freeze 🧊. What was that again?",
    "I'm currently orbiting Mars 🚀. Signal's a bit weak, try again!",
    "Beep boop! 🤖 Technical difficulties detected. Let's try that again!",
    "I'm learning to human better 🤷. Could you repeat that?",
    "My circuits are tingling! ⚡ Let me recalibrate and try again.",
    "Hello! I'm Grok AI, but I'm having a moment. What's on your mind? 💭",
    "I'm here! Just warming up my processors. What would you like to chat about? 🔥"
  ];
  
  return fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)];
};

// @desc    Get conversation history with Grok
// @route   GET /api/ai/grok/conversation
// @access  Private
const getGrokConversation = async (req, res) => {
  try {
    const userId = req.user._id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const skip = (page - 1) * limit;

    // For now, return empty as we're not storing in DB
    // You can implement DB storage later
    console.log('🤖 Fetching Grok conversation - returning empty for now');

    res.json({
      success: true,
      data: {
        messages: [],
        currentPage: page,
        hasMore: false,
        bot: GROK_BOT
      }
    });

  } catch (error) {
    console.error('❌ Get Grok conversation error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching conversation'
    });
  }
};

module.exports = {
  sendToGrok,
  getGrokConversation,
  GROK_BOT
};