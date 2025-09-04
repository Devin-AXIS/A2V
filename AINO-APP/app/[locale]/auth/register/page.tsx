"use client"

import React, { useEffect } from 'react'
import { MobileRegister } from '@/components/auth/mobile-register'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/use-auth'

export default function RegisterPage() {
  const router = useRouter()
  const { register, isAuthenticated, isLoading } = useAuth()

  // 如果已经登录，重定向到个人中心
  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      router.push('/profile')
    }
  }, [isAuthenticated, isLoading, router])

  const handleRegister = async (data: any) => {
    console.log('注册数据:', data)
    
    const success = await register(data)
    
    if (success) {
      // 注册成功，自动登录并跳转到个人中心
      router.push('/profile')
    } else {
      // 注册失败，显示错误提示
      alert('注册失败，请检查信息或稍后重试')
    }
  }

  const handleLogin = () => {
    router.push('/auth/login')
  }

  // 如果正在加载或已登录，显示加载状态
  if (isLoading || isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">加载中...</p>
        </div>
      </div>
    )
  }

  return (
    <MobileRegister
      onRegister={handleRegister}
      onLogin={handleLogin}
    />
  )
}
