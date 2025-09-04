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
import { Eye, EyeOff, ArrowLeft } from "lucide-react"
import { useLocale } from "@/hooks/use-locale"

export default function RegisterPage() {
  const { locale } = useLocale()
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const { register } = useAuth()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name || !formData.email || !formData.password) return
    if (formData.password !== formData.confirmPassword) {
      alert(locale === "zh" ? "密码确认不匹配" : "Password confirmation does not match")
      return
    }

    setIsLoading(true)
    try {
      await register(formData)
      router.push("/")
    } catch (error) {
      console.error("Registration failed:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [field]: e.target.value }))
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
            <CardTitle className="text-2xl font-bold">{locale === "zh" ? "创建账户" : "Create Account"}</CardTitle>
            <CardDescription>{locale === "zh" ? "注册新账户开始使用" : "Sign up for a new account to get started"}</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">{locale === "zh" ? "姓名" : "Name"}</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder={locale === "zh" ? "请输入姓名" : "Enter your name"}
                  value={formData.name}
                  onChange={handleChange("name")}
                  className="bg-white/60 backdrop-blur"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">{locale === "zh" ? "邮箱" : "Email"}</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder={locale === "zh" ? "请输入邮箱" : "Enter your email"}
                  value={formData.email}
                  onChange={handleChange("email")}
                  className="bg-white/60 backdrop-blur"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">{locale === "zh" ? "密码" : "Password"}</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder={locale === "zh" ? "请输入密码" : "Enter your password"}
                    value={formData.password}
                    onChange={handleChange("password")}
                    className="bg-white/60 backdrop-blur pr-10"
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">{locale === "zh" ? "确认密码" : "Confirm Password"}</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder={locale === "zh" ? "请再次输入密码" : "Enter your password again"}
                    value={formData.confirmPassword}
                    onChange={handleChange("confirmPassword")}
                    className="bg-white/60 backdrop-blur pr-10"
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (locale === "zh" ? "注册中..." : "Signing up...") : (locale === "zh" ? "注册" : "Sign Up")}
              </Button>
            </form>
            <div className="mt-6 text-center text-sm">
              {locale === "zh" ? "已有账户？" : "Already have an account?"}{" "}
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
