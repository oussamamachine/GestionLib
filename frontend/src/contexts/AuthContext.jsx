import React, { createContext, useContext, useEffect, useState } from 'react'
import api from '../services/api'
import { useNavigate } from 'react-router-dom'

// Auth context provides login, logout and current user info to the app
const AuthContext = createContext(null)

export function useAuth() {
  return useContext(AuthContext)
}

export function AuthProvider({ children }) {
  const navigate = useNavigate()
  const [user, setUser] = useState(() => {
    // read user info from localStorage if available
    try {
      const raw = localStorage.getItem('user')
      return raw ? JSON.parse(raw) : null
    } catch (err) {
      console.error('Error loading user from localStorage:', err)
      return null
    }
  })

  // login: call backend, JWT stored in HttpOnly cookie by server
  async function login(username, password) {
    const res = await api.post('/auth/login', { username, password })
    const { expiresAt, username: uname, role, email } = res.data
    // No need to store token - it's in HttpOnly cookie
    const userObj = { username: uname, role, expiresAt, email }
    localStorage.setItem('user', JSON.stringify(userObj))
    setUser(userObj)

    // redirect based on role
    if (role === 'Admin') navigate('/admin')
    else if (role === 'Librarian') navigate('/librarian')
    else navigate('/member')
  }

  // register: members can self-register using /auth/register
  async function register({ username, email, password }) {
    // default role for self-registration is Member
    await api.post('/auth/register', { username, email, password, role: 'Member' })
  }

  function logout() {
    // Call backend to clear HttpOnly cookies
    api.post('/auth/logout').catch(() => {});
    // Clear local user info
    localStorage.removeItem('user')
    setUser(null)
    navigate('/login')
  }

  // Check token expiration periodically (every 5 minutes)
  useEffect(() => {
    if (!user || !user.expiresAt) return
    
    const checkExpiration = () => {
      const expiryDate = new Date(user.expiresAt)
      const now = new Date()
      const timeUntilExpiry = expiryDate.getTime() - now.getTime()

      // Only logout if token is actually expired (with 30 second buffer)
      if (timeUntilExpiry < -30000) {
        logout()
      }
    }
    
    // Check immediately (but after a small delay to avoid race conditions)
    const initialCheck = setTimeout(checkExpiration, 2000)
    
    // Then check every 5 minutes
    const interval = setInterval(checkExpiration, 5 * 60 * 1000)
    
    return () => {
      clearTimeout(initialCheck)
      clearInterval(interval)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user])

  const value = { user, login, logout, register }
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
