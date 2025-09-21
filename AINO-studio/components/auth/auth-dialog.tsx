"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { LoginForm } from "./login-form"
import { RegisterForm } from "./register-form"
import { ForgotPasswordForm } from "./forgot-password-form"
import { useAuth } from "@/hooks/use-auth"
import { useToast } from "@/hooks/use-toast"

type AuthMode = "login" | "register" | "forgot-password"

interface AuthDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  defaultMode?: AuthMode
  onAuthSuccess?: (user: any) => void
}

export function AuthDialog({ open, onOpenChange, defaultMode = "login", onAuthSuccess }: AuthDialogProps) {
  const [mode, setMode] = useState<AuthMode>(defaultMode)
  const { login, register } = useAuth()
  const { toast } = useToast()

  const handleLogin = async (email: string, password: string) => {
    try {
      await login(email, password)
      toast({ description: "登录成功" })
      onAuthSuccess?.(null)
      onOpenChange(false)
    } catch (error) {
      console.error('Login failed:', error)
      toast({ 
        description: error instanceof Error ? error.message : "登录失败", 
        variant: "destructive" 
      })
    }
  }

  const handleRegister = async (data: any) => {
    try {
      await register({
        name: data.name,
        email: data.email,
        password: data.password,
      })
      toast({ description: "注册成功" })
      onAuthSuccess?.(null)
      onOpenChange(false)
    } catch (error) {
      console.error('Register failed:', error)
      toast({ 
        description: error instanceof Error ? error.message : "注册失败", 
        variant: "destructive" 
      })
    }
  }

  const handleForgotPassword = async (email: string) => {
    try {
      // TODO: 实现忘记密码功能
      toast({ description: "密码重置邮件已发送" })
      setMode("login")
    } catch (error) {
      console.error('Forgot password failed:', error)
      toast({ 
        description: error instanceof Error ? error.message : "发送失败", 
        variant: "destructive" 
      })
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px] bg-white/75 backdrop-blur-xl border-white/50 p-0">
        <DialogHeader>
          <DialogTitle>
            {mode === "login" && "登录"}
            {mode === "register" && "注册"}
            {mode === "forgot-password" && "忘记密码"}
          </DialogTitle>
        </DialogHeader>
        <div className="p-6">
          {mode === "login" && (
            <LoginForm
              onLogin={handleLogin}
              onSwitchToRegister={() => setMode("register")}
              onForgotPassword={() => setMode("forgot-password")}
            />
          )}

          {mode === "register" && <RegisterForm onRegister={handleRegister} onSwitchToLogin={() => setMode("login")} />}

          {mode === "forgot-password" && (
            <ForgotPasswordForm onSubmit={handleForgotPassword} onBackToLogin={() => setMode("login")} />
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
