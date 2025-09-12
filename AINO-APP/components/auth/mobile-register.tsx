"use client"

import axios from 'axios'
import React, { useEffect, useMemo, useState } from 'react'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Eye, EyeOff, ArrowLeft, User, Lock, Smartphone, Check, AlertCircle } from 'lucide-react'
import { PhoneInput, CountryCodeSelector } from './phone-input'
import { VerificationCodeInput, SendCodeButton } from './verification-code-input'
import { AppHeader } from '@/components/navigation/app-header'
import { Button } from '@/components/ui/button'
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

type RegisterStage = 'phone' | 'verify' | 'password' | 'success'

export function MobileRegister({
  onRegister,
  onLogin,
  className
}: MobileRegisterProps) {
  const pathname = usePathname()
  const [authConfig, setAuthConfig] = useState<any>(null)
  useEffect(() => {
    try {
      const sp = new URLSearchParams(window.location.search)
      const fromParam = sp.get('authCfg')
      if (fromParam) {
        const parsed = JSON.parse(fromParam)
        setAuthConfig(parsed)
        return
      }
      const raw = window.localStorage.getItem('APP_AUTH_CONFIG')
      if (raw) setAuthConfig(JSON.parse(raw))
    } catch { }
  }, [])

  const titleStyle = authConfig?.titleColor ? { color: authConfig.titleColor } : undefined
  const bodyStyle = authConfig?.bodyColor ? { color: authConfig.bodyColor } : undefined

  const currentLocale = useMemo(() => (pathname?.startsWith('/en') ? 'en' : 'zh'), [pathname])
  const introTitle = useMemo(() => {
    const t = authConfig?.introTitle
    if (!t) return null
    if (typeof t === 'string') return t
    return t[currentLocale] || t.zh || t.en || null
  }, [authConfig, currentLocale])
  const introText = useMemo(() => {
    const t = authConfig?.introText
    if (!t) return null
    if (typeof t === 'string') return t
    return t[currentLocale] || t.zh || t.en || null
  }, [authConfig, currentLocale])
  const [stage, setStage] = useState<RegisterStage>('phone')
  const [countryCode, setCountryCode] = useState('+86')
  const [phone, setPhone] = useState<string>(() => {
    try {
      const sp = new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '')
      return sp.get('phone') || ''
    } catch { return '' }
  })
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

  // 统一按钮走公用 Button + 主题变量

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
    if (stage === 'phone' && validateStep1()) {
      setStage('verify')
    } else if (stage === 'verify') {
      setStage('password')
    } else if (stage === 'password' && validateStep2()) {
      handleRegister()
    }
  }

  const handleRegister = async () => {
    setIsLoading(true)

    try {
      // 模拟注册请求
      await new Promise(resolve => setTimeout(resolve, 1000))
      const applicationId = window.localStorage.getItem('APP_ID')
      const urlAppId = new URLSearchParams(window.location.search).get('appId')
      const resolvedAppId = applicationId || process.env.NEXT_PUBLIC_DEFAULT_APP_ID || urlAppId || ''

      if (!resolvedAppId) {
        alert('缺少应用ID，请通过预览链接附带 appId 或先写入 localStorage.APP_ID')
        return
      }

      const res = await axios.post(
        `http://localhost:3007/api/application-users/register?applicationId=${resolvedAppId}`,
        {
          password,
          phone_number: phone
        }
      )
      const result = res.data?.data;

      onRegister?.({
        phone: result.phone,
        countryCode,
        code: result.userId,
        password,
        confirmPassword,
        agreeTerms
      })

      setStage('success')
    } catch (error: any) {
      const serverMsg = error?.response?.data?.error || error?.response?.data?.message
      const detail = typeof serverMsg === 'string' ? serverMsg : ''
      console.error('注册失败:', detail || error)
      if (detail.includes('用户已注册') || detail.includes('手机号已存在')) {
        alert('该手机号已注册，请直接登录')
      } else if (detail.includes('缺少应用ID')) {
        alert('缺少应用ID，请通过预览链接附带 appId 或先写入 localStorage.APP_ID')
      } else if (detail) {
        alert(detail)
      } else {
        alert('注册失败，请稍后再试')
      }
    } finally {
      setIsLoading(false)
    }
  }

  const renderStep1 = () => (
    <>
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold mb-2" style={titleStyle}>{introTitle || (currentLocale === 'en' ? 'Sign up' : '注册账号')}</h1>
        <p className="text-muted-foreground" style={bodyStyle}>{introText || (currentLocale === 'en' ? 'Enter your phone number' : '请输入您的手机号码')}</p>
      </div>

      {/* 国家代码 + 手机号（同一行） */}
      <div className="mb-6 flex items-stretch gap-3 w-full">
        <CountryCodeSelector
          value={countryCode}
          onChange={setCountryCode}
          className="shrink-0 w-28 sm:w-32"
        />
        <PhoneInput
          value={phone}
          onChange={handlePhoneChange}
          error={errors.phone}
          placeholder="请输入手机号"
          className="flex-1 min-w-0"
        />
      </div>

      {/* 发送验证码按钮 */}
      <div className="mb-6">
        <Button type="button" variant="secondary" className="w-full rounded-full h-11" disabled={!phone} onClick={() => setStage('verify')}>发送验证码</Button>
      </div>

      <Button
        type="button"
        onClick={handleNext}
        size="lg"
        className="w-full rounded-full h-12 text-base"
        variant="default"
      >
        下一步
      </Button>
    </>
  )

  const renderStep2 = () => (
    <>
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold mb-2" style={titleStyle}>设置密码</h1>
        <p className="text-muted-foreground" style={bodyStyle}>请设置您的登录密码</p>
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

      <Button
        type="button"
        onClick={handleNext}
        disabled={isLoading}
        size="lg"
        className="w-full rounded-full h-12 text-base"
        variant="default"
      >
        {isLoading ? (
          <>
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            注册中...
          </>
        ) : (
          '完成注册'
        )}
      </Button>
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

  const renderVerify = () => (
    <>
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold mb-2" style={titleStyle}>输入验证码</h1>
        <p className="text-muted-foreground text-sm" style={bodyStyle}>已发送至 {countryCode}{phone}</p>
      </div>
      <div className="mb-6">
        <VerificationCodeInput value={code} onChange={handleCodeChange} error={errors.code} onComplete={(v) => setCode(v)} size="sm" />
      </div>
      <div className="text-center mb-6">
        <Button type="button" variant="link" className="text-sm" onClick={() => setStage('phone')}>修改手机号</Button>
      </div>
      <Button type="button" onClick={handleNext} size="lg" className="w-full rounded-full h-12 text-base" variant="default">继续</Button>
    </>
  )

  return (
    <div className="min-h-screen pb-24">
      {/* 注册页不显示全局 AppHeader */}
      <div className="pt-12">
        <div className="container mx-auto px-4">
          <div className="max-w-sm mx-auto">
            {stage === 'phone' && renderStep1()}
            {stage === 'verify' && renderVerify()}
            {stage === 'password' && renderStep2()}
            {stage === 'success' && renderStep3()}
          </div>
        </div>
      </div>
    </div>
  )
}
