import React, { createContext, useContext, useState, useEffect } from 'react'
import * as SecureStore from 'expo-secure-store'
import api from '../api/client'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    initAuth()
  }, [])

  async function initAuth() {
    try {
      const token = await SecureStore.getItemAsync('access_token')
      if (token) {
        const res = await api.get('/api/auth/me/')
        setUser(res.data)
        await SecureStore.setItemAsync('user', JSON.stringify(res.data))
      }
    } catch {
      await clearTokens()
    } finally {
      setLoading(false)
    }
  }

  async function clearTokens() {
    await SecureStore.deleteItemAsync('access_token')
    await SecureStore.deleteItemAsync('refresh_token')
    await SecureStore.deleteItemAsync('user')
  }

  async function login(tokens, userData) {
    await SecureStore.setItemAsync('access_token', tokens.access)
    await SecureStore.setItemAsync('refresh_token', tokens.refresh)
    await SecureStore.setItemAsync('user', JSON.stringify(userData))
    setUser(userData)
  }

  async function logout() {
    await clearTokens()
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, loading, isAdmin: user?.is_admin }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
