import React from 'react'

const ChatHeader = ({ conversation }) => {
  if (!conversation) {
    return (
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Select a conversation</h2>
            <p className="text-sm text-gray-500">Choose someone to chat with</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="relative">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-semibold ${
              conversation.isAI 
                ? 'bg-gradient-to-r from-purple-500 to-pink-500' 
                : 'bg-blue-500'
            }`}>
              {conversation.isAI ? '🤖' : conversation.user?.username?.charAt(0).toUpperCase()}
            </div>
            {conversation.isOnline && (
              <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
            )}
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900 flex items-center">
              {conversation.isAI ? conversation.username : conversation.user?.username}
              {conversation.isAI && (
                <span className="ml-2 text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded-full">
                  AI Assistant
                </span>
              )}
            </h2>
            <p className="text-sm text-gray-500">
              {conversation.isAI 
                ? 'Always online • Ready to help!' 
                : (conversation.user?.isOnline ? 'Online' : 'Offline')
              }
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {!conversation.isAI && (
            <>
              <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
              </button>
              <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default ChatHeader