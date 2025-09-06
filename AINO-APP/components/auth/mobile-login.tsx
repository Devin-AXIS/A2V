"use client"
import axios from 'axios'
import React, { useState } from 'react'
import { cn } from '@/lib/utils'
import { Eye, EyeOff, User, Lock, Smartphone } from 'lucide-react'
import { PhoneInput } from './phone-input'
import { VerificationCodeInput, SendCodeButton } from './verification-code-input'
import { AppHeader } from '@/components/navigation/app-header'
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
type LoginStage = 'choose' | 'phone' | 'password'

export function MobileLogin({
  onLogin,
  onRegister,
  onForgotPassword,
  className
}: MobileLoginProps) {
  const [loginMethod, setLoginMethod] = useState<LoginMethod>('phone')
  const [stage, setStage] = useState<LoginStage>('choose')
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

      const applicationId = window.localStorage.getItem('APP_ID')
      const loginRes = await axios.post(`http://localhost:3001/api/modules/system/user/login?applicationId=${applicationId}`, {
        password,
        phone_number: phone
      })
      const loginResult = loginRes.data?.data;
      onLogin?.(loginResult)
    } catch (error) {
      console.error('登录失败:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const renderChoose = () => (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
      <div className="max-w-sm mx-auto pt-16 pb-8">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-semibold mb-3">Get started</h1>
          <p className="text-sm text-muted-foreground">选择登录方式</p>
        </div>
        <div className="space-y-3">
          <Button type="button" variant="secondary" className="w-full rounded-full h-12 justify-center">
            <span className="mr-2"></span>
            使用 Apple 登录
          </Button>
          <Button type="button" variant="default" className="w-full rounded-full h-12 justify-center" onClick={() => setStage('phone')}>
            使用手机号
          </Button>
          <Button type="button" variant="ghost" className="w-full rounded-full h-12 justify-center opacity-70">
            使用邮箱（暂未开启）
          </Button>
        </div>
        <div className="mt-8 text-center text-xs text-muted-foreground">
          点击继续即代表同意我们的服务条款和隐私政策
        </div>
      </div>
    </motion.div>
  )

  const renderPhone = () => (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
      <div className="max-w-sm mx-auto pt-8 pb-8">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-semibold mb-2">手机号{onRegister ? '登录' : '登录'}</h2>
          <p className="text-sm text-muted-foreground">验证码将发送至你的手机</p>
        </div>
        <div className="mb-5">
          <PhoneInput value={phone} onChange={handlePhoneChange} error={errors.phone} placeholder="请输入手机号" />
        </div>
        {codeSent && (
          <div className="mb-5">
            <VerificationCodeInput value={code} onChange={handleCodeChange} error={errors.code} onComplete={(v) => setCode(v)} size="sm" />
            <div className="mt-3 text-center">
              <Button type="button" variant="link" className="text-sm" onClick={() => setCodeSent(false)}>重新输入手机号</Button>
            </div>
          </div>
        )}
        {!codeSent && (
          <div className="mb-6">
            <Button type="button" variant="secondary" className="w-full rounded-full h-11" disabled={!phone} onClick={handleSendCode}>发送验证码</Button>
          </div>
        )}
        <Button type="button" onClick={handleLogin} disabled={isLoading || (codeSent && code.length < 4)} size="lg" className="w-full rounded-full h-12 text-base" variant="default">
          {isLoading ? (<><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />继续中...</>) : '继续'}
        </Button>
        <div className="mt-6 text-center">
          <span className="text-sm text-muted-foreground">还没有账号？</span>
          <Button type="button" variant="link" onClick={onRegister} className="text-sm font-medium ml-1">前往注册</Button>
        </div>
      </div>
    </motion.div>
  )

  return (
    <div className="min-h-screen pb-8">
      <AppHeader title="登录" showBackButton={stage !== 'choose'} />
      <div className="pt-6">
        <div className="container mx-auto px-4">
          {stage === 'choose' ? renderChoose() : null}
          {stage === 'phone' ? renderPhone() : null}
        </div>
      </div>
    </div>
  )
}