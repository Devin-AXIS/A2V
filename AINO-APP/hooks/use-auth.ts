"use client"

import React, { useState, useEffect, createContext, useContext, ReactNode } from 'react'

export interface User {
  id: string
  phone: string
  name: string
  avatar?: string
  points: number
  followers: number
  following: number
  posts: number
  createdAt: string
}

export interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
}

interface AuthContextType extends AuthState {
  login: (phone: string, password?: string, code?: string) => Promise<boolean>
  register: (data: RegisterData) => Promise<boolean>
  logout: () => void
  updateUser: (userData: Partial<User>) => void
}

export interface RegisterData {
  phone: string
  password: string
  confirmPassword: string
  name: string
  agreeTerms: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// 本地存储键名
const STORAGE_KEYS = {
  USER: 'aino_user',
  AUTH_TOKEN: 'aino_auth_token',
  APP_ID: 'CURRENT_APP_ID'
}

// 模拟用户数据
const MOCK_USERS = []

export function AuthProvider({ children }: { children: ReactNode }) {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true
  })

  // 初始化时从本地存储恢复用户状态
  useEffect(() => {
    const initializeAuth = () => {
      try {
        // 确保在客户端环境中才访问 localStorage
        if (typeof window === 'undefined') {
          setAuthState({
            user: null,
            isAuthenticated: false,
            isLoading: false
          })
          return
        }

        const storedUser = localStorage.getItem(STORAGE_KEYS.USER)
        const storedToken = localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN)

        if (storedUser && storedToken) {
          const user = JSON.parse(storedUser)
          setAuthState({
            user,
            isAuthenticated: true,
            isLoading: false
          })
        } else {
          setAuthState({
            user: null,
            isAuthenticated: false,
            isLoading: false
          })
        }
      } catch (error) {
        console.error('初始化认证状态失败:', error)
        setAuthState({
          user: null,
          isAuthenticated: false,
          isLoading: false
        })
      }
    }

    initializeAuth()
  }, [])

  const login = async (data: any): Promise<boolean> => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true }))

      // 模拟API调用延迟
      await new Promise(resolve => setTimeout(resolve, 1000))

      // 模拟登录验证
      let user: User | undefined

      const grades = {};
      Object.keys(data).forEach(key => {
        if (key.indexOf('followers') > -1) {
          grades.followers = data[key];
        }
        if (key.indexOf('following') > -1) {
          grades.following = data[key];
        }
        if (key.indexOf('posts') > -1) {
          grades.posts = data[key];
        }
        if (key.indexOf('points') > -1) {
          grades.points = data[key];
        }
      })

      console.log(grades)

      user = {
        id: Date.now().toString(),
        phone: data.phone,
        name: data.name,
        avatar: data.avatar,
        points: grades.points || 0,
        followers: grades.followers || 0,
        following: grades.following || 0,
        posts: grades.posts || 0,
        createdAt: new Date().toISOString(),
        extends: { ...data },
      }
      MOCK_USERS.push(user)
      console.log(user, 23232323)

      // 生成模拟token
      const token = user?.extends?.token//`mock_token_${Date.now()}`
      delete user?.extends?.token;

      // 保存到本地存储（绑定到当前 appId 以便多租户区分）
      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user))
        localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token)
        const appId = localStorage.getItem(STORAGE_KEYS.APP_ID)
        if (appId) {
          localStorage.setItem(`${STORAGE_KEYS.USER}:${appId}`, JSON.stringify(user))
          localStorage.setItem(`${STORAGE_KEYS.AUTH_TOKEN}:${appId}`, token)
        }
      }

      setAuthState({
        user,
        isAuthenticated: true,
        isLoading: false
      })

      return true
    } catch (error) {
      console.error('登录失败:', error)
      setAuthState(prev => ({ ...prev, isLoading: false }))
      return false
    }
  }

  const register = async (data: RegisterData): Promise<boolean> => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true }))

      // 检查用户是否已存在
      const existingUser = MOCK_USERS.find(u => u.phone === data.phone)
      if (existingUser) {
        throw new Error('该手机号已注册')
      }

      // 创建新用户
      const newUser: User = {
        id: Date.now().toString(),
        phone: data.phone,
        name: data.name || `用户${data.phone.slice(-4)}`,
        avatar: '/generic-user-avatar.png',
        points: 100, // 新用户赠送100积分
        followers: 0,
        following: 0,
        posts: 0,
        createdAt: new Date().toISOString()
      }

      MOCK_USERS.push(newUser)

      // 生成模拟token
      const token = `mock_token_${Date.now()}`

      // 保存到本地存储（绑定到当前 appId）
      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(newUser))
        localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token)
        const appId = localStorage.getItem(STORAGE_KEYS.APP_ID)
        if (appId) {
          localStorage.setItem(`${STORAGE_KEYS.USER}:${appId}`, JSON.stringify(newUser))
          localStorage.setItem(`${STORAGE_KEYS.AUTH_TOKEN}:${appId}`, token)
        }
      }

      setAuthState({
        user: newUser,
        isAuthenticated: true,
        isLoading: false
      })

      return true
    } catch (error) {
      console.error('注册失败:', error)
      setAuthState(prev => ({ ...prev, isLoading: false }))
      return false
    }
  }

  const logout = () => {
    // 清除本地存储
    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_KEYS.USER)
      localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN)
    }

    setAuthState({
      user: null,
      isAuthenticated: false,
      isLoading: false
    })
  }

  const updateUser = (userData: Partial<User>) => {
    if (authState.user) {
      const updatedUser = { ...authState.user, ...userData }
      setAuthState(prev => ({ ...prev, user: updatedUser }))

      // 更新本地存储
      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(updatedUser))
      }
    }
  }

  const value: AuthContextType = {
    ...authState,
    login,
    register,
    logout,
    updateUser
  }

  return React.createElement(
    AuthContext.Provider,
    { value },
    children
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
