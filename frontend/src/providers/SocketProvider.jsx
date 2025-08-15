import React, { createContext, useContext, useEffect, useState } from 'react'
import { io } from 'socket.io-client'
import { useAuth } from './AuthProvider'
import toast from 'react-hot-toast'

const SocketContext = createContext({})

export const useSocket = () => {
  const context = useContext(SocketContext)
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider')
  }
  return context
}

const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null)
  const [connected, setConnected] = useState(false)
  const [connectionError, setConnectionError] = useState(null)
  const { user, isAuthenticated } = useAuth()

  useEffect(() => {
    let socketInstance = null

    if (isAuthenticated && user) {
      // Create socket connection
      socketInstance = io(process.env.NODE_ENV === 'production' 
        ? 'https://your-production-domain.com' 
        : 'http://localhost:5000', {
        auth: {
          token: localStorage.getItem('token')
        },
        transports: ['websocket', 'polling'],
        upgrade: true,
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
        timeout: 20000
      })

      // Connection event handlers
      socketInstance.on('connect', () => {
        console.log('🔗 Socket connected:', socketInstance.id)
        setConnected(true)
        setConnectionError(null)
        
        // Join user-specific room
        socketInstance.emit('join_user_room', user.id)
      })

      socketInstance.on('disconnect', (reason) => {
        console.log('🔌 Socket disconnected:', reason)
        setConnected(false)
        
        if (reason === 'io server disconnect') {
          // Server disconnected the socket, reconnect manually
          socketInstance.connect()
        }
      })

      socketInstance.on('connect_error', (error) => {
        console.error('❌ Socket connection error:', error)
        setConnectionError(error.message)
        setConnected(false)
      })

      socketInstance.on('reconnect', (attemptNumber) => {
        console.log('🔄 Socket reconnected after', attemptNumber, 'attempts')
        setConnected(true)
        setConnectionError(null)
        toast.success('Connection restored')
      })

      socketInstance.on('reconnect_error', (error) => {
        console.error('🔄❌ Socket reconnection error:', error)
        setConnectionError(error.message)
      })

      socketInstance.on('reconnect_failed', () => {
        console.error('🔄❌ Socket reconnection failed')
        setConnectionError('Failed to reconnect')
        toast.error('Connection lost. Please refresh the page.')
      })

      // Application-specific event handlers
      socketInstance.on('application_status_update', (data) => {
        console.log('📊 Application status update:', data)
        toast.success(`Application ${data.status}: ${data.jobTitle}`)
      })

      socketInstance.on('job_alert', (data) => {
        console.log('🔔 New job alert:', data)
        toast.success(`New job alert: ${data.title}`)
      })

      socketInstance.on('system_notification', (data) => {
        console.log('🔔 System notification:', data)
        toast(data.message, { 
          icon: data.type === 'info' ? 'ℹ️' : data.type === 'warning' ? '⚠️' : '📢'
        })
      })

      socketInstance.on('rapid_apply_progress', (data) => {
        console.log('⚡ Rapid apply progress:', data)
        // Handle rapid apply progress updates
      })

      socketInstance.on('error', (error) => {
        console.error('🚨 Socket error:', error)
        toast.error('Real-time connection error')
      })

      setSocket(socketInstance)

      // Cleanup on unmount
      return () => {
        if (socketInstance) {
          console.log('🧹 Cleaning up socket connection')
          socketInstance.disconnect()
          setSocket(null)
          setConnected(false)
        }
      }
    } else {
      // User not authenticated, disconnect socket if exists
      if (socket) {
        socket.disconnect()
        setSocket(null)
        setConnected(false)
      }
    }
  }, [isAuthenticated, user])

  // Emit events helper functions
  const emitEvent = (event, data) => {
    if (socket && connected) {
      socket.emit(event, data)
      return true
    } else {
      console.warn('⚠️ Cannot emit event - socket not connected:', event)
      return false
    }
  }

  const joinRoom = (roomName) => {
    return emitEvent('join_room', { room: roomName })
  }

  const leaveRoom = (roomName) => {
    return emitEvent('leave_room', { room: roomName })
  }

  // Subscribe to specific events
  const subscribe = (event, callback) => {
    if (socket) {
      socket.on(event, callback)
      return () => socket.off(event, callback)
    }
    return () => {}
  }

  const value = {
    socket,
    connected,
    connectionError,
    emitEvent,
    joinRoom,
    leaveRoom,
    subscribe
  }

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  )
}

export default SocketProvider
