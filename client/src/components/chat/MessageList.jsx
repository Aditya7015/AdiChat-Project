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

  const formatDateHeader = (date) => {
    try {
      const dateObj = typeof date === 'string' ? new Date(date) : date
      const today = new Date()
      const yesterday = new Date(today)
      yesterday.setDate(yesterday.getDate() - 1)

      if (dateObj.toDateString() === today.toDateString()) {
        return 'Today'
      } else if (dateObj.toDateString() === yesterday.toDateString()) {
        return 'Yesterday'
      } else {
        return dateObj.toLocaleDateString('en-US', { 
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        })
      }
    } catch (error) {
      return 'Recent'
    }
  }

  // Group messages by date
  const groupMessagesByDate = (messages) => {
    const groups = {}
    messages.forEach(message => {
      try {
        const date = new Date(message.createdAt).toDateString()
        if (!groups[date]) {
          groups[date] = []
        }
        groups[date].push(message)
      } catch (error) {
        // Skip invalid messages
      }
    })
    return groups
  }

  // ✅ ADD SAFETY CHECK FOR MESSAGES
  if (!messages || !Array.isArray(messages)) {
    console.error('❌ MessageList: Invalid messages prop:', messages);
    return (
      <div className="flex items-center justify-center h-full bg-[#efeae2]">
        <div className="text-center">
          <div className="w-12 h-12 md:w-16 md:h-16 bg-[#e9edef] rounded-full flex items-center justify-center mx-auto mb-3 md:mb-4">
            <svg className="w-6 h-6 md:w-8 md:h-8 text-[#8696a0]" fill="currentColor" viewBox="0 0 24 24">
              <path d="M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM6 9h12v2H6V9zm8 5H6v-2h8v2zm4-6H6V6h12v2z"/>
            </svg>
          </div>
          <p className="text-[#667781] font-medium text-sm md:text-base">No messages available</p>
        </div>
      </div>
    );
  }

  // Sort messages by timestamp with safety checks
  const sortedMessages = [...messages]
    .filter(message => message && typeof message === 'object')
    .sort((a, b) => {
      try {
        const timeA = new Date(a.createdAt || a._id || 0)
        const timeB = new Date(b.createdAt || b._id || 0)
        return timeA - timeB
      } catch (error) {
        return 0
      }
    })

  const groupedMessages = groupMessagesByDate(sortedMessages)

  return (
    <div className="h-full overflow-y-auto bg-[#efeae2] bg-chat-pattern">
      <div className="min-h-full pb-2 md:pb-4">
        {Object.keys(groupedMessages).length === 0 ? (
          <div className="flex items-center justify-center h-full min-h-96">
            <div className="text-center">
              <div className="w-16 h-16 md:w-20 md:h-20 bg-[#e9edef] rounded-full flex items-center justify-center mx-auto mb-3 md:mb-4 shadow-inner">
                <svg className="w-8 h-8 md:w-10 md:h-10 text-[#8696a0]" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM6 9h12v2H6V9zm8 5H6v-2h8v2zm4-6H6V6h12v2z"/>
                </svg>
              </div>
              <p className="text-[#667781] font-medium mb-1 md:mb-2 text-sm md:text-base">No messages yet</p>
              <p className="text-[#8696a0] text-xs md:text-sm">Send a message to start the conversation</p>
            </div>
          </div>
        ) : (
          Object.entries(groupedMessages).map(([date, dateMessages]) => (
            <div key={date}>
              {/* Date Header */}
              <div className="flex justify-center my-4 md:my-6">
                <div className="bg-[#e9edef] text-[#667781] text-xs font-medium px-2 md:px-3 py-1 md:py-1.5 rounded-full shadow-sm">
                  {formatDateHeader(new Date(date))}
                </div>
              </div>

              {/* Messages for this date */}
              {dateMessages.map((message, index) => {
                if (!message || typeof message !== 'object') {
                  return null;
                }

                const messageId = message._id || `message-${index}-${Date.now()}`
                const messageContent = message.content || ''
                const messageSender = message.sender || {}
                const messageDate = message.createdAt
                const isOptimistic = message.isOptimistic || false
                const messageType = message.messageType || 'text'
                const imageUrl = message.imageUrl
                
                const isOwnMessage = messageSender._id === user?._id
                const senderUsername = messageSender.username || 'Unknown User'
                const isAI = messageSender.isAI || message.isAI || false
                
                return (
                  <div
                    key={messageId}
                    className={`flex px-2 md:px-4 mb-1 ${isOwnMessage ? 'justify-end' : 'justify-start'} ${
                      isOptimistic ? 'opacity-70' : ''
                    }`}
                  >
                    <div
                      className={`max-w-[85%] md:max-w-xs lg:max-w-md relative group ${
                        isOwnMessage ? 'ml-8 md:ml-12' : 'mr-8 md:mr-12'
                      }`}
                    >
                      {/* Sender name for non-own messages */}
                      {!isOwnMessage && (
                        <p className={`text-xs font-medium mb-1 px-2 md:px-4 ${
                          isAI ? 'text-[#7c4dff]' : 'text-[#008069]'
                        }`}>
                          {senderUsername}
                          {isAI && ' 🤖 AI Assistant'}
                        </p>
                      )}

                      {/* Message Bubble */}
                      <div
                        className={`rounded-2xl px-3 md:px-4 py-2 shadow-sm ${
                          isOwnMessage
                            ? 'bg-[#d9fdd3] text-[#111b21] rounded-br-md'
                            : isAI 
                              ? 'bg-white text-[#111b21] rounded-bl-md border border-[#e9edef]'
                              : 'bg-white text-[#111b21] rounded-bl-md border border-[#e9edef]'
                        } ${isOptimistic ? 'border-2 border-dashed border-yellow-400' : ''}`}
                      >
                        {/* Image Message */}
                        {messageType === 'image' && imageUrl && (
                          <div className="mb-2 -mx-1 md:-mx-2">
                            <img
                              src={imageUrl}
                              alt="Shared image"
                              className="max-w-full h-auto rounded-lg cursor-pointer hover:opacity-90 transition-opacity border border-[#e9edef]"
                              onClick={() => window.open(imageUrl, '_blank')}
                            />
                          </div>
                        )}
                        
                        {/* Text Message */}
                        {messageType === 'text' && messageContent && (
                          <div className="flex items-start space-x-1 md:space-x-2">
                            <p className="text-sm break-words leading-relaxed">{messageContent}</p>
                            {isOptimistic && (
                              <div className="w-1.5 h-1.5 md:w-2 md:h-2 bg-yellow-400 rounded-full animate-pulse flex-shrink-0 mt-1"></div>
                            )}
                          </div>
                        )}

                        {/* Message Footer */}
                        <div className={`flex items-center justify-end mt-1 space-x-1 md:space-x-2 ${
                          isOwnMessage ? 'text-[#667781]' : 
                          isAI ? 'text-[#7c4dff]/70' : 'text-[#667781]'
                        }`}>
                          <span className="text-xs">
                            {formatTime(messageDate)}
                          </span>
                          {isOwnMessage && (
                            <div className="flex items-center space-x-1">
                              {message.read ? (
                                <svg className="w-3 h-3 md:w-4 md:h-4 text-[#53bdeb]" fill="currentColor" viewBox="0 0 24 24">
                                  <path d="M18 7l-1.41-1.41-6.34 6.34 1.41 1.41L18 7zm4.24-1.41L11.66 16.17 7.48 12l-1.41 1.41L11.66 19l12-12-1.42-1.41zM.41 13.41L6 19l1.41-1.41L1.83 12 .41 13.41z"/>
                                </svg>
                              ) : (
                                <svg className="w-3 h-3 md:w-4 md:h-4" fill="currentColor" viewBox="0 0 24 24">
                                  <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                                </svg>
                              )}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Thinking indicator for AI */}
                      {message.isThinking && (
                        <div className="flex items-center space-x-2 mt-1 md:mt-2 px-2 md:px-4">
                          <div className="flex space-x-1">
                            <div className="w-1.5 h-1.5 md:w-2 md:h-2 bg-[#7c4dff] rounded-full animate-bounce"></div>
                            <div className="w-1.5 h-1.5 md:w-2 md:h-2 bg-[#7c4dff] rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                            <div className="w-1.5 h-1.5 md:w-2 md:h-2 bg-[#7c4dff] rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                          </div>
                          <span className="text-xs text-[#7c4dff] font-medium">AI is thinking...</span>
                        </div>
                      )}

                      {/* Error message */}
                      {message.isError && (
                        <div className="flex items-center space-x-2 mt-1 md:mt-2 px-2 md:px-4 py-1 md:py-2 bg-red-50 rounded-lg border border-red-200">
                          <svg className="w-3 h-3 md:w-4 md:h-4 text-red-500 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
                          </svg>
                          <p className="text-sm text-red-700 break-words">{messageContent}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )
              }).filter(Boolean)}
            </div>
          ))
        )}

        {/* Typing Indicators */}
        {typingUsers.map((typingUser) => (
          <div key={typingUser.userId} className="flex justify-start px-2 md:px-4 mb-1">
            <div className="max-w-[85%] md:max-w-xs lg:max-w-md mr-8 md:mr-12">
              <p className="text-xs font-medium mb-1 px-2 md:px-4 text-[#008069]">
                {typingUser.username}
              </p>
              <div className="bg-white text-gray-900 rounded-2xl rounded-bl-md border border-[#e9edef] px-3 md:px-4 py-2 md:py-3 shadow-sm">
                <div className="flex items-center space-x-2 md:space-x-3">
                  <div className="flex space-x-1">
                    <div className="w-1.5 h-1.5 md:w-2 md:h-2 bg-[#8696a0] rounded-full animate-bounce"></div>
                    <div className="w-1.5 h-1.5 md:w-2 md:h-2 bg-[#8696a0] rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-1.5 h-1.5 md:w-2 md:h-2 bg-[#8696a0] rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                  <span className="text-xs text-[#667781]">typing...</span>
                </div>
              </div>
            </div>
          </div>
        ))}

        <div ref={messagesEndRef} className="h-2 md:h-4" />
      </div>

      {/* WhatsApp Background Pattern */}
      <style jsx>{`
        .bg-chat-pattern {
          background-image: url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z' fill='%23f0f0f0' fill-opacity='0.4' fill-rule='evenodd'/%3E%3C/svg%3E");
        }
      `}</style>
    </div>
  )
}

export default MessageList