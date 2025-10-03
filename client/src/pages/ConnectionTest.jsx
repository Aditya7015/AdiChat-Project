import React, { useState, useEffect } from 'react'
import { authAPI, userAPI } from '../services/api'

const ConnectionTest = () => {
  const [backendStatus, setBackendStatus] = useState('checking')
  const [apiTest, setApiTest] = useState('not tested')
  const [users, setUsers] = useState([])

  const testBackendConnection = async () => {
    try {
      setBackendStatus('checking')
      const response = await fetch('http://localhost:5000/')
      if (response.ok) {
        setBackendStatus('connected')
      } else {
        setBackendStatus('error')
      }
    } catch (error) {
      setBackendStatus('error')
    }
  }

  const testAuthAPI = async () => {
    try {
      setApiTest('testing')
      const response = await authAPI.register({
        username: `testuser_${Date.now()}`,
        email: `test_${Date.now()}@example.com`,
        password: 'password123'
      })
      setApiTest('success')
    } catch (error) {
      setApiTest('failed')
    }
  }

  const loadUsers = async () => {
    try {
      const response = await userAPI.getUsers()
      setUsers(response.data.data.users)
    } catch (error) {
      console.error('Failed to load users:', error)
    }
  }

  useEffect(() => {
    testBackendConnection()
    loadUsers()
  }, [])

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">AdiChat Connection Test</h1>
        
        <div className="space-y-6">
          {/* Backend Status */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold mb-4">Backend Connection</h2>
            <div className="flex items-center justify-between">
              <span>Backend Status:</span>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                backendStatus === 'connected' ? 'bg-green-100 text-green-800' :
                backendStatus === 'error' ? 'bg-red-100 text-red-800' :
                'bg-yellow-100 text-yellow-800'
              }`}>
                {backendStatus === 'connected' ? '✅ Connected' :
                 backendStatus === 'error' ? '❌ Disconnected' :
                 '🔄 Checking...'}
              </span>
            </div>
            <button
              onClick={testBackendConnection}
              className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              Test Again
            </button>
          </div>

          {/* API Test */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold mb-4">API Test</h2>
            <div className="flex items-center justify-between mb-4">
              <span>Auth API:</span>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                apiTest === 'success' ? 'bg-green-100 text-green-800' :
                apiTest === 'failed' ? 'bg-red-100 text-red-800' :
                apiTest === 'testing' ? 'bg-yellow-100 text-yellow-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {apiTest === 'success' ? '✅ Working' :
                 apiTest === 'failed' ? '❌ Failed' :
                 apiTest === 'testing' ? '🔄 Testing...' :
                 'Not tested'}
              </span>
            </div>
            <button
              onClick={testAuthAPI}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              Test Auth API
            </button>
          </div>

          {/* Users List */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold mb-4">Registered Users</h2>
            <div className="space-y-2">
              {users.map(user => (
                <div key={user._id} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                  <span className="font-medium">{user.username}</span>
                  <span className="text-sm text-gray-500">{user.email}</span>
                </div>
              ))}
              {users.length === 0 && (
                <p className="text-gray-500 text-center py-4">No users found</p>
              )}
            </div>
            <button
              onClick={loadUsers}
              className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              Refresh Users
            </button>
          </div>

          {/* Instructions */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
            <h3 className="font-semibold text-yellow-800 mb-2">Troubleshooting Steps:</h3>
            <ol className="list-decimal list-inside space-y-1 text-yellow-700">
              <li>Make sure backend is running on port 5000</li>
              <li>Check if MongoDB is connected</li>
              <li>Verify CORS is configured for localhost:5173</li>
              <li>Check browser console for detailed error messages</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ConnectionTest