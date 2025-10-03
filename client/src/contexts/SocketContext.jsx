 import React, { createContext, useContext, useEffect, useState } from 'react'
import io from 'socket.io-client'
import { useAuth } from './AuthContext'

const SocketContext = createContext()

export const useSocket = () => {
  const context = useContext(SocketContext)
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider')
  }
  return context
}

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null)
  const [isConnected, setIsConnected] = useState(false)
  const { user, isAuthenticated } = useAuth()

  useEffect(() => {
    if (isAuthenticated && user) {
      const token = localStorage.getItem('token')
      
      console.log('🔌 Connecting to socket...')
      const newSocket = io(import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000', {
        auth: {
          token: token
        }
      })

      newSocket.on('connect', () => {
        console.log('✅ Connected to server')
        setIsConnected(true)
      })

      newSocket.on('disconnect', () => {
        console.log('❌ Disconnected from server')
        setIsConnected(false)
      })

      newSocket.on('connect_error', (error) => {
        console.error('🔥 Connection error:', error.message)
        setIsConnected(false)
      })

      setSocket(newSocket)

      return () => {
        console.log('🔌 Cleaning up socket connection')
        newSocket.close()
      }
    } else {
      if (socket) {
        socket.close()
        setSocket(null)
        setIsConnected(false)
      }
    }
  }, [isAuthenticated, user])

  const value = {
    socket,
    isConnected,
  }

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  )
}