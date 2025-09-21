"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Glass } from "@/components/glass"
import { ArrowLeft, Mail } from "lucide-react"
import { useLocale } from "@/hooks/use-locale"

export default function ForgotPasswordPage() {
  const { locale } = useLocale()
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return

    setIsLoading(true)
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))
      setIsSubmitted(true)
    } catch (error) {
      console.error("Reset password failed:", error)
    } finally {
      setIsLoading(false)
    }
  }

  if (isSubmitted) {
    return (
      <main className="min-h-[100dvh] bg-gradient-to-br from-white via-blue-50 to-green-50 relative flex items-center justify-center p-4">
        <div className="pointer-events-none absolute inset-0 [filter:blur(40px)]" aria-hidden />

        <Glass className="w-full max-w-md">
          <Card className="border-0 bg-transparent shadow-none">
            <CardHeader className="space-y-1 text-center">
              <div className="flex items-center justify-center mb-4">
                <div className="size-12 rounded-xl bg-green-100 flex items-center justify-center">
                  <Mail className="h-6 w-6 text-green-600" />
                </div>
              </div>
              <CardTitle className="text-2xl font-bold">{locale === "zh" ? "邮件已发送" : "Email Sent"}</CardTitle>
              <CardDescription>{locale === "zh" ? `我们已向 ${email} 发送了密码重置链接，请检查您的邮箱。` : `We have sent a password reset link to ${email}. Please check your email.`}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="text-center text-sm text-gray-600">
                  {locale === "zh" ? "没有收到邮件？请检查垃圾邮件文件夹，或" : "Didn't receive the email? Please check your spam folder, or"}{" "}
                  <button
                    onClick={() => setIsSubmitted(false)}
                    className="text-blue-600 hover:text-blue-500 hover:underline"
                  >
                    {locale === "zh" ? "重新发送" : "resend"}
                  </button>
                </div>
                <div className="text-center">
                  <Link
                    href="/login"
                    className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-500"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    {locale === "zh" ? "返回登录" : "Back to Login"}
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        </Glass>
      </main>
    )
  }

  return (
    <main className="min-h-[100dvh] bg-gradient-to-br from-white via-blue-50 to-green-50 relative flex items-center justify-center p-4">
      <div className="pointer-events-none absolute inset-0 [filter:blur(40px)]" aria-hidden />

      <Glass className="w-full max-w-md">
        <Card className="border-0 bg-transparent shadow-none">
          <CardHeader className="space-y-1 text-center">
            <div className="flex items-center justify-center mb-4">
              <div className="size-12 rounded-xl bg-gradient-to-br from-blue-500 to-orange-400 shadow-inner" />
            </div>
            <CardTitle className="text-2xl font-bold">{locale === "zh" ? "忘记密码" : "Forgot Password"}</CardTitle>
            <CardDescription>{locale === "zh" ? "输入您的邮箱地址，我们将发送重置链接给您" : "Enter your email address and we will send you a reset link"}</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">{locale === "zh" ? "邮箱" : "Email"}</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder={locale === "zh" ? "请输入邮箱" : "Enter your email"}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-white/60 backdrop-blur"
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (locale === "zh" ? "发送中..." : "Sending...") : (locale === "zh" ? "发送重置链接" : "Send Reset Link")}
              </Button>
            </form>
            <div className="mt-6 text-center text-sm">
              {locale === "zh" ? "记起密码了？" : "Remembered your password?"}{" "}
              <Link href="/login" className="text-blue-600 hover:text-blue-500 hover:underline">
                {locale === "zh" ? "立即登录" : "Sign In Now"}
              </Link>
            </div>
            <div className="mt-4 text-center">
              <Link href="/" className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-500">
                <ArrowLeft className="h-4 w-4" />
                {locale === "zh" ? "返回首页" : "Back to Home"}
              </Link>
            </div>
          </CardContent>
        </Card>
      </Glass>
    </main>
  )
}
