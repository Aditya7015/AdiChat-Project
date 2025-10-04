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
    setMessages
  } = useChat()

  const [showSidebar, setShowSidebar] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768
      setIsMobile(mobile)
      // Auto-show sidebar on mobile when no conversation is selected
      if (mobile && !selectedConversation) {
        setShowSidebar(true)
      }
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    
    return () => window.removeEventListener('resize', checkMobile)
  }, [selectedConversation])

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
    if (isMobile) {
      setShowSidebar(false)
    }
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

  const toggleSidebar = () => {
    setShowSidebar(!showSidebar)
  }

  const closeSidebar = () => {
    setShowSidebar(false)
  }

  useEffect(() => {
    console.log('📝 MESSAGES UPDATED:', messages.length, 'messages')
  }, [messages])

  useEffect(() => {
    console.log('💬 SELECTED CONVERSATION:', selectedConversation)
  }, [selectedConversation])

  return (
    <div className="h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex overflow-hidden relative">
      {/* Sidebar - Hidden on mobile when chat is open */}
      <div className={`
        ${isMobile 
          ? `fixed inset-0 z-50 transform transition-transform duration-300 ease-in-out bg-white`
          : 'relative'
        }
        ${showSidebar || !selectedConversation ? 'translate-x-0' : '-translate-x-full'}
        w-80 md:w-96 lg:w-80 xl:w-96 flex-shrink-0 bg-white shadow-xl border-r border-gray-200
        md:relative md:translate-x-0
      `}>
        <Sidebar
          users={users}
          conversations={conversations}
          selectedConversation={selectedConversation}
          onSelectConversation={handleSelectConversation}
          onMobileClose={closeSidebar}
        />
      </div>

      {/* Mobile Overlay - Only show when sidebar is open on mobile */}
      {isMobile && showSidebar && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={closeSidebar}
        />
      )}

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-w-0 bg-white shadow-inner">
        {/* Connection Status Bar */}
        <div className={`flex-shrink-0 px-4 md:px-6 py-2 md:py-3 text-sm font-semibold ${
          isConnected 
            ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white' 
            : 'bg-gradient-to-r from-red-500 to-pink-600 text-white'
        } shadow-sm`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 md:space-x-3">
              <div className={`w-2 h-2 md:w-3 md:h-3 rounded-full ${isConnected ? 'bg-white' : 'bg-white animate-pulse'}`}></div>
              <span className="text-xs md:text-sm">
                {isConnected ? 'Connected' : 'Connecting...'}
              </span>
            </div>
            <div className="flex items-center space-x-2 md:space-x-4">
              <span className="text-white/90 text-xs md:text-sm font-medium hidden sm:block">
                {selectedConversation 
                  ? `Chatting with ${selectedConversation.isAI ? selectedConversation.username : selectedConversation.user?.username}` 
                  : `Welcome, ${user?.username}!`
                }
              </span>
              
              {/* Mobile menu button */}
              {isMobile && (
                <button
                  onClick={toggleSidebar}
                  className="bg-white/20 hover:bg-white/30 text-white p-1.5 rounded-lg transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>
              )}
              
              <button
                onClick={logout}
                className="bg-white/20 hover:bg-white/30 text-white font-medium py-1 md:py-1.5 px-2 md:px-4 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-white/50 text-xs md:text-sm transform hover:scale-105"
              >
                {isMobile ? 'Logout' : 'Logout'}
              </button>
            </div>
          </div>
        </div>

        {/* Chat Header */}
        {selectedConversation && (
          <div className="flex-shrink-0 bg-white border-b border-gray-200 shadow-sm">
            <ChatHeader 
              conversation={selectedConversation} 
              onMenuClick={toggleSidebar}
              isMobile={isMobile}
            />
          </div>
        )}

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-h-0">
          {selectedConversation ? (
            <>
              {loading ? (
                <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-gray-50 to-blue-50">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 md:h-12 md:w-12 border-b-2 border-blue-600 mx-auto mb-2 md:mb-4"></div>
                    <p className="text-gray-600 text-sm md:text-base font-medium">Loading messages...</p>
                    <p className="text-gray-400 text-xs md:text-sm mt-1">Please wait a moment</p>
                  </div>
                </div>
              ) : (
                <>
                  {/* Messages Count - Hidden on mobile to save space */}
                  {!isMobile && (
                    <div className="flex-shrink-0 px-4 md:px-6 py-2 md:py-3 bg-gray-50 border-b border-gray-200">
                      <p className="text-xs text-gray-600 text-center font-medium">
                        💬 {messages.length} messages • Chatting with {selectedConversation.isAI ? selectedConversation.username : selectedConversation.user?.username}
                        {selectedConversation.isAI && ' 🤖 AI Assistant'}
                      </p>
                    </div>
                  )}
                  
                  {/* Messages Area */}
                  <div className="flex-1 min-h-0 bg-gradient-to-b from-white to-gray-50">
                    <MessageList 
                      messages={messages} 
                      typingUsers={typingUsers}
                    />
                  </div>
                </>
              )}
              
              {/* Message Input */}
              <div className="flex-shrink-0 bg-white border-t border-gray-200 shadow-lg">
                <MessageInput
                  onSendMessage={handleSendMessage}
                  receiverId={selectedConversation?.isAI ? selectedConversation._id : selectedConversation?.user?._id}
                />
              </div>
            </>
          ) : (
            /* Welcome Screen */
            <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-gray-50 to-blue-50 p-4">
              <div className="text-center max-w-2xl w-full">
                <div className="w-20 h-20 md:w-32 md:h-32 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4 md:mb-8 shadow-2xl">
                  <span className="text-white font-bold text-2xl md:text-4xl">AC</span>
                </div>
                <h3 className="text-2xl md:text-4xl font-bold text-gray-900 mb-4 md:mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  AdiChat Messenger
                </h3>
                <p className="text-gray-600 text-base md:text-lg mb-6 md:mb-8 leading-relaxed max-w-md mx-auto px-4">
                  {users.length > 0 
                    ? `Connect and chat with ${users.length + 1} amazing people including our AI assistant. Start meaningful conversations today!`
                    : 'Be the first to join! Invite friends to experience real-time messaging with AdiChat.'
                  }
                </p>
                
                {/* AI Assistant Card */}
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl border border-blue-200 p-4 md:p-6 mb-6 md:mb-8 shadow-lg max-w-md mx-auto">
                  <div className="flex items-center space-x-3 md:space-x-4 mb-2 md:mb-3">
                    <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center shadow-lg">
                      <span className="text-white font-bold text-xs md:text-sm">AI</span>
                    </div>
                    <div>
                      <h3 className="text-gray-900 font-bold text-base md:text-lg">Adi AI Assistant</h3>
                      <p className="text-gray-600 text-xs md:text-sm">Always ready to help and chat</p>
                    </div>
                  </div>
                  <p className="text-gray-700 text-xs md:text-sm leading-relaxed">
                    Your intelligent AI companion is here to answer questions, help with tasks, and engage in meaningful conversations 24/7.
                  </p>
                </div>

                {/* Security Note */}
                <div className="border-t border-gray-200 pt-4 md:pt-6">
                  <p className="text-gray-500 text-xs flex items-center justify-center space-x-1 md:space-x-2 text-center flex-wrap">
                    <svg className="w-3 h-3 md:w-4 md:h-4 text-green-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                    </svg>
                    <span className="whitespace-nowrap">End-to-end encrypted</span>
                    <span className="hidden sm:inline">•</span>
                    <span className="whitespace-nowrap">Secure messaging</span>
                    <span className="hidden sm:inline">•</span>
                    <span className="whitespace-nowrap">Privacy focused</span>
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