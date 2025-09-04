"use client"

import React, { useState } from 'react'
import { cn } from '@/lib/utils'
import { Eye, EyeOff, User, Lock, Smartphone } from 'lucide-react'
import { PhoneInput } from './phone-input'
import { VerificationCodeInput, SendCodeButton } from './verification-code-input'
import { AppCard } from '@/components/layout/app-card'
import { AppHeader } from '@/components/navigation/app-header'
import { Button } from '@/components/ui/button'
import { SmartButton } from '@/components/ui/smart-button'
import { TextInput } from '@/components/input/text-input'
import { useDesignTokens } from '@/components/providers/design-tokens-provider'
import { getOptimalTextColor } from '@/lib/contrast-utils'

interface MobileLoginProps {
  onLogin?: (data: LoginData) => void
  onRegister?: () => void
  onForgotPassword?: () => void
  className?: string
}

export interface LoginData {
  phone: string
  code: string
  password?: string
}

type LoginMethod = 'phone' | 'password'

export function MobileLogin({
  onLogin,
  onRegister,
  onForgotPassword,
  className
}: MobileLoginProps) {
  const [loginMethod, setLoginMethod] = useState<LoginMethod>('phone')
  const [phone, setPhone] = useState('')
  const [code, setCode] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<{
    phone?: string
    code?: string
    password?: string
  }>({})

  // 使用统一设计配置
  const { tokens } = useDesignTokens()
  const primaryColor = tokens?.colors?.primary?.500 || '#3b82f6'
  const loginButtonTextColor = getOptimalTextColor(primaryColor, 'primary')

  const handlePhoneChange = (value: string) => {
    setPhone(value)
    if (errors.phone) {
      setErrors(prev => ({ ...prev, phone: undefined }))
    }
  }

  const handleCodeChange = (value: string) => {
    setCode(value)
    if (errors.code) {
      setErrors(prev => ({ ...prev, code: undefined }))
    }
  }

  const handlePasswordChange = (value: string) => {
    setPassword(value)
    if (errors.password) {
      setErrors(prev => ({ ...prev, password: undefined }))
    }
  }

  const handleSendCode = async () => {
    if (!phone) {
      setErrors(prev => ({ ...prev, phone: '请输入手机号' }))
      return
    }
    
    // 这里应该调用发送验证码的API
    console.log('发送验证码到:', phone)
  }

  const handleLogin = async () => {
    setIsLoading(true)
    setErrors({})

    try {
      // 验证输入
      const newErrors: typeof errors = {}
      
      if (!phone) {
        newErrors.phone = '请输入手机号'
      }
      
      if (loginMethod === 'phone') {
        if (!code) {
          newErrors.code = '请输入验证码'
        }
      } else {
        if (!password) {
          newErrors.password = '请输入密码'
        }
      }

      if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors)
        return
      }

      // 模拟登录请求
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      onLogin?.({
        phone,
        code: loginMethod === 'phone' ? code : undefined,
        password: loginMethod === 'password' ? password : undefined
      })
    } catch (error) {
      console.error('登录失败:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen pb-32">
      <AppHeader title="登录" showBackButton={true} />
      <div className="pt-16">
        <div className="container mx-auto px-4 py-8">
          {/* 登录表单 */}
          <AppCard className="max-w-sm mx-auto">
            <div className="p-8">
              {/* 标题 */}
              <div className="text-center mb-8">
                <h1 className="text-2xl font-bold mb-2">欢迎回来</h1>
                <p className="text-muted-foreground">请选择登录方式</p>
              </div>

              {/* 登录方式切换 */}
              <div className="flex bg-muted rounded-lg p-1 mb-6">
                <Button
                  type="button"
                  variant={loginMethod === 'phone' ? 'default' : 'ghost'}
                  size="lg"
                  onClick={() => setLoginMethod('phone')}
                  className="flex-1"
                >
                  <Smartphone className="w-4 h-4" />
                  手机验证码
                </Button>
                <Button
                  type="button"
                  variant={loginMethod === 'password' ? 'default' : 'ghost'}
                  size="lg"
                  onClick={() => setLoginMethod('password')}
                  className="flex-1"
                >
                  <Lock className="w-4 h-4" />
                  密码登录
                </Button>
              </div>

              {/* 手机号输入 */}
              <div className="mb-6">
                <PhoneInput
                  value={phone}
                  onChange={handlePhoneChange}
                  error={errors.phone}
                  placeholder="请输入手机号"
                />
              </div>

              {/* 验证码输入 */}
              {loginMethod === 'phone' && (
                <div className="mb-6">
                  <VerificationCodeInput
                    value={code}
                    onChange={handleCodeChange}
                    error={errors.code}
                    onComplete={(code) => console.log('验证码完成:', code)}
                  />
                  
                  <div className="mt-4 flex justify-center">
                    <SendCodeButton
                      onSend={handleSendCode}
                      disabled={!phone}
                    />
                  </div>
                </div>
              )}

              {/* 密码输入 */}
              {loginMethod === 'password' && (
                <div className="mb-6">
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10">
                      <Lock className="w-5 h-5 text-muted-foreground" />
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => handlePasswordChange(e.target.value)}
                      placeholder="请输入密码"
                      className={cn(
                        "w-full pl-12 pr-12 py-4",
                        "bg-background border border-border",
                        "rounded-lg",
                        "text-foreground placeholder-muted-foreground",
                        "text-base font-medium",
                        "outline-none transition-all duration-300",
                        "focus:border-primary focus:bg-accent",
                        errors.password && "border-red-300"
                      )}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 z-10 h-auto w-auto p-1"
                    >
                      {showPassword ? (
                        <EyeOff className="w-5 h-5 text-muted-foreground" />
                      ) : (
                        <Eye className="w-5 h-5 text-muted-foreground" />
                      )}
                    </Button>
                  </div>
                  {errors.password && (
                    <div className="mt-2 text-sm text-red-600">{errors.password}</div>
                  )}
                </div>
              )}

              {/* 登录按钮 - 使用智能对比度 */}
              <SmartButton
                type="button"
                onClick={handleLogin}
                disabled={isLoading}
                size="lg"
                className="w-full"
                customBackgroundColor={primaryColor}
                customTextColor={loginButtonTextColor}
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    登录中...
                  </>
                ) : (
                  '登录'
                )}
              </SmartButton>

              {/* 其他操作 */}
              <div className="mt-6 space-y-4">
                {loginMethod === 'password' && (
                  <div className="text-center">
                    <Button
                      type="button"
                      variant="link"
                      onClick={onForgotPassword}
                      className="text-sm"
                    >
                      忘记密码？
                    </Button>
                  </div>
                )}
                
                <div className="text-center">
                  <span className="text-sm text-muted-foreground">还没有账号？</span>
                  <Button
                    type="button"
                    variant="link"
                    onClick={onRegister}
                    className="text-sm font-medium ml-1"
                  >
                    立即注册
                  </Button>
                </div>
              </div>
            </div>
          </AppCard>
        </div>
      </div>
    </div>
  )
}