"use client"

import { useState } from "react"
import { useRouter, useParams } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { AppHeader } from "@/components/navigation/app-header"
import { DynamicBackground } from "@/components/theme/dynamic-background"
import { AppCard } from "@/components/layout/app-card"
import { PillButton } from "@/components/basic/pill-button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { BottomDrawer } from "@/components/feedback/bottom-drawer"
import { User, Camera, Check, X, ChevronRight, Shield, Smartphone, Mail } from "lucide-react"

export default function EditProfilePage() {
  const router = useRouter()
  const { locale } = useParams()

  const [userProfile, setUserProfile] = useState({
    name: "张小明",
    id: "2024001",
    level: "Lv.5",
    role: "AI学习者",
    avatar: "/generic-user-avatar.png",
    gender: "male",
    phone: "138****8888",
    email: "zhangxiaoming@example.com",
    birthDate: "1995-06-15",
    phoneVerified: true,
    emailVerified: false,
  })

  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false)

  const [showPhoneVerify, setShowPhoneVerify] = useState(false)
  const [showEmailVerify, setShowEmailVerify] = useState(false)
  const [showPhoneChange, setShowPhoneChange] = useState(false)
  const [showEmailChange, setShowEmailChange] = useState(false)
  const [verificationCode, setVerificationCode] = useState("")
  const [newPhone, setNewPhone] = useState("")
  const [newEmail, setNewEmail] = useState("")
  const [countdown, setCountdown] = useState(0)
  const [isVerifying, setIsVerifying] = useState(false)

  const sendVerificationCode = (type: "phone" | "email") => {
    setCountdown(60)
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    console.log(`[v0] 发送${type === "phone" ? "手机" : "邮箱"}验证码`)
  }

  const verifyCode = async (type: "phone" | "email") => {
    if (!verificationCode || verificationCode.length !== 6) {
      alert("请输入6位验证码")
      return
    }

    setIsVerifying(true)

    // 模拟验证过程
    setTimeout(() => {
      if (verificationCode === "123456") {
        if (type === "phone") {
          setUserProfile((prev) => ({ ...prev, phoneVerified: true }))
          setShowPhoneVerify(false)
        } else {
          setUserProfile((prev) => ({ ...prev, emailVerified: true }))
          setShowEmailVerify(false)
        }
        alert("验证成功！")
      } else {
        alert("验证码错误，请重新输入")
      }
      setIsVerifying(false)
      setVerificationCode("")
    }, 1500)
  }

  const changeContact = async (type: "phone" | "email") => {
    if (!verificationCode || verificationCode.length !== 6) {
      alert("请输入6位验证码")
      return
    }

    const newValue = type === "phone" ? newPhone : newEmail
    if (!newValue) {
      alert(`请输入新的${type === "phone" ? "手机号" : "邮箱地址"}`)
      return
    }

    setIsVerifying(true)

    // 模拟更换过程
    setTimeout(() => {
      if (verificationCode === "123456") {
        if (type === "phone") {
          setUserProfile((prev) => ({
            ...prev,
            phone: newValue.replace(/(\d{3})\d{4}(\d{4})/, "$1****$2"),
            phoneVerified: true,
          }))
          setShowPhoneChange(false)
          setNewPhone("")
        } else {
          setUserProfile((prev) => ({
            ...prev,
            email: newValue,
            emailVerified: true,
          }))
          setShowEmailChange(false)
          setNewEmail("")
        }
        alert("更换成功！")
      } else {
        alert("验证码错误，请重新输入")
      }
      setIsVerifying(false)
      setVerificationCode("")
    }, 1500)
  }

  const handlePhoneAction = () => {
    if (userProfile.phoneVerified) {
      setShowPhoneChange(true)
    } else {
      setShowPhoneVerify(true)
    }
  }

  const handleEmailAction = () => {
    if (userProfile.emailVerified) {
      setShowEmailChange(true)
    } else {
      setShowEmailVerify(true)
    }
  }

  const handleAvatarClick = () => {
    setIsUploadingAvatar(true)
    setTimeout(() => {
      const avatars = [
        "/generic-user-avatar.png",
        "/person-avatar-1.png",
        "/person-avatar-2.png",
        "/professor-avatar.png",
      ]
      const currentIndex = avatars.indexOf(userProfile.avatar)
      const nextIndex = (currentIndex + 1) % avatars.length
      setUserProfile((prev) => ({ ...prev, avatar: avatars[nextIndex] }))
      setIsUploadingAvatar(false)
    }, 1000)
  }

  const handleSaveProfile = () => {
    console.log("保存资料:", userProfile)
    router.back()
  }

  return (
    <div className="min-h-screen">
      <DynamicBackground />
      <AppHeader title="编辑资料" showBackButton />

      <div className="px-4 py-6 space-y-4 pt-20 pb-24">
        {/* Avatar Section */}
        <AppCard>
          <div className="p-4">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div
                  className="w-14 h-14 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center cursor-pointer hover:opacity-80 transition-opacity"
                  onClick={handleAvatarClick}
                >
                  {isUploadingAvatar ? (
                    <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : userProfile.avatar ? (
                    <Image
                      src={userProfile.avatar || "/placeholder.svg"}
                      alt="头像"
                      width={56}
                      height={56}
                      className="rounded-full object-cover"
                    />
                  ) : (
                    <User className="w-7 h-7 text-white" />
                  )}
                </div>
                <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-blue-500 rounded-full border-2 border-white flex items-center justify-center cursor-pointer hover:bg-blue-600">
                  <Camera className="w-2.5 h-2.5 text-white" />
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">点击更换头像</p>
                <p className="text-xs text-muted-foreground">建议尺寸 140x140</p>
              </div>
            </div>
          </div>
        </AppCard>

        {/* Basic Information */}
        <AppCard>
          <div className="p-4 space-y-4">
            <h3 className="text-base font-semibold">基本信息</h3>

            <div>
              <label className="text-sm font-medium mb-2 block">姓名</label>
              <Input
                value={userProfile.name}
                onChange={(e) => setUserProfile((prev) => ({ ...prev, name: e.target.value }))}
                placeholder="请输入真实姓名"
                className="rounded-xl"
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">性别</label>
              <Select
                value={userProfile.gender}
                onValueChange={(value) => setUserProfile((prev) => ({ ...prev, gender: value }))}
              >
                <SelectTrigger className="rounded-xl">
                  <SelectValue placeholder="请选择性别" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">男</SelectItem>
                  <SelectItem value="female">女</SelectItem>
                  <SelectItem value="other">其他</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">出生日期</label>
              <Input
                type="date"
                value={userProfile.birthDate}
                onChange={(e) => setUserProfile((prev) => ({ ...prev, birthDate: e.target.value }))}
                className="rounded-xl"
              />
            </div>
          </div>
        </AppCard>

        <AppCard>
          <div className="p-4 space-y-4">
            <h3 className="text-base font-semibold">账号安全</h3>

            {/* Phone Section */}
            <div className="flex items-center justify-between p-3 bg-muted/30 rounded-xl">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                  <Smartphone className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="text-sm font-medium">手机号码</p>
                  <p className="text-xs text-muted-foreground">{userProfile.phone}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {userProfile.phoneVerified && (
                  <div className="flex items-center gap-1 text-green-600">
                    <Shield className="w-3 h-3" />
                    <span className="text-xs">已验证</span>
                  </div>
                )}
                <PillButton size="sm" variant="outline" onClick={handlePhoneAction}>
                  {userProfile.phoneVerified ? "更换" : "验证"}
                </PillButton>
              </div>
            </div>

            {/* Email Section */}
            <div className="flex items-center justify-between p-3 bg-muted/30 rounded-xl">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                  <Mail className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="text-sm font-medium">邮箱地址</p>
                  <p className="text-xs text-muted-foreground">{userProfile.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {userProfile.emailVerified && (
                  <div className="flex items-center gap-1 text-green-600">
                    <Shield className="w-3 h-3" />
                    <span className="text-xs">已验证</span>
                  </div>
                )}
                <PillButton size="sm" variant="outline" onClick={handleEmailAction}>
                  {userProfile.emailVerified ? "更换" : "验证"}
                </PillButton>
              </div>
            </div>
          </div>
        </AppCard>

        <AppCard>
          <Link href={`/${locale}/profile/third-party`}>
            <div className="p-4 flex items-center justify-between hover:bg-muted/30 transition-colors rounded-xl">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                  <Shield className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="text-sm font-medium">第三方账号绑定</p>
                  <p className="text-xs text-muted-foreground">管理社交账号绑定</p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            </div>
          </Link>
        </AppCard>
      </div>

      {/* Fixed Bottom Actions */}
      <div className="fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur-xl border-t p-4">
        <div className="flex gap-3 max-w-md mx-auto">
          <PillButton variant="outline" onClick={() => router.back()} className="flex-1">
            <X className="w-4 h-4 mr-2" />
            取消
          </PillButton>
          <PillButton onClick={handleSaveProfile} className="flex-1">
            <Check className="w-4 h-4 mr-2" />
            保存修改
          </PillButton>
        </div>
      </div>

      <BottomDrawer
        isOpen={showPhoneVerify}
        onClose={() => {
          setShowPhoneVerify(false)
          setVerificationCode("")
          setCountdown(0)
        }}
        title="验证手机号"
      >
        <div className="p-4 space-y-4">
          <div className="text-center">
            <p className="text-sm text-muted-foreground mb-4">验证码将发送至 {userProfile.phone}</p>
          </div>

          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium mb-2 block">验证码</label>
              <div className="flex gap-2">
                <Input
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  placeholder="请输入6位验证码"
                  className="rounded-xl flex-1"
                  maxLength={6}
                />
                <PillButton
                  variant="outline"
                  size="sm"
                  onClick={() => sendVerificationCode("phone")}
                  disabled={countdown > 0}
                  className="whitespace-nowrap"
                >
                  {countdown > 0 ? `${countdown}s` : "发送验证码"}
                </PillButton>
              </div>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <PillButton
              variant="outline"
              onClick={() => {
                setShowPhoneVerify(false)
                setVerificationCode("")
                setCountdown(0)
              }}
              className="flex-1"
            >
              取消
            </PillButton>
            <PillButton
              onClick={() => verifyCode("phone")}
              disabled={isVerifying || verificationCode.length !== 6}
              className="flex-1"
            >
              {isVerifying ? "验证中..." : "确认验证"}
            </PillButton>
          </div>
        </div>
      </BottomDrawer>

      <BottomDrawer
        isOpen={showEmailVerify}
        onClose={() => {
          setShowEmailVerify(false)
          setVerificationCode("")
          setCountdown(0)
        }}
        title="验证邮箱"
      >
        <div className="p-4 space-y-4">
          <div className="text-center">
            <p className="text-sm text-muted-foreground mb-4">验证码将发送至 {userProfile.email}</p>
          </div>

          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium mb-2 block">验证码</label>
              <div className="flex gap-2">
                <Input
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  placeholder="请输入6位验证码"
                  className="rounded-xl flex-1"
                  maxLength={6}
                />
                <PillButton
                  variant="outline"
                  size="sm"
                  onClick={() => sendVerificationCode("email")}
                  disabled={countdown > 0}
                  className="whitespace-nowrap"
                >
                  {countdown > 0 ? `${countdown}s` : "发送验证码"}
                </PillButton>
              </div>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <PillButton
              variant="outline"
              onClick={() => {
                setShowEmailVerify(false)
                setVerificationCode("")
                setCountdown(0)
              }}
              className="flex-1"
            >
              取消
            </PillButton>
            <PillButton
              onClick={() => verifyCode("email")}
              disabled={isVerifying || verificationCode.length !== 6}
              className="flex-1"
            >
              {isVerifying ? "验证中..." : "确认验证"}
            </PillButton>
          </div>
        </div>
      </BottomDrawer>

      <BottomDrawer
        isOpen={showPhoneChange}
        onClose={() => {
          setShowPhoneChange(false)
          setVerificationCode("")
          setNewPhone("")
          setCountdown(0)
        }}
        title="更换手机号"
      >
        <div className="p-4 space-y-4">
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium mb-2 block">新手机号</label>
              <Input
                value={newPhone}
                onChange={(e) => setNewPhone(e.target.value.replace(/\D/g, "").slice(0, 11))}
                placeholder="请输入新的手机号码"
                className="rounded-xl"
                maxLength={11}
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">验证码</label>
              <div className="flex gap-2">
                <Input
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  placeholder="请输入6位验证码"
                  className="rounded-xl flex-1"
                  maxLength={6}
                />
                <PillButton
                  variant="outline"
                  size="sm"
                  onClick={() => sendVerificationCode("phone")}
                  disabled={countdown > 0 || !newPhone || newPhone.length !== 11}
                  className="whitespace-nowrap"
                >
                  {countdown > 0 ? `${countdown}s` : "发送验证码"}
                </PillButton>
              </div>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <PillButton
              variant="outline"
              onClick={() => {
                setShowPhoneChange(false)
                setVerificationCode("")
                setNewPhone("")
                setCountdown(0)
              }}
              className="flex-1"
            >
              取消
            </PillButton>
            <PillButton
              onClick={() => changeContact("phone")}
              disabled={isVerifying || verificationCode.length !== 6 || !newPhone}
              className="flex-1"
            >
              {isVerifying ? "更换中..." : "确认更换"}
            </PillButton>
          </div>
        </div>
      </BottomDrawer>

      <BottomDrawer
        isOpen={showEmailChange}
        onClose={() => {
          setShowEmailChange(false)
          setVerificationCode("")
          setNewEmail("")
          setCountdown(0)
        }}
        title="更换邮箱"
      >
        <div className="p-4 space-y-4">
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium mb-2 block">新邮箱地址</label>
              <Input
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                placeholder="请输入新的邮箱地址"
                className="rounded-xl"
                type="email"
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">验证码</label>
              <div className="flex gap-2">
                <Input
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  placeholder="请输入6位验证码"
                  className="rounded-xl flex-1"
                  maxLength={6}
                />
                <PillButton
                  variant="outline"
                  size="sm"
                  onClick={() => sendVerificationCode("email")}
                  disabled={countdown > 0 || !newEmail || !newEmail.includes("@")}
                  className="whitespace-nowrap"
                >
                  {countdown > 0 ? `${countdown}s` : "发送验证码"}
                </PillButton>
              </div>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <PillButton
              variant="outline"
              onClick={() => {
                setShowEmailChange(false)
                setVerificationCode("")
                setNewEmail("")
                setCountdown(0)
              }}
              className="flex-1"
            >
              取消
            </PillButton>
            <PillButton
              onClick={() => changeContact("email")}
              disabled={isVerifying || verificationCode.length !== 6 || !newEmail}
              className="flex-1"
            >
              {isVerifying ? "更换中..." : "确认更换"}
            </PillButton>
          </div>
        </div>
      </BottomDrawer>
    </div>
  )
}
