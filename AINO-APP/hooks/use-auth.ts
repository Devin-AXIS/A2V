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
  countryCode: string
  code: string
  password: string
  confirmPassword: string
  agreeTerms: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// 本地存储键名
const STORAGE_KEYS = {
  USER: 'aino_user',
  AUTH_TOKEN: 'aino_auth_token'
}

// 模拟用户数据
const MOCK_USERS = [
  {
    id: '1',
    phone: '13800138000',
    name: 'iPollo 用户',
    avatar: '/generic-user-avatar.png',
    points: 2323,
    followers: 22,
    following: 334,
    posts: 3434,
    createdAt: new Date().toISOString()
  },
  {
    id: '2',
    phone: '13900139000',
    name: '测试用户',
    avatar: '/generic-user-avatar.png',
    points: 1500,
    followers: 15,
    following: 200,
    posts: 100,
    createdAt: new Date().toISOString()
  }
]

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

  const login = async (phone: string, password?: string, code?: string): Promise<boolean> => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true }))
      
      // 模拟API调用延迟
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // 模拟登录验证
      let user: User | undefined
      
      if (password) {
        // 密码登录 - 查找匹配的用户
        user = MOCK_USERS.find(u => u.phone === phone)
        if (!user) {
          throw new Error('用户不存在')
        }
      } else if (code) {
        // 验证码登录 - 查找匹配的用户或创建新用户
        user = MOCK_USERS.find(u => u.phone === phone)
        if (!user) {
          // 创建新用户
          user = {
            id: Date.now().toString(),
            phone,
            name: `用户${phone.slice(-4)}`,
            avatar: '/generic-user-avatar.png',
            points: 100,
            followers: 0,
            following: 0,
            posts: 0,
            createdAt: new Date().toISOString()
          }
          MOCK_USERS.push(user)
        }
      } else {
        throw new Error('请提供密码或验证码')
      }

      // 生成模拟token
      const token = `mock_token_${Date.now()}`
      
      // 保存到本地存储
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user))
      localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token)
      
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
      
      // 模拟API调用延迟
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      // 检查用户是否已存在
      const existingUser = MOCK_USERS.find(u => u.phone === data.phone)
      if (existingUser) {
        throw new Error('该手机号已注册')
      }
      
      // 创建新用户
      const newUser: User = {
        id: Date.now().toString(),
        phone: data.phone,
        name: `用户${data.phone.slice(-4)}`,
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
      
      // 保存到本地存储
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(newUser))
      localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token)
      
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
    localStorage.removeItem(STORAGE_KEYS.USER)
    localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN)
    
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
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(updatedUser))
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
