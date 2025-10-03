import React, { useEffect, useRef } from 'react'
import { useAuth } from '../../contexts/AuthContext'

const MessageList = ({ messages = [], typingUsers = [] }) => {
  const { user } = useAuth()
  const messagesEndRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages, typingUsers])

  const formatTime = (date) => {
    try {
      const dateObj = typeof date === 'string' ? new Date(date) : date
      return dateObj.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit'
      })
    } catch (error) {
      return 'Just now'
    }
  }

  // ✅ ADD SAFETY CHECK FOR MESSAGES
  if (!messages || !Array.isArray(messages)) {
    console.error('❌ MessageList: Invalid messages prop:', messages);
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-gray-500 text-center">
          No messages available
        </p>
      </div>
    );
  }

  // Sort messages by timestamp with safety checks
  const sortedMessages = [...messages]
    .filter(message => message && typeof message === 'object') // ✅ Filter out invalid messages
    .sort((a, b) => {
      try {
        const timeA = new Date(a.createdAt || a._id || 0)
        const timeB = new Date(b.createdAt || b._id || 0)
        return timeA - timeB
      } catch (error) {
        return 0
      }
    })

  return (
    <div className="h-full overflow-y-auto p-4 space-y-4 bg-gray-50">
      {sortedMessages.length === 0 ? (
        <div className="flex items-center justify-center h-full">
          <p className="text-gray-500 text-center">
            No messages yet. <br />
            <span className="text-sm">Start the conversation!</span>
          </p>
        </div>
      ) : (
        sortedMessages.map((message, index) => {
          // ✅ ADD COMPREHENSIVE NULL CHECKS
          if (!message || typeof message !== 'object') {
            console.warn('⚠️ Skipping invalid message:', message);
            return null;
          }

          const messageId = message._id || `message-${index}-${Date.now()}`
          const messageContent = message.content || ''
          const messageSender = message.sender || {}
          const messageDate = message.createdAt
          const isOptimistic = message.isOptimistic || false
          const messageType = message.messageType || 'text'
          const imageUrl = message.imageUrl
          
          // ✅ SAFE SENDER CHECK
          const isOwnMessage = messageSender._id === user?._id
          const senderUsername = messageSender.username || 'Unknown User'
          const isAI = messageSender.isAI || message.isAI || false
          
          return (
            <div
              key={messageId}
              className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'} ${
                isOptimistic ? 'opacity-80' : ''
              }`}
            >
              <div
                className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${
                  isOwnMessage
                    ? 'bg-blue-600 text-white rounded-br-none'
                    : isAI 
                      ? 'bg-purple-100 text-gray-900 rounded-bl-none border border-purple-200'
                      : 'bg-white text-gray-900 rounded-bl-none border border-gray-200'
                } ${isOptimistic ? 'border-2 border-dashed border-yellow-400' : ''}`}
              >
                {/* Sender name for non-own messages */}
                {!isOwnMessage && (
                  <p className={`text-xs font-medium mb-1 ${
                    isAI ? 'text-purple-600' : 'text-blue-600'
                  }`}>
                    {senderUsername}
                    {isAI && ' 🤖'}
                  </p>
                )}
                
                {/* Image Message */}
                {messageType === 'image' && imageUrl && (
                  <div className="mb-2">
                    <img
                      src={imageUrl}
                      alt="Shared image"
                      className="max-w-full h-auto rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                      onClick={() => window.open(imageUrl, '_blank')}
                    />
                  </div>
                )}
                
                {/* Text Message */}
                {messageType === 'text' && messageContent && (
                  <div className="flex items-center space-x-2">
                    <p className="text-sm break-words">{messageContent}</p>
                    {isOptimistic && (
                      <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
                    )}
                  </div>
                )}

                {/* Thinking indicator for AI */}
                {message.isThinking && (
                  <div className="flex items-center space-x-2">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                    <span className="text-xs text-purple-600">Thinking...</span>
                  </div>
                )}

                {/* Error message */}
                {message.isError && (
                  <div className="flex items-center space-x-2 text-red-600">
                    <span>⚠️</span>
                    <p className="text-sm break-words">{messageContent}</p>
                  </div>
                )}
                
                <div className={`text-xs mt-1 ${
                  isOwnMessage ? 'text-blue-200' : 
                  isAI ? 'text-purple-500' : 'text-gray-500'
                }`}>
                  {formatTime(messageDate)}
                  {isOwnMessage && (
                    <span className="ml-2">
                      {message.read ? '✓✓' : '✓'}
                      {isOptimistic && ' (Sending...)'}
                    </span>
                  )}
                </div>
              </div>
            </div>
          )
        }).filter(Boolean) // ✅ Remove any null entries from the map
      )}

      {/* Typing Indicators */}
      {typingUsers.map((typingUser) => (
        <div key={typingUser.userId} className="flex justify-start">
          <div className="bg-white text-gray-900 rounded-2xl rounded-bl-none border border-gray-200 px-4 py-2">
            <div className="flex items-center space-x-2">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
              <span className="text-xs text-gray-500">{typingUser.username} is typing...</span>
            </div>
          </div>
        </div>
      ))}

      <div ref={messagesEndRef} />
    </div>
  )
}

export default MessageList