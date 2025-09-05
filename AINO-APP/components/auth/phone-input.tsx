"use client"

import React, { useState, useRef, useEffect } from 'react'
import { cn } from '@/lib/utils'
import { Phone, Check, AlertCircle } from 'lucide-react'

interface PhoneInputProps {
  value: string
  onChange: (value: string) => void
  onValidate?: (isValid: boolean) => void
  placeholder?: string
  className?: string
  disabled?: boolean
  error?: string
  success?: boolean
}

export function PhoneInput({
  value,
  onChange,
  onValidate,
  placeholder = "请输入手机号",
  className,
  disabled = false,
  error,
  success = false
}: PhoneInputProps) {
  const [isFocused, setIsFocused] = useState(false)
  const [isValid, setIsValid] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  // 手机号验证正则
  const phoneRegex = /^1[3-9]\d{9}$/

  useEffect(() => {
    const valid = phoneRegex.test(value)
    setIsValid(valid)
    onValidate?.(valid)
  }, [value, onValidate])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let inputValue = e.target.value.replace(/\D/g, '') // 只保留数字
    
    // 限制长度为11位
    if (inputValue.length > 11) {
      inputValue = inputValue.slice(0, 11)
    }
    
    onChange(inputValue)
  }

  const formatPhoneNumber = (phone: string) => {
    if (phone.length <= 3) return phone
    if (phone.length <= 7) return `${phone.slice(0, 3)} ${phone.slice(3)}`
    return `${phone.slice(0, 3)} ${phone.slice(3, 7)} ${phone.slice(7)}`
  }

  const getStatusIcon = () => {
    if (error) {
      return <AlertCircle className="w-5 h-5 text-red-500" />
    }
    if (success || (value && isValid)) {
      return <Check className="w-5 h-5 text-green-500" />
    }
    return <Phone className="w-5 h-5 text-gray-400" />
  }

  return (
    <div className={cn("relative", className)}>
      <div
        className={cn(
          "relative flex items-center",
          "bg-background border border-border",
          "rounded-lg",
          "transition-all duration-300 ease-in-out",
          "shadow-sm",
          isFocused && "shadow-md border-primary",
          error && "border-red-300 shadow-red-100",
          success && "border-green-300 shadow-green-100",
          disabled && "opacity-50 cursor-not-allowed"
        )}
      >
        <div className="pl-4 pr-2">
          {getStatusIcon()}
        </div>
        
        <input
          ref={inputRef}
          type="tel"
          value={formatPhoneNumber(value)}
          onChange={handleInputChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={placeholder}
          disabled={disabled}
          maxLength={13} // 包含空格的最大长度
          className={cn(
            "flex-1 py-4 pr-4",
            "bg-transparent",
            "text-foreground placeholder-muted-foreground",
            "text-base font-medium",
            "outline-none",
            "disabled:cursor-not-allowed"
          )}
        />
      </div>

      {/* 错误提示 */}
      {error && (
        <div className="mt-2 flex items-center space-x-1">
          <AlertCircle className="w-4 h-4 text-red-500" />
          <span className="text-sm text-red-600">{error}</span>
        </div>
      )}

      {/* 成功提示 */}
      {success && !error && (
        <div className="mt-2 flex items-center space-x-1">
          <Check className="w-4 h-4 text-green-500" />
          <span className="text-sm text-green-600">手机号格式正确</span>
        </div>
      )}

      {/* 输入提示 */}
      {!error && !success && value && !isValid && (
        <div className="mt-2 text-sm text-gray-500">
          请输入正确的手机号码
        </div>
      )}
    </div>
  )
}

// 国家代码选择器
interface CountryCodeSelectorProps {
  value: string
  onChange: (value: string) => void
  className?: string
}

export function CountryCodeSelector({
  value,
  onChange,
  className
}: CountryCodeSelectorProps) {
  const [isOpen, setIsOpen] = useState(false)
  
  const countries = [
    { code: '+86', name: '中国', flag: '🇨🇳' },
    { code: '+1', name: '美国', flag: '🇺🇸' },
    { code: '+44', name: '英国', flag: '🇬🇧' },
    { code: '+81', name: '日本', flag: '🇯🇵' },
    { code: '+82', name: '韩国', flag: '🇰🇷' },
    { code: '+852', name: '香港', flag: '🇭🇰' },
    { code: '+853', name: '澳门', flag: '🇲🇴' },
    { code: '+886', name: '台湾', flag: '🇹🇼' }
  ]

  const selectedCountry = countries.find(c => c.code === value) || countries[0]

  return (
    <div className={cn("relative", className)}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "flex items-center space-x-2 px-4 py-4",
          "bg-background border border-border",
          "rounded-lg",
          "text-foreground font-medium",
          "transition-all duration-300 ease-in-out",
          "hover:bg-accent",
          "focus:outline-none focus:ring-2 focus:ring-primary/50"
        )}
      >
        <span className="text-lg">{selectedCountry.flag}</span>
        <span>{selectedCountry.code}</span>
        <svg
          className={cn(
            "w-4 h-4 transition-transform duration-200",
            isOpen && "rotate-180"
          )}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 z-50">
          <div className="bg-background border border-border rounded-lg shadow-xl overflow-hidden">
            {countries.map((country) => (
              <button
                key={country.code}
                type="button"
                onClick={() => {
                  onChange(country.code)
                  setIsOpen(false)
                }}
                className={cn(
                  "w-full flex items-center space-x-3 px-4 py-3",
                  "text-left text-foreground font-medium",
                  "transition-colors duration-200",
                  "hover:bg-accent",
                  value === country.code && "bg-primary/10 text-primary"
                )}
              >
                <span className="text-lg">{country.flag}</span>
                <span className="flex-1">{country.name}</span>
                <span className="text-sm text-gray-500">{country.code}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
