import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

console.log('🔗 API URL:', API_URL) // Debug log

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
})

// Add request logging
api.interceptors.request.use(
  (config) => {
    console.log(`🚀 ${config.method?.toUpperCase()} ${config.url}`, config.data)
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    console.error('❌ Request error:', error)
    return Promise.reject(error)
  }
)

// Add response logging
api.interceptors.response.use(
  (response) => {
    console.log(`✅ ${response.status} ${response.config.url}:`, response.data)
    return response
  },
  (error) => {
    console.error('❌ Response error:', error.response?.data || error.message)
    
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      window.location.href = '/login'
    }
    
    // Handle network errors
    if (!error.response) {
      console.error('🌐 Network error - Backend might be down')
    }
    
    return Promise.reject(error)
  }
)

// Auth API
export const authAPI = {
  register: (userData) => api.post('/auth/register', userData),
  login: (credentials) => api.post('/auth/login', credentials),
  getMe: () => api.get('/auth/me'),
  logout: () => api.post('/auth/logout'),
}

// // Messages API
// export const messageAPI = {
//   sendMessage: (messageData) => api.post('/messages/send', messageData),
//   getConversation: (userId, page = 1, limit = 50) => 
//     api.get(`/messages/conversation/${userId}?page=${page}&limit=${limit}`),
//   getConversations: () => api.get('/messages/conversations'),
//   markAsRead: (data) => api.put('/messages/read', data),
//   deleteMessage: (messageId) => api.delete(`/messages/${messageId}`),
// }

// Users API
export const userAPI = {
  getUsers: () => api.get('/users'),
  getUser: (userId) => api.get(`/users/${userId}`),
}

// Add these to your existing messageAPI object in services/api.js
export const messageAPI = {
  sendMessage: (messageData) => api.post('/messages/send', messageData),
  getConversation: (userId, page = 1, limit = 50) => 
    api.get(`/messages/conversation/${userId}?page=${page}&limit=${limit}`),
  getConversations: () => api.get('/messages/conversations'),
  markAsRead: (data) => api.put('/messages/read', data),
  deleteMessage: (messageId) => api.delete(`/messages/${messageId}`),
  
  // Add these new methods:
  getUsers: () => api.get('/users'), // Get all users for chat
  getUserProfile: (userId) => api.get(`/users/${userId}`),
}

// Add upload API
export const uploadAPI = {
  uploadImage: (formData) => api.post('/upload/image', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  }),
  deleteImage: (publicId) => api.delete(`/upload/image/${publicId}`),
};

// Add AI API calls
export const aiAPI = {
  sendToGrok: (messageData) => api.post('/ai/grok', messageData),
  getGrokConversation: (page = 1, limit = 50) => 
    api.get(`/ai/grok/conversation?page=${page}&limit=${limit}`),
};

export default api