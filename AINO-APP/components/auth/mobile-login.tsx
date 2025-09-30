"use client"
import React, { useEffect, useMemo, useState } from 'react'
import { http } from '@/lib/request'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Eye, EyeOff, User, Lock, Smartphone } from 'lucide-react'
import { PhoneInput } from './phone-input'
import { VerificationCodeInput, SendCodeButton } from './verification-code-input'
import { Button } from '@/components/ui/button'
import { TextInput } from '@/components/input/text-input'
import { motion } from 'framer-motion'

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
type LoginStage = 'phone' | 'verify' | 'password'

export function MobileLogin({
  onLogin,
  onRegister,
  onForgotPassword,
  className
}: MobileLoginProps) {
  const [loginMethod, setLoginMethod] = useState<LoginMethod>('phone')
  const [stage, setStage] = useState<LoginStage>('phone')
  const [phone, setPhone] = useState('')
  const [code, setCode] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [codeSent, setCodeSent] = useState(false)
  const [errors, setErrors] = useState<{
    phone?: string
    code?: string
    password?: string
  }>({})

  // 颜色改为使用统一 Button 组件与 Tailwind 变量

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
    setCodeSent(true)
    setStage('verify')
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

      const appConfigStr = window.localStorage.getItem('APPLICATION_CONFIG')
      const appConfig = JSON.parse(appConfigStr)
      const applicationId = appConfig?.id
      const loginRes = await http.post(`/api/modules/system/user/login?applicationId=${applicationId}`, {
        password,
        phone_number: phone
      })
      const loginResult = loginRes?.data;
      onLogin?.(loginResult)
    } catch (error) {
      console.error('登录失败:', error)
      setErrors(prev => ({
        ...prev,
        ...(loginMethod === 'password'
          ? { password: '登录失败，请检查手机号或密码' }
          : { code: '登录失败，请检查验证码' })
      }))
    } finally {
      setIsLoading(false)
    }
  }

  // 读取 APP_AUTH_CONFIG 决定登录方式与开关
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

  const providers: { key: string; enabled: boolean }[] = useMemo(() => {
    const base = [
      { key: 'phone', enabled: true },
      { key: 'wechat', enabled: false },
      { key: 'bytedance', enabled: false },
      { key: 'google', enabled: false },
      { key: 'apple', enabled: false },
    ]
    if (authConfig && Array.isArray(authConfig.providers)) {
      // 保证 phone 永远第一且启用
      const list = authConfig.providers.filter((p: any) => p && p.key && ['phone', 'wechat', 'bytedance', 'google', 'apple'].includes(p.key))
      const merged = [{ key: 'phone', enabled: true }, ...list.filter((p: any) => p.key !== 'phone')]
      return merged
    }
    return base
  }, [authConfig])

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

  const renderSocialIcons = () => (
    <div className="flex items-center justify-center gap-6 pt-10">
      {providers.find(p => p.key === 'wechat')?.enabled && (
        <button aria-label="wechat" className="size-14 rounded-full bg-white/80 shadow border flex items-center justify-center">微</button>
      )}
      {providers.find(p => p.key === 'bytedance')?.enabled && (
        <button aria-label="bytedance" className="size-14 rounded-full bg-white/80 shadow border flex items-center justify-center">字</button>
      )}
      {providers.find(p => p.key === 'google')?.enabled && (
        <button aria-label="google" className="size-14 rounded-full bg-white/80 shadow border flex items-center justify-center">G</button>
      )}
      {providers.find(p => p.key === 'apple')?.enabled && (
        <button aria-label="apple" className="size-14 rounded-full bg-white/80 shadow border flex items-center justify-center"></button>
      )}
    </div>
  )

  const renderPhone = () => (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
      <div className="max-w-sm mx-auto pt-8 pb-8">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-semibold mb-2" style={titleStyle}>{introTitle || (currentLocale === 'en' ? 'Sign in or register' : '手机号登录或注册')}</h2>
          <p className="text-sm text-muted-foreground" style={bodyStyle}>{introText || (currentLocale === 'en' ? 'The code will be sent to your phone' : '验证码将发送至你的手机')}</p>
        </div>
        <div className="mb-5">
          <PhoneInput value={phone} onChange={handlePhoneChange} error={errors.phone} placeholder="请输入手机号" />
        </div>
        <div className="mb-6">
          <Button type="button" variant="secondary" className="w-full rounded-full h-11" disabled={!phone} onClick={handleSendCode}>获取验证码</Button>
        </div>
        <div className="text-center text-sm text-muted-foreground">
          <button
            type="button"
            className="underline underline-offset-4 hover:text-foreground"
            onClick={() => {
              setLoginMethod('password')
              setStage('password')
            }}
          >
            使用密码登录
          </button>
        </div>
        <div className="text-center text-sm text-muted-foreground mt-2">
          <button
            type="button"
            className="text-blue-600 hover:text-blue-700 hover:underline font-medium"
            onClick={onRegister}
          >
            {currentLocale === 'en' ? 'Create Account' : '创建账户'}
          </button>
        </div>
        {renderSocialIcons()}
      </div>
    </motion.div>
  )

  const renderVerify = () => (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
      <div className="max-w-sm mx-auto pt-8 pb-8">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold mb-2" style={titleStyle}>{introTitle || (currentLocale === 'en' ? 'Verify code' : '输入验证码')}</h1>
          <p className="text-sm text-muted-foreground" style={bodyStyle}>{introText || (currentLocale === 'en' ? 'The code will be sent to your phone' : '验证码将发送至你的手机')}</p>
        </div>
        <div className="mb-6">
          <VerificationCodeInput value={code} onChange={handleCodeChange} error={errors.code} onComplete={(v) => setCode(v)} size="sm" />
        </div>
        <Button type="button" onClick={handleLogin} disabled={isLoading || code.length < 4} size="lg" className="w-full rounded-full h-12 text-base" variant="default">
          {isLoading ? (<><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />继续中...</>) : (currentLocale === 'en' ? 'Continue' : '继续')}
        </Button>
        <div className="text-center text-sm text-muted-foreground mt-4">
          <button
            type="button"
            className="underline underline-offset-4 hover:text-foreground"
            onClick={() => {
              setLoginMethod('password')
              setStage('password')
            }}
          >
            使用密码登录
          </button>
        </div>
        <div className="text-center text-sm text-muted-foreground mt-2">
          <button
            type="button"
            className="text-blue-600 hover:text-blue-700 hover:underline font-medium"
            onClick={onRegister}
          >
            {currentLocale === 'en' ? 'Create Account' : '创建账户'}
          </button>
        </div>
        {renderSocialIcons()}
      </div>
    </motion.div>
  )

  const renderPassword = () => (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
      <div className="max-w-sm mx-auto pt-8 pb-8">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-semibold mb-2" style={titleStyle}>{introTitle || (currentLocale === 'en' ? 'Sign in with password' : '手机号 + 密码登录')}</h2>
          <p className="text-sm text-muted-foreground" style={bodyStyle}>{introText || (currentLocale === 'en' ? 'Enter your phone and password' : '请输入你的手机号与密码')}</p>
        </div>
        <div className="mb-4">
          <PhoneInput value={phone} onChange={handlePhoneChange} error={errors.phone} placeholder="请输入手机号" />
        </div>
        <div className="mb-1">
          <div className="w-full max-w-sm">
            <label htmlFor="password" className="block text-xs font-medium text-gray-600 mb-1.5">密码</label>
            <div className={cn(
              "group bg-white/70 backdrop-blur-lg rounded-xl shadow-sm border border-white/80 transition-all duration-300",
              "focus-within:ring-2 focus-within:shadow-lg",
              "flex items-center"
            )}>
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                className="flex-1 px-3.5 py-2.5 bg-transparent outline-none text-gray-900 placeholder:text-gray-400 text-sm"
                placeholder="请输入密码"
                value={password}
                onChange={(e) => handlePasswordChange(e.target.value)}
              />
              <button
                type="button"
                aria-label={showPassword ? '隐藏密码' : '显示密码'}
                className="pr-3 text-gray-500 hover:text-gray-700"
                onClick={() => setShowPassword((v) => !v)}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {errors.password ? (
              <p className="mt-1 text-xs text-red-500">{errors.password}</p>
            ) : null}
          </div>
        </div>
        <div className="flex items-center justify-between mb-6">
          <div className="text-sm text-muted-foreground">
            <button
              type="button"
              className="underline underline-offset-4 hover:text-foreground"
              onClick={() => {
                setLoginMethod('phone')
                setStage('phone')
              }}
            >
              使用验证码登录
            </button>
          </div>
          <div className="text-sm">
            <button
              type="button"
              className="text-blue-600 hover:underline"
              onClick={onForgotPassword}
            >
              忘记密码？
            </button>
          </div>
        </div>
        <Button
          type="button"
          onClick={handleLogin}
          disabled={isLoading || !phone || !password}
          size="lg"
          className="w-full rounded-full h-12 text-base"
          variant="default"
        >
          {isLoading ? (<><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />登录中...</>) : '登录'}
        </Button>
        <div className="text-center text-sm text-muted-foreground mt-4">
          <button
            type="button"
            className="text-blue-600 hover:text-blue-700 hover:underline font-medium"
            onClick={onRegister}
          >
            {currentLocale === 'en' ? 'Create Account' : '创建账户'}
          </button>
        </div>
        {renderSocialIcons()}
      </div>
    </motion.div>
  )

  return (
    <div className="min-h-screen pb-8">
      {/* 登录页不显示全局 AppHeader */}
      <div className="pt-6">
        <div className="container mx-auto px-4">
          {stage === 'phone' ? renderPhone() : null}
          {stage === 'verify' ? renderVerify() : null}
          {stage === 'password' ? renderPassword() : null}
        </div>
      </div>
    </div>
  )
}