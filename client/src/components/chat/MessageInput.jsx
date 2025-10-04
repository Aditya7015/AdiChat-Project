import React, { useState, useRef, useEffect } from 'react';
import { useSocket } from '../../contexts/SocketContext';
import ImageUpload from './ImageUpload';

const MessageInput = ({ onSendMessage, receiverId }) => {
  const [message, setMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showImageUpload, setShowImageUpload] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const typingTimeoutRef = useRef(null);
  const { socket } = useSocket();

  const handleSubmit = (e) => {
    e.preventDefault();
    if ((message.trim() || showImageUpload) && receiverId) {
      onSendMessage(message.trim(), 'text');
      setMessage('');
      handleTypingStop();
    }
  };

  const handleSendImage = (imageData) => {
    if (!receiverId) {
      console.log('❌ Cannot send image: no receiver selected');
      return;
    }
    
    console.log('🖼️ Sending image message with data:', imageData);
    
    onSendMessage('', 'image', {
      imageUrl: imageData.imageUrl,
      imagePublicId: imageData.publicId,
      imageWidth: imageData.width,
      imageHeight: imageData.height
    });
    
    setShowImageUpload(false);
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    setMessage(value);
    handleTypingIndicator(value);
  };

  const handleTypingIndicator = (value) => {
    if (receiverId) {
      if (value.trim() && !isTyping) {
        handleTypingStart();
      } else if (!value.trim() && isTyping) {
        handleTypingStop();
      }

      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      if (value.trim()) {
        typingTimeoutRef.current = setTimeout(() => {
          handleTypingStop();
        }, 1000);
      }
    }
  };

  const handleTypingStart = () => {
    if (!isTyping && socket && receiverId) {
      setIsTyping(true);
      socket.emit('typing-start', { receiverId });
    }
  };

  const handleTypingStop = () => {
    if (isTyping && socket && receiverId) {
      setIsTyping(false);
      socket.emit('typing-stop', { receiverId });
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      handleTypingStop();
    };
  }, []);

  return (
    <>
      <div className="bg-[#f0f2f5] border-t border-[#e9edef] px-3 md:px-6 py-3 md:py-4">
        {/* Action Buttons Row */}
        <div className="flex items-center justify-between mb-2 md:mb-3">
          <div className="flex items-center space-x-1 md:space-x-2">
            {/* Emoji Button */}
            <button
              type="button"
              disabled={!receiverId}
              className="w-8 h-8 md:w-10 md:h-10 hover:bg-[#e9edef] rounded-full flex items-center justify-center transition-colors duration-200 disabled:opacity-40 disabled:cursor-not-allowed group relative"
              title="Add emoji"
            >
              <svg className="w-4 h-4 md:w-6 md:h-6 text-[#54656f] group-hover:text-[#00a884]" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
              </svg>
            </button>

            {/* Attachment Button */}
            <button
              type="button"
              disabled={!receiverId}
              className="w-8 h-8 md:w-10 md:h-10 hover:bg-[#e9edef] rounded-full flex items-center justify-center transition-colors duration-200 disabled:opacity-40 disabled:cursor-not-allowed group relative"
              title="Attach file"
            >
              <svg className="w-4 h-4 md:w-6 md:h-6 text-[#54656f] group-hover:text-[#00a884]" fill="currentColor" viewBox="0 0 24 24">
                <path d="M16.5 6v11.5c0 2.21-1.79 4-4 4s-4-1.79-4-4V5c0-1.38 1.12-2.5 2.5-2.5s2.5 1.12 2.5 2.5v10.5c0 .55-.45 1-1 1s-1-.45-1-1V6H10v9.5c0 1.38 1.12 2.5 2.5 2.5s2.5-1.12 2.5-2.5V5c0-2.21-1.79-4-4-4S7 2.79 7 5v12.5c0 3.04 2.46 5.5 5.5 5.5s5.5-2.46 5.5-5.5V6h-1.5z"/>
              </svg>
            </button>

            {/* Image Upload Button */}
            <button
              type="button"
              onClick={() => setShowImageUpload(true)}
              disabled={!receiverId}
              className="w-8 h-8 md:w-10 md:h-10 hover:bg-[#e9edef] rounded-full flex items-center justify-center transition-colors duration-200 disabled:opacity-40 disabled:cursor-not-allowed group relative"
              title="Upload image"
            >
              <svg className="w-4 h-4 md:w-6 md:h-6 text-[#54656f] group-hover:text-[#00a884]" fill="currentColor" viewBox="0 0 24 24">
                <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/>
              </svg>
            </button>
          </div>

          {/* Voice Message Button */}
          <button
            type="button"
            disabled={!receiverId}
            className="w-8 h-8 md:w-10 md:h-10 hover:bg-[#e9edef] rounded-full flex items-center justify-center transition-colors duration-200 disabled:opacity-40 disabled:cursor-not-allowed group relative"
            title="Voice message"
          >
            <svg className="w-4 h-4 md:w-6 md:h-6 text-[#54656f] group-hover:text-[#00a884]" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 14c1.66 0 2.99-1.34 2.99-3L15 5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm5.3-3c0 3-2.54 5.1-5.3 5.1S6.7 14 6.7 11H5c0 3.41 2.72 6.23 6 6.72V21h2v-3.28c3.28-.48 6-3.3 6-6.72h-1.7z"/>
            </svg>
          </button>
        </div>

        {/* Input Area */}
        <div className={`flex items-end space-x-2 md:space-x-3 bg-white rounded-2xl px-3 md:px-4 py-2 border transition-all duration-200 ${
          isFocused ? 'border-[#00a884] ring-2 ring-[#00a884]/20' : 'border-[#e9edef]'
        } ${!receiverId ? 'opacity-60' : ''}`}>
          {/* Message Input */}
          <div className="flex-1">
            <textarea
              value={message}
              onChange={handleInputChange}
              onKeyPress={handleKeyPress}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              placeholder={receiverId ? "Type a message" : "Select a chat to start messaging"}
              className="w-full px-1 md:px-2 py-2 md:py-3 border-none focus:outline-none resize-none placeholder-[#8696a0] text-[#111b21] disabled:bg-transparent disabled:cursor-not-allowed max-h-32 text-sm md:text-base"
              disabled={!receiverId}
              rows="1"
              style={{
                minHeight: '20px',
                maxHeight: '80px'
              }}
            />
          </div>

          {/* Send Button */}
          <button
            type="submit"
            onClick={handleSubmit}
            disabled={(!message.trim() && !showImageUpload) || !receiverId}
            className={`flex-shrink-0 p-1.5 md:p-2 rounded-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#00a884] focus:ring-offset-2 ${
              message.trim() 
                ? 'bg-[#00a884] hover:bg-[#008069] text-white transform hover:scale-105' 
                : 'bg-[#e9edef] text-[#8696a0] cursor-not-allowed'
            } disabled:opacity-40 disabled:cursor-not-allowed`}
            title="Send message"
          >
            <svg className="w-4 h-4 md:w-6 md:h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
            </svg>
          </button>
        </div>

        {/* Helper text when no receiver selected */}
        {!receiverId && (
          <div className="mt-2 md:mt-3 text-center">
            <div className="inline-flex items-center space-x-2 bg-[#e9edef] px-3 md:px-4 py-1.5 md:py-2 rounded-full">
              <svg className="w-3 h-3 md:w-4 md:h-4 text-[#8696a0]" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
              </svg>
              <p className="text-xs md:text-sm text-[#667781] font-medium">
                Select a conversation to start messaging
              </p>
            </div>
          </div>
        )}

        {/* Typing Indicator */}
        {isTyping && (
          <div className="mt-1 md:mt-2 flex items-center space-x-1">
            <div className="flex space-x-1">
              <div className="w-1.5 h-1.5 md:w-2 md:h-2 bg-[#00a884] rounded-full animate-bounce"></div>
              <div className="w-1.5 h-1.5 md:w-2 md:h-2 bg-[#00a884] rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
              <div className="w-1.5 h-1.5 md:w-2 md:h-2 bg-[#00a884] rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            </div>
            <span className="text-xs text-[#667781]">typing...</span>
          </div>
        )}
      </div>

      {/* Image Upload Modal */}
      {showImageUpload && (
        <ImageUpload
          onImageUpload={handleSendImage}
          onClose={() => setShowImageUpload(false)}
        />
      )}
    </>
  );
};

export default MessageInput;