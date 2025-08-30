"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { api, type User, type LoginRequest } from "@/lib/api"

interface AuthContextType {
  user: User | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (data: any) => Promise<void>
  logout: () => void
  updateUser: (data: Partial<User>) => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

interface AuthProviderProps {
  children: ReactNode
}

// 获取存储的 token
const getStoredToken = () => {
  if (typeof window === 'undefined') return null
  return localStorage.getItem('aino_token')
}

// 设置 token
const setStoredToken = (token: string) => {
  if (typeof window === 'undefined') return
  localStorage.setItem('aino_token', token)
}

// 移除 token
const removeStoredToken = () => {
  if (typeof window === 'undefined') return
  localStorage.removeItem('aino_token')
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // 检查认证状态
  const checkAuth = async () => {
    console.log("🔍 开始认证检查...")
    try {
      const token = getStoredToken()
      console.log("🔑 Token 状态:", token ? "存在" : "不存在")
      if (token) {
        console.log("🔄 尝试获取用户信息...")
        // 使用新的 API 服务获取用户信息，添加超时处理
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error('API timeout')), 5000)
        )

        const authPromise = api.auth.getCurrentUser()
        const response = await Promise.race([authPromise, timeoutPromise])

        console.log("📡 认证响应:", response)

        if (response.success && response.data) {
          console.log("✅ 用户认证成功:", response.data)
          setUser(response.data)
        } else {
          console.log("❌ Token 无效，清除存储")
          // Token 无效，清除存储
          removeStoredToken()
          localStorage.removeItem('user')
        }
      } else {
        console.log("ℹ️ 无 Token，跳过认证检查")
      }
    } catch (error) {
      console.error("❌ Auth check failed:", error)
      // 清除无效的认证信息
      removeStoredToken()
      localStorage.removeItem('user')
    } finally {
      console.log("🏁 认证检查完成，设置 isLoading = false")
      setIsLoading(false)
    }
  }

  useEffect(() => {
    checkAuth()
  }, [])

  const login = async (email: string, password: string) => {
    setIsLoading(true)
    try {
      console.log("🔐 开始登录...")

      // 使用新的 API 服务进行登录
      const response = await api.auth.login({ email, password })

      console.log("📡 登录响应:", response)

      if (response.success && response.data) {
        const { token, user } = response.data
        setUser(user)
        setStoredToken(token)
        localStorage.setItem('user', JSON.stringify(user))
        console.log("✅ 登录成功")
      } else {
        throw new Error(response.error || response.message || '登录失败')
      }
    } catch (error) {
      console.error('❌ 登录失败:', error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const register = async (data: any) => {
    setIsLoading(true)
    try {
      // 暂时保持原有的注册逻辑，等后端实现
      console.log("📝 注册功能暂时使用原有逻辑")

      // 这里可以后续替换为 api.auth.register(data)
      const response = await fetch('/api/users/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      const result = await response.json()
      if (result.success) {
        setUser(result.user)
        setStoredToken(result.token)
        localStorage.setItem('user', JSON.stringify(result.user))
      } else {
        throw new Error(result.error || '注册失败')
      }
    } catch (error) {
      console.error('❌ 注册失败:', error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const logout = () => {
    setUser(null)
    removeStoredToken()
    localStorage.removeItem('user')
    console.log("👋 用户已登出")
  }

  const updateUser = async (data: Partial<User>) => {
    try {
      // 优先调用后端更新，保持与登录账户一致
      const res = await api.auth.updateCurrentUser({ name: data.name, avatar: data.avatar })
      if (res.success && res.data) {
        setUser(res.data)
        localStorage.setItem('user', JSON.stringify(res.data))
      } else if (user) {
        // 后端不可用时，至少本地更新以不阻断 UI
        const updatedUser = { ...user, ...data }
        setUser(updatedUser)
        localStorage.setItem('user', JSON.stringify(updatedUser))
      }
    } catch {
      if (user) {
        const updatedUser = { ...user, ...data }
        setUser(updatedUser)
        localStorage.setItem('user', JSON.stringify(updatedUser))
      }
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        login,
        register,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}
