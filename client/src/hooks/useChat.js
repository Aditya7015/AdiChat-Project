import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useSocket } from '../contexts/SocketContext'
import { messageAPI, userAPI } from '../services/api'
import { aiAPI } from '../services/api';

export const useChat = () => {
  const { user } = useAuth()
  const { socket, isConnected } = useSocket()
  
  // ✅ EMERGENCY PATCH: Add immediate null check
  if (!user) {
    console.error('❌ useChat: User is null! Cannot proceed.');
    return {
      conversations: [],
      selectedConversation: null,
      messages: [],
      users: [],
      typingUsers: [],
      loading: false,
      setSelectedConversation: () => {},
      sendMessage: () => {},
      sendAIMessage: () => {},
      loadMessages: () => {},
      loadUsers: () => {},
      setMessages: () => {},
    };
  }

  const [conversations, setConversations] = useState([])
  const [messages, setMessages] = useState([])
  const [users, setUsers] = useState([])
  const [typingUsers, setTypingUsers] = useState([])
  const [loading, setLoading] = useState(false)

  const [selectedConversation, setSelectedConversation] = useState(() => {
    const saved = localStorage.getItem('selectedConversation');
    return saved ? JSON.parse(saved) : null;
  });

  const setSelectedConversationPersist = useCallback((conversation) => {
    if (!conversation || !conversation._id) {
      console.error('❌ Invalid conversation:', conversation);
      return;
    }
    setSelectedConversation(conversation);
    if (conversation) {
      localStorage.setItem('selectedConversation', JSON.stringify(conversation));
    } else {
      localStorage.removeItem('selectedConversation');
    }
  }, []);

  // ✅ FIXED: Load messages for both AI and regular conversations
  const loadMessages = useCallback(async (conversation) => {
    if (!conversation) return;
    
    setLoading(true);
    try {
      console.log('💬 Loading messages for:', conversation._id, conversation.isAI ? '(AI)' : '(User)');
      
      let response;
      if (conversation.isAI) {
        // Load AI conversation
        response = await aiAPI.getGrokConversation();
      } else {
        // Load regular user conversation
        response = await messageAPI.getConversation(conversation.user?._id || conversation._id);
      }
      
      console.log('✅ Messages loaded:', response.data.data.messages.length);
      setMessages(response.data.data.messages || []);
    } catch (error) {
      console.error('❌ Failed to load messages:', error);
      setMessages([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // ✅ FIXED: This useEffect loads messages when selectedConversation changes (including page refresh)
  useEffect(() => {
    if (selectedConversation) {
      console.log('🔄 Selected conversation changed (including page refresh):', selectedConversation);
      loadMessages(selectedConversation);
    }
  }, [selectedConversation, loadMessages]);

  const sendAIMessage = useCallback(async (content) => {
    if (!selectedConversation || !selectedConversation.isAI || !user) {
      console.log('❌ Cannot send AI message');
      return;
    }

    console.log('🤖 Sending AI message:', content);

    // Create optimistic user message
    const userMessage = {
      _id: `optimistic-user-${Date.now()}`,
      sender: {
        _id: user._id,
        username: user.username,
        avatar: user.avatar
      },
      receiver: selectedConversation._id,
      content: content,
      messageType: 'text',
      read: true,
      createdAt: new Date(),
      isOptimistic: true
    };

    // Create optimistic AI thinking message
    const thinkingMessage = {
      _id: `optimistic-ai-${Date.now()}`,
      sender: {
        _id: selectedConversation._id,
        username: selectedConversation.username,
        avatar: selectedConversation.avatar,
        isAI: true
      },
      receiver: user._id,
      content: 'Thinking...',
      messageType: 'text',
      read: true,
      createdAt: new Date(),
      isOptimistic: true,
      isThinking: true
    };

    // Add both messages immediately
    setMessages(prev => [...prev, userMessage, thinkingMessage]);

    try {
      const response = await aiAPI.sendToGrok({ message: content });
      console.log('🤖 AI Response:', response.data);
      
      if (response.data.success && response.data.data.message) {
        setMessages(prev => {
          const withoutThinking = prev.filter(msg => !msg.isThinking);
          return [...withoutThinking, response.data.data.message];
        });
      } else {
        throw new Error(response.data.error || 'AI service failed');
      }
    } catch (error) {
      console.error('❌ AI message error:', error);
      setMessages(prev => {
        const withoutThinking = prev.filter(msg => !msg.isThinking);
        const withError = [
          ...withoutThinking,
          {
            _id: `error-${Date.now()}`,
            sender: {
              _id: selectedConversation._id,
              username: selectedConversation.username,
              avatar: selectedConversation.avatar,
              isAI: true
            },
            receiver: user._id,
            content: "Sorry, I'm having trouble responding right now. Please try again!",
            messageType: 'text',
            read: true,
            createdAt: new Date(),
            isError: true
          }
        ];
        return withError;
      });
    }
  }, [selectedConversation, user]);

  const loadUsers = useCallback(async () => {
    try {
      console.log('👥 Loading users...')
      const response = await userAPI.getUsers()
      const otherUsers = response.data.data.users.filter(u => u._id !== user?._id)
      console.log('✅ Users loaded:', otherUsers.length)
      setUsers(otherUsers)
    } catch (error) {
      console.error('❌ Failed to load users:', error)
    }
  }, [user])

  const sendMessage = useCallback(async (content, messageType = 'text', imageData = null) => {
    if (!selectedConversation || !socket) {
      console.log('❌ Cannot send message: no conversation or socket')
      return
    }

    if (!selectedConversation.user?._id) {
      console.error('❌ Invalid conversation user:', selectedConversation);
      return;
    }

    const messageData = {
      receiverId: selectedConversation.user._id,
      content: content,
      messageType: messageType,
      ...(imageData && {
        imageUrl: imageData.imageUrl,
        imagePublicId: imageData.imagePublicId,
        imageWidth: imageData.imageWidth,
        imageHeight: imageData.imageHeight
      })
    }

    console.log('📤 Sending message data:', messageData)
    
    const optimisticMessage = {
      _id: `optimistic-${Date.now()}`,
      sender: {
        _id: user._id,
        username: user.username,
        avatar: user.avatar
      },
      receiver: selectedConversation.user._id,
      content: content,
      messageType: messageType,
      ...(imageData && {
        imageUrl: imageData.imageUrl,
        imagePublicId: imageData.imagePublicId,
        imageWidth: imageData.imageWidth,
        imageHeight: imageData.imageHeight
      }),
      read: false,
      createdAt: new Date(),
      updatedAt: new Date(),
      isOptimistic: true
    }

    console.log('🎯 Adding optimistic message:', optimisticMessage)
    
    setMessages(prev => [...prev, optimisticMessage])
    socket.emit('send-message', messageData)
    
    const handleMessageSent = (data) => {
      console.log('✅ Message sent confirmation received:', data)
      
      setMessages(prev => {
        const withoutOptimistic = prev.filter(msg => !msg.isOptimistic || msg._id !== optimisticMessage._id)
        const withRealMessage = [...withoutOptimistic, data.message]
        console.log('🔄 Replaced optimistic with real message:', withRealMessage)
        return withRealMessage
      })
      
      socket.off('message-sent', handleMessageSent)
    }

    socket.on('message-sent', handleMessageSent)

    setTimeout(() => {
      socket.off('message-sent', handleMessageSent)
      console.log('⏰ Message sent timeout - keeping optimistic message')
    }, 5000)

  }, [selectedConversation, socket, user])

  useEffect(() => {
    if (!socket) {
      console.log('❌ No socket connection')
      return
    }

    console.log('🔌 Setting up socket listeners...')

    const handleNewMessage = (data) => {
      console.log('💬 NEW MESSAGE RECEIVED:', data)
      
      if (data.message.sender._id !== user?._id) {
        setMessages(prev => {
          const messageExists = prev.some(msg => 
            msg._id === data.message._id || 
            (msg.isOptimistic && msg.content === data.message.content)
          )
          
          if (!messageExists) {
            const newMessages = [...prev, data.message]
            console.log('📝 Added received message:', newMessages)
            return newMessages
          }
          
          console.log('⚠️ Message already exists, skipping')
          return prev
        })
      }
    }

    const handleUserTyping = (data) => {
      console.log('⌨️ Typing event:', data)
      if (data.isTyping) {
        setTypingUsers(prev => [...prev.filter(u => u.userId !== data.senderId), {
          userId: data.senderId,
          username: data.senderName
        }])
      } else {
        setTypingUsers(prev => prev.filter(u => u.userId !== data.senderId))
      }
    }

    socket.on('new-message', handleNewMessage)
    socket.on('user-typing', handleUserTyping)

    return () => {
      console.log('🔌 Cleaning up socket listeners')
      socket.off('new-message', handleNewMessage)
      socket.off('user-typing', handleUserTyping)
    }
  }, [socket, user])

  useEffect(() => {
    if (user) {
      console.log('👤 User authenticated, loading data...')
      loadUsers()
    }
  }, [user, loadUsers])

  return {
    conversations,
    selectedConversation,
    messages,
    users,
    typingUsers,
    loading,
    setSelectedConversation: setSelectedConversationPersist,
    sendMessage,
    sendAIMessage,
    loadMessages: (conversation) => loadMessages(conversation || selectedConversation),
    loadUsers,
    setMessages,
  };
}