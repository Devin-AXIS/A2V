"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Mail, ArrowLeft } from "lucide-react"
import { Glass } from "@/components/glass"
import { useLocale } from "@/hooks/use-locale"

interface ForgotPasswordFormProps {
  onSubmit?: (email: string) => void
  onBackToLogin?: () => void
}

export function ForgotPasswordForm({ onSubmit, onBackToLogin }: ForgotPasswordFormProps) {
  const { locale } = useLocale()
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      await onSubmit?.(email)
      setIsSubmitted(true)
    } finally {
      setIsLoading(false)
    }
  }

  if (isSubmitted) {
    return (
      <Glass className="w-full max-w-md mx-auto">
        <Card className="border-0 bg-transparent shadow-none">
          <CardHeader className="text-center pb-6">
            <CardTitle className="text-2xl font-semibold text-gray-900">{locale === "zh" ? "邮件已发送" : "Email Sent"}</CardTitle>
            <CardDescription className="text-gray-600">
              {locale === "zh" ? "我们已向您的邮箱发送了密码重置链接，请查收邮件并按照说明操作。" : "We have sent a password reset link to your email. Please check your email and follow the instructions."}
            </CardDescription>
          </CardHeader>

          <CardFooter>
            <Button
              onClick={onBackToLogin}
              variant="outline"
              className="w-full bg-white/70 backdrop-blur border-white/60"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              {locale === "zh" ? "返回登录" : "Back to Login"}
            </Button>
          </CardFooter>
        </Card>
      </Glass>
    )
  }

  return (
    <Glass className="w-full max-w-md mx-auto">
      <Card className="border-0 bg-transparent shadow-none">
        <CardHeader className="text-center pb-6">
          <CardTitle className="text-2xl font-semibold text-gray-900">{locale === "zh" ? "重置密码" : "Reset Password"}</CardTitle>
          <CardDescription className="text-gray-600">{locale === "zh" ? "输入您的邮箱地址，我们将发送密码重置链接给您" : "Enter your email address and we will send you a password reset link"}</CardDescription>
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
                  placeholder={locale === "zh" ? "请输入您的邮箱地址" : "Enter your email address"}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 bg-white/70 backdrop-blur border-white/60 focus:border-white/80"
                  required
                />
              </div>
            </div>
          </CardContent>

          <CardFooter className="flex flex-col space-y-4">
            <Button type="submit" className="w-full bg-gray-900 hover:bg-gray-800 text-white" disabled={isLoading}>
              {isLoading ? (locale === "zh" ? "发送中..." : "Sending...") : (locale === "zh" ? "发送重置链接" : "Send Reset Link")}
            </Button>

            <Button type="button" onClick={onBackToLogin} variant="ghost" className="w-full">
              <ArrowLeft className="mr-2 h-4 w-4" />
              {locale === "zh" ? "返回登录" : "Back to Login"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </Glass>
  )
}
