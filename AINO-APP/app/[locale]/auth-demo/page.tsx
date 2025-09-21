"use client"

import React, { useState } from 'react'
import { MobileLogin, MobileRegister } from '@/components/auth'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function AuthDemoPage() {
  const [currentView, setCurrentView] = useState<'login' | 'register'>('login')

  const handleLogin = (data: any) => {
    console.log('登录成功:', data)
    alert('登录成功！')
  }

  const handleRegister = (data: any) => {
    console.log('注册成功:', data)
    alert('注册成功！')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 顶部导航 */}
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold text-gray-800">认证系统演示</h1>
            <div className="flex space-x-2">
              <Button
                variant={currentView === 'login' ? 'default' : 'outline'}
                onClick={() => setCurrentView('login')}
                size="sm"
              >
                登录
              </Button>
              <Button
                variant={currentView === 'register' ? 'default' : 'outline'}
                onClick={() => setCurrentView('register')}
                size="sm"
              >
                注册
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* 功能说明 */}
      <div className="container mx-auto px-4 py-6">
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>移动端认证系统</CardTitle>
            <CardDescription>
              完整的移动端登录注册功能，支持手机号验证码登录和密码登录
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <h4 className="font-semibold mb-2">登录功能：</h4>
                <ul className="space-y-1 text-gray-600">
                  <li>• 手机号验证码登录</li>
                  <li>• 密码登录</li>
                  <li>• 验证码自动发送</li>
                  <li>• 表单验证</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">注册功能：</h4>
                <ul className="space-y-1 text-gray-600">
                  <li>• 分步注册流程</li>
                  <li>• 手机号验证</li>
                  <li>• 密码设置</li>
                  <li>• 用户协议确认</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 移动端预览 */}
        <div className="flex justify-center">
          <div className="w-full max-w-sm">
            {currentView === 'login' ? (
              <MobileLogin
                onLogin={handleLogin}
                onRegister={() => setCurrentView('register')}
                onForgotPassword={() => alert('忘记密码功能')}
              />
            ) : (
              <MobileRegister
                onRegister={handleRegister}
                onLogin={() => setCurrentView('login')}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
