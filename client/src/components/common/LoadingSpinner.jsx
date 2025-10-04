import React from 'react'

const LoadingSpinner = ({ size = 'md', text = 'Loading...', overlay = false }) => {
  const sizeClasses = {
    sm: 'h-6 w-6',
    md: 'h-12 w-12',
    lg: 'h-16 w-16',
    xl: 'h-20 w-20'
  }

  const textSizes = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
    xl: 'text-xl'
  }

  const spinnerContent = (
    <div className="flex flex-col items-center space-y-4">
      {/* Animated Spinner */}
      <div className="relative">
        <div className={`animate-spin rounded-full border-4 border-[#e9edef] ${sizeClasses[size]}`}></div>
        <div className={`absolute top-0 left-0 animate-spin rounded-full border-4 border-transparent border-t-[#00a884] ${sizeClasses[size]}`}></div>
        
        {/* Pulsing dot in center for larger spinners */}
        {(size === 'lg' || size === 'xl') && (
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <div className="w-2 h-2 bg-[#00a884] rounded-full animate-pulse"></div>
          </div>
        )}
      </div>

      {/* Loading Text */}
      {text && (
        <div className="text-center">
          <p className={`text-[#667781] font-medium ${textSizes[size]} mb-2`}>
            {text}
          </p>
          
          {/* Animated dots */}
          <div className="flex justify-center space-x-1">
            <div className="w-1.5 h-1.5 bg-[#00a884] rounded-full animate-bounce"></div>
            <div className="w-1.5 h-1.5 bg-[#00a884] rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
            <div className="w-1.5 h-1.5 bg-[#00a884] rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
          </div>
        </div>
      )}
    </div>
  )

  if (overlay) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-2xl p-8 mx-4 border border-[#e9edef]">
          {spinnerContent}
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#f8f9fa] flex items-center justify-center">
      <div className="bg-white rounded-2xl shadow-lg p-8 border border-[#e9edef]">
        {spinnerContent}
      </div>
    </div>
  )
}

// Compact spinner for inline loading
export const InlineSpinner = ({ size = 'sm', text = 'Loading...' }) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6'
  }

  return (
    <div className="flex items-center space-x-2">
      <div className="relative">
        <div className={`animate-spin rounded-full border-2 border-[#e9edef] ${sizeClasses[size]}`}></div>
        <div className={`absolute top-0 left-0 animate-spin rounded-full border-2 border-transparent border-t-[#00a884] ${sizeClasses[size]}`}></div>
      </div>
      {text && (
        <span className="text-[#667781] text-sm font-medium">{text}</span>
      )}
    </div>
  )
}

// Message typing indicator (like WhatsApp)
export const TypingIndicator = ({ users = [] }) => {
  if (users.length === 0) return null

  return (
    <div className="flex justify-start mb-4">
      <div className="max-w-xs bg-white rounded-2xl rounded-bl-md border border-[#e9edef] px-4 py-3 shadow-sm">
        <div className="flex items-center space-x-3">
          <div className="flex space-x-1">
            <div className="w-2 h-2 bg-[#8696a0] rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-[#8696a0] rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
            <div className="w-2 h-2 bg-[#8696a0] rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
          </div>
          <div className="text-xs text-[#667781]">
            {users.length === 1 
              ? `${users[0].username} is typing...`
              : `${users.length} people typing...`
            }
          </div>
        </div>
      </div>
    </div>
  )
}

// Page loading spinner with branding
export const PageLoader = ({ message = 'AdiChat is loading...' }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#00a884] to-[#128c7e] flex items-center justify-center p-4">
      <div className="text-center">
        {/* Logo/Brand */}
        <div className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-2xl">
          <span className="text-[#00a884] font-bold text-2xl">AC</span>
        </div>
        
        {/* Animated Spinner */}
        <div className="relative mb-6">
          <div className="w-16 h-16 border-4 border-white/30 rounded-full animate-spin mx-auto"></div>
          <div className="w-16 h-16 border-4 border-transparent border-t-white rounded-full animate-spin absolute top-0 left-1/2 transform -translate-x-1/2"></div>
        </div>

        {/* Loading Text */}
        <h3 className="text-white text-xl font-semibold mb-2">{message}</h3>
        <p className="text-white/80 text-sm">Preparing your messaging experience</p>

        {/* Progress Dots */}
        <div className="flex justify-center space-x-1 mt-4">
          <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
          <div className="w-2 h-2 bg-white rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
          <div className="w-2 h-2 bg-white rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
        </div>
      </div>
    </div>
  )
}

// Skeleton loading for messages
export const MessageSkeleton = ({ count = 3 }) => {
  return (
    <div className="space-y-4 p-4">
      {Array.from({ length: count }, (_, index) => (
        <div
          key={index}
          className={`flex ${index % 2 === 0 ? 'justify-start' : 'justify-end'} animate-pulse`}
        >
          <div className={`max-w-xs rounded-2xl px-4 py-3 ${
            index % 2 === 0 
              ? 'bg-white border border-[#e9edef] rounded-bl-md' 
              : 'bg-[#d9fdd3] rounded-br-md'
          }`}>
            <div className="space-y-2">
              <div className="h-3 bg-[#e9edef] rounded w-3/4"></div>
              <div className="h-3 bg-[#e9edef] rounded w-1/2"></div>
              <div className="h-2 bg-[#e9edef] rounded w-1/4 mt-2"></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

export default LoadingSpinner