import React, { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { useSocket } from '../../contexts/SocketContext'
import { useChat } from '../../hooks/useChat'
import Sidebar from '../../components/layout/Sidebar'
import ChatHeader from '../../components/chat/ChatHeader'
import MessageList from '../../components/chat/MessageList'
import MessageInput from '../../components/chat/MessageInput'

const Dashboard = () => {
  const { user, logout } = useAuth()
  const { socket, isConnected } = useSocket()
  const {
    conversations,
    selectedConversation,
    messages,
    users,
    typingUsers,
    loading,
    setSelectedConversation,
    sendMessage,
    sendAIMessage,
    loadMessages,
    setMessages // ✅ ADD THIS
  } = useChat()

const handleSelectConversation = async (conversation) => {
  console.log('💬 Selecting conversation:', conversation);
  
  if (!conversation) {
    console.error('❌ No conversation provided');
    return;
  }
  
  if (!conversation._id) {
    console.error('❌ Invalid conversation: missing _id', conversation);
    return;
  }
  
  setSelectedConversation(conversation);
  
  // ✅ FIXED: Let useChat handle loading messages automatically
  console.log('🔄 Conversation selected - messages will load automatically');
};

  const handleSendMessage = (content, messageType = 'text', imageData = null) => {
    console.log('📤 Dashboard: Sending message:', { content, messageType, imageData });
    
    if (!selectedConversation) {
      console.log('❌ No conversation selected');
      return;
    }

    if (selectedConversation.isAI) {
      console.log('🤖 Sending to AI:', content);
      sendAIMessage(content);
    } else {
      console.log('👤 Sending to user:', selectedConversation.user?.username);
      sendMessage(content, messageType, imageData);
    }
  };

  useEffect(() => {
    console.log('📝 MESSAGES UPDATED:', messages.length, 'messages')
  }, [messages])

  useEffect(() => {
    console.log('💬 SELECTED CONVERSATION:', selectedConversation)
  }, [selectedConversation])

  return (
    <div className="h-screen bg-gray-50 flex overflow-hidden">
      {/* Your existing JSX remains the same */}
      <div className="w-80 flex-shrink-0">
        <Sidebar
          users={users}
          conversations={conversations}
          selectedConversation={selectedConversation}
          onSelectConversation={handleSelectConversation}
        />
      </div>

      <div className="flex-1 flex flex-col min-w-0">
        {/* Connection Status */}
        <div className={`flex-shrink-0 px-4 py-2 text-sm font-medium ${
          isConnected ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <span>
                {isConnected ? 'Connected to server' : 'Disconnected from server'}
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-600">
                {selectedConversation 
                  ? `Chatting with ${selectedConversation.isAI ? selectedConversation.username : selectedConversation.user?.username}` 
                  : `Welcome, ${user?.username}`
                }
              </span>
              <button
                onClick={logout}
                className="bg-gray-200 hover:bg-gray-300 text-gray-900 font-medium py-1 px-3 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 text-sm"
              >
                Logout
              </button>
            </div>
          </div>
        </div>

        <div className="flex-shrink-0">
          <ChatHeader conversation={selectedConversation} />
        </div>

        <div className="flex-1 flex flex-col min-h-0">
          {selectedConversation ? (
            <>
              {loading ? (
                <div className="flex-1 flex items-center justify-center">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                    <p className="text-gray-600">Loading messages...</p>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex-shrink-0 p-2 bg-gray-100 border-b">
                    <p className="text-xs text-gray-600 text-center">
                      {messages.length} messages • Chatting with {selectedConversation.isAI ? selectedConversation.username : selectedConversation.user?.username}
                      {selectedConversation.isAI && ' 🤖'}
                    </p>
                  </div>
                  
                  <div className="flex-1 min-h-0">
                    <MessageList 
                      messages={messages} 
                      typingUsers={typingUsers}
                    />
                  </div>
                </>
              )}
              
              <div className="flex-shrink-0">
                <MessageInput
                  onSendMessage={handleSendMessage}
                  receiverId={selectedConversation?.isAI ? selectedConversation._id : selectedConversation?.user?._id}
                />
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {users.length > 0 ? 'Select a user to start chatting' : 'Welcome to AdiChat'}
                </h3>
                <p className="text-gray-500 max-w-md">
                  {users.length > 0 
                    ? `Choose from ${users.length + 1} available users (including Grok AI) to start a conversation. Your messages will be delivered in real-time.`
                    : 'No other users found. Ask someone to register so you can chat with them!'
                  }
                </p>
                <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-sm text-blue-700">
                    💡 <strong>Try Grok AI</strong> - Your friendly AI assistant is always available to chat!
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Dashboard