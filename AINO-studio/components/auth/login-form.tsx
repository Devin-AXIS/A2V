"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Eye, EyeOff, Mail, Lock } from "lucide-react"
import { Glass } from "@/components/glass"
import { useLocale } from "@/hooks/use-locale"

interface LoginFormProps {
  onLogin?: (email: string, password: string) => void
  onSwitchToRegister?: () => void
  onForgotPassword?: () => void
}

export function LoginForm({ onLogin, onSwitchToRegister, onForgotPassword }: LoginFormProps) {
  const { locale } = useLocale()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      await onLogin?.(email, password)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Glass className="w-full max-w-md mx-auto">
      <Card className="border-0 bg-transparent shadow-none">
        <CardHeader className="text-center pb-6">
          <CardTitle className="text-2xl font-semibold text-gray-900">{locale === "zh" ? "欢迎回来" : "Welcome Back"}</CardTitle>
          <CardDescription className="text-gray-600">{locale === "zh" ? "登录您的账户以继续使用" : "Sign in to your account to continue"}</CardDescription>
        </CardHeader>

        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
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
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 bg-white/70 backdrop-blur border-white/60 focus:border-white/80"
                  required
                />
              </div>
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
                  placeholder={locale === "zh" ? "请输入密码" : "Enter your password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 pr-10 bg-white/70 backdrop-blur border-white/60 focus:border-white/80"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-sm">
              <button
                type="button"
                onClick={onForgotPassword}
                className="text-blue-600 hover:text-blue-700 hover:underline"
              >
                {locale === "zh" ? "忘记密码？" : "Forgot Password?"}
              </button>
            </div>
          </CardContent>

          <CardFooter className="flex flex-col space-y-4">
            <Button type="submit" className="w-full bg-gray-900 hover:bg-gray-800 text-white" disabled={isLoading}>
              {isLoading ? (locale === "zh" ? "登录中..." : "Signing in...") : (locale === "zh" ? "登录" : "Sign In")}
            </Button>

            <div className="text-center text-sm text-gray-600">
              {locale === "zh" ? "还没有账户？" : "Don't have an account?"}{" "}
              <button
                type="button"
                onClick={onSwitchToRegister}
                className="text-blue-600 hover:text-blue-700 hover:underline font-medium"
              >
                {locale === "zh" ? "立即注册" : "Sign Up Now"}
              </button>
            </div>
          </CardFooter>
        </form>
      </Card>
    </Glass>
  )
}
