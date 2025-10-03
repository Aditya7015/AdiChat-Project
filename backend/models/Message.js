const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Message must have a sender']
  },
  
  receiver: {
    type: mongoose.Schema.Types.ObjectId,
    required: [true, 'Message must have a receiver'],
    refPath: 'receiverModel'
  },
  
  receiverModel: {
    type: String,
    required: true,
    enum: ['User', 'ChatRoom']
  },
  
  // Make content optional - it can be empty for image messages
  content: {
    type: String,
    required: false,
    trim: true,
    maxlength: [5000, 'Message cannot exceed 5000 characters'],
    default: ''
  },
  
  messageType: {
    type: String,
    enum: ['text', 'image', 'file', 'system'],
    default: 'text'
  },
  
  // For file/image messages
  imageUrl: {
    type: String,
    default: ''
  },
  
  imagePublicId: {
    type: String,
    default: ''
  },
  
  imageWidth: {
    type: Number,
    default: 0
  },
  
  imageHeight: {
    type: Number,
    default: 0
  },
  
  read: {
    type: Boolean,
    default: false
  },
  
  reactions: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    emoji: {
      type: String,
      required: true,
      maxlength: 5
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  replyTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Message',
    default: null
  },
  
  edited: {
    type: Boolean,
    default: false
  },
  
  previousVersions: [{
    content: String,
    editedAt: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true
});

// Add validation to ensure either content or imageUrl is present
messageSchema.pre('validate', function(next) {
  if (this.messageType === 'text' && (!this.content || this.content.trim() === '')) {
    this.invalidate('content', 'Content is required for text messages');
  }
  
  if (this.messageType === 'image' && (!this.imageUrl || this.imageUrl.trim() === '')) {
    this.invalidate('imageUrl', 'Image URL is required for image messages');
  }
  
  next();
});

// FIXED: Static method to get conversation between two users
messageSchema.statics.getConversation = async function(userId1, userId2, page = 1, limit = 50) {
  const skip = (page - 1) * limit;
  
  try {
    const messages = await this.find({
      $or: [
        // Messages from user1 to user2
        { sender: userId1, receiver: userId2, receiverModel: 'User' },
        // Messages from user2 to user1  
        { sender: userId2, receiver: userId1, receiverModel: 'User' }
      ]
    })
    .populate('sender', 'username avatar isOnline')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean();
    
    return messages;
  } catch (error) {
    console.error('Error in getConversation:', error);
    throw error;
  }
};

// Static method: Get messages for a chat room
messageSchema.statics.getRoomMessages = async function(roomId, page = 1, limit = 50) {
  const skip = (page - 1) * limit;
  
  return await this.find({
    receiver: roomId,
    receiverModel: 'ChatRoom'
  })
  .populate('sender', 'username avatar isOnline')
  .sort({ createdAt: -1 })
  .skip(skip)
  .limit(limit)
  .lean();
};

// Instance method: Mark message as read
messageSchema.methods.markAsRead = async function() {
  this.read = true;
  return await this.save();
};

// Instance method: Add reaction to message
messageSchema.methods.addReaction = async function(userId, emoji) {
  // Remove existing reaction from this user
  this.reactions = this.reactions.filter(reaction => 
    reaction.userId.toString() !== userId.toString()
  );
  
  // Add new reaction
  this.reactions.push({ userId, emoji });
  return await this.save();
};

// Instance method: Remove reaction
messageSchema.methods.removeReaction = async function(userId) {
  this.reactions = this.reactions.filter(reaction => 
    reaction.userId.toString() !== userId.toString()
  );
  return await this.save();
};

// Instance method: Edit message content
messageSchema.methods.editContent = async function(newContent) {
  // Save current version to history
  this.previousVersions.push({
    content: this.content,
    editedAt: new Date()
  });
  
  // Update content
  this.content = newContent;
  this.edited = true;
  
  return await this.save();
};

// Index for faster queries
messageSchema.index({ sender: 1, receiver: 1, createdAt: -1 });
messageSchema.index({ receiver: 1, createdAt: -1 });

// Create Message model from schema
const Message = mongoose.model('Message', messageSchema);

module.exports = Message;