"use client"

import React, { useState } from 'react'
import { AuthAvatar, MobileLogin, MobileRegister } from '@/components/auth'
import { useAuth } from '@/hooks/use-auth'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  User, 
  LogIn, 
  UserPlus, 
  LogOut, 
  Crown, 
  Sparkles,
  Smartphone,
  Shield,
  Eye,
  EyeOff
} from 'lucide-react'

export default function AuthInteractiveDemoPage() {
  const { user, isAuthenticated, logout } = useAuth()
  const [currentView, setCurrentView] = useState<'demo' | 'login' | 'register'>('demo')

  const handleLogout = () => {
    logout()
    setCurrentView('demo')
  }

  if (currentView === 'login') {
    return (
      <div className="min-h-screen">
        <div className="p-4">
          <Button 
            variant="outline" 
            onClick={() => setCurrentView('demo')}
            className="mb-4"
          >
            ← 返回演示
          </Button>
        </div>
        <MobileLogin
          onLogin={(data) => {
            console.log('登录成功:', data)
            setCurrentView('demo')
          }}
          onRegister={() => setCurrentView('register')}
          onForgotPassword={() => alert('忘记密码功能')}
        />
      </div>
    )
  }

  if (currentView === 'register') {
    return (
      <div className="min-h-screen">
        <div className="p-4">
          <Button 
            variant="outline" 
            onClick={() => setCurrentView('demo')}
            className="mb-4"
          >
            ← 返回演示
          </Button>
        </div>
        <MobileRegister
          onRegister={(data) => {
            console.log('注册成功:', data)
            setCurrentView('demo')
          }}
          onLogin={() => setCurrentView('login')}
        />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 顶部导航 */}
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold text-gray-800">认证系统交互演示</h1>
            <AuthAvatar size="sm" showDropdown={true} />
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        {/* 当前状态显示 */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Shield className="w-5 h-5" />
              <span>当前认证状态</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isAuthenticated ? (
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                    {user?.name?.charAt(0) || 'U'}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{user?.name}</h3>
                    <p className="text-sm text-gray-600">{user?.phone}</p>
                    <div className="flex items-center space-x-2 mt-1">
                      <Sparkles className="w-4 h-4 text-yellow-500" />
                      <span className="text-sm text-gray-600">{user?.points} 积分</span>
                      {user?.points && user.points > 1000 && (
                        <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                          <Crown className="w-3 h-3 mr-1" />
                          VIP
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
                <Button variant="outline" onClick={handleLogout}>
                  <LogOut className="w-4 h-4 mr-2" />
                  退出登录
                </Button>
              </div>
            ) : (
              <div className="text-center py-4">
                <User className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-600">未登录状态</p>
                <p className="text-sm text-gray-500">点击右上角头像进行登录或注册</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* 功能演示 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <LogIn className="w-5 h-5" />
                <span>登录功能</span>
              </CardTitle>
              <CardDescription>
                支持手机号验证码登录和密码登录
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Smartphone className="w-4 h-4" />
                  <span>手机号验证码登录</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Eye className="w-4 h-4" />
                  <span>密码登录</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Shield className="w-4 h-4" />
                  <span>表单验证</span>
                </div>
              </div>
              <Button 
                className="w-full mt-4"
                onClick={() => setCurrentView('login')}
              >
                体验登录
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <UserPlus className="w-5 h-5" />
                <span>注册功能</span>
              </CardTitle>
              <CardDescription>
                分步注册流程，手机号验证和密码设置
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Smartphone className="w-4 h-4" />
                  <span>手机号验证</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <EyeOff className="w-4 h-4" />
                  <span>密码设置</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Shield className="w-4 h-4" />
                  <span>用户协议确认</span>
                </div>
              </div>
              <Button 
                variant="outline"
                className="w-full mt-4"
                onClick={() => setCurrentView('register')}
              >
                体验注册
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* 设计特色 */}
        <Card>
          <CardHeader>
            <CardTitle>设计特色</CardTitle>
            <CardDescription>
              采用现代化设计风格，提供优秀的用户体验
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg mx-auto mb-2 flex items-center justify-center">
                  <span className="text-white text-sm">毛</span>
                </div>
                <p className="text-sm font-medium">毛玻璃效果</p>
              </div>
              <div className="text-center p-4 bg-gradient-to-br from-green-50 to-blue-50 rounded-lg">
                <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-blue-600 rounded-lg mx-auto mb-2 flex items-center justify-center">
                  <span className="text-white text-sm">柔</span>
                </div>
                <p className="text-sm font-medium">柔和阴影</p>
              </div>
              <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg">
                <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg mx-auto mb-2 flex items-center justify-center">
                  <span className="text-white text-sm">磨</span>
                </div>
                <p className="text-sm font-medium">磨砂质感</p>
              </div>
              <div className="text-center p-4 bg-gradient-to-br from-orange-50 to-red-50 rounded-lg">
                <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-red-600 rounded-lg mx-auto mb-2 flex items-center justify-center">
                  <span className="text-white text-sm">动</span>
                </div>
                <p className="text-sm font-medium">动画效果</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 使用说明 */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>使用说明</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 text-sm text-gray-600">
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-bold">1</div>
                <div>
                  <p className="font-medium">点击右上角头像</p>
                  <p>未登录时显示登录/注册按钮，已登录时显示用户菜单</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-bold">2</div>
                <div>
                  <p className="font-medium">选择登录或注册</p>
                  <p>支持手机号验证码登录和密码登录两种方式</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-bold">3</div>
                <div>
                  <p className="font-medium">完成认证</p>
                  <p>登录成功后自动跳转到个人中心，显示用户信息</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
