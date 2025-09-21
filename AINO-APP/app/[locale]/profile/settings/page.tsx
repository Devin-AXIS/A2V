"use client"

import React from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { ChevronLeft, Shield, User, Lock, Smartphone, CreditCard } from "lucide-react"
import { AppCard } from "@/components/layout/app-card"
import { Badge } from "@/components/basic/badge"
import { AppHeader } from "@/components/navigation/app-header"

export default function SettingsPage() {
  const { locale } = useParams()

  const SettingsItem = ({ 
    icon, 
    title, 
    description, 
    href,
    status 
  }: { 
    icon: React.ReactNode
    title: string
    description: string
    href: string
    status?: string
  }) => (
    <Link
      href={href}
      className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
    >
      <div className="flex items-center space-x-3">
        <div 
          className="w-10 h-10 rounded-full flex items-center justify-center"
          style={{ backgroundColor: "var(--card-background-secondary, #f8fafc)" }}
        >
          {icon}
        </div>
        <div>
          <h3 className="text-sm font-medium" style={{ color: "var(--card-title-color)" }}>
            {title}
          </h3>
          <p className="text-xs mt-1" style={{ color: "var(--card-text-color)" }}>
            {description}
          </p>
        </div>
      </div>
      <div className="flex items-center space-x-2">
        {status && (
          <Badge 
            variant={
              status === '已认证' || status === '已绑定' 
                ? 'success' 
                : status === '未认证' 
                ? 'warning' 
                : 'default'
            }
            size="sm"
          >
            {status}
          </Badge>
        )}
        <ChevronLeft className="w-4 h-4 rotate-180" style={{ color: "var(--card-text-color)" }} />
      </div>
    </Link>
  )

  return (
    <main 
      className="min-h-screen"
      style={{ backgroundColor: "var(--background-secondary, #f8fafc)" }}
    >
      {/* 统一Header组件 */}
      <AppHeader 
        title="设置"
        showBackButton={true}
      />

      <div className="p-4 space-y-4 pt-20">
        {/* 账号安全 */}
        <AppCard>
          <div className="p-4 border-b border-gray-100">
            <h2 className="text-sm font-semibold" style={{ color: "var(--card-title-color)" }}>
              账号安全
            </h2>
          </div>
          
          <SettingsItem
            icon={<Shield className="w-5 h-5" style={{ color: "var(--card-accent-color, #3b82f6)" }} />}
            title="实名认证"
            description="完成实名认证，提升账号安全性"
            href={`/${locale}/profile/settings/identity-verification`}
            status="未认证"
          />
          
          <SettingsItem
            icon={<Lock className="w-5 h-5" style={{ color: "var(--card-text-color)" }} />}
            title="修改密码"
            description="定期修改密码，保护账号安全"
            href={`/${locale}/profile/settings/password`}
          />
          
          <SettingsItem
            icon={<Smartphone className="w-5 h-5" style={{ color: "var(--card-success-color, #22c55e)" }} />}
            title="手机绑定"
            description="绑定手机号码，用于账号找回"
            href={`/${locale}/profile/settings/phone`}
            status="已绑定"
          />
        </AppCard>

        {/* 个人信息 */}
        <AppCard>
          <div className="p-4 border-b border-gray-100">
            <h2 className="text-sm font-semibold" style={{ color: "var(--card-title-color)" }}>
              个人信息
            </h2>
          </div>
          
          <SettingsItem
            icon={<User className="w-5 h-5" style={{ color: "var(--card-accent-color, #8b5cf6)" }} />}
            title="个人资料"
            description="编辑个人基本信息和简介"
            href={`/${locale}/profile/edit`}
          />
          
          <SettingsItem
            icon={<CreditCard className="w-5 h-5" style={{ color: "var(--card-warning-color, #f59e0b)" }} />}
            title="第三方账号"
            description="管理微信、支付宝等第三方账号绑定"
            href={`/${locale}/profile/third-party`}
          />
        </AppCard>
      </div>
    </main>
  )
}
