"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Glass } from "@/components/glass"
import { useAuth } from "@/hooks/use-auth"
import { Eye, EyeOff, ArrowLeft, Mail, Lock, Sparkles } from "lucide-react"
import { useLocale } from "@/hooks/use-locale"

export default function LoginPage() {
  const { locale } = useLocale()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const { login } = useAuth()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !password) return

    setIsLoading(true)
    try {
      await login(email, password)
      router.push("/")
    } catch (error) {
      console.error("Login failed:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <main className="min-h-[100dvh] bg-gradient-to-br from-white via-blue-50 to-green-50 relative flex items-center justify-center p-4">
      <div className="pointer-events-none absolute inset-0 [filter:blur(40px)]" aria-hidden />

      <div className="relative z-10 w-full max-w-md">
        <Glass className="backdrop-blur-2xl bg-white/20 border border-white/30 shadow-2xl shadow-black/10">
          <Card className="border-0 bg-transparent shadow-none">
            <CardHeader className="space-y-6 text-center pb-8">
              <div className="flex items-center justify-center mb-6">
                <div className="relative">
                  <div className="size-16 rounded-2xl bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 shadow-lg shadow-blue-500/25 flex items-center justify-center">
                    <Sparkles className="h-8 w-8 text-white" />
                  </div>
                  <div className="absolute inset-0 size-16 rounded-2xl bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 blur-md opacity-50 animate-pulse" />
                </div>
              </div>
              <div className="space-y-2">
                <CardTitle className="text-3xl font-bold bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 bg-clip-text text-transparent">
                  {locale === "zh" ? "欢迎回来" : "Welcome Back"}
                </CardTitle>
                <CardDescription className="text-gray-600/80 text-base">{locale === "zh" ? "登录您的账户以继续使用" : "Sign in to your account to continue"}</CardDescription>
              </div>
            </CardHeader>

            <CardContent className="space-y-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-3">
                  <Label htmlFor="email" className="text-sm font-semibold text-gray-700">
                    {locale === "zh" ? "邮箱地址" : "Email Address"}
                  </Label>
                  <div className="relative group">
                    <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                    <Input
                      id="email"
                      type="email"
                      placeholder={locale === "zh" ? "请输入邮箱地址" : "Enter your email address"}
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-12 h-12 bg-white/70 backdrop-blur-sm border-white/50 focus:border-blue-400/50 focus:bg-white/80 transition-all duration-200 rounded-xl shadow-sm"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <Label htmlFor="password" className="text-sm font-semibold text-gray-700">
                    {locale === "zh" ? "密码" : "Password"}
                  </Label>
                  <div className="relative group">
                    <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder={locale === "zh" ? "请输入密码" : "Enter your password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-12 pr-12 h-12 bg-white/70 backdrop-blur-sm border-white/50 focus:border-blue-400/50 focus:bg-white/80 transition-all duration-200 rounded-xl shadow-sm"
                      required
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0 hover:bg-white/50 rounded-lg"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>

                <div className="flex items-center justify-end">
                  <Link
                    href="/forgot-password"
                    className="text-sm text-blue-600 hover:text-blue-700 hover:underline font-medium transition-colors"
                  >
                    {locale === "zh" ? "忘记密码？" : "Forgot Password?"}
                  </Link>
                </div>

                <Button
                  type="submit"
                  className="w-full h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-xl shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 transition-all duration-200 transform hover:scale-[1.02]"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      {locale === "zh" ? "登录中..." : "Signing in..."}
                    </div>
                  ) : (
                    locale === "zh" ? "登录" : "Sign In"
                  )}
                </Button>
              </form>

              <div className="space-y-4 pt-4 border-t border-white/20">
                <div className="text-center text-sm text-gray-600">
                  {locale === "zh" ? "还没有账户？" : "Don't have an account?"}{" "}
                  <Link
                    href="/register"
                    className="text-blue-600 hover:text-blue-700 hover:underline font-semibold transition-colors"
                  >
                    {locale === "zh" ? "立即注册" : "Sign Up Now"}
                  </Link>
                </div>

                <div className="text-center">
                  <Link
                    href="/"
                    className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 transition-colors group"
                  >
                    <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
                    {locale === "zh" ? "返回首页" : "Back to Home"}
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        </Glass>
      </div>
    </main>
  )
}
