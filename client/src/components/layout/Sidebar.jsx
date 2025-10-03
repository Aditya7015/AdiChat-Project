import React from 'react'
import { useAuth } from '../../contexts/AuthContext'

// ✅ FIXED GROK BOT STRUCTURE
const GROK_BOT = {
  _id: 'ai_grok_assistant',
  username: 'Grok AI 🤖',
  avatar: '🤖',
  isOnline: true,
  isAI: true,
  // ✅ ADD PROPER USER OBJECT STRUCTURE
  user: {
    _id: 'ai_grok_assistant',
    username: 'Grok AI 🤖',
    avatar: '🤖',
    isAI: true
  },
  lastMessage: {
    content: 'Hello! I\'m Grok, your AI assistant. How can I help you today?',
    createdAt: new Date()
  },
  unreadCount: 0
};

const Sidebar = ({ 
  users = [], 
  conversations = [], 
  selectedConversation, 
  onSelectConversation 
}) => {
  const { user } = useAuth()

  // ✅ FIXED USER CONVERSATIONS STRUCTURE
  const userConversations = users.map(user => ({
    _id: user._id,
    username: user.username, // ✅ Add username at top level
    user: user,
    lastMessage: {
      content: 'Start a conversation...',
      createdAt: new Date()
    },
    unreadCount: 0
  }));

  const allConversations = [GROK_BOT, ...userConversations];

  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const handleUserClick = (conversation) => {
    onSelectConversation(conversation)
  }

  return (
    <div className="w-80 bg-white border-r border-gray-200 flex flex-col h-full">
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Chats</h2>
          <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">
            {allConversations.length} users
          </span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {allConversations.length === 0 ? (
          <div className="p-4 text-center text-gray-500">
            <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-2">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a2 2 0 01-2-2v-1m8-9a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
            <p>No users found</p>
          </div>
        ) : (
          allConversations.map((conversation) => (
            <div
              key={conversation._id}
              className={`p-4 border-b border-gray-100 cursor-pointer transition-colors hover:bg-gray-50 ${
                selectedConversation?._id === conversation._id ? 'bg-blue-50 border-blue-200' : ''
              } ${conversation.isAI ? 'bg-green-50 hover:bg-green-100' : ''}`}
              onClick={() => handleUserClick(conversation)}
            >
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-semibold ${
                    conversation.isAI ? 'bg-gradient-to-r from-purple-500 to-pink-500' : 'bg-blue-500'
                  }`}>
                    {conversation.isAI ? '🤖' : (conversation.user?.username?.charAt(0).toUpperCase() || 'U')}
                  </div>
                  {conversation.isOnline && (
                    <div className={`absolute bottom-0 right-0 w-3 h-3 border-2 border-white rounded-full ${
                      conversation.isAI ? 'bg-green-500' : 'bg-green-500'
                    }`}></div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-medium text-gray-900 truncate">
                      {/* ✅ SAFE ACCESS */}
                      {conversation.isAI ? conversation.username : (conversation.user?.username || 'Unknown User')}
                      {conversation.isAI && <span className="ml-1 text-xs text-purple-600">AI</span>}
                    </h3>
                    <span className="text-xs text-gray-500">
                      {formatTime(conversation.lastMessage.createdAt)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 truncate mt-1">
                    {conversation.lastMessage.content}
                  </p>
                </div>

                {conversation.unreadCount > 0 && (
                  <div className="flex-shrink-0">
                    <span className="bg-blue-600 text-white text-xs font-medium px-2 py-1 rounded-full">
                      {conversation.unreadCount}
                    </span>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      <div className="p-4 border-t border-gray-200 bg-gray-50">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center text-white font-semibold">
            {user?.username?.charAt(0).toUpperCase() || 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">
              {user?.username || 'Unknown User'}
            </p>
            <p className="text-xs text-gray-500 truncate">
              {user?.email || 'No email'}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Sidebar