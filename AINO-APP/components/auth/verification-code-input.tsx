"use client"

import React, { useState, useRef, useEffect } from 'react'
import { cn } from '@/lib/utils'
import { Shield, Check, AlertCircle, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { SmartButton } from '@/components/ui/smart-button'
import { useDesignTokens } from '@/components/providers/design-tokens-provider'
import { getOptimalTextColor } from '@/lib/contrast-utils'

interface VerificationCodeInputProps {
  value: string
  onChange: (value: string) => void
  onComplete?: (code: string) => void
  length?: number
  className?: string
  disabled?: boolean
  error?: string
  success?: boolean
  autoFocus?: boolean
}

export function VerificationCodeInput({
  value,
  onChange,
  onComplete,
  length = 6,
  className,
  disabled = false,
  error,
  success = false,
  autoFocus = true
}: VerificationCodeInputProps) {
  const [focusedIndex, setFocusedIndex] = useState<number | null>(null)
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])
  const [isComplete, setIsComplete] = useState(false)

  useEffect(() => {
    if (autoFocus && inputRefs.current[0]) {
      inputRefs.current[0]?.focus()
    }
  }, [autoFocus])

  useEffect(() => {
    if (value.length === length) {
      setIsComplete(true)
      onComplete?.(value)
    } else {
      setIsComplete(false)
    }
  }, [value, length, onComplete])

  const handleInputChange = (index: number, inputValue: string) => {
    // 只允许数字
    const numericValue = inputValue.replace(/\D/g, '')
    
    if (numericValue.length > 1) {
      // 如果输入多个字符，取最后一个
      const lastChar = numericValue.slice(-1)
      updateValue(index, lastChar)
    } else {
      updateValue(index, numericValue)
    }
  }

  const updateValue = (index: number, char: string) => {
    const newValue = value.split('')
    newValue[index] = char
    const updatedValue = newValue.join('').slice(0, length)
    onChange(updatedValue)
    
    // 自动跳转到下一个输入框
    if (char && index < length - 1) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      if (!value[index] && index > 0) {
        // 如果当前框为空，跳转到上一个框
        inputRefs.current[index - 1]?.focus()
      } else {
        // 清除当前框的内容
        updateValue(index, '')
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus()
    } else if (e.key === 'ArrowRight' && index < length - 1) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault()
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, length)
    onChange(pastedData)
    
    // 跳转到最后一个有值的输入框或最后一个输入框
    const nextIndex = Math.min(pastedData.length, length - 1)
    inputRefs.current[nextIndex]?.focus()
  }

  const getStatusIcon = () => {
    if (error) {
      return <AlertCircle className="w-5 h-5 text-red-500" />
    }
    if (success || isComplete) {
      return <Check className="w-5 h-5 text-green-500" />
    }
    return <Shield className="w-5 h-5 text-gray-400" />
  }

  return (
    <div className={cn("relative", className)}>
      <div className="flex items-center justify-center space-x-1 mb-4">
        {getStatusIcon()}
        <span className="ml-2 text-sm font-medium text-gray-700">
          验证码
        </span>
      </div>

      <div className="flex justify-center space-x-3">
        {Array.from({ length }, (_, index) => (
          <input
            key={index}
            ref={(el) => (inputRefs.current[index] = el)}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={value[index] || ''}
            onChange={(e) => handleInputChange(index, e.target.value)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            onPaste={handlePaste}
            onFocus={() => setFocusedIndex(index)}
            onBlur={() => setFocusedIndex(null)}
            disabled={disabled}
            className={cn(
              "w-12 h-12 text-center text-lg font-bold",
              "bg-background border border-border",
              "rounded-lg",
              "transition-all duration-300 ease-in-out",
              "focus:outline-none focus:ring-2 focus:ring-primary/50",
              "focus:border-primary focus:bg-accent",
              "disabled:opacity-50 disabled:cursor-not-allowed",
              error && "border-red-300 bg-red-50/20",
              success && "border-green-300 bg-green-50/20",
              focusedIndex === index && "scale-105 shadow-lg"
            )}
          />
        ))}
      </div>

      {/* 错误提示 */}
      {error && (
        <div className="mt-3 flex items-center justify-center space-x-1">
          <AlertCircle className="w-4 h-4 text-red-500" />
          <span className="text-sm text-red-600">{error}</span>
        </div>
      )}

      {/* 成功提示 */}
      {success && !error && (
        <div className="mt-3 flex items-center justify-center space-x-1">
          <Check className="w-4 h-4 text-green-500" />
          <span className="text-sm text-green-600">验证码正确</span>
        </div>
      )}

      {/* 完成提示 */}
      {isComplete && !error && !success && (
        <div className="mt-3 flex items-center justify-center space-x-1">
          <Check className="w-4 h-4 text-blue-500" />
          <span className="text-sm text-blue-600">验证码输入完成</span>
        </div>
      )}
    </div>
  )
}

// 验证码发送按钮组件
interface SendCodeButtonProps {
  onSend: () => void
  disabled?: boolean
  loading?: boolean
  countdown?: number
  className?: string
}

export function SendCodeButton({
  onSend,
  disabled = false,
  loading = false,
  countdown = 0,
  className
}: SendCodeButtonProps) {
  const [timeLeft, setTimeLeft] = useState(countdown)
  
  // 使用统一设计配置
  const { tokens } = useDesignTokens()
  const secondaryColor = tokens?.colors?.secondary?.500 || '#6b7280'
  const sendCodeButtonTextColor = getOptimalTextColor(secondaryColor, 'secondary')

  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [timeLeft])

  const handleClick = () => {
    if (timeLeft === 0 && !loading && !disabled) {
      onSend()
      setTimeLeft(60) // 默认60秒倒计时
    }
  }

  const isDisabled = disabled || loading || timeLeft > 0

  return (
    <SmartButton
      type="button"
      onClick={handleClick}
      disabled={isDisabled}
      variant="outline"
      size="default"
      className={cn("hover:scale-105 disabled:hover:scale-100", className)}
      customBackgroundColor={secondaryColor}
      customTextColor={sendCodeButtonTextColor}
    >
      {loading ? (
        <>
          <RefreshCw className="w-4 h-4 animate-spin" />
          发送中...
        </>
      ) : timeLeft > 0 ? (
        <>
          重新发送
          <span className="font-bold">({timeLeft}s)</span>
        </>
      ) : (
        '发送验证码'
      )}
    </SmartButton>
  )
}
