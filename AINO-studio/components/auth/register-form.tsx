"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Eye, EyeOff, Mail, Lock, User } from "lucide-react"
import { Glass } from "@/components/glass"
import { useLocale } from "@/hooks/use-locale"

interface RegisterFormProps {
  onRegister?: (data: {
    name: string
    email: string
    password: string
    confirmPassword: string
    agreeToTerms: boolean
  }) => void
  onSwitchToLogin?: () => void
}

export function RegisterForm({ onRegister, onSwitchToLogin }: RegisterFormProps) {
  const { locale } = useLocale()
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    agreeToTerms: false,
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) {
      newErrors.name = locale === "zh" ? "请输入姓名" : "Please enter your name"
    }

    if (!formData.email.trim()) {
      newErrors.email = locale === "zh" ? "请输入邮箱地址" : "Please enter your email address"
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = locale === "zh" ? "请输入有效的邮箱地址" : "Please enter a valid email address"
    }

    if (!formData.password) {
      newErrors.password = locale === "zh" ? "请输入密码" : "Please enter your password"
    } else if (formData.password.length < 6) {
      newErrors.password = locale === "zh" ? "密码至少需要6个字符" : "Password must be at least 6 characters"
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = locale === "zh" ? "两次输入的密码不一致" : "Passwords do not match"
    }

    if (!formData.agreeToTerms) {
      newErrors.agreeToTerms = locale === "zh" ? "请同意服务条款和隐私政策" : "Please agree to the Terms of Service and Privacy Policy"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    setIsLoading(true)
    try {
      await onRegister?.(formData)
    } finally {
      setIsLoading(false)
    }
  }

  const updateFormData = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }))
    }
  }

  return (
    <Glass className="w-full max-w-md mx-auto">
      <Card className="border-0 bg-transparent shadow-none">
        <CardHeader className="text-center pb-6">
          <CardTitle className="text-2xl font-semibold text-gray-900">{locale === "zh" ? "创建账户" : "Create Account"}</CardTitle>
          <CardDescription className="text-gray-600">{locale === "zh" ? "填写信息以创建您的新账户" : "Fill in the information to create your new account"}</CardDescription>
        </CardHeader>

        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-medium text-gray-700">
                {locale === "zh" ? "姓名" : "Name"}
              </Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="name"
                  type="text"
                  placeholder={locale === "zh" ? "请输入您的姓名" : "Enter your name"}
                  value={formData.name}
                  onChange={(e) => updateFormData("name", e.target.value)}
                  className="pl-10 bg-white/70 backdrop-blur border-white/60 focus:border-white/80"
                />
              </div>
              {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                {locale === "zh" ? "邮箱地址" : "Email Address"}
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="email"
                  type="email"
                  placeholder={locale === "zh" ? "请输入邮箱地址" : "Enter your email address"}
                  value={formData.email}
                  onChange={(e) => updateFormData("email", e.target.value)}
                  className="pl-10 bg-white/70 backdrop-blur border-white/60 focus:border-white/80"
                />
              </div>
              {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                {locale === "zh" ? "密码" : "Password"}
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder={locale === "zh" ? "请输入密码（至少6个字符）" : "Enter your password (at least 6 characters)"}
                  value={formData.password}
                  onChange={(e) => updateFormData("password", e.target.value)}
                  className="pl-10 pr-10 bg-white/70 backdrop-blur border-white/60 focus:border-white/80"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.password && <p className="text-sm text-red-500">{errors.password}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700">
                {locale === "zh" ? "确认密码" : "Confirm Password"}
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder={locale === "zh" ? "请再次输入密码" : "Enter your password again"}
                  value={formData.confirmPassword}
                  onChange={(e) => updateFormData("confirmPassword", e.target.value)}
                  className="pl-10 pr-10 bg-white/70 backdrop-blur border-white/60 focus:border-white/80"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.confirmPassword && <p className="text-sm text-red-500">{errors.confirmPassword}</p>}
            </div>

            <div className="flex items-start space-x-2">
              <Checkbox
                id="agreeToTerms"
                checked={formData.agreeToTerms}
                onCheckedChange={(checked) => updateFormData("agreeToTerms", checked)}
                className="mt-1"
              />
              <Label htmlFor="agreeToTerms" className="text-sm text-gray-600 leading-relaxed">
                {locale === "zh" ? "我同意" : "I agree to the"}{" "}
                <a href="#" className="text-blue-600 hover:text-blue-700 hover:underline">
                  {locale === "zh" ? "服务条款" : "Terms of Service"}
                </a>{" "}
                {locale === "zh" ? "和" : "and"}{" "}
                <a href="#" className="text-blue-600 hover:text-blue-700 hover:underline">
                  {locale === "zh" ? "隐私政策" : "Privacy Policy"}
                </a>
              </Label>
            </div>
            {errors.agreeToTerms && <p className="text-sm text-red-500">{errors.agreeToTerms}</p>}
          </CardContent>

          <CardFooter className="flex flex-col space-y-4">
            <Button type="submit" className="w-full bg-gray-900 hover:bg-gray-800 text-white" disabled={isLoading}>
              {isLoading ? (locale === "zh" ? "注册中..." : "Signing up...") : (locale === "zh" ? "创建账户" : "Create Account")}
            </Button>

            <div className="text-center text-sm text-gray-600">
              {locale === "zh" ? "已有账户？" : "Already have an account?"}{" "}
              <button
                type="button"
                onClick={onSwitchToLogin}
                className="text-blue-600 hover:text-blue-700 hover:underline font-medium"
              >
                {locale === "zh" ? "立即登录" : "Sign In Now"}
              </button>
            </div>
          </CardFooter>
        </form>
      </Card>
    </Glass>
  )
}
