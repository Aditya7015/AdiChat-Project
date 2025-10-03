// controllers/messageController.js
const Message = require('../models/Message');
const User = require('../models/User');


// @desc    Send a new message
// @route   POST /api/messages/send
// @access  Private
// Update sendMessage function:
const sendMessage = async (req, res) => {
  try {
    const { receiverId, content, messageType = 'text', imageUrl, imagePublicId, imageWidth, imageHeight } = req.body;
    const senderId = req.user._id;

    // Validate required fields based on message type
    if (messageType === 'text' && !content) {
      return res.status(400).json({
        success: false,
        message: 'Message content is required for text messages'
      });
    }

    if (messageType === 'image' && !imageUrl) {
      return res.status(400).json({
        success: false,
        message: 'Image URL is required for image messages'
      });
    }

    // Check if receiver exists
    const receiver = await User.findById(receiverId);
    if (!receiver) {
      return res.status(404).json({
        success: false,
        message: 'Receiver not found'
      });
    }

    // Create new message
    const message = new Message({
      sender: senderId,
      receiver: receiverId,
      receiverModel: 'User',
      content: content || '',
      messageType,
      imageUrl: imageUrl || '',
      imagePublicId: imagePublicId || '',
      imageWidth: imageWidth || 0,
      imageHeight: imageHeight || 0
    });

    // Save message to database
    await message.save();

    // Populate sender info for the response
    await message.populate('sender', 'username avatar isOnline');

    res.status(201).json({
      success: true,
      message: 'Message sent successfully',
      data: {
        message
      }
    });

  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while sending message'
    });
  }
};
// @desc    Get conversation between two users
// @route   GET /api/messages/conversation/:userId
// @access  Private


/// @desc    Get conversation between two users
// @route   GET /api/messages/conversation/:userId
// @access  Private
// @desc    Get conversation between two users
// @route   GET /api/messages/conversation/:userId
// @access  Private
const getConversation = async (req, res) => {
  try {
    const currentUserId = req.user._id;
    const otherUserId = req.params.userId;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const skip = (page - 1) * limit;

    console.log('💬 Fetching conversation:', { currentUserId, otherUserId, page, limit });

    // ✅ FIX: Handle AI conversations
    if (otherUserId === 'ai_grok_assistant') {
      console.log('🤖 Loading AI conversation from database');
      
      // Load AI conversation from messages collection
      const messages = await Message.find({
        $or: [
          { sender: currentUserId, receiver: 'ai_grok_assistant' },
          { sender: 'ai_grok_assistant', receiver: currentUserId }
        ]
      })
      .sort({ createdAt: 1 }) // Oldest first for conversation flow
      .skip(skip)
      .limit(limit)
      .lean();

      console.log('✅ AI messages loaded:', messages.length);

      // Format messages with proper sender info
      const formattedMessages = messages.map(msg => {
        if (msg.sender === 'ai_grok_assistant') {
          return {
            ...msg,
            sender: {
              _id: 'ai_grok_assistant',
              username: 'Grok AI 🤖',
              avatar: '🤖',
              isAI: true
            }
          };
        }
        
        // For user messages, we need to populate sender info
        return {
          ...msg,
          sender: {
            _id: msg.sender,
            username: req.user.username, // Use current user's info
            avatar: req.user.avatar
          }
        };
      });

      return res.json({
        success: true,
        data: {
          messages: formattedMessages,
          currentPage: page,
          hasMore: messages.length === limit
        }
      });
    }

    // ✅ FIX: Handle regular user conversations
    // Validate other user exists
    const otherUser = await User.findById(otherUserId);
    if (!otherUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Load regular user conversation using the static method
    const messages = await Message.getConversation(currentUserId, otherUserId, page, limit);

    console.log('✅ User messages loaded:', messages.length);

    // Reverse to show oldest first (for UI)
    const sortedMessages = messages.reverse();

    res.json({
      success: true,
      data: {
        messages: sortedMessages,
        currentPage: page,
        hasMore: messages.length === limit,
        participant: {
          _id: otherUser._id,
          username: otherUser.username,
          avatar: otherUser.avatar,
          isOnline: otherUser.isOnline
        }
      }
    });

  } catch (error) {
    console.error('❌ Get conversation error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching conversation'
    });
  }
};

// @desc    Mark messages as read
// @route   PUT /api/messages/read
// @access  Private
const markMessagesAsRead = async (req, res) => {
  try {
    const { messageIds, senderId } = req.body;
    const currentUserId = req.user._id;

    let updateQuery;

    if (messageIds && messageIds.length > 0) {
      // Mark specific messages as read
      updateQuery = { _id: { $in: messageIds }, receiver: currentUserId };
    } else if (senderId) {
      // Mark all unread messages from this sender as read
      updateQuery = { 
        sender: senderId, 
        receiver: currentUserId, 
        read: false 
      };
    } else {
      return res.status(400).json({
        success: false,
        message: 'Either messageIds or senderId is required'
      });
    }

    const result = await Message.updateMany(
      updateQuery,
      { $set: { read: true } }
    );

    res.json({
      success: true,
      message: 'Messages marked as read',
      data: {
        modifiedCount: result.modifiedCount
      }
    });

  } catch (error) {
    console.error('Mark messages as read error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while marking messages as read'
    });
  }
};

// @desc    Delete a message
// @route   DELETE /api/messages/:messageId
// @access  Private
const deleteMessage = async (req, res) => {
  try {
    const messageId = req.params.messageId;
    const userId = req.user._id;

    // Find message and check if user is the sender
    const message = await Message.findById(messageId);

    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found'
      });
    }

    // Only allow sender to delete the message
    if (message.sender.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You can only delete your own messages'
      });
    }

    await Message.findByIdAndDelete(messageId);

    res.json({
      success: true,
      message: 'Message deleted successfully'
    });

  } catch (error) {
    console.error('Delete message error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting message'
    });
  }
};

// @desc    Get recent conversations (users you've chatted with)
// @route   GET /api/messages/conversations
// @access  Private
const getRecentConversations = async (req, res) => {
  try {
    const userId = req.user._id;

    // Get distinct users you've exchanged messages with
    const conversations = await Message.aggregate([
      {
        $match: {
          $or: [
            { sender: userId, receiverModel: 'User' },
            { receiver: userId, receiverModel: 'User' }
          ]
        }
      },
      {
        $sort: { createdAt: -1 }
      },
      {
        $group: {
          _id: {
            $cond: [
              { $eq: ['$sender', userId] },
              '$receiver',
              '$sender'
            ]
          },
          lastMessage: { $first: '$$ROOT' },
          unreadCount: {
            $sum: {
              $cond: [
                { $and: [
                  { $eq: ['$receiver', userId] },
                  { $eq: ['$read', false] }
                ]},
                1,
                0
              ]
            }
          }
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'user'
        }
      },
      {
        $unwind: '$user'
      },
      {
        $project: {
          'user.password': 0,
          'user.email': 0
        }
      },
      {
        $sort: { 'lastMessage.createdAt': -1 }
      }
    ]);

    res.json({
      success: true,
      data: {
        conversations
      }
    });

  } catch (error) {
    console.error('Get recent conversations error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching conversations'
    });
  }
};

module.exports = {
  sendMessage,
  getConversation,
  markMessagesAsRead,
  deleteMessage,
  getRecentConversations
};