"use client"

import React, { useState } from 'react'
import { cn } from '@/lib/utils'
import { Eye, EyeOff, ArrowLeft, User, Lock, Smartphone, Check, AlertCircle } from 'lucide-react'
import { PhoneInput, CountryCodeSelector } from './phone-input'
import { VerificationCodeInput, SendCodeButton } from './verification-code-input'
import { AppCard } from '@/components/layout/app-card'
import { AppHeader } from '@/components/navigation/app-header'
import { Button } from '@/components/ui/button'
import { SmartButton } from '@/components/ui/smart-button'
import { useDesignTokens } from '@/components/providers/design-tokens-provider'
import { getOptimalTextColor } from '@/lib/contrast-utils'
import { TextInput } from '@/components/input/text-input'

interface MobileRegisterProps {
  onRegister?: (data: RegisterData) => void
  onLogin?: () => void
  className?: string
}

export interface RegisterData {
  phone: string
  countryCode: string
  code: string
  password: string
  confirmPassword: string
  agreeTerms: boolean
}

export function MobileRegister({
  onRegister,
  onLogin,
  className
}: MobileRegisterProps) {
  const [step, setStep] = useState(1) // 1: 手机号验证, 2: 设置密码, 3: 完成
  const [countryCode, setCountryCode] = useState('+86')
  const [phone, setPhone] = useState('')
  const [code, setCode] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [agreeTerms, setAgreeTerms] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<{
    phone?: string
    code?: string
    password?: string
    confirmPassword?: string
    agreeTerms?: string
  }>({})

  // 使用统一设计配置
  const { tokens } = useDesignTokens()
  const primaryColor = tokens?.colors?.primary?.500 || '#3b82f6'
  const registerButtonTextColor = getOptimalTextColor(primaryColor, 'primary')

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

  const handleConfirmPasswordChange = (value: string) => {
    setConfirmPassword(value)
    if (errors.confirmPassword) {
      setErrors(prev => ({ ...prev, confirmPassword: undefined }))
    }
  }

  const handleSendCode = async () => {
    if (!phone) {
      setErrors(prev => ({ ...prev, phone: '请输入手机号' }))
      return
    }
    
    // 这里应该调用发送验证码的API
    console.log('发送验证码到:', countryCode + phone)
  }

  const validateStep1 = () => {
    const newErrors: typeof errors = {}
    
    if (!phone) {
      newErrors.phone = '请输入手机号'
    }
    
    if (!code) {
      newErrors.code = '请输入验证码'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const validateStep2 = () => {
    const newErrors: typeof errors = {}
    
    if (!password) {
      newErrors.password = '请输入密码'
    } else if (password.length < 6) {
      newErrors.password = '密码至少6位'
    }
    
    if (!confirmPassword) {
      newErrors.confirmPassword = '请确认密码'
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = '两次密码不一致'
    }
    
    if (!agreeTerms) {
      newErrors.agreeTerms = '请同意用户协议和隐私政策'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleNext = () => {
    if (step === 1 && validateStep1()) {
      setStep(2)
    } else if (step === 2 && validateStep2()) {
      handleRegister()
    }
  }

  const handleRegister = async () => {
    setIsLoading(true)

    try {
      // 模拟注册请求
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      onRegister?.({
        phone,
        countryCode,
        code,
        password,
        confirmPassword,
        agreeTerms
      })
      
      setStep(3)
    } catch (error) {
      console.error('注册失败:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const renderStep1 = () => (
    <>
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">手机号注册</h1>
        <p className="text-gray-600">请输入您的手机号码</p>
      </div>

      {/* 国家代码选择器 */}
      <div className="mb-6">
        <CountryCodeSelector
          value={countryCode}
          onChange={setCountryCode}
        />
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

      <SmartButton
        type="button"
        onClick={handleNext}
        size="lg"
        className="w-full"
        customBackgroundColor={primaryColor}
        customTextColor={registerButtonTextColor}
      >
        下一步
      </SmartButton>
    </>
  )

  const renderStep2 = () => (
    <>
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">设置密码</h1>
        <p className="text-gray-600">请设置您的登录密码</p>
      </div>

      {/* 密码输入 */}
      <div className="mb-6">
        <div className="relative">
          <div className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10">
            <Lock className="w-5 h-5 text-gray-400" />
          </div>
          <input
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => handlePasswordChange(e.target.value)}
            placeholder="请设置密码（至少6位）"
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

      {/* 确认密码输入 */}
      <div className="mb-6">
        <div className="relative">
          <div className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10">
            <Lock className="w-5 h-5 text-gray-400" />
          </div>
          <input
            type={showConfirmPassword ? 'text' : 'password'}
            value={confirmPassword}
            onChange={(e) => handleConfirmPasswordChange(e.target.value)}
            placeholder="请再次输入密码"
            className={cn(
              "w-full pl-12 pr-12 py-4",
              "bg-background border border-border",
              "rounded-lg",
              "text-foreground placeholder-muted-foreground",
              "text-base font-medium",
              "outline-none transition-all duration-300",
              "focus:border-primary focus:bg-accent",
              errors.confirmPassword && "border-red-300"
            )}
          />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 z-10 h-auto w-auto p-1"
          >
            {showConfirmPassword ? (
              <EyeOff className="w-5 h-5 text-muted-foreground" />
            ) : (
              <Eye className="w-5 h-5 text-muted-foreground" />
            )}
          </Button>
        </div>
        {errors.confirmPassword && (
          <div className="mt-2 text-sm text-red-600">{errors.confirmPassword}</div>
        )}
      </div>

      {/* 用户协议 */}
      <div className="mb-6">
        <label className="flex items-start space-x-3 cursor-pointer">
          <div className="relative">
            <input
              type="checkbox"
              checked={agreeTerms}
              onChange={(e) => setAgreeTerms(e.target.checked)}
              className="sr-only"
            />
            <div className={cn(
              "w-5 h-5 rounded border-2 flex items-center justify-center",
              "transition-all duration-200",
              agreeTerms 
                ? "bg-blue-500 border-blue-500" 
                : "border-gray-300 hover:border-gray-400"
            )}>
              {agreeTerms && <Check className="w-3 h-3 text-white" />}
            </div>
          </div>
          <span className="text-sm text-gray-600 leading-relaxed">
            我已阅读并同意
            <button type="button" className="text-blue-600 hover:text-blue-800 mx-1">
              《用户协议》
            </button>
            和
            <button type="button" className="text-blue-600 hover:text-blue-800 mx-1">
              《隐私政策》
            </button>
          </span>
        </label>
        {errors.agreeTerms && (
          <div className="mt-2 text-sm text-red-600">{errors.agreeTerms}</div>
        )}
      </div>

      <SmartButton
        type="button"
        onClick={handleNext}
        disabled={isLoading}
        size="lg"
        className="w-full"
        customBackgroundColor={primaryColor}
        customTextColor={registerButtonTextColor}
      >
        {isLoading ? (
          <>
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            注册中...
          </>
        ) : (
          '完成注册'
        )}
      </SmartButton>
    </>
  )

  const renderStep3 = () => (
    <>
      <div className="text-center">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <Check className="w-10 h-10 text-green-600" />
        </div>
        <h1 className="text-2xl font-bold text-gray-800 mb-2">注册成功！</h1>
        <p className="text-gray-600 mb-8">欢迎加入我们，现在可以开始使用了</p>
        
        <Button
          type="button"
          onClick={onLogin}
          size="lg"
          className="w-full"
        >
          立即登录
        </Button>
      </div>
    </>
  )

  return (
    <div className="min-h-screen pb-32">
      <AppHeader title="注册" showBackButton={true} />
      <div className="pt-16">
        <div className="container mx-auto px-4 py-8">
          {/* 进度指示器 */}
          {step < 3 && (
            <div className="mb-8">
              <div className="flex items-center justify-center space-x-4">
                {[1, 2].map((stepNumber) => (
                  <div key={stepNumber} className="flex items-center">
                    <div className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium",
                      "transition-all duration-300",
                      step >= stepNumber
                        ? "bg-blue-500 text-white"
                        : "bg-gray-200 text-gray-400"
                    )}>
                      {stepNumber}
                    </div>
                    {stepNumber < 2 && (
                      <div className={cn(
                        "w-12 h-1 mx-2 rounded-full transition-all duration-300",
                        step > stepNumber ? "bg-blue-500" : "bg-gray-200"
                      )} />
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 注册表单 */}
          <AppCard className="max-w-sm mx-auto">
            <div className="p-8">
            {step === 1 && renderStep1()}
            {step === 2 && renderStep2()}
            {step === 3 && renderStep3()}
            </div>
          </AppCard>
        </div>
      </div>
    </div>
  )
}
