import React, { createContext, useState, useContext, useEffect } from 'react'
import { authAPI } from '../services/api'

const AuthContext = createContext()

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem('token')
      console.log('🔐 Checking auth, token exists:', !!token)
      
      if (token) {
        const response = await authAPI.getMe()
        console.log('✅ Auth check successful:', response.data.data.user.username)
        setUser(response.data.data.user)
      }
    } catch (error) {
      console.error('❌ Auth check failed:', error.response?.data?.message || error.message)
      localStorage.removeItem('token')
      setError('Session expired. Please login again.')
    } finally {
      setLoading(false)
    }
  }

  const login = async (email, password) => {
    try {
      setError('')
      console.log('🔐 Attempting login...')
      
      const response = await authAPI.login({ email, password })
      
      const { user, token } = response.data.data
      console.log('✅ Login successful:', user.username)
      
      localStorage.setItem('token', token)
      setUser(user)
      
      return { success: true, user }
    } catch (error) {
      const message = error.response?.data?.message || 'Login failed - check backend connection'
      console.error('❌ Login error:', message)
      setError(message)
      return { success: false, error: message }
    }
  }

  const register = async (userData) => {
    try {
      setError('')
      console.log('👤 Attempting registration...')
      
      const response = await authAPI.register(userData)
      
      const { user, token } = response.data.data
      console.log('✅ Registration successful:', user.username)
      
      localStorage.setItem('token', token)
      setUser(user)
      
      return { success: true, user }
    } catch (error) {
      const message = error.response?.data?.message || 'Registration failed - check backend connection'
      console.error('❌ Registration error:', message)
      setError(message)
      return { success: false, error: message }
    }
  }

  const logout = async () => {
    try {
      console.log('🚪 Logging out...')
      await authAPI.logout()
    } catch (error) {
      console.error('❌ Logout error:', error)
    } finally {
      localStorage.removeItem('token')
      setUser(null)
      setError('')
      console.log('✅ Logout successful')
    }
  }

  const clearError = () => setError('')

  const value = {
    user,
    loading,
    error,
    login,
    register,
    logout,
    clearError,
    isAuthenticated: !!user,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}