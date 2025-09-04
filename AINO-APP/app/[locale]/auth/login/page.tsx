"use client"

import React, { useEffect } from 'react'
import { MobileLogin } from '@/components/auth/mobile-login'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/use-auth'

export default function LoginPage() {
  const router = useRouter()
  const { login, isAuthenticated, isLoading } = useAuth()

  // 如果已经登录，重定向到个人中心
  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      router.push('/profile')
    }
  }, [isAuthenticated, isLoading, router])

  const handleLogin = async (data: any) => {
    console.log('登录数据:', data)
    
    const success = await login(data.phone, data.password, data.code)
    
    if (success) {
      // 登录成功，跳转到个人中心
      router.push('/profile')
    } else {
      // 登录失败，可以显示错误提示
      alert('登录失败，请检查手机号或验证码')
    }
  }

  const handleRegister = () => {
    router.push('/auth/register')
  }

  const handleForgotPassword = () => {
    // 这里可以跳转到忘记密码页面
    console.log('忘记密码')
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
    <MobileLogin
      onLogin={handleLogin}
      onRegister={handleRegister}
      onForgotPassword={handleForgotPassword}
    />
  )
}
