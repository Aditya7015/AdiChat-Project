import { useState, useCallback } from 'react';
import { aiAPI } from '../services/api';

export const useAIChat = () => {
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState('');

  const sendToGrok = useCallback(async (message) => {
    setAiLoading(true);
    setAiError('');

    try {
      console.log('🤖 Sending to Grok:', message);
      
      const response = await aiAPI.sendToGrok({
        message
      });

      console.log('✅ Grok response received');
      
      return {
        success: true,
        data: response.data.data
      };
    } catch (error) {
      console.error('❌ Grok AI error:', error);
      setAiError(error.response?.data?.message || 'Failed to get AI response');
      
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to get AI response'
      };
    } finally {
      setAiLoading(false);
    }
  }, []);

  const loadGrokConversation = useCallback(async (page = 1, limit = 50) => {
    try {
      const response = await aiAPI.getGrokConversation(page, limit);
      return {
        success: true,
        data: response.data.data
      };
    } catch (error) {
      console.error('❌ Load Grok conversation error:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to load conversation'
      };
    }
  }, []);

  return {
    sendToGrok,
    loadGrokConversation,
    aiLoading,
    aiError,
    clearError: () => setAiError('')
  };
};