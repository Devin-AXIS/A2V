"use client"

import type React from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { User, HelpCircle, Headphones, Settings, Gift, PlusCircle, LogIn, UserPlus, Crown, Sparkles } from "lucide-react"
import { AppCard } from "@/components/layout/app-card"
import { AuthAvatar } from "@/components/auth/auth-avatar"
import { useAuth } from "@/hooks/use-auth"
import { Button } from "@/components/ui/button"

interface ProfileClientViewProps {
  dict: {
    name: string
    id: string
    followers: string
    following: string
    posts: string
    myPoints: string
    pointsToday: string
    redeem: string
    getPoints: string
    toolbar: string
    personalProfile: string
    helpCenter: string
    customerService: string
    settings: string
    details: string
  }
}

export function ProfileClientView({ dict }: ProfileClientViewProps) {
  const { locale } = useParams()
  const { user, isAuthenticated, logout } = useAuth()

  const StatItem = ({ value, label }: { value: string; label: string }) => (
    <div className="text-center">
      <p className="text-xl font-bold" style={{ color: "var(--card-title-color)" }}>
        {value}
      </p>
      <p className="text-xs mt-1" style={{ color: "var(--card-text-color)" }}>
        {label}
      </p>
    </div>
  )

  const ToolbarItem = ({ icon, label, href }: { icon: React.ReactNode; label: string; href: string }) => (
    <Link
      href={href}
      className="flex flex-col items-center gap-2 text-center text-xs font-medium hover:text-black transition-colors"
      style={{ color: "var(--card-text-color)" }}
    >
      {icon}
      <span>{label}</span>
    </Link>
  )

  // 未登录状态显示
  if (!isAuthenticated) {
    return (
      <main className="p-4 space-y-6">
        {/* 未登录提示 */}
        <AppCard className="p-6 text-center">
          <div className="flex flex-col items-center space-y-4">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center">
              <User className="w-10 h-10 text-blue-500" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">欢迎使用 AINO</h3>
              <p className="text-sm text-gray-600 mb-4">请登录或注册以享受完整功能</p>
            </div>
            <div className="flex space-x-3">
              <Button 
                onClick={() => window.location.href = '/auth/login'}
                className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
              >
                <LogIn className="w-4 h-4 mr-2" />
                登录
              </Button>
              <Button 
                variant="outline"
                onClick={() => window.location.href = '/auth/register'}
                className="border-blue-500 text-blue-500 hover:bg-blue-50"
              >
                <UserPlus className="w-4 h-4 mr-2" />
                注册
              </Button>
            </div>
          </div>
        </AppCard>

        {/* 功能预览 */}
        <AppCard className="p-5">
          <h4 className="text-sm font-medium mb-4" style={{ color: "var(--card-title-color)" }}>
            功能预览
          </h4>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <Sparkles className="w-6 h-6 text-yellow-500 mx-auto mb-2" />
              <p className="text-xs text-gray-600">积分系统</p>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <Crown className="w-6 h-6 text-orange-500 mx-auto mb-2" />
              <p className="text-xs text-gray-600">VIP特权</p>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <User className="w-6 h-6 text-blue-500 mx-auto mb-2" />
              <p className="text-xs text-gray-600">个人资料</p>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <Settings className="w-6 h-6 text-gray-500 mx-auto mb-2" />
              <p className="text-xs text-gray-600">设置中心</p>
            </div>
          </div>
        </AppCard>
      </main>
    )
  }

  return (
    <main className="p-4 space-y-6">
      {/* Top User Avatar & Info */}
      <div className="flex items-center gap-4 p-2">
        <AuthAvatar size="lg" showDropdown={true} />
        <div className="flex-1">
          <div className="flex items-center space-x-2">
            <h3 className="text-lg font-bold text-gray-900" style={{ color: "var(--card-title-color)" }}>
              {user?.name || dict.name}
            </h3>
            {user?.points && user.points > 1000 && (
              <Crown className="w-5 h-5 text-yellow-500" />
            )}
          </div>
          <p className="text-xs text-gray-500" style={{ color: "var(--card-text-color)" }}>
            {user?.phone || dict.id}
          </p>
          <div className="flex items-center space-x-1 mt-1">
            <Sparkles className="w-3 h-3 text-yellow-500" />
            <span className="text-xs text-gray-600">
              {user?.points} 积分
            </span>
          </div>
        </div>
      </div>

      {/* Abstract Stats */}
      <AppCard>
        <div className="flex justify-around items-center py-4">
          <StatItem value={user?.followers?.toString() || "0"} label={dict.followers} />
          <StatItem value={user?.following?.toString() || "0"} label={dict.following} />
          <StatItem value={user?.posts?.toString() || "0"} label={dict.posts} />
        </div>
      </AppCard>

      {/* My Points Card */}
      <AppCard className="p-5">
        <div className="flex justify-between items-start">
          <div>
            <h4 className="text-sm font-medium" style={{ color: "var(--card-text-color)" }}>
              {dict.myPoints}
            </h4>
            <p className="text-3xl font-bold mt-1" style={{ color: "var(--card-title-color)" }}>
              {user?.points?.toLocaleString() || "0"}
            </p>
          </div>
          <div className="text-right">
            <Link href="#" className="text-xs text-blue-600 hover:underline">
              {dict.details}
            </Link>
            <p className="text-xs mt-4" style={{ color: "var(--card-text-color)" }}>
              {dict.pointsToday}: <span className="font-semibold text-green-500">+{Math.floor(Math.random() * 100)}</span>
            </p>
          </div>
        </div>
        <div className="mt-4 border-t border-gray-200/70 pt-4 flex justify-around">
          <Link
            href="#"
            className="flex items-center gap-2 text-sm font-semibold text-blue-700 transition-colors hover:text-blue-800"
          >
            <Gift className="h-5 w-5" />
            <span>{dict.redeem}</span>
          </Link>
          <div className="w-px bg-gray-200/70" />
          <Link
            href="#"
            className="flex items-center gap-2 text-sm font-semibold text-blue-700 transition-colors hover:text-blue-800"
          >
            <PlusCircle className="h-5 w-5" />
            <span>{dict.getPoints}</span>
          </Link>
        </div>
      </AppCard>

      {/* Toolbar Card */}
      <AppCard className="p-5">
        <h4 className="text-sm font-medium mb-4" style={{ color: "var(--card-title-color)" }}>
          {dict.toolbar}
        </h4>
        <div className="grid grid-cols-4 gap-4">
          <ToolbarItem
            icon={<User className="w-5 h-5" style={{ color: "var(--card-text-color)" }} />}
            label={dict.personalProfile}
            href={`/${locale}/profile/edit`}
          />
          <ToolbarItem
            icon={<HelpCircle className="w-5 h-5" style={{ color: "var(--card-text-color)" }} />}
            label={dict.helpCenter}
            href={`/${locale}/help-center`}
          />
          <ToolbarItem
            icon={<Headphones className="w-5 h-5" style={{ color: "var(--card-text-color)" }} />}
            label={dict.customerService}
            href={`/${locale}/customer-service`}
          />
          <ToolbarItem
            icon={<Settings className="w-5 h-5" style={{ color: "var(--card-text-color)" }} />}
            label={dict.settings}
            href="#"
          />
        </div>
      </AppCard>
    </main>
  )
}
