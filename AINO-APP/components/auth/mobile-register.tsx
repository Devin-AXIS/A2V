"use client"
import axios from 'axios'
import React, { useEffect, useMemo, useState } from 'react'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Eye, EyeOff, User, Lock, Smartphone, Check } from 'lucide-react'
import { PhoneInput } from './phone-input'
import { Button } from '@/components/ui/button'
import { TextInput } from '@/components/input/text-input'
import { motion } from 'framer-motion'

interface MobileRegisterProps {
  onRegister?: (data: RegisterData) => void
  onLogin?: () => void
  className?: string
}

export interface RegisterData {
  phone: string
  password: string
  confirmPassword: string
  name: string
  agreeTerms: boolean
}

type RegisterStage = 'form' | 'success'

export function MobileRegister({
  onRegister,
  onLogin,
  className
}: MobileRegisterProps) {
  const [stage, setStage] = useState<RegisterStage>('form')
  const [formData, setFormData] = useState<RegisterData>({
    phone: '',
    password: '',
    confirmPassword: '',
    name: '',
    agreeTerms: false
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<{
    phone?: string
    password?: string
    confirmPassword?: string
    name?: string
    agreeTerms?: string
  }>({})

  const handleInputChange = (field: keyof RegisterData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }))
    }
  }

  const validateForm = () => {
    const newErrors: typeof errors = {}

    if (!formData.name.trim()) {
      newErrors.name = '请输入姓名'
    }

    if (!formData.phone) {
      newErrors.phone = '请输入手机号'
    } else if (!/^1[3-9]\d{9}$/.test(formData.phone)) {
      newErrors.phone = '请输入正确的手机号'
    }

    if (!formData.password) {
      newErrors.password = '请输入密码'
    } else if (formData.password.length < 6) {
      newErrors.password = '密码至少需要6个字符'
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = '两次输入的密码不一致'
    }

    if (!formData.agreeTerms) {
      newErrors.agreeTerms = '请同意服务条款和隐私政策'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleRegister = async () => {
    if (!validateForm()) return

    setIsLoading(true)
    setErrors({})

    try {
      const appConfigStr = window.localStorage.getItem('APPLICATION_CONFIG')
      const appConfig = JSON.parse(appConfigStr || '{}')
      const applicationId = appConfig?.id

      // 调用Studio的注册API
      const registerRes = await axios.post(`http://47.94.52.142:3007/api/modules/system/user/register?applicationId=${applicationId}`, {
        phone_number: formData.phone,
        password: formData.password,
        name: formData.name
      })

      console.log('注册响应:', registerRes.data)

      if (registerRes.data?.success) {
        setStage('success')
        // 延迟调用onRegister回调
        setTimeout(() => {
          onRegister?.(formData)
        }, 1500)
      } else {
        throw new Error(registerRes.data?.error || '注册失败')
      }
    } catch (error: any) {
      console.error('注册失败:', error)
      const errorMessage = error.response?.data?.error || error.message || '注册失败，请重试'
      setErrors(prev => ({ ...prev, phone: errorMessage }))
    } finally {
      setIsLoading(false)
    }
  }

  // 读取 APP_AUTH_CONFIG 决定注册配置
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

  const renderRegisterForm = () => (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
      <div className="max-w-sm mx-auto pt-8 pb-8">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-semibold mb-2" style={titleStyle}>
            {introTitle || (currentLocale === 'en' ? 'Create Account' : '创建账户')}
          </h2>
          <p className="text-sm text-muted-foreground" style={bodyStyle}>
            {introText || (currentLocale === 'en' ? 'Fill in the information to create your new account' : '填写信息以创建您的新账户')}
          </p>
        </div>

        <div className="space-y-4">
          {/* 姓名输入 */}
          <div>
            <label htmlFor="name" className="block text-xs font-medium text-gray-600 mb-1.5">
              {currentLocale === 'en' ? 'Name' : '姓名'}
            </label>
            <div className={cn(
              "group bg-white/70 backdrop-blur-lg rounded-xl shadow-sm border border-white/80 transition-all duration-300",
              "focus-within:ring-2 focus-within:shadow-lg",
              "flex items-center"
            )}>
              <User className="w-4 h-4 text-gray-400 ml-3" />
              <input
                id="name"
                type="text"
                className="flex-1 px-3 py-2.5 bg-transparent outline-none text-gray-900 placeholder:text-gray-400 text-sm"
                placeholder={currentLocale === 'en' ? 'Enter your name' : '请输入您的姓名'}
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
              />
            </div>
            {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name}</p>}
          </div>

          {/* 手机号输入 */}
          <div>
            <PhoneInput
              value={formData.phone}
              onChange={(value) => handleInputChange('phone', value)}
              error={errors.phone}
              placeholder={currentLocale === 'en' ? 'Enter your phone number' : '请输入手机号'}
            />
          </div>

          {/* 密码输入 */}
          <div>
            <label htmlFor="password" className="block text-xs font-medium text-gray-600 mb-1.5">
              {currentLocale === 'en' ? 'Password' : '密码'}
            </label>
            <div className={cn(
              "group bg-white/70 backdrop-blur-lg rounded-xl shadow-sm border border-white/80 transition-all duration-300",
              "focus-within:ring-2 focus-within:shadow-lg",
              "flex items-center"
            )}>
              <Lock className="w-4 h-4 text-gray-400 ml-3" />
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                className="flex-1 px-3 py-2.5 bg-transparent outline-none text-gray-900 placeholder:text-gray-400 text-sm"
                placeholder={currentLocale === 'en' ? 'Enter your password (at least 6 characters)' : '请输入密码（至少6个字符）'}
                value={formData.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
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
            {errors.password && <p className="mt-1 text-xs text-red-500">{errors.password}</p>}
          </div>

          {/* 确认密码输入 */}
          <div>
            <label htmlFor="confirmPassword" className="block text-xs font-medium text-gray-600 mb-1.5">
              {currentLocale === 'en' ? 'Confirm Password' : '确认密码'}
            </label>
            <div className={cn(
              "group bg-white/70 backdrop-blur-lg rounded-xl shadow-sm border border-white/80 transition-all duration-300",
              "focus-within:ring-2 focus-within:shadow-lg",
              "flex items-center"
            )}>
              <Lock className="w-4 h-4 text-gray-400 ml-3" />
              <input
                id="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                className="flex-1 px-3 py-2.5 bg-transparent outline-none text-gray-900 placeholder:text-gray-400 text-sm"
                placeholder={currentLocale === 'en' ? 'Enter your password again' : '请再次输入密码'}
                value={formData.confirmPassword}
                onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
              />
              <button
                type="button"
                aria-label={showConfirmPassword ? '隐藏密码' : '显示密码'}
                className="pr-3 text-gray-500 hover:text-gray-700"
                onClick={() => setShowConfirmPassword((v) => !v)}
              >
                {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {errors.confirmPassword && <p className="mt-1 text-xs text-red-500">{errors.confirmPassword}</p>}
          </div>

          {/* 同意条款 */}
          <div className="flex items-start space-x-2">
            <button
              type="button"
              onClick={() => handleInputChange('agreeTerms', !formData.agreeTerms)}
              className={cn(
                "mt-1 w-4 h-4 rounded border-2 flex items-center justify-center transition-colors",
                formData.agreeTerms
                  ? "bg-blue-500 border-blue-500 text-white"
                  : "border-gray-300 hover:border-gray-400"
              )}
            >
              {formData.agreeTerms && <Check className="w-3 h-3" />}
            </button>
            <label className="text-xs text-gray-600 leading-relaxed cursor-pointer" onClick={() => handleInputChange('agreeTerms', !formData.agreeTerms)}>
              {currentLocale === 'en' ? 'I agree to the' : '我同意'}{' '}
              <a href="#" className="text-blue-600 hover:text-blue-700 hover:underline">
                {currentLocale === 'en' ? 'Terms of Service' : '服务条款'}
              </a>{' '}
              {currentLocale === 'en' ? 'and' : '和'}{' '}
              <a href="#" className="text-blue-600 hover:text-blue-700 hover:underline">
                {currentLocale === 'en' ? 'Privacy Policy' : '隐私政策'}
              </a>
            </label>
          </div>
          {errors.agreeTerms && <p className="text-xs text-red-500">{errors.agreeTerms}</p>}
        </div>

        <div className="mt-6">
          <Button
            type="button"
            onClick={handleRegister}
            disabled={isLoading}
            size="lg"
            className="w-full rounded-full h-12 text-base"
            variant="default"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                {currentLocale === 'en' ? 'Creating Account...' : '创建账户中...'}
              </>
            ) : (
              currentLocale === 'en' ? 'Create Account' : '创建账户'
            )}
          </Button>
        </div>

        <div className="text-center text-sm text-muted-foreground mt-4">
          {currentLocale === 'en' ? 'Already have an account?' : '已有账户？'}{' '}
          <button
            type="button"
            className="text-blue-600 hover:text-blue-700 hover:underline font-medium"
            onClick={onLogin}
          >
            {currentLocale === 'en' ? 'Sign In Now' : '立即登录'}
          </button>
        </div>
      </div>
    </motion.div>
  )

  const renderSuccess = () => (
    <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.3 }}>
      <div className="max-w-sm mx-auto pt-8 pb-8">
        <div className="text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Check className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-semibold mb-2" style={titleStyle}>
            {currentLocale === 'en' ? 'Account Created Successfully!' : '账户创建成功！'}
          </h2>
          <p className="text-sm text-muted-foreground" style={bodyStyle}>
            {currentLocale === 'en' ? 'Welcome to our platform' : '欢迎加入我们的平台'}
          </p>
        </div>
      </div>
    </motion.div>
  )

  return (
    <div className="min-h-screen pb-8">
      <div className="pt-6">
        <div className="container mx-auto px-4">
          {stage === 'form' ? renderRegisterForm() : null}
          {stage === 'success' ? renderSuccess() : null}
        </div>
      </div>
    </div>
  )
}