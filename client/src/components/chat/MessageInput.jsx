import React, { useState, useRef, useEffect } from 'react';
import { useSocket } from '../../contexts/SocketContext';
import ImageUpload from './ImageUpload';

const MessageInput = ({ onSendMessage, receiverId }) => {
  const [message, setMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showImageUpload, setShowImageUpload] = useState(false);
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
  
  // Send image message - CORRECTED: Use 'image' type and pass image data
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
      <div className="bg-white border-t border-gray-200 p-4">
        <div className="flex items-center space-x-3">
          {/* Image Upload Button - Always visible but disabled when no receiver */}
          <button
            type="button"
            onClick={() => setShowImageUpload(true)}
            disabled={!receiverId}
            className="flex-shrink-0 p-3 rounded-full transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed bg-blue-100 hover:bg-blue-200 text-blue-600 border border-blue-200"
            title="Upload image"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </button>

          {/* Message Input */}
          <div className="flex-1">
            <input
              type="text"
              value={message}
              onChange={handleInputChange}
              onKeyPress={handleKeyPress}
              placeholder={receiverId ? "Type a message..." : "Select a user to start chatting"}
              className="w-full px-4 py-3 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 disabled:bg-gray-100 disabled:cursor-not-allowed"
              disabled={!receiverId}
            />
          </div>

          {/* Send Button */}
          <button
            type="submit"
            onClick={handleSubmit}
            disabled={(!message.trim() && !showImageUpload) || !receiverId}
            className="flex-shrink-0 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white p-3 rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            title="Send message"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </div>

        {/* Helper text when no receiver selected */}
        {!receiverId && (
          <div className="mt-2 text-center">
            <p className="text-xs text-gray-500">
              Select a user from the sidebar to start chatting and upload images
            </p>
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