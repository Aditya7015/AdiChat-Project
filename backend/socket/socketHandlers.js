// socket/socketHandlers.js
const Message = require('../models/Message');
const User = require('../models/User');

// Store online users in memory (in production, use Redis)
const onlineUsers = new Map(); // userId -> socketId

/**
 * Initialize socket event handlers
 */
const initializeSocket = (io) => {
  // Connection event with authentication
  io.on('connection', async (socket) => {
    const userId = socket.user._id.toString();
    const username = socket.user.username;

    console.log(`🔌 User connected: ${username} (${userId})`);

    // Add user to online users
    onlineUsers.set(userId, socket.id);
    
    // Update user online status in database
    await User.findByIdAndUpdate(userId, { 
      isOnline: true,
      lastSeen: new Date()
    });

    // Join user to their personal room for private messages
    socket.join(userId);
    console.log(`👤 ${username} joined room: ${userId}`);

    // Broadcast online status to all connected clients
    socket.broadcast.emit('user-online', {
      userId: userId,
      username: username,
      isOnline: true
    });

    // ========================
    // MESSAGE EVENTS
    // ========================

    /**
     * Handle sending a new message
     */
    // In the send-message event handler, update the message creation:
// In the send-message event handler, update the validation:
socket.on('send-message', async (messageData) => {
  try {
    console.log('💬 Send message event received:', {
      from: username,
      to: messageData.receiverId,
      type: messageData.messageType,
      hasImage: !!messageData.imageUrl,
      content: messageData.content
    });

    const { receiverId, content, messageType = 'text', imageUrl, imagePublicId, imageWidth, imageHeight } = messageData;

    // REMOVE this validation - let the Mongoose model handle it
    // if (messageType === 'text' && !content) {
    //   socket.emit('error', { message: 'Message content is required for text messages' });
    //   return;
    // }
    //
    // if (messageType === 'image' && !imageUrl) {
    //   socket.emit('error', { message: 'Image URL is required for image messages' });
    //   return;
    // }

    // Check if receiver exists
    const receiver = await User.findById(receiverId);
    if (!receiver) {
      socket.emit('error', { message: 'Receiver not found' });
      return;
    }

    // Create and save message - let Mongoose validation handle the requirements
    const message = new Message({
      sender: userId,
      receiver: receiverId,
      receiverModel: 'User',
      content: content || '',
      messageType: messageType,
      imageUrl: imageUrl || '',
      imagePublicId: imagePublicId || '',
      imageWidth: imageWidth || 0,
      imageHeight: imageHeight || 0
    });

    await message.save();
    console.log('💾 Message saved to database:', message._id);
    
    // Populate sender info
    await message.populate('sender', 'username avatar isOnline');

    // Prepare message payload
    const messagePayload = {
      _id: message._id,
      sender: {
        _id: message.sender._id,
        username: message.sender.username,
        avatar: message.sender.avatar,
        isOnline: message.sender.isOnline
      },
      receiver: message.receiver,
      content: message.content,
      messageType: message.messageType,
      imageUrl: message.imageUrl,
      imagePublicId: message.imagePublicId,
      imageWidth: message.imageWidth,
      imageHeight: message.imageHeight,
      read: message.read,
      createdAt: message.createdAt,
      updatedAt: message.updatedAt
    };

    // Emit to sender (confirmation)
    socket.emit('message-sent', {
      success: true,
      message: messagePayload
    });

    // Emit to receiver if online
    const receiverSocketId = onlineUsers.get(receiverId);
    if (receiverSocketId) {
      io.to(receiverId).emit('new-message', {
        message: messagePayload,
        from: username
      });
      
      console.log(`📨 Message delivered to ${receiver.username}`);
    }

    console.log(`✅ ${messageType} message processed successfully`);

  } catch (error) {
    console.error('❌ Send message error:', error);
    socket.emit('error', { 
      message: 'Failed to send message',
      error: error.message 
    });
  }
});
    /**
     * Handle typing indicators
     */
    socket.on('typing-start', (data) => {
      const { receiverId } = data;
      
      // Notify the receiver that user is typing
      socket.to(receiverId).emit('user-typing', {
        senderId: userId,
        senderName: username,
        isTyping: true
      });
      
      console.log(`⌨️ ${username} is typing to ${receiverId}`);
    });

    socket.on('typing-stop', (data) => {
      const { receiverId } = data;
      
      // Notify the receiver that user stopped typing
      socket.to(receiverId).emit('user-typing', {
        senderId: userId,
        senderName: username,
        isTyping: false
      });
    });

    /**
     * Handle message read receipts
     */
    socket.on('mark-messages-read', async (data) => {
      try {
        const { senderId } = data;
        
        // Mark all unread messages from this sender as read
        await Message.updateMany(
          {
            sender: senderId,
            receiver: userId,
            read: false
          },
          { $set: { read: true } }
        );

        // Notify the sender that their messages were read
        const senderSocketId = onlineUsers.get(senderId);
        if (senderSocketId) {
          io.to(senderId).emit('messages-read', {
            readerId: userId,
            readerName: username
          });
        }

        console.log(`📖 ${username} marked messages from ${senderId} as read`);

      } catch (error) {
        console.error('❌ Mark messages read error:', error);
        socket.emit('error', { 
          message: 'Failed to mark messages as read'
        });
      }
    });

    // ========================
    // USER STATUS EVENTS
    // ========================

    /**
     * Get online users
     */
    socket.on('get-online-users', async () => {
      try {
        const onlineUserIds = Array.from(onlineUsers.keys());
        const onlineUsersDetails = await User.find(
          { _id: { $in: onlineUserIds } },
          'username avatar isOnline lastSeen'
        );

        socket.emit('online-users', onlineUsersDetails);
      } catch (error) {
        console.error('❌ Get online users error:', error);
        socket.emit('error', { message: 'Failed to get online users' });
      }
    });

    /**
     * Handle disconnect
     */
    socket.on('disconnect', async () => {
      console.log(`❌ User disconnected: ${username} (${userId})`);
      
      // Remove from online users
      onlineUsers.delete(userId);
      
      // Update user offline status in database
      await User.findByIdAndUpdate(userId, { 
        isOnline: false,
        lastSeen: new Date()
      });

      // Broadcast offline status to all connected clients
      socket.broadcast.emit('user-offline', {
        userId: userId,
        username: username,
        isOnline: false,
        lastSeen: new Date()
      });
    });

    /**
     * Handle manual user logout
     */
    socket.on('user-logout', async () => {
      console.log(`🚪 User logging out: ${username}`);
      
      // Remove from online users
      onlineUsers.delete(userId);
      
      // Update user offline status
      await User.findByIdAndUpdate(userId, { 
        isOnline: false,
        lastSeen: new Date()
      });

      // Broadcast offline status
      socket.broadcast.emit('user-offline', {
        userId: userId,
        username: username,
        isOnline: false,
        lastSeen: new Date()
      });

      // Disconnect the socket
      socket.disconnect();
    });

  });

  // Log online users count periodically
  setInterval(() => {
    console.log(`👥 Currently online users: ${onlineUsers.size}`);
  }, 60000); // Every minute
};

module.exports = { initializeSocket, onlineUsers };