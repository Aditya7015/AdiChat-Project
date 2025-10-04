import React, { useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'

// ✅ ADI AI BOT STRUCTURE
const ADI_AI_BOT = {
  _id: 'ai_adi_assistant',
  username: 'Adi AI',
  avatar: '🤖',
  isOnline: true,
  isAI: true,
  user: {
    _id: 'ai_adi_assistant',
    username: 'Adi AI',
    avatar: '🤖',
    isAI: true
  },
  lastMessage: {
    content: 'Hello! I\'m Adi, your AI assistant. How can I help you today?',
    createdAt: new Date()
  },
  unreadCount: 0
};

const Sidebar = ({ 
  users = [], 
  conversations = [], 
  selectedConversation, 
  onSelectConversation,
  onMobileClose 
}) => {
  const { user } = useAuth()
  const [searchTerm, setSearchTerm] = useState('')

  // ✅ USER CONVERSATIONS STRUCTURE
  const userConversations = users.map(user => ({
    _id: user._id,
    username: user.username,
    user: user,
    lastMessage: {
      content: 'Start a conversation...',
      createdAt: new Date()
    },
    unreadCount: 0
  }));

  const allConversations = [ADI_AI_BOT, ...userConversations];

  // Filter conversations based on search
  const filteredConversations = allConversations.filter(conv =>
    conv.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    conv.lastMessage.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatDate = (date) => {
    const messageDate = new Date(date);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (messageDate.toDateString() === today.toDateString()) {
      return formatTime(date);
    } else if (messageDate.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return messageDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  }

  const handleUserClick = (conversation) => {
    onSelectConversation(conversation)
    if (onMobileClose) {
      onMobileClose()
    }
  }

  return (
    <div className="w-full h-full bg-[#f8f9fa] border-r border-[#e9edef] flex flex-col">
      {/* Header */}
      <div className="p-4 md:p-6 bg-[#f0f2f5] border-b border-[#e9edef]">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-[#00a884] to-[#128c7e] rounded-full flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-base md:text-lg">AC</span>
            </div>
            <div>
              <h1 className="text-lg md:text-xl font-bold text-[#41525d]">AdiChat</h1>
              <p className="text-xs text-[#667781]">Chat with Adi AI & Friends</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {/* Mobile close button */}
            {onMobileClose && (
              <button
                onClick={onMobileClose}
                className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-white hover:bg-[#e9edef] flex items-center justify-center transition-colors duration-200 shadow-sm md:hidden"
              >
                <svg className="w-4 h-4 md:w-5 md:h-5 text-[#54656f]" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                </svg>
              </button>
            )}
            <button className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-white hover:bg-[#e9edef] flex items-center justify-center transition-colors duration-200 shadow-sm hidden md:flex">
              <svg className="w-4 h-4 md:w-5 md:h-5 text-[#54656f]" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm5 11h-4v4h-2v-4H7v-2h4V7h2v4h4v2z"/>
              </svg>
            </button>
            <button className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-white hover:bg-[#e9edef] flex items-center justify-center transition-colors duration-200 shadow-sm hidden md:flex">
              <svg className="w-4 h-4 md:w-5 md:h-5 text-[#54656f]" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 15h-2v-6h2v6zm4 0h-2V9h2v8z"/>
              </svg>
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 md:pl-4 flex items-center pointer-events-none">
            <svg className="h-4 w-4 text-[#54656f]" fill="currentColor" viewBox="0 0 24 24">
              <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
            </svg>
          </div>
          <input
            type="text"
            placeholder="Search or start new chat"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 md:pl-12 pr-4 py-2 md:py-3 bg-white border-none rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#00a884] text-[#54656f] placeholder-[#8696a0] text-sm shadow-sm transition-all duration-200"
          />
        </div>
      </div>

      {/* Categories */}
      <div className="px-3 md:px-4 py-2 md:py-3 bg-[#f0f2f5] border-b border-[#e9edef]">
        <div className="flex space-x-4 md:space-x-6">
          <button className="text-sm font-medium text-[#008069] border-b-2 border-[#008069] pb-1 md:pb-2 px-1">
            All
          </button>
          <button className="text-sm font-medium text-[#54656f] hover:text-[#008069] pb-1 md:pb-2 px-1 transition-colors">
            Unread
          </button>
          <button className="text-sm font-medium text-[#54656f] hover:text-[#008069] pb-1 md:pb-2 px-1 transition-colors">
            Groups
          </button>
        </div>
      </div>

      {/* Conversations List */}
      <div className="flex-1 overflow-y-auto bg-white">
        {filteredConversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full p-6 md:p-8 text-center">
            <div className="w-16 h-16 md:w-24 md:h-24 bg-[#f0f2f5] rounded-full flex items-center justify-center mx-auto mb-4 md:mb-6">
              <svg className="w-8 h-8 md:w-12 md:h-12 text-[#8696a0]" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM6 9h12v2H6V9zm8 5H6v-2h8v2zm4-6H6V6h12v2z"/>
              </svg>
            </div>
            <p className="text-[#54656f] font-medium mb-2 text-sm md:text-base">No conversations found</p>
            <p className="text-[#8696a0] text-xs md:text-sm">Start chatting with Adi AI or friends</p>
          </div>
        ) : (
          <div>
            {filteredConversations.map((conversation) => (
              <div
                key={conversation._id}
                className={`relative px-3 md:px-4 py-2 md:py-3 cursor-pointer transition-all duration-200 group ${
                  selectedConversation?._id === conversation._id 
                    ? 'bg-[#f0f2f5]' 
                    : 'hover:bg-[#f5f6f6]'
                } ${conversation.isAI ? 'border-l-4 border-l-[#00a884]' : ''}`}
                onClick={() => handleUserClick(conversation)}
              >
                <div className="flex items-center space-x-2 md:space-x-3">
                  {/* Avatar */}
                  <div className="relative flex-shrink-0">
                    <div className={`w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center text-white font-bold ${
                      conversation.isAI 
                        ? 'bg-gradient-to-br from-[#00a884] to-[#128c7e]' 
                        : 'bg-gradient-to-br from-[#6a45ff] to-[#8946ef]'
                    } shadow-md`}>
                      {conversation.isAI ? '🤖' : (conversation.user?.username?.charAt(0).toUpperCase() || 'U')}
                    </div>
                    {conversation.isOnline && (
                      <div className={`absolute bottom-0 right-0 w-2 h-2 md:w-3 md:h-3 border-2 border-white rounded-full ${
                        conversation.isAI ? 'bg-[#00a884]' : 'bg-[#00a884]'
                      } shadow-sm`}></div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="text-sm font-semibold text-[#111b21] truncate">
                        {conversation.isAI ? conversation.username : (conversation.user?.username || 'Unknown User')}
                      </h3>
                      <span className="text-xs text-[#667781] hidden sm:block">
                        {formatDate(conversation.lastMessage.createdAt)}
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-[#667781] truncate max-w-[120px] md:max-w-[180px]">
                        {conversation.lastMessage.content}
                      </p>
                      
                      <div className="flex items-center space-x-1">
                        {conversation.unreadCount > 0 && (
                          <span className="bg-[#00a884] text-white text-xs font-medium px-1.5 py-0.5 rounded-full min-w-[18px] md:min-w-[20px] text-center">
                            {conversation.unreadCount}
                          </span>
                        )}
                        {conversation.isAI && (
                          <div className="flex items-center space-x-1">
                            <div className="w-1.5 h-1.5 md:w-2 md:h-2 bg-[#00a884] rounded-full hidden sm:block"></div>
                            <span className="text-xs text-[#00a884] font-medium hidden md:inline">AI</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Selection Indicator */}
                {selectedConversation?._id === conversation._id && (
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#00a884] rounded-r"></div>
                )}

                {/* Hover Actions - Hidden on mobile */}
                <div className="absolute right-2 md:right-3 top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 hidden md:block">
                  <button className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-white hover:bg-[#e9edef] flex items-center justify-center shadow-sm border border-[#e9edef]">
                    <svg className="w-3 h-3 md:w-4 md:h-4 text-[#54656f]" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/>
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* User Profile Footer */}
      <div className="p-2 md:p-3 bg-[#f0f2f5] border-t border-[#e9edef]">
        <div className="flex items-center space-x-2 md:space-x-3 p-2 rounded-lg hover:bg-[#e9edef] transition-colors duration-200 cursor-pointer">
          <div className="w-8 h-8 md:w-10 md:h-10 bg-gradient-to-br from-[#00a884] to-[#128c7e] rounded-full flex items-center justify-center text-white font-bold shadow-md">
            {user?.username?.charAt(0).toUpperCase() || 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-[#111b21] truncate">
              {user?.username || 'Unknown User'}
            </p>
            <p className="text-xs text-[#667781] truncate flex items-center">
              <span className="w-1.5 h-1.5 md:w-2 md:h-2 bg-[#00a884] rounded-full mr-1 md:mr-2"></span>
              Online • AdiChat
            </p>
          </div>
          <div className="flex items-center space-x-1">
            <button className="w-7 h-7 md:w-8 md:h-8 rounded-full hover:bg-white flex items-center justify-center transition-colors">
              <svg className="w-3 h-3 md:w-4 md:h-4 text-[#54656f]" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Sidebar