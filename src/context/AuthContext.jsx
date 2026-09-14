import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import * as authApi from '../api/auth'
import { getStoredTokens, clearTokens } from '../api/client'

const USER_KEY = 'ivyhomes_user'
const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [initializing, setInitializing] = useState(true)
  const [authError, setAuthError] = useState(null)

  useEffect(() => {
    const tokens = getStoredTokens()
    const rawUser = localStorage.getItem(USER_KEY)
    if (tokens?.refresh_token && rawUser) {
      try {
        setUser(JSON.parse(rawUser))
      } catch {
        clearTokens()
      }
    }
    setInitializing(false)
  }, [])

  useEffect(() => {
    function handleExpired() {
      setUser(null)
      localStorage.removeItem(USER_KEY)
      setAuthError('Your session ended. Sign in again to continue.')
    }
    window.addEventListener('ivyhomes:session-expired', handleExpired)
    return () => window.removeEventListener('ivyhomes:session-expired', handleExpired)
  }, [])

  const login = useCallback(async (email, password) => {
    setAuthError(null)
    const { user: loggedInUser } = await authApi.login(email, password)
    localStorage.setItem(USER_KEY, JSON.stringify(loggedInUser))
    setUser(loggedInUser)
    return loggedInUser
  }, [])

  const logout = useCallback(async () => {
    await authApi.logout()
    localStorage.removeItem(USER_KEY)
    setUser(null)
  }, [])

  const value = {
    user,
    isAuthenticated: Boolean(user),
    initializing,
    authError,
    clearAuthError: () => setAuthError(null),
    login,
    logout
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
