import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'

const Register = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  })
  const [isLoading, setIsLoading] = useState(false)
  const [validationError, setValidationError] = useState('')
  
  const { register, error, clearError, isAuthenticated } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    console.log('🔐 Register page - Auth status:', { isAuthenticated })
    if (isAuthenticated) {
      console.log('✅ User already authenticated, redirecting to chat...')
      navigate('/')
    }
  }, [isAuthenticated, navigate])

  useEffect(() => {
    console.log('🔐 Clearing previous errors...')
    clearError()
  }, [clearError])

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
    setValidationError('')
  }

  const validateForm = () => {
    console.log('🔐 Validating form data...')
    
    if (!formData.username || formData.username.length < 3) {
      setValidationError('Username must be at least 3 characters')
      return false
    }
    
    if (!formData.email || !formData.email.includes('@')) {
      setValidationError('Please enter a valid email address')
      return false
    }
    
    if (formData.password.length < 6) {
      setValidationError('Password must be at least 6 characters')
      return false
    }
    
    if (formData.password !== formData.confirmPassword) {
      setValidationError('Passwords do not match')
      return false
    }
    
    return true
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    console.log('🔐 Form submission started...')
    
    if (!validateForm()) {
      console.log('❌ Form validation failed')
      return
    }

    setIsLoading(true)
    console.log('🔐 Attempting registration with:', { 
      username: formData.username, 
      email: formData.email 
    })

    const { confirmPassword, ...registerData } = formData
    const result = await register(registerData)
    
    console.log('🔐 Registration result:', result)
    
    if (result.success) {
      console.log('✅ Registration successful, redirecting...')
      navigate('/')
    } else {
      console.log('❌ Registration failed:', result.error)
    }
    
    setIsLoading(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 bg-blue-600 rounded-full flex items-center justify-center">
            <span className="text-white font-bold text-xl">A</span>
          </div>
          <h2 className="mt-6 text-3xl font-bold text-gray-900">
            Join AdiChat
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Create your account
          </p>
        </div>

        <form className="mt-8 space-y-6 bg-white rounded-xl shadow-sm border border-gray-200 p-8" onSubmit={handleSubmit}>
          {(error || validationError) && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error || validationError}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
                Username
              </label>
              <input
                id="username"
                name="username"
                type="text"
                required
                value={formData.username}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                placeholder="Choose a username (min 3 characters)"
                minLength="3"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                placeholder="Enter your email"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={formData.password}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                placeholder="Create a password (min 6 characters)"
                minLength="6"
              />
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                required
                value={formData.confirmPassword}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                placeholder="Confirm your password"
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 flex justify-center items-center"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                  Creating account...
                </>
              ) : (
                'Create Account'
              )}
            </button>
          </div>

          <div className="text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{' '}
              <Link
                to="/login"
                className="font-medium text-blue-600 hover:text-blue-500 transition-colors"
              >
                Sign in here
              </Link>
            </p>
          </div>

          {/* Debug Info */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
            <p className="text-xs text-gray-600 text-center">
              💡 <strong>Debug Info:</strong> Check browser console for detailed registration process
            </p>
          </div>
        </form>
      </div>
    </div>
  )
}

export default Register