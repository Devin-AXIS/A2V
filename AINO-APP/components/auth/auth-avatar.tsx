"use client"

import React, { useState } from 'react'
import { cn } from '@/lib/utils'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu'
import { 
  User, 
  LogIn, 
  UserPlus, 
  LogOut, 
  Settings, 
  Crown,
  Sparkles
} from 'lucide-react'
import { useAuth } from '@/hooks/use-auth'
import { useRouter } from 'next/navigation'

interface AuthAvatarProps {
  className?: string
  size?: 'sm' | 'md' | 'lg'
  showDropdown?: boolean
  onClick?: () => void
}

export function AuthAvatar({ 
  className, 
  size = 'md', 
  showDropdown = true,
  onClick 
}: AuthAvatarProps) {
  const { user, isAuthenticated, logout } = useAuth()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16'
  }

  const handleLogin = () => {
    router.push('/auth/login')
  }

  const handleRegister = () => {
    router.push('/auth/register')
  }

  const handleLogout = async () => {
    setIsLoading(true)
    try {
      logout()
      // 可以添加退出成功的提示
    } catch (error) {
      console.error('退出登录失败:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleProfile = () => {
    router.push('/profile')
  }

  const handleSettings = () => {
    router.push('/profile/settings')
  }

  // 未登录状态 - 显示登录/注册按钮
  if (!isAuthenticated) {
    return (
      <div className={cn("flex items-center space-x-2", className)}>
        {showDropdown ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="outline" 
                size="sm"
                className="flex items-center space-x-2 bg-white/20 backdrop-blur-md border-white/30 hover:bg-white/30"
              >
                <User className="w-4 h-4" />
                登录
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={handleLogin} className="cursor-pointer">
                <LogIn className="w-4 h-4 mr-2" />
                登录
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleRegister} className="cursor-pointer">
                <UserPlus className="w-4 h-4 mr-2" />
                注册
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <div className="flex space-x-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleLogin}
              className="bg-white/20 backdrop-blur-md border-white/30 hover:bg-white/30"
            >
              <LogIn className="w-4 h-4 mr-2" />
              登录
            </Button>
            <Button 
              variant="default" 
              size="sm"
              onClick={handleRegister}
              className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
            >
              <UserPlus className="w-4 h-4 mr-2" />
              注册
            </Button>
          </div>
        )}
      </div>
    )
  }

  // 已登录状态 - 显示用户头像和菜单
  return (
    <div className={cn("flex items-center", className)}>
      {showDropdown ? (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              onClick={onClick}
              className={cn(
                "relative rounded-full transition-all duration-300 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500/50",
                sizeClasses[size]
              )}
            >
              <Avatar className={cn("border-2 border-white shadow-lg", sizeClasses[size])}>
                <AvatarImage src={user?.avatar} alt={user?.name} />
                <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white font-semibold">
                  {user?.name?.charAt(0) || 'U'}
                </AvatarFallback>
              </Avatar>
              
              {/* 在线状态指示器 */}
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
              
              {/* VIP 标识 */}
              {user?.points && user.points > 1000 && (
                <div className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                  <Crown className="w-3 h-3 text-white" />
                </div>
              )}
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-64">
            {/* 用户信息 */}
            <div className="px-3 py-2 border-b">
              <div className="flex items-center space-x-3">
                <Avatar className="w-10 h-10">
                  <AvatarImage src={user?.avatar} alt={user?.name} />
                  <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                    {user?.name?.charAt(0) || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 truncate">
                    {user?.name}
                  </p>
                  <p className="text-xs text-gray-500 truncate">
                    {user?.phone}
                  </p>
                  <div className="flex items-center space-x-1 mt-1">
                    <Sparkles className="w-3 h-3 text-yellow-500" />
                    <span className="text-xs text-gray-600">
                      {user?.points} 积分
                    </span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* 菜单项 */}
            <DropdownMenuItem onClick={handleProfile} className="cursor-pointer">
              <User className="w-4 h-4 mr-2" />
              个人中心
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleSettings} className="cursor-pointer">
              <Settings className="w-4 h-4 mr-2" />
              设置
            </DropdownMenuItem>
            
            <DropdownMenuSeparator />
            
            <DropdownMenuItem 
              onClick={handleLogout} 
              className="cursor-pointer text-red-600 focus:text-red-600"
              disabled={isLoading}
            >
              <LogOut className="w-4 h-4 mr-2" />
              {isLoading ? '退出中...' : '退出登录'}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ) : (
        <button
          onClick={onClick || handleProfile}
          className={cn(
            "relative rounded-full transition-all duration-300 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500/50",
            sizeClasses[size]
          )}
        >
          <Avatar className={cn("border-2 border-white shadow-lg", sizeClasses[size])}>
            <AvatarImage src={user?.avatar} alt={user?.name} />
            <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white font-semibold">
              {user?.name?.charAt(0) || 'U'}
            </AvatarFallback>
          </Avatar>
          
          {/* 在线状态指示器 */}
          <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
          
          {/* VIP 标识 */}
          {user?.points && user.points > 1000 && (
            <div className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
              <Crown className="w-3 h-3 text-white" />
            </div>
          )}
        </button>
      )}
    </div>
  )
}

// 简化的头像组件，用于导航栏等地方
export function SimpleAuthAvatar({ 
  className, 
  size = 'sm',
  onClick 
}: {
  className?: string
  size?: 'sm' | 'md' | 'lg'
  onClick?: () => void
}) {
  return (
    <AuthAvatar 
      className={className}
      size={size}
      showDropdown={false}
      onClick={onClick}
    />
  )
}
