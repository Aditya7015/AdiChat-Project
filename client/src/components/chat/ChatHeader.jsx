import React from 'react'

const ChatHeader = ({ conversation, onMenuClick, isMobile }) => {
  if (!conversation) {
    return (
      <div className="bg-[#f0f2f5] border-b border-[#e9edef] px-4 md:px-6 py-4 md:py-5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg md:text-xl font-semibold text-[#111b21]">Select a chat</h2>
            <p className="text-sm text-[#667781] mt-1">Choose a conversation to start messaging</p>
          </div>
          <div className="w-8 h-8 md:w-10 md:h-10 bg-[#e9edef] rounded-full flex items-center justify-center">
            <svg className="w-4 h-4 md:w-5 md:h-5 text-[#54656f]" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
            </svg>
          </div>
        </div>
      </div>
    )
  }

  const getStatusText = () => {
    if (conversation.isAI) {
      return isMobile ? 'AI Assistant • Online' : 'Always available • AI Assistant'
    }
    return conversation.user?.isOnline 
      ? (isMobile ? 'Online' : 'Online • Active now')
      : (isMobile ? 'Offline' : 'Offline • Last seen recently')
  }

  const getStatusColor = () => {
    if (conversation.isAI) return 'text-[#00a884]'
    return conversation.user?.isOnline ? 'text-[#00a884]' : 'text-[#667781]'
  }

  return (
    <div className="bg-[#f0f2f5] border-b border-[#e9edef] px-4 md:px-6 py-3 md:py-4">
      <div className="flex items-center justify-between">
        {/* Left Section - User Info */}
        <div className="flex items-center space-x-3 md:space-x-4">
          {/* Mobile menu button */}
          {isMobile && (
            <button
              onClick={onMenuClick}
              className="w-8 h-8 rounded-full hover:bg-[#e9edef] flex items-center justify-center transition-colors duration-200 mr-1"
            >
              <svg className="w-5 h-5 text-[#54656f]" fill="currentColor" viewBox="0 0 24 24">
                <path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z"/>
              </svg>
            </button>
          )}
          
          <div className="relative">
            <div className={`w-10 h-10 md:w-14 md:h-14 rounded-full flex items-center justify-center text-white font-bold shadow-lg ${
              conversation.isAI 
                ? 'bg-gradient-to-br from-[#00a884] to-[#128c7e]' 
                : 'bg-gradient-to-br from-[#6a45ff] to-[#8946ef]'
            }`}>
              {conversation.isAI ? '🤖' : conversation.user?.username?.charAt(0).toUpperCase()}
            </div>
            {conversation.isOnline && (
              <div className="absolute bottom-0 right-0 w-2 h-2 md:w-4 md:h-4 bg-[#00a884] border-[2px] md:border-[3px] border-white rounded-full shadow-sm"></div>
            )}
          </div>
          
          <div className="flex-1">
            <div className="flex items-center space-x-2 md:space-x-3 mb-1">
              <h2 className="text-base md:text-lg font-semibold text-[#111b21]">
                {conversation.isAI ? conversation.username : conversation.user?.username}
              </h2>
              {conversation.isAI && (
                <span className="bg-[#00a884] text-white text-xs font-medium px-2 py-1 rounded-full flex items-center space-x-1">
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                  </svg>
                  <span className="hidden sm:inline">AI</span>
                </span>
              )}
            </div>
            <p className={`text-sm font-medium ${getStatusColor()} flex items-center space-x-1`}>
              <span className={`w-1.5 h-1.5 md:w-2 md:h-2 rounded-full ${conversation.isOnline || conversation.isAI ? 'bg-[#00a884]' : 'bg-[#667781]'}`}></span>
              <span>{getStatusText()}</span>
            </p>
          </div>
        </div>

        {/* Right Section - Action Buttons */}
        <div className="flex items-center space-x-1">
          {/* Video Call Button */}
          {!conversation.isAI && (
            <button className="w-8 h-8 md:w-10 md:h-10 hover:bg-[#e9edef] rounded-full flex items-center justify-center transition-colors duration-200 group relative">
              <svg className="w-4 h-4 md:w-5 md:h-5 text-[#54656f] group-hover:text-[#00a884]" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z"/>
              </svg>
              <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-[#111b21] text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap hidden md:block">
                Video call
              </div>
            </button>
          )}

          {/* Voice Call Button */}
          {!conversation.isAI && (
            <button className="w-8 h-8 md:w-10 md:h-10 hover:bg-[#e9edef] rounded-full flex items-center justify-center transition-colors duration-200 group relative">
              <svg className="w-4 h-4 md:w-5 md:h-5 text-[#54656f] group-hover:text-[#00a884]" fill="currentColor" viewBox="0 0 24 24">
                <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/>
              </svg>
              <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-[#111b21] text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap hidden md:block">
                Voice call
              </div>
            </button>
          )}

          {/* Search Button */}
          <button className="w-8 h-8 md:w-10 md:h-10 hover:bg-[#e9edef] rounded-full flex items-center justify-center transition-colors duration-200 group relative">
            <svg className="w-4 h-4 md:w-5 md:h-5 text-[#54656f] group-hover:text-[#00a884]" fill="currentColor" viewBox="0 0 24 24">
              <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
            </svg>
            <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-[#111b21] text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap hidden md:block">
              Search
            </div>
          </button>

          {/* Menu Button */}
          <button className="w-8 h-8 md:w-10 md:h-10 hover:bg-[#e9edef] rounded-full flex items-center justify-center transition-colors duration-200 group relative">
            <svg className="w-4 h-4 md:w-5 md:h-5 text-[#54656f] group-hover:text-[#00a884]" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/>
            </svg>
            <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-[#111b21] text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap hidden md:block">
              Menu
            </div>
          </button>
        </div>
      </div>

      {/* AI Assistant Features - Hidden on mobile to save space */}
      {conversation.isAI && !isMobile && (
        <div className="mt-3 md:mt-4 pt-3 md:pt-4 border-t border-[#e9edef]">
          <div className="flex items-center space-x-2 md:space-x-4 overflow-x-auto pb-1 md:pb-2">
            <div className="flex items-center space-x-2 bg-white px-2 md:px-3 py-1 md:py-2 rounded-full border border-[#e9edef] shadow-sm flex-shrink-0">
              <div className="w-5 h-5 md:w-6 md:h-6 bg-[#00a884] rounded-full flex items-center justify-center">
                <svg className="w-2 h-2 md:w-3 md:h-3 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                </svg>
              </div>
              <span className="text-xs md:text-sm font-medium text-[#111b21]">Quick replies</span>
            </div>
            
            <div className="flex items-center space-x-2 bg-white px-2 md:px-3 py-1 md:py-2 rounded-full border border-[#e9edef] shadow-sm flex-shrink-0">
              <div className="w-5 h-5 md:w-6 md:h-6 bg-[#00a884] rounded-full flex items-center justify-center">
                <svg className="w-2 h-2 md:w-3 md:h-3 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                </svg>
              </div>
              <span className="text-xs md:text-sm font-medium text-[#111b21]">Code help</span>
            </div>
            
            <div className="flex items-center space-x-2 bg-white px-2 md:px-3 py-1 md:py-2 rounded-full border border-[#e9edef] shadow-sm flex-shrink-0">
              <div className="w-5 h-5 md:w-6 md:h-6 bg-[#00a884] rounded-full flex items-center justify-center">
                <svg className="w-2 h-2 md:w-3 md:h-3 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                </svg>
              </div>
              <span className="text-xs md:text-sm font-medium text-[#111b21]">Creative writing</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ChatHeader